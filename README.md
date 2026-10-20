# SPL9 Virtual Patient – Pain Assessment

## Publish in GitHub Pages

Upload the complete folder to your GitHub repository. In **Settings → Pages** choose **Deploy from a branch**, **main**, and **/docs**. The static site is already provided in `docs/` and does not need a GitHub build step.

The precompiled React build is *not* present; this zero-build edition transforms JSX in visitors’ browsers using the Babel Standalone CDN, and retrieves React and icons from esm.sh. Visitors need internet access to these public CDNs. This is suitable for a prototype but production deployment should use a proper local Vite build and vendor dependencies. The source project in `src/` has the Vite scaffold, and `npm install && npm run build` will produce a standard bundled `docs/` folder on a machine with npm internet access.

## Editable Google Sheet

[Simulation content bank](https://docs.google.com/spreadsheets/d/1CbcexTUQLweNGkRUinF1wPGzJFYe2fv6MS2m2woO4oQ/edit)

The live site attempts to read six tabs: `settings`, `tools`, `dialogue`, `actions`, `sbar` and `reflection`. You must publish the workbook to the web (Google Sheets **File → Share → Publish to web**) for browser reading. **Anyone visiting the simulation can inspect all published rows, including answers and the Blackboard code.** Keep no private or student data there. The site falls back to `docs/src/content.js` if the sheet is inaccessible.

To change the patient portrait, enter a direct HTTPS image URL into `patient_portrait_url` in `settings`, or replace `docs/patient.svg`. A photo inserted *inside a Google Sheets cell* will not automatically become a website asset.

## Educational safety

Matching is deterministic, not AI. The site checks short keyword phrases in the conversation and text submissions. It cannot prove that a response is clinically correct, and code 8553 is visible to anyone inspecting the site. It does not submit data to Google Sheets, store student names or provide secure completion evidence. Supervisor/facilitator review is required for clinical competency decisions.
