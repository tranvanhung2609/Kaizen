# SOFTWARE REQUIREMENTS SPECIFICATION: VTI 9-YEAR ADVENTURE - KAIZEN JOURNEY

**Phiên bản:** 1.0 | **Dự án:** AI Gameathon 2026 | **Đội thi:** Kaizen Delivery Squad

---

## 1. Mục Đích & Phạm Vi

Tài liệu này đặc tả yêu cầu phần mềm cho game **VTI 9-Year Adventure - Kaizen Journey**: chức năng gameplay, trạng thái game, scoring, checkpoint, leaderboard, Google SSO, Supabase, CMS, kiến trúc Next.js/Canvas và tiêu chí kiểm thử.

Thiết kế trải nghiệm, thế giới, art direction, map, cutscene và pipeline Stitch được quản lý trong:

> [Game Design Document](../GDD/GDD.md)

---

## 2. Tổng Quan Sản Phẩm

- **Nền tảng:** Web.
- **Framework:** Next.js App Router.
- **Gameplay runtime:** HTML5 Canvas chạy client-side.
- **Backend:** Supabase.
- **Auth:** Google SSO, chỉ cho phép email `@vti.com.vn`.
- **Thể loại:** 2D side-scrolling endless runner theo chặng.
- **Map:** Hà Nội, Tokyo, Đà Nẵng.
- **Leaderboard:** Theo từng map và tổng hành trình.

---

## 3. Thuật Ngữ

- **Map:** Một chặng chơi gồm runner phase, boss checkpoint, boss intro, boss phase và map clear.
- **Runner phase:** Đoạn chạy tự động, người chơi nhảy/cúi/bay/né/thu thập.
- **Boss phase:** Đoạn đấu boss cuối map.
- **Checkpoint boss:** Mốc lưu tại cổng boss.
- **Experience Flask:** Bình kinh nghiệm, item thu thập chính.
- **Kaizen Energy:** Nội năng tăng theo thời gian, bình kinh nghiệm và Bug bị tiêu diệt.
- **Kaizen Mode:** Trạng thái khi nội năng đầy, tăng tốc, nhảy cao và bắn đạn "Tab"/"Enter".
- **Respect Shield:** Khiên bảo vệ tạm thời.
- **Responsibility Wings:** Cánh bay tạm thời.

---

## 4. Yêu Cầu Chức Năng Gameplay

### FR-GP-01: Điều Khiển Runner

- Nhân vật phải tự động chạy về bên phải.
- Người chơi không điều khiển trái/phải.
- `ArrowUp/W` dùng để nhảy hoặc bay lên khi có cánh.
- `ArrowDown/S` dùng để cúi hoặc hạ độ cao khi bay.
- `Space` dùng để bắn đạn bàn phím khi Kaizen Mode đang kích hoạt.

### FR-GP-02: Map & Phase

- Game phải có 3 map theo thứ tự: Hà Nội, Tokyo, Đà Nẵng.
- Mỗi map phải có các phase: `runner`, `boss_intro`, `boss`, `map_clear`, `game_over`.
- Khi người chơi tới boss gate, game phải lưu checkpoint boss và hiển thị boss intro cutscene.
- Khi boss bị hạ, game chuyển sang map clear cutscene.

### FR-GP-03: Máu & Sát Thương

- Mỗi map bắt đầu với `3` máu.
- Trúng đạn Bug/Boss trừ `1` máu.
- Chạm Bug hoặc Bom trừ `1` máu.
- Rơi xuống Hố sâu đưa máu về `0`.
- Respect Shield chặn sát thương từ đạn, Bug và Bom.
- Respect Shield không chặn Hố sâu.

### FR-GP-04: Checkpoint & Respawn

- Checkpoint đầu map là `map_start`.
- Checkpoint boss được lưu khi vào boss gate.
- Chết trước boss phải respawn tại đầu map với `3` máu.
- Chết trong boss phase phải respawn tại boss checkpoint với `3` máu.
- Boss reset máu khi respawn tại boss checkpoint.
- Mặc định score lượt hiện tại reset về trạng thái checkpoint để leaderboard công bằng.

### FR-GP-05: Bình Kinh Nghiệm

- Bình kinh nghiệm là item thu thập chính.
- Mỗi bình cộng điểm và tăng Kaizen Energy.
- Cụm chuẩn gồm 3 bình theo hình parabol ngược.
- Hitbox thu thập nên rộng hơn sprite khoảng `8px` mỗi chiều để cảm giác nhặt mượt.

### FR-GP-06: Kaizen Energy & Kaizen Mode

- Kaizen Energy tự tăng `5%/giây`.
- Nhặt 1 bình kinh nghiệm tăng `10%`.
- Tiêu diệt 1 Bug tăng `10%`.
- Khi đạt `100%`, Kaizen Mode được kích hoạt.
- Kaizen Mode kéo dài mặc định `8` giây.
- Trong Kaizen Mode, tốc độ chạy tăng `35%`, lực nhảy cao gấp đôi và người chơi bắn được bằng `Space`.
- Khi hết Kaizen Mode, năng lượng reset về `0%`.

### FR-GP-07: Power-Up Respect

- Respect Shield kích hoạt ngay khi nhặt.
- Thời lượng mặc định `10` giây.
- Khi chặn sát thương, shield phải phát hiệu ứng phản hồi.
- Khi sắp hết thời gian, shield nên có hiệu ứng pulse nhẹ.

### FR-GP-08: Power-Up Responsibility

- Responsibility Wings kích hoạt ngay khi nhặt.
- Thời lượng mặc định `10` giây.
- Khi có cánh, `ArrowUp/W` làm người chơi bay lên và `ArrowDown/S` làm người chơi hạ độ cao.
- Trong đoạn bay, game có thể sinh Bom treo dù để người chơi né theo độ cao.

### FR-GP-09: Enemy

- Bug mặt đất gây sát thương khi chạm nếu không có shield.
- Bug mặt đất chỉ bị tiêu diệt bằng stomp từ trên xuống.
- Bug bay bắn đạn về phía người chơi.
- Bug bay gây sát thương khi chạm hoặc khi đạn trúng người chơi.
- Bug bay chỉ bị tiêu diệt bằng đạn bàn phím trong Kaizen Mode.

### FR-GP-10: Boss

- Boss là phase 2 của mỗi map.
- Boss chạy cùng tốc độ người chơi ở phía trước màn hình.
- Boss bắn đạn theo nhiều quỹ đạo: thẳng ngang, parabol thấp, chùm hình quạt, đạn rơi có marker cảnh báo.
- Người chơi gây sát thương boss bằng đạn "Tab"/"Enter" trong Kaizen Mode.
- Khi boss hết máu, map kết thúc và chuyển sang cutscene kết quả.

---

## 5. Thông Số Gameplay Mặc Định

```typescript
const RUNNER_PHYSICS = {
    gravity: 0.55,
    baseSpeed: 5.5,
    hanoiSpeed: 5.5,
    tokyoSpeed: 6.5,
    danangSpeed: 7.5,
    jumpForce: -12,
    kaizenJumpForce: -24,
    maxFallSpeed: 14,
    crouchHeightRatio: 0.55,
    flightLift: -0.45,
    flightMaxVy: -5,
    flightFallControl: 0.35
};
```

```typescript
const SCORE_RULES = {
    experienceFlask: 50,
    groundBugDefeated: 150,
    flyingBugDefeated: 200,
    bossDefeated: 2000,
    mapClearBonus: 1000,
    remainingHeartBonus: 300
};
```

---

## 6. Scoring & Leaderboard

### FR-SC-01: Tính Điểm Map

```text
Map Score =
    (Bình kinh nghiệm x 50)
  + (Bug mặt đất x 150)
  + (Bug bay x 200)
  + (Boss x 2000)
  + Map Clear Bonus
  + (Máu còn lại x 300)
```

### FR-SC-02: Tổng Hành Trình

- `journey_score` là tổng best score của 3 map.
- Leaderboard phải hỗ trợ bảng Hà Nội, Tokyo, Đà Nẵng và tổng hành trình.
- Leaderboard phải hỗ trợ lọc cá nhân/phòng ban.

---

## 7. Kiến Trúc Ứng Dụng

### 7.1. Cấu Trúc Thư Mục Mã Nguồn Đề Xuất

```text
/src
  app/
    layout.tsx
    page.tsx
    login/page.tsx
    game/page.tsx
    leaderboard/page.tsx
    admin/page.tsx
  components/
    GameCanvas.tsx
    Hud.tsx
    CutsceneOverlay.tsx
    Navbar.tsx
    LeaderboardTable.tsx
  game/
    engine/
      GameLoop.ts
      InputManager.ts
      Collision.ts
      AudioManager.ts
      SceneManager.ts
    entities/
      Player.ts
      Enemy.ts
      Boss.ts
      Projectile.ts
      Collectible.ts
      Obstacle.ts
    maps/
      hanoi.ts
      tokyo.ts
      danang.ts
    scoring.ts
  lib/
    supabase.ts
    utils.ts
  styles/
    globals.css
```

### 7.2. Canvas Runtime

- Canvas phải chạy trong Client Component có `"use client"`.
- Update và render phải tách biệt:
  - `update(delta)` xử lý physics, input, collision, scoring, checkpoint, boss AI.
  - `draw(ctx)` xử lý background, entity, HUD, effect và cutscene overlay nếu render bằng Canvas.
- Game loop dùng `requestAnimationFrame`.
- `delta` phải được clamp để tránh nhảy trạng thái khi tab bị treo.
- Component phải cleanup event listener, animation frame, timer và audio khi unmount.

---

## 8. Game State & Entity Model

```typescript
type MapKey = "hanoi" | "tokyo" | "danang";
type GamePhase = "runner" | "boss_intro" | "boss" | "map_clear" | "game_over";

interface GameState {
    mapKey: MapKey;
    phase: GamePhase;
    scrollX: number;
    score: number;
    hearts: number;
    checkpoint: "map_start" | "boss";
    kaizenEnergy: number;
    elapsedSeconds: number;
    collectedFlasks: number;
    defeatedGroundBugs: number;
    defeatedFlyingBugs: number;
    defeatedBosses: number;
}
```

```typescript
interface Player {
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    previousBottom: number;
    onGround: boolean;
    isCrouching: boolean;
    hasShield: boolean;
    isFlying: boolean;
    isKaizenMode: boolean;
    shieldUntil: number;
    wingsUntil: number;
    kaizenUntil: number;
    shootCooldown: number;
}
```

```typescript
type EnemyKind = "ground_bug" | "flying_bug";
type ObstacleKind = "pit" | "bomb";
type CollectibleKind = "experience_flask" | "respect" | "responsibility";

interface Entity {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    isActive: boolean;
    update?(delta: number): void;
    draw?(ctx: CanvasRenderingContext2D): void;
}
```

---

## 9. Collision Rules

### 9.1. AABB Collision

```typescript
function checkCollision(a: Entity, b: Entity): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}
```

### 9.2. Stomp Rule

```typescript
function isStomp(player: Player, bug: Entity): boolean {
    return player.vy > 0 && player.previousBottom <= bug.y + 6;
}
```

---

## 10. Supabase Requirements

### FR-BE-01: Auth

- Người chơi đăng nhập bằng Google SSO.
- OAuth query params nên gửi `hd: "vti.com.vn"`.
- Sau callback, hệ thống phải kiểm tra email kết thúc bằng `@vti.com.vn`.
- Nếu email không hợp lệ, hệ thống hủy session và redirect về Login với thông báo: `Vui lòng sử dụng email VTI để đăng nhập`.

### FR-BE-02: Database Schema

```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    department TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

```sql
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

CREATE INDEX map_runs_map_score_idx ON map_runs(map_key, score DESC, completion_time ASC);
CREATE INDEX map_runs_user_map_idx ON map_runs(user_id, map_key, score DESC);
```

```sql
CREATE TABLE journey_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    total_score INTEGER DEFAULT 0 NOT NULL,
    hanoi_best_score INTEGER DEFAULT 0 NOT NULL,
    tokyo_best_score INTEGER DEFAULT 0 NOT NULL,
    danang_best_score INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX journey_scores_total_idx ON journey_scores(total_score DESC);
```

```sql
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
```

---

## 11. CMS Requirements

Admin phải chỉnh được:

- Scoring: điểm bình kinh nghiệm, Bug mặt đất, Bug bay, Boss, clear bonus, máu còn lại.
- Difficulty: tốc độ map, mật độ Hố sâu/Bom, tần suất Bug, máu Boss, pattern đạn Boss.
- Power-ups: thời lượng Respect/Responsibility, tốc độ bay, thời lượng Kaizen, cooldown bắn.
- Cutscene: title, nội dung, ảnh boss, ảnh kết thúc map, thời lượng hiển thị.
- Audio: file nhạc nền runner/boss và SFX theo map.
- Cultural message: thông điệp văn hóa hiển thị khi clear map hoặc nhặt power-up.

---

## 12. Audio Requirements

```typescript
interface AudioConfig {
    runnerBgm: string;
    bossBgm: string;
    sfx: {
        flask: string;
        shield: string;
        wings: string;
        kaizenReady: string;
        shootTabEnter: string;
        bugDefeat: string;
        damage: string;
        bossIntro: string;
        bossHit: string;
        bossDefeat: string;
        pitFall: string;
    };
}
```

- Preload audio theo map hiện tại và map kế tiếp.
- Crossfade từ runner BGM sang boss BGM tại boss gate.
- Ducking nhẹ BGM khi boss intro/cutscene voice hoặc SFX quan trọng phát.
- Tắt toàn bộ audio trong cleanup của GameCanvas.

---

## 13. Non-Functional Requirements

- Gameplay loop phải ổn định trên trình duyệt desktop phổ biến.
- Canvas render phải giữ readability ở tốc độ cao.
- Các module scoring, collision và checkpoint phải test được độc lập.
- Entity ngoài viewport phải được giới hạn hoặc recycle để bảo vệ hiệu năng.
- Không dùng Phaser/Pixi/physics engine trừ khi dự án đổi quyết định.
- Code TypeScript phải có type rõ ràng.
- Không trộn gameplay engine lớn vào React component.

---

## 14. Testing Checklist

- Nhân vật luôn tự chạy đúng tốc độ map và camera cuộn ổn định.
- `ArrowUp/W`, `ArrowDown/S`, `Space` hoạt động đúng từng trạng thái.
- Cụm 3 bình kinh nghiệm parabol ngược có thể nhặt đủ bằng một cú nhảy chuẩn.
- Respect Shield chặn đạn/Bug/Bom nhưng không chặn Hố sâu.
- Responsibility Wings bay được trong 10 giây và xử lý Bom dù đúng hitbox.
- Kaizen Energy tăng `5%/giây`, `10%/bình`, `10%/Bug`; đầy thì bật Kaizen Mode.
- Bug mặt đất chỉ chết khi bị stomp; Bug bay chỉ chết bởi đạn bàn phím.
- Boss phase lưu checkpoint, chết ở boss respawn tại boss, boss reset đúng.
- Score map và journey leaderboard khớp công thức.
- Google SSO từ chối email ngoài `@vti.com.vn`.
- Audio chuyển runner/boss đúng map và cleanup khi rời trang.
