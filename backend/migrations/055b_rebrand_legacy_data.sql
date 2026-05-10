-- Migration 055b: Heal legacy brand text in seeded data post-rebrand
--
-- An earlier deploy bootstrapped DB content from a pre-rebrand pg_dump that
-- still contained "TeamChatX", "TeamChat", "Aabhyasa" etc. The dump file has
-- since been cleaned, but the DB rows persist. This patch sweeps text/jsonb
-- columns of seed-data tables and rewrites brand strings.
--
-- Idempotent: applying twice is a no-op.

DO $$
DECLARE
  rec RECORD;
  upd_sql TEXT;
BEGIN
  FOR rec IN
    SELECT c.table_name, c.column_name, c.data_type
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.data_type IN ('text', 'character varying', 'varchar')
      AND c.table_name IN (
        'feature_items',
        'feature_categories',
        'organizations',
        'organization_members',
        'mail_templates',
        'system_settings',
        'site_details',
        'app_settings',
        'assistant_knowledge',
        'assistant_broadcasts',
        'menu_items',
        'message_menu_items',
        'departments',
        'designations',
        'languages',
        'currencies',
        'countries',
        'global_access',
        'subscription_plans',
        'roles'
      )
  LOOP
    upd_sql := format(
      'UPDATE public.%I SET %I = ' ||
      'replace(replace(replace(replace(replace(replace(replace(replace(replace(' ||
      '%I, ''TeamChatX'', ''TheChatNest''), ''TeamChatx'', ''TheChatNest''), ''Teamchatx'', ''TheChatNest''),' ||
      ' ''teamChatx'', ''thechatnest''), ''teamchatX'', ''thechatnest''), ''teamchatx'', ''thechatnest''),' ||
      ' ''AABHYASA'', ''THECHATNEST''), ''Aabhyasa'', ''Thechatnest''), ''aabhyasa'', ''thechatnest'')' ||
      ' WHERE %I ~ ''(?i)teamchat|aabhyasa''',
      rec.table_name, rec.column_name, rec.column_name, rec.column_name
    );
    BEGIN
      EXECUTE upd_sql;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped %.%: %', rec.table_name, rec.column_name, SQLERRM;
    END;
  END LOOP;

  -- TeamChat (without trailing X) — separate pass so it doesn't double-replace
  -- the already-corrected "TheChatNest" output of the first pass.
  FOR rec IN
    SELECT c.table_name, c.column_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.data_type IN ('text', 'character varying', 'varchar')
      AND c.table_name IN (
        'feature_items',
        'feature_categories',
        'mail_templates',
        'system_settings',
        'site_details',
        'app_settings',
        'menu_items',
        'message_menu_items'
      )
  LOOP
    upd_sql := format(
      'UPDATE public.%I SET %I = replace(replace(%I, ''TeamChat'', ''TheChatNest''), ''teamchat'', ''thechatnest'')' ||
      ' WHERE %I ~ ''(?i)teamchat''',
      rec.table_name, rec.column_name, rec.column_name, rec.column_name
    );
    BEGIN
      EXECUTE upd_sql;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped %.%: %', rec.table_name, rec.column_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- jsonb columns (brand can hide in metadata) — best-effort, common tables only
DO $$
DECLARE
  rec RECORD;
  upd_sql TEXT;
BEGIN
  FOR rec IN
    SELECT c.table_name, c.column_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.data_type = 'jsonb'
      AND c.table_name IN (
        'feature_items', 'feature_categories', 'site_details', 'app_settings',
        'system_settings', 'mail_templates', 'organizations'
      )
  LOOP
    upd_sql := format(
      'UPDATE public.%I SET %I = ' ||
      'replace(replace(replace(replace(replace(replace(' ||
      '%I::text, ''TeamChatX'', ''TheChatNest''), ''TeamChatx'', ''TheChatNest''),' ||
      ' ''TeamChat'', ''TheChatNest''), ''teamchatx'', ''thechatnest''),' ||
      ' ''Aabhyasa'', ''Thechatnest''), ''aabhyasa'', ''thechatnest'')::jsonb' ||
      ' WHERE %I::text ~ ''(?i)teamchat|aabhyasa''',
      rec.table_name, rec.column_name, rec.column_name, rec.column_name
    );
    BEGIN
      EXECUTE upd_sql;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped %.% (jsonb): %', rec.table_name, rec.column_name, SQLERRM;
    END;
  END LOOP;
END $$;
