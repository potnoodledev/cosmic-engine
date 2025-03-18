const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const path = require('path');
require('dotenv').config();

// Import routes
const cardRoutes = require('./routes/cards');
const collectionRoutes = require('./routes/collections');

// Initialize Express app
const app = express();
const PORT = process.env.API_PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'https://YOURUSERNAME.github.io'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/api/static', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/cards', cardRoutes);
app.use('/api/collections', collectionRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Card Game API Server',
    endpoints: {
      cards: '/api/cards',
      collections: '/api/collections',
      static: '/api/static'
    }
  });
});

// API info route
app.get('/api', (req, res) => {
  res.json({
    message: 'Card Game API',
    version: '1.0.0',
    endpoints: {
      cards: '/api/cards',
      collections: '/api/collections',
      static: '/api/static'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
  console.log(`API is available at http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server; 