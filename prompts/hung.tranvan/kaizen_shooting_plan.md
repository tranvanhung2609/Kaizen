# Kế hoạch triển khai: Cơ chế tích nội tại Kaizen và bắn đạn Boss

Tài liệu này mô tả chi tiết kế hoạch triển khai cơ chế tích lũy năng lượng Kaizen (nội tại), kích hoạt chế độ Kaizen Mode hiển thị vũ khí bàn phím (`keyboard.png`), bắn đạn keycap (`keycap.png`) bay xoay tròn và gây sát thương định mức lên Boss, đồng thời cập nhật thanh máu Boss thời gian thực.

---

## Ý kiến người dùng cần xác nhận (User Review Required)

> [!IMPORTANT]
> **Hiển thị vũ khí súng (Keyboard):** 
> Hiện tại Mascot chưa có sprite cầm vũ khí trực quan. Kế hoạch đề xuất tạo thêm một Sprite vũ khí riêng (`weaponSprite` dùng asset `keyboard.png`), di chuyển bám sát tay nhân vật Mascot khi và chỉ khi ở chế độ **Kaizen Mode**. Khi Mascot bắn, súng sẽ có hiệu ứng giật nhẹ (Recoil tween) và bắn ra đạn keycap (`keycap.png`).
> Điều này mang lại trải nghiệm premium, sinh động và rõ ràng cho người chơi.

> [!TIP]
> **Cấu hình sát thương và đạn bay:**
> - Sát thương định mức cho mỗi viên đạn sẽ được định nghĩa tại `constants.ts` (ví dụ: `bulletDamage = 50`). Máu của Boss (mặc định 1000) sẽ bị trừ đúng bằng lượng sát thương này mỗi khi trúng đạn.
> - Đạn keycap khi bay sẽ được thêm hiệu ứng xoay tròn liên tục (`angularVelocity = 360` hoặc tween góc xoay) để tạo cảm giác cơ học trực quan, tăng độ chuyên nghiệp cho game.

---

## Câu hỏi mở (Open Questions)

> [!NOTE]
> **1. Có nên hiển thị số sát thương nhảy lên (Damage Popups) khi bắn trúng Boss không?**
> Chúng tôi đề xuất thêm một hiệu ứng chữ bay số lượng máu bị trừ (ví dụ: `-50` màu đỏ/cam bay lên và mờ dần) tại vị trí Boss bị trúng đạn để tăng cảm giác phản hồi lực bắn (impact feel).

> [!NOTE]
> **2. Giới hạn số lượng đạn bắn ra (Kaizen Ammo):**
> Ở trạng thái Kaizen Mode hiện tại, người chơi có `10` viên đạn. Khi bắn hết 10 viên, chế độ kết thúc và bắt đầu hồi chiêu 5 giây. Cơ chế này đã tối ưu chưa hay cần tăng/giảm lượng đạn hoặc cho phép tự hồi phục một phần đạn khi nhặt XP Flask trong Kaizen Mode?

---

## Đề xuất thay đổi (Proposed Changes)

Các thay đổi sẽ được nhóm theo từng file và component trong kiến trúc Phaser 3 hiện tại:

### 1. Cấu hình hằng số game (Game Constants)

#### [MODIFY] [constants.ts](file:///d:/_company/game/kaizen-journey/src/game/engine/constants.ts)
- Thêm thuộc tính cấu hình sát thương của đạn và kích thước hiển thị súng/đạn vào `RUNNER_PHYSICS`:
  ```typescript
  export const RUNNER_PHYSICS = {
    // ... các cấu hình cũ ...
    bulletDamage: 50,         // Sát thương mỗi viên đạn
    bulletScale: 0.15,        // Tỉ lệ scale của đạn keycap
    weaponScale: 0.12,        // Tỉ lệ scale của súng bàn phím
    bulletSpeed: 800,         // Tốc độ bay của đạn
  };
  ```

---

### 2. Quản lý trạng thái đạn và súng của Mascot (Player System)

#### [MODIFY] [PlayerSystem.ts](file:///d:/_company/game/kaizen-journey/src/game/entities/PlayerSystem.ts)
- **Khai báo thêm `weaponSprite`:**
  ```typescript
  weaponSprite!: Phaser.GameObjects.Sprite;
  ```
- **Khởi tạo vũ khí trong `create()`:**
  Tải và tạo sprite vũ khí từ asset `kaizen_keyboard` (đã preload sẵn trong `PreloadScene` từ `keyboard.png`). Mặc định ẩn vũ khí này đi.
  ```typescript
  this.weaponSprite = scene.add.sprite(this.sprite.x, this.sprite.y, 'kaizen_keyboard');
  this.weaponSprite.setScale(RUNNER_PHYSICS.weaponScale).setDepth(6).setVisible(false);
  ```
- **Cập nhật tọa độ vũ khí bám theo Mascot trong `update()`:**
  - Nếu `state.isKaizenMode === true`:
    - Hiển thị súng: `this.weaponSprite.setVisible(true);`
    - Cập nhật vị trí súng bám sát trước ngực/tay của Mascot (tính toán offset dựa theo hành động chạy/nhảy/cúi của Mascot).
    - Ví dụ: 
      ```typescript
      const offsetY = isCrouching ? 20 : 10;
      this.weaponSprite.setPosition(this.sprite.x + 20, this.sprite.y + offsetY);
      ```
  - Nếu không trong chế độ Kaizen Mode:
    - Ẩn súng: `this.weaponSprite.setVisible(false);`
- **Cải tiến logic bắn đạn `shoot()`:**
  - Lấy đạn từ pool `projectiles` với asset `'kaizen_bullet'` (đã load từ `keycap.png`).
  - Gán sát thương cho projectile qua thuộc tính `setData('damage', RUNNER_PHYSICS.bulletDamage)`.
  - Thêm thuộc tính xoay tròn vật lý cho viên đạn để tạo hiệu ứng bay sinh động:
    ```typescript
    (proj.body as Phaser.Physics.Arcade.Body).setAngularVelocity(360); // Xoay 360 độ/giây
    ```
  - Thêm hiệu ứng giật súng (Recoil Tween) khi bắn:
    ```typescript
    this.scene.tweens.add({
      targets: this.weaponSprite,
      x: this.weaponSprite.x - 8,
      duration: 50,
      yoyo: true,
      repeat: 0
    });
    ```
- **Cập nhật va chạm đạn với quái thường trong `onProjectileHitEnemy`:**
  - Sử dụng `RUNNER_PHYSICS.bulletDamage` thay vì giá trị cứng `50` để trừ máu quái thường.
- **Cập nhật hàm `respawn()`:**
  - Ẩn `weaponSprite` khi reset lại Mascot để tránh súng bay lơ lửng lúc chết.

---

### 3. Đăng ký va chạm và xử lý trừ máu Boss (Boss System)

#### [MODIFY] [BossSystem.ts](file:///d:/_company/game/kaizen-journey/src/game/entities/BossSystem.ts)
- **Cập nhật hàm va chạm `onHitBoss`:**
  - Nhận lượng sát thương của viên đạn từ dữ liệu lưu trữ của projectile:
    ```typescript
    const damage = proj.getData('damage') || RUNNER_PHYSICS.bulletDamage;
    ```
  - Trừ máu Boss:
    ```typescript
    state.bossHp = Math.max(0, state.bossHp - damage);
    ```
  - Kích hoạt hiệu ứng flash trắng trên Boss và phát âm thanh trúng đạn.
  - Tạo text báo sát thương bay lên (Damage Popup) tại vị trí trúng đạn:
    ```typescript
    const damageText = scene.add.text(proj.x, proj.y - 20, `-${damage}`, {
      font: '900 16px Courier New, monospace',
      color: '#ff3b30',
      stroke: '#000000',
      strokeThickness: 3
    }).setDepth(10).setOrigin(0.5);
    scene.tweens.add({
      targets: damageText,
      y: damageText.y - 40,
      alpha: 0,
      duration: 600,
      onComplete: () => damageText.destroy()
    });
    ```
  - Gọi `onHudEmit()` để cập nhật thanh máu HP của Boss hiển thị trên HUD của GameScene.

---

### 4. Quét dọn bộ nhớ đạn bay xa (GameScene Coordinator)

#### [MODIFY] [GameScene.ts](file:///d:/_company/game/kaizen-journey/src/game/scenes/GameScene.ts)
- **Tối ưu hóa Projectiles Offscreen Culling:**
  - Đạn bay đi quá xa sang phải màn hình (vượt viewport camera) cần được hủy để tránh tràn bộ nhớ.
  - Trong `update()`, bổ sung culling cho `playerSys.projectiles`:
    ```typescript
    const camRight = this.cameras.main.scrollX + this.scale.width;
    this.playerSys.projectiles.getChildren().forEach((proj: any) => {
      if (proj.active && proj.x > camRight + 100) {
        proj.destroy();
      }
    });
    ```

---

## Kịch bản kiểm thử & Xác minh (Verification Plan)

### Kiểm thử tự động (Automated Testing)
- Kiểm tra biên dịch dự án Next.js bằng lệnh build:
  ```powershell
  npm run build
  ```

### Kiểm thử thủ công (Manual Verification)
1. **Kiểm tra tích lũy năng lượng Kaizen:**
   - Điều khiển nhân vật Mascot nhặt XP Flask và giẫm lên quái vật thường.
   - Xác minh thanh năng lượng Kaizen Energy tăng tương ứng và tự động kích hoạt Kaizen Mode khi đạt 100%.
2. **Kiểm tra hiển thị vũ khí (Keyboard):**
   - Xác minh súng bàn phím (`keyboard.png`) xuất hiện ngay khi kích hoạt Kaizen Mode.
   - Di chuyển, nhảy, cúi Mascot và kiểm tra xem súng có bám sát tọa độ Mascot một cách mượt mà không bị lệch vị trí.
3. **Kiểm tra cơ chế bắn đạn (Keycap Projectiles):**
   - Nhấn `Space` hoặc phím `Z` để bắn.
   - Xác minh đạn keycap bay ra từ nòng súng, có hiệu ứng xoay tròn và súng giật nhẹ lùi về phía sau.
   - Kiểm tra âm thanh bắn súng phát ra chuẩn xác.
4. **Kiểm tra va chạm & Sát thương Boss:**
   - Để Mascot chạy đến cổng Boss để kích hoạt Boss Fight.
   - Thu thập bàn phím hoặc tích lũy năng lượng để vào Kaizen Mode, sau đó bắn đạn vào Boss.
   - Xác minh:
     - Đạn biến mất khi va chạm với Boss.
     - Số HP của Boss giảm đi tương ứng (trừ đúng số sát thương cấu hình, ví dụ 50 HP).
     - Thanh máu Boss trên đầu Boss cập nhật độ dài và số lượng máu chính xác.
     - Xuất hiện chữ đỏ `-50` bay lên từ Boss.
     - Khi máu Boss về 0, Boss kích hoạt chuỗi animation thất bại và qua màn thành công.
