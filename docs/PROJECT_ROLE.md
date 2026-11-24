# Project role and engineering decisions | المساهمة والقرارات الهندسية

Developed by Meshal Almasoudi & Fahad Mubarak

<p dir="rtl" lang="ar">تم تطوير المشروع بواسطة <bdi dir="ltr" lang="en">Meshal Almasoudi &amp; Fahad Mubarak</bdi></p>

Individual engineering tasks have not been attributed to either named developer. The roles below reflect the owner-confirmed project process.

| Contributor | Contribution |
|---|---|
| Project owner | Defined the goals, coordinated development and participated in testing and approval decisions. For the live trial, the owner checked that the issue was public and synthetic, and authorized one read and one Groq summary. |
| ChatGPT | Assisted with planning, analysis of design trade-offs, review and explanations. |
| Codex | Implemented substantial parts of the application and regression tests, ran verification and prepared documentation and review packages. |

## Decisions you can inspect

**Who authorizes a tool action?** The authenticated task sets the scope. The Target proposes an action. The gateway checks whether the task permits it. The synthetic ticket's text and Blue's assessment cannot expand that scope. [Architecture diagram](ARCHITECTURE.md).

**Why require a second reviewer for a close?** A permitted close can still change state. Binding approval to the payload, expiry and current ticket revision gives the server a way to reject a stale decision before it changes the ticket. The case study shows both the waiting state and the eventual result. [Case study](CASE_STUDY.md).

**Why report the false positive?** A benign quoted warning triggered the lexical indicator in the fixed benchmark. Recording that error alongside the actual write count lets a reader evaluate detection and enforcement separately. [Measured outcomes](EVIDENCE_AND_LIMITS.md).

## بصوت صاحب المشروع

بصفتي صاحب المشروع، حدّدت الأهداف ونسّقت التطوير وشاركت في الاختبارات والاعتماد. قبل تجربة التكامل راجعت التذكرة الاصطناعية وحدّدت نطاق موافقتي بقراءة واحدة وتلخيص واحد. ساعدني ChatGPT في التخطيط والتحليل والمراجعة، ونفّذ Codex أجزاء كبيرة من الشيفرة والاختبارات وساعد في التحقق والتوثيق. [الصفحة العربية](../README_AR.md).
