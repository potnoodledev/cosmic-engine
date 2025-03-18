import Phaser from 'phaser';
import CardGenerator from '../services/CardGenerator';
import Card from '../objects/Card';

class CardGeneratorScene extends Phaser.Scene {
    constructor() {
        super('CardGeneratorScene');
        this.cardGenerator = new CardGenerator();
        this.generatedCard = null;
    }

    create() {
        // Add background
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Add title
        this.add.text(this.cameras.main.width / 2, 50, 'AI Card Generator', {
            font: '36px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Create UI elements
        this.createUI();
        
        // Create card preview area
        this.createCardPreviewArea();
        
        // Create back button
        this.createBackButton();
    }

    createUI() {
        // Create form container
        const formContainer = this.add.container(this.cameras.main.width / 2 - 300, 150);
        
        // Add form background
        const formBg = this.add.rectangle(0, 0, 500, 400, 0x2c3e50, 0.8)
            .setOrigin(0);
        formContainer.add(formBg);
        
        // Add form title
        const formTitle = this.add.text(250, 30, 'Generate a New Card', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5, 0);
        formContainer.add(formTitle);
        
        // Add form description
        const formDesc = this.add.text(250, 70, 'Enter a description for your card and the AI will generate it.', {
            font: '16px Arial',
            fill: '#ffffff',
            wordWrap: { width: 450 }
        }).setOrigin(0.5, 0);
        formContainer.add(formDesc);
        
        // Create HTML form elements
        this.createHTMLForm(formContainer);
    }

    createHTMLForm(container) {
        // Create DOM element for the form
        const formElement = document.createElement('div');
        formElement.className = 'card-generator-form';
        formElement.innerHTML = `
            <label for="card-name">Card Name (optional):</label>
            <input type="text" id="card-name" placeholder="Leave blank for AI to generate">
            
            <label for="card-type">Card Type:</label>
            <select id="card-type">
                <option value="minion">Minion</option>
                <option value="spell">Spell</option>
            </select>
            
            <label for="card-description">Card Description:</label>
            <textarea id="card-description" rows="4" placeholder="Describe your card (e.g. 'A powerful dragon that breathes fire')"></textarea>
            
            <button id="generate-button" type="button">Generate Card</button>
        `;
        
        // Add the form to the DOM
        const formDOM = this.add.dom(250, 250, formElement);
        container.add(formDOM);
        
        // Add event listener to the generate button
        formDOM.addListener('click');
        formDOM.on('click', (event) => {
            if (event.target.id === 'generate-button') {
                this.handleGenerateButtonClick(formDOM);
            }
        });
    }

    handleGenerateButtonClick(formDOM) {
        // Get form values
        const nameInput = formDOM.getChildByID('card-name');
        const typeSelect = formDOM.getChildByID('card-type');
        const descriptionTextarea = formDOM.getChildByID('card-description');
        
        const name = nameInput.value;
        const type = typeSelect.value;
        const description = descriptionTextarea.value;
        
        // Validate input
        if (!description) {
            this.showError('Please enter a card description');
            return;
        }
        
        // Show loading indicator
        this.showLoadingIndicator();
        
        // Generate card
        this.cardGenerator.generateCard(name, type, description)
            .then(cardData => {
                // Hide loading indicator
                this.hideLoadingIndicator();
                
                // Create and display the generated card
                this.displayGeneratedCard(cardData);
                
                // Show save button
                this.showSaveButton(cardData);
            })
            .catch(error => {
                // Hide loading indicator
                this.hideLoadingIndicator();
                
                // Show error message
                this.showError('Failed to generate card: ' + error.message);
            });
    }

    showLoadingIndicator() {
        // Create loading overlay
        this.loadingOverlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );
        
        // Create loading text
        this.loadingText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Generating card...',
            { font: '24px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        // Create spinner animation
        this.loadingSpinner = this.add.graphics();
        this.loadingSpinnerAngle = 0;
        
        // Animate spinner
        this.loadingTimer = this.time.addEvent({
            delay: 50,
            callback: () => {
                this.loadingSpinnerAngle += 0.1;
                this.loadingSpinner.clear();
                this.loadingSpinner.lineStyle(4, 0xffffff, 1);
                this.loadingSpinner.arc(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2 + 50,
                    30,
                    this.loadingSpinnerAngle,
                    this.loadingSpinnerAngle + 5
                );
            },
            callbackScope: this,
            loop: true
        });
    }

    hideLoadingIndicator() {
        if (this.loadingTimer) {
            this.loadingTimer.remove();
        }
        
        if (this.loadingOverlay) {
            this.loadingOverlay.destroy();
        }
        
        if (this.loadingText) {
            this.loadingText.destroy();
        }
        
        if (this.loadingSpinner) {
            this.loadingSpinner.destroy();
        }
    }

    showError(message) {
        // Create error message
        const errorText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            message,
            { font: '18px Arial', fill: '#ff0000' }
        ).setOrigin(0.5);
        
        // Remove after a few seconds
        this.time.delayedCall(3000, () => {
            errorText.destroy();
        });
    }

    createCardPreviewArea() {
        // Create preview container
        this.previewContainer = this.add.container(this.cameras.main.width / 2 + 250, 150);
        
        // Add preview background
        const previewBg = this.add.rectangle(0, 0, 300, 400, 0x34495e, 0.8)
            .setOrigin(0);
        this.previewContainer.add(previewBg);
        
        // Add preview title
        const previewTitle = this.add.text(150, 30, 'Card Preview', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5, 0);
        this.previewContainer.add(previewTitle);
        
        // Add placeholder text
        this.previewPlaceholder = this.add.text(150, 200, 'Generate a card to see preview', {
            font: '16px Arial',
            fill: '#ffffff',
            wordWrap: { width: 250 }
        }).setOrigin(0.5);
        this.previewContainer.add(this.previewPlaceholder);
    }

    displayGeneratedCard(cardData) {
        // Remove placeholder text
        if (this.previewPlaceholder) {
            this.previewPlaceholder.destroy();
            this.previewPlaceholder = null;
        }
        
        // Remove previous card if exists
        if (this.generatedCard) {
            this.generatedCard.destroy();
        }
        
        // Create new card instance
        this.generatedCard = new Card(
            this,
            this.previewContainer.x + 150,
            this.previewContainer.y + 200,
            cardData
        );
        
        // Add to scene
        this.add.existing(this.generatedCard);
    }

    showSaveButton(cardData) {
        // Remove previous save button if exists
        if (this.saveButton) {
            this.saveButton.destroy();
            this.saveButtonText.destroy();
        }
        
        // Create save button
        this.saveButton = this.add.image(
            this.previewContainer.x + 150,
            this.previewContainer.y + 350,
            'button'
        )
            .setDisplaySize(200, 60)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.saveGeneratedCard(cardData);
            });
            
        this.saveButtonText = this.add.text(
            this.saveButton.x,
            this.saveButton.y,
            'Save Card',
            { font: '18px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        // Add hover effect
        this.saveButton.on('pointerover', () => {
            this.saveButton.setScale(1.1);
        });
        
        this.saveButton.on('pointerout', () => {
            this.saveButton.setScale(1);
        });
    }

    saveGeneratedCard(cardData) {
        // Get existing card data
        let existingData;
        try {
            existingData = JSON.parse(localStorage.getItem('custom-cards')) || [];
        } catch (e) {
            existingData = [];
        }
        
        // Add new card
        existingData.push(cardData);
        
        // Save to local storage
        localStorage.setItem('custom-cards', JSON.stringify(existingData));
        
        // Show success message
        this.showSuccessMessage('Card saved successfully!');
    }

    showSuccessMessage(message) {
        // Create success message
        const successText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            message,
            { font: '18px Arial', fill: '#00ff00' }
        ).setOrigin(0.5);
        
        // Remove after a few seconds
        this.time.delayedCall(3000, () => {
            successText.destroy();
        });
    }

    createBackButton() {
        // Create back button
        const backButton = this.add.image(100, 50, 'button')
            .setDisplaySize(160, 50)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // Play sound if available
                if (this.cache.audio.exists('button-click')) {
                    this.sound.play('button-click');
                }
                this.scene.start('MainMenuScene');
            });
            
        this.add.text(backButton.x, backButton.y, 'Back to Menu', {
            font: '18px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Add hover effect
        backButton.on('pointerover', () => {
            backButton.setScale(1.1);
        });
        
        backButton.on('pointerout', () => {
            backButton.setScale(1);
        });
    }
}

export default CardGeneratorScene; 