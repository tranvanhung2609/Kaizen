-- DATABASE INITIALIZATION SCHEMA FOR VTI KAIZEN JOURNEY
-- Dự án: VTI 9-Year Adventure - Kaizen Journey
-- Đội thi: Kaizen Delivery Squad

-- =========================================================
-- 1. PROFILES
-- =========================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    department TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles"
ON public.profiles
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow users to update their own profiles" ON public.profiles;
CREATE POLICY "Allow users to update their own profiles"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- =========================================================
-- 2. MAP RUNS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.map_runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    map_key TEXT NOT NULL CHECK (map_key IN ('hanoi', 'tokyo', 'danang')),
    score INTEGER DEFAULT 0 NOT NULL CHECK (score >= 0),
    completion_time REAL NOT NULL CHECK (completion_time >= 0),
    boss_cleared BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.map_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to map_runs" ON public.map_runs;
CREATE POLICY "Allow public read access to map_runs"
ON public.map_runs
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert their own runs" ON public.map_runs;
CREATE POLICY "Allow authenticated users to insert their own runs"
ON public.map_runs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS map_runs_leaderboard_idx
ON public.map_runs(map_key, score DESC, completion_time ASC);


-- =========================================================
-- 3. JOURNEY SCORES
-- =========================================================

CREATE TABLE IF NOT EXISTS public.journey_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_score INTEGER DEFAULT 0 NOT NULL CHECK (total_score >= 0),
    hanoi_best_score INTEGER DEFAULT 0 NOT NULL CHECK (hanoi_best_score >= 0),
    tokyo_best_score INTEGER DEFAULT 0 NOT NULL CHECK (tokyo_best_score >= 0),
    danang_best_score INTEGER DEFAULT 0 NOT NULL CHECK (danang_best_score >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.journey_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to journey_scores" ON public.journey_scores;
CREATE POLICY "Allow public read access to journey_scores"
ON public.journey_scores
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow users to insert own journey_scores" ON public.journey_scores;
CREATE POLICY "Allow users to insert own journey_scores"
ON public.journey_scores
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update own journey_scores" ON public.journey_scores;
CREATE POLICY "Allow users to update own journey_scores"
ON public.journey_scores
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS journey_scores_leaderboard_idx
ON public.journey_scores(total_score DESC);


-- =========================================================
-- 4. HANDLE NEW GOOGLE/OAUTH USER
-- =========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    full_name_val TEXT;
    dept_val TEXT;
    match_arr TEXT[];
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Viết lại hàm cụ thể
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    full_name_val TEXT;
    dept_val TEXT;
    match_arr TEXT[];
BEGIN
    full_name_val := COALESCE(new.raw_user_meta_data->>'full_name', new.email, '');

    match_arr := regexp_match(full_name_val, '\(([^)]+)\)');

    IF match_arr IS NOT NULL AND array_length(match_arr, 1) > 0 THEN
        dept_val := match_arr[1];
    ELSE
        dept_val := '';
    END IF;

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        department,
        role
    )
    VALUES (
        new.id,
        COALESCE(new.email, ''),
        TRIM(full_name_val),
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
        TRIM(dept_val),
        'user'
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.journey_scores (user_id)
    VALUES (new.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


-- =========================================================
-- 5. AUTO UPDATE JOURNEY SCORES WHEN INSERT MAP RUN
-- =========================================================

CREATE OR REPLACE FUNCTION public.update_journey_scores_on_run()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.journey_scores (
        user_id,
        total_score,
        hanoi_best_score,
        tokyo_best_score,
        danang_best_score
    )
    VALUES (
        new.user_id,
        0,
        0,
        0,
        0
    )
    ON CONFLICT (user_id) DO NOTHING;

    IF new.map_key = 'hanoi' THEN
        UPDATE public.journey_scores
        SET hanoi_best_score = GREATEST(hanoi_best_score, new.score),
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE user_id = new.user_id;

    ELSIF new.map_key = 'tokyo' THEN
        UPDATE public.journey_scores
        SET tokyo_best_score = GREATEST(tokyo_best_score, new.score),
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE user_id = new.user_id;

    ELSIF new.map_key = 'danang' THEN
        UPDATE public.journey_scores
        SET danang_best_score = GREATEST(danang_best_score, new.score),
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE user_id = new.user_id;
    END IF;

    UPDATE public.journey_scores
    SET total_score = hanoi_best_score + tokyo_best_score + danang_best_score,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE user_id = new.user_id;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_on_map_run_insert ON public.map_runs;

CREATE TRIGGER trigger_on_map_run_insert
AFTER INSERT ON public.map_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_journey_scores_on_run();