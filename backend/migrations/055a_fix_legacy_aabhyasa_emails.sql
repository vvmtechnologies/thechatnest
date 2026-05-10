-- Migration 055a: Heal legacy bootstrap emails post-rebrand
--
-- Earlier deploys bootstrapped from a pre-rebrand pg_dump that contained
-- @aabhyasa.com email addresses. Subsequent migrations (066+) reference
-- the rebranded @thechatnest.com versions and fail with NOT NULL violations
-- when the lookup returns nothing. This patch updates any surviving legacy
-- emails to the new domain. Idempotent: re-running is a no-op.

UPDATE users
SET email = REPLACE(email, '@aabhyasa.com', '@thechatnest.com')
WHERE email LIKE '%@aabhyasa.com';

-- Tables that historically copied the email address into a JSON / metadata
-- column also get healed. Best-effort: silently skipped if column missing.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activity_log' AND column_name='description') THEN
    UPDATE activity_log SET description = REPLACE(description, '@aabhyasa.com', '@thechatnest.com')
    WHERE description LIKE '%@aabhyasa.com%';
  END IF;
END $$;
