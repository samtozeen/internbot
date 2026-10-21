// InternBot - n8n Code node: "Build Query"
// Runs inside n8n (uses $input, $json, $getWorkflowStaticData). Source of truth: workflow/InternBot.json

const r = $('Route').first().json;
const store = $getWorkflowStaticData('global');
const profile = (store.profiles || {})[r.chatId] || null;
if (r.route === 'more') {
  const ls = (store.lastSearch || {})[r.chatId];
  return [{ json: { chatId: r.chatId, userQuery: ls.userQuery, q: ls.q, cursor: ls.cursor || '', isMore: true, profile } }];
}
const w = $('Search Wizard').first().json;
return [{ json: { chatId: r.chatId, userQuery: w.label, q: w.query, cursor: '', isMore: false, profile } }];

