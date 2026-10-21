// InternBot - n8n Code node: "Build Cards"
// Runs inside n8n (uses $input, $json, $getWorkflowStaticData). Source of truth: workflow/InternBot.json

const ctx = $('Prepare Jobs').first().json;
let ranked = [];
try {
  const parts = $input.first().json.candidates?.[0]?.content?.parts || [];
  const raw = parts.filter(p => !p.thought).map(p => p.text || '').join('') || '{}';
  ranked = JSON.parse(raw.replace(/```json|```/g, '').trim()).ranked || [];
} catch (e) {}
const esc = s => String(s ?? '').replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ago = d => { if (!d) return ''; const days = Math.floor((Date.now() - new Date(d)) / 864e5); return days <= 0 ? 'today' : days + 'd ago'; };
const store = $getWorkflowStaticData('global');
store.lastSearch = store.lastSearch || {};
const prev = ctx.isMore ? (store.lastSearch[ctx.chatId] || {}) : {};
const seen = new Set(prev.seen || []);
const all = ctx.jobs.map(j => ({ ...j, ...(ranked.find(r => r.i === j.i) || {}) }))
  .filter(j => !seen.has((j.title + '|' + j.company).toLowerCase()))
  .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
const toCard = j => {
  let body = `🏢 ${esc(j.company)}\n📍 ${esc(j.location)}${j.remote ? ' · Remote' : ''}`;
  if (j.salary) body += `\n💰 ${esc(j.salary)}`;
  if (j.posted) body += `\n🕒 Posted ${ago(j.posted)}${j.publisher ? ' on ' + esc(j.publisher) : ''}`;
  if (j.score != null) body += `\n🎯 Match: <b>${j.score}%</b> — ${esc(j.reason)}`;
  return { chatId: ctx.chatId, idx: j.key, link: j.link || ('https://www.google.com/search?q=' + encodeURIComponent(j.title + ' ' + j.company)), title: esc(j.title), body };
};
const cards = all.map(toCard);
const show = cards.slice(0, 5), queue = cards.slice(5);
const shownBefore = prev.shown || 0;
store.lastSearch[ctx.chatId] = {
  q: ctx.q, userQuery: ctx.userQuery, cursor: ctx.cursorNext, queue,
  shown: shownBefore + show.length,
  seen: [...seen, ...all.map(j => (j.title + '|' + j.company).toLowerCase())].slice(-200)
};
const hasMore = queue.length > 0 || !!ctx.cursorNext;
return show.map((cd, n) => {
  let text = `<b>${shownBefore + n + 1}. ${cd.title}</b>\n${cd.body}`;
  if (n === 0 && !ctx.profile) text += '\n\n💡 Send your resume PDF and I\'ll show match scores.';
  if (n === show.length - 1) text += hasMore ? '\n\n💬 Type <b>more</b> for more internships, or send another role to search.' : "\n\n✨ That's everything I found for this search. Try another role or city!";
  return { json: { chatId: cd.chatId, idx: cd.idx, link: cd.link, text } };
});
