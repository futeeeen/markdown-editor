const { contextBridge, ipcRenderer } = require('electron');

let markedModule = null;
let hljsModule = null;
let katexModule = null;
let modulesLoaded = false;
let onModulesLoadedCallback = null;

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
  const originalCodeRenderer = renderer.code;
  renderer.code = function(code, lang, escaped) {
    if (lang === 'mermaid') {
      return `<div class="mermaid">${code}</div>`;
    }
    return originalCodeRenderer.call(this, code, lang, escaped);
  };

  markedModule.setOptions({
    renderer: renderer,
    highlight: function(code, lang) {
      if (lang === 'mermaid') {
        return code;
      }
      const language = hljsModule.getLanguage(lang) ? lang : 'plaintext';
      return hljsModule.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-',
    pedantic: false,
    gfm: true,
    breaks: true,
    sanitize: false,
    smartypants: false,
    xhtml: false
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
  parseMarkdown: (markdownText) => {
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

