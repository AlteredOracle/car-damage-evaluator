# Deployment Guide 🚀

## Overview
This project consists of two parts that need to be deployed separately (or as two services):
1.  **Backend (FastAPI)**: Needs a Python environment.
2.  **Frontend (Next.js)**: Needs a Node.js environment.

---

## Option A: Render.com (Recommended & Free)
Render is great because it supports both Python and Node.js easily.

### 1. Backend Deployment
1.  Push your code to GitHub.
2.  Create a new **Web Service** on Render.
3.  Connect your GitHub repo.
4.  **Settings**:
    *   **Root Directory**: `.` (or leave empty)
    *   **Runtime**: Python 3
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5.  **Environment Variables**:
    *   Add `GOOGLE_API_KEY`: (Your Gemini API Key)
    *   Add `PYTHON_VERSION`: `3.9.0` (optional but recommended)

### 2. Frontend Deployment
1.  Create another **Web Service** (or Static Site) on Render/Vercel.
2.  Connect the same GitHub repo.
3.  **Settings**:
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Start Command**: `npm run start`
4.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: **<YOUR_BACKEND_URL>** (e.g., `https://car-damage-backend.onrender.com`)

---

## Option B: Vercel (Frontend Only)
Vercel is the creators of Next.js, so it's perfect for the frontend.

1.  Go to Vercel and "Import Project" from GitHub.
2.  Select your repo.
3.  **Root Directory**: Edit this to select `frontend`.
4.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: Your Backend URL (deploy backend first on Render!)
5.  Deploy!

---

## Troubleshooting
- **CORS Errors**: If frontend fails to call backend, check `backend/main.py`. ensure `allow_origins=["*"]` is set (it is by default in this project).
- **Missing API Key**: Ensure `GOOGLE_API_KEY` is set in the Backend service settings.
