// InternBot - n8n Code node: "Parse Button"
// Runs inside n8n (uses $input, $json, $getWorkflowStaticData). Source of truth: workflow/InternBot.json

const r = $('Route').first().json;
const [action, key] = (r.callback_query.data || '').split(':');
const store = $getWorkflowStaticData('global');
const job = (store.jobIndex?.[r.chatId] || {})[key] || null;
const profile = (store.profiles || {})[r.chatId] || null;
return [{ json: { chatId: r.chatId, action: job ? action : 'missing', key, job, profile } }];
