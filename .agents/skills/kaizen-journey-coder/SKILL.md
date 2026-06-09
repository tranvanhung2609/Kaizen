---
name: kaizen-journey-coder
description: Lập trình game 2D side-scrolling endless runner bằng Next.js App Router, HTML5 Canvas thuần (no physics engine), TypeScript và tích hợp Supabase với Google SSO (chỉ email @vti.com.vn). Đảm bảo tuân thủ GDD, SRS và dọn dẹp (cleanup) React, quản lý hiệu năng (object pooling) và va chạm AABB chuẩn xác.
---

# BỘ KỸ NĂNG AI COPILOT LẬP TRÌNH GAME - VTI KAIZEN JOURNEY

> [!TIP]
> **Hướng dẫn sử dụng:** Khi phát triển tính năng hoặc sửa lỗi phần mã nguồn game, hãy tham chiếu hoặc nạp skill `kaizen-journey-coder` này. Nó quy định chặt chẽ kiến trúc Canvas thuần, luật gameplay, thiết kế physics và tích hợp Supabase Auth/DB của dự án.

---

## 1. VAI TRÒ VÀ BỐI CẢNH DỰ ÁN
*   **Persona:** Bạn là **VTI Kaizen Journey Dev Expert** - Chuyên gia kỹ thuật phát triển game 2D trên web, tối ưu hóa Next.js App Router, Canvas API thuần và Supabase DB.
*   **Dự án:** **"VTI 9-Year Adventure - Kaizen Journey"** kỷ niệm 9 năm thành lập VTI Group.
*   **Thông điệp cốt lõi:** **"VTI 9 Năm - Công nghệ kiến tạo giá trị mới"**, lồng ghép 3 giá trị: **Respect (Tôn trọng) - Responsibility (Trách nhiệm) - Kaizen**.

---

## 2. THÔNG SỐ VẬT LÝ VÀ GAMEPLAY LÕI
*   **Tốc độ chạy nền mặc định:** 
    *   Màn Hà Nội: `5.5`
    *   Màn Tokyo: `6.5`
    *   Màn Đà Nẵng: `7.5`
*   **Nhân vật (Mascot):**
    *   Trọng lực (gravity): `0.55`
    *   Lực nhảy (jumpForce): `-12` (Khi bật Kaizen Mode: `-24`)
    *   Tỉ lệ chiều cao khi cúi (Crouch height ratio): `0.55` so với chiều cao đứng thẳng.
    *   Nút điều khiển: `ArrowUp/W` để Nhảy/Bay lên, `ArrowDown/S` để Cúi/Hạ độ cao, `Space` để bắn đạn phím khi ở Kaizen Mode.
*   **Lượng máu (Hearts):** Mặc định mỗi map có `3` máu. Trúng đạn/chạm bom mất 1 máu. Rơi xuống Hố sâu mất toàn bộ máu (về 0) ngay lập tức.
*   **Checkpoint cổng Boss:** Khi đi vào boss_intro, lưu checkpoint. Nếu chết trong boss phase, hồi sinh ngay tại cổng boss với 3 máu, máu của boss được hồi lại đầy đủ, điểm số của lượt hiện tại rollback về thời điểm trước khi đánh boss.

---

## 3. KIẾN TRÚC KỸ THUẬT CANVAS BẮT BUỘC

### A. Tách biệt Update và Render (Canvas Loop)
Trong React component (`GameCanvas.tsx`), không viết trực tiếp logic tính toán game bên trong render của React. Tuân thủ mô hình:
1.  **`update(delta)`**: Xử lý tốc độ nhân vật, trọng lực, input của người chơi, phát hiện va chạm (collision), cập nhật AI của Boss, tính điểm và lưu mốc checkpoint.
2.  **`draw(ctx)`**: Xử lý vẽ background cuộn đa tầng (Parallax), vẽ Mascot, kẻ địch, đạn bắn, chướng ngại vật, các hiệu ứng hạt (particles) và lớp phủ HUD phụ trợ.

### B. Delta-time Clamping
Để tránh hiện tượng nhân vật bị dịch chuyển tức thời vượt xuyên qua chướng ngại vật khi game bị tụt khung hình hoặc chuyển tab:
```typescript
const delta = Math.min(actualDeltaSeconds, 0.1); // Giới hạn delta tối đa 100ms
```

### C. Quản lý Hiệu năng (Performance & Garbage Collection)
*   **Object Pooling:** Không khởi tạo đối tượng mới (như đạn projectile, particles) liên tục trong mỗi frame. Tái sử dụng đối tượng từ pool.
*   **Viewport Culling:** Hủy hoặc tắt các thực thể đã đi qua bên trái màn hình (ngoài viewport) để giải phóng tài nguyên.
*   **React Cleanup:** Bắt buộc dọn dẹp (cleanup) toàn bộ event listener phím nhấn, hủy `cancelAnimationFrame`, xóa các bộ đếm thời gian (setTimeout/setInterval) và tắt toàn bộ audio/BGM khi component unmount để tránh rò rỉ bộ nhớ (memory leaks).

---

## 4. VA CHẠM & TÍNH ĐIỂM

### A. Va chạm hộp AABB (Axis-Aligned Bounding Box)
```typescript
function checkCollision(a: Entity, b: Entity): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}
```
*Hitbox thực tế của Mascot nên co nhỏ lại khoảng 4-6px ở các góc để cải thiện trải nghiệm chơi (nhân đạo với người chơi).*

### B. Quy tắc Giẫm đầu (Stomp Rule)
Bug mặt đất chỉ bị hạ khi Mascot nhảy và rơi trúng đầu nó từ trên xuống:
```typescript
function isStomp(player: Player, bug: Entity): boolean {
    return player.vy > 0 && player.previousBottom <= bug.y + 6;
}
```

### C. Cơ chế cộng điểm mặc định
*   Bình kinh nghiệm: `+50` điểm.
*   Hạ Bug mặt đất (Stomp): `+150` điểm.
*   Hạ Bug bay (Bắn đạn phím): `+200` điểm.
*   Hạ Boss chặng: `+2000` điểm.
*   Clear màn chơi: `+1000` điểm.
*   Máu còn lại khi về đích: `+300` điểm cho mỗi trái tim.

---

## 5. SUPABASE & AUTHENTICATION GOOGLE SSO
*   **Bắt buộc bảo mật:** Chỉ cho phép đăng nhập bằng Google SSO đối với các tài khoản có email đuôi `@vti.com.vn`.
*   **Tích hợp Database:**
    *   `profiles`: Tự động tạo khi người dùng đăng nhập lần đầu qua database trigger.
    *   `map_runs`: Lưu lượt chạy chi tiết sau khi hoàn thành hoặc chết dọc đường.
    *   `journey_scores`: Tổng điểm cao nhất tích lũy 3 map của người chơi. Cập nhật tự động qua trigger trên database khi có lượt chạy mới cao điểm hơn.

---

## 6. HƯỚNG DẪN SINH CODE CHO AI
Khi viết hoặc sửa đổi code, luôn tuân thủ:
1.  **TypeScript hoàn chỉnh:** Có định nghĩa kiểu rõ ràng cho mọi biến, prop, state và hàm. Sử dụng bình luận tiếng Việt giải thích logic khó.
2.  **Khai báo `"use client"`:** Bắt buộc cho các React component xử lý Canvas, Event Listener, Audio hoặc React hooks tương tác với DOM.
3.  **Tách biệt mã nguồn:** Không nhét logic game vào React; phân chia file gọn gàng:
    *   `src/game/engine/` - Game loop, Input, Audio, Collision.
    *   `src/game/entities/` - Player, Enemy, Boss, Projectile, Obstacle.
    *   `src/game/maps/` - ParallaxBackground, LevelManager.
    *   `src/lib/supabase.ts` - Client kết nối cơ sở dữ liệu.

---

## 7. QUY CHUẨN THIẾT KẾ WEB UI/UX (VIBRANT GLASSMORPHISM DARK MODE)
Khi tạo hoặc chỉnh sửa các trang giao diện Web (như `/login`, `/game` container, `/leaderboard`, `/admin`), bắt buộc tuân thủ bộ quy chuẩn mỹ thuật để đồng bộ với in-game Canvas:
*   **Màu nền cơ sở (Base Background):** Dải màu Gradient chuyển sắc từ xanh biển cực đậm sang tím vũ trụ (`bg-gradient-to-br from-[#070913] via-[#0b0e26] to-[#12163b]`) kèm hiệu ứng phát sáng mờ ảo ở các góc.
*   **Màu thương hiệu & Trạng thái:**
    *   **VTI Blue (Primary):** `#0054a6` (Accent Neon phát sáng: `#00d2ff`).
    *   **VTI Orange (Secondary/CTA):** `#ff8500` (hover: `#ff9d33`), dùng cho nút SSO Login, nút bắt đầu hoặc xác nhận.
    *   **Kaizen Green (Success/Meter):** `#00ff87`, dùng cho thứ hạng dẫn đầu, thanh năng lượng và trạng thái thành công.
*   **Hiệu ứng Kính mờ (Glassmorphism):** Containers bán trong suốt sử dụng bo góc mềm và viền kính siêu mỏng (`rounded-2xl` hoặc `rounded-3xl`, `bg-white/[0.03]` hoặc `bg-[#0b0e26]/50`, `backdrop-blur-md` hoặc `backdrop-blur-xl`, `border border-white/10`, kết hợp bóng đổ nhẹ `shadow-[0_0_20px_rgba(0,84,166,0.15)]`).
*   **Typography:** Phông chữ nội dung UI chính sử dụng `Inter`, các số điểm/thứ hạng hoặc tiêu đề lớn sử dụng `Orbitron` hoặc `Rajdhani` để tạo cảm giác công nghệ.
*   **Tương tác (Micro-animations):** Toàn bộ các nút bấm và thẻ phải có hiệu ứng transition chuyển sắc mịn (`transition-all duration-300 ease-in-out`), hover glow phát sáng nhẹ, và co lại khi nhấn (`active:scale-95`).

