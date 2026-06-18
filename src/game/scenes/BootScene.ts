import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Load minimal asset for loading progress bar if needed
    // In this case, we'll draw a progress bar dynamically in PreloadScene
  }

  create() {
    console.log('Game booting up...');
    this.scene.start('PreloadScene');
  }
}
