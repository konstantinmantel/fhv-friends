import { canonicalCategory } from './core.js';
import { DEMO_PROFILES, PEOPLE, demoPosts } from './data.js';
const aliases={'demo-lena':'demo-profile-2','demo-felix':'demo-profile-3','demo-sarah':'demo-profile-4','demo-jonas':'demo-you'};
export const demoId=id=>aliases[id]||id;
export function emptyDemoAccount(){return {joined:[],saved:[],liked:[],invitations:[]};}
function preparePresentation(world){
 if(!world.presentationEnglishV1){
  const oldTitles={"beerpong": "Beerpong-Runde", "gluehwein": "Zusammen Glühwein trinken", "ride-bregenz": "Freitag nach Bregenz", "coffee": "Spieleabend im Café Campus", "salad": "Couscous-Salat übrig", "hike": "Samstag auf den Karren?", "lamp": "Schreibtischlampe abzugeben", "run": "Eine Runde an der Ach laufen", "math": "Hilfe bei Mathe 1", "boulder": "Montag ins K1", "skis": "Skier, 170 cm – 45 €", "study": "Sonntag in die Bib", "tool": "Kann mir wer einen Akkuschrauber leihen?"};
  const samples=demoPosts();
  world.posts=world.posts.map(p=>{const sample=samples.find(x=>x.id===p.id);if(sample&&p.example&&p.title===oldTitles[p.id]){const {author,...fresh}=sample;return {...p,title:fresh.title,description:fresh.description,location:fresh.location,ride_destination:fresh.ride_destination||p.ride_destination,category:fresh.category};}return {...p,category:canonicalCategory(p.category)};});
  world.profiles=world.profiles.map((p,i)=>/^Profil [1-4]$|^Profile [1-4]$/.test(p.name)?{...p,name:DEMO_PROFILES[i].name}:p);
  world.presentationEnglishV1=true;
 }
 world.posts=world.posts.map(p=>({...p,category:canonicalCategory(p.category)}));return world;
}
export function createDemoWorld(saved=null,legacy=null){
 if(saved?.version===2 && Array.isArray(saved.profiles) && saved.profiles.length===4){saved.connections??=[];if(!saved.extras_20261121){for(const {author,...p} of demoPosts().filter(p=>['beerpong','gluehwein','ride-bregenz'].includes(p.id)))if(!saved.posts.some(x=>x.id===p.id))saved.posts.push(p);saved.extras_20261121=true;}return preparePresentation(saved);}
 const profiles=DEMO_PROFILES.map(p=>({...p,interests:[]}));
 if(legacy?.user?.name && legacy.user.name!=='Alex' && legacy.user.name!=='Profil 1')Object.assign(profiles[0],legacy.user,{id:'demo-you',role:'student'});
 const accounts=Object.fromEntries(profiles.map(p=>[p.id,emptyDemoAccount()]));
 accounts['demo-you'].invitations=[{id:'invite-coffee',post_id:'coffee',sender_id:'demo-oh',status:'pending'},{id:'invite-run',post_id:'run',sender_id:'demo-profile-2',status:'pending'}];
 if(legacy)Object.assign(accounts['demo-you'],{joined:legacy.joined||[],saved:legacy.saved||[],liked:legacy.liked||[],invitations:legacy.invitations||accounts['demo-you'].invitations});
 const samples=demoPosts();
 const custom=(legacy?.posts||[]).filter(p=>!samples.some(s=>s.id===p.id)||p.author_id==='demo-you').map(({author,...p})=>p);
 const posts=[...custom,...samples.filter(p=>!custom.some(c=>c.id===p.id)).map(({author,...p})=>p)];
 return preparePresentation({version:2,extras_20261121:true,profiles,accounts,posts,connections:[],comments:legacy?.comments||{},chats:(legacy?.chats||[]).map(c=>({...c,members:c.members||['demo-you',demoId(c.peer_id)].filter(Boolean)})),messages:legacy?.messages||{}});
}
export function demoPerson(world,id){return world.profiles.find(p=>p.id===demoId(id))||Object.values(PEOPLE).find(p=>p.id===id)||{id,name:'FHV member',color:'blue'};}
export function hydrateDemoPosts(world){return world.posts.map(p=>({...p,author_id:demoId(p.author_id),author:demoPerson(world,p.author_id),join_count:Object.values(world.accounts).filter(a=>a.joined.includes(p.id)).length,likes:Object.values(world.accounts).filter(a=>a.liked.includes(p.id)).length}));}
export function visibleDemoChats(chats,userId,joined,posts){return chats.filter(c=>c.post_id?(joined.includes(c.post_id)||posts.find(p=>p.id===c.post_id)?.author_id===userId):c.members?.includes(userId));}
