import Phaser from 'phaser';

class Card extends Phaser.GameObjects.Container {
    constructor(scene, x, y, cardData) {
        super(scene, x, y);
        
        // Store card data
        this.cardData = cardData;
        this.name = cardData.name;
        this.description = cardData.description;
        this.type = cardData.type || 'minion';
        this.cost = cardData.cost || 0;
        this.attack = cardData.attack || 0;
        this.health = cardData.health || 0;
        this.image = cardData.image;
        
        // Card state
        this.owner = null;
        this.location = 'deck'; // deck, hand, board, graveyard
        this.hasAttacked = false;
        this.isFaceDown = false;
        
        // Create card visuals
        this.createCardVisuals();
        
        // Make card interactive
        this.setSize(140, 200);
        this.setInteractive({ draggable: true });
    }

    createCardVisuals() {
        // Card background
        this.cardBackground = this.scene.add.image(0, 0, 'card-template');
        this.cardBackground.setDisplaySize(140, 200);
        this.add(this.cardBackground);
        
        // Card back (for face-down cards)
        this.cardBack = this.scene.add.image(0, 0, 'card-back');
        this.cardBack.setDisplaySize(140, 200);
        this.cardBack.setVisible(false);
        this.add(this.cardBack);
        
        // Card image (if available)
        if (this.image) {
            this.cardImage = this.scene.add.image(0, -30, this.image);
            this.cardImage.setDisplaySize(120, 100);
            this.add(this.cardImage);
        } else {
            // Placeholder for card image
            this.cardImagePlaceholder = this.scene.add.rectangle(0, -30, 120, 100, 0x666666);
            this.add(this.cardImagePlaceholder);
        }
        
        // Card name
        this.nameText = this.scene.add.text(0, -80, this.name, {
            font: '14px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);
        this.add(this.nameText);
        
        // Card cost
        this.costBackground = this.scene.add.circle(-55, -80, 15, 0x0000ff);
        this.add(this.costBackground);
        
        this.costText = this.scene.add.text(-55, -80, this.cost.toString(), {
            font: '16px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.add(this.costText);
        
        // For minion cards, add attack and health
        if (this.type === 'minion') {
            // Attack
            this.attackBackground = this.scene.add.circle(-55, 80, 15, 0xff0000);
            this.add(this.attackBackground);
            
            this.attackText = this.scene.add.text(-55, 80, this.attack.toString(), {
                font: '16px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
            this.add(this.attackText);
            
            // Health
            this.healthBackground = this.scene.add.circle(55, 80, 15, 0x00ff00);
            this.add(this.healthBackground);
            
            this.healthText = this.scene.add.text(55, 80, this.health.toString(), {
                font: '16px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
            this.add(this.healthText);
        }
        
        // Card description
        this.descriptionText = this.scene.add.text(0, 40, this.description, {
            font: '10px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            wordWrap: { width: 120 }
        }).setOrigin(0.5);
        this.add(this.descriptionText);
    }

    setFaceDown(isFaceDown) {
        this.isFaceDown = isFaceDown;
        
        // Show/hide card back
        this.cardBack.setVisible(isFaceDown);
        
        // Show/hide card details
        this.nameText.setVisible(!isFaceDown);
        this.costBackground.setVisible(!isFaceDown);
        this.costText.setVisible(!isFaceDown);
        this.descriptionText.setVisible(!isFaceDown);
        
        if (this.cardImage) {
            this.cardImage.setVisible(!isFaceDown);
        } else if (this.cardImagePlaceholder) {
            this.cardImagePlaceholder.setVisible(!isFaceDown);
        }
        
        if (this.type === 'minion') {
            this.attackBackground.setVisible(!isFaceDown);
            this.attackText.setVisible(!isFaceDown);
            this.healthBackground.setVisible(!isFaceDown);
            this.healthText.setVisible(!isFaceDown);
        }
    }

    updateHealth(newHealth) {
        this.health = newHealth;
        
        if (this.type === 'minion' && this.healthText) {
            this.healthText.setText(this.health.toString());
            
            // Flash red if damaged
            this.scene.tweens.add({
                targets: this.healthBackground,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 3
            });
        }
    }

    updateAttack(newAttack) {
        this.attack = newAttack;
        
        if (this.type === 'minion' && this.attackText) {
            this.attackText.setText(this.attack.toString());
            
            // Flash yellow
            this.scene.tweens.add({
                targets: this.attackBackground,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 3
            });
        }
    }

    playAttackAnimation(target) {
        // Store original position
        const originalX = this.x;
        const originalY = this.y;
        
        // Move towards target
        this.scene.tweens.add({
            targets: this,
            x: target.x,
            y: target.y,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                // Return to original position
                this.x = originalX;
                this.y = originalY;
                
                // Play attack effect at target position
                const attackEffect = this.scene.add.sprite(target.x, target.y, 'attack-effect');
                attackEffect.play('attack-effect-anim');
                attackEffect.once('animationcomplete', () => {
                    attackEffect.destroy();
                });
            }
        });
    }

    playDeathAnimation() {
        // Fade out and rotate
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            angle: 90,
            duration: 500,
            onComplete: () => {
                this.destroy();
            }
        });
    }

    playCardAnimation() {
        // Scale up and down
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 200,
            yoyo: true
        });
    }

    setOwner(player) {
        this.owner = player;
    }

    setLocation(location) {
        this.location = location;
    }

    resetForTurn() {
        this.hasAttacked = false;
    }

    canAttack() {
        return this.type === 'minion' && this.location === 'board' && !this.hasAttacked;
    }

    canBePlayed(player) {
        return player.mana >= this.cost && this.location === 'hand';
    }
}

export default Card; 