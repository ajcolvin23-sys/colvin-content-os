# Gabriel Campaign Engine

## Purpose

The Campaign Engine manages multi-touch outreach sequences across business lanes. It tracks where each prospect is in the sequence, prevents duplicate touches, and surfaces the right next step at the right time.

## Campaign Types

### Type 1: Colvin Enterprises Outreach Campaign
**Goal:** B2B client acquisition for AI automation consulting
**Sequence:**
1. LinkedIn connection request (Day 1)
2. LinkedIn follow-up with value (Day 3 — after connection accepted)
3. LinkedIn or email with case study (Day 7)
4. Calendar invite if no response (Day 14)
**Target:** Business owners, operations directors, marketing managers in Indianapolis area

### Type 2: First Keys Indy Lead Nurture
**Goal:** Marion County first-time homebuyers → DPA program awareness
**Sequence:**
1. Educational social post (organic, no targeting)
2. Email capture via landing page
3. Welcome email sequence (5-part, automated)
4. Booking link offer (Day 10)
**Compliance:** All content reviewed by Katrina. No guarantee language. Always recommend HUD-approved lender.

### Type 3: Music Theory Secrets Launch
**Goal:** Piano method book sales
**Sequence:**
1. YouTube video → email opt-in
2. Welcome + free lesson (Day 0)
3. Book offer email (Day 3)
4. Testimonial email (Day 7)
5. Last chance email (Day 10)

### Type 4: FundingReady Indiana
**Goal:** Grant awareness + lead generation for small businesses
**Sequence:**
1. Educational content (what grants are available in Indiana)
2. Lead magnet (grant checklist PDF)
3. Discovery call offer
**Compliance:** Reviewed by Katrina. No guarantee of funding approval.

## Campaign State Tracking

Stored in Supabase `campaigns` table:

```sql
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  campaign_type TEXT NOT NULL,
  lane TEXT NOT NULL,
  current_step INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active', -- active|paused|completed|unsubscribed
  last_touch_at TIMESTAMP WITH TIME ZONE,
  next_touch_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Campaign Rules

1. One active campaign per lead at a time
2. Never advance to next step without Alfred's approval for outreach steps
3. If lead replies at any step → pause campaign immediately, flag for Alfred
4. If lead says not interested → mark unsubscribed, never contact again
5. Email campaigns can be partially automated if content is pre-approved by Alfred
6. LinkedIn sequences always require Alfred to manually send (Gabriel drafts only)

## Campaign Performance Tracking

Gabriel reports weekly:
- Open rates by campaign
- Reply rates by campaign
- Conversion (lead → call → client) by campaign
- Best-performing message (by reply rate)
