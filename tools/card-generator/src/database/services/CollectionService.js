const Collection = require('../models/Collection');
const Card = require('../models/Card');

/**
 * Collection Service
 * Handles operations related to card collections in the database
 */
class CollectionService {
  /**
   * Get all collections for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array<Collection>>}
   */
  async getUserCollections(userId) {
    return Collection.find({ userId }).exec();
  }

  /**
   * Get collection by ID
   * @param {string} id - Collection ID
   * @returns {Promise<Collection>}
   */
  async getCollectionById(id) {
    return Collection.findById(id).exec();
  }

  /**
   * Get default collection for a user
   * @param {string} userId - User ID
   * @returns {Promise<Collection>}
   */
  async getDefaultCollection(userId) {
    // Find default collection
    let collection = await Collection.findDefaultCollection(userId);
    
    // If no default collection exists, create one
    if (!collection) {
      collection = await this.createCollection({
        name: 'Default Collection',
        description: 'Your default card collection',
        userId,
        isDefault: true
      });
    }
    
    return collection;
  }

  /**
   * Create a new collection
   * @param {Object} collectionData - Collection data
   * @returns {Promise<Collection>}
   */
  async createCollection(collectionData) {
    const collection = new Collection(collectionData);
    return collection.save();
  }

  /**
   * Update a collection
   * @param {string} id - Collection ID
   * @param {Object} collectionData - Updated collection data
   * @returns {Promise<Collection>}
   */
  async updateCollection(id, collectionData) {
    return Collection.findByIdAndUpdate(id, collectionData, { new: true }).exec();
  }

  /**
   * Delete a collection
   * @param {string} id - Collection ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteCollection(id) {
    // Don't allow deleting default collections
    const collection = await Collection.findById(id).exec();
    if (collection && collection.isDefault) {
      throw new Error('Cannot delete default collection');
    }
    
    return Collection.findByIdAndDelete(id).exec();
  }

  /**
   * Add a card to a collection
   * @param {string} collectionId - Collection ID
   * @param {string} cardId - Card ID
   * @param {number} quantity - Quantity to add
   * @returns {Promise<Collection>}
   */
  async addCardToCollection(collectionId, cardId, quantity = 1) {
    // Verify card exists
    const card = await Card.findById(cardId).exec();
    if (!card) {
      throw new Error(`Card with ID ${cardId} not found`);
    }
    
    return Collection.addCard(collectionId, cardId, quantity);
  }

  /**
   * Remove a card from a collection
   * @param {string} collectionId - Collection ID
   * @param {string} cardId - Card ID
   * @param {number} quantity - Quantity to remove
   * @returns {Promise<Collection>}
   */
  async removeCardFromCollection(collectionId, cardId, quantity = 1) {
    const collection = await Collection.findById(collectionId).exec();
    if (!collection) {
      throw new Error(`Collection with ID ${collectionId} not found`);
    }
    
    return collection.removeCard(cardId, quantity);
  }

  /**
   * Get cards in a collection with full card details
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Array<Object>>} Cards with quantities
   */
  async getCollectionCards(collectionId) {
    const collection = await Collection.findById(collectionId).exec();
    if (!collection) {
      throw new Error(`Collection with ID ${collectionId} not found`);
    }
    
    // Get all card IDs in the collection
    const cardIds = collection.cards.map(c => c.cardId);
    
    // Fetch all cards in one query
    const cards = await Card.find({ _id: { $in: cardIds } }).exec();
    
    // Map cards to include quantity
    return collection.cards.map(collectionCard => {
      const card = cards.find(c => c._id.toString() === collectionCard.cardId.toString());
      return {
        card,
        quantity: collectionCard.quantity,
        addedAt: collectionCard.addedAt
      };
    });
  }
}

// Create and export a singleton instance
const collectionService = new CollectionService();
module.exports = collectionService; 