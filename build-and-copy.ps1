# =============================================================================
# build-and-copy.ps1
# Builds the React frontend and copies the output into the Spring Boot
# static resources folder so Spring Boot serves the SPA from one JAR.
#
# Run from the repo root (PowerShell):
#   .\build-and-copy.ps1
# =============================================================================

Write-Host "==> Building React frontend..." -ForegroundColor Cyan
Set-Location frontend
npm install
npm run build
Set-Location ..

Write-Host "==> Copying dist/ to backend static resources..." -ForegroundColor Cyan
$dest = "backend\src\main\resources\static"
if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
New-Item -ItemType Directory -Path $dest | Out-Null
Copy-Item -Recurse -Path "frontend\dist\*" -Destination $dest

Write-Host "==> Done! The frontend is now embedded in the Spring Boot app." -ForegroundColor Green
Write-Host "    Next: cd backend && .\mvnw spring-boot:run" -ForegroundColor Green
