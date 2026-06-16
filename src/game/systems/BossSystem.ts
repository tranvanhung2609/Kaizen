import Phaser from 'phaser';
import { SCORE_RULES } from '../constants';
import { GameState } from './GameState';
import { AudioSynth } from './AudioSynth';
import { MapConfig } from '../maps/MapConfig';

// ─── Boss System ──────────────────────────────────────────────────────────────
// Chịu trách nhiệm toàn bộ vòng đời của Boss:
//   - checkTrigger: phát hiện khi player đến cổng boss, spawn boss, trigger cutscene
//   - handleAttack: AI bắn đạn theo interval
//   - onHitBoss: arrow function collision handler (Option B)
//   - defeat: animation thoại + emit map-clear event
//   - respawn: hồi boss về trạng thái đầu khi player respawn tại checkpoint boss
export class BossSystem {
  /** Boss sprite — public để GameScene.respawn() có thể xử lý */
  sprite: Phaser.Physics.Arcade.Sprite | null = null;

  private scene!: Phaser.Scene;
  private state!: GameState;
  private audio!: AudioSynth;
  private mapConfig!: MapConfig;
  private playerProjectiles!: Phaser.Physics.Arcade.Group;
  private bossProjectiles!: Phaser.Physics.Arcade.Group;
  private onHudEmit!: () => void;
  private playerSprite!: Phaser.Physics.Arcade.Sprite;

  // ── Option B: Arrow Function Collision Handler ───────────────────────────
  onHitBoss!: (proj: any, _boss: any) => void;

  /** Khởi tạo system. Gọi trong create() sau khi physics groups đã có. */
  init(
    scene: Phaser.Scene,
    state: GameState,
    audio: AudioSynth,
    mapConfig: MapConfig,
    playerProjectiles: Phaser.Physics.Arcade.Group,
    bossProjectiles: Phaser.Physics.Arcade.Group,
    onHudEmit: () => void
  ): void {
    this.scene = scene;
    this.state = state;
    this.audio = audio;
    this.mapConfig = mapConfig;
    this.playerProjectiles = playerProjectiles;
    this.bossProjectiles = bossProjectiles;
    this.onHudEmit = onHudEmit;

    // Initialize arrow function handler với closure bắt đúng context
    this.onHitBoss = (proj, _boss) => {
      proj.destroy();
      if (state.currentPhase !== 'boss' || !state.bossActive) return;
      state.bossHp = Math.max(0, state.bossHp - 50); // Decrement by 50 HP per hit
      audio.playFlask();
      // Flash trắng khi trúng đạn
      this.sprite?.setTint(0xffffff);
      scene.time.delayedCall(100, () => this.sprite?.clearTint()); // Flash white for 0.1s (100ms)
      onHudEmit();
      if (state.bossHp <= 0) this.defeat();
    };
  }

  // ─── Boss Trigger ─────────────────────────────────────────────────────────
  // ─── Boss Trigger ─────────────────────────────────────────────────────────
  checkTrigger(playerSprite: Phaser.Physics.Arcade.Sprite): void {
    const { state, mapConfig, scene } = this;
    if (state.distance < state.bossTriggerX || state.currentPhase !== 'runner') return;

    this.playerSprite = playerSprite;
    state.currentPhase = 'boss_intro';
    state.isBossFight = true;

    const playerX = playerSprite.x;
    // Lưu checkpoint tại cổng boss
    state.checkpointScore = state.score;
    state.checkpointEnergy = state.kaizenEnergy;
    state.checkpointX = playerX;
    state.bossTriggerX = playerX;

    // Dừng camera follow, chuyển sang fixed view
    scene.cameras.main.stopFollow();
    const camScrollX = scene.cameras.main.scrollX;

    // Emit boss intro cutscene lên React overlay
    scene.game.events.emit('boss-intro-trigger', mapConfig.cutscenes.bossIntro);

    // Spawn boss ngoài màn hình bên phải
    this.sprite = scene.physics.add.sprite(camScrollX + scene.scale.width + 100, 300, 'hanoi_boss');
    const bossBody = this.sprite.body as Phaser.Physics.Arcade.Body;
    bossBody.setAllowGravity(false);
    this.sprite.play('boss_idle').setScale(0.6); // Scaled down

    // Map-specific boss tint
    if (mapConfig.mapKey === 'tokyo') this.sprite.setTint(0xff55bb);
    else if (mapConfig.mapKey === 'danang') this.sprite.setTint(0x00bbff);

    state.maxBossHp = mapConfig.bossConfig.maxHp;
    state.bossHp = state.maxBossHp;

    // Setup overlap — dùng arrow function đã init sẵn (Option B)
    scene.physics.add.overlap(this.playerProjectiles, this.sprite, this.onHitBoss);

    // Tween player to 1/5 width
    scene.tweens.add({
      targets: playerSprite,
      x: camScrollX + scene.scale.width * 0.2,
      duration: 1500,
      ease: 'Power1'
    });

    // Tween boss vào màn hình (x = camScrollX + 4/5 width)
    scene.tweens.add({
      targets: this.sprite,
      x: camScrollX + scene.scale.width * 0.8,
      duration: 2000,
      onComplete: () => {
        state.currentPhase = 'boss';
        state.bossActive = true;
        state.nextBossAttackTime = scene.time.now + 1000;
      },
    });
  }

  // ─── Boss AI Attack ───────────────────────────────────────────────────────
  handleAttack(time: number, playerX: number, playerY: number): void {
    const { state, mapConfig, scene } = this;
    if (!this.sprite || !this.sprite.scene || !state.bossActive) return;

    // Lock Boss X coordinate during the fight at 4/5 screen width
    this.sprite.x = scene.cameras.main.scrollX + scene.scale.width * 0.8;

    if (time <= state.nextBossAttackTime) return;

    state.nextBossAttackTime = time + mapConfig.bossConfig.shootInterval;

    // Animate boss attack
    this.sprite.play('boss_attack').chain('boss_idle');

    // Tạo đạn từ boss, hướng về player
    const bullet = this.bossProjectiles.create(
      this.sprite.x - 30, // Offset adjusted for smaller scale
      this.sprite.y - 10, // Offset adjusted for smaller scale
      'powerups'
    );
    bullet.setFrame(0).setDisplaySize(12, 12).setTint(0xff3b30); // Scaled down

    const angle = Phaser.Math.Angle.Between(bullet.x, bullet.y, playerX, playerY);
    const speed = mapConfig.bossConfig.bulletSpeed;
    scene.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), speed, bullet.body.velocity);
    bullet.body.updateFromGameObject();
  }

  // ─── Boss Defeat ──────────────────────────────────────────────────────────
  private defeat(): void {
    const { state, mapConfig, scene } = this;
    state.bossActive = false;
    state.isBossFight = false;
    state.currentPhase = 'map_clear';
    state.gameSpeed = 0;
    state.score += SCORE_RULES.bossDefeated;
    this.audio.playVictory();

    // Stop player movement
    const playerBody = this.playerSprite.body as Phaser.Physics.Arcade.Body;
    playerBody.setVelocity(0, 0);
    playerBody.setAllowGravity(false);
    playerBody.setGravityY(0);
    this.playerSprite.play(`${state.activeGender}_run`, true);

    if (this.sprite) {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      body.setEnable(false);
      this.sprite.play('boss_defeated');
    }

    scene.tweens.add({
      targets: this.sprite,
      y: (this.sprite?.y ?? 0) + 300,
      angle: 180,
      duration: 1500,
      onComplete: () => {
        this.sprite?.destroy();
        this.sprite = null;
        console.log("Boss defeated! Triggering map clear screen.");
        
        // Emit map-clear-trigger event with statistics
        scene.game.events.emit('map-clear-trigger', {
          stats: {
            score: state.score,
            flasksCollected: state.flasksCollected || 0,
            heartsRemaining: state.hearts,
            gameTime: Math.round(state.gameTimeElapsed),
          },
          cutscene: mapConfig.cutscenes.mapClear,
        });
      },
    });
  }

  // ─── Boss Respawn ─────────────────────────────────────────────────────────
  /** Đặt lại boss về vị trí ban đầu sau khi player respawn tại checkpoint boss. */
  respawn(bossTriggerX: number): void {
    const state = this.state;
    state.bossHp = state.maxBossHp;
    state.bossActive = true;
    state.nextBossAttackTime = this.scene.time.now + 1000;

    if (this.sprite && this.sprite.scene) {
      this.sprite.setPosition(bossTriggerX + this.scene.scale.width * 0.8, 300).setAlpha(1).play('boss_idle');
    }
  }

  /** Hủy boss sprite (dùng khi respawn ở runner checkpoint, không phải boss). */
  clearSprite(): void {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}
