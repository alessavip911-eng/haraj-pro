
# Haraj Pro — نسخة مطوّرة صالحة للإنتاج (Starter)

منصة إعلانات مبوّبة احترافية مع بنية إنتاجية جاهزة: API آمن + قاعدة بيانات + تخزين صور + واجهة Next.js + Nginx + Docker.

## المكوّنات
- **API**: Node.js + TypeScript + Express + Prisma (PostgreSQL)، JWT (وصول/تجديد)، Argon2، Helmet، Rate limit، Zod، Swagger.
- **قاعدة بيانات**: PostgreSQL.
- **Redis**: للتخزين المؤقت والـ rate limit وتبنيد رموز التجديد.
- **التخزين**: MinIO (متوافق S3) لرفع الصور.
- **الواجهة**: Next.js 14 ( صفحات: الرئيسية / التفاصيل / إضافة إعلان ).
- **الوكيل**: Nginx عكسي لتجميع الخدمات.
- **حاويات**: Docker Compose لتشغيل البيئة بالكامل.

## التشغيل السريع (محلي)
```bash
# من جذر المشروع
cp .env.example .env.example  # (قيم افتراضية مناسبة محليًا)
docker compose up -d --build

# انتظر الخدمات
# تهيئة قاعدة البيانات:
docker compose exec api npx prisma migrate deploy
docker compose exec api node dist/src/seed.js || docker compose exec api npm run seed

# التصفّح:
# واجهة المستخدم:   http://localhost
# واجهة API:        http://localhost/api
# وثائق API:        http://localhost/docs
# MinIO Console:    http://localhost:9001  (user/pass في .env.example)
```

> ملاحظة: في بيئة إنتاج حقيقية، غيّر الأسرار في `.env` وفعّل HTTPS أمام Nginx (أو استخدم Cloudflare/ALB).

## ميزات أمنية/إنتاجية
- تشفير كلمات المرور Argon2.
- توكن وصول قصير وتجديد طويل مع تبنيد refresh عند تسجيل الخروج.
- تحديد معدل الطلبات (rate limit) وHelmet وCORS مضبوط.
- فحص مدخلات Zod، وتسجيل (pino) مع `/health`.
- صفحات Next.js قابلة للنشر منفصلة أو خلف Nginx.

## خارطة تطوير لاحقة
- رفع صور حقيقي إلى MinIO عبر مسارات موقعة (presigned URLs) + ضغط الصور.
- نظام محادثات ورسائل، بلاغات، تقييمات.
- صلاحيات الإدارة ولوحة تحكم.
- فهرسة بحث (Meilisearch/Elastic).
- تتبع أداء (APM) ومراقبة (Prometheus/Grafana).
