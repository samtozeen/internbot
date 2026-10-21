// InternBot - n8n Code node: "More Jobs"
// Runs inside n8n (uses $input, $json, $getWorkflowStaticData). Source of truth: workflow/InternBot.json

// ---- daily search limits: 10 per user, 150 for the whole bot (protects the free API quota)
const _today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
const _useSearch = (st, id) => {
  st.usage = st.usage || {};
  const g = st.usage._global && st.usage._global.day === _today ? st.usage._global : (st.usage._global = { day: _today, search: 0 });
  let u = st.usage[id]; if (!u || u.day !== _today) u = st.usage[id] = { day: _today };
  if ((u.search || 0) >= 10) return "🔍 You've done 10 searches today (the free daily limit). Come back tomorrow, or type more to see more results from your last search 🙂";
  if ((g.search || 0) >= 150) return "😅 InternBot is very popular today and hit its daily search limit. Please try again tomorrow!";
  u.search = (u.search || 0) + 1; g.search = (g.search || 0) + 1; return null;
};
const r = $('Route').first().json;
const store = $getWorkflowStaticData('global');
const ls = (store.lastSearch || {})[r.chatId];
if (!ls) return [{ json: { kind: 'reply', chatId: r.chatId, text: "Let's start with a search first 🙂 Type a role like \"frontend developer\" or \"data analyst intern Pune\"." } }];
if (ls.queue && ls.queue.length) {
  const take = ls.queue.splice(0, 5);
  const start = ls.shown || 0;
  ls.shown = start + take.length;
  const hasMore = ls.queue.length > 0 || !!ls.cursor;
  return take.map((cd, n) => {
    let text = `<b>${start + n + 1}. ${cd.title}</b>\n${cd.body}`;
    if (n === take.length - 1) text += hasMore ? '\n\n💬 Type <b>more</b> for even more.' : "\n\n✨ That's all for \"" + ls.userQuery + "\". Try another role or city!";
    return { json: { kind: 'cards', chatId: cd.chatId, idx: cd.idx, link: cd.link, text } };
  });
}
if (ls.cursor) { const _lim = _useSearch(store, r.chatId); if (_lim) return [{ json: { kind: 'reply', chatId: r.chatId, text: _lim } }]; return [{ json: { kind: 'fetch', chatId: r.chatId } }]; }
return [{ json: { kind: 'reply', chatId: r.chatId, text: "That's all I could find for \"" + ls.userQuery + "\" 🙌 Try a nearby city, \"remote\", or a related role like \"business analyst intern\"." } }];
