import { MapConfig } from './MapConfig';

export const danangMapConfig: MapConfig = {
  mapKey: 'danang',
  baseSpeed: 7.5, // Highest speed
  culturalMessage: 'Trách nhiệm - Chủ động gánh vác, đưa sản phẩm bàn giao xuất sắc đến tay khách hàng.',
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
    // Pattern 2: Ground bug (Low Battery Bug)
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
    // Pattern 4: Crouch under a bomb (critical Tech Debt bomb)
    {
      id: 'pattern_bomb_crouch',
      width: 500,
      items: [
        { type: 'bomb', xOffset: 220, y: 350 },
        { type: 'experience_flask', xOffset: 220, y: 440 }
      ]
    },
    // Pattern 5: Ground bug + Flying bug combination (Data Leak Bug)
    {
      id: 'pattern_bugs_combo',
      width: 700,
      items: [
        { type: 'ground_bug', xOffset: 200, y: 440 },
        { type: 'flying_bug', xOffset: 400, y: 280 }, // Very low fly bug, harder to jump over
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
    // Pattern 7: Responsibility Wings (Critical for Danang fly areas)
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
    name: 'Boss Rồng Sông Hàn Data Storm',
    maxHp: 500, // Reduced from 2000
    bulletsPattern: 'zigzag',
    bulletSpeed: 350,
    shootInterval: 1500
  },
  cutscenes: {
    bossIntro: {
      title: 'Cơn bão dữ liệu!',
      body: 'Boss Rồng Sông Hàn Data Storm đã trỗi dậy chắn cổng Cloud. Hãy chủ động gánh vác trách nhiệm và tiêu diệt nó để bảo vệ hệ thống của VTI!',
      durationMs: 5000,
      imageAsset: 'hanoi_boss.png'
    },
    mapClear: {
      title: 'Hoàn thành hành trình VTI!',
      body: 'Bạn đã xuất sắc chinh phục tất cả 3 chặng đường Hà Nội - Tokyo - Đà Nẵng. Hãy cùng tự hào về hành trình 9 năm Công nghệ kiến tạo giá trị mới!',
      durationMs: 6000,
      imageAsset: 'player_male_stand.png'
    }
  }
};
