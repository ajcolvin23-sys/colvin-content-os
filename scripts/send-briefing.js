const https = require('https');
const TOKEN = '8894079838:AAGFiT-sRdyFXuBbscTklm7TmsGi6XWjXdc';
const CHAT = '6728929805';

function send(text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ chat_id: CHAT, text, parse_mode: 'HTML', disable_web_page_preview: true });
    const opts = {
      hostname: 'api.telegram.org',
      path: '/bot' + TOKEN + '/sendMessage',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { const r = JSON.parse(d); if (r.ok) resolve(true); else reject(r.description); });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const msgs = [

`🧠 <b>ALFRED COLVIN — AGENT OS BRIEFING</b>
<i>Full system map · May 23, 2026</i>

━━━━━━━━━━━━━━━━━━━━
🏗 <b>WHAT YOU'VE BUILT</b>
━━━━━━━━━━━━━━━━━━━━

You have <b>3 live systems</b> running right now:

1️⃣ <b>Gabriel (Hermes Prime)</b>
WhatsApp AI brain — strategy, leads, content, CRM
→ Deployed on Vercel · Always on

2️⃣ <b>Indiana Backflow Directory</b>
Programmatic SEO site for backflow testers
→ Next.js 16 · Supabase · Vercel

3️⃣ <b>Colvin Content OS</b>
Full content creation + post queue dashboard
→ colvin-content-os.vercel.app`,

`🤖 <b>YOUR AGENT ARMY — 12 AGENTS TOTAL</b>
━━━━━━━━━━━━━━━━━━━━

<b>COMMAND LAYER (2 agents)</b>

🧭 <b>Hermes Master Orchestrator</b>
The main brain. Routes all tasks across your 3 business lanes. Knows your voice, offers, and goals. Everything flows through here first.

🔀 <b>Hermes Agent Router</b>
Reads your message, picks the right sub-agent automatically. You never have to name which agent — it figures it out.`,

`<b>SUB-AGENTS (10 agents)</b>

🎹 <b>Music Growth Agent</b>
Grows your piano book, app, YouTube (860 subs), TikTok. Builds the content-to-sale pipeline for piano learners and gospel musicians.

🏢 <b>Colvin Enterprises Growth Agent</b>
Grows your AI automation business. Handles offer positioning, client messaging, booking link, LinkedIn outreach strategy.

💧 <b>Backflow Directory Agent</b>
Manages the Indiana tester directory. Data quality, listings, local SEO, content for the Facebook page.

♻️ <b>Content Repurposing Agent</b>
Takes 1 idea and turns it into TikTok + YouTube + Facebook + LinkedIn + Instagram assets. Full platform pack from one source.

📊 <b>Analytics Agent</b>
Tracks metrics across all 3 lanes. YouTube watch time, lead conversion, content performance. Gives you weekly numbers that matter.`,

`🔬 <b>Research Agent</b>
Evidence-graded research. Finds facts, competitors, market data. Grades everything: verified, unconfirmed, or do-not-use. Type <b>research [topic]</b> in WhatsApp.

🎯 <b>Offer &amp; Funnel Agent</b>
Designs your lead magnets, landing pages, email sequences, and sales flows. Maps each business lane to its own funnel.

📇 <b>CRM Pipeline Agent</b>
Tracks leads across all 3 lanes. Follow-up cadence, status updates, next actions. Lives in Supabase — Gabriel can read it.

✅ <b>QA &amp; Compliance Agent</b>
Reviews content before it goes live. Catches unverified claims, SMS rules, data accuracy issues. Your quality gate.

🔍 <b>Platform Lead Scout Agent</b>
Scrapes Upwork, Freelancer, PeoplePerHour every 2 days. Scores AI/automation job leads 0-100. Sends you a ranked report here on Telegram.`,

`⚡ <b>LIVE AUTOMATIONS — RUNS WITHOUT YOU</b>
━━━━━━━━━━━━━━━━━━━━

<b>Every weekday, automatically:</b>

🕖 <b>7:00am EST</b> — Daily Leads scan
Finds fresh AI automation leads, scores them, sends to Telegram

🕖 <b>7:30am EST</b> — Lead Swarm
3 agents run in parallel to research top leads in depth

🕗 <b>8:00am EST</b> — Morning Briefing
Your daily business report: pipeline, content, priorities

🕗 <b>8:00am EST</b> — Content Scheduler
Checks your post queue for anything due, flags for manual posting

<b>Every 2 days:</b>

🕒 <b>3:00pm EST</b> — Platform Lead Scout
Upwork + Freelancer + PeoplePerHour ranked report → Telegram`,

`📱 <b>CONTENT OS — HOW IT FLOWS</b>
━━━━━━━━━━━━━━━━━━━━

colvin-content-os.vercel.app

<b>The 3-step pipeline:</b>

✏️ <b>Create</b> → AI drafts the post for your platform + lane
✅ <b>Approvals</b> → You approve, reject, or schedule
📱 <b>Post Queue</b> → Copy caption, open platform, paste, mark done

<b>Tools built in:</b>
• 🎹 Piano slideshow video script builder
• 💧 Backflow Facebook post generator
• 💼 LinkedIn outreach + connection message drafts
• 📅 Content calendar grouped by date
• 🗂 Asset library for images, videos, voiceovers
• 📋 Full audit log of every action
• ⚙️ Settings showing all platform connection status

<b>Post Queue features:</b>
• Tap a card → see the visual direction first
• Copy the full post (caption + hashtags) in one tap
• Copy CTA separately for the first comment
• Open platform button (TikTok, YouTube, Facebook, etc.)
• Tap Mark as Posted → gone from queue`,

`🚀 <b>NEXT UPGRADES — WHEN YOU'RE READY</b>
━━━━━━━━━━━━━━━━━━━━

<b>SHORT TERM (1-2 sessions)</b>

📧 <b>Email capture + welcome sequence</b>
Add an opt-in to your piano/backflow sites. Auto 5-email welcome flow. Your first owned list = your first real asset.

📲 <b>WhatsApp to Content OS bridge</b>
Type "create post [topic]" in WhatsApp. Gabriel generates it and saves it directly to your approval queue. No dashboard needed.

🎥 <b>FFmpeg video renderer</b>
Actually render the piano slideshow scripts into real MP4 files. Get a download link, upload straight to TikTok/YouTube. Zero editing.

<b>MEDIUM TERM (3-5 sessions)</b>

💰 <b>Stripe payment wires</b>
Connect piano book + app to Stripe. Automated receipts, access grants, and "new sale" Telegram alerts when someone buys.

📈 <b>Analytics dashboard</b>
Pull YouTube + TikTok stats into Content OS. See what's working without leaving your system.

🗺 <b>Backflow directory map view</b>
Google Maps layer on the Indiana directory. Testers show as pins. Better UX = more traffic = more paid listings.

<b>LONG TERM (big sessions)</b>

🤝 <b>Client portal</b>
Colvin Enterprises clients log in, see project status, approve deliverables, pay invoices. Fully automated.

📱 <b>Mobile PWA</b>
Wrap Content OS as a Progressive Web App. Add it to your phone home screen. Native feel, no App Store needed.

━━━━━━━━━━━━━━━━━━━━
<i>System built by Claude · May 2026
Alfred Colvin AI OS · All 3 lanes running 🔥</i>`

];

(async () => {
  for (let i = 0; i < msgs.length; i++) {
    try {
      const ok = await send(msgs[i]);
      console.log(`Message ${i+1}/${msgs.length} sent:`, ok);
      await new Promise(r => setTimeout(r, 600));
    } catch (e) {
      console.error(`Message ${i+1} failed:`, e);
    }
  }
})();
