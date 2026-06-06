# scripts/deploy_local.ps1
# Automates local testing of the CI/CD database migration pipeline.

# Get the directory of this script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Ensure we run in the terraform directory
Set-Location -Path "$ScriptDir\..\terraform"

Write-Host "1. Selecting dev workspace..." -ForegroundColor Cyan
terraform workspace select anika-landing-page-dev

Write-Host "2. Applying Terraform configuration..." -ForegroundColor Cyan
terraform apply "-var-file=environments/dev.tfvars" -auto-approve

if ($LASTEXITCODE -ne 0) {
    Write-Error "Terraform apply failed!"
    exit $LASTEXITCODE
}

# 3. Extract database connection URL
Write-Host "3. Extracting Database Connection URL..." -ForegroundColor Cyan
$dbUrl = terraform output -raw db_url

if (-not $dbUrl -or $dbUrl -eq "<sensitive>") {
    # If the value is sensitive and outputs aren't decrypted, try getting it direct
    Write-Host "Refetching raw output value..."
    $dbUrl = terraform output -json | ConvertFrom-Json | Select-Object -ExpandProperty db_url | Select-Object -ExpandProperty value
}

if (-not $dbUrl) {
    Write-Error "Failed to retrieve db_url from Terraform outputs!"
    exit 1
}

# 4. Push database migrations via Supabase CLI
Write-Host "4. Pushing database migrations via Supabase CLI..." -ForegroundColor Cyan
Set-Location -Path "$ScriptDir\.."
supabase db push --db-url $dbUrl

if ($LASTEXITCODE -ne 0) {
    Write-Error "Supabase database migrations failed!"
    exit $LASTEXITCODE
}

Write-Host "Local deployment test completed successfully!" -ForegroundColor Green
