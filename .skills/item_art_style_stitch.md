# SKILL: VTI KAIZEN JOURNEY ITEM ART STYLE FOR GOOGLE STITCH

> [!TIP]
> Dùng skill này khi tạo prompt hoặc review asset bằng Google Stitch cho item, power-up, obstacle, Bug, Boss và HUD icon của game **VTI 9-Year Adventure - Kaizen Journey**.

---

## 1. VAI TRÒ

Bạn là **VTI Kaizen Journey Art Style Curator**. Nhiệm vụ của bạn là tạo và kiểm soát sự đồng bộ hình ảnh cho toàn bộ item gameplay bằng Google Stitch, đảm bảo asset dễ đọc trong game endless runner tốc độ cao và vẫn thể hiện bản sắc VTI 9 năm.

---

## 2. ĐỊNH HƯỚNG STYLE CHUNG

*   **Phong cách:** 2D game asset cao cấp, semi-flat, clean vector-like shapes, viền rõ, ánh sáng công nghệ mềm, không quá nhiều chi tiết nhỏ.
*   **Tỉ lệ:** Sprite phải đọc rõ ở kích thước nhỏ trên Canvas. Ưu tiên silhouette mạnh hơn chi tiết trang trí.
*   **Góc nhìn:** Side-view hoặc 3/4 side-view nhẹ, nhất quán với runner platform.
*   **Chất liệu:** Kết hợp thủy tinh phát sáng, kim loại nhẹ, năng lượng số và motif văn hóa địa phương.
*   **Nền:** Khi generate asset rời, dùng transparent background hoặc nền phẳng tương phản để dễ tách.
*   **Không dùng:** Cyberpunk tối nặng, bokeh/orb trang trí, chi tiết quá rối, phong cách horror, vật phẩm giống ảnh stock.

---

## 3. BẢNG MÀU NHẬN DIỆN ITEM

| Loại asset | Màu chính | Màu phụ | Dấu hiệu nhận diện |
| --- | --- | --- | --- |
| Bình kinh nghiệm | Cyan/vàng/hồng theo map | Trắng thủy tinh | Bình nhỏ có lõi sáng |
| Respect Shield | Xanh lục + vàng nhạt | Trắng glow | Khiên/vòng bảo vệ |
| Responsibility Wings | Xanh dương + cam | Trắng/cyan | Cánh công nghệ |
| Kaizen Keyboard | Đỏ VTI + xanh công nghệ | Trắng glow | Bàn phím bắn key "Tab"/"Enter" |
| Hố sâu | Đen/tím sâu | Đỏ cảnh báo | Vết nứt, mép rõ |
| Bom | Đỏ/cam cảnh báo | Đen/xám kim loại | Bom tròn hoặc treo dù |
| Bug mặt đất | Xám/đỏ lỗi hệ thống | Map accent | Thân thấp, dễ stomp |
| Bug bay | Tím/xanh lỗi dữ liệu | Đỏ cảnh báo | Có cánh/hover, rõ hướng bắn |
| Boss | Theo map | Đỏ cảnh báo + VTI accent | Silhouette lớn, tên/phase rõ |

---

## 4. THEME ITEM THEO MAP

### A. Hà Nội
*   **Motif:** Hồ Gươm, cầu Thê Húc, hoa sen, phố cổ, gạch cổ.
*   **Bình kinh nghiệm:** Bình thủy tinh lõi vàng, họa tiết sóng Hồ Gươm, nắp đỏ VTI.
*   **Respect Shield:** Khiên hoa sen/cầu Thê Húc, glow xanh lục.
*   **Responsibility Wings:** Cánh công nghệ có chi tiết nan tre, viền xanh lam.
*   **Enemy/Boss:** Bug tắc đường, đồng hồ deadline, giấy note công việc.

### B. Tokyo
*   **Motif:** Hoa anh đào, Núi Phú Sĩ, Shibuya, Tokyo Tower, UI Nhật hiện đại.
*   **Bình kinh nghiệm:** Bình pha lê hình búp hoa anh đào, lõi hồng/trắng.
*   **Respect Shield:** Khiên cánh hoa và mặt trời đỏ.
*   **Responsibility Wings:** Cánh origami công nghệ, viền trắng/xanh.
*   **Enemy/Boss:** Bug OT, lỗi font/ngôn ngữ, phản-Kaizen system boss.

### C. Đà Nẵng
*   **Motif:** Cầu Rồng, biển Mỹ Khê, sóng, cát, phao cứu hộ.
*   **Bình kinh nghiệm:** Bình dạng giọt nước/pha lê biển, lõi cyan, particle bong bóng.
*   **Respect Shield:** Khiên phao cứu hộ công nghệ.
*   **Responsibility Wings:** Cánh phản lực lấy cảm hứng Cầu Rồng, glow xanh/cam.
*   **Enemy/Boss:** Bug pin yếu, rò rỉ dữ liệu, rồng dữ liệu.

---

## 5. PROMPT TEMPLATE CHO GOOGLE STITCH

### A. Template asset rời
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

### B. Template sprite sheet
```text
Create a compact sprite sheet for a 2D endless runner game.
Character/item: [ASSET_NAME].
Actions/states: [IDLE / ACTIVE / HIT / BREAK / LOOP].
Use consistent size, centered pivot, transparent background, clear silhouette, soft glow, no background scene.
```

### C. Template boss intro art
```text
Create boss intro artwork for a 2D runner game cutscene.
Boss name: [BOSS_NAME].
Map theme: [HANOI / TOKYO / DANANG].
Composition: boss centered, readable silhouette, dramatic but family-friendly, VTI tech accents, local cultural motif, space for title text overlay.
Style: premium semi-flat illustration, clean edges, controlled glow, not dark cyberpunk.
```

---

## 6. REVIEW CHECKLIST

Trước khi đưa asset vào game, kiểm tra:

*   Nhìn rõ ở kích thước `32px`, `48px`, `64px`.
*   Silhouette không nhầm với loại item khác.
*   Màu item nổi bật trên background map tương ứng.
*   Hitbox gameplay có thể đặt gần với hình dạng sprite.
*   Respect, Responsibility và Kaizen có dấu hiệu nhận diện khác nhau ngay lập tức.
*   Bom và Hố sâu có màu cảnh báo rõ, không bị nhầm với item thưởng.
*   Boss đủ lớn, có hình dáng riêng theo map và không che HUD.
*   Asset không dùng chữ nhỏ khó đọc, trừ đạn key "Tab"/"Enter" có kích thước đủ lớn.

---

## 7. QUY ƯỚC FILE ASSET

```text
assets/
  items/
    hanoi_experience_flask.png
    tokyo_experience_flask.png
    danang_experience_flask.png
    respect_shield.png
    responsibility_wings.png
    kaizen_keyboard.png
  obstacles/
    pit_warning.png
    bomb_low.png
    bomb_parachute.png
  enemies/
    hanoi_ground_bug.png
    tokyo_ground_bug.png
    danang_flying_bug.png
  bosses/
    hanoi_deadline_boss.png
    tokyo_kaizen_breaker_boss.png
    danang_data_dragon_boss.png
```
