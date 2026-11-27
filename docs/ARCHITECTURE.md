# Architecture and trust boundaries | المعمارية وحدود الثقة

The server derives the actor, tenant and authorized task from the authenticated workflow. The Target proposes an action and a resource. The Tool Gateway passes those details to a deterministic policy engine. The Blue assessment can explain a concern. Only a server decision can advance an action to execution.

> **AI proposes. Policy decides.** The proposal, the decision and the tool’s effect are three separate observations. A reviewer can check each against the same resource.

## Decision path for a synthetic ticket

```mermaid
flowchart TD
    U["Authenticated actor, tenant and task"] --> G["Tool Gateway and Policy Engine"]
    D["Untrusted ticket text"] --> P["Target proposes action and ticket"]
    P --> G
    P --> B["Blue assessment"]
    B -.-> E["Tenant-scoped audit"]
    S["Ticket state and revision"] --> G
    G -->|Out of scope| X["Deny and keep ticket open"]
    G -->|Read allowed| R["Read ticket"]
    G -->|Close in scope| A["Pending approval"]
    A --> V["Independent reviewer and server recheck"]
    V -->|Approved and valid| W["Commit synthetic close"]
    V -->|Rejected or stale| N["No ticket change"]
    X --> E
    R --> E
    A --> E
    W --> E
```

**How to read the diagram.** The dotted arrow carries an advisory assessment to the audit trail. It grants no permission. An in-scope close waits for a different reviewer. The server checks the bound payload, expiry and ticket revision, and commits a successful approval and synthetic close together. [Follow the same decision in the case study](CASE_STUDY.md).

## What was exercised

The screenshots use SQLite in local fixture mode. The private FastAPI application also has an opt-in GitHub issue reader, an opt-in Groq integration, OIDC and browser SSO paths tested with simulated identity providers, and a PostgreSQL path with local bearer authentication. A separate disposable PostgreSQL job exercised database roles, transactions and tenant row-level security. [Verification scope and limitations](EVIDENCE_AND_LIMITS.md).

**بالعربية.** يصل اقتراح الوكيل إلى البوابة مع هوية المستخدم والمهمة التي سمح بها الخادم. يسجّل النظام تقييم Blue للاستدلال. إذا تعارض الإغلاق مع مهمة التلخيص، تبقى التذكرة مفتوحة. وإذا كان الإغلاق ضمن المهمة، يلزم مراجع مستقل ويتحقق الخادم مجددًا من الطلب وحالة التذكرة قبل التغيير. [الصفحة العربية](../README_AR.md).

## Policy gateway and operating evidence

In the enterprise exercise the authenticated service used an organization-scoped tool grant. A permitted read crossed a TLS connection to a separate local process. The gateway refused a change lacking its grant, and one valid human approval advanced the synthetic ticket revision once. A replay returned HTTP 409. Follow its separate diagram through the human decision, transaction and scoped read-back. [Enterprise architecture and the executed pilot](LOCAL_PILOT.md) · [مخطط المعمارية وتجربة المؤسستين](LOCAL_PILOT_AR.md)
