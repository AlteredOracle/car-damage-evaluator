from google import genai
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

key = os.getenv("GOOGLE_API_KEY")
if key:
    print(f"Key found: {key[:5]}...{key[-5:] if len(key)>5 else ''}")
    client = genai.Client(api_key=key.strip())
else:
    print("ERROR: No GOOGLE_API_KEY found")
    exit(1)

# Models to test with new SDK
# Note: "gemini-3-pro-preview" might work if user has access, otherwise fallback to "gemini-2.0-flash-exp" or "gemini-1.5-flash"
models_to_test = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-3-pro-preview" 
]

for m in models_to_test:
    print(f"\n--- Testing {m} ---")
    try:
        response = client.models.generate_content(
            model=m,
            contents="Explain how AI works in a few words",
        )
        print(f"SUCCESS! Response: {response.text}")
        break
    except Exception as e:
        print(f"FAILED: {e}")
