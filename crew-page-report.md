# Fortnite Crew Product Page (`/product/fortnite-crew`) — Implementation & Verification Report

## 1. What Was Built & Where the Files Live

The new **Fortnite Crew (`خرید کروپک فورتنایت`)** product page was implemented on branch `feat/fortnite-crew-page` inside `titan-front`, following the mandatory order of work (**Task 5 → Task 1 → Task 2 → Task 3 → Visual Parity Check → Task 4**).

### Created Files
- `src/app/product/fortnite-crew/content.ts` — **Task 5 (Typed Content Module):** Single source of truth for all Persian copy, `CREW_ACTIVATION_INFO`, price/discount/delivery constants (`CREW_PRICE_TOMAN = 589000`, `CREW_ORIGINAL_PRICE_TOMAN = 790000`, `CREW_DISCOUNT_PERCENT = 25`, `CREW_DELIVERY_TIME = '۱۵ دقیقه تا ۲ ساعت'`), `resolveCrewPricing()` helper (formatting numbers with the Persian thousands separator `٬` `\u066C` to match `Main.dc.html` 1:1), the 7 `CREW_BENEFIT_BLOCKS` (`b-0` … `b-6`), activation steps, price/delivery tiles, comparison rows/total, support copy, related links, 8 `CREW_FAQ_ITEMS`, final CTA copy, and `CREW_SEO_METADATA`.
- `src/app/product/fortnite-crew/CrewIcon.tsx` — **Server Component SVG Icons:** Renders the 7 inline decorative SVGs (`gift`, `coin`, `medal`, `sun`, `cube`, `note`, `bolt`) with `aria-hidden="true"`. Zero official logos, key art, or character images are used (Hard Rules 1 & 2).
- `src/app/product/fortnite-crew/crew.module.css` — **Task 1, 2, 3 Styling (CSS Modules):** Carries over all visual values from `Main.dc.html` 1:1 (`#0b0507` background, `#f2b84b` accent, gradients, borders, radii, shadows, typography, `stageIn`/`textIn`/`floatCard` keyframes, hover/active states, `.rv`/`.x1..x5`/`.sl`/`.sr`/`.ln` scroll-reveal classes scoped under `.jsReady`, `prefers-reduced-motion: reduce` overrides, `overflow-x: clip`, and responsive adaptations at `<=640px` and `<=360px`).
- `src/app/product/fortnite-crew/CrewCarousel.tsx` — **Task 2 (Hero Card Carousel Client Component):** 7-card fanned stack using `translateX(calc(d * var(--hc-dx, 150px))) translateY(calc(|d| * var(--hc-dy, 16px))) scale(1 - |d|*0.13) rotate(d*5deg)`, right/left round `<button>` controls (`48×48px`), dot indicator `<button>`s with Persian `aria-label`s, pointer drag/swipe (`|dx| > 45px` advances and suppresses the trailing click), non-active card click activation, and active card `<a href="#b-N">` smooth anchor scrolling.
- `src/app/product/fortnite-crew/CrewRevealObserver.tsx` — **Task 3 (Scroll-Reveal & Cart Wiring Client Component):** Adds `.jsReady` on mount (so SSR HTML without JS remains 100% visible), observes `.rv, .x1, .x2, .x3, .x4, .x5, .sl, .sr, .ln` with `IntersectionObserver` (`threshold: 0`, `rootMargin: '0px 0px -12% 0px'`) to add `.in` once and unobserve, and wires the Hero `#buy` button (`[data-crew-buy-btn="true"]`) directly to `useAppContext().addToCart`.
- `src/app/product/fortnite-crew/page.tsx` — **Task 1 & Task 4 (Server Component Page & SEO):** Renders all 10 sections in exact order, implements `generateMetadata` (exact title, description, canonical URL from `SITE_URL`, staging-aware `robots`, OpenGraph & Twitter metadata with `locale: 'fa_IR'`), and server-renders `Product` + `Offer` (in `IRR` rials without `aggregateRating` or `review`), `FAQPage`, and `BreadcrumbList` JSON-LD schemas.
- `public/images/og/fortnite-crew-titan-og.png` — **Task 4 (Original Branded OG Image):** `1200×630` PNG generated from the hero dark-red/gold gradient, inline gift SVG icon, and Persian typography (no official artwork).

### Modified Files
- `src/app/layout.tsx` — Added weights `"300"` and `"800"` to `Vazirmatn` (`weight: ["300", "400", "500", "600", "700", "800"]`, `subsets: ["arabic", "latin"]`, `display: "swap"`).
- `src/app/globals.css` — Added `scroll-behavior: smooth;` to `html`.
- `src/app/product/[slug]/page.tsx` — Excluded `'fortnite-crew'` from `generateStaticParams` so dynamic `[slug]` static generation does not collide with the dedicated `/product/fortnite-crew` route.

---

## 2. Visual Parity Results & Screenshots (`1440px` & `390px`)

Side-by-side section screenshots and computed style metrics were captured from `http://localhost:8000/Main.dc.html` (reference) and `http://localhost:3000/product/fortnite-crew` (implementation) at **1440px** and **390px** viewports:
- Saved in `C:\Users\EXO\.gemini\antigravity\brain\90464069-1fbd-40c9-99ce-9ff6ec57902f\scratch\parity\` (`ref-1440-*.png`, `impl-1440-*.png`, `ref-390-*.png`, `impl-390-*.png`, `ref-metrics-*.json`, `impl-metrics-*.json`).

### Remaining Known Differences (Intentional / Required by Rules)
1. **Site Shell Container Width at `1440px` Viewport (`1129px` vs `1280px`):**
   - Standalone `Main.dc.html` has no site chrome, so at `1440px` viewport its `max-width: 1280px` container fills `1280px`.
   - Inside Titan's existing layout (`src/app/shell.css`), `<Sidebar />` and `<Rail />` occupy lateral space, leaving `1129px` for `<main className="main">` at `1440px` viewport (and reaching the full `1280px` inner width at wider desktop viewports). Per Hard Rule 5, the existing site header, sidebar, rail, and footer were kept intact.
2. **Step 2 Bracketed Placeholder Hidden (`CREW_ACTIVATION_INFO`):**
   - Per Hard Rule 3, the bracketed placeholder sentence `[اطلاعات موردنیاز برای فعال‌سازی — مثلاً ایمیل اکانت اپیک یا حساب کنسول متصل — را اینجا بنویسید.]` in Step 2 is read from `CREW_ACTIVATION_INFO` (currently `''`) and omitted until the owner provides final text, while keeping the step number (`۲`), title (`ثبت اطلاعات اکانت`), and the console-linking sentence.
3. **Mobile Responsive Adaptations (`390px` & `320px`):**
   - `Main.dc.html` has no `<meta name="viewport">` tag or `@media` queries, causing horizontal overflow on phone viewports. Per Task 1 & Task 2, our implementation uses `overflow-x: clip` on `.page`, scales carousel spacing (`--hc-dx: 96px` at `<=640px`, `78px` at `<=360px`), wraps table rows, and provides `>=24×44px` touch targets on carousel dots with **zero horizontal scroll** across `320px`, `390px`, `768px`, `1280px`, and `1440px`.

---

## 3. Lighthouse (Mobile) Scores & CLS Check

Lighthouse (mobile form factor, simulated mobile throttling, headless Chromium/Edge) was run against the Next.js production server (`next build && next start`) on `http://localhost:3000/product/fortnite-crew`:

| Environment Mode | Performance | Accessibility | SEO | CLS | FCP | Speed Index | TBT | LCP |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Production Domain Mode** (`NEXT_PUBLIC_SITE_URL=https://titan-game.ir`) | **83** | **100** | **100** | **0** | `1.4 s` | `1.9 s` | `20 ms` | `4.6 s` |
| **Preview / Staging Mode** (`SITE_URL=https://titan-front.vercel.app`) | **83** | **100** | **69** *(see note)* | **0** | `1.4 s` | `2.5 s` | `20 ms` | `4.7 s` |

- **CLS Check:** **0** (`clsNumeric: 0`). All animations use only `opacity`, `transform`, and `filter`.
- **Why SEO is `69` in Preview/Staging Mode vs `100` in Production Mode:** Per Task 4 (*"Make sure preview/staging deployments send `noindex` and production does not inherit it"*), when `SITE_URL` is a `.vercel.app` preview URL (`IS_STAGING_ENV === true`), the page emits `<meta name="robots" content="noindex, nofollow" />` and `/robots.txt` serves `Disallow: /`. Lighthouse deducts 31 points from the SEO score when `is-crawlable` detects `noindex`. When `NEXT_PUBLIC_SITE_URL` is set to the production domain, `is-crawlable` passes and **SEO is 100**.
- **Note on Mobile LCP (`4.6 s`):** Under Lighthouse's 4× mobile CPU throttling, the mockup's mandatory time-based hero entrance animations (`stageIn` `0.85s` delay `0.1s` and `textIn` `0.7s` delays `0.95s`–`1.43s` starting from `opacity: 0`) account for `4.2 s` (90%) of the simulated LCP render delay, while TTFB is `0.45 s` and TBT is `20 ms`.

---

## 4. Open Items for the Owner

1. **Step 2 Activation Instructions (`CREW_ACTIVATION_INFO` — Blocked on Owner):**
   - In `src/app/product/fortnite-crew/content.ts`, `CREW_ACTIVATION_INFO` is currently `''` (or overridden via `process.env.NEXT_PUBLIC_CREW_ACTIVATION_INFO`).
   - **Action needed:** Provide the exact Persian sentence explaining what account identifier the customer must enter at checkout (e.g., linked console account or Epic Display Name/email, without ever asking for an Epic Games password or asking the user to disable 2FA per Hard Rule 3).
2. **External Links Confirmation:**
   - The mockup contains three external links, all rendered with `target="_blank" rel="noopener nofollow"`:
     1. Intro paragraph 1: `https://www.fortnite.com/fortnite-crew-subscription` (anchor text: `صفحه Epic Games`)
     2. Intro paragraph 3: `https://www.epicgames.com` (anchor text: `Epic Games`)
     3. Benefit `b-6` (Rocket Pass) paragraph 2: `https://www.epicgames.com` (anchor text: `مرکز راهنمای Epic Games`)
   - **Action needed:** Confirm whether these three URLs should remain as-is or if `مرکز راهنمای Epic Games` should link to a specific Epic Games Help Center article URL.
3. **Exact URL of the Buying Guide Article (`/guides` vs `/guides/fortnite-crew-buying-guide`):**
   - `Main.dc.html` links to `/guides` in Benefit `b-0` (*"راهنمای خرید کروپک"*) and in Related Links (*"راهنمای خرید"*).
   - Both `/guides` (`200 OK`) and `/guides/fortnite-crew-buying-guide` (`200 OK`) exist in the codebase. We kept `/guides` 1:1 per the mockup.
   - **Action needed:** Confirm whether to keep `/guides` or point one/both links directly to `/guides/fortnite-crew-buying-guide`.
4. **Confirmation of V-Bucks Amount, Price, Discount, and Delivery Time:**
   - Currently configured in `content.ts` (and matched in `DEFAULT_FORTNITE_CREW_PRODUCT_DETAIL`):
     - **V-Bucks amount:** `۱٬۰۰۰` ویباکس ماهانه
     - **Price:** `۵۸۹٬۰۰۰ تومان` (`5,890,000 IRR` in JSON-LD `Offer`)
     - **Original Price & Discount:** `۷۹۰٬۰۰۰ تومان` (`۲۵٪ تخفیف`)
     - **Delivery Time:** `۱۵ دقیقه تا ۲ ساعت`
   - **Action needed:** Confirm that these four commercial values are current for launch.
5. **Verification of "Crew Legacy Styles" and "Mid-month purchase gets next month's skin" Statements:**
   - Benefit `b-0` paragraph 2 states that activating mid-month grants both the current month's Crew Pack and next month's pack before the 1-month period ends, and mentions progressive **Crew Legacy Styles** unlocked by subsequent renewals.
   - **Action needed:** Verify both claims against current Epic Games Fortnite Crew terms and Titan's specific 1-month non-auto-renewing activation workflow.
6. **Internal Route Verification:**
   - Every internal route linked from the benefit sections, support section, and related-links chips was verified and returns HTTP `200`:
     - `/product/fortnite-vbucks` (`200 OK`)
     - `/fortnite-shop` (`200 OK`)
     - `/store/fortnite` (`200 OK`)
     - `/store` (`200 OK`)
     - `/guides` (`200 OK`)
     - `/tournament` (`308 Permanent Redirect` → `/tournaments` `200 OK`)
     - `/faq` (`200 OK`)
     - `/terms` (`200 OK`)
     - `/contact` (`200 OK`)
7. **Mockup Items Left Unchanged per Hard Rule 7 ("Do not redesign"):**
   - **Comparison Table Arithmetic vs Summary Label:** The 7 rows in the "ارزش تقریبی در خرید جداگانه" table sum to `۸٬۳۰۰ تا ۸٬۸۰۰ ویباکس`, whereas the footer row displays `بیش از ۵٬۸۰۰ ویباکس + باندل اختصاصی`. Left unchanged 1:1 per Hard Rules 4 & 7.
   - **Hero `#buy` Anchor Placement:** In `Main.dc.html`, `id="buy"` is placed on the Hero price/CTA box and the Final CTA button links to `href="#buy"`, scrolling back up to the Hero purchase box. Preserved 1:1 with `scroll-margin-top: 96px`.
   - **Generic `https://www.epicgames.com` Link on "مرکز راهنمای Epic Games":** Left unchanged 1:1 and listed in item 2 above for owner confirmation.

