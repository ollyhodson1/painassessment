export const SHEET_ID = '1CbcexTUQLweNGkRUinF1wPGzJFYe2fv6MS2m2woO4oQ';
export const SHEET_NAMES = ['settings', 'tools', 'dialogue', 'actions', 'sbar', 'reflection', 'scales'];

export function convertContent(tabs) {
  return Object.fromEntries(Object.entries(tabs).map(([name, rows]) => {
    const entries = rows.slice(1).map(row => Object.fromEntries(
      rows[0].map((header, i) => [header, String(row[i] ?? '')])
    ));
    return [name, name === 'settings'
      ? Object.fromEntries(entries.map(row => [row.key, row.value]))
      : entries];
  }));
}

export function parseSheet(text, name, expectedHeaders) {
  // Google wraps its JSON in google.visualization.Query.setResponse(...).
  let response;
  try {
    response = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  } catch {
    throw new Error('Google Sheets did not return readable content. Check public read access.');
  }
  if (response.status === 'error' || !response.table?.cols || !response.table?.rows) {
    throw new Error(`Google Sheets could not read the ${name} tab.`);
  }
  const headers = response.table.cols.map(column => String(column.label ?? '').trim());
  const required = expectedHeaders.filter(header => header !== 'editor_note');
  if (required.some(header => !headers.includes(header))) {
    throw new Error(`The ${name} tab has missing column headings.`);
  }
  const rows = response.table.rows
    .map(row => headers.map((_, i) => String(row.c?.[i]?.f ?? row.c?.[i]?.v ?? '')))
    .filter(row => row.some(value => value.trim()));
  const identity = headers.indexOf(expectedHeaders[0]);
  if (!rows.length || rows.some(row => !row[identity]?.trim())) {
    throw new Error(`The ${name} tab is empty or has rows without an identifier.`);
  }
  return [headers, ...rows];
}

export async function loadContent(initial, {fetchImpl = fetch, timeoutMs = 10000, signal} = {}) {
  const results = await Promise.allSettled(SHEET_NAMES.map(async name => {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, {once: true});
    if (signal?.aborted) controller.abort();
    const timeout = setTimeout(abort, timeoutMs);
    try {
      const url = new URL(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`);
      url.search = new URLSearchParams({tqx: 'out:json', sheet: name, headers: '1', v: String(Date.now())});
      const response = await fetchImpl(url.toString(), {
        cache: 'no-store', credentials: 'omit', signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(response.status === 401 || response.status === 403
          ? 'Google Sheets requires sign-in. Enable public read access to the content bank.'
          : `Google Sheets is unavailable (HTTP ${response.status}).`);
      }
      return parseSheet(await response.text(), name, initial[name][0]);
    } catch (error) {
      if (controller.signal.aborted) throw new Error('Google Sheets request was cancelled or timed out.');
      throw error;
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', abort);
    }
  }));
  const tabs = Object.fromEntries(SHEET_NAMES.map((name, i) => [
    name, results[i].status === 'fulfilled' ? results[i].value : initial[name],
  ]));
  const data = convertContent(tabs);
  // A sheet created before newer settings were added can still use their defaults.
  data.settings = {...convertContent(initial).settings, ...data.settings};
  const liveTabs = SHEET_NAMES.filter((_, i) => results[i].status === 'fulfilled');
  const failures = SHEET_NAMES.filter(name => !liveTabs.includes(name)).map(name => ({
    name, message: results[SHEET_NAMES.indexOf(name)].reason?.message || 'Could not reach Google Sheets.',
  }));
  return {data, liveTabs, failures};
}
