import Phaser from 'phaser';
import { RUNNER_PHYSICS } from '../engine/constants';

// ─── HanoiMapScene ─────────────────────────────────────────────────────────────
// Scene preview / debug tool để kiểm tra parallax backgrounds, physics ground
// và player mascot trực tiếp — không cần gameplay đầy đủ.
//
// Controls:
//   [SPACE / Click / Tap] — Nhảy
//   [S / Down]            — Cúi
//   [LEFT / RIGHT]        — Điều chỉnh tốc độ cuộn
//   [UP / DOWN]           — Nhìn lên/xuống
//   [D]                   — Toggle debug panel
//   [ESC]                 — Quay lại menu
export default class HanoiMapScene extends Phaser.Scene {
  // ── Parallax Layers ──────────────────────────────────────────────────────
  private bgSkyLayer!: Phaser.GameObjects.TileSprite;
  private cloudsLayer1!: Phaser.GameObjects.TileSprite;
  private cloudsLayer2!: Phaser.GameObjects.TileSprite;
  private fgSceneryLayer2!: Phaser.GameObjects.TileSprite;
  private cloudsOffset1 = 0;
  private cloudsOffset2 = 0;

  // ── Pathway Platforms ────────────────────────────────────────────────────
  private pathwayGroup!: Phaser.Physics.Arcade.StaticGroup;
  private nextPlatformX = 0;
  private readonly groundY = 380;

  // ── Player Preview ───────────────────────────────────────────────────────
  private player!: Phaser.Physics.Arcade.Sprite;
  private coyoteTimeLeft = 0;
  private jumpBufferTimeLeft = 0;
  private jumpKeyWasDown = false;

  // ── Camera & Scroll ──────────────────────────────────────────────────────
  private scrollSpeed = 3;
  private isPaused = false;
  private camX = 0;
  private camY = 0;

  // ── HUD throttle ─────────────────────────────────────────────────────────
  private lastScore = -1;
  private lastTimeElapsed = -1;
  private lastEnergy = -1;
  private lastPhase = '';

  // ── Input ─────────────────────────────────────────────────────────────────
  private keys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super('HanoiMapScene');
  }

  create() {
    const width = this.cameras.main.width;   // 960
    const height = this.cameras.main.height; // 540

    console.log('HanoiMapScene created — Parallax + Player Preview mode');

    // ── 0. Base gradient backdrop ────────────────────────────────────────
    const renderWidth = width + 1000;
    this.add.graphics()
      .fillGradientStyle(0x060611, 0x060611, 0x2a1639, 0x2a1639, 1)
      .fillRect(0, 0, renderWidth, height)
      .setScrollFactor(0)
      .setDepth(-1);

    const scale = height / 1024;

    // ── 1. Sky (depth 0) ──────────────────────────────────────────────────
    this.bgSkyLayer = this.add.tileSprite(0, 0, renderWidth, height, 'hanoi_bg_sky')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(0).setTileScale(scale, scale);

    // ── 2. Clouds (depth 1) ───────────────────────────────────────────
    this.cloudsLayer1 = this.add.tileSprite(0, 0, renderWidth, 220, 'hanoi_clouds_floating')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1).setAlpha(0.9).setTileScale(scale * 0.5, scale * 0.5);
    this.cloudsLayer1.tilePositionY = 310;

    // ── 5. Foreground (depth 7) ────────────────────────────────────────
    this.fgSceneryLayer2 = this.add.tileSprite(0, height, renderWidth, 260, 'hanoi_fg_clean_v2')
      .setOrigin(0, 1).setScrollFactor(0).setDepth(7).setTileScale(scale * 1.3, scale * 1.3);

    // ── 6. Physics Static Ground (invisible, depth 5) ─────────────────────
    // Dùng StaticGroup để player đứng được — giống GameScene thực
    this.pathwayGroup = this.physics.add.staticGroup();
    this.nextPlatformX = 0;
    this.generatePathway(width + 500);

    // ── 7. Player Mascot Preview (depth 5) ────────────────────────────────
    this.player = this.physics.add.sprite(150, 300, 'mascot_male_run');
    this.player.setGravityY(RUNNER_PHYSICS.gravity);
    this.player.setCollideWorldBounds(false); // Không giới hạn world bounds — scene cuộn
    this.player.setScale(0.6).setDepth(5);
    this.player.setVisible(true); // Made visible so player is controllable
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(40, 120).setOffset(65, 84);
    this.player.play('male_run');

    // Collider player vs ground
    this.physics.add.collider(this.player, this.pathwayGroup);

    // World bounds cho camera chứ không phải physics world
    this.physics.world.setBounds(0, 0, 99999, height);
    this.physics.world.setBoundsCollision(true, false, false, false);

    // Camera follow player
    this.cameras.main.startFollow(this.player, true, 1.0, 1.0, -250, 0);

    // ── 8. Input Keys ─────────────────────────────────────────────────────
    this.keys = {
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      s:     this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      space: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    // Pointer / Touch → Jump Buffer (giống GameScene — click chuột hoặc tap để nhảy)
    const onJumpTrigger = () => {
      this.jumpBufferTimeLeft = RUNNER_PHYSICS.JUMP_BUFFER_MS;
    };
    this.input.on('pointerdown', onJumpTrigger);

    // Bấm ENTER cũng nhảy tương tự click chuột
    const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    enterKey.on('down', onJumpTrigger);

    this.events.on('shutdown', () => {
      this.input.off('pointerdown', onJumpTrigger);
      enterKey.off('down', onJumpTrigger);
    });

    this.input.keyboard!.on('keydown-ESC', () => this.scene.start('MenuScene'));

    // ── 10. UI Overlays ───────────────────────────────────────────────────
    this.add.text(20, 20, '← ESC to Menu', {
      font: '14px Courier New, monospace',
      color: '#00e5ff',
      backgroundColor: '#111125dd',
      padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(10)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('MenuScene'));



    // ── 11. Initial HUD emit ──────────────────────────────────────────────
    this.game.events.emit('hud-update', {
      score: 0, hearts: 3, energy: 0, bossHp: 0, maxBossHp: 0,
      phase: 'map_preview', timeElapsed: 0,
      mapKey: 'hanoi_preview', mapName: 'Hà Nội (Preview)',
    });

    this.cameras.main.setScroll(this.camX, this.camY);
  }

  update(time: number, delta: number) {
    this.handleScrollKeys();

    if (!this.isPaused) {
      // Generate terrain ahead of player
      const ahead = this.player.x + 1500;
      this.generatePathway(ahead);
      this.cleanupOffscreenPlatforms();
    }

    // ── Player Physics ────────────────────────────────────────────────────
    this.updatePlayer(delta);

    // ── Parallax ─────────────────────────────────────────────────────────
    const cx = this.cameras.main.scrollX;
    this.cloudsOffset1 += 0.15;

    this.bgSkyLayer.tilePositionX      = cx * 0.01;
    this.cloudsLayer1.tilePositionX     = cx * 0.05 + this.cloudsOffset1;
    this.fgSceneryLayer2.tilePositionX  = cx * 1.60;



    this.emitHudState(time);
  }

  // ─── Player Movement (Jump Feel — giống GameScene) ────────────────────────
  private updatePlayer(delta: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const onGround = body.touching.down;
    const jumpKeyDown = this.keys.up.isDown || this.keys.space.isDown;
    const isCrouching = this.keys.down.isDown || this.keys.s.isDown;
    const justPressedJump = jumpKeyDown && !this.jumpKeyWasDown;
    this.jumpKeyWasDown = jumpKeyDown;

    // Auto-run (preview mode)
    this.player.setVelocityX(this.scrollSpeed * 60);

    // Coyote Time
    if (!onGround && body.velocity.y >= 0) {
      if (this.coyoteTimeLeft === 0 && this.jumpKeyWasDown === false) {
        this.coyoteTimeLeft = RUNNER_PHYSICS.COYOTE_TIME_MS;
      }
    } else {
      this.coyoteTimeLeft = 0;
    }
    if (this.coyoteTimeLeft > 0) this.coyoteTimeLeft -= delta;

    // Jump Buffer
    if (justPressedJump) this.jumpBufferTimeLeft = RUNNER_PHYSICS.JUMP_BUFFER_MS;
    if (this.jumpBufferTimeLeft > 0) this.jumpBufferTimeLeft -= delta;

    const canJump = onGround || this.coyoteTimeLeft > 0;
    const wantsJump = this.jumpBufferTimeLeft > 0;

    if (wantsJump && canJump) {
      this.player.setVelocityY(RUNNER_PHYSICS.jumpForce);
      this.player.play('male_jump', true);
      this.coyoteTimeLeft = 0;
      this.jumpBufferTimeLeft = 0;
    }

    // Variable height
    if (!jumpKeyDown && body.velocity.y < -50) {
      const dampFactor = Math.pow(RUNNER_PHYSICS.JUMP_DAMPING_RATIO, delta / 16.67);
      body.setVelocityY(body.velocity.y * dampFactor);
    }

    // Animation state machine
    if (isCrouching && onGround) {
      if (this.player.anims.currentAnim?.key !== 'male_crouch') {
        this.player.play('male_crouch');
        body.setSize(40, 80).setOffset(65, 124);
      }
    } else if (onGround) {
      if (this.player.anims.currentAnim?.key !== 'male_run') {
        this.player.play('male_run', true);
        body.setSize(40, 120).setOffset(65, 84);
      }
    } else {
      body.setSize(40, 120).setOffset(65, 84);
    }
  }

  private handleScrollKeys(): void {
    // LEFT/RIGHT: tăng/giảm scroll speed
    if (this.keys.left.isDown) this.scrollSpeed = Math.max(-10, this.scrollSpeed - 0.1);
    else if (this.keys.right.isDown) this.scrollSpeed = Math.min(25, this.scrollSpeed + 0.1);
  }

  // ─── Terrain Generation ───────────────────────────────────────────────────
  private generatePathway(targetX: number): void {
    while (this.nextPlatformX < targetX) {
      const platformWidth = Phaser.Math.Between(256, 640);

      // Visual road strip (TileSprite — sử dụng hanoi_ground_tiles)
      const visualPlatform = this.add.tileSprite(
        this.nextPlatformX, this.groundY, platformWidth, 40, 'hanoi_ground_tiles'
      ).setOrigin(0, 0).setDepth(5);
      
      visualPlatform.setTileScale(64 / 512, 40 / 286);
      visualPlatform.tilePositionX = this.nextPlatformX * 8;

      // Invisible physics block dưới visual
      const block = this.pathwayGroup.create(
        this.nextPlatformX + platformWidth / 2,
        this.groundY + 20,
        'hanoi_ground_tiles'
      );
      block.setDisplaySize(platformWidth, 40).setAlpha(0);
      block.body.updateFromGameObject();
      block.body.immovable = true;

      this.nextPlatformX += platformWidth;

      // Gap (pit)
      const gapWidth = Phaser.Math.Between(100, 220);
      this.nextPlatformX += gapWidth;
    }
  }

  private cleanupOffscreenPlatforms(): void {
    const leftEdge = this.cameras.main.scrollX - 200;
    this.pathwayGroup.getChildren().forEach((obj: any) => {
      if (obj.x + (obj.displayWidth ?? 64) < leftEdge) obj.destroy();
    });
  }



  private emitHudState(time: number): void {
    const roundedScore = Math.round(this.cameras.main.scrollX);
    const roundedTime = Math.round(time / 1000);
    const roundedEnergy = Math.floor(Math.min(100, (this.cameras.main.scrollX / 30) % 100));

    if (
      roundedScore === this.lastScore &&
      roundedTime === this.lastTimeElapsed &&
      roundedEnergy === this.lastEnergy
    ) return;

    this.lastScore = roundedScore;
    this.lastTimeElapsed = roundedTime;
    this.lastEnergy = roundedEnergy;

    this.game.events.emit('hud-update', {
      score: roundedScore, hearts: 3,
      energy: roundedEnergy, bossHp: 0, maxBossHp: 0,
      phase: 'map_preview', timeElapsed: roundedTime,
      mapKey: 'hanoi_preview', mapName: 'Hà Nội (Preview)',
    });
  }
}
