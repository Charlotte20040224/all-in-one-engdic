-- ============================================================
-- Row-Level Security policies for all-in-one-engdic
-- ============================================================
-- Background:
--   This app connects to Supabase Postgres directly via Prisma
--   using the `postgres` role (which has BYPASSRLS = true).
--   The app does NOT use supabase-js / the REST API.
--
--   Therefore:
--   - Enabling RLS does NOT affect Prisma queries (postgres bypasses).
--   - Policies below restrict only the `anon` / `authenticated` roles
--     used by Supabase REST / supabase-js, providing defense-in-depth
--     in case those keys are ever exposed.
--   - Since the app uses NextAuth (not Supabase Auth), `auth.uid()`
--     will be NULL for any non-authenticated REST call, which means
--     all "self-only" policies will deny access. That's intended.
--
-- Notes on naming:
--   - Tables are lower_snake_case (Prisma @@map): users, posts, etc.
--   - Columns are camelCase (Prisma default), so "userId", "isPublic",
--     "createdAt" must be double-quoted.
--   - userId columns are TEXT (Prisma String), so we cast auth.uid()
--     (UUID) to text for comparison.
--
-- This SQL is idempotent — safe to re-run.
-- ============================================================

-- ============================================================
-- Step 1: Enable RLS on every public table
-- ============================================================
-- App data tables
ALTER TABLE public.users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments  ENABLE ROW LEVEL SECURITY;

-- NextAuth / internal tables (RLS only, no policies — REST denies all)
ALTER TABLE public.accounts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback            ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Step 2: Policies (only for tables that need REST access)
-- ============================================================

-- ---------- users: only self can read/update ----------
DROP POLICY IF EXISTS users_select_self ON public.users;
CREATE POLICY users_select_self ON public.users
  FOR SELECT USING (auth.uid()::text = id);

DROP POLICY IF EXISTS users_update_self ON public.users;
CREATE POLICY users_update_self ON public.users
  FOR UPDATE USING (auth.uid()::text = id)
              WITH CHECK (auth.uid()::text = id);

-- ---------- words: owner-only ----------
DROP POLICY IF EXISTS words_owner_all ON public.words;
CREATE POLICY words_owner_all ON public.words
  FOR ALL USING (auth.uid()::text = "userId")
          WITH CHECK (auth.uid()::text = "userId");

-- ---------- sentences: owner-only ----------
DROP POLICY IF EXISTS sentences_owner_all ON public.sentences;
CREATE POLICY sentences_owner_all ON public.sentences
  FOR ALL USING (auth.uid()::text = "userId")
          WITH CHECK (auth.uid()::text = "userId");

-- ---------- posts: public-or-own SELECT, owner-only write ----------
DROP POLICY IF EXISTS posts_select_public_or_own ON public.posts;
CREATE POLICY posts_select_public_or_own ON public.posts
  FOR SELECT USING ("isPublic" = true OR auth.uid()::text = "userId");

DROP POLICY IF EXISTS posts_insert_own ON public.posts;
CREATE POLICY posts_insert_own ON public.posts
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS posts_update_own ON public.posts;
CREATE POLICY posts_update_own ON public.posts
  FOR UPDATE USING (auth.uid()::text = "userId")
              WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS posts_delete_own ON public.posts;
CREATE POLICY posts_delete_own ON public.posts
  FOR DELETE USING (auth.uid()::text = "userId");

-- ---------- likes: everyone reads, owner writes ----------
DROP POLICY IF EXISTS likes_select_all ON public.likes;
CREATE POLICY likes_select_all ON public.likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS likes_insert_own ON public.likes;
CREATE POLICY likes_insert_own ON public.likes
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS likes_delete_own ON public.likes;
CREATE POLICY likes_delete_own ON public.likes
  FOR DELETE USING (auth.uid()::text = "userId");

-- ---------- comments: everyone reads, owner writes ----------
DROP POLICY IF EXISTS comments_select_all ON public.comments;
CREATE POLICY comments_select_all ON public.comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS comments_insert_own ON public.comments;
CREATE POLICY comments_insert_own ON public.comments
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS comments_delete_own ON public.comments;
CREATE POLICY comments_delete_own ON public.comments
  FOR DELETE USING (auth.uid()::text = "userId");

-- ============================================================
-- Verification query — run after applying to confirm all 12 tables
-- have rowsecurity = true:
-- ============================================================
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
