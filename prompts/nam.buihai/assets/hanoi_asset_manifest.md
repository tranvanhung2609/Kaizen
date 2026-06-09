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
- Tài nguyên được chia theo thư mục màn chơi (`hanoi/`, `tokyo/`, `danang/`), loại bỏ tiền tố thừa như `hanoi_` trong tên file.

---

## 2. Cây Thư Mục

```text
public/assets/images/
  hanoi/
    backgrounds/
      far_background.png
      midground.png
      foreground.png
      ground_tiles.png
      boss_arena_background.png
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
      deadline_boss_intro.png
      deadline_boss_sheet.png
      deadline_boss_projectiles_sheet.png
    cutscenes/
      opening.png
      boss_intro.png
      clear.png
      to_tokyo_transition.png
    hud/
      heart_icon.png
      score_icon.png
      kaizen_energy_icon.png
      respect_timer_icon.png
      responsibility_timer_icon.png
      hud_icons_sheet.png
```

---

## 3. Background & Map Layer

| File | Nội dung | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/images/hanoi/backgrounds/far_background.png` | Tháp Rùa Hồ Gươm, cầu Thê Húc, hàng liễu, mặt hồ phản chiếu | Nền xa, ít chi tiết nhỏ, không tranh tương phản với gameplay |
| `public/assets/images/hanoi/backgrounds/midground.png` | Phố cổ Hà Nội, cột cờ Hà Nội, tòa nhà VTI Hà Nội có logo sáng | Nền giữa, có dấu hiệu VTI rõ nhưng không che gameplay |
| `public/assets/images/hanoi/backgrounds/foreground.png` | Khóm hoa, ghế trà đá, biển chỉ dẫn VTI 9 năm | Nền gần, trang trí sát mặt đất |
| `public/assets/images/hanoi/backgrounds/ground_tiles.png` | Nền gạch xám cổ dùng làm đường chạy | Có thể tile ngang, mép gạch rõ |
| `public/assets/images/hanoi/backgrounds/boss_arena_background.png` | Khu phố cổ chuyển sang không gian đấu Boss Deadline Cổ Phố | Căng hơn runner phase, vẫn giữ màu Hà Nội |

---

## 4. Mascot

| File | Frame cần có | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/images/hanoi/mascot/mascot_sheet.png` | đứng chờ, chạy 6 frame, nhảy, rơi, cúi, bay với cánh, trúng đòn, Chế độ Kaizen | Mascot áo dài cách tân đỏ viền vàng, giày thể thao, tai nghe công nghệ, side-view hoặc 3/4 side-view nhẹ |

---

## 5. Vật Phẩm & Vật Phẩm Hỗ Trợ

| File | Frame/trạng thái | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/images/hanoi/items/experience_flask.png` | bình kinh nghiệm idle glow | Bình thủy tinh nhỏ, họa tiết sóng Hồ Gươm, nắp đỏ VTI, lõi sáng vàng |
| `public/assets/images/hanoi/items/experience_flask_collect.png` | hiệu ứng thu thập | Burst nhỏ, màu vàng/cyan, không quá nhiều particle |
| `public/assets/images/hanoi/items/respect_shield_sheet.png` | biểu tượng, vòng lặp kích hoạt, chặn đòn, nhấp nháy sắp hết | Khiên hoa sen/cầu Thê Húc, glow xanh lục dịu |
| `public/assets/images/hanoi/items/responsibility_wings_sheet.png` | biểu tượng, gắn trên Mascot, vệt bay, nhấp nháy sắp hết | Cánh công nghệ motif nan tre, viền xanh lam |
| `public/assets/images/hanoi/items/kaizen_keyboard_sheet.png` | trang bị, lóe sáng khi bắn | Bàn phím compact keycap đỏ/vàng, công nghệ sáng |
| `public/assets/images/hanoi/items/keyboard_projectiles_sheet.png` | đạn `Tab`, đạn `Enter` | Chữ đủ lớn để đọc, vệt sáng nhẹ, không rối |

---

## 6. Kẻ Địch & Đạn Kẻ Địch

| File | Frame/trạng thái | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/images/hanoi/enemies/ground_bug_sheet.png` | đứng chờ, bò 4 frame, bị giẫm | Bug Tắc Đường, thân thấp, hitbox lớn, vùng đầu dễ nhận biết để giẫm |
| `public/assets/images/hanoi/enemies/flying_bug_sheet.png` | bay tại chỗ 4 frame, bắn, bị hạ | Bug Trì Hoãn, bay thấp, silhouette rõ, có hướng bắn rõ |
| `public/assets/images/hanoi/enemies/flying_bug_projectile.png` | đạn đồng hồ lỗi | Đạn bay thẳng chậm, hình đồng hồ lỗi hoặc icon deadline nhỏ, màu cảnh báo |

---

## 7. Chướng Ngại

| File | Frame/trạng thái | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/images/hanoi/obstacles/pit.png` | hố sâu mở | Vết nứt trên mặt đường gạch, đáy tối, mép rõ |
| `public/assets/images/hanoi/obstacles/pit_warning.png` | cảnh báo trước hố | Bụi, mép nứt, biển cảnh báo nhỏ |
| `public/assets/images/hanoi/obstacles/bomb_low_sheet.png` | đứng yên, nhấp nháy cảnh báo | Bom thấp như túi hàng/rào công trình, yêu cầu người chơi cúi |

---

## 8. Trùm Hà Nội

| File | Frame/trạng thái | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/images/hanoi/bosses/deadline_boss_intro.png` | tranh giới thiệu trùm | Boss Deadline Cổ Phố, cỗ máy đồng hồ lớn phủ giấy note deadline, có khoảng trống đặt title |
| `public/assets/images/hanoi/bosses/deadline_boss_sheet.png` | idle, di chuyển, bắn thẳng, bắn parabol, gọi marker đỏ, trúng đòn, bị hạ | Silhouette lớn, bánh răng kẹt, đèn đỏ nhấp nháy, family-friendly |
| `public/assets/images/hanoi/bosses/deadline_boss_projectiles_sheet.png` | đạn thẳng, đạn parabol thấp, marker đỏ, đạn rơi | Màu cảnh báo rõ, không lẫn với bình kinh nghiệm |

---

## 9. Cảnh Chuyển

| File | Nội dung | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/images/hanoi/cutscenes/opening.png` | Mascot trước Hồ Gươm/VTI Hà Nội, chuẩn bị chạy | Dùng làm mở màn Hà Nội |
| `public/assets/images/hanoi/cutscenes/boss_intro.png` | Boss Deadline Cổ Phố xuất hiện | Có khoảng trống cho tên boss và câu thoại |
| `public/assets/images/hanoi/cutscenes/clear.png` | Mascot vượt qua phố cổ, tinh thần Tôn trọng | Dùng cho kết quả hoàn thành màn |
| `public/assets/images/hanoi/cutscenes/to_tokyo_transition.png` | Mascot lên chuyến bay hướng tới Tokyo, skyline chuyển sang hoa anh đào/LED | Dùng làm chuyển màn |

---

## 10. HUD & Icon Phụ Trợ

| File | Nội dung | Ghi chú Stitch |
| --- | --- | --- |
| `public/assets/images/hanoi/hud/heart_icon.png` | icon máu | Có thể dùng chung toàn game nếu đủ trung tính |
| `public/assets/images/hanoi/hud/score_icon.png` | icon điểm | Gợi bình kinh nghiệm hoặc sao công nghệ |
| `public/assets/images/hanoi/hud/kaizen_energy_icon.png` | icon Nội năng Kaizen | Năng lượng sáng, liên hệ bàn phím/cải tiến |
| `public/assets/images/hanoi/hud/respect_timer_icon.png` | icon timer Khiên Tôn trọng | Mini shield hoa sen |
| `public/assets/images/hanoi/hud/responsibility_timer_icon.png` | icon timer Cánh Trách nhiệm | Mini wings nan tre |
| `public/assets/images/hanoi/hud/hud_icons_sheet.png` | sheet icon tổng hợp | Tất cả các icon trên gộp lại trong 1 tệp tin sheet |

---

## 11. Cấu Trúc File Cho Các Màn Sau

1. **Map Tokyo:** Lưu trong `public/assets/images/tokyo/` với cấu trúc thư mục con tương tự Hà Nội. Ví dụ: `public/assets/images/tokyo/backgrounds/far_background.png`.
2. **Map Đà Nẵng:** Lưu trong `public/assets/images/danang/` với cấu trúc thư mục con tương tự Hà Nội. Ví dụ: `public/assets/images/danang/backgrounds/far_background.png`.
