import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // No need to load assets here, they'll be created in PreloadScene
    }

    create() {
        // Set up any game configurations or settings
        this.scale.refresh();
        
        // Transition to the preload scene
        this.scene.start('PreloadScene');
    }
}

export default BootScene; 