output "public_ip" {
  description = "Static Elastic Public IP of the DigiTalent server"
  value       = aws_eip.app_eip.public_ip
}

output "web_url" {
  description = "Direct URL to access the DigiTalent Web Application"
  value       = "http://${aws_eip.app_eip.public_ip}"
}

output "minio_console_url" {
  description = "Direct URL to access MinIO Object Storage Console"
  value       = "http://${aws_eip.app_eip.public_ip}:9001"
}

output "ssh_command" {
  description = "Command to SSH into the server directly"
  value       = "ssh -i ${path.module}/digitalent_key.pem ubuntu@${aws_eip.app_eip.public_ip}"
}

output "private_key_file" {
  description = "Path to the generated SSH private key"
  value       = local_file.private_key_pem.filename
}

output "generated_postgres_password" {
  description = "Generated PostgreSQL password"
  value       = local.final_postgres_password
  sensitive   = true
}

output "generated_jwt_signing_key" {
  description = "Generated JWT signing key"
  value       = local.final_jwt_signing_key
  sensitive   = true
}

output "generated_minio_secret_key" {
  description = "Generated MinIO secret key"
  value       = local.final_minio_secret_key
  sensitive   = true
}
