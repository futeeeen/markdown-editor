const { contextBridge, ipcRenderer } = require('electron');

let markedModule = null;
let hljsModule = null;
let katexModule = null;
let modulesLoaded = false;
let onModulesLoadedCallback = null;
let currentParsingFilePath = null;

// Background Asynchronous Preloading
setTimeout(() => {
  try {
    const start = Date.now();
    markedModule = require('marked');
    hljsModule = require('highlight.js');
    katexModule = require('katex');
    modulesLoaded = true;
    console.log(`[Preload] Background modules preloaded in ${Date.now() - start}ms`);
    if (onModulesLoadedCallback) {
      onModulesLoadedCallback();
    }
  } catch (err) {
    console.error('Background module preloading failed:', err);
  }
}, 50);

function getMarkedAndHljs() {
  if (!markedModule || !hljsModule) {
    // Synchronous fallback in case parseMarkdown is somehow triggered before the timeout fires
    markedModule = require('marked');
    hljsModule = require('highlight.js');
  }

  const renderer = new markedModule.Renderer();
  renderer.code = function(code, lang, escaped) {
    const cleanLang = lang ? lang.split(/\s+/)[0] : '';
    if (cleanLang === 'mermaid') {
      return `<div class="mermaid">${code}</div>`;
    }
    
    let highlighted;
    try {
      const language = hljsModule.getLanguage(cleanLang) ? cleanLang : 'plaintext';
      highlighted = hljsModule.highlight(code, { language }).value;
    } catch (e) {
      highlighted = code;
    }
    return `<pre><code class="hljs language-${cleanLang || 'plaintext'}">${highlighted}</code></pre>`;
  };

  renderer.image = function(href, title, text) {
    let cleanHref = href;
    // Check if href is a relative path and we have an active file path
    if (currentParsingFilePath && href && 
        !href.startsWith('http://') && 
        !href.startsWith('https://') && 
        !href.startsWith('file://') && 
        !href.startsWith('data:')) {
      try {
        const path = require('path');
        const dir = path.dirname(currentParsingFilePath);
        const absolutePath = path.resolve(dir, href);
        cleanHref = 'file:///' + absolutePath.replace(/\\/g, '/');
      } catch (e) {
        console.error('Failed to resolve relative image path:', e);
      }
    }
    return `<img src="${cleanHref}" alt="${text || ''}"${title ? ` title="${title}"` : ''}>`;
  };

  markedModule.use({
    renderer: renderer,
    breaks: true,
    gfm: true
  });

  return { marked: markedModule, hljs: hljsModule };
}

contextBridge.exposeInMainWorld('api', {
  // Modules preloading check
  onModulesLoaded: (callback) => {
    onModulesLoadedCallback = callback;
    if (modulesLoaded) {
      callback();
    }
  },
  areModulesLoaded: () => modulesLoaded,

  // Markdown parsing engine
  parseMarkdown: (markdownText, filePath) => {
    currentParsingFilePath = filePath;
    if (!modulesLoaded) {
      // Escape HTML to prevent injection in raw preview
      const escapedText = markdownText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

      return `<div class="preview-loading-placeholder">
                <i data-lucide="loader" class="spinner"></i>
                <span>Preparing editor workspace...</span>
              </div>
              <pre class="loading-markdown-raw">${escapedText}</pre>`;
    }

    try {
      const { marked } = getMarkedAndHljs();
      const katex = katexModule || require('katex');
      const blockMath = [];
      const inlineMath = [];

      // 1. Extract block math $$ ... $$
      let parsedText = markdownText.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
        const placeholder = `@@BLOCK_MATH_${blockMath.length}@@`;
        blockMath.push(formula);
        return placeholder;
      });

      // 2. Extract inline math $ ... $ (not space-padded, no newlines inside)
      parsedText = parsedText.replace(/\$([^\s$](?:[^\n$]*?[^\s$])?)\$/g, (match, formula) => {
        const placeholder = `@@INLINE_MATH_${inlineMath.length}@@`;
        inlineMath.push(formula);
        return placeholder;
      });

      // 3. Parse Markdown with marked
      let html = marked.parse(parsedText);

      // 4. Restore block math by rendering with KaTeX
      blockMath.forEach((formula, i) => {
        try {
          const mathHtml = katex.renderToString(formula, { displayMode: true, throwOnError: false });
          html = html.replace(`@@BLOCK_MATH_${i}@@`, mathHtml);
        } catch (err) {
          html = html.replace(`@@BLOCK_MATH_${i}@@`, `<span class="math-error">${err.message}</span>`);
        }
      });

      // 5. Restore inline math by rendering with KaTeX
      inlineMath.forEach((formula, i) => {
        try {
          const mathHtml = katex.renderToString(formula, { displayMode: false, throwOnError: false });
          html = html.replace(`@@INLINE_MATH_${i}@@`, mathHtml);
        } catch (err) {
          html = html.replace(`@@INLINE_MATH_${i}@@`, `<span class="math-error">${err.message}</span>`);
        }
      });

      return html;
    } catch (e) {
      console.error('Markdown rendering failed:', e);
      return `<div class="render-error"><h3>Render Error</h3><pre>${e.message}</pre></div>`;
    }
  },

  // Safe File I/O
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  showSaveDialog: (suggestedPath) => ipcRenderer.invoke('show-save-dialog', suggestedPath),
  getArgvFile: () => ipcRenderer.invoke('get-argv-file'),
  exportPdf: (htmlContent, suggestedPath, themeClass, themeStyles) => ipcRenderer.invoke('export-pdf', htmlContent, suggestedPath, themeClass, themeStyles),
  saveClipboardImage: (filePath) => ipcRenderer.invoke('save-clipboard-image', filePath),
  moveTempImages: (tempImageMappings, destMarkdownPath) => ipcRenderer.invoke('move-temp-images', tempImageMappings, destMarkdownPath),
  showItemInFolder: (filePath) => ipcRenderer.invoke('show-item-in-folder', filePath),
  
  // File watching bridge
  watchFile: (filePath) => ipcRenderer.send('watch-file', filePath),
  unwatchFile: (filePath) => ipcRenderer.send('unwatch-file', filePath),
  onFileModifiedExternally: (callback) => {
    ipcRenderer.on('file-modified-externally', (event, filePath) => callback(filePath));
  },
  
  // Application Exit Controls
  forceClose: () => ipcRenderer.send('force-close'),
  
  // Event Listeners from Main Process
  onCloseRequest: (callback) => {
    ipcRenderer.on('close-request', () => callback());
  },
  onOpenFilePath: (callback) => {
    ipcRenderer.on('open-file-path', (event, filePath) => callback(filePath));
  },
  onMenuAction: (channel, callback) => {
    const validChannels = [
      'menu-new-file',
      'menu-open-file',
      'menu-save-file',
      'menu-save-as-file',
      'menu-export-html',
      'menu-export-pdf',
      'menu-find-replace',
      'menu-toggle-toc',
      'menu-toggle-cheatsheet',
      'menu-toggle-split',
      'menu-set-theme',
      'menu-show-help'
    ];
    if (validChannels.includes(channel)) {
      const listener = (event, ...args) => callback(...args);
      ipcRenderer.on(channel, listener);
      // Return a cleanup function
      return () => {
        ipcRenderer.removeListener(channel, listener);
      };
    }
  }
});

