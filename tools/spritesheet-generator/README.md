# Gemini Content Generator

This tool uses the Google Gemini API to generate content based on text prompts.

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

1. Run it directly to see an example:
```bash
python gemini_generator.py
```

2. Import and use it in your own code:
```python
from gemini_generator import generate_content

# Generate content with a custom prompt
content = generate_content("Your prompt here")
print(content)
```

## Features

- Uses the Gemini 2.0 Flash Experimental model
- Secure API key handling using environment variables
- Error handling for API calls
- Reusable model instance for multiple generations

## Requirements

- Python 3.7+
- Google Generative AI Python package
- python-dotenv package 