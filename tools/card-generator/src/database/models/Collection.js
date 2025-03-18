const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Collection Schema
 * Represents a collection of cards that can be owned by a user
 */
const CollectionSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true
  },
  description: {
    type: String,
    default: 'A collection of cards'
  },
  userId: {
    type: String,
    default: 'default' // In a real app, this would be a reference to a User model
  },
  cards: [{
    cardId: {
      type: Schema.Types.ObjectId,
      ref: 'Card',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware
CollectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static methods
CollectionSchema.statics = {
  /**
   * Find user's collections
   * @param {string} userId - User ID
   * @returns {Promise<Array<Collection>>}
   */
  findByUserId(userId) {
    return this.find({ userId: userId }).exec();
  },

  /**
   * Find user's default collection
   * @param {string} userId - User ID
   * @returns {Promise<Collection>}
   */
  findDefaultCollection(userId) {
    return this.findOne({ userId: userId, isDefault: true }).exec();
  },

  /**
   * Add card to collection
   * @param {string} collectionId - Collection ID
   * @param {string} cardId - Card ID
   * @param {number} quantity - Quantity to add (default: 1)
   * @returns {Promise<Collection>}
   */
  async addCard(collectionId, cardId, quantity = 1) {
    const collection = await this.findById(collectionId);
    if (!collection) {
      throw new Error('Collection not found');
    }

    // Check if card already exists in collection
    const existingCard = collection.cards.find(c => c.cardId.toString() === cardId);
    if (existingCard) {
      existingCard.quantity += quantity;
    } else {
      collection.cards.push({
        cardId,
        quantity,
        addedAt: Date.now()
      });
    }

    return collection.save();
  }
};

// Instance methods
CollectionSchema.methods = {
  /**
   * Add a card to this collection
   * @param {string} cardId - Card ID
   * @param {number} quantity - Quantity to add (default: 1)
   * @returns {Promise<Collection>}
   */
  addCard(cardId, quantity = 1) {
    // Check if card already exists in collection
    const existingCard = this.cards.find(c => c.cardId.toString() === cardId);
    if (existingCard) {
      existingCard.quantity += quantity;
    } else {
      this.cards.push({
        cardId,
        quantity,
        addedAt: Date.now()
      });
    }

    return this.save();
  },

  /**
   * Remove a card from this collection
   * @param {string} cardId - Card ID
   * @param {number} quantity - Quantity to remove (default: 1)
   * @returns {Promise<Collection>}
   */
  removeCard(cardId, quantity = 1) {
    const cardIndex = this.cards.findIndex(c => c.cardId.toString() === cardId);
    if (cardIndex === -1) {
      return this.save(); // Card not in collection, just return
    }

    const card = this.cards[cardIndex];
    if (card.quantity <= quantity) {
      // Remove the card entirely
      this.cards.splice(cardIndex, 1);
    } else {
      // Reduce the quantity
      card.quantity -= quantity;
    }

    return this.save();
  }
};

// Create and export the model
const Collection = mongoose.model('Collection', CollectionSchema);
module.exports = Collection; 