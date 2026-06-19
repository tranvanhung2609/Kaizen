import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // 1. Create a beautiful premium progress bar overlay
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background bar
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x1a1a36, 0.8);
    progressBg.fillRoundedRect(width / 2 - 200, height / 2 - 15, 400, 30, 8);
    progressBg.lineStyle(2, 0x25254d, 1);
    progressBg.strokeRoundedRect(width / 2 - 200, height / 2 - 15, 400, 30, 8);

    // Glowing active progress bar
    const progressBar = this.add.graphics();

    // Text indicators
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 45,
      text: 'Đang tải tài nguyên game...',
      style: {
        font: '18px var(--font-display)',
        color: '#00e5ff'
      }
    }).setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '14px var(--font-mono)',
        color: '#ffffff'
      }
    }).setOrigin(0.5, 0.5);

    // Update progress bar
    this.load.on('progress', (value: number) => {
      percentText.setText(Math.floor(value * 100) + '%');
      progressBar.clear();
      // Glowing Cyan Fill
      progressBar.fillStyle(0x00e5ff, 1);
      progressBar.fillRoundedRect(width / 2 - 196, height / 2 - 11, 392 * value, 22, 6);
    });

    // Cleanup bar on complete
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBg.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 2. Load Visual Assets (downloaded from Stitch)
    this.load.image('bg_sky', '/assets/backgrounds/sky_clean.png');
    this.load.image('bg_mid', '/assets/backgrounds/scenery_clean.png');
    // Full atlas kept for ground block fallback usage
    this.load.image('hanoi_parallax', '/assets/backgrounds/scenery_clean.png');

    // New clean layers for the dedicated Hanoi Map Parallax scene (v2)
    this.load.image('hanoi_bg_sky', '/assets/backgrounds/bg_mid_city.png');
    this.load.image('hanoi_clouds_floating', '/assets/backgrounds/clouds_floating.png');
    this.load.image('hanoi_ground_tiles', '/assets/backgrounds/ground_tiles.png');
    this.load.image('hanoi_fg_clean_v2', '/assets/backgrounds/foreground_clean.png');
    this.load.image('hanoi_bg_far_landmarks', '/assets/backgrounds/bg_far_landmarks.png');
    this.load.image('hanoi_bg_mid_city', '/assets/backgrounds/bg_mid_city.png');
    this.load.image('tokyo_road_track', '/assets/backgrounds/road1_track.png');
    this.load.image('danang_road_track', '/assets/backgrounds/road2_track.png');

    // UI assets
    this.load.image('heart', '/assets/ui/heart.png');

    // Mascot individual spritesheets (170x204px frame cells)
    const genders = ['male', 'female'];
    const actions = ['stand', 'run', 'slip', 'fly', 'beaten'];
    genders.forEach(gender => {
      actions.forEach(action => {
        this.load.spritesheet(
          `mascot_${gender}_${action}`,
          `/assets/characters/player_${gender}_${action}.png`,
          { frameWidth: 170, frameHeight: 204 }
        );
      });
    });

    // Hanoi enemies generated from Stitch atlas cells.
    this.load.spritesheet('bug1_enemies', '/assets/images/hanoi/generated/ground_bug_walk.png', {
      frameWidth: 128,
      frameHeight: 128
    });

    this.load.spritesheet('bug2_enemies', '/assets/images/hanoi/generated/flying_bug_fly.png', {
      frameWidth: 192,
      frameHeight: 192
    });

    this.load.spritesheet('bug_ground_death', '/assets/images/hanoi/generated/ground_bug_death.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    this.load.spritesheet('bug_flying_death', '/assets/images/hanoi/generated/flying_bug_death.png', {
      frameWidth: 192,
      frameHeight: 192
    });

    // Power-ups loaded as single images
    this.load.image('respect_shield', '/assets/items/shield.png');
    this.load.image('responsibility_wings', '/assets/items/wing.png');
    this.load.image('kaizen_keyboard', '/assets/items/keyboard.png');
    this.load.spritesheet('kaizen_bullet', '/assets/images/hanoi/generated/keyboard_projectiles_sheet.png', {
      frameWidth: 256,
      frameHeight: 128
    });
    this.load.spritesheet('kaizen_bullet_explosion', '/assets/images/hanoi/generated/keyboard_explosions_sheet.png', {
      frameWidth: 256,
      frameHeight: 128
    });

    // Boss/enemy bullets generated from the Hanoi projectile atlas.
    this.load.spritesheet('boss_projectile', '/assets/images/hanoi/generated/boss_projectiles_sheet.png', {
      frameWidth: 128,
      frameHeight: 128
    });

    // Obstacle (Bomb) loaded as single image
    this.load.image('tech_debt_bomb', '/assets/items/tech_debt_boms.png');

    this.load.spritesheet('hanoi_boss', '/assets/images/hanoi/generated/boss_sheet.png', {
      frameWidth: 256,
      frameHeight: 256
    });

    // Experience flask (512x512px single icon)
    this.load.image('xp_flask', '/assets/items/xp_flask.png');

    // Fallback: If some folders fail, load placeholders
    // (Our download script has finished, so assets are ready)
  }

  create() {
    console.log('Assets preloaded successfully.');
    
    // NOTE: bg_sky / bg_mid / bg_ground are loaded as standalone images for TileSprite usage
    // hanoi_parallax atlas is kept as fallback for ground blocks

    // Define Character & Entity Animations
    this.createMascotAnimations();
    this.createEnemyAnimations();
    this.createBossAnimations();
    this.createProjectileAnimations();

    // Transition to MenuScene
    this.scene.start('MenuScene');
  }

  private createMascotAnimations() {
    const genders = ['male', 'female'];

    genders.forEach(gender => {
      this.anims.create({
        key: `${gender}_idle`,
        frames: this.anims.generateFrameNumbers(`mascot_${gender}_stand`, {
          start: 0,
          end: 5
        }),
        frameRate: 10,
        repeat: -1
      });

      this.anims.create({
        key: `${gender}_run`,
        frames: this.anims.generateFrameNumbers(`mascot_${gender}_run`, {
          start: 0,
          end: 5
        }),
        frameRate: 14,
        repeat: -1
      });

      this.anims.create({
        key: `${gender}_jump`,
        frames: this.anims.generateFrameNumbers(`mascot_${gender}_slip`, {
          start: 1,
          end: 3
        }),
        frameRate: 10,
        repeat: 0
      });

      this.anims.create({
        key: `${gender}_crouch`,
        frames: this.anims.generateFrameNumbers(`mascot_${gender}_slip`, {
          start: 0,
          end: 0
        }),
        frameRate: 10,
        repeat: -1
      });

      this.anims.create({
        key: `${gender}_fly`,
        frames: this.anims.generateFrameNumbers(`mascot_${gender}_fly`, {
          start: 2,
          end: 3
        }),
        frameRate: 10,
        repeat: -1
      });

      this.anims.create({
        key: `${gender}_hit`,
        frames: this.anims.generateFrameNumbers(`mascot_${gender}_beaten`, {
          start: 0,
          end: 2
        }),
        frameRate: 10,
        repeat: 0
      });
    });
  }

  private createEnemyAnimations() {
    this.anims.create({
      key: 'bug_staging_crawl',
      frames: this.anims.generateFrameNumbers('bug1_enemies', {
        start: 0,
        end: 7
      }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'bug_prod_fly',
      frames: this.anims.generateFrameNumbers('bug2_enemies', {
        start: 0,
        end: 3
      }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'bug_ground_death',
      frames: this.anims.generateFrameNumbers('bug_ground_death', {
        start: 0,
        end: 1
      }),
      frameRate: 8,
      repeat: 0
    });

    this.anims.create({
      key: 'bug_flying_death',
      frames: this.anims.generateFrameNumbers('bug_flying_death', {
        start: 0,
        end: 1
      }),
      frameRate: 8,
      repeat: 0
    });
  }

  private createBossAnimations() {
    this.anims.create({
      key: 'boss_idle',
      frames: this.anims.generateFrameNumbers('hanoi_boss', {
        start: 0,
        end: 7
      }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'boss_attack',
      frames: this.anims.generateFrameNumbers('hanoi_boss', {
        start: 8,
        end: 11
      }),
      frameRate: 12,
      repeat: 0
    });

    this.anims.create({
      key: 'boss_defeated',
      frames: this.anims.generateFrameNumbers('hanoi_boss', {
        start: 12,
        end: 15
      }),
      frameRate: 10,
      repeat: 0
    });
  }

  private createProjectileAnimations() {
    this.anims.create({
      key: 'kaizen_bullet_fly',
      frames: this.anims.generateFrameNumbers('kaizen_bullet', {
        start: 0,
        end: 1
      }),
      frameRate: 12,
      repeat: -1
    });

    this.anims.create({
      key: 'kaizen_bullet_explode',
      frames: this.anims.generateFrameNumbers('kaizen_bullet_explosion', {
        start: 0,
        end: 1
      }),
      frameRate: 16,
      repeat: 0
    });

    this.anims.create({
      key: 'boss_projectile_spin',
      frames: this.anims.generateFrameNumbers('boss_projectile', {
        start: 0,
        end: 0
      }),
      frameRate: 10,
      repeat: -1
    });
  }
}
