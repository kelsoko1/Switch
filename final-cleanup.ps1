# Final cleanup script - removes all non-essential files and directories

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
    "server"
)

# Create a temporary directory for essential files
$tempDir = "$env:TEMP\kijumbesmart-cleanup-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy essential files to temp directory
foreach ($file in $keepFiles) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination "$tempDir\$file" -Force
    }
}

# Copy essential directories to temp directory
foreach ($dir in $keepDirs) {
    if (Test-Path $dir) {
        $destDir = "$tempDir\$dir"
        New-Item -ItemType Directory -Path (Split-Path -Parent $destDir) -Force | Out-Null
        Copy-Item -Path "$dir" -Destination $destDir -Recurse -Force
    }
}

# Copy scripts directory if it exists
if (Test-Path "scripts") {
    Copy-Item -Path "scripts" -Destination "$tempDir\scripts" -Recurse -Force
}

# Remove all files in the current directory
Remove-Item * -Recurse -Force -Exclude $keepFiles -ErrorAction SilentlyContinue

# Remove all directories except the ones we want to keep
Get-ChildItem -Directory | Where-Object { $_.Name -notin $keepDirs -and $_.Name -ne "scripts" } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# Copy files back from temp directory
Copy-Item -Path "$tempDir\*" -Destination . -Recurse -Force

# Remove temp directory
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Final cleanup completed. Only essential files and directories remain."
