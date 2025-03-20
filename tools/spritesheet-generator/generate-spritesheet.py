import os
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def generate_spritesheet(prompt):
    """
    Generate content using the Gemini API.
    
    Args:
        prompt (str): The prompt to generate content from
    
    Returns:
        str: Generated content
    """

    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    client = genai.Client(api_key=gemini_api_key)
    
    try:
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=prompt)
                ])                
        ]        

        response = client.models.generate_content(
            model="models/gemini-2.0-flash-exp",
            contents=contents,
            config=types.GenerateContentConfig(response_modalities=['Text', 'Image'])
        )
        
        return response
    
    except Exception as e:
        print(f"Error generating spritesheet: {e}")
        return None

def main():
    """Example usage of the content generator."""
    # Example prompt
    concept = "a spritesheet of a stick figure with ramen bowl head walking."
    specs = "5 frames, arrange frames horizontally"
    prompt = f"{concept} {specs}"

    # Generate sheet
    spritesheet = generate_spritesheet(prompt)
    partCount = 0
    
    for part in spritesheet.candidates[0].content.parts:
        if part.text is not None:
            print(part.text)
        elif part.inline_data is not None:
            image = Image.open(BytesIO(part.inline_data.data))
            image.save(f"frame_{partCount}.png")
            partCount += 1

if __name__ == "__main__":
    main() 