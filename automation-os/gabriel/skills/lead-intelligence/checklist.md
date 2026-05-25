# Lead Intelligence — Checklist

## Setup
- [ ] ICP_LIBRARY.md loaded for target lane
- [ ] Detection method selected for ICP
- [ ] Target geography confirmed (default: Indianapolis/Indiana)

## Scoring
- [ ] Signal scoring applied to each candidate (LEAD_SIGNAL_LIBRARY.md)
- [ ] Cold, warm, and urgent pain scores calculated
- [ ] Revenue potential assessed
- [ ] Lead type classified (person | organization | partner | referral_source)

## Compliance
- [ ] Government agencies routed to partnership_queue (never outreach)
- [ ] Youth organizations flagged for Katrina review
- [ ] Housing/grant context flagged for Katrina review

## Data Quality
- [ ] No null names — company name used as fallback
- [ ] Source URL included in record
- [ ] Dedup check against Supabase leads table
- [ ] No PII beyond publicly listed information

## Routing
- [ ] Leads with urgent pain < 20 removed from outreach queue
- [ ] Best offer assigned to each lead
- [ ] Outreach angle specific (not "be personal")

## Logging
- [ ] Added to logs/lead-intelligence-log.md
- [ ] Compliance flags documented
