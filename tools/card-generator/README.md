# Card Game with MongoDB Integration

A Hearthstone-like card game with AI-generated cards and MongoDB database integration.

## Features

- Generate cards using AI (OpenAI or local generation)
- Store cards in MongoDB database
- Create and manage card collections
- View cards in a beautiful card viewer
- Play the card game with generated cards

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd card-game
```

2. Install dependencies:
```bash
npm install
```

3. Set up MongoDB:
   - Install MongoDB locally or create a MongoDB Atlas account
   - Update the `.env` file with your MongoDB connection string

## MongoDB Setup

### Local MongoDB Installation

1. Install MongoDB Community Edition:
   - Windows: [MongoDB Windows Installation Guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
   - macOS: [MongoDB macOS Installation Guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
   - Linux: [MongoDB Linux Installation Guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. Start MongoDB service:
   - Windows: `net start MongoDB`
   - macOS/Linux: `sudo systemctl start mongod`

3. Verify MongoDB is running:
```bash
mongo --eval "db.version()"
```

### MongoDB Atlas (Cloud)

1. Create a [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster
3. Set up database access (username and password)
4. Set up network access (IP whitelist)
5. Get your connection string and update the `.env` file

## Configuration

Update the `.env` file with your configuration:

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/card-game

# OpenAI API Key (if using)
OPENAI_API_KEY=your_api_key_here

# Application Settings
PORT=8080
NODE_ENV=development
```

## Running the Application

### Running Everything Together

To start both the game and API server:

```bash
npm run start-all
```

This will start:
- The game server at http://localhost:8080
- The API server at http://localhost:3000

### Running Separately

1. Start the API server:
```bash
npm run api
```

2. Start the game server:
```bash
npm start
```

## Migrating Existing Cards

To migrate your existing cards from JSON to MongoDB:

```bash
npm run migrate
```

This will import all cards from `src/assets/data/cards.json` into your MongoDB database.

## Viewing Cards

There are two ways to view your cards:

1. **MongoDB Card Viewer**: Open `src/assets/data/samples/mongodb_card_viewer.html` in your browser to view cards from MongoDB.

2. **Collection Manager**: Open `src/assets/data/samples/collection_manager.html` in your browser to manage your card collections.

## Database Structure

The MongoDB database contains the following collections:

1. **Cards**: Stores all card data
   - name
   - type (minion, spell)
   - cost
   - attack (for minions)
   - health (for minions)
   - description
   - flavor text
   - image data or path

2. **Collections**: Stores card collections
   - name
   - description
   - userId
   - cards (array of card references with quantities)

## API Reference

The API server provides the following endpoints:

### Card Endpoints

- `GET /api/cards`: Get all cards
- `GET /api/cards/:id`: Get a card by ID
- `GET /api/cards/:id/image`: Get a card image
- `POST /api/cards`: Create a new card
- `PUT /api/cards/:id`: Update a card
- `DELETE /api/cards/:id`: Delete a card

### Collection Endpoints

- `GET /api/collections`: Get all collections
- `GET /api/collections/:id`: Get a collection by ID
- `GET /api/collections/:id/cards`: Get cards in a collection
- `POST /api/collections`: Create a new collection
- `PUT /api/collections/:id`: Update a collection
- `DELETE /api/collections/:id`: Delete a collection
- `POST /api/collections/:id/cards`: Add a card to a collection
- `DELETE /api/collections/:id/cards/:cardId`: Remove a card from a collection

## GitHub Pages Deployment

This project includes a card viewer that can be deployed on GitHub Pages. The viewer allows you to browse your cards and collections from any web browser.

### Features

- View all cards in your database
- Filter cards by collection
- Pagination for large card sets
- View detailed card data in JSON format
- Responsive design for mobile and desktop

### Deployment

See the [DEPLOYMENT.md](DEPLOYMENT.md) guide for detailed instructions on how to deploy both the API server and the GitHub Pages card viewer.

### Usage

1. Deploy your API server (see deployment guide)
2. Access your card viewer at `https://yourusername.github.io/Card-Game/`
3. Enter the URL of your API server
4. Browse your cards and collections

## License

MIT 