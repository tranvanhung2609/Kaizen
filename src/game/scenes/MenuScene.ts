import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Draw dark navy background with grid patterns (using lines)
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x111125, 1);
    bgGraphics.fillRect(0, 0, width, height);

    // Decorative grid lines
    bgGraphics.lineStyle(1, 0x1a1a36, 1);
    for (let x = 0; x < width; x += 40) {
      bgGraphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 40) {
      bgGraphics.lineBetween(0, y, width, y);
    }

    // Glowing title text
    const titleText = this.add.text(width / 2, 140, 'KAIZEN JOURNEY', {
      font: '800 48px var(--font-display)',
      color: '#00e5ff',
    }).setOrigin(0.5, 0.5);
    
    // Add text shadow glow
    titleText.setShadow(0, 0, '#00e5ff', 20, true, true);

    const subTitleText = this.add.text(width / 2, 195, 'VTI 9-YEAR ADVENTURE RUNNER', {
      font: '700 16px var(--font-mono)',
      color: '#ff3b30',
    }).setOrigin(0.5, 0.5);
    subTitleText.setShadow(0, 0, '#ff3b30', 8, true, true);

    // Dynamic mascot standing on menu background
    const activeGender = this.registry.get('activeGender') || 'male';
    const runnerSprite = this.add.sprite(width / 2, 280, `mascot_${activeGender}_stand`)
      .setScale(1.5)
      .play(`${activeGender}_idle`);

    // Listen to on-the-fly gender updates
    const onGenderUpdate = (gender: string) => {
      runnerSprite.setTexture(`mascot_${gender}_stand`);
      runnerSprite.play(`${gender}_idle`, true);
    };
    this.game.events.on('gender-update', onGenderUpdate);

    this.events.on('shutdown', () => {
      this.game.events.off('gender-update', onGenderUpdate);
    });

    // Controls manual card
    const cardX = width / 2;
    const cardY = 390;
    
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x1a1a36, 0.8);
    cardBg.lineStyle(1, 0x00e5ff, 0.3);
    cardBg.fillRoundedRect(cardX - 180, cardY - 45, 360, 90, 10);
    cardBg.strokeRoundedRect(cardX - 180, cardY - 45, 360, 90, 10);

    this.add.text(cardX, cardY - 25, 'ĐIỀU KHIỂN', {
      font: '700 13px var(--font-display)',
      color: '#00e5ff'
    }).setOrigin(0.5, 0.5);

    this.add.text(cardX, cardY + 5, 'W/⬆ : Nhảy | S/⬇ : Cúi né\nSPACE : Kích hoạt Kaizen Mode (Energy 100%) & Bắn đạn', {
      font: '500 12px var(--font-sans)',
      color: '#cbd5e1',
      align: 'center'
    }).setOrigin(0.5, 0.5);

    // Call to Action
    const ctaText = this.add.text(width / 2, 465, 'ẤN PHÍM ENTER HOẶC CLICK VÀO ĐÂY ĐỂ BẮT ĐẦU', {
      font: '800 16px var(--font-mono)',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    const mapPreviewText = this.add.text(width / 2, 500, 'ẤN PHÍM M HOẶC CLICK VÀO ĐÂY ĐỂ XEM MAP HÀ NỘI (3D PARALLAX)', {
      font: '700 12px var(--font-mono)',
      color: '#00e5ff',
    }).setOrigin(0.5, 0.5);

    // Simple pulse animations
    this.tweens.add({
      targets: ctaText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      loop: -1
    });

    this.tweens.add({
      targets: mapPreviewText,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      loop: -1
    });

    // Make elements interactive
    ctaText.setInteractive({ useHandCursor: true }).on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.startGame();
    });

    mapPreviewText.setInteractive({ useHandCursor: true }).on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.scene.start('HanoiMapScene');
    });

    // Inputs keyboard listener
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.startGame();
    });

    this.input.keyboard?.on('keydown-M', () => {
      this.scene.start('HanoiMapScene');
    });
  }

  private startGame() {
    this.scene.start('GameScene');
  }
}
