# Ramen Noodle Maker

A mobile-responsive web game about making ramen noodles, built with Phaser 3.

## Game Concept

This is an idle/cooking game where players make ramen noodles through a series of simple interactions:

1. **Pull the dough down** from the top of the screen to the center
2. **Rotate the dough** by dragging around it to stretch and prepare it
3. **Move the finished dough** to the right to complete one cycle

Each completed cycle adds to your rolled dough count, which can later be used for upgrades and progression.

## Play Online

You can play the latest version of the game on GitHub Pages:
[Play Ramen Noodle Maker](https://potnoodledev.github.io/03-12-ramen/)

## Development Setup

### Prerequisites

- Node.js (v12 or higher)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Running the Game

Start the development server:
```
npm start
```
or
```
yarn start
```

The game will be available at `http://localhost:1234`

### Building for Production

Build the game for production:
```
npm run build
```
or
```
yarn build
```

The built files will be in the `dist` directory.

### Deployment

The game is automatically deployed to GitHub Pages when changes are pushed to the main branch, using GitHub Actions.

To manually trigger a deployment:
1. Go to the GitHub repository
2. Navigate to Actions tab
3. Select the "Deploy to GitHub Pages" workflow
4. Click "Run workflow"

## Game Mechanics

### Current Features

- Drag dough from top to center
- Rotate dough to increase progress
- Move completed dough to the right
- Track number of completed doughs

### Planned Features

- Upgrades to increase efficiency
- Different types of noodles
- Cooking mechanics
- Customer orders
- Shop and progression system

## Technologies Used

- Phaser 3 - Game framework
- Parcel - Bundler
- SVG - Graphics

## License

MIT 