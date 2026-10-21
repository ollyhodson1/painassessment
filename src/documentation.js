const split = (value, separator) => {
  const items = String(value ?? '').split(separator).map(item => item.trim());
  while (items.length && !items.at(-1)) items.pop();
  return items;
};

// The tools tab supplies the ordered headings and their matching prompts.
export function getDocumentationFields(tool) {
  if (!tool) return [];
  const headings = split(tool.description, ',');
  const prompts = split(tool.prompts, '|');
  const used = new Map();
  return Array.from({length: Math.max(headings.length, prompts.length, 1)}, (_, index) => {
    const label = headings[index] || `Finding ${index + 1}`;
    const slug = label.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
    const occurrence = (used.get(slug) || 0) + 1;
    used.set(slug, occurrence);
    return {
      id: `${slug || 'finding'}-${occurrence}`,
      letter: label[0].toUpperCase(),
      label,
      prompt: prompts[index] || `Record your findings about ${label.toLowerCase()}.`,
    };
  });
}

export function documentationComplete(fields, answers, minimumLength = 12) {
  return fields.length > 0 && fields.every(field => String(answers[field.id] ?? '').trim().length >= minimumLength);
}
