# Car Damage Evaluator 🚗💥

A modern web application that uses **Generative AI (Google Gemini)** to detect, analyze, and highlight damage on vehicle images. Built for demonstration and damage assessment workflows.

![App Screenshot](frontend/public/screenshot.png) 
*(Note: You can add a screenshot of the app here)*

## ✨ Features
- **AI-Powered Detection**: Uses **Gemini models** to identify dents, scratches, broken glass, and more.
- **Visual Highlighting**: Draws bounding boxes around detected damage.
- **Model Selection**: Choose specific Gemini models (Flash, Pro, etc.) dynamically.
- **Responsive UI**: Built with Next.js and Tailwind CSS for a premium look.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, Python 3.9+, Google GenAI SDK
- **AI Model**: Google Gemini (Multimodal LLM)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- A Google Cloud API Key for Gemini (Get one at [Google AI Studio](https://aistudio.google.com/))

### 1. Backend Setup (Python)

Create and activate a virtual environment (in the root):
```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
.\venv\Scripts\activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```bash
GOOGLE_API_KEY=your_actual_api_key_here
```

Run the server:
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
*The backend should now be running at `http://localhost:8000`*

### 2. Frontend Setup (Next.js)

Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

### 3. Usage
- Open **http://localhost:3000** in your browser.
- Select an AI Model from the top right.
- Upload or drag & drop a car photo.
- Watch the AI detect the damages!

---

## 🛡️ License
MIT
