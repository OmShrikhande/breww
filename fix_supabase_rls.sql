-- ==============================================================================
-- SUPABASE SECURITY FIX: Enable Row-Level Security (RLS) on all tables in public
-- ==============================================================================
-- This script fixes the Supabase Advisor warning: "rls_disabled_in_public"
--
-- Why this is needed:
-- Supabase automatically exposes all tables in the `public` schema over its 
-- PostgREST API (https://<project-ref>.supabase.co/rest/v1/). When RLS is disabled,
-- anyone with your public anon API key can query, alter, or delete your data directly.
--
-- How it affects your Node.js backend:
-- Your Express backend connects via direct PostgreSQL connection (DATABASE_URL / postgres user).
-- The `postgres` owner role bypasses RLS by default, so your backend will continue
-- working normally without interruption while blocking unauthorized public API access.
-- ==============================================================================

-- 1. Automatically enable RLS on ALL existing tables in the public schema:
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
        RAISE NOTICE 'Enabled RLS on public.%', r.tablename;
    END LOOP;
END $$;

-- 2. Explicitly enable RLS on all known project tables (idempotent):
ALTER TABLE IF EXISTS public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.platform_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_stats_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.round_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_balance_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.player_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.player_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mines_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.aviator_bets ENABLE ROW LEVEL SECURITY;

-- 3. Verification query - Run this to confirm all public tables now have RLS enabled (rowsecurity = true):
SELECT 
    schemaname, 
    tablename, 
    rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
