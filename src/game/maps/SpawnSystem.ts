import Phaser from 'phaser';
import { MapConfig } from './MapConfig';
import { GameState } from '../engine/GameState';
import { RUNNER_PHYSICS, DIFFICULTY, getDifficultyState } from '../engine/constants';

interface PhysicsGroups {
  ground: Phaser.Physics.Arcade.StaticGroup;
  flasks: Phaser.Physics.Arcade.Group;
  powerups: Phaser.Physics.Arcade.Group;
  enemies: Phaser.Physics.Arcade.Group;
  obstacles: Phaser.Physics.Arcade.Group;
  enemyBullets: Phaser.Physics.Arcade.Group; // Đạn bắn ra từ lính
}

// ─── Spawn System ─────────────────────────────────────────────────────────────
// Chịu trách nhiệm sinh terrain (khối mặt đất), platform floating, và các
// pattern (vật phẩm, kẻ địch, bẫy) theo tiến trình người chơi.
// Tự động dọn dẹp entities ra ngoài viewport.
export class SpawnSystem {
  private scene!: Phaser.Scene;
  private groups!: PhysicsGroups;
  private mapConfig!: MapConfig;

  // Vị trí X tiếp theo cần sinh ground block / pattern
  private nextGroundX = -128;
  private nextPatternX = 800;

  // Trạng thái sinh đường chạy ngẫu nhiên (Platform xen kẽ Pit)
  private nextRandomSegmentX = 800;
  private isGeneratingPlatform = true;

  /** Khởi tạo references đến scene và physics groups. Gọi trong create(). */
  init(scene: Phaser.Scene, groups: PhysicsGroups, mapConfig?: MapConfig): void {
    this.scene = scene;
    this.groups = groups;
    if (mapConfig) this.mapConfig = mapConfig;
  }

  /** Reset vị trí con trỏ sinh. Dùng khi respawn checkpoint. */
  reset(options: { groundX?: number; patternX?: number } = {}): void {
    if (options.groundX !== undefined) {
      this.nextGroundX = options.groundX;
      this.nextRandomSegmentX = Math.max(800, options.groundX);
      this.isGeneratingPlatform = true;
    }
    if (options.patternX !== undefined) this.nextPatternX = options.patternX;
  }

  // ─── Terrain Generation ────────────────────────────────────────────────────
  // Sinh các khối ground tĩnh kèm pit ngẫu nhiên dài/ngắn.
  // Mỗi platform mới sẽ trigger spawn entity/platform floating phù hợp.
  generateTerrain(playerAheadX: number, state: GameState, mapConfig: MapConfig): void {
    this.mapConfig = mapConfig;
    const GROUND_Y = 370; // top=350, bottom=390
    const isHanoi = mapConfig.mapKey === 'hanoi';

    while (this.nextGroundX < playerAheadX) {
      let shouldSpawnBlock = true;

      // Gameplay zone ngẫu nhiên từ X=800 đến sát trước boss
      if (this.nextGroundX >= 800 && this.nextGroundX < state.bossTriggerX - 500) {
        // Khu vực Checkpoint (2000, 4000) bắt buộc có đất
        const isInCheckpointZone =
          (this.nextGroundX >= 1900 && this.nextGroundX <= 2200) ||
          (this.nextGroundX >= 3900 && this.nextGroundX <= 4200);

        if (isInCheckpointZone) {
          shouldSpawnBlock = true;
          this.isGeneratingPlatform = true;
          if (this.nextRandomSegmentX < this.nextGroundX + 64) {
            this.nextRandomSegmentX = this.nextGroundX + 64;
          }
        } else {
          if (this.nextGroundX >= this.nextRandomSegmentX) {
            // Chuyển đổi trạng thái Platform ↔ Pit
            this.isGeneratingPlatform = !this.isGeneratingPlatform;

            if (this.isGeneratingPlatform) {
              // Platform: Chiều dài ngẫu nhiên 192px–768px (bội số của 64)
              const width = Math.floor(Phaser.Math.Between(192, 768) / 64) * 64;
              
              // Generate all ground blocks for this platform immediately so physics body exists when entities spawn
              for (let offset = 0; offset < width; offset += 64) {
                const blockX = this.nextGroundX + offset;
                if (isHanoi) {
                  const x = blockX + 32;
                  const block = this.scene.add.tileSprite(x, GROUND_Y, 64, 40, 'hanoi_ground_tiles');
                  this.scene.physics.add.existing(block, true);
                  this.groups.ground.add(block);
                  block.setTileScale(64 / 512, 40 / 286);
                  block.tilePositionX = blockX * 8;
                  block.setDepth(5);
                } else {
                  const block = this.groups.ground.create(blockX + 32, GROUND_Y, 'hanoi_ground_tiles');
                  block.setDisplaySize(64, 40);
                  block.setAlpha(0);
                  block.body.updateFromGameObject();
                }
              }

              // Spawn entity và platform floating trên platform mới này
              this.spawnRandomEntitiesOnPlatform(this.nextGroundX, width, state, mapConfig);

              this.nextGroundX += width - 64; // Adjust nextGroundX since we pre-generated the blocks
              this.nextRandomSegmentX = this.nextGroundX + 64;
              shouldSpawnBlock = false;
            } else {
              // Gap (Pit): Khoảng cách ngẫu nhiên 64px–256px (bội số của 64)
              const gapWidth = Math.floor(Phaser.Math.Between(64, 256) / 64) * 64;
              this.nextRandomSegmentX = this.nextGroundX + gapWidth;
              state.activePitRanges.push({ start: this.nextGroundX, end: this.nextRandomSegmentX });
              shouldSpawnBlock = false;
            }
          } else {
            shouldSpawnBlock = this.isGeneratingPlatform;
          }
        }
      }

      if (shouldSpawnBlock) {
        if (isHanoi) {
          const x = this.nextGroundX + 32;
          const block = this.scene.add.tileSprite(x, GROUND_Y, 64, 40, 'hanoi_ground_tiles');
          this.scene.physics.add.existing(block, true);
          this.groups.ground.add(block);
          block.setTileScale(64 / 512, 40 / 286);
          block.tilePositionX = this.nextGroundX * 8;
          block.setDepth(5);
        } else {
          const block = this.groups.ground.create(this.nextGroundX + 32, GROUND_Y, 'hanoi_ground_tiles');
          block.setDisplaySize(64, 40);
          block.setAlpha(0); // khối vô hình — visual là parallax layer
          block.body.updateFromGameObject();
        }
      }
      this.nextGroundX += 64;
    }
  }

  // ─── Spawn Entity & Platforms Trên Mỗi Ground Platform ─────────────────────
  // Chia platform thành slot 128px, mỗi slot có xác suất spawn loại khác nhau:
  //   Flask XP | Lính đất | Lính bay | Bom | Powerup | Floating Platform | Sky Item
  private spawnRandomEntitiesOnPlatform(
    startX: number,
    width: number,
    state: GameState,
    mapConfig: MapConfig
  ): void {
    if (startX < 900 || startX > state.bossTriggerX - 600) return;

    const slotsCount = Math.floor(width / 128);
    let enemiesSpawned = 0;   // Tối đa 4 enemies/platform
    let obstaclesSpawned = 0; // Tối đa 2 bom/platform
    let floatingSpawned = 0;  // Tối đa 1 cụm floating platform/platform mặt đất

    const diffTier = getDifficultyState(state.score).tier;

    for (let i = 0; i < slotsCount; i++) {
      const spawnX = startX + 64 + i * 128;
      const rand = Math.random();

      if (rand < 0.22) {
        // ── Flask XP trên mặt đất ─────────────────────────────────────────
        const flask = this.groups.flasks.create(spawnX, 310, 'xp_flask');
        flask.setDisplaySize(20, 20);
        flask.body.updateFromGameObject();

      } else if (rand < 0.47 && enemiesSpawned < 4) {
        // ── Ground Enemy ──────────────────────────────────────────────────
        enemiesSpawned++;
        this.spawnGroundEnemy(spawnX, state, mapConfig, diffTier);

      } else if (rand < 0.66 && enemiesSpawned < 4) {
        // ── Flying Enemy ──────────────────────────────────────────────────
        enemiesSpawned++;
        this.spawnFlyingEnemy(spawnX, state, mapConfig, diffTier);

      } else if (rand < 0.76 && obstaclesSpawned < 2) {
        // ── Bom / Cạm bẫy ────────────────────────────────────────────────
        obstaclesSpawned++;
        const bomb = this.groups.obstacles.create(spawnX, 335, 'tech_debt_bomb');
        bomb.setDisplaySize(24, 24);
        bomb.body.updateFromGameObject();

        // Tier cao: thêm bẫy kép (2 bom gần nhau)
        if (diffTier >= 3 && obstaclesSpawned < 2 && Math.random() < 0.5) {
          obstaclesSpawned++;
          const bomb2 = this.groups.obstacles.create(spawnX + 48, 335, 'tech_debt_bomb');
          bomb2.setDisplaySize(24, 24);
          bomb2.body.updateFromGameObject();
        }

      } else if (rand < 0.87) {
        // ── Powerup ───────────────────────────────────────────────────────
        const r2 = Math.random();
        let pType = 'respect';
        let key = 'respect_shield';
        if (r2 < 0.40) { pType = 'respect'; key = 'respect_shield'; }
        else if (r2 < 0.75) { pType = 'wings'; key = 'responsibility_wings'; }
        else { pType = 'keyboard'; key = 'kaizen_keyboard'; }

        const p = this.groups.powerups.create(spawnX, 310, key);
        p.setDisplaySize(24, 24).setData('kind', pType);
        p.body.updateFromGameObject();

      } else if (rand < 0.95 && floatingSpawned < 1) {
        // ── Floating Platform bậc thang ───────────────────────────────────
        floatingSpawned++;
        this.spawnFloatingPlatformCluster(spawnX, state, mapConfig);

      } else if (rand < 1.0) {
        // ── Sky Item (item trên trời không trên platform) ─────────────────
        const skyY = Phaser.Math.Between(220, 290);
        this.spawnSkyItem(spawnX, skyY);
      }
    }
  }

  // ─── Spawn Ground Enemy ─────────────────────────────────────────────────────
  private spawnGroundEnemy(
    spawnX: number,
    state: GameState,
    mapConfig: MapConfig,
    diffTier: number
  ): void {
    const bug = this.groups.enemies.create(spawnX, 330, 'bug1_enemies');
    bug.setScale(0.2).play('bug_staging_crawl').setData('kind', 'ground_bug');
    bug.setData('hp', 50);
    bug.setData('speed', Phaser.Math.Between(30, 60));
    bug.setData('targetOffsetX', Phaser.Math.Between(-20, 20));
    bug.body.updateFromGameObject();
    bug.body.setGravityY(500);

    if (mapConfig.mapKey === 'tokyo') bug.setTint(0xff66cc);
    else if (mapConfig.mapKey === 'danang') bug.setTint(0x33ffff);

    // Gán thuộc tính bắn đạn
    this.assignShooterData(bug, diffTier);
  }

  // ─── Spawn Flying Enemy ─────────────────────────────────────────────────────
  private spawnFlyingEnemy(
    spawnX: number,
    state: GameState,
    mapConfig: MapConfig,
    diffTier: number
  ): void {
    const flyY = 220 + Math.random() * 80; // Y=220–300
    const bug = this.groups.enemies.create(spawnX, flyY, 'bug2_enemies');
    bug.setScale(0.2).play('bug_prod_fly').setData('kind', 'flying_bug');
    bug.setData('hp', 100);
    bug.setData('speed', Phaser.Math.Between(40, 70));
    bug.setData('targetOffsetX', Phaser.Math.Between(-50, 50));
    bug.setData('targetOffsetY', Phaser.Math.Between(-80, 20));
    bug.body.updateFromGameObject();
    bug.body.setAllowGravity(false);

    // Hover animation (sine wave lên xuống)
    this.scene.tweens.add({
      targets: bug,
      y: flyY - 25,
      duration: Phaser.Math.Between(900, 1200),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    if (mapConfig.mapKey === 'tokyo') bug.setTint(0xff33cc);
    else if (mapConfig.mapKey === 'danang') bug.setTint(0x00cccc);

    // Gán thuộc tính bắn đạn (lính bay bắn nhiều hơn)
    this.assignShooterData(bug, diffTier, true);
  }

  // ─── Gán Dữ Liệu Bắn Đạn Cho Enemy ─────────────────────────────────────────
  // canShoot: xác suất 40% (ground) hoặc 55% (flying) trở thành shooter
  // shootInterval: giảm dần theo tier, có random ±20% để không đồng loạt
  private assignShooterData(
    bug: Phaser.Physics.Arcade.Sprite,
    diffTier: number,
    isFlying = false
  ): void {
    const shootChance = isFlying
      ? RUNNER_PHYSICS.enemyShootChance + 0.15 // Lính bay bắn nhiều hơn
      : RUNNER_PHYSICS.enemyShootChance;

    const canShoot = Math.random() < shootChance;
    bug.setData('canShoot', canShoot);

    if (canShoot) {
      const baseInterval = RUNNER_PHYSICS.enemyShootIntervalBase;
      const minInterval = RUNNER_PHYSICS.enemyShootIntervalMin;
      const shrink = DIFFICULTY.ENEMY_SHOOT_INTERVAL_SHRINK;

      // Tính interval cơ bản theo tier
      const interval = Math.max(minInterval, baseInterval - diffTier * shrink);
      // Thêm random ±20% để lính không bắn đồng loạt
      const jitter = interval * (0.8 + Math.random() * 0.4);

      bug.setData('shootInterval', jitter);
      // Delay bắn đầu tiên: 1–3 giây (tránh bắn ngay khi vừa spawn)
      bug.setData('nextShootTime', this.scene.time.now + 1000 + Math.random() * 2000);
    }
  }

  // ─── Spawn Floating Platform Cluster (Bậc Thang) ───────────────────────────
  // Sinh 1–3 platform nhỏ xếp bậc thang lên, mỗi platform có thể có item
  private spawnFloatingPlatformCluster(
    startX: number,
    state: GameState,
    mapConfig: MapConfig
  ): void {
    const count = Phaser.Math.Between(1, 3); // 1–3 bậc
    const baseY = Phaser.Math.Between(
      RUNNER_PHYSICS.floatingPlatformMinY,
      RUNNER_PHYSICS.floatingPlatformMaxY
    );
    const isHanoi = mapConfig.mapKey === 'hanoi';

    for (let i = 0; i < count; i++) {
      const platX = startX + i * 90;
      const platY = baseY - i * 35; // Mỗi bậc cao hơn bậc trước 35px
      const platW = Phaser.Math.Between(64, 128);

      // Tạo platform (one-way: nhảy từ dưới lên được)
      const platform = this.groups.ground.create(
        platX + platW / 2,
        platY,
        'hanoi_ground_tiles'
      );
      platform.setDisplaySize(platW, 16);
      platform.body.updateFromGameObject();
      platform.setDepth(5);

      // Cho phép nhảy xuyên từ dưới lên
      platform.body.checkCollision.down = false;
      platform.body.checkCollision.left = false;
      platform.body.checkCollision.right = false;

      // Hanoi: hiện, các map khác: hơi trong suốt
      if (!isHanoi) {
        platform.setAlpha(0.7);
      }

      // 60% xác suất có item trên platform floating
      if (Math.random() < 0.60) {
        this.spawnSkyItem(platX + platW / 2, platY - 22);
      }
    }
  }

  // ─── Spawn Sky Item (Item Trên Không Trung) ──────────────────────────────────
  // Flask (65%) | Shield/Wings (23%) | Kaizen Keyboard (12%)
  private spawnSkyItem(x: number, y: number): void {
    const r = Math.random();
    if (r < 0.65) {
      const flask = this.groups.flasks.create(x, y, 'xp_flask');
      flask.setDisplaySize(20, 20);
      flask.body.updateFromGameObject();
    } else if (r < 0.88) {
      const pType = Math.random() < 0.5 ? 'respect' : 'wings';
      const key = pType === 'respect' ? 'respect_shield' : 'responsibility_wings';
      const p = this.groups.powerups.create(x, y, key);
      p.setDisplaySize(24, 24).setData('kind', pType);
      p.body.updateFromGameObject();
    } else {
      const p = this.groups.powerups.create(x, y, 'kaizen_keyboard');
      p.setDisplaySize(24, 24).setData('kind', 'keyboard');
      p.body.updateFromGameObject();
    }
  }

  // ─── Pattern Generation ─────────────────────────────────────────────────────
  // Không sử dụng để tránh xung đột với bộ sinh ngẫu nhiên phía trên
  generatePatterns(_playerX: number, _state: GameState, _mapConfig: MapConfig): void {
    void _playerX;
    void _state;
    void _mapConfig;
    return;
  }

  // ─── Viewport Culling ──────────────────────────────────────────────────────
  // Hủy các entity đã ra khỏi viewport để tiết kiệm bộ nhớ.
  cullOffscreen(camLeftX: number): void {
    const destroyIfOffscreen = (group: Phaser.Physics.Arcade.Group) => {
      group.getChildren().forEach((obj) => {
        const entity = obj as Phaser.GameObjects.GameObject & {
          x: number;
          active: boolean;
          destroy: () => void;
        };
        if (entity.active && entity.x < camLeftX) entity.destroy();
      });
    };
    destroyIfOffscreen(this.groups.enemies);
    destroyIfOffscreen(this.groups.flasks);
    destroyIfOffscreen(this.groups.powerups);
    destroyIfOffscreen(this.groups.obstacles);
    // enemyBullets được cull trong GameScene.update() để kiểm tra cả biên phải
  }
}
