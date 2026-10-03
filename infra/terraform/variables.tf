variable "aws_region" {
  description = "AWS region to deploy resources (Singapore ap-southeast-1 is recommended for Vietnam)"
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Environment name (production/staging/dev)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name tag for all resources"
  type        = string
  default     = "digitalent-ai"
}

variable "instance_type" {
  description = "EC2 instance size (Free Tier eligible: t3.micro or t2.micro)"
  type        = string
  default     = "t3.micro"
}

variable "root_volume_size" {
  description = "Root disk volume size in GB (gp3 high performance SSD)"
  type        = number
  default     = 30
}

variable "allowed_ssh_cidr" {
  description = "Allowed CIDR blocks for SSH access (port 22)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "git_repo_url" {
  description = "Git repository URL to clone on server"
  type        = string
  default     = "https://github.com/DEVSOURCE-DigiTalent/digitalent-ai.git"
}

variable "git_branch" {
  description = "Git branch to deploy"
  type        = string
  default     = "main"
}

variable "postgres_db" {
  description = "PostgreSQL Database name"
  type        = string
  default     = "digitalent"
}

variable "postgres_user" {
  description = "PostgreSQL Username"
  type        = string
  default     = "digitalent_app"
}

variable "postgres_password" {
  description = "PostgreSQL Password (leave empty to auto-generate secure password)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "jwt_signing_key" {
  description = "JWT Signing Key 64+ chars (leave empty to auto-generate secure key)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "minio_access_key" {
  description = "MinIO Root User / Access Key"
  type        = string
  default     = "digitalent_minio"
}

variable "minio_secret_key" {
  description = "MinIO Root Password / Secret Key (leave empty to auto-generate secure key)"
  type        = string
  default     = ""
  sensitive   = true
}
