# 🌟 KaushalSankalp AI (कौशल संकल्प)
### AI-Enabled Career Counselling & Family Decision-Support Platform for Vocational Education

[![SIH 2026](https://img.shields.io/badge/SIH-2026-orange.svg?style=for-the-badge&logo=target)](https://sih.gov.in)
[![Problem Statement](https://img.shields.io/badge/Problem%20Statement-SIH26241-blue.svg?style=for-the-badge)](https://sih.gov.in)
[![Theme](https://img.shields.io/badge/Theme-Smart%20Education-green.svg?style=for-the-badge)](https://sih.gov.in)
[![Team](https://img.shields.io/badge/Team-TheBIG(O)%20(ID:%20173175)-purple.svg?style=for-the-badge)](https://github.com/vaibhav7549/Kaushal-Sankalp-AI)
[![License](https://img.shields.io/badge/License-MIT-black.svg?style=for-the-badge)](LICENSE)

---

## 📌 Executive Summary

> **"हुनर का फ़ैसला, पूरे परिवार के साथ।"**

**KaushalSankalp AI** is India's first **Voice-First Dyadic Guidance Engine** engineered to solve the chronic low uptake of vocational education in India. While conventional career guidance tools interact solely with the student via text, **90%+ of career decisions in Indian households are driven by parental consensus and social perception**. 

KaushalSankalp bridges this gap through a bilingual, conversational PWA that counsels learners and parents simultaneously, dispels societal stigma with **verified Digital Public Infrastructure (DPI) evidence** (Skill India Digital Hub wages, NAPS stipends, NCrF credits), and algorithmically escalates high-friction sessions ($R_s > 0.75$) to live PMKK tele-counsellors in under 60 seconds.

---

## 🎯 Problem Statement (PS SIH26241)

```
Problem Statement ID: SIH26241
Title: AI-Enabled Career Counselling and Family Decision-Support Platform for Vocational Education
Ministry: Ministry of Skill Development and Entrepreneurship (MSDE)
Category: Software | Theme: Smart Education
```

### The 3-Tier Challenge in the Field

1. **The Academic Degree Trap**: Over **65% of Indian youth** choose general academic degrees (B.A./B.Com) over technical skilling, resulting in **13% overall and 20.4% female educated youth unemployment**. Vocational education (ITIs/PMKVY) is incorrectly perceived as an inferior, dead-end fallback.
2. **Parental Veto & Informal Hearsay**: Parents fear low income, lack of pension, and job instability. For daughters, lack of certified safety, transport, and female trainers leads to direct parental veto.
3. **Failure of Existing AI Career Tools**: Current chatbots are text-heavy, english-biased, ignore family dynamics, hallucinate salary figures, and have **zero human-in-the-loop escalation** when deep parental resistance arises.

---

## 🚀 Key Innovations & Core Features

### 1. 🎙️ Voice-First Dyadic Family PWA
- **Dual-Speaker Modes**: Single-tap toggle between **"Learner Mode"** (aptitudes, future ambitions) and **"Parent Mode"** (income security, social status, workplace safety).
- **Indic Speech Stack**: Multilingual support across **English, Hindi, and Marathi** (scalable to 22 scheduled languages) powered by MeitY Bhashini, Web Speech API, and Google Gemini.
- **Siri / Assistant-Style Interaction**: Natural audio speech feedback, real-time waveform visualizers, and conversational responsiveness.

### 2. 🛡️ Verified DPI Outcome Middleware
- **Verified Placement & Wages**: Real-time queries to **Skill India Digital Hub (SIDH JobX)** proving 84% placement rates and ₹18,500–₹26,000/month 2-year median salaries.
- **Guaranteed NAPS Stipends**: Confirms government-backed apprenticeships paying ₹11,000–₹15,000/month during training.
- **Guaranteed Degree Mobility**: Deposits **40 NSQF credits** directly into the student’s **Academic Bank of Credits (ABC / APAAR ID)** under NEP 2020 and NCrF, preserving lateral entry into B.Voc and B.Tech degrees.

### 3. 📈 Algorithmic Escalation Matrix ($R_s > 0.75$)
- Computes a real-time **Parental Resistance Score ($R_s \in [0, 1]$)** using objection category, emphatic markers, and trajectory decay.
- If $R_s > 0.75$, the platform automatically prepares a **60-Second Structured Case Pack** and triggers instant WebRTC handoff to certified SSDM tele-counsellors or District Skill Committees (DSC).

### 4. 🗺️ District Administrator Telemetry (MSDE / SSDM)
- **Parental Resistance Index (PRI) Heatmaps**: Macro-level GIS visualization identifying specific blocks where parental resistance or female safety concerns are highest.
- **Targeted IEC Budget Tuning**: Enables District Skill Officers to strategically deploy their **2% Information, Education & Communication (IEC)** skilling awareness budgets where hesitation is highest.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   KAUSHALSANKALP SYSTEM PIPELINE                       │
└────────────────────────────────────────────────────────────────────────┘

  [ MOBILE / PMKK KIOSK ]                [ MULTILINGUAL SPEECH ]
  ┌───────────────────────┐              ┌──────────────────────────┐
  │ Voice-First Dyadic UI │ ───────────► │ MeitY Bhashini / Browser │
  │ Learner & Parent Mode │              │ IndicWhisper + TTS       │
  └───────────────────────┘              └──────────────────────────┘
             │                                         │
             ▼                                         ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │           TRIADIC DIALOGUE & MEDIATIVE REASONING ENGINE         │
  │   - Learner Intent Stream vs Parental Objection Stream          │
  │   - Powered by Google Gemini 1.5/2.5 & Multilingual Local RAG   │
  │   - Real-time R_s (Parental Resistance Score) Computation       │
  └─────────────────────────────────────────────────────────────────┘
             │                                         │
             ▼                                         ▼
  ┌─────────────────────────┐               ┌───────────────────────────┐
  │ VERIFIED DPI MIDDLEWARE │               │ HUMAN ESCALATION MATRIX   │
  │ - SIDH JobX Wages       │               │ If R_s > 0.75:            │
  │ - NAPS Stipend Pipeline │               │ Generates Case Pack (<60s)│
  │ - NCrF / ABC Credits    │               │ WebRTC Handoff to PMKK    │
  └─────────────────────────┘               └───────────────────────────┘
             │                                         │
             ▼                                         ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │               ADMINISTRATIVE GIS & TELEMETRIC PORTAL            │
  │  - Block-level PRI Heatmaps for MSDE / SSDM Administrators      │
  │  - Trade Demand-Supply Gaps & 2% IEC Awareness Budget Tuning    │
  └─────────────────────────────────────────────────────────────────┘
```

---

## 🧮 Mathematical Formulation of Resistance ($R_s$)

The Parental Resistance Score ($R_s$) evaluates real-time conversational resistance:

$$R_s = w_1 \cdot \text{ObjectionWeight} + w_2 \cdot \text{Intensity} - w_3 \cdot \text{ConsensusDelta}$$

Where:
- $\text{ObjectionWeight} \in [0.2, 0.9]$ derived from classified category (`SOCIAL_STATUS`, `INCOME_SECURITY`, `FEMALE_SAFETY`, `TRADE_OBSOLESCENCE`).
- $\text{Intensity} \in [0, 1]$ measured by emphatic denial markers (*"कदापि नहीं", "never", "bilkul nahi"*).
- $\text{ConsensusDelta}$ captures positive reframing acceptance over time.
- **Threshold**: When $R_s > 0.75$, automated human counsellor handoff is initiated.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, React Router DOM, Framer Motion |
| **Internationalization** | i18next (English, हिन्दी, मराठी with localStorage persistence) |
| **Speech & Audio** | MeitY Bhashini API, Web Speech API (ASR + TTS `en-IN`, `hi-IN`, `mr-IN`) |
| **Backend API** | FastAPI (Python 3.11), Uvicorn, Pydantic v2, Structlog, HTTPX |
| **AI & LLM** | Google Gemini 1.5 / 2.5 Flash + Deterministic Multilingual RAG Engine |
| **Database** | SQLite + AioSQLite (Default local) / PostgreSQL + AsyncPG (Production) |
| **Deployment** | Render Blueprint (`render.yaml`), Docker-ready |

---

## 📂 Project Directory Structure

```
SIH26241/
├── .env.example              # Template environment variables
├── render.yaml               # Render Infrastructure-as-Code Blueprint
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint & health checks
│   │   ├── config.py         # App configuration & settings
│   │   ├── api/
│   │   │   ├── chat.py       # Conversational turn processing endpoint
│   │   │   ├── sessions.py   # Family profile & session manager
│   │   │   ├── admin.py      # Macro PRI heatmaps & district telemetry
│   │   │   └── escalation.py # Tele-counsellor live queue & case packs
│   │   ├── core/
│   │   │   └── database.py   # Async SQLAlchemy session management
│   │   ├── models/           # DB Models (Session, Turn, Course, RsSnapshot)
│   │   ├── rscore/           # Parental Resistance Score (Rs) calculation engine
│   │   ├── services/
│   │   │   ├── classifier.py # Multilingual objection & distress classifier
│   │   │   └── mediator.py   # Mediative dialogue engine (Gemini + Local RAG)
│   │   └── seed/             # Deterministic Palghar district dataset generator
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx   # Rich overview, trade explorer & architecture
│   │   │   ├── Onboarding.tsx# Language, consent & family context registration
│   │   │   ├── Session.tsx   # Interactive Dyadic Voice Chat with cards & audio
│   │   │   ├── Counsellor.tsx# PMKK tele-counsellor escalation dashboard
│   │   │   └── Admin.tsx     # MSDE / SSDM PRI GIS Heatmap portal
│   │   ├── i18n/             # Translations (en.json, hi.json, mr.json)
│   │   └── App.tsx           # Client router
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite configuration
└── Refrences/
    └── TheBIG(O)_2nd_Idea.pdf# Official SIH 2026 Submission Document
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- **Python 3.10+** (Python 3.11 recommended)
- **Node.js 18+** & `npm`
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/vaibhav7549/Kaushal-Sankalp-AI.git
cd Kaushal-Sankalp-AI
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt

# (Optional) Set your Gemini API key in environment:
# export GEMINI_API_KEY="your-gemini-api-key"

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI backend will start at `http://localhost:8000`. You can explore interactive Swagger docs at `http://localhost:8000/docs`.

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## ☁️ Zero-Touch Deployment on Render (100% Free Tier)

This repository includes a native [render.yaml](render.yaml) blueprint:

1. Create a free account at [Render.com](https://render.com/).
2. On your Render dashboard, click **"New +"** > **"Blueprint"**.
3. Select this repository: `vaibhav7549/Kaushal-Sankalp-AI`.
4. Click **"Apply Blueprint"**. Render will automatically configure and deploy:
   - **`kaushal-sankalp-backend`** (Python Web Service - Free Tier)
   - **`kaushal-sankalp-frontend`** (React Static Site - Free Tier)
5. (Optional): In the Render dashboard, add `GEMINI_API_KEY` under the Backend Environment Variables for unlimited real-time Gemini generation.

---

## 📚 Academic & Policy Citations

1. **NITI Aayog (2026)**: *Reimagining Skilling for Viksit Bharat@2047* — Pathway Clinics, Skill Scout, and National Career Outcome Repository.
2. **MoSPI (2023–24)**: *Periodic Labour Force Survey (PLFS)* — Vocational and technical training participation and educated youth unemployment.
3. **MSDE / PIB (2026)**: *Skills, Scale and Transformation* — PMKVY, Skill India Digital Hub (SIDH) & Apprenticeship Ecosystem.
4. **NCVET / NCrF**: *National Credit Framework* — Guidelines for assignment of credits across vocational and general education.
5. **MeitY Digital India Corporation**: *BHASHINI Language Intelligence Stack*.
6. **Schneider (2023/2024)**: *The Attractiveness of Polytechnics in Delhi and Mumbai: Student and Parent Perceptions*.
7. **Ajithkumar, U. & Pilz, M. (2019)**: *Attractiveness of Industrial Training Institutes (ITI) in India: A study on ITI students and their parents.* Education + Training, 61(2), 153–168.

---

## 👥 The Team

**Team Name**: TheBIG(O)  
**Team ID**: 173175  
**Hackathon**: Smart India Hackathon 2026  
**Problem Statement**: SIH26241 (Ministry of Skill Development & Entrepreneurship)  

*Built with ❤️ for Viksit Bharat @ 2047.*
