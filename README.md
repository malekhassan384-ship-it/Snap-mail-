# SnapMail

Disposable temporary email web application with live incoming messages, auto-expiry, safe sandboxed rendering, and Arabic/English bilingual support.

**Developed & Designed by Malek Hassan Ashour**

---

## Features
- **Fast & Automatic**: Generates a temporary disposable email inbox in ~2 seconds on first load using the public `mail.tm` REST API directly from the browser.
- **Dynamic Domains**: Fetches active public domains from `GET /domains` without hardcoding.
- **Security & Sandboxing**:
  - Email HTML sanitized with DOMPurify (stripping scripts, forms, and style tags).
  - Sandboxed iframe (`sandbox="allow-popups allow-popups-to-escape-sandbox"`, `referrerpolicy="no-referrer"`).
  - Remote images blocked by default with one-click user unblocking.
- **Auto-Expiration & Account Cleanup**:
  - Configurable 10-minute timer with +10m extension.
  - Automatically deletes account and clears browser tokens when countdown hits zero.
- **Smart OTP / Verification Code Chip**:
  - Automatically identifies 4-to-8 digit verification codes from incoming email bodies and highlights them with a one-tap copy button.
- **Bilingual Arabic & English**:
  - Seamless RTL (Right-to-Left) and LTR layout mirroring.
  - Email addresses and verification codes remain strictly LTR formatted.
- **In-Browser QR Code Generation**:
  - Generates client-side QR codes for mobile scanning without third-party services.
- **Privacy & Storage**:
  - Credentials stored in session storage (or local storage if user activates "Keep this inbox").
  - Clean client-side architecture with zero telemetry or backend tracking.

---

## Known risks

- **mail.tm Service Terms & SLA**: mail.tm is a free third-party service with no service-level agreement, and its usage rules, as quoted by a community library, forbid earning money from software that uses only its API. Ads stay off until the owner has written permission.
- **Domain Deliverability**: Sites may block the mail.tm domains, which would make addresses unusable for sign-ups. Measure acceptance on a fixed list of services before promoting the product.
- **Hosting and Commercial Use**: If the site is later monetized, the free Vercel plan does not allow commercial use; a paid plan or another host is needed.
