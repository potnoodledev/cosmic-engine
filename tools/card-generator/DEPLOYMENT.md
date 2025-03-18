# Deployment Guide

This guide will help you deploy both your Card Game API server and the card viewer on GitHub Pages.

## Deploying the API Server

You have several options for deploying your API server:

### Option 1: Deploy on a VPS (Digital Ocean, AWS EC2, etc.)

1. Set up a VPS with Node.js installed
2. Clone your repository to the server
3. Install dependencies: `npm install`
4. Set up environment variables (MongoDB URI, Hugging Face API key, etc.)
5. Start the API server: `npm run start:api`
6. (Optional) Set up a process manager like PM2: `pm2 start src/api/start.js --name card-game-api`
7. (Optional) Set up Nginx as a reverse proxy

### Option 2: Deploy on Heroku

1. Create a Heroku account and install the Heroku CLI
2. Create a new Heroku app: `heroku create your-card-game-api`
3. Add MongoDB add-on or set up MongoDB Atlas
4. Set environment variables in Heroku dashboard or using CLI:
   ```
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set HUGGINGFACE_API_KEY=your_api_key
   ```
5. Push your code to Heroku: `git push heroku main`

### Option 3: Deploy on Render, Railway, or similar platforms

1. Create an account on the platform
2. Connect your GitHub repository
3. Set up environment variables
4. Configure the build command: `npm install`
5. Configure the start command: `node src/api/start.js`

## Enabling CORS for GitHub Pages

To allow your GitHub Pages site to access your API, you need to enable CORS. Update your `src/api/server.js` file:

```javascript
// Update CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourusername.github.io'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Replace `yourusername` with your actual GitHub username.

## Deploying the Card Viewer on GitHub Pages

1. Push your repository to GitHub:
   ```
   git remote add origin https://github.com/yourusername/Card-Game.git
   git push -u origin main
   ```

2. Update the GitHub link in `docs/index.html` with your actual repository URL:
   ```html
   <a href="https://github.com/yourusername/Card-Game" class="github-link" target="_blank">View on GitHub</a>
   ```

3. Enable GitHub Pages in your repository settings:
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to "GitHub Pages"
   - Select "main branch" as the source and "/docs" as the folder
   - Click "Save"

4. Your card viewer will be available at `https://yourusername.github.io/Card-Game/`

## Using the Card Viewer

1. Open your deployed card viewer in a browser
2. Enter the URL of your deployed API server (e.g., `https://your-card-game-api.herokuapp.com`)
3. Click "Connect" to load your cards
4. Browse your cards and collections

## Troubleshooting

- **CORS errors**: Make sure your API server has CORS enabled for your GitHub Pages domain
- **API connection issues**: Check that your API server is running and accessible
- **MongoDB connection issues**: Verify your MongoDB URI and credentials
- **Image loading issues**: Ensure your API server can access and serve card images 