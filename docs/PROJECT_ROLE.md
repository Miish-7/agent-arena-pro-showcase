# Engineering decisions | القرارات الهندسية

Project by Meshal Almasoudi & Fahad Mubarak

The project owner defined the goals, coordinated development, participated in testing and authorized the scope of the historical, synthetic GitHub-to-Groq trial. Project credit is shared. Specific individual implementation roles have not been assigned.

| Decision | Reason | Evidence |
| --- | --- | --- |
| Put authorization in the tool gateway | A model can suggest a change. The caller’s identity, organization and tool grant determine whether it proceeds. | [Architecture](ARCHITECTURE.md) |
| Bind a sensitive approval to one action | The reviewer approves a particular change. Reusing the approval returned HTTP 409 in the isolated exercise. | [Two-organization pilot](LOCAL_PILOT.md) |
| Show the detector’s mistake | One benign item triggered a lexical indicator. A detector result and a tool decision answer different questions. | [Benchmark scope](EVIDENCE_AND_LIMITS.md) |

## بالعربية

حدّد صاحب المشروع الأهداف ونسّق التطوير وشارك في الاختبارات والاعتماد. وراجع التذكرة الاصطناعية العامة قبل تفويض تجربة القراءة والتلخيص المحدودة. يُنسب المشروع إلى المطورين معًا.

تتحقق بوابة الأدوات من الهوية ونطاق المؤسسة قبل التنفيذ. ترتبط الموافقة بتغيير محدد وتُرفض محاولة إعادة استخدامها. يعرض تقرير الاختبار أيضًا إنذارًا لغويًا خاطئًا حتى يمكن التمييز بين تقييم النص وقرار التفويض. [التجربة بالعربية](LOCAL_PILOT_AR.md)
