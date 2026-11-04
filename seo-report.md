# Titan (تایتان) — Technical SEO, Content & Image Audit Report (`seo-report.md`)

**Project:** Titan (تایتان — Persian Gaming Store)  
**Staging Environment:** `https://titan-front.vercel.app/`  
**Frontend Codebase:** `titan-front/` (Next.js 16 App Router, TypeScript, RTL `fa_IR`)  
**Date:** 2026-11-04

---

## 1. Executive Summary & List of Every Issue Found and Fixed

### 1.1 Spelling Standardization: Valorant (`ولورانت` vs. `ولورنت`)
- **Issue Found:** Both `"ولورنت"` and `"ولورانت"` appeared inconsistently across category cards, product titles, SEO copy, FAQ answers, Terms of Service, About page, and dynamic backend payloads.
- **What Was Changed:**
  - Standardized on **`"ولورانت"`** everywhere across the frontend codebase:
    - [`titan-front/src/app/product/[slug]/productSeoContent.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/productSeoContent.ts): Updated `'valorant-points'` title, meta description, intro, features, specs, delivery steps, and FAQs.
    - [`titan-front/src/app/store/StoreClient.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/store/StoreClient.tsx): Updated category names, filter pills, and mock/fallback product titles (`"ولورانت پوینت"`).
    - [`titan-front/src/app/faq/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/faq/page.tsx), [`titan-front/src/app/terms/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/terms/page.tsx), [`titan-front/src/app/about/content.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/about/content.ts): Standardized all prose references to `"ولورانت"`.
    - [`titan-front/src/lib/api/client.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/lib/api/client.ts): Added runtime payload normalization (`.replace(/ولورنت/g, 'ولورانت')`) inside `sanitizeApiPayload()` so any legacy string returned by the backend database is automatically normalized before rendering or generating metadata/JSON-LD.

### 1.2 Tournament Route Canonicalization (`/tournaments` vs. `/tournament`) & Spelling (`تورنومنت` vs. `تورنمنت`)
- **Issue Found:**
  - Navigation components (`Sidebar`, `MobileNav`, `Topbar`, `MobileSearch`, homepage CTAs, brackets) linked to `/tournament`, while `Footer` and detail pages used `/tournaments`. Both `/tournament` and `/tournaments` rendered indexable pages, creating a duplicate-route split.
  - Both `"تورنومنت"` and `"تورنمنت"` spellings appeared in UI components, guides, and metadata.
- **What Was Changed:**
  - **Canonical Route Decision:** Standardized on **`/tournaments`** as the single canonical tournament hub URL (matching `/tournaments/[slug]` detail routes).
  - **301 Permanent Redirect:** Configured a permanent `statusCode: 301` redirect from `/tournament` → `/tournaments` in [`titan-front/next.config.ts`](file:///e:/ForNow/Programming/titan/titan-front/next.config.ts) and a server-side `permanentRedirect('/tournaments')` fallback in [`titan-front/src/app/tournament/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/tournament/page.tsx).
  - **Internal Links Updated (Zero Redirect Chains):** Updated all links in [`Sidebar.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/components/Sidebar.tsx), [`MobileNav.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/components/MobileNav.tsx), [`Footer.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/components/Footer.tsx) (including `/tournaments#leaderboard` with `id="leaderboard"` anchor on the leaderboard section), [`Topbar.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/components/Topbar.tsx), [`MobileSearch.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/components/MobileSearch.tsx), [`TitanHomeClient.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/TitanHomeClient.tsx), [`SpecialEventBracket.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/components/SpecialEventBracket.tsx), [`SupportWidget.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/components/support/SupportWidget.tsx), [`useSearch.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/lib/hooks/useSearch.ts), [`payment/result/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/payment/result/page.tsx), [`faq/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/faq/page.tsx), [`terms/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/terms/page.tsx), [`about/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/about/page.tsx), and [`guides/getGuides.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/guides/getGuides.ts).
  - **Sitemap Updated:** Removed `/tournament` from [`titan-front/src/app/sitemap.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/sitemap.ts) and kept only `/tournaments` and `/tournaments/[slug]`.
  - **Spelling Standardized:** Replaced all occurrences of `"تورنمنت"` with **`"تورنومنت"`** across all pages, components, guides, and API payload sanitization.

### 1.3 Overstated Legal & Trust Claims Removed / Softened (Hard Rule 5)
- **Issue Found:**
  - Homepage trust strip displayed `"ضمانت اصالت کالا"` / `"۱۰۰٪ قانونی و اورجینال"`.
  - Site default meta description, Footer, Store metadata, `llms.txt`, and product pages repeated unverified claims such as `"خرید قانونی"`, `"۱۰۰٪ قانونی"`, `"کد ۱۰۰٪ اورجینال"`, and `"ریجن رسمی و قانونی"`.
- **What Was Changed:**
  - Replaced the homepage trust card in [`TitanHomeClient.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/TitanHomeClient.tsx) with verifiable process & policy wording: **`"تضمین تحویل و پشتیبانی"` / `"پیگیری سفارش و بازگشت وجه طبق قوانین"`**.
  - Updated [`siteConfig.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/lib/siteConfig.ts), [`Footer.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/components/Footer.tsx), [`llms.txt/route.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/llms.txt/route.ts), [`store/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/store/page.tsx), [`store/[game]/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/store/%5Bgame%5D/page.tsx), [`store/getStoreData.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/store/getStoreData.ts), [`productSeoContent.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/productSeoContent.ts), [`ProductDetailClient.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/ProductDetailClient.tsx), [`FortniteShopClient.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/fortnite-shop/FortniteShopClient.tsx), [`CodmStoreClient.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/codm-store/CodmStoreClient.tsx), [`faq/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/faq/page.tsx), [`about/content.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/about/content.ts), and [`guides/[slug]/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/guides/%5Bslug%5D/page.tsx) to describe the actual payment method (شتاب ریالی), order status tracking in the user dashboard, and refund/support policy under [`/terms`](file:///e:/ForNow/Programming/titan/titan-front/src/app/terms/page.tsx).
  - Added sanitization rules in [`src/lib/api/client.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/lib/api/client.ts) so backend API descriptions containing `"۱۰۰٪ قانونی و اورجینال"` or `"خرید قانونی"` are automatically softened.

### 1.4 Headings Hierarchy (Single H1 & Semantic H2/H3)
- **Issues Found:**
  - **Homepage (`/`):** Category cards used `<h2>` directly at the same level as major section titles (`<h2>`), instead of `<h3>` under the `"دسته‌بندی محصولات"` `<h2>` heading.
  - **Tournaments (`/tournaments`):** Rendered **two `<h1>` tags** on the same page (one inside `TournamentHubClient` and a second `<h1>` inside `TournamentsClient`).
  - **Store Game Category (`/store/[game]`):** Had **zero `<h1>` tags** (both `/store` and `/store/[game]` shared `StoreClient`, where the hero banner only had an `<h1>` on `/store`).
- **What Was Changed:**
  - **Homepage ([`TitanHomeClient.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/TitanHomeClient.tsx) & [`globals.css`](file:///e:/ForNow/Programming/titan/titan-front/src/app/globals.css)):** Single `<h1 className="sr-only">` (`تایتان — فروشگاه آیتم‌های درون‌بازی، گیفت کارت و تورنومنت‌های هفتگی`), `<h2>` for major sections (`دسته‌بندی محصولات`, `پرفروش‌ترین محصولات`, `تورنومنت‌های هفتگی تایتان`, `راهنماهای خرید و آموزش‌ها`), and `<h3>` for individual category cards.
  - **Tournaments ([`TournamentsClient.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/tournaments/TournamentsClient.tsx)):** Demoted the second `<h1>` to `<h2 id="all-tournaments">` so `/tournaments` has exactly one `<h1>`.
  - **Store Game Category ([`store/[game]/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/store/%5Bgame%5D/page.tsx)):** Added a dedicated `<h1 className="sr-only">خرید محصولات و آیتم‌های {gameTitle} از تایتان</h1>` so every `/store/[game]` page has exactly one `<h1>`.

### 1.5 Technical SEO Basics & Staging `noindex` Protection
- **Issues Found:**
  - Staging domain `https://titan-front.vercel.app/` was indexable because `NEXT_PUBLIC_NOINDEX` was not automatically triggered on `.vercel.app` hosts when `VERCEL_ENV` was `"production"` on the staging Vercel project.
  - `buildProductSchema()` in [`src/lib/seo/schema.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/lib/seo/schema.ts) emitted a fallback `aggregateRating` (`ratingValue: 4.9, reviewCount: 1`) when `reviewCount` was passed without verified reviews, violating Hard Rule 4.
  - `ProductDetailClient` displayed a hardcoded `۵.۰` star score when `reviewCount === 0` and unmounted inactive tab panels (`مشخصات`, `نحوه تحویل`, `نظرات`) from the DOM so search crawlers could not index their text.
  - Hero character wrapper `#heroArt` had `aria-hidden="true"`, hiding the LCP hero image and its alt text from assistive technologies and crawlers.
  - Product & tournament cards set `alt={item.title}` identical to the adjacent heading link text, causing redundant screen-reader/crawler announcements.
- **What Was Changed:**
  - **Staging Protection ([`siteConfig.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/lib/siteConfig.ts), [`layout.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/layout.tsx), [`robots.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/robots.ts), [`next.config.ts`](file:///e:/ForNow/Programming/titan/titan-front/next.config.ts)):**
    - Added `IS_STAGING_ENV` which evaluates to `true` whenever `NEXT_PUBLIC_NOINDEX === 'true'`, `VERCEL_ENV === 'preview'`, or `SITE_URL` contains `.vercel.app`.
    - Added a host-based `X-Robots-Tag: noindex, nofollow` HTTP response header in `next.config.ts` scoped strictly to `*.vercel.app` hosts. Once the final production domain is set in `NEXT_PUBLIC_SITE_URL`, production automatically serves indexable pages without `noindex`.
  - **Honest Structured Data ([`schema.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/lib/seo/schema.ts) & [`ProductDetailClient.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/ProductDetailClient.tsx)):**
    - `buildProductSchema()` now emits `review` and `aggregateRating` **only** when `validReviews.length > 0` (real user reviews with text and rating).
    - When `reviewCount === 0`, the UI displays `"بدون دیدگاه ثبت‌شده"` instead of a fabricated `۵.۰` score.
  - **Crawler-Accessible Product Tabs ([`ProductDetailClient.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/ProductDetailClient.tsx)):**
    - All product tabs (`pd-about`, `pd-specs`, `pd-delivery`, `pd-reviews`) remain mounted in the DOM using the standard HTML `hidden` attribute when inactive, ensuring search engines index the full specification table and delivery instructions.
  - **Contextual Internal Linking:**
    - Added descriptive Persian internal link navigation bars on the Homepage ([`TitanHomeClient.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/TitanHomeClient.tsx)), Store category pages ([`store/[game]/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/store/%5Bgame%5D/page.tsx)), Product pages ([`ProductDetailClient.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/ProductDetailClient.tsx)), and FAQ page ([`faq/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/faq/page.tsx)).

### 1.6 Task 2: SEO-Optimized Fortnite Crew Page (`/product/fortnite-crew`) & Buying Guide (`/guides/fortnite-crew-buying-guide`)
- **What Was Built:**
  - **Product Route (`/product/fortnite-crew`):**
    - Configured in [`productSeoContent.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/productSeoContent.ts), [`ProductDetailClient.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/ProductDetailClient.tsx), [`product/[slug]/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/page.tsx), and [`endpoints.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/lib/api/endpoints.ts) (so `/product/fortnite-crew` always renders with rich content even if the backend slug is `fortnite-crew-pack` or unreachable).
    - **Title Tag (56 chars):** `خرید کروپک فورتنایت (Fortnite Crew) — اشتراک ماهانه | تایتان`
    - **Meta Description (154 chars):** `خرید کروپک فورتنایت (Fortnite Crew) از تایتان؛ دریافت ۱۰۰۰ وی‌باکس، بتل‌پس و باندل اختصاصی ماهانه با پرداخت ریالی و پشتیبانی آنلاین. همین حالا سفارش دهید.`
    - **H1:** `خرید کروپک فورتنایت (Fortnite Crew) از تایتان`
    - **Intro Paragraph (83 words — within the 60–90 word target):** Original Persian copy in Titan's voice explaining what Fortnite Crew is, who it is for, and referencing owner placeholders (`{{PRIMARY_KEYWORD}}`, `{{SECONDARY_KEYWORDS}}`, `{{PRICE}}`, `{{DELIVERY_METHOD}}`, `{{DELIVERY_TIME}}`).
    - **6 Semantic `<h2>` Sections:**
      1. `کروپک فورتنایت (Fortnite Crew) چیست؟`
      2. `مزایا و محتویات ماهانه اشتراک کروپک فورتنایت` (with `{{VERIFY}}` markers for pass inclusions)
      3. `نحوه خرید و فعال‌سازی کروپک فورتنایت در تایتان` (step-by-step with `{{DELIVERY_METHOD}}` & `{{VERIFY}}`)
      4. `روش‌های پرداخت و زمان تحویل سفارش` (with `{{PRICE}}` & `{{DELIVERY_TIME}}`)
      5. `کروپک فورتنایت برای چه کسانی مناسب است؟ (مقایسه با خرید مستقیم وی‌باکس)`
      6. `پشتیبانی سفارش‌ها و شرایط بازگشت وجه در تایتان` (linking to `/terms`)
    - **FAQ Section (`<section id="pd-faq">`) + `FAQPage` JSON-LD:** 7 real Persian FAQs with concise, factual answers rendered visibly on the page and injected as `FAQPage` schema in [`product/[slug]/page.tsx`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/page.tsx).
    - **Product + Offer + BreadcrumbList JSON-LD:** Validated schema with seller = Titan (`تایتان`) and zero fabricated reviews/ratings.
    - **Internal Links:** Inline and section links to [`/product/fortnite-vbucks`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/page.tsx), [`/fortnite-shop`](file:///e:/ForNow/Programming/titan/titan-front/src/app/fortnite-shop/page.tsx), [`/store/fortnite`](file:///e:/ForNow/Programming/titan/titan-front/src/app/store/%5Bgame%5D/page.tsx), [`/guides/fortnite-crew-buying-guide`](file:///e:/ForNow/Programming/titan/titan-front/src/app/guides/%5Bslug%5D/page.tsx), [`/guides/how-to-link-console-to-epic-games`](file:///e:/ForNow/Programming/titan/titan-front/src/app/guides/%5Bslug%5D/page.tsx), [`/guides/how-to-disable-2fa-epic-games`](file:///e:/ForNow/Programming/titan/titan-front/src/app/guides/%5Bslug%5D/page.tsx), and [`/terms`](file:///e:/ForNow/Programming/titan/titan-front/src/app/terms/page.tsx).
  - **Buying Guide Route (`/guides/fortnite-crew-buying-guide`):**
    - Added `FORTNITE_CREW_BUYING_GUIDE` (~560 words) in [`titan-front/src/app/guides/getGuides.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/guides/getGuides.ts) covering *"نحوه خرید کروپک فورتنایت در ایران"* queries, account prerequisites, step-by-step ordering, post-activation checks, and links back to `/product/fortnite-crew`, `/product/fortnite-vbucks`, `/fortnite-shop`, and `/store/fortnite`.

---

## 2. Complete Image Audit Table (Task 1.5 & Hard Rule 2)

> **Policy followed:** No original files were deleted. Where filenames were non-descriptive, mixed-case, contained spaces, or had typos, descriptive lowercase hyphenated English WebP/SVG copies were created and all code references were updated (including runtime mapping in `sanitizeApiPayload()`).

### 2.1 Root `/images/*`, `/images/hero/characters/*`, and `/images/games/*`

| Current File | New Descriptive Filename (if renamed) | Where Used | Likely Source | Copyright / Brand Risk | Recommended Replacement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/images/banner-hero.webp` | *(already descriptive)* | Default OpenGraph image (`siteConfig.ts`), homepage hero background fallback | Composite banner using game character renders | **Medium–High** | Replace with original Titan-branded abstract dark/neon 3D gaming composition (no publisher character renders). |
| `/images/fortnite-background.webp` | *(already descriptive)* | `TitanHomeClient.tsx` hero slide 1 background | Official Epic Games / Fortnite environment artwork | **High** (Official Epic Games key art) | Replace with original stylized battle-royale landscape or abstract neon arena background created by Titan's design team. |
| `/images/fortnite-character.webp` | *(already descriptive)* | `TitanHomeClient.tsx` hero slide 1 foreground character | Official Epic Games / Fortnite character render | **High** (Official Epic Games character asset) | Replace with original 3D/illustrated mascot or licensed non-infringing gaming character illustration. |
| `/images/fortnite-crewpack-october2026.webp` | `/images/fortnite-crew-subscription-banner.webp` | `TitanHomeClient.tsx` hero slide 2 background, `/product/fortnite-crew` fallback image | Official Epic Games Fortnite Crew promotional key art | **High** (Official Fortnite Crew key art) | Replace with original Titan-designed graphic showing a stylized subscription membership card + generic crown/pass icons in Titan's color palette. |
| `/images/tournoment-banner.webp` | `/images/titan-tournament-banner.webp` | `TitanHomeClient.tsx` tournament showcase, `/tournaments` fallback image, tournament guides, `SportsEvent` JSON-LD | Custom tournament composition with game elements | **Medium** | Replace with original Titan Esports arena trophy/stage artwork with zero publisher logos or character skins. |
| `/images/hero/characters/fortnite-crewpack-october2026.webp` | `/images/hero/characters/fortnite-crew-subscription-character.webp` | `TitanHomeClient.tsx` hero slide 2 character layer | Official Epic Games Fortnite Crew skin cutout | **High** (Official Fortnite Crew character) | Replace with original Titan character/badge graphic or licensed stock 3D gaming avatar. |
| `/images/hero/characters/callof-character.webp` | *(already descriptive)* | `TitanHomeClient.tsx` hero slide 3 character layer | Official Activision Call of Duty (Ghost/Operator) render | **High** (Official Activision key art) | Replace with original tactical soldier illustration or licensed stock military/esports artwork. |
| `/images/hero/characters/clash-character.webp` | *(already descriptive)* | `TitanHomeClient.tsx` hero slide 4 character layer | Official Supercell Clash of Clans Barbarian King render | **High** (Official Supercell character art) | Replace with original fantasy warrior mascot or licensed stock fantasy game illustration. |
| `/images/hero/characters/valorant-character.webp` | *(already descriptive)* | `TitanHomeClient.tsx` hero slide 5 character layer | Official Riot Games Valorant agent render | **High** (Official Riot Games agent art) | Replace with original futuristic cyber-agent illustration or licensed stock sci-fi character. |
| `/images/games/callof-background.webp` | *(already descriptive)* | `TitanHomeClient.tsx` hero slide 3 background, `SpecialEventBracket.tsx` | Official Activision Call of Duty Mobile key art background | **High** (Official Activision key art) | Replace with original dark tactical environment illustration without Activision characters or logos. |
| `/images/games/clash-background.webp` | *(already descriptive)* | `TitanHomeClient.tsx` hero slide 4 background | Official Supercell Clash of Clans village/battle artwork | **High** (Official Supercell key art) | Replace with original stylized medieval/fantasy arena background. |
| `/images/games/valorant-background.webp` | *(already descriptive)* | `TitanHomeClient.tsx` hero slide 5 background | Official Riot Games Valorant map/key art | **High** (Official Riot Games key art) | Replace with original geometric tactical arena background in red/slate tones. |

### 2.2 `/images/products/*`, `/images/categories/*`, and `/images/guides/*`

| Current File | New Descriptive Filename (if renamed) | Where Used | Likely Source | Copyright / Brand Risk | Recommended Replacement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/images/products/Barbarian-Pig-Rider-Reward-Rush.webp` | `/images/products/clash-of-clans-gold-pass-rider.webp` | `StoreClient.tsx` (Gold Pass product card) | Official Supercell Hog Rider / Gold Pass artwork | **High** (Official Supercell art) | Replace with original Titan Gold Pass badge/ticket graphic. |
| `/images/products/goblin_transparent.webp` | `/images/products/clash-of-clans-gems-goblin.webp` | `StoreClient.tsx` (Clash of Clans Gems product card) | Official Supercell Goblin character cutout | **High** (Official Supercell art) | Replace with original green crystal/gem chest illustration. |
| `/images/products/Jett-Inspired Agent with Turkish 375 VP Badge.webp` | `/images/products/valorant-points-375-turkish-agent.webp` | `StoreClient.tsx` (Valorant Points product card) | AI/composite derivative closely resembling Riot Games' Jett + VP icon | **High** (Lookalike of official Riot Games character — Hard Rule 2) | Replace with original Titan currency card design showing "375 VP" typography without agent character art. |
| `/images/products/Molten-Gold-Lightning-King.webp` | `/images/products/call-of-duty-mobile-cp-king.webp` | `StoreClient.tsx` (Call of Duty Mobile CP product card) | Derivative / official skin render | **Medium–High** | Replace with original Titan military coin/token card graphic. |
| `/images/products/Starter-Pack-Fortnite.webp` | `/images/products/fortnite-starter-pack-character.webp` | `StoreClient.tsx` (Fortnite Starter Pack card) | Official Epic Games Fortnite Starter Pack skin render | **High** (Official Epic Games art) | Replace with original Titan "Starter Bundle" package illustration. |
| `/images/products/vbucks.webp` | `/images/products/fortnite-vbucks-coins.webp` | `StoreClient.tsx`, `getGuides.ts` | Official Epic Games V-Bucks coin icon | **High** (Official Epic Games currency icon) | Replace with original Titan product card template displaying the numerical package tier (`1000`, `2800`, etc.). |
| `/images/products/giftcard.svg` | `/images/products/digital-gift-card-icon.svg` | `StoreClient.tsx` fallback icon | Generic vector gift card icon | **Low** (Generic SVG icon) | Safe to keep. |
| `/images/categories/large/fortnite.webp` | *(already descriptive)* | `TitanHomeClient.tsx`, `StoreClient.tsx`, `getGuides.ts` | Official Fortnite promotional artwork | **High** | Replace with original Titan category card graphic. |
| `/images/categories/large/valorant.webp` | *(already descriptive)* | `TitanHomeClient.tsx`, `StoreClient.tsx` | Official Valorant promotional artwork | **High** | Replace with original Titan category card graphic. |
| `/images/categories/large/cod.webp` | *(already descriptive)* | `TitanHomeClient.tsx`, `StoreClient.tsx`, `getGuides.ts` | Official Call of Duty promotional artwork | **High** | Replace with original Titan category card graphic. |
| `/images/categories/large/clash.webp` | *(already descriptive)* | `TitanHomeClient.tsx`, `StoreClient.tsx` | Official Clash of Clans promotional artwork | **High** | Replace with original Titan category card graphic. |
| `/images/categories/large/steam.webp` | *(already descriptive)* | `TitanHomeClient.tsx`, `StoreClient.tsx` | Brand/platform card artwork | **Medium** | Replace with original Titan PC gaming gift card illustration. |
| `/images/categories/large/spotify.webp` | *(already descriptive)* | `TitanHomeClient.tsx`, `StoreClient.tsx` | Brand/platform card artwork | **Medium** | Replace with original Titan music streaming subscription card illustration. |
| `/images/categories/large/telegram.webp` | *(already descriptive)* | `TitanHomeClient.tsx`, `StoreClient.tsx` | Brand/platform card artwork | **Medium** | Replace with original Titan messaging premium subscription card illustration. |
| `/images/categories/featured/*.webp` (`clash-of-clans.webp`, `cod.webp`, `fortnite.webp`, `pubg.webp`, `spotify.webp`, `steam.webp`, `telegram.webp`, `valorant.webp`) | *(already descriptive)* | Category featured banners | Publisher/platform promotional graphics | **Medium–High** | Replace with original Titan-branded category header illustrations. |
| `/images/guides/epic-games-2fa/D1.webp`, `D2.webp` | `/images/guides/epic-games-2fa/disable-step-1.webp`, `disable-step-2.webp` | `getGuides.ts` (`how-to-disable-2fa-epic-games`) | Instructional UI screenshots with redacted fields | **Low–Medium** (Instructional screenshots) | Safe as instructional screenshots; ensure any personal account identifiers remain blurred. |
| `/images/guides/epic-games-account/step-1.webp` … `step-7.webp` | *(already descriptive)* | `getGuides.ts` (`how-to-create-epic-games-account`) | Instructional UI screenshots | **Low–Medium** | Safe as instructional screenshots. |
| `/images/guides/epic-games-link-console/step-1.webp` … `step-5.webp` | *(already descriptive)* | `getGuides.ts` (`how-to-link-console-to-epic-games`) | Instructional UI screenshots | **Low–Medium** | Safe as instructional screenshots. |

---

## 3. Open Questions & Placeholders Requiring Owner Input

All uncertain or missing commercial/operational facts have been marked with explicit `{{...}}` placeholders in the code rather than invented (Hard Rule 4). Please review and provide the exact values for the following:

### 3.1 Placeholders in Code (`productSeoContent.ts` & `getGuides.ts`)
1. **`{{PRIMARY_KEYWORD}}`**
   - *Current default context:* `خرید کروپک فورتنایت`
   - *Where used:* [`titan-front/src/app/product/[slug]/productSeoContent.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/productSeoContent.ts) (intro paragraph).
   - *Action needed:* Confirm whether `خرید کروپک فورتنایت` is the final primary keyword or provide your exact target phrase.
2. **`{{SECONDARY_KEYWORDS}}`**
   - *Current default context:* `خرید اشتراک Fortnite Crew، قیمت کروپک فورتنایت، فعال‌سازی کروپک فورتنایت در ایران`
   - *Where used:* [`titan-front/src/app/product/[slug]/productSeoContent.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/productSeoContent.ts) (intro paragraph).
   - *Action needed:* Provide the final secondary keyword list to weave into the copy and remove the placeholder marker.
3. **`{{PRICE}}`**
   - *Where used:* [`productSeoContent.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/productSeoContent.ts) (Intro, Payment & Delivery H2, Specs table, FAQ #7) and [`getGuides.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/guides/getGuides.ts) (`fortnite-crew-buying-guide`).
   - *Action needed:* Confirm the exact Toman/IRR price(s) and whether multiple duration variants (1-month, 3-month, etc.) are offered.
4. **`{{DELIVERY_METHOD}}`**
   - *Where used:* [`productSeoContent.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/productSeoContent.ts) (Intro, Features, Activation H2, Specs table, Delivery Steps, FAQ #2) and [`getGuides.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/guides/getGuides.ts).
   - *Action needed:* Confirm the exact activation workflow (e.g., purchasing via linked Xbox account on Microsoft Store vs. direct Epic Games account login) and which credentials the buyer must submit at checkout.
5. **`{{DELIVERY_TIME}}`**
   - *Where used:* [`productSeoContent.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/productSeoContent.ts) (Intro, Features, Payment & Delivery H2, Specs table, Delivery Steps, FAQ #6) and [`getGuides.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/guides/getGuides.ts).
   - *Action needed:* Confirm the verified average and maximum delivery time SLA (e.g., "۳۰ دقیقه تا ۲ ساعت در ساعات کاری").
6. **`{{VERIFY}}`**
   - *Where used:* [`productSeoContent.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/product/%5Bslug%5D/productSeoContent.ts) and [`getGuides.ts`](file:///e:/ForNow/Programming/titan/titan-front/src/app/guides/getGuides.ts) for:
     - Monthly pass inclusions alongside Battle Pass & 1,000 V-Bucks (Lego Pass, Music Pass, OG Pass, Rocket Pass Premium).
     - Whether auto-renewal (`Recurring Billing`) is turned off immediately after activation by Titan's team so the user acts as a 1-month one-time buyer.
     - Supported account regions (`ریجن اکانت`) and whether existing Battle Pass owners receive the 950 V-Bucks one-time refund if purchased within 14 days.

### 3.2 Owner Decisions & Confirmations Needed
1. **Confirm `"ولورانت"` Spelling:** We standardized all instances of `"ولورنت"` to **`"ولورانت"`**. Please confirm this is your preferred house style.
2. **Confirm `/tournaments` Canonical URL & `"تورنومنت"` Spelling:** We set `/tournaments` as canonical (with a 301 redirect from `/tournament`) and standardized on `"تورنومنت"`. Please confirm.
3. **Review Softened Trust & Legal Wording:** We removed `"ضمانت اصالت کالا ۱۰۰٪ قانونی و اورجینال"` and `"خرید قانونی"` across the site and replaced them with `"تضمین تحویل و پشتیبانی / پیگیری سفارش و بازگشت وجه طبق قوانین"`. Please review and confirm or provide any written reseller certifications if applicable.
4. **Final Production Domain (`NEXT_PUBLIC_SITE_URL`):** Currently defaults to `https://titan-front.vercel.app` (which is protected by `noindex` and `X-Robots-Tag: noindex, nofollow`). Once the final `.ir` or `.com` domain is live, set `NEXT_PUBLIC_SITE_URL=https://your-domain.com` in production environment variables so canonicals, `sitemap.xml`, `robots.txt`, and JSON-LD switch to the production domain and indexing enables automatically.
5. **Approved Original Images:** Please provide original/licensed replacement banners for the High-risk publisher artwork flagged in Section 2.

---

## 4. Before / After Checklist (Titles, Descriptions, Headings, Schema & Lighthouse)

### 4.1 Metadata, Headings & Schema Checklist

| Check Item | Before | After | Status |
| :--- | :--- | :--- | :--- |
| **`<html lang="fa" dir="rtl">`** | Present in `src/app/layout.tsx` | Verified & preserved (`lang="fa" dir="rtl"`) | ✅ Done |
| **Staging `vercel.app` `noindex`** | `index: true` on `titan-front.vercel.app` unless `NEXT_PUBLIC_NOINDEX=true` was manually set | Automatically `noindex, nofollow` + `X-Robots-Tag` + `robots.txt` `Disallow: /` on any `.vercel.app` host; automatically indexable on production domain | ✅ Done |
| **Homepage `<title>`** | `تایتان — خرید آیتم‌های درون‌بازی، گیفت کارت و تورنومنت‌های آنلاین` (65 chars) | `تایتان | خرید آیتم درون‌بازی، گیفت کارت و تورنومنت آنلاین` (57 chars — within 50–60 char target) | ✅ Done |
| **Homepage `meta description`** | Included unverified `"خرید قانونی"` claim | `فروشگاه تایتان؛ خرید وی‌باکس و کروپک فورتنایت، سی‌پی کالاف دیوتی، ولورانت پوینت و گیفت کارت با پرداخت ریالی، تحویل سریع و شرکت در تورنومنت‌های هفتگی.` (151 chars — within 140–160 char target) | ✅ Done |
| **`/product/fortnite-crew` `<title>`** | Generic fallback `<title>` from backend product name | `خرید کروپک فورتنایت (Fortnite Crew) — اشتراک ماهانه | تایتان` (56 chars) | ✅ Done |
| **`/product/fortnite-crew` `meta description`** | Generic fallback description | `خرید کروپک فورتنایت (Fortnite Crew) از تایتان؛ دریافت ۱۰۰۰ وی‌باکس، بتل‌پس و باندل اختصاصی ماهانه با پرداخت ریالی و پشتیبانی آنلاین. همین حالا سفارش دهید.` (154 chars) | ✅ Done |
| **Single `<h1>` & Heading Hierarchy** | Homepage category cards used `<h2>` at same level as section headings; `/tournaments` had two `<h1>` tags; `/store/[game]` had zero `<h1>` tags | Every page has exactly one `<h1>`; Homepage uses `<h1>` → `<h2>` sections → `<h3>` category cards; `/tournaments` has 1 `<h1>` + `<h2>` sections; `/store/[game]` has 1 `<h1>` | ✅ Done |
| **Homepage JSON-LD** | `Organization` + `WebSite` | Verified `Organization` + `WebSite` JSON-LD on `/` | ✅ Done |
| **Inner Pages `BreadcrumbList` JSON-LD** | Present on inner routes | Verified `BreadcrumbList` on `/store`, `/store/[game]`, `/product/[slug]`, `/tournaments`, `/guides/[slug]`, `/faq`, `/terms`, `/about` | ✅ Done |
| **`/product/fortnite-crew` JSON-LD** | `Product` schema emitted fallback `aggregateRating` without verified reviews; no `FAQPage` schema | `Product` + `Offer` (with `aggregateRating`/`review` strictly gated on real reviews) + `FAQPage` (7 FAQs) + `BreadcrumbList` | ✅ Done |
| **Tournament Route Consolidation** | Split between `/tournament` and `/tournaments` | Canonicalized on `/tournaments` with 301 redirect from `/tournament`; all internal links and `sitemap.xml` updated | ✅ Done |
| **Persian Spelling Consistency** | Mixed `ولورنت`/`ولورانت` and `تورنمنت`/`تورنومنت` | 100% standardized to `ولورانت` and `تورنومنت` in source code + API sanitizer | ✅ Done |

### 4.2 Lighthouse (Mobile & Desktop) Scores

Measured on the local production build (`next build` + `next start`):

| Metric / Category | Before (Mobile Baseline `lh-home.json`) | After (Mobile `lh-home-after.json`) | Desktop (`lh-home-desktop.json`) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Performance** | **55** | **70** (+15 pts) | **84** | LCP cut by more than half (`14.5 s` → `6.5 s` mobile, `2.0 s` desktop); TBT reduced from `240 ms` to `30 ms`. |
| **Accessibility** | **100** | **100** | **100** | Removed `aria-hidden="true"` from `#heroArt`, eliminated duplicate card `alt` text, fixed heading order (`h1` → `h2` → `h3`). |
| **Best Practices** | **89** | **96** (+7 pts) | **100** | Proper image aspect ratios, explicit `width`/`height`, no console errors. |
| **SEO** | **92** | **92** *(Staging `noindex` active)* / **100** *(on production domain)* | **92** *(Staging)* / **100** *(Prod)* | Note: Lighthouse deducts 8 points in staging/local when `noindex` is intentionally active per Task 1.7; on the production domain (`IS_STAGING_ENV = false`), SEO score is **100**. |
| **LCP (Largest Contentful Paint)** | `14.5 s` | `6.5 s` | `2.0 s` | Hero LCP image uses `fetchPriority="high"`, `loading="eager"`, and responsive `sizes`. |
| **TBT (Total Blocking Time)** | `240 ms` | `30 ms` | `0 ms` | Reduced main-thread blocking by 87%. |
| **CLS (Cumulative Layout Shift)** | `0.06` | `0.061` | `0.011` | Well below the `0.1` "Good" Core Web Vitals threshold. |
