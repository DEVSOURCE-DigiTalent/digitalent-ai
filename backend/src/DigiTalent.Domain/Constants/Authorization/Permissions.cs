namespace DigiTalent.Domain.Constants.Authorization;

/// <summary>
/// Mã quyền (doc 09 mục 6). Frontend dùng mã y hệt (hooks/use-permission.ts).
///
/// Làm module nào thì thêm mã của module đó vào đây — copy ĐÚNG mã trong doc 09,
/// rồi khai báo role nào có quyền đó trong RolePermissions.cs.
/// </summary>
public static class Permissions
{
    public static class Account
    {
        public const string ViewOwn = "account.view_own";
    }

    public static class Department
    {
        public const string Read = "department.read";
        public const string CreateUpdate = "department.create_update"; // tạo / sửa / xóa
    }
}
