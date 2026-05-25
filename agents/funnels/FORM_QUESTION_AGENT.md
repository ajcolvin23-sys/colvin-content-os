# Form Question Agent — Colvin Content OS

Create quiz and funnel questions that qualify leads, score answers, and route to the appropriate offer or sequence.

---

## Purpose

Well-designed form questions:
1. Qualify the lead before they book a call or download a resource
2. Segment the audience for personalized follow-up
3. Collect data that makes Alfred's outreach more relevant
4. Filter out poor-fit leads early

---

## Question Design Principles

- **Short:** Minimum questions to qualify. No more than 5-7 questions per form.
- **Progressive commitment:** Start easy (email first), then ask harder questions
- **Benefit-framed:** "This helps us match you with the right resources" (not just data collection)
- **No required fields that aren't truly required:** Only ask for phone if you'll use it
- **Mobile-friendly options:** Radio buttons and dropdowns preferred over free text for qualifying questions

---

## Form Questions by Lane

### Colvin Enterprises (AI Audit Booking)

```
1. What's your name? (text)
2. Your business email (email) — required for follow-up
3. What type of business do you run?
   [ ] Service business (HVAC, plumbing, landscaping, etc.)
   [ ] Professional services (law, accounting, consulting)
   [ ] Retail or e-commerce
   [ ] Nonprofit or church
   [ ] Other: ____
4. How many people work in your business (including you)?
   [ ] Just me
   [ ] 2-5
   [ ] 6-20
   [ ] 21-50
   [ ] 50+
5. What's your biggest time-wasting manual process right now?
   [ ] Customer follow-up and communication
   [ ] Scheduling and dispatch
   [ ] Invoicing and admin
   [ ] Lead generation
   [ ] Social media and marketing
   [ ] Other: ____
```

Scoring: 6-20 employees + manual dispatch/communication = highest fit.

### First Keys Indy (DPA Eligibility Check)

```
1. Your name (text)
2. Email address (email) — required
3. Are you currently renting? (radio: Yes / No)
4. Have you owned a home in the last 3 years?
   [ ] No — I'm a first-time buyer (or haven't owned in 3+ years)
   [ ] Yes — currently own
   [ ] Not sure
5. Are you planning to buy in Marion County (Indianapolis area)?
   (radio: Yes / No / Not sure yet)
6. What's holding you back from buying? (optional)
   [ ] Down payment
   [ ] Credit score
   [ ] Understanding the process
   [ ] Not sure if I can afford it
   [ ] Other
```

Routing: "No, first-time buyer" + Marion County = high priority for consultation scheduling.
Note: No income questions on intake form (fair lending compliance — collect only what's needed for routing).

### Music Theory Secrets (Piano Quiz)

```
1. Your name (text)
2. Email (email)
3. How long have you been playing piano?
   [ ] Just starting out
   [ ] 1-3 years
   [ ] 3-10 years
   [ ] 10+ years
4. What style do you mainly play?
   [ ] Gospel / R&B
   [ ] Classical
   [ ] Contemporary worship
   [ ] Jazz
   [ ] Other
5. What's your biggest piano challenge right now?
   [ ] Learning chords by ear
   [ ] Improvising
   [ ] Music theory
   [ ] Playing with both hands together
   [ ] Finding resources that match my style
```

Routing: Gospel/worship + 1+ years + ear learning challenge = core book audience.

---

## Routing Logic

After form submission, questions determine:
1. Which lead magnet to deliver
2. Which email sequence to start
3. What priority score to assign the lead
4. What context to include in Alfred's review ticket

---

## Integration Status

PLANNED — Phase 4. First Keys Indy site (first-keys-indy.vercel.app) needs lead capture form. Supabase integration for form submissions required.
