import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load the key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("--- CHECKING AVAILABLE MODELS ---")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"Model Name: {m.name}")
    print("--- END OF LIST ---")
except Exception as e:
    print(f"ERROR: {e}")