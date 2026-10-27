/* The outline owns both preview visibility and source-editor fold markers. */
window.ArticleOutline = class ArticleOutline {
  constructor(editor, preview, tree, onLayout) {
    this.editor = editor;
    this.preview = preview;
    this.tree = tree;
    this.onLayout = onLayout;
    this.sections = [];
    this.marks = [];
    this.state = new Set();
    this.ready = true;
    this.suppress = false;
    editor.revealRange = (a, b) => this.revealRange(a, b);
    // Never silently delete hidden text with a selection spanning a folded range.
    editor.cm.on('beforeChange', (cm, change) => {
      if (change.origin === 'setValue' || change.origin === 'undo' || change.origin === 'redo') return;
      const a = cm.indexFromPos(change.from), b = cm.indexFromPos(change.to);
      if (a === b) return;
      if (this.marks.some(mark => {
        const range = mark.find();
        return range && a < cm.indexFromPos(range.to) && b > cm.indexFromPos(range.from);
      })) {
        change.cancel();
        const doc = cm.getDoc(), state = this.state;
        setTimeout(() => {
          if (cm.getDoc() === doc && this.state === state) this.revealRange(a, b);
        }, 0);
      }
    });
  }
  clearMarks() {
    this.suppress = true;
    this.marks.forEach(mark => { mark.outlineDiscarded = true; mark.clear(); });
    this.marks = [];
    this.suppress = false;
  }
  rebuild(ranges, state, ready = true) {
    this.clearMarks();
    this.state = state;
    this.ready = ready;
    this.tree.replaceChildren();
    const headings = Array.from(this.preview.children).filter(node => /^H[1-6]$/.test(node.tagName) && node.hasAttribute('data-outline-heading'));
    this.sections = ranges.map((range, i) => {
      const heading = headings[i];
      const nodes = [];
      if (heading) for (let node = heading.nextElementSibling; node; node = node.nextElementSibling) {
        if (/^H[1-6]$/.test(node.tagName) && Number(node.tagName[1]) <= range.level) break;
        nodes.push(node);
      }
      const button = document.createElement('button');
      button.className = 'outline-item';
      button.type = 'button';
      button.style.paddingLeft = `${12 + (range.level - 1) * 14}px`;
      const arrow = document.createElement('span');
      arrow.className = 'outline-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.textContent = heading?.textContent || range.title;
      button.append(arrow, label);
      const section = { ...range, heading, nodes, button, arrow, foldable: range.end > range.headerEnd };
      button.addEventListener('click', () => this.toggle(section));
      this.tree.append(button);
      return section;
    });
    if (!this.sections.length) {
      const empty = document.createElement('div');
      empty.className = 'toc-placeholder';
      empty.textContent = 'No headings found. Use # through ###### to create an outline.';
      this.tree.append(empty);
    }
    this.apply();
  }
  revealParents(section) {
    this.sections.forEach(parent => {
      if (parent.line < section.line && parent.end >= section.line) this.state.delete(parent.key);
    });
  }
  toggle(section) {
    this.revealParents(section);
    if (section.foldable) {
      this.state.has(section.key) ? this.state.delete(section.key) : this.state.add(section.key);
    }
    // Move the caret onto the visible heading before collapsing its body.
    this.editor.cm.setCursor({line: section.line, ch: 0});
    this.apply();
    this.editor.scrollToLine(section.line);
    if (section.heading) {
      const top = section.heading.getBoundingClientRect().top - this.preview.getBoundingClientRect().top + this.preview.scrollTop;
      this.preview.scrollTop = top;
    }
  }
  setAll(closed) {
    this.state.clear();
    if (closed) {
      this.sections.filter(s => s.foldable).forEach(s => this.state.add(s.key));
      if (this.sections.length) this.editor.cm.setCursor({line: this.sections[0].line, ch: 0});
    }
    this.apply();
  }
  revealRange(a, b) {
    const cm = this.editor.cm;
    const from = cm.posFromIndex(a), to = cm.posFromIndex(b);
    let changed = false;
    for (const section of this.sections) {
      if (to.line > section.headerEnd && from.line <= section.end) {
        changed = this.state.delete(section.key) || changed;
      }
    }
    if (changed) this.apply();
  }
  apply() {
    this.onLayout();
    const cm = this.editor.cm;
    const top = cm.getScrollInfo().top;
    this.preview.querySelectorAll('.outline-content-hidden').forEach(node => node.classList.remove('outline-content-hidden'));
    cm.operation(() => {
      this.clearMarks();
      const closed = this.sections.filter(s => s.foldable && this.state.has(s.key));
      for (const section of this.sections) {
        const collapsed = section.foldable && this.state.has(section.key);
        section.arrow.textContent = section.foldable ? (collapsed ? '\u25b8' : '\u25be') : '\u00b7';
        section.button.setAttribute('aria-expanded', String(!collapsed));
        section.button.title = `${collapsed ? 'Expand' : 'Collapse'}: ${section.title}`;
        if (collapsed && this.ready) section.nodes.forEach(node => node.classList.add('outline-content-hidden'));
      }
      // Only mark outermost folds. Nested state survives without overlapping markers.
      for (const section of closed) {
        if (closed.some(parent => parent.line < section.line && parent.end >= section.end)) continue;
        const widget = document.createElement('span');
        widget.className = 'source-fold-placeholder';
        widget.textContent = ' \u2026';
        widget.title = 'Expand this section from Outline';
        const mark = cm.markText(
          {line: section.headerEnd, ch: cm.getLine(section.headerEnd).length},
          {line: section.end, ch: cm.getLine(section.end).length},
          {replacedWith: widget, clearOnEnter: true, inclusiveLeft: false, inclusiveRight: false}
        );
        mark.on('clear', () => {
          if (!mark.outlineDiscarded && !this.suppress && this.state.delete(section.key)) queueMicrotask(() => this.apply());
        });
        this.marks.push(mark);
      }
    });
    cm.scrollTo(null, top);
    document.getElementById('outline-collapse-all').disabled = !this.sections.some(s => s.foldable);
    document.getElementById('outline-expand-all').disabled = !this.sections.some(s => s.foldable);
  }
  static exportHtml(preview) {
    const copy = preview.cloneNode(true);
    copy.querySelectorAll('.outline-content-hidden').forEach(node => node.classList.remove('outline-content-hidden'));
    return copy.innerHTML;
  }
};
