const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Card Schema
 * Defines the structure for card documents in MongoDB
 */
const CardSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Card name is required'],
    trim: true,
    unique: true
  },
  type: {
    type: String,
    required: [true, 'Card type is required'],
    enum: ['minion', 'spell'],
    default: 'minion'
  },
  cost: {
    type: Number,
    required: [true, 'Card cost is required'],
    min: 0,
    max: 10
  },
  attack: {
    type: Number,
    min: 0,
    max: 12,
    default: function() {
      return this.type === 'minion' ? 1 : null;
    }
  },
  health: {
    type: Number,
    min: 1,
    max: 12,
    default: function() {
      return this.type === 'minion' ? 1 : null;
    }
  },
  description: {
    type: String,
    default: 'A mysterious card with unknown powers.'
  },
  flavor: {
    type: String,
    default: 'Created by the local card generator.'
  },
  imagePath: {
    type: String,
    default: null
  },
  imageData: {
    type: Buffer,
    select: false // Don't include by default in queries
  },
  imageContentType: {
    type: String,
    default: null
  },
  imagePrompt: {
    type: String,
    default: null
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
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.imageData; // Don't include binary data in JSON
      return ret;
    }
  }
});

// Virtual for image URL if stored in MongoDB
CardSchema.virtual('imageUrl').get(function() {
  if (this.imageData && this.imageContentType) {
    return `/api/cards/${this._id}/image`;
  }
  return null;
});

// Pre-save middleware
CardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static methods
CardSchema.statics = {
  /**
   * Find card by name
   * @param {string} name - Card name
   * @returns {Promise<Card>}
   */
  findByName(name) {
    return this.findOne({ name: name }).exec();
  },

  /**
   * Find cards by type
   * @param {string} type - Card type (minion, spell)
   * @returns {Promise<Array<Card>>}
   */
  findByType(type) {
    return this.find({ type: type }).exec();
  }
};

// Create and export the model
const Card = mongoose.model('Card', CardSchema);
module.exports = Card; 