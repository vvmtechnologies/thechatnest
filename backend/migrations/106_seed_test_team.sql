-- Migration 106: Seed test team (users + departments + groups)
--
-- Re-populates the workspace after migration 104's hard reset.
-- All passwords: Bhavesh@1234
-- Bcrypt hash:   $2b$10$Q//e3Q5IHoUnSkH5gmCKE.4TM9QGk.R2njEBEjmfK.ycTAvBgr1Cm
--
-- Idempotent: safe to re-run. Uses ON CONFLICT DO UPDATE everywhere.

DO $$
DECLARE
  owner_email TEXT := 'support@vvmtechnologies.com';
  pw_hash TEXT := '$2b$10$Q//e3Q5IHoUnSkH5gmCKE.4TM9QGk.R2njEBEjmfK.ycTAvBgr1Cm';
  owner_user_id BIGINT;
  owner_org_id BIGINT;
  eng_dept_id BIGINT;
  product_dept_id BIGINT;
  design_dept_id BIGINT;
  sales_dept_id BIGINT;
  hr_dept_id BIGINT;
BEGIN
  -- 1. Locate owner + org
  SELECT user_id INTO owner_user_id
  FROM public.users
  WHERE LOWER(email) = LOWER(owner_email) LIMIT 1;

  IF owner_user_id IS NULL THEN
    RAISE EXCEPTION 'Owner % not found. Run migration 104 first.', owner_email;
  END IF;

  SELECT organization_id INTO owner_org_id
  FROM public.organization_members
  WHERE user_id = owner_user_id
  ORDER BY organization_id ASC LIMIT 1;

  IF owner_org_id IS NULL THEN
    SELECT organization_id INTO owner_org_id
    FROM public.organizations ORDER BY organization_id ASC LIMIT 1;
  END IF;

  IF owner_org_id IS NULL THEN
    RAISE EXCEPTION 'No organization found.';
  END IF;

  RAISE NOTICE 'Seeding team for org_id=% (owner=%).', owner_org_id, owner_email;

  -- 2. Departments
  INSERT INTO public.departments (name, organization_id, status) VALUES
    ('Engineering', owner_org_id, 'active'),
    ('Product',     owner_org_id, 'active'),
    ('Design',      owner_org_id, 'active'),
    ('Sales',       owner_org_id, 'active'),
    ('HR',          owner_org_id, 'active')
  ON CONFLICT (name, organization_id) DO UPDATE SET status = 'active';

  SELECT department_id INTO eng_dept_id     FROM public.departments WHERE name='Engineering' AND organization_id=owner_org_id;
  SELECT department_id INTO product_dept_id FROM public.departments WHERE name='Product'     AND organization_id=owner_org_id;
  SELECT department_id INTO design_dept_id  FROM public.departments WHERE name='Design'      AND organization_id=owner_org_id;
  SELECT department_id INTO sales_dept_id   FROM public.departments WHERE name='Sales'       AND organization_id=owner_org_id;
  SELECT department_id INTO hr_dept_id      FROM public.departments WHERE name='HR'          AND organization_id=owner_org_id;

  -- 3. Designations (Engineering as catch-all department FK)
  INSERT INTO public.designations (name, organization_id, department_id, status)
  SELECT v.name, owner_org_id, eng_dept_id, 'active'
  FROM (VALUES
    ('Software Engineer'),
    ('Senior Engineer'),
    ('Team Lead'),
    ('Product Manager'),
    ('UI/UX Designer'),
    ('Sales Executive'),
    ('HR Manager'),
    ('Intern'),
    ('CTO')
  ) AS v(name)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.designations d
    WHERE d.name = v.name AND d.organization_id = owner_org_id
  );

  -- 4. Users (8 teammates + 1 admin)
  INSERT INTO public.users (email, name, mobile, password_hash, status, email_verified_at) VALUES
    ('bhavesh@thechatnest.com',  'Bhavesh Singh', '+919800001001', pw_hash, 'active', NOW()),
    ('rahul@thechatnest.com',    'Rahul Sharma',  '+919800001002', pw_hash, 'active', NOW()),
    ('priya@thechatnest.com',    'Priya Verma',   '+919800001003', pw_hash, 'active', NOW()),
    ('amit@thechatnest.com',     'Amit Patel',    '+919800001004', pw_hash, 'active', NOW()),
    ('neha@thechatnest.com',     'Neha Gupta',    '+919800001005', pw_hash, 'active', NOW()),
    ('rohan@thechatnest.com',    'Rohan Kumar',   '+919800001006', pw_hash, 'active', NOW()),
    ('ananya@thechatnest.com',   'Ananya Reddy',  '+919800001007', pw_hash, 'active', NOW()),
    ('arjun@thechatnest.com',    'Arjun Mehta',   '+919800001008', pw_hash, 'active', NOW()),
    ('kavita@thechatnest.com',   'Kavita Joshi',  '+919800001009', pw_hash, 'active', NOW())
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    status = 'active',
    email_verified_at = COALESCE(public.users.email_verified_at, NOW()),
    updated_at = NOW();

  -- 5. Add to organization
  --    bhavesh = admin (role_id 2), others = regular (role_id 4)
  INSERT INTO public.organization_members (organization_id, user_id, role_id, status, department_id, designation_id)
  SELECT
    owner_org_id, u.user_id,
    CASE WHEN u.email = 'bhavesh@thechatnest.com' THEN 2 ELSE 4 END,
    'active',
    CASE u.email
      WHEN 'bhavesh@thechatnest.com'  THEN eng_dept_id
      WHEN 'rahul@thechatnest.com'    THEN eng_dept_id
      WHEN 'amit@thechatnest.com'     THEN eng_dept_id
      WHEN 'rohan@thechatnest.com'    THEN eng_dept_id
      WHEN 'priya@thechatnest.com'    THEN design_dept_id
      WHEN 'neha@thechatnest.com'     THEN product_dept_id
      WHEN 'kavita@thechatnest.com'   THEN product_dept_id
      WHEN 'ananya@thechatnest.com'   THEN sales_dept_id
      WHEN 'arjun@thechatnest.com'    THEN sales_dept_id
      ELSE eng_dept_id
    END,
    (SELECT designation_id FROM public.designations
     WHERE organization_id = owner_org_id
       AND name = CASE u.email
         WHEN 'bhavesh@thechatnest.com'  THEN 'CTO'
         WHEN 'rahul@thechatnest.com'    THEN 'Team Lead'
         WHEN 'amit@thechatnest.com'     THEN 'Senior Engineer'
         WHEN 'rohan@thechatnest.com'    THEN 'Software Engineer'
         WHEN 'priya@thechatnest.com'    THEN 'UI/UX Designer'
         WHEN 'neha@thechatnest.com'     THEN 'Product Manager'
         WHEN 'kavita@thechatnest.com'   THEN 'Product Manager'
         WHEN 'ananya@thechatnest.com'   THEN 'Sales Executive'
         WHEN 'arjun@thechatnest.com'    THEN 'Team Lead'
         ELSE 'Software Engineer'
       END
     LIMIT 1)
  FROM public.users u
  WHERE u.email IN (
    'bhavesh@thechatnest.com','rahul@thechatnest.com','priya@thechatnest.com',
    'amit@thechatnest.com','neha@thechatnest.com','rohan@thechatnest.com',
    'ananya@thechatnest.com','arjun@thechatnest.com','kavita@thechatnest.com'
  )
  ON CONFLICT (organization_id, user_id) DO UPDATE SET
    status = 'active',
    role_id = EXCLUDED.role_id,
    department_id = EXCLUDED.department_id,
    designation_id = EXCLUDED.designation_id;

  -- 6. Groups
  INSERT INTO public.groups (group_name, group_description, organization_id, created_by, is_airtime, status)
  SELECT 'Engineering', 'Code reviews, deployments, tech decisions', owner_org_id, owner_user_id, false, 'active'
  WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE group_name='Engineering' AND organization_id=owner_org_id);

  INSERT INTO public.groups (group_name, group_description, organization_id, created_by, is_airtime, status)
  SELECT 'Product & Design', 'Roadmap, design reviews, feature planning', owner_org_id, owner_user_id, false, 'active'
  WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE group_name='Product & Design' AND organization_id=owner_org_id);

  INSERT INTO public.groups (group_name, group_description, organization_id, created_by, is_airtime, status)
  SELECT 'Sales Team', 'Pipeline, leads, deals', owner_org_id, owner_user_id, false, 'active'
  WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE group_name='Sales Team' AND organization_id=owner_org_id);

  INSERT INTO public.groups (group_name, group_description, organization_id, created_by, is_airtime, status)
  SELECT 'Company Announcements', 'Official updates — admins only', owner_org_id, owner_user_id, true, 'active'
  WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE group_name='Company Announcements' AND organization_id=owner_org_id);

  -- 7. Group memberships
  -- Engineering group: bhavesh (admin) + engineering team
  INSERT INTO public.group_members (group_id, user_id, is_admin, organization_id, status)
  SELECT g.group_id, u.user_id, u.email='bhavesh@thechatnest.com', owner_org_id, 'active'
  FROM public.groups g
  JOIN public.users u ON u.email IN (
    'bhavesh@thechatnest.com','rahul@thechatnest.com','amit@thechatnest.com','rohan@thechatnest.com'
  )
  WHERE g.group_name='Engineering' AND g.organization_id=owner_org_id
  ON CONFLICT (group_id, user_id) DO UPDATE SET status='active', is_admin=EXCLUDED.is_admin;

  -- Product & Design group
  INSERT INTO public.group_members (group_id, user_id, is_admin, organization_id, status)
  SELECT g.group_id, u.user_id, u.email='bhavesh@thechatnest.com', owner_org_id, 'active'
  FROM public.groups g
  JOIN public.users u ON u.email IN (
    'bhavesh@thechatnest.com','neha@thechatnest.com','kavita@thechatnest.com','priya@thechatnest.com'
  )
  WHERE g.group_name='Product & Design' AND g.organization_id=owner_org_id
  ON CONFLICT (group_id, user_id) DO UPDATE SET status='active', is_admin=EXCLUDED.is_admin;

  -- Sales Team group
  INSERT INTO public.group_members (group_id, user_id, is_admin, organization_id, status)
  SELECT g.group_id, u.user_id, u.email='bhavesh@thechatnest.com', owner_org_id, 'active'
  FROM public.groups g
  JOIN public.users u ON u.email IN (
    'bhavesh@thechatnest.com','ananya@thechatnest.com','arjun@thechatnest.com'
  )
  WHERE g.group_name='Sales Team' AND g.organization_id=owner_org_id
  ON CONFLICT (group_id, user_id) DO UPDATE SET status='active', is_admin=EXCLUDED.is_admin;

  -- Company Announcements (airtime — everyone joins, only bhavesh admin)
  INSERT INTO public.group_members (group_id, user_id, is_admin, organization_id, status)
  SELECT g.group_id, u.user_id, u.email='bhavesh@thechatnest.com', owner_org_id, 'active'
  FROM public.groups g
  JOIN public.users u ON u.email LIKE '%@thechatnest.com'
  WHERE g.group_name='Company Announcements' AND g.organization_id=owner_org_id
  ON CONFLICT (group_id, user_id) DO UPDATE SET status='active', is_admin=EXCLUDED.is_admin;

  RAISE NOTICE 'Seed complete. 9 users + 4 groups in org %.', owner_org_id;
  RAISE NOTICE 'Login with any user @thechatnest.com / password: Bhavesh@1234';
END $$;
