# Card Game Viewer

This is a web-based viewer for the Card Game project. It allows you to view cards stored in your MongoDB database through the API server.

## How to Use

1. Deploy your API server (the Express server from the Card Game project)
2. Enter the URL of your API server in the input field (e.g., `http://your-api-server.com`)
3. Click "Connect" to load your cards
4. Browse your cards and collections

## Features

- View all cards in your database
- Filter cards by collection
- Pagination for large card sets
- View detailed card data in JSON format
- Responsive design for mobile and desktop

## Deployment

This viewer is designed to be deployed on GitHub Pages, but it can be hosted on any static web server. It connects to your API server to fetch card data.

## API Server Requirements

Your API server must have the following endpoints:

- `GET /api/cards` - Returns a list of cards
- `GET /api/collections` - Returns a list of collections
- `GET /api/collections/:id/cards` - Returns cards in a specific collection
- `GET /api/cards/:id/image` - Returns the image for a specific card

## Local Development

To run this viewer locally:

1. Start your API server
2. Open `index.html` in your browser
3. Enter the URL of your local API server (e.g., `http://localhost:3000`)

## Troubleshooting

If you encounter CORS issues, make sure your API server has CORS enabled for the domain where this viewer is hosted. 