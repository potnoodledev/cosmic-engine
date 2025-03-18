import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        
        // Game state
        this.gameState = {
            PULLING_DOUGH: 0,
            ROTATING_DOUGH: 1,
            CUTTING_NOODLES: 2,
            MOVING_TO_FINISH: 3
        };
        
        this.currentState = this.gameState.PULLING_DOUGH;
        this.rolledDoughCount = 0;
        this.rotationProgress = 0;
        this.maxRotationProgress = 100;
        this.rotationSpeed = 0.5;
        this.lastPointerAngle = 0;
        
        // Cutting noodles state variables
        this.cutsMade = 0;
        this.requiredCuts = 8;
        this.cutLines = [];
        this.cutSensitivity = 1.2;  // Higher = more responsive to vertical swipes
        
        // Gesture sensitivity settings
        this.pullSensitivity = 1.5;    // Higher = more responsive to downward gestures
        this.rotateSensitivity = 0.7;  // Higher = faster rotation progress
        this.moveSensitivity = 1.5;    // Higher = more responsive to rightward gestures
        
        // State names for debugging
        this.stateNames = [
            'PULLING_DOUGH',
            'ROTATING_DOUGH',
            'CUTTING_NOODLES',
            'MOVING_TO_FINISH'
        ];
        
        // Track screen dimensions for responsive layout
        this.lastWidth = 0;
        this.lastHeight = 0;
    }

    create() {
        console.log('GameScene started');
        this.createBackground();
        this.createDough();
        this.createProgressBar();
        this.createCounterDisplay();
        this.setupInput(); // Setup input first
        this.createDebugInfo(); // Create debug button after input setup
        this.createGestureIndicator();
        this.createCuttingGuide();
        
        // Add initial instruction text
        const width = this.cameras.main.width;
        this.instructionText = this.add.text(width / 2, this.doughCenterY + 150, 'Drag DOWN anywhere to pull dough!', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Add subtitle instruction
        this.subtitleText = this.add.text(width / 2, this.doughCenterY + 180, '(You can drag anywhere on screen)', {
            font: '18px Arial',
            fill: '#aaaaaa'
        }).setOrigin(0.5);
        
        // Ensure debug button is on top of everything
        if (this.debugButtonContainer) {
            this.debugButtonContainer.setDepth(1000);
        }
    }

    createBackground() {
        // Change background to black
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000)
            .setOrigin(0, 0);
    }

    createDough() {
        const centerX = this.cameras.main.width / 2;
        
        // Create dough sprite or fallback to a circle
        if (this.textures.exists('dough')) {
            console.log('Dough texture loaded successfully');
            this.dough = this.add.sprite(centerX, -50, 'dough');
            const frame = this.textures.getFrame('dough');
            console.log('Dough texture dimensions:', frame.width, 'x', frame.height);
        } else {
            console.error('Dough texture not found!');
            // Create a fallback circle if texture is missing - lighter color for dark background
            this.dough = this.add.circle(centerX, -50, 80, 0xfff0d0);
            this.dough.setStrokeStyle(4, 0xf5e6c8);
        }
        
        this.dough.setScale(1);
        
        // Initial position - half visible at top
        this.dough.y = -this.dough.displayHeight / 2 + 50;
        
        // Set initial dough state
        this.doughStartY = this.dough.y;
        this.doughCenterY = this.cameras.main.height / 3;
        this.doughEndX = this.cameras.main.width + this.dough.displayWidth / 2;
        
        console.log('Dough created at position:', this.dough.x, this.dough.y);
        console.log('Dough center Y position:', this.doughCenterY);
    }

    createProgressBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Calculate safe position for progress bar (higher up from bottom)
        // This ensures it's visible on iPhone 12 and other devices with notches/home indicators
        const safeBottomPadding = 80; // Increased padding from bottom
        const progressBarY = height - safeBottomPadding;
        
        // Progress bar container
        if (this.textures.exists('progressBarBg')) {
            this.progressBarContainer = this.add.sprite(width / 2, progressBarY, 'progressBarBg');
            this.progressBarContainer.setDisplaySize(300, 40);
            
            // Progress bar fill - starts with width 0
            this.progressBarFill = this.add.sprite(width / 2 - 150, progressBarY, 'progressBarFill');
            this.progressBarFill.setOrigin(0, 0.5);
            this.progressBarFill.setDisplaySize(0, 40);
        } else {
            console.error('Progress bar textures not found!');
            // Create fallback graphics with dark theme colors
            this.progressBarContainer = this.add.rectangle(width / 2, progressBarY, 300, 40, 0x333333);
            this.progressBarContainer.setStrokeStyle(2, 0x555555);
            
            this.progressBarFill = this.add.rectangle(width / 2 - 150, progressBarY, 0, 40, 0x00aaff);
            this.progressBarFill.setOrigin(0, 0.5);
            this.progressBarFill.setStrokeStyle(2, 0x0088cc);
        }
        
        // Progress text with improved readability
        this.progressText = this.add.text(width / 2, progressBarY, '0%', {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Add text shadow for better readability against any background
        this.progressText.setShadow(2, 2, '#000000', 3, true, true);
        
        // Make progress bar responsive to screen size
        this.scale.on('resize', this.resizeProgressBar, this);
    }
    
    resizeProgressBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const safeBottomPadding = 80;
        const progressBarY = height - safeBottomPadding;
        
        // Update positions
        this.progressBarContainer.setPosition(width / 2, progressBarY);
        this.progressBarFill.setPosition(width / 2 - 150, progressBarY);
        this.progressText.setPosition(width / 2, progressBarY);
        
        // Update progress bar width based on current progress
        const progressPercent = (this.rotationProgress / this.maxRotationProgress);
        const barWidth = progressPercent * 300;
        this.progressBarFill.setDisplaySize(barWidth, 40);
    }

    createCounterDisplay() {
        const width = this.cameras.main.width;
        
        // Counter background
        this.counterBg = this.add.graphics();
        this.counterBg.fillStyle(0x333333, 0.8);
        this.counterBg.fillRoundedRect(width - 150, 20, 130, 60, 10);
        this.counterBg.lineStyle(2, 0x555555, 1);
        this.counterBg.strokeRoundedRect(width - 150, 20, 130, 60, 10);
        
        // Counter text
        this.counterTitle = this.add.text(width - 85, 35, 'Noodles:', {
            font: '16px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.counterValue = this.add.text(width - 85, 60, this.rolledDoughCount.toString(), {
            font: '24px Arial',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
    }
    
    createDebugInfo() {
        // Debug panel background
        this.debugBg = this.add.graphics();
        this.debugBg.fillStyle(0x000000, 0.7);
        this.debugBg.fillRoundedRect(10, 10, 250, 120, 10);
        
        // Debug text
        this.debugTitle = this.add.text(20, 20, 'DEBUG INFO', {
            font: '16px Arial',
            fill: '#ffffff',
            fontWeight: 'bold'
        });
        
        this.stateText = this.add.text(20, 45, `State: ${this.stateNames[this.currentState]}`, {
            font: '14px Arial',
            fill: '#ffffff'
        });
        
        this.positionText = this.add.text(20, 70, `Dough Position: X:${Math.round(this.dough.x)}, Y:${Math.round(this.dough.y)}`, {
            font: '14px Arial',
            fill: '#ffffff'
        });
        
        this.progressDebugText = this.add.text(20, 95, `Progress: ${this.rotationProgress.toFixed(1)}/${this.maxRotationProgress}`, {
            font: '14px Arial',
            fill: '#ffffff'
        });
        
        // Create a container for all debug elements
        this.debugContainer = this.add.container(0, 0);
        this.debugContainer.add([this.debugBg, this.debugTitle, this.stateText, this.positionText, this.progressDebugText]);
        
        // Hide debug by default in production
        this.debugContainer.setVisible(false);
        
        // Create a simple debug button using a rectangle (more reliable for touch)
        const buttonX = 60;
        const buttonY = 60;
        
        // Create a background rectangle with high contrast
        this.debugButton = this.add.rectangle(buttonX, buttonY, 80, 80, 0x00aaff, 0.8);
        this.debugButton.setStrokeStyle(4, 0xffffff);
        
        // Make the rectangle interactive with a larger hit area
        this.debugButton.setInteractive({ useHandCursor: true });
        
        // Add text on top
        this.debugButtonText = this.add.text(buttonX, buttonY, 'DEBUG', {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Create a container for the debug button to ensure it's above other elements
        this.debugButtonContainer = this.add.container(0, 0);
        this.debugButtonContainer.add([this.debugButton, this.debugButtonText]);
        this.debugButtonContainer.setDepth(1000); // Ensure it's above other elements
        
        // Add click handler directly to the button
        this.debugButton.on('pointerdown', (pointer) => {
            console.log('Debug button pressed!');
            // Stop event propagation
            pointer.event.stopPropagation();
            
            // Toggle debug visibility
            this.debugContainer.setVisible(!this.debugContainer.visible);
            
            // Visual feedback
            this.debugButton.setFillStyle(0xff00ff, 0.9);
            
            // Reset after a short delay
            this.time.delayedCall(100, () => {
                this.debugButton.setFillStyle(0x00aaff, 0.8);
            });
        });
        
        // Make sure the button stays in position when resizing
        this.scale.on('resize', (gameSize) => {
            this.debugButton.setPosition(buttonX, buttonY);
            this.debugButtonText.setPosition(buttonX, buttonY);
        });
    }

    createGestureIndicator() {
        // Create a graphics object for gesture visualization
        this.gestureGraphics = this.add.graphics();
        
        // Create a trail effect for gestures
        this.gestureTrail = [];
        this.isDragging = false;
    }

    createCuttingGuide() {
        // Create a container for the cutting guide elements
        this.cuttingGuideContainer = this.add.container(0, 0);
        
        // Create dotted lines to show where to cut (initially invisible)
        this.cuttingGuideLines = [];
        
        // We'll create these lines but make them invisible until needed
        for (let i = 1; i <= this.requiredCuts; i++) {
            const guideGraphics = this.add.graphics();
            guideGraphics.lineStyle(2, 0xffff00, 0.5);
            
            // Add to container and store reference
            this.cuttingGuideContainer.add(guideGraphics);
            this.cuttingGuideLines.push(guideGraphics);
        }
        
        // Hide the guide initially
        this.cuttingGuideContainer.setVisible(false);
    }

    setupInput() {
        // Make the entire game area interactive
        this.inputZone = this.add.zone(0, 0, this.cameras.main.width, this.cameras.main.height)
            .setOrigin(0, 0)
            .setInteractive();
        
        // Track pointer down state
        this.input.on('pointerdown', (pointer) => {
            // Check if pointer is over the debug button
            if (this.debugButton && this.debugButton.getBounds().contains(pointer.x, pointer.y)) {
                // Don't handle game input if clicking on debug button
                return;
            }
            
            this.isDragging = true;
            this.lastPointerPosition = { x: pointer.x, y: pointer.y };
            this.lastPointerAngle = this.getPointerAngle(pointer);
            
            // Clear previous gesture trail
            this.gestureTrail = [];
            this.addGesturePoint(pointer.x, pointer.y);
        });
        
        // Track pointer movement
        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                this.handlePointerMove(pointer);
                this.lastPointerPosition = { x: pointer.x, y: pointer.y };
            }
        });
        
        // Track pointer up
        this.input.on('pointerup', () => {
            this.isDragging = false;
            this.lastPointerPosition = null;
        });
        
        // Handle pointer leaving game area
        this.input.on('pointerout', () => {
            this.isDragging = false;
            this.lastPointerPosition = null;
        });
        
        // Make sure the input zone resizes with the camera
        this.scale.on('resize', (gameSize) => {
            this.inputZone.setSize(gameSize.width, gameSize.height);
        });
    }

    handlePointerMove(pointer) {
        // Add point to gesture trail
        this.addGesturePoint(pointer.x, pointer.y);
        
        switch (this.currentState) {
            case this.gameState.PULLING_DOUGH:
                this.handlePullingDough(pointer);
                break;
                
            case this.gameState.ROTATING_DOUGH:
                this.handleRotatingDough(pointer);
                break;
                
            case this.gameState.CUTTING_NOODLES:
                this.handleCuttingNoodles(pointer);
                break;
                
            case this.gameState.MOVING_TO_FINISH:
                this.handleMovingToFinish(pointer);
                break;
        }
        
        // Only update debug info if it's visible
        if (this.debugContainer && this.debugContainer.visible) {
            this.updateDebugInfo();
        }
    }

    handlePullingDough(pointer) {
        // Check for downward movement
        if (this.lastPointerPosition && pointer.y > this.lastPointerPosition.y) {
            // Calculate how much to move the dough based on pointer movement
            const dragDistance = pointer.y - this.lastPointerPosition.y;
            
            // Move the dough down proportionally to the drag with sensitivity applied
            this.dough.y += dragDistance * this.pullSensitivity;
            
            // Clamp the dough position between start and center
            this.dough.y = Phaser.Math.Clamp(this.dough.y, this.doughStartY, this.doughCenterY);
            
            // Check if dough reached center position
            if (this.dough.y >= this.doughCenterY) {
                this.dough.y = this.doughCenterY;
                this.currentState = this.gameState.ROTATING_DOUGH;
                console.log('State changed to ROTATING_DOUGH');
                
                // Update instruction text
                const width = this.cameras.main.width;
                if (!this.instructionText) {
                    this.instructionText = this.add.text(width / 2, this.doughCenterY + 150, 'Make CIRCULAR motions to rotate dough!', {
                        font: '24px Arial',
                        fill: '#ffffff'
                    }).setOrigin(0.5);
                } else {
                    this.instructionText.setText('Make CIRCULAR motions to rotate dough!');
                }
                
                // Update subtitle
                if (!this.subtitleText) {
                    this.subtitleText = this.add.text(width / 2, this.doughCenterY + 180, '(Rotate anywhere on screen)', {
                        font: '18px Arial',
                        fill: '#aaaaaa'
                    }).setOrigin(0.5);
                } else {
                    this.subtitleText.setText('(Rotate anywhere on screen)');
                }
            }
        }
    }

    handleRotatingDough(pointer) {
        // Calculate rotation based on circular motion anywhere on screen
        const currentAngle = Math.atan2(
            pointer.y - this.cameras.main.height / 2,
            pointer.x - this.cameras.main.width / 2
        ) * (180 / Math.PI);
        
        const angleDiff = this.getAngleDifference(this.lastPointerAngle, currentAngle);
        
        // Update rotation progress based on angle difference with sensitivity applied
        if (Math.abs(angleDiff) < 30) { // Prevent large jumps
            this.rotationProgress += Math.abs(angleDiff) * this.rotationSpeed * this.rotateSensitivity;
            
            // Rotate the dough sprite
            this.dough.rotation += angleDiff * 0.01;
            
            // Increase dough size slightly with rotation
            const progressPercent = this.rotationProgress / this.maxRotationProgress;
            const newScale = 1 + progressPercent * 0.5;
            this.dough.setScale(newScale);
            
            // Update progress bar
            this.updateProgressBar();
            
            // Check if rotation is complete
            if (this.rotationProgress >= this.maxRotationProgress) {
                this.rotationProgress = this.maxRotationProgress;
                this.currentState = this.gameState.CUTTING_NOODLES;
                console.log('State changed to CUTTING_NOODLES');
                
                // Show the cutting guide
                this.showCuttingGuide();
                
                // Update instruction text
                if (this.instructionText) {
                    this.instructionText.setText('Cut the dough!');
                }
                
                // Update subtitle
                if (this.subtitleText) {
                    this.subtitleText.setText('(Swipe UP or DOWN directly on the dough)');
                }
            }
        }
        
        this.lastPointerAngle = currentAngle;
    }

    handleCuttingNoodles(pointer) {
        // Check for vertical movement (up or down)
        if (!this.lastPointerPosition) return;
        
        const horizontalDistance = Math.abs(pointer.x - this.lastPointerPosition.x);
        const verticalDistance = Math.abs(pointer.y - this.lastPointerPosition.y);
        
        // If the movement is primarily vertical (more vertical than horizontal)
        if (verticalDistance > horizontalDistance && verticalDistance > 30) {
            // Calculate the horizontal position of the cut
            const cutX = pointer.x;
            
            // Check if this cut is far enough from existing cuts (prevent double cuts in same area)
            const minCutDistance = 20; // Minimum pixels between cuts
            let isTooClose = false;
            
            for (const existingCut of this.cutLines) {
                if (Math.abs(existingCut.x - cutX) < minCutDistance) {
                    isTooClose = true;
                    break;
                }
            }
            
            // Check if the swipe is within the dough bounds
            const isWithinDough = this.isWithinDoughBounds(pointer);
            
            // Only add a new cut if it's not too close to existing cuts and within the dough area
            if (!isTooClose && isWithinDough) {
                // Add a new cut line
                this.addCutLine(cutX);
                
                // Add a visual effect to show the cut
                this.addCutEffect(cutX, this.dough.y);
                
                // Increment cut counter
                this.cutsMade++;
                console.log(`Cut made! ${this.cutsMade}/${this.requiredCuts}`);
                
                // Update the progress bar to show cutting progress
                this.updateCuttingProgress();
                
                // Check if all required cuts have been made
                if (this.cutsMade >= this.requiredCuts) {
                    this.currentState = this.gameState.MOVING_TO_FINISH;
                    console.log('State changed to MOVING_TO_FINISH');
                    
                    // Hide the cutting guide when moving to finish
                    if (this.cuttingGuideContainer) {
                        this.cuttingGuideContainer.setVisible(false);
                    }
                    
                    // Update instruction text
                    if (this.instructionText) {
                        this.instructionText.setText('Drag RIGHT to finish the dough!');
                    }
                    
                    // Update subtitle
                    if (this.subtitleText) {
                        this.subtitleText.setText('(Swipe right anywhere on screen)');
                    }
                }
            }
        }
    }
    
    isWithinDoughBounds(pointer) {
        // Calculate the bounds of the dough based on its current position and scale
        const doughLeft = this.dough.x - (this.dough.displayWidth / 2);
        const doughRight = this.dough.x + (this.dough.displayWidth / 2);
        const doughTop = this.dough.y - (this.dough.displayHeight / 2);
        const doughBottom = this.dough.y + (this.dough.displayHeight / 2);
        
        // Check if the pointer is within the dough bounds
        return (
            pointer.x >= doughLeft && 
            pointer.x <= doughRight && 
            pointer.y >= doughTop && 
            pointer.y <= doughBottom
        );
    }
    
    isWithinDoughBoundsHorizontal(x) {
        // Calculate the bounds of the dough based on its current position and scale
        const doughLeft = this.dough.x - (this.dough.displayWidth / 2);
        const doughRight = this.dough.x + (this.dough.displayWidth / 2);
        
        // Check if the x position is within the dough bounds
        return x >= doughLeft && x <= doughRight;
    }
    
    addCutLine(x) {
        // Create a graphics object for the cut line
        const cutGraphics = this.add.graphics();
        
        // Calculate the dough visual radius (slightly smaller than the full height)
        const doughRadius = this.dough.displayHeight / 2 * 0.8;
        
        // Calculate how far this cut is from the dough center horizontally
        const distanceFromCenter = Math.abs(x - this.dough.x);
        
        // Calculate the vertical height at this x position using the circle equation
        // For a circle: x² + y² = r², so y = √(r² - x²)
        const verticalRadius = Math.sqrt(Math.max(0, doughRadius * doughRadius - distanceFromCenter * distanceFromCenter));
        
        // Calculate start and end Y positions
        const startY = this.dough.y - verticalRadius;
        const endY = this.dough.y + verticalRadius;
        
        // Draw the main cut line with a thicker, more visible style
        cutGraphics.lineStyle(4, 0xffffff, 0.9);
        cutGraphics.beginPath();
        cutGraphics.moveTo(x, startY);
        cutGraphics.lineTo(x, endY);
        cutGraphics.strokePath();
        
        // Add some visual effects to make it look like a cut
        cutGraphics.lineStyle(2, 0x000000, 0.5);
        
        // Draw a slightly offset shadow line
        cutGraphics.beginPath();
        cutGraphics.moveTo(x + 2, startY);
        cutGraphics.lineTo(x + 2, endY);
        cutGraphics.strokePath();
        
        // Add a slight glow effect
        const glowGraphics = this.add.graphics();
        glowGraphics.lineStyle(6, 0xffffff, 0.3);
        glowGraphics.beginPath();
        glowGraphics.moveTo(x, startY);
        glowGraphics.lineTo(x, endY);
        glowGraphics.strokePath();
        
        // Store the cut line for reference with relative position to dough
        this.cutLines.push({
            graphics: cutGraphics,
            glowGraphics: glowGraphics,
            x: x,
            relativeX: x - this.dough.x, // Store position relative to dough center
            distanceFromCenter: distanceFromCenter // Store for later recalculation
        });
    }

    handleMovingToFinish(pointer) {
        // Check for rightward movement
        if (this.lastPointerPosition && pointer.x > this.lastPointerPosition.x) {
            // Calculate how much to move the dough based on pointer movement
            const dragDistance = pointer.x - this.lastPointerPosition.x;
            
            // Move the dough right proportionally to the drag with sensitivity applied
            const moveAmount = dragDistance * this.moveSensitivity;
            
            // Move the dough
            this.dough.x += moveAmount;
            
            // Move all cut lines with the dough
            this.cutLines.forEach(cutLine => {
                // Update the absolute position based on the dough's new position
                const newX = this.dough.x + cutLine.relativeX;
                
                // Move the graphics
                this.updateCutLinePosition(cutLine, newX);
            });
            
            // Check if dough reached the end position
            if (this.dough.x >= this.doughEndX) {
                // Increment counter and reset game state
                this.rolledDoughCount++;
                console.log('Dough completed! Count:', this.rolledDoughCount);
                this.updateCounter();
                this.resetDough();
            }
        }
    }
    
    updateCutLinePosition(cutLine, newX) {
        // Update the stored x position
        cutLine.x = newX;
        
        // Calculate the dough visual radius
        const doughRadius = this.dough.displayHeight / 2 * 0.8;
        
        // Use the stored distance from center to calculate the vertical height
        const distanceFromCenter = cutLine.distanceFromCenter;
        
        // Calculate the vertical height at this x position using the circle equation
        const verticalRadius = Math.sqrt(Math.max(0, doughRadius * doughRadius - distanceFromCenter * distanceFromCenter));
        
        // Calculate start and end Y positions
        const startY = this.dough.y - verticalRadius;
        const endY = this.dough.y + verticalRadius;
        
        // Clear previous graphics
        cutLine.graphics.clear();
        cutLine.glowGraphics.clear();
        
        // Redraw main line
        cutLine.graphics.lineStyle(4, 0xffffff, 0.9);
        cutLine.graphics.beginPath();
        cutLine.graphics.moveTo(newX, startY);
        cutLine.graphics.lineTo(newX, endY);
        cutLine.graphics.strokePath();
        
        // Redraw shadow
        cutLine.graphics.lineStyle(2, 0x000000, 0.5);
        cutLine.graphics.beginPath();
        cutLine.graphics.moveTo(newX + 2, startY);
        cutLine.graphics.lineTo(newX + 2, endY);
        cutLine.graphics.strokePath();
        
        // Redraw glow
        cutLine.glowGraphics.lineStyle(6, 0xffffff, 0.3);
        cutLine.glowGraphics.beginPath();
        cutLine.glowGraphics.moveTo(newX, startY);
        cutLine.glowGraphics.lineTo(newX, endY);
        cutLine.glowGraphics.strokePath();
    }

    getPointerAngle(pointer) {
        // Calculate angle between pointer and dough center
        const dx = pointer.x - this.dough.x;
        const dy = pointer.y - this.dough.y;
        return Math.atan2(dy, dx) * (180 / Math.PI);
    }

    getAngleDifference(angle1, angle2) {
        // Calculate the smallest difference between two angles
        let diff = angle2 - angle1;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        return diff;
    }

    updateProgressBar() {
        const progressPercent = (this.rotationProgress / this.maxRotationProgress) * 100;
        const barWidth = (progressPercent / 100) * 300;
        
        // Update progress bar fill
        this.progressBarFill.setDisplaySize(barWidth, 40);
        
        // Update progress text with improved readability
        this.progressText.setText(`${Math.floor(progressPercent)}%`);
        this.progressText.setFill('#ffffff');
        
        // Add text shadow for better readability against any background
        this.progressText.setShadow(2, 2, '#000000', 3, true, true);
    }

    updateCuttingProgress() {
        const progressPercent = (this.cutsMade / this.requiredCuts) * 100;
        const barWidth = (progressPercent / 100) * 300;
        
        // Update progress bar fill
        this.progressBarFill.setDisplaySize(barWidth, 40);
        
        // Update progress text with improved readability
        this.progressText.setText(`${this.cutsMade}/${this.requiredCuts} cuts`);
        this.progressText.setFill('#ffffff');
        
        // Add text shadow for better readability against any background
        this.progressText.setShadow(2, 2, '#000000', 3, true, true);
    }

    updateCounter() {
        this.counterValue.setText(this.rolledDoughCount.toString());
    }
    
    updateDebugInfo() {
        // Only update if debug is visible (performance optimization)
        if (!this.debugContainer || !this.debugContainer.visible) return;
        
        this.stateText.setText(`State: ${this.stateNames[this.currentState]}`);
        this.positionText.setText(`Dough Position: X:${Math.round(this.dough.x)}, Y:${Math.round(this.dough.y)}`);
        
        // Show different progress info based on current state
        if (this.currentState === this.gameState.ROTATING_DOUGH) {
            this.progressDebugText.setText(`Progress: ${this.rotationProgress.toFixed(1)}/${this.maxRotationProgress}`);
        } else if (this.currentState === this.gameState.CUTTING_NOODLES) {
            this.progressDebugText.setText(`Cuts: ${this.cutsMade}/${this.requiredCuts}`);
        } else {
            this.progressDebugText.setText(`Progress: ${this.rotationProgress.toFixed(1)}/${this.maxRotationProgress}`);
        }
    }

    resetDough() {
        // Reset dough position and state
        this.dough.x = this.cameras.main.width / 2;
        this.dough.y = this.doughStartY;
        this.dough.rotation = 0;
        this.dough.setScale(1);
        this.dough.setVisible(true);
        
        // Clear cut lines
        this.cutLines.forEach(cut => {
            if (cut.graphics) {
                cut.graphics.destroy();
            }
            if (cut.glowGraphics) {
                cut.glowGraphics.destroy();
            }
        });
        this.cutLines = [];
        this.cutsMade = 0;
        
        // Hide cutting guide
        if (this.cuttingGuideContainer) {
            this.cuttingGuideContainer.setVisible(false);
        }
        
        // Reset game state
        this.currentState = this.gameState.PULLING_DOUGH;
        this.rotationProgress = 0;
        console.log('State reset to PULLING_DOUGH');
        
        // Reset progress bar
        this.updateProgressBar();
        
        // Reset instruction text
        if (this.instructionText) {
            this.instructionText.setText('Drag DOWN anywhere to pull dough!');
        }
        
        // Reset subtitle
        if (this.subtitleText) {
            this.subtitleText.setText('(You can drag anywhere on screen)');
        }
    }

    showCuttingGuide() {
        // Make the guide visible
        this.cuttingGuideContainer.setVisible(true);
        
        // Calculate the dough bounds using the visual radius
        const doughRadius = this.dough.displayHeight / 2 * 0.8;
        const doughWidth = this.dough.displayWidth;
        const doughLeft = this.dough.x - (doughWidth / 2);
        const doughRight = this.dough.x + (doughWidth / 2);
        
        // Position the guide lines evenly across the dough
        for (let i = 0; i < this.requiredCuts; i++) {
            const lineX = doughLeft + ((i + 1) * doughWidth / (this.requiredCuts + 1));
            const guideGraphics = this.cuttingGuideLines[i];
            
            // Calculate how far this guide is from the dough center horizontally
            const distanceFromCenter = Math.abs(lineX - this.dough.x);
            
            // Calculate the vertical height at this x position using the circle equation
            const verticalRadius = Math.sqrt(Math.max(0, doughRadius * doughRadius - distanceFromCenter * distanceFromCenter));
            
            // Calculate start and end Y positions
            const startY = this.dough.y - verticalRadius;
            const endY = this.dough.y + verticalRadius;
            
            // Clear and redraw
            guideGraphics.clear();
            guideGraphics.lineStyle(2, 0x00ffff, 0.7); // Brighter cyan color for better visibility
            
            // Draw a dashed line manually by creating small line segments
            const dashLength = 5;
            const gapLength = 5;
            let dashY = startY; // Start at top of calculated height
            
            while (dashY < endY) {
                // Draw a dash
                guideGraphics.beginPath();
                guideGraphics.moveTo(lineX, dashY);
                guideGraphics.lineTo(lineX, Math.min(dashY + dashLength, endY));
                guideGraphics.strokePath();
                
                // Move to the next dash position
                dashY += dashLength + gapLength;
            }
        }
    }

    addGesturePoint(x, y) {
        // Add a new point to the gesture trail
        this.gestureTrail.push({ x, y });
        
        // Limit the number of points to prevent performance issues
        if (this.gestureTrail.length > 20) {
            this.gestureTrail.shift();
        }
        
        // Draw the updated trail
        this.drawGestureTrail();
    }
    
    drawGestureTrail() {
        // Clear previous graphics
        this.gestureGraphics.clear();
        
        if (this.gestureTrail.length === 0) {
            return;
        }
        
        // Determine color based on current state
        let color;
        switch (this.currentState) {
            case this.gameState.PULLING_DOUGH:
                color = 0x00ff00; // Green for pulling
                break;
            case this.gameState.ROTATING_DOUGH:
                color = 0x0000ff; // Blue for rotating
                break;
            case this.gameState.CUTTING_NOODLES:
                color = 0xff0000; // Red for cutting
                break;
            case this.gameState.MOVING_TO_FINISH:
                color = 0xff00ff; // Purple for moving to finish
                break;
        }
        
        // Draw trail points
        for (let i = 0; i < this.gestureTrail.length; i++) {
            const point = this.gestureTrail[i];
            const alpha = i / this.gestureTrail.length; // Fade out older points
            
            this.gestureGraphics.fillStyle(color, alpha);
            this.gestureGraphics.fillCircle(point.x, point.y, 8);
        }
        
        // Connect points with lines
        if (this.gestureTrail.length > 1) {
            this.gestureGraphics.lineStyle(4, color, 0.5);
            this.gestureGraphics.beginPath();
            this.gestureGraphics.moveTo(this.gestureTrail[0].x, this.gestureTrail[0].y);
            
            for (let i = 1; i < this.gestureTrail.length; i++) {
                this.gestureGraphics.lineTo(this.gestureTrail[i].x, this.gestureTrail[i].y);
            }
            
            this.gestureGraphics.strokePath();
        }
    }

    addCutEffect(x, y) {
        // Calculate the dough visual radius
        const doughRadius = this.dough.displayHeight / 2 * 0.8;
        
        // Calculate how far this cut is from the dough center horizontally
        const distanceFromCenter = Math.abs(x - this.dough.x);
        
        // Calculate the vertical height at this x position using the circle equation
        const verticalRadius = Math.sqrt(Math.max(0, doughRadius * doughRadius - distanceFromCenter * distanceFromCenter));
        
        // Create a flash effect for the cut with the calculated height
        const flash = this.add.rectangle(x, y, 10, verticalRadius * 2, 0xffffff);
        flash.setAlpha(0.8);
        
        // Animate the flash
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Add a small particle effect if we can
        if (this.particles) {
            const emitter = this.particles.createEmitter({
                x: x,
                y: y,
                speed: { min: 20, max: 50 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.5, end: 0 },
                blendMode: 'ADD',
                lifespan: 300,
                gravityY: 100
            });
            
            // Emit a burst of particles
            emitter.explode(10, x, y);
            
            // Stop the emitter after the burst
            this.time.delayedCall(100, () => {
                emitter.stop();
            });
        }
    }

    update() {
        // Fade out gesture trail over time
        if (this.gestureTrail.length > 0 && !this.isDragging) {
            this.gestureTrail.shift();
            this.drawGestureTrail();
        }
        
        // Update debug info if it's visible
        if (this.debugContainer && this.debugContainer.visible) {
            this.updateDebugInfo();
        }
        
        // Update cut lines if dough has changed position or scale
        if (this.currentState === this.gameState.MOVING_TO_FINISH && this.cutLines.length > 0) {
            this.cutLines.forEach(cutLine => {
                const newX = this.dough.x + cutLine.relativeX;
                this.updateCutLinePosition(cutLine, newX);
            });
        }
        
        // Check for orientation changes on mobile
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // If we detect a significant change in screen dimensions, refresh the layout
        if (this.lastWidth !== width || this.lastHeight !== height) {
            this.lastWidth = width;
            this.lastHeight = height;
            
            // Refresh positions of key UI elements
            if (this.progressBarContainer) {
                this.resizeProgressBar();
            }
            
            // Update instruction text position
            if (this.instructionText) {
                this.instructionText.setPosition(width / 2, this.doughCenterY + 150);
            }
            
            if (this.subtitleText) {
                this.subtitleText.setPosition(width / 2, this.doughCenterY + 180);
            }
            
            // Update counter display position
            if (this.counterBg) {
                this.counterBg.clear();
                this.counterBg.fillStyle(0x333333, 0.8);
                this.counterBg.fillRoundedRect(width - 150, 20, 130, 60, 10);
                this.counterBg.lineStyle(2, 0x555555, 1);
                this.counterBg.strokeRoundedRect(width - 150, 20, 130, 60, 10);
                
                this.counterTitle.setPosition(width - 85, 35);
                this.counterValue.setPosition(width - 85, 60);
            }
            
            // Ensure debug button container is on top
            if (this.debugButtonContainer) {
                this.debugButtonContainer.setDepth(1000);
            }
        }
        
        // Always ensure debug button is on top and interactive
        if (this.debugButton && !this.debugButton.input.enabled) {
            this.debugButton.setInteractive({ useHandCursor: true });
        }
    }
} 