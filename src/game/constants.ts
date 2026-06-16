// CORE GAME PHYSICS AND RULE CONSTANTS
// Derived from 01_Core_Mechanics.md and 03_Technical_Specs.md

export type MapKey = 'hanoi' | 'tokyo' | 'danang';
export type GamePhase = 'intro' | 'runner' | 'boss_intro' | 'boss' | 'map_clear' | 'game_over';

export const RUNNER_PHYSICS = {
  // Speed is multiplier for scroll speed
  baseSpeed: 5.5,
  hanoiSpeed: 5.5,
  tokyoSpeed: 6.5,
  danangSpeed: 7.5,
  
  // Gravity & movement values (standardized for 960x540 canvas)
  gravity: 850,
  jumpForce: -440,
  kaizenJumpForce: -540, // super jump
  maxFallSpeed: 500,
  crouchHeightRatio: 0.55,
  
  // Wings / flight parameters
  flightLift: -12,
  flightMaxVy: -200,
  flightFallControl: 0.35,
  
  // Jump Feel System constants
  COYOTE_TIME_MS: 120,      // 120ms để nhảy sau khi rời mép vực (Coyote Time)
  JUMP_BUFFER_MS: 150,      // 150ms buffer nếu nhấn nhảy trước khi chạm đất
  JUMP_DAMPING_RATIO: 0.45, // Hệ số giảm velo/frame khi nhả phím nhảy sớm

  // Power-up durations (in milliseconds)
  shieldDuration: 10000, // 10s
  wingsDuration: 10000,  // 10s
  kaizenDuration: 8000,  // 8s
  shootCooldown: 300,    // 300ms
  
  // Energy accumulation
  energyPerSecond: 5,   // +5%/sec
  energyPerFlask: 10,   // +10%/flask
  energyPerBug: 10,     // +10%/bug stomp or shoot
};

export const SCORE_RULES = {
  experienceFlask: 50,
  groundBugDefeated: 150,
  flyingBugDefeated: 200,
  bossDefeated: 2000,
  mapClearBonus: 1000,
  remainingHeartBonus: 300,
};

export function calculateMapScore(stats: {
  flasksCollected: number;
  groundBugsDefeated: number;
  flyingBugsDefeated: number;
  bossesDefeated: number;
  heartsRemaining: number;
  bossCleared: boolean;
}) {
  return stats.flasksCollected * SCORE_RULES.experienceFlask
    + stats.groundBugsDefeated * SCORE_RULES.groundBugDefeated
    + stats.flyingBugsDefeated * SCORE_RULES.flyingBugDefeated
    + stats.bossesDefeated * SCORE_RULES.bossDefeated
    + (stats.bossCleared ? SCORE_RULES.mapClearBonus : 0)
    + stats.heartsRemaining * SCORE_RULES.remainingHeartBonus;
}

// ─── Difficulty Scaling System ────────────────────────────────────────────────
// Cứ mỗi SCORE_PER_TIER điểm, game tăng lên 1 tier (tối đa MAX_TIER).
// Mỗi tier tăng tốc độ chạy + rút ngắn khoảng cách tối thiểu giữa các pattern.
export const DIFFICULTY = {
  SCORE_PER_TIER: 500,     // 500 điểm = 1 tier mới
  MAX_TIER: 5,             // Tối đa tier 5
  SPEED_PER_TIER: 0.10,    // +10% speed mỗi tier
  GAP_SHRINK_PER_TIER: 50, // Giảm 50px khoảng cách tối thiểu giữa pattern mỗi tier
  MIN_PATTERN_GAP: 150,    // Khoảng cách tối thiểu tuyệt đối (px)
};

export interface DifficultyState {
  tier: number;          // 0–5
  speedMultiplier: number; // 1.0 → 1.50
  minPatternGap: number;  // 400 → 150 px
}

/**
 * Tính difficulty state từ score hiện tại.
 * Gọi mỗi frame hoặc mỗi khi score thay đổi.
 */
export function getDifficultyState(score: number): DifficultyState {
  const tier = Math.min(
    Math.floor(score / DIFFICULTY.SCORE_PER_TIER),
    DIFFICULTY.MAX_TIER
  );
  const speedMultiplier = 1 + tier * DIFFICULTY.SPEED_PER_TIER;
  const minPatternGap = Math.max(
    DIFFICULTY.MIN_PATTERN_GAP,
    400 - tier * DIFFICULTY.GAP_SHRINK_PER_TIER
  );
  return { tier, speedMultiplier, minPatternGap };
}

