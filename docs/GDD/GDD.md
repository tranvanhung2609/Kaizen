# GAME DESIGN DOCUMENT: VTI 9-YEAR ADVENTURE - KAIZEN JOURNEY

**Phiên bản:** 2.0 | **Dự án:** AI Gameathon 2026 | **Đội thi:** Kaizen Delivery Squad

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

- **Mục tiêu:** Chào mừng kỷ niệm 9 năm thành lập VTI Group; truyền tải hành trình vươn tầm toàn cầu và lồng ghép 3 giá trị cốt lõi: **Tôn trọng - Trách nhiệm - Kaizen**.
- **Thông điệp chủ đạo (Key Message):** **"VTI 9 Năm - Công nghệ kiến tạo giá trị mới"**.
- **Thể loại:** 2D side-scrolling **endless runner theo chặng**, lấy cảm hứng nhịp độ từ Zombie Tsunami: nhân vật luôn tiến về bên phải, người chơi tập trung căn thời điểm nhảy, cúi, bay, né đạn, tiêu diệt Bug/Boss và thu thập bình kinh nghiệm.
- **Nền tảng:** Web (Next.js/Supabase), bắt buộc tích hợp Google SSO của VTI.

---

## 2. THUẬT NGỮ (DEFINITIONS)

- **AI Pipeline:** Quy trình phát triển phần mềm ứng dụng Trí tuệ nhân tạo xuyên suốt từ REQ (Markdown), Design (Stitch), Code (Antigravity) đến Test.
- **Stitch:** Công cụ AI dùng để thiết kế đồng bộ nghệ thuật cho thế giới, vật phẩm, enemy, boss và Mascot.
- **Antigravity:** Công cụ AI hỗ trợ khởi tạo mã nguồn và xử lý logic vật lý runner, va chạm, scoring và boss phase.
- **Endless Run Segment:** Một chặng chạy tự động trong map; người chơi không điều khiển trái/phải mà chỉ điều khiển lên/xuống/space theo tình huống.
- **Experience Flask (Bình kinh nghiệm):** Item thu thập chính, dùng để tính điểm và tăng nội năng Kaizen.
- **Kaizen Energy (Nội năng):** Thanh năng lượng tích lũy theo thời gian chạy, bình kinh nghiệm và Bug bị tiêu diệt.
- **Kaizen Mode:** Trạng thái sức mạnh khi nội năng đầy: tăng tốc, nhảy cao gấp đôi và được trang bị bàn phím bắn đạn "Tab"/"Enter".
- **Checkpoint Boss:** Mốc lưu tiến trình khi người chơi vào phase đấu boss của mỗi map.
- **GDD (Game Design Document):** Tài liệu thiết kế chi tiết viết bằng định dạng Markdown để tối ưu hóa đầu vào cho AI.

---

## 3. CƠ CHẾ GAMEPLAY (CORE MECHANICS)

> **Chi tiết thông số kỹ thuật tại:** [01_Core_Mechanics.md](./01_Core_Mechanics.md)  
> _(Phụ trách bởi: Dev 1 & Dev 2)_

- **Runner tự động:** Mascot VTI luôn di chuyển về bên phải. Camera cuộn theo tốc độ map; người chơi không có phím đi trái/phải.
- **Điều khiển chính:** Phím lên để nhảy/bay lên, phím xuống để cúi/giảm độ cao khi bay, phím cách để bắn khi đang ở Kaizen Mode.
- **Thu thập bình kinh nghiệm:** Các cụm 3 bình được bố trí gần nhau theo hình parabol ngược để người chơi có thể nhặt đủ cả 3 nếu căn thời điểm nhảy chính xác.
- **Combat:** Bug mặt đất chỉ bị tiêu diệt bằng cách giẫm đầu. Bug bay chỉ bị tiêu diệt bằng đạn "Tab"/"Enter" trong Kaizen Mode. Boss bị tiêu diệt bằng đạn bàn phím khi người chơi đủ nội năng Kaizen.
- **Power-ups:**
  - **Tôn trọng (Respect):** Khiên bảo vệ kích hoạt ngay trong 10 giây, chặn sát thương từ đạn, Bug hoặc Bom.
  - **Trách nhiệm (Responsibility):** Lắp thêm cánh kích hoạt ngay trong 10 giây, cho phép bay lên để vượt qua vùng nguy hiểm dưới đất, đồng thời phải né Bom treo dù trên không.
  - **Kaizen:** Tích nội năng theo thời gian và hành động; khi đầy sẽ kích hoạt trạng thái bứt phá có tốc độ cao, nhảy cao gấp đôi và khả năng bắn.
- **Máu và checkpoint:** Mỗi map có 3 máu. Khi hết máu, người chơi chơi lại từ checkpoint gần nhất. Rơi xuống Hố sâu lập tức hết máu. Vào boss phase sẽ tự động đánh dấu checkpoint.
- **Điểm số:** Điểm dùng để xếp hạng theo từng map và tổng hành trình, tính từ bình kinh nghiệm thu thập, Bug tiêu diệt và Boss tiêu diệt.

---

## 4. PHONG CÁCH NGHỆ THUẬT (ART STYLE)

> **Chi tiết thiết kế Assets tại:** [02_World_Design.md](./02_World_Design.md)  
> **Quy chuẩn item Stitch:** [../../.skills/item_art_style_stitch.md](../../.skills/item_art_style_stitch.md)  
> _(Phụ trách bởi: Tester/BA & Design AI)_

- **Phong cách chủ đạo:** **"Vocal Cultural & Local Tech Integration"** - kết hợp bản sắc văn hóa địa phương với ngôn ngữ công nghệ sáng, sạch, giàu năng lượng.
- **Đồng bộ nghệ thuật:** Sử dụng Stitch để thiết kế Mascot, bình kinh nghiệm, power-up, Bug, Boss, Bom, Hố sâu, UI scoring và cutscene theo cùng một style guide.
- **Skins nhân vật:** Thay đổi trang phục và hiệu ứng theo từng Map: Hà Nội, Tokyo, Đà Nẵng. Item cũng đổi motif theo map nhưng vẫn giữ silhouette để người chơi nhận diện nhanh.

---

## 5. THIẾT KẾ THẾ GIỚI (WORLD DESIGN)

> **Chi tiết Level Design tại:** [02_World_Design.md](./02_World_Design.md)  
> _(Phụ trách bởi: Tester/BA)_

- **Màn chơi (World Maps):** Giữ 3 màn chơi cốt lõi theo hành trình phát triển của VTI, độ khó tăng dần:
  1. **Hà Nội (Việt Nam):** Khởi nguồn văn hóa Tôn trọng, tốc độ thấp nhất, pattern chướng ngại dễ đọc.
  2. **Tokyo (Nhật Bản):** Chinh phục thị trường Nhật bằng Kaizen, tốc độ vừa, tăng yêu cầu đọc telegraph và dùng Kaizen đúng nhịp.
  3. **Đà Nẵng (Việt Nam):** Bứt phá Trách nhiệm, tốc độ cao nhất, mật độ Bug bay/Bom dày và nhiều đoạn bay bằng cánh.
- **Cấu trúc mỗi map:** Phase runner chính, cutscene checkpoint boss, phase đấu boss, cutscene kết thúc map, cảnh mở đầu map kế tiếp.
- **Chướng ngại vật xuyên suốt:** Hố sâu yêu cầu nhảy qua; Bom yêu cầu cúi xuống khi chạy dưới đất hoặc bay vượt phía trên khi đang có cánh.
- **Enemy xuyên suốt:** Bug mặt đất, Bug bay và Boss cuối map. Theme hình ảnh thay đổi theo địa phương.
- **Thu thập:** Bình kinh nghiệm thay thế vai trò item thu thập chính trong gameplay. Các cụm 3 bình theo parabol ngược là nhịp thu thập chuẩn của toàn game.

---

## 6. HỆ THỐNG PHỤ TRỢ & KỸ THUẬT (TECHNICAL SPECS)

> **Chi tiết API & Database tại:** [03_Technical_Specs.md](./03_Technical_Specs.md)  
> _(Phụ trách bởi: Dev 3, Dev 4 & Dev 5)_

- **Xác thực:** Đăng nhập bắt buộc bằng tài khoản Google SSO sử dụng email VTI (`@vti.com.vn`).
- **Leaderboard:** Xếp hạng theo từng map và tổng hành trình dựa trên điểm số, kèm thời gian sống/chạy và số lần clear boss.
- **CMS Quản trị:** Admin cấu hình thông điệp văn hóa, thông số map, scoring, boss, pattern vật phẩm, nhạc nền và hiệu ứng âm thanh.
- **Cutscene văn hóa:** Sau mỗi map hiển thị đoạn kể ngắn về hành trình VTI đã vượt qua ở map đó, sau đó mở đầu cho map tiếp theo.
- **Audio:** Mỗi map có nhạc nền riêng và bộ sound effect mapping theo item, power-up, sát thương, Kaizen Mode, boss intro/boss defeat.

---

## 7. LỘ TRÌNH PHÁT TRIỂN (MILESTONES)

- **Giai đoạn 1: REQ + Design (14/05/2026 - 29/05/2026):** Hoàn thiện GDD chuẩn Markdown chi tiết, skill cho Antigravity/Codex và style guide item qua Stitch.
- **Giai đoạn 2: Code + Test (01/06/2026 - 12/06/2026):** Lập trình endless runner, scoring, Supabase, Google SSO, boss phase, checkpoint và kiểm thử tự động.
- **Hoàn thiện:** Hạn chót deploy thành công sản phẩm lên môi trường production vào ngày **17/06/2026**.
