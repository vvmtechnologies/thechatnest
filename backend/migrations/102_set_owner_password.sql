-- Migration 102: Set owner password to Bhavesh@1234
--
-- Sets the bcrypt hash for support@vvmtechnologies.com to the well-known
-- seed hash used elsewhere in this repo (corresponds to plaintext
-- "Bhavesh@1234"). Also ensures the account is marked active + verified
-- so the login flow doesn't bounce on OTP / verification gates.
--
-- IDEMPOTENT.

DO $$
DECLARE
  owner_email TEXT := 'support@vvmtechnologies.com';
  -- bcrypt hash of "Bhavesh@1234" (reused from migrations 065 / 066)
  pw_hash TEXT := '$2b$10$Q//e3Q5IHoUnSkH5gmCKE.4TM9QGk.R2njEBEjmfK.ycTAvBgr1Cm';
  affected INT;
BEGIN
  UPDATE public.users
  SET password_hash = pw_hash,
      status = 'active',
      email_verified_at = COALESCE(email_verified_at, NOW()),
      updated_at = NOW()
  WHERE LOWER(email) = LOWER(owner_email);

  GET DIAGNOSTICS affected = ROW_COUNT;

  IF affected = 0 THEN
    RAISE NOTICE 'Owner % not found — nothing updated.', owner_email;
  ELSE
    RAISE NOTICE 'Owner % password reset to Bhavesh@1234 (% row updated).',
      owner_email, affected;
  END IF;
END $$;
