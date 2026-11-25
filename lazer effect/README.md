# ⚡ ZenVQ Universal Precision Laser Cursor & Edge API Hub

> **The Central Single Source of Truth for 60-120fps Canvas Laser Beam, Micro-Sparks & HUD Reticles across all ZenVQ Ecosystem Platforms, Client Sites and Future Projects.**

---

## 📌 বাংলা সংক্ষিপ্ত বিবরণ (Bengali Executive Summary)

এই রিপোজিটরিটি হলো আমাদের সম্পূর্ণ ইকোসিস্টেমের **সেন্ট্রাল মাস্টার লেজার কার্সার আর্কিটেকচার হাব ও ইউনিভার্সাল এজ API (Single Source of Truth & Universal Edge API)**। আপনার এজেন্সি সাইট (`ZenVQ-Agency`) এর সম্পূর্ণ লেজার কার্সার প্রযুক্তি, ফিজিক্স, মাইক্রো-স্পার্কস, শকওয়েভ, রোটেটিং HUD টার্গেটিং রেটিকেল এবং থিম সিস্টেমকে সেন্ট্রালাইজ করে একটি **Universal 1-Call Edge API** হিসেবে তৈরি করা হয়েছে।

এখন থেকে যেকোনো ওয়েবসাইটে **মাত্র ১টি স্ক্রিপ্ট ট্যাগ অথবা ১টি রিঅ্যাক্ট কম্পোনেন্ট** যুক্ত করলেই হাই-এন্ড সিলিকন-ভ্যালি লেজার কার্সার সিস্টেম সচল হয়ে যাবে।

### 💎 মূল আর্কিটেকচার ও সুবিধাসমূহ:
- **১টি API / স্ক্রিপ্ট কলে ফুল ইন্টিগ্রেশন:** ওয়েবসাইটে শুধু ১টি স্ক্রিপ্ট ট্যাগ যুক্ত করলেই লাইভ ক্যানভাস ইঞ্জিন, মাইক্রো-স্পার্কস এবং অটোনমিক স্টাইল ইনজেকশন চালু হয়ে যায়।
- **ক্লাউডফ্লেয়ার এজ ওয়াকার API (`cloudflare-worker/`):** সুপার-ফাস্ট এজ CDN ডেলিভারি (`GET /v1/laser.js`), কনফিগারেশন রেস্ট এন্ডপয়েন্ট (`GET /v1/presets`) এবং লাইভ ইন্টারেক্টিভ প্লেগ্রাউন্ড (`GET /demo`)।
- **ডাবল-পাস লেজার রিবন ট্রেইল (Ribbon Beam):** পাস ১ এ আউটার ব্লুম গ্লো এবং পাস ২ এ হট লেজার ফিলামেন্ট কোর রেন্ডার করে।
- **ফটোন মাইক্রো-স্পার্কস ও শকওয়েভ:** মাউসের হাই-স্পিড মুভমেন্টে মোশন ভেক্টরের বিপরীতে ফটোন স্পার্কস বের হয় এবং ক্লিকে রিংস শকওয়েভ পালস ছড়িয়ে পড়ে।
- **প্রিসিশন HUD টার্গেটিং রেটিকেল:** যেকোনো বাটন বা লিংকের ওপর মাউস নিলে কর্নার ব্র্যাকেটস `[ ]` এবং ক্রসহেয়ার স্মুথলি রোটেট হয়ে লক করে।
- **৫টি প্রিসেট থিম:** Engineering Mint, Creative Purple, Luxury Gold, Cyber Neon এবং Architectural Monochrome।
- **জিরো ব্যাটারি/সিপিইউ অপচয়:** টাচস্ক্রিন ও মোবাইলে স্বয়ংক্রিয়ভাবে ডিঅ্যাক্টিভ হয়ে যায় এবং টেক্সট ফিল্ডে নেটিভ আই-বিম কার্সার অক্ষুণ্ণ রাখে।

---

## ⚡ 1-Call Integration Matrix (১টি কলে ইন্টিগ্রেশন)

### Option 1: Any Website / WordPress / Shopify / Webflow / Static HTML (1 Script Tag)
যেকোনো ওয়েবসাইটে `</body>` বা `<head>` এর ভেতরে শুধু নিচের ১টি লাইন যুক্ত করুন:

```html
<!-- ZenVQ Universal Precision Laser Cursor: 1-Line Edge Integration -->
<script
  src="https://laser-api.zenvq.com/v1/laser.js"
  data-auto-laser="true"
  data-theme="auto"
  defer
></script>
```

#### URL Query Parameters দিয়ে কাস্টমাইজেশন:
```html
<!-- ক্রিয়েটিভ পার্পল থিম এবং এক্সট্রা ব্লুম সহ -->
<script src="https://laser-api.zenvq.com/v1/laser.js?theme=creative&bloom=1.2" defer></script>

<!-- লাক্সারি গোল্ড থিম -->
<script src="https://laser-api.zenvq.com/v1/laser.js?theme=luxury" defer></script>
```

---

### Option 2: Next.js App Router (1 Single Component)
Next.js App Router প্রজেক্টের `app/layout.tsx` ফাইলে সরাসরি কম্পোনেন্টটি বসিয়ে দিন:

```tsx
import { LaserCursor } from "@/components/LaserCursor";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* 1-Line Drop-in Precision Laser Cursor */}
        <LaserCursor theme="auto" />
        {children}
      </body>
    </html>
  );
}
```

---

### Option 3: Dynamic Edge React Wrapper (`ZenVQLaser.tsx`)
```tsx
import { ZenVQLaser } from "@/components/ZenVQLaser";

export default function App() {
  return (
    <>
      <ZenVQLaser theme="engineering" sparks={true} reticle={true} />
      {/* Your app content */}
    </>
  );
}
```

---

## 🎨 Contextual Themes & Presets

লেজার কার্সার স্বয়ংক্রিয়ভাবে এলিমেন্টের থিম ডিটেক্ট করতে পারে। যেকোনো বাটনে বা কার্ডে `data-laser-theme="creative"` বসালেই কার্সার সাথে সাথে রঙ পরিবর্তন করে:

```html
<!-- কার্সার যখন এই কার্ডের ওপর যাবে তখন রঙ ভায়োলেট হবে -->
<div data-laser-theme="creative">
  <h3>Creative Studio Case Study</h3>
</div>

<!-- কার্সার যখন এই কার্ডের ওপর যাবে তখন রঙ গোল্ড হবে -->
<div data-laser-theme="luxury">
  <h3>High-Ticket Enterprise Service</h3>
</div>
```

| থিম আইডি | নাম | গ্লো কালার | ফিলামেন্ট কোর | স্পার্ক প্যালেট |
| :--- | :--- | :--- | :--- | :--- |
| `engineering` | Engineering Mint | `#6FFFE9` | `#FFFFFF` | Mint, Aqua and White |
| `creative` | Creative Purple | `#A855F7` | `#FAF5FF` | Purple, Violet and White |
| `luxury` | Luxury Gold | `#F59E0B` | `#FFFBEB` | Gold, Amber and White |
| `cyberpunk` | Cyber Neon | `#EC4899` | `#FDF4FF` | Pink, Mint and White |
| `monochrome` | Architectural White | `rgba(255,255,255,0.85)` | `#FFFFFF` | White and Zinc |

---

## 🚀 1-Click Ecosystem Auto-Deployer

আপনার লোকাল পিসির সব প্রজেক্টে (`ZenVQ-Agency`, `ZenVQ-EcoSystem`, `ZenVQ-Tools`, `Puson-Dev`, `templetes.zenvq.com` ইত্যাদি) এক ক্লিকে লেজার ইঞ্জিন ও কম্পোনেন্ট ইনজেক্ট করতে রান করুন:

```powershell
powershell -ExecutionPolicy Bypass -File "scripts\inject-all-sites.ps1"
```

নির্দিষ্ট কোনো একক প্রজেক্টে ইনস্টল করতে:
```powershell
powershell -ExecutionPolicy Bypass -File "scripts\install-laser.ps1" -TargetProject "<path-to-target-project>"
```

---

## 🛠️ Edge API Endpoints (Cloudflare Worker)

Worker ডেপ্লয় করার পর আপনার ডোমেইনে নিচের এন্ডপয়েন্টগুলো লাইভ থাকবে:

- `GET /v1/laser.js` — কমপ্যাক্ট ক্যাশড এজ স্ক্রিপ্ট (কুয়েরি প্যারাম সহ)
- `GET /v1/presets` — থিম ও কালার টোকেনের JSON স্কিমা
- `GET /v1/config` — ডিফল্ট কনফিগারেশন প্যারামিটার
- `GET /health` — এজ হেলথ স্ট্যাটাস ও আপটাইম SLA
- `GET /demo` — লাইভ ইন্টারেক্টিভ ডার্ক-মোড প্লেগ্রাউন্ড

```bash
# ক্লাউডফ্লেয়ার ওয়ার্কার ডেপ্লয় করতে:
cd cloudflare-worker
npm install
npm run deploy
```

---

## 📂 Repository Architecture

```text
lazer effect/
├── core/
│   └── zenvq-laser.js               # Master 0-dependency Client Canvas Runtime Engine
├── components/
│   ├── LaserCursor.tsx              # Universal Next.js / React 60-120fps component
│   ├── ZenVQLaser.tsx               # Universal edge loader drop-in component
│   └── ZenVQLaser.standalone.html   # 1-Line HTML drop-in snippet
├── cloudflare-worker/               # Serverless Edge API & CDN Delivery Service
│   ├── src/
│   │   ├── index.js                 # Edge API routes (/v1/laser.js, /v1/presets, /demo)
│   │   └── engineCode.js            # In-memory bundled engine script
│   ├── wrangler.jsonc               # Cloudflare Worker configuration
│   └── package.json                 # Worker dependencies
├── rules/
│   ├── zenvq-laser-rules.md         # Global agent master rules
│   └── LASER_MASTER_TECH_SPEC.md    # Comprehensive technical specification
├── scripts/
│   ├── install-laser.ps1            # 1-click single project installer
│   ├── inject-all-sites.ps1         # 1-click all-ecosystem batch injector
│   └── verify-laser.ps1             # Integrity and zero Oxford comma verification
├── examples/
│   ├── nextjs-app-router/
│   │   └── layout.tsx               # Next.js App Router root layout example
│   └── static-html/
│       └── index.html               # Complete local interactive sandbox
├── package.json
├── .gitignore
└── README.md
```

---

## 🛡️ Governance & Quality Enforcement

- **Strict Zero Oxford Comma Law:** কোনো মার্কডাউন, কোড কমেন্ট বা ইউজার কপিতে `A, B and C` ছাড়া কোনো অক্সফোর্ড কমা অনুমোদিত নয়।
- **Strict Halal Media Law:** শতভাগ হালাল কনটেন্ট পলিসি মেনে তৈরি। কোনো নারী ইমেজ বা ব্যাকগ্রাউন্ড মিউজিক নেই।
- **Touch & Accessibility Safeguards:** মোবাইল বা ট্যাবলেট ডিভাইসে সম্পূর্ণ সাইলেন্ট থাকে এবং টেক্সট ইনপুটে ইউজার এক্সপেরিয়েন্স নষ্ট করে না।
