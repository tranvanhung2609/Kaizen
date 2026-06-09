# KẾ HOẠCH TÀI NGUYÊN STITCH: VTI 9-YEAR ADVENTURE - KAIZEN JOURNEY

**Mục đích:** Lập danh sách tài nguyên và frame cần sinh bằng Stitch để phục vụ triển khai Canvas và cảnh chuyển.

Quy chuẩn phong cách chi tiết:

> [../../.skills/item_art_style_stitch.md](../../.skills/item_art_style_stitch.md)

---

## 1. Nguyên Tắc Chung

- Tài nguyên gameplay phải đọc rõ ở kích thước `32px`, `48px`, `64px`.
- Sprite nên dùng nền trong suốt, dáng nhận diện rõ, viền sắc, ánh sáng công nghệ mềm.
- Góc nhìn ưu tiên ngang hoặc 3/4 ngang nhẹ để hợp game chạy ngang.
- Frame trong cùng sprite sheet cần cùng kích thước khung và điểm neo ổn định.
- Không dùng chi tiết chữ nhỏ, ngoại trừ đạn key `"Tab"` và `"Enter"` đủ lớn để đọc.

---

## 2. Sprite Sheet Mascot

| Màn | Trang phục | Frame cần có |
| --- | --- | --- |
| Hà Nội | Áo dài cách tân đỏ viền vàng, giày thể thao, tai nghe công nghệ | đứng chờ, chạy 6 frame, nhảy, rơi, cúi, bay, trúng đòn, Kaizen |
| Tokyo | Kimono cách tân hoặc business casual high-tech, dải năng lượng sau lưng | đứng chờ, chạy 6 frame, nhảy, rơi, cúi, bay, trúng đòn, Kaizen |
| Đà Nẵng | Áo polo xanh VTI, quần thể thao, smart visor | đứng chờ, chạy 6 frame, nhảy, rơi, cúi, bay, trúng đòn, Kaizen |

Prompt mẫu:

```text
Create a compact sprite sheet for a 2D endless runner game.
Character: VTI mascot, [MAP] outfit.
Actions/states: idle, run cycle 6 frames, jump, fall, crouch, flying with tech wings, hit reaction, kaizen power mode.
Style: premium semi-flat 2D runner game asset, clean vector-like silhouette, readable at small size, crisp outline, soft tech glow, transparent background.
Keep consistent size, centered pivot, side-view / slight 3/4 side-view, no background scene.
Avoid: dark cyberpunk, horror, excessive tiny details, cluttered particles.
```

---

## 3. Vật Phẩm Thu Thập & Vật Phẩm Hỗ Trợ

| Tài nguyên | Biến thể theo màn | Vai trò gameplay | Frame/trạng thái |
| --- | --- | --- | --- |
| Bình kinh nghiệm | Hà Nội, Tokyo, Đà Nẵng | Cộng điểm + Nội năng Kaizen | sáng nhẹ, hiệu ứng thu thập |
| Khiên Tôn trọng | Dùng chung + điểm nhấn theo màn | Chặn sát thương | biểu tượng, vòng lặp kích hoạt, chặn đòn, nhấp nháy sắp hết |
| Cánh Trách nhiệm | Dùng chung + điểm nhấn theo màn | Bay 10 giây | biểu tượng, gắn trên Mascot, vệt tăng tốc, nhấp nháy sắp hết |
| Bàn phím Kaizen | Dùng chung + điểm nhấn theo màn | Bắn "Tab"/"Enter" | trang bị, lóe sáng khi bắn, đạn Tab, đạn Enter |

Prompt mẫu:

```text
Create a 2D game asset for "VTI 9-Year Adventure - Kaizen Journey".
Asset: [ASSET_NAME].
Map theme: [HANOI / TOKYO / DANANG].
Style: premium semi-flat 2D runner game asset, clean vector-like silhouette, readable at small size, soft tech glow, crisp outline, transparent background.
Visual motif: [LOCAL_CULTURAL_MOTIF].
Color palette: [MAIN_COLORS].
Gameplay readability: high contrast, no tiny details, clear hitbox-friendly shape.
Avoid: dark cyberpunk, horror, stock-photo realism, excessive particles, cluttered details.
```

---

## 4. Kẻ Địch & Chướng Ngại

| Tài nguyên | Màn | Frame/trạng thái |
| --- | --- | --- |
| Bug Tắc Đường | Hà Nội | đứng chờ, bò 4 frame, bị giẫm |
| Bug Trì Hoãn | Hà Nội | bay tại chỗ 4 frame, bắn, bị hạ |
| Overtime Bug | Tokyo | chạy 4 frame, cảnh báo ném giấy, bị giẫm |
| Language Barrier Bug | Tokyo | bay tại chỗ 4 frame, bắn chéo, bị hạ |
| Low Battery Bug | Đà Nẵng | đứng chờ, bò 4 frame, xung điện, bị giẫm |
| Data Leak Bug | Đà Nẵng | bay zigzag 4 frame, bắn packet, bị hạ |
| Hố sâu | Theo màn | mép cảnh báo, hố mở |
| Bom thấp | Theo màn | đứng yên, nhấp nháy cảnh báo |
| Bom dù | Tokyo, Đà Nẵng | rơi theo vòng lặp, nhấp nháy cảnh báo |

Yêu cầu dễ đọc:

- Bug mặt đất phải có thân thấp, rõ vùng đầu để người chơi giẫm.
- Bug bay phải có hướng bắn rõ.
- Bom và Hố sâu dùng màu cảnh báo, không giống vật phẩm thưởng.
- Frame cảnh báo phải khác rõ frame gây sát thương.

---

## 5. Tài Nguyên Trùm

| Trùm | Màn | Tài nguyên cần sinh |
| --- | --- | --- |
| Boss Deadline Cổ Phố | Hà Nội | tranh giới thiệu trùm, sprite gameplay, frame tấn công, frame trúng đòn, frame bị hạ |
| Boss Kaizen Breaker | Tokyo | tranh giới thiệu trùm, sprite gameplay, frame tấn công, frame trúng đòn, frame bị hạ |
| Boss Data Storm Dragon | Đà Nẵng | tranh giới thiệu trùm, sprite gameplay, frame tấn công, frame trúng đòn, frame bị hạ |

Prompt mẫu:

```text
Create boss intro artwork for a 2D runner game cutscene.
Boss name: [BOSS_NAME].
Map theme: [HANOI / TOKYO / DANANG].
Composition: boss centered, readable silhouette, dramatic but family-friendly, VTI tech accents, local cultural motif, space for title text overlay.
Style: premium semi-flat illustration, clean edges, controlled glow, not dark cyberpunk.
```

---

## 6. Frame Cảnh Chuyển

| Cảnh chuyển | Frame cần có |
| --- | --- |
| Mở màn Hà Nội | Mascot trước Hồ Gươm/VTI Hà Nội, chuẩn bị chạy |
| Giới thiệu trùm Hà Nội | Boss Deadline Cổ Phố xuất hiện |
| Hoàn thành Hà Nội | Mascot vượt qua phố cổ, mở đường bay tới Tokyo |
| Mở màn Tokyo | Skyline Tokyo, hoa anh đào và màn hình VTI 9 năm |
| Giới thiệu trùm Tokyo | Boss Kaizen Breaker xuất hiện |
| Hoàn thành Tokyo | Mascot hoàn tất thử thách, chuyển cảnh về Đà Nẵng |
| Mở màn Đà Nẵng | Cầu Rồng, biển Mỹ Khê, tempo tăng |
| Giới thiệu trùm Đà Nẵng | Boss Data Storm Dragon xuất hiện |
| Kết thúc hành trình | Tổng kết hành trình 9 năm VTI và thứ hạng |

---

## 7. Quy Ước File Tài Nguyên Đề Xuất

```text
public/assets/images/
  hanoi/
    mascot/
      mascot_sheet.png
    items/
      experience_flask.png
      experience_flask_collect.png
      respect_shield_sheet.png
      responsibility_wings_sheet.png
      kaizen_keyboard_sheet.png
      keyboard_projectiles_sheet.png
    obstacles/
      pit.png
      pit_warning.png
      bomb_low_sheet.png
    enemies/
      ground_bug_sheet.png
      flying_bug_sheet.png
      flying_bug_projectile.png
    bosses/
      deadline_boss_sheet.png
      deadline_boss_projectiles_sheet.png
      deadline_boss_intro.png
    cutscenes/
      opening.png
      boss_intro.png
      clear.png
      to_tokyo_transition.png
    hud/
      heart_icon.png
      score_icon.png
      hud_icons_sheet.png
      kaizen_energy_icon.png
      responsibility_timer_icon.png
      respect_timer_icon.png
    backgrounds/
      far_background.png
      midground.png
      foreground.png
      ground_tiles.png
      boss_arena_background.png
  tokyo/
    (Cấu trúc các nhóm thư mục tương tự như hanoi/, chứa tài nguyên riêng của map Tokyo)
  danang/
    (Cấu trúc các nhóm thư mục tương tự như hanoi/, chứa tài nguyên riêng của map Đà Nẵng)

public/assets/audio/
  common/
    (Các hiệu ứng click, hover UI dùng chung)
  hanoi/
    runner_bgm.mp3
    boss_bgm.mp3
    sfx/
      (Các hiệu ứng âm thanh như flask, shield, wings, shoot, v.v. của Hà Nội)
  tokyo/
    runner_bgm.mp3
    boss_bgm.mp3
    sfx/
      (Các hiệu ứng âm thanh đặc thù cho map Tokyo)
  danang/
    runner_bgm.mp3
    boss_bgm.mp3
    sfx/
      (Các hiệu ứng âm thanh đặc thù cho map Đà Nẵng)
```
