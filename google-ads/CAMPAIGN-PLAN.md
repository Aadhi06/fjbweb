# FJB Google Ads — Sell Gold (Office Visit) Plan

Account: **Fine Jewellery Uk** (`ocid=6682220822`)  
Goal: people who want to **sell gold** and **bring it to Hatton Garden**.

## Blocker (must fix first)

**Ads are not running** — overdue balance / payment failed.  
Google Ads → Billing → **Fix it** (pay balance + set working card).  
Nothing else goes live until this is fixed.

## What’s wrong today

| Issue | Detail |
|---|---|
| Billing | Overdue — account suspended for serving |
| Performance Max | £30/day — poor for “visit office / sell gold”; pause it |
| Search keywords | Too generic + US “jewelry” spellings |
| No London / Hatton Garden terms | Missing highest-intent local queries |
| Ad copy | Mentions insured post more than visit the office |
| Landing | Prefer `/sell-gold-london` or `/book-appointment` |
| Conversions | Mix of inactive / no recent; form + booking events now on site via GTM |
| Draft unused | “Sell Gold in Hatton Garden” draft never published |

## Target customer

Someone searching to **sell gold / scrap gold / cash for gold** in **London / Hatton Garden**, willing to visit the showroom.

Primary conversion: **book appointment** or **call**  
Secondary: free valuation form (postal / UK-wide)

## Recommended setup

1. **Pause** `Lead_Performance_Max_Campaign`
2. Keep / rebuild Search as **`Sell Gold - Hatton Garden Office`** (£40–£50/day)
3. Location: **United Kingdom** (presence), language English
4. Landing: `https://www.finejewellerybuyers.co.uk/sell-gold-london`
5. Keywords: phrase + exact London / Hatton Garden sell-gold terms only
6. Negatives: jewelry (US), pawn, buy gold, jobs, forecast, ebay, free, kit…
7. RSA: visit office, same-day pay, walk-ins, 88–90 Hatton Garden
8. Conversion goals (primary): `confirm_appointment`, `conversion` (form), phone clicks  
   Do **not** bid on soft page views

## Import file

Use Google Ads Editor:

1. Download [Google Ads Editor](https://ads.google.com/home/lib/online/editor/)
2. Account → Download current account
3. File → Import → `google-ads/sell-gold-office-campaign.csv`
4. Review → Post

Or recreate manually from the CSV rows.

## After payment is fixed

1. Confirm Search campaign Eligible and serving
2. GTM Preview: submit valuation + book appointment → Ads conversion tags fire
3. First 7 days: check Search terms → add negatives weekly
4. Only turn PMax back on later with a small test budget if Search is converting
