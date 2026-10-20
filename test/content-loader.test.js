import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {convertContent, loadContent, parseSheet, SHEET_NAMES} from '../src/content-loader.js';

const initial = JSON.parse(await readFile(new URL('../public/content.json', import.meta.url), 'utf8'));
const wrapped = rows => `/*O_o*/\ngoogle.visualization.Query.setResponse(${JSON.stringify({
  status: 'ok', table: {
    cols: rows[0].map(label => ({label})),
    rows: rows.slice(1).map(row => ({c: row.map(v => ({v}))})),
  },
})});`;
const response = rows => ({ok: true, text: async () => wrapped(rows)});

test('all public tabs load, and a fresh request picks up a changed setting', async () => {
  let heading = 'Updated heading from the sheet';
  const requests = [];
  const fetchImpl = async (url, options) => {
    const name = new URL(url).searchParams.get('sheet');
    requests.push({url, options});
    return response(name === 'settings'
      ? [['key', 'value'], ['intro_heading', heading], ['patient_portrait_url', '']]
      : initial[name]);
  };
  const first = await loadContent(initial, {fetchImpl});
  assert.equal(first.data.settings.intro_heading, heading);
  assert.equal(first.data.settings.thinglink_embed_url, convertContent(initial).settings.thinglink_embed_url);
  assert.equal(first.data.settings.patient_portrait_url, '');
  assert.deepEqual(first.liveTabs, SHEET_NAMES);
  assert.deepEqual(first.failures, []);
  heading = 'Another edit, without a rebuild';
  const second = await loadContent(initial, {fetchImpl});
  assert.equal(second.data.settings.intro_heading, heading);
  assert.equal(requests.length, 14);
  assert.ok(requests.every(({options, url}) => options.cache === 'no-store'
    && options.credentials === 'omit' && new URL(url).searchParams.has('v')));
});

test('a private sheet keeps the complete bundled simulation and reports every failure', async () => {
  const result = await loadContent(initial, {fetchImpl: async () => ({ok: false, status: 401})});
  assert.deepEqual(result.data, convertContent(initial));
  assert.equal(result.liveTabs.length, 0);
  assert.equal(result.failures.length, 7);
  assert.ok(result.failures.every(failure => /public read access/.test(failure.message)));
});

test('one invalid tab falls back without discarding successful sheet edits', async () => {
  const result = await loadContent(initial, {fetchImpl: async url => {
    const name = new URL(url).searchParams.get('sheet');
    if (name === 'scales') return response([['wrong_heading'], ['invalid']]);
    if (name === 'settings') return response([['key', 'value'], ['intro_heading', 'Live content']]);
    return response(initial[name]);
  }});
  assert.equal(result.data.settings.intro_heading, 'Live content');
  assert.deepEqual(result.data.scales, convertContent(initial).scales);
  assert.deepEqual(result.failures.map(failure => failure.name), ['scales']);
});

test('empty tabs, Google errors and sign-in HTML cannot replace the fallback', () => {
  assert.throws(() => parseSheet(wrapped([initial.tools[0]]), 'tools', initial.tools[0]), /empty/);
  assert.throws(() => parseSheet('<html>Sign in</html>', 'settings', initial.settings[0]), /public read access/);
  assert.throws(() => parseSheet('{"status":"error"}', 'tools', initial.tools[0]), /could not read/);
});

test('blank sheet rows are ignored and formatted values are preserved', () => {
  const text = JSON.stringify({table: {
    cols: [{label: 'key'}, {label: 'value'}],
    rows: [{c: [{v: 'code'}, {v: 123, f: '0123'}]}, {c: [null, null]}],
  }});
  assert.deepEqual(parseSheet(text, 'settings', initial.settings[0]), [
    ['key', 'value'], ['code', '0123'],
  ]);
});

test('a stalled Google request times out and leaves the simulation usable', async () => {
  const fetchImpl = (_, {signal}) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('Aborted')), {once: true});
  });
  const result = await loadContent(initial, {fetchImpl, timeoutMs: 10});
  assert.deepEqual(result.data, convertContent(initial));
  assert.ok(result.failures.every(failure => /timed out/.test(failure.message)));
});
