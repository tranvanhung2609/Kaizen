# HƯỚNG DẪN THIẾT KẾ & BỘ PROMPT MẪU CHO GIAO DIỆN WEB (UI/UX)
## VTI 9-YEAR ADVENTURE - KAIZEN JOURNEY

> [!IMPORTANT]
> Tài liệu này là **Visual Anchor** dành riêng cho phần giao diện Web UI/UX (Login, Game wrapper, Leaderboard, Admin). Tất cả các thành viên (Đạt - UI, Quân - Auth/APIs, Thảo - QA) cần tuân thủ nghiêm ngặt hướng dẫn này hoặc nạp trực tiếp file này vào LLM/AI Code Generator của mình để đảm bảo output code giao diện đồng nhất tuyệt đối về thẩm mỹ.

---

## 🎨 1. QUY CHUẨN THIẾT KẾ GIAO DIỆN CHUNG (UI VISUAL ANCHOR)

Để tránh hiện tượng lệch tông (màn hình login dùng style phẳng sáng, leaderboard dùng cyber-punk hầm hố), dự án quy ước phong cách **Vibrant Glassmorphism Dark Mode** với các thông số CSS/TailwindCSS cụ thể sau:

### A. Màu Sắc Nhận Diện Thương Hiệu & Trạng Thái
*   **Màu nền cơ sở (Base Background):** Không dùng màu đen kịt (`#000000`) hay xám trung tính. Sử dụng dải màu Gradient chuyển tiếp từ xanh biển cực đậm sang tím vũ trụ:
    *   Tailwind: `bg-gradient-to-br from-[#070913] via-[#0b0e26] to-[#12163b]`
*   **Màu VTI Blue (Primary):** Xanh công nghệ cao cấp:
    *   Màu chính: `#0054a6` | Tailwind: `text-[#0054a6]` hoặc `bg-[#0054a6]`
    *   Màu Neon Accent: `#00d2ff` | Tailwind: `text-[#00d2ff]` hoặc `shadow-[#00d2ff]`
*   **Màu VTI Orange (Secondary/CTA):** Cam ấm rực rỡ, sử dụng cho các nút kêu gọi hành động (SSO Login, Start Game, Submit):
    *   Màu chính: `#ff8500` | Tailwind: `bg-[#ff8500] hover:bg-[#ff9d33]`
*   **Màu Kaizen Green (Success/Meter):** Xanh lục neon tượng trưng cho tinh thần Kaizen đổi mới, dùng cho thanh đo năng lượng, điểm cao, thứ hạng top 1:
    *   Màu chính: `#00ff87` | Tailwind: `text-[#00ff87]` hoặc `bg-[#00ff87]`

### B. Hiệu Ứng Glassmorphism (Kính Mờ)
Toàn bộ các thẻ (Cards), bảng (Leaderboard), và form cấu hình đều sử dụng cấu trúc container bán trong suốt có bo góc mềm mịn:
*   **Lớp kính nền:** `bg-white/[0.03]` hoặc `bg-[#0b0e26]/50`
*   **Hiệu ứng mờ (Backdrop Blur):** `backdrop-blur-md` hoặc `backdrop-blur-xl`
*   **Đường viền kính:** `border border-white/10` hoặc `border-white/[0.08]`
*   **Độ bo góc (Border Radius):** Đồng bộ `rounded-2xl` hoặc `rounded-3xl`
*   **Bóng đổ Neon:** `shadow-[0_0_20px_rgba(0,84,166,0.15)]`

### C. Typography (Phông Chữ)
*   **Font chữ nội dung/UI:** `Inter`, phông sans-serif hiện đại, dễ đọc.
*   **Font chữ tiêu đề/Số điểm/BXH:** `Orbitron` hoặc `Rajdhani` (Font dạng digital/tech) để tạo cảm giác game công nghệ.
    *   *Import link:* `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Orbitron:wght@500;700;900&display=swap');`

---

## 📝 2. BỘ PROMPT MẪU ĐỂ GEN CODE GIAO DIỆN (UI CODE PROMPTS)

Sao chép toàn bộ khối prompt tương ứng dưới đây và dán vào AI Assistant của bạn (Gemini, Claude, GPT, v.v.) để gen code Next.js + TailwindCSS chuẩn phong cách.

### A. Prompt cho Trang Đăng Nhập (`src/app/login/page.tsx`)
```text
Write a Next.js (TypeScript) component for a premium Login Page using TailwindCSS.
The page is for the game "VTI 9-Year Adventure - Kaizen Journey".

Style Guidelines:
1. Base Background: Deep blue-purple sci-fi gradient (bg-gradient-to-br from-[#070913] via-[#0b0e26] to-[#12163b]) with floating ambient glow effects.
2. Center Card: Large vertical glassmorphic container (rounded-3xl, bg-white/[0.03], backdrop-blur-xl, border border-white/10, shadow-2xl).
3. Header: Large glowing title "KAIZEN JOURNEY" in font-family 'Orbitron' (font size text-4xl or 5xl, text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] to-[#00ff87]).
4. Subheader: "VTI 9-Year Adventure" in clean Inter font.
5. Graphic: Embedded illustration section in the card featuring a placeholder image for the Hanoi 2D Mascot (render as a clean vector box with a blue neon pulse animation).
6. CTA Button: Giant "Sign in with Google" button. It must use the VTI Orange brand color (bg-[#ff8500], text-white, hover:bg-[#ff9d33], transition-all, duration-300, active:scale-95, shadow-[0_0_15px_rgba(255,133,0,0.4)]). Inside the button, include a Google logo icon and the text "Đăng nhập VTI Mail (@vti.com.vn)".
7. Footer: A small text at the bottom saying: "Dành riêng cho thành viên VTI Group. Hệ thống sẽ tự động xác thực và chặn các domain khác."

Ensure the component is clean, fully responsive, and includes subtle micro-interactions on hover (such as gentle glowing shifts and slight lifts).
```

### B. Prompt cho Trang Game Wrapper (`src/app/game/page.tsx`)
```text
Write a Next.js (TypeScript) component for the main Game Screen container (/game).
This screen hosts the HTML5 Canvas in the center, wrapped in a premium, immersive gaming interface.

Key Layout Requirements:
1. Navigation Header:
   - A glassmorphic top navbar showing the VTI Logo, Player Avatar (rounded-full with cyan outline), Player Email, and a Logout button.
   - Display a status badge: "Chặng chạy: Hà Nội" (with a small green pulse indicator).
2. Central Game Area:
   - Host an absolute centered 16:9 aspect ratio aspect-container representing the `<canvas>` viewport.
   - The border of this canvas container must have a futuristic cyber-LED frame that changes colors or glows based on the current map theme (Hanoi: Yellow/Blue, Tokyo: Pink/White, Danang: Orange/Cyan).
   - Use Tailwind shadow utilities (e.g., shadow-[0_0_30px_rgba(0,210,255,0.3)]) to make it stand out.
3. Left Floating Panel (Quest/Mission):
   - A narrow glassmorphic sidebar listing active achievements:
     * "Thu thập bình Kaizen: 0/15"
     * "Né tránh Bom bảo mật: 0/5"
     * "Đánh bại Boss Deadline: 0/1"
4. Right Floating Panel (BGM Controller):
   - Visual audio equalizer bars (CSS animated) with play/pause and volume slider to control AudioManager state.
5. Base Style:
   - Same dark blue-purple background and glassmorphism styling parameters.
```

### C. Prompt cho Trang Bảng Xếp Hạng (`src/app/leaderboard/page.tsx`)
```text
Write a Next.js (TypeScript) component for the Leaderboard Screen using TailwindCSS.
The screen displays rankings for players in the "Kaizen Journey" run.

Design Requirements:
1. Main Card: Wide landscape-oriented glassmorphic card (bg-[#0b0e26]/60, backdrop-blur-2xl, border border-white/10).
2. Tab Navigation:
   - Clean tabs to toggle rankings: "Tổng Hành Trình", "Chặng Hà Nội", "Chặng Tokyo", "Chặng Đà Nẵng".
   - Active tab: Vibrant underline (bg-[#00ff87]) and glowing text.
3. Filter Toolbar:
   - Input field to search players by Name/Email.
   - Dropdown selector to filter by VTI Department (e.g., VTI Cloud, VTI Education, VTI Software).
4. Top 3 Showcase:
   - Draw 3 podium cards for 1st, 2nd, and 3rd place with customized neon borders:
     * Rank 1: Gold border (shadow-[#ffd700]), larger avatar, gold crown icon.
     * Rank 2: Silver border (shadow-[#c0c0c0]), silver medal icon.
     * Rank 3: Bronze border (shadow-[#cd7f32]), bronze medal icon.
5. Rankings Table:
   - A clean table listing ranks 4 to 100 with columns: Rank, Player (Avatar + Name + Department), Total Score, Clear Time, Date.
   - Highlight the current logged-in user's row with a soft VTI Blue neon border (`border-l-4 border-l-[#00d2ff] bg-white/[0.02]`).
6. Base Vibe:
   - Match the premium Vibrant Dark Mode. Ensure fast rendering and smooth scroll effects.
```

### D. Prompt cho Trang Quản Trị CMS (`src/app/admin/page.tsx`)
```text
Write a Next.js (TypeScript) component for the Admin Configuration CMS Screen (/admin).
It allows VTI Game admins to adjust scoring and physics variables in real-time.

Requirements:
1. Base Layout: Grid layout with sidebar navigation (Settings, Database, Game Configuration) and a main configuration panel.
2. Configuration Cards (Glassmorphism, rounded-2xl, border border-white/8):
   - Card 1: Physics Settings (sliders for Gravity, Jump Force, Run Acceleration, Boss speed).
   - Card 2: Scoring Rules (number inputs for Experience Flask point, Bug Defeat point, Boss defeat bonus).
   - Card 3: Power-ups (number inputs for Shield duration, Wings duration, Kaizen multiplier duration).
   - Card 4: Cultural Messages (textarea input to customize message overlays when completing maps).
3. Actions Bar:
   - "Save Config" button using Kaizen Green (`bg-[#00ff87] text-black hover:bg-[#34ff9f]`).
   - "Reset Defaults" button using transparent glass outline.
4. Security Badge:
   - An alert banner at the top: "Bảng quản trị bảo mật. Chỉ quản trị viên VTI có thẩm quyền mới được truy cập." (with a flashing red/orange lock icon).
```

---

## 🛠️ 3. CÁCH LỒNG GHÉP VÀO WORKFLOW CỦA DEV
Để đảm bảo các bạn Dev tích hợp hiệu quả, hãy hướng dẫn các bạn làm theo quy trình:
1. **Bước 1:** Nạp file này vào AI Chatbox đầu session làm việc.
2. **Bước 2:** Yêu cầu AI ghi nhớ bộ định nghĩa màu sắc và phong cách thiết kế **Vibrant Glassmorphism Dark Mode**.
3. **Bước 3:** Chạy prompt tương ứng để sinh code.
4. **Bước 4 (Dành cho Tester Thảo):** Sử dụng các tiêu chuẩn ở mục 1 làm thang đo đánh giá mỹ thuật giao diện khi kiểm thử (UI/UX Review Checklist).
