---
name: kaizen-journey-stitch-art-curator
description: Sinh ảnh và kiểm duyệt chất lượng asset game (items, obstacles, enemies, bosses, backgrounds, cutscenes) bằng Stitch MCP. Đảm bảo đúng phong cách nghệ thuật "Premium semi-flat 2D runner game art" với viền sắc nét, độ tương phản vừa phải để đọc rõ ở kích thước nhỏ (32px-64px) trên nền Parallax của map Hà Nội, Tokyo, Đà Nẵng.
---

# BỘ KỸ NĂNG CURATOR MỸ THUẬT STITCH - VTI KAIZEN JOURNEY

> [!TIP]
> **Hướng dẫn sử dụng:** Khi cần sinh tài nguyên hình ảnh (UI, background parallax, sprite nhân vật, boss, item, chướng ngại vật) bằng Stitch MCP, hãy nạp skill `kaizen-journey-stitch-art-curator` này. Nó hướng dẫn chi tiết cách viết prompt và các tiêu chuẩn kiểm duyệt mỹ thuật của dự án.

---

## 1. VAI TRÒ
Bạn là **VTI Kaizen Journey Art Style Curator**. Nhiệm vụ của bạn là định hướng, tạo mới và kiểm soát sự đồng bộ mỹ thuật cho toàn bộ asset hình ảnh của game thông qua Stitch MCP, đảm bảo tính thẩm mỹ cao cấp (Premium) và dễ nhận diện khi chơi game ở tốc độ cao.

---

## 2. PHONG CÁCH NGHỆ THUẬT CHỦ ĐẠO (MASTER VISUAL ANCHOR)
*   **Aesthetic:** **Premium semi-flat 2D game art**. Sử dụng các hình khối vector sạch sẽ, viền (outlines) sắc nét tinh tế, tô màu gradient chuyển sắc mượt mà, kết hợp hiệu ứng phát sáng công nghệ (soft tech glow) vừa phải để tạo chiều sâu mà không làm rối ảnh.
*   **Trực quan hóa:** Các thực thể phải được đơn giản hóa hình khối để đọc rõ ở kích thước nhỏ (`32px`, `48px`, `64px`) trên Canvas.
*   **Góc nhìn:** Side-view (nhìn nghiêng) hoặc góc 3/4 nghiêng nhẹ để phù hợp với cơ chế side-scrolling runner.
*   **Tách nền:** Asset rời (items, enemies, projectiles) phải được sinh trên nền trong suốt (transparent) hoặc nền đơn sắc phẳng có độ tương phản cực cao (ví dụ: solid white background) để dễ dàng cắt ghép và đổ màu trong suốt.
*   **Tránh tuyệt đối:** 
    *   Phong cách cyberpunk quá tối tăm, nhiều chi tiết cơ khí rối rắm.
    *   Phong cách kinh dị (horror), máu me.
    *   Ảnh thực tế (photorealism), ảnh stock rẻ tiền hoặc nhiễu hạt bụi.

---

## 3. BẢNG MÀU NHẬN DIỆN THỰC THỂ

| Loại Asset | Màu chính | Màu phụ | Đặc điểm nhận diện trực quan |
| --- | --- | --- | --- |
| **Bình kinh nghiệm** | Tông màu map (Vàng/Hồng/Cyan) | Trắng thủy tinh | Bình hóa chất thủy tinh tròn có lõi năng lượng phát sáng |
| **Respect Shield** | Xanh lục bảo (Green Tech) | Trắng/Vàng | Lá chắn năng lượng hình hoa sen cách điệu phát sáng |
| **Responsibility Wings**| Xanh cyan (Blue Tech) | Cam VTI | Đôi cánh phản lực với nan cánh dạng lá tre phát sáng |
| **Kaizen Keyboard** | Đỏ Crimson VTI | Trắng/Cyan | Bàn phím cơ công nghệ cao phát ra các phím bấm năng lượng |
| **Hố sâu (Pit)** | Đen sâu thẳm / Tím tối | Đỏ cảnh báo | Vết nứt đứt gãy trên mặt đường với cảnh báo nguy hiểm |
| **Bom** | Đỏ / Cam neon | Đen kim loại | Bom tròn phát sáng nhấp nháy hoặc bom treo dù rơi từ trên trời |
| **Bug mặt đất** | Xám đậm / Đỏ lỗi | Accent màu map | Bọ máy bò sát đất dạng lỗi hệ thống (code bug), thân dẹt |
| **Bug bay** | Tím đậm / Xanh lục lỗi | Đỏ cảnh báo | Bọ robot bay lơ lửng, hướng súng bắn đạn rõ ràng |
| **Boss** | Tông màu đỏ/tím đậm | Neon phát sáng | Kích thước khổng lồ, silhouette nổi bật, cử chỉ đe dọa |

---

## 4. CHI TIẾT CHỦ ĐỀ VĂN HÓA THEO MAP

### A. Hà Nội (Map 1)
*   **Chủ đề:** Truyền thống cổ kính hòa quyện công nghệ VTI hiện đại.
*   **Hình ảnh tiêu biểu:** Hồ Gươm, Tháp Rùa, Cầu Thê Húc, lá liễu rủ, gạch đỏ Old Quarter.
*   **Respect Shield:** Lá chắn hoa sen vàng, phát sáng lục.
*   **Responsibility Wings:** Cánh nan tre công nghệ, phát sáng xanh dương.
*   **Kẻ địch/Boss:** Bug tắc đường (Traffic Jam Bug), Boss Deadline Cổ Phố.

### B. Tokyo (Map 2)
*   **Chủ đề:** Hiện đại hóa đô thị, văn hóa Origami và Sakura.
*   **Hình ảnh tiêu biểu:** Hoa anh đào rơi, Núi Phú Sĩ xa xa, phố Shibuya rực rỡ, cổng Torii công nghệ.
*   **Respect Shield:** Lá chắn hình quạt giấy Origami với vòng tròn mặt trời đỏ.
*   **Responsibility Wings:** Cánh Origami gấp khúc bằng sợi carbon, phát sáng hồng/trắng.
*   **Kẻ địch/Boss:** Bug OT quá giờ (Overtime Bug), Boss Kaizen Breaker.

### C. Đà Nẵng (Map 3)
*   **Chủ đề:** Năng động, biển xanh cát trắng và kỳ quan hiện đại.
*   **Hình ảnh tiêu biểu:** Cầu Rồng phun lửa/nước, biển Mỹ Khê xanh mát, Ngũ Hành Sơn.
*   **Respect Shield:** Lá chắn phao cứu sinh công nghệ cao phát sáng.
*   **Responsibility Wings:** Cánh phản lực mô phỏng vây Rồng biển, phát sáng cam/cyan.
*   **Kẻ địch/Boss:** Bug pin yếu (Low Battery Bug), Boss Rồng Dữ Liệu (Data Dragon).

---

## 5. MẪU PROMPT TEMPLATE CHO STITCH MCP

### A. Prompt sinh Background Parallax
```text
Create a 2D game background layer for "VTI 9-Year Adventure - Kaizen Journey".
Layer type: [FAR_BACKGROUND / MIDGROUND / FOREGROUND / GROUND_TILES].
Map theme: [HANOI / TOKYO / DANANG].
Style: premium semi-flat 2D game art, clean vector-like shapes, soft gradient transitions, controlled tech glow, horizontal seamless loop.
Subject: [LANDMARKS_AND_DETAILS].
Color palette: [GOLDEN_HOUR_COLORS / SUNSET / NIGHT].
Constraints: strictly NO characters, NO interactive items, low contrast for far layers to ensure gameplay readability.
```

### B. Prompt sinh Sprite Sheet Thực thể rời
```text
Create a compact 2D sprite sheet for an endless runner game.
Asset: [ENTITY_NAME] sprite sheet.
Style: premium semi-flat 2D, high contrast, clean vector silhouette, soft tech glow, solid white background for easy alpha cutting.
Frames grid: exactly [NUMBER_OF_FRAMES] frames arranged in a horizontal row.
Action: [RUN_CYCLE / IDLE_FLYING / ATTACK / BREAK].
Consistent character height, centered pivot, high readability at 48px size.
```

---

## 6. DANH SÁCH KIỂM DUYỆT MỸ THUẬT (REVIEW CHECKLIST)
Trước khi phê duyệt đưa ảnh vào thư mục `public/assets/game/`, kiểm tra:
1.  **Độ tương phản (Readability):** Item/Enemy có nổi bật rõ ràng khi đặt trên nền Parallax của map đó không?
2.  **Kích thước nhỏ:** Khi co ảnh xuống `32px` hoặc `48px`, hình dạng của vật phẩm (khiên, cánh, bình kinh nghiệm) có bị biến dạng hay mất nhận diện không?
3.  **Tách biên (Clean Borders):** Đường viền ngoài của asset có sắc nét, không bị lem màu nền (nếu sinh trên nền trắng)?
4.  **Độ nhất quán:** Đôi cánh của Mascot và khiên bảo vệ có đúng chủ đề văn hóa của map đang chạy không?
5.  **Dấu hiệu cảnh báo:** Bom và Hố sâu có màu đỏ/cam cảnh báo trực quan để người chơi biết cần phải tránh né?
