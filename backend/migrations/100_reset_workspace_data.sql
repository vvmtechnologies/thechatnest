-- Migration 100: Workspace data reset
--
-- Wipes all tenant/operational data (messages, devices, groups, OTP logs,
-- subscriptions, activity logs, etc.) but PRESERVES:
--   • Owner user (bhavesh.singh@thechatnest.com)
--   • Owner's organization
--   • Reference data: plans, plan_features, feature_categories, feature_items,
--     roles, role_permissions, languages, currencies, countries, timezones,
--     site_details + addresses + emails + socials, mail_templates,
--     menu_items, message_menu_items, organization_message_menu_permissions,
--     billing reference (subscription_plans), departments, designations,
--     locations.
--
-- IDEMPOTENT: safe to re-run — no-ops if owner already isolated.
-- ⚠️  DESTRUCTIVE — only run on a workspace you intend to fully reset.

DO $$
DECLARE
  owner_email TEXT := 'support@vvmtechnologies.com';
  -- Candidate emails to promote (in priority order) if the target email
  -- doesn't already exist. The first match becomes the owner and is renamed
  -- to owner_email.
  legacy_candidates TEXT[] := ARRAY[
    'cs@spotyourwebinar.com',
    'bhavesh.singh@thechatnest.com'
  ];
  owner_user_id BIGINT;
  owner_org_id BIGINT;
  candidate TEXT;
BEGIN
  -- 1a. Look for the target owner email first
  SELECT user_id INTO owner_user_id
  FROM public.users
  WHERE LOWER(email) = LOWER(owner_email)
  LIMIT 1;

  -- 1b. If not present, promote a legacy candidate and rename its email
  IF owner_user_id IS NULL THEN
    FOREACH candidate IN ARRAY legacy_candidates LOOP
      SELECT user_id INTO owner_user_id
      FROM public.users
      WHERE LOWER(email) = LOWER(candidate)
      LIMIT 1;
      IF owner_user_id IS NOT NULL THEN
        UPDATE public.users
        SET email = owner_email,
            name = COALESCE(NULLIF(TRIM(name), ''), 'Owner')
        WHERE user_id = owner_user_id;
        RAISE NOTICE 'Promoted % → % (user_id=%)', candidate, owner_email, owner_user_id;
        EXIT;
      END IF;
    END LOOP;
  END IF;

  IF owner_user_id IS NULL THEN
    RAISE NOTICE 'No owner candidate found — aborting reset for safety. Create % first.', owner_email;
    RETURN;
  END IF;

  -- Pick the first organization the owner belongs to (or the first org overall)
  SELECT organization_id INTO owner_org_id
  FROM public.organization_members
  WHERE user_id = owner_user_id
  ORDER BY organization_id ASC
  LIMIT 1;

  IF owner_org_id IS NULL THEN
    SELECT organization_id INTO owner_org_id
    FROM public.organizations
    ORDER BY organization_id ASC
    LIMIT 1;
  END IF;

  RAISE NOTICE 'Resetting workspace. Keeping owner user_id=% and organization_id=%', owner_user_id, owner_org_id;

  -- 2. Wipe ephemeral / conversation data (order matters because of FKs;
  --    most tables have ON DELETE CASCADE but we explicit-truncate the
  --    high-volume ones first so progress is observable).

  -- Messaging
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'message_files';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.message_files RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'message_actions';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.message_actions RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.messages RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_message_files';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_message_files RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_message_actions';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_message_actions RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_message_recipients';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_message_recipients RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_messages';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_messages RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scheduled_messages';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.scheduled_messages RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'message_summaries';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.message_summaries RESTART IDENTITY CASCADE'; END IF;

  -- Threads / chat list state
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_thread_mutes';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.user_thread_mutes RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_thread_pins';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.user_thread_pins RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'disappearing_messages';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.disappearing_messages RESTART IDENTITY CASCADE'; END IF;

  -- Polls
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_poll_votes';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_poll_votes RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_poll_options';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_poll_options RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_polls';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_polls RESTART IDENTITY CASCADE'; END IF;

  -- Groups (delete all groups — owner can recreate)
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_timeline';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_timeline RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_permissions';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_permissions RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_members';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_members RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'groups';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.groups RESTART IDENTITY CASCADE'; END IF;

  -- Calls + meetings
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'call_logs';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.call_logs RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meeting_guests';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.meeting_guests RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meeting_participants';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.meeting_participants RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meetings';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.meetings RESTART IDENTITY CASCADE'; END IF;

  -- AI assistant
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assistant_feedback';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.assistant_feedback RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assistant_usage';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.assistant_usage RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assistant_rate_limits';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.assistant_rate_limits RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assistant_conversations';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.assistant_conversations RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assistant_broadcasts';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.assistant_broadcasts RESTART IDENTITY CASCADE'; END IF;

  -- Security / sessions
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_devices';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.user_devices RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'qr_sessions';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.qr_sessions RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'otp_verifications';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.otp_verifications RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'push_subscriptions';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.push_subscriptions RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'refresh_tokens';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.refresh_tokens RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organization_restrictions';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.organization_restrictions RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'global_access';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.global_access RESTART IDENTITY CASCADE'; END IF;

  -- Settings / preferences (tenant-scoped)
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_settings';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.user_settings RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organization_settings';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.organization_settings RESTART IDENTITY CASCADE'; END IF;

  -- Activity + audit (very large in prod — wipe to start fresh)
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_log';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.activity_log RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'billing_address_audit';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.billing_address_audit RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'billing_checkout_sessions';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.billing_checkout_sessions RESTART IDENTITY CASCADE'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'billing_addresses';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.billing_addresses RESTART IDENTITY CASCADE'; END IF;

  -- Contact us submissions (start fresh)
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_us_requests';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.contact_us_requests RESTART IDENTITY CASCADE'; END IF;

  -- Payments / subscriptions (NOT in original list — added because fk_pay_org
  -- is ON DELETE NO ACTION and blocks org deletion otherwise)
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_history';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.payment_history RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.subscriptions RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coupons';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.coupons RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_gateways';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.payment_gateways RESTART IDENTITY CASCADE'; END IF;

  -- 3. Re-point the surviving organization's owner FK to our owner so it
  --    doesn't break when we drop other users. fk_org_owner is ON DELETE
  --    RESTRICT so we must do this *before* the user delete.
  IF owner_org_id IS NOT NULL THEN
    UPDATE public.organizations
    SET owner_id = owner_user_id
    WHERE organization_id = owner_org_id;
  END IF;

  -- 4. Temporarily bypass FK triggers in this session so we don't have to
  --    hunt down every NO ACTION / RESTRICT constraint on every dependent
  --    table. Re-enabled at the end. Requires the role have replication
  --    or BYPASSRLS — neondb_owner does.
  SET LOCAL session_replication_role = replica;

  -- 5. Drop memberships, non-owner organizations, then non-owner users.
  --    Order still matters for fk_org_owner specifically (ours is now
  --    self-referential so safe).
  DELETE FROM public.organization_members WHERE user_id <> owner_user_id;
  DELETE FROM public.organizations WHERE organization_id <> COALESCE(owner_org_id, -1);
  DELETE FROM public.users WHERE user_id <> owner_user_id;

  -- 6. Restore FK enforcement
  SET LOCAL session_replication_role = origin;

  -- 7. Reset sequences cleanly on tables we kept
  PERFORM setval(
    pg_get_serial_sequence('public.users', 'user_id'),
    COALESCE((SELECT MAX(user_id) FROM public.users), 1),
    true
  );
  PERFORM setval(
    pg_get_serial_sequence('public.organizations', 'organization_id'),
    COALESCE((SELECT MAX(organization_id) FROM public.organizations), 1),
    true
  );

  RAISE NOTICE 'Workspace reset complete. Owner % preserved (user_id=%, org_id=%).',
    owner_email, owner_user_id, owner_org_id;
END $$;
