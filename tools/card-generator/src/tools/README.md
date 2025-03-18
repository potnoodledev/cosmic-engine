# Card Game Tools

This directory contains various tools for the Card Game project.

## Card Generation Tool

The `createCardWithImage.js` script is a powerful tool for creating cards with AI-generated images using Hugging Face.

### Usage

```bash
node createCardWithImage.js --name="Card Name" --type="minion|spell|weapon" --cost=X --attack=X --health=X --description="Card description" --flavorText="Flavor text" --rarity="common|rare|epic|legendary"
```

### Prerequisites

Before using this tool, ensure:

1. The API server is running (`npm run api`)
2. MongoDB is connected
3. The Hugging Face API key is set in the `.env` file

### Examples

#### Creating a Minion

```bash
node createCardWithImage.js --name="Frost Giant" --type="minion" --cost=8 --attack=8 --health=8 --description="Battlecry: Freeze all enemy minions." --flavorText="The mountains tremble when frost giants walk." --rarity="epic"
```

#### Creating a Spell

```bash
node createCardWithImage.js --name="Fireball" --type="spell" --cost=4 --description="Deal 6 damage." --flavorText="This spell is useful for burning things." --rarity="common"
```

For more detailed information, see the main `card_generation_guide.md` file in the project root.

## Helper Scripts

For convenience, you can also use the helper scripts in the project root:

- Windows: `create-card.bat`
- Unix/Linux/Mac: `create-card.sh`

These scripts provide a simpler interface for the card generation tool. 