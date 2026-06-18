import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  real,
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
    role: text('role').notNull().default('user'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    roleCheck: check('profiles_role_check', sql`${table.role} IN ('user', 'admin')`),
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

export type MapRun = typeof mapRuns.$inferSelect;
export type NewMapRun = typeof mapRuns.$inferInsert;

export type JourneyScore = typeof journeyScores.$inferSelect;
export type NewJourneyScore = typeof journeyScores.$inferInsert;