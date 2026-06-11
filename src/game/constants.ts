// CORE GAME PHYSICS AND RULE CONSTANTS
// Derived from 01_Core_Mechanics.md and 03_Technical_Specs.md

export type MapKey = 'hanoi' | 'tokyo' | 'danang';
export type GamePhase = 'runner' | 'boss_intro' | 'boss' | 'map_clear' | 'game_over';

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
