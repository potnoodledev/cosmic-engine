const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  userId: {
    type: String,
    default: 'default'  // For now, we'll use a default user
  },
  cards: [{
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  }],
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

// Create a text index for searching
CollectionSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Collection', CollectionSchema); 