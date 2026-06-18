import Phaser from 'phaser';
import { MapKey, MAP_SCROLL_SPEEDS, RUNNER_PHYSICS, DIFFICULTY, getDifficultyState } from '../engine/constants';
import { hanoiMapConfig } from '../maps/hanoi';
import { tokyoMapConfig } from '../maps/tokyo';
import { danangMapConfig } from '../maps/danang';
import { MapConfig } from '../maps/MapConfig';

// Systems
import { GameState, createInitialGameState } from '../engine/GameState';
import { AudioSynth } from '../engine/AudioSynth';
import { ParallaxSystem } from '../maps/ParallaxSystem';
import { SpawnSystem } from '../maps/SpawnSystem';
import { PlayerSystem } from '../entities/PlayerSystem';
import { BossSystem } from '../entities/BossSystem';
import { HudSystem } from '../engine/HudSystem';

// ─── GameScene (Coordinator) ──────────────────────────────────────────────────
// Scene này KHÔNG chứa game logic. Nó chỉ:
//   1. Khởi tạo và kết nối các System với nhau
//   2. Setup physics colliders/overlaps (dùng arrow functions từ mỗi System)
//   3. Gọi system.update() theo đúng thứ tự mỗi frame
//   4. Điều phối luồng respawn (liên quan nhiều system)
//
// Mỗi concern nghiệp vụ đều nằm trong System tương ứng:
//   AudioSynth    → Web Audio SFX
//   ParallaxSystem → 6 tầng TileSprite cuộn
//   SpawnSystem   → Sinh terrain, entities, culling viewport
//   PlayerSystem  → Di chuyển, Jump Feel, collision handlers
//   BossSystem    → Trigger, AI attack, defeat
//   HudSystem     → emit HUD, tint, title text, checkpoint popup
const BOSS_DELAY_SEC = 60; // Boss xuất hiện sau 1 phút (60 giây)

export default class GameScene extends Phaser.Scene {
  // ── New Gameplay Flow Variables ──────────────────────────────────────────
  private isPlaying = false;
  private clickToStartText!: Phaser.GameObjects.Text;
  private progressBarGraphics!: Phaser.GameObjects.Graphics;
  // warningText đã được xử lý bởi React HUD BossTimerBar — không dùng canvas nữa
  private bossHpBarGraphics!: Phaser.GameObjects.Graphics;
  private bossHpText!: Phaser.GameObjects.Text;
  private hasStartedSequence = false;

  // ── Config ────────────────────────────────────────────────────────────────
  private mapConfig: MapConfig = hanoiMapConfig;

  // ── Shared State ──────────────────────────────────────────────────────────
  private state: GameState = createInitialGameState();

  // ── Systems ───────────────────────────────────────────────────────────────
  private audio = new AudioSynth();
  private parallax = new ParallaxSystem();
  private spawn = new SpawnSystem();
  private playerSys = new PlayerSystem();
  private bossSys = new BossSystem();
  private hud = new HudSystem();

  // ── Physics Groups ────────────────────────────────────────────────────────
  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;
  private flasksGroup!: Phaser.Physics.Arcade.Group;
  private powerupsGroup!: Phaser.Physics.Arcade.Group;
  private enemiesGroup!: Phaser.Physics.Arcade.Group;
  private obstaclesGroup!: Phaser.Physics.Arcade.Group;
  private bossProjectiles!: Phaser.Physics.Arcade.Group;
  private enemyBulletsGroup!: Phaser.Physics.Arcade.Group; // Đạn bắn từ lính thường

  // ── Input ─────────────────────────────────────────────────────────────────
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    z: Phaser.Input.Keyboard.Key;
  };

  // ── Scrolling ─────────────────────────────────────────────────────────────
  private virtualScrollX = 0;

  // ── Checkpoints ───────────────────────────────────────────────────────────
  private checkpoints: Array<{
    x: number;
    y: number;
    activated: boolean;
    graphics: Phaser.GameObjects.Graphics;
    textObj: Phaser.GameObjects.Text;
  }> = [];

  // ── UI ────────────────────────────────────────────────────────────────────
  private titleTextObject: Phaser.GameObjects.Text | null = null;

  // ── Cached Callbacks (để tránh tạo closure mới mỗi frame) ────────────────
  private cbHudEmit!: () => void;
  private cbRestoreTint!: () => void;

  constructor() {
    super('GameScene');
  }

  // ─── init ─────────────────────────────────────────────────────────────────
  // Chạy trước create(), reset state và load map config.
  init(data?: { mapKey?: MapKey; map?: string }): void {
    this.state = createInitialGameState();
    this.state.activeSkin = this.registry.get('activeSkin') || 'skin_default';
    this.state.activeTitle = this.registry.get('activeTitle') || '';
    this.state.activeGender = this.registry.get('activeGender') || 'male';

    let key: string = 'hanoi';
    if (data?.map) {
      if (data.map === 'Forest') {
        key = 'hanoi';
      } else if (data.map === 'City') {
        key = 'tokyo';
      } else {
        key = data.map;
      }
    } else if (data?.mapKey) {
      key = data.mapKey;
    }

    this.mapConfig =
      key === 'tokyo' ? tokyoMapConfig :
      key === 'danang' ? danangMapConfig :
      hanoiMapConfig;
  }

  // ─── create ───────────────────────────────────────────────────────────────
  create(): void {
    const { width, height } = this.cameras.main;

    // 1. Parallax backgrounds
    this.parallax.create(this, width, height, this.mapConfig);

    // 2. Physics groups
    this.groundGroup       = this.physics.add.staticGroup();
    this.flasksGroup       = this.physics.add.group({ allowGravity: false });
    this.powerupsGroup     = this.physics.add.group({ allowGravity: false });
    this.enemiesGroup      = this.physics.add.group({ gravityY: 0 });
    this.obstaclesGroup    = this.physics.add.group();
    this.bossProjectiles   = this.physics.add.group({ allowGravity: false });
    this.enemyBulletsGroup = this.physics.add.group({ allowGravity: false }); // Đạn lính thường

    // 3. HUD system
    this.hud.init(this);

    // 4. Cache callbacks — tạo một lần, dùng lại mỗi frame
    this.cbHudEmit = () => this.hud.emit(this.state, this.mapConfig);
    this.cbRestoreTint = () =>
      this.hud.restoreMapTint(this.playerSys.sprite, this.state, this.mapConfig);

    // 5. Player system — nhận callbacks thay vì tham chiếu đến scene
    this.playerSys.create(this, this.state, this.audio, this.cbRestoreTint, this.cbHudEmit);

    // Spawn player at -50 initially on the ground with active gravity
    const playerBody = this.playerSys.sprite.body as Phaser.Physics.Arcade.Body;
    playerBody.setAllowGravity(true);
    playerBody.setGravityY(800);
    this.playerSys.sprite.setPosition(-50, 200);
    this.playerSys.sprite.setVelocity(0, 0);

    // 6. Spawn system — truyền mapConfig để floating platform biết map nào
    this.spawn.init(this, {
      ground: this.groundGroup,
      flasks: this.flasksGroup,
      powerups: this.powerupsGroup,
      enemies: this.enemiesGroup,
      obstacles: this.obstaclesGroup,
      enemyBullets: this.enemyBulletsGroup,
    }, this.mapConfig);

    // 7. Boss system
    this.bossSys.init(
      this,
      this.state,
      this.audio,
      this.mapConfig,
      this.playerSys.projectiles,
      this.bossProjectiles,
      this.cbHudEmit
    );

    // 8. Physics — Colliders (player / ground / enemies)
    this.physics.add.collider(this.playerSys.sprite, this.groundGroup);
    this.physics.add.collider(this.enemiesGroup, this.groundGroup);
    this.physics.add.collider(this.obstaclesGroup, this.groundGroup);

    // 9. Physics — Overlaps (Option B: arrow functions trực tiếp từ system)
    this.physics.add.overlap(
      this.playerSys.sprite, this.flasksGroup,
      this.playerSys.onCollectFlask
    );
    this.physics.add.overlap(
      this.playerSys.sprite, this.powerupsGroup,
      this.playerSys.onCollectPowerup
    );
    this.physics.add.overlap(
      this.playerSys.sprite, this.enemiesGroup,
      this.playerSys.onHitEnemy
    );
    this.physics.add.overlap(
      this.playerSys.sprite, this.obstaclesGroup,
      this.playerSys.onHitObstacle
    );
    this.physics.add.overlap(
      this.playerSys.projectiles, this.enemiesGroup,
      this.playerSys.onProjectileHitEnemy
    );
    this.physics.add.overlap(
      this.playerSys.projectiles, this.bossProjectiles,
      this.playerSys.onProjectileHitBossProjectile
    );
    this.physics.add.overlap(
      this.playerSys.sprite, this.bossProjectiles,
      this.playerSys.onHitBossProjectile
    );

    // Đạn lính chạm player
    this.physics.add.overlap(
      this.playerSys.sprite, this.enemyBulletsGroup,
      this.playerSys.onHitEnemyBullet
    );
    // Đạn player có thể hủy đạn lính
    this.physics.add.overlap(
      this.playerSys.projectiles, this.enemyBulletsGroup,
      (_pProj: any, _eBullet: any) => {
        _pProj.destroy();
        _eBullet.destroy();
      }
    );

    // 10. Title text
    this.titleTextObject = this.add.text(150, 250, '', {
      font: '900 10px Courier New, monospace',
      color: '#00e5ff',
      backgroundColor: '#111125dd',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5, 0.5).setDepth(10);
    this.hud.updateTitleText(this.titleTextObject, this.state.activeTitle);

    // Click to start UI
    this.clickToStartText = this.add.text(width / 2, height / 2, 'CLICK OR PRESS ENTER TO START', {
      font: '800 32px Courier New, monospace',
      color: '#00e5ff',
      backgroundColor: '#111125dd',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setDepth(100);
    
    this.tweens.add({
      targets: this.clickToStartText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      loop: -1
    });

    this.progressBarGraphics = this.add.graphics().setDepth(100).setVisible(false); // Ẩn: đã dùng React HUD
    this.bossHpBarGraphics = this.add.graphics().setDepth(100);
    
    // warningText không còn dùng — React BossTimerBar thay thế

    this.bossHpText = this.add.text(0, 0, '', {
      font: '900 12px Courier New, monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(101).setVisible(false);

    // Register click/key listeners to start sequence
    const triggerStart = () => this.startGameSequence();
    this.input.once('pointerdown', triggerStart);
    this.input.keyboard?.once('keydown-ENTER', triggerStart);

    // 11. Input keys
    this.keys = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      w:     this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      s:     this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      a:     this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      d:     this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      space: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      z:     this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
    };

    // 12. Camera + world bounds
    this.cameras.main.setBounds(0, 0, 99999, height);
    this.physics.world.setBounds(0, 0, 99999, height);
    this.physics.world.setBoundsCollision(true, true, true, false);

    // Pre-generate terrain up to X = 1024 so player has ground in intro
    this.spawn.generateTerrain(1024, this.state, this.mapConfig);

    if (this.state.currentPhase === 'intro') {
      this.cameras.main.stopFollow();
      this.cameras.main.scrollX = 0;
    } else {
      this.cameras.main.stopFollow();
      const width = this.cameras.main.width;
      this.cameras.main.scrollX = Math.max(0, this.playerSys.sprite.x - width * 0.4);
    }

    // Speed management timer removed to keep game speed fixed
    this.state.gameSpeed = 1.5; // Fixed speed for the runner phase

    // 13. On-the-fly customization updates (từ store)
    this.setupCustomizationListeners();

    // 14. Debug hooks (chỉ dùng khi dev/QA)
    this.setupDebugHooks();

    // Initialize visual checkpoint flags
    this.initCheckpoints();

    // Initial HUD emit
    this.cbHudEmit();
  }

  // ─── update ───────────────────────────────────────────────────────────────
  update(time: number, delta: number): void {
    const state = this.state;
    const { width } = this.cameras.main;

    // Early exit nếu đã chết
    if (state.hearts <= 0) {
      this.titleTextObject?.setVisible(false);
      this.progressBarGraphics.clear();
      this.bossHpBarGraphics.clear();
      this.bossHpText.setVisible(false);
      return;
    }

    if (state.currentPhase === 'map_clear') {
      this.titleTextObject?.setVisible(false);
      this.progressBarGraphics.clear();
      this.bossHpBarGraphics.clear();
      this.bossHpText.setVisible(false);
    }

    // Tích lũy thời gian sinh tồn
    if (state.currentPhase !== 'map_clear' && this.isPlaying) {
      state.gameTimeElapsed += delta / 1000;
    }

    // Handle phases
    if (state.currentPhase === 'intro') {
      this.cameras.main.scrollX = 0;
      this.virtualScrollX = 0;
      state.distance = this.playerSys.sprite.x;
      this.playerSys.relativeX = this.playerSys.sprite.x - this.cameras.main.scrollX;
    } else if (state.currentPhase === 'runner') {
      // Cuộn camera theo tốc độ từng map (px/s) nhân với speedMultiplier
      const mapKey = (this.mapConfig.mapKey as MapKey) ?? 'hanoi';
      const basePxPerSec = MAP_SCROLL_SPEEDS[mapKey];
      const scrollSpeed = (basePxPerSec * state.timeSpeedMultiplier * (delta / 1000));
      this.cameras.main.scrollX += scrollSpeed;
      this.virtualScrollX = this.cameras.main.scrollX;
      state.distance = this.playerSys.sprite.x;

      // Lock player X at relativeX instead of static 40% screen width
      this.playerSys.sprite.x = this.cameras.main.scrollX + this.playerSys.relativeX;

      // Dọn dẹp activePitRanges đã qua viewport để tránh tốn bộ nhớ
      const camLeft = this.cameras.main.scrollX;
      state.activePitRanges = state.activePitRanges.filter(r => r.end > camLeft - 300);

      this.spawn.generateTerrain(this.playerSys.sprite.x + 1024, state, this.mapConfig);
      this.spawn.generatePatterns(this.playerSys.sprite.x, state, this.mapConfig);
      
      // Boss timer check — chỉ trigger boss; progress bar đã do React HUD xử lý
      if (state.gameTimeElapsed >= BOSS_DELAY_SEC) {
        this.progressBarGraphics.clear();
        
        state.bossTriggerX = this.playerSys.sprite.x;
        this.bossSys.checkTrigger(this.playerSys.sprite);
      }
      this.checkIntermediateCheckpoints();
    } else if (state.currentPhase === 'boss' || state.currentPhase === 'boss_intro') {
      this.virtualScrollX = this.cameras.main.scrollX;
      state.distance = this.playerSys.sprite.x;

      // Lock player X at relativeX for boss fight, synchronize during boss intro tween
      if (state.currentPhase === 'boss') {
        this.playerSys.sprite.x = this.cameras.main.scrollX + this.playerSys.relativeX;
      } else {
        this.playerSys.relativeX = this.playerSys.sprite.x - this.cameras.main.scrollX;
      }

      this.progressBarGraphics.clear();
    }

    // Cập nhật player
    this.playerSys.update(time, delta, this.keys);

    // ── Enemy AI: Di Chuyển + Bắn Đạn ──────────────────────────────────────
    const camScrollX = this.cameras.main.scrollX;
    // width đã khai báo ở đầu update() — tái sử dụng ở đây
    const enemyChildren = this.enemiesGroup.getChildren() as Phaser.Physics.Arcade.Sprite[];
    const playerX = this.playerSys.sprite.x;
    const playerY = this.playerSys.sprite.y;

    // Tính độ khó hiện tại để scale tốc độ/interval đạn
    const diffTier = getDifficultyState(state.score).tier;
    const bulletSpeedMult = 1 + diffTier * DIFFICULTY.ENEMY_SHOOT_SPEED_PER_TIER;

    let activeCount = 0;
    for (const enemy of enemyChildren) {
      if (!enemy || !enemy.active || !enemy.body) continue;
      const distToCam = enemy.x - camScrollX;
      // Chỉ xử lý enemy trong viewport + buffer 200px
      if (distToCam < -100 || distToCam > width + 200) continue;
      if (activeCount >= RUNNER_PHYSICS.maxEnemiesOnScreen) break;
      activeCount++;

      // ── Di chuyển về phía player ────────────────────────────────────────
      const px = playerX + (enemy.getData('targetOffsetX') || 0);
      const py = playerY + (enemy.getData('targetOffsetY') || 0);
      const speed = enemy.getData('speed') || 50;
      const dx = px - enemy.x;
      const dy = py - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (enemy.getData('kind') === 'flying_bug') {
        if (dist > 5) {
          const angle = Math.atan2(dy, dx);
          (enemy.body as Phaser.Physics.Arcade.Body).setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
          );
        } else {
          (enemy.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        }
      } else {
        // Ground bug chỉ di chuyển theo X, giữ nguyên velo Y (gravity)
        const directionX = dx > 0 ? 1 : -1;
        (enemy.body as Phaser.Physics.Arcade.Body).setVelocityX(directionX * speed);
      }

      // ── Bắn Đạn Về Phía Player ──────────────────────────────────────────
      if (!enemy.getData('canShoot')) continue;
      const nextShootT = enemy.getData('nextShootTime') || 0;
      if (time < nextShootT) continue;

      // Chỉ bắn nếu player ở bên trái (trong tầm nhìn hợp lý)
      const distToPlayer = Math.abs(enemy.x - playerX);
      if (distToPlayer > 700) continue; // Lính chỉ bắn khi player trong 700px

      const shootInterval = enemy.getData('shootInterval') || RUNNER_PHYSICS.enemyShootIntervalBase;
      // Cập nhật lần bắn tiếp theo (±20% jitter để không đồng loạt)
      enemy.setData('nextShootTime', time + shootInterval * (0.8 + Math.random() * 0.4));

      // Tạo đạn nhắm về phía player
      const bullet = this.enemyBulletsGroup.create(enemy.x, enemy.y, 'security_voltage') as Phaser.Physics.Arcade.Sprite;
      if (!bullet) continue;
      bullet.setDisplaySize(14, 14).setTint(0xffaa00).setDepth(8);

      const shootAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, playerX, playerY);
      const bSpeed = RUNNER_PHYSICS.enemyBulletSpeed * bulletSpeedMult;
      this.physics.velocityFromAngle(Phaser.Math.RadToDeg(shootAngle), bSpeed, (bullet.body as Phaser.Physics.Arcade.Body).velocity);
      (bullet.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
      // Xoay đạn khi bay để nhận diện rõ hơn
      (bullet.body as Phaser.Physics.Arcade.Body).setAngularVelocity(300);
    }

    // Cull đạn lính ra ngoài viewport (cả biên trái lẫn biên phải)
    this.enemyBulletsGroup.getChildren().forEach((b: any) => {
      if (b.active && (b.x < camScrollX - 150 || b.x > camScrollX + width + 200 || b.y > 560 || b.y < -50)) {
        b.destroy();
      }
    });

    // Cập nhật vị trí title text
    if (this.titleTextObject?.visible && state.currentPhase !== 'map_clear') {
      this.titleTextObject.setPosition(
        this.playerSys.sprite.x,
        this.playerSys.sprite.y - 45
      );
    }

    // Update parallax layer scrolling
    this.parallax.update(this.virtualScrollX);

    // Render Boss HP bar
    this.drawBossHpBar();

    // Culling entities ngoài viewport
    this.spawn.cullOffscreen(this.cameras.main.scrollX - 200);

    // Hủy đạn của player bay vượt qua biên phải của màn hình
    const camRight = this.cameras.main.scrollX + width;
    this.playerSys.projectiles.getChildren().forEach((proj: any) => {
      if (proj.active && proj.x > camRight + 100) {
        proj.destroy();
      }
    });

    // Boss AI attack
    if (state.currentPhase === 'boss') {
      this.bossSys.handleAttack(time, this.playerSys.sprite.x, this.playerSys.sprite.y);
    }

    // Xóa buff đã hết hạn
    let buffExpired = false;
    if (state.shieldUntil > 0 && state.shieldUntil <= time) { state.shieldUntil = 0; buffExpired = true; }
    if (state.wingsUntil > 0  && state.wingsUntil <= time)  { state.wingsUntil = 0;  buffExpired = true; }
    if (buffExpired) this.cbRestoreTint();

    // Emit HUD
    this.cbHudEmit();
  }

  private startGameSequence() {
    if (this.hasStartedSequence) return;
    this.hasStartedSequence = true;

    // Clean up input listeners
    this.input.off('pointerdown');
    this.input.keyboard?.off('keydown-ENTER');
    this.input.keyboard?.off('keydown');

    this.clickToStartText.setVisible(false);

    const width = this.cameras.main.width;
    this.playerSys.sprite.play(`${this.state.activeGender}_run`);

    this.tweens.add({
      targets: this.playerSys.sprite,
      x: width * 0.4,
      duration: 1500,
      ease: 'Power1',
      onComplete: () => {
        this.isPlaying = true;
        this.state.currentPhase = 'runner';
        this.playerSys.resetJumpState(this.keys);
        this.state.gameTimeElapsed = 0;
      }
    });
  }

  private drawProgressBar() {
    this.progressBarGraphics.clear();
    const width = this.scale.width;
    const barWidth = 400;
    const barHeight = 20;
    const barX = width / 2 - barWidth / 2;
    const barY = 25;

    // Border
    this.progressBarGraphics.lineStyle(2, 0x00e5ff, 1);
    this.progressBarGraphics.strokeRoundedRect(barX, barY, barWidth, barHeight, 5);

    // Progress Core (Reverse ratio - vơi dần từ 100% về 0%)
    const ratio = Math.max(0, 1 - (this.state.gameTimeElapsed / BOSS_DELAY_SEC));
    if (ratio > 0) {
      const timeLeft = BOSS_DELAY_SEC - this.state.gameTimeElapsed;
      let barColor = 0x00e5ff; // Mặc định xanh neon
      let alpha = 0.8;

      if (timeLeft <= 10) {
        // 10 giây cuối: Đổi sang đỏ nhấp nháy cảnh báo
        barColor = 0xff3b30;
        alpha = 0.4 + 0.5 * Math.abs(Math.sin(this.time.now / 150));
      }

      this.progressBarGraphics.fillStyle(barColor, alpha);
      this.progressBarGraphics.fillRoundedRect(barX + 3, barY + 3, (barWidth - 6) * ratio, barHeight - 6, 3);
    }
  }

  private drawBossHpBar() {
    this.bossHpBarGraphics.clear();
    const state = this.state;
    if ((state.currentPhase === 'boss' || state.currentPhase === 'boss_intro') && this.bossSys.sprite && this.bossSys.sprite.active) {
      const boss = this.bossSys.sprite;
      const barWidth = 120;
      const barHeight = 10;
      const barX = boss.x - barWidth / 2;
      const barY = boss.y - 80;

      // Red bg
      this.bossHpBarGraphics.fillStyle(0xff3b30, 0.4);
      this.bossHpBarGraphics.fillRect(barX, barY, barWidth, barHeight);

      // Green remaining
      const ratio = Math.max(0, state.bossHp / state.maxBossHp);
      this.bossHpBarGraphics.fillStyle(0x34c759, 1);
      this.bossHpBarGraphics.fillRect(barX, barY, barWidth * ratio, barHeight);

      // White border
      this.bossHpBarGraphics.lineStyle(1.5, 0xffffff, 1);
      this.bossHpBarGraphics.strokeRect(barX, barY, barWidth, barHeight);

      // Cập nhật text hiển thị số HP
      this.bossHpText.setText(`${state.bossHp}/${state.maxBossHp}`)
        .setPosition(boss.x, boss.y - 95)
        .setVisible(true);
    } else {
      this.bossHpText.setVisible(false);
    }
  }

  // ─── Checkpoints ──────────────────────────────────────────────────────────
  private checkIntermediateCheckpoints(): void {
    const { state } = this;
    const px = this.playerSys.sprite.x;
    if (px >= 2000 && state.checkpointX < 2000) {
      this.saveCheckpoint(2000);
    } else if (px >= 4000 && state.checkpointX < 4000) {
      this.saveCheckpoint(4000);
    }
  }

  private saveCheckpoint(x: number): void {
    const { state } = this;
    state.checkpointX = x;
    state.checkpointScore = state.score;
    state.checkpointEnergy = state.kaizenEnergy;
    state.checkpointFlasks = state.flasksCollected;
    state.checkpointGroundBugs = state.groundBugsDefeated;
    state.checkpointFlyingBugs = state.flyingBugsDefeated;
    state.checkpointTime = state.gameTimeElapsed; // Lưu thời gian sinh tồn tại checkpoint
    this.hud.showCheckpoint(this.playerSys.sprite.x);

    // Update visual checkpoints
    this.checkpoints.forEach(cp => {
      if (cp.x === x && !cp.activated) {
        cp.activated = true;
        this.drawCheckpointFlag(cp.graphics, true);
        cp.textObj.setText('ACTIVE').setColor('#00ff87');
        // Play powerup sound when checkpoint is activated
        this.audio.playPowerup();
      }
    });
  }

  // ─── Respawn (Public) ─────────────────────────────────────────────────────
  // Được gọi từ React UI khi player nhấn nút respawn.
  // Điều phối nhiều system — đây là lý do nó nằm trong GameScene coordinator.
  public respawn(fromBeginning = false): void {
    const { state } = this;

    // Hủy các tween chuyển động đang chạy để tránh xung đột vị trí
    if (this.playerSys && this.playerSys.sprite) {
      this.tweens.killTweensOf(this.playerSys.sprite);
      this.playerSys.sprite.setAlpha(1);
    }
    if (this.bossSys && this.bossSys.sprite) {
      this.tweens.killTweensOf(this.bossSys.sprite);
      this.bossSys.sprite.setAlpha(1);
      this.bossSys.sprite.setAngle(0);
    }

    if (fromBeginning) {
      state.checkpointX = 0;
      state.checkpointScore = 0;
      state.checkpointEnergy = 0;
      state.checkpointFlasks = 0;
      state.checkpointGroundBugs = 0;
      state.checkpointFlyingBugs = 0;
      state.checkpointTime = 0;
      state.deathCount = 0;
      state.score = 0;
      state.kaizenEnergy = 0;
      state.flasksCollected = 0;
      state.groundBugsDefeated = 0;
      state.flyingBugsDefeated = 0;
      state.hearts = 3;
      state.isBossFight = false;
      state.bossActive = false;
      state.bossHp = 0;
      state.maxBossHp = 0;
      state.bossTriggerX = 10000;
      state.gameTimeElapsed = 0;
    }

    const isAtBoss = state.isBossFight;

    // Reset scores/speed về checkpoint
    state.score = state.checkpointScore;
    state.kaizenEnergy = state.checkpointEnergy;
    state.flasksCollected = state.checkpointFlasks;
    state.groundBugsDefeated = state.checkpointGroundBugs;
    state.flyingBugsDefeated = state.checkpointFlyingBugs;
    state.gameTimeElapsed = state.checkpointTime || 0;
    state.hearts = 3;
    state.gameSpeed = 1.5;
    state.distance = state.checkpointX;
 
    // Xóa toàn bộ entities (kể cả đạn lính)
    this.enemiesGroup.clear(true, true);
    this.obstaclesGroup.clear(true, true);
    this.flasksGroup.clear(true, true);
    this.powerupsGroup.clear(true, true);
    this.playerSys.projectiles.clear(true, true);
    this.bossProjectiles.clear(true, true);
    this.enemyBulletsGroup.clear(true, true); // Dọn đạn lính còn bay
    state.activePitRanges = [];

 
    // Player respawn
    this.playerSys.respawn({
      isAtBoss,
      bossTriggerX: state.bossTriggerX,
      checkpointX: state.checkpointX,
    });
 
    if (isAtBoss) {
      // Respawn trong boss phase
      this.isPlaying = true;
      state.currentPhase = 'boss';
      state.isBossFight = true;
      this.bossSys.respawn(state.bossTriggerX);
 
      // Rebuild terrain dưới boss arena
      this.groundGroup.clear(true, true);
      const alignX = Math.floor((state.bossTriggerX - 512) / 64) * 64;
      this.spawn.reset({ groundX: Math.max(0, alignX) });
      this.spawn.generateTerrain(this.playerSys.sprite.x + 1024, state, this.mapConfig);
 
      this.cameras.main.stopFollow();
      this.cameras.main.scrollX = state.bossTriggerX;
      this.virtualScrollX = state.bossTriggerX;
    } else {
      // Respawn tại runner/intro checkpoint
      state.isBossFight = false;
      this.bossSys.clearSprite(); // Hủy boss nếu đang tồn tại
 
      this.groundGroup.clear(true, true);
      const alignX = Math.floor((state.checkpointX - 512) / 64) * 64;
      this.spawn.reset({
        groundX: state.checkpointX === 0 ? -128 : Math.max(0, alignX),
        patternX: state.checkpointX + 600,
      });
 
      // Pre-generate terrain up to X = 1024 if starting at 0
      this.spawn.generateTerrain(this.playerSys.sprite.x + 1024, state, this.mapConfig);
 
      if (state.checkpointX === 0) {
        this.isPlaying = false;
        this.hasStartedSequence = false;
        this.clickToStartText.setVisible(true);
        this.bossHpText.setVisible(false);
        state.currentPhase = 'intro';
        this.cameras.main.stopFollow();
        this.cameras.main.scrollX = 0;
        this.virtualScrollX = 0;

        // Reposition player at start with active gravity
        const playerBody = this.playerSys.sprite.body as Phaser.Physics.Arcade.Body;
        playerBody.setAllowGravity(true);
        playerBody.setGravityY(800);
        this.playerSys.sprite.setPosition(-50, 200).setVelocity(0, 0);

        // Re-register listeners
        const triggerStart = () => this.startGameSequence();
        this.input.once('pointerdown', triggerStart);
        this.input.keyboard?.once('keydown-ENTER', triggerStart);
      } else {
        this.isPlaying = true;
        state.currentPhase = 'runner';
        this.cameras.main.stopFollow();
        const spawnX = state.checkpointX + 100;
        const width = this.cameras.main.width;
        this.cameras.main.scrollX = Math.max(0, spawnX - width * 0.4);
        this.virtualScrollX = this.cameras.main.scrollX;
      }
    }

    // Sync visual checkpoint flags activation state
    this.checkpoints.forEach(cp => {
      const activated = state.checkpointX >= cp.x;
      cp.activated = activated;
      this.drawCheckpointFlag(cp.graphics, activated);
      cp.textObj.setText(activated ? 'ACTIVE' : 'CHECKPOINT')
        .setColor(activated ? '#00ff87' : '#ff3b30');
    });

    this.hud.resetTracking();
    this.cbHudEmit();
  }

  // ─── Customization Listeners ──────────────────────────────────────────────
  // Lắng nghe cập nhật skin/title/gender từ store React (on-the-fly).
  private setupCustomizationListeners(): void {
    const onSkinUpdate = (skin: string) => {
      this.state.activeSkin = skin;
      this.cbRestoreTint();
    };
    const onTitleUpdate = (title: string) => {
      this.state.activeTitle = title;
      this.hud.updateTitleText(this.titleTextObject, title);
    };
    const onGenderUpdate = (gender: string) => {
      this.state.activeGender = gender;
      this.playerSys.sprite.setTexture(`mascot_${gender}_run`);
      const parts = this.playerSys.sprite.anims.currentAnim?.key?.split('_') ?? [];
      const stateName = parts[parts.length - 1] || 'run';
      this.playerSys.sprite.play(`${gender}_${stateName}`, true);
    };

    this.game.events.on('skin-update', onSkinUpdate);
    this.game.events.on('title-update', onTitleUpdate);
    this.game.events.on('gender-update', onGenderUpdate);

    // Cleanup khi scene bị shutdown — tránh memory leak
    this.events.on('shutdown', () => {
      this.game.events.off('skin-update', onSkinUpdate);
      this.game.events.off('title-update', onTitleUpdate);
      this.game.events.off('gender-update', onGenderUpdate);
    });
  }

  // ─── Debug Hooks ──────────────────────────────────────────────────────────
  // Expose window.gameScene và helper functions cho QA / dev testing.
  private setupDebugHooks(): void {
    const w = window as any;
    w.gameScene = this;

    w.render_game_to_text = () => {
      const pBody = this.playerSys.sprite.body as Phaser.Physics.Arcade.Body;
      return JSON.stringify({
        phase: this.state.currentPhase,
        camera: {
          scrollX: Math.round(this.cameras.main.scrollX),
          scrollY: Math.round(this.cameras.main.scrollY),
        },
        player: {
          x: Math.round(this.playerSys.sprite.x),
          y: Math.round(this.playerSys.sprite.y),
          velocityX: pBody ? Math.round(pBody.velocity.x) : 0,
          velocityY: pBody ? Math.round(pBody.velocity.y) : 0,
          blocked: pBody?.blocked,
          touching: pBody?.touching,
          hearts: this.state.hearts,
          energy: this.state.kaizenEnergy,
          isKaizen: this.state.isKaizenMode,
          isFlying: this.state.wingsUntil > this.time.now,
          hasShield: this.state.shieldUntil > this.time.now,
        },
        boss: this.bossSys.sprite
          ? { x: Math.round(this.bossSys.sprite.x), hp: this.state.bossHp }
          : null,
        score: this.state.score,
        groundBlocks: this.groundGroup.getChildren().length,
        enemies: this.enemiesGroup.getChildren().map((e: any) => ({
          x: Math.round(e.x),
          y: Math.round(e.y),
          active: e.active,
        })),
      });
    };

    w.advanceTime = (ms: number) => {
      const steps = Math.max(1, Math.round(ms / (1000 / 60)));
      for (let i = 0; i < steps; i++) {
        this.update(this.time.now, 1000 / 60);
      }
    };
  }

  // ─── Visual Checkpoints Helper Methods ─────────────────────────────────────
  private initCheckpoints(): void {
    // Clear old if any
    this.checkpoints.forEach(cp => {
      cp.graphics.destroy();
      cp.textObj.destroy();
    });
    this.checkpoints = [];

    const cpPositions = [2000, 4000];
    const groundY = 350; // Ground surface Y (GROUND_Y 370 - block height 40/2 = 350)

    cpPositions.forEach(x => {
      const graphics = this.add.graphics().setDepth(4);
      graphics.setPosition(x, groundY);
      
      const textObj = this.add.text(x, groundY - 110, 'CHECKPOINT', {
        font: '800 10px Courier New, monospace',
        color: '#ff3b30',
        backgroundColor: '#111125dd',
        padding: { x: 4, y: 2 }
      }).setOrigin(0.5).setDepth(4);

      this.checkpoints.push({
        x,
        y: groundY,
        activated: false,
        graphics,
        textObj
      });
      
      this.drawCheckpointFlag(graphics, false);
    });
  }

  private drawCheckpointFlag(graphics: Phaser.GameObjects.Graphics, activated: boolean): void {
    graphics.clear();
    
    // Pole (cột cờ)
    graphics.lineStyle(3, 0x64748b, 1);
    graphics.lineBetween(0, 0, 0, -80); // Cột cao 80px từ mặt đất
    
    // Base (bệ đỡ)
    graphics.fillStyle(0x334155, 1);
    graphics.fillTriangle(-12, 0, 12, 0, 0, -8);
    
    // Flag cloth (lá cờ)
    const color = activated ? 0x00ff87 : 0xff3b30; // Green if active, Red if not
    
    graphics.fillStyle(color, 1);
    graphics.fillTriangle(0, -80, 25, -68, 0, -56);
    
    // Light bulb top (đèn tín hiệu trên đỉnh cột cờ)
    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, -82, 4);
    
    // Draw some glow if activated
    if (activated) {
      graphics.lineStyle(1, 0x00ff87, 0.5);
      graphics.strokeCircle(0, -82, 8);
    }
  }
}
