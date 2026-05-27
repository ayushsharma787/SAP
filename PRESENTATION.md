# Proactive Risk Sentinel — Demo Script

**Audience:** SAP solutions architects, GRC consultants, product managers
**Run time:** ~8–10 minutes
**Setup:** Full-screen browser, start on the **Risk Overview** tab.

> Stage directions are in *[brackets]*. Spoken lines are in plain text. Numbers
> below match the live mock data on screen, so you can point as you talk.

---

## Opening (~30s)

> *[Gesture at the shell bar / whole screen.]*

"Today's GRC tooling reports risk **after** the fact — a quarterly SoD report,
an access review, an incident ticket. By the time a human looks, the exposure
has already happened.

The **Proactive Risk Sentinel** flips that model. Four AI agents monitor our
**Access, Change, and Incident** risk *continuously*, score it in real time, and
act autonomously — all inside **SAP GRC 2026**, surfaced through **Joule**.

And everything you're about to see is native **SAP Fiori Horizon** — this could
ship in SAP BTP today. Let me walk you through it."

---

## Tab 1 — Risk Overview *(the CxO cockpit, ~90s)*

> *[You're on the default tab.]*

"This is the executive cockpit — one glance tells you where we stand.

Top row, four KPIs:
- Our **Composite Risk Score is 42** — *Medium*, so the policy is *Restrict &
  Notify*. The gauge and the 7-day sparkline show the trend.
- **23 active Segregation-of-Duties violations**, up 4 since yesterday.
- **7 open incidents** — 2 critical, 3 high.
- And the agents took **156 actions in the last 24 hours — 89% auto-resolved**
  with no human touch.

> *[Point to the trend chart.]*

This is the 30-day Composite Risk Score trend. The coloured bands are our
thresholds — green, orange, red, dark-red. See these two spikes? Day 12, CRS
hit **72** — a contractor SoD conflict. Day 22, it hit **88** — a *terminated*
contractor was still active. In both cases the agents mitigated and pulled us
back down to **42** today.

> *[Point to the heat map, then the feed.]*

The heat map breaks risk down by **domain × business unit** — notice Finance is
hot on the Incident axis, Procurement on Access. And on the right is the live
agent activity feed — for example, *Access Sentinel auto-suspended T-code
ZREC_FORMULA for user CHEM_TECH_042*. Click **View Details** on any of these and
you get the full evidence chain.

> *[Transition.]* Each agent has its own workspace — let's start with Access."

---

## Tab 2 — Access Sentinel *(~90s)*

> *[Click the **Access Sentinel** tab.]*

"Access Sentinel owns who-can-do-what. Here are the live SoD violations — you
can sort any column.

> *[Point to a row.]*

Look at **CONT_MAINT_019**, James Rodriguez — a maintenance **contractor** whose
engagement *ended*, holding *Maintenance Order plus Vendor Payment*. That's a
classic toxic combination, flagged **Critical**. The agent has already
**Escalated** it.

> *[Point to Role Mining chart.]*

This is the differentiator from static rule-checking — **role mining**. We
compare authorizations *assigned* versus *actually used*. James was granted
**142** authorizations and uses **18**. That gap — the light bar — is pure attack
surface we can strip away.

> *[Point to the radar, change the user dropdown.]*

And behavioural fingerprinting: each user gets a 5-axis profile — T-code
diversity, access hours, data volume, role sensitivity, cross-system activity —
compared to their own **90-day baseline**. For **CHEM_TECH_042**, a chemist who
just moved to Marketing, the current pattern blows past baseline on data volume
and role sensitivity. Those anomalies are flagged in red.

> *[Click **Review** on a row.]* "Every item opens a full object page with the
recommended action. Now — what about *changes* to the system itself?"

---

## Tab 3 — Change Guardian *(~75s)*

> *[Click the **Change Guardian** tab.]*

"Change Guardian governs transports, role changes, and firefighter activations
*before* they land.

Every pending change gets an AI-computed **Blast Radius** and a one-line **AI
risk assessment**. Take **DEVK913861** — *modify the ZREC_FORMULA authorization
group*. Blast radius **78**, flagged for both **OSHA and EPA**, and the
assessment reads: *touches recipe IP across 3 plants, affects 214 users*.

> *[Point to the blocked row.]*

This one — granting vendor-create to that terminated contractor — the agent
**Blocked** outright. And these aren't just labels: *[hover Approve/Block]* an
approver can action it right here.

> *[Click the DEVK913861 row, point to treemap.]*

The treemap visualises exactly *what* a change touches — users, roles,
processes, plants — sized by impact. And the 30-day timeline below sizes each
dot by blast radius, so a reviewer instantly sees the high-impact changes.

> *[Transition.]* That's prevention. But some things only show up at runtime —
that's Incident Responder."

---

## Tab 4 — Incident Responder *(~75s)*

> *[Click the **Incident Responder** tab.]*

"This is real-time detection off the **SM20 / SM21** audit stream — note the
**live** indicator; entries are arriving as we speak.

> *[Let one or two new entries tick in.]*

Failed-login bursts, off-hours access, geo-anomalies — each tagged with severity
and its CRS impact.

> *[Point to the sequence flow — the centrepiece of this tab.]*

But the real power is **sequence detection**. Look at this chain:
**ZREC_FORMULA → F-53 → ME21N** — view a recipe, post a payment, raise a purchase
order, at 2 a.m. Individually, each is allowed. *Together*, they match our **IP
Exfiltration template** — so the agent added **34 to the risk score and escalated
to the CISO**, with the evidence chain preserved.

> *[Point to the distribution chart.]* The 7-day distribution shows the anomaly
mix trending. Now — here's what no GRC tool on the market does today."

---

## Tab 5 — Risk Correlator *(the innovation + showstopper, ~2.5 min)*

> *[Click the **Risk Correlator** tab.]*

"Everything so far lives in its own silo. The **Risk Correlator** is the
innovation layer that fuses them.

> *[Point to the gauge and breakdown.]*

The single **Composite Risk Score** is a weighted blend of four dimensions —
**Access, Change, Incident, and Temporal Decay** — and we show the exact formula
and each dimension's contribution. No black box; it's fully auditable.

> *[Point to the correlation matrix.]*

This matrix is the magic. It measures **cross-domain correlation**. Access ×
Change is **0.73** — meaning the users with SoD violations are the *same* users
with risky pending transports. A siloed tool sees two medium risks; we see one
*coordinated* high risk. *[Hover a cell to read the rationale.]*

> *[Point to the threshold bar.]*

And the score drives **automated response tiers** — Log & Monitor, Restrict &
Notify, Suspend with CISO alert, and at the top, immediate lockout and session
kill with an auto-generated evidence chain. The marker shows exactly where we
sit right now.

> *[Scroll to the What-If Simulator — slow down here, this is the close.]*

"Let me make this tangible. This is the **What-If Simulator**.

> *[Drag the **SoD Violations** slider up.]* Say a wave of SoD conflicts comes
in — watch the score climb and the gauge re-colour live.
> *[Drag **Days Since Last Incident** down toward 0.]* Now a fresh incident, so
temporal decay spikes…
> *[Push **Blast Radius** up.]* …and a high-impact change lands at the same time.

We've crossed into the **High** band, and the recommended action just escalated
to *Suspend, Dual Approval, CISO Alert* — automatically. *[Click **Reset**.]*

That's the pitch: **continuous, autonomous, and cross-domain** — risk scored and
acted on in real time, not reviewed in a quarterly report."

---

## Close (~20s)

"So — four AI agents, one composite score, autonomous response, and the
cross-domain correlation that turns isolated signals into a single picture of
risk. Native Fiori, GRC 2026, Joule-ready.

I'd love to walk through how this maps to your landscape. What questions can I
answer?"

---

## Appendix — likely questions

- **"Is this real data?"** — It's a functional prototype with representative
  chemical-manufacturing mock data and real SAP T-codes; the scoring logic and
  interactions are live (try the simulator).
- **"How is the Composite Risk Score calculated?"** — Weighted sum of Access,
  Change, Incident, and Temporal Decay dimensions; the formula and weights are
  shown on the Risk Correlator tab.
- **"What makes it different from current GRC / SoD tools?"** — Three things:
  it's *continuous* (not periodic), *autonomous* (89% auto-resolved), and
  *cross-domain* (the correlation matrix) — that last layer is the novel part.
- **"Does it replace the analyst?"** — No — it auto-handles the routine 89% and
  escalates the judgement calls with a full evidence chain, so analysts focus on
  what matters.
- **"How does Joule fit?"** — Joule is the conversational layer (top-right
  sparkle) — ask it to summarise risk or draft mitigation tasks in natural
  language.

---

### Quick navigation cheat-sheet

| Tab | One-line hook |
|-----|---------------|
| Risk Overview | "The CxO cockpit — one score, one glance." |
| Access Sentinel | "Assigned vs. *used* access is the attack surface." |
| Change Guardian | "Blast radius and AI risk *before* a change lands." |
| Incident Responder | "Individually allowed, *together* it's exfiltration." |
| Risk Correlator | "The cross-domain layer no GRC tool has today." |
