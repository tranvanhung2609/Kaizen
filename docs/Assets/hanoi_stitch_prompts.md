# PROMPT PACK STITCH - MAP HÀ NỘI

File này dùng để chạy Stitch MCP theo từng batch. Sau khi Stitch sinh ảnh, export/lưu vào đúng đường dẫn trong [hanoi_asset_manifest.md](./hanoi_asset_manifest.md).

## Cách Dùng Với MCP Trong VS Code

1. Mở VS Code Chat/Codex Chat có Stitch MCP đã kết nối.
2. Copy từng prompt bên dưới.
3. Sau khi Stitch trả kết quả, tải/export ảnh ra đúng file path được yêu cầu.
4. Kiểm tra nhanh:
   - Sprite gameplay có nền trong suốt.
   - Dáng nhận diện rõ ở `32px`, `48px`, `64px`.
   - Frame trong sprite sheet cùng kích thước và cùng điểm neo.
   - Tên file đúng manifest.

Nếu MCP client của bạn có tool lưu file trực tiếp vào workspace, thêm câu này vào cuối prompt:

```text
Export the generated image files directly into the requested workspace paths. If direct export is not supported, return downloadable PNG files named exactly as requested.
```

---

## 1. Background Hà Nội

```text
Use Stitch MCP to generate 5 image assets for the Hanoi map of "VTI 9-Year Adventure - Kaizen Journey".

Overall style:
Premium semi-flat 2D endless runner game art, bright and readable, local Hanoi culture plus modern VTI technology, clean shapes, controlled soft tech glow, family-friendly, no dark cyberpunk, no clutter, no stock-photo realism.

Gameplay requirement:
Background layers must not compete with foreground gameplay sprites. Keep contrast controlled and leave the running lane readable.

Generate these files:

1. public/assets/game/backgrounds/hanoi/hanoi_far_background.png
Content: Hoan Kiem Lake, Turtle Tower, The Huc Bridge, willow trees, warm sunset reflection on the lake.
Role: far parallax background.

2. public/assets/game/backgrounds/hanoi/hanoi_midground.png
Content: Hanoi Old Quarter, Hanoi Flag Tower, a VTI Hanoi office building with a subtle glowing VTI logo.
Role: midground parallax layer.

3. public/assets/game/backgrounds/hanoi/hanoi_foreground.png
Content: small flower bushes, street tea chair, VTI 9-year signpost, tasteful Hanoi street details.
Role: decorative foreground layer near the ground.

4. public/assets/game/backgrounds/hanoi/hanoi_ground_tiles.png
Content: gray old brick road tiles for a side-scrolling runner.
Role: horizontally tileable running ground, clear top edge, no distracting detail.

5. public/assets/game/backgrounds/hanoi/hanoi_boss_arena_background.png
Content: Hanoi Old Quarter transformed into a boss arena, warm orange/yellow Hanoi palette, subtle red warning lights, clock/deadline motifs.
Role: boss phase background for Boss Deadline Co Pho.

Export PNG files with the exact names and paths above.
```

---

## 2. Mascot Hà Nội

```text
Use Stitch MCP to generate a compact sprite sheet for the Hanoi mascot of "VTI 9-Year Adventure - Kaizen Journey".

Output file:
public/assets/game/mascot/hanoi_mascot_sheet.png

Character:
VTI mascot wearing a modernized red ao dai with gold trim, sporty shoes, and a lightweight tech headset.

Sprite sheet requirements:
- Transparent background.
- Side-view or slight 3/4 side-view for a 2D runner.
- Consistent character size across all frames.
- Stable centered pivot point.
- Crisp outline, readable at small size.
- Premium semi-flat 2D game style, clean vector-like silhouette, soft tech glow.
- Avoid dark cyberpunk, horror, excessive particles, tiny decorative details.

Frames/states:
1. idle standing
2. run cycle frame 1
3. run cycle frame 2
4. run cycle frame 3
5. run cycle frame 4
6. run cycle frame 5
7. run cycle frame 6
8. jump
9. fall
10. crouch
11. flying with Responsibility Wings attached
12. hit reaction
13. Kaizen power mode with keyboard energy

Export as one PNG sprite sheet named exactly:
public/assets/game/mascot/hanoi_mascot_sheet.png
```

---

## 3. Vật Phẩm & Vật Phẩm Hỗ Trợ

```text
Use Stitch MCP to generate 6 transparent PNG assets for the Hanoi map of "VTI 9-Year Adventure - Kaizen Journey".

Style:
Premium semi-flat 2D runner game asset, clean vector-like silhouette, readable at 32px/48px/64px, crisp outline, soft tech glow, transparent background, high contrast, no clutter.

Hanoi motif:
Hoan Kiem Lake waves, The Huc Bridge, lotus, old quarter, red VTI accent, warm yellow/cyan highlights.

Generate these files:

1. public/assets/game/items/hanoi_experience_flask.png
Asset: Experience flask.
Visual: small glass flask with Hoan Kiem wave motif, red VTI cap, glowing golden core.
State: idle glow.

2. public/assets/game/items/hanoi_experience_flask_collect.png
Asset: collect burst effect for the experience flask.
Visual: small golden/cyan burst, clean particles, not too dense.

3. public/assets/game/items/hanoi_respect_shield_sheet.png
Asset: Respect Shield sprite sheet.
States: idle icon, active loop, block flash, expiring pulse.
Visual: lotus and The Huc Bridge shield, gentle green glow, light gold accent.

4. public/assets/game/items/hanoi_responsibility_wings_sheet.png
Asset: Responsibility Wings sprite sheet.
States: idle icon, attached wings, flight trail, expiring pulse.
Visual: tech wings with bamboo rib motif, blue rim light.

5. public/assets/game/items/hanoi_kaizen_keyboard_sheet.png
Asset: Kaizen Keyboard sprite sheet.
States: equipped keyboard, muzzle flash / shoot flash.
Visual: compact keyboard with red/gold keycaps, bright tech energy.

6. public/assets/game/items/hanoi_keyboard_projectiles_sheet.png
Asset: keyboard projectiles sprite sheet.
States: "Tab" projectile, "Enter" projectile.
Visual: readable keycap text, soft glowing trail, small but clear.

Export PNG files with the exact names and paths above.
```

---

## 4. Kẻ Địch & Đạn Kẻ Địch

```text
Use Stitch MCP to generate 3 transparent PNG assets for Hanoi enemies in "VTI 9-Year Adventure - Kaizen Journey".

Style:
Premium semi-flat 2D runner enemy asset, readable at small size, crisp outline, clear gameplay silhouette, soft tech glow, family-friendly, no horror, no dark cyberpunk.

Generate these files:

1. public/assets/game/enemies/hanoi_ground_bug_sheet.png
Enemy: Bug Tac Duong, ground bug.
Theme: Hanoi traffic jam / work blockage.
States: idle, crawl frame 1, crawl frame 2, crawl frame 3, crawl frame 4, stomped.
Gameplay readability: low body, large hitbox, clearly readable head/top area for stomp.

2. public/assets/game/enemies/hanoi_flying_bug_sheet.png
Enemy: Bug Tri Hoan, flying delay bug.
Theme: delay / deadline / clock glitch.
States: hover frame 1, hover frame 2, hover frame 3, hover frame 4, shoot, defeated.
Gameplay readability: flying silhouette, clear shooting direction.

3. public/assets/game/enemies/hanoi_flying_bug_projectile.png
Projectile: slow straight clock-glitch bullet.
Visual: small broken clock or deadline icon, red/orange warning accent, clear direction.

Export PNG files with the exact names and paths above.
```

---

## 5. Chướng Ngại Hà Nội

```text
Use Stitch MCP to generate 3 transparent PNG obstacle assets for the Hanoi map of "VTI 9-Year Adventure - Kaizen Journey".

Style:
Premium semi-flat 2D runner obstacle, clear hazard color, readable at high speed, crisp outline, not confused with reward items, transparent background.

Generate these files:

1. public/assets/game/obstacles/hanoi_pit.png
Obstacle: open pit on old gray brick road.
Visual: cracked brick edge, dark depth, clear top edge, subtle wind/dust.

2. public/assets/game/obstacles/hanoi_pit_warning.png
Obstacle warning marker.
Visual: early cracked edge, dust, small warning sign, readable but not too large.

3. public/assets/game/obstacles/hanoi_bomb_low_sheet.png
Obstacle: low hanging bomb / construction barrier inspired by Hanoi old street.
States: idle, warning flash.
Gameplay: player must crouch to pass under it.
Visual: red/orange warning accent, metal/cloth construction motif, family-friendly.

Export PNG files with the exact names and paths above.
```

---

## 6. Boss Deadline Cổ Phố

```text
Use Stitch MCP to generate 3 PNG assets for Hanoi boss "Boss Deadline Co Pho" in "VTI 9-Year Adventure - Kaizen Journey".

Style:
Premium semi-flat 2D boss art, dramatic but family-friendly, clean edges, controlled glow, strong silhouette, Hanoi Old Quarter + deadline clock motif, no dark cyberpunk, no horror.

Generate these files:

1. public/assets/game/bosses/hanoi_deadline_boss_intro.png
Asset: boss intro artwork.
Composition: giant clock machine covered with deadline sticky notes, jammed gears, blinking red lights, old quarter details, centered boss, space for title text overlay.

2. public/assets/game/bosses/hanoi_deadline_boss_sheet.png
Asset: gameplay boss sprite sheet.
States: idle, moving/running, straight shot attack, low parabolic shot attack, red marker summon, hit reaction, defeated.
Gameplay readability: large silhouette, clear attack pose, visible weak/hit state.

3. public/assets/game/bosses/hanoi_deadline_boss_projectiles_sheet.png
Asset: boss projectile sprite sheet.
States: straight bullet, low parabolic bullet, red warning marker, falling warning bullet.
Visual: deadline clock / red marker motif, clear hazard color, not confused with player projectiles.

Export PNG files with the exact names and paths above.
```

---

## 7. Cảnh Chuyển Hà Nội

```text
Use Stitch MCP to generate 4 cutscene images for the Hanoi map of "VTI 9-Year Adventure - Kaizen Journey".

Style:
Premium semi-flat 2D cutscene illustration, bright Hanoi cultural identity, VTI technology accents, clean composition, readable title-safe space, no dark cyberpunk.

Generate these files:

1. public/assets/game/cutscenes/hanoi_opening.png
Scene: VTI mascot standing near Hoan Kiem Lake and VTI Hanoi office, ready to start running.
Purpose: Hanoi opening.

2. public/assets/game/cutscenes/hanoi_boss_intro.png
Scene: Boss Deadline Co Pho appears in the Old Quarter, giant clock machine, sticky notes, jammed gears, red warning lights.
Purpose: boss intro, leave room for boss name and dialogue.

3. public/assets/game/cutscenes/hanoi_clear.png
Scene: mascot has crossed the Old Quarter, warm victory tone, Respect value, VTI 9-year celebration.
Purpose: map clear.

4. public/assets/game/cutscenes/hanoi_to_tokyo_transition.png
Scene: mascot boards an international flight from Hanoi toward Tokyo; skyline gradually shifts to sakura and LED signs.
Purpose: transition to Tokyo map.

Export PNG files with the exact names and paths above.
```

---

## 8. HUD Hà Nội

```text
Use Stitch MCP to generate 5 transparent PNG HUD icons for "VTI 9-Year Adventure - Kaizen Journey".

Style:
Small clean 2D HUD icon, readable at 24px/32px/48px, crisp outline, slight tech glow, transparent background, consistent visual language.

Generate these files:

1. public/assets/game/hud/hanoi_heart_icon.png
Icon: player heart / health.

2. public/assets/game/hud/hanoi_score_icon.png
Icon: score, inspired by experience flask or tech star.

3. public/assets/game/hud/hanoi_kaizen_energy_icon.png
Icon: Kaizen Energy, glowing improvement/keyboard energy motif.

4. public/assets/game/hud/hanoi_respect_timer_icon.png
Icon: Respect Shield timer, mini lotus shield.

5. public/assets/game/hud/hanoi_responsibility_timer_icon.png
Icon: Responsibility Wings timer, mini bamboo-tech wings.

Export PNG files with the exact names and paths above.
```

