import os
import google.generativeai as genai
from dotenv import load_dotenv

# 1. Load the API Key from the .env file
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# 2. Configure Gemini
genai.configure(api_key=api_key)

# 3. The Function to Generate Text
def generate_document_content(prompt_text: str):
    try:
        # We use the 'gemini-pro' model which is good for text
        # model = genai.GenerativeModel('gemini-3-pro')
        # model = genai.GenerativeModel('gemini-1.5-pro')
        # We use the specific model found in your list
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Ask Gemini to generate content
        response = model.generate_content(prompt_text)
        
        # Return the text it wrote
        return response.text
    except Exception as e:
        return f"Error generating content: {str(e)}"