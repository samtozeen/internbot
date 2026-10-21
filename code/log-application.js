// InternBot - n8n Code node: "Log Application"
// Runs inside n8n (uses $input, $json, $getWorkflowStaticData). Source of truth: workflow/InternBot.json

const ctx = $json;
const store = $getWorkflowStaticData('global');
store.applications = store.applications || {};
const apps = store.applications[ctx.chatId] = store.applications[ctx.chatId] || [];
if (!apps.find(a => a.key === ctx.key)) apps.push({ key: ctx.key, title: ctx.job.title, company: ctx.job.company, link: ctx.job.link, date: new Date().toISOString().slice(0, 10), status: 'Applied' });
return [{ json: { chatId: ctx.chatId, text: `📌 Logged: ${ctx.job.title} at ${ctx.job.company}\nYou've applied to ${apps.length} internship${apps.length === 1 ? '' : 's'} so far. Send /status to see them.` } }];
