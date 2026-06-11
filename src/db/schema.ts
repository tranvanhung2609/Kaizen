import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  real,
  jsonb,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey(), // FK auth.users(id) tạo bằng SQL migration
    email: text('email').unique().notNull(),
    fullName: text('full_name'),
    avatarUrl: text('avatar_url'),
    department: text('department').default('').notNull(),
    nickname: text('nickname'),
    age: integer('age'),
    role: text('role').notNull().default('user'),

    flasks: integer('flasks').default(0).notNull(),
    ownedSkins: jsonb('owned_skins').$type<string[]>().default([]).notNull(),
    activeSkin: text('active_skin').default('skin_default').notNull(),
    activeTitle: text('active_title').default('').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    roleCheck: check('profiles_role_check', sql`${table.role} IN ('user', 'admin')`),
    flasksCheck: check('profiles_flasks_check', sql`${table.flasks} >= 0`),
  }),
);

export const gameConfig = pgTable(
  'game_config',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    mapKey: text('map_key').unique().notNull(),
    scoringRules: jsonb('scoring_rules').notNull(),
    difficultyConfig: jsonb('difficulty_config').notNull(),
    audioConfig: jsonb('audio_config').notNull(),
    cutsceneConfig: jsonb('cutscene_config').notNull(),
    culturalMessage: text('cultural_message').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    mapKeyCheck: check(
      'game_config_map_key_check',
      sql`${table.mapKey} IN ('hanoi', 'tokyo', 'danang')`,
    ),
  }),
);

export const mapRuns = pgTable(
  'map_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    mapKey: text('map_key').notNull(),
    score: integer('score').default(0).notNull(),
    flasksCollected: integer('flasks_collected').default(0).notNull(),
    groundBugsDefeated: integer('ground_bugs_defeated').default(0).notNull(),
    flyingBugsDefeated: integer('flying_bugs_defeated').default(0).notNull(),
    bossesDefeated: integer('bosses_defeated').default(0).notNull(),
    heartsRemaining: integer('hearts_remaining').default(0).notNull(),
    completionTime: real('completion_time').notNull(),
    bossCleared: boolean('boss_cleared').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    mapKeyCheck: check(
      'map_runs_map_key_check',
      sql`${table.mapKey} IN ('hanoi', 'tokyo', 'danang')`,
    ),
    scoreCheck: check('map_runs_score_check', sql`${table.score} >= 0`),
    flasksCollectedCheck: check(
      'map_runs_flasks_collected_check',
      sql`${table.flasksCollected} >= 0`,
    ),
    groundBugsDefeatedCheck: check(
      'map_runs_ground_bugs_defeated_check',
      sql`${table.groundBugsDefeated} >= 0`,
    ),
    flyingBugsDefeatedCheck: check(
      'map_runs_flying_bugs_defeated_check',
      sql`${table.flyingBugsDefeated} >= 0`,
    ),
    bossesDefeatedCheck: check(
      'map_runs_bosses_defeated_check',
      sql`${table.bossesDefeated} >= 0`,
    ),
    heartsRemainingCheck: check(
      'map_runs_hearts_remaining_check',
      sql`${table.heartsRemaining} >= 0`,
    ),
    completionTimeCheck: check(
      'map_runs_completion_time_check',
      sql`${table.completionTime} >= 0`,
    ),
  }),
);

export const journeyScores = pgTable(
  'journey_scores',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    totalScore: integer('total_score').default(0).notNull(),
    hanoiBestScore: integer('hanoi_best_score').default(0).notNull(),
    tokyoBestScore: integer('tokyo_best_score').default(0).notNull(),
    danangBestScore: integer('danang_best_score').default(0).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    totalScoreCheck: check('journey_scores_total_score_check', sql`${table.totalScore} >= 0`),
    hanoiBestScoreCheck: check(
      'journey_scores_hanoi_best_score_check',
      sql`${table.hanoiBestScore} >= 0`,
    ),
    tokyoBestScoreCheck: check(
      'journey_scores_tokyo_best_score_check',
      sql`${table.tokyoBestScore} >= 0`,
    ),
    danangBestScoreCheck: check(
      'journey_scores_danang_best_score_check',
      sql`${table.danangBestScore} >= 0`,
    ),
  }),
);

export const profilesRelations = relations(profiles, ({ many, one }) => ({
  mapRuns: many(mapRuns),
  journeyScore: one(journeyScores, {
    fields: [profiles.id],
    references: [journeyScores.userId],
  }),
}));

export const mapRunsRelations = relations(mapRuns, ({ one }) => ({
  profile: one(profiles, {
    fields: [mapRuns.userId],
    references: [profiles.id],
  }),
}));

export const journeyScoresRelations = relations(journeyScores, ({ one }) => ({
  profile: one(profiles, {
    fields: [journeyScores.userId],
    references: [profiles.id],
  }),
}));

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type GameConfig = typeof gameConfig.$inferSelect;
export type NewGameConfig = typeof gameConfig.$inferInsert;

export type MapRun = typeof mapRuns.$inferSelect;
export type NewMapRun = typeof mapRuns.$inferInsert;

export type JourneyScore = typeof journeyScores.$inferSelect;
export type NewJourneyScore = typeof journeyScores.$inferInsert;