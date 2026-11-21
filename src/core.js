export const VALID_DOMAINS = new Set(['students.fhv.at', 'fhv.at']);
export const TYPES = { activity: 'Aktivität', trade: 'Tauschen & Verschenken', food: 'Essen teilen', help: 'Hilfe & Nachhilfe', life: 'Campusleben' };
export const CATEGORIES = ['Alle','Outdoor','Sport','Food','Kultur','Lernen','Campus'];
export function validEmail(value) { const email = String(value || '').trim().toLowerCase(); return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+$/.test(email) && VALID_DOMAINS.has(email.split('@')[1]); }
export function escapeHtml(value = '') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export const initials = name => String(name || '?').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
export function dateLabel(value, opts = {}) { if (!value) return 'Nach Vereinbarung'; return new Intl.DateTimeFormat('de-AT',{day:'numeric',month:'short',...opts}).format(new Date(value)); }
export function timeLabel(value) { return value ? new Intl.DateTimeFormat('de-AT',{hour:'2-digit',minute:'2-digit'}).format(new Date(value)) : ''; }
export function relative(value) { const min = Math.max(0,Math.floor((Date.now()-new Date(value))/60000)); return min<1?'gerade eben':min<60?`vor ${min} Min.`:min<1440?`vor ${Math.floor(min/60)} Std.`:`vor ${Math.floor(min/1440)} Tagen`; }
export function filterPosts(posts, { tab = 'feed', filter = 'Alle', query = '', activityTab = 'Entdecken', userId, joined = [], saved = [] } = {}) {
  const q = query.trim().toLocaleLowerCase('de');
  return posts.filter(p => {
    if (tab === 'activities' && p.type !== 'activity') return false;
    if (tab === 'trade' && !['trade','food','help'].includes(p.type)) return false;
    if (tab === 'activities' && activityTab === 'Meine Pläne' && !joined.includes(p.id) && p.author_id !== userId) return false;
    if (tab === 'saved' && !saved.includes(p.id)) return false;
    const mappings = {'Aktivitäten':'activity','Verschenken':'trade','Essen':'food','Hilfe':'help','Campusleben':'life'};
    if (filter !== 'Alle' && filter !== 'Für dich' && (mappings[filter] ? p.type !== mappings[filter] : p.category !== filter)) return false;
    return !q || [p.title,p.description,p.location,p.author?.name,p.category,TYPES[p.type]].join(' ').toLocaleLowerCase('de').includes(q);
  }).sort((a,b) => (tab === 'feed' ? Number(Boolean(b.pinned))-Number(Boolean(a.pinned)) : 0) || (tab === 'activities' ? new Date(a.starts_at)-new Date(b.starts_at) : new Date(b.created_at)-new Date(a.created_at)));
}
export function validatePost(input) {
  if (!TYPES[input.type]) return 'Wähle eine Beitragsart.';
  if (!input.title?.trim() || input.title.trim().length < 4) return 'Gib deinem Beitrag einen Titel mit mindestens 4 Zeichen.';
  if (input.title.length > 100) return 'Der Titel darf höchstens 100 Zeichen haben.';
  if (!input.description?.trim() || input.description.trim().length < 10) return 'Beschreibe deinen Beitrag mit mindestens 10 Zeichen.';
  if (input.description.length > 3000) return 'Die Beschreibung darf höchstens 3000 Zeichen haben.';
  if (!input.location?.trim()) return 'Wähle einen Treffpunkt.';
  if (input.type === 'activity' && (!input.starts_at || !Number.isFinite(new Date(input.starts_at).getTime()) || new Date(input.starts_at) <= new Date())) return 'Wähle ein Datum in der Zukunft.';
  if (input.capacity !== null && input.capacity !== undefined && (!Number.isInteger(Number(input.capacity)) || Number(input.capacity)<2 || Number(input.capacity)>500)) return 'Die Teilnehmerzahl muss zwischen 2 und 500 liegen.';
  if (input.price !== undefined && (!Number.isFinite(Number(input.price)) || Number(input.price)<0 || Number(input.price)>10000)) return 'Gib einen gültigen Preis zwischen 0 und 10.000 € ein.';
  return null;
}
export function makeICS(post) {
  const clean = text => String(text || '').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const stamp = d => new Date(d).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const start = new Date(post.starts_at), end = new Date(start.getTime()+2*3600000);
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//FHV Friends//Campus//DE','BEGIN:VEVENT',`UID:${clean(post.id)}@fhv-friends`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,`SUMMARY:${clean(post.title)}`,`DESCRIPTION:${clean(post.description)}`,`LOCATION:${clean(post.location)}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
}
export function readLocal(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
export function saveLocal(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
