# Kế hoạch cải tiến giao diện khu vực chơi game và tối ưu hóa cơ chế tích lũy năng lượng Kaizen

Tài liệu này mô tả chi tiết kế hoạch xử lý lại giao diện người dùng (UI HUD) trong khu vực chơi game và tối ưu hóa cơ chế tích lũy năng lượng Kaizen để nâng cao trải nghiệm game.

---

## Ý kiến người dùng cần xác nhận (User Review Required)

> [!IMPORTANT]
> **Loại bỏ các nút Quick Action (Bản đồ & Kỹ năng) trong HUD chơi game:**
> Hai nút **🗺 BẢN ĐỒ** và **⚡ KỸ NĂNG** ở góc phải bên dưới của HUD gameplay hiện tại sẽ bị loại bỏ khỏi màn hình chơi chính. Việc này giúp tối giản hóa màn hình chơi game, hạn chế tối đa việc click nhầm của người chơi trong lúc điều khiển Mascot nhảy/cúi (vốn sử dụng góc dưới bên phải trên các thiết bị cảm ứng hoặc phím điều hướng). Bản đồ và bảng Kỹ năng vẫn có thể truy cập được từ màn hình sảnh chính trước khi nhấn bắt đầu chơi.

> [!TIP]
> **Bổ cục mới cho Trạng thái Vật phẩm & Tiêu diệt Lính:**
> - Các vật phẩm hỗ trợ đang sử dụng (Khiên bảo vệ, Cánh bay) sẽ được hiển thị ngay bên dưới thanh Header hoặc góc trên bên trái, tích hợp đồng hồ đếm giây lùi trực quan giúp người chơi dễ theo dõi.
> - Số lượng kẻ địch (Lính) đã tiêu diệt (Ground Bug 🐛, Flying Bug 🐝) sẽ được hiển thị dưới dạng icon nhỏ kèm chỉ số đếm ở góc trên bên phải để người chơi theo dõi thành tích diệt Bug thời gian thực.

---

## Câu hỏi mở (Open Questions)

> [!NOTE]
> **1. Có cần lưu trữ số lượng lính tiêu diệt khi đi qua checkpoint không?**
> Chúng tôi đề xuất: Khi Mascot chết và hồi sinh tại checkpoint, số lượng lính đã tiêu diệt cũng sẽ được rollback (khôi phục lại) về thời điểm đạt checkpoint, tương tự như điểm số (Score) và năng lượng (Kaizen Energy). Điều này đảm bảo tính nhất quán của dữ liệu.

> [!NOTE]
> **2. Thời gian và Đạn của Kaizen Mode:**
> Khi ở Kaizen Mode, Mascot được cấp 10 viên đạn keycap. Chúng ta sẽ hiển thị biểu tượng súng bàn phím ⌨️ kèm số đạn còn lại (ví dụ `⌨️ KAIZEN: 8/10`) để người chơi biết khi nào chế độ kết thúc.

---

## Đề xuất thay đổi (Proposed Changes)

### 1. Quản lý trạng thái và dữ liệu game (Game State)

#### [MODIFY] [GameState.ts](file:///d:/_company/game/kaizen-journey/src/game/engine/GameState.ts)
- Bổ sung thêm hai thuộc tính mới vào interface `GameState`:
  - `groundBugsDefeated: number;` — Số lượng Bug mặt đất bị Mascot giẫm chết.
  - `flyingBugsDefeated: number;` — Số lượng Bug bay bị Mascot bắn chết.
  - `checkpointGroundBugs: number;` — Lưu số lượng Bug mặt đất tiêu diệt tại checkpoint.
  - `checkpointFlyingBugs: number;` — Lưu số lượng Bug bay tiêu diệt tại checkpoint.
- Cập nhật hàm `createInitialGameState()` để khởi tạo các thuộc tính này bằng `0`.

---

### 2. Tích lũy Kaizen và tăng đếm tiêu diệt lính (Player System)

#### [MODIFY] [PlayerSystem.ts](file:///d:/_company/game/kaizen-journey/src/game/entities/PlayerSystem.ts)
- **Sửa cơ chế tích lũy Kaizen Energy:**
  - Hiện tại, năng lượng Kaizen tăng thụ động ở bất kỳ phase nào không phải `game_over` hay `map_clear`.
  - Cần chỉnh sửa để năng lượng chỉ tăng khi người chơi đang thực sự chơi game (ở phase `runner` hoặc `boss`):
    ```typescript
    // ── 3. Kaizen Mode Energy ─────────────────────────────────────────────
    if (state.currentPhase === 'runner' || state.currentPhase === 'boss') {
      if (!state.isKaizenMode) {
        const energyGain = (RUNNER_PHYSICS.energyPerSecond * this.scene.game.loop.delta) / 1000;
        this.increaseEnergy(energyGain);
      }
    }
    ```
- **Tăng bộ đếm tiêu diệt lính khi va chạm/bị bắn:**
  - Trong callback `onHitEnemy` (Mascot giẫm chết Bug):
    - Nếu Mascot giẫm chết ground_bug: `state.groundBugsDefeated += 1;`
    - Nếu Mascot giẫm chết flying_bug: `state.flyingBugsDefeated += 1;`
  - Trong callback `onProjectileHitEnemy` (Mascot bắn chết Bug bằng đạn keycap):
    - Khi máu kẻ địch <= 0:
      - Nếu kẻ địch là ground_bug: `state.groundBugsDefeated += 1;`
      - Nếu kẻ địch là flying_bug: `state.flyingBugsDefeated += 1;`
- **Cập nhật logic `respawn()` và lưu checkpoint:**
  - Khi lưu checkpoint (ở cổng Boss hoặc điểm trung gian):
    - `state.checkpointGroundBugs = state.groundBugsDefeated;`
    - `state.checkpointFlyingBugs = state.flyingBugsDefeated;`
  - Khi hồi sinh (`respawn`):
    - Khôi phục số lượng lính bị diệt từ checkpoint:
      - `state.groundBugsDefeated = state.checkpointGroundBugs || 0;`
      - `state.flyingBugsDefeated = state.checkpointFlyingBugs || 0;`

---

### 3. Đồng bộ hóa HUD event (HUD System)

#### [MODIFY] [HudSystem.ts](file:///d:/_company/game/kaizen-journey/src/game/engine/HudSystem.ts)
- Khai báo các biến lưu trữ thay đổi (last-value checks) để tránh emit React render lặp lại vô ích:
  - `private lastGroundBugsDefeated = -1;`
  - `private lastFlyingBugsDefeated = -1;`
- Reset các biến trên trong `resetTracking()`.
- Trong hàm `emit()`, bổ sung check sự thay đổi của các giá trị trên. Nếu có thay đổi, gửi thêm chúng vào event payload gửi cho React:
  ```typescript
  this.scene.game.events.emit('hud-update', {
    // ... các thuộc tính hiện tại ...
    groundBugsDefeated: state.groundBugsDefeated,
    flyingBugsDefeated: state.flyingBugsDefeated,
  });
  ```

---

### 4. Giao diện HUD React Overlay (HUD Component)

#### [MODIFY] [HUD.tsx](file:///d:/_company/game/kaizen-journey/src/components/game/HUD.tsx)
- **Cập nhật Props:** Nhận thêm `groundBugsDefeated?: number` và `flyingBugsDefeated?: number` từ component cha.
- **Xóa bỏ các item thừa:**
  - Loại bỏ hoàn toàn khối render nút **BẢN ĐỒ** và **KỸ NĂNG** ở góc phải bên dưới (Lines 340-355).
- **Tái cấu trúc hiển thị Trạng thái Vật phẩm hỗ trợ (Active Buffs):**
  - Đặt khu vực hiển thị trạng thái các buff ở một panel đẹp mắt phía trên bên trái dưới thanh HP.
  - Gộp Khiên (`shieldRemaining`), Cánh (`wingsRemaining`) và Kaizen Keyboard (`isKaizenMode` với lượng đạn còn lại nếu có) vào khu vực này.
  - Thêm hiệu ứng đếm giây lùi rõ ràng (ví dụ: `Khiên: 8s`, `Cánh: 5s`).
- **Thêm hiển thị Kẻ địch / Lính đã diệt:**
  - Thiết kế panel thống kê kẻ địch ở phía trên bên phải (bên cạnh Score/Rank) hiển thị:
    - `🐛 Staging Bug: x{groundBugsDefeated}`
    - `🐝 Prod Bug: x{flyingBugsDefeated}`
  - Dùng CSS Glassmorphism đồng nhất với thiết kế chung của game.

---

### 5. Cập nhật Wrapper Dashboard (Game Dashboard)

#### [MODIFY] [GameDashboard.tsx](file:///d:/_company/game/kaizen-journey/src/app/game/GameDashboard.tsx)
- Cập nhật state `hudState` ban đầu để bao gồm `groundBugsDefeated: 0` và `flyingBugsDefeated: 0`.
- Chuyền các prop mới từ `hudState` vào component `<HUD ... />`.
- Cập nhật hàm `handleRestartFromBeginning` để reset các giá trị đếm lính này về `0` trong `gameScene.state`.

---

## Kịch bản kiểm thử & Xác minh (Verification Plan)

### Kiểm thử tự động (Automated Tests)
- Đảm bảo dự án không gặp lỗi TypeScript hoặc syntax:
  ```powershell
  npm run build
  ```

### Kiểm thử thủ công (Manual Verification)
1. **Kiểm tra Kaizen Accumulation:**
   - Mở game, Mascot đứng ở trạng thái sảnh chờ (Intro phase) hiển thị chữ "CLICK TO START".
   - Xác minh: Thanh Kaizen Energy giữ nguyên ở `0%`, không tăng passively theo thời gian.
   - Nhấp chuột để bắt đầu chơi. Xác minh: Mascot bắt đầu chạy, năng lượng bắt đầu tích lũy thụ động (+5%/giây).
2. **Kiểm tra hiển thị Buff đếm giây (Item HUD):**
   - Nhặt bình năng lượng Respect Shield (Khiên) và Responsibility Wings (Cánh).
   - Xác minh: Icon vật phẩm hiển thị ở panel phía trên kèm đồng hồ đếm ngược giây chuẩn xác.
3. **Kiểm tra đếm số Lính tiêu diệt:**
   - Giẫm đầu tiêu diệt Ground Bug (Bug Staging) và bắn hạ Flying Bug (Bug Prod) bằng Kaizen bullet.
   - Xác minh: Chỉ số diệt Bug tương ứng tăng từ 0 -> 1 -> 2 và hiển thị trực quan ở góc trên.
4. **Kiểm tra loại bỏ nút thừa:**
   - Xác minh màn hình chơi game không còn hai nút Bản Đồ và Kỹ Năng ở góc dưới nữa.
