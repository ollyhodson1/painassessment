# Adult and CYP pain assessment

The active preset for today is **CYP: Alex Morgan, 17, CAMHS inpatient**. The retained adult preset is **Alex Morgan, 46, adult mental health inpatient**.

## Today’s ThingLink step

Open the existing ThingLink scenario, replace the adult character instructions with the supplied **ThingLink-CYP-AI-setup.txt**, remove any conflicting adult scene text/knowledge/voice introduction, and publish. Its URL is already assigned to the CYP profile in the workbook.

The website and Google Sheet cannot rewrite an external ThingLink AI character. Test the published character by asking its age and requesting observations before students start.

## Switch the website

1. Open the content-bank Google Sheet.
2. In **settings**, change **B2 — active_scenario** using the **cyp / adult** dropdown.
3. Reopen the website, or use **Refresh content**. Refreshing an attempt already started asks to clear its answers and begin again.

There is no automatic date-based reset: CYP stays active until you change the dropdown. Students cannot switch scenarios themselves. Already open attempts keep the version they started.

## Keep two AI patients for easy future switching

Create or duplicate a separate adult ThingLink scenario and use **ThingLink-Adult-AI-setup.txt** there. Publish it and paste its URL into **scenario_settings**, the row with **scenario = adult**, **key = thinglink_embed_url**, in **column C**. The current CYP link remains in the corresponding **cyp** row.

The adult link starts blank so changing the switch cannot accidentally open the CYP AI patient. Until you add the adult link, the adult profile and guidance are available, but its AI consultation is blocked with a facilitator message. Once both published links are configured, the single dropdown switches the whole website, including the matching AI patient.

## Edit the content

- **settings:** the live switch and shared settings, including answer lengths and the completion code.
- **scenario_settings:** separate profile text, age, location, communication guidance, image URL and ThingLink URL for each scenario. Edit the **value** in column C for the relevant scenario/key. Empty image URLs use the bundled illustration. Empty ThingLink URLs do not borrow the other patient’s activity.
- **tools:** shared pain-history frameworks and questions.
- **scenario_dialogue, scenario_actions, scenario_sbar, scenario_reflection, scenario_scales:** rows tagged **adult** or **cyp** in the final **scenario** column. The website selects the active set. A tag of **all** can provide shared content; a scenario-specific row with the same identifier overrides it.

The original dialogue/actions/sbar/reflection/scales tabs contain a CYP-only compatibility copy for the older published app. The updated app reads the scenario_ content-bank tabs instead. The older unprefixed profile rows in settings are retained for compatibility; the selected rows in scenario_settings control the updated site. Changing the Sheet does not require a GitHub rebuild. Missing or malformed tabs use saved content for the selected scenario and are reported under Content details.

## Clinical scope of these presets

The CYP preset is specifically a **17-year-old**, not a universal case for all children’s ages. Both supplied cases share the same fixed abdominal-pain findings and observations; the CYP version adds developmentally appropriate communication and support preferences. If you change the age, review the entire clinical scenario, pain-tool guidance, observation chart, scoring and ThingLink character together.

The supplied NEWS2 teaching total is 7 using scale 1. NICE’s sepsis risk guidance for people aged 16 or over includes acute mental health settings; use the service’s approved pathway and clinical judgement. Do not apply this adult NEWS2 teaching case unchanged to an under-16 child. The simulation does not establish a diagnosis, prescribe doses or certify clinical competence.

References checked for this update:

- [NICE NG253 — evaluating risk in people aged 16 or over](https://www.nice.org.uk/guidance/ng253/chapter/Evaluating-risk)
- [NICE NG204 — communication, consent, privacy and confidentiality](https://www.nice.org.uk/guidance/ng204/chapter/Recommendations)

All patient identities, symptoms and observations in these files are fictional.
