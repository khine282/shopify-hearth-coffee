# Hearth Coffee Co. — Shopify demo

A portfolio demo built to show custom Shopify theme development plus a small
serverless-style backend integration, not just a themed storefront.

**Live demo:** https://hearth-coffee-demo.myshopify.com (password-protected — this is a Shopify Partner development store, which cannot be made public without converting to a paid live store; password: `shopifyCoffee`)
**Recommender API:** https://shopify-hearth-coffee.onrender.com (free Render tier — the first request after idling can take up to ~30s to wake up)

## What this is

A fictional specialty-coffee brand, "Hearth Coffee Co.", built as a demo
Shopify storefront. It's meant to demonstrate:

- Custom Shopify theme development (Liquid, Online Store 2.0 sections/JSON
  templates), built on top of Shopify's official Dawn reference theme and
  heavily customized (color system, typography, copy, section layout) —
  the same starting point most Shopify agencies use for client builds.
- A custom section built from scratch: `sections/roast-quiz.liquid`, a
  "Find your roast" quiz with no theme-editor equivalent in stock Dawn.
- A small external API (`recommender-api/`) that the storefront calls at
  runtime — proof the frontend can talk to a real backend, not just
  Shopify's built-in objects.

## Stack

- **Storefront:** Shopify (Dawn-based custom theme), deployed to a free
  Shopify Partner development store.
- **Recommender API:** Node.js + Express, deployed free on Render.
- **Quiz → API → storefront flow:** the quiz section posts answers to the
  API, which scores a small product catalog and returns the best-matching
  product handles + a reason; the storefront then fetches each product's
  live data from Shopify's public `/products/{handle}.js` endpoint and
  renders result cards — no theme app, no Storefront API token needed.

## Project structure

```
theme/              Shopify theme (Dawn-based, customized)
  sections/roast-quiz.liquid   Custom quiz section
  assets/roast-quiz.js         Quiz frontend logic
  assets/component-roast-quiz.css

recommender-api/     Express API deployed on Render
  server.js
  recommend.js       Scoring logic
  catalog.js         Demo product data (handles must match store products)
```

## Running locally

**Theme:**
```
cd theme
shopify theme dev --store <your-dev-store>.myshopify.com
```

**Recommender API:**
```
cd recommender-api
npm install
npm start
```

## Deployment notes

- Shopify dev stores and the Render free tier both require no credit card,
  so this project costs $0 to host and self-limits (idles/sleeps) rather
  than ever incurring charges.
- The demo products in `recommender-api/catalog.js` (handles like
  `sunrise-blend`, `midnight-roast`) need matching products created in the
  Shopify store admin for the quiz results to resolve to real products.
