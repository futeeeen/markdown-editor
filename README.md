# 🚀 MarkdownPro

> **MarkdownPro** is a premium, desktop-grade Markdown Editor and Live Previewer built with Node.js and Electron. Inspired by standard web-based previewers, it is engineered as a high-performance Windows desktop application, featuring a gorgeous glassmorphic user interface, Notepad++ style multi-tabs, high-fidelity offline LaTeX math equations (KaTeX), responsive scroll sync, and theme-aware PDF/HTML exporting.

---

## ✨ Key Features & Technical Highlights

### 🎨 1. Premium Glassmorphic Design & Themes
* **Translucent Layout**: Aesthetic glassmorphism containers (`backdrop-filter: blur(16px)`) with glowing borders and smooth micro-animations.
* **5 High-End Theme Palettes**:
  * 🌌 **Aether Dark (Default)**: Deep obsidian with glowing purple and blue gradients.
  * 🏔️ **Nordic Light**: Serene, high-contrast white paper with frosty ice-blue accents.
  * ⚡ **Cyberpunk Grid**: Radioactive green text on terminal black with neon magenta accents.
  * 🌿 **Forest Moss**: Calming timber green tones with warm copper/amber highlights.
  * 🧛 **Dracula Tribute**: Classic purple-tinged gothic code editor.
* **Theme-Aware Highlighting**: Code syntax highlighting (`highlight.js`) dynamically adapts its theme colors to match your chosen aesthetic.

### 🕒 2. Search & Replace with Rolling Undo History
* **Draggable Floating Panel**: Overlay modal box that does not block background editor typing and clicks.
* **Rolling Action Queue**: Keeps track of the **last 3 replacements** (both *Replace* and *Replace All*).
* **Tab-Aware Multi-Tab Rollback**: Undo transactions automatically switch to the correct tab and revert files to their exact pre-replacement state chronologically, preserving timeline integrity.

### 🧮 3. High-Fidelity Offline LaTeX Equations (KaTeX)
* **Mathematical Symbols Rendering**: Elegant mathematical equations rendering using KaTeX.
* **Inline & Block Math**: Supports standard `$inline math$` and Centered `$$block math$$` equations.
* **100% Offline Capability**: Both JS parsers and LaTeX fonts load directly from the local directory with zero external network requests.
* **Zero Conflicts**: LaTeX blocks are parsed prior to Markdown compilation, completely avoiding conflicts with Markdown characters like `_` (italics) or `\\` (escapes).

### 🎨 4. Theme-Aware Full-Bleed PDF & HTML Exporting
* **Dynamic Style Extraction**: Clicking "HTML" or "PDF" uses `getComputedStyle` to read all active theme custom variables.
* **Edge-to-Edge Margins Fix**: Background color propagation applies directly to the `html` element to ensure both exported HTML webpages and high-fidelity PDF documents extend background colors edge-to-edge covering the print margins, completely eliminating the white margins mismatch.

### 💾 5. Notepad++ Inspired Multi-Tab System
* **Draft Caching**: Manage multiple documents in separate tabs without being forced to save existing drafts first.
* **Unsaved Changes Dot**: The title bar and tabs feature a red indicator showing dirty files.
* **Exit Guard Sequence**: Closing the application or tabs automatically queues unsaved files and prompts you to Save, Discard, or Cancel.

### 🛠️ 6. Advanced Writer Utilities
* **Responsive Scroll Sync**: Perfect scroll-sync algorithm matches editor scroll height with live preview positioning seamlessly.
* **Outline (TOC) Sidebar**: Left sidebar parses headers (`#` to `####`) in real-time. Clicking any outline heading scrolls both panes instantly.
* **Bracket Auto-Pairing**: Auto-closes brackets `() [] {}` and quotes `"" ''`.
* **Image Drag & Drop**: Dragging an image from Windows Explorer into the editor automatically converts it into a local Markdown image link.
* **Word Statistics & Tracking**: Gutter line numbers, cursor coordinates tracking, paragraph/char counts, and estimated reading time.

---

## 📦 Getting Started (Local Development)

### Prerequisites
Make sure you have Node.js and npm installed on your Windows machine.

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/futeeeen/markdown-editor.git
   cd markdown-editor
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```

---

## ⚙️ Setting as the Default Windows Opener

We have created an automated PowerShell script to associate `.md` and `.markdown` files with this application in the Windows Registry under the current user space (no Admin privileges required).

### Step 1: Package the Standalone Application
Run the packaged script to bundle the application into a portable Windows executable:
```bash
npm run dist
```
This writes the standalone folder containing the executable to:
`dist\MarkdownPro-win32-x64\MarkdownPro.exe`

### Step 2: Run the Registry Script
Open **PowerShell** in the project root folder and execute:
```powershell
.\register-default.ps1
```

### Step 3: Set Default Handler in Windows Explorer
1. Locate any `.md` file in Windows Explorer, right-click, and select **Open with -> Choose another app**.
2. Select **MarkdownPro** from the list, check the box **"Always use this app to open .md files"**, and click **OK**.

---

## 🛠️ Built With

* **Electron** - Native desktop framework
* **Marked** - Ultra-fast Markdown compilation
* **KaTeX** - High-fidelity math typesetting
* **Highlight.js** - Syntax highlighting
* **Lucide Icons** - Modern SVG icons

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
