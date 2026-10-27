# ==========================================================================
# MarkdownPro - 建立開始功能表捷徑（讓 Windows 搜尋找得到）
# ==========================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 動態偵測 exe 位置
$PossiblePaths = @(
    (Join-Path $ScriptDir "MarkdownPro.exe"),
    (Join-Path (Split-Path $ScriptDir -Parent) "MarkdownPro.exe"),
    (Join-Path $ScriptDir "..\MarkdownPro.exe")
)

$ExePath = $null
$ExeDir  = $null
foreach ($p in $PossiblePaths) {
    $resolved = [System.IO.Path]::GetFullPath($p)
    if (Test-Path $resolved) {
        $ExePath = $resolved
        $ExeDir  = Split-Path $resolved -Parent
        break
    }
}

if (-not $ExePath) {
    Write-Host "[!] 找不到 MarkdownPro.exe！" -ForegroundColor Red
    Write-Host "    請將此腳本放在 MarkdownPro.exe 同目錄或其 scripts 子目錄中。" -ForegroundColor Yellow
    pause
    Exit
}

$WshShell     = New-Object -ComObject WScript.Shell
$ShortcutPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\MarkdownPro.lnk"
$Shortcut     = $WshShell.CreateShortcut($ShortcutPath)

$Shortcut.TargetPath       = $ExePath
$Shortcut.WorkingDirectory = $ExeDir
$Shortcut.Description      = "Premium Markdown Editor & Live Previewer"
$Shortcut.IconLocation     = "$ExePath,0"
$Shortcut.Save()

Write-Host "--------------------------------------------------------" -ForegroundColor Green
Write-Host "[成功] 開始功能表快捷方式已建立！" -ForegroundColor Green
Write-Host "現在您可以按 Win 鍵，輸入 'MarkdownPro' 找到並開啟此軟體。" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Green
pause
