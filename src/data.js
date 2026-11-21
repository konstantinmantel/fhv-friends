const next = (days,hour=18,min=0) => { const d = new Date(); d.setDate(d.getDate()+days);d.setHours(hour,min,0,0);return d.toISOString(); };
const ago = mins => new Date(Date.now()-mins*60000).toISOString();
export const DEMO_USER = {id:'demo-you',name:'Alex',course:'Dein Studiengang',bio:'Hier, um neue Leute kennenzulernen und gemeinsam etwas zu erleben.',interests:['Outdoor','Kaffee','Sport'],color:'blue',role:'student'};
export const PEOPLE = {
  oh:{id:'demo-oh',name:'ÖH FHV',course:'Studierendenvertretung',color:'yellow',role:'oh'},
  lena:{id:'demo-lena',name:'Lena M.',course:'InterMedia · 3. Semester',color:'lavender',role:'student'},
  felix:{id:'demo-felix',name:'Felix K.',course:'Mechatronik · Master',color:'blue',role:'student'},
  sarah:{id:'demo-sarah',name:'Sarah B.',course:'Soziale Arbeit · 1. Semester',color:'coral',role:'student'},
  jonas:{id:'demo-jonas',name:'Jonas W.',course:'Informatik · 5. Semester',color:'green',role:'student'},
};
const post = (id,author,type,title,description,other={}) => ({id,author_id:author.id,author,type,title,description,category:'Campus',location:'FHV Campus · Dornbirn',created_at:ago(120),starts_at:null,capacity:null,price:0,pinned:false,status:'open',join_count:0,likes:0,...other});
export function demoPosts() { return [
  post('coffee',PEOPLE.oh,'activity','Neue Leute. Gleicher Campus.','Ein Kaffee, ein paar Brettspiele und vielleicht deine nächsten Lieblingsmenschen. Komm allein oder bring jemanden mit — wir freuen uns auf dich! Keine Anmeldung außerhalb der App nötig.',{category:'Campus',starts_at:next(3,18),location:'Café Campus · FHV',join_count:32,capacity:60,pinned:true,art:'coffee',created_at:ago(15),subtitle:'Campus coffee & board games'}),
  post('salad',PEOPLE.lena,'food','Ein Salat zu viel. Wer mag?','Frisch gemacht: Couscous, Gurke, Tomate und Feta. Eine extra Portion für dich. Enthält Gluten und Milch. Abholung heute im Café Campus, wir treffen uns persönlich.',{category:'Food',location:'Café Campus · FHV',created_at:ago(8),art:'salad',expires_at:next(0,20)}),
  post('hike',PEOPLE.felix,'activity','Kopf aus. Karren rauf.','Lust auf frische Luft nach einer langen Woche? Wir wandern entspannt auf den Karren. Keine Rekordzeiten, dafür gute Gespräche und eine schöne Aussicht. Feste Schuhe und Wasser mitbringen.',{category:'Outdoor',starts_at:next(7,9),location:'Talstation Karrenseilbahn',join_count:6,capacity:12,art:'mountain',created_at:ago(22),subtitle:'Ein Samstag über den Wolken'}),
  post('lamp',PEOPLE.felix,'trade','Mehr Licht für deine Nachtschicht.','Meine Schreibtischlampe sucht ein neues Zuhause. Funktioniert einwandfrei, warmes Licht, flexibel einstellbar. Ich ziehe um — du kannst sie kostenlos abholen.',{category:'Campus',location:'FHV · Haupteingang',created_at:ago(24),art:'lamp'}),
  post('run',PEOPLE.lena,'activity','Morning run, anyone?','Eine lockere Runde an der Dornbirner Ach. Etwa 5 km, entspanntes Tempo. Danach gibt’s bei Bedarf Kaffee. Egal ob Laufschuh-Profi oder erste Runde: komm mit!',{category:'Sport',starts_at:next(4,7,30),location:'FHV · Haupteingang',join_count:4,capacity:10,art:'run',created_at:ago(45)}),
  post('math',PEOPLE.jonas,'help','Mathe wird zusammen einfacher.','Ich helfe dir bei Analysis, linearer Algebra und den Grundlagen in MATLAB. Bring deine Fragen mit — wir arbeiten gemeinsam an den Aufgaben. Erstes Kennenlernen kostenlos.',{category:'Lernen',location:'FHV · Bibliothek',created_at:ago(62),art:'math',price:0,help_direction:'offer'}),
  post('boulder',PEOPLE.sarah,'activity','Bouldern statt Bildschirm.','Eine entspannte Session in der K1 Kletterhalle. Auch ohne Erfahrung bist du willkommen! Eintritt und Leihschuhe bezahlst du direkt in der Halle.',{category:'Sport',starts_at:next(2,17,30),location:'K1 Kletterhalle · Dornbirn',join_count:5,capacity:8,created_at:ago(90),art:'boulder'}),
  post('skis',PEOPLE.sarah,'trade','Skier suchen Schnee. Und dich.','Allround-Skier, 170 cm, gut erhalten, frisch gewachst. Abholung nach Vereinbarung am Campus. Bindung bitte vor Benutzung im Fachgeschäft einstellen lassen.',{category:'Outdoor',location:'FHV Campus · Dornbirn',price:45,created_at:ago(180),art:'skis'}),
  post('study',PEOPLE.jonas,'activity','Zusammen endlich anfangen.','Laptop auf, Handy weg. Zwei konzentrierte Lernblöcke mit einer Kaffeepause dazwischen. Du bringst deinen Stoff mit, wir bringen uns gegenseitig in den Flow.',{category:'Lernen',starts_at:next(1,14),location:'FHV · Bibliothek',join_count:3,capacity:8,created_at:ago(190),art:'study'}),
  post('tool',PEOPLE.felix,'help','Hat jemand einen Akkuschrauber?','Für einen kleinen WG-Aufbau brauche ich für eine Stunde einen Akkuschrauber. Ich hole ihn ab und bringe ihn direkt danach zurück. Kaffee als Dankeschön inklusive!',{category:'Campus',location:'FHV Campus · Dornbirn',created_at:ago(230),help_direction:'request'}),
]; }
export const SPOTS = [
 {name:'Café Campus',type:'Treffen & Übergeben',description:'Ein Kaffee, ein kurzer Plausch, eine persönliche Übergabe.',icon:'coffee',tone:'blue'},
 {name:'FHV Haupteingang',type:'Treffen & Losziehen',description:'Gut zu finden. Ein unkomplizierter Start für gemeinsame Pläne.',icon:'map',tone:'yellow'},
 {name:'Bibliothek',type:'Lernen & Helfen',description:'Dein Treffpunkt für Lerngruppen und Nachhilfe. Bitte leise.',icon:'book',tone:'lavender'},
];
