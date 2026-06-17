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

  /** Khởi tạo references đến scene và physics groups. Gọi trong create(). */
  init(scene: Phaser.Scene, groups: PhysicsGroups): void {
    this.scene = scene;
    this.groups = groups;
  }

  /** Reset vị trí con trỏ sinh. Dùng khi respawn checkpoint. */
  reset(options: { groundX?: number; patternX?: number } = {}): void {
    if (options.groundX !== undefined) this.nextGroundX = options.groundX;
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
      const inPit = state.activePitRanges.some(
        r => this.nextGroundX >= r.start && this.nextGroundX <= r.end
      );
      if (!inPit) {
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
          const block = this.groups.ground.create(this.nextGroundX + 32, GROUND_Y, 'hanoi_tileset');
          block.setDisplaySize(64, 40);
          block.setAlpha(0); // khối vô hình
          block.body.updateFromGameObject();
        }
      }
      this.nextGroundX += 64;
    }
  }

  // ─── Pattern Generation ─────────────────────────────────────────────────────
  // Chọn ngẫu nhiên một pattern từ mapConfig và spawn phía trước player.
  // Gap giữa các pattern được rút ngắn theo difficulty tier (tier cao → gap ngắn hơn).
  generatePatterns(playerX: number, state: GameState, mapConfig: MapConfig): void {
    if (state.isBossFight) return;
    
    // Lấy difficulty state từ score hiện tại
    const diff = getDifficultyState(state.score);
    const maxGap = Math.max(diff.minPatternGap + 150, 400 - diff.tier * 30);

    while (
      this.nextPatternX < playerX + 1500 &&
      this.nextPatternX < state.bossTriggerX - 800
    ) {
      const randomPattern = Phaser.Utils.Array.GetRandom(mapConfig.spawnPatterns);
      this.spawnPattern(randomPattern, this.nextPatternX, state, mapConfig);
      // Gap ngẫu nhiên trong khoảng [minPatternGap, maxGap]
      this.nextPatternX += randomPattern.width + Phaser.Math.Between(diff.minPatternGap, maxGap);
    }
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
          const p = this.groups.powerups.create(spawnX, spawnY, 'powerups');
          p.setFrame(0).setDisplaySize(24, 24).setData('kind', 'respect'); // Scaled down
          p.body.updateFromGameObject();
          break;
        }
        case 'responsibility_wings': {
          const p = this.groups.powerups.create(spawnX, spawnY, 'powerups');
          p.setFrame(1).setDisplaySize(24, 24).setData('kind', 'wings'); // Scaled down
          p.body.updateFromGameObject();
          break;
        }
        case 'kaizen_keyboard': {
          const p = this.groups.powerups.create(spawnX, spawnY, 'powerups');
          p.setFrame(2).setDisplaySize(24, 24).setData('kind', 'keyboard'); // Scaled down
          p.body.updateFromGameObject();
          break;
        }
        case 'ground_bug': {
          const bug = this.groups.enemies.create(spawnX, spawnY, 'hanoi_enemies');
          bug.setScale(0.6).play('bug_staging_crawl').setData('kind', 'ground_bug'); // Scaled down
          bug.body.setGravityY(500);
          if (mapConfig.mapKey === 'tokyo') bug.setTint(0xff66cc);
          else if (mapConfig.mapKey === 'danang') bug.setTint(0x33ffff);
          break;
        }
        case 'flying_bug': {
          const bug = this.groups.enemies.create(spawnX, spawnY, 'hanoi_enemies');
          bug.setScale(0.6).play('bug_prod_fly').setData('kind', 'flying_bug'); // Scaled down
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
          const bomb = this.groups.obstacles.create(spawnX, spawnY, 'obstacles');
          bomb.setFrame(1).setDisplaySize(24, 24); // Scaled down
          bomb.body.updateFromGameObject();
          break;
        }
        case 'platform': {
          const platformW = item.width || 128;
          const platformH = item.height || 16; // Scaled down
          const platform = this.groups.ground.create(
            spawnX + platformW / 2,
            spawnY + platformH / 2,
            'hanoi_tileset'
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
