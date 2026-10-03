# DigiTalent AI - AWS Terraform Infrastructure & Automated Deployment

Hệ thống Terraform này tự động hóa toàn bộ việc khởi tạo hạ tầng AWS và triển khai dự án **DigiTalent AI** (.NET 8 + React + PostgreSQL + MinIO + Nginx) lên máy chủ ảo EC2 với IP tĩnh cố định (Elastic IP).

---

## 🏗️ Kiến trúc hạ tầng

- **AWS Region**: `ap-southeast-1` (Singapore - độ trễ thấp nhất cho Việt Nam).
- **EC2 Instance**: `t3.medium` (2 vCPU, 4GB RAM) chạy hệ điều hành **Ubuntu 24.04 LTS (Noble)**.
- **Ổ cứng**: 30GB SSD gp3.
- **IP Tĩnh (Elastic IP)**: Đảm bảo IP public cố định, không đổi khi reboot. Truy cập trực tiếp qua `http://<PUBLIC_IP>`.
- **Swap Space**: Tự động cấu hình 4GB Swap RAM ảo để tránh tràn bộ nhớ khi build hoặc chạy tác vụ nặng.
- **Bảo mật**:
  - Tự động sinh cặp khóa SSH RSA 4096-bit lưu về file [digitalent_key.pem](file:///d:/digitalent-ai/infra/terraform/digitalent_key.pem).
  - Security Group: Mở cổng `22` (SSH), `80` (HTTP Web), `443` (HTTPS), `9001` (MinIO UI Console).
  - Tự động sinh mật khẩu database, JWT signing key (64+ ký tự) và MinIO secret key an toàn.

---

## 🚀 Hướng dẫn Triển khai (Deploy)

### Cách 1: Chạy Script tự động 1-Click (Khuyên dùng)

Mở PowerShell tại thư mục dự án và chạy:

```powershell
.\infra\deploy.ps1
```

Script sẽ:
1. Nhập hoặc đọc `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` từ tài khoản AWS của bạn.
2. Tự động chạy `terraform init` và `terraform apply`.
3. Trả về địa chỉ Web `http://<IP>` và lệnh SSH kết nối.

Nếu bạn muốn đồng bộ cả những code mới chưa commit lên git từ máy local lên server:
```powershell
.\infra\deploy.ps1 -SyncLocalCode
```

---

### Cách 2: Chạy trực tiếp lệnh Terraform thủ công

```powershell
cd infra/terraform

# 1. Khởi tạo Terraform (Đã được tải sẵn providers)
terraform init

# 2. Xem kế hoạch khởi tạo
terraform plan

# 3. Tiến hành tạo server và chạy ứng dụng
terraform apply -auto-approve

# 4. Lấy thông tin IP và lệnh SSH
terraform output
```

Sau khi deploy xong, hãy đợi 2-3 phút để EC2 hoàn tất quá trình cài đặt Docker và khởi chạy ứng dụng lần đầu. Bạn có thể theo dõi tiến trình thông qua SSH:
```bash
ssh -i infra/terraform/digitalent_key.pem ubuntu@<PUBLIC_IP> "tail -f /var/log/user-data.log"
```

---

## 🧹 Hủy tài nguyên khi không dùng nữa (Tránh phát sinh chi phí)

Khi bạn muốn tắt hoặc xóa toàn bộ máy chủ để tránh bị trừ tiền trên AWS:

```powershell
cd infra/terraform
terraform destroy -auto-approve
```
