import Phaser from 'phaser';
import { GameState } from './GameState';
import { MapConfig } from '../maps/MapConfig';
import { getDifficultyState } from './constants';

// ─── HUD System ───────────────────────────────────────────────────────────────
// Chịu trách nhiệm:
//   1. emit 'hud-update' event đến React overlay (throttled — chỉ emit khi state thay đổi)
//   2. restoreMapTint — cập nhật màu tint của player theo trạng thái buff/map
//   3. updateTitleText — hiển thị danh hiệu nổi trên đầu nhân vật
//   4. showCheckpoint — thông báo lưu checkpoint nổi lên trên màn hình
export class HudSystem {
  private scene!: Phaser.Scene;

  // Throttle tracking — chỉ emit khi có giá trị thay đổi thực sự
  private lastScore = -1;
  private lastHearts = -1;
  private lastEnergy = -1;
  private lastBossHp = -1;
  private lastPhase = '';
  private lastTimeElapsed = -1;
  private lastTier = -1; // Difficulty tier tracking
  private lastPlayerName = '';
  private lastIsKaizenMode = false;

  /** Khởi tạo reference đến scene. Gọi trong create(). */
  init(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  /** Reset tracking để force emit ngay lần tiếp theo. Dùng sau respawn. */
  resetTracking(): void {
    this.lastScore = -1;
    this.lastHearts = -1;
    this.lastEnergy = -1;
    this.lastBossHp = -1;
    this.lastPhase = '';
    this.lastTimeElapsed = -1;
    this.lastTier = -1;
    this.lastPlayerName = '';
    this.lastIsKaizenMode = false;
  }

  // ─── HUD Event Emitter ────────────────────────────────────────────────────
  // Throttled: bỏ qua nếu không có gì thay đổi để tránh React render vô hạn.
  emit(state: GameState, mapConfig: MapConfig): void {
    const roundedEnergy = state.isKaizenMode ? (state.kaizenAmmo * 10) : Math.floor(state.kaizenEnergy);
    const roundedTime = Math.round(state.gameTimeElapsed);
    const diff = getDifficultyState(state.score);

    const playerName = this.scene.registry.get('playerName') || 'Player';

    if (
      state.score === this.lastScore &&
      state.hearts === this.lastHearts &&
      roundedEnergy === this.lastEnergy &&
      state.bossHp === this.lastBossHp &&
      state.currentPhase === this.lastPhase &&
      roundedTime === this.lastTimeElapsed &&
      diff.tier === this.lastTier &&
      playerName === this.lastPlayerName &&
      state.isKaizenMode === this.lastIsKaizenMode
    ) return; // Không thay đổi — bỏ qua

    this.lastScore = state.score;
    this.lastHearts = state.hearts;
    this.lastEnergy = roundedEnergy;
    this.lastBossHp = state.bossHp;
    this.lastPhase = state.currentPhase;
    this.lastTimeElapsed = roundedTime;
    this.lastTier = diff.tier;
    this.lastPlayerName = playerName;
    this.lastIsKaizenMode = state.isKaizenMode;

    const mapName =
      mapConfig.mapKey === 'hanoi' ? 'Hà Nội' :
      mapConfig.mapKey === 'tokyo' ? 'Tokyo' : 'Đà Nẵng';

    this.scene.game.events.emit('hud-update', {
      score: state.score,
      hearts: state.hearts,
      energy: roundedEnergy,
      bossHp: state.bossHp,
      maxBossHp: state.maxBossHp,
      phase: state.currentPhase,
      timeElapsed: roundedTime,
      mapKey: mapConfig.mapKey,
      mapName,
      bossName: mapConfig.bossConfig.name,
      // Difficulty info — React có thể hiển thị badge ⋆ Tier N
      difficultyTier: diff.tier,
      speedMultiplier: diff.speedMultiplier,
      playerName,
      isKaizenMode: state.isKaizenMode,
    });
  }

  // ─── Player Tint ──────────────────────────────────────────────────────────
  // Áp tint dựa trên buff đang hoạt động → skin đang trang bị → map theme.
  restoreMapTint(
    player: Phaser.Physics.Arcade.Sprite,
    state: GameState,
    mapConfig: MapConfig
  ): void {
    const now = this.scene.time.now;
    if (state.isKaizenMode) {
      player.setTint(0xff3333);          // Kaizen: đỏ neon
    } else if (state.wingsUntil > now) {
      player.setTint(0x00e5ff);          // Wings: cyan
    } else if (state.shieldUntil > now) {
      player.setTint(0x00ff00);          // Shield: xanh lá
    } else {
      // Normal state: skin theme
      if (state.activeSkin === 'skin_hanoi') player.setTint(0xff5555);
      else if (state.activeSkin === 'skin_tokyo') player.setTint(0xffd700);
      else if (state.activeSkin === 'skin_danang') player.setTint(0x00e5ff);
      else if (mapConfig.mapKey === 'tokyo') player.setTint(0xffd6eb);
      else if (mapConfig.mapKey === 'danang') player.setTint(0xd6ffff);
      else player.clearTint();
    }
  }

  // ─── Title Text ────────────────────────────────────────────────────────────
  updateTitleText(titleObj: Phaser.GameObjects.Text | null, activeTitle: string): void {
    if (!titleObj) return;
    const TITLE_MAP: Record<string, { label: string; color: string }> = {
      title_runner: { label: '⚡ THỢ CHẠY DEADLINE ⚡', color: '#ffd700' },
      title_hunter: { label: '👾 CHIẾN SĨ DIỆT BUG 👾', color: '#ff3333' },
      title_hacker: { label: '💻 SIÊU CẤP HACKER 💻', color: '#00e5ff' },
    };
    const titleData = TITLE_MAP[activeTitle];
    if (titleData) {
      titleObj
        .setText(titleData.label)
        .setColor(titleData.color)
        .setShadow(0, 0, titleData.color, 4, true, true)
        .setVisible(true);
    } else {
      titleObj.setVisible(false);
    }
  }

  // ─── Checkpoint Notification ───────────────────────────────────────────────
  showCheckpoint(playerX: number): void {
    const text = this.scene.add
      .text(playerX, 200, 'LƯU CHECKPOINT!', {
        font: '800 20px var(--font-display)',
        color: '#00e5ff',
      })
      .setOrigin(0.5, 0.5)
      .setDepth(100);
    text.setShadow(0, 0, '#00e5ff', 10, true, true);
    this.scene.tweens.add({
      targets: text,
      y: 130,
      alpha: 0,
      duration: 2000,
      onComplete: () => text.destroy(),
    });
  }
}
