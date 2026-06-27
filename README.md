# InfraMind 🌍

🏆 Built for Google Antigravity Hackathon 2026

### AI-Powered Civic Infrastructure Reporting & Municipal Dispatch Platform

InfraMind is a smart city reporting platform that enables citizens to report civic infrastructure problems such as potholes, water leaks, broken streetlights, illegal dumping, and fallen trees.

Using Google Gemini 2.5 Flash (Vision + Reasoning), Firebase, and Google Maps Platform, the system automatically classifies issues, prioritizes urgency, detects duplicate reports, and routes incidents to the appropriate municipal authority.

---

## Live Demo

🔗 Live Application: https://inframind-prod--inframind-vibe2ship.asia-southeast1.hosted.app/

---

## 2. Problem Statement

Modern cities suffer from highly inefficient civic complaint processing channels. Key pain points include:
*   **Manual Escalation Hurdles:** Citizens must navigate complex department lists to route simple complaints.
*   **Delayed Routing Protocols:** Reports sit in queue lines before reaching the correct authority.
*   **Duplicate Report Inefficiencies:** Multiple citizens reporting the same pothole leads to redundant service tickets.
*   **Lack of Priority Intelligence:** Difficult to identify which potholes or leaks present immediate traffic safety or flooding hazards.
*   **No Automated AI Dispatch Console:** Municipal teams lack a unified operations center running real-time routing engines.

---

## 3. Solution

InfraMind replaces manual processes with a streamlined AI-driven pipeline:

```
[Citizen Uploads Image]
          │
          ▼
[Gemini Vision Analysis] ──► Automatically extracts visual features (e.g. depth of pothole, blockages)
          │
          ▼
[Gemini Core Classification] ──► Dynamically assigns category (Pothole, Water Leak, Sewage, etc.)
          │
          ▼
[Gemini Reasoner Urgency Scoring] ──► Calculates priority score (0-100) based on hazard severity
          │
          ▼
[Maps Engine Locator] ──► Geolocates coordinates, checks duplicates, & assigns to local municipal desk
          │
          ▼
[Firebase Realtime Sync] ──► Syncs record to Firestore DB & logs to live Authority Command Console
```

---

## 4. What Makes InfraMind Different

Traditional civic reporting systems force users to manually search for departments or fill out exhaustive questionnaires, leading to high friction and inaccurate routing. 

InfraMind transforms this experience into an **autonomous municipal dispatch system**:
*   **Instant Visual Comprehension:** Citizens upload a photo, and Google Gemini 2.5 Flash (Vision + Reasoning) instantly extracts the details.
*   **Intelligent Classification:** Visual evidence is categorized automatically (e.g., distinguishing sewage overflow from simple water leaks).
*   **Automatic Urgency Calculation:** The system prioritizes issues by assessing traffic density, road type, and visual danger factors.
*   **Duplicate Elimination:** Integrates with Google Maps Platform to cross-check spatial coordinates and prevent redundant tickets.
*   **Direct-to-Desk Dispatch:** Dynamically routes resolved tickets directly to the correct department's command console.

---

## 5. Key Features

*   📷 **AI Visual Anomaly Detection:** Real-time analysis of uploaded images using Google Gemini 2.5 Flash (Vision + Reasoning).
*   🏷️ **Core Classification & Tagging:** Dynamic issue labeling without human manual classification.
*   🎯 **Google Maps Location Intelligence:** Resolves precise locations, streets, and municipal boundaries.
*   📍 **Interactive Dual-Location Modes:** Choose between live GPS detection or manual drag-and-pin mode.
*   ⚡ **Real-Time Google Gemini Autonomous Agent Pipeline:** Interactive terminal simulator displaying real-time dispatch progress.
*   🤝 **Decentralized Upvoting & Consensus:** Public feed allowing other citizens to upvote existing issues, boosting urgency.
*   🛡️ **Firebase Secure Authentication:** Simple sign-in flows with Google Authentication.
*   💻 **Municipal Authority Command Center:** Dedicated portal showing active issue maps and live dispatch logs.

---

## 6. Tech Stack

### Frontend
*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS & shadcn/ui
*   **State / Context:** React Context API (AuthProvider)

### Backend & Infrastructure
*   **Authentication:** Firebase Authentication (Google Sign-In)
*   **Database:** Cloud Firestore
*   **Storage:** Firebase Storage (Issue Image Uploads)
*   **Realtime Logging:** Firebase Realtime Database

### AI Layer
*   **Core Model:** Google Gemini 2.5 Flash (Vision + Reasoning)
*   **Architecture:** Multi-Agent AI Verification Pipeline

### Location Services
*   **Maps SDK:** Google Maps JavaScript API
*   **Geocoding:** Google Maps Geocoding API (Forward & Reverse Geocoding)
*   **Places:** Google Maps Places Library

---

## 7. AI Multi-Agent Architecture

```
                 [ Citizen Submits Issue ]
                            │
                            ▼
                    [ FIREBASE_SYNC ]
               Uploads Image to Cloud Storage
                            │
                            ▼
                    [ GEMINI_VISION ]
              Detects visual anomaly & features
                            │
                            ▼
                    [ GEMINI_CORE ]
             Validates civic issue & category
                            │
                            ▼
                   [ GEMINI_REASONER ]
             Computes urgency score & priority
                            │
                            ▼
                     [ MAPS_ENGINE ]
           Determines location & routes authority
                            │
                            ▼
                    [ FIREBASE_SYNC ]
             Commits issue record to Firestore
                            │
                            ▼
           [ Live Authority Command Console ]
```

---

## 8. Why This Project Matters

InfraMind provides a scalable blueprint for smart city management in fast-developing urban spaces:
*   **Reduced Overhead:** Reduces manual administrative workload through intelligent automation.
*   **Shorter Resolution Windows:** Enables faster response cycles through automated routing and prioritization.
*   **Enhanced Civic Trust:** Keeping citizens updated via a transparent public feed creates accountability.
*   **Scalable:** Designed to easily plug into large urban municipal databases (like BBMP, PWD, or municipal corporations).

---

## 9. Google Ecosystem Integration

InfraMind leverages a unified Google Native Stack to build a fast, stable, and serverless product:
*   **Google Gemini 2.5 Flash (Vision + Reasoning):** Provides low-latency image analysis and accurate JSON-formatted classification and reasoning.
*   **Google Maps Platform:** Powering the live incident map, marker placement, reverse geocoding, and forward geocoding.
*   **Firebase Authentication:** Guarantees secure, authenticated reports, avoiding spam submissions.
*   **Cloud Firestore & Storage:** Serving as a serverless database and assets storage layer, enabling real-time feed updates.

---

## 10. Project Structure

```
src/
├── app/                    # Next.js 14 App Router Pages
│   ├── api/agents/         # Gemini AI agent route endpoints
│   ├── auth/login/         # Google Authentication login page
│   ├── report/             # Issue reporting form & simulator
│   ├── map/                # Live GIS Incident Map view
│   ├── feed/               # Public issue feed
│   ├── dashboard/          # Citizen dashboard & profile
│   ├── authority/          # Authority Command Portal
│   └── about/              # Static project description page
├── components/
│   ├── ui/                 # Custom shadcn/ui styles
│   ├── map/                # Google Maps components
│   ├── report/             # AI Pipeline Simulator & Form
│   └── layout/             # Shell, Navbar, Footer
├── services/
│   ├── agents/             # Gemini AI Agent prompt handlers
│   │   ├── geminiClient.ts
│   │   ├── classifierAgent.ts
│   │   ├── priorityAgent.ts
│   │   ├── consensusAgent.ts
│   │   └── authorityAgent.ts
│   ├── firebase/           # Firebase client layers
│   │   ├── authService.ts
│   │   ├── firestoreService.ts
│   │   └── storageService.ts
│   └── maps/               # Maps SDK geocoding wrappers
│       └── locationService.ts
├── providers/
│   └── AuthProvider.tsx    # Session provider wrapper
├── types/                  # Typed system schemas
│   ├── issue.ts
│   ├── user.ts
│   ├── authority.ts
│   └── api.ts
└── lib/
    ├── constants.ts        # Domain constants
    ├── prompts.ts          # Gemini instructions library
    └── firebase.ts         # Singleton client setup
```

---

## 11. Potential Scale & Expansion

*   📲 **Progressive Web App (PWA):** Installable on mobile devices with offline-first local database.
*   💾 **Offline Reporting Cache:** Store issue submissions locally when connection drops and sync automatically on reconnect.
*   📊 **Municipal Analytics Portal:** Advanced predictive dashboards for city planning to identify failing infrastructure patterns.
*   🔔 **Real-Time Push Notifications:** Immediate updates to citizens when dispatch crew resolves an issue.
*   📐 **Segmentation models:** Use Edge AI to automatically crop and measure pothole volume or tree blockages.

---

Built for smarter cities, faster infrastructure response, and AI-driven civic governance.

**Powered by Google Gemini • Firebase • Maps Platform**
