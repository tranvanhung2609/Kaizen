import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import HanoiMapScene from './scenes/HanoiMapScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  backgroundColor: '#111125',
  parent: 'game-canvas-container',
  dom: {
    createContainer: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // Custom gravity is configured on individual entities (e.g. Player)
      debug: process.env.NODE_ENV === 'development', // Tự tắt ở production build
      debugShowBody: true,
      debugShowVelocity: true
    }
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, HanoiMapScene]
};

