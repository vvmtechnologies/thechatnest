-- Migration 055c: Heal legacy brand strings in site_detail_emails and any
-- other tables not covered by 055b.
-- Idempotent: safe to re-run.

-- site_detail_emails (footer contact emails)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='site_detail_emails') THEN
    UPDATE public.site_detail_emails
    SET email_address = REPLACE(REPLACE(REPLACE(email_address,
        '@teamchatx.com', '@thechatnest.com'),
        '@aabhyasa.com', '@thechatnest.com'),
        '@TeamChatX.com', '@thechatnest.com')
    WHERE email_address ~* '(teamchatx|aabhyasa)';

    UPDATE public.site_detail_emails
    SET label = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(label,
        'TeamChatX', 'TheChatNest'),
        'TeamChatx', 'TheChatNest'),
        'Teamchatx', 'TheChatNest'),
        'teamchatx', 'thechatnest'),
        'Aabhyasa', 'Thechatnest'),
        'aabhyasa', 'thechatnest')
    WHERE label IS NOT NULL AND label ~* '(teamchatx|aabhyasa)';
  END IF;
END $$;

-- site_details: brand name, logo url, tagline, footer text etc
DO $$
DECLARE
  rec RECORD;
  upd_sql TEXT;
BEGIN
  FOR rec IN
    SELECT c.table_name, c.column_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.data_type IN ('text', 'character varying', 'varchar')
      AND c.table_name IN ('site_details', 'site_detail_addresses', 'site_detail_socials')
  LOOP
    upd_sql := format(
      'UPDATE public.%I SET %I = ' ||
      'replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(' ||
      '%I, ''TeamChatX'', ''TheChatNest''), ''TeamChatx'', ''TheChatNest''), ''Teamchatx'', ''TheChatNest''),' ||
      ' ''TeamChat'', ''TheChatNest''), ''teamChatx'', ''thechatnest''), ''teamchatX'', ''thechatnest''),' ||
      ' ''teamchatx'', ''thechatnest''), ''AABHYASA'', ''THECHATNEST''), ''Aabhyasa'', ''Thechatnest''),' ||
      ' ''aabhyasa'', ''thechatnest'')' ||
      ' WHERE %I ~* ''(teamchat|aabhyasa)''',
      rec.table_name, rec.column_name, rec.column_name, rec.column_name
    );
    BEGIN
      EXECUTE upd_sql;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped %.%: %', rec.table_name, rec.column_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- Other tables likely to carry brand text we missed in 055b
DO $$
DECLARE
  rec RECORD;
  upd_sql TEXT;
BEGIN
  FOR rec IN
    SELECT c.table_name, c.column_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.data_type IN ('text', 'character varying', 'varchar')
      AND c.table_name IN (
        'organizations',
        'organization_settings',
        'contact_us_requests',
        'plans',
        'plan_features',
        'subscription_plans',
        'menu_items',
        'message_menu_items',
        'desktop_apps',
        'help_articles',
        'help_topics',
        'help_videos',
        'mail_templates'
      )
  LOOP
    upd_sql := format(
      'UPDATE public.%I SET %I = ' ||
      'replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(' ||
      '%I, ''TeamChatX'', ''TheChatNest''), ''TeamChatx'', ''TheChatNest''), ''Teamchatx'', ''TheChatNest''),' ||
      ' ''TeamChat'', ''TheChatNest''), ''teamChatx'', ''thechatnest''), ''teamchatX'', ''thechatnest''),' ||
      ' ''teamchatx'', ''thechatnest''), ''AABHYASA'', ''THECHATNEST''), ''Aabhyasa'', ''Thechatnest''),' ||
      ' ''aabhyasa'', ''thechatnest'')' ||
      ' WHERE %I ~* ''(teamchat|aabhyasa)''',
      rec.table_name, rec.column_name, rec.column_name, rec.column_name
    );
    BEGIN
      EXECUTE upd_sql;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped %.%: %', rec.table_name, rec.column_name, SQLERRM;
    END;
  END LOOP;
END $$;
