// InternBot - n8n Code node: "Delete Data"
// Runs inside n8n (uses $input, $json, $getWorkflowStaticData). Source of truth: workflow/InternBot.json

const r = $('Route').first().json;
const id = r.chatId;
const data = r.callback_query?.data || '';
if (data === 'del:yes') {
  const st = $getWorkflowStaticData('global');
  for (const k of ['profiles', 'applications', 'jobIndex', 'lastSearch', 'pending']) if (st[k]) delete st[k][id];
  return [{ json: { kind: 'msg', chatId: id, text: '🗑️ Done! Your resume, profile, searches and application history are deleted. Send a new resume anytime to start again.' } }];
}
if (data === 'del:no') return [{ json: { kind: 'msg', chatId: id, text: "👍 No problem, I've kept everything." } }];
return [{ json: { kind: 'confirm', chatId: id } }];

