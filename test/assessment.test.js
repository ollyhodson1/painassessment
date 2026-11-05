import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {convertContent} from '../src/content-loader.js';
import {assessSbar, sbarCanContinue} from '../src/assessment.js';

const initial = JSON.parse(await readFile(new URL('../public/content.json', import.meta.url), 'utf8'));
const rows = convertContent(initial).sbar;

test('completed handover with equivalent language can continue after feedback review', () => {
  const answers = {
    S: 'I am calling about a person on the ward who needs your attention.',
    B: 'They have been staying on our ward for six days and now feel unwell.',
    A: 'They describe significant discomfort and appear increasingly distressed.',
    R: 'Please attend to examine them straight away; I will remain with them.',
  };
  const feedback = assessSbar(rows, answers, 40);
  assert.equal(feedback.every(row => row.hasDetail), true);
  assert.equal(sbarCanContinue(feedback), false);
  assert.equal(sbarCanContinue(feedback, true), true);
});

test('review cannot bypass empty, whitespace-only or short sections', () => {
  for (const incomplete of ['', ' '.repeat(50), 'Please help']) {
    const answers = Object.fromEntries(rows.map(row => [row.section, 'Detailed handover information from my patient assessment.']));
    answers.R = incomplete;
    assert.equal(sbarCanContinue(assessSbar(rows, answers, 40), true), false);
  }
  assert.equal(sbarCanContinue([], true), false);
  assert.equal(sbarCanContinue(null, true), false);
});

test('sheet key concepts, minimum hits and section lengths remain in use', () => {
  const answers = {
    S: 'Alex has severe abdominal pain and needs assessment now.',
    B: 'Mental health inpatient with sudden onset symptoms today.',
    A: 'Sharp lower right discomfort, nausea and fever on assessment.',
    R: 'Please arrange an urgent medical review and repeat obs.',
  };
  assert.equal(sbarCanContinue(assessSbar(rows, answers, 40)), true);
  const editedRows = rows.map(row => ({...row, key_concepts: 'new phrase from sheet', minimum_hits: '1'}));
  assert.equal(sbarCanContinue(assessSbar(editedRows, answers, 40)), false);
  assert.equal(sbarCanContinue(assessSbar(rows, answers, 100), true), false);
});
