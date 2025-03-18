import Phaser from 'phaser';

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
        this.particles = null;
        this.emitter = null;
        this.menuButtons = [];
    }

    create() {
        // Add background with parallax effect
        this.createBackground();
        
        // Add logo with glow effect
        this.createLogo();
        
        // Add decorative card elements
        this.createDecorativeElements();
        
        // Play menu music if available
        this.playMenuMusic();
        
        // Create buttons with improved styling
        this.createButtons();
        
        // Add version text
        this.add.text(10, this.cameras.main.height - 20, 'v1.0.0', {
            font: '16px Arial',
            fill: '#ffffff',
            align: 'left'
        });
        
        // Add copyright text
        this.add.text(this.cameras.main.width - 10, this.cameras.main.height - 20, '© 2025 Card Game', {
            font: '16px Arial',
            fill: '#ffffff',
            align: 'right'
        }).setOrigin(1, 0);
    }

    createBackground() {
        // Main background
        const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Add overlay gradient for better text visibility
        const overlay = this.add.graphics();
        overlay.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.7, 0.7, 0, 0);
        overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        // Create particle effect for magical ambiance - using compatible method
        try {
            // Create a fallback particle if the image isn't available
            const particleGraphics = this.make.graphics();
            particleGraphics.fillStyle(0xffffff, 1);
            particleGraphics.fillCircle(4, 4, 4);
            particleGraphics.generateTexture('particle', 8, 8);
            
            // Create particles using the compatible method
            const particles = this.add.particles(0, 0, 'particle', {
                x: { min: 0, max: this.cameras.main.width },
                y: { min: 0, max: this.cameras.main.height },
                scale: { start: 0.5, end: 0 },
                speed: { min: 20, max: 50 },
                angle: { min: 0, max: 360 },
                rotate: { min: 0, max: 360 },
                alpha: { start: 0.5, end: 0 },
                lifespan: 3000,
                frequency: 500, // Emit a particle every 500ms
                blendMode: 'ADD'
            });
            
            this.particles = particles;
        } catch (error) {
            console.warn('Could not create particle effect:', error);
        }
    }

    createLogo() {
        // Add logo with pulsing animation
        const logo = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 - 180, 'logo')
            .setDisplaySize(500, 250);
        
        // Add glow effect to logo
        const logoGlow = this.add.graphics();
        logoGlow.fillStyle(0xffffff, 0.2);
        logoGlow.fillCircle(this.cameras.main.width / 2, this.cameras.main.height / 2 - 180, 150);
        
        // Add tagline text
        const tagline = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 180, 'The Ultimate Card Battle', {
            font: '24px Arial',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Add pulsing animation to logo and tagline
        this.tweens.add({
            targets: [logo, tagline],
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add pulsing animation to glow
        this.tweens.add({
            targets: logoGlow,
            alpha: 0.1,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createDecorativeElements() {
        // Add decorative cards on the sides
        const leftCard = this.add.image(100, this.cameras.main.height / 2, 'card-back')
            .setDisplaySize(140, 200)
            .setAngle(-15)
            .setAlpha(0.7);
            
        const rightCard = this.add.image(this.cameras.main.width - 100, this.cameras.main.height / 2, 'card-back')
            .setDisplaySize(140, 200)
            .setAngle(15)
            .setAlpha(0.7);
            
        // Add floating animation to cards
        this.tweens.add({
            targets: [leftCard, rightCard],
            y: '+=20',
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    playMenuMusic() {
        try {
            if (this.cache.audio.exists('menu-music') && !this.sound.get('menu-music')) {
                const music = this.sound.add('menu-music', { loop: true, volume: 0.5 });
                music.play();
            }
        } catch (error) {
            console.warn('Menu music not available:', error);
        }
    }

    createButtons() {
        const buttonStyle = {
            font: '24px Arial',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        };
        
        const buttonData = [
            { text: 'Play Game', scene: 'GameScene', y: 30 },
            { text: 'Card Collection', scene: 'CollectionScene', y: 110 },
            { text: 'Card Generator', scene: 'CardGeneratorScene', y: 190 },
            { text: 'Options', scene: 'OptionsScene', y: 270 },
            { text: 'Quit', action: 'quit', y: 350 }
        ];
        
        buttonData.forEach(data => {
            // Create button container
            const button = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2 + data.y);
            
            // Create button background
            const buttonBg = this.add.image(0, 0, 'button')
                .setDisplaySize(200, 60)
                .setInteractive({ useHandCursor: true });
                
            // Create button text
            const buttonText = this.add.text(0, 0, data.text, {...buttonStyle, font: '20px Arial'})
                .setOrigin(0.5);
                
            // Add components to container
            button.add([buttonBg, buttonText]);
            
            // Add button to array for easy access
            this.menuButtons.push({ container: button, bg: buttonBg, text: buttonText });
            
            // Add button events
            buttonBg.on('pointerdown', () => {
                // Play sound if available
                if (this.cache.audio.exists('button-click')) {
                    this.sound.play('button-click');
                }
                
                // Scale down button when clicked
                this.tweens.add({
                    targets: button,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 100,
                    yoyo: true,
                    onComplete: () => {
                        if (data.action === 'quit') {
                            // Handle quit action (in browser this would just show a message)
                            if (window.confirm('Are you sure you want to quit?')) {
                                window.close();
                            }
                        } else if (data.scene) {
                            // Transition to the selected scene
                            this.cameras.main.fade(500, 0, 0, 0);
                            this.time.delayedCall(500, () => {
                                this.scene.start(data.scene);
                            });
                        }
                    }
                });
            });
            
            // Add hover effects
            this.addButtonHoverEffects(buttonBg, button);
        });
    }

    addButtonHoverEffects(buttonBg, container) {
        buttonBg.on('pointerover', () => {
            // Scale up button on hover
            this.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
            
            // Add glow effect
            const glow = this.add.graphics();
            glow.fillStyle(0xffffff, 0.3);
            glow.fillRoundedRect(-125, -40, 250, 80, 10);
            container.add(glow);
            container.sendToBack(glow);
            
            // Store glow reference for removal
            container.glow = glow;
        });
        
        buttonBg.on('pointerout', () => {
            // Scale back to normal on hover out
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
            
            // Remove glow effect
            if (container.glow) {
                container.remove(container.glow);
                container.glow.destroy();
                container.glow = null;
            }
        });
    }

    update() {
        // Add any continuous updates here
        // For example, you could rotate the decorative cards slowly
    }
}

export default MainMenuScene; 