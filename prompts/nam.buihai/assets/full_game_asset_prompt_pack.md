# FULL GAME ASSET PROMPT PACK - VTI 9-YEAR ADVENTURE: KAIZEN JOURNEY

File này là prompt pack tổng hợp để dùng AI/Stitch gen lại toàn bộ asset hình ảnh của game, bao gồm 3 map: Hà Nội, Tokyo, Đà Nẵng.

Mục tiêu không chỉ là tạo ảnh đẹp, mà là tạo asset dùng được trong game 2D side-scrolling runner: dễ đọc ở tốc độ cao, đúng phong cách VTI, đúng kích thước kỹ thuật, đúng frame grid, đúng đường dẫn lưu file.

---

## 1. Cách Dùng

Copy từng prompt batch bên dưới vào công cụ AI gen ảnh. Sau khi gen xong, export PNG theo đúng đường dẫn được ghi trong từng prompt.

Nếu công cụ hỗ trợ xuất trực tiếp vào workspace, thêm câu này vào cuối prompt:

```text
Export the generated image files directly into the requested workspace paths. If direct export is not supported, return downloadable PNG files named exactly as requested.
```

Nếu công cụ không hỗ trợ nền trong suốt ổn định, sinh sprite trên nền trắng phẳng hoặc xanh chroma phẳng, sau đó tách alpha thủ công. Tuy nhiên lựa chọn ưu tiên vẫn là transparent PNG.

---

## 2. Master Art Direction

Tất cả asset phải bám phong cách sau:

```text
Premium semi-flat 2D runner game art, clean vector-like shapes, crisp readable silhouette, subtle sharp outline, smooth soft gradients, controlled technology glow, bright optimistic VTI energy, family-friendly, side-view or slight 3/4 side-view for gameplay assets, readable at high speed on a 960x540 canvas.
```

Tránh tuyệt đối:

```text
No photorealism, no stock-photo look, no dark heavy cyberpunk, no horror, no blood, no gritty texture, no noisy particle clutter, no tiny unreadable decorative details, no blurry outline, no inconsistent sprite frame size, no cropped limbs, no busy background behind transparent sprites, no small text except large readable "Tab" and "Enter" key projectiles.
```

Quy chuẩn gameplay readability:

- Item và enemy phải đọc rõ khi render ở `20px`, `24px`, `32px`, `48px`, `64px`.
- Hazard như pit, bomb, projectile boss phải có tín hiệu đỏ/cam/tối rõ, không giống item thưởng.
- Background phải có bản sắc địa phương nhưng không tranh tương phản với lane gameplay; mỗi map chỉ dùng một background duy nhất được gộp từ các lớp nền cũ.
- Frame trong cùng sprite sheet phải cùng kích thước cell, cùng baseline, cùng pivot.
- Sprite gameplay rời phải có nền trong suốt.

---

## 3. Technical Resolution Spec

Runtime hiện tại dùng Phaser/Canvas với target canvas `960x540`.

| Nhóm asset | Output đề xuất | Ghi chú |
| --- | --- | --- |
| Merged map background | `1920x1080 PNG` hoặc `2048x1024 PNG` | Một background duy nhất gộp từ far layer, mid layer và background/foreground cũ |
| Cutscene | `1920x1080 PNG` | Chừa title-safe area cho UI overlay |
| Ground tiles | `512x286 PNG` hoặc `512x320 PNG` | Seamless ngang, mép trên rõ |
| Mascot sprite sheet | `1024x1024 PNG`, cell `170x204` | Theo runtime hiện tại |
| Enemy sprite sheet | `1024x1024 PNG`, cell `48x48` | Theo runtime hiện tại |
| Powerup/obstacle sheet | `1024x1024 PNG`, cell `512x512` | Render nhỏ trong game, silhouette phải cực rõ |
| Boss sprite sheet | `1024x1024 PNG`, cell `192x192` | Theo runtime hiện tại |
| Single item/projectile/icon | `256x256` hoặc `512x512 PNG` | Render xuống `12px-32px` vẫn rõ |

Lưu ý tích hợp code:

- Code hiện tại vẫn load một số asset cũ từ `public/assets/sprites/...`.
- Prompt pack này chuẩn hóa asset mới trong `public/assets/images/{map}/...`.
- Sau khi gen xong, cần cập nhật `PreloadScene.ts`, `ParallaxSystem.ts`, `SpawnSystem.ts`, `BossSystem.ts` để load asset theo map. Background runtime nên dùng một texture map duy nhất `background.png`, cộng thêm `ground_tiles.png`.

---

## 4. Folder Manifest Chuẩn

Tạo đủ cấu trúc dưới đây cho cả 3 map.

```text
public/assets/images/
  hanoi/
    backgrounds/
      background.png
      ground_tiles.png
    mascot/
      mascot_sheet.png
    items/
      experience_flask.png
      experience_flask_collect.png
      respect_shield_sheet.png
      responsibility_wings_sheet.png
      kaizen_keyboard_sheet.png
      keyboard_projectiles_sheet.png
    obstacles/
      pit.png
      pit_warning.png
      bomb_low_sheet.png
      bomb_parachute_sheet.png
    enemies/
      ground_bug_sheet.png
      flying_bug_sheet.png
      flying_bug_projectile.png
    bosses/
      boss_intro.png
      boss_sheet.png
      boss_projectiles_sheet.png
    cutscenes/
      opening.png
      boss_intro.png
      clear.png
      transition_next.png
    hud/
      heart_icon.png
      score_icon.png
      kaizen_energy_icon.png
      respect_timer_icon.png
      responsibility_timer_icon.png
      hud_icons_sheet.png
  tokyo/
    same structure as hanoi
  danang/
    same structure as hanoi
```

Tên boss chuẩn trong prompt pack:

- Hà Nội: `Boss Deadline Co Pho`
- Tokyo: `Boss Kaizen Breaker`
- Đà Nẵng: `Boss Data Storm Dragon`

---

## 5. Map Identity Blocks

### Hà Nội

```text
Map: Hanoi - Khoi nguon gia tri Ton trong.
Core value: Respect.
Local motifs: Hoan Kiem Lake, Turtle Tower, The Huc Bridge, willow trees, Hanoi Old Quarter brick street, Hanoi Flag Tower, subtle VTI Hanoi office signage.
Palette: warm sunset gold, old-quarter orange, Hoan Kiem green, VTI crimson red, soft cyan technology highlights.
Mood: heritage, respectful, optimistic, the beginning of the VTI journey.
```

### Tokyo

```text
Map: Tokyo - Chinh phuc toan cau bang Kaizen.
Core value: Kaizen.
Local motifs: sakura petals, Mount Fuji silhouette, Shibuya crossing, Tokyo Tower, tech Torii gate, VTI Japan office signage, clean Japanese urban rhythm.
Palette: sakura pink, clean white, rising-sun red, cool technology cyan, controlled Tokyo LED accents.
Mood: disciplined, modern, international, continuous improvement.
```

### Đà Nẵng

```text
Map: Danang - But pha cong nghe bang Trach nhiem.
Core value: Responsibility.
Local motifs: Dragon Bridge, Han River, My Khe beach, Marble Mountains, Sun Wheel, lifebuoy, seashells, VTI Danang office signage.
Palette: ocean cyan, beach sand yellow, sunny orange, clean white, VTI red accents.
Mood: fast, open, energetic, responsible, final-stage breakthrough.
```

---

## 6. Batch 1 - Backgrounds

### 6.1. Hà Nội Backgrounds

```text
Use Stitch MCP to generate 2 PNG background assets for the Hanoi map of "VTI 9-Year Adventure - Kaizen Journey".

Global style:
Premium semi-flat 2D endless runner background, clean vector-like shapes, soft gradients, controlled technology glow, warm Hanoi cultural identity plus modern VTI energy. No photorealism, no dark cyberpunk, no clutter.

Runtime:
Canvas target is 960x540. The map now uses one merged background asset plus a separate tileable ground asset. Generate the merged background as 1920x1080 PNG or 2048x1024 PNG. It must combine the visual roles of the old far layer, mid layer, and background/foreground decorative layer into one coherent side-scrolling image. It must support horizontal seamless looping or a long continuous side-scrolling composition. Keep the lower gameplay lane readable and avoid high-contrast details where characters, items, and hazards appear.

Generate these files:

1. public/assets/images/hanoi/backgrounds/background.png
Asset: merged map background.
Merged source layers: old far background + old midground + old background/foreground decorative layer, combined into a single image.
Content: Hoan Kiem Lake, Turtle Tower, The Huc Bridge, willow trees, warm sunset reflection, Hanoi Old Quarter silhouettes, Hanoi Flag Tower, subtle VTI Hanoi office building with small glowing VTI sign, flower bushes, tea chair, small VTI 9-year signpost, tasteful old-street details.
Composition: one coherent side-scrolling background with far/mid/near depth painted into a single image. No separate parallax layers. No characters, no enemies, no collectibles, no UI text.
Contrast: low-to-medium behind the gameplay lane, enough Hanoi identity, never competing with gameplay sprites.

2. public/assets/images/hanoi/backgrounds/ground_tiles.png
Layer: tileable running ground.
Content: gray old brick road tiles, clean top edge, slight Hoan Kiem green/cyan tech line embedded in the bricks.
Technical: seamless horizontal loop, clear top collision edge, no large decorative bumps.

Export PNG files with the exact names and paths above.
```

### 6.2. Tokyo Backgrounds

```text
Use Stitch MCP to generate 2 PNG background assets for the Tokyo map of "VTI 9-Year Adventure - Kaizen Journey".

Global style:
Premium semi-flat 2D endless runner background, clean vector-like shapes, soft gradients, controlled technology glow, Japanese urban culture plus VTI technology. No photorealism, no dark cyberpunk, no clutter.

Runtime:
Canvas target is 960x540. The map now uses one merged background asset plus a separate tileable ground asset. Generate the merged background as 1920x1080 PNG or 2048x1024 PNG. It must combine the visual roles of the old far layer, mid layer, and background/foreground decorative layer into one coherent side-scrolling image. It must support horizontal seamless looping or a long continuous side-scrolling composition. Keep the lower gameplay lane readable and avoid high-contrast details where characters, items, and hazards appear.

Generate these files:

1. public/assets/images/tokyo/backgrounds/background.png
Asset: merged map background.
Merged source layers: old far background + old midground + old background/foreground decorative layer, combined into a single image.
Content: Mount Fuji silhouette, soft rising sun circle, pale sakura sky, distant Tokyo Tower, Shibuya crossing-inspired city blocks, LED screens with abstract VTI 9-year shapes, VTI Japan office signage, clean tech Torii gate, sakura petals, road markings, temple stone edge, subtle cyan tech strips.
Composition: one coherent side-scrolling background with far/mid/near depth painted into a single image. No separate parallax layers. No characters, no enemies, no collectibles, no UI text.
Contrast: low-to-medium behind the gameplay lane, enough Tokyo identity, never competing with gameplay sprites.

2. public/assets/images/tokyo/backgrounds/ground_tiles.png
Layer: tileable running ground.
Content: clean Shibuya road tiles mixed with shrine stone pattern, thin sakura-pink and cyan tech highlights.
Technical: seamless horizontal loop, clear top collision edge.

Export PNG files with the exact names and paths above.
```

### 6.3. Đà Nẵng Backgrounds

```text
Use Stitch MCP to generate 2 PNG background assets for the Danang map of "VTI 9-Year Adventure - Kaizen Journey".

Global style:
Premium semi-flat 2D endless runner background, clean vector-like shapes, soft gradients, controlled technology glow, bright ocean city identity plus VTI technology. No photorealism, no dark cyberpunk, no clutter.

Runtime:
Canvas target is 960x540. The map now uses one merged background asset plus a separate tileable ground asset. Generate the merged background as 1920x1080 PNG or 2048x1024 PNG. It must combine the visual roles of the old far layer, mid layer, and background/foreground decorative layer into one coherent side-scrolling image. It must support horizontal seamless looping or a long continuous side-scrolling composition. Keep the lower gameplay lane readable and avoid high-contrast details where characters, items, and hazards appear.

Generate these files:

1. public/assets/images/danang/backgrounds/background.png
Asset: merged map background.
Merged source layers: old far background + old midground + old background/foreground decorative layer, combined into a single image.
Content: Dragon Bridge silhouette, Han River, Marble Mountains, bright ocean sky, soft clouds, My Khe beach, Sun Wheel, VTI Danang office signage, modern riverside buildings, subtle tech light lines, beach boardwalk, lifebuoy, seashells, small glowing data buoys.
Composition: one coherent side-scrolling background with far/mid/near depth painted into a single image. No separate parallax layers. No characters, no enemies, no collectibles, no UI text.
Contrast: low-to-medium behind the gameplay lane, enough Danang identity, never competing with gameplay sprites.

2. public/assets/images/danang/backgrounds/ground_tiles.png
Layer: tileable running ground.
Content: beach boardwalk and bridge deck tiles, clean top edge, ocean cyan and sunny orange tech strips.
Technical: seamless horizontal loop, clear top collision edge.

Export PNG files with the exact names and paths above.
```

---

## 7. Batch 2 - Mascot Sprite Sheets

Mascot sheet technical layout:

```text
Output: 1024x1024 transparent PNG sprite sheet.
Frame cell: 170x204 px.
Camera: side-view or slight 3/4 side-view facing right.
Frame consistency: same body height, same foot baseline, centered pivot, no cropped limbs.
Runtime readability: clear silhouette when displayed around 100px tall and still recognizable at 64px.

Required animation layout:
Frames 0-5: idle loop.
Frames 6-11: run cycle.
Frame 12: crouch.
Frames 13-15: jump / airborne.
Frames 20-21: flying with Responsibility Wings.
Frames 24-26: hit reaction.
Optional empty cells can remain transparent.
```

### 7.1. Hà Nội Mascot

```text
Use Stitch MCP to generate one transparent PNG mascot sprite sheet for the Hanoi map of "VTI 9-Year Adventure - Kaizen Journey".

Output file:
public/assets/images/hanoi/mascot/mascot_sheet.png

Technical:
1024x1024 transparent PNG sprite sheet, frame cell 170x204 px, right-facing side-view or slight 3/4 side-view, same character height and foot baseline in every frame.

Character:
VTI mascot wearing a modernized red ao dai with gold trim, sporty shoes, lightweight tech headset, subtle VTI crimson and cyan tech accents.

Required layout:
Frames 0-5 idle loop.
Frames 6-11 run cycle.
Frame 12 crouch.
Frames 13-15 jump / airborne.
Frames 20-21 flying with bamboo-rib Responsibility Wings attached.
Frames 24-26 hit reaction.
Include a Kaizen power visual in optional later cells if space allows: red/cyan keyboard energy aura, not too particle-heavy.

Style:
Premium semi-flat 2D runner character, crisp outline, clean silhouette, soft tech glow, optimistic Hanoi heritage mood.

Avoid:
Tiny costume details, photorealistic fabric, dark cyberpunk, inconsistent frame size, cropped limbs.

Export exactly as:
public/assets/images/hanoi/mascot/mascot_sheet.png
```

### 7.2. Tokyo Mascot

```text
Use Stitch MCP to generate one transparent PNG mascot sprite sheet for the Tokyo map of "VTI 9-Year Adventure - Kaizen Journey".

Output file:
public/assets/images/tokyo/mascot/mascot_sheet.png

Technical:
1024x1024 transparent PNG sprite sheet, frame cell 170x204 px, right-facing side-view or slight 3/4 side-view, same character height and foot baseline in every frame.

Character:
VTI mascot wearing a modernized kimono-business hybrid or clean business-casual high-tech outfit, sakura-pink and white accents, rising-sun red detail, slim cyan energy line behind the back.

Required layout:
Frames 0-5 idle loop.
Frames 6-11 run cycle.
Frame 12 crouch.
Frames 13-15 jump / airborne.
Frames 20-21 flying with origami carbon Responsibility Wings attached.
Frames 24-26 hit reaction.
Include a Kaizen power visual in optional later cells if space allows: precise red/cyan keyboard energy aura with small sakura data trails.

Style:
Premium semi-flat 2D runner character, crisp outline, clean silhouette, disciplined Tokyo Kaizen mood.

Avoid:
Tiny kanji text, photorealistic clothing, dark cyberpunk, inconsistent frame size, cropped limbs.

Export exactly as:
public/assets/images/tokyo/mascot/mascot_sheet.png
```

### 7.3. Đà Nẵng Mascot

```text
Use Stitch MCP to generate one transparent PNG mascot sprite sheet for the Danang map of "VTI 9-Year Adventure - Kaizen Journey".

Output file:
public/assets/images/danang/mascot/mascot_sheet.png

Technical:
1024x1024 transparent PNG sprite sheet, frame cell 170x204 px, right-facing side-view or slight 3/4 side-view, same character height and foot baseline in every frame.

Character:
VTI mascot wearing a blue VTI polo, sporty runner pants, smart visor, ocean cyan and sunny orange technology accents.

Required layout:
Frames 0-5 idle loop.
Frames 6-11 run cycle.
Frame 12 crouch.
Frames 13-15 jump / airborne.
Frames 20-21 flying with Dragon-Bridge-inspired jet Responsibility Wings attached.
Frames 24-26 hit reaction.
Include a Kaizen power visual in optional later cells if space allows: cyan/orange keyboard energy aura and wave-like data trails.

Style:
Premium semi-flat 2D runner character, crisp outline, clean silhouette, energetic Danang breakthrough mood.

Avoid:
Tiny clothing logos, photorealistic sportswear, dark cyberpunk, inconsistent frame size, cropped limbs.

Export exactly as:
public/assets/images/danang/mascot/mascot_sheet.png
```

---

## 8. Batch 3 - Items And Powerups

### 8.1. Hà Nội Items And Powerups

```text
Use Stitch MCP to generate 6 transparent PNG item assets for the Hanoi map of "VTI 9-Year Adventure - Kaizen Journey".

Global style:
Premium semi-flat 2D runner game assets, transparent background, crisp outline, clean vector-like silhouette, high contrast, readable at 20px/24px/32px/48px/64px, controlled soft tech glow.

Hanoi motifs:
Hoan Kiem Lake waves, lotus, The Huc Bridge, old quarter warmth, VTI crimson red, warm gold, emerald respect glow, cyan tech accent.

Generate these files:

1. public/assets/images/hanoi/items/experience_flask.png
Asset: Experience Flask.
Resolution: 512x512 transparent PNG.
Visual: small glass flask, round readable body, Hoan Kiem wave motif, red VTI cap, glowing golden core.

2. public/assets/images/hanoi/items/experience_flask_collect.png
Asset: collect burst effect.
Resolution: 512x512 transparent PNG.
Visual: small gold/cyan burst, clean short particles, no dense clutter.

3. public/assets/images/hanoi/items/respect_shield_sheet.png
Asset: Respect Shield sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 512x512.
States: idle icon, active loop, block flash, expiring pulse.
Visual: lotus and The Huc Bridge energy shield, emerald green glow, light gold edge.

4. public/assets/images/hanoi/items/responsibility_wings_sheet.png
Asset: Responsibility Wings sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 512x512.
States: idle icon, attached wings, flight trail, expiring pulse.
Visual: clean technology wings with bamboo rib motif, blue rim light, small orange VTI accent.

5. public/assets/images/hanoi/items/kaizen_keyboard_sheet.png
Asset: Kaizen Keyboard sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 512x512.
States: equipped keyboard, shoot flash.
Visual: compact mechanical keyboard, red/gold keycaps, bright cyan energy emission.

6. public/assets/images/hanoi/items/keyboard_projectiles_sheet.png
Asset: keyboard projectile sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 512x512.
States: "Tab" projectile, "Enter" projectile.
Visual: large readable keycap text, bright trail, not cluttered.

Export PNG files with the exact names and paths above.
```

### 8.2. Tokyo Items And Powerups

```text
Use Stitch MCP to generate 6 transparent PNG item assets for the Tokyo map of "VTI 9-Year Adventure - Kaizen Journey".

Global style:
Premium semi-flat 2D runner game assets, transparent background, crisp outline, clean vector-like silhouette, high contrast, readable at 20px/24px/32px/48px/64px, controlled soft tech glow.

Tokyo motifs:
Sakura petals, origami folds, rising sun red circle, Shibuya LED rhythm, clean Japanese minimal technology, VTI crimson, cyan tech accent.

Generate these files:

1. public/assets/images/tokyo/items/experience_flask.png
Asset: Experience Flask.
Resolution: 512x512 transparent PNG.
Visual: crystal flask shaped like a sakura bud, glowing pink/white core, tiny clean petal accent, red VTI cap.

2. public/assets/images/tokyo/items/experience_flask_collect.png
Asset: collect burst effect.
Resolution: 512x512 transparent PNG.
Visual: sakura-pink/cyan burst, a few digital petals, clean and readable.

3. public/assets/images/tokyo/items/respect_shield_sheet.png
Asset: Respect Shield sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 512x512.
States: idle icon, active loop, block flash, expiring pulse.
Visual: origami fan shield, rising-sun red center circle, emerald green protection glow.

4. public/assets/images/tokyo/items/responsibility_wings_sheet.png
Asset: Responsibility Wings sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 512x512.
States: idle icon, attached wings, flight trail, expiring pulse.
Visual: origami carbon-fiber wings, white/pink facets, cyan rim light.

5. public/assets/images/tokyo/items/kaizen_keyboard_sheet.png
Asset: Kaizen Keyboard sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 512x512.
States: equipped keyboard, shoot flash.
Visual: minimalist Japanese-VTI keyboard, red/white keycaps, precise cyan energy.

6. public/assets/images/tokyo/items/keyboard_projectiles_sheet.png
Asset: keyboard projectile sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 512x512.
States: "Tab" projectile, "Enter" projectile.
Visual: large readable keycap text, sakura data trail, bright but controlled.

Export PNG files with the exact names and paths above.
```

### 8.3. Đà Nẵng Items And Powerups

```text
Use Stitch MCP to generate 6 transparent PNG item assets for the Danang map of "VTI 9-Year Adventure - Kaizen Journey".

Global style:
Premium semi-flat 2D runner game assets, transparent background, crisp outline, clean vector-like silhouette, high contrast, readable at 20px/24px/32px/48px/64px, controlled soft tech glow.

Danang motifs:
Dragon Bridge curves, ocean waves, lifebuoy, My Khe beach, sunny orange, ocean cyan, VTI crimson, clean white highlights.

Generate these files:

1. public/assets/images/danang/items/experience_flask.png
Asset: Experience Flask.
Resolution: 512x512 transparent PNG.
Visual: sea-crystal water-drop flask, glowing cyan core, tiny bubble accent, red VTI cap.

2. public/assets/images/danang/items/experience_flask_collect.png
Asset: collect burst effect.
Resolution: 512x512 transparent PNG.
Visual: cyan/orange burst, small bubble data particles, clean and readable.

3. public/assets/images/danang/items/respect_shield_sheet.png
Asset: Respect Shield sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 512x512.
States: idle icon, active loop, block flash, expiring pulse.
Visual: high-tech lifebuoy shield, emerald protection glow, white/orange ring detail.

4. public/assets/images/danang/items/responsibility_wings_sheet.png
Asset: Responsibility Wings sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 512x512.
States: idle icon, attached wings, flight trail, expiring pulse.
Visual: jet wings inspired by Dragon Bridge fins, cyan/orange glow, aerodynamic silhouette.

5. public/assets/images/danang/items/kaizen_keyboard_sheet.png
Asset: Kaizen Keyboard sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 512x512.
States: equipped keyboard, shoot flash.
Visual: waterproof technology keyboard, cyan/orange keycaps, wave-like energy emission.

6. public/assets/images/danang/items/keyboard_projectiles_sheet.png
Asset: keyboard projectile sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 512x512.
States: "Tab" projectile, "Enter" projectile.
Visual: large readable keycap text, wave-data trail, bright but controlled.

Export PNG files with the exact names and paths above.
```

---

## 9. Batch 4 - Enemies, Obstacles, Projectiles

### 9.1. Hà Nội Enemies And Obstacles

```text
Use Stitch MCP to generate 7 transparent PNG gameplay hazard assets for the Hanoi map of "VTI 9-Year Adventure - Kaizen Journey".

Global style:
Premium semi-flat 2D runner enemy and obstacle assets, transparent background, crisp outline, strong readable silhouette, family-friendly, red/orange hazard cues, no horror, no dark cyberpunk.

Technical:
Enemy sprite sheets: 1024x1024 PNG, cell 48x48 px.
Obstacle sheets: 1024x1024 PNG, cell 512x512 px.
Single projectile: 256x256 or 512x512 transparent PNG.
All assets must be readable when rendered at 24px-48px.

Generate these files:

1. public/assets/images/hanoi/enemies/ground_bug_sheet.png
Enemy: Bug Tac Duong, ground traffic-jam bug.
States: idle, crawl frame 1, crawl frame 2, crawl frame 3, crawl frame 4, stomped.
Visual: low flat mechanical bug, gray body, red error lights, Hanoi traffic cone/old-street motif, clearly visible top/head area for stomp.

2. public/assets/images/hanoi/enemies/flying_bug_sheet.png
Enemy: Bug Tri Hoan, flying delay bug.
States: hover frame 1, hover frame 2, hover frame 3, hover frame 4, shoot, defeated.
Visual: small hovering robot bug, broken clock/deadline motif, purple/gray body, red warning eye, clear shooting direction.

3. public/assets/images/hanoi/enemies/flying_bug_projectile.png
Projectile: slow straight clock-glitch bullet.
Visual: small broken clock icon projectile, red/orange warning accent, clear direction trail.

4. public/assets/images/hanoi/obstacles/pit.png
Obstacle: open pit.
Resolution: 512x512 transparent PNG.
Visual: cracked old gray brick road edge, dark depth, subtle dust, clear top edge.

5. public/assets/images/hanoi/obstacles/pit_warning.png
Obstacle: pit warning marker.
Resolution: 512x512 transparent PNG.
Visual: early brick cracks, dust, small red warning marker, readable but not oversized.

6. public/assets/images/hanoi/obstacles/bomb_low_sheet.png
Obstacle: low hanging bomb / construction barrier.
States: idle, warning flash.
Visual: Hanoi old-street construction motif, red/orange hazard glow, player must crouch under it.

7. public/assets/images/hanoi/obstacles/bomb_parachute_sheet.png
Obstacle: parachute bomb fallback for flying sections.
States: falling, warning flash.
Visual: small hazard bomb with simple parachute, red/orange cue, readable at small size.

Export PNG files with the exact names and paths above.
```

### 9.2. Tokyo Enemies And Obstacles

```text
Use Stitch MCP to generate 7 transparent PNG gameplay hazard assets for the Tokyo map of "VTI 9-Year Adventure - Kaizen Journey".

Global style:
Premium semi-flat 2D runner enemy and obstacle assets, transparent background, crisp outline, strong readable silhouette, family-friendly, red/orange hazard cues, no horror, no dark cyberpunk.

Technical:
Enemy sprite sheets: 1024x1024 PNG, cell 48x48 px.
Obstacle sheets: 1024x1024 PNG, cell 512x512 px.
Single projectile: 256x256 or 512x512 transparent PNG.
All assets must be readable when rendered at 24px-48px.

Generate these files:

1. public/assets/images/tokyo/enemies/ground_bug_sheet.png
Enemy: Overtime Bug.
States: idle, run frame 1, run frame 2, run frame 3, run frame 4, stomped.
Visual: low office-mechanical bug, paper stack and overtime clock motif, gray body with pink/red error lights, clear stompable top.

2. public/assets/images/tokyo/enemies/flying_bug_sheet.png
Enemy: Language Barrier Bug.
States: hover frame 1, hover frame 2, hover frame 3, hover frame 4, diagonal shoot, defeated.
Visual: flying robot bug with glitch-font panels, sakura/purple accents, clear diagonal shooting direction.

3. public/assets/images/tokyo/enemies/flying_bug_projectile.png
Projectile: diagonal glitch-character bullet.
Visual: small corrupted character tile, red/orange warning border, cyan trail, no tiny unreadable text.

4. public/assets/images/tokyo/obstacles/pit.png
Obstacle: open pit.
Resolution: 512x512 transparent PNG.
Visual: cracked Shibuya road / station gap, dark depth, red LED warning edge.

5. public/assets/images/tokyo/obstacles/pit_warning.png
Obstacle: pit warning marker.
Resolution: 512x512 transparent PNG.
Visual: early road crack, blinking red guide strip, subtle sakura dust.

6. public/assets/images/tokyo/obstacles/bomb_low_sheet.png
Obstacle: low security bomb.
States: idle, warning flash.
Visual: compact urban safety barrier bomb, red/orange hazard light, player must crouch under it.

7. public/assets/images/tokyo/obstacles/bomb_parachute_sheet.png
Obstacle: parachute bomb.
States: falling, warning flash.
Visual: small black/red bomb with origami parachute, readable in flying sections.

Export PNG files with the exact names and paths above.
```

### 9.3. Đà Nẵng Enemies And Obstacles

```text
Use Stitch MCP to generate 7 transparent PNG gameplay hazard assets for the Danang map of "VTI 9-Year Adventure - Kaizen Journey".

Global style:
Premium semi-flat 2D runner enemy and obstacle assets, transparent background, crisp outline, strong readable silhouette, family-friendly, red/orange hazard cues, no horror, no dark cyberpunk.

Technical:
Enemy sprite sheets: 1024x1024 PNG, cell 48x48 px.
Obstacle sheets: 1024x1024 PNG, cell 512x512 px.
Single projectile: 256x256 or 512x512 transparent PNG.
All assets must be readable when rendered at 24px-48px.

Generate these files:

1. public/assets/images/danang/enemies/ground_bug_sheet.png
Enemy: Low Battery Bug.
States: idle, crawl frame 1, crawl frame 2, crawl frame 3, crawl frame 4, electric pulse, stomped.
Visual: low battery-shaped mechanical bug, cyan/orange accents, red low-battery warning, clear stompable top when pulse is off.

2. public/assets/images/danang/enemies/flying_bug_sheet.png
Enemy: Data Leak Bug.
States: hover frame 1, hover frame 2, hover frame 3, hover frame 4, packet shoot, defeated.
Visual: fast hovering data bug, packet fragments, ocean cyan and purple error lights, clear shooting direction.

3. public/assets/images/danang/enemies/flying_bug_projectile.png
Projectile: packet data bullet.
Visual: small data packet projectile, red/orange warning border, cyan trail, readable direction.

4. public/assets/images/danang/obstacles/pit.png
Obstacle: open pit.
Resolution: 512x512 transparent PNG.
Visual: cracked Dragon Bridge deck / beach boardwalk edge, dark gap with blue wave motion below, clear top edge.

5. public/assets/images/danang/obstacles/pit_warning.png
Obstacle: pit warning marker.
Resolution: 512x512 transparent PNG.
Visual: early bridge-deck crack, wave spray, red/orange warning marker.

6. public/assets/images/danang/obstacles/bomb_low_sheet.png
Obstacle: low tech-debt bomb.
States: idle, warning flash.
Visual: compact bomb with ocean/bridge tech motif, red/orange hazard light, player must crouch under it.

7. public/assets/images/danang/obstacles/bomb_parachute_sheet.png
Obstacle: parachute bomb.
States: falling, warning flash.
Visual: small bomb with beach rescue parachute shape, red/orange cue, readable in fast flying sections.

Export PNG files with the exact names and paths above.
```

---

## 10. Batch 5 - Bosses

### 10.1. Boss Deadline Co Pho - Hà Nội

```text
Use Stitch MCP to generate 3 PNG boss assets for the Hanoi boss "Boss Deadline Co Pho" in "VTI 9-Year Adventure - Kaizen Journey".

Global style:
Premium semi-flat 2D boss art, dramatic but family-friendly, clean edges, strong readable silhouette, controlled glow, Hanoi Old Quarter plus deadline clock motif. No horror, no dark cyberpunk, no photorealism.

Generate these files:

1. public/assets/images/hanoi/bosses/boss_intro.png
Asset: boss intro artwork.
Resolution: 1920x1080 PNG.
Composition: giant clock machine covered with deadline sticky notes, jammed gears, blinking red lights, Hanoi Old Quarter behind it, centered boss, title-safe empty space on upper-left or lower-third for overlay text.

2. public/assets/images/hanoi/bosses/boss_sheet.png
Asset: gameplay boss sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 192x192.
States: idle 6 frames, attack 8 frames, hit reaction 2 frames, defeated 6 frames.
Visual: massive clock-machine silhouette, sticky notes, gears, red warning eye, readable attack pose.

3. public/assets/images/hanoi/bosses/boss_projectiles_sheet.png
Asset: boss projectile sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 192x192 or 256x256.
States: straight clock bullet, low parabolic gear bullet, red warning marker, falling deadline stamp bullet.
Visual: clear hazard color, not confused with player keyboard projectiles.

Export PNG files with the exact names and paths above.
```

### 10.2. Boss Kaizen Breaker - Tokyo

```text
Use Stitch MCP to generate 3 PNG boss assets for the Tokyo boss "Boss Kaizen Breaker" in "VTI 9-Year Adventure - Kaizen Journey".

Global style:
Premium semi-flat 2D boss art, dramatic but family-friendly, clean edges, strong readable silhouette, controlled glow, Tokyo Kaizen disruption motif. No horror, no dark cyberpunk, no photorealism.

Generate these files:

1. public/assets/images/tokyo/bosses/boss_intro.png
Asset: boss intro artwork.
Resolution: 1920x1080 PNG.
Composition: giant anti-Kaizen system entity in office armor, corrupted process boards, Shibuya LED panels, sakura petals, red warning UI shapes, centered boss, title-safe empty space for overlay text.

2. public/assets/images/tokyo/bosses/boss_sheet.png
Asset: gameplay boss sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 192x192.
States: idle 6 frames, attack 8 frames, hit reaction 2 frames, defeated 6 frames.
Visual: large office-tech armor silhouette, red anti-Kaizen core, glitch panels, readable attack pose.

3. public/assets/images/tokyo/bosses/boss_projectiles_sheet.png
Asset: boss projectile sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 192x192 or 256x256.
States: fast straight bullet, narrow fan bullet, falling warning marker, process-error shard.
Visual: red/pink hazard color, not confused with player keyboard projectiles.

Export PNG files with the exact names and paths above.
```

### 10.3. Boss Data Storm Dragon - Đà Nẵng

```text
Use Stitch MCP to generate 3 PNG boss assets for the Danang boss "Boss Data Storm Dragon" in "VTI 9-Year Adventure - Kaizen Journey".

Global style:
Premium semi-flat 2D boss art, dramatic but family-friendly, clean edges, strong readable silhouette, controlled glow, Danang Dragon Bridge plus data storm motif. No horror, no dark cyberpunk, no photorealism.

Generate these files:

1. public/assets/images/danang/bosses/boss_intro.png
Asset: boss intro artwork.
Resolution: 1920x1080 PNG.
Composition: huge data dragon inspired by Dragon Bridge, body made of packet-data plates and LED strips, Han River storm behind it, cyan/orange energy, red warning markers, centered boss, title-safe empty space for overlay text.

2. public/assets/images/danang/bosses/boss_sheet.png
Asset: gameplay boss sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 192x192.
States: idle 6 frames, attack 8 frames, hit reaction 2 frames, defeated 6 frames.
Visual: large dragon silhouette, segmented data body, orange/cyan glow, clear attack pose.

3. public/assets/images/danang/bosses/boss_projectiles_sheet.png
Asset: boss projectile sprite sheet.
Resolution: 1024x1024 transparent PNG.
Frame cell: 192x192 or 256x256.
States: fan data bullet, zigzag packet bullet, falling rain marker, storm shard.
Visual: red/orange hazard cue with cyan data edge, not confused with player keyboard projectiles.

Export PNG files with the exact names and paths above.
```

---

## 11. Batch 6 - Cutscenes

```text
Use Stitch MCP to generate 10 PNG cutscene images for "VTI 9-Year Adventure - Kaizen Journey".

Global style:
Premium semi-flat 2D cutscene illustration, clean composition, bright VTI technology accents, local cultural identity, family-friendly, no dark cyberpunk, no photorealism, no tiny embedded text.

Technical:
Resolution: 1920x1080 PNG.
Composition: leave title-safe space for UI overlay, preferably upper-left or lower-third. Do not draw final dialogue text into the image.

Generate these files:

1. public/assets/images/hanoi/cutscenes/opening.png
Scene: VTI mascot near Hoan Kiem Lake and VTI Hanoi office, ready to begin the journey, warm sunrise/sunset, Respect mood.

2. public/assets/images/hanoi/cutscenes/boss_intro.png
Scene: Boss Deadline Co Pho appears in Hanoi Old Quarter, giant clock machine, sticky notes, red warning lights, dramatic but readable.

3. public/assets/images/hanoi/cutscenes/clear.png
Scene: mascot has crossed the Old Quarter, warm victory tone, lotus/Respect motif, VTI 9-year celebration energy.

4. public/assets/images/hanoi/cutscenes/transition_next.png
Scene: mascot boards an international flight from Hanoi to Tokyo, horizon gradually shifts into sakura petals and Tokyo LED skyline.

5. public/assets/images/tokyo/cutscenes/opening.png
Scene: Tokyo skyline, sakura petals, Mount Fuji/Tokyo Tower hint, VTI Japan signal, mascot ready to run with Kaizen focus.

6. public/assets/images/tokyo/cutscenes/boss_intro.png
Scene: Boss Kaizen Breaker appears in Shibuya tech arena, process-error panels, anti-Kaizen core, sakura data fragments.

7. public/assets/images/tokyo/cutscenes/clear.png
Scene: mascot completes the Tokyo challenge, disciplined Kaizen victory mood, clean city lights, sakura and cyan technology glow.

8. public/assets/images/tokyo/cutscenes/transition_next.png
Scene: mascot returns toward Vietnam, travel path transitions from Tokyo skyline into Danang ocean, Dragon Bridge and beach colors emerging.

9. public/assets/images/danang/cutscenes/opening.png
Scene: Dragon Bridge, Han River, My Khe beach, energetic sunny atmosphere, mascot ready for the final Responsibility stage.

10. public/assets/images/danang/cutscenes/boss_intro.png
Scene: Boss Data Storm Dragon emerges over Dragon Bridge, packet-data storm, orange/cyan glow, red warning markers.

11. public/assets/images/danang/cutscenes/clear.png
Scene: final journey celebration across Hanoi, Tokyo, Danang motifs, VTI 9-year spirit, "technology creating new value" mood, but no small embedded text.

Export PNG files with the exact names and paths above.
```

---

## 12. Batch 7 - HUD Icons

HUD có thể dùng một bộ chung hoặc gen theo từng map. Nếu cần tốc độ, gen theo Hà Nội trước rồi dùng chung toàn game. Nếu muốn đồng bộ tuyệt đối với 3 map, chạy prompt này 3 lần và thay `{map}` bằng `hanoi`, `tokyo`, `danang`.

```text
Use Stitch MCP to generate 6 transparent PNG HUD assets for the {map} map of "VTI 9-Year Adventure - Kaizen Journey".

Global style:
Premium semi-flat 2D HUD icons, transparent background, clean readable silhouette, crisp outline, soft tech glow, readable at 16px/24px/32px, no tiny text.

Map identity:
Use the local color accent of {map}, but keep the HUD coherent across the whole game.

Generate these files:

1. public/assets/images/{map}/hud/heart_icon.png
Asset: heart / HP icon.
Resolution: 256x256 transparent PNG.
Visual: friendly red VTI heart with small white tech highlight.

2. public/assets/images/{map}/hud/score_icon.png
Asset: score icon.
Resolution: 256x256 transparent PNG.
Visual: compact star or mini experience flask symbol, gold/cyan, readable at 16px.

3. public/assets/images/{map}/hud/kaizen_energy_icon.png
Asset: Kaizen energy icon.
Resolution: 256x256 transparent PNG.
Visual: energy bolt plus keyboard key motif, red/cyan glow.

4. public/assets/images/{map}/hud/respect_timer_icon.png
Asset: Respect Shield timer icon.
Resolution: 256x256 transparent PNG.
Visual: mini shield, emerald glow, local motif simplified.

5. public/assets/images/{map}/hud/responsibility_timer_icon.png
Asset: Responsibility Wings timer icon.
Resolution: 256x256 transparent PNG.
Visual: mini wings, cyan/orange glow, local motif simplified.

6. public/assets/images/{map}/hud/hud_icons_sheet.png
Asset: combined HUD icon sheet.
Resolution: 1024x1024 transparent PNG.
Content: the five icons above arranged in clean equal cells.

Export PNG files with the exact names and paths above.
```

---

## 13. Runtime Integration Notes

Sau khi asset được gen xong, nên cập nhật code theo thứ tự:

1. `src/game/scenes/PreloadScene.ts`
   - Load asset theo key có tiền tố map: `hanoi_*`, `tokyo_*`, `danang_*`.
   - Thay texture cũ `hanoi_enemies`, `powerups`, `obstacles`, `hanoi_boss` bằng texture theo map.

2. `src/game/systems/ParallaxSystem.ts`
   - Chuyển từ nhiều parallax layer sang một merged background layer theo map.
   - Dùng `mapConfig.mapKey` để chọn đúng texture `{map}_background`.

3. `src/game/systems/SpawnSystem.ts`
   - Spawn item/enemy/obstacle bằng texture key theo map.
   - Dùng `experience_flask`, `ground_bug`, `flying_bug`, `bomb_low` đúng map.

4. `src/game/systems/BossSystem.ts`
   - Spawn boss bằng texture key theo map.
   - Spawn boss projectile bằng `boss_projectiles_sheet` thay vì reuse powerup frame.

5. `src/game/maps/*.ts`
   - Đồng bộ tên boss:
     - Hanoi: `Boss Deadline Co Pho`
     - Tokyo: `Boss Kaizen Breaker`
     - Danang: `Boss Data Storm Dragon`
   - Cập nhật `cutscenes.imageAsset` sang asset mới trong `public/assets/images/{map}/...`.

---

## 14. QA Checklist

Kiểm duyệt từng asset trước khi đưa vào game:

- File đúng đường dẫn trong manifest.
- PNG sprite rời có nền trong suốt.
- Background/cutscene đúng tỷ lệ `16:9`.
- Merged background không có item/enemy/character silhouette lẫn trong nền.
- Merged background gộp được cảm giác chiều sâu của các lớp cũ `far_background`, `midground`, `foreground/background` nhưng vẫn là một asset duy nhất.
- Ground tile seamless ngang, mép trên rõ.
- Mascot sheet đúng `1024x1024`, cell `170x204`, không lệch baseline.
- Enemy sheet đúng `1024x1024`, cell `48x48`, silhouette rõ ở `24px-48px`.
- Boss sheet đúng `1024x1024`, cell `192x192`, attack pose đọc rõ.
- Item/powerup đọc rõ ở `20px`, `24px`, `32px`.
- Đạn `Tab` và `Enter` có chữ đủ lớn; không dùng chữ nhỏ khác.
- Hazard có màu cảnh báo rõ, không giống reward item.
- Respect Shield, Responsibility Wings, Experience Flask có motif đúng từng map.
- Không có phong cách photorealism, stock, dark cyberpunk, horror, hoặc chi tiết nhiễu.

---

## 15. Quick Batch Order Đề Xuất

Để giảm rủi ro, gen theo thứ tự:

1. Backgrounds của 3 map.
2. Items/powerups của 3 map.
3. Enemies/obstacles của 3 map.
4. Mascot sprite sheets.
5. Boss assets.
6. Cutscenes.
7. HUD icons.

Lý do: backgrounds và item/hazard quyết định readability của gameplay trước; mascot/boss có thể tinh chỉnh sau khi đã biết nền và palette thực tế.
