# Masfeeh – পরের ধাপ (সাইট ডিপ্লয় হয়ে গেছে, এখন লাইভ ব্যবসার জন্য তৈরি করা)

**বর্তমান অবস্থা:** সাইট Vercel-এ লাইভ, Supabase DB কাজ করছে, Facebook পেজের সাথে লিংক করা আছে।
**লক্ষ্য:** সত্যিকারের অর্ডার নেওয়া, গুগলে খুঁজে পাওয়া, দ্রুত লোড হওয়া, একটা নিজস্ব ডোমেইন।

---

## ধাপ ১ – আসল প্রোডাক্ট ও দাম আপলোড (সবার আগে)

`/admin` থেকে করুন। এটাই সাইটের আসল ভিত্তি।

- [ ] ডেমো প্রোডাক্ট (`demo-*`) ও স্যাম্পল অর্ডার মুছুন।
- [ ] প্রতিটি প্রোডাক্টে: নাম, ক্যাটাগরি, **আসল দাম**, ছাড় থাকলে original price, **stock সংখ্যা**, বর্ণনা, features।
- [ ] ছবি: প্রতি প্রোডাক্টে ৩–৫টা (সর্বোচ্চ ৮টা)। **আপলোডের আগে ছোট করুন**: চওড়া ~1200px, WebP বা JPG, প্রতিটি ১৫০–২৫০ KB এর নিচে (squoosh.app দিয়ে হবে)।
- [ ] ডেলিভারি চার্জ ঠিক আছে কিনা দেখুন (ঢাকার ভেতরে ৳70, বাইরে ৳130) – Admin → Settings।
- [ ] ফোন/WhatsApp নম্বর, ঠিকানা, Facebook ও Instagram লিংক Settings-এ দিন।

---

## ধাপ ২ – ইমেইল চালু করা (অর্ডার নোটিফিকেশন)

এখন ইমেইল সম্ভবত "simulated" মোডে আছে, মানে আসলে যায় না।

1. যে Gmail থেকে পাঠাবেন সেখানে **2-Step Verification** চালু করুন।
2. https://myaccount.google.com/apppasswords থেকে **16 অক্ষরের App Password** বানান।
3. **Vercel → Project → Settings → Environment Variables**-এ দিন (সাইটের Settings পেজে পাসওয়ার্ড না রাখাই নিরাপদ, কারণ ওটা ডাটাবেসে সাধারণ টেক্সটে থাকে):
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_SECURE=false`
   - `SMTP_USER=আপনার gmail`
   - `SMTP_PASS=16-অক্ষরের পাসওয়ার্ড`
   - `SMTP_SENDER_NAME=Masfeeh`
   - `OWNER_EMAIL=যে ইমেইলে অর্ডার আসবে`
4. **Redeploy** দিন (env পরিবর্তনের পর নতুন deploy লাগে)।
5. Admin → Settings → **Send Test Email** চাপুন, ইনবক্স ও **Spam** ফোল্ডার দুটোই দেখুন।

**পরে (ডোমেইন কেনার পর):** Gmail-এর বদলে **Resend** বা **Brevo** (ফ্রি প্ল্যান আছে) ব্যবহার করুন এবং ডোমেইনে SPF/DKIM সেট করুন। তাহলে ইমেইল spam-এ যাবে না।

> বর্তমান ফ্লো: কাস্টমার অর্ডার দিলে মালিক ইমেইল পায়, মালিক Accept করলে কাস্টমার ইমেইল পায়। কাস্টমার অর্ডার দেওয়ার সাথে সাথে "অর্ডার পেয়েছি" ইমেইল পায় না, এটা যোগ করা ভালো।

---

## ধাপ ২.৫ – ডেলিভারি স্ট্যাটাস আপডেট (তৈরি হয়েছে)

অ্যাডমিন → Orders → অর্ডার খুলুন → **Update delivery status** প্যানেল:

1. **Accept** দিন → কাস্টমার "Accepted" ইমেইল পায়।
2. কুরিয়ার বেছে নিন (Steadfast / Pathao / RedX / eCourier / Own delivery) ও **Tracking code** লিখুন।
3. চাইলে কাস্টমারের জন্য ছোট **নোট** লিখুন (যেমন "রাইডার বিকেলে ফোন করবে")।
4. **Mark Packaging → Mark Out for Delivery → Mark Delivered** (বা **Cancelled**) চাপুন।
   - প্রতিটি ধাপে কাস্টমারকে ইমেইল যায় (চেকবক্স খুলে বন্ধ করা যায়)।
   - **Delivered** করলে payment নিজে "Paid" হয়।
   - **Cancelled** করলে stock ফেরত আসে।
5. **WhatsApp update** বাটনে এক ট্যাপে কাস্টমারকে তৈরি মেসেজ পাঠান (নাম, স্ট্যাটাস, কুরিয়ার, কোড সহ)।
6. কাস্টমার **Track Order** পেজে টাইমলাইন, কুরিয়ার ও tracking code দেখে।

পরে: Steadfast/Pathao API দিয়ে অ্যাডমিন থেকেই পার্সেল বুক ও স্ট্যাটাস auto-sync।

> **ইমেইল সেটিংস নিয়ে সংশোধন:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `SMTP_SENDER_NAME`, `OWNER_EMAIL`, `OWNER_PHONE` এখন সার্ভার Vercel env থেকে পড়ে (আগে শুধু ডাটাবেসের Settings থেকে পড়ত)। env থাকলে সেটাই অগ্রাধিকার পায়। env দেওয়ার পর **Redeploy** করুন।

---

## ধাপ ৩ – পুরো অর্ডার ফ্লো টেস্ট (একটা আসল টেস্ট অর্ডার)

ফোন থেকে নিজে কাস্টমার সেজে করুন:

- [ ] প্রোডাক্ট খুলুন → কার্টে যোগ → কুপন `WELCOME10` → চেকআউট
- [ ] **COD** দিয়ে অর্ডার → সফল পেজ আসে?
- [ ] **bKash/Nagad** + TrxID দিয়ে আরেকটা অর্ডার
- [ ] মালিকের ইমেইলে নোটিফিকেশন এলো?
- [ ] Admin-এ অর্ডার দেখা যাচ্ছে? Accept করলে কাস্টমারের ইমেইলে গেল?
- [ ] স্ট্যাটাস বদলান (Packaging → Out for Delivery → Delivered) এবং **Track Order** পেজে অর্ডার ID/ফোন দিয়ে দেখুন
- [ ] Stock কমছে কিনা দেখুন
- [ ] টেস্ট অর্ডারগুলো মুছুন বা Cancelled করুন
- [ ] iPhone Safari ও Android Chrome, দুটোতেই করুন

**পেমেন্ট নিয়ে সিদ্ধান্ত:** এখন bKash/Nagad-এ কাস্টমার TrxID লেখে আর আপনি নিজে মিলিয়ে নেন। শুরুতে এটা চলবে। "Card" অপশনের পেছনে কোনো গেটওয়ে নেই, তাই গেটওয়ে (SSLCommerz / bKash API) না নেওয়া পর্যন্ত **Card অপশন লুকিয়ে রাখা উচিত**, নইলে কাস্টমার বিভ্রান্ত হবে।

---

## ধাপ ৪ – ডোমেইন কেনা ও সংযোগ

1. ডোমেইন কিনুন: `masfeeh.com` (বা `.com.bd`, যা পাওয়া যায়)। Namecheap / GoDaddy / Cloudflare Registrar, বা দেশীয় রেজিস্ট্রার।
2. **Vercel → Project → Settings → Domains → Add** করে ডোমেইন দিন।
3. Vercel যে DNS রেকর্ড দেখায় সেটা রেজিস্ট্রারে বসান:
   - Apex (`masfeeh.com`): **A record** → `76.76.21.21`
   - `www`: **CNAME** → Vercel যা দেখায় (সাধারণত `cname.vercel-dns.com`)
4. কয়েক মিনিট থেকে ২৪ ঘণ্টায় HTTPS নিজে থেকেই চালু হবে।
5. `www` → non-www (বা উল্টো) **একটাকে মূল** রাখুন, অন্যটা redirect করুন।
6. ডোমেইন চালু হলে এগুলো আপডেট করুন:
   - **Facebook পেজের Website লিংক** ও About
   - Instagram bio
   - `client/index.html`-এর `og:image` ও canonical (নিচে ধাপ ৫)
   - ইমেইলের sender (ধাপ ২)
7. সার্ভারে CORS শুধু আপনার ডোমেইনের জন্য সীমাবদ্ধ করুন।

---

## ধাপ ৫ – SEO (গুগলে সার্চ করলে আসার জন্য)

**সবচেয়ে বড় সমস্যা:** এখন সাইটে আলাদা প্রোডাক্ট URL নেই, শুধু `/` আর `/admin`। তাই গুগল প্রতিটি প্রোডাক্ট আলাদা করে ইনডেক্স করতে পারে না। এটা ঠিক না করলে SEO-র বড় অংশই কাজ করবে না।

### ৫.১ আসল URL যোগ করুন (সবচেয়ে গুরুত্বপূর্ণ)
`react-router-dom` যোগ করে:
- `/shop`, `/category/bags`, `/product/fiom-monogram-crossbody`
- `/about`, `/contact`, `/track`, `/policies/shipping`, `/policies/returns`, `/policies/privacy`
- প্রতিটি প্রোডাক্টের slug (নামভিত্তিক URL), যেমন `/product/golden-crest-crossbody`
- `vercel.json` আগে থেকেই unknown path `index.html`-এ পাঠায়, তাই হোস্টিংয়ে সমস্যা নেই।

### ৫.২ প্রতিটি পেজের নিজস্ব meta
- আলাদা `<title>` ও description (`react-helmet-async`)। যেমন: "FIOM Monogram Crossbody Bag – ঢাকায় ডেলিভারি | Masfeeh"
- **Open Graph ছবি absolute URL হতে হবে** (`https://yourdomain.com/assets/...`)। এখন `client/index.html`-এ relative path দেওয়া, ফলে Facebook/WhatsApp শেয়ারে ছবি নাও আসতে পারে।
- `<link rel="canonical">`।

### ৫.৩ প্রযুক্তিগত ফাইল
- `client/public/robots.txt` (`/admin` ও `/api` বাদ দিয়ে sitemap-এর লিংক সহ)
- `sitemap.xml` (সব প্রোডাক্ট ও ক্যাটাগরি, সার্ভার থেকে স্বয়ংক্রিয় বানানো যায়)
- **JSON-LD `Product` schema** (দাম, stock, ছবি), যাতে গুগলে দাম ও ছবি সহ দেখায়
- `LocalBusiness` schema (ঠিকানা, ফোন)

### ৫.৪ JavaScript-নির্ভরতার সমস্যা
এটা SPA, তাই গুগল JS রান করে কনটেন্ট দেখে। কাজ করে, কিন্তু ধীর এবং কম নির্ভরযোগ্য। দুটো পথ:
- **সহজ:** prerender (`vite-plugin-prerender` বা `vite-ssg`) দিয়ে প্রোডাক্ট পেজগুলো build-এর সময় HTML বানানো।
- **বড় পথ:** Next.js-এ মাইগ্রেট করা (এখনই দরকার নেই)।

### ৫.৫ গুগলকে জানানো
- **Google Search Console**-এ ডোমেইন যোগ করুন → DNS TXT দিয়ে verify → sitemap জমা দিন।
- **Google Business Profile** খুলুন (ঢাকা, Bashundhara R/A), যা লোকাল সার্চে বড় ভূমিকা রাখে।
- বাংলা ও ইংরেজি দুই ভাষার কীওয়ার্ড কনটেন্টে রাখুন: "ক্রসবডি ব্যাগ ঢাকা", "gold plated ring Bangladesh", "press on nails BD"।
- Facebook পেজ থেকে সাইটে লিংক দিন এবং পোস্টে প্রোডাক্ট লিংক শেয়ার করুন (backlink ও ট্রাফিক)।

> সময়: নতুন সাইট গুগলে র‍্যাংক করতে সাধারণত কয়েক সপ্তাহ থেকে কয়েক মাস লাগে। ধৈর্য দরকার।

---

## ধাপ ৬ – লোড টাইম / পারফরম্যান্স

এই মুহূর্তের অবস্থা: `client/public/assets` ফোল্ডার **৫.৩ MB**, আর ব্যানার/কভার ছবিগুলো প্রতিটি ~**700 KB**। মোবাইল ডেটায় এটা ধীর।

### ছবি (সবচেয়ে বড় লাভ)
- [ ] ব্যানার/কভার ছবি ১২০০–১৬০০px চওড়া ও **WebP**-এ কনভার্ট করুন (লক্ষ্য ≤ 150 KB)
- [ ] ডুপ্লিকেট ছবি সরান (`banner.jpg`, `banner_redesigned.jpg`, `masfeeh_cover_luxury.jpg` এর সাইজ হুবহু এক, সম্ভবত কপি)
- [ ] ব্যবহার না হওয়া ফাইল মুছুন (`bag_*`, `photo_grid_*`, `lookbook_*` যেগুলো সাইটে নেই)
- [ ] সব `<img>`-এ `loading="lazy"`, `width`/`height` (layout shift বন্ধ), এবং প্রথম ব্যানারে `fetchpriority="high"`
- [ ] প্রোডাক্ট কার্ডের জন্য ছোট thumbnail (~400px), বড় ছবি শুধু modal খুললে লোড
- [ ] Supabase Storage-এ আপলোডের আগে অটো-রিসাইজ/কম্প্রেস (admin আপলোডে `browser-image-compression` বা Supabase image transform)

### কোড ও নেটওয়ার্ক
- [ ] `npm run build` এর পর bundle সাইজ দেখুন; Admin ও Checkout কম্পোনেন্ট **lazy-load** (`React.lazy`) করুন, যাতে সাধারণ ভিজিটর `AdminDashboard.jsx` (১২০০+ লাইন) ডাউনলোড না করে
- [ ] `GET /api/products`-এ `Cache-Control` (যেমন `s-maxage=60, stale-while-revalidate`) যোগ করুন, Vercel edge cache করবে
- [ ] Vercel Function region Supabase-এর কাছাকাছি রাখুন (Singapore/Mumbai), নইলে প্রতিটি API কল ধীর
- [ ] ফন্ট: `font-display: swap`, শুধু দরকারি weight লোড
- [ ] Cloudflare (ফ্রি) সামনে বসানো যায়, বাংলাদেশে CDN গতি বাড়ায়

### মাপার টুল
- **PageSpeed Insights** (মোবাইল স্কোর), **Lighthouse**, **WebPageTest** (Mumbai/Singapore থেকে)
- লক্ষ্য: মোবাইলে Performance ≥ 85, LCP < 2.5s

---

## ধাপ ৭ – ব্যবসা ও ট্রাস্টের জন্য দরকারি আরও জিনিস

### বিশ্বাসযোগ্যতা (বাংলাদেশে অনলাইন শপের জন্য খুব জরুরি)
- [ ] Shipping, Return/Exchange, Privacy, Terms পেজ + ফুটারে লিংক
- [ ] Contact পেজ: ফোন, WhatsApp বাটন, ঠিকানা, ম্যাপ
- [ ] "About Masfeeh" ও কাস্টমার রিভিউ/ফটো
- [ ] ফ্লোটিং **WhatsApp / Messenger** বাটন (বাংলাদেশে অনেক কাস্টমার আগে মেসেজ করে নেয়)

### অর্ডার ম্যানেজমেন্ট
- [ ] কাস্টমারকে অর্ডার দেওয়ার সাথে সাথে কনফার্মেশন ইমেইল
- [ ] **ডুপ্লিকেট/ফেক অর্ডার** ঠেকাতে ফোন নম্বর ভ্যালিডেশন (`01XXXXXXXXX`)
- [ ] অ্যাডমিনে printable **invoice / packing slip**
- [ ] অর্ডার cancel/return স্ট্যাটাস
- [ ] stock শেষ হলে "Add to cart" বন্ধ ও "Sold out" ব্যাজ; একসাথে অনেকে অর্ডার করলে overselling ঠেকাতে stock কমানো একটা atomic SQL ফাংশনে

### ডেলিভারি
- [ ] কুরিয়ার (Pathao / Steadfast / RedX) ট্র্যাকিং কোড স্ট্যাটাসে যোগ ও কাস্টমারকে ইমেইল/SMS

### মার্কেটিং ও অ্যানালিটিক্স
- [ ] **Meta Pixel + Conversions API** (Facebook বিজ্ঞাপনের জন্য), Purchase ইভেন্ট সহ
- [ ] Google Analytics 4 বা Plausible
- [ ] Facebook Shop / Catalog-এ প্রোডাক্ট ফিড লিংক
- [ ] ডিসকাউন্ট কুপন ম্যানেজার (এখন কোডে হার্ড-কোডেড)

---

## ধাপ ৮ – নিরাপত্তা ও স্থায়িত্ব

- [ ] **ADMIN_SESSION_SECRET** একটা লম্বা র‍্যান্ডম মান দিন (Vercel env-এ)
- [ ] অ্যাডমিন পাসওয়ার্ড শক্ত করুন এবং `/admin` লগইনে rate limit আছে কিনা পুনরায় দেখুন
- [ ] কখনো চ্যাট/স্ক্রিনশট/গিটে শেয়ার হয়ে থাকলে Supabase **service-role key ও DB পাসওয়ার্ড বদলান**
- [ ] Supabase **RLS চালু** ও কোনো পাবলিক পলিসি নেই তা নিশ্চিত করুন (Security Advisor চালান)
- [ ] **ব্যাকআপ**: Supabase ডেইলি ব্যাকআপ (Pro) অথবা সাপ্তাহিক `pg_dump`
- [ ] **Uptime মনিটর** (UptimeRobot, `/api/health` এ) ও **Sentry** (এরর ট্র্যাকিং)
- [ ] Vercel-এ Preview ও Production env আলাদা রাখুন

---

## ধাপ ৯ – কোড পরিষ্কার-পরিচ্ছন্ন করা (সময় পেলে)

- রুটের অপ্রয়োজনীয় ফাইল সরান: `fetch_photos.py`, `download_fb_photos.py`, `update_photos.py`, `test_fb.py`, `create_redesigned_cover.py`, Facebook স্ক্রিনশট PDF/JPG, `extracted_assets/`
- `server/data/db.json` ও পুরোনো JSON-ভিত্তিক কোড সরান (এখন Supabase-ই একমাত্র সোর্স)
- `README.md` আপডেট করুন (এটা পুরোনো JSON ফ্লো ও হার্ড-কোডেড ইমেইল বর্ণনা করে)
- বেসিক টেস্ট: `pricing.js` (কুপন/শিপিং) ও `/api/orders`-এর জন্য, আর GitHub Actions-এ build + lint

---

## সুপারিশকৃত ক্রম (চেকলিস্ট)

**এই সপ্তাহে**
- [ ] ধাপ ১: আসল প্রোডাক্ট, দাম, ছোট করা ছবি
- [ ] ধাপ ২: ইমেইল পাসওয়ার্ড (Vercel env) + টেস্ট মেইল
- [ ] ধাপ ৩: ফোনে ফুল টেস্ট অর্ডার
- [ ] Card অপশন লুকানো

**এর পরের সপ্তাহে**
- [ ] ধাপ ৪: ডোমেইন কিনে Vercel-এ যুক্ত, Facebook-এ নতুন লিংক
- [ ] ধাপ ৬: ছবি কম্প্রেশন + lazy-load (দ্রুত বড় লাভ)
- [ ] policy/contact পেজ + WhatsApp বাটন

**তার পরে (প্রথম মাসে)**
- [ ] ধাপ ৫: আসল URL/routing, meta, sitemap, Schema, Search Console, Google Business
- [ ] Meta Pixel, Analytics
- [ ] ব্যাকআপ, Sentry, uptime মনিটর
- [ ] কুরিয়ার ইন্টিগ্রেশন, পেমেন্ট গেটওয়ে (দরকার হলে)

---

## দ্রুত কমান্ড

```bash
npm run dev          # লোকালে API + Vite একসাথে
npm run build        # client/dist বানায় (bundle সাইজ দেখুন)
npm run admin:create # মালিকের লগইন বানায়
npm run db:setup     # টেবিল তৈরি
```

হেলথ চেক: `GET /api/health` · অ্যাডমিন: `/admin`
