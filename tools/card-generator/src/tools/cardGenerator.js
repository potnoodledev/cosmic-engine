const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const OpenAI = require('openai');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Card Generator Tool for Cursor
 * This script allows generating cards via Cursor's prompting
 */

// Card generation parameters
const CARD_PARAMS = {
  minCost: 1,
  maxCost: 10,
  minAttack: 0,
  maxAttack: 12,
  minHealth: 1,
  maxHealth: 12
};

// Card types
const CARD_TYPES = ['minion', 'spell'];

/**
 * Generate a card based on the provided parameters
 * @param {Object} params - Card generation parameters
 * @param {Object} options - Additional options
 * @param {boolean} [options.generateImage=false] - Whether to generate an image for the card
 * @param {string} [options.imagePath] - Path to save the image (if generateImage is true)
 * @returns {Object} Generated card data
 */
async function generateCard(params, options = {}) {
  // Default parameters
  const name = params.name || generateRandomName();
  const type = params.type && CARD_TYPES.includes(params.type.toLowerCase()) 
    ? params.type.toLowerCase() 
    : 'minion';
  const description = params.description || 'A mysterious card with unknown powers.';
  
  // Generate card data
  const cardData = {
    name: name,
    type: type,
    cost: calculateCost(params, type),
    description: description,
    flavor: params.flavor || generateFlavorText(name, type)
  };
  
  // Add attack and health for minions
  if (type === 'minion') {
    cardData.attack = calculateAttack(params);
    cardData.health = calculateHealth(params);
  }
  
  // Generate image if requested
  if (options.generateImage) {
    try {
      cardData.imageUrl = await generateImageWithAPI(cardData);
    } catch (error) {
      console.error('Error generating image:', error);
    }
  }
  
  return cardData;
}

/**
 * Calculate appropriate cost for a card
 * @param {Object} params - Card parameters
 * @param {string} type - Card type
 * @returns {number} Calculated cost
 */
function calculateCost(params, type) {
  if (params.cost) {
    return clamp(params.cost, CARD_PARAMS.minCost, CARD_PARAMS.maxCost);
  }
  
  // For minions, cost is based on attack and health
  if (type === 'minion') {
    const attack = params.attack || randomInt(1, 5);
    const health = params.health || randomInt(1, 5);
    
    // Base cost formula: (attack + health) / 2
    let baseCost = Math.ceil((attack + health) / 2);
    
    // Adjust for keywords in description
    if (hasKeyword(params.description, ['taunt', 'divine shield', 'charge'])) {
      baseCost += 1;
    }
    if (hasKeyword(params.description, ['battlecry', 'deathrattle'])) {
      baseCost += 1;
    }
    
    return clamp(baseCost, CARD_PARAMS.minCost, CARD_PARAMS.maxCost);
  }
  
  // For spells, cost is based on description
  if (type === 'spell') {
    let baseCost = 3; // Default cost
    
    // Adjust for keywords in description
    if (hasKeyword(params.description, ['damage', 'destroy', 'attack'])) {
      baseCost += 1;
    }
    if (hasKeyword(params.description, ['all', 'every', 'each'])) {
      baseCost += 2;
    }
    if (hasKeyword(params.description, ['heal', 'restore', 'health'])) {
      baseCost -= 1;
    }
    
    return clamp(baseCost, CARD_PARAMS.minCost, CARD_PARAMS.maxCost);
  }
  
  // Default cost
  return randomInt(CARD_PARAMS.minCost, CARD_PARAMS.maxCost);
}

/**
 * Calculate appropriate attack for a minion
 * @param {Object} params - Card parameters
 * @returns {number} Calculated attack
 */
function calculateAttack(params) {
  if (params.attack) {
    return clamp(params.attack, CARD_PARAMS.minAttack, CARD_PARAMS.maxAttack);
  }
  
  let baseAttack = randomInt(1, 5);
  
  // Adjust for keywords in description
  if (hasKeyword(params.description, ['powerful', 'strong', 'damage', 'attack'])) {
    baseAttack += 2;
  }
  if (hasKeyword(params.description, ['weak', 'small', 'tiny'])) {
    baseAttack -= 1;
  }
  
  return clamp(baseAttack, CARD_PARAMS.minAttack, CARD_PARAMS.maxAttack);
}

/**
 * Calculate appropriate health for a minion
 * @param {Object} params - Card parameters
 * @returns {number} Calculated health
 */
function calculateHealth(params) {
  if (params.health) {
    return clamp(params.health, CARD_PARAMS.minHealth, CARD_PARAMS.maxHealth);
  }
  
  let baseHealth = randomInt(1, 5);
  
  // Adjust for keywords in description
  if (hasKeyword(params.description, ['tough', 'durable', 'health', 'defensive'])) {
    baseHealth += 2;
  }
  if (hasKeyword(params.description, ['fragile', 'weak', 'small'])) {
    baseHealth -= 1;
  }
  if (hasKeyword(params.description, ['taunt'])) {
    baseHealth += 1;
  }
  
  return clamp(baseHealth, CARD_PARAMS.minHealth, CARD_PARAMS.maxHealth);
}

/**
 * Check if text contains any of the specified keywords
 * @param {string} text - Text to check
 * @param {Array<string>} keywords - Keywords to look for
 * @returns {boolean} True if any keyword is found
 */
function hasKeyword(text, keywords) {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Generate a random name for a card
 * @returns {string} Random card name
 */
function generateRandomName() {
  const prefixes = ['Ancient', 'Mystic', 'Fiery', 'Frozen', 'Arcane', 'Divine', 'Shadow', 'Emerald', 'Golden', 'Cursed'];
  const nouns = ['Dragon', 'Warrior', 'Mage', 'Priest', 'Knight', 'Elemental', 'Beast', 'Spirit', 'Guardian', 'Titan'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${prefix} ${noun}`;
}

/**
 * Generate flavor text for a card
 * @param {string} name - Card name
 * @param {string} type - Card type
 * @returns {string} Generated flavor text
 */
function generateFlavorText(name, type) {
  const flavorTexts = [
    "It's not as powerful as it looks. It's more powerful.",
    "Legends say it once defeated an entire army. The legends are exaggerating... slightly.",
    "Don't let its appearance fool you. It's exactly as dangerous as it looks.",
    "Some say it's friendly. Those people are no longer with us.",
    "Created during a magical experiment gone wrong... or perhaps gone exactly right.",
    "It collects rare artifacts and the souls of its enemies.",
    "Surprisingly good at card games.",
    "Has a soft spot for kittens, but don't tell anyone.",
    "The last person who made fun of its name is now a small ornamental shrub.",
    "It's just doing its best."
  ];
  
  return flavorTexts[Math.floor(Math.random() * flavorTexts.length)];
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Save a card to the cards.json file
 * @param {Object} cardData - Card data to save
 */
function saveCard(cardData) {
  const cardsFilePath = path.join(__dirname, '../assets/data/cards.json');
  
  // Read existing cards
  let cardsData;
  try {
    const fileData = fs.readFileSync(cardsFilePath, 'utf8');
    cardsData = JSON.parse(fileData);
  } catch (error) {
    // If file doesn't exist or is invalid, create a new cards object
    cardsData = { cards: [] };
  }
  
  // Add new card
  cardsData.cards.push(cardData);
  
  // Write back to file
  fs.writeFileSync(cardsFilePath, JSON.stringify(cardsData, null, 2), 'utf8');
  
  console.log(`Card "${cardData.name}" saved successfully!`);
  return cardData;
}

/**
 * Generate an image prompt for a card
 * @param {Object} cardData - Card data
 * @returns {string} Image prompt for AI image generation
 */
function generateImagePrompt(cardData) {
  const { name, type, description } = cardData;
  
  // Base prompt parts
  let prompt = `Fantasy card game art of ${name}, `;
  
  // Add type-specific details
  if (type === 'minion') {
    // Extract creature type from name or description
    const creatureTypes = [
      'dragon', 'warrior', 'mage', 'priest', 'knight', 'elemental', 
      'beast', 'spirit', 'guardian', 'titan', 'demon', 'murloc', 
      'undead', 'goblin', 'elf', 'dwarf', 'orc', 'troll'
    ];
    
    let creatureType = 'character';
    for (const type of creatureTypes) {
      if (name.toLowerCase().includes(type) || description.toLowerCase().includes(type)) {
        creatureType = type;
        break;
      }
    }
    
    prompt += `a ${creatureType} `;
    
    // Add attributes based on description
    if (description.toLowerCase().includes('fire') || description.toLowerCase().includes('flame')) {
      prompt += 'with flames and fire effects, ';
    }
    if (description.toLowerCase().includes('ice') || description.toLowerCase().includes('frost')) {
      prompt += 'with ice and frost effects, ';
    }
    if (description.toLowerCase().includes('shadow') || description.toLowerCase().includes('dark')) {
      prompt += 'with dark shadowy aura, ';
    }
    if (description.toLowerCase().includes('holy') || description.toLowerCase().includes('divine')) {
      prompt += 'with divine light and holy aura, ';
    }
    if (description.toLowerCase().includes('taunt') || description.toLowerCase().includes('defend')) {
      prompt += 'in a defensive stance, ';
    }
    if (description.toLowerCase().includes('charge') || description.toLowerCase().includes('attack')) {
      prompt += 'in an aggressive attack pose, ';
    }
  } else {
    // For spells
    prompt += 'a magical spell ';
    
    // Add attributes based on description
    if (description.toLowerCase().includes('fire') || description.toLowerCase().includes('flame')) {
      prompt += 'with fire and explosion effects, ';
    }
    if (description.toLowerCase().includes('ice') || description.toLowerCase().includes('frost')) {
      prompt += 'with ice crystals and frost effects, ';
    }
    if (description.toLowerCase().includes('heal') || description.toLowerCase().includes('restore')) {
      prompt += 'with golden healing light, ';
    }
    if (description.toLowerCase().includes('arcane') || description.toLowerCase().includes('magic')) {
      prompt += 'with purple arcane energy swirls, ';
    }
    if (description.toLowerCase().includes('nature') || description.toLowerCase().includes('earth')) {
      prompt += 'with nature and earth elements, ';
    }
  }
  
  // Add general art style
  prompt += 'digital art, detailed fantasy illustration, card game art, vibrant colors, dramatic lighting';
  
  return prompt;
}

/**
 * Generate a placeholder image for a card
 * @param {Object} cardData - Card data
 * @param {string} outputPath - Path to save the image
 * @returns {string} Path to the generated image
 */
function generatePlaceholderImage(cardData, outputPath) {
  // In a real implementation, this would call an image generation API
  // For now, we'll just return the path where the image would be saved
  
  // Generate the prompt that would be used for image generation
  const prompt = generateImagePrompt(cardData);
  
  // Log the prompt that would be used
  console.log(`Image generation prompt for ${cardData.name}: "${prompt}"`);
  
  // Return the path where the image would be saved
  return outputPath;
}

/**
 * Generate an image using OpenAI's DALL-E API
 * @param {Object} cardData - Card data
 * @returns {Promise<string>} URL of the generated image
 */
async function generateImageWithAPI(cardData) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OpenAI API key not found in environment variables');
    throw new Error('OpenAI API key not found in environment variables');
  }

  console.log('Initializing OpenAI client...');
  const openai = new OpenAI({
    apiKey: apiKey
  });

  try {
    console.log('Generating image with prompt:', generateImagePrompt(cardData));
    const response = await openai.images.generate({
      prompt: generateImagePrompt(cardData),
      n: 1,
      size: '512x512', // You can adjust the size as needed
    });

    console.log('Response from OpenAI:', JSON.stringify(response, null, 2));

    if (response.data && response.data.length > 0) {
      console.log('Successfully generated image URL:', response.data[0].url);
      return response.data[0].url; // Return the URL of the generated image
    } else {
      console.error('No image data in response:', response);
      throw new Error('No image URL returned from DALL-E API');
    }
  } catch (error) {
    console.error('Detailed error generating image with DALL-E:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
}

/**
 * Main function to generate a card from command line arguments
 */
function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const params = {};
  for (let i = 0; i < args.length; i += 2) {
    if (args[i].startsWith('--') && i + 1 < args.length) {
      const key = args[i].slice(2);
      params[key] = args[i + 1];
    }
  }
  
  // Generate card
  const cardData = generateCard(params);
  
  // Save card if requested
  if (params.save === 'true') {
    saveCard(cardData);
  }
  
  // Print card data
  console.log(JSON.stringify(cardData, null, 2));
  return cardData;
}

// If this script is run directly, execute the main function
if (require.main === module) {
  main();
}

// Export functions for use in other modules
module.exports = {
  generateCard,
  saveCard,
  generateImagePrompt,
  generatePlaceholderImage,
  CARD_PARAMS,
  CARD_TYPES
}; 