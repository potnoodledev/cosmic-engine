/**
 * Hugging Face image generation utility
 * Uses Hugging Face's text-to-image models to generate card images
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Default model for text-to-image generation
const DEFAULT_MODEL = 'stabilityai/stable-diffusion-3.5-large';

/**
 * Generate an image prompt based on card data
 * @param {Object} card - Card data
 * @returns {string} - Image prompt for text-to-image model
 */
function generateImagePrompt(card) {
  const cardType = card.type || 'minion';
  const cardName = card.name || 'Unknown Card';
  const cardRarity = card.rarity || 'common';
  const description = card.description || '';
  
  // Base prompt components
  let prompt = `fantasy card game art of ${cardName}, `;
  
  // Add type-specific details
  if (cardType === 'minion') {
    // Check for specific creature types in the name or description
    const lowerName = cardName.toLowerCase();
    const lowerDesc = description.toLowerCase();
    
    if (lowerName.includes('dragon') || lowerDesc.includes('dragon')) {
      prompt += `a powerful dragon with scales and wings, `;
      
      // Add ice/frost details for frost dragons
      if (lowerName.includes('frost') || lowerName.includes('ice') || 
          lowerDesc.includes('frost') || lowerDesc.includes('ice') || lowerDesc.includes('freeze')) {
        prompt += `ice breath, frost scales, blue crystal-like appearance, `;
      }
      // Add fire details for fire dragons
      else if (lowerName.includes('fire') || lowerName.includes('flame') || 
               lowerDesc.includes('fire') || lowerDesc.includes('flame') || lowerDesc.includes('burn')) {
        prompt += `breathing fire, red and orange scales, smoke rising, `;
      }
    } 
    else if (lowerName.includes('elemental') || lowerDesc.includes('elemental')) {
      if (lowerName.includes('fire') || lowerDesc.includes('fire')) {
        prompt += `a fire elemental made of flames and embers, `;
      }
      else if (lowerName.includes('water') || lowerDesc.includes('water')) {
        prompt += `a water elemental made of flowing water and mist, `;
      }
      else if (lowerName.includes('earth') || lowerDesc.includes('earth')) {
        prompt += `an earth elemental made of rocks and soil, `;
      }
      else if (lowerName.includes('air') || lowerDesc.includes('air')) {
        prompt += `an air elemental made of swirling winds and clouds, `;
      }
      else {
        prompt += `an elemental being of magical energy, `;
      }
    }
    else {
      // Generic creature
      prompt += `a fantasy creature or character, `;
    }
    
    // Add stats-based details
    if (card.attack && card.health) {
      if (card.attack > 7) {
        prompt += `powerful and imposing, `;
      }
      if (card.health > 7) {
        prompt += `sturdy and resilient, `;
      }
    }
  } 
  else if (cardType === 'spell') {
    prompt += `a magical spell effect, `;
    
    // Add spell-specific details
    const lowerName = cardName.toLowerCase();
    const lowerDesc = description.toLowerCase();
    
    if (lowerName.includes('fire') || lowerName.includes('flame') || 
        lowerDesc.includes('fire') || lowerDesc.includes('flame')) {
      prompt += `with flames, embers, and fire effects, `;
    }
    else if (lowerName.includes('ice') || lowerName.includes('frost') || 
             lowerDesc.includes('ice') || lowerDesc.includes('freeze')) {
      prompt += `with ice crystals, frost, and cold blue energy, `;
    }
    else if (lowerName.includes('shadow') || lowerName.includes('dark') || 
             lowerDesc.includes('shadow') || lowerDesc.includes('dark')) {
      prompt += `with dark shadows, purple energy, and void effects, `;
    }
    else if (lowerName.includes('heal') || lowerName.includes('holy') || 
             lowerDesc.includes('heal') || lowerDesc.includes('holy')) {
      prompt += `with golden light, divine radiance, and healing energy, `;
    }
    else {
      prompt += `with magical energy and arcane symbols, `;
    }
  }
  else if (cardType === 'weapon') {
    prompt += `a fantasy weapon, detailed craftsmanship, `;
  }
  
  // Add rarity-based details
  switch (cardRarity) {
    case 'legendary':
      prompt += `legendary quality, golden glow, epic fantasy art style, `;
      break;
    case 'epic':
      prompt += `epic quality, purple glow, detailed fantasy art, `;
      break;
    case 'rare':
      prompt += `rare quality, blue glow, quality fantasy art, `;
      break;
    default: // common
      prompt += `common item, fantasy art style, `;
  }
  
  // Add description elements if available
  if (description) {
    // Extract key nouns and adjectives from description
    const words = description.split(/\s+/);
    const keyWords = words.filter(word => 
      word.length > 4 && 
      !['with', 'that', 'this', 'from', 'your', 'have', 'when', 'deal'].includes(word.toLowerCase())
    ).slice(0, 3);
    
    if (keyWords.length > 0) {
      prompt += `featuring ${keyWords.join(', ')}, `;
    }
  }
  
  // Add general quality requirements
  prompt += `high quality, detailed fantasy art, digital painting, trending on artstation, sharp focus`;
  
  return prompt;
}

/**
 * Generate an image using Hugging Face's text-to-image model
 * @param {Object} card - Card data
 * @param {string} [model] - Model ID to use (defaults to stable diffusion)
 * @returns {Promise<string>} - Base64 data URL of the generated image
 */
async function generateCardImage(card, model = DEFAULT_MODEL) {
  try {
    // Get API key from environment variables
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      console.error('Hugging Face API key not found in environment variables');
      throw new Error('Hugging Face API key not found in environment variables');
    }

    // Generate prompt based on card data
    const prompt = generateImagePrompt(card);
    console.log(`Generating image with prompt: "${prompt}"`);
    
    // Make sure the card images directory exists
    const imagesDir = path.join(__dirname, '../../public/images/cards');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Generate a safe filename from the card name
    const safeCardName = card.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeCardName}_${Date.now()}.png`;
    const imagePath = path.join(imagesDir, filename);
    
    // Call Hugging Face API to generate image
    const response = await axios.post(`https://router.huggingface.co/hf-inference/models/${model}`, {
      inputs: prompt,
      parameters: {
        negative_prompt: "poorly drawn, blurry, bad anatomy, extra limbs, disfigured, deformed, low quality",
      }
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer'
    });
    
    // Save the image to disk
    fs.writeFileSync(imagePath, response.data);
    
    // Convert the binary data to base64 for data URL
    const base64 = Buffer.from(response.data).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    // Update the card with the image path (relative to public directory)
    const publicImagePath = `/images/cards/${filename}`;
    
    return {
      dataUrl,
      imagePath: publicImagePath
    };
  } catch (error) {
    console.error('Error generating image with Hugging Face:', error);
    throw error;
  }
}

module.exports = {
  generateCardImage,
  generateImagePrompt
}; 