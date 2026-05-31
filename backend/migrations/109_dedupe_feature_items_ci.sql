-- 109_dedupe_feature_items_ci.sql
--
-- The /features page on the marketing site renders the same feature
-- twice in some categories, e.g. "One-On-One Messaging" + "One-on-One
-- Messaging" both showing in the Messaging tab. Two different seed
-- migrations inserted the same feature with slightly different
-- capitalization. The existing UNIQUE(feature_category_id, title)
-- constraint is case-sensitive, so it didn't catch them.
--
-- Two-step fix:
--   1. Delete duplicate rows where the title differs ONLY by case or
--      surrounding whitespace within the same category. Keep the
--      lowest feature_item_id (oldest / canonical entry) so existing
--      foreign-key references keep working.
--   2. Add a case-insensitive expression index so the next re-seed
--      with mismatched casing fails fast instead of silently inserting
--      another duplicate.
--
-- Safe to re-run: DELETE is idempotent (won't find dupes a second
-- time), index is created with IF NOT EXISTS.

BEGIN;

-- 1) Delete duplicates within the same category by case-insensitive
-- title match. Keep the row with the smallest id (assumed canonical).
DELETE FROM public.feature_items AS dupe
USING public.feature_items AS canonical
WHERE dupe.feature_category_id = canonical.feature_category_id
  AND LOWER(TRIM(dupe.title)) = LOWER(TRIM(canonical.title))
  AND dupe.feature_item_id > canonical.feature_item_id;

-- 2) Case-insensitive uniqueness guard. Allows the existing
-- case-sensitive constraint to stay (it's a no-op now) but blocks
-- "One-On-One" vs "One-on-One" type collisions going forward.
CREATE UNIQUE INDEX IF NOT EXISTS feature_items_category_title_ci_idx
  ON public.feature_items (feature_category_id, LOWER(TRIM(title)));

COMMIT;
