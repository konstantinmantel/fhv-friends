import { readFile, writeFile } from 'node:fs/promises';
let html = await readFile('index.html','utf8');
const css = await readFile('src/styles.css','utf8');
const handFiles=['01_spirale.png','02_glocke.png','03_austausch_pfeile.png','04_plus_quadrat.png','05_kalender.png','06_profil.png'];
let code='';
for (const file of ['core','data','demo','merge','sync','icon-sprite','dom','gestures','icons','api','franzi','app']) {
 let part=await readFile(`src/${file}.js`,'utf8');
 part=part.replace(/^import .*;\n/gm,'').replace(/^export /gm,'').replaceAll('import.meta.url','document.baseURI');
 if(file==='app')part='const e = escapeHtml;\n'+part;
 code+=part+'\n';
}
for(const file of handFiles){const data=(await readFile(`public/icons/${file}`)).toString('base64');code=code.replaceAll(`./icons/${file}`,`data:image/png;base64,${data}`);}
code=code.replaceAll('./ui-icons.svg#','#');
html=html.replace('<link rel="stylesheet" href="./src/styles.css">',`<style>${css}</style>`)
 .replace(/  <link rel="manifest"[^>]*>\n/,'').replace(/  <link rel="icon"[^>]*>\n/,'').replace(/  <link rel="apple-touch-icon"[^>]*>\n/,'')
 .replace('<script src="./config.js"></script>','<script>window.FHV_CONFIG = {supabaseUrl:"",supabaseKey:"",presentationApi:"https://fhv-friends-sync.appreciativemesa8.chatgpt.site"};</script>')
 .replace('<script type="module" src="./src/app.js"></script>',`<script>${code.replaceAll('</script','<\\/script')}</script>`);
await writeFile('FHV-Friends.html',html);
console.log('Standalone preview: FHV-Friends.html');
