import Phaser from 'phaser';
import { RUNNER_PHYSICS, SCORE_RULES, calculateMapScore, MapKey, GamePhase } from '../constants';
import { hanoiMapConfig } from '../maps/hanoi';
import { tokyoMapConfig } from '../maps/tokyo';
import { danangMapConfig } from '../maps/danang';
import { MapConfig, SpawnType } from '../maps/MapConfig';

// Audio Synthesizer helper using Web Audio API for fallback/zero-dependency SFX
class AudioSynth {
  private ctx: AudioContext | null = null;

  constructor() {
    // Lazy initialized on first user interaction to comply with browser autoplay policies
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playFlask() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); // High pitched ping
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playDamage() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.3); // Pitch slide down
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playJump() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playShoot() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
    osc.frequency.setValueAtTime(500, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playPowerup() {
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + index * 0.08);
      gain.gain.setValueAtTime(0.1, this.ctx!.currentTime + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + index * 0.08 + 0.2);

      osc.start(this.ctx!.currentTime + index * 0.08);
      osc.stop(this.ctx!.currentTime + index * 0.08 + 0.2);
    });
  }

  playVictory() {
    this.init();
    if (!this.ctx) return;
    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25];
    const rhythm = [0.15, 0.15, 0.15, 0.25, 0.15, 0.5];
    let time = this.ctx.currentTime;
    notes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + rhythm[index]);

      osc.start(time);
      osc.stop(time + rhythm[index]);
      time += rhythm[index] * 1.1;
    });
  }
}

export default class GameScene extends Phaser.Scene {
  // Config
  private mapConfig: MapConfig = hanoiMapConfig;

  // Audio Synthesizer
  private audioSynth = new AudioSynth();

  // Physics & Entities
  private player!: Phaser.Physics.Arcade.Sprite;
  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;
  private backgroundLayers: { sprite: Phaser.GameObjects.TileSprite; scrollFactorX: number }[] = [];
  
  // Game state representation (consistent with GDD)
  private currentPhase: GamePhase = 'runner';
  private score = 0;
  private hearts = 3;
  private kaizenEnergy = 0;
  private isKaizenMode = false;
  
  // Entity groups
  private flasksGroup!: Phaser.Physics.Arcade.Group;
  private powerupsGroup!: Phaser.Physics.Arcade.Group;
  private enemiesGroup!: Phaser.Physics.Arcade.Group;
  private obstaclesGroup!: Phaser.Physics.Arcade.Group;
  private playerProjectiles!: Phaser.Physics.Arcade.Group;
  private bossProjectiles!: Phaser.Physics.Arcade.Group;
  
  // Boss Entity properties
  private bossSprite: Phaser.Physics.Arcade.Sprite | null = null;
  private bossHp = 0;
  private maxBossHp = 0;
  private bossActive = false;
  private nextBossAttackTime = 0;

  // Level Spawning progress variables
  private nextGroundX = 0;
  private nextPatternX = 800; // start spawning patterns after 800px
  private activePitRanges: { start: number; end: number }[] = [];
  private bossTriggerX = 6000; // reach 6000px to fight the Boss
  
  // Timers & Cooldowns
  private shieldUntil = 0;
  private wingsUntil = 0;
  private kaizenUntil = 0;
  private nextShootTime = 0;
  private gameTimeElapsed = 0; // seconds
  private lastScore = -1;
  private lastHearts = -1;
  private lastEnergy = -1;
  private lastBossHp = -1;
  private lastPhase = '';
  private lastTimeElapsed = -1;

  // Controls
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
  };

  // Checkpoint saves
  private checkpointScore = 0;
  private checkpointEnergy = 0;
  private checkpointX = 0;

  // Mascot customization
  private activeSkin = 'skin_default';
  private activeTitle = '';
  private activeGender = 'male';
  private titleTextObject: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('GameScene');
  }

  init(data?: { mapKey?: MapKey }) {
    this.score = 0;
    this.hearts = 3;
    this.kaizenEnergy = 0;
    this.isKaizenMode = false;
    this.currentPhase = 'runner';
    this.nextGroundX = 0;
    this.nextPatternX = 800;
    this.activePitRanges = [];
    this.backgroundLayers = [];
    this.gameTimeElapsed = 0;
    this.bossActive = false;
    this.lastScore = -1;
    this.lastHearts = -1;
    this.lastEnergy = -1;
    this.lastBossHp = -1;
    this.lastPhase = '';
    this.lastTimeElapsed = -1;
    this.bossSprite = null;
    
    this.checkpointScore = 0;
    this.checkpointEnergy = 0;
    this.checkpointX = 0;

    // Load active customization from registry
    this.activeSkin = this.registry.get('activeSkin') || 'skin_default';
    this.activeTitle = this.registry.get('activeTitle') || '';
    this.activeGender = this.registry.get('activeGender') || 'male';

    const activeMapKey = data?.mapKey || 'hanoi';
    if (activeMapKey === 'tokyo') {
      this.mapConfig = tokyoMapConfig;
    } else if (activeMapKey === 'danang') {
      this.mapConfig = danangMapConfig;
    } else {
      this.mapConfig = hanoiMapConfig;
    }
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 1. Create Parallax Backgrounds
    this.createParallaxBackgrounds(width, height);

    // 2. Initialize physics groups
    this.groundGroup = this.physics.add.staticGroup();
    this.flasksGroup = this.physics.add.group({ allowGravity: false });
    this.powerupsGroup = this.physics.add.group({ allowGravity: false });
    this.enemiesGroup = this.physics.add.group({ gravityY: 0 }); // ground bugs have gravity, flying do not (handle inside loop)
    this.obstaclesGroup = this.physics.add.group();
    this.playerProjectiles = this.physics.add.group({ allowGravity: false });
    this.bossProjectiles = this.physics.add.group({ allowGravity: false });

    // 3. Create Player Mascot
    // Ground top surface at Y≈394 (GROUND_Y=424 - halfHeight=30)
    // Player sprite height=204px, scaled 1.2x -> 245px, half=122px
    // Player feet at Y=394 -> player center at Y=394-122=272 (before physics settles)
    // Spawn slightly above: Y=300 and let gravity settle on ground
    this.activeGender = this.registry.get('activeGender') || 'male';
    // Spawn above ground: physics will settle player on top of ground blocks
    // Ground visual starts at Y=350. Block top=350, block center(GROUND_Y)=380.
    // Player body bottom settles at 350 → sprite.y ≈ 350-(120-38.4)=268
    this.player = this.physics.add.sprite(150, 200, `mascot_${this.activeGender}`);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(RUNNER_PHYSICS.gravity);
    this.player.setScale(1.2);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setSize(40, 120);
    playerBody.setOffset(65, 84);
    this.player.play(`${this.activeGender}_run`);
    this.restoreMapTint();
    this.player.setDepth(5);
    this.player.setVisible(false); // Hide the character as requested

    // Create floating title text GameObject
    this.titleTextObject = this.add.text(150, 250, '', {
      font: '900 10px Courier New, monospace',
      color: '#00e5ff',
      backgroundColor: '#111125dd',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5, 0.5);
    this.titleTextObject.setDepth(10);
    this.updateTitleText();

    // Listen to on-the-fly customization updates
    const onSkinUpdate = (skin: string) => {
      this.activeSkin = skin;
      this.restoreMapTint();
    };
    const onTitleUpdate = (title: string) => {
      this.activeTitle = title;
      this.updateTitleText();
    };
    const onGenderUpdate = (gender: string) => {
      this.activeGender = gender;
      this.player.setTexture(`mascot_${gender}`);
      const currentAnimKey = this.player.anims.currentAnim?.key;
      if (currentAnimKey) {
        const parts = currentAnimKey.split('_');
        const stateName = parts[parts.length - 1]; // 'run', 'idle', 'jump', 'crouch', 'fly', 'hit'
        this.player.play(`${gender}_${stateName}`, true);
      } else {
        this.player.play(`${gender}_run`, true);
      }
    };

    this.game.events.on('skin-update', onSkinUpdate);
    this.game.events.on('title-update', onTitleUpdate);
    this.game.events.on('gender-update', onGenderUpdate);

    this.events.on('shutdown', () => {
      this.game.events.off('skin-update', onSkinUpdate);
      this.game.events.off('title-update', onTitleUpdate);
      this.game.events.off('gender-update', onGenderUpdate);
    });

    // 4. Setup collisions & overlaps
    this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.enemiesGroup, this.groundGroup);
    this.physics.add.collider(this.obstaclesGroup, this.groundGroup);

    this.physics.add.overlap(this.player, this.flasksGroup, this.collectFlask, undefined, this);
    this.physics.add.overlap(this.player, this.powerupsGroup, this.collectPowerup, undefined, this);
    this.physics.add.overlap(this.player, this.enemiesGroup, this.hitEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.obstaclesGroup, this.hitObstacle, undefined, this);

    this.physics.add.overlap(this.playerProjectiles, this.enemiesGroup, this.projectileHitEnemy, undefined, this);
    this.physics.add.overlap(this.playerProjectiles, this.bossProjectiles, (pProj, bProj) => {
      pProj.destroy();
      bProj.destroy();
    });
    this.physics.add.overlap(this.player, this.bossProjectiles, this.hitBossProjectile, undefined, this);

    // 5. Setup keyboard input mappings
    this.keys = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      s: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      space: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    };

    // 6. Camera & Physics World Bounds properties
    // We let the camera follow the player on X axis.
    this.cameras.main.setBounds(0, 0, 99999, height);
    this.physics.world.setBounds(0, 0, 99999, height);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.cameras.main.startFollow(this.player, true, 1.0, 1.0, -250, 0);

    // Emit initial HUD state
    this.emitHudState();

    // 7. Expose debug testing hooks for develop-web-game skill
    const globalWindow = window as any;
    globalWindow.gameScene = this;
    globalWindow.render_game_to_text = () => {
      const pBody = this.player.body as Phaser.Physics.Arcade.Body;
      return JSON.stringify({
        phase: this.currentPhase,
        camera: {
          scrollX: Math.round(this.cameras.main.scrollX),
          scrollY: Math.round(this.cameras.main.scrollY)
        },
        player: {
          x: Math.round(this.player.x),
          y: Math.round(this.player.y),
          velocityX: pBody ? Math.round(pBody.velocity.x) : 0,
          velocityY: pBody ? Math.round(pBody.velocity.y) : 0,
          blocked: pBody ? pBody.blocked : {},
          touching: pBody ? pBody.touching : {},
          hearts: this.hearts,
          energy: this.kaizenEnergy,
          isKaizen: this.isKaizenMode,
          isFlying: this.wingsUntil > this.time.now,
          hasShield: this.shieldUntil > this.time.now
        },
        boss: this.bossSprite ? {
          x: Math.round(this.bossSprite.x),
          hp: this.bossHp
        } : null,
        score: this.score,
        groundBlocks: this.groundGroup.getChildren().length,
        enemies: this.enemiesGroup.getChildren().map((e: any) => ({
          x: Math.round(e.x),
          y: Math.round(e.y),
          active: e.active
        }))
      });
    };

    globalWindow.advanceTime = (ms: number) => {
      const steps = Math.max(1, Math.round(ms / (1000 / 60)));
      for (let i = 0; i < steps; i++) {
        this.update(this.time.now, 1000 / 60);
      }
    };
  }

  update(time: number, delta: number) {
    const isPlayerDead = this.hearts <= 0;
    if (isPlayerDead) {
      if (this.titleTextObject) this.titleTextObject.setVisible(false);
      return;
    }

    // Hide title text during map clear / transitions
    if (this.currentPhase === 'map_clear' && this.titleTextObject) {
      this.titleTextObject.setVisible(false);
    }

    // Track survival time
    if (this.currentPhase !== 'map_clear') {
      this.gameTimeElapsed += delta / 1000;
    }

    // Dynamic ground and pattern generator
    if (this.currentPhase === 'runner') {
      this.generateTerrain();
      this.generatePatterns();
      this.checkBossTrigger();

      // Check intermediate checkpoints at 2000px and 4000px
      if (this.player.x >= 2000 && this.checkpointX < 2000) {
        this.saveCheckpoint(2000);
      } else if (this.player.x >= 4000 && this.checkpointX < 4000) {
        this.saveCheckpoint(4000);
      }
    }

    // Handle character states & controls
    this.handlePlayerMovement(time);

    // Update active title position to float right above the mascot's head
    if (this.titleTextObject && this.titleTextObject.visible && this.currentPhase !== 'map_clear') {
      this.titleTextObject.setPosition(this.player.x, this.player.y - 45);
    }

    // Update parallax position
    this.updateParallax();

    // Custom updates for entities
    this.updateEntities(time);

    // Emit hud metrics to react overlay
    this.emitHudState();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PARALLAX BACKGROUND SYSTEM
  // Canvas: 960×540px  |  Source textures: 1344×256px (bg_sky, bg_mid, bg_ground)
  //
  // TileSprite behaviour:
  //   - displayWidth/Height = area filled on screen
  //   - tileScaleX = 1  → tile shows at natural 1344px width; 960px viewport shows
  //                        first 960px (71%); parallax done by scrolling tilePositionX
  //   - tileScaleY = H/256 → stretches tile vertically to fill the layer's display height
  //
  // Layer stack (top→bottom of canvas, depth 0=far, 9=near):
  //   0  SKY        bg_sky    Y=  0  H=260  speed=0.03x  (far, near-static)
  //   1  FAR CITY   bg_mid    Y= 80  H=270  speed=0.10x  (distant buildings)
  //   2  NEAR CITY  bg_mid    Y=140  H=260  speed=0.20x  (closer buildings, darker)
  //   3  GROUND     bg_ground Y=350  H=190  speed=1.00x  (walks here, 1:1 camera)
  // ═══════════════════════════════════════════════════════════════════════
  private createParallaxBackgrounds(width: number, height: number) {
    const scale = height / 1024; // Scale factor for 1024x1024 square background assets

    // ── LAYER 0: SKY ─────────────────────────────────────────────────────
    const skySprite = this.add.tileSprite(0, 0, width, height, 'hanoi_bg_sky')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(0).setTileScale(scale, scale);
    this.backgroundLayers.push({ sprite: skySprite, scrollFactorX: 0.05 });

    // ── LAYER 1: CLOUDS ──────────────────────────────────────────────────
    const cloudsSprite = this.add.tileSprite(0, 0, width, height, 'hanoi_clouds_floating')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1).setTileScale(scale, scale);
    this.backgroundLayers.push({ sprite: cloudsSprite, scrollFactorX: 0.1 });

    // ── LAYER 2: FAR LANDMARKS ───────────────────────────────────────────
    const farLandmarksSprite = this.add.tileSprite(0, 0, width, height, 'hanoi_bg_far_landmarks')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(2).setTileScale(scale, scale);
    this.backgroundLayers.push({ sprite: farLandmarksSprite, scrollFactorX: 0.3 });

    // ── LAYER 3: MID CITY ────────────────────────────────────────────────
    // scenery_clean.png has height 103, place it sitting right on the pavement (Y = 350 - 103 = 247)
    const midCitySprite = this.add.tileSprite(0, 247, width, 103, 'hanoi_bg_mid_city')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(3);
    this.backgroundLayers.push({ sprite: midCitySprite, scrollFactorX: 0.6 });

    // ── LAYER 4: GROUND / PAVEMENT (Depth 4) ──────────────────────────────
    const groundLayerY = 350;
    const groundH = height - groundLayerY; // 190
    const groundBgSprite = this.add.tileSprite(0, groundLayerY, width, groundH, 'hanoi_road_track')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(4);
    this.backgroundLayers.push({ sprite: groundBgSprite, scrollFactorX: 1.0 });

    // ── LAYER 5: FOREGROUND (Depth 6 - In front of player) ────────────────
    const fgSprite = this.add.tileSprite(0, 0, width, height, 'hanoi_fg_scenery')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(6).setTileScale(scale, scale);
    this.backgroundLayers.push({ sprite: fgSprite, scrollFactorX: 1.5 });

    // ── MAP TINTS ─────────────────────────────────────────────────────────
    if (this.mapConfig.mapKey === 'tokyo') {
      skySprite.setTint(0xffb3d9);
      midCitySprite.setTint(0xff99cc); farLandmarksSprite.setTint(0xffcce0);
    } else if (this.mapConfig.mapKey === 'danang') {
      skySprite.setTint(0x80ffff);
      midCitySprite.setTint(0x99eeff); farLandmarksSprite.setTint(0xaaffff);
    }
  }

  private updateParallax() {
    const camX = this.cameras.main.scrollX;
    this.backgroundLayers.forEach((layer) => {
      // scroll position based on scrollFactorX
      layer.sprite.tilePositionX = camX * layer.scrollFactorX;
    });
  }

  // GENERATOR SYSTEM
  private generateTerrain() {
    const playerAheadX = this.player.x + 1024;
    // bg_ground layer: Y=350, H=190px (fills to 540)
    // Ground block: top=350, height=60, center=380
    // Player body bottom settles at 350 (block top) → player stands visually on pavement.
    const GROUND_Y = 380; // center of 60px static block (top=350, bottom=410)
    while (this.nextGroundX < playerAheadX) {
      // Check if this coordinate falls in a Pit Range
      const inPit = this.activePitRanges.some(
        (range) => this.nextGroundX >= range.start && this.nextGroundX <= range.end
      );

      if (!inPit) {
        // Invisible static block — visual ground is the bg_ground TileSprite
        const block = this.groundGroup.create(this.nextGroundX + 32, GROUND_Y, 'hanoi_tileset');
        block.setDisplaySize(64, 60);
        block.setAlpha(0);
        block.body.updateFromGameObject();
      }

      this.nextGroundX += 64;
    }
  }

  private generatePatterns() {
    // Check if it's time to spawn a pattern ahead of the player
    // Generate patterns up to player.x + 1500 to stay ahead of generateTerrain
    while (this.nextPatternX < this.player.x + 1500 && this.nextPatternX < this.bossTriggerX - 800) {
      const patterns = this.mapConfig.spawnPatterns;
      const randomPattern = Phaser.Utils.Array.GetRandom(patterns);
      
      this.spawnPattern(randomPattern, this.nextPatternX);
      
      // Schedule next pattern spawn
      this.nextPatternX += randomPattern.width + Phaser.Math.Between(400, 800);
    }
  }

  private spawnPattern(pattern: any, startX: number) {
    pattern.items.forEach((item: any) => {
      const spawnX = startX + item.xOffset;
      const spawnY = item.y;

      switch (item.type) {
        case 'experience_flask':
          const flask = this.flasksGroup.create(spawnX, spawnY, 'xp_flask');
          flask.setDisplaySize(32, 32);
          flask.body.updateFromGameObject();
          break;

        case 'respect_shield':
          const p1 = this.powerupsGroup.create(spawnX, spawnY, 'powerups');
          p1.setFrame(0); // Respect Shield lotus
          p1.setDisplaySize(40, 40);
          p1.setData('kind', 'respect');
          p1.body.updateFromGameObject();
          break;

        case 'responsibility_wings':
          const p2 = this.powerupsGroup.create(spawnX, spawnY, 'powerups');
          p2.setFrame(1); // Responsibility Wings
          p2.setDisplaySize(40, 40);
          p2.setData('kind', 'wings');
          p2.body.updateFromGameObject();
          break;

        case 'kaizen_keyboard':
          const p3 = this.powerupsGroup.create(spawnX, spawnY, 'powerups');
          p3.setFrame(2); // Kaizen Keyboard
          p3.setDisplaySize(45, 40);
          p3.setData('kind', 'keyboard');
          p3.body.updateFromGameObject();
          break;

        case 'ground_bug':
          const bugG = this.enemiesGroup.create(spawnX, spawnY, 'hanoi_enemies');
          bugG.setScale(1.2);
          bugG.play('bug_staging_crawl');
          bugG.setData('kind', 'ground_bug');
          bugG.body.setGravityY(500);
          if (this.mapConfig.mapKey === 'tokyo') {
            bugG.setTint(0xff66cc); // Pink bug
          } else if (this.mapConfig.mapKey === 'danang') {
            bugG.setTint(0x33ffff); // Cyan bug
          }
          break;

        case 'flying_bug':
          const bugF = this.enemiesGroup.create(spawnX, spawnY, 'hanoi_enemies');
          bugF.setScale(1.2);
          bugF.play('bug_prod_fly');
          bugF.setData('kind', 'flying_bug');
          bugF.body.setAllowGravity(false);
          if (this.mapConfig.mapKey === 'tokyo') {
            bugF.setTint(0xff33cc);
          } else if (this.mapConfig.mapKey === 'danang') {
            bugF.setTint(0x00cccc);
          }
          // Let flying bugs hover up/down slightly
          this.tweens.add({
            targets: bugF,
            y: bugF.y - 20,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
          break;

        case 'pit':
          // Add this segment range to the active pits (gaps in ground spawning)
          this.activePitRanges.push({
            start: spawnX,
            end: spawnX + 128
          });
          break;

        case 'bomb':
          // Obstacle 1: Tech Debt Bomb
          const bomb = this.obstaclesGroup.create(spawnX, spawnY, 'obstacles');
          bomb.setFrame(1); // Orange bomb
          bomb.setDisplaySize(40, 40);
          bomb.body.updateFromGameObject();
          break;

        case 'platform':
          // Spawn elevated one-way platform block (using hanoi_tileset)
          const platformW = item.width || 128;
          const platformH = item.height || 32;
          const platform = this.groundGroup.create(spawnX + platformW / 2, spawnY + platformH / 2, 'hanoi_tileset');
          platform.setDisplaySize(platformW, platformH);
          platform.body.updateFromGameObject();
          // One-way collision: allow jumping from bottom to top, and running through sides
          platform.body.checkCollision.down = false;
          platform.body.checkCollision.left = false;
          platform.body.checkCollision.right = false;
          break;
      }
    });
  }

  // PLAYER SYSTEM
  private handlePlayerMovement(time: number) {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const isFlying = this.wingsUntil > time;
    const isCrouching = (this.keys.down.isDown || this.keys.s.isDown) && !isFlying;
    const onGround = playerBody.touching.down;

    // Pit death: player's body passes below the ground layer (groundLayerY=350, tolerance=160)
    // Disabled temporarily during map layout build — re-enable by setting DEV_NO_DEATH=false
    const DEV_NO_DEATH = false; // set to true to test map without dying
    if (!DEV_NO_DEATH && this.player.y > 510 && this.currentPhase !== 'game_over') {
      this.playerDeathByPit();
      return;
    }

    // 1. Horizontal movement
    if (this.currentPhase === 'runner') {
      // Endless auto runner: player velocity is constant
      const runSpeed = this.isKaizenMode 
        ? RUNNER_PHYSICS.hanoiSpeed * 1.5 * 60 
        : RUNNER_PHYSICS.hanoiSpeed * 60;
      this.player.setVelocityX(runSpeed);
    } else if (this.currentPhase === 'boss') {
      // In boss phase, player is locked horizontally, can move left/right slightly in a restricted box
      const moveLeft = this.keys.down.isDown || this.keys.s.isDown; // Crouch only
      this.player.setVelocityX(0); // Lock to track camera scroll
    }

    // 2. Flight mode vs normal movement
    if (isFlying) {
      playerBody.setAllowGravity(false);
      this.player.setVelocityY(0);
      
      const speed = 250;
      if (this.keys.up.isDown || this.keys.w.isDown) {
        this.player.setVelocityY(-speed);
      } else if (this.keys.down.isDown || this.keys.s.isDown) {
        this.player.setVelocityY(speed);
      }

      if (this.player.anims.currentAnim?.key !== `${this.activeGender}_fly`) {
        this.player.play(`${this.activeGender}_fly`);
      }
      playerBody.setSize(40, 120);
      playerBody.setOffset(65, 84);
    } else {
      playerBody.setAllowGravity(true);

      // JUMP
      if ((this.keys.up.isDown || this.keys.w.isDown) && onGround) {
        this.audioSynth.playJump();
        const force = this.isKaizenMode ? RUNNER_PHYSICS.kaizenJumpForce : RUNNER_PHYSICS.jumpForce;
        this.player.setVelocityY(force);
        this.player.play(`${this.activeGender}_jump`);
      }

      // Variable jump height damping (Mario physics)
      const jumpReleased = !this.keys.up.isDown && !this.keys.w.isDown;
      if (jumpReleased && playerBody.velocity.y < -100) {
        playerBody.setVelocityY(-100);
      }
      
      // CROUCH
      if (isCrouching) {
        if (this.player.anims.currentAnim?.key !== `${this.activeGender}_crouch`) {
          this.player.play(`${this.activeGender}_crouch`);
          // Reduce body size for crouch hitbox
          playerBody.setSize(40, 80);
          playerBody.setOffset(65, 124);
        }
      } else {
        // Run state or jump state
        if (onGround) {
          if (this.player.anims.currentAnim?.key !== `${this.activeGender}_run` && this.player.anims.currentAnim?.key !== `${this.activeGender}_jump`) {
            this.player.play(`${this.activeGender}_run`);
          }
        }
        // Restore standard bounding box size
        playerBody.setSize(40, 120);
        playerBody.setOffset(65, 84);
      }
    }

    // 3. Handle Kaizen Mode Energy accumulation over time
    if (this.currentPhase !== 'game_over' && this.currentPhase !== 'map_clear') {
      if (!this.isKaizenMode) {
        const energyGain = (RUNNER_PHYSICS.energyPerSecond * deltaSeconds(this.game.loop.delta)) / 1000;
        this.increaseEnergy(energyGain);
      } else {
        // Deplete energy in Kaizen mode
        if (this.kaizenUntil < time) {
          this.isKaizenMode = false;
          this.restoreMapTint();
          this.player.play(`${this.activeGender}_run`);
        }
      }
    }

    // 4. Keyboard Shooting (Only during Kaizen Mode)
    if (this.isKaizenMode && this.keys.space.isDown && time > this.nextShootTime) {
      this.shootProjectile(time);
    }
  }

  private shootProjectile(time: number) {
    this.audioSynth.playShoot();
    this.nextShootTime = time + RUNNER_PHYSICS.shootCooldown;
    
    // Spawn projectile from player center
    const proj = this.playerProjectiles.create(this.player.x + 30, this.player.y, 'powerups');
    proj.setFrame(2); // Use Kaizen Keyboard keycap art
    proj.setDisplaySize(20, 20);
    proj.setVelocityX(600); // Shoot fast right
    proj.body.updateFromGameObject();
  }

  private collectFlask(playerObj: any, flaskObj: any) {
    flaskObj.destroy();
    this.audioSynth.playFlask();
    this.score += SCORE_RULES.experienceFlask;
    
    if (!this.isKaizenMode) {
      this.increaseEnergy(RUNNER_PHYSICS.energyPerFlask);
    }
    this.emitHudState();
  }

  private collectPowerup(playerObj: any, powerupObj: any) {
    const kind = powerupObj.getData('kind');
    powerupObj.destroy();
    this.audioSynth.playPowerup();

    const time = this.time.now;
    if (kind === 'respect') {
      this.shieldUntil = time + RUNNER_PHYSICS.shieldDuration;
      // Draw temporary cyan aura on player
      this.player.setTint(0x00ff00);
    } else if (kind === 'wings') {
      this.wingsUntil = time + RUNNER_PHYSICS.wingsDuration;
      this.player.setTint(0x00e5ff);
    } else if (kind === 'keyboard') {
      // Instantly trigger Kaizen Mode
      this.activateKaizenMode(time);
    }

    this.emitHudState();
  }

  private activateKaizenMode(time: number) {
    this.isKaizenMode = true;
    this.kaizenEnergy = 100;
    this.kaizenUntil = time + RUNNER_PHYSICS.kaizenDuration;
    this.player.setTint(0xff3333); // Red glow
    this.audioSynth.playPowerup();
  }

  private increaseEnergy(amount: number) {
    this.kaizenEnergy = Math.min(100, this.kaizenEnergy + amount);
    if (this.kaizenEnergy >= 100 && !this.isKaizenMode) {
      // Auto activate
      this.activateKaizenMode(this.time.now);
    }
  }

  private hitEnemy(playerObj: any, enemyObj: any) {
    const onShield = this.shieldUntil > this.time.now;
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const isStomp = playerBody.velocity.y > 0 && (this.player.y + 15 < enemyObj.y);

    if (isStomp) {
      // Stomp defeat
      enemyObj.play('bug_death', true);
      enemyObj.body.setEnable(false); // disable physics
      this.player.setVelocityY(-250); // Bounce up
      this.audioSynth.playFlask();
      
      const kind = enemyObj.getData('kind');
      const pts = kind === 'flying_bug' ? SCORE_RULES.flyingBugDefeated : SCORE_RULES.groundBugDefeated;
      this.score += pts;
      this.increaseEnergy(RUNNER_PHYSICS.energyPerBug);

      this.time.delayedCall(300, () => {
        enemyObj.destroy();
      });
    } else {
      // Side hit: take damage if shield is not active
      enemyObj.destroy();
      if (onShield) return;

      this.takeDamage();
    }
  }

  private hitObstacle(playerObj: any, obstacleObj: any) {
    obstacleObj.destroy();
    if (this.shieldUntil > this.time.now) return; // Immune

    this.takeDamage();
  }

  private projectileHitEnemy(projObj: any, enemyObj: any) {
    projObj.destroy();
    enemyObj.play('bug_death', true);
    enemyObj.body.setEnable(false);
    
    this.audioSynth.playFlask();
    const kind = enemyObj.getData('kind');
    const pts = kind === 'flying_bug' ? SCORE_RULES.flyingBugDefeated : SCORE_RULES.groundBugDefeated;
    this.score += pts;
    this.increaseEnergy(RUNNER_PHYSICS.energyPerBug);

    this.time.delayedCall(300, () => {
      enemyObj.destroy();
    });
  }

  private takeDamage() {
    this.audioSynth.playDamage();
    this.hearts = Math.max(0, this.hearts - 1);
    this.emitHudState();

    // Damage flash red
    this.player.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      this.restoreMapTint();
    });

    if (this.hearts <= 0) {
      this.triggerGameOver();
    }
  }

  private playerDeathByPit() {
    this.audioSynth.playDamage();
    this.hearts = 0;
    this.emitHudState();
    this.triggerGameOver();
  }

  private saveCheckpoint(x: number) {
    this.checkpointX = x;
    this.checkpointScore = this.score;
    this.checkpointEnergy = this.kaizenEnergy;
    
    // Play a nice checkpoint visual notification on screen
    const checkpointText = this.add.text(this.player.x, 200, 'LƯU CHECKPOINT!', {
      font: '800 20px var(--font-display)',
      color: '#00e5ff'
    }).setOrigin(0.5, 0.5);
    checkpointText.setShadow(0, 0, '#00e5ff', 10, true, true);
    checkpointText.setDepth(100);
    
    this.tweens.add({
      targets: checkpointText,
      y: 130,
      alpha: 0,
      duration: 2000,
      onComplete: () => checkpointText.destroy()
    });
  }

  // BOSS FIGHT SYSTEM
  private checkBossTrigger() {
    if (this.player.x >= this.bossTriggerX && this.currentPhase === 'runner') {
      this.currentPhase = 'boss_intro';
      this.player.setVelocityX(0);
      
      // Save checkpoint state
      this.checkpointScore = this.score;
      this.checkpointEnergy = this.kaizenEnergy;
      this.checkpointX = this.bossTriggerX;

      // Lock Camera Follow, let player stand on Y only
      this.cameras.main.stopFollow();
      
      // Emit trigger to HUD overlay to display boss intro cutscene
      this.game.events.emit('boss-intro-trigger', this.mapConfig.cutscenes.bossIntro);

      // Spawn Boss off screen right
      const bossX = this.player.x + 600;
      this.bossSprite = this.physics.add.sprite(bossX, 300, 'hanoi_boss');
      const bossBody = this.bossSprite.body as Phaser.Physics.Arcade.Body;
      bossBody.setAllowGravity(false);
      this.bossSprite.play('boss_idle');
      this.bossSprite.setScale(1.2);
      if (this.mapConfig.mapKey === 'tokyo') {
        this.bossSprite.setTint(0xff55bb);
      } else if (this.mapConfig.mapKey === 'danang') {
        this.bossSprite.setTint(0x00bbff);
      }
      this.maxBossHp = this.mapConfig.bossConfig.maxHp;
      this.bossHp = this.maxBossHp;

      // Add overlap collider with player shots
      this.physics.add.overlap(this.playerProjectiles, this.bossSprite, this.hitBoss, undefined, this);

      // Tween boss in
      this.tweens.add({
        targets: this.bossSprite,
        x: this.player.x + 320, // Sit in front of player
        duration: 2000,
        onComplete: () => {
          this.currentPhase = 'boss';
          this.bossActive = true;
          this.nextBossAttackTime = this.time.now + 1000;
        }
      });
    }
  }

  private hitBoss(projObj: any, bossObj: any) {
    projObj.destroy();
    if (this.currentPhase !== 'boss' || !this.bossActive) return;

    this.bossHp = Math.max(0, this.bossHp - 1);
    this.audioSynth.playFlask();

    // Flash white on hit
    this.bossSprite?.setTint(0xffffff);
    this.time.delayedCall(150, () => {
      this.bossSprite?.clearTint();
    });

    this.emitHudState();

    if (this.bossHp <= 0) {
      this.defeatBoss();
    }
  }

  private defeatBoss() {
    this.bossActive = false;
    this.currentPhase = 'map_clear';
    this.score += SCORE_RULES.bossDefeated;
    
    this.audioSynth.playVictory();
    
    // Play defeat explode
    this.bossSprite?.play('boss_defeated');
    this.tweens.add({
      targets: this.bossSprite,
      alpha: 0,
      y: this.bossSprite!.y + 100,
      duration: 1500,
      onComplete: () => {
        this.bossSprite?.destroy();
        this.bossSprite = null;
        
        // Save and trigger Map Clear cutscene
        this.score += SCORE_RULES.mapClearBonus;
        this.emitHudState();
        
        // Trigger React UI overlay
        this.game.events.emit('map-clear-trigger', {
          cutscene: this.mapConfig.cutscenes.mapClear,
          stats: {
            flasksCollected: Math.round(this.score / 50), // estimate
            heartsRemaining: this.hearts,
            score: this.score,
            gameTime: Math.round(this.gameTimeElapsed)
          }
        });
      }
    });
  }

  private handleBossAttack(time: number) {
    if (!this.bossSprite || !this.bossSprite.scene || !this.bossActive) return;

    if (time > this.nextBossAttackTime) {
      this.nextBossAttackTime = time + this.mapConfig.bossConfig.shootInterval;
      
      // Play boss attack anim
      this.bossSprite.play('boss_attack');
      this.bossSprite.chain('boss_idle');
      
      // Shoot projectile targeting player Y
      const bBullet = this.bossProjectiles.create(this.bossSprite.x - 60, this.bossSprite.y - 20, 'powerups');
      bBullet.setFrame(0); // red circular projectile
      bBullet.setDisplaySize(20, 20);
      bBullet.setTint(0xff3b30);
      
      // Calculate directional vector to player
      const angle = Phaser.Math.Angle.Between(bBullet.x, bBullet.y, this.player.x, this.player.y);
      const speed = this.mapConfig.bossConfig.bulletSpeed;
      this.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), speed, bBullet.body.velocity);
      bBullet.body.updateFromGameObject();
    }
  }

  private hitBossProjectile(playerObj: any, bulletObj: any) {
    bulletObj.destroy();
    if (this.shieldUntil > this.time.now) return; // immune
    this.takeDamage();
  }

  // TRANSITIONS
  private triggerGameOver() {
    this.currentPhase = 'game_over';
    this.player.setVelocity(0, 0);
    this.player.play(`${this.activeGender}_hit`);

    // Trigger overlay UI
    this.game.events.emit('game-over-trigger');
  }

  // Call from UI to respawn from checkpoint
  public respawn() {
    if (!this.player || !this.player.body) return;
    const isAtBoss = this.player.x >= this.bossTriggerX;
    
    // Reset state variables
    this.hearts = 3;
    this.isKaizenMode = false;
    this.shieldUntil = 0;
    this.wingsUntil = 0;
    this.kaizenUntil = 0;
    this.nextShootTime = 0;
    this.gameTimeElapsed = 0;
    this.restoreMapTint();
    this.player.play(`${this.activeGender}_run`);

    // Clear active projectile and obstacle/enemy entities
    this.enemiesGroup.clear(true, true);
    this.obstaclesGroup.clear(true, true);
    this.flasksGroup.clear(true, true);
    this.powerupsGroup.clear(true, true);
    this.playerProjectiles.clear(true, true);
    this.bossProjectiles.clear(true, true);
    this.activePitRanges = [];

    if (isAtBoss) {
      // Respawn at Boss phase
      this.score = this.checkpointScore;
      this.kaizenEnergy = this.checkpointEnergy;
      this.currentPhase = 'boss';
      this.bossHp = this.maxBossHp;
      this.bossActive = true;
      this.nextBossAttackTime = this.time.now + 1000;
      
      // Reposition player
      this.player.setPosition(this.bossTriggerX + 100, 300);
      this.player.setVelocity(0, 0);

      // Reposition boss
      if (this.bossSprite && this.bossSprite.scene) {
        this.bossSprite.setPosition(this.bossTriggerX + 420, 300);
        this.bossSprite.setAlpha(1);
        this.bossSprite.play('boss_idle');
      }

      // Re-initialize ground under player and boss in boss area
      this.groundGroup.clear(true, true);
      const alignX = Math.floor((this.bossTriggerX - 512) / 64) * 64;
      this.nextGroundX = Math.max(0, alignX);
      this.generateTerrain();

      // Camera positioning for boss fight
      this.cameras.main.stopFollow();
      this.cameras.main.scrollX = this.bossTriggerX;
    } else {
      // Respawn at runner checkpoint
      this.score = this.checkpointScore;
      this.kaizenEnergy = this.checkpointEnergy;
      this.currentPhase = 'runner';

      // Clear ground to prevent overlaps
      this.groundGroup.clear(true, true);

      // Align ground generator coordinate
      const alignX = Math.floor((this.checkpointX - 512) / 64) * 64;
      this.nextGroundX = Math.max(0, alignX);

      // Align pattern generator coordinate
      this.nextPatternX = this.checkpointX + 600;

      // Position player
      const spawnX = this.checkpointX === 0 ? 150 : this.checkpointX + 100;
      this.player.setPosition(spawnX, 300);
      this.player.setVelocity(0, 0);

      // Clean up boss sprite if it exists
      if (this.bossSprite) {
        this.bossSprite.destroy();
        this.bossSprite = null;
      }

      // Pre-generate terrain under player spawn
      this.generateTerrain();

      // Update camera follow and position
      this.cameras.main.startFollow(this.player, true, 1.0, 1.0, -250, 0);
      this.cameras.main.scrollX = Math.max(0, spawnX - 250);
    }
    
    this.emitHudState();
  }

  // GENERAL UPDATE
  private updateEntities(time: number) {
    // 1. Destroy off-screen project/enemies to free memory
    const camLeftX = this.cameras.main.scrollX - 200;
    
    this.enemiesGroup.getChildren().forEach((enemy: any) => {
      if (enemy.active && enemy.x < camLeftX) {
        enemy.destroy();
      }
    });

    this.flasksGroup.getChildren().forEach((flask: any) => {
      if (flask.x < camLeftX) flask.destroy();
    });

    this.powerupsGroup.getChildren().forEach((p: any) => {
      if (p.x < camLeftX) p.destroy();
    });

    this.obstaclesGroup.getChildren().forEach((o: any) => {
      if (o.x < camLeftX) o.destroy();
    });

    // 2. Boss attack cycles
    if (this.currentPhase === 'boss') {
      this.handleBossAttack(time);
    }

    // 3. Clear expired buffs tint
    let buffExpired = false;
    if (this.shieldUntil > 0 && this.shieldUntil <= time) {
      this.shieldUntil = 0;
      buffExpired = true;
    }
    if (this.wingsUntil > 0 && this.wingsUntil <= time) {
      this.wingsUntil = 0;
      buffExpired = true;
    }
    if (buffExpired) {
      this.restoreMapTint();
    }
  }

  private restoreMapTint() {
    if (this.isKaizenMode) {
      this.player.setTint(0xff3333); // Red glow
    } else if (this.wingsUntil > this.time.now) {
      this.player.setTint(0x00e5ff); // Cyan glow
    } else if (this.shieldUntil > this.time.now) {
      this.player.setTint(0x00ff00); // Green glow
    } else {
      // Normal state tint based on equipped skin
      if (this.activeSkin === 'skin_hanoi') {
        this.player.setTint(0xff5555); // Hanoi Red/Yellow theme glow
      } else if (this.activeSkin === 'skin_tokyo') {
        this.player.setTint(0xffd700); // Tokyo Gold/Neon theme glow
      } else if (this.activeSkin === 'skin_danang') {
        this.player.setTint(0x00e5ff); // Danang Cyan/Teal theme glow
      } else {
        // Fallback to normal state tint based on map
        if (this.mapConfig.mapKey === 'tokyo') {
          this.player.setTint(0xffd6eb);
        } else if (this.mapConfig.mapKey === 'danang') {
          this.player.setTint(0xd6ffff);
        } else {
          this.player.clearTint();
        }
      }
    }
  }

  private updateTitleText() {
    if (!this.titleTextObject) return;

    const TITLE_NAMES: Record<string, { label: string; color: string }> = {
      title_runner: { label: '⚡ THỢ CHẠY DEADLINE ⚡', color: '#ffd700' },
      title_hunter: { label: '👾 CHIẾN SĨ DIỆT BUG 👾', color: '#ff3333' },
      title_hacker: { label: '💻 SIÊU CẤP HACKER 💻', color: '#00e5ff' },
    };

    const titleData = TITLE_NAMES[this.activeTitle];
    if (titleData) {
      this.titleTextObject.setText(titleData.label);
      this.titleTextObject.setColor(titleData.color);
      this.titleTextObject.setShadow(0, 0, titleData.color, 4, true, true);
      this.titleTextObject.setVisible(true);
    } else {
      this.titleTextObject.setVisible(false);
    }
  }

  private emitHudState() {
    const roundedEnergy = Math.floor(this.kaizenEnergy);
    const roundedTime = Math.round(this.gameTimeElapsed);
    
    if (
      this.score === this.lastScore &&
      this.hearts === this.lastHearts &&
      roundedEnergy === this.lastEnergy &&
      this.bossHp === this.lastBossHp &&
      this.currentPhase === this.lastPhase &&
      roundedTime === this.lastTimeElapsed
    ) {
      return; // No change, skip emitting to prevent React infinite loop
    }

    this.lastScore = this.score;
    this.lastHearts = this.hearts;
    this.lastEnergy = roundedEnergy;
    this.lastBossHp = this.bossHp;
    this.lastPhase = this.currentPhase;
    this.lastTimeElapsed = roundedTime;

    this.game.events.emit('hud-update', {
      score: this.score,
      hearts: this.hearts,
      energy: this.kaizenEnergy,
      bossHp: this.bossHp,
      maxBossHp: this.maxBossHp,
      phase: this.currentPhase,
      timeElapsed: roundedTime,
      mapKey: this.mapConfig.mapKey,
      mapName: this.mapConfig.mapKey === 'hanoi' ? 'Hà Nội' : this.mapConfig.mapKey === 'tokyo' ? 'Tokyo' : 'Đà Nẵng',
      bossName: this.mapConfig.bossConfig.name
    });
  }
}

// Helpers
function deltaSeconds(deltaMs: number): number {
  return deltaMs;
}
