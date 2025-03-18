import Card from './Card';

class Player {
    constructor(scene, name, cardPool) {
        this.scene = scene;
        this.name = name;
        this.cardPool = cardPool;
        
        // Player stats
        this.health = 30;
        this.maxHealth = 30;
        this.mana = 0;
        this.maxMana = 0;
        
        // Card collections
        this.deck = [];
        this.hand = [];
        this.board = [];
        this.graveyard = [];
        
        // Initialize deck
        this.initializeDeck();
    }

    initializeDeck() {
        // Create a deck of 20 cards from the card pool
        const shuffledPool = [...this.cardPool].sort(() => Math.random() - 0.5);
        
        // Take the first 20 cards (or fewer if the pool is smaller)
        const deckSize = Math.min(20, shuffledPool.length);
        
        for (let i = 0; i < deckSize; i++) {
            const cardData = shuffledPool[i];
            const card = new Card(this.scene, 0, 0, cardData);
            card.setOwner(this);
            card.setLocation('deck');
            this.deck.push(card);
        }
        
        // Shuffle the deck
        this.shuffleDeck();
    }

    shuffleDeck() {
        this.deck = this.deck.sort(() => Math.random() - 0.5);
    }

    drawCard() {
        if (this.deck.length === 0) {
            // Fatigue damage if deck is empty
            this.takeDamage(1);
            return null;
        }
        
        // Draw the top card
        const card = this.deck.pop();
        
        // Add to hand
        this.hand.push(card);
        card.setLocation('hand');
        
        // Play sound effect if available
        if (this.scene.cache.audio.exists('card-draw')) {
            this.scene.sound.play('card-draw');
        }
        
        return card;
    }

    drawInitialHand() {
        // Draw 3 cards for initial hand
        for (let i = 0; i < 3; i++) {
            this.drawCard();
        }
    }

    startTurn(turnNumber) {
        // Increment max mana up to 10
        if (this.maxMana < 10) {
            this.maxMana++;
        }
        
        // Refill mana
        this.mana = this.maxMana;
        
        // Draw a card
        this.drawCard();
        
        // Reset all minions (can attack again)
        this.board.forEach(card => {
            card.resetForTurn();
        });
    }

    endTurn() {
        // Any end of turn effects would go here
    }

    playCard(card, targetLocation) {
        // Check if card can be played
        if (!card.canBePlayed(this)) {
            return false;
        }
        
        // Pay the mana cost
        this.mana -= card.cost;
        
        // Remove from hand
        const cardIndex = this.hand.indexOf(card);
        if (cardIndex !== -1) {
            this.hand.splice(cardIndex, 1);
        }
        
        // Add to target location (usually the board)
        if (targetLocation === 'board') {
            // Check if board is full (max 7 cards)
            if (this.board.length >= 7) {
                // If board is full, send to graveyard instead
                this.graveyard.push(card);
                card.setLocation('graveyard');
                return false;
            }
            
            this.board.push(card);
            card.setLocation('board');
            
            // Play sound effect if available
            if (this.scene.cache.audio.exists('card-place')) {
                this.scene.sound.play('card-place');
            }
            
            // Play card animation
            card.playCardAnimation();
        }
        
        return true;
    }

    attackCard(attackingCard, targetCard) {
        // Check if attack is valid
        if (!attackingCard.canAttack()) {
            return false;
        }
        
        // Play attack animation
        attackingCard.playAttackAnimation(targetCard);
        
        // Deal damage to target
        targetCard.updateHealth(targetCard.health - attackingCard.attack);
        
        // Deal damage to attacker
        attackingCard.updateHealth(attackingCard.health - targetCard.attack);
        
        // Play sound effect if available
        if (this.scene.cache.audio.exists('card-attack')) {
            this.scene.sound.play('card-attack');
        }
        
        // Mark attacker as having attacked
        attackingCard.hasAttacked = true;
        
        // Check if cards died
        this.checkForDeadCards();
        targetCard.owner.checkForDeadCards();
        
        return true;
    }

    attackHero(attackingCard, targetPlayer) {
        // Check if attack is valid
        if (!attackingCard.canAttack()) {
            return false;
        }
        
        // Play attack animation
        attackingCard.playAttackAnimation(targetPlayer);
        
        // Deal damage to target player
        targetPlayer.takeDamage(attackingCard.attack);
        
        // Play sound effect if available
        if (this.scene.cache.audio.exists('card-attack')) {
            this.scene.sound.play('card-attack');
        }
        
        // Mark attacker as having attacked
        attackingCard.hasAttacked = true;
        
        return true;
    }

    takeDamage(amount) {
        this.health -= amount;
        
        // Ensure health doesn't go below 0
        if (this.health < 0) {
            this.health = 0;
        }
    }

    checkForDeadCards() {
        // Find cards with 0 or less health
        const deadCards = this.board.filter(card => card.health <= 0);
        
        // Remove dead cards from board and add to graveyard
        deadCards.forEach(card => {
            const cardIndex = this.board.indexOf(card);
            if (cardIndex !== -1) {
                this.board.splice(cardIndex, 1);
                this.graveyard.push(card);
                card.setLocation('graveyard');
                
                // Play death animation
                card.playDeathAnimation();
            }
        });
    }
}

export default Player; 