// InternBot - n8n Code node: "Load Applications"
// Runs inside n8n (uses $input, $json, $getWorkflowStaticData). Source of truth: workflow/InternBot.json

const chatId = $json.chatId;
const apps = ($getWorkflowStaticData('global').applications || {})[chatId] || [];
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const text = apps.length
  ? `📋 <b>Your applications (${apps.length})</b>\n\n` + apps.slice(-15).reverse().map((a, n) => `${n + 1}. <b>${esc(a.title)}</b>\n    ${esc(a.company)} · ${a.date} · ${a.status}`).join('\n')
  : "You haven't marked any applications yet. Search a role, tap ✅ Apply, then Mark as applied.";
return [{ json: { chatId, text } }];
