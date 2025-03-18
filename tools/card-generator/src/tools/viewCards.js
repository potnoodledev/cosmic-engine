/**
 * Card Viewer Launcher
 * This script opens the card viewer HTML file in the default browser.
 */

const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Path to the HTML viewer
const htmlFile = path.join(__dirname, '../assets/data/samples/card_viewer.html');

// Check if the file exists
if (!fs.existsSync(htmlFile)) {
  console.error('Card viewer HTML file not found. Please generate cards first.');
  console.log('Run: node src/tools/generateSampleCards.js');
  process.exit(1);
}

// Determine the command to open the file based on the platform
let command;
switch (process.platform) {
  case 'win32':
    command = `start "" "${htmlFile}"`;
    break;
  case 'darwin':
    command = `open "${htmlFile}"`;
    break;
  default:
    command = `xdg-open "${htmlFile}"`;
}

// Execute the command to open the file
console.log('Opening card viewer in your default browser...');
exec(command, (error) => {
  if (error) {
    console.error('Error opening the file:', error.message);
    return;
  }
  console.log('Card viewer opened successfully!');
});

// Also print the path in case the automatic opening fails
console.log(`If the viewer doesn't open automatically, you can find it at: ${htmlFile}`); 