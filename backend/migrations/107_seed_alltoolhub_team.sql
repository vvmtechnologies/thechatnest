-- Migration 107: Seed ALLTOOLHUB team (10 users + departments + groups)
--
-- Populates ALLTOOLHUB organization (org_id=3) with a full test team.
-- All passwords: Bhavesh@1234
-- Bcrypt hash:   $2b$10$Q//e3Q5IHoUnSkH5gmCKE.4TM9QGk.R2njEBEjmfK.ycTAvBgr1Cm
--
-- Idempotent: safe to re-run. Uses ON CONFLICT DO UPDATE everywhere.

DO $$
DECLARE
  pw_hash TEXT := '$2b$10$Q//e3Q5IHoUnSkH5gmCKE.4TM9QGk.R2njEBEjmfK.ycTAvBgr1Cm';
  org_id_target BIGINT;
  org_owner_id BIGINT;
  eng_dept_id BIGINT;
  product_dept_id BIGINT;
  design_dept_id BIGINT;
  sales_dept_id BIGINT;
  marketing_dept_id BIGINT;
  hr_dept_id BIGINT;
BEGIN
  -- 1. Locate ALLTOOLHUB org by name (case-insensitive)
  SELECT organization_id INTO org_id_target
  FROM public.organizations
  WHERE LOWER(name) = LOWER('ALLTOOLHUB')
  ORDER BY organization_id ASC
  LIMIT 1;

  IF org_id_target IS NULL THEN
    RAISE EXCEPTION 'ALLTOOLHUB organization not found. Cannot seed team.';
  END IF;

  -- Existing owner of the ALLTOOLHUB org (cs@alltoolhub.com or similar)
  SELECT owner_id INTO org_owner_id
  FROM public.organizations
  WHERE organization_id = org_id_target;

  IF org_owner_id IS NULL THEN
    -- Fallback to first admin/owner role member
    SELECT user_id INTO org_owner_id
    FROM public.organization_members
    WHERE organization_id = org_id_target
      AND role_id IN (1, 2, 3)
      AND status = 'active'
    ORDER BY role_id ASC, joined_at ASC
    LIMIT 1;
  END IF;

  IF org_owner_id IS NULL THEN
    -- Last resort — use the first active member
    SELECT user_id INTO org_owner_id
    FROM public.organization_members
    WHERE organization_id = org_id_target AND status = 'active'
    ORDER BY joined_at ASC LIMIT 1;
  END IF;

  IF org_owner_id IS NULL THEN
    RAISE EXCEPTION 'ALLTOOLHUB has no owner — cannot seed groups (created_by FK).';
  END IF;

  RAISE NOTICE 'Seeding ALLTOOLHUB team (org_id=%, owner_user_id=%).', org_id_target, org_owner_id;

  -- 2. Departments
  INSERT INTO public.departments (name, organization_id, status) VALUES
    ('Engineering', org_id_target, 'active'),
    ('Product',     org_id_target, 'active'),
    ('Design',      org_id_target, 'active'),
    ('Sales',       org_id_target, 'active'),
    ('Marketing',   org_id_target, 'active'),
    ('HR',          org_id_target, 'active')
  ON CONFLICT (name, organization_id) DO UPDATE SET status = 'active';

  SELECT department_id INTO eng_dept_id       FROM public.departments WHERE name='Engineering' AND organization_id=org_id_target;
  SELECT department_id INTO product_dept_id   FROM public.departments WHERE name='Product'     AND organization_id=org_id_target;
  SELECT department_id INTO design_dept_id    FROM public.departments WHERE name='Design'      AND organization_id=org_id_target;
  SELECT department_id INTO sales_dept_id     FROM public.departments WHERE name='Sales'       AND organization_id=org_id_target;
  SELECT department_id INTO marketing_dept_id FROM public.departments WHERE name='Marketing'   AND organization_id=org_id_target;
  SELECT department_id INTO hr_dept_id        FROM public.departments WHERE name='HR'          AND organization_id=org_id_target;

  -- 3. Designations (Engineering as catch-all FK)
  INSERT INTO public.designations (name, organization_id, department_id, status)
  SELECT v.name, org_id_target, eng_dept_id, 'active'
  FROM (VALUES
    ('Software Engineer'),
    ('Senior Engineer'),
    ('Team Lead'),
    ('Product Manager'),
    ('UI/UX Designer'),
    ('Sales Executive'),
    ('Marketing Manager'),
    ('HR Manager'),
    ('Intern'),
    ('CTO'),
    ('Content Writer')
  ) AS v(name)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.designations d
    WHERE d.name = v.name AND d.organization_id = org_id_target
  );

  -- 4. Users — 10 new teammates for ALLTOOLHUB
  INSERT INTO public.users (email, name, mobile, password_hash, status, email_verified_at) VALUES
    ('aarav@alltoolhub.com',   'Aarav Mehta',    '+919811000001', pw_hash, 'active', NOW()),
    ('isha@alltoolhub.com',    'Isha Khanna',    '+919811000002', pw_hash, 'active', NOW()),
    ('vivek@alltoolhub.com',   'Vivek Rao',      '+919811000003', pw_hash, 'active', NOW()),
    ('sanya@alltoolhub.com',   'Sanya Kapoor',   '+919811000004', pw_hash, 'active', NOW()),
    ('karthik@alltoolhub.com', 'Karthik Iyer',   '+919811000005', pw_hash, 'active', NOW()),
    ('riya@alltoolhub.com',    'Riya Bansal',    '+919811000006', pw_hash, 'active', NOW()),
    ('aditya@alltoolhub.com',  'Aditya Sharma',  '+919811000007', pw_hash, 'active', NOW()),
    ('pooja@alltoolhub.com',   'Pooja Gupta',    '+919811000008', pw_hash, 'active', NOW()),
    ('siddharth@alltoolhub.com','Siddharth Jain','+919811000009', pw_hash, 'active', NOW()),
    ('tanvi@alltoolhub.com',   'Tanvi Desai',    '+919811000010', pw_hash, 'active', NOW())
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    status = 'active',
    email_verified_at = COALESCE(public.users.email_verified_at, NOW()),
    updated_at = NOW();

  -- 5. Add 10 users to ALLTOOLHUB org with departments + designations
  --    First user (aarav) = Team Lead role (role_id 2), rest = regular (4)
  INSERT INTO public.organization_members (organization_id, user_id, role_id, status, department_id, designation_id)
  SELECT
    org_id_target, u.user_id,
    CASE WHEN u.email = 'aarav@alltoolhub.com' THEN 2 ELSE 4 END,
    'active',
    CASE u.email
      WHEN 'aarav@alltoolhub.com'     THEN eng_dept_id
      WHEN 'vivek@alltoolhub.com'     THEN eng_dept_id
      WHEN 'karthik@alltoolhub.com'   THEN eng_dept_id
      WHEN 'aditya@alltoolhub.com'    THEN eng_dept_id
      WHEN 'isha@alltoolhub.com'      THEN design_dept_id
      WHEN 'sanya@alltoolhub.com'     THEN design_dept_id
      WHEN 'riya@alltoolhub.com'      THEN product_dept_id
      WHEN 'pooja@alltoolhub.com'     THEN marketing_dept_id
      WHEN 'siddharth@alltoolhub.com' THEN sales_dept_id
      WHEN 'tanvi@alltoolhub.com'     THEN hr_dept_id
      ELSE eng_dept_id
    END,
    (SELECT designation_id FROM public.designations
     WHERE organization_id = org_id_target
       AND name = CASE u.email
         WHEN 'aarav@alltoolhub.com'     THEN 'Team Lead'
         WHEN 'vivek@alltoolhub.com'     THEN 'Senior Engineer'
         WHEN 'karthik@alltoolhub.com'   THEN 'Software Engineer'
         WHEN 'aditya@alltoolhub.com'    THEN 'Intern'
         WHEN 'isha@alltoolhub.com'      THEN 'UI/UX Designer'
         WHEN 'sanya@alltoolhub.com'     THEN 'UI/UX Designer'
         WHEN 'riya@alltoolhub.com'      THEN 'Product Manager'
         WHEN 'pooja@alltoolhub.com'     THEN 'Marketing Manager'
         WHEN 'siddharth@alltoolhub.com' THEN 'Sales Executive'
         WHEN 'tanvi@alltoolhub.com'     THEN 'HR Manager'
         ELSE 'Software Engineer'
       END
     LIMIT 1)
  FROM public.users u
  WHERE u.email IN (
    'aarav@alltoolhub.com','isha@alltoolhub.com','vivek@alltoolhub.com',
    'sanya@alltoolhub.com','karthik@alltoolhub.com','riya@alltoolhub.com',
    'aditya@alltoolhub.com','pooja@alltoolhub.com','siddharth@alltoolhub.com',
    'tanvi@alltoolhub.com'
  )
  ON CONFLICT (organization_id, user_id) DO UPDATE SET
    status = 'active',
    role_id = EXCLUDED.role_id,
    department_id = EXCLUDED.department_id,
    designation_id = EXCLUDED.designation_id;

  -- 6. Groups (4 groups)
  INSERT INTO public.groups (group_name, group_description, organization_id, created_by, is_airtime, status)
  SELECT 'Engineering', 'Code reviews, deployments, tech decisions', org_id_target, org_owner_id, false, 'active'
  WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE group_name='Engineering' AND organization_id=org_id_target);

  INSERT INTO public.groups (group_name, group_description, organization_id, created_by, is_airtime, status)
  SELECT 'Product & Design', 'Roadmap, design reviews, feature planning', org_id_target, org_owner_id, false, 'active'
  WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE group_name='Product & Design' AND organization_id=org_id_target);

  INSERT INTO public.groups (group_name, group_description, organization_id, created_by, is_airtime, status)
  SELECT 'Sales & Marketing', 'Campaigns, leads, pipeline, deals', org_id_target, org_owner_id, false, 'active'
  WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE group_name='Sales & Marketing' AND organization_id=org_id_target);

  INSERT INTO public.groups (group_name, group_description, organization_id, created_by, is_airtime, status)
  SELECT 'Company Announcements', 'Official updates — admins only', org_id_target, org_owner_id, true, 'active'
  WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE group_name='Company Announcements' AND organization_id=org_id_target);

  -- 7. Group memberships
  -- Engineering group
  INSERT INTO public.group_members (group_id, user_id, is_admin, organization_id, status)
  SELECT g.group_id, u.user_id, u.email='aarav@alltoolhub.com', org_id_target, 'active'
  FROM public.groups g
  JOIN public.users u ON u.email IN (
    'aarav@alltoolhub.com','vivek@alltoolhub.com','karthik@alltoolhub.com','aditya@alltoolhub.com'
  )
  WHERE g.group_name='Engineering' AND g.organization_id=org_id_target
  ON CONFLICT (group_id, user_id) DO UPDATE SET status='active', is_admin=EXCLUDED.is_admin;

  -- Product & Design
  INSERT INTO public.group_members (group_id, user_id, is_admin, organization_id, status)
  SELECT g.group_id, u.user_id, u.email='riya@alltoolhub.com', org_id_target, 'active'
  FROM public.groups g
  JOIN public.users u ON u.email IN (
    'riya@alltoolhub.com','isha@alltoolhub.com','sanya@alltoolhub.com','aarav@alltoolhub.com'
  )
  WHERE g.group_name='Product & Design' AND g.organization_id=org_id_target
  ON CONFLICT (group_id, user_id) DO UPDATE SET status='active', is_admin=EXCLUDED.is_admin;

  -- Sales & Marketing
  INSERT INTO public.group_members (group_id, user_id, is_admin, organization_id, status)
  SELECT g.group_id, u.user_id, u.email='siddharth@alltoolhub.com', org_id_target, 'active'
  FROM public.groups g
  JOIN public.users u ON u.email IN (
    'siddharth@alltoolhub.com','pooja@alltoolhub.com','tanvi@alltoolhub.com'
  )
  WHERE g.group_name='Sales & Marketing' AND g.organization_id=org_id_target
  ON CONFLICT (group_id, user_id) DO UPDATE SET status='active', is_admin=EXCLUDED.is_admin;

  -- Company Announcements — everyone in ALLTOOLHUB joins, only owner is admin
  INSERT INTO public.group_members (group_id, user_id, is_admin, organization_id, status)
  SELECT g.group_id, om.user_id, om.user_id = org_owner_id, org_id_target, 'active'
  FROM public.groups g
  JOIN public.organization_members om ON om.organization_id = org_id_target AND om.status='active'
  WHERE g.group_name='Company Announcements' AND g.organization_id=org_id_target
  ON CONFLICT (group_id, user_id) DO UPDATE SET status='active', is_admin=EXCLUDED.is_admin;

  RAISE NOTICE 'ALLTOOLHUB seed complete. 10 new users + 4 groups in org %.', org_id_target;
  RAISE NOTICE 'Login with any user @alltoolhub.com / password: Bhavesh@1234';
END $$;
