import os
import io
import json
import random
from typing import List, Optional
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google import genai
from PIL import Image
from dotenv import load_dotenv

# Load .env from the same directory as this file
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="Car Damage Evaluator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini Client
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
client = None
SUPPORTED_MODELS = ["gemini-1.5-flash", "gemini-2.0-flash"] # Default fallback

if GOOGLE_API_KEY:
    GOOGLE_API_KEY = GOOGLE_API_KEY.strip()
    try:
        client = genai.Client(api_key=GOOGLE_API_KEY)
        
        # Dynamic fetch of models
        try:
            print("Fetching available models from Google API...")
            fetched_models = []
            for m in client.models.list():
                name = m.name.replace("models/", "")
                if "gemini" in name.lower() and "embedding" not in name.lower():
                    fetched_models.append(name)
            
            if fetched_models:
                # specific ordering preference: newer/flash models first if possible, but distinct
                # or just simple sort
                fetched_models.sort()
                # prioritize some popular ones to top if they exist
                priority = ["gemini-2.0-flash", "gemini-1.5-flash"]
                for p in reversed(priority):
                    if p in fetched_models:
                        fetched_models.remove(p)
                        fetched_models.insert(0, p)
                
                SUPPORTED_MODELS = fetched_models
                print(f"Dynamically loaded {len(SUPPORTED_MODELS)} models.")
        except Exception as e:
            print(f"Failed to fetch dynamic models: {e}")

    except Exception as e:
        print(f"Failed to initialize Gemini Client: {e}")

@app.get("/")
def read_root():
    return {"message": "Car Damage Evaluation API is running (v2 GenAI SDK)"}

@app.get("/models")
def get_models():
    """Returns the list of supported Gemini models."""
    return {"models": SUPPORTED_MODELS}

@app.post("/detect")
async def detect_damage(
    file: UploadFile = File(...),
    model: str = "gemini-3-flash-preview"  # Default model
):
    """
    Receives an image and a selected model to detect car damage.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Validate model
    selected_model = model if model in SUPPORTED_MODELS else SUPPORTED_MODELS[0]

    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    if not client:
        print("No Gemini Client initialized. Returning simulated data.")
        return {"damages": get_simulated_damage(), "source": "simulation"}

    try:
        print(f"Attempting to use model: {selected_model}")
        
        prompt = """
        Indentify ALL visible exterior damages. 
        CRITICAL: actively look for and explicitly list specific broken components separately from general body damage.
        
        You must check for and list:
        - Broken Headlights / Taillights (List these separately!)
        - Broken / Cracked / Missing Side Mirrors (List these separately!)
        - Cracked / Shattered Glass (Windshield, Windows)
        - Dents/Scratches on specific panels (Hood, Bumper, Fenders, Doors)
        - Misaligned panels or Grille damage

        Return the result as a JSON object with a list of "damages".
        For each damage found, provide:
        - "label": Specific description (e.g. "Broken Side Mirror", "Deep Scratch on Front Door")
        - "box_2d": A bounding box [ymin, xmin, ymax, xmax] normalized to 0-1000 scale.
        - "score": Confidence score (0.0 to 1.0).
        
        If no damage is found, return empty list.
        IMPORTANT: Return ONLY valid JSON. Do not use markdown code blocks.
        """
        
        # New SDK call structure
        response = client.models.generate_content(
            model=selected_model,
            contents=[prompt, image]
        )
        
        text_response = response.text
        # Clean up code blocks if present
        if "```json" in text_response:
            text_response = text_response.replace("```json", "").replace("```", "")
        elif "```" in text_response:
            text_response = text_response.replace("```", "")
        
        try:
            data = json.loads(text_response)
            return {
                "damages": data.get("damages", []), 
                "source": "gemini", 
                "model": selected_model
            }
        except json.JSONDecodeError:
                print(f"Failed to parse JSON from {selected_model}. Raw:", text_response)
                return {
                    "damages": [], 
                    "error": "Failed to parse AI response", 
                    "raw": text_response, 
                    "source": "gemini_error"
                }

    except Exception as e:
        print(f"Error calling {selected_model}: {e}")
        return {
            "damages": get_simulated_damage(), 
            "source": "simulation_fallback", 
            "error": str(e),
            "debug_info": f"Model: {selected_model}. Client valid: {client is not None}"
        }
