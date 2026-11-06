import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {convertContent, loadContent, SHEET_NAMES, SHEET_TABS} from '../src/content-loader.js';
import {resolveScenario, validateScenarioTab, thinglinkUrl} from '../src/scenario.js';

const sheetNameFromUrl = url => Object.keys(SHEET_TABS).find(name => SHEET_TABS[name] === new URL(url).searchParams.get('sheet'));
const initial = JSON.parse(await readFile(new URL('../public/content.json', import.meta.url), 'utf8'));
const response = rows => ({ok:true, text:async()=>JSON.stringify({table:{
  cols:rows[0].map(label=>({label})), rows:rows.slice(1).map(row=>({c:row.map(v=>({v}))})),
}})});
const withScenario = scenario => {
  const tabs = structuredClone(initial);
  tabs.settings.find(row=>row[0]==='active_scenario')[1]=scenario;
  return tabs;
};

test('CYP is the saved default and every selected content row belongs to that profile', () => {
  const data = resolveScenario(convertContent(initial));
  assert.equal(data.settings.active_scenario, 'cyp');
  assert.equal(data.settings.patient_age, '17');
  assert.match(data.settings.patient_location, /CAMHS/);
  for(const name of ['dialogue','actions','sbar','reflection','scales']) {
    assert.ok(data[name].every(row=>row.scenario==='cyp'));
  }
  assert.ok(data.scales.every(row=>!row.student_guidance.includes('46-year-old')));
});

test('one live selector changes age, setting, guidance, feedback and AI URL together', async () => {
  const tabs=withScenario('adult');
  const result=await loadContent(initial,{fetchImpl:async url=>response(tabs[sheetNameFromUrl(url)])});
  assert.equal(result.data.settings.patient_age,'46');
  assert.match(result.data.settings.patient_location,/Adult/);
  assert.equal(result.data.settings.thinglink_embed_url,'');
  assert.ok(result.data.actions.every(row=>row.scenario==='adult'));
  assert.ok(!result.data.actions.some(row=>row.criterion.includes('young person')));
  assert.deepEqual(result.liveTabs,SHEET_NAMES);
});

test('partial outage uses fallback content for the selected adult profile, never CYP rows', async () => {
  const tabs=withScenario('adult');
  const result=await loadContent(initial,{fetchImpl:async url=>{
    const name=sheetNameFromUrl(url);
    return ['scenario_settings','scales'].includes(name)?{ok:false,status:503}:response(tabs[name]);
  }});
  assert.equal(result.data.settings.patient_age,'46');
  assert.ok(result.data.scales.every(row=>row.scenario==='adult'));
  assert.deepEqual(result.failures.map(row=>row.name),['scales','scenario_settings']);
});

test('invalid selector falls back visibly and missing profile content cannot erase a scenario', async () => {
  const tabs=withScenario('unknown');
  tabs.actions=tabs.actions.filter((row,i)=>i===0||row.at(-1)==='adult');
  const result=await loadContent(initial,{fetchImpl:async url=>response(tabs[sheetNameFromUrl(url)])});
  assert.equal(result.data.settings.active_scenario,'cyp');
  assert.equal(result.data.settings.patient_age,'17');
  assert.ok(result.failures.some(row=>row.name==='settings'));
  assert.ok(result.failures.some(row=>row.name==='actions'));
});

test('profile-specific edits survive selection, including an intentionally empty image URL', async () => {
  const tabs=structuredClone(initial);
  tabs.scenario_settings.find(row=>row[0]==='cyp'&&row[1]==='patient_name')[2]='Jamie Taylor';
  tabs.scenario_settings.find(row=>row[0]==='cyp'&&row[1]==='patient_portrait_url')[2]='';
  const result=await loadContent(initial,{fetchImpl:async url=>response(tabs[sheetNameFromUrl(url)])});
  assert.equal(result.data.settings.patient_name,'Jamie Taylor');
  assert.equal(result.data.settings.patient_portrait_url,'');
});

test('scenario profiles must retain their own identity and blank links are intentional', () => {
  const broken=initial.scenario_settings.filter(row=>!(row[0]==='adult'&&row[1]==='patient_age'));
  assert.throws(()=>validateScenarioTab('scenario_settings',broken),/incomplete/);
  assert.equal(thinglinkUrl(''),'');
  assert.equal(thinglinkUrl('https://example.com/other-patient'),'');
  assert.equal(thinglinkUrl('javascript:alert(1)'),'');
  assert.equal(thinglinkUrl('https://www.thinglink.com/view/scenario/123'),'https://www.thinglink.com/view/scenario/123');
});
