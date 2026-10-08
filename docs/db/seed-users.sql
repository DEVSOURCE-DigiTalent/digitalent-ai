-- Seed tài khoản test cho tất cả role (chạy SAU seed-foundation.sql)
-- Password chung: Admin@1234
-- Chạy trong DBeaver: Alt+X

-- Nếu bị lỗi transaction cũ, chạy ROLLBACK; trước

DO $$
DECLARE
  v_org_id uuid;
  v_dept_id uuid;
  v_hr_user_id uuid;
  v_mgr_user_id uuid;
  v_trainer_user_id uuid;
  v_emp_user_id uuid;
  v_owner_user_id uuid;
  v_pwd_hash text := '$2b$12$rlgaReb0FmfvQFr68KPqJ.uBRT6.J59EYSsPw33c3xNajlF0y3HzO'; -- Admin@1234
BEGIN
  -- Lấy org id
  SELECT id INTO v_org_id FROM organizations WHERE code = 'DIGITALENT';
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Organization DIGITALENT not found. Run seed-foundation.sql first.';
  END IF;

  -- ========================================
  -- 1. Tạo phòng ban mẫu (nếu chưa có)
  -- ========================================
  SELECT id INTO v_dept_id FROM departments WHERE code = 'DEPT-IT' AND organization_id = v_org_id;
  IF v_dept_id IS NULL THEN
    v_dept_id := gen_random_uuid();
    INSERT INTO departments (id, organization_id, code, name, status, created_at, updated_at)
    VALUES (v_dept_id, v_org_id, 'DEPT-IT', 'Phòng Công nghệ thông tin', 'ACTIVE', now(), now());
  END IF;

  -- ========================================
  -- 2. Tạo user cho từng role
  -- ========================================

  -- Owner (Chủ doanh nghiệp)
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner@digitalent.ai') THEN
    v_owner_user_id := gen_random_uuid();
    INSERT INTO users (id, organization_id, email, display_name, password_hash, status, failed_login_count, created_at, updated_at)
    VALUES (v_owner_user_id, v_org_id, 'owner@digitalent.ai', 'Nguyễn Văn Chủ', v_pwd_hash, 'ACTIVE', 0, now(), now());

    INSERT INTO user_roles (user_id, role_id, assigned_at)
    VALUES (v_owner_user_id, (SELECT id FROM roles WHERE code = 'SYSTEM_ADMIN'), now());
  END IF;

  -- HR Manager
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'hr@digitalent.ai') THEN
    v_hr_user_id := gen_random_uuid();
    INSERT INTO users (id, organization_id, email, display_name, password_hash, status, failed_login_count, created_at, updated_at)
    VALUES (v_hr_user_id, v_org_id, 'hr@digitalent.ai', 'Trần Thị Nhân Sự', v_pwd_hash, 'ACTIVE', 0, now(), now());

    INSERT INTO user_roles (user_id, role_id, assigned_at)
    VALUES (v_hr_user_id, (SELECT id FROM roles WHERE code = 'HR_MANAGER'), now());
  END IF;

  -- Department Manager
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager@digitalent.ai') THEN
    v_mgr_user_id := gen_random_uuid();
    INSERT INTO users (id, organization_id, email, display_name, password_hash, status, failed_login_count, created_at, updated_at)
    VALUES (v_mgr_user_id, v_org_id, 'manager@digitalent.ai', 'Lê Văn Quản Lý', v_pwd_hash, 'ACTIVE', 0, now(), now());

    INSERT INTO user_roles (user_id, role_id, assigned_at)
    VALUES (v_mgr_user_id, (SELECT id FROM roles WHERE code = 'DEPARTMENT_MANAGER'), now());
  END IF;

  -- Trainer
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'trainer@digitalent.ai') THEN
    v_trainer_user_id := gen_random_uuid();
    INSERT INTO users (id, organization_id, email, display_name, password_hash, status, failed_login_count, created_at, updated_at)
    VALUES (v_trainer_user_id, v_org_id, 'trainer@digitalent.ai', 'Phạm Văn Giảng Viên', v_pwd_hash, 'ACTIVE', 0, now(), now());

    INSERT INTO user_roles (user_id, role_id, assigned_at)
    VALUES (v_trainer_user_id, (SELECT id FROM roles WHERE code = 'TRAINER'), now());
  END IF;

  -- Employee
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'employee@digitalent.ai') THEN
    v_emp_user_id := gen_random_uuid();
    INSERT INTO users (id, organization_id, email, display_name, password_hash, status, failed_login_count, created_at, updated_at)
    VALUES (v_emp_user_id, v_org_id, 'employee@digitalent.ai', 'Hoàng Thị Nhân Viên', v_pwd_hash, 'ACTIVE', 0, now(), now());

    INSERT INTO user_roles (user_id, role_id, assigned_at)
    VALUES (v_emp_user_id, (SELECT id FROM roles WHERE code = 'EMPLOYEE'), now());
  END IF;

  -- ========================================
  -- 3. Tạo hồ sơ nhân viên (employees) liên kết với user
  -- ========================================

  -- Lấy lại user id (trường hợp đã tồn tại từ trước)
  SELECT id INTO v_hr_user_id FROM users WHERE email = 'hr@digitalent.ai';
  SELECT id INTO v_mgr_user_id FROM users WHERE email = 'manager@digitalent.ai';
  SELECT id INTO v_trainer_user_id FROM users WHERE email = 'trainer@digitalent.ai';
  SELECT id INTO v_emp_user_id FROM users WHERE email = 'employee@digitalent.ai';
  SELECT id INTO v_owner_user_id FROM users WHERE email = 'owner@digitalent.ai';

  -- Employee record cho HR
  IF NOT EXISTS (SELECT 1 FROM employees WHERE user_id = v_hr_user_id) THEN
    INSERT INTO employees (id, organization_id, user_id, department_id, employee_code, full_name, work_email, status, joined_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_org_id, v_hr_user_id, v_dept_id, 'NV-001', 'Trần Thị Nhân Sự', 'hr@digitalent.ai', 'ACTIVE', '2024-01-01', now(), now());
  END IF;

  -- Employee record cho Manager
  IF NOT EXISTS (SELECT 1 FROM employees WHERE user_id = v_mgr_user_id) THEN
    INSERT INTO employees (id, organization_id, user_id, department_id, employee_code, full_name, work_email, status, joined_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_org_id, v_mgr_user_id, v_dept_id, 'NV-002', 'Lê Văn Quản Lý', 'manager@digitalent.ai', 'ACTIVE', '2024-01-01', now(), now());
  END IF;

  -- Employee record cho Trainer
  IF NOT EXISTS (SELECT 1 FROM employees WHERE user_id = v_trainer_user_id) THEN
    INSERT INTO employees (id, organization_id, user_id, department_id, employee_code, full_name, work_email, status, joined_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_org_id, v_trainer_user_id, v_dept_id, 'NV-003', 'Phạm Văn Giảng Viên', 'trainer@digitalent.ai', 'ACTIVE', '2024-01-01', now(), now());
  END IF;

  -- Employee record cho Employee
  IF NOT EXISTS (SELECT 1 FROM employees WHERE user_id = v_emp_user_id) THEN
    INSERT INTO employees (id, organization_id, user_id, department_id, employee_code, full_name, work_email, status, joined_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_org_id, v_emp_user_id, v_dept_id, 'NV-004', 'Hoàng Thị Nhân Viên', 'employee@digitalent.ai', 'ACTIVE', '2024-01-01', now(), now());
  END IF;

  -- Employee record cho Owner
  IF NOT EXISTS (SELECT 1 FROM employees WHERE user_id = v_owner_user_id) THEN
    INSERT INTO employees (id, organization_id, user_id, department_id, employee_code, full_name, work_email, status, joined_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_org_id, v_owner_user_id, v_dept_id, 'NV-000', 'Nguyễn Văn Chủ', 'owner@digitalent.ai', 'ACTIVE', '2024-01-01', now(), now());
  END IF;

END $$;
