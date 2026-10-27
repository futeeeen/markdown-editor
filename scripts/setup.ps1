# ==========================================================================
# MarkdownPro - 一鍵快速設定
# ==========================================================================
# 此腳本會：
#   1. 建立開始功能表捷徑（Windows 搜尋可找到）
#   2. 註冊 .md / .markdown 檔案關聯
# ==========================================================================

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      MarkdownPro - 一鍵快速設定" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] 建立開始功能表捷徑..." -ForegroundColor Yellow
& "$ScriptDir\create-shortcut.ps1"

Write-Host ""
Write-Host "[2/2] 註冊檔案關聯..." -ForegroundColor Yellow
& "$ScriptDir\register-default.ps1"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  全部設定完成！" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
pause
