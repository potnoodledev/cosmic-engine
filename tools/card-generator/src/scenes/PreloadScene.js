import Phaser from 'phaser';

class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Create loading bar
        this.createLoadingBar();

        // Create default placeholder images
        this.createDefaultPlaceholders();

        // Load all game assets
        this.loadImages();
        this.loadSpritesheets();
        this.loadAudio();
        this.loadFonts();
        
        // Load card data
        this.load.json('card-data', 'assets/data/cards.json');
        
        // Add error handler for missing files
        this.load.on('loaderror', (fileObj) => {
            console.warn('Error loading asset:', fileObj.key);
        });
    }

    createDefaultPlaceholders() {
        // Create default background
        const bgGraphics = this.make.graphics();
        bgGraphics.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x1a2530, 0x1a2530, 1);
        bgGraphics.fillRect(0, 0, 1280, 720);
        bgGraphics.generateTexture('background', 1280, 720);
        
        // Create default button
        const buttonGraphics = this.make.graphics();
        buttonGraphics.fillStyle(0x3498db);
        buttonGraphics.fillRoundedRect(0, 0, 200, 60, 10);
        buttonGraphics.generateTexture('button', 200, 60);
        
        // Create default card back
        const cardBackGraphics = this.make.graphics();
        cardBackGraphics.fillStyle(0x34495e);
        cardBackGraphics.fillRoundedRect(0, 0, 140, 200, 10);
        cardBackGraphics.lineStyle(4, 0x2c3e50);
        cardBackGraphics.strokeRoundedRect(0, 0, 140, 200, 10);
        cardBackGraphics.fillStyle(0x2c3e50);
        cardBackGraphics.fillCircle(70, 100, 40);
        cardBackGraphics.generateTexture('card-back', 140, 200);
        
        // Create default card template
        const cardTemplateGraphics = this.make.graphics();
        cardTemplateGraphics.fillStyle(0x95a5a6);
        cardTemplateGraphics.fillRoundedRect(0, 0, 140, 200, 10);
        cardTemplateGraphics.lineStyle(4, 0x7f8c8d);
        cardTemplateGraphics.strokeRoundedRect(0, 0, 140, 200, 10);
        cardTemplateGraphics.generateTexture('card-template', 140, 200);
        
        // Create default board
        const boardGraphics = this.make.graphics();
        boardGraphics.fillStyle(0x8e44ad);
        boardGraphics.fillRect(0, 0, 1280, 720);
        boardGraphics.fillStyle(0x7d3c98);
        boardGraphics.fillRect(0, 260, 1280, 200);
        boardGraphics.generateTexture('board', 1280, 720);
        
        // Create default logo
        const logoGraphics = this.make.graphics();
        logoGraphics.fillStyle(0xe74c3c);
        logoGraphics.fillRoundedRect(0, 0, 400, 200, 20);
        logoGraphics.generateTexture('logo', 400, 200);
        
        // Create particle texture for menu effects
        const particleGraphics = this.make.graphics();
        particleGraphics.fillStyle(0xffffff, 1);
        particleGraphics.fillCircle(4, 4, 4);
        particleGraphics.generateTexture('particle', 8, 8);
    }

    createLoadingBar() {
        // Background
        this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 
                          this.cameras.main.width, this.cameras.main.height, 0x2c3e50);
        
        // Logo placeholder
        const logoRect = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 
                          400, 4, 0xe74c3c);
        
        // Add logo text
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 
                     'AI Card Game', {
                         font: '32px Arial',
                         fill: '#ffffff'
                     }).setOrigin(0.5);

        // Progress bar container
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(this.cameras.main.width / 2 - 160, this.cameras.main.height / 2 + 60, 320, 50);
        
        // Loading text
        const loadingText = this.make.text({
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2 + 30,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        // Percent text
        const percentText = this.make.text({
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2 + 85,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);
        
        // Asset text
        const assetText = this.make.text({
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2 + 130,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);
        
        // Update progress bar as assets load
        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(this.cameras.main.width / 2 - 150, this.cameras.main.height / 2 + 70, 300 * value, 30);
        });
        
        // Update file progress text
        this.load.on('fileprogress', (file) => {
            assetText.setText('Loading asset: ' + file.key);
        });

        // Remove progress bar when complete
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
            
            // Hide the HTML loading screen
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
            
            // Start the main menu
            this.scene.start('MainMenuScene');
        });
    }

    loadImages() {
        // UI elements
        this.load.image('background', 'assets/images/background.jpg');
        this.load.image('card-back', 'assets/images/card-back.png');
        this.load.image('button', 'assets/images/button.png');
        this.load.image('board', 'assets/images/board.jpg');
        
        // Card template
        this.load.image('card-template', 'assets/images/card-template.png');
        
        // Icons
        this.load.image('health-icon', 'assets/images/health-icon.png');
        this.load.image('mana-icon', 'assets/images/mana-icon.png');
        this.load.image('attack-icon', 'assets/images/attack-icon.png');
    }

    loadSpritesheets() {
        // Card effects
        this.load.spritesheet('card-glow', 'assets/spritesheets/card-glow.png', { 
            frameWidth: 200, 
            frameHeight: 300 
        });
        
        // Attack animations
        this.load.spritesheet('attack-effect', 'assets/spritesheets/attack-effect.png', { 
            frameWidth: 100, 
            frameHeight: 100 
        });
        
        // Create default attack effect
        this.createDefaultAttackEffect();
    }

    createDefaultAttackEffect() {
        // Create a simple attack effect animation frames
        const attackGraphics = this.make.graphics();
        attackGraphics.fillStyle(0xff0000);
        attackGraphics.fillCircle(50, 50, 30);
        attackGraphics.generateTexture('attack-effect', 100, 100);
    }

    loadAudio() {
        // Background music
        this.load.audio('menu-music', 'assets/audio/menu-music.mp3');
        this.load.audio('game-music', 'assets/audio/game-music.mp3');
        
        // Sound effects
        this.load.audio('card-place', 'assets/audio/card-place.mp3');
        this.load.audio('card-attack', 'assets/audio/card-attack.mp3');
        this.load.audio('card-draw', 'assets/audio/card-draw.mp3');
        this.load.audio('button-click', 'assets/audio/button-click.mp3');
    }

    loadFonts() {
        // Custom WebFonts can be loaded here if needed
    }

    create() {
        // Create animations
        this.createAnimations();
        
        // Start the main menu scene
        this.scene.start('MainMenuScene');
    }

    createAnimations() {
        // Card glow animation
        if (this.textures.exists('card-glow')) {
            this.anims.create({
                key: 'card-glow-anim',
                frames: this.anims.generateFrameNumbers('card-glow', { start: 0, end: 7 }),
                frameRate: 10,
                repeat: -1
            });
        }
        
        // Attack effect animation
        if (this.textures.exists('attack-effect')) {
            this.anims.create({
                key: 'attack-effect-anim',
                frames: [{ key: 'attack-effect', frame: 0 }],
                frameRate: 15,
                repeat: 0
            });
        }
    }
}

export default PreloadScene; 