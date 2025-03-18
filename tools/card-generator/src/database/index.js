const dbConnection = require('./config/db');
const Card = require('./models/Card');
const Collection = require('./models/Collection');
const cardService = require('./services/CardService');
const collectionService = require('./services/CollectionService');

/**
 * Initialize the database connection
 * @returns {Promise<void>}
 */
async function initDatabase() {
  try {
    await dbConnection.connect();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Migrate cards from JSON file to MongoDB
 * @param {string} jsonFilePath - Path to JSON file
 * @returns {Promise<Array>} Migrated cards
 */
async function migrateCards(jsonFilePath) {
  try {
    // Ensure database is connected
    if (!dbConnection.isConnected()) {
      await dbConnection.connect();
    }
    
    // Migrate cards
    return await cardService.migrateCardsFromJson(jsonFilePath);
  } catch (error) {
    console.error('Failed to migrate cards:', error);
    throw error;
  }
}

// Export all database-related modules
module.exports = {
  dbConnection,
  models: {
    Card,
    Collection
  },
  services: {
    cardService,
    collectionService
  },
  initDatabase,
  migrateCards
}; 