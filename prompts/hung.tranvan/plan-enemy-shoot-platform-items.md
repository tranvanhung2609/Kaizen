# Plan: Enemy AI Overhaul, Shooting Fix & Level Design Upgrade

## Mục tiêu
Nâng cấp toàn bộ hệ thống chiến đấu và thiết kế màn chơi:
1. **Lính bắn đạn thông minh** — random pattern, xu hướng bắn về phía player, tốc độ tăng gần boss
2. **Cơ chế bắn đạn của Player** — sửa lại đúng: chỉ bắn khi Kaizen Mode, Space = bắn (không phải activation), Z = bắn thay thế
3. **Làn đường (lane) ngẫu nhiên** — platform dài/ngắn ngẫu nhiên hơn, pit sâu hơn
4. **Platform bậc thang** — các platform lơ lửng để player nhảy lên
5. **Tăng độ khó theo thời gian** — bẫy dày hơn, lính bắn nhanh hơn gần boss
6. **Item spawn ngẫu nhiên** — trên trời và dưới đất

---

## User Review Required

> [!IMPORTANT]
> **Shooting Control Ambiguity**: Hiện tại `Space` vừa kích hoạt Kaizen Mode (khi energy=100%) vừa bắn đạn (khi đang Kaizen Mode). Plan giữ nguyên hành vi này nhưng sửa bug: Space giữ liên tục sẽ bắn nhanh, không cần nhả phím. Nếu user muốn tách thành 2 phím riêng hãy phản hồi.

> [!WARNING]
> **Enemy Projectile Group**: Hiện tại `bossProjectiles` group được dùng cho đạn boss. Lính bắn đạn cần group riêng `enemyBullets` để tránh nhầm lẫn collision. Cần thêm physics group mới và collider mới trong `GameScene.ts`.

---

## Open Questions

> [!IMPORTANT]
> - **Lane length**: Platform hiện tại 256–512px, pit 128–192px. Có muốn mở rộng thêm (ví dụ pit tối đa 256px, platform tối đa 768px) để game thách thức hơn không?
> - **Số lính tối đa**: Hiện tại giới hạn 8 enemies/screen. Có muốn tăng lên 12 cho màn khó không?
> - **Bậc thang (Staircase platforms)**: Sinh 2–3 platform nhỏ xếp bậc thang hay các platform floating đơn lẻ ở độ cao khác nhau?

---

## Phân tích hiện trạng

### Vấn đề 1: Lính KHÔNG bắn đạn
- `SpawnSystem.ts` chỉ spawn lính (ground_bug, flying_bug) với AI di chuyển tới player
- Không có cơ chế bắn đạn từ lính — chỉ va chạm trực tiếp gây sát thương
- Không có `enemyBullets` group

### Vấn đề 2: Player bắn đạn chưa đúng
- `PlayerSystem.ts` dòng 246: `wantShoot = (state.isKaizenMode && keys.space.isDown) || (keys.z?.isDown)`
- Bug: `keys.z?.isDown` cho phép bắn cả khi KHÔNG ở Kaizen Mode — sai thiết kế
- Bug: Không có giới hạn đạn rõ ràng theo ammo — khi `kaizenAmmo=0` sẽ không bắn nhưng code vẫn cố thực thi `shoot()`
- Vị trí spawn đạn: `weaponSprite.x + 10` — nhưng weapon sprite đặt ở `sprite.x + 20` nên đạn xuất phát đúng nhưng hướng bay chỉ sang phải (tốt)
- Cần đảm bảo đạn không bắn trong phase intro/game_over/map_clear

### Vấn đề 3: Lane và terrain quá đơn giản
- Platform luôn dài 256–512px (bội số 64), pit 128–192px
- Không có platform floating (bậc thang), không có item trên trời
- `spawnRandomEntitiesOnPlatform` chỉ spawn trên mặt đất, không trên platform phụ

### Vấn đề 4: Độ khó không tăng theo thời gian
- `DIFFICULTY` system tồn tại nhưng chỉ scale speed, không ảnh hưởng enemy shoot rate
- Lính không bắn nhanh hơn khi gần boss

---

## Proposed Changes

### 1. `src/game/engine/constants.ts` — Thêm hằng số mới

#### [MODIFY] [constants.ts](file:///d:/_company/game/kaizen-journey/src/game/engine/constants.ts)

Thêm vào `RUNNER_PHYSICS`:
```typescript
// Enemy shooting parameters
enemyBulletSpeed: 180,          // px/s — tốc độ đạn lính cơ bản
enemyBulletDamage: 1,           // Sát thương mỗi viên = 1 tim
enemyShootIntervalBase: 3000,   // ms — bắn mỗi 3 giây (base)
enemyShootIntervalMin: 800,     // ms — tối thiểu 0.8s gần boss
enemyShootChance: 0.35,         // 35% lính mới spawn sẽ là loại bắn đạn

// Platform bậc thang
floatingPlatformMinY: 180,      // Y cao nhất của platform floating
floatingPlatformMaxY: 280,      // Y thấp nhất của platform floating

// Item sky spawn
skyItemSpawnChance: 0.20,       // 20% xác suất spawn item trên trời mỗi slot
```

Thêm vào `DIFFICULTY`:
```typescript
ENEMY_SHOOT_SPEED_PER_TIER: 0.20, // Mỗi tier, tốc độ đạn tăng 20%
ENEMY_SHOOT_INTERVAL_SHRINK: 350, // ms — mỗi tier rút ngắn 350ms interval
```

---

### 2. `src/game/engine/GameState.ts` — Thêm state mới

#### [MODIFY] [GameState.ts](file:///d:/_company/game/kaizen-journey/src/game/engine/GameState.ts)

Thêm vào interface `GameState`:
```typescript
// Enemy bullet tracking (để cull offscreen)
activeEnemyBulletCount: number;
```

---

### 3. `src/game/maps/SpawnSystem.ts` — Toàn bộ logic spawn mới

#### [MODIFY] [SpawnSystem.ts](file:///d:/_company/game/kaizen-journey/src/game/maps/SpawnSystem.ts)

**Thêm `enemyBullets` group vào `PhysicsGroups` interface:**
```typescript
interface PhysicsGroups {
  ground: Phaser.Physics.Arcade.StaticGroup;
  flasks: Phaser.Physics.Arcade.Group;
  powerups: Phaser.Physics.Arcade.Group;
  enemies: Phaser.Physics.Arcade.Group;
  obstacles: Phaser.Physics.Arcade.Group;
  enemyBullets: Phaser.Physics.Arcade.Group; // ← MỚI
}
```

**Thay đổi `spawnRandomEntitiesOnPlatform`:**

Phân chia slot thành 3 loại rõ ràng:

| Loại slot | Xác suất | Nội dung |
|---|---|---|
| Flask XP | 20% | Bình kinh nghiệm trên mặt đất |
| Ground Enemy | 20% | Lính mặt đất (35% có bắn đạn) |
| Flying Enemy | 15% | Lính bay (50% có bắn đạn) |
| Bomb trap | 15% | Bom/cạm bẫy |
| Powerup | 10% | Shield/Wings/Keyboard |
| Floating Platform | 10% | Platform nhảy ở độ cao 180–280px |
| Sky Item | 10% | Item trên trời (flask/powerup) |

**Thêm hàm `spawnFloatingPlatform`:**
```typescript
private spawnFloatingPlatform(x: number, state: GameState): void {
  // Chọn ngẫu nhiên 1 hoặc 2 platform bậc thang
  const count = Phaser.Math.Between(1, 3);
  const baseY = Phaser.Math.Between(180, 280);
  
  for (let i = 0; i < count; i++) {
    const platX = x + i * 80;
    const platY = baseY - i * 30; // Bậc thang đi lên
    const platW = Phaser.Math.Between(64, 128);
    
    const platform = this.groups.ground.create(platX + platW/2, platY, 'hanoi_ground_tiles');
    platform.setDisplaySize(platW, 16);
    platform.body.updateFromGameObject();
    // One-way: nhảy từ dưới lên được
    platform.body.checkCollision.down = false;
    platform.body.checkCollision.left = false;
    platform.body.checkCollision.right = false;
    platform.setDepth(5);
    platform.setAlpha(mapConfig.mapKey === 'hanoi' ? 1 : 0.8);
    
    // Spawn item trên platform floating với 40% xác suất
    if (Math.random() < 0.4) {
      this.spawnSkyItem(platX + platW/2, platY - 20, state);
    }
  }
}
```

**Thêm hàm `spawnSkyItem`:**
```typescript
private spawnSkyItem(x: number, y: number, state: GameState): void {
  const r = Math.random();
  if (r < 0.6) {
    const flask = this.groups.flasks.create(x, y, 'xp_flask');
    flask.setDisplaySize(20, 20);
    flask.body.updateFromGameObject();
  } else if (r < 0.85) {
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
```

**Thêm tham số `difficulty` vào `spawnEnemy`:**

Lính được đánh dấu `canShoot: boolean` và `nextShootTime: number`:
```typescript
// Khi spawn enemy mới
const difficultyTier = getDifficultyState(state.score).tier;
const isShooter = Math.random() < RUNNER_PHYSICS.enemyShootChance;
const shootInterval = Math.max(
  RUNNER_PHYSICS.enemyShootIntervalMin,
  RUNNER_PHYSICS.enemyShootIntervalBase - difficultyTier * DIFFICULTY.ENEMY_SHOOT_INTERVAL_SHRINK
);

bug.setData('canShoot', isShooter);
bug.setData('nextShootTime', this.scene.time.now + shootInterval * (0.5 + Math.random()));
bug.setData('shootInterval', shootInterval);
```

**Thay đổi random platform length:**
```typescript
// Platform: Chiều dài ngẫu nhiên từ 192px đến 768px
const width = Math.floor(Phaser.Math.Between(192, 768) / 64) * 64;
// Gap: 64px đến 256px (rộng hơn trước để khó hơn)
const gapWidth = Math.floor(Phaser.Math.Between(64, 256) / 64) * 64;
```

---

### 4. `src/game/scenes/GameScene.ts` — Thêm enemyBullets group + update loop

#### [MODIFY] [GameScene.ts](file:///d:/_company/game/kaizen-journey/src/game/scenes/GameScene.ts)

**Thêm physics group mới:**
```typescript
private enemyBulletsGroup!: Phaser.Physics.Arcade.Group;
```

**Trong `create()`:**
```typescript
this.enemyBulletsGroup = this.physics.add.group({ allowGravity: false });

// Truyền group vào SpawnSystem
this.spawn.init(this, {
  ground: this.groundGroup,
  flasks: this.flasksGroup,
  powerups: this.powerupsGroup,
  enemies: this.enemiesGroup,
  obstacles: this.obstaclesGroup,
  enemyBullets: this.enemyBulletsGroup, // ← MỚI
});

// Collision: đạn lính chạm player
this.physics.add.overlap(
  this.playerSys.sprite, this.enemyBulletsGroup,
  this.playerSys.onHitEnemyBullet // ← Handler mới trong PlayerSystem
);

// Collision: đạn player hủy đạn lính
this.physics.add.overlap(
  this.playerSys.projectiles, this.enemyBulletsGroup,
  (_pProj: any, _eBullet: any) => {
    _pProj.destroy();
    _eBullet.destroy();
  }
);
```

**Trong `update()` — thêm vòng lặp bắn đạn của lính:**
```typescript
// === Xử lý enemy AI bắn đạn ===
const now = time;
const playerX = this.playerSys.sprite.x;
const playerY = this.playerSys.sprite.y;

for (const enemy of enemyChildren) {
  if (!enemy || !enemy.active || !enemy.body) continue;
  if (!enemy.getData('canShoot')) continue;
  
  const nextShoot = enemy.getData('nextShootTime') || 0;
  if (now < nextShoot) continue;
  
  const shootInterval = enemy.getData('shootInterval') || 3000;
  const diffTier = getDifficultyState(state.score).tier;
  const speedMult = 1 + diffTier * DIFFICULTY.ENEMY_SHOOT_SPEED_PER_TIER;
  
  // Cập nhật thời gian bắn tiếp theo (có random ±20% để không đồng loạt)
  enemy.setData('nextShootTime', now + shootInterval * (0.8 + Math.random() * 0.4));
  
  // Tạo đạn, hướng về player
  const bullet = this.enemyBulletsGroup.create(enemy.x, enemy.y, 'security_voltage');
  bullet.setDisplaySize(12, 12).setTint(0xffaa00);
  
  const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, playerX, playerY);
  const bulletSpeed = RUNNER_PHYSICS.enemyBulletSpeed * speedMult;
  this.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), bulletSpeed, bullet.body.velocity);
  bullet.body.updateFromGameObject();
  
  // Animation xoay đạn
  bullet.body.setAngularVelocity(300);
}

// Cull đạn lính đã ra khỏi viewport
this.enemyBulletsGroup.getChildren().forEach((b: any) => {
  if (b.active && (b.x < camScrollX - 100 || b.x > camScrollX + width + 200)) {
    b.destroy();
  }
});
```

**Thêm cull `enemyBulletsGroup` trong `respawn()`:**
```typescript
this.enemyBulletsGroup.clear(true, true);
```

---

### 5. `src/game/entities/PlayerSystem.ts` — Sửa cơ chế bắn

#### [MODIFY] [PlayerSystem.ts](file:///d:/_company/game/kaizen-journey/src/game/entities/PlayerSystem.ts)

**Sửa điều kiện bắn (dòng 244–250):**

```typescript
// ── 4. Shooting — chỉ cho phép bắn khi đang Kaizen Mode ──────────────
if (!this.controlsLocked && state.isKaizenMode && state.kaizenAmmo > 0) {
  // Space = bắn (chỉ khi đang Kaizen, không phải kích hoạt)
  // Z = phím bắn thay thế
  const wantShoot = keys.space.isDown || (keys.z?.isDown ?? false);
  if (wantShoot && time > state.nextShootTime) {
    this.shoot(time);
  }
}
```

**Sửa phase guard trong `shoot()`:**
```typescript
private shoot(time: number): void {
  const state = this.state;
  // Guard: không bắn trong intro, game_over, map_clear
  if (['intro', 'game_over', 'map_clear'].includes(state.currentPhase)) return;
  if (time < state.kaizenCooldownUntil) return;
  if (state.kaizenAmmo <= 0) return; // Guard ammo
  // ... phần còn lại giữ nguyên
}
```

**Thêm collision handler `onHitEnemyBullet`:**
```typescript
onHitEnemyBullet!: (player: any, bullet: any) => void;
```

Trong `initCollisionHandlers()`:
```typescript
this.onHitEnemyBullet = (_player, bullet) => {
  bullet.destroy();
  if (state.shieldUntil > scene.time.now || state.invulnerableUntil > scene.time.now) return;
  this.takeDamage();
};
```

---

### 6. `src/game/maps/MapConfig.ts` — Không thay đổi

---

## Tổng quan chiến lược độ khó

| Tier | Score | Enemy shoot interval | Đạn tốc độ | Platform gap |
|---|---|---|---|---|
| 0 | 0–499 | 3000ms | 180px/s | 64–128px |
| 1 | 500–999 | 2650ms | 216px/s | 64–192px |
| 2 | 1000–1499 | 2300ms | 252px/s | 64–192px |
| 3 | 1500–1999 | 1950ms | 288px/s | 64–256px |
| 4 | 2000–2499 | 1600ms | 324px/s | 64–256px |
| 5 | 2500+ | 1250ms → 800ms | 360px/s | 64–256px |

---

## Verification Plan

### Automated Tests
- Không có automated test runner; kiểm tra thủ công qua browser devtools

### Manual Verification
1. **Lính bắn đạn**: Để game chạy 30s → lính (có `canShoot=true`) bắn đạn vàng bay về phía player
2. **Đạn player**: Kích hoạt Kaizen Mode → nhấn Space → đạn bay sang phải, trừ ammo. Z cũng bắn được
3. **Không bắn ngoài Kaizen**: Chưa kích hoạt Kaizen → nhấn Space/Z → không có đạn
4. **Tốc độ tăng**: Đạt score 2500+ → lính bắn nhanh hơn rõ rệt (interval < 1.3s)
5. **Platform floating**: Thấy platform lơ lửng trên cao → nhảy lên được, có item trên đó
6. **Item trên trời**: Thấy flask/powerup ở Y < 300 (không trên mặt đất)
7. **Lane dài ngắn**: Pit có thể rộng tới 256px; platform dài tới 768px

---

## Đề xuất bổ sung (future)

- **Lính Elite**: Lính đỏ HP cao hơn, tốc độ đạn cao hơn, xuất hiện từ tier 3+
- **Triple-shot**: Lính bắn 3 viên hình quạt (tier 4+) hướng về player
- **Item magnet**: Powerup mới kéo item xung quanh về phía player trong 5s
- **Spring platform**: Platform nảy player lên cao khi đứng lên (để vào item trên trời cao)
