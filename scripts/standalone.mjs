import { readFile, writeFile } from 'node:fs/promises';
let html = await readFile('index.html','utf8');
const css = await readFile('src/styles.css','utf8');
let code='';
for (const file of ['core','data','icons','api','app']) {
 let part=await readFile(`src/${file}.js`,'utf8');
 part=part.replace(/^import .*;\n/gm,'').replace(/^export /gm,'').replaceAll('import.meta.url','document.baseURI');
 if(file==='app')part='const e = escapeHtml;\n'+part;
 code+=part+'\n';
}
html=html.replace('<link rel="stylesheet" href="./src/styles.css">',`<style>${css}</style>`)
 .replace(/  <link rel="manifest"[^>]*>\n/,'').replace(/  <link rel="icon"[^>]*>\n/,'').replace(/  <link rel="apple-touch-icon"[^>]*>\n/,'')
 .replace('<script src="./config.js"></script>','<script>window.FHV_CONFIG = {supabaseUrl:"",supabaseKey:""};</script>')
 .replace('<script type="module" src="./src/app.js"></script>',`<script>${code.replaceAll('</script','<\\/script')}</script>`);
await writeFile('FHV-Friends.html',html);
console.log('Standalone preview: FHV-Friends.html');
