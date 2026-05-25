# Runbooks — Colvin Content OS

Step-by-step runbooks for every common failure. Alfred or Hermes follows these to restore service.

---

## Runbook 1: Gabriel Daily Run Failure

**Symptom:** Telegram alert "Gabriel daily run not completed by 8 AM ET"

**Steps:**
1. Check Vercel function logs for the cron trigger time
2. Query Supabase: `SELECT * FROM workflow_runs WHERE workflow_name = 'daily_lead_workflow' AND created_at::date = today ORDER BY created_at`
3. Find the failed stage — which stage has `status: failed`?
4. Check `error_metadata` on the failed record
5. Is it transient? (HTTP_429, network timeout) → Wait 15 minutes and trigger replay
6. Is it a missing env var? → Check `.env.local` or Vercel env vars, add missing var, redeploy
7. Is it a schema failure? → Check which fields failed, update prompt
8. If unsure: trigger full rerun manually: `npm run workflow:daily-leads`
9. Monitor until completion
10. Verify Telegram daily report includes expected data

---

## Runbook 2: Supabase Connection Failure

**Symptom:** P1 alert "Supabase is unreachable"

**Steps:**
1. Check Supabase status page: https://status.supabase.com
2. If Supabase is having an outage: wait, monitor, all workflows paused automatically
3. If Supabase shows OK: check your `SUPABASE_SERVICE_ROLE_KEY` is still valid
4. Verify: Is the Supabase project `iuzlbtfevzkerehmluqj` paused? (Check Supabase dashboard)
5. If project is paused (free tier inactivity): Unpause via Supabase dashboard
6. Test connection: `npm run health-check`
7. If still failing: regenerate service role key, update Vercel env vars, redeploy
8. Verify system health check passes after fix

---

## Runbook 3: OpenAI Quota Exceeded

**Symptom:** P2 alert "OpenAI quota exceeded. Generation paused."

**Steps:**
1. Log in to platform.openai.com
2. Check Usage → Limits → Current period usage
3. If truly exhausted: pause all generation workflows until quota resets (monthly)
4. Alternatively: upgrade plan or request limit increase
5. If Gemini MCP is active: update model routing to fallback to Gemini temporarily
6. Monitor: quota usually resets at start of billing period
7. When quota restored: verify OpenAI health check passes, resume workflows

---

## Runbook 4: Telegram Bot Not Responding

**Symptom:** Health check: Telegram bot ping fails

**Steps:**
1. Check TELEGRAM_BOT_TOKEN is set in Vercel environment variables
2. Test manually: `curl https://api.telegram.org/bot{TOKEN}/getMe`
3. If 401 Unauthorized: token may be revoked — go to BotFather, check bot status
4. If 200 OK but messages not sending: check TELEGRAM_CHAT_ID is correct
5. Check if Alfred blocked the bot in Telegram: unblock if so
6. If BotFather shows bot is inactive: restart bot (BotFather → /mybots → restart)
7. Verify health check passes after fix
8. Note: While Telegram is down, alerts are logged to Supabase `system_health` table

---

## Runbook 5: Remotion Render Stuck

**Symptom:** Blueprint in `render_status: rendering` for > 15 minutes

**Steps:**
1. Check Remotion MCP status via health check
2. If Remotion MCP is unreachable: check REMOTION_MCP_URL env var
3. If MCP is up: check render job ID in Remotion dashboard (if accessible)
4. After 30 minutes with no response: abort render job (if API allows)
5. Set blueprint `render_status: failed`
6. Review the blueprint for errors that might have caused the hang
7. Create P2 incident: `REMOTION_RENDER_STUCK`
8. Alert Alfred with blueprint details
9. Alfred reviews blueprint and decides to re-render or fix

---

## Runbook 6: Review Queue Overflow (> 50 Items)

**Symptom:** P2 alert "Review queue has 50+ items"

**Steps:**
1. Open `/dashboard/review`
2. Sort by priority_score DESC
3. Review the top 10 items — approve, reject, or request revision
4. Focus first on: outreach drafts (time-sensitive), compliance-flagged items
5. Bulk-approve low-priority content items (social posts with no flags) if verified
6. Pause new outreach draft generation: set config flag or notify Gabriel
7. After queue drops to < 20: resume normal generation
8. If Alfred is overwhelmed: reduce daily draft generation targets in gabriel-config.json

---

## Runbook 7: Circuit Breaker Open

**Symptom:** Hermes alert "OpenAI circuit breaker open" or other provider

**Steps:**
1. Note which provider's circuit breaker is open
2. Wait 60 seconds (circuit probe interval)
3. If probe succeeds: circuit closes automatically, monitor
4. If probe fails: investigate root cause (check provider status page)
5. If provider outage confirmed: wait for outage to resolve
6. If provider is up but circuit still open: check rate limiting — are we hitting limits?
7. Adjust rate limiting in RATE_LIMIT_POLICY.md if needed
8. Once circuit closes: verify workflows resume normally
9. Create P3 incident documenting the event and any needed rate limit adjustments
