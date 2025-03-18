import Phaser from 'phaser';
import './styles/main.css';

// Import database
import { initDatabase } from './database';

// Import scenes
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import MainMenuScene from './scenes/MainMenuScene';
import GameScene from './scenes/GameScene';
import CardGeneratorScene from './scenes/CardGeneratorScene';

// Initialize MongoDB connection
initDatabase()
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch(error => {
        console.error('Failed to connect to MongoDB:', error);
        console.warn('Game will run with limited functionality (no database persistence)');
    });

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#2c3e50',
    scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        GameScene,
        CardGeneratorScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Create the game instance
const game = new Phaser.Game(config);

// Hide loading screen when the game is ready
window.addEventListener('load', () => {
    // We'll hide the loading screen from the PreloadScene
});

// Export game instance for global access
window.game = game; 