// InternBot - n8n Code node: "Search Wizard"
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
const chatId = r.chatId;
const store = $getWorkflowStaticData('global');
store.pending = store.pending || {};
const CITIES = { 'bengaluru': 'Bengaluru', 'bangalore': 'Bengaluru', 'blr': 'Bengaluru', 'pune': 'Pune', 'hyderabad': 'Hyderabad', 'hyd': 'Hyderabad', 'chennai': 'Chennai', 'mumbai': 'Mumbai', 'bombay': 'Mumbai', 'navi mumbai': 'Navi Mumbai', 'delhi': 'Delhi NCR', 'new delhi': 'Delhi NCR', 'delhi ncr': 'Delhi NCR', 'ncr': 'Delhi NCR', 'noida': 'Noida', 'gurgaon': 'Gurugram', 'gurugram': 'Gurugram', 'kolkata': 'Kolkata', 'ahmedabad': 'Ahmedabad', 'kochi': 'Kochi', 'cochin': 'Kochi', 'jaipur': 'Jaipur', 'chandigarh': 'Chandigarh', 'indore': 'Indore', 'coimbatore': 'Coimbatore', 'trivandrum': 'Thiruvananthapuram', 'thiruvananthapuram': 'Thiruvananthapuram', 'mysore': 'Mysuru', 'mysuru': 'Mysuru', 'mangalore': 'Mangaluru', 'mangaluru': 'Mangaluru', 'nagpur': 'Nagpur', 'bhubaneswar': 'Bhubaneswar', 'lucknow': 'Lucknow', 'vizag': 'Visakhapatnam', 'visakhapatnam': 'Visakhapatnam' };
const title = s => s.replace(/\b\w/g, ch => ch.toUpperCase());
function parse(text) {
  const t = ' ' + String(text || '').toLowerCase() + ' ';
  const p = { location: null, type: null, mode: null };
  if (/\b(remote|wfh|work from home)\b/.test(t)) p.mode = 'Remote';
  if (/\bhybrid\b/.test(t)) p.mode = 'Hybrid';
  if (/\b(on[- ]?site|in[- ]?office)\b/.test(t)) p.mode = 'On-site';
  if (/\bintern(ship)?s?\b/.test(t)) p.type = 'Internship';
  if (/\bfull[- ]?time\b/.test(t)) p.type = 'Full-time';
  if (/\bpart[- ]?time\b/.test(t)) p.type = 'Part-time';
  let cityKey = null;
  for (const k of Object.keys(CITIES).sort((a, b) => b.length - a.length)) if (new RegExp('\\b' + k + '\\b').test(t)) { p.location = CITIES[k]; cityKey = k; break; }
  if (!p.location) { const m = String(text).match(/\b(?:in|at|near)\s+([a-zA-Z .]{3,30})$/i); if (m && !/remote|india|office|hybrid/i.test(m[1])) p.location = title(m[1].trim()); }
  if (!p.location && /\b(india|anywhere|pan india)\b/.test(t)) p.location = 'Anywhere in India';
  if (p.mode === 'Remote' && !p.location) p.location = 'Remote';
  let role = String(text || '')
    .replace(/\b(full[- ]?time|part[- ]?time|internships?|interns?|remote|wfh|work from home|hybrid|on[- ]?site|in[- ]?office|jobs?|roles?|openings?|positions?|vacanc(y|ies)|pan india|anywhere|india)\b/gi, ' ')
    .replace(/\b(in|at|near)\s+[a-zA-Z .]+$/i, ' ');
  if (cityKey) role = role.replace(new RegExp('\\b' + cityKey + '\\b', 'ig'), ' ');
  p.role = role.replace(/\b(in|at|near|for|a|an)\s*$/i, '').replace(/\s+/g, ' ').trim();
  return p;
}
let p;
if (r.route === 'filter') {
  p = store.pending[chatId];
  if (!p || Date.now() - p.ts > 15 * 60e3) { delete store.pending[chatId]; return [{ json: { kind: 'reply', chatId, text: 'Tell me a role to search, e.g. "frontend developer" 🙂' } }]; }
  const data = r.callback_query?.data;
  if (data) {
    const [, field, ...rest] = data.split(':'); const val = rest.join(':');
    if (field === 'loc') { p.location = val; if (val === 'Remote') p.mode = 'Remote'; }
    if (field === 'type') p.type = val;
    if (field === 'mode') p.mode = val;
  } else {
    const a = r.text.trim(); const ans = parse(a);
    if (p.asking === 'location') {
      if (ans.location) { p.location = ans.location; if (ans.mode) p.mode = ans.mode; }
      else if (/\b(developer|engineer|analyst|designer|manager|scientist|marketing|sales|writer|hr|intern|consultant|associate)\b/i.test(a)) p = null;
      else if (/\bany(where)?\b/i.test(a)) p.location = 'Anywhere in India';
      else p.location = title(a);
    } else if (p.asking === 'type') {
      if (ans.type) p.type = ans.type; else if (/\b(any|all|both|either)\b/i.test(a)) p.type = 'Any'; else p = null;
    } else if (p.asking === 'mode') {
      if (ans.mode) p.mode = ans.mode; else if (/\b(any|all|either|no pref)/i.test(a)) p.mode = 'Any'; else p = null;
    }
    if (!p) { delete store.pending[chatId]; p = parse(a); if (!p.role) p.role = a; }
  }
} else {
  const text = r.route === 'ask' ? $('Decide').first().json.query : r.text;
  p = parse(text);
  if (!p.role) p.role = text;
}
const ask = (field, kind) => { p.asking = field; p.ts = Date.now(); store.pending[chatId] = p; return [{ json: { kind, chatId, role: p.role } }]; };
if (!p.location) return ask('location', 'ask_loc');
if (!p.type) return ask('type', 'ask_type');
if (!p.mode) return ask('mode', 'ask_mode');
delete store.pending[chatId];
const _lim = _useSearch(store, chatId);
if (_lim) return [{ json: { kind: 'reply', chatId, text: _lim } }];
const typeWord = { 'Internship': 'internship', 'Full-time': 'full time', 'Part-time': 'part time' }[p.type] || '';
const modeWord = { 'Remote': 'remote', 'Hybrid': 'hybrid', 'On-site': 'onsite' }[p.mode] || '';
const where = (p.location === 'Remote' || p.location === 'Anywhere in India') ? 'in India' : 'in ' + p.location;
const query = [p.role, typeWord, modeWord, where].filter(Boolean).join(' ');
const label = [p.role, p.type === 'Any' ? 'any type' : p.type, p.mode === 'Any' ? 'any work mode' : p.mode, p.location].join(' · ');
return [{ json: { kind: 'go', chatId, query, label } }];

