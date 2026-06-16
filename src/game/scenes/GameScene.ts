import Phaser from 'phaser';
import { MapKey } from '../constants';
import { hanoiMapConfig } from '../maps/hanoi';
import { tokyoMapConfig } from '../maps/tokyo';
import { danangMapConfig } from '../maps/danang';
import { MapConfig } from '../maps/MapConfig';

// Systems
import { GameState, createInitialGameState } from '../systems/GameState';
import { AudioSynth } from '../systems/AudioSynth';
import { ParallaxSystem } from '../systems/ParallaxSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { PlayerSystem } from '../systems/PlayerSystem';
import { BossSystem } from '../systems/BossSystem';
import { HudSystem } from '../systems/HudSystem';

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
  private warningText!: Phaser.GameObjects.Text;
  private warningTween: Phaser.Tweens.Tween | null = null;
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

  // ── Input ─────────────────────────────────────────────────────────────────
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    z: Phaser.Input.Keyboard.Key;
  };

  // ── Scrolling ─────────────────────────────────────────────────────────────
  private virtualScrollX = 0;

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
    this.groundGroup    = this.physics.add.staticGroup();
    this.flasksGroup    = this.physics.add.group({ allowGravity: false });
    this.powerupsGroup  = this.physics.add.group({ allowGravity: false });
    this.enemiesGroup   = this.physics.add.group({ gravityY: 0 });
    this.obstaclesGroup = this.physics.add.group();
    this.bossProjectiles = this.physics.add.group({ allowGravity: false });

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

    // 6. Spawn system
    this.spawn.init(this, {
      ground: this.groundGroup,
      flasks: this.flasksGroup,
      powerups: this.powerupsGroup,
      enemies: this.enemiesGroup,
      obstacles: this.obstaclesGroup,
    });

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

    // 10. Title text
    this.titleTextObject = this.add.text(150, 250, '', {
      font: '900 10px Courier New, monospace',
      color: '#00e5ff',
      backgroundColor: '#111125dd',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5, 0.5).setDepth(10);
    this.hud.updateTitleText(this.titleTextObject, this.state.activeTitle);

    // Click to start UI
    this.clickToStartText = this.add.text(width / 2, height / 2, 'CLICK TO START', {
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

    this.progressBarGraphics = this.add.graphics().setDepth(100);
    this.bossHpBarGraphics = this.add.graphics().setDepth(100);
    
    this.warningText = this.add.text(width / 2, height / 2, 'WARNING: BOSS APPROACHING!', {
      font: '900 36px Courier New, monospace',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(100).setVisible(false);

    this.bossHpText = this.add.text(0, 0, '', {
      font: '900 12px Courier New, monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(101).setVisible(false);

    // Register click/key listeners to start sequence
    const triggerStart = () => this.startGameSequence();
    this.input.once('pointerdown', triggerStart);
    this.input.keyboard?.once('keydown', triggerStart);

    // 11. Input keys
    this.keys = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      w:     this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      s:     this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
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
      this.cameras.main.startFollow(this.playerSys.sprite, true, 1.0, 1.0, -480, 0);
    }

    // Speed management timer removed to keep game speed fixed
    this.state.gameSpeed = 1.5; // Fixed speed for the runner phase

    // 13. On-the-fly customization updates (từ store)
    this.setupCustomizationListeners();

    // 14. Debug hooks (chỉ dùng khi dev/QA)
    this.setupDebugHooks();

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
      this.warningText.setVisible(false);
      return;
    }

    if (state.currentPhase === 'map_clear') {
      this.titleTextObject?.setVisible(false);
      this.progressBarGraphics.clear();
      this.bossHpBarGraphics.clear();
      this.bossHpText.setVisible(false);
      this.warningText.setVisible(false);
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
    } else if (state.currentPhase === 'runner') {
      // Auto camera scroll at 1.5px/frame (fixed speed)
      const speed = 1.5 * (delta / 16.67);
      this.cameras.main.scrollX += speed;
      this.virtualScrollX = this.cameras.main.scrollX;
      state.distance = this.playerSys.sprite.x;

      // Lock player X at 2/5 screen width
      this.playerSys.sprite.x = this.cameras.main.scrollX + width * 0.4;

      this.spawn.generateTerrain(this.playerSys.sprite.x + 1024, state, this.mapConfig);
      this.spawn.generatePatterns(this.playerSys.sprite.x, state, this.mapConfig);
      
      // Boss timer check
      if (state.gameTimeElapsed >= BOSS_DELAY_SEC) {
        this.progressBarGraphics.clear();
        this.warningText.setVisible(false);
        if (this.warningTween) {
          this.warningTween.stop();
          this.warningTween = null;
        }
        
        state.bossTriggerX = this.playerSys.sprite.x;
        this.bossSys.checkTrigger(this.playerSys.sprite);
      } else {
        // Draw progress bar
        this.drawProgressBar();

        // Warning in the last 10 seconds
        const timeLeft = BOSS_DELAY_SEC - state.gameTimeElapsed;
        if (timeLeft <= 10 && timeLeft > 0) {
          if (!this.warningText.visible) {
            this.warningText.setVisible(true);
            this.warningTween = this.tweens.add({
              targets: this.warningText,
              alpha: 0.2,
              duration: 500,
              yoyo: true,
              repeat: -1
            });
          }
        }
      }
      this.checkIntermediateCheckpoints();
    } else if (state.currentPhase === 'boss' || state.currentPhase === 'boss_intro') {
      this.virtualScrollX = this.cameras.main.scrollX;
      state.distance = this.playerSys.sprite.x;

      // Lock player X at 1/5 screen width
      this.playerSys.sprite.x = this.cameras.main.scrollX + width * 0.2;

      this.progressBarGraphics.clear();
      this.warningText.setVisible(false);
      if (this.warningTween) {
        this.warningTween.stop();
        this.warningTween = null;
      }
    }

    // Cập nhật player
    this.playerSys.update(time, delta, this.keys);

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
    this.hud.showCheckpoint(this.playerSys.sprite.x);
  }

  // ─── Respawn (Public) ─────────────────────────────────────────────────────
  // Được gọi từ React UI khi player nhấn nút respawn.
  // Điều phối nhiều system — đây là lý do nó nằm trong GameScene coordinator.
  public respawn(): void {
    const { state } = this;
    const isAtBoss = this.playerSys.sprite.x >= state.bossTriggerX;

    // Reset scores/speed về checkpoint
    state.score = state.checkpointScore;
    state.kaizenEnergy = state.checkpointEnergy;
    state.flasksCollected = state.checkpointFlasks;
    state.hearts = 3;
    state.gameSpeed = 1.5;
    state.distance = state.checkpointX;
 
    // Xóa toàn bộ entities
    this.enemiesGroup.clear(true, true);
    this.obstaclesGroup.clear(true, true);
    this.flasksGroup.clear(true, true);
    this.powerupsGroup.clear(true, true);
    this.playerSys.projectiles.clear(true, true);
    this.bossProjectiles.clear(true, true);
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
        this.input.keyboard?.once('keydown', triggerStart);
      } else {
        this.isPlaying = true;
        state.currentPhase = 'runner';
        this.cameras.main.startFollow(this.playerSys.sprite, true, 1.0, 1.0, -480, 0);
        const spawnX = state.checkpointX + 100;
        this.cameras.main.scrollX = Math.max(0, spawnX - 480);
        this.virtualScrollX = this.cameras.main.scrollX;
      }
    }

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
      this.playerSys.sprite.setTexture(`mascot_${gender}`);
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
}
