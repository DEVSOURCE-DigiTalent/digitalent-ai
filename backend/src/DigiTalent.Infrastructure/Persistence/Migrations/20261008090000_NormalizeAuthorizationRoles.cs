using DigiTalent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261008090000_NormalizeAuthorizationRoles")]
public sealed class NormalizeAuthorizationRoles : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DO $migration$
            DECLARE mapping record;
            DECLARE legacy_id uuid;
            DECLARE target_id uuid;
            BEGIN
                FOR mapping IN
                    SELECT * FROM (VALUES
                        ('SYSTEM_ADMIN', 'PLATFORM_ADMIN', 'Platform Administrator', 'GLOBAL'),
                        ('HR_MANAGER', 'OWNER', 'Enterprise Owner', 'ORGANIZATION'),
                        ('DEPARTMENT_MANAGER', 'MANAGER', 'Department Manager', 'DEPARTMENT'),
                        ('TRAINER', 'EMPLOYEE', 'Employee', 'SELF')
                    ) AS codes(old_code, new_code, new_name, new_scope)
                LOOP
                    SELECT id INTO legacy_id FROM roles WHERE code = mapping.old_code;
                    IF legacy_id IS NULL THEN CONTINUE; END IF;
                    SELECT id INTO target_id FROM roles WHERE code = mapping.new_code;
                    IF target_id IS NULL THEN
                        UPDATE roles SET code = mapping.new_code, name = mapping.new_name,
                            scope_type = mapping.new_scope, updated_at = now()
                        WHERE id = legacy_id;
                    ELSE
                        INSERT INTO user_roles (user_id, role_id, assigned_by_user_id, assigned_at)
                        SELECT user_id, target_id, assigned_by_user_id, assigned_at
                        FROM user_roles WHERE role_id = legacy_id
                        ON CONFLICT (user_id, role_id) DO NOTHING;
                        UPDATE member_invitations SET role_id = target_id WHERE role_id = legacy_id;
                        DELETE FROM user_roles WHERE role_id = legacy_id;
                        DELETE FROM role_permissions WHERE role_id = legacy_id;
                        DELETE FROM roles WHERE id = legacy_id;
                    END IF;
                END LOOP;

                -- Platform accounts have no tenant scope, even when created by the old demo seed.
                UPDATE users SET organization_id = NULL
                WHERE id IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id
                             WHERE r.code = 'PLATFORM_ADMIN');
                DELETE FROM user_roles ur USING roles r
                WHERE ur.role_id = r.id AND r.code <> 'PLATFORM_ADMIN'
                  AND ur.user_id IN (SELECT pa.user_id FROM user_roles pa JOIN roles pr ON pr.id = pa.role_id
                                     WHERE pr.code = 'PLATFORM_ADMIN');
                -- Organization-less accounts are Personal users unless they are Platform Admins.
                DELETE FROM user_roles ur USING users u, roles r
                WHERE ur.user_id = u.id AND ur.role_id = r.id
                  AND u.organization_id IS NULL AND r.code <> 'PLATFORM_ADMIN';
                -- PLATFORM_ADMIN is explicit rather than a blanket permission bypass.
                DELETE FROM role_permissions rp
                USING roles r
                WHERE rp.role_id = r.id
                  AND r.code = 'PLATFORM_ADMIN'
                  AND rp.permission_id NOT IN (
                      SELECT p.id FROM permissions p
                      WHERE p.code IN ('account.view_own', 'account.update_own_profile',
                                       'account.change_own_password', 'audit_log.read_system',
                                       'system_config.manage')
                  );

                INSERT INTO role_permissions (role_id, permission_id)
                SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
                WHERE r.code = 'PLATFORM_ADMIN'
                  AND p.code IN ('account.view_own', 'account.update_own_profile',
                                 'account.change_own_password', 'audit_log.read_system',
                                 'system_config.manage')
                ON CONFLICT (role_id, permission_id) DO NOTHING;

                -- OWNER absorbs organization-local authoring formerly handled by a separate role.
                INSERT INTO role_permissions (role_id, permission_id)
                SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
                WHERE r.code = 'OWNER'
                  AND p.code IN ('course.create', 'course.update', 'course.publish_unpublish',
                                 'course.archive', 'course_competency.manage', 'material.upload',
                                 'material.delete_archive', 'question_bank.read',
                                 'question.create_update', 'question.ai_generate_draft',
                                 'question.approve_publish', 'assessment.create_update',
                                 'assessment.publish_close', 'attempt.regrade_override',
                                 'file.upload_material')
                ON CONFLICT (role_id, permission_id) DO NOTHING;
                UPDATE refresh_tokens SET revoked_at = now()
                WHERE revoked_at IS NULL AND user_id IN (
                    SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id
                    WHERE r.code IN ('PLATFORM_ADMIN', 'OWNER', 'MANAGER', 'EMPLOYEE'));
            END $migration$;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Role normalization cannot safely infer each user's previous role assignments.
    }
}
