# Script to clean up the kijumbe-1 directory after successful migration
# WARNING: This will permanently delete the kijumbe-1 directory

$kijumbePath = "kijumbe-1"
$backupPath = "kijumbe-1-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Check if kijumbe-1 directory exists
if (Test-Path $kijumbePath) {
    Write-Host "Found kijumbe-1 directory at: $((Get-Item $kijumbePath).FullName)"
    
    # Ask for confirmation
    $confirmation = Read-Host "Do you want to create a backup before deleting? (y/n)"
    
    if ($confirmation -eq 'y') {
        # Create a backup
        Write-Host "Creating backup at: $backupPath"
        Copy-Item -Path $kijumbePath -Destination $backupPath -Recurse -Force
        Write-Host "Backup created successfully at: $backupPath" -ForegroundColor Green
    }
    
    # Ask for confirmation before deletion
    $confirmation = Read-Host "Are you sure you want to delete the kijumbe-1 directory? (y/n)"
    
    if ($confirmation -eq 'y') {
        # Remove the directory
        Remove-Item -Path $kijumbePath -Recurse -Force
        Write-Host "kijumbe-1 directory has been deleted." -ForegroundColor Green
    } else {
        Write-Host "Operation cancelled. kijumbe-1 directory was not deleted." -ForegroundColor Yellow
    }
} else {
    Write-Host "kijumbe-1 directory not found at: $((Get-Item .).FullName)\$kijumbePath" -ForegroundColor Yellow
}

Write-Host "Cleanup process completed." -ForegroundColor Cyan
