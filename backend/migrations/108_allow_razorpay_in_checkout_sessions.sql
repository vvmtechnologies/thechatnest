-- 108_allow_razorpay_in_checkout_sessions.sql
--
-- The billing_checkout_sessions.gateway column has a CHECK constraint
-- that only allowed 'stripe' or 'paypal'. With the Razorpay integration
-- now wired through createCheckoutSession, inserts with gateway='razorpay'
-- fail with:
--
--   new row for relation "billing_checkout_sessions" violates check
--   constraint "billing_checkout_sessions_gateway_check"
--
-- This migration drops the old constraint and recreates it to allow
-- 'razorpay' too. Safe to re-run (uses DROP IF EXISTS).
--
-- Future-proofing: also adds 'cashfree', 'phonepe', 'payu' so the next
-- Indian-market gateway addition only needs a code-side change, not
-- another DB migration. None of these are wired in code yet — just
-- pre-cleared in the schema so we don't repeat this dance.

BEGIN;

ALTER TABLE public.billing_checkout_sessions
  DROP CONSTRAINT IF EXISTS billing_checkout_sessions_gateway_check;

ALTER TABLE public.billing_checkout_sessions
  ADD CONSTRAINT billing_checkout_sessions_gateway_check
  CHECK ((gateway)::text = ANY (ARRAY[
    ('stripe'::character varying)::text,
    ('paypal'::character varying)::text,
    ('razorpay'::character varying)::text,
    ('cashfree'::character varying)::text,
    ('phonepe'::character varying)::text,
    ('payu'::character varying)::text
  ]));

COMMIT;
