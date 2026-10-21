// InternBot - n8n Code node: "Friendly Reply"
// Runs inside n8n (uses $input, $json, $getWorkflowStaticData). Source of truth: workflow/InternBot.json

const r = $('Route').first().json;
const t = r.text.toLowerCase();
const pick = a => a[Math.floor(Math.random() * a.length)];
let text;
if (/bye|good night|gn/.test(t)) text = pick(['Bye! 👋 Good luck with your applications!', 'Good night! 🌙 Come back anytime for new internships.']);
else if (/thank|thx|ty|tq|🙏|❤️/.test(t)) text = pick(["You're welcome! 😊 Type more for more internships, or a new role to search.", 'Happy to help! 🙌 Want more? Just type more.']);
else text = pick(['👍 Anything else? Type a role to search, more for more results, or /status to see your applications.', 'Cool! 😊 I\'m here whenever you want to search more internships.']);
return [{ json: { chatId: r.chatId, text } }];
