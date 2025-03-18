const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const Card = require('../models/Card');
const mongoose = require('mongoose');

// Get all collections
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, userId = 'default' } = req.query;
    
    // Build query
    const query = { userId };
    
    // Add search filter if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    // Execute query with pagination
    const collections = await Collection.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
      
    // Get total count for pagination
    const count = await Collection.countDocuments(query);
    
    res.json({
      collections,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalCollections: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single collection by ID
router.get('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get cards in a collection
router.get('/:id/cards', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Find the collection
    const collection = await Collection.findById(req.params.id);
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    // Get card IDs from the collection
    const cardIds = collection.cards.map(card => card.cardId);
    
    // Find cards with pagination
    const cards = await Card.find({ _id: { $in: cardIds } })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
      
    // Add quantity information to each card
    const cardsWithQuantity = cards.map(card => {
      const collectionCard = collection.cards.find(c => 
        c.cardId.toString() === card._id.toString()
      );
      
      return {
        ...card.toObject(),
        quantity: collectionCard ? collectionCard.quantity : 0
      };
    });
    
    // Get total count for pagination
    const count = cardIds.length;
    
    res.json({
      cards: cardsWithQuantity,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalCards: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new collection
router.post('/', async (req, res) => {
  try {
    const collection = new Collection({
      ...req.body,
      userId: req.body.userId || 'default'
    });
    
    const savedCollection = await collection.save();
    res.status(201).json(savedCollection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a collection
router.put('/:id', async (req, res) => {
  try {
    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    res.json(collection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a collection
router.delete('/:id', async (req, res) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a card to a collection
router.post('/:id/cards', async (req, res) => {
  try {
    const { cardId, quantity = 1 } = req.body;
    
    if (!cardId) {
      return res.status(400).json({ message: 'Card ID is required' });
    }
    
    // Validate card exists
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    // Find the collection
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    // Check if card already exists in collection
    const existingCardIndex = collection.cards.findIndex(
      c => c.cardId.toString() === cardId
    );
    
    if (existingCardIndex !== -1) {
      // Update quantity if card already exists
      collection.cards[existingCardIndex].quantity += parseInt(quantity);
    } else {
      // Add new card to collection
      collection.cards.push({
        cardId: mongoose.Types.ObjectId(cardId),
        quantity: parseInt(quantity)
      });
    }
    
    // Save the updated collection
    const updatedCollection = await collection.save();
    
    res.json(updatedCollection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove a card from a collection
router.delete('/:id/cards/:cardId', async (req, res) => {
  try {
    const { quantity } = req.query;
    
    // Find the collection
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    // Find the card in the collection
    const cardIndex = collection.cards.findIndex(
      c => c.cardId.toString() === req.params.cardId
    );
    
    if (cardIndex === -1) {
      return res.status(404).json({ message: 'Card not found in collection' });
    }
    
    // If quantity is specified, reduce the quantity
    if (quantity && parseInt(quantity) < collection.cards[cardIndex].quantity) {
      collection.cards[cardIndex].quantity -= parseInt(quantity);
    } else {
      // Otherwise, remove the card completely
      collection.cards.splice(cardIndex, 1);
    }
    
    // Save the updated collection
    const updatedCollection = await collection.save();
    
    res.json(updatedCollection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 