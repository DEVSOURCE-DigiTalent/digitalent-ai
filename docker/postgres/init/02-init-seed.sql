-- DigiTalent AI - Seed Data
-- Auto-executed by PostgreSQL after schema initialization
-- Contains demo data for development and testing

-- ============================================================
-- ROLES (6 roles matching RoleConstants)
-- ============================================================
INSERT INTO roles (id, code, name, description, scope_type, is_system_role, status)
VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SYSTEM_ADMIN', 'System Admin', 'System administrator with full access', 'GLOBAL', true, 'ACTIVE'),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'HR_MANAGER', 'HR Manager', 'Human resources / training manager', 'ORGANIZATION', true, 'ACTIVE'),
    ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'DEPARTMENT_MANAGER', 'Department Manager', 'Department-level manager', 'DEPARTMENT', true, 'ACTIVE'),
    ('d4e5f6a7-b8c9-0123-def1-234567890123', 'TRAINER', 'Trainer', 'Internal trainer / content author', 'ORGANIZATION', true, 'ACTIVE'),
    ('e5f6a7b8-c9d0-1234-ef12-345678901234', 'EMPLOYEE', 'Employee', 'Regular employee / learner', 'SELF', true, 'ACTIVE'),
    ('f6a7b8c9-d0e1-2345-f123-456789012345', 'CERTIFICATE_VERIFIER', 'Certificate Verifier', 'Can verify certificate validity', 'PUBLIC', true, 'ACTIVE');

-- ============================================================
-- PERMISSIONS (49 permissions from PermissionConstants)
-- ============================================================
INSERT INTO permissions (id, code, module, action, description)
VALUES
    -- Auth (2)
    ('20000000-0000-0000-0000-000000000000', 'auth.login', 'Auth', 'login', 'Login to system'),
    ('20000000-0000-0000-0000-000000000001', 'auth.refresh_token', 'Auth', 'refresh_token', 'Refresh access token'),
    -- User & Role (4)
    ('20000000-0000-0000-0000-000000000002', 'user.read', 'User', 'read', 'View user accounts'),
    ('20000000-0000-0000-0000-000000000003', 'user.create', 'User', 'create', 'Create user accounts'),
    ('20000000-0000-0000-0000-000000000004', 'user.update', 'User', 'update', 'Update user accounts'),
    ('20000000-0000-0000-0000-000000000005', 'role.assign_business', 'User', 'assign_business', 'Assign business roles'),
    -- Organization (6)
    ('20000000-0000-0000-0000-000000000006', 'employee.read', 'Organization', 'read', 'View employee profiles'),
    ('20000000-0000-0000-0000-000000000007', 'employee.create_update', 'Organization', 'create_update', 'Create/update employee profiles'),
    ('20000000-0000-0000-0000-000000000008', 'department.read', 'Organization', 'read', 'View departments'),
    ('20000000-0000-0000-0000-000000000009', 'department.create_update', 'Organization', 'create_update', 'Create/update departments'),
    ('20000000-0000-0000-0000-00000000000a', 'job_position.read', 'Organization', 'read', 'View job positions'),
    ('20000000-0000-0000-0000-00000000000b', 'job_position.create_update', 'Organization', 'create_update', 'Create/update job positions'),
    -- Competency (5)
    ('20000000-0000-0000-0000-00000000000c', 'competency.read', 'Competency', 'read', 'View competencies'),
    ('20000000-0000-0000-0000-00000000000d', 'competency.manage', 'Competency', 'manage', 'Manage competencies'),
    ('20000000-0000-0000-0000-00000000000e', 'position_requirement.read', 'Competency', 'read', 'View position requirements'),
    ('20000000-0000-0000-0000-00000000000f', 'position_requirement.manage', 'Competency', 'manage', 'Manage position requirements'),
    ('20000000-0000-0000-0000-000000000010', 'employee_competency_profile.read', 'Competency', 'read', 'View employee competency profiles'),
    -- Course (5)
    ('20000000-0000-0000-0000-000000000011', 'course.read_catalog', 'Course', 'read_catalog', 'View course catalog'),
    ('20000000-0000-0000-0000-000000000012', 'course.create', 'Course', 'create', 'Create courses'),
    ('20000000-0000-0000-0000-000000000013', 'course.update', 'Course', 'update', 'Update courses'),
    ('20000000-0000-0000-0000-000000000014', 'course.publish_unpublish', 'Course', 'publish_unpublish', 'Publish/unpublish courses'),
    ('20000000-0000-0000-0000-000000000015', 'course_assignment.create', 'Course', 'assign', 'Assign courses'),
    -- Assessment (5)
    ('20000000-0000-0000-0000-000000000016', 'assessment.read', 'Assessment', 'read', 'View assessments'),
    ('20000000-0000-0000-0000-000000000017', 'assessment.create_update', 'Assessment', 'create_update', 'Create/update assessments'),
    ('20000000-0000-0000-0000-000000000018', 'attempt.start', 'Assessment', 'start', 'Start assessment attempt'),
    ('20000000-0000-0000-0000-000000000019', 'attempt.submit', 'Assessment', 'submit', 'Submit assessment attempt'),
    ('20000000-0000-0000-0000-00000000001a', 'attempt.read_result', 'Assessment', 'read_result', 'View attempt results'),
    -- Certificate (6)
    ('20000000-0000-0000-0000-00000000001b', 'certificate.issue_auto', 'Certificate', 'issue_auto', 'Auto-issue certificates'),
    ('20000000-0000-0000-0000-00000000001c', 'certificate.issue_manual', 'Certificate', 'issue_manual', 'Manually issue certificates'),
    ('20000000-0000-0000-0000-00000000001d', 'certificate.read', 'Certificate', 'read', 'View certificates'),
    ('20000000-0000-0000-0000-00000000001e', 'certificate.verify_public', 'Certificate', 'verify_public', 'Verify certificate publicly'),
    ('20000000-0000-0000-0000-00000000001f', 'certificate.revoke', 'Certificate', 'revoke', 'Revoke certificates'),
    ('20000000-0000-0000-0000-000000000020', 'certificate.download_pdf', 'Certificate', 'download_pdf', 'Download certificate PDF'),
    -- Task (6)
    ('20000000-0000-0000-0000-000000000021', 'task.create', 'Task', 'create', 'Create practical tasks'),
    ('20000000-0000-0000-0000-000000000022', 'task.assign', 'Task', 'assign', 'Assign practical tasks'),
    ('20000000-0000-0000-0000-000000000023', 'task.read', 'Task', 'read', 'View tasks'),
    ('20000000-0000-0000-0000-000000000024', 'task.submit', 'Task', 'submit', 'Submit task results'),
    ('20000000-0000-0000-0000-000000000025', 'task.evaluate', 'Task', 'evaluate', 'Evaluate task submissions'),
    ('20000000-0000-0000-0000-000000000026', 'task_attachment.download', 'Task', 'download', 'Download task attachments'),
    -- Dashboard (4)
    ('20000000-0000-0000-0000-000000000027', 'dashboard.hr_company.read', 'Dashboard', 'hr_company_read', 'View HR company dashboard'),
    ('20000000-0000-0000-0000-000000000028', 'dashboard.department.read', 'Dashboard', 'department_read', 'View department dashboard'),
    ('20000000-0000-0000-0000-000000000029', 'dashboard.trainer.read', 'Dashboard', 'trainer_read', 'View trainer dashboard'),
    ('20000000-0000-0000-0000-00000000002a', 'dashboard.employee.read', 'Dashboard', 'employee_read', 'View employee dashboard'),
    -- Intelligence (5)
    ('20000000-0000-0000-0000-00000000002b', 'skill_gap.calculate', 'Intelligence', 'calculate', 'Calculate skill gaps'),
    ('20000000-0000-0000-0000-00000000002c', 'skill_gap.read', 'Intelligence', 'read', 'View skill gap results'),
    ('20000000-0000-0000-0000-00000000002d', 'training_risk.read', 'Intelligence', 'read', 'View training risks'),
    ('20000000-0000-0000-0000-00000000002e', 'readiness.read', 'Intelligence', 'read', 'View readiness scores'),
    ('20000000-0000-0000-0000-00000000002f', 'scoring_config.manage', 'Intelligence', 'manage', 'Manage scoring configs'),
    -- Evidence (2)
    ('20000000-0000-0000-0000-000000000030', 'evidence.read', 'Evidence', 'read', 'View evidence'),
    ('20000000-0000-0000-0000-000000000031', 'evidence.approve_confirm', 'Evidence', 'approve_confirm', 'Approve evidence'),
    -- Notification (2)
    ('20000000-0000-0000-0000-000000000032', 'notification.read_own', 'Notification', 'read_own', 'Read own notifications'),
    ('20000000-0000-0000-0000-000000000033', 'notification.send', 'Notification', 'send', 'Send notifications'),
    -- Audit (1)
    ('20000000-0000-0000-0000-000000000034', 'audit_log.read_system', 'Audit', 'read_system', 'Read system audit logs');

-- ============================================================
-- ROLE-PERMISSION MAPPINGS
-- SYSTEM_ADMIN: all 49 permissions
-- ============================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', id FROM permissions;

-- HR_MANAGER: organization-wide business permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'b2c3d4e5-f6a7-8901-bcde-f12345678901', id FROM permissions
WHERE code IN (
    'auth.login', 'auth.refresh_token',
    'user.read', 'user.create', 'user.update', 'role.assign_business',
    'employee.read', 'employee.create_update',
    'department.read', 'department.create_update',
    'job_position.read', 'job_position.create_update',
    'competency.read', 'competency.manage',
    'position_requirement.read', 'position_requirement.manage',
    'employee_competency_profile.read',
    'course.read_catalog', 'course.create', 'course.update', 'course.publish_unpublish', 'course_assignment.create',
    'assessment.read', 'assessment.create_update',
    'attempt.read_result',
    'certificate.issue_auto', 'certificate.issue_manual', 'certificate.read', 'certificate.revoke', 'certificate.download_pdf',
    'task.create', 'task.assign', 'task.read', 'task.evaluate', 'task_attachment.download',
    'dashboard.hr_company.read', 'dashboard.department.read', 'dashboard.trainer.read',
    'skill_gap.calculate', 'skill_gap.read', 'training_risk.read', 'readiness.read', 'scoring_config.manage',
    'evidence.read', 'evidence.approve_confirm',
    'notification.read_own', 'notification.send'
);

-- DEPT_MANAGER: department-scoped
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'c3d4e5f6-a7b8-9012-cdef-123456789012', id FROM permissions
WHERE code IN (
    'auth.login', 'auth.refresh_token',
    'employee.read', 'department.read', 'job_position.read',
    'competency.read', 'position_requirement.read', 'employee_competency_profile.read',
    'course.read_catalog', 'course_assignment.create',
    'attempt.read_result',
    'certificate.read', 'certificate.download_pdf',
    'task.create', 'task.assign', 'task.read', 'task.evaluate', 'task_attachment.download',
    'dashboard.department.read', 'dashboard.employee.read',
    'skill_gap.read', 'training_risk.read', 'readiness.read',
    'evidence.read', 'evidence.approve_confirm',
    'notification.read_own'
);

-- TRAINER: content authoring + assessment
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'd4e5f6a7-b8c9-0123-def1-234567890123', id FROM permissions
WHERE code IN (
    'auth.login', 'auth.refresh_token',
    'employee.read', 'department.read', 'job_position.read',
    'competency.read', 'position_requirement.read', 'employee_competency_profile.read',
    'course.read_catalog', 'course.create', 'course.update',
    'assessment.read', 'assessment.create_update', 'attempt.read_result',
    'certificate.read', 'certificate.download_pdf',
    'task.create', 'task.read', 'task.evaluate', 'task_attachment.download',
    'dashboard.trainer.read', 'dashboard.employee.read',
    'skill_gap.read', 'training_risk.read',
    'evidence.read', 'evidence.approve_confirm',
    'notification.read_own'
);

-- EMPLOYEE: own data only
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'e5f6a7b8-c9d0-1234-ef12-345678901234', id FROM permissions
WHERE code IN (
    'auth.login', 'auth.refresh_token',
    'employee.read',
    'competency.read', 'employee_competency_profile.read', 'position_requirement.read',
    'course.read_catalog',
    'attempt.start', 'attempt.submit', 'attempt.read_result',
    'certificate.read', 'certificate.download_pdf',
    'task.read', 'task.submit', 'task_attachment.download',
    'dashboard.employee.read',
    'skill_gap.read', 'training_risk.read', 'readiness.read',
    'evidence.read',
    'notification.read_own'
);

-- CERT_VERIFIER: verification only
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'f6a7b8c9-d0e1-2345-f123-456789012345', id FROM permissions
WHERE code IN (
    'auth.login', 'auth.refresh_token',
    'certificate.read', 'certificate.verify_public'
);

-- ============================================================
-- ORGANIZATION: DEVSOURCE Corporation
-- ============================================================
INSERT INTO organizations (id, code, name, domain, status)
VALUES ('30000000-0000-0000-0000-000000000001', 'DEVSOURCE', 'DEVSOURCE Corporation', 'devsource.com', 'ACTIVE');

INSERT INTO departments (id, organization_id, code, name, status)
VALUES
    ('30000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000001', 'IT', 'Information Technology', 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000001', 'HR', 'Human Resources', 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000001', 'MKT', 'Marketing', 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000001', 'FIN', 'Finance', 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000001', 'OPS', 'Operations', 'ACTIVE');

INSERT INTO job_positions (id, organization_id, department_id, code, title, level_name, status)
VALUES
    ('30000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000010', 'SE', 'Software Engineer', 'Junior/Middle/Senior', 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000025', '30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000010', 'TL', 'Team Lead', 'Lead', 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000011', 'HRS', 'HR Specialist', null, 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000022', '30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000012', 'MKE', 'Marketing Executive', null, 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000013', 'FA', 'Finance Analyst', null, 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000024', '30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000014', 'OPSE', 'Operations Executive', null, 'ACTIVE');

-- ============================================================
-- USERS (5 demo users with BCrypt-hashed passwords)
-- ============================================================
INSERT INTO users (id, email, password_hash, full_name, status)
VALUES
    ('50000000-0000-0000-0000-000000000001', 'admin@digitalent.dev', '$2b$10$TfZ9zpHN91EjYcG8XM5Ndu6Br/eTIXzGdIPQK0AAimQGQNun8fp.K', 'System Admin', 'Active'),
    ('50000000-0000-0000-0000-000000000002', 'hr@digitalent.dev', '$2b$10$8giMfrtQncxdunuJpQ6ZCOmWynRegy3de2A2vZi8.tEaj.nv9ox4S', 'HR Manager', 'Active'),
    ('50000000-0000-0000-0000-000000000003', 'manager@digitalent.dev', '$2b$10$0DU7OVXu9bmPzQCHAkulFucBNw51X81qtL//I2YA/2Lgb5HQShiG2', 'Department Manager', 'Active'),
    ('50000000-0000-0000-0000-000000000004', 'trainer@digitalent.dev', '$2b$10$KkKaCmLqKV6K46lVcgBYmuCwJdYLhaiGCYJtpO9W1yzJMrxwwl2S.', 'Internal Trainer', 'Active'),
    ('50000000-0000-0000-0000-000000000005', 'employee@digitalent.dev', '$2b$10$2aissFT14yzBZZB76bAY9.CkAjF2cCmvBvWWvaHHpkDaObTXlNSgO', 'Employee User', 'Active');

INSERT INTO employees (id, organization_id, user_id, department_id, job_position_id, employee_code, full_name, email, employment_status)
VALUES
    ('50000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000025', 'EMP001', 'System Admin', 'admin@digitalent.dev', 'ACTIVE'),
    ('50000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000021', 'EMP002', 'HR Manager', 'hr@digitalent.dev', 'ACTIVE'),
    ('50000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000025', 'EMP003', 'Department Manager', 'manager@digitalent.dev', 'ACTIVE'),
    ('50000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000020', 'EMP004', 'Internal Trainer', 'trainer@digitalent.dev', 'ACTIVE'),
    ('50000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000020', 'EMP005', 'Employee User', 'employee@digitalent.dev', 'ACTIVE');

-- Department managers
UPDATE departments SET manager_employee_id = '50000000-0000-0000-0000-000000000010' WHERE code = 'IT';
UPDATE departments SET manager_employee_id = '50000000-0000-0000-0000-000000000011' WHERE code = 'HR';

INSERT INTO user_roles (user_id, role_id)
VALUES
    ('50000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
    ('50000000-0000-0000-0000-000000000002', 'b2c3d4e5-f6a7-8901-bcde-f12345678901'),
    ('50000000-0000-0000-0000-000000000003', 'c3d4e5f6-a7b8-9012-cdef-123456789012'),
    ('50000000-0000-0000-0000-000000000004', 'd4e5f6a7-b8c9-0123-def1-234567890123'),
    ('50000000-0000-0000-0000-000000000005', 'e5f6a7b8-c9d0-1234-ef12-345678901234');

-- ============================================================
-- COMPETENCY FRAMEWORK
-- ============================================================
INSERT INTO competency_categories (id, organization_id, code, name, description, sort_order, status)
VALUES
    ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'AI_LITERACY', 'AI Literacy', 'Understanding and applying artificial intelligence concepts', 1, 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'DATA_LITERACY', 'Data Literacy', 'Ability to read, understand and use data', 2, 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'CYBERSECURITY', 'Cybersecurity', 'Understanding security threats and safe practices', 3, 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'DIGITAL_COLLABORATION', 'Digital Collaboration', 'Using digital tools for teamwork and communication', 4, 'ACTIVE');

INSERT INTO competencies (id, category_id, code, name, description, status)
VALUES
    ('40000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000001', 'AI_BASICS', 'AI Basics', 'Basic understanding of AI concepts and applications', 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000011', '40000000-0000-0000-0000-000000000001', 'PROMPT_ENGINEERING', 'Prompt Engineering', 'Crafting effective prompts for AI systems', 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000012', '40000000-0000-0000-0000-000000000002', 'DATA_ANALYSIS', 'Data Analysis', 'Ability to analyze and interpret data', 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000013', '40000000-0000-0000-0000-000000000002', 'DATA_VISUALIZATION', 'Data Visualization', 'Creating meaningful data visualizations', 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000014', '40000000-0000-0000-0000-000000000003', 'SECURITY_AWARENESS', 'Security Awareness', 'Awareness of security threats and best practices', 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000015', '40000000-0000-0000-0000-000000000003', 'DATA_PRIVACY', 'Data Privacy', 'Understanding data protection and privacy regulations', 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000016', '40000000-0000-0000-0000-000000000004', 'DIGITAL_TOOLS', 'Digital Tools Proficiency', 'Proficiency with digital productivity tools', 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000017', '40000000-0000-0000-0000-000000000004', 'REMOTE_COLLABORATION', 'Remote Collaboration', 'Effective collaboration in remote/virtual environments', 'ACTIVE');

INSERT INTO competency_levels (id, organization_id, level_value, name, description, achievement_criteria, status)
VALUES
    ('40000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000001', 1, 'Beginner', 'Basic awareness and limited practical ability', 'Can recall basic concepts and perform simple tasks with guidance', 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000001', 2, 'Basic', 'Working knowledge with assistance', 'Can perform routine tasks with minimal supervision', 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000022', '30000000-0000-0000-0000-000000000001', 3, 'Intermediate', 'Independent and effective', 'Can work independently and solve common problems', 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000001', 4, 'Advanced', 'Deep understanding and coaching ability', 'Can guide others and handle complex situations', 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000024', '30000000-0000-0000-0000-000000000001', 5, 'Expert', 'Thought leader and innovator', 'Can create new methods and strategic direction', 'ACTIVE');

-- Position-competency requirements for Software Engineer
INSERT INTO position_competency_requirements (id, job_position_id, competency_id, required_level_value, weight, is_mandatory)
VALUES
    (gen_random_uuid(), '30000000-0000-0000-0000-000000000020', '40000000-0000-0000-0000-000000000010', 3, 20.00, true),
    (gen_random_uuid(), '30000000-0000-0000-0000-000000000020', '40000000-0000-0000-0000-000000000012', 3, 25.00, true),
    (gen_random_uuid(), '30000000-0000-0000-0000-000000000020', '40000000-0000-0000-0000-000000000014', 2, 15.00, true),
    (gen_random_uuid(), '30000000-0000-0000-0000-000000000020', '40000000-0000-0000-0000-000000000016', 2, 10.00, false),
    (gen_random_uuid(), '30000000-0000-0000-0000-000000000020', '40000000-0000-0000-0000-000000000017', 2, 10.00, false);

-- Default scoring configurations
INSERT INTO scoring_configs (id, organization_id, config_type, version, is_active, description)
VALUES
    (gen_random_uuid(), '30000000-0000-0000-0000-000000000001', 'READINESS', 1, true, 'Default readiness scoring weights'),
    (gen_random_uuid(), '30000000-0000-0000-0000-000000000001', 'TRAINING_RISK', 1, true, 'Default training risk scoring weights');
