import Phaser from 'phaser';

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super('LoginScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Draw dark navy background with grid patterns (consistent with MenuScene)
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x0b0e26, 1);
    bgGraphics.fillRect(0, 0, width, height);

    // Decorative grid lines
    bgGraphics.lineStyle(1, 0x1a1a36, 1);
    for (let x = 0; x < width; x += 40) {
      bgGraphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 40) {
      bgGraphics.lineBetween(0, y, width, y);
    }

    // Add DOM Form element for Glassmorphism styling
    const element = this.add.dom(width / 2, height / 2).createFromHTML(`
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(11, 14, 38, 0.75);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(0, 229, 255, 0.2);
        padding: 30px 40px;
        border-radius: 16px;
        box-shadow: 0 0 25px rgba(0, 84, 166, 0.4);
        font-family: 'Inter', sans-serif;
        width: 320px;
      ">
        <style>
          #playButton {
            width: 100%;
            padding: 12px;
            border-radius: 8px;
            border: none;
            background: #ff8500;
            color: white;
            font-size: 16px;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            box-shadow: 0 4px 10px rgba(255, 133, 0, 0.3);
          }
          #playButton:hover {
            background: #ff9d33 !important;
            box-shadow: 0 0 15px rgba(255, 133, 0, 0.6) !important;
          }
          #playButton:active {
            transform: scale(0.95);
          }
          #playerNameInput {
            width: 100%;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: rgba(26, 26, 54, 0.8);
            color: white;
            font-size: 14px;
            margin-bottom: 20px;
            box-sizing: border-box;
            outline: none;
            transition: all 0.3s;
          }
          #playerNameInput:focus {
            border-color: #00e5ff !important;
            box-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
          }
        </style>
        <h2 style="color: #00e5ff; margin-bottom: 20px; font-family: 'Orbitron', sans-serif; font-size: 24px; text-shadow: 0 0 10px rgba(0, 229, 255, 0.5); letter-spacing: 2px;">LOGIN</h2>
        <input type="text" id="playerNameInput" placeholder="Nhập tên người chơi..." maxlength="15" style="" />
        <button id="playButton">PLAY</button>
      </div>
    `);

    // Get input element and button element
    const button = element.getChildByID('playButton');
    const input = element.getChildByID('playerNameInput') as HTMLInputElement;

    const startNextScene = () => {
      const name = input.value.trim() || 'Player';
      this.registry.set('playerName', name);
      this.scene.start('MapScene');
    };

    button?.addEventListener('click', () => {
      startNextScene();
    });

    // Press Enter to submit too
    input?.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        startNextScene();
      }
    });

    // Automatically focus the input
    setTimeout(() => {
      input?.focus();
    }, 100);
  }
}
