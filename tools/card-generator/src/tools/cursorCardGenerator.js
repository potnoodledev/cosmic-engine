/**
 * Cursor Card Generator
 * 
 * This module is designed to be used directly with Cursor's prompting.
 * It provides a simple interface to generate cards based on natural language descriptions.
 * 
 * Example usage in Cursor:
 * 
 * ```
 * // Generate a card
 * const card = require('./src/tools/cursorCardGenerator').generateCardFromPrompt(
 *   "A powerful dragon that deals 3 damage to all enemies when played",
 *   { type: "minion", save: true, generateImage: true }
 * );
 * ```
 */

const fs = require('fs');
const path = require('path');
const { generateCard, saveCard, generateImagePrompt } = require('./cardGenerator');

/**
 * Generate a card from a natural language prompt
 * 
 * @param {string} prompt - Natural language description of the card
 * @param {Object} options - Additional options
 * @param {string} [options.name] - Card name (optional)
 * @param {string} [options.type] - Card type: "minion" or "spell" (optional)
 * @param {number} [options.cost] - Mana cost (optional)
 * @param {number} [options.attack] - Attack value for minions (optional)
 * @param {number} [options.health] - Health value for minions (optional)
 * @param {string} [options.flavor] - Flavor text (optional)
 * @param {boolean} [options.save] - Whether to save the card to the game (optional)
 * @param {boolean} [options.generateImage] - Whether to generate an image for the card (optional)
 * @returns {Object} Generated card data
 */
function generateCardFromPrompt(prompt, options = {}) {
  // Prepare parameters
  const params = {
    description: prompt,
    ...options
  };
  
  // Generate the card
  const cardData = generateCard(params, { 
    generateImage: options.generateImage || false,
    imagePath: options.imagePath
  });
  
  // If image generation is requested but not implemented
  if (options.generateImage && !cardData.imagePath) {
    // Create a placeholder image path
    const imageName = cardData.name.toLowerCase().replace(/\s+/g, '_') + '.png';
    const imagesDir = path.join(__dirname, '../assets/data/card_images');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Set image path
    cardData.imagePath = `src/assets/data/card_images/${imageName}`;
    
    // Generate image prompt
    cardData.imagePrompt = generateImagePrompt(cardData);
    
    console.log(`Image would be generated with prompt: "${cardData.imagePrompt}"`);
    console.log(`Image would be saved to: ${cardData.imagePath}`);
    
    // Create a simple SVG as a placeholder
    createPlaceholderSVG(cardData, path.join(__dirname, '../../', cardData.imagePath));
  }
  
  // Save the card if requested
  if (options.save) {
    saveCard(cardData);
  }
  
  // Return the card data
  return cardData;
}

/**
 * Create a placeholder SVG image for a card
 * 
 * @param {Object} cardData - Card data
 * @param {string} outputPath - Path to save the SVG
 */
function createPlaceholderSVG(cardData, outputPath) {
  // Choose colors based on card type
  let bgColor, fgColor;
  if (cardData.type === 'spell') {
    bgColor = '#3498db'; // Blue for spells
    fgColor = '#ffffff';
  } else {
    // For minions, choose color based on stats
    if (cardData.attack >= 5) {
      bgColor = '#e74c3c'; // Red for high attack
    } else if (cardData.health >= 5) {
      bgColor = '#2ecc71'; // Green for high health
    } else {
      bgColor = '#f39c12'; // Orange for balanced
    }
    fgColor = '#ffffff';
  }
  
  // Create SVG content
  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="${bgColor}" />
  <text x="150" y="100" font-family="Arial" font-size="24" text-anchor="middle" fill="${fgColor}">${cardData.name}</text>
  <text x="150" y="150" font-family="Arial" font-size="18" text-anchor="middle" fill="${fgColor}">${cardData.type.toUpperCase()}</text>
  ${cardData.type === 'minion' 
    ? `<text x="150" y="200" font-family="Arial" font-size="36" text-anchor="middle" fill="${fgColor}">${cardData.attack}/${cardData.health}</text>` 
    : `<text x="150" y="200" font-family="Arial" font-size="36" text-anchor="middle" fill="${fgColor}">SPELL</text>`}
</svg>
  `;
  
  // Ensure the directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Change file extension to .svg
  const svgPath = outputPath.replace(/\.png$/, '.svg');
  
  // Write the SVG to a file
  fs.writeFileSync(svgPath, svgContent, 'utf8');
  
  console.log(`Generated placeholder SVG for ${cardData.name} at ${svgPath}`);
  
  // Update the image path to use SVG
  cardData.imagePath = cardData.imagePath.replace(/\.png$/, '.svg');
}

/**
 * Generate multiple cards from prompts
 * 
 * @param {Array<Object>} cardPrompts - Array of card prompts
 * @param {string} cardPrompts[].prompt - Natural language description
 * @param {Object} [cardPrompts[].options] - Additional options
 * @param {boolean} [saveAll=false] - Whether to save all cards
 * @param {boolean} [generateImages=false] - Whether to generate images for all cards
 * @returns {Array<Object>} Generated card data
 */
function generateCardsFromPrompts(cardPrompts, saveAll = false, generateImages = false) {
  return cardPrompts.map(({ prompt, options = {} }) => {
    return generateCardFromPrompt(prompt, {
      ...options,
      save: options.save || saveAll,
      generateImage: options.generateImage || generateImages
    });
  });
}

// Export functions
module.exports = {
  generateCardFromPrompt,
  generateCardsFromPrompts
}; 