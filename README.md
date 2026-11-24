# AGENT//ARENA

**[Open the English showcase](https://miish-7.github.io/agent-arena-pro-showcase/) · [العربية](https://miish-7.github.io/agent-arena-pro-showcase/ar/) · [Technical field notes](https://miish-7.github.io/agent-arena-pro-showcase/notes/)**

![AGENT//ARENA sharing cover with the original glass shield and neural mesh.](assets/social-cover.png)

Developed by Meshal Almasoudi & Fahad Mubarak

The interactive showcase includes a native WebGL shield and neural network, a browser-based decision lab and a continuous screen recording of a local deterministic fixture. [Recording](media/fixture-demo.mp4) · [Reusable evaluation roadmap](docs/ENTERPRISE_ROADMAP.md). [Explore potential sector evaluations](https://miish-7.github.io/agent-arena-pro-showcase/#sectors). External providers are never contacted by the presentation.

A support agent has permission to summarize a ticket. The ticket text asks for it to be closed. **Whose instruction determines what the agent can do?**

In this experimental AI agent security testbed, the agent proposes a tool action and the server checks it against the authenticated user's task. In the illustrated `DEMO-102` case, the proposed close exceeded the scope of a summary. The gateway recorded `DENIED_SCOPE_ESCALATION` and the ticket stayed open.

[العربية](README_AR.md) · [Case study](docs/CASE_STUDY.md) · [Architecture](docs/ARCHITECTURE.md) · [Evidence and limits](docs/EVIDENCE_AND_LIMITS.md)

![Redesigned local dashboard: four fixture runs, two reads, one block and one pending approval.](assets/dashboard-new.png)

**What the screenshot shows.** This crop of the redesigned overview records four local fixture runs. The [blocked scenario](assets/blocked-new.png) supplied a deterministic proposal and Blue assessment. The application ran its policy checks with **zero live model calls**. In a separate earlier fixture run, when the authenticated user explicitly requested a close, the ticket stayed open until a different reviewer approved it. [Walk through the recorded screenshots](docs/DEMO.md).

## What was verified

**761 distinct Python cases** passed on the merged application baseline. The two default jobs run the same 728 cases. The dedicated PostgreSQL job runs the other 33. [Hosted evidence summary](https://miish-7.github.io/agent-arena-pro-showcase/notes/#verification).

| Check | Observed result | Scope |
|---|---|---|
| Hosted Python 3.12 and 3.13 · 24 Nov 2026 | **728 passed on each** | The same cases on two interpreters. Each default job skipped the 33 PostgreSQL-only cases. |
| Dedicated PostgreSQL 17.12 job · 24 Nov | **33 passed, 0 skipped** | A real disposable database, including row-level security, role permissions and transactions. |
| Node dashboard, API documentation and offline benchmark · 24 Nov | **13 JavaScript cases passed** and **9 fixed synthetic scenarios evaluated** | Simulated browser DOM. The benchmark observed zero provider calls and zero unauthorized synthetic writes. |

**Separate live connector trial · 21 November 2026.** With the owner's authorization, one anonymous GitHub GET retrieved a public synthetic issue and one Groq completion summarized it. Both returned HTTP 200. The retained records confirm the input matched. Summary quality was not independently scored. [Evidence and measurement limits](docs/EVIDENCE_AND_LIMITS.md).

## Engineering focus

FastAPI · Python · deterministic policy enforcement · SQLite / PostgreSQL 17 · tenant-scoped authorization and RLS · OIDC foundation · audit chains · GitHub Actions · bilingual JavaScript dashboard.

[Recorded walkthrough](docs/DEMO.md) · [Contribution and design choices](docs/PROJECT_ROLE.md)

## About the project

The project owner defined the goals, coordinated development and participated in testing and approval decisions. ChatGPT assisted with analysis and review. Codex implemented substantial parts of the application and its tests. [Project role and engineering decisions](docs/PROJECT_ROLE.md).

This showcase contains documentation and screenshots. The application source and raw CI logs remain private. The sandbox has no third-party security certification. Production identity-provider interoperability, independent audit retention and recovery still require validation. [Rights and reuse](RIGHTS_AND_REUSE.md).
