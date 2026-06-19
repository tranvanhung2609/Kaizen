import Phaser from 'phaser';
import { SCORE_RULES, RUNNER_PHYSICS } from '../engine/constants';
import { GameState } from '../engine/GameState';
import { AudioSynth } from '../engine/AudioSynth';
import { MapConfig } from '../maps/MapConfig';

// ─── Boss System ──────────────────────────────────────────────────────────────
// Vòng đời boss:
//   1. checkTrigger  → spawn boss ngoài màn, emit boss-intro-trigger lên React
//   2. (Chờ React event 'boss-intro-closed') → tween boss vào màn hình
//   3. handleAttack  → AI bắn đạn + dodge lên/xuống
//   4. onHitBoss     → arrow function collision handler
//   5. defeat        → animation rơi + emit map-clear
//   6. respawn       → hồi boss khi player checkpoint
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

  // ── Dodge AI state ───────────────────────────────────────────────────────
  private bossTargetY: number = 270;
  private nextDodgeTime: number = 0;
  private readonly BOSS_MIN_Y = 160;
  private readonly BOSS_MAX_Y = 360;
  private readonly BOSS_MOVE_SPEED = 120; // px/s

  // Camera scrollX tại thời điểm trigger — dùng để lock boss X sau này
  private camScrollXAtTrigger: number = 0;

  // ── Option B: Arrow Function Collision Handler ───────────────────────────
  onHitBoss!: (obj1: any, obj2: any) => void;

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
    this.onHitBoss = (obj1, obj2) => {
      // Xác định rõ đối tượng nào là đạn (projectile) và đối tượng nào là boss sprite
      let proj: Phaser.Physics.Arcade.Sprite | null = null;
      let boss: Phaser.Physics.Arcade.Sprite | null = null;

      if (obj1 && obj1.texture && obj1.texture.key === 'kaizen_bullet') {
        proj = obj1;
        boss = obj2;
      } else if (obj2 && obj2.texture && obj2.texture.key === 'kaizen_bullet') {
        proj = obj2;
        boss = obj1;
      } else {
        // Fallback phòng trường hợp texture key khác
        if (obj1 && obj1.getData && obj1.getData('damage') !== undefined) {
          proj = obj1;
          boss = obj2;
        } else {
          proj = obj2;
          boss = obj1;
        }
      }

      if (!proj || !proj.active) return;
      proj.destroy();

      if (state.currentPhase !== 'boss' || !state.bossActive) return;

      const damage = proj.getData('damage') || RUNNER_PHYSICS.bulletDamage;
      state.bossHp = Math.max(0, state.bossHp - damage);
      audio.playFlask();

      // Flash trắng khi trúng đạn
      if (boss && boss.active) {
        boss.setTint(0xffffff);
        scene.time.delayedCall(100, () => {
          if (boss && boss.active) {
            if (this.mapConfig.mapKey === 'tokyo') boss.setTint(0xff55bb);
            else if (this.mapConfig.mapKey === 'danang') boss.setTint(0x00bbff);
            else boss.clearTint();
          }
        });
      }

      // Damage Popup
      const damageText = scene.add.text(proj.x, proj.y - 20, `-${damage}`, {
        font: '900 16px Courier New, monospace',
        color: '#ff3b30',
        stroke: '#000000',
        strokeThickness: 3,
      }).setDepth(10).setOrigin(0.5);

      scene.tweens.add({
        targets: damageText,
        y: damageText.y - 40,
        alpha: 0,
        duration: 600,
        onComplete: () => damageText.destroy(),
      });

      // Dodge ngay khi bị bắn trúng (reactive dodge)
      this.triggerDodge();

      onHudEmit();
      if (state.bossHp <= 0) this.defeat();
    };
  }

  // ─── Boss Trigger ─────────────────────────────────────────────────────────
  checkTrigger(playerSprite: Phaser.Physics.Arcade.Sprite): void {
    const { state, mapConfig, scene } = this;
    if (state.distance < state.bossTriggerX || state.currentPhase !== 'runner') return;

    this.playerSprite = playerSprite;
    state.currentPhase = 'boss_intro';
    state.isBossFight = true;

    // Tạm thời kích hoạt bất tử trong lúc hiển thị cutscene giới thiệu boss
    state.invulnerableUntil = scene.time.now + 999999;

    const playerX = playerSprite.x;
    // Lưu checkpoint tại cổng boss
    state.checkpointScore = state.score;
    state.checkpointEnergy = 100;
    state.kaizenEnergy = 100;
    state.checkpointX = playerX;
    state.bossTriggerX = playerX;

    // Dừng camera follow, chuyển sang fixed view
    scene.cameras.main.stopFollow();
    this.camScrollXAtTrigger = scene.cameras.main.scrollX;
    const camScrollX = this.camScrollXAtTrigger;
    const screenW = scene.cameras.main.width;

    // 1. Dọn sạch quái thường, đạn và chướng ngại vật trên màn hình để chuẩn bị đấu boss
    (scene as any).enemiesGroup?.clear(true, true);
    (scene as any).obstaclesGroup?.clear(true, true);
    (scene as any).enemyBulletsGroup?.clear(true, true);
    this.playerProjectiles.clear(true, true);
    this.bossProjectiles.clear(true, true);

    // 2. Tái tạo nền đất phẳng vững chắc bên dưới toàn bộ vùng đấu Boss, xóa sạch các hố sâu (pits)
    (scene as any).groundGroup?.clear(true, true);
    const startX = Math.floor((camScrollX - 128) / 64) * 64;
    (scene as any).spawn?.reset({ groundX: Math.max(0, startX) });
    (scene as any).spawn?.generateTerrain(camScrollX + screenW + 512, state, mapConfig);

    // Emit boss intro cutscene lên React overlay
    scene.game.events.emit('boss-intro-trigger', mapConfig.cutscenes.bossIntro);

    // Spawn boss ngoài màn hình bên phải — CHƯA bắt đầu tween
    const bossStartX = camScrollX + screenW + 200;
    const bossStartY = 270;
    this.sprite = scene.physics.add.sprite(bossStartX, bossStartY, 'hanoi_boss');
    this.sprite.setDepth(5).setScale(0.6);

    const bossBody = this.sprite.body as Phaser.Physics.Arcade.Body;
    bossBody.setAllowGravity(false);
    bossBody.setImmovable(false);

    this.sprite.play('boss_idle');

    // Map-specific tint
    if (mapConfig.mapKey === 'tokyo') this.sprite.setTint(0xff55bb);
    else if (mapConfig.mapKey === 'danang') this.sprite.setTint(0x00bbff);

    state.maxBossHp = mapConfig.bossConfig.maxHp;
    state.bossHp = state.maxBossHp;
    this.bossTargetY = bossStartY;

    // Setup overlap
    scene.physics.add.overlap(this.playerProjectiles, this.sprite, this.onHitBoss);

    // Tween player sang vị trí 20% màn hình bên trái
    scene.tweens.add({
      targets: playerSprite,
      x: camScrollX + screenW * 0.2,
      duration: 800,
      ease: 'Power2',
    });

    // Lắng nghe event từ React: khi người chơi bấm "Vào trận" → boss enter
    scene.game.events.once('boss-intro-closed', () => {
      this.enterBossArena();
    });
  }

  /** Tween boss vào màn hình — chỉ gọi sau khi React intro đóng */
  private enterBossArena(): void {
    const { state, scene } = this;
    if (!this.sprite || !this.sprite.active) return;

    const camScrollX = this.camScrollXAtTrigger;
    const screenW = scene.cameras.main.width;
    const bossFinalX = camScrollX + screenW * 0.78;

    // Tween boss bay vào từ phải
    scene.tweens.add({
      targets: this.sprite,
      x: bossFinalX,
      duration: 1800,
      ease: 'Power2.easeOut',
      onComplete: () => {
        state.currentPhase = 'boss';
        state.bossActive = true;
        state.nextBossAttackTime = scene.time.now + 1200;
        this.nextDodgeTime = scene.time.now + 1000;
        // Kết thúc bất tử, cho 1 giây ân hạn trước khi có thể nhận sát thương trở lại
        state.invulnerableUntil = scene.time.now + 1000;
      },
    });
  }

  // ─── Boss AI Attack + Dodge ───────────────────────────────────────────────
  handleAttack(time: number, playerX: number, playerY: number): void {
    const { state, mapConfig, scene } = this;
    if (!this.sprite || !this.sprite.active || !state.bossActive) return;

    const screenW = scene.cameras.main.width;
    const bossX = scene.cameras.main.scrollX + screenW * 0.78;

    // Lock X dùng velocity thay vì assign trực tiếp (tránh bypass physics)
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const dx = bossX - this.sprite.x;
    body.setVelocityX(Math.sign(dx) * Math.min(Math.abs(dx) * 5, 300));

    // ── Dodge AI: Di chuyển lên/xuống ────────────────────────────────────
    if (time >= this.nextDodgeTime) {
      this.triggerDodge();
    }

    // Lerp Y về targetY bằng velocity
    const dy = this.bossTargetY - this.sprite.y;
    const speed = Math.min(Math.abs(dy) * 4, this.BOSS_MOVE_SPEED);
    body.setVelocityY(Math.sign(dy) * speed);

    // ── Cull đạn boss ngoài viewport ─────────────────────────────────────
    const camScrollX = scene.cameras.main.scrollX;
    this.bossProjectiles.getChildren().forEach((b: any) => {
      if (b.active && (b.x < camScrollX - 150 || b.x > camScrollX + screenW + 200 || b.y > 560 || b.y < -50)) {
        b.destroy();
      }
    });

    // ── Bắn đạn ──────────────────────────────────────────────────────────
    if (time <= state.nextBossAttackTime) return;
    state.nextBossAttackTime = time + mapConfig.bossConfig.shootInterval;

    this.sprite.play('boss_attack').chain('boss_idle');

    // Bắn 1 đạn chính nhắm player + 1 đạn spread trên/dưới để khó né hơn
    const bulletOffsets = [
      { ox: -40, oy: 0 },        // Đạn chính
      { ox: -30, oy: -25 },      // Đạn spread trên
      { ox: -30, oy: 25 },       // Đạn spread dưới
    ];

    for (const { ox, oy } of bulletOffsets) {
      const bullet = this.bossProjectiles.create(
        this.sprite.x + ox,
        this.sprite.y + oy,
        'security_voltage'
      );
      if (!bullet) continue;
      bullet
        .setActive(true)
        .setVisible(true)
        .setDisplaySize(18, 18)
        .setTint(0xff3b30)
        .setDepth(8);

      // Góc về phía player + spread nhỏ
      const angle = Phaser.Math.Angle.Between(bullet.x, bullet.y, playerX, playerY);
      const speed = mapConfig.bossConfig.bulletSpeed;
      scene.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), speed, bullet.body.velocity);
      (bullet.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }
  }

  /** Kích hoạt dodge ngẫu nhiên */
  private triggerDodge(): void {
    const { scene } = this;
    // Chọn Y target mới ngẫu nhiên trong range
    const range = this.BOSS_MAX_Y - this.BOSS_MIN_Y;
    this.bossTargetY = this.BOSS_MIN_Y + Math.random() * range;
    // Nghỉ 1.5–3s trước khi dodge tiếp
    this.nextDodgeTime = scene.time.now + 1500 + Math.random() * 1500;
  }

  // ─── Boss Defeat ──────────────────────────────────────────────────────────
  private defeat(): void {
    const { state, mapConfig, scene } = this;
    state.bossActive = false;
    state.isBossFight = false;
    state.currentPhase = 'map_clear';
    state.gameSpeed = 0;

    // ── Cộng đủ điểm thưởng cuối màn ─────────────────────────────────────
    state.score += SCORE_RULES.bossDefeated;           // +2000 boss hạ gục
    state.score += SCORE_RULES.mapClearBonus;           // +1000 hoàn thành map
    state.score += state.hearts * SCORE_RULES.remainingHeartBonus; // +300/tim còn lại

    this.audio.playVictory();

    // Xóa listener nếu người chơi chưa kịp đóng intro
    scene.game.events.off('boss-intro-closed');

    // Dừng player
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

        // Emit map-clear-trigger event with full statistics
        scene.game.events.emit('map-clear-trigger', {
          stats: {
            score: state.score,
            flasksCollected: state.flasksCollected || 0,
            heartsRemaining: state.hearts,
            gameTime: Math.round(state.gameTimeElapsed),
            groundBugsDefeated: state.groundBugsDefeated || 0,
            flyingBugsDefeated: state.flyingBugsDefeated || 0,
            deathCount: state.deathCount || 0,
          },
          cutscene: mapConfig.cutscenes.mapClear,
        });
      },
    });
  }

  // ─── Boss Respawn ─────────────────────────────────────────────────────────
  /** Đặt lại boss khi player respawn tại checkpoint boss. */
  respawn(bossTriggerX: number): void {
    const state = this.state;
    state.bossHp = state.maxBossHp;
    state.bossActive = true;
    state.nextBossAttackTime = this.scene.time.now + 1000;
    this.nextDodgeTime = this.scene.time.now + 1000;
    this.bossTargetY = 270;

    const screenW = this.scene.cameras.main.width;
    const bossX = this.scene.cameras.main.scrollX + screenW * 0.78;

    if (!this.sprite || !this.sprite.scene) {
      this.sprite = this.scene.physics.add.sprite(bossX, 270, 'hanoi_boss');
      const bossBody = this.sprite.body as Phaser.Physics.Arcade.Body;
      bossBody.setAllowGravity(false);
      this.sprite.play('boss_idle').setScale(0.6).setDepth(5);

      if (this.mapConfig.mapKey === 'tokyo') this.sprite.setTint(0xff55bb);
      else if (this.mapConfig.mapKey === 'danang') this.sprite.setTint(0x00bbff);

      this.scene.physics.add.overlap(this.playerProjectiles, this.sprite, this.onHitBoss);
    } else {
      this.sprite.setPosition(bossX, 270).setAlpha(1).play('boss_idle');
    }
  }

  /** Hủy boss sprite (dùng khi respawn ở runner checkpoint). */
  clearSprite(): void {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    this.scene?.game?.events?.off('boss-intro-closed');
  }
}
