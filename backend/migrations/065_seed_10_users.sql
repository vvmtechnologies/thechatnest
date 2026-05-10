-- Migration 065: Seed 10 test users
-- Password for all: Bhavesh@1234

-- Insert users
INSERT INTO users (email, name, mobile, password_hash, status, email_verified_at)
VALUES
  ('rahul.sharma@thechatnest.com', 'Rahul Sharma', '+919876543210', '$2b$10$Q//e3Q5IHoUnSkH5gmCKE.4TM9QGk.R2njEBEjmfK.ycTAvBgr1Cm', 'active', NOW()),
  ('priya.verma@thechatnest.com', 'Priya Verma', '+919876543211', '$2b$10$Q//e3Q5IHoUnSkH5gmCKE.4TM9QGk.R2njEBEjmfK.ycTAvBgr1Cm', 'active', NOW()),
  ('amit.patel@thechatnest.com', 'Amit Patel', '+919876543212', '$2b$10$Q//e3Q5IHoUnSkH5gmCKE.4TM9QGk.R2njEBEjmfK.ycTAvBgr1Cm', 'active', NOW()),
  ('neha.gupta@thechatnest.com', 'Neha Gupta', '+919876543213', '$2b$10$Q//e3Q5IHoUnSkH5gmCKE.4TM9QGk.R2njEBEjmfK.ycTAvBgr1Cm', 'active', NOW()),
  ('vikram.singh@thechatnest.com', 'Vikram Singh', '+919876543214', '$2b$10$Q//e3Q5IHoUnSkH5gmCKE.4TM9QGk.R2njEBEjmfK.ycTAvBgr1Cm', 'active', NOW()),
  ('ananya.reddy@thechatnest.com', 'Ananya Reddy', '+919876543215', '$2b$10$Q//e3Q5IHoUnSkH5gmCKE.4TM9QGk.R2njEBEjmfK.ycTAvBgr1Cm', 'active', NOW()),
  ('rohan.kumar@thechatnest.com', 'Rohan Kumar', '+919876543216', '$2b$10$Q//e3Q5IHoUnSkH5gmCKE.4TM9QGk.R2njEBEjmfK.ycTAvBgr1Cm', 'active', NOW()),
  ('kavita.joshi@thechatnest.com', 'Kavita Joshi', '+919876543217', '$2b$10$Q//e3Q5IHoUnSkH5gmCKE.4TM9QGk.R2njEBEjmfK.ycTAvBgr1Cm', 'active', NOW()),
  ('arjun.mehta@thechatnest.com', 'Arjun Mehta', '+919876543218', '$2b$10$Q//e3Q5IHoUnSkH5gmCKE.4TM9QGk.R2njEBEjmfK.ycTAvBgr1Cm', 'active', NOW()),
  ('deepika.nair@thechatnest.com', 'Deepika Nair', '+919876543219', '$2b$10$Q//e3Q5IHoUnSkH5gmCKE.4TM9QGk.R2njEBEjmfK.ycTAvBgr1Cm', 'active', NOW())
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, status = 'active';

-- Add to organization 1 as regular users (role_id = 4)
INSERT INTO organization_members (organization_id, user_id, role_id, status)
SELECT 1, u.user_id, 4, 'active'
FROM users u
WHERE u.email IN (
  'rahul.sharma@thechatnest.com', 'priya.verma@thechatnest.com', 'amit.patel@thechatnest.com',
  'neha.gupta@thechatnest.com', 'vikram.singh@thechatnest.com', 'ananya.reddy@thechatnest.com',
  'rohan.kumar@thechatnest.com', 'kavita.joshi@thechatnest.com', 'arjun.mehta@thechatnest.com',
  'deepika.nair@thechatnest.com'
)
ON CONFLICT (organization_id, user_id) DO UPDATE SET status = 'active';
