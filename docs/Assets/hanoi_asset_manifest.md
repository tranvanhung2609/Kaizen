# MANIFEST TÀI NGUYÊN HÀ NỘI

**Màn:** Hà Nội - Khởi nguồn giá trị Tôn trọng  
**Mục đích:** Checklist đầy đủ các ảnh cần sinh bằng Stitch và vị trí lưu file trong dự án.

---

## 1. Quy Ước Chung

- Định dạng ưu tiên: `png`.
- Sprite gameplay nên dùng nền trong suốt.
- Background/cảnh chuyển có thể dùng ảnh nền đầy đủ, không cần trong suốt.
- Sprite cần rõ ở kích thước `32px`, `48px`, `64px`.
- Frame trong cùng sprite sheet cần cùng kích thước khung và điểm neo ổn định.
- Tên file dùng snake_case, tiền tố `hanoi_` cho tài nguyên riêng của màn Hà Nội.

---

## 2. Cây Thư Mục

```text
public/assets/game/
  backgrounds/
    hanoi/
      hanoi_far_background.png
      hanoi_midground.png
      hanoi_foreground.png
      hanoi_ground_tiles.png
      hanoi_boss_arena_background.png
  mascot/
    hanoi_mascot_sheet.png
  items/
    hanoi_experience_flask.png
    hanoi_experience_flask_collect.png
    hanoi_respect_shield_sheet.png
    hanoi_responsibility_wings_sheet.png
    hanoi_kaizen_keyboard_sheet.png
    hanoi_keyboard_projectiles_sheet.png
  obstacles/
    hanoi_pit.png
    hanoi_pit_warning.png
    hanoi_bomb_low_sheet.png
  enemies/
    hanoi_ground_bug_sheet.png
    hanoi_flying_bug_sheet.png
    hanoi_flying_bug_projectile.png
  bosses/
    hanoi_deadline_boss_intro.png
    hanoi_deadline_boss_sheet.png
    hanoi_deadline_boss_projectiles_sheet.png
  cutscenes/
    hanoi_opening.png
    hanoi_boss_intro.png
    hanoi_clear.png
    hanoi_to_tokyo_transition.png
  hud/
    hanoi_heart_icon.png
    hanoi_score_icon.png
    hanoi_kaizen_energy_icon.png
    hanoi_respect_timer_icon.png
    hanoi_responsibility_timer_icon.png
```

---

## 3. Background & Map Layer

| File | Nội dung | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/game/backgrounds/hanoi/hanoi_far_background.png` | Tháp Rùa Hồ Gươm, cầu Thê Húc, hàng liễu, mặt hồ phản chiếu | Nền xa, ít chi tiết nhỏ, không tranh tương phản với gameplay |
| `public/assets/game/backgrounds/hanoi/hanoi_midground.png` | Phố cổ Hà Nội, cột cờ Hà Nội, tòa nhà VTI Hà Nội có logo sáng | Nền giữa, có dấu hiệu VTI rõ nhưng không che gameplay |
| `public/assets/game/backgrounds/hanoi/hanoi_foreground.png` | Khóm hoa, ghế trà đá, biển chỉ dẫn VTI 9 năm | Nền gần, trang trí sát mặt đất |
| `public/assets/game/backgrounds/hanoi/hanoi_ground_tiles.png` | Nền gạch xám cổ dùng làm đường chạy | Có thể tile ngang, mép gạch rõ |
| `public/assets/game/backgrounds/hanoi/hanoi_boss_arena_background.png` | Khu phố cổ chuyển sang không gian đấu Boss Deadline Cổ Phố | Căng hơn runner phase, vẫn giữ màu Hà Nội |

---

## 4. Mascot

| File | Frame cần có | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/game/mascot/hanoi_mascot_sheet.png` | đứng chờ, chạy 6 frame, nhảy, rơi, cúi, bay với cánh, trúng đòn, Chế độ Kaizen | Mascot áo dài cách tân đỏ viền vàng, giày thể thao, tai nghe công nghệ, side-view hoặc 3/4 side-view nhẹ |

---

## 5. Vật Phẩm & Vật Phẩm Hỗ Trợ

| File | Frame/trạng thái | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/game/items/hanoi_experience_flask.png` | bình kinh nghiệm idle glow | Bình thủy tinh nhỏ, họa tiết sóng Hồ Gươm, nắp đỏ VTI, lõi sáng vàng |
| `public/assets/game/items/hanoi_experience_flask_collect.png` | hiệu ứng thu thập | Burst nhỏ, màu vàng/cyan, không quá nhiều particle |
| `public/assets/game/items/hanoi_respect_shield_sheet.png` | biểu tượng, vòng lặp kích hoạt, chặn đòn, nhấp nháy sắp hết | Khiên hoa sen/cầu Thê Húc, glow xanh lục dịu |
| `public/assets/game/items/hanoi_responsibility_wings_sheet.png` | biểu tượng, gắn trên Mascot, vệt bay, nhấp nháy sắp hết | Cánh công nghệ motif nan tre, viền xanh lam |
| `public/assets/game/items/hanoi_kaizen_keyboard_sheet.png` | trang bị, lóe sáng khi bắn | Bàn phím compact keycap đỏ/vàng, công nghệ sáng |
| `public/assets/game/items/hanoi_keyboard_projectiles_sheet.png` | đạn `Tab`, đạn `Enter` | Chữ đủ lớn để đọc, vệt sáng nhẹ, không rối |

---

## 6. Kẻ Địch & Đạn Kẻ Địch

| File | Frame/trạng thái | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/game/enemies/hanoi_ground_bug_sheet.png` | đứng chờ, bò 4 frame, bị giẫm | Bug Tắc Đường, thân thấp, hitbox lớn, vùng đầu dễ nhận biết để giẫm |
| `public/assets/game/enemies/hanoi_flying_bug_sheet.png` | bay tại chỗ 4 frame, bắn, bị hạ | Bug Trì Hoãn, bay thấp, silhouette rõ, có hướng bắn rõ |
| `public/assets/game/enemies/hanoi_flying_bug_projectile.png` | đạn đồng hồ lỗi | Đạn bay thẳng chậm, hình đồng hồ lỗi hoặc icon deadline nhỏ, màu cảnh báo |

---

## 7. Chướng Ngại

| File | Frame/trạng thái | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/game/obstacles/hanoi_pit.png` | hố sâu mở | Vết nứt trên mặt đường gạch, đáy tối, mép rõ |
| `public/assets/game/obstacles/hanoi_pit_warning.png` | cảnh báo trước hố | Bụi, mép nứt, biển cảnh báo nhỏ |
| `public/assets/game/obstacles/hanoi_bomb_low_sheet.png` | đứng yên, nhấp nháy cảnh báo | Bom thấp như túi hàng/rào công trình, yêu cầu người chơi cúi |

---

## 8. Trùm Hà Nội

| File | Frame/trạng thái | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/game/bosses/hanoi_deadline_boss_intro.png` | tranh giới thiệu trùm | Boss Deadline Cổ Phố, cỗ máy đồng hồ lớn phủ giấy note deadline, có khoảng trống đặt title |
| `public/assets/game/bosses/hanoi_deadline_boss_sheet.png` | idle, di chuyển, bắn thẳng, bắn parabol, gọi marker đỏ, trúng đòn, bị hạ | Silhouette lớn, bánh răng kẹt, đèn đỏ nhấp nháy, family-friendly |
| `public/assets/game/bosses/hanoi_deadline_boss_projectiles_sheet.png` | đạn thẳng, đạn parabol thấp, marker đỏ, đạn rơi | Màu cảnh báo rõ, không lẫn với bình kinh nghiệm |

---

## 9. Cảnh Chuyển

| File | Nội dung | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/game/cutscenes/hanoi_opening.png` | Mascot trước Hồ Gươm/VTI Hà Nội, chuẩn bị chạy | Dùng làm mở màn Hà Nội |
| `public/assets/game/cutscenes/hanoi_boss_intro.png` | Boss Deadline Cổ Phố xuất hiện | Có khoảng trống cho tên boss và câu thoại |
| `public/assets/game/cutscenes/hanoi_clear.png` | Mascot vượt qua phố cổ, tinh thần Tôn trọng | Dùng cho kết quả hoàn thành màn |
| `public/assets/game/cutscenes/hanoi_to_tokyo_transition.png` | Mascot lên chuyến bay hướng tới Tokyo, skyline chuyển sang hoa anh đào/LED | Dùng làm chuyển màn |

---

## 10. HUD & Icon Phụ Trợ

| File | Nội dung | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/game/hud/hanoi_heart_icon.png` | icon máu | Có thể dùng chung toàn game nếu đủ trung tính |
| `public/assets/game/hud/hanoi_score_icon.png` | icon điểm | Gợi bình kinh nghiệm hoặc sao công nghệ |
| `public/assets/game/hud/hanoi_kaizen_energy_icon.png` | icon Nội năng Kaizen | Năng lượng sáng, liên hệ bàn phím/cải tiến |
| `public/assets/game/hud/hanoi_respect_timer_icon.png` | icon timer Khiên Tôn trọng | Mini shield hoa sen |
| `public/assets/game/hud/hanoi_responsibility_timer_icon.png` | icon timer Cánh Trách nhiệm | Mini wings nan tre |

---

## 11. Batch Gen Gợi Ý Trong Stitch

1. Background layers: sinh 5 file trong `backgrounds/hanoi`.
2. Mascot sheet: sinh `hanoi_mascot_sheet.png`.
3. Items/power-ups: sinh 6 file trong `items`.
4. Enemies/obstacles: sinh 6 file trong `enemies` và `obstacles`.
5. Boss: sinh 3 file trong `bosses`.
6. Cutscenes: sinh 4 file trong `cutscenes`.
7. HUD icons: sinh 5 file trong `hud`.

Tổng số file ảnh Hà Nội cần chuẩn bị: **30 file**.
