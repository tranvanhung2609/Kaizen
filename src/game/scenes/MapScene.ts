import Phaser from 'phaser';

export default class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Draw dark navy background with grid patterns
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

    // Title text
    const titleText = this.add.text(width / 2, 75, 'CHỌN BẢN ĐỒ / CHOOSE MAP', {
      font: '800 32px var(--font-display)',
      color: '#00e5ff',
    }).setOrigin(0.5, 0.5);
    titleText.setShadow(0, 0, '#00e5ff', 15, true, true);

    const playerName = this.registry.get('playerName') || 'Player';
    this.add.text(width / 2, 125, `Chào mừng, ${playerName}! Hãy chọn thử thách tiếp theo:`, {
      font: '500 15px var(--font-sans)',
      color: '#cbd5e1',
    }).setOrigin(0.5, 0.5);

    // Map 1: Forest (Hanoi Map config key 'hanoi')
    this.createMapButton(width / 2 - 200, 290, 'Map 1: Forest', 'Khám phá khu rừng công nghệ Hà Nội cổ xưa, tôn trọng các nguyên tắc cốt lõi.', 'Forest');

    // Map 2: City (Tokyo Map config key 'tokyo')
    this.createMapButton(width / 2 + 200, 290, 'Map 2: City', 'Chinh phục thành phố công nghệ Tokyo hiện đại, không ngừng Kaizen cải tiến.', 'City');
  }

  private createMapButton(x: number, y: number, title: string, desc: string, mapKey: string) {
    const cardWidth = 320;
    const cardHeight = 220;

    // Container for relative layout
    const container = this.add.container(x, y);

    // Background panel (Glassmorphism style)
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a36, 0.75);
    bg.lineStyle(2, 0x00e5ff, 0.3);
    bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 16);
    bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 16);
    container.add(bg);

    // Title Text
    const titleText = this.add.text(0, -55, title, {
      font: '800 22px var(--font-display)',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);
    container.add(titleText);

    // Description text (wrapped)
    const descText = this.add.text(0, 5, desc, {
      font: '500 13px var(--font-sans)',
      color: '#94a3b8',
      align: 'center',
      wordWrap: { width: cardWidth - 40 }
    }).setOrigin(0.5, 0.5);
    container.add(descText);

    // Play Button text inside the card
    const selectText = this.add.text(0, 68, 'BẮT ĐẦU / SELECT', {
      font: '800 13px var(--font-mono)',
      color: '#00e5ff',
      backgroundColor: '#1e293b',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5, 0.5);
    container.add(selectText);

    // Set interactive zone over the card
    const zone = this.add.zone(0, 0, cardWidth, cardHeight)
      .setInteractive({ useHandCursor: true });
    container.add(zone);

    // Hover effects
    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x25254d, 0.85);
      bg.lineStyle(2, 0x00e5ff, 0.8);
      bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 16);
      bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 16);
      titleText.setColor('#00e5ff');
      selectText.setColor('#ffffff').setBackgroundColor('#ff8500');
      this.tweens.add({
        targets: container,
        scaleX: 1.04,
        scaleY: 1.04,
        duration: 120,
        ease: 'Power1'
      });
    });

    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x1a1a36, 0.75);
      bg.lineStyle(2, 0x00e5ff, 0.3);
      bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 16);
      bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 16);
      titleText.setColor('#ffffff');
      selectText.setColor('#00e5ff').setBackgroundColor('#1e293b');
      this.tweens.add({
        targets: container,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 120,
        ease: 'Power1'
      });
    });

    zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.scene.start('GameScene', { map: mapKey });
    });
  }
}
