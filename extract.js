const fs = require('fs');
const html = fs.readFileSync('titan.html', 'utf8');

const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (cssMatch) {
  let css = cssMatch[1];
  
  const rtlOverrides = `
/* RTL Specific overrides */
html[dir="rtl"] .nav-item::after, html[dir="rtl"] .add-btn::after {
  left: auto;
  right: calc(100% + 14px);
  transform: translate(6px, -50%);
}
html[dir="rtl"] .nav-item:hover::after, html[dir="rtl"] .add-btn:hover::after {
  transform: translate(0, -50%);
}
html[dir="rtl"] .av::before {
  right: auto;
  left: calc(100% + 14px);
  transform: translate(-6px, -50%);
}
html[dir="rtl"] .av:hover::before {
  transform: translate(0, -50%);
}
html[dir="rtl"] .search input {
  padding-left: 10px;
  padding-right: 0;
}
html[dir="rtl"] .search kbd {
  margin-right: auto;
}
`;
  
  fs.writeFileSync('src/app/globals.css', '/* Generated from titan.html */\n' + css + '\n' + rtlOverrides);
}

const jsMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (jsMatch) {
  fs.writeFileSync('src/app/titan.js', jsMatch[1]);
}
