export const SCENARIOS = ['adult', 'cyp'];
export const SCENARIO_TABS = ['dialogue', 'actions', 'sbar', 'reflection', 'scales'];
const scenarioOf = row => String(row.scenario || 'all').trim().toLowerCase();

export function selectScenarioRows(rows, scenario) {
  const selected = new Map();
  for (const group of ['all', scenario]) {
    for (const row of rows.filter(row => scenarioOf(row) === group)) {
      selected.set(row.id || row.section || row.stage, row);
    }
  }
  return [...selected.values()];
}

export function resolveScenario(content) {
  const scenario = String(content.settings.active_scenario || 'cyp').trim().toLowerCase();
  if (!SCENARIOS.includes(scenario)) throw new Error('active_scenario must be adult or cyp.');
  const profile = Object.fromEntries(content.scenario_settings
    .filter(row => scenarioOf(row) === scenario).map(row => [row.key, row.value]));
  return {...content, settings: {...content.settings, ...profile, active_scenario: scenario},
    ...Object.fromEntries(SCENARIO_TABS.map(name => [name, selectScenarioRows(content[name], scenario)]))};
}

// Validate both profiles so a later switch cannot silently load the other age group.
export function validateScenarioTab(name, tab) {
  const [headers, ...values] = tab;
  const rows = values.map(values => Object.fromEntries(headers.map((header, i) => [header, values[i] || ''])));
  if (name === 'settings') {
    const active = rows.find(row => row.key === 'active_scenario');
    if (active && !SCENARIOS.includes(active.value.trim().toLowerCase())) {
      throw new Error('active_scenario must be adult or cyp. Using the saved selection.');
    }
  }
  if (name === 'scenario_settings') {
    for (const scenario of SCENARIOS) {
      const profile = rows.filter(row => scenarioOf(row) === scenario);
      const keys = profile.map(row => row.key);
      if (new Set(keys).size !== keys.length || !['patient_name', 'patient_age', 'patient_location', 'thinglink_embed_url']
        .every(key => keys.includes(key))) throw new Error(`The ${scenario} profile is incomplete or has duplicate keys.`);
      if (!profile.filter(row => ['patient_name', 'patient_age', 'patient_location'].includes(row.key))
        .every(row => row.value.trim())) throw new Error(`The ${scenario} patient profile has blank required values.`);
    }
  }
  if (SCENARIO_TABS.includes(name)) {
    if (rows.some(row => !['all', ...SCENARIOS].includes(scenarioOf(row)))) {
      throw new Error(`The ${name} tab has an unknown scenario. Use adult, cyp or all.`);
    }
    for (const scenario of SCENARIOS) {
      const selected = selectScenarioRows(rows, scenario);
      if (!selected.length || (name === 'sbar' && !['S', 'B', 'A', 'R']
        .every(section => selected.some(row => row.section === section)))) {
        throw new Error(`The ${name} tab is missing ${scenario} content.`);
      }
    }
  }
  return tab;
}

export function thinglinkUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['www.thinglink.com', 'thinglink.com'].includes(url.hostname)
      ? url.href : '';
  } catch { return ''; }
}
