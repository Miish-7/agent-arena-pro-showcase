# Verify a ticket decision trail

A support agent attempted to close synthetic ticket DEMO-102. A read-only account received DENY. A service account with the close grant received REQUIRE_APPROVAL. The test then approved the request through a separately authenticated reviewer account. The ticket advanced from OPEN at revision 0 to CLOSED at revision 1.

Download [the three records](records.json), [the checkpoint](checkpoint.json) and [the verifier](verify.py) into one folder. With Python 3.10 or newer, run the command below. It reads the two JSON files beside the script and prints the final SHA-256 digest. No package installation or network is required.

```console
python -I -B verify.py 7a39b96effd1d75e8f10fe2f41c83d52b2fe5cc283652e04aacb495a72b76245
```

Each digest covers the previous digest, the sequence number and a restricted set of API response fields. The projection omits account identifiers, credentials and private audit records. A separate test checked the application's native audit chain, observed HTTP 409 on replay and HTTP 404 from the second organization. On its own, the verifier can check only the public sample. Authenticating its origin requires a trusted copy of the final digest. A party able to replace both the sample and its checkpoint can construct a different consistent chain.

## التحقق من عينة التذكرة

رفضت البوابة إغلاق التذكرة من حساب مخوّل بالقراءة فقط. بقي طلب الإغلاق من الحساب المخوّل معلّقًا حتى استخدمت أتمتة الاختبار حساب مراجع مستقل للموافقة. انتقلت التذكرة بعدها من مفتوحة عند المراجعة 0 إلى مغلقة عند المراجعة 1.

نزّل الملفات الثلاثة في مجلد واحد وشغّل الأمر أعلاه. يتحقق البرنامج محليًا من ترتيب القرارات وترابط البصمات والأثر المسجّل في العينة. للتحقق من مصدر العينة، قارن البصمة النهائية بنسخة حصلت عليها من جهة تثق بها. لا تحتوي العينة على سجل التطبيق الخاص أو هويات الحسابات.

