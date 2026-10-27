const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {marked}=require('marked'),{sections}=require('../outline-model');
const {JSDOM}=require(process.env.OUTLINE_TEST_JSDOM || 'jsdom');
(async()=>{
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const dom=new JSDOM(html,{url:'http://localhost',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window, errors=[];
w.addEventListener('error',e=>errors.push(e.error || e.message));
w.alert=msg=>errors.push(msg);w.focus=()=>{};
w.Range.prototype.getBoundingClientRect=()=>({left:0,right:100,top:0,bottom:20,width:100,height:20});
w.Range.prototype.getClientRects=()=>[];
const originalTimeout=w.setTimeout.bind(w);
w.setTimeout=(fn,delay,...args)=>delay===150?0:originalTimeout(fn,delay,...args);
const source='# Article\nIntro\n\n## One\nHidden body\n\n## Two\nOther body\n';
const renderer=new marked.Renderer();
renderer.heading=(text,level)=>`<h${level} data-outline-heading="true">${text}</h${level}>`;
const writes=[],exports=[],menu={};
const methods={
 onMenuAction:(name,fn)=>{menu[name]=fn;},
 getArgvFile:async()=>({filePath:'C:\\notes\\article.md',content:source}),
 parseMarkdown:src=>marked.parse(src,{renderer}),getOutline:src=>sections(src,s=>marked.lexer(s)),
 writeFile:async(file,content)=>{writes.push({file,content});return true;},
 showSaveDialog:async path=>path,
 exportPdf:async(html)=>exports.push({type:'pdf',html}),
 exportPng:async(html)=>exports.push({type:'png',html})
};
w.api=new Proxy(methods,{get:(target,key)=>target[key]||(()=>{})});
for(const file of ['assets/codemirror/codemirror.js','source-editor.js','article-outline.js'])w.eval(fs.readFileSync(path.join(__dirname,'..',file),'utf8'));
// Let jsdom's initial DOMContentLoaded finish before installing the application listener.
await new Promise(resolve=>w.setTimeout(resolve,0));
w.eval(fs.readFileSync(path.join(__dirname,'../renderer.js'),'utf8'));
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
await new Promise(resolve=>w.setTimeout(resolve,100));
assert.deepEqual(errors,[],'application initializes without errors');
const editor=w.document.getElementById('source-editor');
assert.equal(editor.value,source);
assert.ok(w.document.querySelector('#editor-pane .pane-title #toggle-toc-btn'));
assert.equal(w.document.querySelectorAll('#toggle-toc-btn').length,1);
w.document.getElementById('toggle-toc-btn').click();
await Promise.resolve();
assert.equal(w.document.getElementById('toggle-toc-btn').getAttribute('aria-expanded'),'true');
w.document.querySelectorAll('.outline-item')[1].click();
assert.equal(editor.cm.getAllMarks().length,1);
assert.ok(w.document.querySelector('#preview-container .outline-content-hidden'));
assert.equal(w.document.getElementById('unsaved-dot').classList.contains('hidden'),true,'folding does not dirty document');
w.document.getElementById('save-btn').click();
await new Promise(resolve=>w.setTimeout(resolve,0));
assert.equal(writes.at(-1).content,source,'save contains hidden Markdown');
w.document.getElementById('export-pdf-btn').click();
w.document.getElementById('export-png-btn').click();
w.document.getElementById('export-html-btn').click();
await new Promise(resolve=>w.setTimeout(resolve,0));
assert.equal(exports.length,2);
for(const result of exports){assert.ok(result.html.includes('Hidden body'));assert.ok(!result.html.includes('outline-content-hidden'));}
assert.ok(writes.some(x=>x.file.endsWith('.html')&&x.content.includes('Hidden body')&&!x.content.includes('outline-content-hidden')));
w.document.getElementById('outline-expand-all').click();
assert.equal(editor.cm.getAllMarks().length,0);
editor.setSelectionRange(source.indexOf('Other'),source.indexOf('Other')+5);
editor.cm.getInputField().dispatchEvent(new w.KeyboardEvent('keydown',{key:'b',keyCode:66,ctrlKey:true,bubbles:true,cancelable:true}));
assert.ok(editor.value.includes('**Other**'),'format shortcut works in source editor');
editor.focus();menu['menu-undo']();assert.equal(editor.value,source,'menu undo works');
menu['menu-redo']();assert.ok(editor.value.includes('**Other**'),'menu redo works');
menu['menu-undo']();
w.document.getElementById('outline-collapse-all').click();
assert.equal(editor.cm.getAllMarks().length,1);
w.document.getElementById('outline-expand-all').click();
assert.equal(editor.cm.getAllMarks().length,0);
assert.deepEqual(errors,[]);
console.log('PASS: full renderer startup, Outline placement, toggle/all controls, clean-save state, HTML/PDF/PNG export, formatting and undo');
w.close();
})().catch(error=>{console.error(error);process.exit(1);});
