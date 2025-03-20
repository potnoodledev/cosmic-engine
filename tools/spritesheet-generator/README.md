# Spritesheet Generator

This tool uses the Google Gemini API to generate sprite animations based on text prompts.

## Setup

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the same directory with your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

## Usage

You can use the script in two ways:

1. Run it directly to generate a sample spritesheet:
```bash
python generate-spritesheet.py
```

2. Import and use it in your own code:
```python
from generate_spritesheet import generate_spritesheet

# Generate a spritesheet with a custom prompt
prompt = "a spritesheet of a stick figure with ramen bowl head walking. 5 frames, arrange frames horizontally"
spritesheet = generate_spritesheet(prompt)

# Process the generated frames
for part in spritesheet.candidates[0].content.parts:
    if part.text is not None:
        print(part.text)
    elif part.inline_data is not None:
        # Save each frame as a separate image
        image = Image.open(BytesIO(part.inline_data.data))
        image.save(f"frame_{frame_count}.png")
        frame_count += 1
```

## Features

- Uses the Gemini 2.0 Flash Experimental model for image generation
- Generates multiple frames for sprite animations
- Secure API key handling using environment variables
- Error handling for API calls
- Supports custom prompts for different sprite concepts

## Requirements

- Python 3.7+
- Google Generative AI Python package
- python-dotenv package
- Pillow (PIL) for image processing 