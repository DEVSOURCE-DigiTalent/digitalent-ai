# ==============================================================================
# DigiTalent AI - AWS Terraform Automated Deployment Script
# ==============================================================================
[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$AwsAccessKey,

    [Parameter(Mandatory=$false)]
    [string]$AwsSecretKey,

    [Parameter(Mandatory=$false)]
    [string]$AwsRegion = "ap-southeast-1",

    [Parameter(Mandatory=$false)]
    [switch]$SyncLocalCode
)

$ErrorActionPreference = "Stop"

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "       DigiTalent AI - AWS Deployment (Terraform)     " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Check / Prompt AWS Credentials
if (-not [string]::IsNullOrEmpty($AwsAccessKey)) {
    $env:AWS_ACCESS_KEY_ID = $AwsAccessKey
}
if (-not [string]::IsNullOrEmpty($AwsSecretKey)) {
    $env:AWS_SECRET_ACCESS_KEY = $AwsSecretKey
}
$env:AWS_DEFAULT_REGION = $AwsRegion

if ([string]::IsNullOrEmpty($env:AWS_ACCESS_KEY_ID)) {
    $env:AWS_ACCESS_KEY_ID = Read-Host "Enter AWS Access Key ID (e.g. AKIA...)"
}
if ([string]::IsNullOrEmpty($env:AWS_SECRET_ACCESS_KEY)) {
    $env:AWS_SECRET_ACCESS_KEY = Read-Host "Enter AWS Secret Access Key" -AsSecureString | ForEach-Object {
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)
        [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    }
}

if ([string]::IsNullOrEmpty($env:AWS_ACCESS_KEY_ID) -or [string]::IsNullOrEmpty($env:AWS_SECRET_ACCESS_KEY)) {
    Write-Error "AWS Credentials are required to provision infrastructure on AWS."
    exit 1
}

# 2. Check Terraform
try {
    $tfVer = terraform -version
    Write-Host "[OK] Terraform found: $($tfVer[0])" -ForegroundColor Green
} catch {
    Write-Error "Terraform is not installed or not in PATH."
    exit 1
}

$terraformDir = Join-Path $PSScriptRoot "terraform"
Set-Location $terraformDir

Write-Host "`n[1/3] Initializing Terraform..." -ForegroundColor Yellow
terraform init

Write-Host "`n[2/3] Provisioning AWS Infrastructure (EC2 + Elastic IP + Security Group)..." -ForegroundColor Yellow
terraform apply -auto-approve

Write-Host "`n[3/3] Deployment Information:" -ForegroundColor Green
$publicIp = terraform output -raw public_ip
$webUrl = terraform output -raw web_url
$minioUrl = terraform output -raw minio_console_url
$sshCmd = terraform output -raw ssh_command

Write-Host "-----------------------------------------------------" -ForegroundColor Cyan
Write-Host "-> Web Application URL : $webUrl" -ForegroundColor Green
Write-Host "-> MinIO Storage URL   : $minioUrl" -ForegroundColor Green
Write-Host "-> Static Elastic IP   : $publicIp" -ForegroundColor Yellow
Write-Host "-> SSH Command         : $sshCmd" -ForegroundColor Gray
Write-Host "-----------------------------------------------------" -ForegroundColor Cyan
Write-Host "Note: EC2 cloud-init is building Docker containers in the background." -ForegroundColor Yellow
Write-Host "Please allow 2-4 minutes for the first boot & Docker build to complete." -ForegroundColor Yellow
Write-Host "You can monitor the deployment log via SSH using:" -ForegroundColor Gray
Write-Host "  $sshCmd 'tail -f /var/log/user-data.log'" -ForegroundColor White

if ($SyncLocalCode) {
    Write-Host "`n[*] Syncing local workspace files to EC2..." -ForegroundColor Yellow
    $keyFile = Join-Path $terraformDir "digitalent_key.pem"
    # Wait for SSH to become ready
    Write-Host "Waiting for SSH to become available..."
    Start-Sleep -Seconds 20
    
    # Bundle source code
    $tempZip = Join-Path $env:TEMP "digitalent-code.tar.gz"
    Write-Host "Packaging local source code..."
    tar --exclude="node_modules" --exclude=".git" --exclude="bin" --exclude="obj" -czf $tempZip -C (Split-Path $PSScriptRoot -Parent) .
    
    Write-Host "Uploading code to EC2..."
    scp -o StrictHostKeyChecking=no -i $keyFile $tempZip "ubuntu@${publicIp}:/tmp/digitalent-code.tar.gz"
    
    Write-Host "Extracting and rebuilding containers on EC2..."
    ssh -o StrictHostKeyChecking=no -i $keyFile "ubuntu@${publicIp}" "sudo tar -xzf /tmp/digitalent-code.tar.gz -C /opt/digitalent-ai && cd /opt/digitalent-ai/docker && sudo docker compose up -d --build"
    Write-Host "[OK] Sync complete and containers updated!" -ForegroundColor Green
}
