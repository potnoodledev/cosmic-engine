const Card = require('../models/Card');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

/**
 * Card Service
 * Handles operations related to cards in the database
 */
class CardService {
  /**
   * Get all cards
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array<Card>>}
   */
  async getAllCards(filter = {}, options = {}) {
    return Card.find(filter, null, options).exec();
  }

  /**
   * Get card by ID
   * @param {string} id - Card ID
   * @returns {Promise<Card>}
   */
  async getCardById(id) {
    return Card.findById(id).exec();
  }

  /**
   * Get card by name
   * @param {string} name - Card name
   * @returns {Promise<Card>}
   */
  async getCardByName(name) {
    return Card.findByName(name);
  }

  /**
   * Get cards by type
   * @param {string} type - Card type
   * @returns {Promise<Array<Card>>}
   */
  async getCardsByType(type) {
    return Card.findByType(type);
  }

  /**
   * Create a new card
   * @param {Object} cardData - Card data
   * @returns {Promise<Card>}
   */
  async createCard(cardData) {
    const card = new Card(cardData);
    return card.save();
  }

  /**
   * Update a card
   * @param {string} id - Card ID
   * @param {Object} cardData - Updated card data
   * @returns {Promise<Card>}
   */
  async updateCard(id, cardData) {
    return Card.findByIdAndUpdate(id, cardData, { new: true }).exec();
  }

  /**
   * Delete a card
   * @param {string} id - Card ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteCard(id) {
    return Card.findByIdAndDelete(id).exec();
  }

  /**
   * Save card image to database
   * @param {string} cardId - Card ID
   * @param {Buffer|string} imageData - Image data or path
   * @param {string} contentType - Image content type
   * @returns {Promise<Card>}
   */
  async saveCardImage(cardId, imageData, contentType) {
    const card = await Card.findById(cardId).exec();
    if (!card) {
      throw new Error(`Card with ID ${cardId} not found`);
    }

    // If imageData is a file path, read the file
    if (typeof imageData === 'string' && fs.existsSync(imageData)) {
      imageData = await readFileAsync(imageData);
    }

    card.imageData = imageData;
    card.imageContentType = contentType;
    return card.save();
  }

  /**
   * Get card image
   * @param {string} cardId - Card ID
   * @returns {Promise<Object>} Image data and content type
   */
  async getCardImage(cardId) {
    const card = await Card.findById(cardId).select('+imageData').exec();
    if (!card || !card.imageData) {
      throw new Error(`Image for card with ID ${cardId} not found`);
    }

    return {
      data: card.imageData,
      contentType: card.imageContentType
    };
  }

  /**
   * Migrate cards from JSON file to MongoDB
   * @param {string} jsonFilePath - Path to JSON file
   * @returns {Promise<Array<Card>>} Migrated cards
   */
  async migrateCardsFromJson(jsonFilePath) {
    try {
      // Read the JSON file
      const fileData = await readFileAsync(jsonFilePath, 'utf8');
      const cardsData = JSON.parse(fileData);
      
      if (!cardsData.cards || !Array.isArray(cardsData.cards)) {
        throw new Error('Invalid cards data format');
      }

      const migratedCards = [];
      
      // Process each card
      for (const cardData of cardsData.cards) {
        // Check if card already exists
        const existingCard = await Card.findByName(cardData.name);
        if (existingCard) {
          console.log(`Card "${cardData.name}" already exists, skipping`);
          migratedCards.push(existingCard);
          continue;
        }

        // Create new card
        const card = new Card(cardData);
        
        // If card has an image path, try to load the image
        if (cardData.imagePath) {
          try {
            const imagePath = path.resolve(process.cwd(), cardData.imagePath);
            if (fs.existsSync(imagePath)) {
              const imageData = await readFileAsync(imagePath);
              const contentType = this.getContentTypeFromPath(imagePath);
              card.imageData = imageData;
              card.imageContentType = contentType;
            }
          } catch (imageError) {
            console.error(`Error loading image for card "${cardData.name}":`, imageError);
          }
        }

        // Save the card
        await card.save();
        migratedCards.push(card);
        console.log(`Card "${cardData.name}" migrated successfully`);
      }

      return migratedCards;
    } catch (error) {
      console.error('Error migrating cards from JSON:', error);
      throw error;
    }
  }

  /**
   * Get content type from file path
   * @param {string} filePath - File path
   * @returns {string} Content type
   */
  getContentTypeFromPath(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.gif':
        return 'image/gif';
      case '.svg':
        return 'image/svg+xml';
      default:
        return 'application/octet-stream';
    }
  }
}

// Create and export a singleton instance
const cardService = new CardService();
module.exports = cardService; 