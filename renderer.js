/* ==========================================================================
   MarkdownPro - Premium Core UI & Multi-Tab Logic Controller (Renderer)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements Reference ---
  const editor = document.getElementById('markdown-editor');
  const previewContainer = document.getElementById('preview-container');
  const lineNumbers = document.getElementById('line-numbers');
  
  // Create hidden editor-mirror for line wrapping calculation
  const mirror = document.createElement('div');
  mirror.className = 'editor-mirror';
  document.body.appendChild(mirror);
  const filenameLabel = document.getElementById('current-filename');
  const unsavedDot = document.getElementById('unsaved-dot');
  
  // Tabs Bar
  const tabBar = document.getElementById('tab-bar');
  const tabsContainer = document.getElementById('tabs-container');
  const newTabBtn = document.getElementById('new-tab-btn');
  
  // Sidebars
  const tocSidebar = document.getElementById('toc-sidebar');
  const cheatsheetSidebar = document.getElementById('cheatsheet-sidebar');
  const tocTree = document.getElementById('toc-tree');
  
  // Workspace Panes
  const workspacePanes = document.getElementById('workspace-panes');
  const editorPane = document.getElementById('editor-pane');
  const previewPane = document.getElementById('preview-pane');
  const resizer = document.getElementById('resizer');
  
  // Headers & Toolbar Buttons
  const toggleTocBtn = document.getElementById('toggle-toc-btn');
  const toggleSplitBtn = document.getElementById('toggle-split-btn');
  const toggleCheatsheetBtn = document.getElementById('toggle-cheatsheet-btn');
  const themeMenuBtn = document.getElementById('theme-menu-btn');
  const themeDropdown = document.getElementById('theme-dropdown');
  const saveBtn = document.getElementById('save-btn');
  const closeTocBtn = document.getElementById('close-toc-btn');
  const closeCheatsheetBtn = document.getElementById('close-cheatsheet-btn');
  
  // Pane Header buttons
  const searchBtn = document.getElementById('search-btn');
  const clearEditorBtn = document.getElementById('clear-editor-btn');
  const exportHtmlBtn = document.getElementById('export-html-btn');
  const exportPdfBtn = document.getElementById('export-pdf-btn');
  const exportPngBtn = document.getElementById('export-png-btn');
  const toggleFullscreenPreviewBtn = document.getElementById('toggle-fullscreen-preview-btn');

  // Status Bar
  const fileStatusLabel = document.getElementById('status-file-path');
  const activeThemeLabel = document.getElementById('status-theme-name');
  const wordsCounter = document.getElementById('stat-words');
  const readTimeCounter = document.getElementById('stat-read-time');
  const charsCounter = document.getElementById('stat-chars');
  const paragraphsCounter = document.getElementById('stat-paragraphs');
  const cursorLine = document.getElementById('cursor-line');
  const cursorCol = document.getElementById('cursor-col');

  // Modals
  const searchModal = document.getElementById('search-modal');
  const searchInput = document.getElementById('search-input');
  const replaceInput = document.getElementById('replace-input');
  const searchCaseSensitive = document.getElementById('search-case-sensitive');
  const closeSearchBtn = document.getElementById('close-search-btn');
  const findPrevBtn = document.getElementById('find-prev-btn');
  const findNextBtn = document.getElementById('find-next-btn');
  const replaceBtn = document.getElementById('replace-btn');
  const replaceAllBtn = document.getElementById('replace-all-btn');

  const saveConfirmModal = document.getElementById('save-confirm-modal');
  const modalFilename = document.getElementById('modal-filename');
  const modalSaveBtn = document.getElementById('modal-save-btn');
  const modalDiscardBtn = document.getElementById('modal-discard-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  const searchHistoryList = document.getElementById('search-history-list');

  // --- App State (Multi-Tab Structure) ---
  let tabs = [];
  let activeTabId = null;
  let replaceHistoryStack = [];
  let activeTheme = 'theme-aether-dark';
  let isResizing = false;
  
  // Scroll Synchronization controllers
  let activeScrollSource = null;
  let scrollTimeout = null;
  let isSyncPaused = false;
  let syncPauseTimeout = null;

  // --- Welcome Guide Template ---
  const welcomeMarkdown = `# 🚀 Welcome to MarkdownPro!

MarkdownPro is a native, premium desktop Markdown Editor and Live Previewer built for Windows. Here you can write, review, and export styled articles in real-time.

---

## 🎨 Premium Theme Options

Toggle through gorgeous theme palettes in the top-right header menu or using system defaults:
- **Aether Dark**: Slate background with deep glowing violet gradients (Default).
- **Nordic Light**: Serene, high-contrast crisp white paper with ice-blue details.
- **Cyberpunk Grid**: Terminal absolute dark with electric cyan, neon magenta, and radioactive green highlights.
- **Forest Moss**: Calming timber tones with copper amber headers.
- **Dracula Tribute**: Purple-tinged gothic dark code environment.

---

## 🛠️ State-of-the-Art Editor Features

- **Draggable Splits**: Place your cursor on the divider bar between panels and drag left/right to resize the editor.
- **Table of Contents (Outline)**: Click the **Outline List** icon in the header to expand a real-time list of headings. Click any outline element to scroll directly to it!
- **Accurate Scroll Sync**: Scroll the editor pane, and the live preview shifts directly with you, keeping your place perfectly aligned.
- **Inline Code Syntax Highlighting**: Fully optimized syntax blocks for popular scripts:

\`\`\`javascript
// Live JavaScript Highlight
function greetUser(name) {
  console.log(\`Hello, \${name}! Welcome to your new Markdown home.\`);
  return { status: "Ready", platform: "Windows Desktop" };
}
greetUser("Creative Writer");
\`\`\`

- **Task Checklists**: Keep track of projects effortlessly:
  - [x] Create a premium glassmorphic titlebar
  - [x] Package as a portable Windows utility
  - [x] Integrate Notepad++ Multi-Tab system!
  - [ ] Associate as the default editor for .md documents!
- **Image Drag & Drop**: Simply drag an image from your Windows Explorer window into the editor, and it will immediately write a Markdown link with its local file path!

---

## 📊 Technical Diagrams & Flowcharts (Mermaid.js)

MarkdownPro has built-in high-performance **Mermaid.js** rendering support. You can easily draw flowcharts, sequence diagrams, mindmaps, and Gantt charts:

\`\`\`mermaid
graph TD
    Start([Start Writing]) --> Markdown[Write Markdown & Math]
    Markdown --> LivePreview{Live Preview Engine}
    LivePreview -- Math rendering --> KaTeX[Offline KaTeX CSS]
    LivePreview -- Diagram compile --> Mermaid[Mermaid.js SVG]
    KaTeX --> Output[Premium PDF & HTML Export]
    Mermaid --> Output
    Output --> Success([Aesthetic Report Completed!])
    
    style Start fill:#a78bfa,stroke:#7c3aed,stroke-width:2px,color:#fff
    style Success fill:#34d399,stroke:#059669,stroke-width:2px,color:#fff
    style LivePreview fill:#f472b6,stroke:#db2777,stroke-width:2px,color:#fff
\`\`\`

---

## 🧮 Advanced LaTeX Mathematical Formula Rendering (KaTeX)

MarkdownPro is equipped with a blazingly fast, fully offline **KaTeX** math engine. You can write complex scientific and academic equations seamlessly:

- **Inline Equations**: Simply wrap your formula in a single dollar sign, such as Euler's elegant identity: $e^{i\\pi} + 1 = 0$, or the classic quadratic equation solutions: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.
- **Block Equations**: Wrap equations in double dollar signs to center and emphasize them on their own lines, for example, the **Fourier Transform**:

$$\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x)\\,e^{-2\\pi i x \\xi}\\,dx$$

Or the **Standard Normal Distribution** probability density function:

$$p(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}$$

---

## 📄 Formats & Exporting

When your writing is complete, you can:
1. Export as a standalone, styled **HTML webpage** matching the document structure.
2. Export as a gorgeous **PDF Report** with standard page margins and clean printed typography (File -> Export to PDF).

*Happy writing! Use the syntax cheat sheet on the right pane if you need any formatting reminders.*
`;

  // --- Multi-Tab Management Logic ---

  function createNewTab(filePath = null, fileName = 'untitled.md', content = '', active = true) {
    const tabId = 'tab-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    const newTabObj = {
      id: tabId,
      filePath: filePath,
      fileName: fileName,
      content: content,
      lastSavedContent: content,
      isDirty: false,
      scrollTopEditor: 0,
      scrollTopPreview: 0
    };
    
    tabs.push(newTabObj);
    renderTabs();
    
    if (active) {
      switchTab(tabId);
    }
    
    if (filePath) {
      window.api.watchFile(filePath);
    }
    
    return newTabObj;
  }

  function switchTab(tabId) {
    if (activeTabId === tabId) return;
    
    // 1. Cache current active tab's edits and scrolls
    if (activeTabId) {
      const activeTab = tabs.find(t => t.id === activeTabId);
      if (activeTab) {
        activeTab.content = editor.value;
        activeTab.scrollTopEditor = editor.scrollTop;
        activeTab.scrollTopPreview = previewContainer.scrollTop;
        activeTab.isDirty = (activeTab.content !== activeTab.lastSavedContent);
      }
    }
    
    // 2. Set new active tab ID
    activeTabId = tabId;
    const nextTab = tabs.find(t => t.id === tabId);
    if (!nextTab) return;
    
    // 3. Load tab content to editor & restore scrolls
    editor.value = nextTab.content;
    
    // Force preview parsing immediately
    updatePreviewDirect();
    
    // Restore Scroll Positions after a layout sync
    setTimeout(() => {
      isSyncPaused = true;
      editor.scrollTop = nextTab.scrollTopEditor;
      previewContainer.scrollTop = nextTab.scrollTopPreview;
      lineNumbers.parentElement.scrollTop = editor.scrollTop;
      
      setTimeout(() => {
        isSyncPaused = false;
      }, 50);
    }, 10);
    
    // 4. Update Header indicators
    updateHeaderAndStatus();
    
    // 5. Update Tab UI selection state
    renderTabs();
    updateCursorPos();

    // 6. Check if this newly active tab needs reload due to external modifications!
    if (nextTab.needsReload) {
      nextTab.needsReload = false; // Reset first
      setTimeout(() => {
        showReloadConfirmModal(nextTab);
      }, 100); // Tiny delay to let rendering sync completely
    }
  }

  function closeTab(tabId, e) {
    if (e) {
      e.stopPropagation(); // Prevent tab switching click trigger
    }
    
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;
    
    const targetTab = tabs[tabIndex];
    
    // If active tab, make sure we align content before checking
    if (tabId === activeTabId) {
      targetTab.content = editor.value;
      targetTab.isDirty = (targetTab.content !== targetTab.lastSavedContent);
    }
    
    if (targetTab.isDirty) {
      // Show confirmation dialog specifically for closing this tab
      switchTab(tabId);
      showSavePromptModal(() => {
        // Discard or Save clicked: close tab directly
        closeTabDirect(tabId);
      });
    } else {
      closeTabDirect(tabId);
    }
  }

  function closeTabDirect(tabId) {
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;
    
    const targetTab = tabs[tabIndex];
    if (targetTab.filePath) {
      window.api.unwatchFile(targetTab.filePath);
    }

    tabs.splice(tabIndex, 1);
    
    // If all tabs are closed, create a default blank one
    if (tabs.length === 0) {
      createNewTab(null, 'untitled.md', welcomeMarkdown, true);
      return;
    }
    
    // If the closed tab was the active one, switch to another tab
    if (tabId === activeTabId) {
      const newActiveIndex = Math.max(0, tabIndex - 1);
      const nextTab = tabs[newActiveIndex];
      activeTabId = null; // Reset to allow switch
      switchTab(nextTab.id);
    } else {
      renderTabs();
    }
  }

  function renderTabs() {
    tabsContainer.innerHTML = '';
    
    tabs.forEach(tab => {
      const tabElement = document.createElement('div');
      tabElement.className = `tab ${tab.id === activeTabId ? 'active' : ''}`;
      tabElement.setAttribute('data-id', tab.id);
      
      // Determine tab dirty state
      const isTabDirty = tab.id === activeTabId 
        ? (editor.value !== tab.lastSavedContent)
        : tab.isDirty;
      
      const tabName = tab.filePath 
        ? tab.filePath.substring(tab.filePath.lastIndexOf('\\') + 1)
        : tab.fileName;
        
      tabElement.innerHTML = `
        <span class="tab-title" title="${tab.filePath || tabName}">${tabName}</span>
        <span class="tab-unsaved ${isTabDirty ? '' : 'hidden'}"></span>
        <button class="tab-close" title="Close Tab"><i data-lucide="x"></i></button>
      `;
      
      // Listeners
      tabElement.addEventListener('click', () => {
        switchTab(tab.id);
      });
      
      tabElement.querySelector('.tab-close').addEventListener('click', (e) => {
        closeTab(tab.id, e);
      });
      
      tabElement.addEventListener('contextmenu', (e) => {
        showCustomContextMenu(e, 'tab', tab.id);
      });
      
      tabsContainer.appendChild(tabElement);
    });
    
    // Sync unsaved indicator dot in app titlebar header
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (currentTab) {
      const isCurrentDirty = (editor.value !== currentTab.lastSavedContent);
      if (isCurrentDirty) {
        unsavedDot.classList.remove('hidden');
      } else {
        unsavedDot.classList.add('hidden');
      }
    }
    
    if (window.lucide) window.lucide.createIcons();
  }

  function updateHeaderAndStatus() {
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (!currentTab) return;
    
    if (currentTab.filePath) {
      const basename = currentTab.filePath.substring(currentTab.filePath.lastIndexOf('\\') + 1);
      filenameLabel.innerText = basename;
      fileStatusLabel.innerHTML = `<i data-lucide="folder"></i> <span>${currentTab.filePath}</span>`;
    } else {
      filenameLabel.innerText = currentTab.fileName;
      fileStatusLabel.innerHTML = `<i data-lucide="folder"></i> <span>No file loaded (Editing Draft)</span>`;
    }
    
    if (window.lucide) window.lucide.createIcons();
  }

  // Bind New Tab click
  newTabBtn.addEventListener('click', () => {
    createNewTab(null, 'untitled.md', welcomeMarkdown, true);
  });

  // --- Core Markdown Parsing & Stats Rendering ---
  function updatePreview() {
    // Sync active tab state
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (currentTab) {
      currentTab.content = editor.value;
      currentTab.isDirty = (editor.value !== currentTab.lastSavedContent);
    }
    
    updatePreviewDirect();
  }

  function updatePreviewDirect() {
    const rawText = editor.value;
    const activeTab = tabs.find(t => t.id === activeTabId);
    const filePath = activeTab ? activeTab.filePath : null;
    
    // 1. Core GFM Compile Injection
    const renderedHtml = window.api.parseMarkdown(rawText, filePath);
    previewContainer.innerHTML = renderedHtml;
    
    // 2. Compute statistics Counters
    updateStats(rawText);
    
    // 3. Document Line Numbers Gutter
    updateLineNumbers();
    
    // 4. Live Table of Contents Builder
    buildTableOfContents();
    
    // 5. Update Tab UI Indicators (dirty status changes)
    renderTabs();

    // 6. Initialize and render Mermaid diagrams
    if (window.mermaid) {
      try {
        window.mermaid.run({ querySelector: '.mermaid' });
      } catch (err) {
        console.error('Mermaid render failed:', err);
      }
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function updateStats(text) {
    const cleanText = text.trim();
    
    // Words
    const words = cleanText === '' ? 0 : cleanText.split(/\s+/).filter(w => w.length > 0).length;
    wordsCounter.innerText = words;
    
    // Characters
    const chars = text.length;
    charsCounter.innerText = chars;
    
    // Paragraphs
    const paragraphs = cleanText === '' ? 0 : cleanText.split(/\n\s*\n+/).filter(p => p.trim().length > 0).length;
    paragraphsCounter.innerText = paragraphs;
    
    // Est. Read Time
    const readTime = Math.max(1, Math.ceil(words / 200));
    readTimeCounter.innerText = readTime;
  }

  function updateLineNumbers() {
    const text = editor.value;
    const lines = text.split('\n');
    
    // Sync style properties from editor to mirror to ensure identical font rendering
    const computed = window.getComputedStyle(editor);
    mirror.style.fontFamily = computed.fontFamily;
    mirror.style.fontSize = computed.fontSize;
    mirror.style.lineHeight = computed.lineHeight;
    mirror.style.fontWeight = computed.fontWeight;
    mirror.style.letterSpacing = computed.letterSpacing;
    mirror.style.paddingLeft = computed.paddingLeft;
    mirror.style.paddingRight = computed.paddingRight;
    mirror.style.boxSizing = computed.boxSizing;
    mirror.style.width = editor.clientWidth + 'px';
    
    // Populate the mirror div with corresponding lines
    mirror.innerHTML = '';
    lines.forEach((line) => {
      const div = document.createElement('div');
      div.className = 'editor-mirror-line';
      div.textContent = line || ' '; // Keep empty lines visually open
      mirror.appendChild(div);
    });
    
    // Measure individual line heights and render line numbers accordingly
    const mirrorLines = mirror.children;
    let gutterHtml = '';
    for (let i = 0; i < lines.length; i++) {
      const height = mirrorLines[i].offsetHeight;
      gutterHtml += `<div class="gutter-line-number" style="height: ${height}px; line-height: ${computed.lineHeight || '1.6'};">${i + 1}</div>`;
    }
    lineNumbers.innerHTML = gutterHtml;
  }

  // --- Scroll Syncing Algorithm ---
  function clearScrollTimeout() {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
  }

  // --- Optimized Scroll Syncing with Cache & RAF ---
  let scrollLimitsDirty = true;
  let maxEditorScroll = 0;
  let maxPreviewScroll = 0;

  function updateScrollLimits() {
    maxEditorScroll = editor.scrollHeight - editor.clientHeight;
    maxPreviewScroll = previewContainer.scrollHeight - previewContainer.clientHeight;
    scrollLimitsDirty = false;
  }

  // ResizeObserver to track dimension changes, invalidate scroll limits, and sync line wrapping alignment
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver((entries) => {
      scrollLimitsDirty = true;
      for (const entry of entries) {
        if (entry.target === editor) {
          updateLineNumbers();
        }
      }
    });
    resizeObserver.observe(editor);
    resizeObserver.observe(previewContainer);
  }

  let editorScrollRaf = null;
  let previewScrollRaf = null;

  editor.addEventListener('scroll', () => {
    if (editorScrollRaf) {
      cancelAnimationFrame(editorScrollRaf);
    }

    editorScrollRaf = requestAnimationFrame(() => {
      // Sync line numbers gutter
      lineNumbers.parentElement.scrollTop = editor.scrollTop;

      if (isSyncPaused) return;
      if (activeScrollSource && activeScrollSource !== 'editor') return;

      activeScrollSource = 'editor';
      clearScrollTimeout();

      if (scrollLimitsDirty) {
        updateScrollLimits();
      }

      if (maxEditorScroll > 0) {
        const percentage = editor.scrollTop / maxEditorScroll;
        previewContainer.scrollTop = percentage * maxPreviewScroll;
      }

      scrollTimeout = setTimeout(() => {
        activeScrollSource = null;
      }, 100);
    });
  }, { passive: true });

  previewContainer.addEventListener('scroll', () => {
    if (previewScrollRaf) {
      cancelAnimationFrame(previewScrollRaf);
    }

    previewScrollRaf = requestAnimationFrame(() => {
      if (isSyncPaused) return;
      if (activeScrollSource && activeScrollSource !== 'preview') return;

      activeScrollSource = 'preview';
      clearScrollTimeout();

      if (scrollLimitsDirty) {
        updateScrollLimits();
      }

      if (maxPreviewScroll > 0) {
        const percentage = previewContainer.scrollTop / maxPreviewScroll;
        editor.scrollTop = percentage * maxEditorScroll;
      }

      scrollTimeout = setTimeout(() => {
        activeScrollSource = null;
      }, 100);
    });
  }, { passive: true });


  // --- Live Table of Contents Builder (Click Outline to Jump) ---
  function buildTableOfContents() {
    tocTree.innerHTML = '';
    const headings = previewContainer.querySelectorAll('h1, h2, h3, h4');
    
    if (headings.length === 0) {
      tocTree.innerHTML = '<div class="toc-placeholder">No headings found in your document. Use #, ##, ### to create headings.</div>';
      return;
    }
    
    headings.forEach((heading, index) => {
      const headingId = `heading-${index}`;
      heading.id = headingId;
      
      const item = document.createElement('div');
      item.className = `toc-item toc-${heading.tagName.toLowerCase()}`;
      item.innerText = heading.innerText.replace(/^[#\s]+/, '').trim();
      
      item.addEventListener('click', () => {
        // 1. Temporarily pause scroll syncing to prevent fight snap-back
        isSyncPaused = true;
        clearTimeout(syncPauseTimeout);
        
        // 2. Scroll Preview directly using absolute container offset
        const containerRect = previewContainer.getBoundingClientRect();
        const headingRect = heading.getBoundingClientRect();
        const absoluteOffset = headingRect.top - containerRect.top + previewContainer.scrollTop;
        
        previewContainer.scrollTo({ top: absoluteOffset, behavior: 'smooth' });
        
        // 3. Scroll Editor directly to matching heading line
        const headingText = heading.innerText.trim();
        const lines = editor.value.split('\n');
        let targetLine = -1;
        for (let i = 0; i < lines.length; i++) {
          const cleanLine = lines[i].replace(/^[#\s]+/, '').trim();
          if (cleanLine === headingText) {
            targetLine = i;
            break;
          }
        }
        
        if (targetLine !== -1) {
          const lineHeight = parseFloat(getComputedStyle(editor).lineHeight || 20);
          editor.scrollTop = targetLine * lineHeight;
          lineNumbers.parentElement.scrollTop = editor.scrollTop;
        }
        
        // 4. Resume scroll syncing after smooth scroll animation completes
        syncPauseTimeout = setTimeout(() => {
          isSyncPaused = false;
        }, 850);
      });
      
      tocTree.appendChild(item);
    });
  }

  // --- Cursor Tracking ---
  function updateCursorPos() {
    const text = editor.value;
    const selectionStart = editor.selectionStart;
    
    const lines = text.substring(0, selectionStart).split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    
    cursorLine.innerText = line;
    cursorCol.innerText = col;
  }

  editor.addEventListener('keyup', updateCursorPos);
  editor.addEventListener('click', updateCursorPos);
  editor.addEventListener('focus', updateCursorPos);

  // --- Editor Enhancements (Autopairing & Tab Handling) ---
  const bracketPairs = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'",
    '`': '`'
  };

  editor.addEventListener('keydown', (e) => {
    // 1. Tab Key support
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      
      editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
      editor.selectionStart = editor.selectionEnd = start + 4;
      
      updatePreview();
      updateCursorPos();
    }
    
    // 2. Bracket Auto-pairing
    if (bracketPairs[e.key] !== undefined) {
      e.preventDefault();
      const openChar = e.key;
      const closeChar = bracketPairs[openChar];
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      
      const selectedText = editor.value.substring(start, end);
      editor.value = editor.value.substring(0, start) + openChar + selectedText + closeChar + editor.value.substring(end);
      
      editor.selectionStart = start + 1;
      editor.selectionEnd = end + 1;
      
      updatePreview();
      updateCursorPos();
    }
    
    // 3. Formatting Shortcuts (Ctrl/Cmd + Key)
    const isCtrl = e.ctrlKey || e.metaKey;
    if (isCtrl && !e.altKey) {
      let formatType = null;
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          formatType = 'bold';
          break;
        case 'i':
          e.preventDefault();
          formatType = e.shiftKey ? 'image' : 'italic';
          break;
        case 'u':
          e.preventDefault();
          formatType = 'strike'; // Map Underline to Strikethrough in Markdown
          break;
        case 'x':
          if (e.shiftKey) {
            e.preventDefault();
            formatType = 'strike';
          }
          break;
        case 'q':
          e.preventDefault();
          formatType = 'quote';
          break;
        case 'k':
          e.preventDefault();
          formatType = e.shiftKey ? 'codeblock' : 'link';
          break;
        case 'c':
          if (e.shiftKey) {
            e.preventDefault();
            formatType = 'codeblock';
          }
          break;
        case '`':
          e.preventDefault();
          formatType = 'code';
          break;
      }
      
      if (formatType) {
        applyMarkdownFormat(formatType);
        updatePreview();
        updateCursorPos();
      }
    }
  });

  // --- Image Drag-and-Drop Local Rendering ---
  editor.addEventListener('dragover', (e) => {
    e.preventDefault();
    editor.style.borderColor = 'var(--border-glass-active)';
  });

  editor.addEventListener('dragleave', (e) => {
    e.preventDefault();
    editor.style.borderColor = 'transparent';
  });

  editor.addEventListener('drop', (e) => {
    e.preventDefault();
    editor.style.borderColor = 'transparent';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const absolutePath = file.path.replace(/\\/g, '/');
        const markdownImageTag = `![${file.name}](file:///${absolutePath})`;
        
        editor.value = editor.value.substring(0, start) + markdownImageTag + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + markdownImageTag.length;
        
        updatePreview();
        updateCursorPos();
      }
    }
  });

  // --- Clipboard Image Paste Integration ---
  editor.addEventListener('paste', async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    let hasImage = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        hasImage = true;
        break;
      }
    }
    
    if (hasImage) {
      e.preventDefault();
      
      const currentTab = tabs.find(t => t.id === activeTabId);
      const filePath = currentTab ? currentTab.filePath : null;
      
      const result = await window.api.saveClipboardImage(filePath);
      if (result && result.success) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        
        const imagePath = result.isTemp 
          ? `file:///${result.absolutePath.replace(/\\/g, '/')}`
          : result.relativePath;
          
        const markdownImageTag = `![image](${imagePath})`;
        
        editor.value = editor.value.substring(0, start) + markdownImageTag + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + markdownImageTag.length;
        
        if (currentTab) {
          currentTab.content = editor.value;
          currentTab.isDirty = true;
        }
        
        updatePreview();
        updateCursorPos();
      }
    }
  });

  // --- Draggable Split Pane Resize ---
  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isResizing = true;
    resizer.classList.add('dragging');
    editorPane.style.transition = 'none';
    previewPane.style.transition = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    const workspaceRect = workspacePanes.getBoundingClientRect();
    const relativeX = e.clientX - workspaceRect.left;
    
    const minWidth = 200;
    if (relativeX > minWidth && relativeX < (workspaceRect.width - minWidth)) {
      const percent = (relativeX / workspaceRect.width) * 100;
      editorPane.style.flex = `0 0 ${percent}%`;
      previewPane.style.flex = `0 0 ${100 - percent}%`;
    }
  });

  window.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      resizer.classList.remove('dragging');
      editorPane.style.transition = '';
      previewPane.style.transition = '';
    }
  });

  // --- UI Sidebar & Pane View Toggles ---
  
  toggleTocBtn.addEventListener('click', () => {
    tocSidebar.classList.toggle('collapsed');
    toggleTocBtn.classList.toggle('active');
  });
  closeTocBtn.addEventListener('click', () => {
    tocSidebar.classList.add('collapsed');
    toggleTocBtn.classList.remove('active');
  });

  toggleCheatsheetBtn.addEventListener('click', () => {
    cheatsheetSidebar.classList.toggle('collapsed');
    toggleCheatsheetBtn.classList.toggle('active');
  });
  closeCheatsheetBtn.addEventListener('click', () => {
    cheatsheetSidebar.classList.add('collapsed');
    toggleCheatsheetBtn.classList.remove('active');
  });

  toggleSplitBtn.addEventListener('click', () => {
    if (previewPane.classList.contains('hidden')) {
      previewPane.classList.remove('hidden');
      resizer.style.display = 'flex';
      editorPane.style.flex = '1 1 50%';
      previewPane.style.flex = '1 1 50%';
      toggleSplitBtn.classList.add('active');
    } else {
      previewPane.classList.add('hidden');
      resizer.style.display = 'none';
      editorPane.style.flex = '1 1 100%';
      toggleSplitBtn.classList.remove('active');
    }
  });

  toggleFullscreenPreviewBtn.addEventListener('click', () => {
    if (editorPane.classList.contains('hidden')) {
      editorPane.classList.remove('hidden');
      resizer.style.display = 'flex';
      editorPane.style.flex = '1 1 50%';
      previewPane.style.flex = '1 1 50%';
      toggleFullscreenPreviewBtn.innerHTML = '<i data-lucide="maximize-2"></i>';
    } else {
      editorPane.classList.add('hidden');
      resizer.style.display = 'none';
      previewPane.style.flex = '1 1 100%';
      toggleFullscreenPreviewBtn.innerHTML = '<i data-lucide="minimize-2"></i>';
    }
    if (window.lucide) window.lucide.createIcons();
  });

  // --- Dynamic Theme Switching Manager ---
  
  themeMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeDropdown.classList.toggle('show');
    themeMenuBtn.classList.toggle('active');
  });

  window.addEventListener('click', () => {
    themeDropdown.classList.remove('show');
    themeMenuBtn.classList.remove('active');
  });

  document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
      const selected = option.getAttribute('data-theme');
      setThemeClass(selected);
    });
  });

  // --- Mermaid.js Integration & Theme Configuration ---
  function initMermaid(themeClass) {
    if (!window.mermaid) return;

    let mermaidTheme = 'dark';
    if (themeClass === 'theme-nordic-light') {
      mermaidTheme = 'default';
    } else if (themeClass === 'theme-forest') {
      mermaidTheme = 'forest';
    }

    window.mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme,
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true
      }
    });
  }

  function setThemeClass(themeClass) {
    document.body.className = document.body.className.replace(/\btheme-\S+/g, '');
    document.body.classList.add(themeClass);
    activeTheme = themeClass;
    
    document.querySelectorAll('.theme-option').forEach(opt => {
      if (opt.getAttribute('data-theme') === themeClass) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });

    const friendlyNameMap = {
      'theme-aether-dark': 'Aether Dark',
      'theme-nordic-light': 'Nordic Light',
      'theme-cyberpunk': 'Cyberpunk Grid',
      'theme-forest': 'Forest Moss',
      'theme-dracula': 'Dracula Tribute'
    };
    activeThemeLabel.innerHTML = `<i data-lucide="palette"></i> ${friendlyNameMap[themeClass] || themeClass}`;
    if (window.lucide) window.lucide.createIcons();

    localStorage.setItem('markdownpro-theme', themeClass);

    // Initialize/re-initialize Mermaid with the selected theme!
    initMermaid(themeClass);

    // If tabs are already loaded, trigger a live preview refresh to update the diagrams visually
    if (tabs.length > 0) {
      updatePreviewDirect();
    }
  }

  const cachedTheme = localStorage.getItem('markdownpro-theme') || 'theme-aether-dark';
  setThemeClass(cachedTheme);

  // --- Safe Dialogue and Print Functions (Try-Catch Alerts) ---

  // 1. Safe Open Dialog
  async function handleOpenFile() {
    try {
      const fileData = await window.api.showOpenDialog();
      if (fileData) {
        // Check if file is already open in one of our tabs
        const existingTab = tabs.find(t => t.filePath === fileData.filePath);
        if (existingTab) {
          switchTab(existingTab.id);
        } else {
          const basename = fileData.filePath.substring(fileData.filePath.lastIndexOf('\\') + 1);
          createNewTab(fileData.filePath, basename, fileData.content, true);
        }
      }
    } catch (error) {
      alert("Error opening file:\n" + error.message + "\n\nStack:\n" + error.stack);
    }
  }

  // Helper to copy temp pasted screenshots to permanent file images folder
  async function resolveTempImages(destFilePath, markdownContent) {
    const tempImageRegex = /file:\/\/\/([A-Za-z]:\/[^\)]*?\/temp_images\/(image_\d+_\d+\.png))/g;
    const mappings = [];
    let match;
    
    while ((match = tempImageRegex.exec(markdownContent)) !== null) {
      const sourceAbsolutePath = match[1].replace(/\//g, '\\');
      const imageName = match[2];
      const mdBaseName = destFilePath.substring(destFilePath.lastIndexOf('\\') + 1, destFilePath.lastIndexOf('.'));
      const imageFolderName = `${mdBaseName}_images`;
      const targetRelativePath = `${imageFolderName}/${imageName}`;
      
      mappings.push({
        sourceAbsolutePath,
        targetRelativePath
      });
    }
    
    if (mappings.length > 0) {
      const moveResult = await window.api.moveTempImages(mappings, destFilePath);
      if (moveResult && moveResult.success) {
        let updatedContent = markdownContent;
        for (const mapping of mappings) {
          const searchPath = `file:///${mapping.sourceAbsolutePath.replace(/\\/g, '/')}`;
          updatedContent = updatedContent.replaceAll(searchPath, mapping.targetRelativePath);
        }
        return updatedContent;
      }
    }
    
    return markdownContent;
  }

  // 2. Safe Save File
  async function handleSaveFile() {
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (!currentTab) return;
    
    currentTab.content = editor.value;
    
    if (!currentTab.filePath) {
      return handleSaveAsFile();
    }
    
    try {
      const resolvedContent = await resolveTempImages(currentTab.filePath, currentTab.content);
      if (resolvedContent !== currentTab.content) {
        currentTab.content = resolvedContent;
        editor.value = resolvedContent;
      }

      const success = await window.api.writeFile(currentTab.filePath, currentTab.content);
      if (success) {
        currentTab.lastSavedContent = currentTab.content;
        currentTab.isDirty = false;
        renderTabs();
        updateHeaderAndStatus();
      }
    } catch (error) {
      alert("Error saving file:\n" + error.message);
    }
  }

  // 3. Safe Save As File Dialog
  async function handleSaveAsFile() {
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (!currentTab) return;
    
    currentTab.content = editor.value;
    
    try {
      const defaultName = currentTab.filePath || currentTab.fileName;
      const filePath = await window.api.showSaveDialog(defaultName);
      
      if (filePath) {
        if (currentTab.filePath) {
          window.api.unwatchFile(currentTab.filePath);
        }

        const resolvedContent = await resolveTempImages(filePath, currentTab.content);
        currentTab.content = resolvedContent;
        editor.value = resolvedContent;

        const success = await window.api.writeFile(filePath, currentTab.content);
        if (success) {
          const basename = filePath.substring(filePath.lastIndexOf('\\') + 1);
          currentTab.filePath = filePath;
          currentTab.fileName = basename;
          currentTab.lastSavedContent = currentTab.content;
          currentTab.isDirty = false;
          
          window.api.watchFile(filePath);

          renderTabs();
          updateHeaderAndStatus();
        }
      }
    } catch (error) {
      alert("Error saving file as:\n" + error.message + "\n\nStack:\n" + error.stack);
    }
  }

  // Helper to extract computed CSS custom variables of the active theme
  function getActiveThemeStyles() {
    const computed = getComputedStyle(document.body);
    const variables = [
      '--bg-app',
      '--bg-pane',
      '--bg-header',
      '--border-glass',
      '--border-glass-active',
      '--text-main',
      '--text-muted',
      '--accent-color',
      '--bg-selection',
      '--bg-gutter',
      '--text-gutter',
      '--bg-input',
      '--bg-button-hover',
      '--bg-sidebar',
      '--scrollbar-track',
      '--scrollbar-thumb',
      '--scrollbar-thumb-hover',
      '--md-code-bg',
      '--md-code-border',
      '--md-blockquote-border',
      '--md-blockquote-bg',
      '--md-table-border',
      '--md-table-header',
      '--md-hr',
      '--md-link',
      '--syn-keyword',
      '--syn-string',
      '--syn-comment',
      '--syn-number',
      '--syn-function',
      '--syn-title'
    ];
    let cssRules = '';
    variables.forEach(v => {
      const val = computed.getPropertyValue(v).trim();
      if (val) {
        cssRules += `${v}: ${val};\n`;
      }
    });
    return cssRules;
  }

  // 4. Safe Export to HTML
  async function handleExportHtml() {
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (!currentTab) return;
    
    try {
      const suggestedPath = currentTab.filePath 
        ? currentTab.filePath.substring(0, currentTab.filePath.lastIndexOf('.')) + '.html'
        : 'document.html';
        
      const filePath = await window.api.showSaveDialog(suggestedPath);
      if (filePath) {
        const themeStyles = getActiveThemeStyles();
        
        // Use the pre-rendered HTML from the preview pane (which contains fully rendered Mermaid SVGs)
        let htmlContent = previewContainer.innerHTML;
        
        // Convert absolute local file:// paths back to relative paths for portability
        if (currentTab.filePath) {
          const lastSlashIndex = Math.max(currentTab.filePath.lastIndexOf('/'), currentTab.filePath.lastIndexOf('\\'));
          if (lastSlashIndex !== -1) {
            const baseDir = currentTab.filePath.substring(0, lastSlashIndex + 1);
            const baseUri = 'file:///' + baseDir.replace(/\\/g, '/');
            const escapedBaseUri = baseUri.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(escapedBaseUri, 'g');
            htmlContent = htmlContent.replace(regex, '');
          }
        }
        
        const styledPage = `
          <!DOCTYPE html>
          <html lang="en" class="${activeTheme}">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${currentTab.fileName}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600&family=Fira+Code&display=swap" rel="stylesheet">
            
            <!-- KaTeX CSS for Math formulas -->
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
            
            <style>
              :root {
                ${themeStyles}
              }
              html {
                background-color: var(--bg-app);
              }
              body {
                background-color: transparent !important;
                font-family: 'Inter', sans-serif;
                color: var(--text-main);
                max-width: 800px;
                margin: 40px auto;
                padding: 0 24px;
                line-height: 1.65;
              }
              h1, h2, h3, h4, h5, h6 {
                font-family: 'Outfit', sans-serif;
                color: var(--text-main);
                margin-top: 1.6em;
                margin-bottom: 0.6em;
                line-height: 1.25;
              }
              h1 { font-size: 2.2rem; border-bottom: 1px solid var(--md-hr); padding-bottom: 8px; margin-top: 40px; }
              h2 { font-size: 1.6rem; border-bottom: 1px solid var(--md-hr); padding-bottom: 6px; margin-top: 32px; }
              h3 { font-size: 1.3rem; margin-top: 24px; }
              code {
                font-family: 'Fira Code', monospace;
                background-color: var(--md-code-bg);
                border: 1px solid var(--md-code-border);
                padding: 3px 6px;
                border-radius: 4px;
                color: var(--accent-color);
                font-size: 0.9em;
              }
              pre {
                background-color: var(--md-code-bg);
                border: 1px solid var(--md-code-border);
                padding: 16px;
                border-radius: 8px;
                overflow-x: auto;
              }
              pre code {
                background: transparent;
                color: inherit;
                padding: 0;
                font-size: 1em;
                border: none;
              }
              blockquote {
                border-left: 4px solid var(--md-blockquote-border);
                background: var(--md-blockquote-bg);
                padding: 8px 16px;
                margin: 0 0 16px;
                border-radius: 0 8px 8px 0;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              th, td {
                border: 1px solid var(--md-table-border);
                padding: 10px;
                text-align: left;
              }
              th { background: var(--md-table-header); }
              a { color: var(--md-link); text-decoration: none; }
              a:hover { border-bottom: 1px dotted var(--md-link); }
              img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 12px 0; }
              
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
            </style>
          </head>
          <body class="${activeTheme}">
            ${htmlContent}
          </body>
          </html>
        `;
        
        await window.api.writeFile(filePath, styledPage);
      }
    } catch (error) {
      alert("Error exporting HTML:\n" + error.message + "\n\nStack:\n" + error.stack);
    }
  }

  // 5. Safe Export to PDF
  async function handleExportPdf() {
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (!currentTab) return;
    
    try {
      const suggestedPath = currentTab.filePath 
        ? currentTab.filePath.substring(0, currentTab.filePath.lastIndexOf('.')) + '.pdf'
        : 'document.pdf';
        
      const htmlContent = previewContainer.innerHTML;
      const themeStyles = getActiveThemeStyles();
      await window.api.exportPdf(htmlContent, suggestedPath, activeTheme, themeStyles);
    } catch (error) {
      alert("Error exporting PDF:\n" + error.message + "\n\nStack:\n" + error.stack);
    }
  }

  // 6. Safe Export to PNG Image
  async function handleExportPng() {
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (!currentTab) return;
    
    try {
      const suggestedPath = currentTab.filePath 
        ? currentTab.filePath.substring(0, currentTab.filePath.lastIndexOf('.')) + '.png'
        : 'document.png';
        
      const htmlContent = previewContainer.innerHTML;
      const themeStyles = getActiveThemeStyles();
      await window.api.exportPng(htmlContent, suggestedPath, activeTheme, themeStyles);
    } catch (error) {
      alert("Error exporting PNG:\n" + error.message + "\n\nStack:\n" + error.stack);
    }
  }

  // --- Modals and Close Queue Controllers ---
  
  let modalProceedCallback = null;
  let modalCancelCallback = null;

  function showSavePromptModal(onProceedCallback, onCancelCallback = null) {
    modalProceedCallback = onProceedCallback;
    modalCancelCallback = onCancelCallback;
    
    const currentTab = tabs.find(t => t.id === activeTabId);
    modalFilename.innerText = currentTab ? currentTab.fileName : 'untitled.md';
    saveConfirmModal.classList.remove('hidden');
  }

  modalCancelBtn.addEventListener('click', () => {
    saveConfirmModal.classList.add('hidden');
    if (modalCancelCallback) {
      modalCancelCallback();
    }
    modalProceedCallback = null;
    modalCancelCallback = null;
  });

  modalDiscardBtn.addEventListener('click', () => {
    saveConfirmModal.classList.add('hidden');
    if (modalProceedCallback) {
      const callback = modalProceedCallback;
      modalProceedCallback = null;
      modalCancelCallback = null;
      callback();
    }
  });

  modalSaveBtn.addEventListener('click', async () => {
    saveConfirmModal.classList.add('hidden');
    await handleSaveFile();
    if (modalProceedCallback) {
      const callback = modalProceedCallback;
      modalProceedCallback = null;
      modalCancelCallback = null;
      callback();
    }
  });

  // --- Multi-Tab Safe Exit Sequencing ---
  let closingTabsQueue = [];
  
  function startCloseSequence() {
    // 1. Gather all tabs that have unsaved changes
    closingTabsQueue = tabs.filter(t => {
      if (t.id === activeTabId) {
        t.content = editor.value; // Sync active editor text
      }
      return t.content !== t.lastSavedContent;
    });
    
    processNextClosingQueueItem();
  }
  
  function processNextClosingQueueItem() {
    // If no more dirty tabs in queue: force close Electron app
    if (closingTabsQueue.length === 0) {
      window.api.forceClose();
      return;
    }
    
    // Switch to the first unsaved tab in the queue
    const nextUnsavedTab = closingTabsQueue[0];
    switchTab(nextUnsavedTab.id);
    
    // Show the save confirmation modal
    showSavePromptModal(() => {
      // Discard or Save succeeded: remove tab from queue
      closingTabsQueue.shift();
      // Remove this tab from memory
      const index = tabs.findIndex(t => t.id === nextUnsavedTab.id);
      if (index !== -1) {
        const removed = tabs[index];
        if (removed.filePath) {
          window.api.unwatchFile(removed.filePath);
        }
        tabs.splice(index, 1);
      }
      
      // Recurse to next queue item
      processNextClosingQueueItem();
    }, () => {
      // User clicked Cancel in modal: abort closing queue!
      closingTabsQueue = [];
    });
  }

  // Subscribe Electron close request to our Multi-Tab closing sequence
  window.api.onCloseRequest(startCloseSequence);

  // Single-Instance File Receiver (Open double-clicked file in new tab)
  window.api.onOpenFilePath((filePath) => {
    window.api.readFile(filePath).then(content => {
      const basename = filePath.substring(filePath.lastIndexOf('\\') + 1);
      
      // Check if file is already open
      const existingTab = tabs.find(t => t.filePath === filePath);
      if (existingTab) {
        switchTab(existingTab.id);
      } else {
        createNewTab(filePath, basename, content, true);
      }
    }).catch(error => {
      alert("Error opening clicked file:\n" + error.message);
    });
  });

  // --- External File Modification Modal & Event Listener ---
  function showReloadConfirmModal(tab) {
    if (tab.isReloadPromptActive) return;
    tab.isReloadPromptActive = true;

    const reloadConfirmModal = document.getElementById('reload-confirm-modal');
    const reloadModalFilename = document.getElementById('reload-modal-filename');
    const reloadConfirmBtn = document.getElementById('reload-modal-confirm-btn');
    const reloadCancelBtn = document.getElementById('reload-modal-cancel-btn');

    reloadModalFilename.innerText = tab.fileName;
    reloadConfirmModal.classList.remove('hidden');

    const cleanUp = () => {
      reloadConfirmModal.classList.add('hidden');
      tab.isReloadPromptActive = false;
      reloadConfirmBtn.onclick = null;
      reloadCancelBtn.onclick = null;
    };

    reloadConfirmBtn.onclick = async () => {
      try {
        const newContent = await window.api.readFile(tab.filePath);
        tab.content = newContent;
        tab.lastSavedContent = newContent;
        tab.isDirty = false;
        
        if (activeTabId === tab.id) {
          editor.value = newContent;
          updatePreviewDirect();
          updateHeaderAndStatus();
        } else {
          renderTabs();
        }
      } catch (error) {
        alert("Error reloading file:\n" + error.message);
      } finally {
        cleanUp();
      }
    };

    reloadCancelBtn.onclick = () => {
      // Keep Local Copy: set tab dirty to alert on close/quit
      tab.isDirty = true;
      renderTabs();
      cleanUp();
    };
  }

  // Subscribe external file modifications from IPC
  window.api.onFileModifiedExternally((filePath) => {
    const matchedTab = tabs.find(t => t.filePath === filePath);
    if (matchedTab) {
      if (activeTabId === matchedTab.id) {
        showReloadConfirmModal(matchedTab);
      } else {
        matchedTab.needsReload = true;
      }
    }
  });

  // --- Search & Replace Floating & Draggable Utility ---
  const searchBox = searchModal.querySelector('.modal-box');
  const searchHeader = searchModal.querySelector('.modal-header');
  
  let isDraggingSearch = false;
  let searchOffsetX = 0;
  let searchOffsetY = 0;
  
  searchHeader.style.cursor = 'move';
  
  searchHeader.addEventListener('mousedown', (e) => {
    // Avoid dragging when clicking input elements, checkboxes, or the close button
    if (e.target.closest('#close-search-btn') || e.target.tagName === 'INPUT' || e.target.type === 'checkbox') return;
    
    isDraggingSearch = true;
    const rect = searchBox.getBoundingClientRect();
    searchOffsetX = e.clientX - rect.left;
    searchOffsetY = e.clientY - rect.top;
    
    e.preventDefault();
  });
  
  window.addEventListener('mousemove', (e) => {
    if (!isDraggingSearch) return;
    
    searchBox.style.transform = 'none'; // Disable initial centering alignment
    searchBox.style.left = (e.clientX - searchOffsetX) + 'px';
    searchBox.style.top = (e.clientY - searchOffsetY) + 'px';
  });
  
  window.addEventListener('mouseup', () => {
    isDraggingSearch = false;
  });

  function showSearchModal() {
    searchModal.classList.remove('hidden');
    
    // Reset to top-center positioning on every open
    searchBox.style.left = '50%';
    searchBox.style.top = '100px';
    searchBox.style.transform = 'translateX(-50%)';
    
    searchInput.focus();
    searchInput.select();
  }

  function closeSearchModal() {
    searchModal.classList.add('hidden');
    editor.focus();
  }

  searchBtn.addEventListener('click', showSearchModal);
  closeSearchBtn.addEventListener('click', closeSearchModal);

  function findText(direction = 'next') {
    const query = searchInput.value;
    if (!query) return;

    const editorText = editor.value;
    const isCaseSensitive = searchCaseSensitive.checked;
    
    let textToSearch = editorText;
    let queryToSearch = query;
    
    if (!isCaseSensitive) {
      textToSearch = editorText.toLowerCase();
      queryToSearch = query.toLowerCase();
    }

    let index = -1;
    const cursor = editor.selectionStart;

    if (direction === 'next') {
      index = textToSearch.indexOf(queryToSearch, editor.selectionEnd);
      if (index === -1) {
        index = textToSearch.indexOf(queryToSearch);
      }
    } else {
      const prevSearchText = textToSearch.substring(0, cursor);
      index = prevSearchText.lastIndexOf(queryToSearch);
      if (index === -1) {
        index = textToSearch.lastIndexOf(queryToSearch);
      }
    }

    if (index !== -1) {
      editor.focus();
      editor.selectionStart = index;
      editor.selectionEnd = index + query.length;
      
      const linesBefore = editorText.substring(0, index).split('\n').length;
      const lineHeight = parseFloat(getComputedStyle(editor).lineHeight || 20);
      editor.scrollTop = Math.max(0, (linesBefore - 10) * lineHeight);
    }
  }

  findNextBtn.addEventListener('click', () => findText('next'));
  findPrevBtn.addEventListener('click', () => findText('prev'));

  // --- Search & Replace Undo History System ---
  function pushToReplaceHistory(entry) {
    entry.id = 'hist-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    entry.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    
    replaceHistoryStack.push(entry);
    if (replaceHistoryStack.length > 3) {
      replaceHistoryStack.shift();
    }
    renderReplaceHistory();
  }

  function renderReplaceHistory() {
    if (!searchHistoryList) return;
    
    if (replaceHistoryStack.length === 0) {
      searchHistoryList.innerHTML = '<div class="history-placeholder">No replacements in this session.</div>';
      return;
    }
    
    searchHistoryList.innerHTML = '';
    // Display newest replacements first (at the top)
    const reversedStack = [...replaceHistoryStack].reverse();
    reversedStack.forEach((item, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      
      const tabName = tabs.find(t => t.id === item.tabId)?.fileName || 'untitled.md';
      const actionLabel = item.type === 'replace_all' ? 'Replace All' : 'Replace';
      const countText = item.count > 1 ? `Replaced ${item.count} items` : `Replaced ${item.count} item`;
      
      // Calculate original index in the true stack (replaceHistoryStack)
      const originalIndex = replaceHistoryStack.length - 1 - index;
      
      historyItem.innerHTML = `
        <div class="history-info">
          <span class="history-action-text" title="${actionLabel}: &quot;${item.findText}&quot; ➔ &quot;${item.replaceText}&quot; (${countText})">
            <strong>${actionLabel}</strong>: "${item.findText}" ➔ "${item.replaceText}"
          </span>
          <span class="history-timestamp">${item.timestamp} &bull; ${tabName} &bull; ${countText}</span>
        </div>
        <button class="history-undo-btn" data-index="${originalIndex}">Undo</button>
      `;
      
      historyItem.querySelector('.history-undo-btn').addEventListener('click', () => {
        undoReplaceAction(originalIndex);
      });
      
      searchHistoryList.appendChild(historyItem);
    });
    
    if (window.lucide) window.lucide.createIcons();
  }

  function undoReplaceAction(originalIndex) {
    if (originalIndex < 0 || originalIndex >= replaceHistoryStack.length) return;
    
    const item = replaceHistoryStack[originalIndex];
    
    const targetTabExists = tabs.some(t => t.id === item.tabId);
    if (!targetTabExists) {
      alert("無法復原：該檔案分頁已被關閉。");
      return;
    }
    
    if (activeTabId !== item.tabId) {
      switchTab(item.tabId);
    }
    
    // Restore editor content state
    editor.value = item.editorStateBefore;
    updatePreview();
    
    // Timeline consistency: remove the clicked action and all newer actions
    // Since replaceHistoryStack is ordered chronologically (oldest to newest):
    // E.g. [oldest (0), middle (1), newest (2)]
    // Undoing middle (1) should remove middle (1) and newest (2).
    // So we splice starting from originalIndex to the end of the stack!
    replaceHistoryStack.splice(originalIndex);
    
    renderReplaceHistory();
  }

  replaceBtn.addEventListener('click', () => {
    const query = searchInput.value;
    const replacement = replaceInput.value;
    if (!query) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);

    const isCaseSensitive = searchCaseSensitive.checked;
    const matches = isCaseSensitive 
      ? selectedText === query
      : selectedText.toLowerCase() === query.toLowerCase();

    if (matches) {
      const editorTextBefore = editor.value;
      editor.value = editor.value.substring(0, start) + replacement + editor.value.substring(end);
      editor.selectionStart = start;
      editor.selectionEnd = start + replacement.length;
      updatePreview();
      
      pushToReplaceHistory({
        type: 'replace',
        findText: query,
        replaceText: replacement,
        count: 1,
        tabId: activeTabId,
        editorStateBefore: editorTextBefore
      });

      findText('next');
    } else {
      findText('next');
    }
  });

  replaceAllBtn.addEventListener('click', () => {
    const query = searchInput.value;
    const replacement = replaceInput.value;
    if (!query) return;

    const editorText = editor.value;
    const isCaseSensitive = searchCaseSensitive.checked;
    
    let regexFlags = 'g';
    if (!isCaseSensitive) regexFlags += 'i';
    
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedQuery, regexFlags);
    
    const count = (editorText.match(regex) || []).length;
    if (count > 0) {
      const editorTextBefore = editorText;
      editor.value = editorText.replace(regex, replacement);
      updatePreview();
      
      pushToReplaceHistory({
        type: 'replace_all',
        findText: query,
        replaceText: replacement,
        count: count,
        tabId: activeTabId,
        editorStateBefore: editorTextBefore
      });

      alert(`Replace 完成！共取代了 ${count} 個項目。`);
    } else {
      alert(`找不到任何符合「${query}」的項目。`);
    }
  });

  // --- Premium Custom Context Menu Controls ---
  const contextMenuEl = document.getElementById('custom-context-menu');

  function hideCustomContextMenu() {
    contextMenuEl.classList.add('hidden');
  }

  document.addEventListener('click', hideCustomContextMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideCustomContextMenu();
  });

  function applyMarkdownFormat(formatType) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.substring(start, end);
    let replacement = '';
    
    const templates = {
      'h1': { wrap: '# ', placeholder: 'Title' },
      'h2': { wrap: '## ', placeholder: 'Heading' },
      'h3': { wrap: '### ', placeholder: 'Subheading' },
      'bold': { prefix: '**', suffix: '**', placeholder: 'bold text' },
      'italic': { prefix: '*', suffix: '*', placeholder: 'italic text' },
      'strike': { prefix: '~~', suffix: '~~', placeholder: 'strikethrough' },
      'code': { prefix: '`', suffix: '`', placeholder: 'code' },
      'codeblock': { prefix: '```code\n', suffix: '\n```', placeholder: '// code block' },
      'ul': { wrap: '- ', placeholder: 'List item' },
      'ol': { wrap: '1. ', placeholder: 'List item' },
      'quote': { wrap: '> ', placeholder: 'Quote' },
      'task': { wrap: '- [ ] ', placeholder: 'Task item' },
      'link': { prefix: '[', suffix: '](url)', placeholder: 'link text' },
      'image': { prefix: '![', suffix: '](image-url)', placeholder: 'image description' }
    };
    
    const rule = templates[formatType];
    if (!rule) return;
    
    if (selected.length > 0) {
      if (rule.wrap) {
        replacement = rule.wrap + selected.split('\n').join('\n' + rule.wrap);
      } else {
        replacement = rule.prefix + selected + rule.suffix;
      }
    } else {
      const placeholder = rule.placeholder;
      if (rule.wrap) {
        replacement = rule.wrap + placeholder;
      } else {
        replacement = rule.prefix + placeholder + rule.suffix;
      }
    }
    
    editor.focus();
    editor.setSelectionRange(start, end);
    document.execCommand('insertText', false, replacement);
    editor.setSelectionRange(start, start + replacement.length);
    
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (currentTab) {
      currentTab.content = editor.value;
      currentTab.isDirty = true;
    }
    
    updatePreview();
    updateCursorPos();
  }

  function showCustomContextMenu(e, type, targetId = null) {
    e.preventDefault();
    e.stopPropagation();
    
    contextMenuEl.innerHTML = '';
    
    const x = e.clientX;
    const y = e.clientY;
    
    if (type === 'editor') {
      const hasSelection = editor.selectionStart !== editor.selectionEnd;
      
      contextMenuEl.innerHTML = `
        <div class="context-menu-item" id="ctx-undo">
          <div class="item-label"><i data-lucide="undo"></i><span>Undo (復原)</span></div>
          <span class="item-shortcut">Ctrl+Z</span>
        </div>
        <div class="context-menu-item" id="ctx-redo">
          <div class="item-label"><i data-lucide="redo"></i><span>Redo (重做)</span></div>
          <span class="item-shortcut">Ctrl+Y</span>
        </div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item ${hasSelection ? '' : 'disabled'}" id="ctx-cut">
          <div class="item-label"><i data-lucide="scissors"></i><span>Cut (剪下)</span></div>
          <span class="item-shortcut">Ctrl+X</span>
        </div>
        <div class="context-menu-item ${hasSelection ? '' : 'disabled'}" id="ctx-copy">
          <div class="item-label"><i data-lucide="copy"></i><span>Copy (複製)</span></div>
          <span class="item-shortcut">Ctrl+C</span>
        </div>
        <div class="context-menu-item" id="ctx-paste">
          <div class="item-label"><i data-lucide="clipboard"></i><span>Paste (貼上)</span></div>
          <span class="item-shortcut">Ctrl+V</span>
        </div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item" id="ctx-selectall">
          <div class="item-label"><i data-lucide="check-square"></i><span>Select All (全選)</span></div>
          <span class="item-shortcut">Ctrl+A</span>
        </div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item" id="ctx-scrolltop">
          <div class="item-label"><i data-lucide="arrow-up"></i><span>Scroll to Top (移至頂端)</span></div>
        </div>
        <div class="context-menu-item" id="ctx-scrollbottom">
          <div class="item-label"><i data-lucide="arrow-down"></i><span>Scroll to Bottom (移至底部)</span></div>
        </div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item has-submenu" id="ctx-turninto">
          <div class="item-label"><i data-lucide="palette"></i><span>Turn into</span></div>
          <div class="context-menu-submenu">
            <div class="context-menu-item" data-format="h1">Heading 1</div>
            <div class="context-menu-item" data-format="h2">Heading 2</div>
            <div class="context-menu-item" data-format="h3">Heading 3</div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-format="bold"><b>Bold (粗體)</b></div>
            <div class="context-menu-item" data-format="italic"><i>Italic (斜體)</i></div>
            <div class="context-menu-item" data-format="strike"><strike>Strikethrough (刪除線)</strike></div>
            <div class="context-menu-item" data-format="code"><code>Inline Code</code></div>
            <div class="context-menu-item" data-format="codeblock"><code>Code Block</code></div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-format="ul">Unordered List</div>
            <div class="context-menu-item" data-format="ol">Ordered List</div>
            <div class="context-menu-item" data-format="task">Task List</div>
            <div class="context-menu-item" data-format="quote">Blockquote</div>
          </div>
        </div>
      `;
      
      contextMenuEl.querySelector('#ctx-undo').addEventListener('click', () => {
        editor.focus();
        document.execCommand('undo');
      });
      contextMenuEl.querySelector('#ctx-redo').addEventListener('click', () => {
        editor.focus();
        document.execCommand('redo');
      });
      
      if (hasSelection) {
        contextMenuEl.querySelector('#ctx-cut').addEventListener('click', () => {
          document.execCommand('cut');
        });
        contextMenuEl.querySelector('#ctx-copy').addEventListener('click', () => {
          document.execCommand('copy');
        });
      }
      contextMenuEl.querySelector('#ctx-paste').addEventListener('click', () => {
        editor.focus();
        document.execCommand('paste');
      });
      contextMenuEl.querySelector('#ctx-selectall').addEventListener('click', () => {
        editor.select();
      });
      contextMenuEl.querySelector('#ctx-scrolltop').addEventListener('click', () => {
        editor.scrollTo({ top: 0, behavior: 'smooth' });
      });
      contextMenuEl.querySelector('#ctx-scrollbottom').addEventListener('click', () => {
        editor.scrollTo({ top: editor.scrollHeight, behavior: 'smooth' });
      });
      
      contextMenuEl.querySelectorAll('.context-menu-submenu .context-menu-item').forEach(subItem => {
        subItem.addEventListener('click', () => {
          const format = subItem.getAttribute('data-format');
          applyMarkdownFormat(format);
        });
      });
      
      const turnIntoItem = contextMenuEl.querySelector('#ctx-turninto');
      if (turnIntoItem) {
        turnIntoItem.addEventListener('click', (e) => {
          if (e.target.closest('.context-menu-submenu')) return;
          e.preventDefault();
          e.stopPropagation();
          turnIntoItem.classList.toggle('locked');
        });
      }
      
    } else if (type === 'preview') {
      const selectedText = window.getSelection().toString().trim();
      
      if (selectedText.length > 0) {
        let lineInfoText = 'Editor Line: Not Found';
        if (editor.value) {
          const index = editor.value.indexOf(selectedText);
          if (index !== -1) {
            const textBefore = editor.value.substring(0, index);
            const lineNum = textBefore.split('\n').length;
            lineInfoText = `Editor Line: ${lineNum}`;
          }
        }
        
        contextMenuEl.innerHTML = `
          <div class="context-menu-title" style="pointer-events: none; opacity: 0.65;">${lineInfoText}</div>
          <div class="context-menu-separator"></div>
          <div class="context-menu-item" id="ctx-preview-copy">
            <div class="item-label"><i data-lucide="copy"></i><span>Copy (複製)</span></div>
            <span class="item-shortcut">Ctrl+C</span>
          </div>
          <div class="context-menu-item" id="ctx-preview-selectall">
            <div class="item-label"><i data-lucide="check-square"></i><span>Select All (全選)</span></div>
            <span class="item-shortcut">Ctrl+A</span>
          </div>
        `;
        
        contextMenuEl.querySelector('#ctx-preview-copy').addEventListener('click', () => {
          document.execCommand('copy');
        });
        contextMenuEl.querySelector('#ctx-preview-selectall').addEventListener('click', () => {
          const range = document.createRange();
          range.selectNodeContents(previewContainer);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        });
        
      } else {
        contextMenuEl.innerHTML = `
          <div class="context-menu-item" id="ctx-preview-scrolltop">
            <div class="item-label"><i data-lucide="arrow-up"></i><span>Scroll to Top (移至頂端)</span></div>
          </div>
          <div class="context-menu-item" id="ctx-preview-scrollbottom">
            <div class="item-label"><i data-lucide="arrow-down"></i><span>Scroll to Bottom (移至底部)</span></div>
          </div>
        `;
        
        contextMenuEl.querySelector('#ctx-preview-scrolltop').addEventListener('click', () => {
          previewContainer.scrollTo({ top: 0, behavior: 'smooth' });
        });
        contextMenuEl.querySelector('#ctx-preview-scrollbottom').addEventListener('click', () => {
          previewContainer.scrollTo({ top: previewContainer.scrollHeight, behavior: 'smooth' });
        });
      }
      
    } else if (type === 'tab') {
      const targetTab = tabs.find(t => t.id === targetId);
      if (!targetTab) return;
      
      const isSaved = !!targetTab.filePath;
      
      contextMenuEl.innerHTML = `
        <div class="context-menu-item" id="ctx-tab-save">
          <div class="item-label"><i data-lucide="save"></i><span>Save (儲存)</span></div>
          <span class="item-shortcut">Ctrl+S</span>
        </div>
        <div class="context-menu-item" id="ctx-tab-duplicate">
          <div class="item-label"><i data-lucide="copy"></i><span>Duplicate Tab (複製分頁)</span></div>
        </div>
        <div class="context-menu-item" id="ctx-tab-close">
          <div class="item-label"><i data-lucide="x-circle"></i><span>Close Tab (關閉分頁)</span></div>
          <span class="item-shortcut">Ctrl+W</span>
        </div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item" id="ctx-tab-moveleft">
          <div class="item-label"><i data-lucide="arrow-left"></i><span>Move to Leftmost (移至最左)</span></div>
        </div>
        <div class="context-menu-item" id="ctx-tab-moveright">
          <div class="item-label"><i data-lucide="arrow-right"></i><span>Move to Rightmost (移至最右)</span></div>
        </div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item ${isSaved ? '' : 'disabled'}" id="ctx-tab-reveal">
          <div class="item-label"><i data-lucide="folder-open"></i><span>Open File Location (開啟檔案位置)</span></div>
        </div>
      `;
      
      contextMenuEl.querySelector('#ctx-tab-save').addEventListener('click', () => {
        if (activeTabId !== targetId) {
          switchTab(targetId);
        }
        setTimeout(() => {
          handleSaveFile();
        }, 50);
      });
      
      contextMenuEl.querySelector('#ctx-tab-duplicate').addEventListener('click', () => {
        let tabContent = '';
        if (targetId === activeTabId) {
          tabContent = editor.value;
        } else {
          tabContent = targetTab.content;
        }
        
        const cleanName = targetTab.fileName.replace(/\.md$/, '');
        const duplicateName = `${cleanName}-1.md`;
        
        createNewTab(null, duplicateName, tabContent, true);
      });
      
      contextMenuEl.querySelector('#ctx-tab-close').addEventListener('click', (e) => {
        closeTab(targetId, e);
      });
      
      contextMenuEl.querySelector('#ctx-tab-moveleft').addEventListener('click', () => {
        const index = tabs.findIndex(t => t.id === targetId);
        if (index > 0) {
          const tabObj = tabs.splice(index, 1)[0];
          tabs.unshift(tabObj);
          renderTabs();
        }
      });
      
      contextMenuEl.querySelector('#ctx-tab-moveright').addEventListener('click', () => {
        const index = tabs.findIndex(t => t.id === targetId);
        if (index !== -1 && index < tabs.length - 1) {
          const tabObj = tabs.splice(index, 1)[0];
          tabs.push(tabObj);
          renderTabs();
        }
      });
      
      if (isSaved) {
        contextMenuEl.querySelector('#ctx-tab-reveal').addEventListener('click', () => {
          window.api.showItemInFolder(targetTab.filePath);
        });
      }
    }
    
    if (window.lucide) {
      window.lucide.createIcons({
        attrs: {
          class: 'lucide-context-icon'
        },
        nameAttr: 'data-lucide',
        icons: window.lucide.icons
      });
    }
    
    contextMenuEl.classList.remove('hidden');
    
    const menuWidth = contextMenuEl.offsetWidth || 190;
    const menuHeight = contextMenuEl.offsetHeight || 280;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let finalX = x;
    let finalY = y;
    
    if (x + menuWidth > windowWidth) {
      finalX = windowWidth - menuWidth - 8;
    }
    if (y + menuHeight > windowHeight) {
      finalY = windowHeight - menuHeight - 8;
    }
    
    contextMenuEl.style.left = `${finalX}px`;
    contextMenuEl.style.top = `${finalY}px`;
    
    // Position the submenu dynamically to prevent overflow
    const submenu = contextMenuEl.querySelector('.context-menu-submenu');
    if (submenu) {
      // Save original style to measure
      const origDisplay = submenu.style.display;
      const origVisibility = submenu.style.visibility;
      
      // Temporarily display flex & invisible to measure actual offsetWidth and offsetHeight
      submenu.style.display = 'flex';
      submenu.style.visibility = 'hidden';
      
      const subWidth = submenu.offsetWidth || 180;
      const subHeight = submenu.offsetHeight || 420;
      
      // Restore styles
      submenu.style.display = origDisplay;
      submenu.style.visibility = origVisibility;
      
      const parentItem = contextMenuEl.querySelector('.has-submenu');
      if (parentItem) {
        const parentRect = parentItem.getBoundingClientRect();
        
        // Horizontal overflow check
        if (parentRect.right + subWidth > windowWidth) {
          submenu.style.left = 'auto';
          submenu.style.right = '100%';
        } else {
          submenu.style.left = '100%';
          submenu.style.right = 'auto';
        }
        
        // Vertical overflow check
        if (parentRect.top + subHeight > windowHeight) {
          submenu.style.top = 'auto';
          submenu.style.bottom = '-6px';
        } else {
          submenu.style.top = '-6px';
          submenu.style.bottom = 'auto';
        }
      }
    }
  }

  editor.addEventListener('contextmenu', (e) => {
    showCustomContextMenu(e, 'editor');
  });

  previewContainer.addEventListener('contextmenu', (e) => {
    showCustomContextMenu(e, 'preview');
  });

  // --- Keyboard Shortcuts Listener ---
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!searchModal.classList.contains('hidden')) {
        closeSearchModal();
      } else if (!cheatsheetSidebar.classList.contains('collapsed')) {
        cheatsheetSidebar.classList.add('collapsed');
        toggleCheatsheetBtn.classList.remove('active');
      } else if (!tocSidebar.classList.contains('collapsed')) {
        tocSidebar.classList.add('collapsed');
        toggleTocBtn.classList.remove('active');
      }
    }
  });

  editor.addEventListener('input', () => {
    updatePreview();
  });

  clearEditorBtn.addEventListener('click', () => {
    editor.value = '';
    updatePreview();
  });

  // --- On-screen Buttons Click Listeners ---
  saveBtn.addEventListener('click', handleSaveFile);
  exportHtmlBtn.addEventListener('click', handleExportHtml);
  exportPdfBtn.addEventListener('click', handleExportPdf);
  exportPngBtn.addEventListener('click', handleExportPng);

  // --- Menu Action IPC Subscriptions ---
  window.api.onMenuAction('menu-new-file', () => {
    createNewTab(null, 'untitled.md', welcomeMarkdown, true);
  });
  window.api.onMenuAction('menu-open-file', handleOpenFile);
  window.api.onMenuAction('menu-save-file', handleSaveFile);
  window.api.onMenuAction('menu-save-as-file', handleSaveAsFile);
  window.api.onMenuAction('menu-export-html', handleExportHtml);
  window.api.onMenuAction('menu-export-pdf', handleExportPdf);
  window.api.onMenuAction('menu-export-png', handleExportPng);
  
  window.api.onMenuAction('menu-find-replace', showSearchModal);
  
  window.api.onMenuAction('menu-toggle-toc', () => {
    tocSidebar.classList.toggle('collapsed');
    toggleTocBtn.classList.toggle('active');
  });
  window.api.onMenuAction('menu-toggle-cheatsheet', () => {
    cheatsheetSidebar.classList.toggle('collapsed');
    toggleCheatsheetBtn.classList.toggle('active');
  });
  window.api.onMenuAction('menu-toggle-split', () => {
    toggleSplitBtn.click();
  });
  window.api.onMenuAction('menu-set-theme', (themeClass) => {
    setThemeClass(themeClass);
  });
  window.api.onMenuAction('menu-show-help', () => {
    cheatsheetSidebar.classList.remove('collapsed');
    toggleCheatsheetBtn.classList.add('active');
  });

  // Load Mermaid.js asynchronously to prevent startup delays
  function loadMermaidAsync() {
    setTimeout(async () => {
      try {
        const { default: mermaid } = await import('./node_modules/mermaid/dist/mermaid.esm.min.mjs');
        window.mermaid = mermaid;
        console.log('[Renderer] Mermaid.js loaded asynchronously in the background!');
        initMermaid(activeTheme);
        updatePreviewDirect();
      } catch (err) {
        console.error('[Renderer] Failed to load Mermaid.js asynchronously:', err);
      }
    }, 150);
  }

  // --- Application Initial Launch Flow ---
  async function initApp() {
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Re-render when background modules finish loading
    window.api.onModulesLoaded(() => {
      console.log('[Renderer] Node modules are loaded, updating preview...');
      updatePreviewDirect();
    });

    // Asynchronously load the heavy Mermaid.js engine
    loadMermaidAsync();

    const argvFile = await window.api.getArgvFile();
    if (argvFile) {
      const basename = argvFile.filePath.substring(argvFile.filePath.lastIndexOf('\\') + 1);
      setTimeout(() => {
        createNewTab(argvFile.filePath, basename, argvFile.content, true);
      }, 50);
    } else {
      // Load default playground active tab with a slight delay to allow window to show instantly!
      setTimeout(() => {
        createNewTab(null, 'untitled.md', welcomeMarkdown, true);
      }, 50);
    }
  }

  initApp();
});
