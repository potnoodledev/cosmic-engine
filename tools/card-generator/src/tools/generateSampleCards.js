/**
 * Sample Card Generator
 * This script generates 5 unique cards and saves them to a file for viewing.
 */

const fs = require('fs');
const path = require('path');
const { generateCardFromPrompt } = require('./cursorCardGenerator');

// Create directory for sample cards if it doesn't exist
const sampleDir = path.join(__dirname, '../assets/data/samples');
if (!fs.existsSync(sampleDir)) {
  fs.mkdirSync(sampleDir, { recursive: true });
}

// Create directory for card images if it doesn't exist
const imagesDir = path.join(sampleDir, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Function to assign a placeholder image based on card type and description
function assignPlaceholderImage(card) {
  // Create a copy of the card to avoid modifying the original
  const cardWithImage = { ...card };
  
  // Base path for placeholder images
  const imagePath = `src/assets/data/samples/images/${card.name.toLowerCase().replace(/\s+/g, '_')}.png`;
  
  // Assign the image path to the card
  cardWithImage.imagePath = imagePath;
  
  // Generate a placeholder image based on card type and description
  generatePlaceholderImage(card, path.join(__dirname, '..', '..', imagePath));
  
  return cardWithImage;
}

// Function to generate a placeholder image for a card
function generatePlaceholderImage(card, outputPath) {
  // Create a simple SVG as a placeholder
  // In a real implementation, this would call an image generation API
  
  // Choose colors based on card type
  let bgColor, fgColor;
  if (card.type === 'spell') {
    bgColor = '#3498db'; // Blue for spells
    fgColor = '#ffffff';
  } else {
    // For minions, choose color based on stats
    if (card.attack >= 5) {
      bgColor = '#e74c3c'; // Red for high attack
    } else if (card.health >= 5) {
      bgColor = '#2ecc71'; // Green for high health
    } else {
      bgColor = '#f39c12'; // Orange for balanced
    }
    fgColor = '#ffffff';
  }
  
  // Create SVG content
  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="${bgColor}" />
  <text x="150" y="100" font-family="Arial" font-size="24" text-anchor="middle" fill="${fgColor}">${card.name}</text>
  <text x="150" y="150" font-family="Arial" font-size="18" text-anchor="middle" fill="${fgColor}">${card.type.toUpperCase()}</text>
  ${card.type === 'minion' 
    ? `<text x="150" y="200" font-family="Arial" font-size="36" text-anchor="middle" fill="${fgColor}">${card.attack}/${card.health}</text>` 
    : `<text x="150" y="200" font-family="Arial" font-size="36" text-anchor="middle" fill="${fgColor}">SPELL</text>`}
</svg>
  `;
  
  // Ensure the directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write the SVG to a file
  fs.writeFileSync(outputPath, svgContent, 'utf8');
  
  console.log(`Generated placeholder image for ${card.name} at ${outputPath}`);
}

let cards = [];
let outputFile;

async function generateCards() {
  cards = [
    // Card 1: Mystic Phoenix
    await generateCardFromPrompt("A mystical phoenix that rises from its ashes, bringing hope and renewal", {
      name: "Mystic Phoenix",
      type: "minion",
      cost: 6,
      attack: 6,
      health: 6,
      flavor: "Its flames are a beacon of hope in the darkest times.",
      save: true,
      generateImage: true
    }),

    // Card 2: Arcane Shield
    await generateCardFromPrompt("A powerful shield that absorbs all incoming damage for one turn", {
      name: "Arcane Shield",
      type: "spell",
      cost: 5,
      flavor: "The shield glows with an ethereal light, protecting its bearer.",
      save: true,
      generateImage: true
    }),

    // Card 3: Shadow Assassin
    await generateCardFromPrompt("A stealthy assassin that strikes from the shadows, unseen and deadly", {
      name: "Shadow Assassin",
      type: "minion",
      cost: 4,
      attack: 5,
      health: 3,
      flavor: "Silent as the night, swift as the wind.",
      save: true,
      generateImage: true
    })
  ];

  // Add imageUrl field to each card
  cards.forEach(card => {
    card.imageUrl = `src/assets/data/card_images/${card.name.toLowerCase().replace(/\s+/g, '_')}.png`;
  });

  // Save cards to a JSON file
  outputFile = path.join(sampleDir, 'sample_cards.json');
  fs.writeFileSync(outputFile, JSON.stringify({ cards }, null, 2), 'utf8');

  console.log('Cards generated and saved successfully!');
}

// Run the card generation
generateCards().catch(error => {
  console.error('Error generating cards:', error);
});

// Create an HTML viewer for the cards
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sample Cards Viewer</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #2c3e50;
      color: white;
      padding: 20px;
    }
    .cards-container {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: center;
    }
    .card {
      width: 250px;
      height: 400px;
      background-color: #34495e;
      border-radius: 10px;
      padding: 15px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      position: relative;
      overflow: hidden;
    }
    .card-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
      text-align: center;
    }
    .card-cost {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 30px;
      height: 30px;
      background-color: #3498db;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      z-index: 2;
    }
    .card-type {
      font-style: italic;
      color: #bdc3c7;
      text-align: center;
      margin-bottom: 15px;
    }
    .card-image {
      width: 100%;
      height: 150px;
      background-color: #2c3e50;
      margin-bottom: 15px;
      border-radius: 5px;
      overflow: hidden;
      position: relative;
    }
    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .card-stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
    }
    .card-attack, .card-health {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .card-attack {
      background-color: #e74c3c;
    }
    .card-health {
      background-color: #2ecc71;
    }
    .card-description {
      background-color: rgba(0, 0, 0, 0.2);
      padding: 10px;
      border-radius: 5px;
      min-height: 80px;
      margin-bottom: 15px;
    }
    .card-flavor {
      font-style: italic;
      font-size: 12px;
      color: #bdc3c7;
      text-align: center;
      padding: 10px;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 5px;
    }
    .spell-card .card-stats {
      display: none;
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
    }
    .info {
      max-width: 800px;
      margin: 0 auto 30px auto;
      padding: 15px;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <h1>Sample Generated Cards</h1>
  
  <div class="info">
    <p>These cards were generated using the card generation system. The images are placeholders that would be replaced with AI-generated images in a production environment.</p>
    <p>To generate your own cards, use the card generator tools in the project.</p>
  </div>
  
  <div class="cards-container">
    ${cards.map(card => `
      <div class="card ${card.type === 'spell' ? 'spell-card' : ''}">
        <div class="card-cost">${card.cost}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-type">${card.type.charAt(0).toUpperCase() + card.type.slice(1)}</div>
        
        <div class="card-image">
          <img src="/${card.imagePath}" alt="${card.name}">
        </div>
        
        ${card.type === 'minion' ? `
          <div class="card-stats">
            <div class="card-attack">${card.attack}</div>
            <div class="card-health">${card.health}</div>
          </div>
        ` : ''}
        <div class="card-description">${card.description}</div>
        <div class="card-flavor">${card.flavor}</div>
      </div>
    `).join('')}
  </div>
  
  <div class="info" style="margin-top: 30px;">
    <h3>Integrating Real Image Generation</h3>
    <p>To integrate real AI image generation, you would:</p>
    <ol>
      <li>Use an API like OpenAI's DALL-E, Midjourney API, or Stable Diffusion</li>
      <li>Generate a prompt based on the card's name, type, and description</li>
      <li>Request an image from the API</li>
      <li>Save the generated image and update the card's imagePath</li>
    </ol>
    <p>Example prompt for Inferno Drake: "A majestic red dragon breathing fire, digital art style for a fantasy card game, detailed scales, epic pose"</p>
  </div>
</body>
</html>
`;

const htmlFile = path.join(sampleDir, 'card_viewer.html');
fs.writeFileSync(htmlFile, htmlContent, 'utf8');

// Also save cards to the main cards.json file if it exists
try {
  const mainCardsPath = path.join(__dirname, '../assets/data/cards.json');
  if (fs.existsSync(mainCardsPath)) {
    const mainCardsData = JSON.parse(fs.readFileSync(mainCardsPath, 'utf8'));
    
    // Add the sample cards to the main cards
    cards.forEach(card => {
      // Check if card with same name already exists
      const exists = mainCardsData.cards.some(c => c.name === card.name);
      if (!exists) {
        mainCardsData.cards.push(card);
      }
    });
    
    // Write back to the main cards file
    fs.writeFileSync(mainCardsPath, JSON.stringify(mainCardsData, null, 2), 'utf8');
    console.log('Cards also added to the main cards.json file');
  }
} catch (error) {
  console.error('Error adding cards to main cards.json:', error.message);
}

console.log(`Generated 5 cards with placeholder images and saved them to ${outputFile}`);
console.log(`Created HTML viewer at ${htmlFile}`);
console.log('You can open the HTML file in your browser to view the cards');

// Return the cards for use in other scripts
module.exports = cards; 