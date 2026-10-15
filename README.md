# بازرگانی سهیل — سایت شوروم

Next.js 16 · TypeScript · Tailwind 4 · SQLite (Drizzle) · sharp · Fuse.js

## اجرای محلی (Node 22، یا داخل Docker)

```bash
npm install
cp .env.example .env.local
node scripts/hash-password.mjs "یک-رمز-طولانی"   # خروجی را در .env.local بگذارید
openssl rand -hex 32                              # مقدار SESSION_SECRET
npm run dev
```

- سایت: http://localhost:3000 (به‌صورت خودکار به `/fa` می‌رود؛ انگلیسی: `/en`)
- پنل: http://localhost:3000/admin (محصولات و پروژه‌ها)
- دیتابیس و عکس‌ها در `data/` ذخیره می‌شوند (در git نیستند؛ جداگانه بکاپ بگیرید).

داخل Docker (اگر Node 22 روی ماشین نیست):

```bash
docker run --rm -it -p 3000:3000 -v "$PWD":/app -w /app --env-file .env.local \
  node:22-bookworm bash -c "npm install && npm run dev -- -H 0.0.0.0"
```

> اگر سایت را با IP شبکه (مثلاً از گوشی) باز می‌کنید: در حالت dev، IPهای خصوصی (`192.168.*`, `10.*`, `172.*`)
> مجازند. برای IP/دامنه دیگر در `.env.local` بنویسید `DEV_ORIGINS=host1,host2`.
> بدون این مجوز صفحه هیدریت نمی‌شود (منو، زوم و فیلتر کار نمی‌کنند).

## چیزهایی که باید ویرایش کنید

| چه چیزی | کجا |
|---|---|
| تلفن، ایمیل، سال سابقه، آدرس و لینک گوگل‌مپ **دفتر مرکزی و انبار** | `src/config/site.ts` |
| متن‌های فارسی / انگلیسی سایت | `src/i18n/fa.ts` و `src/i18n/en.ts` |
| لوگو (PNG شفاف) | `public/logo.png` ← بعد `npm run icons` |
| آدرس دامنه نهایی | `SITE_URL` در env (canonical، sitemap، OG) |

## ساخت نسخه نهایی (روی ماشین هم‌معماری با سرور)

```bash
docker build --target export --output type=local,dest=./deploy -f Dockerfile.build .
```

روی سرور فقط Node.js 22 لازم است:

```bash
HOSTNAME=127.0.0.1 PORT=3000 DATA_DIR=/var/lib/soheil SITE_URL=https://your-domain.ir \
SESSION_SECRET=... ADMIN_PASSWORD_HASH='scrypt:...' node server.js
```

پشت Nginx/Caddy با SSL؛ هدرهای Host و X-Forwarded-* را پاس بدهید.

## PWA (نصب روی موبایل و کار آفلاین)

Service worker فقط در **نسخه production** و فقط روی **HTTPS** (یا `localhost`) ثبت می‌شود. پس در `npm run dev` یا
با `http://192.168...` آفلاین کار نمی‌کند. بعد از استقرار با SSL: سایت را در Safari/Chrome باز کنید، چند صفحه را
ببینید، «Add to Home Screen» بزنید و بعد حالت پرواز را امتحان کنید. صفحه‌هایی که قبلاً دیده‌اید آفلاین باز می‌شوند.

## Git

`.gitignore` شامل `.env*` (به‌جز `.env.example`)، `data/`، `*.db`، `node_modules`، `.next` و `deploy` است.
قبل از commit با `git status` مطمئن شوید `.env.local` و `data/` در لیست نیستند.
