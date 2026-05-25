# GAME DESIGN DOCUMENT: VTI 9-YEAR ADVENTURE - KAIZEN JOURNEY

**Phiên bản:** 1.2 | **Dự án:** AI Gameathon 2026 | **Đội thi:** Kaizen Delivery Squad

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

- **Mục tiêu:** Chào mừng kỷ niệm 9 năm thành lập VTI Group; truyền tải hành trình vươn tầm toàn cầu và lồng ghép khéo léo 3 giá trị cốt lõi: **Tôn trọng – Trách nhiệm – Kaizen**.
- **Thông điệp chủ đạo (Key Message):** **"VTI 9 Năm - Công nghệ kiến tạo giá trị mới"**.
- **Thể loại:** 2D Side-scrolling Platformer (Điều khiển chủ động di chuyển Trái/Phải/Nhảy).
- **Nền tảng:** Web (Next.js/Supabase), bắt buộc tích hợp Google SSO của VTI.

---

## 2. THUẬT NGỮ (DEFINITIONS)

- **AI Pipeline:** Quy trình phát triển phần mềm ứng dụng Trí tuệ nhân tạo xuyên suốt từ REQ (Markdown), Design (Stitch), Code (Antigravity) đến Test.
- **Stitch:** Công cụ AI dùng để thiết kế đồng bộ nghệ thuật cho thế giới, vật phẩm và Mascot.
- **Antigravity:** Công cụ AI hỗ trợ khởi tạo mã nguồn và xử lý logic vật lý (chạy, nhảy, va chạm).
- **Kaizen Energy (Nội năng):** Thanh năng lượng tích lũy để kích hoạt trạng thái siêu cấp "Kaizen Mode".
- **Stomp (Giẫm lên đầu):** Cơ chế tấn công mặc định để tiêu diệt kẻ thù (Bug).
- **GDD (Game Design Document):** Tài liệu thiết kế chi tiết viết bằng định dạng Markdown để tối ưu hóa đầu vào cho AI.

---

## 3. CƠ CHẾ GAMEPLAY (CORE MECHANICS)

> **Chi tiết thông số kỹ thuật tại:** [01_Core_Mechanics.md](./01_Core_Mechanics.md)
> _(Phụ trách bởi: Dev 1 & Dev 2)_

- **Điều khiển:** Di chuyển tự do theo trục ngang (Side-scrolling), hỗ trợ **Nhảy đúp (Double Jump)** mặc định.
- **Hệ thống Chiến đấu (Combat):**
  - **Mặc định:** Giẫm lên đầu (Stomp) để tiêu diệt Bug (Xử lý qua Antigravity).
  - **Power-up Trách nhiệm:** Kích hoạt trạng thái bắn đạn "giải pháp công nghệ" (Projectiles) để tiêu diệt Bug từ xa.
- **Hệ thống Hỗ trợ (Power-up Tôn trọng):** Nhặt khiên bảo vệ (Shield) giúp chống chịu 1 lần va chạm mà không mất mạng.
- **Kaizen Mode:** Khi nạp đầy thanh nội năng (Energy Bar) thông qua thu thập mảnh ghép và tiêu diệt Bug, nhân vật tự động vào trạng thái bất tử tạm thời, tăng tốc độ bứt phá và tự động phá hủy vật cản khi va chạm.

---

## 4. PHONG CÁCH NGHỆ THUẬT (ART STYLE)

> **Chi tiết thiết kế Assets tại:** [02_World_Design.md](./02_World_Design.md)
> _(Phụ trách bởi: Tester)_

- **Phong cách chủ đạo:** **"Vocal Cultural & Local Tech Integration"** – Kết hợp hài hòa giữa bản sắc văn hóa truyền thống của từng vùng miền (nơi VTI đặt văn phòng) và các yếu tố công nghệ hiện đại mang đậm dấu ấn VTI.
- **Đồng bộ nghệ thuật:** Sử dụng công cụ **Stitch** để thiết kế Mascot (Nam/Nữ) có trang phục, phụ kiện và bối cảnh màn chơi tương ứng với địa điểm hiện tại nhằm mang lại cảm giác nhập vai chân thực và cao cấp.
- **Skins nhân vật:** Thay đổi trang phục và diện mạo của Mascot theo từng Map: Áo dài cách tân (Hà Nội), Trang phục biển/công nghệ năng động (Đà Nẵng), Kimono cách tân (Tokyo).

---

## 5. THIẾT KẾ THẾ GIỚI (WORLD DESIGN)

> **Chi tiết Level Design tại:** [02_World_Design.md](./02_World_Design.md)
> _(Phụ trách bởi: Tester)_

- **Màn chơi (World Maps):** Rút gọn từ 5 xuống **3 màn chơi cốt lõi** để tập trung vào chất lượng đồ họa và chiều sâu trải nghiệm:
  1.  **Hà Nội (Việt Nam):** Khởi đầu hành trình tại Thủ đô ngàn năm văn hiến, biểu trưng cho giá trị cốt lõi **Tôn trọng (Respect)**.
  2.  **Đà Nẵng (Việt Nam):** Điểm kết nối trung bộ, bứt phá năng động với giá trị cốt lõi **Trách nhiệm (Responsibility)**.
  3.  **Tokyo (Nhật Bản):** Chinh phục thị trường toàn cầu khó tính, biểu trưng cho sự cải tiến liên tục **Kaizen**.
- **Thử thách & Chướng ngại vật:** Thiết kế riêng biệt cho từng vùng miền (Ví dụ: Bug Tắc đường tại Hà Nội, Bug Sóng yếu tại Đà Nẵng, Bug OT tại Tokyo) cùng các bẫy địa hình đặc trưng.
- **Thu thập:** **10 mảnh ghép lịch sử** đại diện cho chặng đường vinh quang 9 năm của VTI được phân bổ theo tỷ lệ **3 - 3 - 4** trên 3 map:
  - **Map Hà Nội:** 3 mảnh.
  - **Map Đà Nẵng:** 3 mảnh.
  - **Map Tokyo:** 4 mảnh.

---

## 6. HỆ THỐNG PHỤ TRỢ & KỸ THUẬT (TECHNICAL SPECS)

> **Chi tiết API & Database tại:** [03_Technical_Specs.md](./03_Technical_Specs.md)
> _(Phụ trách bởi: Dev 3, Dev 4 & Dev 5)_

- **Xác thực:** Đăng nhập bắt buộc bằng tài khoản **Google SSO** sử dụng email VTI (@vti.com.vn).
- **Leaderboard:** Bảng xếp hạng thời gian thực ghi nhận điểm số, thời gian hoàn thành màn chơi, phân loại theo cá nhân và phòng ban.
- **CMS Quản trị:** Hệ thống dành cho Admin để cấu hình thông điệp văn hóa và tùy chỉnh thời gian màn chơi.
- **Cơ chế Pop-up Văn hóa:** Hiển thị thông điệp ngắn truyền cảm hứng về giá trị văn hóa ngay khi nhân vật nhặt được mảnh lịch sử hoặc power-up tương ứng.

---

## 7. LỘ TRÌNH PHÁT TRIỂN (MILESTONES)

- **Giai đoạn 1: REQ + Design (14/05/2026 - 29/05/2026):** Hoàn thiện GDD chuẩn Markdown chi tiết và Assets thiết kế đồng bộ qua Stitch.
- **Giai đoạn 2: Code + Test (01/06/2026 - 12/06/2026):** Lập trình logic qua Antigravity, tích hợp Next.js, Supabase, Google SSO và kiểm thử tự động.
- **Hoàn thiện:** Hạn chót Deploy thành công sản phẩm lên môi trường production vào ngày **17/06/2026**.
