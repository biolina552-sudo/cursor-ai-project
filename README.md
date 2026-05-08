# AI Marketing Video Studio

أداة ويب بسيطة لإنشاء فيديوهات تسويقية بالذكاء الاصطناعي باستخدام D-ID API.
لا تستخدم Next.js أو أي حزم Node؛ فقط:

- `index.html`
- `styles.css`
- `script.js`
- `server.py`

## المزايا

- بطاقات اختيار الأفاتار من عدة شخصيات AI.
- رفع صورة المنتج ومعاينتها داخل الواجهة.
- حقل وصف المنتج.
- اختيار اللغة: دارجة مغربية، خليجية، إنجليزية، فرنسية.
- زر توليد فيديو عبر خادم Python يتكامل مع D-ID API.
- معاينة وتحميل الفيديو الناتج.
- تصميم عصري بالبنفسجي والأسود.

## التشغيل

```bash
python3 server.py
```

ثم افتح:

```text
http://localhost:8000
```

## مفتاح D-ID

الخادم يحتوي على مفتاح تجريبي افتراضي:

```text
demo_username:demo_password
```

هذا مجرد placeholder لتسهيل التجربة. للتوليد الحقيقي، شغّل الخادم بمفتاح D-ID
صالح:

```bash
D_ID_API_KEY="username:password" python3 server.py
```

أو إذا كان المفتاح لديك جاهزًا بصيغة Basic:

```bash
D_ID_API_KEY="Basic your_encoded_key" python3 server.py
```