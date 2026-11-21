import { DEMO_PROFILES, PEOPLE, demoPosts } from './data.js';
const aliases={'demo-lena':'demo-profile-2','demo-felix':'demo-profile-3','demo-sarah':'demo-profile-4','demo-jonas':'demo-you'};
export const demoId=id=>aliases[id]||id;
export function emptyDemoAccount(){return {joined:[],saved:[],liked:[],invitations:[]};}
export function createDemoWorld(saved=null,legacy=null){
 if(saved?.version===2 && Array.isArray(saved.profiles) && saved.profiles.length===4){saved.connections??=[];return saved;}
 const profiles=DEMO_PROFILES.map(p=>({...p,interests:[]}));
 if(legacy?.user?.name && legacy.user.name!=='Alex' && legacy.user.name!=='Profil 1')Object.assign(profiles[0],legacy.user,{id:'demo-you',role:'student'});
 const accounts=Object.fromEntries(profiles.map(p=>[p.id,emptyDemoAccount()]));
 accounts['demo-you'].invitations=[{id:'invite-coffee',post_id:'coffee',sender_id:'demo-oh',status:'pending'},{id:'invite-run',post_id:'run',sender_id:'demo-profile-2',status:'pending'}];
 if(legacy)Object.assign(accounts['demo-you'],{joined:legacy.joined||[],saved:legacy.saved||[],liked:legacy.liked||[],invitations:legacy.invitations||accounts['demo-you'].invitations});
 const samples=demoPosts();
 const custom=(legacy?.posts||[]).filter(p=>!samples.some(s=>s.id===p.id)||p.author_id==='demo-you').map(({author,...p})=>p);
 const posts=[...custom,...samples.filter(p=>!custom.some(c=>c.id===p.id)).map(({author,...p})=>p)];
 return {version:2,profiles,accounts,posts,connections:[],comments:legacy?.comments||{},chats:(legacy?.chats||[]).map(c=>({...c,members:c.members||['demo-you',demoId(c.peer_id)].filter(Boolean)})),messages:legacy?.messages||{}};
}
export function demoPerson(world,id){return world.profiles.find(p=>p.id===demoId(id))||Object.values(PEOPLE).find(p=>p.id===id)||{id,name:'Testprofil',color:'blue'};}
export function hydrateDemoPosts(world){return world.posts.map(p=>({...p,author_id:demoId(p.author_id),author:demoPerson(world,p.author_id),join_count:Object.values(world.accounts).filter(a=>a.joined.includes(p.id)).length,likes:Object.values(world.accounts).filter(a=>a.liked.includes(p.id)).length}));}
export function visibleDemoChats(chats,userId,joined,posts){return chats.filter(c=>c.post_id?(joined.includes(c.post_id)||posts.find(p=>p.id===c.post_id)?.author_id===userId):c.members?.includes(userId));}
