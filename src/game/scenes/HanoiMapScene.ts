import Phaser from 'phaser';

export default class HanoiMapScene extends Phaser.Scene {
  // Parallax layers
  private bgSkyLayer!: Phaser.GameObjects.TileSprite;
  private cloudsLayer!: Phaser.GameObjects.TileSprite;
  private bgFarLayer!: Phaser.GameObjects.TileSprite;
  private bgMidLayer!: Phaser.GameObjects.TileSprite;
  private fgSceneryLayer!: Phaser.GameObjects.TileSprite;

  // Dynamic pathway platforms
  private pathwayGroup!: Phaser.GameObjects.Group;
  private nextPlatformX = 0;
  private groundY = 400; // Pathway vertical position
  private pathwayThickness = 64; // Road visual thickness (64px tile height)

  // Camera & Scroll Control
  private scrollSpeed = 3; // Pixels per frame (auto-scroll speed)
  private isPaused = false;
  private camX = 0;
  private camY = 0;

  // HUD state change tracking to prevent React infinite rendering loop
  private lastScore = -1;
  private lastTimeElapsed = -1;
  private lastEnergy = -1;
  private lastPhase = '';

  // Debug HUD elements
  private debugText!: Phaser.GameObjects.Text;
  private showDebug = true;

  // Keys
  private keys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super('HanoiMapScene');
  }

  create() {
    const width = this.cameras.main.width; // 960
    const height = this.cameras.main.height; // 540

    console.log('HanoiMapScene created. Initializing 3D Parallax layers...');

    // 0. Solid background gradient to prevent any transparency leak
    const bgGradient = this.add.graphics();
    // Dark indigo/navy to warm sunset purple gradient
    const renderWidth = width + 1000; // Extra width to prevent black gaps on right on widescreen resolutions
    bgGradient.fillGradientStyle(0x060611, 0x060611, 0x2a1639, 0x2a1639, 1);
    bgGradient.fillRect(0, 0, renderWidth, height);
    bgGradient.setScrollFactor(0);
    bgGradient.setDepth(-1);

    const scale = height / 1024; // Scale factor for 1024x1024 square background assets

    // 1. LAYER 0: Sky Strip (Landmarks / Sunset from design sheet)
    this.bgSkyLayer = this.add.tileSprite(0, 0, renderWidth, height, 'hanoi_bg_sky')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(0)
      .setTileScale(scale, scale);

    // 2. LAYER 1: Clouds (Upper sky)
    this.cloudsLayer = this.add.tileSprite(0, 0, renderWidth, height, 'hanoi_clouds_floating')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1)
      .setAlpha(0.85)
      .setTileScale(scale, scale);

    // 3. LAYER 2: Far Landmarks (Turtle Tower, Cầu Thê Húc, VTI Office from design sheet)
    this.bgFarLayer = this.add.tileSprite(0, 0, renderWidth, height, 'hanoi_bg_far_landmarks')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(2)
      .setTileScale(scale, scale); 

    // 4. LAYER 3: Mid City
    // scenery_clean.png has height 103, place it sitting right on the pavement (this.groundY = 400 - 103 = 297)
    this.bgMidLayer = this.add.tileSprite(0, 297, renderWidth, 103, 'hanoi_bg_mid_city')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(3); 

    // 5. LAYER 4: Foreground Details (Street lamps, hanging leaves, flowers)
    this.fgSceneryLayer = this.add.tileSprite(0, 0, renderWidth, height, 'hanoi_fg_scenery')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(4)
      .setTileScale(scale, scale);

    // 6. LAYER 5: Pathway Platforms (Pavement road blocks with pits)
    // depth = 5
    this.pathwayGroup = this.add.group();
    this.nextPlatformX = 0;
    
    // Generate initial platforms to cover the starting screen
    this.generatePathway(width + 500);

    // 6. Setup Controls
    this.keys = {
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      space: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      d: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 7. Setup Debug HUD
    this.createDebugHUD();

    // Emit initial HUD state for React overlay
    this.game.events.emit('hud-update', {
      score: 0,
      hearts: 3,
      energy: 0,
      bossHp: 0,
      maxBossHp: 0,
      phase: 'map_preview',
      timeElapsed: 0,
      mapKey: 'hanoi_preview',
      mapName: 'Hà Nội (Preview)'
    });

    // Reset camera positions
    this.camX = 0;
    this.camY = 0;
    this.cameras.main.setScroll(this.camX, this.camY);

    // 8. Back to menu callback
    this.add.text(20, 20, '← Press ESC to Menu', {
      font: '14px Courier New, monospace',
      color: '#00e5ff',
      backgroundColor: '#111125dd',
      padding: { x: 10, y: 5 }
    })
    .setScrollFactor(0)
    .setDepth(10)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.scene.start('MenuScene'));

    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });

    // Space key to toggle pause
    this.input.keyboard!.on('keydown-SPACE', () => {
      this.isPaused = !this.isPaused;
    });

    // D key to toggle debug panel
    this.input.keyboard!.on('keydown-D', () => {
      this.showDebug = !this.showDebug;
      this.debugText.setVisible(this.showDebug);
    });
  }

  update(time: number, delta: number) {
    // 1. Process Keyboard Controls
    this.handleKeyboardInputs();

    // 2. Perform Camera Auto-scroll
    if (!this.isPaused) {
      this.camX += this.scrollSpeed;
      this.cameras.main.setScroll(this.camX, this.camY);

      // Procedural pathway platform generation ahead of camera viewport
      const viewportRight = this.camX + this.cameras.main.width;
      this.generatePathway(viewportRight + 500);

      // Clean up offscreen platforms to preserve memory
      this.cleanupOffscreenPlatforms();
    }

    // 3. Update Parallax Backgrounds offsets
    // Formula: ScrollOffset = CameraX * ScrollFactor
    this.bgSkyLayer.tilePositionX = this.camX * 0.05;
    
    // Clouds layer: custom scroll factor + slow independent wind drift
    this.cloudsLayer.tilePositionX = (this.camX * 0.1) + (time * 0.02);
    
    this.bgFarLayer.tilePositionX = this.camX * 0.3;
    this.bgMidLayer.tilePositionX = this.camX * 0.6;
    this.fgSceneryLayer.tilePositionX = this.camX * 1.5; // moves faster than pathway (1.0x) to create foreground depth

    // 4. Update Debug HUD Text
    if (this.showDebug) {
      this.updateDebugText();
    }

    // Emit HUD updates safely (throttled to actual state changes)
    this.emitHudState(time);
  }

  private emitHudState(time: number) {
    const roundedScore = Math.round(this.camX);
    const roundedTime = Math.round(time / 1000);
    const roundedEnergy = Math.floor(Math.min(100, (this.camX / 30) % 100));
    const currentPhase = 'map_preview';

    if (
      roundedScore === this.lastScore &&
      roundedTime === this.lastTimeElapsed &&
      roundedEnergy === this.lastEnergy &&
      currentPhase === this.lastPhase
    ) {
      return; // Skip emitting to prevent React loop
    }

    this.lastScore = roundedScore;
    this.lastTimeElapsed = roundedTime;
    this.lastEnergy = roundedEnergy;
    this.lastPhase = currentPhase;

    this.game.events.emit('hud-update', {
      score: roundedScore,
      hearts: 3,
      energy: roundedEnergy,
      bossHp: 0,
      maxBossHp: 0,
      phase: currentPhase,
      timeElapsed: roundedTime,
      mapKey: 'hanoi_preview',
      mapName: 'Hà Nội (Preview)'
    });
  }

  private handleKeyboardInputs() {
    // Adjust speed using Left/Right keys
    if (this.keys.left.isDown) {
      this.scrollSpeed = Math.max(-10, this.scrollSpeed - 0.1);
    } else if (this.keys.right.isDown) {
      this.scrollSpeed = Math.min(25, this.scrollSpeed + 0.1);
    }

    // Adjust Camera Y using Up/Down to inspect parallax height offsets
    if (this.keys.up.isDown) {
      this.camY = Math.max(-100, this.camY - 2);
      this.cameras.main.setScroll(this.camX, this.camY);
    } else if (this.keys.down.isDown) {
      this.camY = Math.min(100, this.camY + 2);
      this.cameras.main.setScroll(this.camX, this.camY);
    }
  }

  /**
   * Procedurally generates path/road blocks with empty spaces (pits) in between.
   */
  private generatePathway(targetX: number) {
    while (this.nextPlatformX < targetX) {
      // 1. Determine platform width (256px to 640px)
      const platformWidth = Phaser.Math.Between(256, 640);
      
      // Create a TileSprite for this specific platform block
      // Sits at groundY (400), thickness = 60
      const platform = this.add.tileSprite(
        this.nextPlatformX, 
        this.groundY, 
        platformWidth, 
        this.pathwayThickness, 
        'hanoi_road_track'
      )
        .setOrigin(0, 0)
        .setDepth(5);
      
      // Scale texture tiling to lock visually in place (doesn't slide as camera scrolls)
      // By default, a TileSprite scrolls its texture with its position, which is perfect for platforms.
      
      // Add reference to group for cleanup tracking
      this.pathwayGroup.add(platform);

      // Advance our spawning marker by the platform width
      this.nextPlatformX += platformWidth;

      // 2. Determine pit/gap width (120px to 256px)
      const gapWidth = Phaser.Math.Between(120, 256);
      
      // Simply skip spawning any ground over this gap!
      // This leaves an empty pit where the background layers (sky, buildings) will show through clearly.
      this.nextPlatformX += gapWidth;
    }
  }

  /**
   * Destroys platforms that have scrolled offscreen to the left to optimize memory.
   */
  private cleanupOffscreenPlatforms() {
    this.pathwayGroup.getChildren().forEach((platformObj: any) => {
      const platform = platformObj as Phaser.GameObjects.TileSprite;
      // If the right edge of the platform is further left than the camera viewport left edge
      if (platform.x + platform.width < this.camX - 200) {
        platform.destroy();
      }
    });
  }

  private createDebugHUD() {
    const hudBg = this.add.graphics()
      .fillStyle(0x0a0a1add, 0.85)
      .fillRoundedRect(10, 80, 340, 240, 8)
      .lineStyle(2, 0x00e5ff, 1)
      .strokeRoundedRect(10, 80, 340, 240, 8)
      .setScrollFactor(0)
      .setDepth(9);

    this.debugText = this.add.text(25, 95, '', {
      font: '13px Courier New, monospace',
      color: '#ffffff',
      lineSpacing: 6
    })
      .setScrollFactor(0)
      .setDepth(10);
  }

  private updateDebugText() {
    this.debugText.setText([
      `--- HANOI 3D PARALLAX DEBUG ---`,
      `Camera Scroll X : ${Math.round(this.camX)} px`,
      `Camera Scroll Y : ${Math.round(this.camY)} px`,
      `Scroll Speed    : ${this.scrollSpeed.toFixed(1)} px/f`,
      `Status          : ${this.isPaused ? 'PAUSED' : 'SCROLLING'}`,
      `--------------------------------`,
      `Z-DEPTH LAYER SPEEDS & RATIOS:`,
      `L0 Sky (Depth 0)      : Ratio 0.05x`,
      `L1 Clouds (Depth 1)   : Ratio 0.10x + Wind`,
      `L2 Far BG (Depth 2)   : Ratio 0.30x`,
      `L3 Mid City (Depth 3) : Ratio 0.60x`,
      `L4 Foregrnd (Depth 4) : Ratio 1.50x`,
      `L5 Pathway (Depth 5)  : Ratio 1.00x (Road/Pits)`,
      `--------------------------------`,
      `CONTROLS:`,
      `[SPACE] Pause/Resume | [D] Hide HUD`,
      `[LEFT/RIGHT] Speed Up/Down`,
      `[UP/DOWN] Look Up/Down`
    ]);
  }
}
