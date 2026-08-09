# Mera Awaaz Mera Adhikar (v2.1.0)
## Next-Generation AI-Driven Civic Welfare & Grievance Governance Platform

Mera Awaaz Mera Adhikar is a state-of-the-art civic empowerment web application integrating AI-driven welfare scheme recommendation matching, anonymous geolocation issue reporting, transparent public telemetry, and municipal authority SLA command.

---

## Important Links

- **GitHub Repository:** [https://github.com/SramanaPatra/Mera-Awaaz-Mera-Adhikaar](https://github.com/SramanaPatra/Mera-Awaaz-Mera-Adhikaar)
- **Live Web Deployment:** [https://mera-awaaz-mera-adhikaar.onrender.com](https://mera-awaaz-mera-adhikaar.onrender.com)
- **Google Drive (Presentation PPT & Demo Video):** [https://drive.google.com/drive/folders/1hGT2hKgqoVoRaRTzpDKTpcNbWOv0e0dV?usp=sharing](https://drive.google.com/drive/folders/1hGT2hKgqoVoRaRTzpDKTpcNbWOv0e0dV?usp=sharing)

---

## Development Team

- **Sramana Patra** (Project Lead & System Architecture)
- **Baivabi Chakraborty** (Welfare Engine & PDF Exporter)
- **Arunima Ghosh** (Multilingual Voice AI & SOS Telemetry)
- **Debriddhi Ghosh** (Public Telemetry & Authority Command Portal)

---

## Core Features & Architecture

1. **Role Selection & Account Security:**
   - Account creation flow with explicit role selection (`Citizen Self-Service` vs `Authority Command Officer`).
   - HMAC-SHA256 JWT security middleware protecting administrative governance APIs.

2. **Welfare Recommendation Engine & Math Rationale:**
   - Evaluates citizen age, gender, income, location, and occupation against central and state schemes.
   - Blank input initialization ensuring no pre-filled or fabricated recommendations until user submission.
   - Expandable mathematical scoring rationale (*Income: 35/35 PTS, Jurisdiction: 35/35 PTS, Occupation: 30/30 PTS*).

3. **1-Click PDF Entitlement Certificate Exporter:**
   - Generates official, QR-coded printable verification certificates for offline submission at government offices.

4. **Multilingual Voice AI (Ask Adhikar AI):**
   - Integrated voice speech recognition and Text-to-Speech (TTS) synthesis across 6 Indian languages (Hindi, English, Marathi, Tamil, Telugu, Bengali).
   - Automatic conversation window clearing when switching language selection.

5. **Anonymous Geolocation Issue Reporting:**
   - Anonymous grievance filing with satellite GPS coordinate binding and encrypted tracking hashes (e.g. `#0x8F92A47B`).

6. **Public Telemetry Ledger & 4-Stage SLA Stepper:**
   - Transparent audit ledger featuring community upvoting and an interactive 4-stage resolution timeline (`LOGGED -> OFFICER REVIEW -> INSPECTION -> RESOLVED`).

7. **Authority Command Portal & Data Analytics:**
   - Database-connected officer portal featuring Ward-wise Grievance Density Heatmaps, Monthly Resolution Velocity Bar Charts, and live status resolution (`Resolve` / `Escalate`).

8. **Progressive Web App (PWA) Offline Support:**
   - Web App Manifest (`manifest.json`) and Service Worker (`sw.js`) using a Network-First strategy for automatic updates without manual browser hard resets.

9. **Persistent Server-Side File Storage:**
   - Persistent JSON disk storage (`server/data/complaints.json` & `server/data/users.json`) guaranteeing 100% data retention across browser reloads and server restarts.

---

## Technology Stack

- **Frontend:** React 18, Vite 5, TailwindCSS, Web Speech API
- **Design System:** Stitch 3D Glassmorphism, Vanilla CSS backdrop blur, dynamic 3D perspective tilt interactions
- **Backend:** Node.js, Express, HMAC-SHA256 JWT, JSON Disk Storage
- **PWA:** Service Worker (`sw.js`), Web App Manifest (`manifest.json`)

---

## Local Setup Instructions

```bash
git clone https://github.com/SramanaPatra/Mera-Awaaz-Mera-Adhikaar.git
cd Mera-Awaaz-Mera-Adhikaar
npm install
npm run build
npm run server
```

- **Frontend Application:** `http://localhost:3000`
- **Backend API Server:** `http://localhost:5000`
