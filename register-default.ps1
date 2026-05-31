# ==========================================================================
# MarkdownPro - Windows File Association Registration Script
# ==========================================================================
# This script associates .md and .markdown files with the portable
# MarkdownPro.exe compiled by electron-builder.
#
# Running this script registers the application under HKEY_CURRENT_USER (HKCU).
# This means you DO NOT need Administrator privileges to run this script!
# ==========================================================================

# Clear host and show logo
Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      MarkdownPro - Windows File Association Setup" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Resolve executable path
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ExePath = Join-Path $ScriptDir "dist\MarkdownPro-win32-x64\MarkdownPro.exe"

# 2. Check if the compiled executable exists
if (-not (Test-Path $ExePath)) {
    Write-Host "[!] Compiled executable not found at: " -ForegroundColor Yellow
    Write-Host "    $ExePath" -ForegroundColor White
    Write-Host ""
    Write-Host "Please build the application first by running:" -ForegroundColor Green
    Write-Host "    npm run dist" -ForegroundColor White
    Write-Host "in your command prompt or powershell workspace." -ForegroundColor Green
    Write-Host ""
    Write-Host "After 'npm run dist' finishes, run this script again." -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Cyan
    Exit
}

Write-Host "[+] Found compiled executable at:" -ForegroundColor Green
Write-Host "    $ExePath" -ForegroundColor White
Write-Host ""

# 3. Establish registry entries for current user (HKCU)
$RegClassesPath = "HKCU:\Software\Classes"

try {
    Write-Host "[*] Configuring registry keys for file association..." -ForegroundColor Cyan
    
    # Register the application
    $AppPath = "$RegClassesPath\Applications\MarkdownPro.exe"
    if (-not (Test-Path $AppPath)) { New-Item -Path $AppPath -Force | Out-Null }
    
    $AppShellPath = "$AppPath\shell\open\command"
    if (-not (Test-Path $AppShellPath)) { New-Item -Path $AppShellPath -Force | Out-Null }
    Set-ItemProperty -Path $AppShellPath -Name "(Default)" -Value "`"$ExePath`" `"%1`""

    # Register the document type
    $DocPath = "$RegClassesPath\MarkdownPro.Document"
    if (-not (Test-Path $DocPath)) { New-Item -Path $DocPath -Force | Out-Null }
    Set-ItemProperty -Path $DocPath -Name "(Default)" -Value "Markdown Document"
    
    $DocShellPath = "$DocPath\shell\open\command"
    if (-not (Test-Path $DocShellPath)) { New-Item -Path $DocShellPath -Force | Out-Null }
    Set-ItemProperty -Path $DocShellPath -Name "(Default)" -Value "`"$ExePath`" `"%1`""

    # Associate .md extension
    $MdPath = "$RegClassesPath\.md"
    if (-not (Test-Path $MdPath)) { New-Item -Path $MdPath -Force | Out-Null }
    Set-ItemProperty -Path $MdPath -Name "(Default)" -Value "MarkdownPro.Document"
    # Set helper tag for Explorer association list
    Set-ItemProperty -Path $MdPath -Name "PerceivedType" -Value "text"

    # Associate .markdown extension
    $MarkdownPath = "$RegClassesPath\.markdown"
    if (-not (Test-Path $MarkdownPath)) { New-Item -Path $MarkdownPath -Force | Out-Null }
    Set-ItemProperty -Path $MarkdownPath -Name "(Default)" -Value "MarkdownPro.Document"
    Set-ItemProperty -Path $MarkdownPath -Name "PerceivedType" -Value "text"

    Write-Host "[+] Registry configuration completed successfully!" -ForegroundColor Green
    Write-Host ""
    
    # 4. Instructions for Win 10 & Win 11
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "🎉 Almost Done! Just one final step is needed by Windows:" -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "1. Double-click any '.md' file on your computer." -ForegroundColor White
    Write-Host "2. If a popup asks 'How do you want to open this file?':" -ForegroundColor White
    Write-Host "   - Select 'MarkdownPro' in the list." -ForegroundColor Green
    Write-Host "   - Check the box 'Always use this app to open .md files'." -ForegroundColor Green
    Write-Host "   - Click OK." -ForegroundColor Green
    Write-Host "3. Alternatively, right-click any '.md' file -> 'Properties'." -ForegroundColor White
    Write-Host "   - Click 'Change...' next to 'Opens with'." -ForegroundColor White
    Write-Host "   - Select 'MarkdownPro' and click 'OK'." -ForegroundColor Green
    Write-Host ""
    Write-Host "Your premium Markdown Live Previewer is now ready to roll!" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "[!] Error occurred during registry modification:" -ForegroundColor Red
    Write-Host "    $_.Exception.Message" -ForegroundColor White
}
Write-Host ""
