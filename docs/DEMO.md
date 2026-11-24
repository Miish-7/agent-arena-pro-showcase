# Recorded fixture walkthrough | جولة في الاختبار المحلي

## Redesigned interface · 22 November 2026

All three captures are from the actual local application with synthetic fixture data. No external provider was enabled in the illustrated runs. The three images below are rectangular crops from the supplied captures. Cropping removes the previous corner mark, the account header and, in the evidence image, the rows of run identifiers. Every displayed interface pixel is retained from its capture.

![Overview: 4 runs, 2 allowed reads, 1 policy block, 1 pending approval.](../assets/dashboard-new.png)

![Arabic test lab: unauthorized closure blocked, zero actual model responses.](../assets/blocked-new.png)

![Evidence timeline: six recorded events and local verification.](../assets/evidence-new.png)

The owner ran the unauthorized-closure scenario and checked the updated overview and timeline. Local chain verification is not independent immutable audit storage.

## Earlier interface · historical approval evidence

These earlier fixture captures document the approval sequence, not a new live test on the redesigned interface.

![The gateway rejects the proposed close as DENIED_SCOPE_ESCALATION.](../assets/scope-denied.png)

![The in-scope close remains PENDING_APPROVAL even with a favorable Blue assessment.](../assets/approval-pending.png)

![The synthetic ticket is CLOSED after independent approval.](../assets/ticket-closed.png)

The local gateway, not the model, determined whether an action could execute. [Case study](CASE_STUDY.md) · [Evidence and limits](EVIDENCE_AND_LIMITS.md).

**بالعربية:** اقتُصّت الصور الثلاث الأولى من لقطات لوحة التحكم الجديدة في 22 نوفمبر 2026. الصور الثلاث التالية من الواجهة السابقة وتوضح تسلسل الموافقة البشرية. جميعها محاكاة اصطناعية وليست اختبارات هجوم بمزوّد حي.
