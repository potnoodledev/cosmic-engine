#!/usr/bin/env node

const { generateCard, saveCard, generateImagePrompt } = require('./cardGenerator');
const fs = require('fs');
const path = require('path');

/**
 * This script is designed to be used with Cursor's prompting.
 * It takes a description from the prompt and generates a card.
 * 
 * Usage:
 * node generateCard.js "A powerful dragon that breathes fire" --type minion --save true --image true
 * 
 * Or simply:
 * node generateCard.js "A healing spell that restores health"
 */

// Main async function to handle card generation
async function main() {
  // Get the description from the first argument
  const args = process.argv.slice(2);
  let description = '';
  const params = {};

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      // This is a parameter
      const key = args[i].slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        params[key] = args[i + 1];
        i++; // Skip the next argument as it's the value
      } else {
        params[key] = 'true'; // Flag parameter
      }
    } else {
      // This is part of the description
      description += (description ? ' ' : '') + args[i];
    }
  }

  // Set the description
  params.description = description;

  // Check if image generation is requested
  const generateImage = params.image === 'true';

  try {
    // Generate the card
    const cardData = await generateCard(params, { generateImage });

    // If image generation is requested but not implemented in the card generator
    if (generateImage && !cardData.imagePath && !cardData.imageUrl) {
      // Create a placeholder image path
      const imageName = cardData.name.toLowerCase().replace(/\s+/g, '_') + '.svg';
      const imagesDir = path.join(__dirname, '../assets/data/card_images');
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      
      // Set image path
      cardData.imagePath = `src/assets/data/card_images/${imageName}`;
      
      // Generate image prompt
      cardData.imagePrompt = generateImagePrompt(cardData);
      
      console.log(`\nImage would be generated with prompt: "${cardData.imagePrompt}"`);
      console.log(`Image would be saved to: ${cardData.imagePath}`);
      
      // Create a simple SVG as a placeholder
      createPlaceholderSVG(cardData, path.join(__dirname, '../../', cardData.imagePath));
    }

    // Save the card if requested
    if (params.save === 'true') {
      saveCard(cardData);
    }

    // Print the card data
    console.log('\n=== Generated Card ===');
    console.log(`Name: ${cardData.name}`);
    console.log(`Type: ${cardData.type}`);
    console.log(`Cost: ${cardData.cost}`);
    if (cardData.type === 'minion') {
      console.log(`Attack: ${cardData.attack}`);
      console.log(`Health: ${cardData.health}`);
    }
    console.log(`Description: ${cardData.description}`);
    console.log(`Flavor: ${cardData.flavor}`);
    if (cardData.imagePath) {
      console.log(`Image: ${cardData.imagePath}`);
    }
    if (cardData.imageUrl) {
      console.log(`Image URL: ${cardData.imageUrl}`);
    }
    console.log('======================\n');

    // Also output as JSON for easy copying
    console.log('Card as JSON:');
    console.log(JSON.stringify(cardData, null, 2));

    return cardData;
  } catch (error) {
    console.error('Error generating card:', error);
    return null;
  }
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
  
  // Write the SVG to a file
  fs.writeFileSync(outputPath, svgContent, 'utf8');
  
  console.log(`Generated placeholder SVG for ${cardData.name} at ${outputPath}`);
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 