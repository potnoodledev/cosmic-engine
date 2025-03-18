const mongoose = require('mongoose');

/**
 * MongoDB Connection Manager
 * Handles connecting to MongoDB and provides connection status
 */
class DatabaseConnection {
  constructor() {
    this.connected = false;
    this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/card-game';
    
    // Configure mongoose
    mongoose.set('strictQuery', false);
  }

  /**
   * Connect to MongoDB
   * @returns {Promise} Connection result
   */
  async connect() {
    try {
      if (this.connected) {
        console.log('Already connected to MongoDB');
        return;
      }

      await mongoose.connect(this.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      this.connected = true;
      console.log('Connected to MongoDB successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        this.connected = false;
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.connected = false;
      });

      return mongoose.connection;
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    if (!this.connected) {
      console.log('Not connected to MongoDB');
      return;
    }

    try {
      await mongoose.disconnect();
      this.connected = false;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Check if connected to MongoDB
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.connected && mongoose.connection.readyState === 1;
  }
}

// Create and export a singleton instance
const dbConnection = new DatabaseConnection();
module.exports = dbConnection; 