import Phaser from 'phaser';
import { RUNNER_PHYSICS, SCORE_RULES, getDifficultyState } from '../constants';
import { GameState } from './GameState';
import { AudioSynth } from './AudioSynth';

type Keys = {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  w: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  space: Phaser.Input.Keyboard.Key;
  z?: Phaser.Input.Keyboard.Key;
};

// ─── Player System ─────────────────────────────────────────────────────────────
// Chịu trách nhiệm:
//   - Tạo và quản lý player sprite + projectile group
//   - Jump Feel System: Coyote Time, Jump Buffer, Double Jump, Variable Height
//   - Animation state machine: run / jump / crouch / fly / hit
//   - Flight mode, crouch, Kaizen Mode shoot
//   - Tất cả collision/overlap callbacks được lưu dưới dạng arrow functions (Option B)
//     để GameScene có thể truyền trực tiếp vào physics.add.overlap()
export class PlayerSystem {
  // Public refs — GameScene cần để setup physics colliders
  sprite!: Phaser.Physics.Arcade.Sprite;
  projectiles!: Phaser.Physics.Arcade.Group;

  // ── Jump Feel State ──────────────────────────────────────────────────────
  private coyoteTimeLeft = 0;
  private jumpBufferTimeLeft = 0;
  private hasDoubleJump = false;
  private wasOnGround = false;
  private jumpKeyWasDown = false;
  private lastSafePos = { x: 150, y: 200 };
  private controlsLocked = false;

  // Cached dependencies
  private scene!: Phaser.Scene;
  private state!: GameState;
  private audio!: AudioSynth;
  private onRestoreTint!: () => void;
  private onHudEmit!: () => void;

  // ── Option B: Collision Handlers as Arrow Functions ──────────────────────
  // Được khởi tạo trong create() với closures bắt đúng context.
  // GameScene truyền trực tiếp vào physics.add.overlap(group1, group2, thisHandler).
  onCollectFlask!: (player: any, flask: any) => void;
  onCollectPowerup!: (player: any, powerup: any) => void;
  onHitEnemy!: (player: any, enemy: any) => void;
  onHitObstacle!: (player: any, obstacle: any) => void;
  onProjectileHitEnemy!: (proj: any, enemy: any) => void;
  onProjectileHitBossProjectile!: (pProj: any, bProj: any) => void;
  onHitBossProjectile!: (player: any, bullet: any) => void;

  /** Khởi tạo hệ thống player. Gọi trong Scene.create(). */
  create(
    scene: Phaser.Scene,
    state: GameState,
    audio: AudioSynth,
    onRestoreTint: () => void,
    onHudEmit: () => void
  ): void {
    this.scene = scene;
    this.state = state;
    this.audio = audio;
    this.onRestoreTint = onRestoreTint;
    this.onHudEmit = onHudEmit;

    // ── Spawn Player Sprite ────────────────────────────────────────────────
    this.sprite = scene.physics.add.sprite(-50, 200, `mascot_${state.activeGender}`);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setGravityY(800); // Rule 1: gravity.y = 800
    this.sprite.setBounce(0.1);  // Rule 1: bounce(0.1)
    this.sprite.setScale(0.6);   // Scale mascot down so it fits the screen proportion
    this.sprite.setDepth(5);
    this.sprite.setVisible(true); // Made visible so player is controllable
    (this.sprite as any).hp = 3;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(40, 120);
    body.setOffset(65, 84);
    this.sprite.play(`${state.activeGender}_run`);

    // ── Projectile Pool ────────────────────────────────────────────────────
    this.projectiles = scene.physics.add.group({ allowGravity: false });

    // ── Mouse / Touch Input ────────────
    const onPointerDown = () => {
      if (state.currentPhase === 'intro' || state.currentPhase === 'runner') {
        this.jumpBufferTimeLeft = RUNNER_PHYSICS.JUMP_BUFFER_MS;
      } else if (state.currentPhase === 'boss') {
        const now = this.scene.time.now;
        if (now > state.nextShootTime) {
          this.shoot(now);
        }
      }
    };
    scene.input.on('pointerdown', onPointerDown);

    // Cleanup listener khi scene shutdown — tránh memory leak
    scene.events.on('shutdown', () => {
      scene.input.off('pointerdown', onPointerDown);
    });

    // ── Initialize Arrow Function Collision Handlers (Option B) ─────────────
    this.initCollisionHandlers();
  }

  /** Reset jump state variables. Gọi sau respawn. */
  resetJumpState(keys?: Keys): void {
    this.coyoteTimeLeft = 0;
    this.jumpBufferTimeLeft = 0;
    this.hasDoubleJump = false;
    this.wasOnGround = false;
    this.controlsLocked = false;

    // Set jumpKeyWasDown to true if the jump input is currently held down,
    // to avoid triggering a fake "justPressed" event on the next frame update.
    const pointerDown = this.scene?.input?.activePointer?.isDown ?? false;
    const keysDown = keys ? (keys.up.isDown || keys.w.isDown) : false;
    this.jumpKeyWasDown = pointerDown || keysDown;
  }

  // ─── Main Update ──────────────────────────────────────────────────────────
  update(time: number, _delta: number, keys: Keys): void {
    const state = this.state;
    const playerBody = this.sprite.body as Phaser.Physics.Arcade.Body;
    const isFlying = state.wingsUntil > time;
    const isCrouching = (keys.down.isDown || keys.s.isDown) && !isFlying;
    const onGround = playerBody.touching.down;

    // Rule 2: Save safe position (Checkpoint) when standing on the ground
    if (onGround) {
      this.lastSafePos.x = this.sprite.x;
      this.lastSafePos.y = this.sprite.y;
    }

    // ── Pit Fall / Respawn Mechanic ───────────────────────────────────────
    if (this.sprite.y > 540 && state.currentPhase !== 'game_over' && state.currentPhase !== 'intro') {
      this.handlePitFall();
      return;
    }

    // ── 1. Horizontal Movement ─────────────────────────────────────────────
    if (state.currentPhase === 'runner') {
      // Synchronized with camera speed of 1.5px/frame (90px/sec at 60 FPS)
      const speed = 90 * (state.isKaizenMode ? 1.5 : 1.0);
      this.sprite.setVelocityX(speed);
    } else if (state.currentPhase === 'intro') {
      this.sprite.setVelocityX(0);
    } else if (state.currentPhase === 'boss') {
      this.sprite.x = this.scene.cameras.main.scrollX + this.scene.scale.width * 0.2;
      this.sprite.setVelocityX(0);
    } else {
      this.sprite.setVelocityX(0);
    }

    // ── 2. Flight Mode vs Normal Gravity ──────────────────────────────────
    if (isFlying) {
      playerBody.setAllowGravity(false);
      this.sprite.setVelocityY(0);
      const speed = 250;
      if (!this.controlsLocked) {
        if (keys.up.isDown || keys.w.isDown) this.sprite.setVelocityY(-speed);
        else if (keys.down.isDown || keys.s.isDown) this.sprite.setVelocityY(speed);
      }

      if (this.sprite.anims.currentAnim?.key !== `${state.activeGender}_fly`) {
        this.sprite.play(`${state.activeGender}_fly`);
      }
      playerBody.setSize(40, 120);
      playerBody.setOffset(65, 84);
    } else {
      if (state.currentPhase === 'intro') {
        playerBody.setAllowGravity(true);
        playerBody.setGravityY(800);
        this.sprite.setVelocityX(0);
        this.handleAnimation(isCrouching, onGround, playerBody);
      } else {
        playerBody.setAllowGravity(true);
        playerBody.setGravityY(800);
        if (!this.controlsLocked) {
          this.handleJump(keys, onGround, playerBody);
          this.handleAnimation(isCrouching, onGround, playerBody);
        }
      }
    }

    // ── 3. Kaizen Mode Energy ─────────────────────────────────────────────
    if (state.currentPhase !== 'game_over' && state.currentPhase !== 'map_clear') {
      if (!state.isKaizenMode) {
        const energyGain = (RUNNER_PHYSICS.energyPerSecond * this.scene.game.loop.delta) / 1000;
        this.increaseEnergy(energyGain);
      }
    }

    // ── 4. Shooting ───────────────────────────────────────────
    if (!this.controlsLocked) {
      const wantShoot = (state.isKaizenMode && keys.space.isDown) || (keys.z?.isDown);
      if (wantShoot && time > state.nextShootTime) {
        this.shoot(time);
      }
    }
  }

  // ─── Jump Feel System ──────────────────────────────────────────────────────
  private handleJump(
    keys: Keys,
    onGround: boolean,
    playerBody: Phaser.Physics.Arcade.Body
  ): void {
    const state = this.state;
    const delta = this.scene.game.loop.delta;

    // Edge detection — nhận tín hiệu khi vừa nhấn, không khi giữ
    const jumpKeyDown = keys.up.isDown || keys.w.isDown || this.scene.input.activePointer.isDown;
    const justPressedJump = jumpKeyDown && !this.jumpKeyWasDown;
    this.jumpKeyWasDown = jumpKeyDown;

    // Coyote Time: cửa sổ 120ms sau khi bước ra khỏi mép
    if (this.wasOnGround && !onGround && playerBody.velocity.y >= 0) {
      this.coyoteTimeLeft = RUNNER_PHYSICS.COYOTE_TIME_MS;
    }
    this.wasOnGround = onGround;
    if (this.coyoteTimeLeft > 0) this.coyoteTimeLeft -= delta;

    // Jump Buffer: lưu ý định nhảy trong 150ms
    if (justPressedJump) this.jumpBufferTimeLeft = RUNNER_PHYSICS.JUMP_BUFFER_MS;
    if (this.jumpBufferTimeLeft > 0) this.jumpBufferTimeLeft -= delta;

    // Double Jump reset khi chạm đất (chỉ khi Kaizen Mode)
    if (onGround) this.hasDoubleJump = state.isKaizenMode;

    const canJump = onGround || this.coyoteTimeLeft > 0;
    const wantsJump = this.jumpBufferTimeLeft > 0;
    const canDoubleJump = !onGround && this.hasDoubleJump && justPressedJump;

    if (wantsJump && canJump) {
      // Nhảy chuẩn hoặc Coyote Jump
      this.audio.playJump();
      const force = state.isKaizenMode ? RUNNER_PHYSICS.kaizenJumpForce : RUNNER_PHYSICS.jumpForce;
      this.sprite.setVelocityY(force);
      this.sprite.play(`${state.activeGender}_jump`, true);
      this.coyoteTimeLeft = 0;
      this.jumpBufferTimeLeft = 0;
    } else if (canDoubleJump) {
      // Double Jump — Kaizen Mode exclusive (85% lực)
      this.audio.playJump();
      this.sprite.setVelocityY(RUNNER_PHYSICS.kaizenJumpForce * 0.85);
      this.sprite.play(`${state.activeGender}_jump`, true);
      this.hasDoubleJump = false;
      this.jumpBufferTimeLeft = 0;
    }

    // Variable Jump Height: exponential decay khi nhả phím, frame-rate independent
    if (!jumpKeyDown && playerBody.velocity.y < -50) {
      const dampFactor = Math.pow(RUNNER_PHYSICS.JUMP_DAMPING_RATIO, delta / 16.67);
      playerBody.setVelocityY(playerBody.velocity.y * dampFactor);
    }
  }

  // ─── Animation State Machine ───────────────────────────────────────────────
  private handleAnimation(
    isCrouching: boolean,
    onGround: boolean,
    playerBody: Phaser.Physics.Arcade.Body
  ): void {
    const gender = this.state.activeGender;
    if (isCrouching) {
      if (this.sprite.anims.currentAnim?.key !== `${gender}_crouch`) {
        this.sprite.play(`${gender}_crouch`);
        playerBody.setSize(40, 80);
        playerBody.setOffset(65, 124);
      }
    } else if (onGround) {
      // Chạm đất → luôn switch về run (bao gồm khi hạ cánh từ jump)
      if (this.sprite.anims.currentAnim?.key !== `${gender}_run`) {
        this.sprite.play(`${gender}_run`, true);
      }
      playerBody.setSize(40, 120);
      playerBody.setOffset(65, 84);
    } else {
      // Trên không — giữ hitbox chuẩn
      playerBody.setSize(40, 120);
      playerBody.setOffset(65, 84);
    }
  }

  // ─── Shoot ────────────────────────────────────────────────────────────────
  private shoot(time: number): void {
    this.audio.playShoot();
    this.state.nextShootTime = time + RUNNER_PHYSICS.shootCooldown;
    const proj = this.projectiles.create(this.sprite.x + 30, this.sprite.y, 'powerups');
    proj.setFrame(2).setDisplaySize(12, 12).setVelocityX(800);
    proj.body.updateFromGameObject();

    if (this.state.isKaizenMode) {
      this.state.kaizenAmmo = Math.max(0, this.state.kaizenAmmo - 1);
      if (this.state.kaizenAmmo <= 0) {
        this.state.isKaizenMode = false;
        this.onRestoreTint();
        this.sprite.play(`${this.state.activeGender}_run`);
      }
    }
  }

  // ─── State Helpers ─────────────────────────────────────────────────────────
  private activateKaizenMode(time: number): void {
    const state = this.state;
    state.isKaizenMode = true;
    state.kaizenEnergy = 100;
    state.kaizenAmmo = 10;
    this.sprite.setTint(0xff3333);
    this.audio.playPowerup();
  }

  private increaseEnergy(amount: number): void {
    const state = this.state;
    state.kaizenEnergy = Math.min(100, state.kaizenEnergy + amount);
    if (state.kaizenEnergy >= 100 && !state.isKaizenMode) {
      this.activateKaizenMode(this.scene.time.now);
    }
  }

  private takeDamage(): void {
    const state = this.state;
    const now = this.scene.time.now;
    if (state.invulnerableUntil > now) return;

    this.audio.playDamage();
    state.hearts = Math.max(0, state.hearts - 1);
    (this.sprite as any).hp = state.hearts;
    this.onHudEmit();
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => this.onRestoreTint());
    if (state.hearts <= 0) {
      this.triggerGameOver();
      return;
    }
    this.triggerDamageRespawn();
  }

  private handlePitFall(): void {
    const state = this.state;
    this.audio.playDamage();

    state.hearts = Math.max(0, state.hearts - 1);
    (this.sprite as any).hp = state.hearts;
    this.onHudEmit();

    if (state.hearts <= 0) {
      this.triggerGameOver();
      return;
    }

    this.triggerDamageRespawn();
  }

  private triggerDamageRespawn(): void {
    const state = this.state;
    const now = this.scene.time.now;

    this.controlsLocked = true;
    this.scene.time.delayedCall(1000, () => {
      this.controlsLocked = false;
    });

    const targetX = this.scene.cameras.main.scrollX + 100;
    this.sprite.setPosition(targetX, 100);
    this.sprite.setVelocity(0, 0);

    this.sprite.setAlpha(1);
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: 14,
      onComplete: () => {
        if (this.sprite && this.sprite.active) {
          this.sprite.setAlpha(1);
        }
      }
    });

    state.invulnerableUntil = now + 3000;
  }

  private triggerGameOver(): void {
    this.state.currentPhase = 'game_over';
    this.state.gameSpeed = 0;
    this.sprite.setVelocity(0, 0);
    this.sprite.play(`${this.state.activeGender}_hit`);
    this.scene.game.events.emit('game-over-trigger');
  }

  // ─── Option B: Initialize Collision Handlers as Arrow Functions ───────────
  // Các arrow function này close over `this`, `state`, `audio` — không cần
  // bind context khi truyền vào physics.add.overlap().
  private initCollisionHandlers(): void {
    const state = this.state;
    const audio = this.audio;
    const scene = this.scene;

    // Flask collection
    this.onCollectFlask = (_player, flask) => {
      flask.destroy();
      audio.playFlask();
      state.score += SCORE_RULES.experienceFlask;
      state.flasksCollected += 1;
      if (!state.isKaizenMode) this.increaseEnergy(RUNNER_PHYSICS.energyPerFlask);
      this.onHudEmit();
    };

    // Powerup collection
    this.onCollectPowerup = (_player, powerup) => {
      const kind = powerup.getData('kind') as string;
      powerup.destroy();
      audio.playPowerup();
      const time = scene.time.now;
      if (kind === 'respect') {
        state.shieldUntil = time + RUNNER_PHYSICS.shieldDuration;
        this.sprite.setTint(0x00ff00);
      } else if (kind === 'wings') {
        state.wingsUntil = time + RUNNER_PHYSICS.wingsDuration;
        this.sprite.setTint(0x00e5ff);
      } else if (kind === 'keyboard') {
        this.activateKaizenMode(time);
      }
      this.onHudEmit();
    };

    // Enemy collision — stomp hoặc nhận sát thương
    this.onHitEnemy = (_player, enemy) => {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      const isStomp = body.velocity.y > 0 && this.sprite.y + 15 < enemy.y;
      const onShield = state.shieldUntil > scene.time.now;
      if (isStomp) {
        enemy.play('bug_death', true);
        enemy.body.setEnable(false);
        this.sprite.setVelocityY(-250); // Bounce
        audio.playFlask();
        const pts =
          enemy.getData('kind') === 'flying_bug'
            ? SCORE_RULES.flyingBugDefeated
            : SCORE_RULES.groundBugDefeated;
        state.score += pts;
        this.increaseEnergy(RUNNER_PHYSICS.energyPerBug);
        scene.time.delayedCall(300, () => enemy.destroy());
      } else {
        enemy.destroy();
        if (!onShield) this.takeDamage();
      }
    };

    // Obstacle collision
    this.onHitObstacle = (_player, obstacle) => {
      obstacle.destroy();
      if (state.shieldUntil > scene.time.now || state.invulnerableUntil > scene.time.now) return;
      this.takeDamage();
    };

    // Player projectile hits enemy
    this.onProjectileHitEnemy = (proj, enemy) => {
      proj.destroy();
      enemy.play('bug_death', true);
      enemy.body.setEnable(false);
      audio.playFlask();
      const pts =
        enemy.getData('kind') === 'flying_bug'
          ? SCORE_RULES.flyingBugDefeated
          : SCORE_RULES.groundBugDefeated;
      state.score += pts;
      this.increaseEnergy(RUNNER_PHYSICS.energyPerBug);
      scene.time.delayedCall(300, () => enemy.destroy());
    };

    // Player projectile cancels boss projectile
    this.onProjectileHitBossProjectile = (pProj, bProj) => {
      pProj.destroy();
      bProj.destroy();
    };

    // Boss projectile hits player
    this.onHitBossProjectile = (_player, bullet) => {
      bullet.destroy();
      if (state.shieldUntil > scene.time.now || state.invulnerableUntil > scene.time.now) return;
      this.takeDamage();
    };
  }

  // ─── Respawn ──────────────────────────────────────────────────────────────
  /** Đặt lại trạng thái player sau khi respawn. Gọi từ GameScene.respawn(). */
  respawn(options: {
    isAtBoss: boolean;
    bossTriggerX: number;
    checkpointX: number;
  }): void {
    const state = this.state;
    // Reset buff state
    state.isKaizenMode = false;
    state.shieldUntil = 0;
    state.wingsUntil = 0;
    state.kaizenUntil = 0;
    state.nextShootTime = 0;
    state.gameTimeElapsed = 0;
    state.kaizenAmmo = 0;
    this.onRestoreTint();
    this.sprite.play(`${state.activeGender}_run`);
    this.resetJumpState();
    this.controlsLocked = false;

    // Reset invulnerability
    state.invulnerableUntil = 0;
    this.sprite.setAlpha(1);
    (this.sprite as any).hp = 3;

    // Reposition
    const spawnX = options.isAtBoss
      ? options.bossTriggerX + this.scene.scale.width * 0.2
      : (options.checkpointX === 0 ? -50 : options.checkpointX + 100);
    const spawnY = 200;
    this.lastSafePos = { x: spawnX, y: spawnY };
    this.sprite.setPosition(spawnX, spawnY).setVelocity(0, 0);
  }
}
