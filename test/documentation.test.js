import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {getDocumentationFields, documentationComplete} from '../src/documentation.js';
import {convertContent} from '../src/content-loader.js';

const initial = JSON.parse(await readFile(new URL('../public/content.json', import.meta.url), 'utf8'));
const tools = convertContent(initial).tools;
const expected = {
  pqrst: ['Provocation / Palliation', 'Quality', 'Region / Radiation', 'Severity', 'Timing'],
  socrates: ['Site', 'Onset', 'Character', 'Radiation', 'Associations', 'Time course', 'Exacerbating / relieving factors', 'Severity'],
  opqrst: ['Onset', 'Provocation / Palliation', 'Quality', 'Region / Radiation', 'Severity', 'Time'],
  oldcarts: ['Onset', 'Location', 'Duration', 'Character', 'Aggravating factors', 'Relieving factors', 'Timing', 'Severity'],
};

for (const tool of tools) {
  test(`${tool.name} documents its own headings, in order, with matching sheet prompts`, () => {
    const fields = getDocumentationFields(tool);
    assert.deepEqual(fields.map(field => field.label), expected[tool.id]);
    assert.deepEqual(fields.map(field => field.prompt), tool.prompts.split('|'));
    assert.equal(new Set(fields.map(field => field.id)).size, fields.length);
  });
}

test('SOCRATES site and severity are separate answers despite sharing an initial', () => {
  const fields = getDocumentationFields(tools.find(tool => tool.id === 'socrates'));
  const site = fields.find(field => field.label === 'Site');
  const severity = fields.find(field => field.label === 'Severity');
  assert.equal(site.letter, severity.letter);
  assert.notEqual(site.id, severity.id);
  const answers = Object.fromEntries(fields.map(field => [field.id, 'Established findings from the consultation']));
  delete answers[severity.id];
  assert.equal(documentationComplete(fields, answers), false);
  answers[severity.id] = 'Pain rated eight out of ten';
  assert.equal(documentationComplete(fields, answers), true);
});

test('only the active framework fields count towards completion', () => {
  const pqrst = getDocumentationFields(tools.find(tool => tool.id === 'pqrst'));
  const socrates = getDocumentationFields(tools.find(tool => tool.id === 'socrates'));
  const answers = Object.fromEntries(pqrst.map(field => [field.id, 'Detailed documented assessment finding']));
  assert.equal(documentationComplete(pqrst, answers), true);
  assert.equal(documentationComplete(socrates, answers), false);
  assert.equal(documentationComplete([], answers), false);
  answers[pqrst[0].id] = '            ';
  assert.equal(documentationComplete(pqrst, answers), false);
});

test('edited sheet headings and prompts update the form, including unfamiliar frameworks', () => {
  const fields = getDocumentationFields({description: 'Onset, Impact, Impact', prompts: 'When did it begin?|How does it affect activities?|What else has changed?'});
  assert.deepEqual(fields.map(field => field.label), ['Onset', 'Impact', 'Impact']);
  assert.equal(fields[1].prompt, 'How does it affect activities?');
  assert.notEqual(fields[1].id, fields[2].id);
});

test('missing prompts have usable defaults and no selection has no form', () => {
  assert.deepEqual(getDocumentationFields(undefined), []);
  assert.match(getDocumentationFields({description: 'Onset', prompts: ''})[0].prompt, /onset/);
  const fields = getDocumentationFields({description: 'Onset, Character, Severity', prompts: 'When did it begin?||How severe is it?'});
  assert.match(fields[1].prompt, /character/);
  assert.equal(fields[2].prompt, 'How severe is it?');
});
