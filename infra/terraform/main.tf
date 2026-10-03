# 1. Random passwords for production services
resource "random_password" "postgres_password" {
  length  = 24
  special = false
}

resource "random_password" "jwt_signing_key" {
  length  = 64
  special = false
}

resource "random_password" "minio_secret_key" {
  length  = 24
  special = false
}

locals {
  final_postgres_password = var.postgres_password != "" ? var.postgres_password : random_password.postgres_password.result
  final_jwt_signing_key   = var.jwt_signing_key != "" ? var.jwt_signing_key : random_password.jwt_signing_key.result
  final_minio_secret_key  = var.minio_secret_key != "" ? var.minio_secret_key : random_password.minio_secret_key.result
}

# 2. Automated SSH Key Pair Generation
resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "generated_key" {
  key_name   = "${var.project_name}-ec2-key"
  public_key = tls_private_key.ssh_key.public_key_openssh
}

resource "local_file" "private_key_pem" {
  content         = tls_private_key.ssh_key.private_key_pem
  filename        = "${path.module}/digitalent_key.pem"
  file_permission = "0600"
}

# 3. Default VPC and Subnet Discovery
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# 4. AMI Lookup for Ubuntu 24.04 LTS (Noble)
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

# 5. Security Group
resource "aws_security_group" "app_sg" {
  name        = "${var.project_name}-sg"
  description = "Security group for DigiTalent AI application"
  vpc_id      = data.aws_vpc.default.id

  # SSH Access
  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidr
  }

  # HTTP (Web Frontend & API)
  ingress {
    description = "HTTP web traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS (for future domain)
  ingress {
    description = "HTTPS web traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # MinIO Console (Optional web management)
  ingress {
    description = "MinIO Console UI"
    from_port   = 9001
    to_port     = 9001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound rule
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}

# 6. EC2 Instance
resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.generated_key.key_name
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  subnet_id              = tolist(data.aws_subnets.default.ids)[0]

  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    delete_on_termination = true
    tags = {
      Name = "${var.project_name}-root-disk"
    }
  }

  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    GIT_REPO_URL      = var.git_repo_url
    GIT_BRANCH        = var.git_branch
    POSTGRES_DB       = var.postgres_db
    POSTGRES_USER     = var.postgres_user
    POSTGRES_PASSWORD = local.final_postgres_password
    JWT_SIGNING_KEY   = local.final_jwt_signing_key
    MINIO_ACCESS_KEY  = var.minio_access_key
    MINIO_SECRET_KEY  = local.final_minio_secret_key
  })

  tags = {
    Name = "${var.project_name}-server"
  }
}

# 7. Elastic IP (Guarantees Static Public IP for Web Access)
resource "aws_eip" "app_eip" {
  instance = aws_instance.app_server.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-eip"
  }
}
