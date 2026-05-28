# TÀI LIỆU CHI TIẾT: THIẾT KẾ THẾ GIỚI & MÀN CHƠI (WORLD DESIGN & LEVELS)
**Dự án:** VTI 9-Year Adventure - Kaizen Journey | **Đội thi:** Kaizen Delivery Squad

---

Tài liệu này đặc tả bối cảnh nghệ thuật, nhịp độ gameplay, enemy, boss, vật phẩm và cutscene cho 3 map endless runner: **Hà Nội**, **Tokyo**, **Đà Nẵng**. Các map cùng dùng chung hệ cơ chế chạy tự động, nhảy/cúi/bay, bình kinh nghiệm, Bug, Boss, Respect Shield, Responsibility Wings và Kaizen Mode.

---

## ĐỊNH HƯỚNG MỸ THUẬT: BẢN SẮC VĂN HÓA & CÔNG NGHỆ ĐỊA PHƯƠNG

*   **Không Cyberpunk chung chung:** Tránh nền tối, neon quá nặng và hình ảnh viễn tưởng không gắn với VTI.
*   **Vocal Cultural & Local Tech Integration:** Mỗi map phải thể hiện rõ địa phương, văn hóa, văn phòng VTI và tinh thần công nghệ hiện đại.
*   **Runner readability:** Vì gameplay tốc độ cao, item/enemy/chướng ngại phải có silhouette rõ, màu tương phản với nền và telegraph trước khi gây sát thương.
*   **Stitch-ready assets:** Tất cả item chính cần tuân thủ skill art riêng tại `.skills/item_art_style_stitch.md`.

---

## CẤU TRÚC CHUNG CỦA MỖI MAP

```mermaid
graph LR
    A[Runner Phase] --> B[Boss Gate Checkpoint]
    B --> C[Boss Intro Cutscene]
    C --> D[Boss Phase]
    D --> E[Map Clear Cutscene]
    E --> F[Next Map Opening]
```

### A. Runner Phase
*   Nhân vật tự động chạy về bên phải.
*   Người chơi thu thập bình kinh nghiệm theo cụm parabol ngược, né Hố sâu/Bom, tiêu diệt Bug mặt đất bằng stomp và chuẩn bị nội năng Kaizen cho phase boss.

### B. Boss Phase
*   Boss chạy cùng tốc độ với người chơi ở phía trước màn hình.
*   Boss liên tục bắn đạn nhiều quỹ đạo.
*   Người chơi cần dùng Kaizen Mode để bắn đạn "Tab"/"Enter" gây sát thương boss.

### C. Cutscene
*   **Boss Intro:** Show hình boss, tên boss, câu thoại thử thách và kích hoạt checkpoint.
*   **Map Clear:** Tóm tắt hành trình vừa vượt qua, điểm số và một mốc phát triển trong lịch sử VTI.
*   **Next Map Opening:** Mở cảnh chuyển địa phương tiếp theo.

---

## LỘ TRÌNH 3 MAP & ĐỘ KHÓ

```mermaid
graph LR
    A["Màn 1: Hà Nội - Khởi nguồn - Tôn trọng"] -->|Clear Boss| B["Màn 2: Tokyo - Chinh phục - Kaizen"]
    B -->|Clear Boss| C["Màn 3: Đà Nẵng - Bứt phá - Trách nhiệm"]
```

| Map | Tốc độ nền | Mật độ chướng ngại | Trọng tâm kỹ năng | Boss |
| --- | --- | --- | --- | --- |
| Hà Nội | Thấp | Thấp - vừa | Nhảy đúng nhịp, cúi né Bom, học stomp | Boss Deadline Cổ Phố |
| Tokyo | Vừa | Vừa - cao | Đọc telegraph, xử lý Bug bay, dùng Kaizen đúng cửa sổ | Boss Kaizen Breaker |
| Đà Nẵng | Cao | Cao | Kết hợp nhảy/cúi/bay, né Bom dù dày, bắn boss trong áp lực cao | Boss Data Storm Dragon |

---

## MÀN 1: HÀ NỘI - KHỞI NGUỒN GIÁ TRỊ (RESPECT MAP)

*   **Thông điệp truyền tải:** VTI khởi nguồn từ Hà Nội với văn hóa **Tôn trọng (Respect)** đối tác, khách hàng và đồng nghiệp.
*   **Vai trò gameplay:** Map nhập môn cho endless runner; dạy nhảy qua Hố sâu, cúi qua Bom, stomp Bug mặt đất và nhặt cụm bình kinh nghiệm.
*   **Tông màu chủ đạo:** Vàng hoàng hôn cổ kính, cam ấm, xanh Hồ Gươm và điểm nhấn đỏ VTI.

### A. Background Layers
*   **Far Background:** Tháp Rùa Hồ Gươm, cầu Thê Húc, hàng liễu và mặt hồ phản chiếu.
*   **Midground:** Phố cổ Hà Nội, cột cờ Hà Nội, tòa nhà VTI Hà Nội có logo sáng.
*   **Foreground:** Nền gạch xám cổ, khóm hoa, ghế trà đá, biển chỉ dẫn VTI 9 năm.

### B. Mascot & Item Theme
*   **Mascot:** Áo dài cách tân đỏ viền vàng, giày thể thao, tai nghe công nghệ.
*   **Bình kinh nghiệm:** Bình thủy tinh nhỏ có họa tiết sóng Hồ Gươm, nắp đỏ VTI, lõi sáng vàng.
*   **Respect Shield:** Khiên họa tiết hoa sen/cầu Thê Húc, glow xanh lục dịu.
*   **Responsibility Wings:** Cánh công nghệ đơn giản, motif nan tre và viền xanh lam.
*   **Kaizen Keyboard:** Bàn phím compact có keycap đỏ/vàng, hiệu ứng ký tự "Tab"/"Enter" dạng thư pháp số.

### C. Enemy & Obstacles
*   **Bug mặt đất - Bug Tắc Đường:** Di chuyển chậm, hitbox lớn, dạy người chơi stomp.
*   **Bug bay - Bug Trì Hoãn:** Bay thấp, bắn đạn đồng hồ lỗi theo đường thẳng chậm.
*   **Hố sâu:** Vết nứt trên mặt đường gạch, telegraph bằng bụi và biển cảnh báo nhỏ.
*   **Bom:** Bom treo thấp như túi hàng/rào công trình, yêu cầu cúi để qua.

### D. Boss Phase
*   **Boss:** Boss Deadline Cổ Phố.
*   **Hình ảnh:** Cỗ máy đồng hồ lớn phủ giấy note deadline, bánh răng kẹt và đèn đỏ nhấp nháy.
*   **Pattern đạn:** Đạn thẳng chậm, đạn parabol thấp, một loạt đạn báo trước bằng marker đỏ.
*   **Mục tiêu độ khó:** Người chơi có thể clear nếu biết tích Kaizen, nhảy/cúi cơ bản và bắn đúng nhịp.

### E. Cutscene sau map
*   Kể về giai đoạn khởi nguồn của VTI, tinh thần tôn trọng trong hợp tác và nền móng văn hóa đội ngũ.
*   Cảnh mở đầu tiếp theo: Mascot lên chuyến bay quốc tế hướng tới Tokyo, skyline chuyển dần sang hoa anh đào và biển quảng cáo LED.

---

## MÀN 2: TOKYO - CHINH PHỤC TOÀN CẦU (KAIZEN MAP)

*   **Thông điệp truyền tải:** VTI chinh phục thị trường Nhật Bản bằng tinh thần học hỏi, kỷ luật và **Kaizen** mỗi ngày.
*   **Vai trò gameplay:** Map độ khó trung bình; tăng tốc so với Hà Nội, bắt đầu yêu cầu đọc telegraph rõ hơn, xử lý Bug bay và dùng Kaizen Mode đúng cửa sổ.
*   **Tông màu chủ đạo:** Hồng hoa anh đào, trắng tuyết, đỏ mặt trời, xanh công nghệ và ánh LED Tokyo.

### A. Background Layers
*   **Far Background:** Núi Phú Sĩ, mặt trời đỏ, Tokyo Tower.
*   **Midground:** Ngã tư Shibuya, màn hình LED VTI 9 năm, văn phòng VTI Japan.
*   **Foreground:** Vạch đường Shibuya, nền đá sân đền, hoa anh đào rơi, biển chỉ dẫn song ngữ.

### B. Mascot & Item Theme
*   **Mascot:** Kimono cách tân hoặc business casual high-tech, dải năng lượng sau lưng.
*   **Bình kinh nghiệm:** Bình pha lê hình búp hoa anh đào, lõi hồng/trắng, particle cánh hoa.
*   **Respect Shield:** Khiên họa tiết cánh hoa và mặt trời đỏ.
*   **Responsibility Wings:** Cánh origami công nghệ, viền sáng trắng/xanh.
*   **Kaizen Keyboard:** Bàn phím Nhật-VTI, keycap tối giản, đạn "Tab"/"Enter" có trail hoa anh đào số hóa.

### C. Enemy & Obstacles
*   **Bug mặt đất - Overtime Bug:** Chạy trên mặt đất, ném giấy tờ làm telegraph nhưng vẫn phải stomp để tiêu diệt.
*   **Bug bay - Language Barrier Bug:** Bay cao, bắn ký tự lỗi font theo quỹ đạo chéo vừa phải.
*   **Hố sâu:** Khe nứt giữa đường Shibuya/ga tàu, có đèn cảnh báo đỏ.
*   **Bom:** Bom an ninh treo thấp và Bom dù trên không, pattern xen kẽ nhưng khoảng nghỉ còn rõ để người chơi học nhịp.

### D. Boss Phase
*   **Boss:** Boss Kaizen Breaker.
*   **Hình ảnh:** Thực thể lỗi hệ thống khổng lồ mặc giáp công sở, mang lõi phản-Kaizen và màn hình báo lỗi.
*   **Pattern đạn:** Đạn thẳng nhanh vừa, đạn chùm hẹp, đạn rơi theo marker và một số đạn parabol.
*   **Mục tiêu độ khó:** Kiểm tra khả năng đọc telegraph, giữ máu và dùng Kaizen Mode chính xác, nhưng chưa dày đặc như map cuối Đà Nẵng.

### E. Cutscene sau map
*   Kể về bước tiến ra thị trường Nhật Bản, tinh thần học hỏi, kỷ luật và cải tiến liên tục của VTI.
*   Cảnh mở đầu tiếp theo: Mascot trở về Việt Nam, đường bay chuyển về bờ biển Đà Nẵng và Cầu Rồng, nhạc nâng tempo rõ rệt.

---

## MÀN 3: ĐÀ NẴNG - BỨT PHÁ CÔNG NGHỆ (RESPONSIBILITY MAP)

*   **Thông điệp truyền tải:** VTI Đà Nẵng đại diện tinh thần **Trách nhiệm (Responsibility)**, chủ động nhận việc khó và bứt phá trong triển khai công nghệ.
*   **Vai trò gameplay:** Map cuối có tốc độ cao nhất, pattern dày nhất, nhiều đoạn Responsibility Flight, Bom dù trên không và Bug bay bắn đạn áp lực cao.
*   **Tông màu chủ đạo:** Xanh đại dương, vàng cát, cam nắng và trắng sáng.

### A. Background Layers
*   **Far Background:** Cầu Rồng, sông Hàn, Ngũ Hành Sơn.
*   **Midground:** Bãi biển Mỹ Khê, Sun Wheel, văn phòng VTI Đà Nẵng.
*   **Foreground:** Sàn gỗ ven biển, bờ cát, phao cứu hộ, vỏ sò phát sáng.

### B. Mascot & Item Theme
*   **Mascot:** Áo polo xanh VTI, quần thể thao, smart visor.
*   **Bình kinh nghiệm:** Bình dạng giọt nước/pha lê biển, lõi xanh cyan, hiệu ứng bong bóng nhỏ.
*   **Respect Shield:** Khiên hình phao cứu hộ công nghệ.
*   **Responsibility Wings:** Cánh phản lực lấy cảm hứng từ Cầu Rồng, glow xanh/cam.
*   **Kaizen Keyboard:** Bàn phím chống nước, keycap cyan/cam, đạn "Tab"/"Enter" như sóng dữ liệu.

### C. Enemy & Obstacles
*   **Bug mặt đất - Low Battery Bug:** Pin cạn nằm trên đường, có xung điện ngắn; chỉ stomp khi xung tắt.
*   **Bug bay - Data Leak Bug:** Bay zigzag nhanh, bắn đạn dữ liệu theo nhịp dày hơn Tokyo.
*   **Hố sâu:** Khe nứt giữa cầu/sàn gỗ, có hiệu ứng sóng dưới đáy.
*   **Bom:** Bom treo dù trên trời trong đoạn bay và Bom thấp trên mặt đất xuất hiện xen kẽ nhanh, buộc người chơi đổi trạng thái liên tục.

### D. Boss Phase
*   **Boss:** Boss Data Storm Dragon.
*   **Hình ảnh:** Rồng dữ liệu lấy cảm hứng Cầu Rồng, thân tạo bởi packet dữ liệu và đèn LED.
*   **Pattern đạn:** Đạn chùm hình quạt rộng, đạn zigzag nhanh, đạn mưa dữ liệu rơi từ trên xuống và barrage ngắn trong đoạn bay.
*   **Mục tiêu độ khó:** Kiểm tra toàn bộ kỹ năng: nhảy/cúi chính xác, bay/hạ độ cao, giữ máu, tận dụng Respect và bắn boss trong Kaizen Mode dưới áp lực cao nhất.

### E. Cutscene kết thúc hành trình
*   Tổng kết hành trình 9 năm VTI từ khởi nguồn, chinh phục thị trường quốc tế đến bứt phá trách nhiệm trong triển khai công nghệ.
*   Hiển thị tổng điểm hành trình, rank cá nhân/phòng ban và thông điệp: **"VTI 9 Năm - Công nghệ kiến tạo giá trị mới"**.

---

## MAPPING AUDIO THEO MAP

| Map | Nhạc runner | Nhạc boss | SFX điểm nhấn |
| --- | --- | --- | --- |
| Hà Nội | Giai điệu ấm, tempo vừa, nhạc cụ truyền thống nhẹ + synth | Remix căng hơn với tiếng đồng hồ và trống thấp | Chuông nhỏ khi nhặt bình, tiếng khiên sen, bánh răng boss |
| Tokyo | Electronic tempo vừa-cao, motif hoa anh đào và city pop nhẹ | Boss theme dồn dập nhưng còn khoảng nghỉ rõ | Keycap "Tab"/"Enter", lỗi font, cảnh báo Shibuya |
| Đà Nẵng | Tempo nhanh nhất, percussion biển, synth sáng | Layer rồng dữ liệu, bass mạnh và tiếng gió áp lực cao | Bong bóng dữ liệu, tiếng cánh phản lực, đạn packet |
