# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- Public website and management console: Nuxt 3 + Vue 3 + TypeScript.
- Backend API: Nuxt server routes with TypeScript.
- Database: MySQL 8.x, accessed by the server through `mysql2`; `prisma/schema.prisma` documents the intended data model.
- Product media: local `public/assets/images/` during development; the upload/storage strategy can be replaced for production deployment.
- Deployment: Node.js + HTTPS, typically behind Nginx or another reverse proxy.
- The old static HTML/CSS/JavaScript prototype has been removed from the active application path.
- No WordPress dependency.

## Users

Primary users are wholesale buyers, export procurement staff, domestic distributors, and project buyers sourcing shower sets and faucets.

## Product Purpose

The website presents Hongcai Wanfu's shower-set and faucet range, helps buyers understand the supply scope, and converts product interest into catalog requests, sample requests, quotations, and project inquiries.

## Positioning

Hongcai Wanfu is presented as a focused supplier of shower sets, basin faucets, shower and bath faucets, and kitchen faucets, combining a clear product system with procurement-ready information rather than a consumer retail storefront.

## Operating Context

Visitors arrive from domestic channels, export outreach, search, and referrals. They need to browse products quickly, compare categories, download materials, and contact sales without needing an account. Internal staff need a simple console to maintain products, categories, downloads, scenarios, inquiries, and basic site settings.

## Capabilities and Constraints

- The working catalogue taxonomy is now three groups: sanitaryware products, bathroom hardware, and installation parts. It contains the temporary category tree supplied by the user; categories without verified product materials remain clearly marked as placeholders.
- The public site supports Chinese first with an English language layer.
- The first release is catalog and inquiry focused; no cart, payment, or complex membership system is required.
- Product images and content that are not supplied must be marked as illustrative or pending replacement; do not invent certifications, customers, factories, or performance data.
- The management console should support one or a few internal administrators, image uploads, publish/draft states, and inquiry review.

## Brand Commitments

- Brand: 红财万富 / HONGCAI WANFU.
- Existing logo asset: `C:/Users/2026/Desktop/网站资料/0.png`.
- Existing product asset: `C:/Users/2026/Desktop/网站资料/LTA-822主图.png`.
- Additional screenshots supplied by the user confirm faucet categories and model T3013, but are not high-resolution standalone product assets.
- The user wants a more premium, dynamic, high-end presentation inspired by `https://www.bzsanitary.com/`, while keeping the company's own product scope and truthful claims.

## Evidence on Hand

- Logo file supplied by the user.
- LTA-822 shower main image supplied by the user.
- Product-reference screenshots supplied by the user for basin, shower, bath, deck-mounted, swivel, and wall-mounted kitchen faucets, plus a user-approved temporary catalogue taxonomy covering sanitaryware, bathroom hardware, and installation parts.
- A reference website was inspected for full-viewport hero motion, sticky navigation, category cards, product grid, manufacturing proof, cases, and contact widget patterns.
- Company contact details, full product data, factory evidence, certifications, and real cases are not yet supplied.

## Product Principles

- Procurement clarity before decoration.
- Show the product system, not a random product wall.
- Make every claim traceable to supplied evidence.
- Use motion to reveal material and capability, not to distract from product selection.

## Accessibility & Inclusion

- Responsive from mobile through desktop.
- Keyboard-visible focus states.
- Respect reduced-motion preferences.
- Keep text, controls, and form labels readable in both Chinese and English.
