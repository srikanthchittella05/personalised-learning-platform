# Personalised Learning Platform

A full-stack adaptive learning platform that tracks student performance and provides AI-powered recommendations using Next.js, FastAPI, PostgreSQL (or SQLite locally), and Scikit-Learn.

## 🏗️ Architecture

- **Frontend**: Next.js 14, React, Tailwind-like CSS, Chart.js. Deployed on Vercel.
- **Backend**: FastAPI (Python), SQLAlchemy, Pydantic, scikit-learn. Deployed on Railway.
- **Database**: SQLite for local dev, PostgreSQL for production.
- **AI/ML Engine**: K-means clustering groups students based on performance, coupled with a heuristic rule-based engine to suggest topics and adjust difficulty.

---

## 🚀 Quick Start (Local Setup)

The easiest way to start both the frontend and backend locally is using the provided start scripts.

### Option 1: Using the Start Script
**Windows:**
Double-click `start.bat` or run:
```bash
.\start.bat
```

**Mac/Linux:**
```bash
bash start.sh
```

### Option 2: Manual Setup

#### 1. Start the Backend
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
The FastAPI backend will start at `http://localhost:8000`. On first run, it automatically seeds the database with quizzes and a demo user.

#### 2. Start the Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The Next.js frontend will start at `http://localhost:3000`. Open this URL in your browser.

---

## ☁️ Deployment Guide

### Deploying the Backend (Railway)
1. Push this repository to GitHub.
2. Go to [Railway.app](https://railway.app/) and create a "New Project" > "Deploy from GitHub repo".
3. Select this repository. Railway will detect the `backend/requirements.txt` and automatically configure a Python environment.
4. **Important**: Change the Build Root directory to `/backend` in the Railway settings.
5. Add a PostgreSQL database plugin in Railway and attach it to your API service. Update the `DATABASE_URL` environment variable if needed.
6. Copy the deployed Railway application URL.

### Deploying the Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and "Add New Project" > "Import from GitHub".
2. Select this repository. 
3. Set the **Framework Preset** to Next.js.
4. Expand **Root Directory** and select `frontend`.
5. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: `<Your Railway Backend URL>`
6. Click Deploy.

---

## 🧠 ML Engine Details
The platform uses an intelligent recommendation sub-system located in `backend/ml/`:
1. **Clustering (`clustering.py`)**: Groups incoming students via K-Means into Beginner, Intermediate, and Advanced tiers based on average query score, total attempts, and time taken.
2. **Difficulty Adjustment (`difficulty.py`)**: Uses performance thresholds to suggest increasing, maintaining, or decreasing future question difficulty.
3. **Recommendation Generator (`recommender.py`)**: Synthesizes the analysis and pinpoints the weakest evaluated topic to generate a final mandate.
