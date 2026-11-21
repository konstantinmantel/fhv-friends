const next = (days, hour=18, min=0) => { const d=new Date();d.setDate(d.getDate()+days);d.setHours(hour,min,0,0);return d.toISOString(); };
const ago = min => new Date(Date.now()-min*60000).toISOString();
export const DEMO_PROFILES = [
 {id:'demo-you',name:'Profil 1',course:'',bio:'',interests:[],color:'blue',role:'student',avatar_data:null},
 {id:'demo-profile-2',name:'Profil 2',course:'',bio:'',interests:[],color:'lavender',role:'student',avatar_data:null},
 {id:'demo-profile-3',name:'Profil 3',course:'',bio:'',interests:[],color:'green',role:'student',avatar_data:null},
 {id:'demo-profile-4',name:'Profil 4',course:'',bio:'',interests:[],color:'yellow',role:'student',avatar_data:null},
];
export const DEMO_USER = DEMO_PROFILES[0];
export const PEOPLE = {
 oh:{id:'demo-oh',name:'ÖH FHV',course:'Studierendenvertretung',color:'blue',role:'oh'},
 lena:DEMO_PROFILES[1],felix:DEMO_PROFILES[2],sarah:DEMO_PROFILES[3],jonas:DEMO_PROFILES[0],
};
const post=(id,author,type,title,description,extra={})=>({id,author_id:author.id,author,type,title,description,category:'Campus',location:'FHV Campus',created_at:ago(120),starts_at:null,capacity:null,price:0,pinned:false,status:'open',join_count:0,likes:0,example:true,...extra});
export function demoPosts(){return [
 post('coffee',PEOPLE.oh,'activity','Spieleabend im Café Campus','Am Dienstag sind wir ab 18 Uhr im Café Campus. Wir bringen ein paar Spiele mit. Ihr könnt auch einfach auf einen Kaffee vorbeikommen.',{starts_at:next(3),location:'Café Campus',capacity:20,pinned:true,created_at:ago(15)}),
 post('salad',PEOPLE.lena,'food','Couscous-Salat übrig','Hab zu viel gemacht. Eine Portion ist noch da, mit Feta und Gemüse. Könnt ihr bis 14 Uhr im Café abholen. Enthält Gluten und Milch.',{category:'Food',location:'Café Campus',created_at:ago(8)}),
 post('hike',PEOPLE.felix,'activity','Samstag auf den Karren?','Ich würde Samstag um 9 an der Talstation starten. Gemütlich hoch, oben was trinken. Hat wer Lust mitzukommen?',{category:'Outdoor',starts_at:next(7,9),location:'Talstation Karren',capacity:8,created_at:ago(22)}),
 post('lamp',PEOPLE.felix,'trade','Schreibtischlampe abzugeben','Ziehe um und brauche die Lampe nicht mehr. Funktioniert, warmes Licht. Kann ich morgen mit an die FHV bringen.',{location:'FHV Haupteingang',created_at:ago(24)}),
 post('run',PEOPLE.lena,'activity','Eine Runde an der Ach laufen','Bin Mittwoch vor der Vorlesung unterwegs, so 5 km in lockerem Tempo. Treffpunkt 7:30 am Haupteingang.',{category:'Sport',starts_at:next(4,7,30),location:'FHV Haupteingang',capacity:6,created_at:ago(45)}),
 post('math',PEOPLE.jonas,'help','Hilfe bei Mathe 1','Falls jemand bei Analysis oder linearer Algebra hängt: Ich kann mich am Donnerstag eine Stunde dazusetzen. Schreibt mir kurz, bei welcher Aufgabe.',{category:'Lernen',location:'Bibliothek',help_direction:'offer',created_at:ago(62)}),
 post('boulder',PEOPLE.sarah,'activity','Montag ins K1','Ich gehe Montag gegen 17:30 bouldern. Bin selbst noch nicht lange dabei. Falls wer mitkommen will, gern melden. Eintritt zahlt jede:r selbst.',{category:'Sport',starts_at:next(2,17,30),location:'K1 Dornbirn',capacity:6,created_at:ago(90)}),
 post('skis',PEOPLE.sarah,'trade','Skier, 170 cm – 45 €','Gut erhalten und frisch gewachst. Abholung am Campus nach Absprache. Bindung bitte vor dem Fahren einstellen lassen.',{category:'Outdoor',price:45,created_at:ago(180)}),
 post('study',PEOPLE.jonas,'activity','Sonntag in die Bib','Muss noch ein paar Übungsaufgaben fertigkriegen. Bin ab 14 Uhr in der Bibliothek, falls sich jemand dazusetzen möchte.',{category:'Lernen',starts_at:next(1,14),location:'Bibliothek',capacity:6,created_at:ago(190)}),
 post('tool',PEOPLE.felix,'help','Kann mir wer einen Akkuschrauber leihen?','Baue ein Regal für die WG auf. Bräuchte ihn nur für eine Stunde und bringe ihn danach direkt zurück.',{location:'FHV Campus',help_direction:'request',created_at:ago(230)}),
];}
export const SPOTS=[
 {name:'Café Campus',type:'Übergaben & Treffen',description:'Treffpunkt vorher im Chat absprechen.',icon:'coffee',tone:'blue'},
 {name:'FHV Haupteingang',type:'Übergaben & Aktivitäten',description:'Gut erreichbar, auch vor oder nach den Vorlesungen.',icon:'map',tone:'blue'},
 {name:'Bibliothek',type:'Nachhilfe & Lerngruppen',description:'Für gemeinsames Lernen. Bitte leise.',icon:'book',tone:'blue'},
];
