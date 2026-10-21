// InternBot - n8n Code node: "Route"
// Runs inside n8n (uses $input, $json, $getWorkflowStaticData). Source of truth: workflow/InternBot.json

// Daily free limits per user (change these numbers anytime)
const LIMITS = { resume: 5, ask: 30, apply: 10 };
const store = $getWorkflowStaticData('global');
const today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); // IST date
const use = (chatId, bucket) => {
  store.usage = store.usage || {};
  let u = store.usage[chatId];
  if (!u || u.day !== today) u = store.usage[chatId] = { day: today };
  if ((u[bucket] || 0) >= LIMITS[bucket]) return false;
  u[bucket] = (u[bucket] || 0) + 1;
  return true;
};
const LIMIT_TEXT = {
  resume: "📄 You've uploaded your resume 5 times today. Please try again tomorrow 🙂",
  ask: "💬 I've answered a lot of questions today! Please try again tomorrow, or just type a role to search.",
  apply: "🎯 You've created 10 tailored resumes today (the free daily limit). Come back tomorrow for more 💪"
};
return $input.all().map(i => {
  const u = i.json;
  const text = (u.message?.text || '').trim();
  const chatId = u.message?.chat?.id ?? u.callback_query?.message?.chat?.id;
  const data = u.callback_query?.data || '';
  let route = 'other';
  if (u.callback_query) route = data.startsWith('f:') ? 'filter' : data.startsWith('del:') ? 'delete' : 'button';
  else if (u.message?.document) route = u.message.document.mime_type === 'application/pdf' ? 'resume' : 'other';
  else if (/^\/delete/i.test(text)) route = 'delete';
  else if (/^\/(start|help)/i.test(text) || /^(hi+|hello+|hey+|yo|hola|namaste|help|good (morning|afternoon|evening))\b[!. ]*$/i.test(text)) route = 'start';
  else if (/^\/profile/i.test(text)) route = 'profile';
  else if (/^\/status/i.test(text)) route = 'status';
  else if (/^\/more/i.test(text) || /^(show |load |give |send )?(me )?(more|next|next page|aur|aur dikhao|another \d*)( (internships?|jobs?|results?|options?))?( please| pls| plz)?[!. ]*$/i.test(text)) route = 'more';
  else if (/^(thanks?|thank you|thx|ty|tq|ok+|okay|k|cool|nice|great|awesome|super|bye|good night|gn|done|got it|👍|🙏|❤️|😊|🔥)[!. ]*$/i.test(text)) route = 'chat';
  else if (text && (/\?/.test(text) || /^(can|could|would|will|how|what|why|when|where|who|which|do|does|did|is|are|am|should|please|pls|plz|i|i'm|im|my|me|tell|explain|help|find|show|get|give|search|looking|need|want|suggest|recommend|apply|send|write|kya|kaise)\b/i.test(text) || text.split(/\s+/).length > 6)) route = 'ask';
  else if (text) route = 'search';
  const pend = (store.pending || {})[chatId];
  if (pend && Date.now() - pend.ts < 15 * 60e3 && ['search', 'ask', 'other'].includes(route) && text && !text.startsWith('/') && text.split(/\s+/).length <= 4) route = 'filter';
  // daily limits for the expensive actions
  let limitText = null;
  if (route === 'resume' && !use(chatId, 'resume')) limitText = LIMIT_TEXT.resume;
  if (route === 'ask' && !use(chatId, 'ask')) limitText = LIMIT_TEXT.ask;
  if (route === 'button' && data.startsWith('apply:') && !use(chatId, 'apply')) limitText = LIMIT_TEXT.apply;
  if (limitText) route = 'limited';
  return { json: { ...u, route, chatId, text, limitText } };
});

