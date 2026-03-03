# MasterKey OS: Audit Core Logic & Formulas

This document explains the "Magic under the hood"—the logic and formulas we use to find leaks and growth opportunities in your business.

---

## 1. Operational Waste (The "Money Leak" Audit)
We calculate how much money is "bleeding" out of your business due to manual work and inefficient systems.

### Simple Explanation:
*   We look at your Staff, Ops, and marketing costs.
*   We apply a "Waste Factor" to each (e.g., 30% of marketing is often wasted).
*   We adjust these wastes based on whether you have a CRM or ERP.

### The Formula:
1.  **Staff Waste** = $Staff Costs \times Factor$ (Base: 12%, +10% if >30 manual hrs/week)
2.  **Ops Waste** = $Overheads \times Factor$ (Base: 15%, -10% if has ERP)
3.  **Marketing Waste** = $Marketing Spend \times Factor$ (Base: 30%, -15% if has CRM)
4.  **Total Burn** = $(Staff Waste + Ops Waste + Marketing Waste) + Penalty$
    *   *Penalty is 8% of total if over ₹10L, else 3%.*

---

## 2. Missed After-Hours Revenue (The "Night Loss" Audit)
This calculates how many sales you lose because you aren't replying to leads 24/7.

### Simple Explanation:
*   We estimate your night-time leads based on your closing time.
*   We compare your current "Response Speed" to the speed of an **AI Instant Reply**.
*   The difference between the two is your "Lost Revenue."

### The Formula:
1.  **Night Leads** = $Daily Leads \times Night Traffic Factor \times 26 Days$
    *   *Night Traffic Factor: 6pm close = 0.38, 8pm = 0.25, 10pm = 0.14*
2.  **Revenue Loss** = $Night Leads \times (28\% - Current CVR) \times Profit Per Sale$
    *   *28% is the fixed conversion rate for AI Instant Response.*

---

## 3. Missed Local Customers (The "Visibility" Audit)
This checks how many potential customers are searching for you but finding your competitors instead.

### Simple Explanation:
*   We give you a score out of 100 based on your website, SEO, and social media.
*   If you have a 40/100 score, you are "missing" 60% of potential search traffic.

### The Formula:
1.  **Visibility Score** = Sum of Point Weights:
    *   Website (20), Google Maps (20), WhatsApp (15), SEO (15), Social Media (15), Ads (10), CRM (5).
2.  **Missed Customers** = $Baseline Traffic \times (1 - (Score / 100))$
    *   *Baseline: 1,200/mo for cities, 500/mo elsewhere.*

---

## 4. Extinction Horizon (The "AI Threat" Audit)
This measures how vulnerable your specific industry is to being replaced by AI.

### Simple Explanation:
*   Different industries have different "Risk Scores" (e.g., IT is high risk, Healthcare is lower).
*   Having a physical shop + online presence (Omnichannel) makes you much safer.

### The Formula:
1.  **Risk Score %** = $Base Industry Risk - Resilience Multiplier$
    *   *Resilience Multiplier: -18 points if Digital + Physical, +5 points if Physical Only.*
2.  **Years to Disruption** = $(100 - Risk Score) / 10$

---

## Summary Data Flow
Audit data is saved and synced using IDs to ensure the Dashboard always reflects the **latest single source of truth** for your business diagnostics.
