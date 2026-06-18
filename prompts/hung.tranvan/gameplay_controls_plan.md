# Kế hoạch Đồng bộ Hệ thống Điều khiển và Hướng dẫn Trò chơi

Tài liệu này trình bày kế hoạch tái cơ cấu hệ thống điều khiển nhân vật (mở rộng di chuyển ngang Trái/Phải), điều khiển chế độ Kaizen Mode (kích hoạt chủ động bằng SPACE thay vì tự động) và đồng nhất tất cả UI hướng dẫn người chơi trong game.

## User Review Required

> [!NOTE]
> - **Cơ chế di chuyển ngang (Trái/Phải)**: Người chơi có thể dùng `A/D` hoặc `←/→` để di chuyển lùi/tiến trong khung hình viewport (từ 10% đến 80% chiều rộng màn hình). Khi di chuyển, tốc độ cuộn của map vẫn không đổi.
> - **Kích hoạt Kaizen Mode thủ công**: Thay vì tự kích hoạt ngay khi đạt 100% năng lượng, năng lượng sẽ giữ ở mức 100% (thanh năng lượng nhấp nháy báo Ready). Người chơi cần nhấn `SPACE` để chủ động chuyển sang Kaizen Mode. Các lần nhấn `SPACE` sau đó mới thực hiện bắn đạn.

## Proposed Changes

### 1. In-game Controls (Phaser Logic)

#### [MODIFY] [PlayerSystem.ts](file:///d:/_company/game/kaizen-journey/src/game/entities/PlayerSystem.ts)
- Cập nhật kiểu `Keys` để khai báo đầy đủ các phím `left`, `right`, `a`, `d`.
- Bổ sung thuộc tính `public relativeX = 384` để quản lý vị trí X tương đối của player đối với scroll camera (mặc định là `width * 0.4`).
- Trong phương thức `update()`, thêm phần đọc các phím `left/a` và `right/d` để thay đổi `relativeX` với tốc độ điều chỉnh `250 px/s`. Giới hạn `relativeX` trong khoảng `[width * 0.1, width * 0.8]`.
- Trong phương thức `increaseEnergy()`, loại bỏ logic tự động kích hoạt Kaizen Mode khi đạt 100% năng lượng.
- Trong phương thức `update()`, thêm logic kiểm tra điều kiện kích hoạt thủ công: nếu `state.kaizenEnergy >= 100 && !state.isKaizenMode && keys.space.isDown` thì gọi `activateKaizenMode(time)`.
- Trong phương thức `respawn()`, thiết lập lại `relativeX` dựa trên vị trí checkpoint (nếu hồi sinh ở boss: `width * 0.2`, nếu ở runner: `width * 0.4`).

#### [MODIFY] [GameScene.ts](file:///d:/_company/game/kaizen-journey/src/game/scenes/GameScene.ts)
- Bổ sung việc khởi tạo phím `left` (LEFT), `right` (RIGHT), `a` (A), `d` (D) vào thuộc tính `keys` trong phương thức `create()`.
- Trong phương thức `update()`:
  - Khi ở phase `'runner'`, khóa vị trí X của player theo công thức: `this.playerSys.sprite.x = this.cameras.main.scrollX + this.playerSys.relativeX`.
  - Khi ở phase `'boss'` hoặc `'boss_intro'`:
    - Nếu là `'boss'`: cập nhật X của player theo `scrollX + playerSys.relativeX`.
    - Nếu là `'boss_intro'` (đang chạy tween tự động): cập nhật `playerSys.relativeX = playerSys.sprite.x - cameras.main.scrollX` để giữ đồng bộ vị trí khi chuyển phase.
  - Khi ở phase `'intro'`: liên tục cập nhật `playerSys.relativeX = playerSys.sprite.x - cameras.main.scrollX`.

### 2. UI Guidance (React & Phaser Canvas Displays)

#### [MODIFY] [MenuScene.ts](file:///d:/_company/game/kaizen-journey/src/game/scenes/MenuScene.ts)
- Cập nhật bảng hướng dẫn điều khiển vẽ trên Canvas Menu:
  - Thêm hướng dẫn di chuyển Trái/Phải: `A/D/⬅/➡ : Di chuyển`.
  - Làm rõ tính năng phím SPACE: `SPACE : Kích hoạt Kaizen Mode (khi 100% Energy) & Bắn đạn`.

#### [MODIFY] [MapJourneyPanel.tsx](file:///d:/_company/game/kaizen-journey/src/components/game/MapJourneyPanel.tsx)
- Cập nhật mảng `CONTROLS` để phản ánh đúng các phím di chuyển phụ trợ:
  - Nhảy: `W / ↑`
  - Cúi / Né: `S / ↓`
  - Di chuyển: `A / D / ← / →`
  - Kaizen Mode: `SPACE / Z` (năng lượng 100% nhấn SPACE để kích hoạt)

#### [MODIFY] [SkillsModal.tsx](file:///d:/_company/game/kaizen-journey/src/components/game/SkillsModal.tsx)
- Chỉnh sửa thông tin kỹ năng `Kaizen Mode Keyboard`:
  - Phím bấm đổi thành: `SPACE khi Energy = 100%`.
  - Mô tả đổi thành: `Bàn phím cơ Kaizen tối thượng được kích hoạt thủ công bằng phím SPACE khi tích lũy đủ 100% năng lượng Kaizen (nhặt nước hoặc tiêu diệt Bug).`
- Bổ sung phím `Z` cho kỹ năng bắn đạn: `SPACE / Z`.

## Verification Plan

### Automated Tests
- Chạy ứng dụng Next.js ở chế độ phát triển để xác nhận không lỗi biên dịch:
  `npm run dev`

### Manual Verification
- **Kiểm tra di chuyển ngang**: Sử dụng phím `A/D` hoặc các phím mũi tên `←/→` để kiểm tra Mascot di chuyển tiến/lùi mượt mà trên màn hình. Xác nhận không thể di chuyển quá mép trái (10% màn hình) hoặc mép phải (80% màn hình).
- **Kiểm tra kích hoạt Kaizen**: Nhặt Flasks để tăng năng lượng lên 100%. Xác nhận Kaizen Mode không tự kích hoạt. Nhấn `SPACE` và kiểm tra xem Kaizen Mode có kích hoạt hay không, Mascot có chuyển màu đỏ và bắt đầu bắn đạn khi nhấn SPACE/Z tiếp theo không.
- **Kiểm tra giao diện hướng dẫn**: Vào menu bắt đầu, sidebar bên trái, và modal kỹ năng để kiểm tra các phím hướng dẫn đã được hiển thị đúng và đủ.
