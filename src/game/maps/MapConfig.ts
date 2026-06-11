import { MapKey } from '../constants';

export interface ParallaxLayerConfig {
  key: string;
  scrollFactorX: number;
  scrollFactorY: number;
  yOffset?: number;
  scale?: number;
  isTileable?: boolean;
}

export type SpawnType = 'experience_flask' | 'respect_shield' | 'responsibility_wings' | 'kaizen_keyboard' | 'ground_bug' | 'flying_bug' | 'pit' | 'bomb' | 'platform';

export interface SpawnPatternItem {
  type: SpawnType;
  xOffset: number; // relative to pattern start
  y: number; // absolute Y or relative height
  width?: number;
  height?: number;
}

export interface SpawnPattern {
  id: string;
  width: number; // total scroll width consumed by this pattern
  items: SpawnPatternItem[];
}

export interface BossConfig {
  name: string;
  maxHp: number;
  bulletsPattern: 'straight' | 'sinusoidal' | 'zigzag' | 'cluster';
  bulletSpeed: number;
  shootInterval: number;
}

export interface CutsceneConfig {
  title: string;
  body: string;
  culturalMessage?: string;
  imageAsset?: string;
  durationMs: number;
}

export interface MapConfig {
  mapKey: MapKey;
  baseSpeed: number;
  bgLayers: ParallaxLayerConfig[];
  spawnPatterns: SpawnPattern[];
  bossConfig: BossConfig;
  culturalMessage: string;
  cutscenes: {
    bossIntro: CutsceneConfig;
    mapClear: CutsceneConfig;
  };
}
