ALTER TABLE "game_config" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "game_config" CASCADE;--> statement-breakpoint
ALTER TABLE "map_runs" DROP CONSTRAINT "map_runs_flasks_collected_check";--> statement-breakpoint
ALTER TABLE "map_runs" DROP CONSTRAINT "map_runs_ground_bugs_defeated_check";--> statement-breakpoint
ALTER TABLE "map_runs" DROP CONSTRAINT "map_runs_flying_bugs_defeated_check";--> statement-breakpoint
ALTER TABLE "map_runs" DROP CONSTRAINT "map_runs_bosses_defeated_check";--> statement-breakpoint
ALTER TABLE "map_runs" DROP CONSTRAINT "map_runs_hearts_remaining_check";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_flasks_check";--> statement-breakpoint
ALTER TABLE "map_runs" DROP COLUMN "flasks_collected";--> statement-breakpoint
ALTER TABLE "map_runs" DROP COLUMN "ground_bugs_defeated";--> statement-breakpoint
ALTER TABLE "map_runs" DROP COLUMN "flying_bugs_defeated";--> statement-breakpoint
ALTER TABLE "map_runs" DROP COLUMN "bosses_defeated";--> statement-breakpoint
ALTER TABLE "map_runs" DROP COLUMN "hearts_remaining";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "nickname";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "age";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "flasks";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "owned_skins";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "active_skin";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "active_title";