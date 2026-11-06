# SPL9 Virtual Patient – Pain Assessment

## Publish in GitHub Pages

In **Settings → Pages**, keep **Deploy from a branch**, **main**, and **/docs**. The existing `build-website.yml` workflow installs dependencies with Node 22, builds the Vite application into `docs/`, and commits the generated site to `main`. It also supports **Run workflow** for a manual build.

For local development, run `npm install` and `npm run dev`. Run `npm test` for the content-loader checks and `npm run build` to verify the production bundle. Edit source files in `src/` and the fallback in `public/content.json`; let the workflow publish generated files in `docs/`.

## Editable Google Sheet

[Simulation content bank](https://docs.google.com/spreadsheets/d/1CbcexTUQLweNGkRUinF1wPGzJFYe2fv6MS2m2woO4oQ/edit)

The live site reads eight sources: `settings`, `tools`, `scenario_dialogue`, `scenario_actions`, `scenario_sbar`, `scenario_reflection`, `scenario_scales` and `scenario_settings`. Keep their column headings and row identifiers intact. The site's public `/gviz/tq` requests must be able to read the workbook without a Google sign-in. For this integration, set **Share → General access → Anyone with the link → Viewer**. Sharing remains read-only for visitors; only your authorised editors can change content. Test from a signed-out browser, since your own Google login can hide an access problem.

**Anyone visiting the simulation can inspect the readable rows, including answers and the Blackboard code.** Keep no private or student data in the content bank. Changes are fetched when the site opens or when **Refresh content** in the footer is pressed; no GitHub rebuild is needed for sheet edits. Google may take a short time to serve an edit. An attempt already open does not automatically reload content in the middle of a student's work.

The footer distinguishes **Google Sheets**, **Google Sheets + saved content**, and **Saved content (Google Sheets unavailable)**. Expand **Content details** for affected tabs, errors and the last check time. Unavailable, empty or malformed tabs use the bundled `public/content.json` copy, independently of successfully loaded tabs. Missing settings keep bundled defaults. Requests bypass the browser cache and time out after 10 seconds.

The `dialogue` tab is retained for compatibility with the older scripted patient. It does **not** change Alex's ThingLink AI conversation. Edit the patient conversation in ThingLink; its iframe URL is controlled by the `thinglink_embed_url` setting. The sheet also does not control interface text that is written directly in `src/main.jsx`.

To change the patient portrait, enter a direct HTTPS image URL into `patient_portrait_url` in `settings`, or replace `public/patient.svg` and let the workflow rebuild. A photo inserted *inside a Google Sheets cell* will not automatically become a website asset.

## Assessment documentation

The documentation page title, sidebar label, form fields and completion check follow the selected history framework. In the `tools` tab, `description` supplies comma-separated field headings and `prompts` supplies matching questions separated by `|`, in the same order. This supports PQRST, SOCRATES, OPQRST and OLD CARTS, as well as additional configured frameworks. Answers are kept separately for each tool during the current attempt, so changing frameworks never relabels an existing answer. Switching back restores that framework’s draft. Every visible field must contain at least 4 characters after trimming before continuing, so concise findings such as `8/10` are accepted. The matching question stays visible above the answer, and students can record a finding as not established rather than inventing it.

## Student support

The selection page offers PQRST and the Numerical Rating Scale as an optional starting point when both are available in the Sheet. The consultation page displays the selected framework's live question prompts. Clinical planning and SBAR show guidance from the Sheet's criteria and feedback; answer-length indicators show what is needed before review. Existing Sheet settings still control the clinical, SBAR and reflection minimum lengths.

SBAR key-concept checks provide feedback. If every section meets the configured minimum length but some key phrases are missing, students can revise and review again or explicitly confirm they have considered the feedback before continuing. Blank or short sections cannot use this route. This supports equivalent wording without claiming that the checker validates clinical safety. The Google Sheets connection status is also visible on the briefing page.

## Consultation notes

The same editable notes panel appears on the ThingLink consultation and selected-framework documentation pages. On wide screens it sits beside the assessment form; on smaller screens it appears above the fields. Edits are shared when moving backwards and forwards. Notes and answers are held in memory for the current attempt and are cleared by a page reload; they are not sent to Google Sheets or ThingLink.

## Educational safety

The patient conversation runs in ThingLink AI. The site's clinical-decision, SBAR and reflection feedback uses deterministic keyword and length checks. These cannot prove that a response is clinically correct. The completion code is visible in the client-side content, and is not secure completion evidence. Supervisor/facilitator review is required for clinical competency decisions.


## Adult / CYP switch

The live switch is `settings!B2` (`active_scenario`): choose `cyp` or `adult`. The saved default is CYP (Alex, 17, CAMHS); the adult profile is Alex, 46. There is no automatic date reset. `scenario_settings` stores separate key/value settings for each profile. The selected profile overrides unprefixed legacy profile rows in settings, including intentionally blank image and ThingLink URLs. `tools` stays shared. The five scenario_ content-bank tabs have a final `scenario` column: adult, cyp, or all. Scenario-specific rows override shared rows with the same identity.

Both profiles are validated before live tab data is accepted. Partial failures retain saved content for the selected scenario, rather than mixing adult and CYP rows. The briefing and header identify the scenario. Attempts retain their loaded version; refreshing after starting requires a reset, including after going back to the briefing. The start button waits for the initial content check.

Each profile needs its own published ThingLink link. The existing link is assigned to CYP for today and needs the supplied CYP AI prompt to be published in ThingLink. The adult link starts blank; missing or invalid links block the consultation rather than silently reusing the other profile. See `facilitator/Adult-CYP-switching-guide.md` and the two AI setup files. The CYP case is specifically age 17; changing only the age does not make an under-16 version clinically appropriate.
