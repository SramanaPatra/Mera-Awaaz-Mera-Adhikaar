# Mera Awaaz Mera Adhikar (v2.1.0)
## Next-Gen Civic Welfare & Grievance Governance Platform

Mera Awaaz Mera Adhikar is a state-of-the-art civic empowerment web application integrating AI-driven welfare scheme recommendation matching, anonymous geolocation issue reporting, transparent public telemetry, and municipal authority SLA command.

---

## Core Features & Architecture

1. **Stitch 3D Glassmorphism UI & Video Background:**
   - Responsive full-screen landscape video background (`bg.mp4`).
   - Frosted glass cards (`.glass-card`, `.glass-panel`), 3D mouse perspective tilt interactions, and yellow accent glow halos (`.accent-glow`).

2. **Secure Role-Based Authentication (Citizen vs. Authority):**
   - Mandatory sign-in gate before accessing platform views.
   - HMAC-SHA256 JWT authorization middleware for protected administrative APIs.
   - Pre-filled credentials on sign-in screen post-logout.

3. **Citizen Entitlements & PDF Exporter:**
   - Verified Citizen Profile window displaying Aadhaar linkage, unique health ID, and linked document vault.
   - 1-click **Export Entitlements Certificate (PDF)** generating printable official verification documents.

4. **Welfare Recommendation Engine & Mathematical Rationale:**
   - Matches citizen income, occupation, and municipal location against state schemes.
   - Explanatory rationale cards displaying exact mathematical point breakdowns (*Income: 35/35 PTS, Jurisdiction: 35/35 PTS, Occupation: 30/30 PTS*).

5. **Ask Adhikar AI Support Bot:**
   - Multilingual voice recognition and speech synthesis across 6 Indian languages.
   - Automatic message window clearing upon changing language selection.

6. **Public Grievance Telemetry & SLA Timeline:**
   - Transparent public ledger with upvoting and location descriptors.
   - Interactive 4-stage resolution SLA timeline (`LOGGED -> OFFICER REVIEW -> INSPECTION -> RESOLVED`).

7. **Authority Command Portal & Data Visualizations:**
   - Officer SLA dashboard with SVG resolution velocity charts and ward grievance density heatmaps.

8. **Progressive Web App (PWA) Offline Support:**
   - `manifest.json` metadata and `sw.js` service worker caching static assets for offline rural connectivity.

---

## Tech Stack

- **Frontend:** React 18, Vite 5, TailwindCSS
- **Backend:** Node.js, Express, JWT, Web Speech API
- **Design System:** Vanilla CSS Glassmorphism, Material Symbols Outlined, Hanken Grotesk / Be Vietnam Pro Fonts

---

## Running Locally

```bash
npm install
npm run dev
npm run server
```

- **Frontend Application:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000`
