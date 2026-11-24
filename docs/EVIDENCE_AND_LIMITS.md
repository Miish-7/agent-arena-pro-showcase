# Evidence and limits | الأدلة وحدودها

**761 distinct Python cases passed on merged main on 24 November 2026** — 728 shared cases plus 33 dedicated PostgreSQL cases. [English field notes](https://miish-7.github.io/agent-arena-pro-showcase/notes/#verification) · [ملخص التحقق بالعربية](https://miish-7.github.io/agent-arena-pro-showcase/ar/notes/#verification).

## Hosted verification · 24 November 2026

The private source project's GitHub Actions workflow completed successfully on the final merged private application revision (main, 24 November 2026). The dashboard tests and offline benchmark ran as steps within the Python jobs. This redacted summary records what each check actually measured. The original CI logs require private repository access.

| Check | Recorded result | Interpretation |
|---|---|---|
| Python 3.12, default SQLite path | 728 passed, 33 skipped, 1 warning | The skips were the PostgreSQL-only cases. The warning concerned the Starlette/httpx test client. |
| Python 3.13, default SQLite path | 728 passed, the same 33 skipped, 1 warning | Repeated coverage on a second interpreter, with the same warning. |
| Dedicated PostgreSQL 17.12 job | 33 passed, 0 failed, 0 skipped | The 33 cases ran against a real disposable database. They exercised role permissions, transactions and tenant row-level security. |
| Node dashboard and API documentation tests | 13 passed | Simulated browser DOM, including delayed responses after logout or an account switch and documentation credential privacy. |
| Offline benchmark | 9 fixed synthetic cases, 0 provider calls, 0 unauthorized synthetic writes | The lexical indicator recorded 5 true positives, 1 false positive, 0 false negatives and 3 true negatives. A benign note quoting a warning triggered the false positive. |

**The illustrated fixture.** Local code supplied the `DEMO-102` proposal and the Blue assessment. The application's gateway denied the close during a summary task. The image shows zero real LLM roles. Nine curated inputs give limited evidence about unfamiliar inputs or live models. [See the actual screenshots](DEMO.md).

## Authorized live summary · 21 November 2026

| Observation from the retained records | Result |
|---|---|
| Retrieval | One anonymous GitHub GET of public synthetic issue #1, HTTP 200. |
| Transfer and response | One Groq completion using `openai/gpt-oss-20b`, HTTP 200, with only the bounded issue title and body as issue content. |
| Authorization and integrity | Read and outbound transfer were allowed. Both audit outcomes recorded success. The input SHA-256 matched across the two records. |
| External changes | Zero GitHub writes recorded. |

This was one authorized, read-only summary. The matching digest establishes which issue input was supplied. The retained metadata omits the summary text, so an independent reviewer cannot score the answer's accuracy from this record. The trial did not exercise the security scenario shown in the screenshots.

## What remains unverified

Production identity-provider interoperability, combined PostgreSQL and SSO operation under production conditions, deployment controls, recovery and independently retained audit records require further validation. The RLS tests assume a trusted application database role and migration owner. The project makes no claim of independent security certification or enterprise production readiness.

**للقارئ العربي.** بلغ الإجمالي المميّز 761 حالة Python. نجحت 728 حالة على كل إصدار من Python، وتكررت المجموعة نفسها. وشغّلت المهمة المستقلة حالات PostgreSQL الـ33 كلها بنجاح. الصور توثّق قرار البوابة في محاكاة محلية حتمية. أما رمزا HTTP 200 فيخصّان تجربة تلخيص واحدة مصرحًا بها. السجلات الأصلية خاصة، والأرقام هنا مؤرخة ومحددة النطاق. [الصفحة العربية](../README_AR.md).

## Final application acceptance · 24 November 2026

The merged revision was verified on `main`: three hosted jobs succeeded, with 728 passing cases on each Python version and 33 PostgreSQL-only cases passing in a separate job. Node reported 13 passed, 0 failed. Automated code and security reviews on the identical submitted tree reported no major code or security findings; this is not a third-party penetration test. Local chain validation detects inconsistencies within its trust assumptions; it is not independent immutable retention. RLS does not protect against privileged database roles or arbitrary SQL able to forge tenant context.


## Final documentation and dependency review

The final private application self-hosts its API documentation under CSP and includes a dependency inventory (SBOM). Automated reviews on the submitted tree reported no findings; this is not independent certification. An advisory in the ReDoc upstream build dependency tree remains under observation: no browser execution path was demonstrated, but incomplete source-map coverage prevents ruling it out. Keep ReDoc away from public exposure and resolve applicability before production use. Branch protection is not enforced on the private main branch. The public showcase is static and does not serve the private application or ReDoc.

**بالعربية.** يقدّم التطبيق الخاص توثيق API محليًا تحت سياسة CSP وجردًا للاعتماديات. يبقى تنبيه في شجرة بناء ReDoc تحت المتابعة، ولم يُحسم مدى قابلية التأثر. لا يُعرّض ReDoc للعامة قبل حسمها. ولا تمثل المراجعات الآلية اعتمادًا أمنيًا مستقلًا؛ حماية فرع main غير مفروضة حاليًا. موقع العرض ثابت ولا يشغّل التطبيق الخاص أو ReDoc.
