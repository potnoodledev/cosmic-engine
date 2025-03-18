import Phaser from 'phaser';
import { preloadSVGAssets } from '../utils/SVGAssets';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        // Update progress bar as assets load
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            console.log('All assets loaded successfully');
        });
        
        // Load game assets using our SVG utility
        preloadSVGAssets(this);
    }

    create() {
        console.log('BootScene complete, starting GameScene');
        
        // Verify that textures were loaded
        const textureKeys = this.textures.getTextureKeys();
        console.log('Loaded textures:', textureKeys);
        
        this.scene.start('GameScene');
    }
} 