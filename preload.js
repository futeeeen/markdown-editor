const { contextBridge, ipcRenderer } = require('electron');
const { marked } = require('marked');
const hljs = require('highlight.js');

// Configure marked with highlight.js syntax highlighting
marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
  pedantic: false,
  gfm: true,
  breaks: true,
  sanitize: false,
  smartypants: false,
  xhtml: false
});

contextBridge.exposeInMainWorld('api', {
  // Markdown parsing engine
  parseMarkdown: (markdownText) => {
    try {
      const katex = require('katex');
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

