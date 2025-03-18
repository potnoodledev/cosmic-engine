import Phaser from 'phaser';
import Card from '../objects/Card';
import Player from '../objects/Player';
import AIPlayer from '../objects/AIPlayer';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        
        // Game state
        this.playerTurn = true;
        this.turnNumber = 1;
        this.gameOver = false;
    }

    create() {
        // Add game board
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'board')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Play game music if available
        try {
            this.sound.stopAll();
            if (this.cache.audio.exists('game-music')) {
                this.sound.add('game-music', { loop: true, volume: 0.3 }).play();
            }
        } catch (error) {
            console.warn('Game music not available:', error);
        }
        
        // Initialize players
        this.initializePlayers();
        
        // Create game board zones
        this.createBoardZones();
        
        // Create UI elements
        this.createUI();
        
        // Start the first turn
        this.startTurn();
        
        // Set up input handlers
        this.setupInputHandlers();
    }

    initializePlayers() {
        // Load card data
        const cardData = this.cache.json.get('card-data');
        
        // Create human player
        this.player = new Player(this, 'Player', cardData.cards);
        
        // Create AI player
        this.aiPlayer = new AIPlayer(this, 'AI', cardData.cards);
        
        // Initial draw
        this.player.drawInitialHand();
        this.aiPlayer.drawInitialHand();
    }

    createBoardZones() {
        // Player's hand zone
        this.playerHandZone = this.add.zone(this.cameras.main.width / 2, this.cameras.main.height - 100, 800, 150)
            .setRectangleDropZone(800, 150)
            .setName('playerHandZone');
            
        // Player's board zone
        this.playerBoardZone = this.add.zone(this.cameras.main.width / 2, this.cameras.main.height / 2 + 100, 800, 150)
            .setRectangleDropZone(800, 150)
            .setName('playerBoardZone');
            
        // AI's board zone
        this.aiBoardZone = this.add.zone(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 800, 150)
            .setRectangleDropZone(800, 150)
            .setName('aiBoardZone');
            
        // AI's hand zone (not visible to player)
        this.aiHandZone = this.add.zone(this.cameras.main.width / 2, 100, 800, 150)
            .setName('aiHandZone');
            
        // Visualize zones (for development)
        this.visualizeZones();
    }

    visualizeZones() {
        // Helper function to visualize drop zones
        const visualizeZone = (zone, color) => {
            const graphics = this.add.graphics();
            graphics.lineStyle(2, color, 1);
            graphics.strokeRect(
                zone.x - zone.width / 2, 
                zone.y - zone.height / 2, 
                zone.width, 
                zone.height
            );
            return graphics;
        };
        
        // Visualize each zone with a different color
        this.playerHandZoneGraphics = visualizeZone(this.playerHandZone, 0x00ff00);
        this.playerBoardZoneGraphics = visualizeZone(this.playerBoardZone, 0x0000ff);
        this.aiBoardZoneGraphics = visualizeZone(this.aiBoardZone, 0xff0000);
        
        // Make zone graphics semi-transparent
        this.playerHandZoneGraphics.alpha = 0.3;
        this.playerBoardZoneGraphics.alpha = 0.3;
        this.aiBoardZoneGraphics.alpha = 0.3;
    }

    createUI() {
        // Create text style
        const textStyle = {
            font: '24px Arial',
            fill: '#ffffff'
        };
        
        // Turn indicator
        this.turnText = this.add.text(20, 20, 'Turn: 1 (Player)', textStyle);
        
        // End turn button
        this.endTurnButton = this.add.image(this.cameras.main.width - 100, this.cameras.main.height - 50, 'button')
            .setDisplaySize(180, 60)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // Play sound if available
                if (this.cache.audio.exists('button-click')) {
                    this.sound.play('button-click');
                }
                this.endTurn();
            });
            
        this.add.text(this.endTurnButton.x, this.endTurnButton.y, 'End Turn', textStyle)
            .setOrigin(0.5);
            
        // Add hover effect to end turn button
        this.endTurnButton.on('pointerover', () => {
            this.endTurnButton.setScale(1.1);
        });
        
        this.endTurnButton.on('pointerout', () => {
            this.endTurnButton.setScale(1);
        });
        
        // Player stats
        this.playerHealthText = this.add.text(20, this.cameras.main.height - 60, 'Health: 30', textStyle);
        this.playerManaText = this.add.text(20, this.cameras.main.height - 30, 'Mana: 1/1', textStyle);
        
        // AI stats
        this.aiHealthText = this.add.text(20, 60, 'AI Health: 30', textStyle);
        this.aiManaText = this.add.text(20, 90, 'AI Mana: 1/1', textStyle);
        
        // Deck counters
        this.playerDeckText = this.add.text(this.cameras.main.width - 150, this.cameras.main.height - 90, 'Deck: 20', textStyle);
        this.aiDeckText = this.add.text(this.cameras.main.width - 150, 90, 'AI Deck: 20', textStyle);
        
        // Back to menu button
        this.menuButton = this.add.image(100, this.cameras.main.height - 90, 'button')
            .setDisplaySize(160, 50)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // Play sound if available
                if (this.cache.audio.exists('button-click')) {
                    this.sound.play('button-click');
                }
                this.scene.start('MainMenuScene');
            });
            
        this.add.text(this.menuButton.x, this.menuButton.y, 'Menu', textStyle)
            .setOrigin(0.5);
    }

    startTurn() {
        if (this.gameOver) return;
        
        // Update turn indicator
        this.turnText.setText(`Turn: ${this.turnNumber} (${this.playerTurn ? 'Player' : 'AI'})`);
        
        if (this.playerTurn) {
            // Player's turn
            this.player.startTurn(this.turnNumber);
            
            // Update UI
            this.updateUI();
            
            // Enable player interactions
            this.enablePlayerInteractions();
        } else {
            // AI's turn
            this.aiPlayer.startTurn(this.turnNumber);
            
            // Update UI
            this.updateUI();
            
            // Disable player interactions during AI turn
            this.disablePlayerInteractions();
            
            // AI takes its turn
            this.time.delayedCall(1000, () => {
                this.aiPlayer.takeTurn();
                
                // End AI turn after a delay
                this.time.delayedCall(2000, () => {
                    this.endTurn();
                });
            });
        }
    }

    endTurn() {
        if (this.gameOver) return;
        
        // End current player's turn
        if (this.playerTurn) {
            this.player.endTurn();
        } else {
            this.aiPlayer.endTurn();
            this.turnNumber++;
        }
        
        // Switch turns
        this.playerTurn = !this.playerTurn;
        
        // Start next turn
        this.startTurn();
    }

    updateUI() {
        // Update player stats
        this.playerHealthText.setText(`Health: ${this.player.health}`);
        this.playerManaText.setText(`Mana: ${this.player.mana}/${this.player.maxMana}`);
        this.playerDeckText.setText(`Deck: ${this.player.deck.length}`);
        
        // Update AI stats
        this.aiHealthText.setText(`AI Health: ${this.aiPlayer.health}`);
        this.aiManaText.setText(`AI Mana: ${this.aiPlayer.mana}/${this.aiPlayer.maxMana}`);
        this.aiDeckText.setText(`AI Deck: ${this.aiPlayer.deck.length}`);
    }

    enablePlayerInteractions() {
        // Enable end turn button
        this.endTurnButton.setAlpha(1).setInteractive();
        
        // Enable card interactions
        this.player.hand.forEach(card => {
            if (card.cost <= this.player.mana) {
                card.setInteractive();
            }
        });
        
        // Enable minion interactions for attacking
        this.player.board.forEach(card => {
            if (!card.hasAttacked) {
                card.setInteractive();
            }
        });
    }

    disablePlayerInteractions() {
        // Disable end turn button
        this.endTurnButton.setAlpha(0.5).disableInteractive();
        
        // Disable all card interactions
        this.player.hand.forEach(card => {
            card.disableInteractive();
        });
        
        this.player.board.forEach(card => {
            card.disableInteractive();
        });
    }

    setupInputHandlers() {
        // Set up drag and drop for cards
        this.input.on('dragstart', (pointer, gameObject) => {
            gameObject.setTint(0x00ff00);
            this.children.bringToTop(gameObject);
        });
        
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
        
        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.clearTint();
        });
        
        this.input.on('drop', (pointer, gameObject, dropZone) => {
            if (gameObject instanceof Card) {
                if (dropZone === this.playerBoardZone && gameObject.location === 'hand') {
                    // Play card from hand to board
                    this.player.playCard(gameObject, 'board');
                    this.updateUI();
                    this.enablePlayerInteractions();
                }
            }
        });
        
        // Card click handler for attacks
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (gameObject instanceof Card && this.playerTurn) {
                if (gameObject.location === 'board' && gameObject.owner === this.player && !gameObject.hasAttacked) {
                    // Select card for attack
                    this.selectCardForAttack(gameObject);
                } else if (this.selectedAttacker && 
                          ((gameObject.location === 'board' && gameObject.owner === this.aiPlayer) || 
                           gameObject === this.aiPlayer)) {
                    // Attack the selected target
                    this.attackTarget(gameObject);
                }
            }
        });
    }

    selectCardForAttack(card) {
        // Deselect previous attacker if any
        if (this.selectedAttacker) {
            this.selectedAttacker.clearTint();
        }
        
        // Select new attacker
        this.selectedAttacker = card;
        card.setTint(0xff0000);
    }

    attackTarget(target) {
        if (!this.selectedAttacker) return;
        
        // Perform attack
        if (target instanceof Card) {
            // Attack enemy minion
            this.player.attackCard(this.selectedAttacker, target);
        } else {
            // Attack enemy hero
            this.player.attackHero(this.selectedAttacker, this.aiPlayer);
        }
        
        // Clear attacker selection
        this.selectedAttacker.clearTint();
        this.selectedAttacker = null;
        
        // Update UI
        this.updateUI();
        
        // Check for game over
        this.checkGameOver();
        
        // Update interactivity
        this.enablePlayerInteractions();
    }

    checkGameOver() {
        if (this.player.health <= 0) {
            this.gameOver = true;
            this.showGameOverScreen('AI Wins!');
        } else if (this.aiPlayer.health <= 0) {
            this.gameOver = true;
            this.showGameOverScreen('Player Wins!');
        }
    }

    showGameOverScreen(message) {
        // Disable all interactions
        this.disablePlayerInteractions();
        
        // Create semi-transparent overlay
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );
        
        // Game over text
        const gameOverText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            message,
            { font: '48px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        // Return to menu button
        const returnButton = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 50,
            'button'
        )
            .setDisplaySize(250, 80)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.sound.play('button-click');
                this.scene.start('MainMenuScene');
            });
            
        this.add.text(
            returnButton.x,
            returnButton.y,
            'Return to Menu',
            { font: '24px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
    }

    update() {
        // Update card positions
        this.updateCardPositions();
    }

    updateCardPositions() {
        // Arrange player's hand
        this.arrangeCards(this.player.hand, this.playerHandZone);
        
        // Arrange player's board
        this.arrangeCards(this.player.board, this.playerBoardZone);
        
        // Arrange AI's board
        this.arrangeCards(this.aiPlayer.board, this.aiBoardZone);
        
        // Arrange AI's hand (face down)
        this.arrangeCards(this.aiPlayer.hand, this.aiHandZone, true);
    }

    arrangeCards(cards, zone, faceDown = false) {
        if (cards.length === 0) return;
        
        const cardWidth = 120;
        const padding = 10;
        const totalWidth = cards.length * (cardWidth + padding) - padding;
        const startX = zone.x - totalWidth / 2 + cardWidth / 2;
        
        cards.forEach((card, index) => {
            const targetX = startX + index * (cardWidth + padding);
            const targetY = zone.y;
            
            // Only animate if the card isn't being dragged
            if (!card.input || !card.input.isDragging) {
                // Use tweens for smooth animation
                this.tweens.add({
                    targets: card,
                    x: targetX,
                    y: targetY,
                    duration: 200,
                    ease: 'Power2'
                });
                
                // Set card face up or down
                card.setFaceDown(faceDown);
            }
        });
    }
}

export default GameScene; 