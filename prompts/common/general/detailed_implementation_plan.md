# KẾ HOẠCH TRIỂN KHAI PHÁT TRÌNH CHI TIẾT
## VTI 9-YEAR ADVENTURE - KAIZEN JOURNEY

> [!IMPORTANT]
> Tài liệu này được tạo ra để các thành viên trong đội phát triển (Dev & Art) theo dõi tiến độ và phối hợp thực hiện. Giai đoạn cài đặt mã nguồn Next.js đã được khởi tạo thành công tại thư mục gốc của dự án.

---

## 📅 TRẠNG THÁI HIỆN TẠI (CURRENT STATUS)
*   **Next.js App Router & TS:** Đã khởi tạo thành công ở root (`/src`, `package.json`, `tsconfig.json`, v.v.).
*   **Tài nguyên màn Hà Nội:** Đã có đầy đủ 30 file ảnh nằm trong `public/assets/images/`.
*   **Tài nguyên Tokyo & Đà Nẵng:** Đang chờ đội Art sinh thêm bằng Stitch (đã cung cấp Prompt tại phần phụ lục).

---

## 🛠️ HƯỚNG DẪN THIẾT LẬP SUPABASE CHO DỰ ÁN
Vì dự án chưa thiết lập Supabase, dưới đây là các bước chi tiết để cấu hình:

### Bước 1: Tạo project Supabase mới
1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard) và đăng nhập bằng tài khoản Github/Google.
2. Chọn **New Project**, chọn Organization của bạn.
3. Điền các thông tin:
   * **Name:** `kaizen-journey`
   * **Database Password:** (Nhập mật khẩu an toàn và lưu lại)
   * **Region:** Chọn `Singapore (ap-southeast-1)` để tối ưu tốc độ đường truyền về Việt Nam.
4. Chờ 2-3 phút để Supabase chuẩn bị cơ sở dữ liệu.

### Bước 2: Chạy script khởi tạo database (SQL Editor)
1. Trong màn hình project Supabase, chọn mục **SQL Editor** ở cột menu bên trái (biểu tượng `>_`).
2. Chọn **New query**.
3. Copy toàn bộ đoạn script dưới đây và dán vào, sau đó ấn **Run**:

```sql
-- 1. BẢNG PROFILES (LƯU THÔNG TIN NHÂN VIÊN VTI)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    department TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép đọc thông tin profile công khai" ON profiles FOR SELECT USING (true);
CREATE POLICY "Cho phép người dùng cập nhật profile chính mình" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger tự động tạo profile khi user đăng nhập Google SSO lần đầu
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, department)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'department', 'VTI Member')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. BẢNG LƯU TRỮ LƯỢT CHƠI (MAP RUNS)
CREATE TABLE map_runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    map_key TEXT NOT NULL CHECK (map_key IN ('hanoi', 'tokyo', 'danang')),
    score INTEGER DEFAULT 0 NOT NULL,
    flasks_collected INTEGER DEFAULT 0 NOT NULL,
    ground_bugs_defeated INTEGER DEFAULT 0 NOT NULL,
    flying_bugs_defeated INTEGER DEFAULT 0 NOT NULL,
    bosses_defeated INTEGER DEFAULT 0 NOT NULL,
    hearts_remaining INTEGER DEFAULT 0 NOT NULL,
    completion_time REAL NOT NULL,
    boss_cleared BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE map_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Người dùng tự đọc lượt chơi của mình" ON map_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Người dùng tự lưu lượt chơi mới" ON map_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Cho phép đọc bảng xếp hạng công khai" ON map_runs FOR SELECT USING (true);

CREATE INDEX map_runs_map_score_idx ON map_runs(map_key, score DESC, completion_time ASC);
CREATE INDEX map_runs_user_map_idx ON map_runs(user_id, map_key, score DESC);

-- 3. BẢNG ĐIỂM TỔNG HÀNH TRÌNH (BEST JOURNEY SCORES)
CREATE TABLE journey_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    total_score INTEGER DEFAULT 0 NOT NULL,
    hanoi_best_score INTEGER DEFAULT 0 NOT NULL,
    tokyo_best_score INTEGER DEFAULT 0 NOT NULL,
    danang_best_score INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE journey_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cho phép xem bảng điểm tổng công khai" ON journey_scores FOR SELECT USING (true);
CREATE POLICY "Cho phép người dùng cập nhật điểm của mình" ON journey_scores FOR ALL USING (auth.uid() = user_id);

CREATE INDEX journey_scores_total_idx ON journey_scores(total_score DESC);

-- Trigger tự động cập nhật journey_scores khi có lượt chơi mới có điểm cao hơn
CREATE OR REPLACE FUNCTION public.update_journey_score()
RETURNS trigger AS $$
DECLARE
    current_best INTEGER;
BEGIN
    -- Đảm bảo có dòng journey_scores cho user
    INSERT INTO public.journey_scores (user_id, total_score, hanoi_best_score, tokyo_best_score, danang_best_score)
    VALUES (new.user_id, 0, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    IF new.map_key = 'hanoi' THEN
        SELECT hanoi_best_score INTO current_best FROM public.journey_scores WHERE user_id = new.user_id;
        IF new.score > current_best THEN
            UPDATE public.journey_scores 
            SET hanoi_best_score = new.score, 
                total_score = new.score + tokyo_best_score + danang_best_score,
                updated_at = NOW()
            WHERE user_id = new.user_id;
        END IF;
    ELSIF new.map_key = 'tokyo' THEN
        SELECT tokyo_best_score INTO current_best FROM public.journey_scores WHERE user_id = new.user_id;
        IF new.score > current_best THEN
            UPDATE public.journey_scores 
            SET tokyo_best_score = new.score, 
                total_score = hanoi_best_score + new.score + danang_best_score,
                updated_at = NOW()
            WHERE user_id = new.user_id;
        END IF;
    ELSIF new.map_key = 'danang' THEN
        SELECT danang_best_score INTO current_best FROM public.journey_scores WHERE user_id = new.user_id;
        IF new.score > current_best THEN
            UPDATE public.journey_scores 
            SET danang_best_score = new.score, 
                total_score = hanoi_best_score + tokyo_best_score + new.score,
                updated_at = NOW()
            WHERE user_id = new.user_id;
        END IF;
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_new_map_run
  AFTER INSERT ON map_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_journey_score();

-- 4. BẢNG CẤU HÌNH TRÌNH CMS ADMIN
CREATE TABLE game_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    map_key TEXT UNIQUE NOT NULL CHECK (map_key IN ('hanoi', 'tokyo', 'danang')),
    scoring_rules JSONB NOT NULL,
    difficulty_config JSONB NOT NULL,
    audio_config JSONB NOT NULL,
    cutscene_config JSONB NOT NULL,
    cultural_message TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE game_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cho phép mọi người đọc cấu hình game" ON game_config FOR SELECT USING (true);
```

### Bước 3: Cấu hình Google SSO (OAuth) trên Supabase
1. Truy cập **Authentication** > **Providers** > **Google** trên Supabase Dashboard.
2. Kích hoạt tính năng Google Provider.
3. Nhập **Client ID** và **Client Secret** (Sinh từ Google Cloud Console OAuth 2.0 Client ID).
4. Để giới hạn email VTI trong quá trình login, tại phần cấu hình Google Auth, chú ý truyền URL Redirect hoặc xử lý kiểm tra domain tại client/middleware (middleware đã có mô tả trong file Kế hoạch triển khai).

### Bước 4: Thêm biến môi trường vào dự án
Tạo file `.env.local` ở thư mục gốc của dự án Next.js và nhập các giá trị lấy từ **Project Settings** > **API**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## 📂 PHÂN CHIA THƯ MỤC PROMPTS CHO THÀNH VIÊN

Để tránh dẫm chân nhau trong quá trình cộng tác với AI, mỗi thành viên sẽ quản lý một thư mục riêng trong `prompts/`, đồng thời có một thư mục chung cho cả đội:

```text
prompts/
  nam.buihai/       <- Trưởng nhóm Bùi Hải Nam (Lưu các assets/manifests & prompts sinh ảnh)
    assets/
  common/
    general/        <- Thư mục chứa kế hoạch triển khai (detailed_implementation_plan.md) và các tài nguyên dùng chung
                       (Ví dụ: ui_design_guidelines_and_prompts.md)
  hung.tranvan/     <- Lập trình viên Trần Văn Hưng (Lưu các prompts thuật toán Canvas, Vật lý & Va chạm)
  dat.vothanh/      <- Lập trình viên Võ Thành Đạt (Lưu các prompts thiết kế React UI, HUD & Pages)
  quan.dodam/       <- Lập trình viên Đỗ Đàm Quân (Lưu các prompts DB Schema, APIs & SSO)
  thao.damphuong/   <- Kiểm thử viên Đàm Phương Thảo (Lưu các prompts sinh test cases tự động)
```

> [!TIP]
> **Đồng bộ thiết kế Web UI/UX:** Cả team sử dụng chung tài liệu [ui_design_guidelines_and_prompts.md](./ui_design_guidelines_and_prompts.md) để đảm bảo các màn hình phụ trợ (Login, Leaderboard, Admin) đồng nhất phong cách Vibrant Dark Mode & Glassmorphism với in-game Canvas.




---

## 👥 THÀNH VIÊN & VAI TRÒ (ROLES & RESPONSIBILITIES)

| Thành viên | Vai trò | Nhiệm vụ chính |
| --- | --- | --- |
| **Bùi Hải Nam** | Leader / PM / Art Manager | Điều phối dự án, báo cáo BTC, sinh assets (Stitch), quản lý manifest tài nguyên. |
| **Trần Văn Hưng** | Dev 1 (Canvas & Physics Engine) | Xây dựng bộ lõi chạy game, vật lý người chơi, kiểm tra va chạm, cơ chế boss/enemies. |
| **Võ Thành Đạt** | Dev 2 (React Pages & UI/UX) | Tích hợp giao diện React, kết nối HUD với state của Canvas, các trang web và CSS. |
| **Đỗ Đàm Quân** | Dev 3 (Database & API Integration) | Thiết lập Supabase, Google SSO, Auth Middleware, APIs lưu trữ điểm và BXH. |
| **Đàm Phương Thảo** | Tester (QA & AI-driven Testing) | Lập kịch bản test, viết unit/E2E test tự động bằng AI, duyệt chất lượng trước khi nộp. |

---

## 📅 LỊCH TRÌNH PHÁT TRIỂN 7 NGÀY (7-DAY AGILE SCHEDULE)
*Từ ngày 10/06 đến ngày 16/06 (Ngày 17/06 dùng làm buffer và nộp bài)*

### 🗓️ Ngày 1: Khởi tạo Cơ sở hạ tầng & Setup Môi trường (10/06)
- **Nam (Leader):**
  - Đồng bộ quy ước viết code và cách quản lý tài nguyên.
  - Phân chia task và kiểm soát tiến độ chung.
- **Quân (Dev 3):**
  - Thiết lập Project Supabase, chạy SQL Schema migrations.
  - Cấu hình Google Provider trong Auth Settings.
- **Hưng (Dev 1):**
  - Xây dựng component Canvas Container trong Next.js.
  - Hoàn thành bộ lõi chạy game: `GameLoop.ts`, `InputManager.ts` (bàn phím + cảm ứng).
- **Đạt (Dev 2):**
  - Tạo khung routing Next.js (`/login`, `/game`, `/leaderboard`, `/admin`).
  - Dựng mockup giao diện Tailwind cho các trang.
- **Thảo (Tester):**
  - Lập checklist các kịch bản kiểm thử bảo mật & luồng nghiệp vụ.
  - Thiết lập Vitest runner trong dự án.

### 🗓️ Ngày 2: Xác thực Người dùng & Chuyển động Nhân vật (11/06)
- **Nam (Leader):**
  - Chạy Stitch MCP sinh các tài nguyên Parallax Layer cho map Tokyo.
  - Cập nhật manifest và chia sẻ assets cho đội phát triển.
- **Quân (Dev 3):**
  - Tích hợp đăng nhập Google SSO và kiểm tra hậu kỳ email `@vti.com.vn`.
  - Thiết lập Next.js Middleware để chặn truy cập không hợp lệ.
- **Hưng (Dev 1):**
  - Hiện thực hóa lớp nhân vật `Player.ts` (Vật lý trọng lực, gia tốc, nhảy, rơi, cúi né bom).
- **Đạt (Dev 2):**
  - Hoàn thiện trang `/login` (giao diện glassmorphism sang trọng, kết nối SSO).
  - Tích hợp trạng thái người dùng (Profile Context).
- **Thảo (Tester):**
  - Viết unit test tự động kiểm tra logic đăng nhập và phân quyền truy cập.

### 🗓️ Ngày 3: Parallax Background & Sinh Vật thể Tự động (12/06)
- **Nam (Leader):**
  - Sinh assets Tokyo (mascot kimono tech, obstacles, enemies) bằng Stitch MCP.
  - Cắt ghép và xử lý độ trong suốt của ảnh.
- **Quân (Dev 3):**
  - Xây dựng API lưu trữ kết quả lượt chơi (`map_runs`).
  - Viết logic kiểm tra tính hợp lệ của điểm số (anti-cheat cơ bản).
- **Hưng (Dev 1):**
  - Viết module `ParallaxLayer.ts` và camera cuộn `Viewport.ts`.
  - Triển khai cơ chế Object Pooling để sinh bình kinh nghiệm (`Flask`) và chướng ngại vật tự động.
- **Đạt (Dev 2):**
  - Tạo HUD bán trong suốt đè lên Canvas (`Health`, `Score`, `Kaizen Gauge`, `Timer Badges`).
- **Thảo (Tester):**
  - Viết test kiểm tra tính phản hồi (Responsive) của Canvas trên các độ phân giải màn hình.

### 🗓️ Ngày 4: Hệ thống Va chạm & Kẻ địch AI (13/06)
- **Nam (Leader):**
  - Sinh toàn bộ tài nguyên cho map Đà Nẵng (mascot polo xanh, backgrounds, enemies).
- **Quân (Dev 3):**
  - Thiết lập trigger tự động cập nhật bảng xếp hạng tổng (`journey_scores`).
  - Viết API lấy top người dùng có điểm cao nhất.
- **Hưng (Dev 1):**
  - Hoàn thiện va chạm AABB (`Collision.ts`) giữa Mascot với items, obstacles và enemies.
  - Viết logic Bug di chuyển tuần tra và bay hình sin, cơ chế Mascot giẫm đầu Bug để tiêu diệt (`Stomp`).
- **Đạt (Dev 2):**
  - Thiết kế trang bảng xếp hạng `/leaderboard` với hiệu ứng animation mượt mà.
  - Cho phép lọc BXH theo từng chặng chạy (Hà Nội, Tokyo, Đà Nẵng) hoặc phòng ban.
- **Thảo (Tester):**
  - Viết bộ kiểm thử tự động xác minh công thức tính điểm và cơ chế va chạm.

### 🗓️ Ngày 5: Cơ chế Trùm (Boss Fight) & Âm thanh (14/06)
- **Nam (Leader):**
  - Sinh ảnh Boss Tokyo/Đà Nẵng và cảnh chuyển cutscenes bằng Stitch.
- **Quân (Dev 3):**
  - Hoàn thành API cấu hình CMS (`game_config`).
- **Hưng (Dev 1):**
  - Hiện thực hóa máy trạng thái Boss (Intro, Bắn đạn thẳng, bắn parabol, marker vùng ảnh hưởng).
  - Viết `AudioManager.ts` (crossfade nhạc nền khi vào cửa trùm, quản lý SFX).
- **Đạt (Dev 2):**
  - Thiết kế giao diện admin `/admin` cho phép live-tweak các hằng số vật lý và quy tắc điểm số.
- **Thảo (Tester):**
  - Kiểm thử bảo mật cơ sở dữ liệu (đảm bảo RLS policy hoạt động, ngăn ghi đè điểm trái phép).

### 🗓️ Ngày 6: Tích hợp Cutscene & Đánh bóng Game (15/06)
- **Nam (Leader):**
  - Kiểm duyệt lại toàn bộ visual chất lượng cao, tối ưu dung lượng file ảnh.
- **Quân (Dev 3):**
  - Đóng gói backup database và cấu hình production client ID.
- **Hưng (Dev 1):**
  - Viết các hiệu ứng rung màn hình (Screen Shake), lóe sáng bàn phím, vệt sáng bay của Mascot.
- **Đạt (Dev 2):**
  - Hiện thực hóa lớp phủ Cutscenes đè lên game (Opening, Boss Intro, Victory/Clear map).
- **Thảo (Tester):**
  - Chạy tích hợp E2E (End-to-End) toàn bộ luồng game từ đăng nhập, chơi hết map, lưu điểm và hiển thị BXH.

### 🗓️ Ngày 7: Sửa lỗi, Tối ưu Hiệu năng & Nộp bài (16/06)
- **Nam (Leader):**
  - Soạn thảo tài liệu báo cáo BTC, quay video demo gameplay mượt mà.
- **Cả 3 Devs:**
  - Tập trung tìm kiếm và giải quyết các lỗi rò rỉ bộ nhớ (memory leaks) khi Canvas unmount.
  - Tối ưu hóa frame-rate để đạt 60fps ổn định trên thiết bị di động.
- **Thảo (Tester):**
  - Thực hiện đợt chạy thử nghiệm diện rộng (Playtest) và ký xác nhận chất lượng (Sign-off).

---

## 🎨 PHỤ LỤC: DANH SÁCH PROMPT BATCH DÀNH CHO STITCH
Đội Art copy trực tiếp các đoạn prompt này vào Stitch MCP để sinh tài nguyên:
* **Hà Nội:** Xem tại [hanoi_stitch_prompts.md](../../nam.buihai/assets/hanoi_stitch_prompts.md).
* **Tokyo:** Sử dụng prompt trong `Giai đoạn 2` của Kế hoạch triển khai để sinh 30 ảnh tương ứng.
* **Đà Nẵng:** Sử dụng prompt trong `Giai đoạn 2` của Kế hoạch triển khai để sinh 30 ảnh tương ứng.
