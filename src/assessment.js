const normalise = value => String(value ?? '').toLowerCase().normalize('NFKD')
  .replace(/[^\p{L}\p{N} /-]/gu, ' ').replace(/\s+/g, ' ').trim();

export function countConcepts(text, phrases) {
  const answer = normalise(text);
  return new Set(String(phrases ?? '').split('|').map(normalise)
    .filter(phrase => phrase && answer.includes(phrase))).size;
}

export function assessSbar(rows, answers, minimumLength) {
  return rows.map(row => {
    const hits = countConcepts(answers[row.section], row.key_concepts);
    const hasDetail = String(answers[row.section] ?? '').trim().length >= minimumLength;
    return {...row, hits, hasDetail, valid: hasDetail && hits >= Number(row.minimum_hits)};
  });
}

// Key phrases guide practice; they cannot reliably judge clinical correctness.
// Students still need to complete every section and acknowledge the feedback.
export function sbarCanContinue(feedback, reviewed = false) {
  return Boolean(feedback?.length) && feedback.every(row => row.hasDetail)
    && (feedback.every(row => row.valid) || reviewed);
}
