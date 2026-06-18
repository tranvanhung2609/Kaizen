CREATE TABLE "game_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"map_key" text NOT NULL,
	"scoring_rules" jsonb NOT NULL,
	"difficulty_config" jsonb NOT NULL,
	"audio_config" jsonb NOT NULL,
	"cutscene_config" jsonb NOT NULL,
	"cultural_message" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_config_map_key_unique" UNIQUE("map_key"),
	CONSTRAINT "game_config_map_key_check" CHECK ("game_config"."map_key" IN ('hanoi', 'tokyo', 'danang'))
);
--> statement-breakpoint
CREATE TABLE "journey_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"total_score" integer DEFAULT 0 NOT NULL,
	"hanoi_best_score" integer DEFAULT 0 NOT NULL,
	"tokyo_best_score" integer DEFAULT 0 NOT NULL,
	"danang_best_score" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journey_scores_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "journey_scores_total_score_check" CHECK ("journey_scores"."total_score" >= 0),
	CONSTRAINT "journey_scores_hanoi_best_score_check" CHECK ("journey_scores"."hanoi_best_score" >= 0),
	CONSTRAINT "journey_scores_tokyo_best_score_check" CHECK ("journey_scores"."tokyo_best_score" >= 0),
	CONSTRAINT "journey_scores_danang_best_score_check" CHECK ("journey_scores"."danang_best_score" >= 0)
);
--> statement-breakpoint
CREATE TABLE "map_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"map_key" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"flasks_collected" integer DEFAULT 0 NOT NULL,
	"ground_bugs_defeated" integer DEFAULT 0 NOT NULL,
	"flying_bugs_defeated" integer DEFAULT 0 NOT NULL,
	"bosses_defeated" integer DEFAULT 0 NOT NULL,
	"hearts_remaining" integer DEFAULT 0 NOT NULL,
	"completion_time" real NOT NULL,
	"boss_cleared" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "map_runs_map_key_check" CHECK ("map_runs"."map_key" IN ('hanoi', 'tokyo', 'danang')),
	CONSTRAINT "map_runs_score_check" CHECK ("map_runs"."score" >= 0),
	CONSTRAINT "map_runs_flasks_collected_check" CHECK ("map_runs"."flasks_collected" >= 0),
	CONSTRAINT "map_runs_ground_bugs_defeated_check" CHECK ("map_runs"."ground_bugs_defeated" >= 0),
	CONSTRAINT "map_runs_flying_bugs_defeated_check" CHECK ("map_runs"."flying_bugs_defeated" >= 0),
	CONSTRAINT "map_runs_bosses_defeated_check" CHECK ("map_runs"."bosses_defeated" >= 0),
	CONSTRAINT "map_runs_hearts_remaining_check" CHECK ("map_runs"."hearts_remaining" >= 0),
	CONSTRAINT "map_runs_completion_time_check" CHECK ("map_runs"."completion_time" >= 0)
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"department" text DEFAULT '' NOT NULL,
	"nickname" text,
	"age" integer,
	"role" text DEFAULT 'user' NOT NULL,
	"flasks" integer DEFAULT 0 NOT NULL,
	"owned_skins" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"active_skin" text DEFAULT 'skin_default' NOT NULL,
	"active_title" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email"),
	CONSTRAINT "profiles_role_check" CHECK ("profiles"."role" IN ('user', 'admin')),
	CONSTRAINT "profiles_flasks_check" CHECK ("profiles"."flasks" >= 0)
);
--> statement-breakpoint
ALTER TABLE "journey_scores" ADD CONSTRAINT "journey_scores_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_runs" ADD CONSTRAINT "map_runs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;