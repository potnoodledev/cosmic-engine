#!/usr/bin/env node

/**
 * Card Game Starter
 * Starts both the game and API server
 */

const { spawn } = require('child_process');
const path = require('path');

// Start the API server
const apiServer = spawn('node', [path.join(__dirname, 'src/api/start.js')], {
  stdio: 'inherit'
});

// Start the game server
const gameServer = spawn('npm', ['start'], {
  stdio: 'inherit'
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  apiServer.kill();
  gameServer.kill();
  process.exit();
});

// Log server status
console.log('Starting Card Game with MongoDB...');
console.log('API Server: http://localhost:3000');
console.log('Game Server: http://localhost:8080');
console.log('Press Ctrl+C to stop all servers');

// Handle server exit
apiServer.on('close', (code) => {
  console.log(`API Server exited with code ${code}`);
  gameServer.kill();
  process.exit();
});

gameServer.on('close', (code) => {
  console.log(`Game Server exited with code ${code}`);
  apiServer.kill();
  process.exit();
}); 