# InternBot - code

Readable copies of the JavaScript inside the n8n workflow (`workflow/InternBot.json`).
Each file = one n8n **Code** node. They run inside n8n, not standalone.

| File | What it does |
|---|---|
| `router.js` | Routes every Telegram update (PDF, role, button, command, question) + daily limits |
| `search-wizard.js` | Parses role/city/type/work-mode, asks for what's missing |
| `build-query.js` | Builds the JSearch query (new search or "more") |
| `prepare-jobs.js` | Normalises API results, stores jobs by key |
| `build-job-cards.js` | Merges Gemini match scores, builds Telegram cards, queues "more" |
| `more-results.js` | Next page of results / fetch more |
| `ai-intent-decision.js` | Turns Gemini's intent JSON into a reply or a search |
| `parse-button.js` | Handles Apply / Mark-as-applied buttons |
| `tailored-resume-pdf-and-apply-kit.js` | Builds the tailored resume **PDF in pure JS** + apply-kit message |
| `save-profile.js` / `load-profile.js` | Resume profile storage |
| `log-application.js` / `status-tracker.js` | Application tracker (`/status`) |
| `delete-data.js` | `/delete` privacy flow |
| `friendly-reply.js` | Small-talk replies |
