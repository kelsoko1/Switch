# Cleanup script for KijumbeSmart deployment

# Files to keep
$keepFiles = @(
    # Configuration files
    ".dockerignore",
    "docker-compose.yml",
    "Dockerfile",
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tailwind.config.js",
    "postcss.config.js",
    "eslint.config.js",
    "tsconfig.json",
    "tsconfig.node.json",
    "tsconfig.app.json",
    
    # Environment files
    ".env.example",
    
    # Documentation
    "README.md",
    "DEPLOYMENT.md",
    "DOCKER_DEPLOYMENT.md",
    "TROUBLESHOOTING.md",
    
    # Scripts
    "deploy.sh",
    "manage.sh"
)

# Directories to keep
$keepDirs = @(
    "nginx",
    "ejabberd",
    "janus",
    "src",
    "server",
    "scripts"
)

# Create essential scripts directory
New-Item -ItemType Directory -Force -Path "scripts" | Out-Null

# Copy essential scripts
$essentialScripts = @(
    "backup.sh",
    "restore.sh"
)

foreach ($script in $essentialScripts) {
    if (Test-Path $script) {
        Move-Item -Path $script -Destination "scripts\$script" -Force
    }
}

# Remove all files not in the keep list
Get-ChildItem -File | Where-Object { $_.Name -notin $keepFiles -and $_.Name -ne "cleanup.ps1" } | Remove-Item -Force

# Remove all directories not in the keep list
Get-ChildItem -Directory | Where-Object { $_.Name -notin $keepDirs -and $_.Name -ne "node_modules" } | Remove-Item -Recurse -Force

Write-Host "Cleanup completed. The following directories and files were kept:"
Write-Host "Files: $($keepFiles -join ', ')"
Write-Host "Directories: $($keepDirs -join ', ')"
