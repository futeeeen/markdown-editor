/* CodeMirror facade keeps existing full-source save/search/format commands intact. */
window.createSourceEditor = function (textarea) {
  const cm = CodeMirror.fromTextArea(textarea, {
    lineNumbers: true, lineWrapping: true, mode: null, tabSize: 4,
    indentUnit: 4, inputStyle: 'textarea', viewportMargin: 15,
    extraKeys: { 'Ctrl-F': false, 'Cmd-F': false, 'Ctrl-S': false, 'Cmd-S': false }
  });
  const editor = cm.getWrapperElement();
  editor.id = 'source-editor';
  textarea.id = 'source-editor-original';
  textarea.previousElementSibling?.classList.add('legacy-gutter');
  let silent = false;
  const pos = index => cm.posFromIndex(index);
  const start = () => cm.indexFromPos(cm.getCursor('from'));
  const end = () => cm.indexFromPos(cm.getCursor('to'));
  Object.defineProperties(editor, {
    value: {
      get: () => cm.getValue(),
      set: value => {
        const old = cm.getValue();
        if (old === value) return;
        let a = 0, b = old.length, c = value.length;
        while (a < b && a < c && old[a] === value[a]) a++;
        while (b > a && c > a && old[b - 1] === value[c - 1]) { b--; c--; }
        editor.revealRange?.(a, b);
        silent = true;
        try { cm.replaceRange(value.slice(a, c), pos(a), pos(b), '+input'); }
        finally { silent = false; }
      }
    },
    selectionStart: { get: start, set: index => editor.setSelectionRange(index, Math.max(index, end())) },
    selectionEnd: { get: end, set: index => editor.setSelectionRange(Math.min(start(), index), index) },
    scrollTop: { get: () => cm.getScrollInfo().top, set: top => cm.scrollTo(null, top) },
    scrollHeight: { get: () => cm.getScrollInfo().height },
    clientHeight: { get: () => cm.getScrollInfo().clientHeight }
  });
  editor.cm = cm;
  editor.focus = () => cm.focus();
  editor.setSelectionRange = (a, b) => {
    editor.revealRange?.(a, b);
    cm.setSelection(pos(a), pos(b));
  };
  editor.select = () => editor.setSelectionRange(0, editor.value.length);
  editor.scrollTo = options => cm.scrollTo(options.left ?? null, options.top ?? null);
  editor.replaceSelection = text => cm.replaceSelection(text, 'around', '+input');
  editor.scrollToLine = line => cm.scrollIntoView({line, ch: 0}, 30);
  editor.loadTab = tab => {
    silent = true;
    try {
      if (!tab.editorDoc) tab.editorDoc = new CodeMirror.Doc(tab.content);
      cm.swapDoc(tab.editorDoc);
      if (cm.getValue() !== tab.content) cm.setValue(tab.content);
    } finally { silent = false; }
    cm.refresh();
  };
  cm.on('changes', () => { if (!silent) editor.dispatchEvent(new Event('input')); });
  cm.on('scroll', () => editor.dispatchEvent(new Event('scroll')));
  cm.on('cursorActivity', () => editor.dispatchEvent(new Event('keyup')));
  // Run the application's custom shortcuts before CodeMirror handles the key.
  const add = editor.addEventListener.bind(editor);
  editor.addEventListener = (name, fn, options) => add(name, fn, ['keydown', 'paste', 'drop'].includes(name) ? true : options);
  return editor;
};
