import { MapConfig } from './MapConfig';

export const tokyoMapConfig: MapConfig = {
  mapKey: 'tokyo',
  baseSpeed: 6.5, // Faster speed
  culturalMessage: 'Kaizen - Liên tục học hỏi, cải tiến quy trình mỗi ngày để chinh phục thị trường toàn cầu.',
  bgLayers: [
    {
      key: 'hanoi_sky', // Reuses sky layer
      scrollFactorX: 0.1,
      scrollFactorY: 0,
      scale: 1,
      isTileable: true
    },
    {
      key: 'hanoi_mid', // Reuses mid layer
      scrollFactorX: 0.4,
      scrollFactorY: 0,
      scale: 1,
      isTileable: true
    },
    {
      key: 'hanoi_ground', // Reuses ground layer
      scrollFactorX: 1.0,
      scrollFactorY: 1.0,
      scale: 1,
      isTileable: true,
      yOffset: 480
    }
  ],
  spawnPatterns: [
    // Pattern 1: Parabola of 3 flasks
    {
      id: 'pattern_flasks_parabola',
      width: 400,
      items: [
        { type: 'experience_flask', xOffset: 50, y: 420 },
        { type: 'experience_flask', xOffset: 120, y: 350 },
        { type: 'experience_flask', xOffset: 190, y: 350 },
        { type: 'experience_flask', xOffset: 260, y: 420 }
      ]
    },
    // Pattern 2: Ground bug (Overtime Bug)
    {
      id: 'pattern_bug_ground',
      width: 500,
      items: [
        { type: 'experience_flask', xOffset: 100, y: 420 },
        { type: 'ground_bug', xOffset: 250, y: 440 },
        { type: 'experience_flask', xOffset: 380, y: 420 }
      ]
    },
    // Pattern 3: Jump over a pit with a floating platform
    {
      id: 'pattern_pit_simple',
      width: 600,
      items: [
        { type: 'experience_flask', xOffset: 100, y: 420 },
        { type: 'pit', xOffset: 250, y: 470 },
        { type: 'platform', xOffset: 218, y: 340, width: 192, height: 24 }, // platform over the pit
        { type: 'experience_flask', xOffset: 250, y: 280 },
        { type: 'experience_flask', xOffset: 310, y: 280 },
        { type: 'experience_flask', xOffset: 400, y: 420 }
      ]
    },
    // Pattern 4: Crouch under a bomb
    {
      id: 'pattern_bomb_crouch',
      width: 500,
      items: [
        { type: 'bomb', xOffset: 220, y: 350 },
        { type: 'experience_flask', xOffset: 220, y: 440 }
      ]
    },
    // Pattern 5: Ground bug + Flying bug combination (Language Barrier Bug)
    {
      id: 'pattern_bugs_combo',
      width: 700,
      items: [
        { type: 'ground_bug', xOffset: 200, y: 440 },
        { type: 'flying_bug', xOffset: 400, y: 300 }, // Slightly higher fly bug
        { type: 'experience_flask', xOffset: 400, y: 420 }
      ]
    },
    // Pattern 6: Respect Shield
    {
      id: 'pattern_shield_spawn',
      width: 800,
      items: [
        { type: 'respect_shield', xOffset: 300, y: 350 },
        { type: 'experience_flask', xOffset: 150, y: 420 },
        { type: 'experience_flask', xOffset: 450, y: 420 }
      ]
    },
    // Pattern 7: Responsibility Wings
    {
      id: 'pattern_wings_spawn',
      width: 800,
      items: [
        { type: 'responsibility_wings', xOffset: 300, y: 300 },
        { type: 'experience_flask', xOffset: 400, y: 250 },
        { type: 'experience_flask', xOffset: 500, y: 250 }
      ]
    },
    // Pattern 8: Elevated stepping platforms (Mario steps)
    {
      id: 'pattern_mario_steps',
      width: 900,
      items: [
        { type: 'platform', xOffset: 100, y: 390, width: 128, height: 24 },
        { type: 'experience_flask', xOffset: 150, y: 330 },
        { type: 'platform', xOffset: 300, y: 310, width: 128, height: 24 },
        { type: 'experience_flask', xOffset: 350, y: 250 },
        { type: 'platform', xOffset: 500, y: 230, width: 128, height: 24 },
        { type: 'experience_flask', xOffset: 550, y: 170 },
        { type: 'ground_bug', xOffset: 700, y: 440 }
      ]
    }
  ],
  bossConfig: {
    name: 'Boss Kaizen Breaker',
    maxHp: 1500, // More health than Hanoi
    bulletsPattern: 'sinusoidal',
    bulletSpeed: 300,
    shootInterval: 1800
  },
  cutscenes: {
    bossIntro: {
      title: 'Thử thách Nhật Bản!',
      body: 'Boss Kaizen Breaker thách thức năng lực học hỏi của bạn. Hãy kích hoạt Kaizen Mode để phá vỡ các rào cản ngôn ngữ và quy trình phức tạp!',
      durationMs: 4500,
      imageAsset: 'hanoi_boss.png' // Reuses boss texture (tinted in scene)
    },
    mapClear: {
      title: 'Chinh phục Tokyo thành công!',
      body: 'Bạn đã xuất sắc vượt qua chặng Tokyo. Với tinh thần Kaizen liên tục học hỏi, VTIans đã khẳng định được thương hiệu tại đất nước mặt trời mọc.',
      durationMs: 5000,
      imageAsset: 'player_male_stand.png'
    }
  }
};
