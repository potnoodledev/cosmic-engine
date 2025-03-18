import { OpenAI } from 'openai';
import { services } from '../database';

class CardGenerator {
    constructor() {
        // Initialize OpenAI client
        // Note: In a real app, you would get this from environment variables
        this.openai = null;
        
        // Card generation parameters
        this.minCost = 1;
        this.maxCost = 10;
        this.minAttack = 0;
        this.maxAttack = 12;
        this.minHealth = 1;
        this.maxHealth = 12;
    }

    async initializeOpenAI(apiKey) {
        if (!this.openai && apiKey) {
            this.openai = new OpenAI({
                apiKey: apiKey,
                dangerouslyAllowBrowser: true // For client-side usage
            });
        }
    }

    async generateCard(name, type, description) {
        try {
            // If no OpenAI client, use mock generation
            if (!this.openai) {
                return this.mockGenerateCard(name, type, description);
            }
            
            // Prepare the prompt for the AI
            const prompt = this.createCardPrompt(name, type, description);
            
            // Call the OpenAI API
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a creative card game designer. Create balanced and interesting cards for a Hearthstone-like game.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            });
            
            // Parse the response
            const cardData = this.parseAIResponse(response.choices[0].message.content, name, type, description);
            
            // Save the card to MongoDB
            await this.saveCardToDatabase(cardData);
            
            return cardData;
        } catch (error) {
            console.error('Error generating card:', error);
            // Fallback to mock generation
            return this.mockGenerateCard(name, type, description);
        }
    }

    createCardPrompt(name, type, description) {
        // Create a prompt for the AI to generate a card
        let prompt = 'Create a balanced card for a Hearthstone-like game with the following details:\n\n';
        
        if (name) {
            prompt += `Name: ${name}\n`;
        }
        
        if (type) {
            prompt += `Type: ${type}\n`;
        }
        
        if (description) {
            prompt += `Description: ${description}\n`;
        }
        
        prompt += '\nPlease provide the following information in your response:\n';
        prompt += '- Name (if not provided)\n';
        prompt += '- Type (minion or spell, if not provided)\n';
        prompt += '- Cost (mana cost, 1-10)\n';
        
        if (type === 'minion' || !type) {
            prompt += '- Attack (for minions, 0-12)\n';
            prompt += '- Health (for minions, 1-12)\n';
        }
        
        prompt += '- Description (card text/effect)\n';
        prompt += '- Flavor text (a short, flavorful description)\n';
        
        return prompt;
    }

    parseAIResponse(response, providedName, providedType, providedDescription) {
        // Default values
        const cardData = {
            name: providedName || '',
            type: providedType || 'minion',
            cost: 0,
            description: providedDescription || '',
            flavor: ''
        };
        
        // Parse the response line by line
        const lines = response.split('\n');
        for (const line of lines) {
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                const key = line.substring(0, colonIndex).trim().toLowerCase();
                const value = line.substring(colonIndex + 1).trim();
                
                if (key === 'name' && !providedName) {
                    cardData.name = value;
                } else if (key === 'type' && !providedType) {
                    cardData.type = value.toLowerCase() === 'spell' ? 'spell' : 'minion';
                } else if (key === 'cost') {
                    cardData.cost = this.parseNumber(value, this.minCost, this.maxCost);
                } else if (key === 'attack' && cardData.type === 'minion') {
                    cardData.attack = this.parseNumber(value, this.minAttack, this.maxAttack);
                } else if (key === 'health' && cardData.type === 'minion') {
                    cardData.health = this.parseNumber(value, this.minHealth, this.maxHealth);
                } else if (key === 'description' && !providedDescription) {
                    cardData.description = value;
                } else if (key === 'flavor' || key === 'flavor text') {
                    cardData.flavor = value;
                }
            }
        }
        
        // Ensure minions have attack and health
        if (cardData.type === 'minion') {
            if (!cardData.attack && cardData.attack !== 0) {
                cardData.attack = this.randomInt(this.minAttack, this.maxAttack);
            }
            if (!cardData.health) {
                cardData.health = this.randomInt(this.minHealth, this.maxHealth);
            }
        }
        
        // Ensure cost is set
        if (!cardData.cost) {
            cardData.cost = this.randomInt(this.minCost, this.maxCost);
        }
        
        // Ensure flavor text is set
        if (!cardData.flavor) {
            cardData.flavor = 'Created by the AI card generator.';
        }
        
        return cardData;
    }

    parseNumber(value, min, max) {
        // Extract the first number from the string
        const match = value.match(/\d+/);
        if (match) {
            return this.clamp(parseInt(match[0], 10), min, max);
        }
        return null;
    }

    async saveCardToDatabase(cardData) {
        try {
            // Check if the card already exists
            const existingCard = await services.cardService.getCardByName(cardData.name);
            
            if (existingCard) {
                // Update existing card
                await services.cardService.updateCard(existingCard._id, cardData);
                console.log(`Card "${cardData.name}" updated in database`);
                return existingCard._id;
            } else {
                // Create new card
                const newCard = await services.cardService.createCard(cardData);
                console.log(`Card "${cardData.name}" saved to database`);
                return newCard._id;
            }
        } catch (error) {
            console.error('Error saving card to database:', error);
            // Continue without saving to database
            return null;
        }
    }

    mockGenerateCard(name, type, description) {
        // Generate a mock card when OpenAI is not available
        const cardData = {
            name: name || this.generateRandomName(),
            type: type || 'minion',
            cost: this.randomInt(this.minCost, this.maxCost),
            description: description || 'A mysterious card with unknown powers.',
            flavor: 'Created by the local card generator.'
        };
        
        // Add attack and health for minions
        if (cardData.type === 'minion') {
            cardData.attack = this.randomInt(this.minAttack, this.maxAttack);
            cardData.health = this.randomInt(this.minHealth, this.maxHealth);
        }
        
        // Save the mock card to database
        this.saveCardToDatabase(cardData);
        
        return cardData;
    }

    generateRandomName() {
        const prefixes = ['Ancient', 'Mystic', 'Fiery', 'Frozen', 'Arcane', 'Divine', 'Shadow', 'Emerald', 'Golden', 'Cursed'];
        const nouns = ['Dragon', 'Warrior', 'Mage', 'Priest', 'Knight', 'Elemental', 'Beast', 'Spirit', 'Guardian', 'Titan'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        
        return `${prefix} ${noun}`;
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}

export default CardGenerator; 