# MarkdownPro 發佈與使用指南

## 建立 Windows 版本

在專案根目錄執行 `npm ci`，再依需要執行：

- `npm run dist`：產生 `dist/MarkdownPro-win32-x64/` 資料夾。分享時請壓縮整個資料夾，不能只複製 exe。
- `npm run build:installer`：在 `dist/` 產生 NSIS 安裝程式。
- `npm run build:portable`：在 `dist/` 產生可攜式執行檔。

打包設定與檔名以 `package.json` 為準。使用者執行打包版本不需安裝 Node.js。

## 開啟 Markdown 檔案

啟動 MarkdownPro 後開啟文件，或在 Windows 檔案總管對 `.md` 檔案按右鍵，選擇「開啟檔案」及 MarkdownPro。若要設為預設程式，請在 Windows 的「設定 → 應用程式 → 預設應用程式」中設定 `.md` 和 `.markdown`。

## 可攜式資料夾的輔助腳本

`scripts/` 中的腳本可建立開始功能表捷徑及註冊檔案類型。若要搭配 `npm run dist` 產生的資料夾使用，將 `scripts` 資料夾複製到 `MarkdownPro.exe` 所在的資料夾內，再從該資料夾執行所需腳本。Windows 仍可能要求使用者在系統設定中選擇預設應用程式。

安裝程式與可攜式執行檔的打包設定會將 `scripts/` 放入應用程式的資源目錄；不要假設它們位於執行檔旁邊。
