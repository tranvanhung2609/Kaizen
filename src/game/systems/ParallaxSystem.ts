import Phaser from 'phaser';
import { MapConfig } from '../maps/MapConfig';

interface Layer {
  sprite: Phaser.GameObjects.TileSprite;
  scrollFactorX: number;
}

// ─── Parallax Background System ───────────────────────────────────────────────
// Quản lý 6 tầng TileSprite với tốc độ cuộn khác nhau để tạo hiệu ứng chiều sâu.
// Tầng xa (sky) cuộn chậm; tầng gần (foreground) cuộn nhanh hơn camera.
//
// Layer stack (depth 0=xa, 6=gần):
//   0  Sky            scrollFactor 0.05x
//   1  Clouds         scrollFactor 0.10x
//   2  Far Landmarks  scrollFactor 0.30x
//   3  Mid City       scrollFactor 0.60x
//   4  Ground/Road    scrollFactor 1.00x
//   6  Foreground     scrollFactor 1.50x
export class ParallaxSystem {
  private layers: Layer[] = [];
  private cloudsOffset1 = 0;
  private cloudsOffset2 = 0;

  /** Tạo toàn bộ tầng TileSprite. Phải gọi trong Scene.create(). */
  create(scene: Phaser.Scene, width: number, height: number, mapConfig: MapConfig): void {
    this.layers = [];
    const scale = height / 1024; // scale để vừa với canvas 960×540

    if (mapConfig.mapKey === 'hanoi') {
      // ── HANOI 3-ZONE REDESIGN ────────────────────────────────────────────────
      // 1. Sky background (tĩnh, toàn màn hình)
      const skySprite = scene.add.tileSprite(0, 0, width, height, 'hanoi_bg_sky')
        .setOrigin(0, 0).setScrollFactor(0).setDepth(0).setTileScale(scale, scale);
      this.layers.push({ sprite: skySprite, scrollFactorX: 0.01 });

      // 2. Clouds layers (Top zone Y = 0 to 220, trôi độc lập)
      const cloudsFloating = scene.add.tileSprite(0, 0, width, 220, 'hanoi_clouds_floating')
        .setOrigin(0, 0).setScrollFactor(0).setDepth(1).setTileScale(scale * 0.5, scale * 0.5).setAlpha(0.9);
      cloudsFloating.tilePositionY = 310; // Align to top of cloud texture to prevent top clipping
      this.layers.push({ sprite: cloudsFloating, scrollFactorX: 0.05 });

      // 3. Middle Platform Zone: Vẽ riêng bằng SpawnSystem dưới dạng các đoạn đường nhảy qua.

      // 4. Foreground layer ở dưới (Y = 380 đến 540)
      const fgCleanV2 = scene.add.tileSprite(0, height, width, 260, 'hanoi_fg_clean_v2')
        .setOrigin(0, 1).setScrollFactor(0).setDepth(7).setTileScale(scale * 1.3, scale * 1.3);
      this.layers.push({ sprite: fgCleanV2, scrollFactorX: 1.6 });

    } else {
      // ── ORIGINAL LAYER STACK FOR TOKYO & DANANG ──────────────────────────────
      // ── LAYER 0: Sky ────────────────────────────────────────────────────────
      const skySprite = scene.add.tileSprite(0, 0, width, height, 'hanoi_bg_sky')
        .setOrigin(0, 0).setScrollFactor(0).setDepth(0).setTileScale(scale, scale);
      this.layers.push({ sprite: skySprite, scrollFactorX: 0.05 });

      // ── LAYER 1: Clouds ─────────────────────────────────────────────────────
      const cloudsSprite = scene.add.tileSprite(0, 0, width, height, 'hanoi_clouds_floating')
        .setOrigin(0, 0).setScrollFactor(0).setDepth(1).setTileScale(scale, scale);
      this.layers.push({ sprite: cloudsSprite, scrollFactorX: 0.1 });

      // ── LAYER 2: Far Landmarks ───────────────────────────────────────────────
      const farLandmarksSprite = scene.add.tileSprite(0, 0, width, height, 'hanoi_bg_far_landmarks')
        .setOrigin(0, 0).setScrollFactor(0).setDepth(2).setTileScale(scale, scale);
      this.layers.push({ sprite: farLandmarksSprite, scrollFactorX: 0.3 });

      // ── LAYER 3: Mid City (103px strip sitting on pavement) ─────────────────
      const midCitySprite = scene.add.tileSprite(0, 247, width, 103, 'hanoi_bg_mid_city')
        .setOrigin(0, 0).setScrollFactor(0).setDepth(3);
      this.layers.push({ sprite: midCitySprite, scrollFactorX: 0.6 });

      // ── LAYER 4: Ground / Pavement ──────────────────────────────────────────
      const groundLayerY = 350;
      const groundBgSprite = scene.add.tileSprite(0, groundLayerY, width, height - groundLayerY, 'hanoi_road_track')
        .setOrigin(0, 0).setScrollFactor(0).setDepth(4);
      this.layers.push({ sprite: groundBgSprite, scrollFactorX: 1.0 });

      // ── LAYER 5: Foreground Scenery (in front of player, depth 6) ───────────
      const fgSprite = scene.add.tileSprite(0, 0, width, height, 'hanoi_fg_scenery')
        .setOrigin(0, 0).setScrollFactor(0).setDepth(6).setTileScale(scale, scale);
      this.layers.push({ sprite: fgSprite, scrollFactorX: 1.5 });

      // ── Map-specific color tints ─────────────────────────────────────────────
      if (mapConfig.mapKey === 'tokyo') {
        skySprite.setTint(0xffb3d9);
        midCitySprite.setTint(0xff99cc);
        farLandmarksSprite.setTint(0xffcce0);
      } else if (mapConfig.mapKey === 'danang') {
        skySprite.setTint(0x80ffff);
        midCitySprite.setTint(0x99eeff);
        farLandmarksSprite.setTint(0xaaffff);
      }
    }
  }

  /** Gọi mỗi frame từ scene.update() để cập nhật vị trí tile theo camera. */
  update(camScrollX: number): void {
    // Drift clouds from right to left
    this.cloudsOffset1 += 0.15;

    this.layers.forEach(layer => {
      const key = layer.sprite.texture.key;
      if (key === 'hanoi_clouds_floating') {
        layer.sprite.tilePositionX = camScrollX * layer.scrollFactorX + this.cloudsOffset1;
      } else {
        layer.sprite.tilePositionX = camScrollX * layer.scrollFactorX;
      }
    });
  }
}
