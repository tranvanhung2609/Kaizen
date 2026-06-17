import Phaser from 'phaser';
import { MapConfig } from './MapConfig';
import { GameState } from '../engine/GameState';
import { getDifficultyState } from '../engine/constants';

interface PhysicsGroups {
  ground: Phaser.Physics.Arcade.StaticGroup;
  flasks: Phaser.Physics.Arcade.Group;
  powerups: Phaser.Physics.Arcade.Group;
  enemies: Phaser.Physics.Arcade.Group;
  obstacles: Phaser.Physics.Arcade.Group;
}

// ─── Spawn System ─────────────────────────────────────────────────────────────
// Chịu trách nhiệm sinh terrain (khối mặt đất) và pattern (vật phẩm, kẻ địch)
// theo tiến trình của người chơi. Tự động dọn dẹp entities ra ngoài viewport.
export class SpawnSystem {
  private scene!: Phaser.Scene;
  private groups!: PhysicsGroups;

  // Vị trí X tiếp theo cần sinh ground block / pattern
  private nextGroundX = -128;
  private nextPatternX = 800;

  // Trạng thái sinh đường chạy ngẫu nhiên (Platform xen kẽ Pit)
  private nextRandomSegmentX = 800;
  private isGeneratingPlatform = true;

  /** Khởi tạo references đến scene và physics groups. Gọi trong create(). */
  init(scene: Phaser.Scene, groups: PhysicsGroups): void {
    this.scene = scene;
    this.groups = groups;
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
  // Sinh các khối ground tĩnh.
  // Với map Hà Nội, sinh các TileSprite hiển thị trực quan và khớp seamless.
  // Các map khác dùng các khối vô hình (visual là TileSprite layer ở xa).
  generateTerrain(playerAheadX: number, state: GameState, mapConfig: MapConfig): void {
    const GROUND_Y = 370; // top=350, bottom=390
    const isHanoi = mapConfig.mapKey === 'hanoi';

    while (this.nextGroundX < playerAheadX) {
      let shouldSpawnBlock = true;

      // Gameplay zone ngẫu nhiên từ X=800 đến sát trước boss
      if (this.nextGroundX >= 800 && this.nextGroundX < state.bossTriggerX - 500) {
        if (this.nextGroundX >= this.nextRandomSegmentX) {
          // Chuyển đổi trạng thái Platform <=> Pit
          this.isGeneratingPlatform = !this.isGeneratingPlatform;
          
          if (this.isGeneratingPlatform) {
            // Platform: Chiều dài ngẫu nhiên từ 256px đến 512px (bội số của 64)
            const width = Math.floor(Phaser.Math.Between(256, 512) / 64) * 64;
            this.nextRandomSegmentX = this.nextGroundX + width;
            
            // Sinh các vật thể ngẫu nhiên trên platform này
            this.spawnRandomEntitiesOnPlatform(this.nextGroundX, width, state, mapConfig);
          } else {
            // Gap (Pit): Khoảng cách ngẫu nhiên từ 128px đến 192px (bội số của 64)
            const gapWidth = Math.floor(Phaser.Math.Between(128, 192) / 64) * 64;
            this.nextRandomSegmentX = this.nextGroundX + gapWidth;
            state.activePitRanges.push({ start: this.nextGroundX, end: this.nextRandomSegmentX });
          }
        }
        shouldSpawnBlock = this.isGeneratingPlatform;
      }

      if (shouldSpawnBlock) {
        if (isHanoi) {
          const x = this.nextGroundX + 32;
          const block = this.scene.add.tileSprite(x, GROUND_Y, 64, 40, 'hanoi_ground_tiles');
          this.scene.physics.add.existing(block, true); // Tạo static body
          this.groups.ground.add(block);
          
          // Thiết lập tile scale để khớp tỷ lệ 64x40 (nhỏ lại theo feedback)
          block.setTileScale(64 / 512, 40 / 286);
          // Offset tilePositionX để nối Seamless giữa các khối
          block.tilePositionX = this.nextGroundX * 8;
          block.setDepth(5);
        } else {
          const block = this.groups.ground.create(this.nextGroundX + 32, GROUND_Y, 'hanoi_ground_tiles');
          block.setDisplaySize(64, 40);
          block.setAlpha(0); // khối vô hình
          block.body.updateFromGameObject();
        }
      }
      this.nextGroundX += 64;
    }
  }

  /** Sinh các vật thể ngẫu nhiên trên platform */
  private spawnRandomEntitiesOnPlatform(startX: number, width: number, state: GameState, mapConfig: MapConfig): void {
    if (startX < 900 || startX > state.bossTriggerX - 600) return;

    // Chia platform thành các slot 128px
    const slotsCount = Math.floor(width / 128);
    let enemiesSpawned = 0; // Giới hạn max 2 enemies/platform
    let obstaclesSpawned = 0; // Giới hạn max 1 bomb/platform

    for (let i = 0; i < slotsCount; i++) {
      const spawnX = startX + 64 + i * 128;
      const rand = Math.random();

      if (rand < 0.25) {
        // Spawn bình kinh nghiệm (XP Flask) — luôn spawn, không giới hạn
        const flask = this.groups.flasks.create(spawnX, 310, 'xp_flask');
        flask.setDisplaySize(20, 20);
        flask.body.updateFromGameObject();
      } else if (rand < 0.50 && enemiesSpawned < 2) {
        // Spawn Enemy (Lính) — tối đa 2/platform
        const isFlying = Math.random() < 0.4;
        enemiesSpawned++;
        if (isFlying) {
          const flyY = 220 + Math.random() * 80; // Bay ở độ cao 220-300
          const bug = this.groups.enemies.create(spawnX, flyY, 'bug2_enemies');
          bug.setScale(0.2).play('bug_prod_fly').setData('kind', 'flying_bug');
          bug.setData('hp', 100);
          bug.setData('speed', Phaser.Math.Between(40, 70));
          bug.setData('targetOffsetX', Phaser.Math.Between(-50, 50));
          bug.setData('targetOffsetY', Phaser.Math.Between(-80, 20));
          bug.body.updateFromGameObject();
          bug.body.setAllowGravity(false);

          // Hover animation (up-down sine wave)
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
        } else {
          const bug = this.groups.enemies.create(spawnX, 330, 'bug1_enemies');
          bug.setScale(0.2).play('bug_staging_crawl').setData('kind', 'ground_bug');
          bug.setData('hp', 50);
          bug.setData('speed', Phaser.Math.Between(30, 60));
          bug.setData('targetOffsetX', Phaser.Math.Between(-20, 20));
          bug.body.updateFromGameObject();
          bug.body.setGravityY(500);

          if (mapConfig.mapKey === 'tokyo') bug.setTint(0xff66cc);
          else if (mapConfig.mapKey === 'danang') bug.setTint(0x33ffff);
        }
      } else if (rand < 0.65 && obstaclesSpawned < 1) {
        // Spawn vật cản (bom) — tối đa 1/platform
        obstaclesSpawned++;
        const bomb = this.groups.obstacles.create(spawnX, 335, 'tech_debt_bomb');
        bomb.setDisplaySize(24, 24);
        bomb.body.updateFromGameObject();
      } else if (rand < 0.75) {
        // Spawn Powerup ngẫu nhiên — keyboard powerup hiếm hơn (10%)
        const r2 = Math.random();
        let pType = 'respect';
        let key = 'respect_shield';
        if (r2 < 0.40) { pType = 'respect'; key = 'respect_shield'; }
        else if (r2 < 0.75) { pType = 'wings'; key = 'responsibility_wings'; }
        else { pType = 'keyboard'; key = 'kaizen_keyboard'; }

        const p = this.groups.powerups.create(spawnX, 310, key);
        p.setDisplaySize(24, 24).setData('kind', pType);
        p.body.updateFromGameObject();
      }
    }
  }

  // ─── Pattern Generation ─────────────────────────────────────────────────────
  // Không sử dụng khi đã kích hoạt bộ sinh ngẫu nhiên để tránh xung đột vị trí
  generatePatterns(playerX: number, state: GameState, mapConfig: MapConfig): void {
    return;
  }

  private spawnPattern(pattern: any, startX: number, state: GameState, mapConfig: MapConfig): void {
    pattern.items.forEach((item: any) => {
      const spawnX = startX + item.xOffset;
      const spawnY = item.y;

      switch (item.type) {
        case 'experience_flask': {
          const flask = this.groups.flasks.create(spawnX, spawnY, 'xp_flask');
          flask.setDisplaySize(20, 20); // Scaled down
          flask.body.updateFromGameObject();
          break;
        }
        case 'respect_shield': {
          const p = this.groups.powerups.create(spawnX, spawnY, 'respect_shield');
          p.setDisplaySize(24, 24).setData('kind', 'respect'); // Scaled down
          p.body.updateFromGameObject();
          break;
        }
        case 'responsibility_wings': {
          const p = this.groups.powerups.create(spawnX, spawnY, 'responsibility_wings');
          p.setDisplaySize(24, 24).setData('kind', 'wings'); // Scaled down
          p.body.updateFromGameObject();
          break;
        }
        case 'kaizen_keyboard': {
          const p = this.groups.powerups.create(spawnX, spawnY, 'kaizen_keyboard');
          p.setDisplaySize(24, 24).setData('kind', 'keyboard'); // Scaled down
          p.body.updateFromGameObject();
          break;
        }
        case 'ground_bug': {
          const bug = this.groups.enemies.create(spawnX, spawnY, 'bug1_enemies');
          bug.setScale(0.2).play('bug_staging_crawl').setData('kind', 'ground_bug'); // Scaled down
          bug.body.updateFromGameObject();
          bug.body.setGravityY(500);
          if (mapConfig.mapKey === 'tokyo') bug.setTint(0xff66cc);
          else if (mapConfig.mapKey === 'danang') bug.setTint(0x33ffff);
          break;
        }
        case 'flying_bug': {
          const bug = this.groups.enemies.create(spawnX, spawnY, 'bug2_enemies');
          bug.setScale(0.2).play('bug_prod_fly').setData('kind', 'flying_bug'); // Scaled down
          bug.body.updateFromGameObject();
          bug.body.setAllowGravity(false);
          if (mapConfig.mapKey === 'tokyo') bug.setTint(0xff33cc);
          else if (mapConfig.mapKey === 'danang') bug.setTint(0x00cccc);
          // Hover animation
          this.scene.tweens.add({
            targets: bug,
            y: bug.y - 20,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
          break;
        }
        case 'pit': {
          state.activePitRanges.push({ start: spawnX, end: spawnX + 128 });
          break;
        }
        case 'bomb': {
          const bomb = this.groups.obstacles.create(spawnX, spawnY, 'tech_debt_bomb');
          bomb.setDisplaySize(24, 24); // Scaled down
          bomb.body.updateFromGameObject();
          break;
        }
        case 'platform': {
          const platformW = item.width || 128;
          const platformH = item.height || 16; // Scaled down
          const platform = this.groups.ground.create(
            spawnX + platformW / 2,
            spawnY + platformH / 2,
            'hanoi_ground_tiles'
          );
          platform.setDisplaySize(platformW, platformH);
          platform.body.updateFromGameObject();
          // One-way collision: cho phép nhảy từ dưới lên
          platform.body.checkCollision.down = false;
          platform.body.checkCollision.left = false;
          platform.body.checkCollision.right = false;
          break;
        }
      }
    });
  }

  // ─── Viewport Culling ──────────────────────────────────────────────────────
  // Hủy các entity đã ra khỏi viewport để tiết kiệm bộ nhớ.
  cullOffscreen(camLeftX: number): void {
    const destroyIfOffscreen = (group: Phaser.Physics.Arcade.Group) => {
      group.getChildren().forEach((obj: any) => {
        if (obj.active && obj.x < camLeftX) obj.destroy();
      });
    };
    destroyIfOffscreen(this.groups.enemies);
    destroyIfOffscreen(this.groups.flasks);
    destroyIfOffscreen(this.groups.powerups);
    destroyIfOffscreen(this.groups.obstacles);
  }
}
