/**
 * Card Creation Tool with Hugging Face Image Generation
 * 
 * This script creates a new card and generates an image for it using Hugging Face.
 * It combines the card creation and image generation steps into a single tool.
 * 
 * Usage:
 * node src/tools/createCardWithImage.js --name="Card Name" --type="minion|spell|weapon" --cost=X --attack=X --health=X --description="Card description" --flavorText="Flavor text" --rarity="common|rare|epic|legendary"
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// API endpoints
const API_BASE_URL = 'http://localhost:3000/api';
const CARDS_ENDPOINT = `${API_BASE_URL}/cards`;

/**
 * Parse command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      if (key && value) {
        // Convert numeric values
        if (!isNaN(value) && !isNaN(parseFloat(value))) {
          result[key] = parseFloat(value);
        } else {
          result[key] = value.replace(/^["'](.*)["']$/, '$1'); // Remove quotes if present
        }
      }
    }
  });
  
  return result;
}

/**
 * Validate card data
 * @param {Object} cardData - Card data to validate
 * @returns {string|null} Error message or null if valid
 */
function validateCardData(cardData) {
  if (!cardData.name) return 'Card name is required';
  if (!cardData.type) return 'Card type is required (minion, spell, or weapon)';
  if (!cardData.cost && cardData.cost !== 0) return 'Card cost is required';
  if (cardData.type === 'minion') {
    if (!cardData.attack && cardData.attack !== 0) return 'Minion attack is required';
    if (!cardData.health && cardData.health !== 0) return 'Minion health is required';
  }
  if (!cardData.description) return 'Card description is required';
  if (!cardData.rarity) return 'Card rarity is required (common, rare, epic, or legendary)';
  
  return null;
}

/**
 * Create a new card
 * @param {Object} cardData - Card data
 * @returns {Promise<Object>} Created card
 */
async function createCard(cardData) {
  try {
    console.log(`Creating card: ${cardData.name}`);
    const response = await axios.post(CARDS_ENDPOINT, cardData);
    console.log(`Card created successfully with ID: ${response.data._id}`);
    return response.data;
  } catch (error) {
    console.error('Error creating card:', error.message);
    if (error.response) {
      console.error('API response:', error.response.data);
    }
    throw error;
  }
}

/**
 * Generate an image for a card using Hugging Face
 * @param {string} cardId - Card ID
 * @returns {Promise<Object>} Updated card with image
 */
async function generateCardImage(cardId) {
  try {
    console.log(`Generating image for card with ID: ${cardId}`);
    const response = await axios.post(`${CARDS_ENDPOINT}/${cardId}/generate-image`);
    console.log('Image generated successfully');
    return response.data.card;
  } catch (error) {
    console.error('Error generating image:', error.message);
    if (error.response) {
      console.error('API response:', error.response.data);
    }
    throw error;
  }
}

/**
 * Display card information
 * @param {Object} card - Card data
 */
function displayCardInfo(card) {
  console.log('\n=== Card Information ===');
  console.log(`Name: ${card.name}`);
  console.log(`Type: ${card.type}`);
  console.log(`Cost: ${card.cost}`);
  if (card.type === 'minion') {
    console.log(`Attack: ${card.attack}`);
    console.log(`Health: ${card.health}`);
  }
  console.log(`Description: ${card.description}`);
  console.log(`Flavor Text: ${card.flavorText || 'None'}`);
  console.log(`Rarity: ${card.rarity}`);
  console.log(`ID: ${card._id}`);
  
  if (card.imagePath) {
    console.log(`Image Path: ${card.imagePath}`);
    console.log(`Image URL: ${API_BASE_URL}${card.imagePath}`);
  }
  
  console.log('\nTo view this card in the MongoDB Card Viewer:');
  console.log('start src/assets/data/samples/mongodb_card_viewer.html');
}

/**
 * Main function
 */
async function main() {
  try {
    // Parse command line arguments
    const args = parseArgs();
    
    // Validate card data
    const validationError = validateCardData(args);
    if (validationError) {
      console.error(`Error: ${validationError}`);
      process.exit(1);
    }
    
    // Create the card
    const card = await createCard(args);
    
    // Generate an image for the card
    const updatedCard = await generateCardImage(card._id);
    
    // Display card information
    displayCardInfo(updatedCard);
    
  } catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

// Run the main function
main(); 