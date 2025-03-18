const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const path = require('path');
const fs = require('fs');
const { generateCardImage } = require('../utils/imageGenerator');
const hfImageGenerator = require('../utils/huggingfaceImageGenerator');

// Get all cards
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type, rarity } = req.query;
    
    // Build query
    const query = {};
    
    // Add search filter if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    // Add type filter if provided
    if (type) {
      query.type = type;
    }
    
    // Add rarity filter if provided
    if (rarity) {
      query.rarity = rarity;
    }
    
    // Execute query with pagination
    const cards = await Card.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
      
    // Get total count for pagination
    const count = await Card.countDocuments(query);
    
    res.json({
      cards,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalCards: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single card by ID
router.get('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new card
router.post('/', async (req, res) => {
  try {
    const card = new Card(req.body);
    const savedCard = await card.save();
    res.status(201).json(savedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a card
router.put('/:id', async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    res.json(card);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a card
router.delete('/:id', async (req, res) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.id);
    
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get card image
router.get('/:id/image', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    // If card has image data, use it
    if (card.imageData) {
      // Extract base64 data and content type
      const matches = card.imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      
      if (matches && matches.length === 3) {
        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Set response headers and send image
        res.set('Content-Type', contentType);
        return res.send(buffer);
      }
    }
    
    // If card has an image path, try to serve that file
    if (card.imagePath) {
      const imagePath = path.resolve(path.join(__dirname, '../../..', card.imagePath));
      if (fs.existsSync(imagePath)) {
        return res.sendFile(imagePath);
      }
    }
    
    // Check if we should use Hugging Face for image generation
    const useHuggingFace = req.query.hf === 'true' || process.env.USE_HUGGINGFACE === 'true';
    
    if (useHuggingFace) {
      try {
        // Generate image with Hugging Face
        console.log(`Generating image for card ${card.name} using Hugging Face`);
        const result = await hfImageGenerator.generateCardImage(card);
        
        // Save the image path to the card
        card.imagePath = result.imagePath;
        card.imageData = result.dataUrl;
        await card.save();
        
        // Extract content type and send image
        const matches = result.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const contentType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          
          res.set('Content-Type', contentType);
          return res.send(buffer);
        }
      } catch (error) {
        console.error('Error generating image with Hugging Face:', error);
        // Fall back to SVG generation if Hugging Face fails
      }
    }
    
    // Generate a default SVG image based on card properties
    const defaultImageDataUrl = generateCardImage(card);
    
    // Extract SVG content and send as response
    const matches = defaultImageDataUrl.match(/^data:([A-Za-z-+\/]+);charset=utf-8,(.+)$/);
    if (matches && matches.length === 3) {
      const contentType = matches[1];
      const svgContent = decodeURIComponent(matches[2]);
      
      res.set('Content-Type', contentType);
      return res.send(svgContent);
    }
    
    // Fallback error
    res.status(500).json({ message: 'Failed to generate card image' });
  } catch (error) {
    console.error('Error serving card image:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add a new endpoint to specifically generate images with Hugging Face
router.post('/:id/generate-image', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    // Generate image with Hugging Face
    console.log(`Generating image for card ${card.name} using Hugging Face`);
    const result = await hfImageGenerator.generateCardImage(card);
    
    // Save the image path and data to the card
    card.imagePath = result.imagePath;
    card.imageData = result.dataUrl;
    await card.save();
    
    res.json({
      message: 'Image generated successfully',
      card: card
    });
  } catch (error) {
    console.error('Error generating image with Hugging Face:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 