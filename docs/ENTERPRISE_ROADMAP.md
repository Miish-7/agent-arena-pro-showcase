# AGENT//ARENA · Isolated evaluation roadmap | خارطة التقييم المؤسسي

[English](#english) · [العربية](#العربية)

## English

The engineering release has already exercised two synthetic organizations, a local TLS connector, one independent approval and a local restore. This roadmap sets out what an organization would still need to test in its own installation before wider use. [Executed pilot](LOCAL_PILOT.md)

### Expand the fixture corpus

Label benign and adversarial synthetic inputs before evaluation. Report false alarms, missed signals and unauthorized state changes separately.

### Evaluate live models under consent

Agree on the provider, synthetic fields, call limit, budget and quality rubric. Retain a redacted record of inputs, costs and outcomes for each authorized trial.

### Pilot one scoped connector

Use an isolated service and the minimum permissions for one workflow. Demonstrate revocation, upstream failure and safe handling of duplicate requests.

### Validate SSO with PostgreSQL

Exercise both together in a production-like topology. Check identity mapping, tenant boundaries, session expiry and revocation across the database and application.

### Retain evidence independently

Define external retention, independent integrity checkpoints, key ownership and incident procedures. Show how a reviewer would verify a retained record.

### Measure load and failure behavior

Agree on service targets and a workload first. Measure throughput, latency, backpressure and recovery under controlled failure.

### Restore a backup

Restore into a separate system. Verify recovered data and evidence integrity, then compare measured downtime and data loss with the agreed recovery objectives.

### Commission an independent assessment

Agree on written scope and authorization. Have an independent assessor review the deployed configuration and verify remediation before wider use.

### Review privacy and compliance

Work with the organization that owns the data to document residency, retention, access, review obligations and the approvals required for that deployment.

## العربية

شملت النسخة الهندسية مؤسستين اصطناعيتين وموصّل TLS محليًا وموافقة مستقلة واستعادة محلية. تحدد هذه الخارطة ما يبقى على الجهة التحقق منه في بيئتها قبل توسيع الاستخدام. [التجربة المنفّذة](LOCAL_PILOT_AR.md)

### توسيع مجموعة التجارب الحتمية

صنّف المدخلات الاصطناعية السليمة والمضلّلة قبل التقييم. أبلغ عن الإنذارات الكاذبة والإشارات الفائتة والتغييرات غير المصرّح بها كلًّا على حدة.

### تقييم النماذج الحية بتفويض

اتفق على المزوّد والحقول الاصطناعية وحدّ الاستدعاءات والميزانية ومعيار الجودة. احتفظ بسجل منقّح للمدخلات والتكاليف والنتائج لكل تجربة مصرّح بها.

### تجربة موصّل محدود الصلاحيات

استخدم خدمة معزولة وأضيق صلاحيات تكفي لإجراء واحد. تحقّق من إلغاء الإذن وتعطّل المزوّد والتعامل الآمن مع الطلبات المكررة.

### التحقق من SSO مع PostgreSQL

اختبرهما معًا في بنية مماثلة للإنتاج. افحص ربط الهوية وحدود المؤسسات وانتهاء الجلسة وإلغاءها في قاعدة البيانات والتطبيق.

### حفظ الأدلة باستقلالية

حدّد جهة الاحتفاظ الخارجية ونقاط تحقق مستقلة وملكية المفاتيح وإجراءات الحوادث. بيّن كيف يتحقق المراجع من سجل محفوظ.

### قياس سلوك النظام تحت الحمل والتعطّل

اتفق أولًا على أهداف الخدمة والحمل التجريبي. قِس الإنتاجية وزمن الاستجابة والتعامل مع ضغط الطلبات والتعافي عند تعطل مضبوط.

### اختبار استعادة نسخة احتياطية

استعد النسخة في نظام منفصل. تحقّق من البيانات المستعادة وسلامة الأدلة، وقارن مدة الانقطاع وفقد البيانات بأهداف التعافي المتفق عليها.

### تكليف جهة مستقلة بالتقييم

اتفق على نطاق مكتوب وتفويض محدد. كلّف جهة مستقلة بفحص إعدادات بيئة التشغيل والتحقق من معالجة الملاحظات قبل توسيع الاستخدام.

### مراجعة الخصوصية والامتثال

وثّق مع الجهة المالكة للبيانات متطلبات موقع البيانات والاحتفاظ والصلاحيات والتزامات المراجعة والموافقات اللازمة لذلك التشغيل.

[English field notes](../notes/index.html#roadmap) · [الملاحظات العربية](../ar/notes/index.html#roadmap) · [Evidence and limits](EVIDENCE_AND_LIMITS.md)
