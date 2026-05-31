const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let isForceClose = false;

// Determine if we have a file path passed via command line arguments
function getFilePathFromArgv() {
  const args = process.argv.slice(app.isPackaged ? 1 : 2);
  for (const arg of args) {
    if (!arg.startsWith('-')) {
      try {
        const resolved = path.resolve(arg);
        if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
          return resolved;
        }
      } catch (e) {
        // Ignore errors
      }
    }
  }
  return null;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'MarkdownPro - Premium Previewer & Editor',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Disable sandbox to allow loading marked & highlight.js in preload
      webSecurity: true
    },
    // Elegant frame styling
    titleBarStyle: 'default', // Using standard for robust compatibility but customized menu
    show: false
  });

  // Load index.html
  mainWindow.loadFile('index.html');

  // Show window when ready to prevent flicker
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Intercept window close to handle unsaved changes
  mainWindow.on('close', (e) => {
    if (isForceClose) return;
    
    e.preventDefault();
    mainWindow.webContents.send('close-request');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create custom premium menus
  createApplicationMenu();
}

function createApplicationMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu-new-file')
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu-open-file')
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu-save-file')
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow.webContents.send('menu-save-as-file')
        },
        { type: 'separator' },
        {
          label: 'Export to HTML...',
          click: () => mainWindow.webContents.send('menu-export-html')
        },
        {
          label: 'Export to PDF...',
          click: () => mainWindow.webContents.send('menu-export-pdf')
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'Alt+F4',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Find & Replace',
          accelerator: 'CmdOrCtrl+F',
          click: () => mainWindow.webContents.send('menu-find-replace')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Left Sidebar (TOC)',
          accelerator: 'CmdOrCtrl+Shift+L',
          click: () => mainWindow.webContents.send('menu-toggle-toc')
        },
        {
          label: 'Toggle Right Sidebar (Cheat Sheet)',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => mainWindow.webContents.send('menu-toggle-cheatsheet')
        },
        {
          label: 'Toggle Split Layout',
          accelerator: 'CmdOrCtrl+P',
          click: () => mainWindow.webContents.send('menu-toggle-split')
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Themes',
      submenu: [
        {
          label: 'Aether Dark',
          click: () => mainWindow.webContents.send('menu-set-theme', 'theme-aether-dark')
        },
        {
          label: 'Nordic Light',
          click: () => mainWindow.webContents.send('menu-set-theme', 'theme-nordic-light')
        },
        {
          label: 'Cyberpunk Grid',
          click: () => mainWindow.webContents.send('menu-set-theme', 'theme-cyberpunk')
        },
        {
          label: 'Forest Moss',
          click: () => mainWindow.webContents.send('menu-set-theme', 'theme-forest')
        },
        {
          label: 'Dracula Tribute',
          click: () => mainWindow.webContents.send('menu-set-theme', 'theme-dracula')
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Markdown Guide',
          click: () => mainWindow.webContents.send('menu-show-help')
        },
        {
          label: 'About MarkdownPro',
          click: () => {
            const win = BrowserWindow.getFocusedWindow() || mainWindow;
            if (win) {
              if (win.isMinimized()) win.restore();
              win.focus();
            }
            dialog.showMessageBox(win, {
              type: 'info',
              title: 'About MarkdownPro',
              message: 'MarkdownPro - Premium Markdown Editor & Live Previewer',
              detail: 'Version 1.0.0\nCreated with Node.js and Electron.\nFeatures custom fluid themes, responsive scroll sync, real-time table of contents generation, and native Windows integration.',
              buttons: ['Awesome!']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Single Instance Application Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      // If a second file is opened via double-click while app is running,
      // load it into the current window! (Or we can choose to open a new window)
      // For simplicity, let's load it in the existing window to prevent clutter.
      const args = commandLine.slice(app.isPackaged ? 1 : 2);
      for (const arg of args) {
        if (!arg.startsWith('-')) {
          try {
            const resolved = path.resolve(arg);
            if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
              mainWindow.webContents.send('open-file-path', resolved);
              break;
            }
          } catch (e) {
            // Ignore
          }
        }
      }
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
// Helper to get active window safely and force focus it to prevent dialog from opening behind
function getActiveWindow(event) {
  let win = null;
  if (event && event.sender) {
    win = BrowserWindow.fromWebContents(event.sender);
  }
  win = win || mainWindow;
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
  return win;
}

// IPC Handler Registrations
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Failed to read file ${filePath}:`, error);
    throw error;
  }
});

const lastSavedMtimes = new Map(); // filePath -> mtimeMs

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    try {
      const stats = fs.statSync(filePath);
      lastSavedMtimes.set(filePath, stats.mtimeMs);
    } catch (e) {
      console.error('Failed to log saved mtime:', e);
    }
    return true;
  } catch (error) {
    console.error(`Failed to write file ${filePath}:`, error);
    throw error;
  }
});

ipcMain.handle('show-open-dialog', async (event) => {
  const win = getActiveWindow(event);
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Open Markdown File',
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown', 'mdown', 'txt'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  });

  if (canceled || filePaths.length === 0) {
    return null;
  }

  const filePath = filePaths[0];
  const content = fs.readFileSync(filePath, 'utf-8');
  return { filePath, content };
});

ipcMain.handle('show-save-dialog', async (event, suggestedPath) => {
  const win = getActiveWindow(event);
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Save Markdown File',
    defaultPath: suggestedPath || 'document.md',
    filters: [
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (canceled) {
    return null;
  }

  return filePath;
});

ipcMain.handle('get-argv-file', async (event) => {
  const filePath = getFilePathFromArgv();
  if (filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return { filePath, content };
    } catch (e) {
      console.error('Error reading argv file path:', e);
    }
  }
  return null;
});

ipcMain.on('force-close', () => {
  isForceClose = true;
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('export-pdf', async (event, htmlContent, suggestedPath, themeClass, themeStyles) => {
  const win = getActiveWindow(event);
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Export to PDF',
    defaultPath: suggestedPath || 'document.pdf',
    filters: [{ name: 'PDF Document', extensions: ['pdf'] }]
  });

  if (canceled || !filePath) return false;

  // Create a hidden offscreen window to render the HTML print target
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      webSecurity: false // Temporary allow local access for printing
    }
  });

  const katexPath = path.join(__dirname, 'node_modules', 'katex', 'dist', 'katex.min.css').replace(/\\/g, '/');

  // Inject Google fonts and stylesheet matching the theme!
  const cleanHtml = `
    <!DOCTYPE html>
    <html class="${themeClass || ''}">
    <head>
      <meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
      <style>
        :root {
          ${themeStyles || ''}
        }
        @page {
          margin: 0;
        }
        html {
          background-color: var(--bg-app, #ffffff);
          margin: 0;
          padding: 0;
        }
        body {
          background-color: transparent !important;
          font-family: 'Inter', sans-serif;
          color: var(--text-main, #1a1a1a);
          line-height: 1.6;
          padding: 2cm;
          font-size: 11pt;
          box-sizing: border-box;
          min-height: 100vh;
          margin: 0;
        }
        body > *:first-child {
          margin-top: 0 !important;
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          color: var(--text-main, #111);
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        h1 { font-size: 24pt; border-bottom: 1px solid var(--md-hr, #eaeaea); padding-bottom: 0.3em; }
        h2 { font-size: 18pt; border-bottom: 1px solid var(--md-hr, #f0f0f0); padding-bottom: 0.3em; }
        h3 { font-size: 14pt; }
        code {
          font-family: 'Fira Code', monospace;
          background: var(--md-code-bg, #f4f4f4);
          border: 1px solid var(--md-code-border, rgba(0,0,0,0.06));
          padding: 0.2em 0.4em;
          border-radius: 4px;
          color: var(--accent-color, #0066cc);
          font-size: 9pt;
        }
        pre {
          background: var(--md-code-bg, #f4f4f4);
          border: 1px solid var(--md-code-border, rgba(0,0,0,0.06));
          padding: 1em;
          border-radius: 6px;
          overflow-x: auto;
        }
        pre code {
          background: none;
          color: inherit;
          padding: 0;
          font-size: 8.5pt;
        }
        blockquote {
          border-left: 4px solid var(--md-blockquote-border, #0066cc);
          background: var(--md-blockquote-bg, rgba(0, 102, 204, 0.05));
          margin: 0;
          padding: 0.5em 1em;
          color: var(--text-muted, #555);
          font-style: italic;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
        }
        th, td {
          border: 1px solid var(--md-table-border, #ddd);
          padding: 0.6em 0.8em;
          text-align: left;
        }
        th {
          background: var(--md-table-header, #f9f9f9);
          font-weight: 600;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        a {
          color: var(--md-link, #0066cc);
          text-decoration: none;
        }
        
        /* Syntax Highlighting */
        .hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-section, .hljs-link {
          color: var(--syn-keyword);
          font-weight: 500;
        }
        .hljs-string, .hljs-doctag, .hljs-regexp, .hljs-attr {
          color: var(--syn-string);
        }
        .hljs-comment, .hljs-quote {
          color: var(--syn-comment);
          font-style: italic;
        }
        .hljs-number, .hljs-variable, .hljs-template-variable, .hljs-type, .hljs-tag {
          color: var(--syn-number);
        }
        .hljs-function, .hljs-title, .hljs-section-title {
          color: var(--syn-function);
        }
        .hljs-built_in, .hljs-class {
          color: var(--syn-title);
        }
        
        @media print {
          html {
            background-color: var(--bg-app, #ffffff) !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            padding: 2cm;
            background-color: transparent !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          a[href]::after { content: " (" attr(href) ")"; font-size: 90%; color: #666; }
        }
      </style>
      
      <!-- Offscreen Print Window local KaTeX styling support -->
      <link rel="stylesheet" href="file:///${katexPath}">
    </head>
    <body class="${themeClass || ''}">
      ${htmlContent}
    </body>
    </html>
  `;

  // Write temporary file in AppData to load reliably via file:// protocol
  const tempPath = path.join(app.getPath('userData'), 'temp-print.html');
  
  try {
    fs.writeFileSync(tempPath, cleanHtml, 'utf-8');
    await printWindow.loadURL(`file://${tempPath.replace(/\\/g, '/')}`);

    // Wait 500ms for Chromium headless compositor to paint page frames
    await new Promise(resolve => setTimeout(resolve, 500));

    const data = await printWindow.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true
    });
    fs.writeFileSync(filePath, data);
    printWindow.destroy();
    
    // Delete temp file after printing completes
    try {
      fs.unlinkSync(tempPath);
    } catch (e) {}
    
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    printWindow.destroy();
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch (e) {}
    throw error;
  }
});

// --- Active File Watching & Change Tracking System ---
const activeWatchers = new Map(); // filePath -> fs.FSWatcher

function startWatchingFile(filePath) {
  if (activeWatchers.has(filePath)) return;
  
  try {
    const watcher = fs.watch(filePath, (eventType) => {
      if (eventType === 'change') {
        try {
          if (!fs.existsSync(filePath)) return;
          const stats = fs.statSync(filePath);
          const lastSavedMtime = lastSavedMtimes.get(filePath);
          
          // Debounce/ignore our own application saves (using 1000ms threshold for safety)
          if (lastSavedMtime && Math.abs(stats.mtimeMs - lastSavedMtime) < 1000) {
            return;
          }
          
          if (mainWindow) {
            mainWindow.webContents.send('file-modified-externally', filePath);
          }
        } catch (e) {
          console.error('Error checking watched file stats:', e);
        }
      }
    });
    
    activeWatchers.set(filePath, watcher);
  } catch (err) {
    console.error(`Failed to watch file ${filePath}:`, err);
  }
}

function stopWatchingFile(filePath) {
  const watcher = activeWatchers.get(filePath);
  if (watcher) {
    watcher.close();
    activeWatchers.delete(filePath);
  }
}

ipcMain.on('watch-file', (event, filePath) => {
  startWatchingFile(filePath);
});

ipcMain.on('unwatch-file', (event, filePath) => {
  stopWatchingFile(filePath);
});
