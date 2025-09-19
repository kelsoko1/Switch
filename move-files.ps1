# Create necessary directories if they don't exist
$directories = @(
    "server/config",
    "server/middleware",
    "server/routes",
    "server/services",
    "server/utils"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir"
    }
}

# Copy files from kijumbe-1 to switch
$fileMappings = @{
    # Config files
    "kijumbe-1\src\config\appwrite-fixed.js" = "server/config/appwrite-fixed.js"
    "kijumbe-1\src\config\appwrite.js" = "server/config/appwrite.js"
    
    # Middleware files
    "kijumbe-1\src\middleware\auth-mock.js" = "server/middleware/auth-mock.js"
    "kijumbe-1\src\middleware\auth.js" = "server/middleware/auth.js"
    "kijumbe-1\src\middleware\errorHandler.js" = "server/middleware/errorHandler.js"
    "kijumbe-1\src\middleware\rateLimiter.js" = "server/middleware/rateLimiter.js"
    
    # Route files
    "kijumbe-1\src\routes\admin.js" = "server/routes/admin.js"
    "kijumbe-1\src\routes\auth-mock.js" = "server/routes/auth-mock.js"
    "kijumbe-1\src\routes\auth.js" = "server/routes/auth.js"
    "kijumbe-1\src\routes\groups.js" = "server/routes/groups.js"
    "kijumbe-1\src\routes\wallet.js" = "server/routes/wallet.js"
    "kijumbe-1\src\routes\whatsapp.js" = "server/routes/whatsapp.js"
    
    # Service files
    "kijumbe-1\src\services\selcom.js" = "server/services/selcom.js"
    "kijumbe-1\src\services\wallet.js" = "server/services/wallet.js"
    "kijumbe-1\src\services\whatsapp-bot.js" = "server/services/whatsapp-bot.js"
    
    # Util files
    "kijumbe-1\src\utils\helpers.js" = "server/utils/helpers.js"
}

# Copy files
foreach ($src in $fileMappings.Keys) {
    $dest = $fileMappings[$src]
    
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dest -Force
        Write-Host "Copied: $src -> $dest"
    } else {
        Write-Host "Warning: Source file not found: $src" -ForegroundColor Yellow
    }
}

# Copy server.js
if (Test-Path "kijumbe-1\src\server.js") {
    Copy-Item -Path "kijumbe-1\src\server.js" -Destination "server/server.original.js" -Force
    Write-Host "Copied: kijumbe-1\src\server.js -> server\server.original.js"
} else {
    Write-Host "Warning: server.js not found in kijumbe-1\src\" -ForegroundColor Yellow
}

# Copy package.json
if (Test-Path "kijumbe-1\package.json") {
    Copy-Item -Path "kijumbe-1\package.json" -Destination "server/package.original.json" -Force
    Write-Host "Copied: kijumbe-1\package.json -> server\package.original.json"
}

Write-Host "\nFile copy operation completed!" -ForegroundColor Green
