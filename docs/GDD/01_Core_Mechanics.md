# TÀI LIỆU CHI TIẾT: CƠ CHẾ GAMEPLAY (CORE MECHANICS)
**Dự án:** VTI 9-Year Adventure - Kaizen Journey | **Đội thi:** Kaizen Delivery Squad

---

Tài liệu này đặc tả gameplay phiên bản **endless runner theo chặng**. Nhân vật luôn chạy về bên phải, người chơi tập trung vào phản xạ lên/xuống, căn thời điểm nhảy, cúi, bay, né đạn, thu thập bình kinh nghiệm và sử dụng Kaizen Mode để tiêu diệt Bug/Boss.

---

## 1. VÒNG LẶP ENDLESS RUN & ĐIỀU KHIỂN

### A. Nguyên tắc di chuyển
*   Nhân vật luôn tự động chạy về phía bên phải của map.
*   Camera cuộn theo nhân vật; người chơi không điều khiển trái/phải.
*   Mỗi map là một chặng runner có độ dài thiết kế trước, sau đó chuyển vào phase boss.
*   Tốc độ nền tăng theo map và có thể tăng tạm thời trong Kaizen Mode.

### B. Phím điều khiển
*   **Nhảy / Bay lên:** `ArrowUp` hoặc `W`.
*   **Cúi / Hạ độ cao khi bay:** `ArrowDown` hoặc `S`.
*   **Bắn đạn bàn phím:** `Space` (chỉ khi Kaizen Mode đang kích hoạt).

### C. Hằng số vật lý đề xuất
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

### D. Update loop mẫu
```typescript
function updateRunner(delta: number) {
    const speedMultiplier = player.isKaizenMode ? 1.35 : 1;
    world.scrollX += currentMap.baseSpeed * speedMultiplier * delta;

    if (keys.up) {
        if (player.isFlying) {
            player.vy = Math.max(player.vy + RUNNER_PHYSICS.flightLift, RUNNER_PHYSICS.flightMaxVy);
        } else if (player.onGround) {
            player.vy = player.isKaizenMode ? RUNNER_PHYSICS.kaizenJumpForce : RUNNER_PHYSICS.jumpForce;
            player.onGround = false;
        }
    }

    player.isCrouching = keys.down && player.onGround;
    if (keys.down && player.isFlying) {
        player.vy += RUNNER_PHYSICS.flightFallControl;
    }

    player.vy = Math.min(player.vy + RUNNER_PHYSICS.gravity, RUNNER_PHYSICS.maxFallSpeed);
    player.y += player.vy * delta;
}
```

---

## 2. MÁU, SÁT THƯƠNG & CHECKPOINT

### A. Máu theo map
*   Mỗi map bắt đầu với `3` máu.
*   Trúng đạn từ Bug/Boss: `-1` máu.
*   Chạm Bug mặt đất, Bug bay hoặc Bom: `-1` máu.
*   Rơi xuống Hố sâu: hết toàn bộ máu ngay lập tức.
*   Khi hết máu, người chơi chơi lại từ checkpoint gần nhất.

### B. Checkpoint
*   Đầu map là checkpoint mặc định.
*   Khi bước vào phase boss, game tự động đánh dấu checkpoint boss.
*   Nếu chết trong phase boss, người chơi bắt đầu lại tại checkpoint boss thay vì đầu map.
*   Khi checkpoint boss được kích hoạt, hiển thị cutscene ngắn gồm hình boss, tên boss và lời cảnh báo theo chủ đề map.

### C. Respect Shield
*   Power-up Respect kích hoạt ngay khi nhặt và tồn tại trong `10` giây.
*   Khi shield còn hiệu lực, sát thương từ đạn, Bug hoặc Bom bị chặn trong toàn bộ thời lượng hiệu ứng.
*   Shield không cứu người chơi khỏi Hố sâu.
*   Khi chặn sát thương, shield phát hiệu ứng pulse/flash để người chơi nhận biết nhưng không bị trừ máu.

---

## 3. HỆ THỐNG ĐIỂM & LEADERBOARD

Điểm là căn cứ xếp hạng người chơi ở từng map và tổng hành trình.

### A. Nguồn điểm
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

### B. Công thức điểm map
```text
Map Score =
    (Bình kinh nghiệm x 50)
  + (Bug mặt đất x 150)
  + (Bug bay x 200)
  + (Boss x 2000)
  + Map Clear Bonus
  + (Máu còn lại x 300)
```

### C. Tổng hành trình
*   `journey_score` là tổng điểm tốt nhất của 3 map Hà Nội, Tokyo và Đà Nẵng.
*   Leaderboard hiển thị:
    *   Bảng từng map.
    *   Bảng tổng hành trình.
    *   Bộ lọc cá nhân/phòng ban.

---

## 4. BÌNH KINH NGHIỆM & NỘI NĂNG KAIZEN

### A. Bình kinh nghiệm
*   Bình kinh nghiệm là item thu thập chính trong runner phase.
*   Mỗi bình cho điểm và tăng nội năng Kaizen.
*   Bình có hitbox rộng hơn sprite khoảng `8px` mỗi chiều để cảm giác thu thập mượt hơn.

### B. Pattern 3 bình theo parabol ngược
Ba bình được đặt gần nhau theo quỹ đạo parabol ngược để người chơi nhặt đủ nếu nhảy đúng nhịp.

```typescript
function createExperienceArc(startX: number, groundY: number) {
    return [
        { x: startX, y: groundY - 70 },
        { x: startX + 48, y: groundY - 120 },
        { x: startX + 96, y: groundY - 70 }
    ];
}
```

### C. Tăng nội năng Kaizen
*   Tự tăng theo thời gian chạy: `+5% / giây`.
*   Nhặt 1 bình kinh nghiệm: `+10%`.
*   Tiêu diệt 1 Bug: `+10%`.
*   Nội năng tối đa là `100%`.

---

## 5. POWER-UPS

### A. Respect - Khiên Tôn trọng
*   Kích hoạt ngay khi nhặt.
*   Thời lượng: `10` giây.
*   Bảo vệ khỏi đạn, Bug và Bom.
*   Hiệu ứng hình ảnh: vòng khiên xanh lục/vàng nhạt, có pulse nhẹ khi sắp hết thời gian.

### B. Responsibility - Cánh Trách nhiệm
*   Thay đổi từ bắn đạn sang **lắp thêm cánh**.
*   Kích hoạt ngay khi nhặt.
*   Thời lượng: `10` giây.
*   Khi có cánh, người chơi dùng `ArrowUp/W` để bay lên và `ArrowDown/S` để hạ độ cao.
*   Trong đoạn bay sẽ xuất hiện **Bom treo dù trên không**. Người chơi phải điều chỉnh độ cao, thường là bay cao vượt qua Bom hoặc hạ độ cao theo pattern map.
*   Hiệu ứng hình ảnh: cánh công nghệ phát sáng, vệt gió theo sau Mascot.

### C. Kaizen - Nội năng & Bàn phím
*   Kaizen là power-up dạng tích nội năng, không phải item kích hoạt tức thời.
*   Khi nội năng đạt `100%`, Kaizen Mode kích hoạt.
*   Hiệu ứng:
    *   Tốc độ chạy tăng thêm `35%`.
    *   Nhảy cao gấp đôi.
    *   Mascot được trang bị một chiếc bàn phím công nghệ.
    *   Nhấn `Space` để bắn đạn chữ **Tab** và **Enter**.
*   Đạn bàn phím dùng để:
    *   Tiêu diệt Bug bay.
    *   Gây sát thương Boss.
*   Kaizen Mode đề xuất kéo dài `8` giây, sau đó nội năng reset về `0%`.

```typescript
function fireKeyboardProjectile() {
    if (!player.isKaizenMode || player.shootCooldown > 0) return;

    projectiles.push({
        x: player.x + player.width,
        y: player.y + player.height * 0.45,
        vx: 12,
        vy: 0,
        width: 34,
        height: 18,
        label: Math.random() > 0.5 ? "Tab" : "Enter"
    });

    player.shootCooldown = 180;
}
```

---

## 6. ENEMY: BUG & BOSS

### A. Bug mặt đất
*   Đứng hoặc di chuyển trên nền đất.
*   Chạm trực tiếp gây `-1` máu nếu không có Respect Shield.
*   Chỉ có thể tiêu diệt bằng cách nhảy lên đầu.

```typescript
function isStomp(player: Player, bug: Enemy) {
    return player.vy > 0 && player.previousBottom <= bug.y + 6;
}
```

### B. Bug bay
*   Bay trên không trung.
*   Bắn đạn về phía nhân vật; trúng đạn gây `-1` máu nếu không có Respect Shield.
*   Chạm trực tiếp cũng gây `-1` máu.
*   Chỉ có thể tiêu diệt bằng đạn bàn phím trong Kaizen Mode.

### C. Boss
*   Boss là phase 2 của mỗi map.
*   Boss luôn chạy cùng tốc độ với người chơi ở phía trước màn hình.
*   Boss bắn đạn theo nhiều quỹ đạo:
    *   Đạn thẳng ngang.
    *   Đạn parabol thấp.
    *   Đạn chùm tỏa hình quạt.
    *   Đạn rơi từ trên xuống theo marker cảnh báo.
*   Người chơi né đạn bằng nhảy, cúi, bay và dùng Respect/Responsibility đúng thời điểm.
*   Người chơi gây sát thương Boss bằng đạn "Tab"/"Enter" khi có Kaizen Mode.
*   Khi Boss hết máu, map kết thúc và chuyển sang cutscene kết quả.

---

## 7. CHƯỚNG NGẠI VẬT

### A. Hố sâu
*   Xuất hiện trên mặt đất.
*   Người chơi phải nhảy qua.
*   Rơi xuống Hố sâu khiến máu về `0` ngay lập tức.
*   Hố sâu cần có telegraph rõ ràng: mép nứt, biển cảnh báo hoặc hiệu ứng gió hút.

### B. Bom
*   Khi chạy dưới đất, Bom treo thấp yêu cầu người chơi cúi xuống để vượt qua.
*   Trong đoạn Responsibility Flight, Bom treo dù xuất hiện trên không trung; người chơi phải điều chỉnh độ cao để vượt qua pattern.
*   Chạm Bom gây `-1` máu nếu không có Respect Shield.

---

## 8. CUTSCENE & CHUYỂN MAP

### A. Cutscene checkpoint boss
*   Kích hoạt khi người chơi tới boss gate.
*   Nội dung gồm ảnh boss, tên boss, thông điệp thử thách và thanh máu boss xuất hiện.
*   Sau cutscene, checkpoint boss được lưu.

### B. Cutscene sau khi vượt map
*   Mô tả hành trình vừa vượt qua gắn với lịch sử hình thành và phát triển của VTI.
*   Tóm tắt điểm map: bình kinh nghiệm, Bug, Boss, máu còn lại, tổng điểm.
*   Mở đầu cho map tiếp theo bằng một cảnh chuyển vùng ngắn.

---

## 9. ÂM THANH & NHẠC NỀN

### A. Sound effects bắt buộc
*   Nhặt bình kinh nghiệm.
*   Kích hoạt Respect Shield.
*   Kích hoạt Responsibility Wings.
*   Kaizen Energy đầy.
*   Bắn đạn "Tab"/"Enter".
*   Bug bị tiêu diệt.
*   Nhân vật mất máu.
*   Boss xuất hiện, boss trúng đạn, boss bị tiêu diệt.
*   Rơi xuống Hố sâu.

### B. Mapping nhạc nền theo map
*   **Hà Nội:** Nhạc nền ấm, tiết tấu vừa, pha nhạc cụ truyền thống nhẹ và synth hiện đại.
*   **Tokyo:** Nhạc nền điện tử hiện đại, tốc độ vừa-cao, nhiều lớp synth và motif hoa anh đào số hóa.
*   **Đà Nẵng:** Nhạc nền sáng, nhanh nhất, có màu biển, nhịp percussion năng động và năng lượng boss phase mạnh nhất.
*   **Boss phase:** Mỗi map chuyển sang layer boss remix của cùng chủ đề để giữ liên kết âm nhạc.
