import { MapConfig } from './MapConfig';

export const hanoiMapConfig: MapConfig = {
  mapKey: 'hanoi',
  baseSpeed: 5.5,
  culturalMessage: 'VTI khởi nguồn từ Hà Nội với tinh thần Tôn trọng đồng nghiệp, khách hàng và đối tác.',
  bgLayers: [
    {
      key: 'hanoi_sky',
      scrollFactorX: 0.1,
      scrollFactorY: 0,
      scale: 1,
      isTileable: true
    },
    {
      key: 'hanoi_mid',
      scrollFactorX: 0.4,
      scrollFactorY: 0,
      scale: 1,
      isTileable: true
    },
    {
      key: 'hanoi_ground',
      scrollFactorX: 1.0,
      scrollFactorY: 1.0,
      scale: 1,
      isTileable: true,
      yOffset: 480 // bottom area of the canvas
    }
  ],
  spawnPatterns: [
    // Pattern 1: Parabola of 3 flasks
    {
      id: 'pattern_flasks_parabola',
      width: 400,
      items: [
        { type: 'experience_flask', xOffset: 50, y: 395 },
        { type: 'experience_flask', xOffset: 120, y: 340 },
        { type: 'experience_flask', xOffset: 190, y: 340 },
        { type: 'experience_flask', xOffset: 260, y: 395 }
      ]
    },
    // Pattern 2: Single ground bug with warning flask
    {
      id: 'pattern_bug_ground',
      width: 500,
      items: [
        { type: 'experience_flask', xOffset: 100, y: 395 },
        { type: 'ground_bug', xOffset: 250, y: 410 },
        { type: 'experience_flask', xOffset: 380, y: 395 }
      ]
    },
    // Pattern 3: Jump over a pit with a floating platform
    {
      id: 'pattern_pit_simple',
      width: 600,
      items: [
        { type: 'experience_flask', xOffset: 100, y: 395 },
        { type: 'pit', xOffset: 250, y: 440 }, // Pit is drawn on ground level
        { type: 'platform', xOffset: 218, y: 320, width: 192, height: 24 }, // platform over the pit
        { type: 'experience_flask', xOffset: 250, y: 270 },
        { type: 'experience_flask', xOffset: 310, y: 270 },
        { type: 'experience_flask', xOffset: 450, y: 395 }
      ]
    },
    // Pattern 4: Crouch under a bomb
    {
      id: 'pattern_bomb_crouch',
      width: 500,
      items: [
        { type: 'bomb', xOffset: 220, y: 330 }, // low bomb
        { type: 'experience_flask', xOffset: 220, y: 410 } // collect while crouching
      ]
    },
    // Pattern 5: Ground bug + Flying bug combination
    {
      id: 'pattern_bugs_combo',
      width: 700,
      items: [
        { type: 'ground_bug', xOffset: 200, y: 410 },
        { type: 'flying_bug', xOffset: 400, y: 300 },
        { type: 'experience_flask', xOffset: 400, y: 395 }
      ]
    },
    // Pattern 6: Respect Shield power-up spawn
    {
      id: 'pattern_shield_spawn',
      width: 800,
      items: [
        { type: 'respect_shield', xOffset: 300, y: 330 },
        { type: 'experience_flask', xOffset: 150, y: 395 },
        { type: 'experience_flask', xOffset: 450, y: 395 }
      ]
    },
    // Pattern 7: Responsibility Wings power-up spawn
    {
      id: 'pattern_wings_spawn',
      width: 800,
      items: [
        { type: 'responsibility_wings', xOffset: 300, y: 290 },
        { type: 'experience_flask', xOffset: 400, y: 240 },
        { type: 'experience_flask', xOffset: 500, y: 240 }
      ]
    },
    // Pattern 8: Elevated stepping platforms (Mario steps)
    {
      id: 'pattern_mario_steps',
      width: 900,
      items: [
        { type: 'platform', xOffset: 100, y: 370, width: 128, height: 24 },
        { type: 'experience_flask', xOffset: 150, y: 320 },
        { type: 'platform', xOffset: 300, y: 300, width: 128, height: 24 },
        { type: 'experience_flask', xOffset: 350, y: 250 },
        { type: 'platform', xOffset: 500, y: 230, width: 128, height: 24 },
        { type: 'experience_flask', xOffset: 550, y: 180 },
        { type: 'ground_bug', xOffset: 700, y: 410 }
      ]
    }
  ],
  bossConfig: {
    name: 'Boss Deadline Cổ Phố',
    maxHp: 500,
    bulletsPattern: 'straight',
    bulletSpeed: 250,
    shootInterval: 2200 // seconds between attacks
  },
  cutscenes: {
    bossIntro: {
      title: 'Cảnh báo Deadline!',
      body: 'Boss Deadline Cổ Phố đã chặn cổng Staging. Hãy khởi động Kaizen Mode bằng bàn phím cơ và bắn đạn Tab/Enter để giải phóng hệ thống!',
      durationMs: 4000,
      imageAsset: 'hanoi_boss.png'
    },
    mapClear: {
      title: 'Vượt ải Hà Nội thành công!',
      body: 'Bạn đã hoàn thành chặng đường Khởi nguồn. Trải qua chặng đường đầu tiên, tinh thần Tôn Trọng của VTIans luôn là kim chỉ nam trong việc phát triển và bàn giao dự án.',
      durationMs: 5000,
      imageAsset: 'player_male_stand.png'
    }
  }
};
