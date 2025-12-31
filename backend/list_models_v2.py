from google import genai
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

key = os.getenv("GOOGLE_API_KEY")
if not key:
    print("Error: No API key found.")
    exit(1)

client = genai.Client(api_key=key.strip())

try:
    print("Fetching available models...")
    # Pager over the models
    for m in client.models.list():
        print(f"- {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")
