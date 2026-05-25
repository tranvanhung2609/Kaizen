# **THỂ LỆ CUỘC THI: VTI D5+ĐN ADVENTURE \- AI GAMEATHON**

## **1\. MỤC TIÊU CUỘC THI**

Cuộc thi được tổ chức nhằm **chào mừng kỷ niệm 9 năm thành lập VTI Group**.

Thông qua việc tìm kiếm giải pháp phát triển (reskin) game 2D platformer/khám phá mang đậm bản sắc văn hóa doanh nghiệp, chiến dịch sẽ truyền thông mạnh mẽ hành trình 9 năm phát triển hệ sinh thái của VTI (Giáo dục \- Nhân lực \- Dịch vụ & Sản phẩm IT) vươn tầm toàn cầu (Việt Nam, Nhật Bản, Hàn Quốc...), đồng thời lồng ghép khéo léo 3 giá trị cốt lõi: **Tôn trọng – Trách nhiệm – Kaizen**.

Đặc biệt, cuộc thi khuyến khích tinh thần tiên phong công nghệ của các VTIans thông qua việc **áp dụng Trí tuệ Nhân tạo (AI) vào toàn bộ quy trình phát triển phần mềm (SDLC)**.

## **2\. YÊU CẦU CÔNG NGHỆ BẮT BUỘC (AI PIPELINE)**

Các đội thi (VTIans) bắt buộc phải ứng dụng AI trong tất cả các giai đoạn của dự án. Cụ thể:

* **Phân tích & Quản lý Yêu cầu (Requirement):** Bắt buộc sử dụng định dạng Markdown. Các đội dùng AI để phân rã Đề bài thành Game Design Document (GDD) chuẩn, viết hoàn toàn bằng Markdown để tối ưu hóa đầu vào (context) cho các công cụ AI ở phase sau.  
* **Thiết kế Giao diện (Design UI):** Sử dụng công cụ **Stitch** (kết hợp các AI Image Generators) để thiết kế thế giới, vật phẩm và Mascot. Đảm bảo tính đồng bộ về phong cách nghệ thuật (Art style).  
* **Lập trình (Code):** Sử dụng Antigravity để khởi tạo mã nguồn, xử lý logic vật lý (chạy, nhảy, va chạm), hệ thống tính điểm. Khuyến khích sử dụng thêm các công nghệ hỗ trợ: NextJS (Frontend/CMS), Supabase (Database), và Google SSO (Xác thực).  
* **Kiểm thử (Test):** Khuyến khích sử dụng các công cụ gen Testcase tự động. Khuyến khích sử dụng  
* Yêu cầu SSO Google để login  
* **Chi phí (AI Shop)**: … Điểm cộng

Mỗi đội thi phải có quy mô từ **3 đến 4 người (VTIans) bao gồm các role (yêu cầu tối thiểu phải có 1 bạn role Dev và 1 bạn role Test/BA)** để đảm bảo tối ưu hóa quy trình phát triển phần mềm (SDLC) và ứng dụng đầy đủ các công cụ AI bắt buộc.

## **3\. ĐỀ BÀI VÀ CÁC LỰA CHỌN GAMEPLAY (OPTIONS)**

***Lưu ý về phạm vi (Scope)**: Do giới hạn thời gian phát triển, các đội thi nên giới hạn số lượng màn chơi (levels/maps) để đảm bảo giảm độ phức tạp và tập trung vào chất lượng, sự hoàn thiện của game.*

Các đội thi có quyền chọn **1 trong 5 concept game** dưới đây để phát triển.

**Yêu cầu chung cho mọi concept:** Tích hợp hệ thống Đăng nhập (SSO/Email của VTI), Lưu trữ điểm số thời gian thực, Bảng xếp hạng (Leaderboard) phân loại theo cá nhân/phòng ban và Hệ thống CMS quản trị (thay đổi thông điệp, cấu hình thời gian).

### **OPTION 1: VTI PLATFORMER (BẢN CHUẨN GỐC \- DẠNG MARIO)**

🎥 *Video tham khảo gameplay:* [Xem lối chơi Super Mario Bros](https://www.google.com/search?q=https://www.youtube.com/results%3Fsearch_query%3Dsuper%2Bmario%2Bbros%2Bgameplay)

Giữ nguyên cơ chế đi ngang, nhảy, thu thập vật phẩm và tiêu diệt quái.

* **Bối cảnh (World Maps):** Chia thành các màn chơi (Worlds) với thiết kế đặc trưng theo các cứ điểm của VTI: Hà Nội, Đà Nẵng, TP.HCM (Việt Nam), Tokyo (Nhật Bản), Seoul (Hàn Quốc)...  
* **Vật phẩm hỗ trợ (Power-ups):** Là các "Giá trị cốt lõi" của VTI:  
  * *Tôn trọng (Respect):* Tạo khiên bảo vệ (như Shield).  
  * *Trách nhiệm (Responsibility):* Tăng sức mạnh (phá vỡ chướng ngại vật).  
  * *Kaizen (Liên tục cải tiến):* Tăng tốc độ di chuyển hoặc khả năng nhảy đúp.  
* **Chướng ngại vật (Enemies):** Các quái vật là hiện thân của sự trì trệ, lỗi bug, hoặc sự thiếu liên kết trong công việc.  
* **Cơ chế Pop-up:** Hiển thị thông điệp ngắn về giá trị cốt lõi khi chạm vào vật phẩm. Điểm kết thúc mỗi màn là biểu tượng cắm cờ mang logo VTI Group.

### **OPTION 2: VTI CLOUD EXPLORER (HÀNH ĐỘNG CHIẾN LƯỢC \- DẠNG MEGA MAN)**

🎥 *Video tham khảo gameplay:* [Xem lối chơi Mega Man X](https://www.google.com/search?q=https://www.youtube.com/results%3Fsearch_query%3Dmega%2Bman%2Bx%2Bgameplay)

* **Gameplay:** VTIan xuất phát từ Base Camp (VTI Building) và được quyền tự do chọn các vùng đất (Các mảng kinh doanh: A-IoT, Cloud, eCommerce, Giáo dục) để thám hiểm.  
* **Cơ chế:** Cuối mỗi vùng đất sẽ có một Trùm cuối (VD: "Bug Tối Thượng" hoặc "Lỗ hổng Bảo mật"). Hạ gục Trùm bằng giải pháp công nghệ, nhân vật sẽ thu thập được điểm kinh nghiệm hoặc kỹ năng để dùng cho các dự án (map) khó hơn.

### **OPTION 3: KAIZEN DASH (TỐC ĐỘ BỨT PHÁ \- DẠNG SONIC)**

🎥 *Video tham khảo gameplay:* [Xem lối chơi Sonic The Hedgehog](https://www.google.com/search?q=https://www.youtube.com/results%3Fsearch_query%3Dsonic%2Bthe%2Bhedgehog%2Bclassic%2Bgameplay)

* **Gameplay:** Tập trung vào nhịp độ nhanh, thể hiện giá trị "Kaizen" và sự tăng trưởng tốc độ của VTI.  
* **Cơ chế:** Nhân vật bứt tốc vượt địa hình phức tạp để thu thập các chứng chỉ (như AWS, Microsoft Gold Partner...). Nếu va chạm với chướng ngại vật, điểm tích lũy sẽ rơi vãi, đòi hỏi phản xạ cực tốt từ người chơi.

### **OPTION 4: VTI MAZE (MÊ CUNG THỊ TRƯỜNG \- DẠNG PAC-MAN)**

🎥 *Video tham khảo gameplay:* [Xem lối chơi Pac-Man Classic](https://www.google.com/search?q=https://www.youtube.com/results%3Fsearch_query%3Dpac%2Bman%2Bclassic%2Bgameplay)

* **Gameplay:** Bản đồ thế giới là một mê cung khổng lồ. Nhân vật di chuyển để phủ sóng thị trường và tìm kiếm nhân tài (ứng với mảng Tuyển dụng/Đào tạo của VTI).  
* **Cơ chế:** Người chơi phải thu thập các "Sáng kiến đột phá". Khi nhặt được sức mạnh "Trách nhiệm", nhân vật có khả năng truy cản và đánh bay các lỗi hệ thống đang cản đường.

### **OPTION 5: VTI ECOSYSTEM (KHÁM PHÁ BẢN ĐỒ \- DẠNG METROIDVANIA)**

🎥 *Video tham khảo gameplay:* [Xem lối chơi Hollow Knight](https://www.google.com/search?q=https://www.youtube.com/results%3Fsearch_query%3Dhollow%2Bknight%2Bgameplay)

* **Gameplay:** Một bản đồ duy nhất, liền mạch kết nối toàn bộ hệ sinh thái: VTI Education, VTI Academy, VTI Solutions và VTI Korea/Japan, tái hiện lại **chặng đường 9 năm hình thành và phát triển**.  
* **Cơ chế:** Ban đầu, nhân vật bị giới hạn khu vực di chuyển do thiếu kỹ năng. Thông qua việc thu thập các lõi công nghệ (AI, Data Analytics), giá trị văn hóa, và **9 mảnh ghép lịch sử đại diện cho 9 năm vinh quang**, nhân vật học được kỹ năng mới (bơi, nhảy cao...) để tiến sâu hơn, mở khóa các thị trường quốc tế mới.

## **4\. THÔNG ĐIỆP CHỦ ĐẠO (KEY MESSAGE)**

**"VTI 9 Năm \- Công nghệ kiến tạo giá trị mới"** Hành trình trọn vẹn 1 thập kỷ của các VTIans không ngừng vượt qua thử thách, ứng dụng Kaizen mỗi ngày để đưa hệ sinh thái VTI phủ sóng toàn cầu.

## **5\. THỜI GIAN TRIỂN KHAI VÀ TIÊU CHÍ ĐÁNH GIÁ**

* **Hạn đăng ký : 13/05/2026**  
* **Hạn chót hoàn thành và Deploy thành công:** **17/06/2025**  
* **Triển khai theo milestone :**   
  1. **Giai đoạn 1 : REQ \+ Design (2 tuần 14/05/2026 \- 29/05/2026)**   
  2. **Giai đoạn 2 : Code \+ Test (2 tuần 01/06/2026 \- 12/06/2026)**  
* **Định kỳ sẽ demo và chia sẻ workshop giữa các team cuối mỗi sprint**  
* **Sẽ có người support tham gia đóng vai trò là Product Owner để định hướng, feedback và chấm điểm theo từng giai đoạn**  
* **Tiêu chí đánh giá (Chấm điểm):**  
  1. Mức độ ứng dụng AI hiệu quả và sáng tạo trong các phase (Requirement, Design, Code, Test).  
  2. Tính ổn định, mượt mà của Gameplay và UI/UX mang đậm dấu ấn sinh nhật 9 năm thương hiệu VTI.  
  3. Khả năng truyền tải trọn vẹn văn hóa: "Tôn trọng – Trách nhiệm – Kaizen".  
  4. Sự hoàn thiện của các tính năng phụ trợ: SSO, Bảng xếp hạng, và trang Quản trị (CMS).  
  5. Quyết định của BTC là quyết định cuối cùng.

## **6\. TRÁCH NHIỆM ĐỊNH HƯỚNG VÀ HƯỚNG DẪN CỦA BAN TỔ CHỨC (Định hướng trên nhóm chat và check source thường xuyên)**

Để đảm bảo các đội thi ứng dụng AI hiệu quả và tuân thủ Thể lệ cuộc thi, Ban Tổ Chức (BTC) sẽ có các hoạt động định hướng và hỗ trợ chi tiết theo từng giai đoạn phát triển phần mềm (SDLC):

| Giai đoạn Phát triển (Phase) | Trọng tâm Hướng dẫn | Trách nhiệm Định hướng/Hỗ trợ của BTC |
| ----- | ----- | ----- |
| **Requirement** (Phân tích & Quản lý Yêu cầu) | Chuẩn hóa Game Design Document (GDD) và cấu trúc AI Pipeline. | Tổ chức buổi hướng dẫn chuyên sâu về kỹ thuật phân rã Đề bài thành GDD chuẩn Markdown, tối ưu hóa đầu vào (context) cho các công cụ AI tiếp theo. |
| **Design UI** (Thiết kế Giao diện) | Đảm bảo tính đồng bộ về phong cách nghệ thuật (Art style) và ứng dụng công cụ **Stitch**. | Cung cấp hướng dẫn sử dụng công cụ **Stitch** (kết hợp các AI Image Generators) để thiết kế thế giới, vật phẩm và Mascot. Thực hiện Quick Review (đánh giá nhanh) về Art style. |
| **Code** (Lập trình) | Hỗ trợ kỹ thuật về khởi tạo mã nguồn, xử lý logic game và tích hợp các tính năng phụ trợ (SSO, CMS). | Workshop hướng dẫn sử dụng Antigravity cho logic vật lý (chạy, nhảy, va chạm) và các công nghệ khuyến khích (NextJS, Supabase, Google SSO). Giải đáp thắc mắc kỹ thuật trong quá trình code. |
| **Test** (Kiểm thử) | Đảm bảo chất lượng game và ứng dụng công cụ gen Testcase tự động. | Tổ chức training về các công cụ gen Testcase tự động bắt buộc. Hỗ trợ các đội thi trong quy trình kiểm thử, Debug và hỗ trợ Deployment lên môi trường thành công. |

## **7\. Giải thưởng**

- 1 Giải nhất : 3.000.000 VNĐ  
- 1 Giải nhì : 2.000.000 VNĐ   
- 2 Giải ba : 1.000.000 VNĐ

## **8\. Tham khảo**

- [https://dinasourmath.vtdat94.workers.dev/](https://dinasourmath.vtdat94.workers.dev/) 

