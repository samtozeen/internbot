// InternBot - n8n Code node: "Decide"
// Runs inside n8n (uses $input, $json, $getWorkflowStaticData). Source of truth: workflow/InternBot.json

const r = $('Route').first().json;
// AI_BUSY
if ($input.first().json.error) return [{ json: { kind: 'reply', chatId: r.chatId, text: "⏳ I'm a bit busy right now (my AI helper hit its limit). Please try again in a minute 🙏 You can still type a role like \"frontend developer\" to search." } }];
let out = {};
try {
  const parts = $input.first().json.candidates?.[0]?.content?.parts || [];
  out = JSON.parse(parts.filter(p => !p.thought).map(p => p.text || '').join('').replace(/```json|```/g, '').trim());
} catch (e) {}
if (out.intent === 'search' && out.query) return [{ json: { kind: 'search', chatId: r.chatId, query: out.query } }];
return [{ json: { kind: 'reply', chatId: r.chatId, text: out.reply || "I'm here to help you find internships 😊 Type a role like \"frontend developer\", or send your resume PDF for match scores." } }];
