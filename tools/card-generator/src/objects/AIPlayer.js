import Player from './Player';

class AIPlayer extends Player {
    constructor(scene, name, cardPool) {
        super(scene, name, cardPool);
    }

    takeTurn() {
        // AI decision making for its turn
        this.playCards();
        this.attackWithMinions();
    }

    playCards() {
        // Sort cards by cost (highest to lowest)
        const playableCards = this.hand
            .filter(card => card.cost <= this.mana)
            .sort((a, b) => b.cost - a.cost);
        
        // Play cards until we run out of mana or cards
        for (const card of playableCards) {
            // Check if we can play this card
            if (card.cost <= this.mana) {
                // Play the card
                this.playCard(card, 'board');
                
                // Add a small delay for visual effect
                this.scene.time.delayedCall(300, () => {
                    // Continue with next card
                });
            }
        }
    }

    attackWithMinions() {
        // Get all minions that can attack
        const attackers = this.board.filter(card => !card.hasAttacked);
        
        // Get enemy player
        const enemyPlayer = this.scene.player;
        
        // For each attacker, decide what to attack
        attackers.forEach(attacker => {
            // Get enemy minions
            const enemyMinions = enemyPlayer.board;
            
            // If there are enemy minions, attack them
            if (enemyMinions.length > 0) {
                // Find the best target (lowest health that this minion can kill)
                const targets = enemyMinions
                    .filter(target => target.health <= attacker.attack)
                    .sort((a, b) => a.health - b.health);
                
                if (targets.length > 0) {
                    // Attack the best target
                    this.attackCard(attacker, targets[0]);
                } else {
                    // If we can't kill any minion, attack the one with highest attack
                    const highestAttackTarget = [...enemyMinions].sort((a, b) => b.attack - a.attack)[0];
                    this.attackCard(attacker, highestAttackTarget);
                }
            } else {
                // If no enemy minions, attack the enemy hero
                this.attackHero(attacker, enemyPlayer);
            }
            
            // Add a small delay between attacks
            this.scene.time.delayedCall(500, () => {
                // Continue with next attacker
            });
        });
    }

    // Override the attackCard method to add AI-specific behavior
    attackCard(attackingCard, targetCard) {
        // Add a delay for visual effect
        this.scene.time.delayedCall(300, () => {
            // Call the parent method
            super.attackCard(attackingCard, targetCard);
        });
    }

    // Override the attackHero method to add AI-specific behavior
    attackHero(attackingCard, targetPlayer) {
        // Add a delay for visual effect
        this.scene.time.delayedCall(300, () => {
            // Call the parent method
            super.attackHero(attackingCard, targetPlayer);
        });
    }
}

export default AIPlayer; 