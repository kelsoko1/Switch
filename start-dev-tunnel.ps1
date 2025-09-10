Write-Host "🚀 Starting Kijumbe Development Server with ngrok tunnel..." -ForegroundColor Green
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "1. Start ngrok tunnel on port 3000" -ForegroundColor White
Write-Host "2. Display the webhook URL for GreenAPI" -ForegroundColor White
Write-Host "3. Start your development server" -ForegroundColor White
Write-Host "4. Automatically update .env with the webhook URL" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

npm run dev:tunnel
