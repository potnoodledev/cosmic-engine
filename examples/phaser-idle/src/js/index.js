import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 640,
    height: 960,
    backgroundColor: '#f8f8f8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container',
        width: 640,
        height: 960,
        min: {
            width: 320,
            height: 480
        },
        max: {
            width: 1280,
            height: 1920
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, GameScene]
};

window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
    
    // Handle resize events for better responsiveness
    window.addEventListener('resize', () => {
        game.scale.refresh();
    });
    
    // Prevent default touch behavior on mobile
    document.addEventListener('touchmove', (e) => {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Handle iOS Safari viewport issues
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        window.scrollTo(0, 0);
    }
    
    // Force an initial scale refresh to ensure proper centering
    setTimeout(() => {
        game.scale.refresh();
    }, 100);
}); 