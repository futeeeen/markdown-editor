$WshShell = New-Object -ComObject WScript.Shell
$ShortcutPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\MarkdownPro.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "C:\futen\Project\Markdown-preview\dist\MarkdownPro-win32-x64\MarkdownPro.exe"
$Shortcut.WorkingDirectory = "C:\futen\Project\Markdown-preview\dist\MarkdownPro-win32-x64"
$Shortcut.Description = "Premium Markdown Editor & Live Previewer"
$Shortcut.IconLocation = "C:\futen\Project\Markdown-preview\dist\MarkdownPro-win32-x64\MarkdownPro.exe,0"
$Shortcut.Save()

Write-Host "--------------------------------------------------------" -ForegroundColor Green
Write-Host "【成功】開始功能表快捷方式已建立！" -ForegroundColor Green
Write-Host "現在您可以在 Windows 搜尋欄中輸入 'markdown' 找到並開啟此軟體。" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Green
