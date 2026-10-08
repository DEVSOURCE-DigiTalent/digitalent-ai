-- Seed tài khoản demo cho mô hình 4 role (chạy SAU seed-foundation.sql)
-- Password chung: Admin@1234. Chỉ dùng cho Development/demo.
-- Chạy trong DBeaver: Alt+X

DO $$
DECLARE
  v_org_id uuid;
  v_dept_id uuid;
  v_owner_user_id uuid;
  v_manager_user_id uuid;
  v_employee_user_id uuid;
  v_manager_employee_id uuid;
  v_pwd_hash text := '$2b$12$rlgaReb0FmfvQFr68KPqJ.uBRT6.J59EYSsPw33c3xNajlF0y3HzO'; -- Admin@1234
BEGIN
  SELECT id INTO v_org_id FROM organizations WHERE code = 'DIGITALENT';
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Organization DIGITALENT not found. Run seed-foundation.sql first.';
  END IF;

  SELECT id INTO v_dept_id FROM departments WHERE code = 'OPS' AND organization_id = v_org_id;
  IF v_dept_id IS NULL THEN
    v_dept_id := gen_random_uuid();
    INSERT INTO departments (id, organization_id, code, name, status, created_at, updated_at)
    VALUES (v_dept_id, v_org_id, 'OPS', 'Operations', 'ACTIVE', now(), now());
  END IF;

  INSERT INTO users (id, organization_id, email, display_name, password_hash, status, failed_login_count, created_at, updated_at)
  SELECT gen_random_uuid(), account.organization_id, account.email, account.display_name, v_pwd_hash, 'ACTIVE', 0, now(), now()
  FROM (VALUES
    (NULL::uuid, 'platform@digitalent.ai', 'Platform Administrator'),
    (v_org_id,   'owner@digitalent.ai',    'Enterprise Owner'),
    (v_org_id,   'manager@digitalent.ai',  'Department Manager'),
    (v_org_id,   'employee@digitalent.ai', 'Employee'),
    (NULL::uuid, 'personal@digitalent.ai', 'Bùi Thị Cá Nhân'),
    (NULL::uuid, 'trial@digitalent.ai',    'Lý Văn Dùng Thử'),
    (NULL::uuid, 'free@digitalent.ai',     'Mai Thị Miễn Phí')
  ) AS account(organization_id, email, display_name)
  WHERE NOT EXISTS (SELECT 1 FROM users existing WHERE lower(existing.email) = lower(account.email));

  UPDATE users
  SET organization_id = CASE
    WHEN lower(email) IN ('owner@digitalent.ai', 'manager@digitalent.ai', 'employee@digitalent.ai') THEN v_org_id
    ELSE NULL
  END,
  updated_at = now()
  WHERE lower(email) IN (
    'platform@digitalent.ai', 'owner@digitalent.ai', 'manager@digitalent.ai',
    'employee@digitalent.ai', 'personal@digitalent.ai', 'trial@digitalent.ai', 'free@digitalent.ai'
  );

  DELETE FROM user_roles
  WHERE user_id IN (
    SELECT id FROM users WHERE lower(email) IN (
      'platform@digitalent.ai', 'owner@digitalent.ai', 'manager@digitalent.ai',
      'employee@digitalent.ai', 'personal@digitalent.ai', 'trial@digitalent.ai', 'free@digitalent.ai'
    )
  );

  INSERT INTO user_roles (user_id, role_id, assigned_at)
  SELECT user_account.id, role.id, now()
  FROM (VALUES
    ('platform@digitalent.ai', 'PLATFORM_ADMIN'),
    ('owner@digitalent.ai',    'OWNER'),
    ('manager@digitalent.ai',  'MANAGER'),
    ('employee@digitalent.ai', 'EMPLOYEE')
  ) AS assignment(email, role_code)
  JOIN users user_account ON lower(user_account.email) = assignment.email
  JOIN roles role ON role.code = assignment.role_code;

  SELECT id INTO v_owner_user_id FROM users WHERE lower(email) = 'owner@digitalent.ai';
  SELECT id INTO v_manager_user_id FROM users WHERE lower(email) = 'manager@digitalent.ai';
  SELECT id INTO v_employee_user_id FROM users WHERE lower(email) = 'employee@digitalent.ai';

  INSERT INTO employees (id, organization_id, user_id, department_id, employee_code, full_name, work_email, status, joined_at, created_at, updated_at)
  SELECT gen_random_uuid(), v_org_id, account.user_id, v_dept_id, account.employee_code,
         account.full_name, account.work_email, 'ACTIVE', '2024-01-01', now(), now()
  FROM (VALUES
    (v_owner_user_id,    'EMP-0002', 'Enterprise Owner',   'owner@digitalent.ai'),
    (v_manager_user_id,  'EMP-0001', 'Department Manager', 'manager@digitalent.ai'),
    (v_employee_user_id, 'EMP-0004', 'Employee',           'employee@digitalent.ai')
  ) AS account(user_id, employee_code, full_name, work_email)
  WHERE NOT EXISTS (SELECT 1 FROM employees existing WHERE existing.user_id = account.user_id);

  UPDATE employees
  SET department_id = v_dept_id, status = 'ACTIVE', updated_at = now()
  WHERE user_id IN (v_owner_user_id, v_manager_user_id, v_employee_user_id);

  SELECT id INTO v_manager_employee_id FROM employees WHERE user_id = v_manager_user_id;
  UPDATE employees SET direct_manager_id = v_manager_employee_id, updated_at = now()
  WHERE user_id = v_employee_user_id;

  UPDATE departments SET manager_employee_id = v_manager_employee_id, updated_at = now()
  WHERE id = v_dept_id;
END $$;
