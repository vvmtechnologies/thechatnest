-- Migration 101: Promote support@vvmtechnologies.com as the sole owner
--
-- Migration 100 wiped tenant data but tagged the original Bhavesh email
-- as owner. This patch:
--   1. Renames whichever surviving owner-candidate user exists to
--      support@vvmtechnologies.com (preserving user_id + organization).
--   2. Re-runs the workspace reset so any data created after 100 is also
--      cleared (idempotent against an already-clean state).
--
-- IDEMPOTENT and DESTRUCTIVE — safe to re-apply.

DO $$
DECLARE
  owner_email TEXT := 'support@vvmtechnologies.com';
  legacy_candidates TEXT[] := ARRAY[
    'cs@spotyourwebinar.com',
    'bhavesh.singh@thechatnest.com',
    'bhavesh.singh@aabhyasa.com'
  ];
  owner_user_id BIGINT;
  owner_org_id BIGINT;
  candidate TEXT;
BEGIN
  -- 1. Locate existing target owner
  SELECT user_id INTO owner_user_id
  FROM public.users
  WHERE LOWER(email) = LOWER(owner_email)
  LIMIT 1;

  -- 2. If absent, promote first surviving legacy candidate
  IF owner_user_id IS NULL THEN
    FOREACH candidate IN ARRAY legacy_candidates LOOP
      SELECT user_id INTO owner_user_id
      FROM public.users
      WHERE LOWER(email) = LOWER(candidate)
      LIMIT 1;
      IF owner_user_id IS NOT NULL THEN
        UPDATE public.users
        SET email = owner_email,
            name = COALESCE(NULLIF(TRIM(name), ''), 'Owner'),
            email_verified = COALESCE(email_verified, true),
            updated_at = NOW()
        WHERE user_id = owner_user_id;
        RAISE NOTICE 'Promoted % → % (user_id=%)', candidate, owner_email, owner_user_id;
        EXIT;
      END IF;
    END LOOP;
  END IF;

  IF owner_user_id IS NULL THEN
    RAISE NOTICE 'No owner candidate found in users table — nothing to do.';
    RETURN;
  END IF;

  -- 3. Find owner's organization (first one they belong to, else first org overall)
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

  -- 4. Re-wipe tenant data (covers anything created between 100 and now)
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
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_thread_mutes';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.user_thread_mutes RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_thread_pins';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.user_thread_pins RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'disappearing_messages';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.disappearing_messages RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_poll_votes';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_poll_votes RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_poll_options';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_poll_options RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_polls';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_polls RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_timeline';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_timeline RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_permissions';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_permissions RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_members';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.group_members RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'groups';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.groups RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'call_logs';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.call_logs RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meeting_guests';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.meeting_guests RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meeting_participants';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.meeting_participants RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meetings';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.meetings RESTART IDENTITY CASCADE'; END IF;
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
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_settings';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.user_settings RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organization_settings';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.organization_settings RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_log';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.activity_log RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'billing_address_audit';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.billing_address_audit RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'billing_checkout_sessions';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.billing_checkout_sessions RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'billing_addresses';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.billing_addresses RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_us_requests';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.contact_us_requests RESTART IDENTITY CASCADE'; END IF;

  -- 5. Re-point owner FK on surviving org before dropping other users
  IF owner_org_id IS NOT NULL THEN
    UPDATE public.organizations SET owner_id = owner_user_id
    WHERE organization_id = owner_org_id;
  END IF;

  -- 5a. Wipe payment / subscription tables (FKs to org are NO ACTION)
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='payment_history';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.payment_history RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='subscriptions';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.subscriptions RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='coupons';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.coupons RESTART IDENTITY CASCADE'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='payment_gateways';
  IF FOUND THEN EXECUTE 'TRUNCATE TABLE public.payment_gateways RESTART IDENTITY CASCADE'; END IF;

  -- 6. Bypass FK enforcement for the user/org wipe so we don't have to
  --    chase every NO ACTION constraint on every legacy table.
  SET LOCAL session_replication_role = replica;
  DELETE FROM public.organization_members WHERE user_id <> owner_user_id;
  DELETE FROM public.organizations WHERE organization_id <> COALESCE(owner_org_id, -1);
  DELETE FROM public.users WHERE user_id <> owner_user_id;
  SET LOCAL session_replication_role = origin;

  RAISE NOTICE 'Owner now: % (user_id=%, org_id=%). All other tenant data wiped.',
    owner_email, owner_user_id, owner_org_id;
END $$;
