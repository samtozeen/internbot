// InternBot - n8n Code node: "Save Profile"
// Runs inside n8n (uses $input, $json, $getWorkflowStaticData). Source of truth: workflow/InternBot.json

// AI_BUSY: if both AI models failed, don't overwrite the saved profile
if ($input.first().json.error) return [{ json: { chatId: $('Route').first().json.chatId, summary: "⏳ I'm a bit busy right now (my AI helper hit its limit). Please send your resume again in a minute 🙏" } }];
// Parse Gemini's JSON and save the profile per Telegram user
const raw = $input.first().json.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
let profile;
try { profile = JSON.parse(raw.replace(/```json|```/g, '').trim()); }
catch (e) { profile = { error: 'parse_failed', raw }; }
const chatId = $('Route').first().json.chatId;
const store = $getWorkflowStaticData('global');
store.profiles = store.profiles || {};
store.profiles[chatId] = { ...profile, rawText: ($('Extract PDF Text').first().json.text || '').slice(0, 8000), updatedAt: new Date().toISOString() };
const skills = (profile.skills || []);
const summary = profile.error
  ? '⚠️ Could not read your resume. Please send a text-based PDF (not a scanned image).'
  : `✅ Profile saved!\n\n👤 ${profile.name || '-'}\n🎓 ${profile.degree || '-'}, ${profile.college || '-'} (${profile.graduation_year || '-'})\n📈 CGPA: ${profile.cgpa ?? '-'}\n🛠 ${skills.length} skills: ${skills.slice(0, 12).join(', ')}\n🎯 Roles: ${(profile.preferred_roles || []).join(', ') || '-'}\n\nNow type a role, e.g. "data analyst intern Bangalore".`;
return [{ json: { chatId, profile, summary } }];
