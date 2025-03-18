const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['minion', 'spell'],
    default: 'minion'
  },
  cost: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  attack: {
    type: Number,
    min: 0,
    default: 0
  },
  health: {
    type: Number,
    min: 0,
    default: 0
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  flavorText: {
    type: String,
    trim: true,
    default: ''
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  imageData: {
    type: String,  // Base64 encoded image data
    default: null
  },
  imagePath: {
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
  timestamps: true
});

// Create a text index for searching
CardSchema.index({ name: 'text', description: 'text', flavorText: 'text' });

module.exports = mongoose.model('Card', CardSchema); 