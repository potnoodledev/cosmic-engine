#!/usr/bin/env node

/**
 * API Server Starter
 * Starts the API server for the card game
 */

// Start the API server
require('./server');

// The server is already started in server.js, so we don't need to start it again here
// Just add a console message for clarity
console.log(`API is available at http://localhost:${process.env.API_PORT || 3000}/api`);