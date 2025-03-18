# Card Generation Guide

This guide outlines the process for generating cards with AI-generated images using Hugging Face for the Card Game project.

## Prerequisites

Before generating cards, ensure:

1. The API server is running:
   ```
   npm run api
   ```

2. MongoDB is connected and accessible
   
3. The Hugging Face API key is set in the `.env` file:
   ```
   HUGGINGFACE_API_KEY=your_api_key_here
   ```

## Card Generation Process

### Using the Command Line Tool

The project includes a dedicated tool for card generation with Hugging Face images:

```bash
node src/tools/createCardWithImage.js --name="Card Name" --type="minion|spell|weapon" --cost=X --attack=X --health=X --description="Card description" --flavorText="Flavor text" --rarity="common|rare|epic|legendary"
```

### Required Parameters

| Parameter    | Description                                      | Required For      |
|--------------|--------------------------------------------------|-------------------|
| name         | The name of the card                             | All cards         |
| type         | Card type: minion, spell, or weapon              | All cards         |
| cost         | Mana cost to play the card                       | All cards         |
| attack       | Attack value                                     | Minions, Weapons  |
| health       | Health/Durability value                          | Minions, Weapons  |
| description  | Card effect description                          | All cards         |
| flavorText   | Flavor text (lore, quotes, etc.)                 | Optional          |
| rarity       | Card rarity: common, rare, epic, or legendary    | All cards         |

### Examples

#### Creating a Minion Card

```bash
node src/tools/createCardWithImage.js --name="Frost Giant" --type="minion" --cost=8 --attack=8 --health=8 --description="Battlecry: Freeze all enemy minions." --flavorText="The mountains tremble when frost giants walk." --rarity="epic"
```

#### Creating a Spell Card

```bash
node src/tools/createCardWithImage.js --name="Fireball" --type="spell" --cost=4 --description="Deal 6 damage." --flavorText="This spell is useful for burning things." --rarity="common"
```

#### Creating a Weapon Card

```bash
node src/tools/createCardWithImage.js --name="Fiery War Axe" --type="weapon" --cost=3 --attack=3 --health=2 --description="A powerful axe forged in elemental fire." --flavorText="Burning the candle at both ends still burns your enemies." --rarity="rare"
```

#### Creating a Stealth Minion Card

```bash
node src/tools/createCardWithImage.js --name="Shadow Assassin" --type="minion" --cost=4 --attack=5 --health=3 --description="Stealth. Battlecry: Deal 2 damage to an enemy minion." --flavorText="Strikes from darkness, leaves no trace." --rarity="rare"
```

### Complete Walkthrough

Here's a complete walkthrough of the card creation process:

1. **Ensure Prerequisites**:
   - Make sure the API server is running with `npm run api`
   - Verify MongoDB is connected
   - Check that your Hugging Face API key is set in the `.env` file

2. **Run the Card Generation Command**:
   ```bash
   node src/tools/createCardWithImage.js --name="Shadow Assassin" --type="minion" --cost=4 --attack=5 --health=3 --description="Stealth. Battlecry: Deal 2 damage to an enemy minion." --flavorText="Strikes from darkness, leaves no trace." --rarity="rare"
   ```

3. **Expected Output**:
   ```
   Creating card: Shadow Assassin
   Card created successfully with ID: [MongoDB ID]
   Generating image for card with ID: [MongoDB ID]
   Image generated successfully

   === Card Information ===
   Name: Shadow Assassin
   Type: minion
   Cost: 4
   Attack: 5
   Health: 3
   Description: Stealth. Battlecry: Deal 2 damage to an enemy minion.
   Rarity: rare
   ID: [MongoDB ID]
   Image Path: /images/cards/shadow_assassin_[timestamp].png
   Image URL: http://localhost:3000/api/images/cards/shadow_assassin_[timestamp].png

   To view this card in the MongoDB Card Viewer:
   start src/assets/data/samples/mongodb_card_viewer.html
   ```

4. **View the Card**:
   - Open the MongoDB Card Viewer to see your newly created card:
   ```
   start src/assets/data/samples/mongodb_card_viewer.html
   ```

### Helper Scripts

For convenience, the project includes helper scripts:

#### Windows

```
create-card.bat "Card Name" "minion|spell|weapon" cost attack health "Card description" "Flavor text" "rarity"
```

Example:
```
create-card.bat "Fire Elemental" "minion" 5 5 5 "Battlecry: Deal 3 damage to any target." "The essence of fire, given form and purpose." "rare"
```

#### Unix/Linux/Mac

```
./create-card.sh "Card Name" "minion|spell|weapon" cost attack health "Card description" "Flavor text" "rarity"
```

Example:
```
./create-card.sh "Fire Elemental" "minion" 5 5 5 "Battlecry: Deal 3 damage to any target." "The essence of fire, given form and purpose." "rare"
```

## Image Generation Details

The tool uses Hugging Face's text-to-image models to generate card images based on:

1. Card name
2. Card type
3. Card rarity
4. Card description
5. Card stats (for minions)

The image generation process:

1. Creates a detailed prompt based on card properties
2. Calls the Hugging Face API with the prompt
3. Saves the generated image to `src/api/public/images/cards/`
4. Updates the card in the database with the image path

## Viewing Generated Cards

After generating a card, you can view it in the MongoDB Card Viewer:

```
start src/assets/data/samples/mongodb_card_viewer.html
```

The viewer will display all cards in the database, including:
- Card name, type, and stats
- Card description and flavor text
- The AI-generated image
- Card rarity and other properties

## Troubleshooting

If you encounter issues:

1. **API Server Not Running**
   - Start the API server with `npm run api`
   - If port 3000 is in use, find and terminate the process using it
   - You'll see an error like `Error: listen EADDRINUSE: address already in use :::3000` if the port is already in use

2. **MongoDB Connection Issues**
   - Ensure MongoDB is running
   - Check connection string in `.env` file
   - Look for "MongoDB Connected" message in the API server logs

3. **Hugging Face API Issues**
   - Verify your API key is correct in `.env`
   - Check API rate limits
   - The tool will fall back to SVG generation if Hugging Face fails
   - Look for "Generating image with prompt" messages in the API server logs

4. **Image Not Generating**
   - Check the API server logs for errors
   - Ensure the `src/api/public/images/cards/` directory exists and is writable
   - Verify that the API server is responding to requests

## Implementation Details

The card generation tool is implemented in:
- `src/tools/createCardWithImage.js` - Main Node.js script
- `create-card.bat` - Windows helper script
- `create-card.sh` - Unix/Linux/Mac helper script
- `src/api/utils/huggingfaceImageGenerator.js` - Hugging Face integration
- `src/api/routes/cards.js` - API endpoints for card creation and image generation 