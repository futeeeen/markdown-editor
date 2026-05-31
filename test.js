const { marked } = require('marked');
const hljs = require('highlight.js');

try {
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
  console.log('Parse success:', marked.parse('# Hello\n```js\nconst a = 1;\n```'));
} catch (e) {
  console.error('Config failed:', e);
}
