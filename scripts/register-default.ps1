# ==========================================================================
# MarkdownPro - 可攜式 Windows 檔案關聯註冊腳本
# ==========================================================================
# 此腳本自動偵測 MarkdownPro.exe 位置，無需手動修改路徑。
# 寫入 HKCU（當前使用者），不需要系統管理員權限。
# ==========================================================================

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      MarkdownPro - Windows 檔案關聯設定" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. 動態偵測 MarkdownPro.exe 路徑
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 嘗試多個可能的位置
$PossiblePaths = @(
    (Join-Path $ScriptDir "MarkdownPro.exe"),
    (Join-Path (Split-Path $ScriptDir -Parent) "MarkdownPro.exe"),
    (Join-Path $ScriptDir "..\MarkdownPro.exe")
)

$ExePath = $null
foreach ($p in $PossiblePaths) {
    $resolved = [System.IO.Path]::GetFullPath($p)
    if (Test-Path $resolved) {
        $ExePath = $resolved
        break
    }
}

if (-not $ExePath) {
    Write-Host "[!] 找不到 MarkdownPro.exe！" -ForegroundColor Red
    Write-Host "    請將此腳本放在 MarkdownPro.exe 同目錄或其 scripts 子目錄中。" -ForegroundColor Yellow
    Write-Host ""
    pause
    Exit
}

Write-Host "[+] 偵測到執行檔：" -ForegroundColor Green
Write-Host "    $ExePath" -ForegroundColor White
Write-Host ""

# 2. 寫入登錄檔 (HKCU)
$RegClassesPath = "HKCU:\Software\Classes"

try {
    Write-Host "[*] 正在設定登錄檔..." -ForegroundColor Cyan

    # 註冊應用程式
    $AppPath = "$RegClassesPath\Applications\MarkdownPro.exe"
    if (-not (Test-Path $AppPath)) { New-Item -Path $AppPath -Force | Out-Null }

    $AppShellPath = "$AppPath\shell\open\command"
    if (-not (Test-Path $AppShellPath)) { New-Item -Path $AppShellPath -Force | Out-Null }
    Set-ItemProperty -Path $AppShellPath -Name "(Default)" -Value "`"$ExePath`" `"%1`""

    # 註冊文件類型
    $DocPath = "$RegClassesPath\MarkdownPro.Document"
    if (-not (Test-Path $DocPath)) { New-Item -Path $DocPath -Force | Out-Null }
    Set-ItemProperty -Path $DocPath -Name "(Default)" -Value "Markdown Document"

    $DocShellPath = "$DocPath\shell\open\command"
    if (-not (Test-Path $DocShellPath)) { New-Item -Path $DocShellPath -Force | Out-Null }
    Set-ItemProperty -Path $DocShellPath -Name "(Default)" -Value "`"$ExePath`" `"%1`""

    # 設定圖示
    $DocIconPath = "$DocPath\DefaultIcon"
    if (-not (Test-Path $DocIconPath)) { New-Item -Path $DocIconPath -Force | Out-Null }
    Set-ItemProperty -Path $DocIconPath -Name "(Default)" -Value "`"$ExePath`",0"

    # 關聯 .md
    $MdPath = "$RegClassesPath\.md"
    if (-not (Test-Path $MdPath)) { New-Item -Path $MdPath -Force | Out-Null }
    Set-ItemProperty -Path $MdPath -Name "(Default)" -Value "MarkdownPro.Document"
    Set-ItemProperty -Path $MdPath -Name "PerceivedType" -Value "text"

    # 關聯 .markdown
    $MarkdownPath = "$RegClassesPath\.markdown"
    if (-not (Test-Path $MarkdownPath)) { New-Item -Path $MarkdownPath -Force | Out-Null }
    Set-ItemProperty -Path $MarkdownPath -Name "(Default)" -Value "MarkdownPro.Document"
    Set-ItemProperty -Path $MarkdownPath -Name "PerceivedType" -Value "text"

    Write-Host "[+] 登錄檔設定完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "  還需要最後一步：" -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "1. 雙擊任意 .md 檔案" -ForegroundColor White
    Write-Host "2. 選擇 'MarkdownPro'" -ForegroundColor Green
    Write-Host "3. 勾選「一律使用此應用程式開啟 .md 檔案」" -ForegroundColor Green
    Write-Host ""

} catch {
    Write-Host "[!] 發生錯誤：$($_.Exception.Message)" -ForegroundColor Red
}

pause
