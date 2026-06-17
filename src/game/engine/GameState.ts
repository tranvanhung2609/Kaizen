import { GamePhase } from './constants';

// ─── Shared Game State ────────────────────────────────────────────────────────
// Plain object được truyền bằng reference đến tất cả các system.
// Mọi thay đổi trên object này đều được tất cả system thấy ngay lập tức.
export interface GameState {
  // Core gameplay
  score: number;
  hearts: number;
  kaizenEnergy: number;
  isKaizenMode: boolean;
  currentPhase: GamePhase;
  isBossFight: boolean;
  gameSpeed: number;
  distance: number;
  kaizenAmmo: number;
  flasksCollected: number; // Added to track total flasks collected in this run

  // Buff timers (absolute timestamp so-with Phaser time.now)
  shieldUntil: number;
  wingsUntil: number;
  kaizenUntil: number;
  nextShootTime: number;
  kaizenCooldownUntil: number; // Cooldown timer after Kaizen mode ends
  invulnerableUntil: number; // Duration of damage immunity after pit falls
  timeSpeedMultiplier: number; // Scrolling speed scaling over time


  // Boss state
  bossHp: number;
  maxBossHp: number;
  bossActive: boolean;
  nextBossAttackTime: number;

  // Checkpoints
  checkpointScore: number;
  checkpointEnergy: number;
  checkpointX: number;
  checkpointFlasks: number; // Added to save flask count at checkpoint
  bossTriggerX: number;

  // Level spawning
  activePitRanges: { start: number; end: number }[];

  // Timing
  gameTimeElapsed: number; // seconds

  // Mascot customization
  activeSkin: string;
  activeTitle: string;
  activeGender: string;

  // Death limit tracking
  deathCount: number;
}

/** Tạo GameState mới với giá trị mặc định. Gọi ở đầu mỗi màn chơi. */
export function createInitialGameState(): GameState {
  return {
    score: 0,
    hearts: 3,
    kaizenEnergy: 0,
    isKaizenMode: false,
    currentPhase: 'intro',
    isBossFight: false,
    gameSpeed: 5,
    distance: 0,
    kaizenAmmo: 0,
    flasksCollected: 0,

    shieldUntil: 0,
    wingsUntil: 0,
    kaizenUntil: 0,
    nextShootTime: 0,
    kaizenCooldownUntil: 0,
    invulnerableUntil: 0,
    timeSpeedMultiplier: 1.0,

    bossHp: 0,
    maxBossHp: 0,
    bossActive: false,
    nextBossAttackTime: 0,

    checkpointScore: 0,
    checkpointEnergy: 0,
    checkpointX: 0,
    checkpointFlasks: 0,
    bossTriggerX: 10000,

    activePitRanges: [],
    gameTimeElapsed: 0,

    activeSkin: 'skin_default',
    activeTitle: '',
    activeGender: 'male',
    deathCount: 0,
  };
}
