const paths = {
 franzi:'<path d="M13 12c-3-5-9-2-8 3 1 5 9 6 13 1 5-6 1-13-5-13-7 0-11 8-7 14 3 5 11 5 15-1"/>',
 car:'<path d="m4 10 2-6h12l2 6M3 10h18v9H3zM6 19v2m12-2v2M6 14h2m8 0h2"/>',
 cup:'<path d="M5 8h12v8a6 6 0 0 1-12 0V8Zm12 1h2a3 3 0 0 1 0 6h-2M8 2v3m5-3v3"/>',
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 trade:'<path d="M4 7h15m-5-5 5 5-5 5M20 17H5m5-5-5 5 5 5"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
 chat:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 10 10 0 0 1-4-.8L3 21l1.8-5.5a10 10 0 0 1-.8-4 8.5 8.5 0 0 1 17 0Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 chevron:'<path d="m9 5 7 7-7 7"/>',
 down:'<path d="m6 9 6 6 6-6"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 bookmark:'<path d="M6 3h12a1 1 0 0 1 1 1v18l-7-4-7 4V4a1 1 0 0 1 1-1Z"/>',
 map:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 people:'<circle cx="9" cy="7" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M17 4a3 3 0 0 1 0 6M18 14a6 6 0 0 1 4 6"/>',
 pin:'<path d="m16 3 5 5-4 2-3 6-2-2-7 7M3 8l5-5 2 4 6 3-6 6-3-6Z"/>',
 coffee:'<path d="M4 8h13v7a6 6 0 0 1-12 0V8M17 9h1a3 3 0 0 1 0 6h-1M7 2v2M12 2v2M2 22h18"/>',
 book:'<path d="M12 5v16M3 3c4-1 7 0 9 2 2-2 5-3 9-2v16c-4-1-7 0-9 2-2-2-5-3-9-2Z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1"/>',
 mountain:'<path d="m2 21 7-15 5 9 3-5 5 11ZM6 12l3 2 3-2"/>',
 spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4M18 4h4"/>',
 shield:'<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6z"/><path d="m8 12 3 3 5-6"/>',
 mail:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 5 10 8L22 5"/>',
 send:'<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>',
 settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor"/><circle cx="15" cy="17" r="3" fill="currentColor"/>',
 logout:'<path d="M9 21H4V3h5M10 12h12m-5-5 5 5-5 5"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
 share:'<path d="M12 16V2m-5 5 5-5 5 5M5 11H3v11h18V11h-2"/>',
 flag:'<path d="M4 22V3c5-4 11 4 16 0v12c-5 4-11-4-16 0"/>',
 trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 16h12l1-16M10 10v8M14 10v8"/>',
 more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
 wifi:'<path d="M2 7a16 16 0 0 1 20 0M5 11a11 11 0 0 1 14 0M8 15a6 6 0 0 1 8 0M12 20h.01"/>',
 leaf:'<path d="M20 3c-17-1-19 12-11 15 9 4 13-7 11-15ZM4 22 16 9"/>',
};
const brandSymbols={"home":"feed","trade":"arrows","calendar":"calendar","user":"person","bell":"bell","chat":"chat","franzi":"franzi","people":"people","plus":"plus","search":"search","car":"car","book":"book","heart":"heart","bookmark":"bookmark","map":"map"};
const handAssets={franzi:'./icons/01_spirale.png',bell:'./icons/02_glocke.png',trade:'./icons/03_austausch_pfeile.png',calendar:'./icons/05_kalender.png',user:'./icons/06_profil.png'};
export function icon(name,size=22,cls='') {
 const file=handAssets[name]||(name==='plus'&&cls==='create-mark'?'./icons/04_plus_quadrat.png':null);
 const assetUrl=file?new URL(file,document.baseURI||location.href).href:null;
 if(file)return `<span class="icon hand-icon ${cls}" style="width:${size}px;height:${size}px;--hand-icon:url('${assetUrl}')" aria-hidden="true"></span>`;
 const symbol=brandSymbols[name];
 return `<svg class="icon ${symbol?'brand-icon ':''}${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${symbol?'1.9':'1.7'}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbol?`<use href="./ui-icons.svg#${symbol}"/>`:paths[name]||paths.spark}</svg>`;
}
