export const VALID_DOMAINS = new Set(['students.fhv.at', 'fhv.at']);
export const TYPES = { activity: 'Activity', trade: 'Sell & give away', food: 'Share food', help: 'Help & tutoring', life: 'Campus life' };
export const CATEGORY_ALIASES = {Kultur:'Culture',Lernen:'Study',Mitfahren:'Rides'};
export const canonicalCategory = value => CATEGORY_ALIASES[value] || value;
export const databaseCategory = value => ({Culture:'Kultur',Study:'Lernen',Rides:'Mitfahren'})[value] || value;
export const CATEGORIES = ['All','Outdoor','Sport','Food','Culture','Study','Campus','Rides'];
export function validEmail(value) { const email = String(value || '').trim().toLowerCase(); return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+$/.test(email) && VALID_DOMAINS.has(email.split('@')[1]); }
export function escapeHtml(value = '') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export const initials = name => String(name || '?').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
export function dateLabel(value, opts = {}) { if (!value) return 'By arrangement'; return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',...opts}).format(new Date(value)); }
export function timeLabel(value) { return value ? new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit'}).format(new Date(value)) : ''; }
export function relative(value){const minutes=Math.max(0,Math.floor((Date.now()-new Date(value))/60000));return minutes<1?'just now':minutes<60?`${minutes}m ago`:minutes<1440?`${Math.floor(minutes/60)}h ago`:`${Math.floor(minutes/1440)}d ago`;}
export function filterPosts(posts, { tab = 'feed', filter = 'All', query = '', activityTab = 'Discover', userId, joined = [], saved = [] } = {}) {
  const q = query.trim().toLocaleLowerCase('en');
  return posts.filter(p => {
    if (tab === 'activities' && p.type !== 'activity') return false;
    if (tab === 'trade' && !['trade','food','help'].includes(p.type)) return false;
    if (tab === 'activities' && activityTab === 'My plans' && !joined.includes(p.id) && p.author_id !== userId) return false;
    if (tab === 'saved' && !saved.includes(p.id)) return false;
    if (filter === 'For sale') return p.type === 'trade' && Number(p.price)>0 && (!q || [p.title,p.description,p.location,p.author?.name].join(' ').toLowerCase().includes(q));
    if (filter === 'Free stuff' && (p.type !== 'trade' || Number(p.price)>0)) return false;
    const mappings = {'Activities':'activity','Free stuff':'trade','Food':'food','Help':'help','Campus life':'life'};
    if (filter !== 'All' && filter !== 'For you' && (mappings[filter] ? p.type !== mappings[filter] : p.category !== filter)) return false;
    return !q || [p.title,p.description,p.location,p.author?.name,p.category,TYPES[p.type]].join(' ').toLocaleLowerCase('en').includes(q);
  }).sort((a,b) => (tab === 'feed' ? Number(Boolean(b.pinned))-Number(Boolean(a.pinned)) : 0) || (tab === 'activities' ? new Date(a.starts_at)-new Date(b.starts_at) : new Date(b.created_at)-new Date(a.created_at)));
}
export function validatePost(input) {
  if (!TYPES[input.type]) return 'Choose a post type.';
  if (!input.title?.trim() || input.title.trim().length < 4) return 'Use a title with at least 4 characters.';
  if (input.title.length > 100) return 'Titles can be up to 100 characters.';
  if (!input.description?.trim() || input.description.trim().length < 10) return 'Use a description with at least 10 characters.';
  if (input.description.length > 3000) return 'Descriptions can be up to 3,000 characters.';
  if (!input.location?.trim()) return 'Enter a meeting point.';
  if (input.type === 'activity' && (!input.starts_at || !Number.isFinite(new Date(input.starts_at).getTime()) || new Date(input.starts_at) <= new Date())) return 'Choose a future date.';
  if (input.capacity !== null && input.capacity !== undefined && (!Number.isInteger(Number(input.capacity)) || Number(input.capacity)<(input.category==='Rides'?1:2) || Number(input.capacity)>500)) return 'Capacity must be between 2 and 500.';
  if(input.category==='Rides' && (input.type!=='activity' || !input.ride_destination?.trim() || input.ride_destination.length>150 || !Number.isInteger(Number(input.capacity)) || Number(input.capacity)<1 || Number(input.capacity)>8)) return 'For a ride, enter a destination and 1–8 available seats.';
  if (input.price !== undefined && (!Number.isFinite(Number(input.price)) || Number(input.price)<0 || Number(input.price)>10000)) return 'Enter a price between €0 and €10,000.';
  return null;
}
export function makeICS(post) {
  const clean = text => String(text || '').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const stamp = d => new Date(d).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const start = new Date(post.starts_at), end = new Date(start.getTime()+2*3600000);
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//FHV Friends//Campus//EN','BEGIN:VEVENT',`UID:${clean(post.id)}@fhv-friends`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,`SUMMARY:${clean(post.title)}`,`DESCRIPTION:${clean(post.description)}`,`LOCATION:${clean(post.location)}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
}
export function readLocal(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
export function saveLocal(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
export function safeImage(value,max=210000){return typeof value==='string'&&value.length<=max&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)?value:'';}
