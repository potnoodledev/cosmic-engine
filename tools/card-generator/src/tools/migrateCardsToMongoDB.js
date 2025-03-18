#!/usr/bin/env node

/**
 * Card Migration Tool
 * Migrates cards from JSON file to MongoDB database
 * 
 * Usage:
 * node migrateCardsToMongoDB.js [--file path/to/cards.json]
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Card = require('../api/models/Card');
const Collection = require('../api/models/Collection');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Read cards from JSON file
const readCardsFromFile = () => {
  try {
    const cardsPath = path.join(__dirname, '../assets/data/cards.json');
    
    if (!fs.existsSync(cardsPath)) {
      console.log('Cards file not found at:', cardsPath);
      return [];
    }
    
    const cardsData = fs.readFileSync(cardsPath, 'utf8');
    if (!cardsData || cardsData.trim() === '') {
      console.log('Cards file is empty');
      return [];
    }
    
    try {
      const cards = JSON.parse(cardsData);
      return Array.isArray(cards) ? cards : [];
    } catch (parseError) {
      console.error('Error parsing cards JSON:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error reading cards file:', error);
    return [];
  }
};

// Migrate cards to MongoDB
const migrateCards = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Read cards from file
    const cards = readCardsFromFile();
    
    if (!cards || cards.length === 0) {
      console.log('No cards to migrate. Creating a sample card instead.');
      
      // Create a sample card
      const sampleCard = new Card({
        name: 'Sample Card',
        type: 'minion',
        cost: 3,
        attack: 3,
        health: 3,
        description: 'This is a sample card created during migration.',
        flavorText: 'Your first card!',
        rarity: 'common'
      });
      
      await sampleCard.save();
      console.log('Created a sample card.');
      
      // Create a default collection with the sample card
      let defaultCollection = await Collection.findOne({ name: 'All Cards', userId: 'default' });
      
      if (!defaultCollection) {
        defaultCollection = new Collection({
          name: 'All Cards',
          description: 'All available cards',
          userId: 'default',
          cards: [{
            cardId: sampleCard._id,
            quantity: 1
          }]
        });
        
        await defaultCollection.save();
        console.log('Created default "All Cards" collection with sample card.');
      }
      
      // Disconnect from MongoDB
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
      return;
    }
    
    console.log(`Found ${cards.length} cards to migrate.`);
    
    // Check if cards already exist in MongoDB
    const existingCount = await Card.countDocuments();
    
    if (existingCount > 0) {
      console.log(`Database already contains ${existingCount} cards.`);
      const answer = await promptUser('Do you want to continue and potentially create duplicates? (y/n): ');
      
      if (answer.toLowerCase() !== 'y') {
        console.log('Migration cancelled.');
        process.exit(0);
      }
    }
    
    // Migrate each card
    let successCount = 0;
    let errorCount = 0;
    
    for (const card of cards) {
      try {
        // Create a new card document
        const newCard = new Card({
          name: card.name,
          type: card.type || 'minion',
          cost: card.cost || 0,
          attack: card.attack || 0,
          health: card.health || 0,
          description: card.description || '',
          flavorText: card.flavorText || '',
          rarity: card.rarity || 'common',
          imageData: card.imageData || null,
          imagePath: card.imagePath || null
        });
        
        // Save the card
        await newCard.save();
        successCount++;
        
        // Log progress
        if (successCount % 10 === 0 || successCount === cards.length) {
          console.log(`Migrated ${successCount}/${cards.length} cards...`);
        }
      } catch (error) {
        console.error(`Error migrating card ${card.name}:`, error);
        errorCount++;
      }
    }
    
    console.log('\nMigration completed:');
    console.log(`- Successfully migrated: ${successCount} cards`);
    console.log(`- Failed to migrate: ${errorCount} cards`);
    
    // Create a default collection with all cards
    if (successCount > 0) {
      try {
        // Get all migrated cards
        const allCards = await Card.find();
        
        // Check if default collection exists
        let defaultCollection = await Collection.findOne({ name: 'All Cards', userId: 'default' });
        
        if (!defaultCollection) {
          // Create default collection
          defaultCollection = new Collection({
            name: 'All Cards',
            description: 'All available cards',
            userId: 'default',
            cards: []
          });
        }
        
        // Add all cards to the collection
        defaultCollection.cards = allCards.map(card => ({
          cardId: card._id,
          quantity: 1
        }));
        
        // Save the collection
        await defaultCollection.save();
        console.log('Created default "All Cards" collection.');
      } catch (error) {
        console.error('Error creating default collection:', error);
      }
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Helper function to prompt user
const promptUser = (question) => {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
};

// Run the migration
migrateCards(); 