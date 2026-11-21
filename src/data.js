const next = (days, hour=18, min=0) => { const d=new Date();d.setDate(d.getDate()+days);d.setHours(hour,min,0,0);return d.toISOString(); };
const ago = min => new Date(Date.now()-min*60000).toISOString();
export const DEMO_PROFILES = [
 {id:'demo-you',name:'Alex',course:'',bio:'',interests:[],color:'blue',role:'student',avatar_data:null},
 {id:'demo-profile-2',name:'Maya',course:'',bio:'',interests:[],color:'lavender',role:'student',avatar_data:null},
 {id:'demo-profile-3',name:'Sam',course:'',bio:'',interests:[],color:'green',role:'student',avatar_data:null},
 {id:'demo-profile-4',name:'Noah',course:'',bio:'',interests:[],color:'yellow',role:'student',avatar_data:null},
];
export const DEMO_USER = DEMO_PROFILES[0];
export const PEOPLE = {
 oh:{id:'demo-oh',name:'ÖH FHV',course:'Students’ union',color:'blue',role:'oh'},
 lena:DEMO_PROFILES[1],felix:DEMO_PROFILES[2],sarah:DEMO_PROFILES[3],jonas:DEMO_PROFILES[0],
};
const post=(id,author,type,title,description,extra={})=>({id,author_id:author.id,author,type,title,description,category:'Campus',location:'FHV Campus',created_at:ago(120),starts_at:null,capacity:null,price:0,pinned:false,status:'open',join_count:0,likes:0,example:true,...extra});
export function demoPosts(){return [
 post('beerpong',PEOPLE.lena,'activity','Beer pong night','Anyone up for a few rounds of beer pong? We can sort out cups, balls and a place in the group chat. Alcohol-free is welcome too.',{category:'Campus',starts_at:next(5,19),location:'Arrange meeting point in chat',capacity:16,created_at:ago(1)}),
 post('gluehwein',PEOPLE.sarah,'activity','Mulled wine after class','Fancy a mulled wine or a hot punch in Dornbirn after class? Let’s pick a meeting point in the chat.',{category:'Culture',starts_at:next(6,18),location:'Dornbirn · meeting point in chat',capacity:12,created_at:ago(2)}),
 post('ride-bregenz',PEOPLE.felix,'activity','Friday ride to Bregenz','Driving to Bregenz after class. I have three spare seats. Meet at the main entrance; message me if you want to come.',{category:'Rides',starts_at:next(6,16,30),location:'FHV main entrance',ride_destination:'Bregenz station',capacity:3,price:2.5,created_at:ago(3)}),
 post('coffee',PEOPLE.oh,'activity','Board games at Café Campus','We’re at Café Campus from 18:00 on Tuesday. Bring a game if you like, or just drop by for coffee.',{starts_at:next(3),location:'Café Campus',capacity:20,pinned:true,created_at:ago(15)}),
 post('salad',PEOPLE.lena,'food','Spare couscous salad','Made too much lunch. One portion left with feta and vegetables. Pickup at the café before 14:00. Contains gluten and milk.',{category:'Food',location:'Café Campus',created_at:ago(8)}),
 post('hike',PEOPLE.felix,'activity','Karren hike on Saturday?','Starting at the cable-car station at 09:00 on Saturday. Easy pace, then a drink at the top. Anyone joining?',{category:'Outdoor',starts_at:next(7,9),location:'Karren cable-car station',capacity:8,created_at:ago(22)}),
 post('lamp',PEOPLE.felix,'trade','Desk lamp looking for a home','Moving out and don’t need this lamp anymore. Works well, warm light. I can bring it to campus tomorrow.',{location:'FHV main entrance',created_at:ago(24)}),
 post('run',PEOPLE.lena,'activity','A run along the Ach','Going for an easy 5 km before class on Wednesday. Meet at the main entrance at 07:30.',{category:'Sport',starts_at:next(4,7,30),location:'FHV main entrance',capacity:6,created_at:ago(45)}),
 post('math',PEOPLE.jonas,'help','Help with Maths 1','If you’re stuck on calculus or linear algebra, I can sit down with you for an hour on Thursday. Send me the exercise first.',{category:'Study',location:'Library',help_direction:'offer',created_at:ago(62)}),
 post('boulder',PEOPLE.sarah,'activity','Bouldering at K1 on Monday','Heading to K1 around 17:30 on Monday. I’m still quite new to bouldering. Let me know if you want to join; everyone covers their own entry.',{category:'Sport',starts_at:next(2,17,30),location:'K1 Dornbirn',capacity:6,created_at:ago(90)}),
 post('skis',PEOPLE.sarah,'trade','170 cm skis · €45','Good condition and freshly waxed. Campus pickup by arrangement. Have the bindings checked before skiing.',{category:'Outdoor',price:45,created_at:ago(180)}),
 post('study',PEOPLE.jonas,'activity','Library session on Sunday','Still have a few exercises to finish. I’ll be in the library from 14:00 on Sunday if anyone wants to join.',{category:'Study',starts_at:next(1,14),location:'Library',capacity:6,created_at:ago(190)}),
 post('tool',PEOPLE.felix,'help','Could I borrow a cordless drill?','Putting together a shelf for our flat. Would only need it for an hour and will bring it straight back.',{location:'FHV Campus',help_direction:'request',created_at:ago(230)}),
];}
export const SPOTS=[
 {name:'Café Campus',type:'Handovers & meetups',description:'Arrange the meeting point in the chat.',icon:'coffee',tone:'blue'},
 {name:'FHV main entrance',type:'Handovers & activities',description:'Easy to meet before or after class.',icon:'map',tone:'blue'},
 {name:'Library',type:'Tutoring & study groups',description:'Für gemeinsames Study. Bitte leise.',icon:'book',tone:'blue'},
];
