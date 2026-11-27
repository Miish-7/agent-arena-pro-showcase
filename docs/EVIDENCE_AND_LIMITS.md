# Evidence and limits | الأدلة وحدودها

The enterprise candidate and the earlier merged research release were tested on different revisions. The figures below retain their dates and scope. The downloadable JSON contains redacted observations. Source code, credentials and raw hosted logs stay private.

## Verification on 27 November 2026

| Scope | Python | Node | Evidence |
| --- | --- | --- | --- |
| Hosted Linux · 42280e1 | 966 general plus 37 PostgreSQL 17.12 cases, 1,003 distinct | 20 passed | Four of eight jobs passed per event. The four open security gates remained visible. |
| Hosted Linux · 686f29d | 967 general plus 37 PostgreSQL 17.12, 1,004 distinct | 24 passed | Four of eight jobs passed per event. The tested container image matched the scanned image within each run. The four security gates remained open. |
| Local Windows · 686f29d | 967 general plus 37 PostgreSQL 17.12 cases, 1,004 distinct | 24 passed | Chrome in English and Arabic discarded late responses when the reviewer changed selections, filters, session or view. Journal recovery confirmed one receipt per authorized action. |

Each general suite ran on Python 3.12 and 3.13. The dedicated database gate passed all named cases with zero skips. The offline benchmark used nine synthetic cases and zero provider calls. The local exercise used independent synthetic organizations and an automated reviewer account. The existing films record an earlier isolated session. The hosted test matrix and the local browser comparison used the same source tree. [Release observations](ENTERPRISE_RESULTS.json)

## التحقق يوم 27 نوفمبر 2026

اجتاز الالتزام المستضاف 42280e1 على Linux عدد 1003 حالات Python مميزة و20 اختبار Node. بقيت أربع بوابات أمنية مفتوحة من ثماني وظائف. اجتاز الالتزام 686f29d على Linux المستضاف وWindows المحلي 1004 حالات Python مميزة و24 اختبار Node في كل بيئة. وأكد اختبار مستقل على Chrome محليًا بالعربية والإنجليزية صحة عرض أحداث التدقيق المتأخرة واستعادة إيصال التسليم. اجتازت الحالات المخصصة لقاعدة PostgreSQL 17.12 بوابتها دون تخطٍّ. سجل المعيار الحتمي تسع حالات ببيانات اصطناعية وصفر استدعاءات لنموذج. يظهر في الأفلام تسجيل سابق من المختبر.

## Hosted revision 264cfe5 · 25 November 2026

| Check | Recorded outcome |
| --- | --- |
| Python 3.12 and 3.13 | 928 general cases passed on each interpreter. The suite was repeated for compatibility. |
| Real PostgreSQL 17.12 | 37 additional cases passed, zero failed, zero skipped. **965 distinct Python cases** across the general and dedicated sets. |
| Node and fixed benchmark | 17 Node cases passed. Nine synthetic scenarios made zero model calls. The lexical indicator produced 5 true positives, 1 false positive, 0 false negatives and 3 true negatives. |
| Security gates | Five of eight hosted jobs passed. The open gates concerned tooling static analysis, dependency advisories and container vulnerabilities. |
| Two synthetic organizations | The permitted TLS read succeeded. Denial left the ticket revision untouched. An approved close advanced its revision once. Replaying that approval returned HTTP 409. Requests for the other organization’s protected record returned HTTP 404. Connector unavailability returned HTTP 503. The restored audit history passed local verification. |
| Report integrity | In the pending and approved states, an independently computed action digest matched the scoped PDF, JSON and recorded decision. The detailed reviewer identity is available through authorized JSON and audit records. |

<a id="what-remains-unverified"></a>

These observations describe the engineering candidate tested in isolation. A claim of production qualification would require closing the security gates and validating the deployed environment, including real identity operations, independent retention, recovery and agreed service targets. [Enterprise results](ENTERPRISE_RESULTS.json) · [Recorded exercise](LOCAL_PILOT.md) · [التجربة بالعربية](LOCAL_PILOT_AR.md)

<a id="final-application-acceptance--24-november-2026"></a>

## Hosted verification · 24 November 2026

The earlier merged research release passed **761 distinct Python cases**. The shared set of 728 passed on each of Python 3.12 and 3.13 with one Starlette/httpx test-client warning per runner. The 33 PostgreSQL-only cases, skipped on those two general jobs, all passed on a separate PostgreSQL 17.12 server. Its Node suite passed 13 cases. Its nine synthetic scenarios recorded zero provider calls and zero unauthorized writes. [Dated merged-release results](VERIFICATION_SUMMARY.json)

<a id="final-documentation-and-dependency-review"></a>

The dated merged-release summary records a ReDoc build-dependency advisory under observation. The enterprise candidate has its own security results in the table above. [Historical verification record](VERIFICATION_SUMMARY.json)

## Authorized live summary · 21 November 2026

| Observation | Retained evidence |
| --- | --- |
| Retrieval | One anonymous GitHub GET of public synthetic issue #1, HTTP 200. |
| Transfer | One Groq completion using `openai/gpt-oss-20b`, HTTP 200. The only issue fields transferred were the bounded title and body. |
| Authorization and integrity | Local read and egress decisions allowed the transfer. Both audit outcomes recorded success. The same SHA-256 identifies the input in both records. |
| Remote effect | Zero GitHub writes recorded. |

This single read and summary demonstrated connectivity for the authorized public input. The retained record omits the full output, so an external reviewer cannot independently score its accuracy. The separate `DEMO-102` security example used fixed proposals and made no live model call. A lexical warning on one benign fixture illustrates the limits of the small offline benchmark. [Fixture case](CASE_STUDY.md) · [Product captures](DEMO.md)

## للقارئ العربي

في 25 نوفمبر 2026 كان إجمالي النسخة المؤسسية المرشحة 965 حالة Python مميّزة، منها 37 على PostgreSQL حقيقي. نجحت 17 حالة Node. اجتازت 5 مهام مستضافة من أصل 8. بقيت نتائج التحليل الساكن للأدوات وتنبيهات الاعتماديات وفحص الحاوية مفتوحة. في تجربة المؤسستين بقيت التذكرة دون تغيير بعد الرفض، ونُفّذ الإغلاق مرة واحدة بعد موافقة مستقلة، ثم أعاد تكرار الموافقة HTTP 409.

تعود الحالات الـ761 إلى الإصدار البحثي المدمج في اليوم السابق. وتعود استجابتا HTTP 200 إلى تجربة الاتصال المخوّلة بتاريخ 21 نوفمبر، حيث قُرئت تذكرة GitHub اصطناعية واحدة وأرسل طلب تلخيص واحد إلى Groq. أما الحالة المصوّرة والسيناريوهات التسعة فاستخدمت مقترحات حتمية. [دليل الإصدار](ENTERPRISE_RESULTS.json) · [دليل القارئ العربي](../README_AR.md)

## 26 November · Local technical qualification

[Recorded boundary and observed results](../evidence/index.html#qualification) · [الأدلة بالعربية](../ar/evidence/index.html#qualification) · [Redacted JSON](TECHNICAL_QUALIFICATION.json)

[Download the records and run the offline verifier](decision-sample/README.md).
