# VTI 9-Year Adventure - Kaizen Journey

Game 2D side-scrolling endless runner theo chặng cho AI Gameathon 2026, do Kaizen Delivery Squad phát triển nhân dịp kỷ niệm 9 năm thành lập VTI Group.

Thông điệp chủ đạo: **"VTI 9 Năm - Công nghệ kiến tạo giá trị mới"** với 3 giá trị cốt lõi: **Respect (Tôn trọng) - Responsibility (Trách nhiệm) - Kaizen**.

---

## 📂 SƠ ĐỒ THƯ MỤC DỰ ÁN (PROJECT STRUCTURE)

*   `docs/`: Chứa các tài liệu thiết kế nghiệp vụ chính thức nộp cho ban tổ chức cuộc thi.
*   `prompts/`: Chứa các tài liệu bổ trợ, kế hoạch triển khai và prompts phục vụ cho AI tạo mã nguồn và ảnh.
*   `.agents/skills/`: Chứa các định nghĩa kỹ năng (System Skills) chuẩn hóa cho AI Copilot (Antigravity).
*   `src/`: Thư mục mã nguồn Next.js App Router (TypeScript, TailwindCSS) và Game Canvas Engine.
*   `public/`: Thư mục chứa các tài nguyên tĩnh, hình ảnh game dưới `public/assets/images/`, và âm nhạc/hiệu ứng âm thanh dưới `public/assets/audio/`.

---

## 📝 MỤC LỤC TÀI LIỆU (DOCUMENTATION INDEX)

### 1. Tài liệu Thiết kế & Nghiệp vụ (Thư mục `docs/`)
*   **[GDD (Game Design Document)](./docs/GDD/GDD.md):** Thiết kế trải nghiệm chơi game, cốt truyện, thế giới quan, định hướng nghệ thuật, cutscene và quy trình Stitch.
*   **[Chi tiết Thiết kế Thế giới](./docs/GDD/01_World_Design.md):** Chi tiết 3 chặng chạy (Hà Nội, Tokyo, Đà Nẵng) và các chướng ngại vật/kẻ địch đi kèm.
*   **[Kế hoạch Tài nguyên Stitch](./docs/GDD/02_Stitch_Asset_Plan.md):** Kế hoạch chi tiết danh sách tài nguyên và số lượng frame cần tạo.
*   **[SRS (Software Requirement Specification)](./docs/SRS/SRS.md):** Yêu cầu kỹ thuật chi tiết, luật va chạm, điểm số, thiết kế Database Supabase, bảo mật Google SSO và kịch bản kiểm thử.
*   **[Quy trình ứng dụng AI](./docs/AI_Application_Process.md):** Tài liệu mô tả quy trình áp dụng AI trong phát triển dự án.
*   **[Thể lệ AI Gameathon D5](./docs/Thể lệ%20AI%20Gameathon%20D5.md):** Quy định và yêu cầu chính thức từ BTC cuộc thi.

### 2. Kế hoạch & Prompts Định hướng AI (Thư mục `prompts/`)
*   **[Kế hoạch triển khai & cài đặt Database](./prompts/common/general/detailed_implementation_plan.md):** Tài liệu hướng dẫn thiết lập project Supabase, chạy SQL migration và cấu hình biến môi trường.
*   **[Quy chuẩn Thiết kế UI/UX & Prompts mẫu](./prompts/common/general/ui_design_guidelines_and_prompts.md):** Hướng dẫn nhất quán phong cách giao diện Vibrant Glassmorphism Dark Mode.
*   **[Mẫu Prompt sinh ảnh Hà Nội](./prompts/nam.buihai/assets/hanoi_stitch_prompts.md):** Tổng hợp các prompt mẫu dùng cho Stitch MCP để tạo assets Hà Nội.
*   **[Danh mục Manifest Assets Hà Nội](./prompts/nam.buihai/assets/hanoi_asset_manifest.md):** Danh sách liệt kê trạng thái của từng tệp tin ảnh Hà Nội.


### 3. Bộ Kỹ năng chuẩn hóa cho AI (Thư mục `.agents/skills/`)
*   **[Skill Lập trình Game (kaizen-journey-coder)](./.agents/skills/kaizen-journey-coder/SKILL.md):** Định nghĩa hướng dẫn AI viết code Canvas, va chạm AABB, stomp rules, và tối ưu hóa React.
*   **[Skill Giám sát Mỹ thuật (kaizen-journey-stitch-art-curator)](./.agents/skills/kaizen-journey-stitch-art-curator/SKILL.md):** Định nghĩa hướng dẫn AI viết prompt sinh ảnh qua Stitch MCP chuẩn xác theo style *Premium semi-flat 2D*.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG (TECHNOLOGY STACK)

1.  **Core Framework:** Next.js App Router (TypeScript) phiên bản mới nhất.
2.  **Gameplay Engine:** HTML5 Canvas API thuần (được tối ưu hóa bằng Object Pooling và Viewport Culling, không dùng physics engine bên ngoài).
3.  **Styling:** TailwindCSS & Vanilla CSS.
4.  **Backend:** Supabase (Database, Auth Google SSO giới hạn email `@vti.com.vn`, RLS Security Policies).
5.  **AI Asset Generator:** Stitch MCP (Gemini 3 Pro/Flash) phục vụ sinh hình ảnh game parallax, sprites và cutscenes.

---

## 🚀 THIẾT LẬP BAN ĐẦU (GETTING STARTED)

### 1. Cài đặt môi trường
Đảm bảo bạn đã cài đặt Node.js phiên bản 18 trở lên. Run lệnh sau ở thư mục gốc để cài đặt thư viện:
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo tệp `.env.local` ở thư mục gốc và nhập cấu hình kết nối Supabase của bạn:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Chạy Server phát triển
Khởi chạy dự án ở chế độ local dev server:
```bash
npm run dev
```
Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để kiểm tra sản phẩm.

<!-- Trigger redeploy: 2026-07-06 14:32:00 -->
