// InternBot - n8n Code node: "Prepare Jobs"
// Runs inside n8n (uses $input, $json, $getWorkflowStaticData). Source of truth: workflow/InternBot.json

const res = $input.first().json;
const ctx = $('Build Query').first().json;
const list = Array.isArray(res.data) ? res.data : (res.data?.jobs || res.data?.data || res.jobs || []);
const stamp = Date.now().toString(36).slice(-5);
const jobs = list.slice(0, 10).map((j, i) => ({
  i, key: stamp + i,
  title: j.job_title,
  company: j.employer_name,
  location: [j.job_city, j.job_state].filter(Boolean).join(', ') || j.job_country || '',
  remote: !!j.job_is_remote,
  posted: j.job_posted_at_datetime_utc,
  link: j.job_apply_link || j.job_google_link,
  publisher: j.job_publisher,
  salary: j.job_min_salary ? (j.job_min_salary + (j.job_max_salary ? '-' + j.job_max_salary : '') + ' ' + (j.job_salary_currency || '') + '/' + (j.job_salary_period || '')) : null,
  desc: (j.job_description || '').slice(0, 1500)
}));
// remember jobs by key so Apply buttons on older cards still work (keep the latest 60)
const store = $getWorkflowStaticData('global');
store.jobIndex = store.jobIndex || {};
const idx = { ...(store.jobIndex[ctx.chatId] || {}) };
for (const j of jobs) idx[j.key] = j;
store.jobIndex[ctx.chatId] = Object.fromEntries(Object.entries(idx).slice(-60));
const cursorNext = res.data?.cursor || res.cursor || res.data?.next_cursor || null;
return [{ json: { ...ctx, jobs, count: jobs.length, cursorNext, error: res.error?.message || res.message || null } }];
