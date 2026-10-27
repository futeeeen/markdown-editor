/* Shared source ranges: lexer tokens exclude headings inside code fences. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.OutlineModel = api;
})(typeof window === 'object' ? window : globalThis, function () {
  function sections(source, lexer) {
    source = source.replace(/\r\n?/g, '\n');
    const result = [], counts = new Map(), parents = [];
    let offset = 0;
    for (const token of lexer(source)) {
      if (token.type === 'heading') {
        const line = source.slice(0, offset).split('\n').length - 1;
        const headerEnd = line + token.raw.trimEnd().split('\n').length - 1;
        while (parents.length && parents.at(-1).level >= token.depth) parents.pop();
        const base = JSON.stringify([parents.map(p => p.key), token.depth, token.text]);
        const count = counts.get(base) || 0;
        counts.set(base, count + 1);
        const section = { key: base + ':' + count, title: token.text, level: token.depth, line, headerEnd };
        result.push(section);
        parents.push(section);
      }
      offset += token.raw.length;
    }
    const last = source.split('\n').length - 1;
    result.forEach((section, i) => {
      const next = result.slice(i + 1).find(item => item.level <= section.level);
      section.end = next ? next.line - 1 : last;
    });
    return result;
  }
  return { sections };
});
