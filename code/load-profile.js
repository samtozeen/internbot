// InternBot - n8n Code node: "Load Profile"
// Runs inside n8n (uses $input, $json, $getWorkflowStaticData). Source of truth: workflow/InternBot.json

const chatId = $json.chatId;
const p = ($getWorkflowStaticData('global').profiles || {})[chatId];
const text = p
  ? `📄 Your profile\n\n👤 ${p.name || '-'}\n📧 ${p.email || '-'}\n🎓 ${p.degree || '-'}, ${p.college || '-'}\n📈 CGPA: ${p.cgpa ?? '-'}\n🛠 Skills: ${(p.skills || []).join(', ')}\n🎯 Roles: ${(p.preferred_roles || []).join(', ')}\n🕒 Updated: ${p.updatedAt}`
  : 'No profile yet. Send your resume as a PDF to get started 📎';
return [{ json: { chatId, text } }];
