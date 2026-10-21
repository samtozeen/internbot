// InternBot - n8n Code node: "Build Kit"
// Runs inside n8n (uses $input, $json, $getWorkflowStaticData). Source of truth: workflow/InternBot.json

const ctx = $('Parse Button').first().json;
let kit = null;
try {
  const parts = $input.first().json.candidates?.[0]?.content?.parts || [];
  kit = JSON.parse(parts.filter(p => !p.thought).map(p => p.text || '').join('').replace(/```json|```/g, '').trim());
} catch (e) {}
if (!kit || !kit.resume) {
  return [{ json: { ok: false, chatId: ctx.chatId, key: ctx.key, link: ctx.job.link || 'https://www.google.com', text: "⏳ I'm a bit busy right now (my AI helper hit its limit). Please tap Apply again in a minute 🙏" } }];
}
const R = kit.resume;
const A = s => String(s ?? '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/•/g, '-').replace(/₹/g, 'Rs.').replace(/[^\x20-\x7E]/g, '');
// ---- tiny PDF writer (A4, Helvetica) ----
const W = 495, X = 50;
const lines = [];
const wrap = (t, size, width) => { const max = Math.floor(width / (size * 0.5)); const out = []; let cur = ''; for (const w of A(t).split(/\s+/)) { if ((cur + ' ' + w).trim().length > max) { if (cur) out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); } if (cur) out.push(cur); return out; };
const add = (t, f = 'F1', s = 10, x = X, gap = 0) => wrap(t, s, W - (x - X)).forEach((l, i) => lines.push({ t: l, f, s, x, gap: i === 0 ? gap : 0 }));
const section = t => { lines.push({ t: A(t).toUpperCase(), f: 'F2', s: 11, x: X, gap: 8, rule: true }); };
add(R.name || 'Resume', 'F2', 18);
add(R.contact || '', 'F1', 9.5, X, 2);
if (R.summary) { section('Summary'); add(R.summary); }
if ((R.skills || []).length) { section('Skills'); add(R.skills.join(', ')); }
if ((R.projects || []).length) { section('Projects'); for (const p of R.projects) { add(p.title + (p.tech ? ' (' + p.tech + ')' : ''), 'F2', 10, X, 4); for (const b of p.bullets || []) add('- ' + b, 'F1', 10, X + 12); } }
if ((R.experience || []).length) { section('Experience'); for (const e of R.experience) { add(e.role + ' - ' + e.company + (e.duration ? ' (' + e.duration + ')' : ''), 'F2', 10, X, 4); for (const b of e.bullets || []) add('- ' + b, 'F1', 10, X + 12); } }
if ((R.education || []).length) { section('Education'); for (const e of R.education) add([e.degree, e.school, e.years, e.score].filter(Boolean).join(' | '), 'F1', 10, X, 2); }
if ((R.extras || []).length) { section('Achievements & Certifications'); for (const x of R.extras) add('- ' + x, 'F1', 10, X + 12); }
const esc = s => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
const pages = []; let ops = [], y = 792;
for (const l of lines) {
  const h = l.s * 1.35 + l.gap + (l.rule ? 4 : 0);
  if (y - h < 50) { pages.push(ops.join('\n')); ops = []; y = 792; }
  y -= h;
  ops.push(`BT /${l.f} ${l.s} Tf ${l.x} ${y.toFixed(1)} Td (${esc(l.t)}) Tj ET`);
  if (l.rule) ops.push(`0.6 w ${X} ${(y - 3).toFixed(1)} m ${X + W} ${(y - 3).toFixed(1)} l S`);
}
pages.push(ops.join('\n'));
const objs = [];
objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
objs[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
const kids = [];
pages.forEach((s, i) => { const p = 5 + i * 2; kids.push(p + ' 0 R'); objs[p] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${p + 1} 0 R >>`; objs[p + 1] = `<< /Length ${s.length} >>\nstream\n${s}\nendstream`; });
objs[2] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`;
let pdf = '%PDF-1.4\n'; const off = [];
for (let i = 1; i < objs.length; i++) { off[i] = pdf.length; pdf += `${i} 0 obj\n${objs[i]}\nendobj\n`; }
const xref = pdf.length;
pdf += `xref\n0 ${objs.length}\n0000000000 65535 f \n` + off.slice(1).map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('');
pdf += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
// ---- chat message ----
const h = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ans = kit.answers || {};
let text = `🎯 <b>Apply kit: ${h(ctx.job.title)}</b> at ${h(ctx.job.company)}\n\n📄 Your tailored resume is above: skills and projects reordered for this role. Nothing made up.`;
text += `\n\n✍️ <b>Ready answers</b>\n<b>Why should we hire you?</b>\n${h(ans.why_hire)}\n\n<b>Why this role?</b>\n${h(ans.why_role)}\n\n<b>Most relevant project</b>\n${h(ans.relevant_project)}`;
if ((kit.keywords_missing || []).length) text += `\n\n💡 <b>Resume tip:</b> this job mentions ${h(kit.keywords_missing.join(', '))}. Add them only if you really know them.`;
if (kit.short_note) text += `\n\n✉️ <b>Short note for email/LinkedIn</b>\n${h(kit.short_note)}`;
text += `\n\n👉 Tap <b>Open &amp; apply</b>, upload the tailored resume, paste the answers, then tap <b>Mark as applied</b>.`;
if (text.length > 4000) text = text.slice(0, 3990) + '…';
const safe = s => A(s).replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 30);
return [{ json: { ok: true, chatId: ctx.chatId, key: ctx.key, link: ctx.job.link || 'https://www.google.com', text, caption: `📄 Resume tailored for ${A(ctx.job.title)} at ${A(ctx.job.company)}`.slice(0, 1000) },
  binary: { data: { data: Buffer.from(pdf, 'latin1').toString('base64'), mimeType: 'application/pdf', fileName: `${safe(R.name || 'Resume')}_${safe(ctx.job.company)}.pdf` } } }];

