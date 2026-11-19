(function(){
'use strict';

/* ================= helpers ================= */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd=n=>Math.floor(Math.random()*n);
const pick=a=>a[rnd(a.length)];
const pad2=n=>String(n).padStart(2,'0');
const dayKey=(d=new Date())=>d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
const WD=['So','Mo','Di','Mi','Do','Fr','Sa'];
const MI='−';

/* ================= icons ================= */
const ICONS={
  radio:'<rect x="14" y="14" width="20" height="28" rx="4"/><path d="M20 14V5M19 22h10M19 28h10"/><circle cx="24" cy="35" r="2.2"/>',
  speaker:'<path d="M8 19h7l9-7v24l-9-7H8z"/><path d="M31 18a8 8 0 0 1 0 12M35.5 13.5a15 15 0 0 1 0 21"/>',
  mute:'<path d="M8 19h7l9-7v24l-9-7H8z"/><path d="M32 19l10 10M42 19L32 29"/>',
  bulb:'<path d="M18 35h12M19.5 40h9M24 6a12 12 0 0 0-7.2 21.6c1.3 1 2.2 2.4 2.2 4V35h10v-3.4c0-1.6.9-3 2.2-4A12 12 0 0 0 24 6z"/>',
  back:'<path d="M29 10L15 24l14 14"/>',
  close:'<path d="M13 13l22 22M35 13L13 35"/>',
  lock:'<rect x="11" y="21" width="26" height="20" rx="4"/><path d="M16 21v-5a8 8 0 0 1 16 0v5"/>',
  check:'<path d="M10 25l9 9 19-20"/>',
  del:'<path d="M18 12h20a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H18L6 24z"/><path d="M23 19l10 10M33 19L23 29"/>',
  play:'<path d="M17 11l20 13-20 13z"/>',
  car:'<path d="M9 29l4-10c1-3 3-4 6-4h10c3 0 5 1 6 4l4 10"/><rect x="5" y="28" width="38" height="10" rx="3"/><circle cx="14" cy="40" r="3"/><circle cx="34" cy="40" r="3"/>',
  parent:'<circle cx="17" cy="15" r="6"/><path d="M5 40c1-8 5.5-12 12-12s11 4 12 12"/><circle cx="34" cy="21" r="4.5"/><path d="M28 40c.5-6 3-9 6-9s6 3 7 9"/>'
};
const icon=(n,cls='')=>`<svg viewBox="0 0 48 48" class="ic ${cls}" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
const DICON={
  herz:'<path d="M24 41s-16-9.5-16-21a8.5 8.5 0 0 1 16-4 8.5 8.5 0 0 1 16 4c0 11.5-16 21-16 21z"/>',
  bruecke:'<path d="M4 30h40M8 30v11M40 30v11M8 30c6-15 26-15 32 0M16 23v7M24 20v10M32 23v7"/>',
  tunnel:'<path d="M4 41h40M6 41c0-19 8-29 18-29s18 10 18 29"/><path d="M15 41v-8a9 9 0 0 1 18 0v8"/>',
  familie:'<path d="M7 22L24 8l17 14"/><path d="M11 19v22h26V19M20 41V31h8v10"/>',
  tower:'<path d="M17 44V6h22v38M8 44h36M23 12h10M23 18h10M23 24h10M23 30h10"/><path d="M8 44V24h9"/>',
  flug:'<rect x="10" y="8" width="28" height="26" rx="5"/><path d="M10 22h28M16 34l-5 8M32 34l5 8M18 15h12"/><circle cx="17" cy="28" r="1.6"/><circle cx="31" cy="28" r="1.6"/>',
  hq:'<path d="M24 14v30M16 44l8-26 8 26M18 35h12"/><path d="M15 12a12 12 0 0 1 18 0M10 7a19 19 0 0 1 28 0"/>',
  garage:'<path d="M6 21L24 9l18 12v21H6z"/><path d="M12 42V27h24v15M12 32h24M12 37h24"/>'
};
const dIcon=id=>`<svg viewBox="0 0 48 48" class="dicon" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${DICON[id]}</svg>`;
const STAR='<svg viewBox="0 0 24 24" class="star" aria-hidden="true"><path d="M12 2.6l2.85 5.95 6.55.85-4.8 4.5 1.25 6.5L12 17.2l-5.85 3.2 1.25-6.5-4.8-4.5 6.55-.85z"/></svg>';
const starOn=on=>STAR.replace('class="star"',`class="star${on?' on':''}"`);
const COIN='<svg viewBox="0 0 32 32" class="coin" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="var(--coin)" stroke="var(--coin-edge)" stroke-width="2"/><circle cx="16" cy="16" r="9.5" fill="none" stroke="var(--coin-edge)" stroke-width="1.5" opacity=".55"/><path d="M12 11h8l-8 10h8" fill="none" stroke="var(--coin-edge)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const HEART='<svg viewBox="0 0 48 48" class="heart" aria-hidden="true"><path d="M24 43s-18-10.5-18-23a9.5 9.5 0 0 1 18-4.5 9.5 9.5 0 0 1 18 4.5c0 12.5-18 23-18 23z"/></svg>';
const FLAG=(()=>{let s='<svg viewBox="0 0 30 40" aria-hidden="true"><rect x="2" y="2" width="3" height="37" rx="1.5" class="flagpole"/>';for(let r=0;r<3;r++)for(let c=0;c<4;c++)s+=`<rect x="${5+c*6}" y="${3+r*6}" width="6" height="6" class="${(r+c)%2?'fb':'fw'}"/>`;return s+'</svg>';})();

/* ================= vehicles ================= */
const W=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" class="v-tire"/><circle cx="${x}" cy="${y}" r="${(r*.52).toFixed(1)}" class="v-rim"/><circle cx="${x}" cy="${y}" r="${(r*.18).toFixed(1)}" class="v-hub"/>`;
const SH=(cx,rx,cy=85)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="3.5" class="v-shadow"/>`;
const VSVG={
  jeep:SH(82,66)+'<circle cx="14" cy="52" r="10" class="v-tire"/><circle cx="14" cy="52" r="5" class="v2"/>'+
    '<path class="v1 v-o" d="M17 66V48q0-5 5-5h116q8 0 10 9l1 14z"/>'+
    '<path class="v-line" d="M44 43V26q0-4 4-4h26q4 0 4 4v17"/><rect x="52" y="35" width="20" height="8" rx="2" class="v-dark"/>'+
    '<path class="v2 v-o" d="M98 43l6-22h5l-4 22z"/><rect x="112" y="48" width="24" height="3" rx="1.5" class="v2"/>'+
    '<circle cx="144" cy="50" r="3.2" class="v-light"/><rect x="141" y="60" width="12" height="6" rx="2" class="v-dark"/>'+
    '<path class="v-dark" d="M24 66a17 17 0 0 1 34 0z"/><path class="v-dark" d="M104 66a17 17 0 0 1 34 0z"/>'+W(41,68,14)+W(121,68,14),
  quad:SH(80,62)+'<path class="v2 v-o" d="M58 52h48l-6 9H64z"/>'+
    '<path class="v1 v-o" d="M14 57q2-19 24-19 18 0 24 12h38q6-12 22-12 20 0 24 19z"/>'+
    '<rect x="62" y="38" width="36" height="9" rx="4.5" class="v-dark v-o"/><path class="v-line" d="M104 46l8-20m-6 0h14"/>'+
    '<circle cx="141" cy="47" r="3.5" class="v-light"/>'+W(38,67,17)+W(122,67,17),
  monster:SH(81,72,86)+'<rect x="35" y="40" width="9" height="20" rx="2" class="v-dark"/><rect x="117" y="40" width="9" height="20" rx="2" class="v-dark"/>'+
    '<path class="v1 v-o" d="M10 46V31q0-2 2-2h48l10-17h34l12 17h28q8 0 8 8v9z"/>'+
    '<path class="v-glass v-o" d="M74 16h12v13H67z"/><path class="v-glass v-o" d="M91 16h11l8 13H91z"/>'+
    '<rect x="12" y="37" width="140" height="4" class="v2"/><circle cx="148" cy="33" r="3" class="v-light"/>'+
    W(40,64,21)+'<circle cx="40" cy="64" r="19" class="v-tread"/>'+W(122,64,21)+'<circle cx="122" cy="64" r="19" class="v-tread"/>',
  truck:SH(80,72)+'<rect x="10" y="44" width="100" height="18" rx="2" class="v1 v-o"/>'+
    '<path class="v2 v-o" d="M12 44V22q0-10 10-10h76q10 0 10 10v22z"/><path class="v-rib" d="M36 13v31M60 12v32M84 13v31"/>'+
    '<path class="v1 v-o" d="M112 64V30q0-6 6-6h16l14 18v22z"/><path class="v-glass v-o" d="M119 29h13l9 12h-22z"/>'+
    '<rect x="143" y="48" width="7" height="5" rx="2" class="v-light"/><rect x="144" y="58" width="10" height="7" rx="2" class="v-dark"/>'+
    W(30,68,11)+W(56,68,11)+W(130,68,11),
  armored:SH(80,72)+'<path class="v1 v-o" d="M8 62l4-20 22-12h72l28 6 18 16-2 10z"/>'+
    '<ellipse cx="40" cy="47" rx="11" ry="5.5" class="v2"/><ellipse cx="76" cy="40" rx="10" ry="4.5" class="v2"/><ellipse cx="98" cy="53" rx="12" ry="4.5" class="v2"/><ellipse cx="128" cy="46" rx="6" ry="3.5" class="v2"/>'+
    '<path class="v-glass v-o" d="M114 38l16 3 10 9-20-2z"/><rect x="54" y="24" width="24" height="7" rx="3" class="v2 v-o"/>'+
    '<circle cx="94" cy="26" r="5" class="v-light v-o"/><path class="v-line" style="stroke-width:2" d="M30 31L22 8"/><circle cx="22" cy="8" r="2.5" class="v-red"/>'+
    '<path class="v-rib" d="M14 56h132"/>'+W(34,66,12)+W(72,66,12)+W(124,66,12),
  heli:SH(96,44,87)+'<path class="v1 v-o" d="M64 35L22 38v5l42 4z"/><path class="v1 v-o" d="M13 22h8l7 19-10 2z"/>'+
    '<circle cx="17" cy="27" r="9" class="v-blur rotor"/>'+
    '<path class="v1 v-o" d="M58 47q2-23 32-23h18q30 2 34 22 2 14-10 14H72q-14 0-14-13z"/>'+
    '<path class="v-glass v-o" d="M110 28q24 3 29 17h-29z"/><rect x="82" y="32" width="20" height="11" rx="3" class="v-glass v-o"/>'+
    '<rect x="60" y="48" width="80" height="5" class="v2"/><rect x="92" y="16" width="7" height="9" class="v-dark"/><circle cx="112" cy="24" r="2.6" class="v-red"/>'+
    '<path class="v-line" d="M84 60l-2 14m40-14l2 14M68 74h72q6 0 8-5"/>'+
    '<rect x="30" y="12" width="130" height="4" rx="2" class="v-dark rotor"/>',
  chinook:SH(82,60,87)+'<path class="v1 v-o" d="M10 26l4-14h24l5 14z"/>'+
    '<path class="v1 v-o" d="M12 34q0-8 10-8h104q20 0 26 18 2 16-12 16H22q-10 0-10-9z"/>'+
    '<rect x="118" y="17" width="14" height="10" rx="2" class="v1 v-o"/><path class="v-glass v-o" d="M132 30q14 3 18 14h-18z"/>'+
    '<g class="v-glass"><circle cx="38" cy="39" r="3.6"/><circle cx="52" cy="39" r="3.6"/><circle cx="66" cy="39" r="3.6"/><circle cx="80" cy="39" r="3.6"/><circle cx="94" cy="39" r="3.6"/><circle cx="108" cy="39" r="3.6"/></g>'+
    '<rect x="14" y="48" width="134" height="4" class="v2"/><path class="v-line" d="M38 60v4m88-4v4"/>'+W(38,68,5.5)+W(126,68,5.5)+
    '<rect x="0" y="7" width="54" height="4" rx="2" class="v-dark rotor"/><rect x="98" y="13" width="58" height="4" rx="2" class="v-dark rotor"/>',
  jet:SH(84,52,88)+'<path class="flame" d="M11 45L0 48l11 3z"/><path class="v2 v-o" d="M16 44l8-30h12l10 27z"/>'+
    '<path class="v1 v-o" d="M11 45l23-5h84q22 0 38 8-16 7-38 7H34l-23-4z"/><path class="v-glass v-o" d="M104 41q10-11 32 1z"/>'+
    '<path class="v2 v-o" d="M60 53h38L74 68H56z"/><path class="v2 v-o" d="M14 50h26l-10 8H16z"/>'+
    '<rect x="84" y="45" width="16" height="5" rx="1" class="v-dark"/><rect x="44" y="45" width="30" height="2.5" rx="1" class="v-white"/>',
  stealth:SH(82,52,88)+'<path class="flame" d="M8 49L0 51l8 3z"/><path class="v2 v-o" d="M18 47l10-29h14l4 26z"/>'+
    '<path class="v1 v-o" d="M6 50l32-9 58-5 60 12-56 7-60 2z"/><path class="v-facet" d="M38 41l62 6 56 1"/>'+
    '<path class="v-canopy v-o" d="M100 39l24 2-6 4-20-1z"/><path class="v2 v-o" d="M50 55h56L72 68l-18-2z"/>'
};
const BSVG={
  helipad:'<ellipse cx="80" cy="60" rx="68" ry="24" class="v-dark"/><ellipse cx="80" cy="58" rx="56" ry="18" fill="none" stroke="#ffc83d" stroke-width="3"/><path d="M66 49v19M94 49v19M66 58.5h28" stroke="#f6f3ea" stroke-width="6" stroke-linecap="round" fill="none"/>',
  hangar:'<path class="b-hangar v-o" d="M12 80V48Q80 0 148 48v32z"/><path class="v-dark" d="M44 80V50h72v30z"/><path class="v-rib" style="opacity:.55" d="M44 60h72M44 70h72"/><path class="v-line" style="stroke-width:2" d="M30 37Q80 7 130 37"/>'
};
const vehSVG=id=>`<svg viewBox="0 0 160 90" class="veh" aria-hidden="true">${VSVG[id]}</svg>`;
const bldSVG=id=>`<svg viewBox="0 0 160 90" class="veh" aria-hidden="true">${BSVG[id]}</svg>`;

const VEHICLES=[
  {id:'jeep',name:'Gelände-Jeep',cat:'boden',price:0,c1:'#6f8340',c2:'#4c5a2b',desc:'Dein erstes Fahrzeug. Fährt überall hin.'},
  {id:'quad',name:'Wüsten-Quad',cat:'boden',price:60,c1:'#e39b32',c2:'#3a3f4a',desc:'Klein, schnell und wendig.'},
  {id:'monster',name:'Monstertruck',cat:'boden',price:150,c1:'#d63b2f',c2:'#ffc83d',desc:'Riesenräder für jedes Gelände.'},
  {id:'truck',name:'Transport-Laster',cat:'boden',price:250,c1:'#5f7036',c2:'#a9a66e',desc:'Sechs Räder und viel Platz für Kisten.'},
  {id:'armored',name:'Panzerwagen',cat:'boden',price:400,c1:'#8f8757',c2:'#5d5a36',desc:'Gepanzert, sechs Räder, Suchscheinwerfer.'},
  {id:'heli',name:'Rettungs-Hubschrauber',cat:'luft',price:450,needs:'helipad',c1:'#d9443a',c2:'#f4f6f8',desc:'Fliegt zu jedem Einsatz in der Stadt.'},
  {id:'chinook',name:'Transport-Hubschrauber',cat:'luft',price:700,needs:'helipad',c1:'#5f7036',c2:'#3f4a24',desc:'Zwei Rotoren und ein riesiger Laderaum.'},
  {id:'jet',name:'Düsenjet',cat:'luft',price:1000,needs:'hangar',c1:'#8d9aab',c2:'#5b697b',desc:'Schneller als der Schall.'},
  {id:'stealth',name:'Tarnkappen-Jet',cat:'luft',price:1600,needs:'hangar',c1:'#2e3442',c2:'#1a1e28',desc:'Am Nachthimmel fast unsichtbar.'}
];
const BUILDINGS=[
  {id:'helipad',name:'Hubschrauber-Landeplatz',short:'Landeplatz',price:300,desc:'Damit kannst du Hubschrauber kaufen.'},
  {id:'hangar',name:'Flugzeug-Hangar',short:'Hangar',price:800,desc:'Damit kannst du Jets kaufen.'}
];
const PAINTS=[
  {id:'std',name:'Original',price:0},
  {id:'sand',name:'Wüste',price:80,c1:'#c9a86a',c2:'#8a7043'},
  {id:'night',name:'Nacht',price:150,c1:'#30343f',c2:'#15181f'},
  {id:'arctic',name:'Arktis',price:150,c1:'#e7edf2',c2:'#97a8b9'},
  {id:'neon',name:'Neon',price:250,c1:'#ff3f86',c2:'#6c2bd9'},
  {id:'gold',name:'Gold',price:900,c1:'#e8b830',c2:'#9a7212'}
];
const VEH=Object.fromEntries(VEHICLES.map(v=>[v.id,v]));
const BLD=Object.fromEntries(BUILDINGS.map(b=>[b.id,b]));
const PNT=Object.fromEntries(PAINTS.map(p=>[p.id,p]));

/* ================= districts ================= */
const DISTRICTS=[
  {id:'herz',name:'Herzhafen',skill:'Verliebte Zahlen',missions:[
    {title:'Laster voll machen',desc:'Lade Kisten auf, bis 10 auf dem Laster sind.',gen:'pairFrame'},
    {title:'Verliebte Zahlen',desc:'Finde den Partner. Zusammen sind sie immer 10.',gen:'pairLove'},
    {title:'Herz-Mix',desc:'Plus und Minus mit der 10.',gen:'pairMix'}]},
  {id:'bruecke',name:'Zehnerbrücke',skill:'Plus über die 10',missions:[
    {title:'Kisten laden',desc:'Erst Laster 1 bis 10 voll machen, der Rest kommt auf Laster 2.',gen:'addGuided'},
    {title:'Rechenweg selbst',desc:'Schreib den Rechenweg wie in der Schule: 8 + 2 + 7 = 17.',gen:'addPath'},
    {title:'Profi-Lader',desc:'Im Kopf rechnen. Der Tipp zeigt dir den Rechenweg.',gen:'addPro'}]},
  {id:'tunnel',name:'Zehnertunnel',skill:'Minus über die 10',missions:[
    {title:'Kisten abladen',desc:'Erst Laster 2 leer machen, dann von Laster 1 abladen.',gen:'subGuided'},
    {title:'Rechenweg selbst',desc:'Schreib den Rechenweg wie in der Schule: 13 − 3 − 5 = 5.',gen:'subPath'},
    {title:'Profi-Ablader',desc:'Im Kopf rechnen. Der Tipp zeigt dir den Rechenweg.',gen:'subPro'}]},
  {id:'familie',name:'Lieferviertel',skill:'Aufgabenfamilien',missions:[
    {title:'Familien bis 10',desc:'Eine Ladung, vier Aufgaben: Aufgabe, Tauschaufgabe, zwei Umkehraufgaben.',gen:'famTo10'},
    {title:'Familien bis 20',desc:'Große Familien über die 10.',gen:'famTo20'},
    {title:'Familien-Detektiv',desc:'Eine Aufgabe ist bekannt. Finde den Rest der Familie!',gen:'famDetective'}]},
  {id:'tower',name:'Hochhausviertel',skill:'Analogieaufgaben',missions:[
    {title:'Plus mit vollem Laster',desc:'4 + 5 = 9, also ist 14 + 5 = 19.',gen:'anaPlus'},
    {title:'Minus mit vollem Laster',desc:'9 − 5 = 4, also ist 19 − 5 = 14.',gen:'anaMinus'},
    {title:'Viele volle Laster',desc:'4 + 5 = 9, also ist 64 + 5 = 69. Die vollen Laster bleiben stehen.',gen:'ana100'}]},
  {id:'flug',name:'Güterbahnhof 100',skill:'Zahlenraum bis 100',missions:[
    {title:'Nur volle Laster',desc:'3 + 4 = 7, also ist 30 + 40 = 70.',gen:'tens'},
    {title:'Plus über den Zehner',desc:'38 + 5 = 38 + 2 + 3 = 43.',gen:'add100'},
    {title:'Minus über den Zehner',desc:'43 − 5 = 43 − 3 − 2 = 38.',gen:'sub100'}]}
];
const DIST=Object.fromEntries(DISTRICTS.map(d=>[d.id,d]));
const SEQ=[['herz',0],['bruecke',0],['tunnel',0],['bruecke',1],['herz',1],['tunnel',1],['familie',0],['bruecke',2],['tower',0],['tunnel',2],['herz',2],['familie',1],['tower',1],['flug',0],['familie',2],['tower',2],['flug',1],['flug',2]];

/* ================= state ================= */
const SAVE_KEY='zehnercity.save.v1';
function defaultState(){return{v:1,name:'',nameAsked:false,coins:0,owned:{jeep:1},buildings:{},paints:{std:1},active:'jeep',paintOf:{},missions:{},unlockedAll:false,facts:{},skill:{},days:{},settings:{sound:true,goalMin:10},totalTasks:0,updatedAt:0};}
function sanitize(s){
  const d=defaultState();
  if(!s||typeof s!=='object') return d;
  for(const k in d){ if(s[k]===undefined||s[k]===null) s[k]=d[k]; }
  for(const k of ['owned','buildings','paints','paintOf','missions','facts','skill','days']){ if(typeof s[k]!=='object') s[k]={}; }
  s.settings=Object.assign(d.settings,typeof s.settings==='object'?s.settings:{});
  s.owned.jeep=1; s.paints.std=1;
  if(!VEH[s.active]||!s.owned[s.active]) s.active='jeep';
  if(typeof s.coins!=='number'||!isFinite(s.coins)) s.coins=0;
  if(typeof s.name!=='string') s.name='';
  s.name=s.name.trim().slice(0,20);
  if(s.name) s.nameAsked=true;
  const cutoff=Date.now()-120*864e5;
  for(const k of Object.keys(s.days)){ const t=Date.parse(k); if(isFinite(t)&&t<cutoff) delete s.days[k]; }
  return s;
}
let state=defaultState();
try{ const raw=localStorage.getItem(SAVE_KEY); if(raw) state=sanitize(JSON.parse(raw)); }catch(e){}
function persistLocal(){ try{ localStorage.setItem(SAVE_KEY,JSON.stringify(state)); }catch(e){} }
function save(important){ state.updatedAt=Date.now(); persistLocal(); if(important) Cloud.schedule(); }
function day(){ const k=dayKey(); if(!state.days[k]) state.days[k]={sec:0,tasks:0,goal:0,hq:0}; return state.days[k]; }

/* Optional backup in the viewer's own Claude account (private per viewer). Falls back to this device only. */
const Cloud={ref:null,status:'local',writing:false,again:false,timer:null,fails:0,
  async init(){
    try{
      if(!window.claude||typeof window.claude.use!=='function') return;
      const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);
      if(!db||!user) return;
      const uid=await user.id(); if(!uid) return;
      const ref=db.doc('data/users/'+uid+'/save');
      const snap=await ref.get();
      this.ref=ref; this.status='cloud';
      let remote=null;
      if(snap.exists){ const d=snap.data(); try{ remote=d&&typeof d.json==='string'?JSON.parse(d.json):null; }catch(e){ remote=null; } }
      if(remote&&(remote.updatedAt||0)>(state.updatedAt||0)){
        if(current!=='mission'){ state=sanitize(remote); persistLocal(); rerender(); toast('Spielstand aus deinem Konto geladen.'); }
      } else if((state.updatedAt||0)>((remote&&remote.updatedAt)||0)) this.schedule();
      if(current==='parents') renderParents();
    }catch(e){ this.ref=null; this.status='local'; }
  },
  schedule(){ if(!this.ref) return; clearTimeout(this.timer); this.timer=setTimeout(()=>this.flush(),2500); },
  async flush(){
    if(!this.ref) return;
    if(this.writing){ this.again=true; return; }
    this.writing=true;
    try{ await this.ref.set({json:JSON.stringify(state),updatedAt:state.updatedAt||Date.now(),v:1}); this.fails=0; }
    catch(e){ const c=e&&e.code; if(c==='unavailable'&&this.fails<3){ this.fails++; this.again=true; } else if(c!=='resource_exhausted'){ this.ref=null; this.status='local'; } }
    finally{ this.writing=false; if(this.again){ this.again=false; this.schedule(); } }
  }
};

/* ================= sound & speech ================= */
const Sound={ctx:null,
  ensure(){ if(!state.settings.sound) return null; try{ if(!this.ctx){ const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return null; this.ctx=new AC(); } if(this.ctx.state==='suspended') this.ctx.resume(); return this.ctx; }catch(e){ return null; } },
  tone(f,st,dur,type,vol){ const c=this.ctx,o=c.createOscillator(),g=c.createGain(),t=c.currentTime+st; o.type=type||'sine'; o.frequency.value=f; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol||.14,t+.015); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+dur+.05); },
  play(n){ const c=this.ensure(); if(!c) return; try{ switch(n){
    case 'tap': this.tone(620,0,.05,'triangle',.05); break;
    case 'step': this.tone(784,0,.1,'triangle',.11); this.tone(1046,.07,.12,'triangle',.09); break;
    case 'ok': this.tone(660,0,.12,'triangle'); this.tone(990,.09,.2,'triangle'); break;
    case 'wrong': this.tone(260,0,.16,'sine',.1); this.tone(220,.12,.2,'sine',.08); break;
    case 'coin': [1318,1760].forEach((f,i)=>this.tone(f,i*.07,.12,'square',.04)); break;
    case 'win': [523,659,784,1047,1318].forEach((f,i)=>this.tone(f,i*.11,.24,'triangle',.12)); break;
    case 'thud': this.tone(150,0,.07,'sine',.09); this.tone(95,.015,.09,'sine',.08); break;
    case 'honk': this.tone(440,0,.09,'square',.05); this.tone(440,.13,.12,'square',.05); break;
    case 'start': [392,523,659,784].forEach((f,i)=>this.tone(f,i*.07,.14,'triangle',.1)); break;
    case 'buy': [392,523,659,784,1047].forEach((f,i)=>this.tone(f,i*.06,.16,'square',.045)); break;
  } }catch(e){} }
};
const Speech={ok:('speechSynthesis' in window)&&typeof window.SpeechSynthesisUtterance!=='undefined',
  say(text){ if(!this.ok||!text) return; try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(spoken(text)); u.lang='de-DE'; const v=speechSynthesis.getVoices().find(v=>/^de/i.test(v.lang)); if(v) u.voice=v; u.rate=.9; speechSynthesis.speak(u); }catch(e){} }
};
function spoken(t){ return String(t).replace(/□/g,' wie viel ').replace(/−/g,' minus ').replace(/\+/g,' plus ').replace(/=/g,' gleich ').replace(/\s+/g,' ').trim(); }

/* ================= task model ================= */
function task(rows,blanks,visual,extra){
  return Object.assign({rows,visual:visual||null,blanks:blanks.map(b=>Object.assign({val:null,wrong:0,h:0,revealed:false,hints:[]},b))},extra||{});
}

/* Bridging through a ten - the school's method: "erst bis zur 10, dann weiter".
   a + b: split b into r (to reach the ten T) and s (the rest): a + r + s.
   a - b: split b into r (back down to T) and s (the rest): a - r - s.          */
function buildBridge(p,op,mode){
  const a=p.a,b=p.b,add=op==='+';
  const T=add?Math.floor(a/10)*10+10:Math.floor(a/10)*10;
  const r=add?T-a:a-T, s=b-r, res=add?a+b:a-b;
  const small=T===10&&Math.max(a,res)<=20;
  const visual=small?{type:'frame20',a,b,op}:{type:'line',a,b,op,T};
  const look=small?'Schau auf die Laster.':'Schau auf den Zahlenstrahl.';
  const h0=add?[T===10?`Wer ist in die ${a} verliebt?`:`Einer: ${a%10} + □ = 10`,small?'Zähle die freien Plätze.':look]
              :[`${a} = ${T} + ${r}`,small?'Zähle die Kisten auf Laster 2.':look];
  const h1=[`${b} ${MI} ${r} = □`,small?(add?'Zähle die Kisten auf Laster 2.':'Zähle die wackelnden Kisten.'):look];
  const h2=add?[`${T} und noch ${s}.`,small?'Laster 1 hat 10. Dazu Laster 2.':look]
              :[T===10?`Wer ist in die ${s} verliebt?`:`10 ${MI} ${s} = ${10-s}`,small?'Zähle die Kisten, die bleiben.':look];
  if(mode==='pro'){
    visual.show='hint'; visual.byHint=true;
    return task([
      {big:1,tokens:[{n:a},op,{n:b},'=',{b:0}]},
      {label:'Rechenweg',minHint:1,tokens:[{n:a},op,{n:r,hint:1},op,{n:s,hint:2},'=',{n:res,hint:9}]}
    ],[{ans:res,prompt:add?`Über die ${T}!`:`Zurück über die ${T}!`,
        hints:[add?`Erst bis ${T}: ${a} + ${r} = ${T}`:`Erst bis ${T}: ${a} ${MI} ${r} = ${T}`,`Dann noch ${s}: ${T} ${op} ${s} = □`]}],visual,{kind:'bridge',sc:{type:add?'add':'sub',a,b}});
  }
  if(mode==='path'){
    visual.show='hint';
    return task([{long:1,tokens:[{n:a},op,{n:b},'=',{n:a},op,{b:0},op,{b:1},'=',{b:2}]}],[
      {ans:r,vis:0,prompt:add?`Erst bis zur ${T}.`:`Erst zurück bis zur ${T}.`,hints:h0},
      {ans:s,vis:1,prompt:`Jetzt der Rest von der ${b}.`,hints:h1},
      {ans:res,vis:2,prompt:'Und das Ergebnis?',hints:h2}
    ],visual,{kind:'bridge',sc:{type:add?'add':'sub',a,b}});
  }
  const ld=mode==='load';
  visual.show='always'; if(ld){ visual.noanim=1; visual.loaded=1; }
  return task([
    {goal:1,label:'Auftrag',tokens:[{n:a},op,{n:b},'=',{b:3}]},
    {step:0,tokens:[{n:a},op,{b:0},'=',{n:T}]},
    {step:1,tokens:[{n:b},'=',{n:r},'+',{b:1}]},
    {step:2,tokens:[{n:T},op,{n:s},'=',{b:2}]},
    {final:1,tokens:[{n:a},op,{n:r},op,{n:s},'=',{n:res}]}
  ],[
    {ans:r,vis:0,prompt:ld?(add?'Wie viele passten noch auf Laster 1?':'Wie viele hast du von Laster 2 abgeladen?'):(add?`Bis zur ${T}!`:`Zurück bis zur ${T}!`),hints:h0},
    {ans:s,vis:1,prompt:ld?(add?'Wie viele kamen auf Laster 2?':'Wie viele dann von Laster 1?'):`Zerlege die ${b}.`,hints:h1},
    {ans:res,vis:2,prompt:ld?(add?'Wie viele Kisten sind es zusammen?':'Wie viele Kisten sind noch da?'):'Jetzt weiter!',hints:h2},
    {ans:res,auto:true}
  ],visual,ld?{kind:'bridge',load:{mode:add?'add':'sub',a,b},sc:{type:add?'add':'sub',a,b}}:{kind:'bridge',sc:{type:add?'add':'sub',a,b}});
}

function buildPair(p,style){
  const n=p.n,k=10-n; let rows,blank,visual;
  const v10={type:'frame10',n,op:'+'};
  if(style==='load'){
    rows=[{big:1,tokens:[{n},'+',{b:0},'=',{n:10}]}];
    blank={ans:k,prompt:'Wie viele Kisten hast du aufgeladen?',hints:['Zähle die blauen Kisten.',`${n} + □ = 10`]};
    return task(rows,[blank],{type:'frame10',n,op:'+',show:'always',fixed:1,noanim:1,loaded:1},{kind:'pair',load:{mode:'fill',n},sc:{type:'pair',op:'+',n}});
  }
  if(style==='frame'){
    rows=[{big:1,tokens:[{n},'+',{b:0},'=',{n:10}]}];
    blank={ans:k,prompt:'Wie viele Kisten passen noch drauf?',hints:['Zähle die freien Plätze.',`${n} + □ = 10`]};
    visual=Object.assign({},v10,{show:'always'});
  } else if(style==='love'){
    rows=[{big:1,tokens:[{n,heart:1},'+',{b:0},'=',{n:10}]}];
    blank={ans:k,prompt:`Wer ist in die ${n} verliebt?`,hints:['Zusammen sind sie 10.','Zähle die freien Plätze.']};
    visual=Object.assign({},v10,{show:'hint'});
  } else {
    const f=p.f;
    if(f===0){ rows=[{big:1,tokens:[{n},'+',{b:0},'=',{n:10}]}]; blank={ans:k,prompt:'Ergänze bis 10.'}; visual=Object.assign({},v10,{show:'hint'}); }
    else if(f===1){ rows=[{big:1,tokens:[{b:0},'+',{n},'=',{n:10}]}]; blank={ans:k,prompt:'Welche Zahl fehlt?'}; visual=Object.assign({},v10,{show:'hint'}); }
    else if(f===2){ rows=[{big:1,tokens:[{n:10},MI,{n},'=',{b:0}]}]; blank={ans:k,prompt:`Lade ${n} Kisten ab.`}; visual={type:'frame10',n,op:MI,show:'hint'}; }
    else { rows=[{big:1,tokens:[{n:10},MI,{b:0},'=',{n}]}]; blank={ans:k,prompt:`Wie viele abladen, damit ${n} bleiben?`}; visual={type:'frame10',n:k,op:MI,show:'hint'}; }
    blank.hints=[`Wer ist in die ${n} verliebt?`,'Schau auf den Laster.'];
  }
  const sc=style==='mix'&&p.f===2?{type:'pair',op:'−',take:n,f:2}:style==='mix'&&p.f===3?{type:'pair',op:'−',take:k,f:3}:{type:'pair',op:'+',n};
  return task(rows,[blank],visual,{kind:'pair',sc});
}

function buildFam(p,mode){
  const a=p.a,b=p.b,c=a+b,H={type:'house',a,b,c};
  if(mode==='basic'){
    const sumHints=c>10?[`Erst bis 10: ${a} + ${10-a} = 10`,`Dann noch ${b-(10-a)}: 10 + ${b-(10-a)} = □`]:[`Zähle von ${a} aus ${b} weiter.`,'Schau auf den Laster.'];
    const fv=c>10?{type:'frame20',a,b,op:'+',show:'hint',byHint:true}:{type:'frame20',a,b,op:'+',show:'hint',fixed:2};
    return task([
      {label:'Aufgabe',tokens:[{n:a},'+',{n:b},'=',{b:0}]},
      {label:'Tauschaufgabe',tokens:[{n:b},'+',{n:a},'=',{b:1}]},
      {label:'Umkehraufgabe',tokens:[{n:c},MI,{n:b},'=',{b:2}]},
      {label:'Umkehraufgabe',tokens:[{n:c},MI,{n:a},'=',{b:3}]}
    ],[
      {ans:c,vis:0,prompt:`Rechne: ${a} + ${b}`,hints:sumHints,visual:fv},
      {ans:c,vis:1,prompt:'Tauschaufgabe!',hints:['Tauschen ändert das Ergebnis nicht.',`Schau oben: ${a} + ${b} = ${c}`]},
      {ans:a,vis:1,prompt:'Umkehraufgabe!',hints:[`Nimm von ${c} die ${b} weg.`,'Welche Zahl im Haus bleibt übrig?']},
      {ans:b,vis:1,prompt:'Noch eine Umkehraufgabe!',hints:[`Nimm von ${c} die ${a} weg.`,'Welche Zahl im Haus bleibt übrig?']}
    ],Object.assign({},H,{show:'always'}),{kind:'fam',side:true,sc:{type:'fam',a,b,mode:'basic'}});
  }
  return task([
    {label:'Bekannt',known:1,tokens:[{n:a},'+',{n:b},'=',{n:c}]},
    {label:'Tauschaufgabe',tokens:[{n:b},'+',{n:a},'=',{b:0}]},
    {label:'Umkehraufgabe',tokens:[{n:c},MI,{n:b},'=',{b:1}]},
    {label:'Umkehraufgabe',tokens:[{n:c},MI,{b:2},'=',{n:a}]}
  ],[
    {ans:c,prompt:'Tauschaufgabe!',hints:['Tauschen ändert das Ergebnis nicht.',`Schau oben: ${a} + ${b} = ${c}`]},
    {ans:a,prompt:'Umkehraufgabe!',hints:[`Die Familie: ${a}, ${b} und ${c}.`,'Welche Zahl im Haus bleibt übrig?']},
    {ans:b,prompt:'Welche Zahl fehlt?',hints:[`Was nimmst du von ${c} weg, damit ${a} bleibt?`,'Schau ins Zahlenhaus.']}
  ],Object.assign({},H,{show:'hint',fixed:1}),{kind:'fam',side:true,sc:{type:'fam',a,b,mode:'detective'}});
}

/* Analogy tasks: 4 + 5 = 9 -> 14 + 5 = 19 (full trucks are whole tens and just stay parked; only the loose crates change) */
function buildAna(p){
  const a=p.a,b=p.b,op=p.op,Ts=p.Ts,base=op==='+'?a+b:a-b;
  const rows=[{label:'Nur Kisten',tokens:[{n:a},op,{n:b},'=',{b:0}]}];
  const blanks=[{ans:base,prompt:'Erst nur die Kisten rechnen.',hints:[op==='+'?`Zähle von ${a} aus ${b} weiter.`:`Zähle von ${a} aus ${b} zurück.`,'Schau auf den Laster.'],visual:{type:'frame20',a,b,op,show:'hint',fixed:2}}];
  Ts.forEach((T,i)=>{
    const x=T+a,res=op==='+'?x+b:x-b,fl=T/10;
    rows.push({label:`+ ${fl} Laster`,tokens:[{n:x,ones:1},op,{n:b,ones:1},'=',{b:i+1}]});
    blanks.push({ans:res,prompt:fl===1?'Ein voller Laster mehr: + 10.':`${fl} volle Laster mehr: + ${T}.`,
      hints:[`Die Einer: ${a} ${op} ${b} = ${base}`,`${T} + ${base} = □`],visual:{type:'ze',x,b,op,show:'hint'}});
  });
  return task(rows,blanks,null,{kind:'ana',side:true,sc:{type:'ana',a,b,op,Ts}});
}

function buildTens(p){
  const a=p.a,b=p.b,op=p.op,base=op==='+'?a+b:a-b;
  return task([
    {label:'Einer',tokens:[{n:a},op,{n:b},'=',{b:0}]},
    {label:'Zehner',tokens:[{n:a*10},op,{n:b*10},'=',{b:1}]}
  ],[
    {ans:base,prompt:'Erst mit Einern.',hints:[op==='+'?`Zähle von ${a} aus ${b} weiter.`:`Zähle von ${a} aus ${b} zurück.`,'Schau auf den Laster.'],visual:{type:'frame20',a,b,op,show:'hint',fixed:2}},
    {ans:base*10,prompt:'Jetzt volle Laster: Jeder ist 10.',hints:[`${a} ${op} ${b} = ${base}`,`${base} Zehner = □`],visual:{type:'ze',x:a*10,b:b*10,op,show:'hint',tens:1}}
  ],null,{kind:'tens',side:true,sc:{type:'tens',a,b,op}});
}

/* ================= task pools ================= */
const POOLS={
  pair:()=>{const o=[];for(let n=1;n<=9;n++)o.push({n});return o;},
  pairMix:()=>{const o=[];for(let n=1;n<=9;n++)for(let f=0;f<4;f++)o.push({n,f});return o;},
  add20:()=>{const o=[];for(let a=4;a<=9;a++)for(let b=2;b<=9;b++)if(a+b>10)o.push({a,b});return o;},
  sub20:()=>{const o=[];for(let a=11;a<=18;a++)for(let b=2;b<=9;b++)if(b>a-10)o.push({a,b});return o;},
  fam10:()=>{const o=[];for(let c=3;c<=10;c++)for(let x=1;x<c-x;x++){const y=c-x;o.push(Math.random()<.5?{a:y,b:x}:{a:x,b:y});}return o;},
  fam20:()=>{const o=[];for(let x=3;x<=9;x++)for(let y=2;y<x;y++)if(x+y>10)o.push(Math.random()<.5?{a:x,b:y}:{a:y,b:x});return o;},
  anaPlus:()=>{const o=[];for(let a=1;a<=8;a++)for(let b=1;a+b<=9;b++)o.push({a,b,op:'+',Ts:[10]});return o;},
  anaMinus:()=>{const o=[];for(let a=2;a<=9;a++)for(let b=1;b<a;b++)o.push({a,b,op:MI,Ts:[10]});return o;},
  ana100:()=>{const o=[];for(let a=1;a<=8;a++)for(let b=1;a+b<=9;b++)o.push({a,b,op:'+',Ts:[10,(2+rnd(8))*10]});for(let a=2;a<=9;a++)for(let b=1;b<a;b++)o.push({a,b,op:MI,Ts:[10,(2+rnd(8))*10]});return o;},
  tens:()=>{const o=[];for(let a=1;a<=8;a++)for(let b=1;a+b<=9;b++)o.push({a,b,op:'+'});for(let a=2;a<=9;a++)for(let b=1;b<a;b++)o.push({a,b,op:MI});return o;},
  add100:()=>{const o=[];for(let t=1;t<=8;t++)for(let u=2;u<=9;u++)for(let b=2;b<=9;b++){const x=t*10+u;if(u+b>10&&x+b<=99)o.push({a:x,b});}return o;},
  sub100:()=>{const o=[];for(let t=2;t<=9;t++)for(let u=1;u<=8;u++)for(let b=2;b<=9;b++){const x=t*10+u;if(b>u&&x-b>=11)o.push({a:x,b});}return o;}
};
const opKey=op=>op==='+'?'+':'-';
const GEN={
  pairFrame:{n:5,pool:POOLS.pair,key:p=>'pair:'+p.n,build:p=>buildPair(p,'load')},
  pairLove:{n:6,pool:POOLS.pair,key:p=>'pair:'+p.n,build:p=>buildPair(p,'love')},
  pairMix:{n:6,pool:POOLS.pairMix,key:p=>'pair:'+p.n,build:p=>buildPair(p,'mix')},
  addGuided:{n:4,pool:POOLS.add20,key:p=>`add:${p.a}+${p.b}`,build:p=>buildBridge(p,'+','load')},
  addPath:{n:5,pool:POOLS.add20,key:p=>`add:${p.a}+${p.b}`,build:p=>buildBridge(p,'+','path')},
  addPro:{n:6,pool:POOLS.add20,key:p=>`add:${p.a}+${p.b}`,build:p=>buildBridge(p,'+','pro')},
  subGuided:{n:4,pool:POOLS.sub20,key:p=>`sub:${p.a}-${p.b}`,build:p=>buildBridge(p,MI,'load')},
  subPath:{n:5,pool:POOLS.sub20,key:p=>`sub:${p.a}-${p.b}`,build:p=>buildBridge(p,MI,'path')},
  subPro:{n:6,pool:POOLS.sub20,key:p=>`sub:${p.a}-${p.b}`,build:p=>buildBridge(p,MI,'pro')},
  famTo10:{n:3,pool:POOLS.fam10,key:p=>`fam:${Math.max(p.a,p.b)}+${Math.min(p.a,p.b)}`,build:p=>buildFam(p,'basic')},
  famTo20:{n:3,pool:POOLS.fam20,key:p=>`fam:${Math.max(p.a,p.b)}+${Math.min(p.a,p.b)}`,build:p=>buildFam(p,'basic')},
  famDetective:{n:4,pool:POOLS.fam20,key:p=>`fam:${Math.max(p.a,p.b)}+${Math.min(p.a,p.b)}`,build:p=>buildFam(p,'detective')},
  anaPlus:{n:5,pool:POOLS.anaPlus,key:p=>`ana:${p.a}+${p.b}`,build:buildAna},
  anaMinus:{n:5,pool:POOLS.anaMinus,key:p=>`ana:${p.a}-${p.b}`,build:buildAna},
  ana100:{n:4,pool:POOLS.ana100,key:p=>`ana:${p.a}${opKey(p.op)}${p.b}`,build:buildAna},
  tens:{n:5,pool:POOLS.tens,key:p=>`tens:${p.a}${opKey(p.op)}${p.b}`,build:buildTens},
  add100:{n:4,pool:POOLS.add100,key:p=>`add100:${p.a}+${p.b}`,build:p=>buildBridge(p,'+','path')},
  sub100:{n:4,pool:POOLS.sub100,key:p=>`sub100:${p.a}-${p.b}`,build:p=>buildBridge(p,MI,'path')}
};
/* Tasks that went wrong before come back more often (gentle spaced repetition). */
function sampleTasks(G,n,did,used){
  used=used||new Set();
  const items=G.pool().map(p=>({p,key:G.key(p)}));
  const weight=k=>{ const f=state.facts[k]; if(!f) return 1.6; return 1+4*(f.w/Math.max(1,f.n))+(f.n<2?.5:0); };
  const out=[];
  while(out.length<n){
    const ws=items.map(o=>used.has(o.key)?0:weight(o.key));
    const tot=ws.reduce((x,y)=>x+y,0); if(tot<=0) break;
    let r=Math.random()*tot,i=0;
    for(;i<ws.length;i++){ r-=ws[i]; if(r<=0&&ws[i]>0) break; }
    if(i>=ws.length) i=ws.findIndex(w=>w>0);
    const o=items[i]; used.add(o.key);
    const t=G.build(o.p); t.key=o.key; t.skill=did; out.push(t);
  }
  return out;
}
function genHQ(){
  const opts=[];const add=(did,mi,gen,w)=>{ if(missionUnlocked(did,mi)) opts.push({did,gen,w}); };
  add('herz',0,'pairMix',1); add('bruecke',0,'addPro',4); add('tunnel',0,'subPro',4); add('familie',0,'famDetective',1);
  add('tower',0,'anaPlus',1); add('tower',1,'anaMinus',1); add('flug',0,'tens',1); add('flug',1,'add100',1.5); add('flug',2,'sub100',1.5);
  const used=new Set(),out=[]; let guard=0;
  while(out.length<7&&guard++<60&&opts.length){
    const tot=opts.reduce((s,o)=>s+o.w,0); let r=Math.random()*tot,o=opts[0];
    for(const x of opts){ r-=x.w; if(r<=0){ o=x; break; } }
    const t=sampleTasks(GEN[o.gen],1,o.did,used); if(t.length) out.push(t[0]);
  }
  return out;
}

/* ================= progress rules ================= */
const missionDone=(did,mi)=>!!state.missions[did+':'+mi];
function districtUnlocked(i){ return state.unlockedAll||i===0||missionDone(DISTRICTS[i-1].id,0); }
function missionUnlocked(did,mi){ const i=DISTRICTS.findIndex(d=>d.id===did); if(i<0||!districtUnlocked(i)) return false; return state.unlockedAll||mi===0||missionDone(did,mi-1); }
const hqUnlocked=()=>state.unlockedAll||missionDone('bruecke',0);
const districtStars=id=>[0,1,2].reduce((s,mi)=>s+((state.missions[id+':'+mi]||{}).stars||0),0);
const totalStars=()=>DISTRICTS.reduce((s,d)=>s+districtStars(d.id),0);
function unlockedNames(){ const o=DISTRICTS.filter((d,i)=>districtUnlocked(i)).map(d=>d.name); if(hqUnlocked()) o.push('Zentrale (Tagesauftrag)'); return o; }
function recommended(){
  for(const [did,mi] of SEQ){ if(missionUnlocked(did,mi)&&!missionDone(did,mi)) return {did,mi}; }
  if(hqUnlocked()&&!day().hq) return {did:'hq',mi:0};
  let best=null;
  for(const [did,mi] of [['bruecke',2],['tunnel',2],['bruecke',1],['tunnel',1],['flug',1],['flug',2]]){
    if(!missionUnlocked(did,mi)) continue; const s=(state.missions[did+':'+mi]||{}).stars||0; if(!best||s<best.s) best={did,mi,s};
  }
  return best||{did:'herz',mi:0};
}
function missionLabel(r){ if(!r) return ''; if(r.did==='hq') return 'Tagesauftrag der Zentrale'; const D=DIST[r.did]; return `${D.name} · Mission ${r.mi+1}: ${D.missions[r.mi].title}`; }

/* ================= visuals ================= */
/* The school's 20-dot field drawn as two flatbed trucks with 10 crate slots each (5 + 5).
   Bridging through 10 = fill truck 1 first, the rest goes on truck 2 (minus: empty truck 2 first). */
const SLOT_X=i=>14+i*42+(i>=5?14:0);
function crateSVG(x,c){
  return `<g class="crate ${c.k==='a'?'ca':'cb'}${c.hl?' hl':''}${c.k==='x'?' gone':''}${c.keep?' keep':''}${c.anim?' anim':''}" style="animation-delay:${(c.d||0).toFixed(2)}s"><rect x="${x}" y="22" width="38" height="40" rx="5"/><path d="M${x+5} 35h28M${x+5} 49h28" class="plank"/>${c.k==='x'?`<path d="M${x+9} 32l20 20M${x+29} 32l-20 20" class="xmark"/>`:''}</g>`;
}
function truckSVG(cells,num,badge){
  let s='<svg viewBox="0 0 540 106" class="truck" aria-hidden="true"><rect x="4" y="64" width="452" height="12" rx="3" class="tk-bed"/><rect x="223" y="18" width="6" height="46" rx="2" class="tk-bed"/>';
  cells.forEach((c,i)=>{ const x=SLOT_X(i); s+=(c.k==='e'||c.k==='gap')?`<rect x="${x}" y="22" width="38" height="40" rx="5" class="tk-slot${c.k==='gap'?' gap':''}"/>`:crateSVG(x,c); });
  s+=`<path d="M458 76V38q0-10 10-10h32q8 0 13 7l17 21v20z" class="tk-cab tk-cab${num}"/><path d="M468 36h30l13 18h-43z" class="tk-glass"/><circle cx="480" cy="66" r="8" class="tk-num"/><text x="480" y="70" text-anchor="middle" class="tk-numt">${num}</text><rect x="524" y="58" width="12" height="8" rx="3" class="tk-light"/>`;
  [52,168,330,496].forEach(x=>{ s+=`<circle cx="${x}" cy="88" r="15" class="tk-tire"/><circle cx="${x}" cy="88" r="6" class="tk-rim"/>`; });
  if(badge) s+='<g class="tk-badge"><rect x="190" y="0" width="72" height="22" rx="11"/><text x="226" y="16" text-anchor="middle">10 voll</text></g>';
  return s+'</svg>';
}
function frame20(v,stage){
  const a=v.a,b=v.b,op=v.op,cells=Array.from({length:20},()=>({k:'e'}));
  let two,badge=false;
  if(v.loaded){
    two=true;
    if(op==='+'){ const sum=a+b; for(let i=0;i<a;i++) cells[i]={k:'a'}; for(let i=a;i<sum;i++) cells[i]={k:'b'};
      if(stage===0) for(let i=a;i<10;i++) cells[i].hl=1; else if(stage===1) for(let i=10;i<sum;i++) cells[i].hl=1;
      badge=true; }
    else { const res=a-b; for(let i=0;i<a;i++) cells[i]={k:i<res?'n':'x'};
      if(stage===0) for(let i=10;i<a;i++) cells[i].hl=1; else if(stage===1) for(let i=res;i<10;i++) cells[i].hl=1; else for(let i=0;i<res;i++) cells[i].keep=1; }
  } else if(op==='+'){
    const sum=a+b,br=sum>10; two=br;
    for(let i=0;i<a;i++) cells[i]={k:'a'};
    if(br&&stage===0){ for(let i=a;i<10;i++) cells[i]={k:'gap'}; }
    else{
      const fresh=!br||stage===1;
      for(let i=a;i<sum;i++) cells[i]={k:'b',anim:fresh,d:(i-a)*.07};
      if(br){ for(let i=10;i<sum;i++) cells[i].hl=1; if(stage>=2) badge=true; }
    }
  } else {
    const res=a-b,br=a>10&&res<10; two=a>10;
    for(let i=0;i<a;i++) cells[i]={k:'n'};
    if(br&&stage===0){ for(let i=10;i<a;i++) cells[i].hl=1; }
    else if(br&&stage===1){ for(let i=10;i<a;i++) cells[i]={k:'x',anim:true,d:(a-1-i)*.07}; const s=b-(a-10); for(let i=10-s;i<10;i++) cells[i].hl=1; badge=true; }
    else { for(let i=res;i<a;i++) cells[i]={k:'x',anim:!br||i<10,d:Math.max(0,Math.min(a,10)-1-i)*.07}; for(let i=0;i<res;i++) cells[i].keep=1; }
  }
  if(v.noanim) cells.forEach(c=>{ c.anim=false; });
  return `<figure class="vis convoy" role="img" aria-label="${a} ${op==='+'?'plus':'minus'} ${b}: Kisten auf Lastern">${truckSVG(cells.slice(0,10),1,badge)}${two?truckSVG(cells.slice(10),2,false):''}</figure>`;
}
function frame10(v,stage){
  const n=v.n,op=v.op,cells=[];
  for(let i=0;i<10;i++){
    if(op==='+') cells.push(i<n?{k:'a'}:(stage>=1?{k:'b',anim:true,d:(i-n)*.07,hl:v.loaded?1:0}:{k:'gap'}));
    else cells.push(i>=10-n?{k:'x',anim:true,d:(9-i)*.07}:{k:'n',keep:1});
  }
  if(v.noanim) cells.forEach(c=>{ c.anim=false; });
  return `<figure class="vis convoy" role="img" aria-label="Laster mit 10 Plätzen">${truckSVG(cells,1,op==='+'&&stage>=1)}</figure>`;
}
function numline(v,stage,nocap){
  const a=v.a,b=v.b,op=v.op,T=v.T,add=op==='+';
  const lo=T-10,hi=T+10,Wd=640,y=104,padx=30,X=i=>padx+(i-lo)*(Wd-2*padx)/20;
  const r=add?T-a:a-T,s=b-r,res=add?a+b:a-b;
  let svg=`<svg viewBox="0 0 ${Wd} 150" class="nl" role="img" aria-label="Zahlenstrahl"><line x1="${padx-12}" y1="${y}" x2="${Wd-padx+12}" y2="${y}" class="nl-axis"/>`;
  for(let i=lo;i<=hi;i++){ const big=i%10===0,mid=i%5===0,l=big?15:mid?10:6; svg+=`<line x1="${X(i)}" x2="${X(i)}" y1="${y-l}" y2="${y+l}" class="nl-tick${big?' big':''}"/>`; }
  const labs=new Set([lo,T,hi,a]); if(stage>=3) labs.add(res);
  labs.forEach(i=>{ svg+=`<text x="${X(i)}" y="${y+38}" text-anchor="middle" class="nl-lab${i===T?' ten':''}">${i}</text>`; });
  const arc=(f,t,lab,cls)=>{ const x1=X(f),x2=X(t),mx=(x1+x2)/2,hh=Math.min(64,16+Math.abs(x2-x1)*.5); return `<path d="M${x1} ${y-5} Q${mx} ${y-5-hh*2} ${x2} ${y-5}" class="nl-arc ${cls}"/><text x="${mx}" y="${y-12-hh}" text-anchor="middle" class="nl-arclab ${cls}">${lab}</text>`; };
  if(stage>=1) svg+=arc(a,T,(add?'+':MI)+r,'j1');
  if(stage>=2) svg+=arc(T,res,(add?'+':MI)+s,'j2');
  svg+=`<circle cx="${X(T)}" cy="${y}" r="8" class="nl-ten"/><circle cx="${X(a)}" cy="${y}" r="8" class="nl-start"/>`;
  if(stage>=3) svg+=`<circle cx="${X(res)}" cy="${y}" r="8" class="nl-end"/>`;
  svg+='</svg>';
  const cap=stage===0?`Rot: die ${a}. Gelb: der Zehner ${T}.`:stage===1?`Erster Sprung bis zum Zehner ${T}.`:'Zweiter Sprung: der Rest.';
  return `<figure class="vis" style="width:100%">${svg}${nocap?'':`<figcaption>${cap}</figcaption>`}</figure>`;
}
function house(v,stage){
  return `<figure class="vis"><div class="house" role="img" aria-label="Zahlenhaus"><div class="roof">${stage>=1?v.c:'?'}</div><div class="floor"><span>${v.a}</span><span>${v.b}</span></div></div></figure>`;
}
function zeTable(v){
  const zr=n=>[n>=10?Math.floor(n/10):'',n%10];
  const [z1,e1]=zr(v.x),[z2,e2]=zr(v.b);
  return `<figure class="vis"><table class="ze"><thead><tr><th></th><th>Z</th><th>E</th></tr></thead><tbody><tr><td class="zop"></td><td class="z">${z1}</td><td class="e">${e1}</td></tr><tr><td class="zop">${v.op}</td><td class="z">${z2}</td><td class="e">${e2}</td></tr></tbody></table></figure>`;
}
function renderVisual(v,stage,nocap){
  switch(v.type){
    case 'frame20': return frame20(v,stage,nocap);
    case 'frame10': return frame10(v,stage,nocap);
    case 'line': return numline(v,stage,nocap);
    case 'house': return house(v,stage);
    case 'ze': return zeTable(v);
  } return '';
}

/* ================= scenery ================= */
function skyline(seed){
  let s=seed*7919+13; const r=()=>{ s=(s*9301+49297)%233280; return s/233280; };
  let back='',front='',x=-10;
  while(x<1010){ const w=30+Math.floor(r()*46),h=46+Math.floor(r()*66); back+=`<rect x="${x}" y="${120-h}" width="${w}" height="${h}" class="sk2"/>`; x+=w+2; }
  x=-20;
  while(x<1020){ const w=40+Math.floor(r()*52),h=22+Math.floor(r()*54),y=120-h; front+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" class="sk"/>`;
    for(let wy=y+7;wy<114;wy+=13) for(let wx=x+6;wx<x+w-9;wx+=11) if(r()>.5) front+=`<rect x="${wx}" y="${wy}" width="5" height="6" class="skw"/>`;
    x+=w+4+Math.floor(r()*16); }
  return `<svg class="skyline" viewBox="0 0 1000 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${back}${front}</svg>`;
}
const LANDMARK={
  herz:'<path class="lm-s" d="M22 80V12M10 12h80M22 24l14-12M72 12v24"/><rect class="lm-a" x="64" y="36" width="16" height="12" rx="2"/><path class="lm-a" d="M44 66h72l-10 14H54z"/><rect class="lm-b" x="58" y="54" width="22" height="12" rx="1"/><rect class="lm-b" x="84" y="50" width="16" height="16" rx="1"/><path class="lm-a" d="M100 30s-8-5-8-11a4 4 0 0 1 8-1.5 4 4 0 0 1 8 1.5c0 6-8 11-8 11z"/><path class="lm-s" style="stroke-width:1.5" d="M100 30v20"/>',
  bruecke:'<path class="lm-s" d="M4 52Q60-4 116 52"/><path class="lm-s" style="stroke-width:2.5" d="M24 52V31M42 52V20M60 52V24M78 52V20M96 52V31"/><rect class="lm-a" x="0" y="50" width="120" height="7" rx="2"/><path class="lm-a" d="M14 57h8v23h-8zM98 57h8v23h-8z"/><rect class="lm-a" x="47" y="0" width="26" height="17" rx="3"/><text x="60" y="13" text-anchor="middle" class="lm-t">10</text>',
  tunnel:'<path class="lm-b" d="M0 80Q12 30 56 24q46-2 64 56z"/><path class="lm-d" d="M38 80V62a18 18 0 0 1 36 0v18z"/><path class="lm-s" style="stroke-width:3" d="M34 80V62a22 22 0 0 1 44 0v18"/><rect class="lm-a" x="45" y="27" width="22" height="13" rx="2"/><text x="56" y="37" text-anchor="middle" class="lm-t" style="font-size:10px">10</text>',
  familie:'<path class="lm-a" d="M4 80V52l18-16 18 16v28z"/><path class="lm-b" d="M38 80V44l22-20 22 20v36z"/><path class="lm-a" d="M80 80V56l18-15 18 15v24z"/><rect class="lm-w" x="54" y="50" width="12" height="12" rx="1"/><rect class="lm-w" x="17" y="60" width="10" height="9" rx="1"/><rect class="lm-w" x="93" y="62" width="10" height="9" rx="1"/>',
  tower:'<rect class="lm-b" x="12" y="40" width="24" height="40"/><rect class="lm-b" x="84" y="28" width="26" height="52"/><rect class="lm-a" x="40" y="8" width="40" height="72" rx="3"/><path class="lm-s" d="M60 1v7"/><rect class="lm-w" x="56" y="14" width="8" height="62" rx="2" style="opacity:.45"/><rect class="lm-w" x="55" y="38" width="10" height="10" rx="2"/><g class="lm-w"><rect x="45" y="16" width="6" height="5"/><rect x="69" y="16" width="6" height="5"/><rect x="45" y="28" width="6" height="5"/><rect x="69" y="28" width="6" height="5"/><rect x="45" y="40" width="6" height="5"/><rect x="69" y="40" width="6" height="5"/><rect x="45" y="52" width="6" height="5"/><rect x="69" y="52" width="6" height="5"/><rect x="45" y="64" width="6" height="5"/><rect x="69" y="64" width="6" height="5"/></g>',
  flug:'<rect class="lm-b" x="0" y="76" width="120" height="4"/><path class="lm-b" d="M8 46l22-16 22 16z"/><rect class="lm-a" x="12" y="46" width="36" height="26"/><rect class="lm-w" x="18" y="52" width="9" height="8" rx="1"/><rect class="lm-w" x="33" y="52" width="9" height="8" rx="1"/><rect class="lm-a" x="54" y="54" width="28" height="16" rx="2"/><rect class="lm-b" x="57" y="47" width="10" height="7" rx="1"/><rect class="lm-b" x="69" y="47" width="10" height="7" rx="1"/><rect class="lm-a" x="86" y="50" width="30" height="20" rx="2"/><rect class="lm-w" x="91" y="54" width="9" height="7" rx="1"/><path class="lm-s" style="stroke-width:2" d="M108 50V40"/><circle class="lm-d" cx="61" cy="72" r="3.4"/><circle class="lm-d" cx="75" cy="72" r="3.4"/><circle class="lm-d" cx="93" cy="72" r="3.4"/><circle class="lm-d" cx="109" cy="72" r="3.4"/>',
  hq:'<path class="lm-s" d="M46 80L57 24h6l11 56M50 62h20M53 44h14"/><path class="lm-s" d="M60 24V12"/><circle class="lm-a" cx="60" cy="10" r="4"/><path class="lm-s" style="stroke-width:3" d="M50 18q-5-6 0-12M70 18q5-6 0-12M43 22q-9-10 0-20M77 22q9-10 0-20"/>'
};
const lmSVG=(id,cls='')=>LANDMARK[id]?`<svg viewBox="0 0 120 80" class="lm ${cls}" aria-hidden="true">${LANDMARK[id]}</svg>`:'';
function fox(mood){
  const mouth=mood==='happy'?'<path d="M26 47q6 6 12 0" class="fx-m"/>':mood==='think'?'<path d="M29 49h7" class="fx-m"/>':'<path d="M28 47q4 3 8 0" class="fx-m"/>';
  const brows=mood==='think'?'<path d="M19 25l7 2M45 25l-7 2" class="fx-m" style="stroke-width:2"/>':'';
  return `<svg viewBox="0 0 64 64" class="fox" aria-hidden="true"><path d="M8 32L14 4l15 16z" class="fx-o"/><path d="M56 32L50 4 35 20z" class="fx-o"/><path d="M14 22l2.5-11 7 8z" class="fx-in"/><path d="M50 22l-2.5-11-7 8z" class="fx-in"/><circle cx="32" cy="36" r="22" class="fx-o"/><path d="M12 40Q32 66 52 40Q42 45 32 45Q22 45 12 40z" class="fx-w"/><circle cx="24" cy="32" r="3.4" class="fx-k"/><circle cx="40" cy="32" r="3.4" class="fx-k"/><circle cx="25.2" cy="30.8" r="1.1" class="fx-wd"/><circle cx="41.2" cy="30.8" r="1.1" class="fx-wd"/><ellipse cx="32" cy="42" rx="3.6" ry="2.6" class="fx-k"/>${mouth}${brows}<path d="M10 34Q10 9 32 9T54 34" class="fx-hs"/><rect x="5" y="30" width="8" height="12" rx="3" class="fx-hp"/><rect x="51" y="30" width="8" height="12" rx="3" class="fx-hp"/><path d="M9 42q1 12 14 12" class="fx-hs" style="stroke-width:2.5"/><circle cx="24" cy="54" r="3" class="fx-hp"/></svg>`;
}

/* ================= UI shell ================= */
let current='city',curDistrict=null,M=null,pendingBuy=null,pbTimer=null,quitArmed=false,resetArmed=false,gateQ=null,lastInput=Date.now();
const screens=['welcome','city','district','mission','result','garage','gate','parents'];
function show(name,arg){
  if(current==='mission'&&name!=='mission'&&name!=='result'&&M){ clearTimeout(M.advanceTimer); }
  if(current==='mission'&&name!=='mission') World.dispose();
  screens.forEach(s=>{ const el=$('#screen-'+s); if(el) el.hidden=s!==name; });
  current=name;
  if(name==='welcome') renderWelcome();
  else if(name==='city') renderCity();
  else if(name==='district'){ curDistrict=arg||curDistrict; renderDistrict(curDistrict); }
  else if(name==='mission') renderMissionShell();
  else if(name==='result') renderResult();
  else if(name==='garage') renderGarage();
  else if(name==='gate') renderGate();
  else if(name==='parents') renderParents();
  const sc=$('#screen-'+name); if(sc) sc.scrollTop=0;
  drawHud();
}
function rerender(){ show(current==='mission'||current==='result'?'city':current,curDistrict); }
let toastT=null;
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('on'),2800); }
function vehStyle(v){ const p=PNT[state.paintOf[v.id]||'std']||PNT.std; return `--v1:${p.c1||v.c1};--v2:${p.c2||v.c2}`; }

function drawHud(){
  const d=day(),goal=state.settings.goalMin,min=Math.floor(d.sec/60),p=Math.min(1,d.sec/(goal*60));
  $('#hud-day').innerHTML=`<svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="14" class="ring-bg"/><circle cx="18" cy="18" r="14" class="ring-fg${p>=1?' done':''}" stroke-dasharray="${(p*87.96).toFixed(1)} 87.96" transform="rotate(-90 18 18)"/></svg><span><span class="lbl">Heute </span>${min}/${goal} Min</span>`;
  $('#hud-day').setAttribute('aria-label',`Heute ${min} von ${goal} Minuten geübt`);
  $('#hud-stars').innerHTML=`${STAR.replace('class="star"','class="star" style="fill:var(--marking)"')}${totalStars()}`;
  $('#hud-coins').innerHTML=`${COIN}<span id="hud-coin-n">${state.coins}</span>`;
  $('#hud-sound').innerHTML=icon(state.settings.sound?'speaker':'mute');
  $('#hud-sound').setAttribute('aria-pressed',state.settings.sound?'true':'false');
  $('#hud-parents').innerHTML=icon('parent');
}
function bumpCoins(){ const c=$('#hud-coins'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }

/* ---------- first start ---------- */
function renderWelcome(){
  const v=VEH.jeep;
  $('#screen-welcome').innerHTML=`<div class="wrap"><div class="card gate welcome">
    <div class="welcome-fox">${fox('happy')}</div>
    <div class="eyebrow">Funk von der Zentrale</div>
    <h1 class="welcome-h">Willkommen in Zehner-City!</h1>
    <p class="muted">Hier belädst du Laster mit Kisten, rechnest geschickt über die 10 und verdienst Münzen für deine Garage.</p>
    <label for="welcome-name" class="welcome-q">Wie heißt du?</label>
    <input class="field" id="welcome-name" maxlength="20" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="Dein Vorname">
    <div class="ractions"><button class="btn btn-go big" data-act="welcome-go">${icon('play','fill')} Los geht's</button></div>
    <button class="linkbtn" data-act="welcome-skip">Ohne Namen weiter</button>
    <p class="muted small">Den Namen können Eltern später im Eltern-Bereich ändern. Er bleibt auf diesem Gerät.</p>
  </div></div>`;
}
function submitWelcome(skip){
  const i=$('#welcome-name'); const name=skip?'':((i&&i.value)||'').trim().slice(0,20);
  if(!skip&&!name){ toast('Tippe deinen Namen ein oder wähle „Ohne Namen weiter“.'); if(i) i.focus(); return; }
  state.name=name; state.nameAsked=true; save(true); show('city');
}

/* ---------- city ---------- */
function renderCity(){
  const rec=recommended(),h=new Date().getHours(),greet=h<11?'Guten Morgen':h<18?'Hallo':'Guten Abend';
  const tiles=DISTRICTS.map((D,i)=>{
    const un=districtUnlocked(i),st=districtStars(D.id);
    return `<button class="tile${un?'':' locked'}" style="--tc:var(--d-${D.id})" data-act="district" data-id="${D.id}">${lmSVG(D.id,'tile-art')}
      <span class="tile-top">${dIcon(D.id)}${un?'':`<span class="tile-lock">${icon('lock')}</span>`}</span>
      <span class="tile-name">${D.name}</span><span class="tile-skill">${D.skill}</span>
      <span class="tile-foot">${un?`<span class="tile-bar"><i style="width:${Math.round(st/9*100)}%"></i></span>${STAR}${st}/9`:`<span class="tile-hint">Erst eine Mission in ${DISTRICTS[i-1].name}</span>`}</span></button>`;
  }).join('');
  const hqDone=day().hq,hqUn=hqUnlocked();
  const hq=`<button class="tile hq${hqUn?'':' locked'}" data-act="hq">${lmSVG('hq','tile-art')}<span class="tile-top">${dIcon('hq')}${hqUn?'':`<span class="tile-lock">${icon('lock')}</span>`}</span>
    <span class="tile-name">Zentrale</span><span class="tile-skill">Tagesauftrag · gemischte Aufgaben</span>
    <span class="tile-foot">${hqUn?(hqDone?'<span class="badge done">Heute erledigt</span>':`<span class="badge">${COIN.replace('class="coin"','class="coin" style="width:18px;height:18px"')} +30 Bonus</span>`):'<span class="tile-hint">Öffnet nach Mission 1 auf der Zehnerbrücke</span>'}</span></button>`;
  const v=VEH[state.active];
  const gar=`<button class="tile garage" data-act="garage"><span class="tile-top">${dIcon('garage')}<span class="badge">${COIN.replace('class="coin"','class="coin" style="width:18px;height:18px"')} ${state.coins}</span></span>
    <span class="tile-name">Garage</span><span class="tile-veh" style="${vehStyle(v)}">${vehSVG(v.id)}</span></button>`;
  $('#screen-city').innerHTML=`<div class="wrap city">
    <section class="radio"><div class="radio-ava">${fox('happy')}</div>
      <div><div class="eyebrow">Funk von der Zentrale</div><h1>${greet}${state.name?', '+esc(state.name):''}!</h1><p>Nächste Mission: <b>${esc(missionLabel(rec))}</b></p></div>
      <button class="btn btn-go big" data-act="play-rec">${icon('play','fill')} Los geht's</button></section>
    <section class="map" aria-label="Stadtplan">${tiles}${hq}${gar}</section>
    ${goalHTML()}
  </div>`;
}
function nextGoal(){
  const items=[];
  VEHICLES.forEach(v=>{ if(!state.owned[v.id]&&!(v.needs&&!state.buildings[v.needs])) items.push({kind:'veh',item:v}); });
  BUILDINGS.forEach(b=>{ if(!state.buildings[b.id]) items.push({kind:'bld',item:b}); });
  items.sort((x,y)=>x.item.price-y.item.price); return items[0]||null;
}
function goalHTML(){
  const g=nextGoal();
  if(!g) return `<section class="card goal"><div class="goal-pic">${vehSVG('stealth')}</div><div><div class="eyebrow">Sparziel</div><h3>Alles gekauft!</h3><p>Deine Garage ist voll. Neue Farben gibt es in der Lackiererei.</p></div><button class="btn" data-act="garage">Zur Garage</button></section>`;
  const have=state.coins,price=g.item.price,pct=Math.min(100,Math.round(have/price*100)),can=have>=price;
  return `<section class="card goal"><div class="goal-pic" style="${g.kind==='veh'?vehStyle(g.item):''}">${g.kind==='veh'?vehSVG(g.item.id):bldSVG(g.item.id)}</div>
    <div><div class="eyebrow">Sparziel</div><h3>${g.item.name}</h3><div class="goal-bar"><i style="width:${pct}%"></i></div>
    <p>${can?'<b>Du hast genug Münzen!</b>':`Noch <b>${price-have}</b> Münzen`} · ${have} von ${price}</p></div>
    <button class="btn${can?' btn-gold':''}" data-act="garage">Zur Garage</button></section>`;
}

/* ---------- district ---------- */
const HOWTO={
  herz:()=>`<p class="lead">Verliebte Zahlen ergeben zusammen immer <b>10</b>: so viele Kisten passen auf einen Laster.</p>
    <div class="hearts">${[[1,9],[2,8],[3,7],[4,6],[5,5]].map(([x,y])=>`<span class="hpair">${x} ${HEART} ${y}</span>`).join('')}</div>
    <div class="visual">${frame10({n:7,op:'+'},1,true)}</div><div class="exsteps"><div>7 + 3 = 10</div><div>10 ${MI} 3 = 7</div></div>`,
  bruecke:()=>`<p class="lead">Erst Laster 1 bis 10 voll machen. Der Rest kommt auf Laster 2.</p>
    <div class="exsteps"><div>8 + 5 = ?</div><div><mark>8 + 2</mark> = 10</div><div>10 + 3 = 13</div></div>
    <div class="visual">${frame20({a:8,b:5,op:'+'},2,true)}</div>
    <div class="exsteps"><div class="note">So schreibt ihr es in der Schule:</div><div>8 + 9 = 17</div><div>8 + 2 + 7 = 17</div></div>`,
  tunnel:()=>`<p class="lead">Erst Laster 2 leer machen. Dann den Rest von Laster 1 abladen.</p>
    <div class="exsteps"><div>13 ${MI} 8 = ?</div><div><mark>13 ${MI} 3</mark> = 10</div><div>10 ${MI} 5 = 5</div></div>
    <div class="visual">${frame20({a:13,b:8,op:MI},2,true)}</div>
    <div class="exsteps"><div class="note">So schreibt ihr es in der Schule:</div><div>13 ${MI} 8 = 5</div><div>13 ${MI} 3 ${MI} 5 = 5</div></div>`,
  familie:()=>`<p class="lead">Eine Ladung, drei Zahlen, vier Aufgaben: die Aufgabe, die <b>Tauschaufgabe</b> und zwei <b>Umkehraufgaben</b>.</p>
    <div class="visual">${house({a:5,b:2,c:7},1)}</div>
    <div class="exsteps"><div>5 + 2 = 7</div><div>2 + 5 = 7</div><div>7 ${MI} 2 = 5</div><div>7 ${MI} 5 = 2</div></div>`,
  tower:()=>`<p class="lead">Analogieaufgaben: Die Kisten rechnen gleich, der volle Laster (10) bleibt einfach stehen.</p>
    <div class="exsteps"><div>4 + 5 = 9</div><div>1<span class="ones">4</span> + <span class="ones">5</span> = 1<span class="ones">9</span></div><div>2<span class="ones">4</span> + <span class="ones">5</span> = 2<span class="ones">9</span></div></div>
    <div class="visual">${zeTable({x:14,b:5,op:'+'})}</div>`,
  flug:()=>`<p class="lead">Bis 100 klappen dieselben Tricks. Jeder volle Laster ist ein Zehner.</p>
    <div class="exsteps"><div>3 + 4 = 7 → 30 + 40 = 70</div><div>38 + 5 = <mark>38 + 2</mark> + 3 = 43</div><div>43 ${MI} 5 = <mark>43 ${MI} 3</mark> ${MI} 2 = 38</div></div>
    <div class="visual">${numline({a:38,b:5,op:'+',T:40},3,true)}</div>`
};
function renderDistrict(id){
  const D=DIST[id]; if(!D){ show('city'); return; }
  const ms=D.missions.map((m,mi)=>{
    const un=missionUnlocked(id,mi),rec=state.missions[id+':'+mi],st=rec?rec.stars:0;
    return `<article class="mcard${un?'':' locked'}" style="--tc:var(--d-${id})"><span class="mnum">${mi+1}</span>
      <div><h3>${m.title}</h3><p>${m.desc}</p><div class="mstars" aria-label="${st} von 3 Sternen">${[1,2,3].map(i=>starOn(i<=st)).join('')}</div></div>
      ${un?`<button class="btn btn-go" data-act="play" data-id="${id}" data-mi="${mi}">${icon('play','fill')} ${rec?'Nochmal':'Los!'}</button>`:`<span class="mlock">${icon('lock')}Erst Mission ${mi}</span>`}</article>`;
  }).join('');
  $('#screen-district').innerHTML=`<div class="wrap"><div class="topbar"><button class="btn" data-act="home">${icon('back')} Stadt</button></div>
    <header class="dhead" style="--tc:var(--d-${id})">${dIcon(id)}<div><div class="eyebrow light">${D.skill}</div><h1>${D.name}</h1></div></header>
    <div class="dgrid"><section class="mlist" aria-label="Missionen">${ms}</section><section class="card howto"><h2>So geht's</h2>${HOWTO[id]()}</section></div></div>`;
}

/* ---------- 3D world (js/world3d.js, loaded on demand) ---------- */
const World={mod:null,state:'idle',
  get(){
    if(this.state==='idle'){ this.state='loading';
      import('./world3d.js').then(m=>{ this.mod=m; this.state='ready'; if(M&&current==='mission') drawVisual(); })
        .catch(err=>{ console.warn('3D unavailable',err); this.fail(); }); }
    return this.state==='ready'?this.mod:null;
  },
  fail(){ this.state='failed'; if(this.mod) this.mod.dispose(); if(M&&current==='mission'){ M.lastVis=null; const el=$('#m-visual'); if(el) el.innerHTML=''; drawVisual(); drawRows(); } },
  dispose(){ if(this.mod) this.mod.dispose(); }
};
const WORLD_OF={herz:'harbor',bruecke:'bridge',tunnel:'tunnel',familie:'suburb',tower:'tower',flug:'station'};
function worldView(){
  const t=curTask(),b=M.taskDone?null:curBlank();
  return {key:M.ti+':'+M.tasks.length+':'+(t.key||'')+':'+M.title,world:WORLD_OF[t.skill||M.did]||'harbor',t,phase:M.phase,ld:M.ld,bi:M.bi,done:M.taskDone,busy:M.busy,h:b?b.h:0,inset:worldInset()};
}
/* Free area of the 3D view that is not covered by the floating equation and hint panels. */
function worldInset(){
  const host=$('#world3d'),rows=$('#m-rows'),bub=$('#m-bubble'); if(!host||!rows||!bub) return {l:0,t:0,r:0,b:0};
  const h=host.getBoundingClientRect(),r=rows.getBoundingClientRect(),u=bub.getBoundingClientRect();
  const ins={l:0,t:0,r:0,b:Math.max(0,h.bottom-u.top+6)};
  const right=Math.max(0,...[...rows.querySelectorAll('.row')].map(x=>{ let m=0; [...x.children].forEach(c=>{ m=Math.max(m,c.getBoundingClientRect().right); }); return m; }))-h.left+10;
  if(r.height>h.height*.28&&right<h.width*.5) ins.l=right; else ins.t=Math.max(0,r.bottom-h.top+6);
  return ins;
}
const worldApi={loadAct:t=>loadAct(t),loadMsg:(m,c)=>loadMsg(m,c),sound:n=>Sound.play(n),touch:()=>{ lastInput=Date.now(); Sound.ensure(); },failed:()=>World.fail()};

/* ---------- mission ---------- */
const PRAISE=['Super!','Klasse!','Stark!','Mega!','Spitze!','Bingo!','Volltreffer!'];
const PRAISE_HELP=['Geschafft!','Richtig!','Gut gemacht!'];
const STEPOK=['Richtig!','Genau!','Stimmt!','Prima!'];
const FLAME='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"/></svg>';
const reduceMotion=(()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } })();
function startMission(did,mi){
  let tasks,title,sub;
  if(did==='hq'){ tasks=genHQ(); title='Tagesauftrag'; sub='Zentrale'; mi=0; }
  else { const D=DIST[did],m=D.missions[mi]; tasks=sampleTasks(GEN[m.gen],GEN[m.gen].n,did); title=m.title; sub=D.name; }
  if(!tasks.length){ toast('Für diesen Auftrag gibt es noch keine Aufgaben.'); return; }
  M={did,mi,title,sub,tasks,ti:0,bi:0,entry:'',firstTry:0,coins:0,streak:0,taskDone:false,taskWrong:false,feedback:null,stepMsg:null,nudge:null,praise:'',before:unlockedNames(),finished:false,intro:true,busy:false};
  prepTask(); quitArmed=false; show('mission');
}
const curTask=()=>M.tasks[M.ti];
const curBlank=()=>curTask().blanks[M.bi];
function prepTask(){ const t=curTask(); M.bi=t.blanks.findIndex(b=>!b.auto&&b.val==null); M.entry=''; if(t.load&&!t.loadDone){ M.phase='load'; M.ld=initLoad(t); } else { M.phase='calc'; M.ld=null; } }
const sceneOf=()=>M.did==='hq'?'hq':M.did;
function renderMissionShell(){
  if(!M){ show('city'); return; }
  const v=VEH[state.active],air=v.cat==='luft',sid=sceneOf(),seed=[...sid].reduce((s,c)=>s+c.charCodeAt(0),0);
  $('#screen-mission').innerHTML=`<div class="mwrap" style="--tc:var(--d-${sid})">
    <div class="mtop"><button class="iconbtn" id="quit-btn" data-act="quit" aria-label="Mission beenden">${icon('close')}</button>
      <div class="mtitle"><div class="eyebrow">${esc(M.sub)}</div><h2>${esc(M.title)}</h2></div><span class="streak" id="m-streak" hidden></span><div class="mcount" id="m-count"></div></div>
    <div class="scene${air?' air':''}" id="m-road"><div class="street"></div><div id="m-cps"></div><span class="road-flag">${FLAG}</span>
      <span class="road-veh${air?' air':''}" id="m-veh" style="${vehStyle(v)};left:9%">${vehSVG(v.id)}</span></div>
    <section class="taskcard" id="m-card"><div class="rows" id="m-rows"></div><div class="bubble" id="m-bubble" aria-live="polite"></div><div class="visual" id="m-visual"></div><div class="stamp" id="m-stamp" aria-hidden="true"></div></section>
    <section class="padcol"><div class="pad" id="m-pad">${[1,2,3,4,5,6,7,8,9].map(d=>`<button class="key" data-act="digit" data-d="${d}">${d}</button>`).join('')}
      <button class="key del" data-act="del" aria-label="Löschen">${icon('del')}</button><button class="key" data-act="digit" data-d="0">0</button><button class="key ok" data-act="ok" aria-label="Prüfen">${icon('check')}</button></div>
      <p class="lockhint">Erst die Kisten bewegen.</p><div class="tools"><button class="btn btn-gold" data-act="hint">${icon('bulb')} Tipp</button><button class="btn" data-act="speak"${Speech.ok?'':' hidden'}>${icon('speaker')} Vorlesen</button></div></section>
  </div>${introHTML()}`;
  M.lastVis=null; World.get(); drawAll();
}
function introHTML(){
  if(!M.intro) return '';
  M.intro=false; Sound.play('start');
  setTimeout(()=>{ const i=$('#m-intro'); if(i) i.remove(); },2400);
  return `<div class="intro" id="m-intro" data-act="intro-close" style="--tc:var(--d-${sceneOf()})"><div class="intro-band"><div class="eyebrow">Mission · ${esc(M.sub)}</div><h1>${esc(M.title)}</h1></div></div>`;
}
function drawAll(){ const pc=$('.padcol'); if(pc) pc.classList.toggle('locked',M.phase==='load'); drawCount(); drawRoad(); drawRows(); drawBubble(); drawVisual(); drawStreak(); }
function drawCount(){ const el=$('#m-count'); if(el) el.textContent=`${Math.min(M.ti+1,M.tasks.length)} von ${M.tasks.length}`; }
function drawRoad(){
  const box=$('#m-cps'); if(!box) return;
  const n=M.tasks.length,done=M.ti+(M.taskDone?1:0),pos=p=>9+p*82;
  let cps=''; for(let i=1;i<n;i++) cps+=`<span class="road-cp${i<done?' done':i===done?(M.taskDone?' got':' done'):''}" style="left:${pos(i/n)}%">${COIN}</span>`;
  box.innerHTML=cps;
  const veh=$('#m-veh'); const left=pos(done/n)+'%';
  if(veh.style.left!==left){ veh.style.left=left; veh.classList.remove('go'); void veh.offsetWidth; veh.classList.add('go'); }
}
const curH=()=>{ if(M.taskDone) return 99; const b=curBlank(); return b?b.h:0; };
function tokHTML(tok,t){
  if(typeof tok==='string') return `<span class="op">${tok}</span>`;
  if(tok.b!==undefined){
    const b=t.blanks[tok.b],active=!M.taskDone&&M.bi===tok.b;
    let inner='',cls='blank';
    if(b.val!=null){ inner=b.val; cls+=' ok'+(M.popB===tok.b?' pop':''); }
    else if(active){ cls+=' active'; inner=M.entry||(b.revealed?`<span class="ghost">${b.ans}</span>`:'<i class="caret"></i>'); }
    return `<span class="${cls}" data-b="${tok.b}">${inner}</span>`;
  }
  if(tok.hint!==undefined) return curH()>=tok.hint?`<span class="num hinted">${tok.n}</span>`:'<span class="num q">?</span>';
  if(tok.heart) return `<span class="num heartnum">${HEART}<span>${tok.n}</span></span>`;
  if(tok.ones){ const s=String(tok.n); return `<span class="num">${s.slice(0,-1)}<span class="ones">${s.slice(-1)}</span></span>`; }
  return `<span class="num">${tok.n}</span>`;
}
function visibleRows(t,compact){
  const h=curH();
  if(M.phase==='load'){ const g=t.rows.filter(r=>r.goal); return g.length?g:t.rows.filter(r=>r.big); }
  let rows=t.rows.filter(r=>{ if(r.minHint&&h<r.minHint) return false; if(r.step!=null) return !M.taskDone&&M.bi===r.step; if(r.final) return M.taskDone; return true; });
  if(compact&&!M.taskDone&&rows.length>2) rows=rows.filter(r=>r.goal||r.known||r.tokens.some(tk=>tk&&tk.b===M.bi));
  return rows;
}
function rowsHTML(rows,t){
  return rows.map(r=>`<div class="row${r.known?' known':''}${r.goal?' goal':''}${r.step!=null||r.big?' step':''}${r.final?' final':''}${r.long?' long':''}">${r.label?`<span class="rlabel">${r.label}</span>`:''}<span class="eq">${r.tokens.map(tok=>tokHTML(tok,t)).join('')}</span></div>`).join('');
}
function drawRows(){
  const el=$('#m-rows'); if(!el) return;
  const t=curTask(),rows=visibleRows(t,false),n=rows.filter(r=>!r.goal&&!r.final).length;
  el.className='rows'+(n>=4?' rows-4':n===3?' rows-3':'');
  el.innerHTML=rowsHTML(rows,t);
  M.popB=null;
  $('#m-card').classList.toggle('side',!!t.side&&World.state==='failed');
}
const fmt=s=>esc(s).replace(/□/g,'<span class="qbox" aria-label="?"></span>');
function bubbleModel(){
  const t=curTask(),b=curBlank(),steps=t.blanks.filter(x=>!x.auto),stepNo=steps.indexOf(b);
  let cls='',main='',sub='',pre='',mood='';
  if(M.taskDone){ cls='good'; main=M.praise; sub=M.coinMsg||''; mood='happy'; }
  else{
    main=b.prompt;
    if(b.revealed){ cls='reveal'; sub=`Die Lösung ist ${b.ans}. Tippe sie ein.`; mood='think'; }
    else if(b.h>0){ cls='hint'; sub=(M.feedback==='wrong'?'Fast! ':'')+b.hints[b.h-1]; mood='think'; }
    else if(M.feedback==='wrong'){ cls='hint'; sub='Fast! Nochmal.'; mood='think'; }
    if(M.nudge) sub=M.nudge;
    if(M.stepMsg&&!b.h&&!M.feedback){ pre=`<span class="oktag">${esc(M.stepMsg)}</span>`; mood='happy'; }
  }
  const dots=!M.taskDone&&steps.length>1?`<span class="dots" aria-label="Schritt ${stepNo+1} von ${steps.length}">${steps.map((x,i)=>`<i class="${i<stepNo?'done':i===stepNo?'cur':''}"></i>`).join('')}</span>`:'';
  M.lastSpeech=(main+'. '+sub).trim();
  return {cls,mood,html:`<span class="ava ${mood}">${fox(mood)}</span><div class="msg">${dots}<span class="main">${pre}${fmt(main)}</span>${sub?`<span class="sub">${fmt(sub)}</span>`:''}</div>`};
}
function drawBubble(){
  const el=$('#m-bubble'); if(!el) return;
  if(M.phase==='load'){ drawLoadBubble(el); return; }
  const m=bubbleModel();
  el.className='bubble'+(m.cls?' '+m.cls:'');
  el.innerHTML=m.html+(Speech.ok?`<button class="iconbtn soft" data-act="speak" aria-label="Vorlesen">${icon('speaker')}</button>`:'');
}
function visualHTML(){
  const t=curTask(),b=curBlank(),h=b?b.h:0,parts=[];
  for(const v of [t.visual,b&&b.visual]){
    if(!v) continue;
    if(!(v.show==='always'||h>=1)) continue;
    let stage=v.fixed!=null?v.fixed:(b&&b.vis!=null?b.vis:0);
    if(v.byHint) stage=Math.max(stage,h);
    if(M.taskDone&&v.fixed==null) stage=3;
    parts.push(renderVisual(v,stage,true));
  }
  return parts.join('');
}
function drawVisual(){
  const el=$('#m-visual'); if(!el) return;
  const t0=curTask();
  if(t0.sc&&World.state!=='failed'){
    if(!$('#world3d')){ el.innerHTML='<div class="world3d" id="world3d"><div class="w3-wait">Die Welt wird gebaut …</div></div>'; M.lastVis=null; }
    el.hidden=false; $('#m-card').classList.add('immersive');
    const w=World.get(); if(w) w.sync($('#world3d'),worldView(),worldApi);
    return;
  }
  $('#m-card').classList.remove('immersive');
  if(M.phase==='load'){ el.innerHTML=loadSceneHTML(); el.hidden=false; M.lastVis=null; return; }
  const html=visualHTML();
  if(html!==M.lastVis){ el.innerHTML=html; M.lastVis=html; }
  el.hidden=!html;
}
function drawStreak(){
  const el=$('#m-streak'); if(!el) return;
  if(M.streak>=2){ const txt=`${FLAME} ${M.streak}`; if(el.innerHTML!==txt){ el.innerHTML=txt; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } el.hidden=false; }
  else el.hidden=true;
}
function stamp(text){ const s=$('#m-stamp'); if(!s) return; s.textContent=text; s.classList.remove('on'); void s.offsetWidth; s.classList.add('on'); }
function fxLayer(){ let l=$('#fx-layer'); if(!l){ l=document.createElement('div'); l.id='fx-layer'; l.className='fx-layer'; document.body.appendChild(l); } return l; }
function burst(el,n){
  if(!el||reduceMotion) return; n=n||16;
  const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,l=fxLayer(),cols=['var(--marking)','var(--go)','var(--sunset)','var(--dot-b)','var(--neon)'];
  for(let i=0;i<n;i++){ const s=document.createElement('span'); s.className='spark'; const ang=Math.PI*2*i/n+Math.random()*.4,dist=50+Math.random()*70;
    s.style.cssText=`left:${cx-5}px;top:${cy-5}px;background:${cols[i%cols.length]};--dx:${(Math.cos(ang)*dist).toFixed(0)}px;--dy:${(Math.sin(ang)*dist).toFixed(0)}px`;
    l.appendChild(s); setTimeout(()=>s.remove(),850); }
}
function flyCoins(el,n){
  const tgt=$('#hud-coins');
  if(!el||!tgt||reduceMotion){ drawHud(); bumpCoins(); return; }
  const a=el.getBoundingClientRect(),b=tgt.getBoundingClientRect(),l=fxLayer(),sx=a.left+a.width/2,sy=a.top+a.height/2;
  for(let i=0;i<n;i++){
    const c=document.createElement('span'); c.className='flycoin'; c.innerHTML=COIN; c.style.left=(sx-15)+'px'; c.style.top=(sy-15)+'px'; l.appendChild(c);
    setTimeout(()=>{ c.style.transform=`translate(${b.left+20-sx}px,${b.top+20-sy}px) scale(.7)`; },40+i*90);
    setTimeout(()=>{ c.remove(); if(i===n-1){ drawHud(); bumpCoins(); Sound.play('coin'); } },800+i*90);
  }
}
const fxTarget=()=>$('#m-rows .blank.pop')||$('#m-rows .row.final .eq');
function pressDigit(d){
  if(!M||M.taskDone||M.busy||M.phase==='load') return; const b=curBlank(); if(!b) return;
  const maxLen=Math.max(2,String(b.ans).length);
  if(M.entry.length>=maxLen){ M.nudge='Drücke ✓ oder ⌫.'; drawBubble(); return; }
  M.entry+=d; M.nudge=null; M.stepMsg=null; Sound.play('tap'); drawRows(); if(M.feedback){ M.feedback=null; } drawBubble();
}
function pressDel(){ if(!M||M.taskDone||M.busy||M.phase==='load') return; M.entry=M.entry.slice(0,-1); M.nudge=null; drawRows(); drawBubble(); }
function pressHint(){
  if(M&&M.phase==='load'){ loadHint(); return; }
  if(!M||M.taskDone||M.busy) return; const b=curBlank(); if(!b) return;
  if(b.h<b.hints.length) b.h++;
  else if(!b.revealed){ b.revealed=true; M.taskWrong=true; }
  M.feedback=null; M.nudge=null; M.stepMsg=null; Sound.play('tap'); drawRows(); drawBubble(); drawVisual();
}
function pressOk(){
  if(!M||M.busy||M.phase==='load') return;
  if(M.taskDone){ nextTask(); return; }
  const b=curBlank(); if(!b) return;
  if(M.entry===''){ M.nudge='Tippe zuerst eine Zahl ein.'; drawBubble(); return; }
  const val=parseInt(M.entry,10);
  M.entry=''; M.nudge=null;
  if(val===b.ans){ b.val=val; M.feedback=null; M.popB=M.bi; onBlankCorrect(); return; }
  b.wrong++; M.taskWrong=true; b.h=Math.min(b.hints.length,b.h+1); if(b.wrong>=3) b.revealed=true;
  M.feedback='wrong'; M.stepMsg=null; Sound.play('wrong'); drawRows(); drawBubble(); drawVisual();
  const a=$('#m-rows .blank.active'); if(a) a.classList.add('shake');
}
function onBlankCorrect(){
  const t=curTask(),next=t.blanks.findIndex(x=>!x.auto&&x.val==null);
  if(next>=0){
    M.stepMsg=pick(STEPOK); Sound.play('step');
    const stepped=t.rows.some(r=>r.step!=null);
    const go=()=>{ if(!M||current!=='mission') return; M.busy=false; M.bi=next; drawRows(); drawBubble(); drawVisual(); };
    if(stepped){ M.busy=true; drawRows(); drawBubble(); burst(fxTarget(),10); setTimeout(go,700); }
    else { go(); burst(fxTarget(),10); }
    return;
  }
  const ai=t.blanks.findIndex(x=>x.auto); if(ai>=0){ t.blanks.forEach(x=>{ if(x.auto) x.val=x.ans; }); M.popB=ai; }
  completeTask();
}
function completeTask(){
  const t=curTask(),clean=!M.taskWrong;
  M.taskDone=true;
  if(clean){ M.firstTry++; M.streak++; } else M.streak=0;
  const bonus=clean&&M.streak>=3&&M.streak%3===0?3:0, c=(clean?5:3)+bonus;
  M.coins+=c; state.coins+=c; recordTask(t,clean); save(true);
  M.praise=clean?pick(PRAISE):pick(PRAISE_HELP);
  M.coinMsg=`+${c} Münzen`+(bonus?` · ${M.streak}er-Serie!`:'');
  Sound.play('ok'); setTimeout(()=>Sound.play('honk'),240);
  drawAll();
  stamp(bonus?`Serie ×${M.streak}!`:M.praise);
  const tg=fxTarget(); burst(tg,18); flyCoins(tg,clean?3:2);
  M.advanceTimer=setTimeout(nextTask,t.kind==='bridge'?2300:1700);
}
function nextTask(){
  if(!M||current!=='mission') return;
  clearTimeout(M.advanceTimer);
  if(M.ti+1>=M.tasks.length){ finishMission(); return; }
  M.ti++; M.taskDone=false; M.taskWrong=false; M.feedback=null; M.stepMsg=null; M.nudge=null; prepTask(); drawAll();
}
function recordTask(t,clean){
  if(t.key){ const f=state.facts[t.key]||(state.facts[t.key]={n:0,w:0}); f.n++; if(!clean) f.w++; }
  if(t.skill){ const s=state.skill[t.skill]||(state.skill[t.skill]={n:0,f:0}); s.n++; if(clean) s.f++; }
  state.totalTasks++; day().tasks++;
}
function finishMission(){
  const n=M.tasks.length,rate=M.firstTry/n,stars=rate>=.85?3:rate>=.5?2:1,bonus=10+stars*5,d=day(); let daily=0;
  if(M.did==='hq'){ if(!d.hq){ d.hq=1; daily=30; } }
  else{ const key=M.did+':'+M.mi,rec=state.missions[key]||{stars:0,plays:0}; rec.plays++; rec.stars=Math.max(rec.stars,stars); state.missions[key]=rec; }
  state.coins+=bonus+daily; M.coins+=bonus+daily; M.result={stars,bonus,daily};
  const after=unlockedNames(); M.newUnlocks=after.filter(x=>!M.before.includes(x)); M.finished=true;
  save(true); Sound.play('win'); show('result');
}
function renderResult(){
  if(!M||!M.result){ show('city'); return; }
  const R=M.result,n=M.tasks.length,v=VEH[state.active];
  let next=null;
  if(M.did!=='hq'&&M.mi<2&&missionUnlocked(M.did,M.mi+1)) next={did:M.did,mi:M.mi+1}; else { const r=recommended(); if(r&&!(r.did===M.did&&r.mi===M.mi)) next=r; }
  const conf=Array.from({length:26},(_,i)=>`<span class="confetti" style="left:${rnd(100)}%;background:${pick(['var(--marking)','var(--on-tile)','var(--go)','var(--dot-b)','var(--asphalt)'])};animation-delay:${(i*.06).toFixed(2)}s"></span>`).join('');
  $('#screen-result').innerHTML=`<div class="result">
    <div class="banner">${conf}<div class="eyebrow light">${esc(M.sub)} · ${esc(M.title)}</div><h1>Mission erfüllt!</h1></div>
    <div class="rstars" aria-label="${R.stars} von 3 Sternen">${[1,2,3].map(i=>`<span class="rstar${i<=R.stars?' on':''}" style="animation-delay:${.25+i*.18}s">${STAR}</span>`).join('')}</div>
    <p class="rline">${state.name?esc(pick(['Stark','Super','Klasse']))+', '+esc(state.name)+'! ':''}<b>${M.firstTry} von ${n}</b> Aufgaben sofort richtig${R.stars===3?'. Perfekt!':'.'}</p>
    <div class="rcoins">${COIN}<span>+${M.coins}</span></div>
    <ul class="rbreak"><li>Aufgaben <b>+${M.coins-R.bonus-R.daily}</b></li><li>Missions-Bonus <b>+${R.bonus}</b></li>${R.daily?`<li>Tagesauftrag <b>+${R.daily}</b></li>`:''}</ul>
    ${M.newUnlocks&&M.newUnlocks.length?`<div><span class="unlock">${STAR} Neu freigeschaltet: <b>${esc(M.newUnlocks.join(', '))}</b></span></div>`:''}
    <div class="rveh" style="${vehStyle(v)}">${vehSVG(v.id)}</div>
    <div class="ractions">${next?`<button class="btn btn-go big" data-act="play" data-id="${next.did}" data-mi="${next.mi}">${icon('play','fill')} ${next.did===M.did?'Nächste Mission':esc(missionLabel(next).split(' · ')[0])}</button>`:''}
      <button class="btn big" data-act="replay">Nochmal</button><button class="btn big" data-act="home">Zur Stadt</button></div>
    ${goalHTML()}
  </div>`;
}

/* ---------- garage ---------- */
function priceBtn(kind,item){
  const id=kind+':'+item.id,have=state.coins;
  if(pendingBuy===id) return `<button class="btn btn-go" data-act="buy" data-kind="${kind}" data-id="${item.id}">Ja, für ${item.price} kaufen</button>`;
  if(have>=item.price) return `<button class="btn btn-gold" data-act="buy" data-kind="${kind}" data-id="${item.id}">Kaufen · ${COIN} ${item.price}</button>`;
  return `<button class="btn" disabled>Noch ${item.price-have} Münzen</button>`;
}
function renderGarage(){
  const v=VEH[state.active],cur=state.paintOf[v.id]||'std';
  const paints=PAINTS.map(p=>{ const own=!!state.paints[p.id],c1=p.c1||v.c1,c2=p.c2||v.c2,pend=pendingBuy==='paint:'+p.id;
    return `<button class="paint${cur===p.id?' on':''}${pend?' pending':''}" data-act="paint" data-id="${p.id}" aria-label="${p.name}${own?'':', '+p.price+' Münzen'}"><span class="swatch" style="background:linear-gradient(135deg,${c1} 50%,${c2} 50%)"></span>${p.name}<span class="price">${own?(cur===p.id?'aktiv':'gekauft'):pend?'Nochmal tippen':COIN+p.price}</span></button>`; }).join('');
  const cards=VEHICLES.map(x=>{
    const own=!!state.owned[x.id],act=state.active===x.id,blocked=x.needs&&!state.buildings[x.needs];
    let btn;
    if(act) btn='<button class="btn" disabled>Im Einsatz</button>';
    else if(own) btn=`<button class="btn btn-go" data-act="select" data-id="${x.id}">Fahren</button>`;
    else if(blocked) btn=`<button class="btn" disabled>${icon('lock')} Braucht ${BLD[x.needs].short}</button>`;
    else btn=priceBtn('veh',x);
    return `<article class="vcard${act?' active':''}"><div class="vpic" style="${vehStyle(x)}">${vehSVG(x.id)}</div><span class="vtag">${x.cat==='luft'?'Luft':'Boden'}</span><h3>${x.name}</h3><p>${x.desc}</p>${btn}</article>`;
  }).join('');
  const blds=BUILDINGS.map(b=>{ const own=!!state.buildings[b.id];
    return `<article class="vcard"><div class="vpic">${bldSVG(b.id)}</div><span class="vtag">Gebäude</span><h3>${b.name}</h3><p>${b.desc}</p>${own?'<button class="btn" disabled>Gebaut</button>':priceBtn('bld',b)}</article>`; }).join('');
  $('#screen-garage').innerHTML=`<div class="wrap"><div class="ghead"><button class="btn" data-act="home">${icon('back')} Stadt</button><h1>Garage</h1></div>
    <section class="showroom"><div class="show-veh" style="${vehStyle(v)}">${vehSVG(v.id)}</div>
      <div><div class="eyebrow" style="color:var(--on-asphalt-soft)">Im Einsatz</div><h2>${v.name}</h2><p>${v.desc}</p>
      <div class="eyebrow" style="color:var(--on-asphalt-soft);margin-top:16px">Lackiererei</div><div class="paints">${paints}</div></div></section>
    <h2 class="section-h">Fahrzeuge</h2><div class="vgrid">${cards}</div>
    <h2 class="section-h">Gebäude</h2><div class="vgrid">${blds}</div></div>`;
}
function armBuy(id){ pendingBuy=id; clearTimeout(pbTimer); pbTimer=setTimeout(()=>{ pendingBuy=null; if(current==='garage') renderGarage(); },4000); renderGarage(); }
function buy(kind,id){
  const item=kind==='veh'?VEH[id]:BLD[id]; if(!item) return;
  if(state.coins<item.price) return;
  if(pendingBuy!==kind+':'+id){ armBuy(kind+':'+id); return; }
  pendingBuy=null; state.coins-=item.price;
  if(kind==='veh'){ state.owned[id]=1; state.active=id; } else state.buildings[id]=1;
  save(true); Sound.play('buy'); toast(`${item.name} gehört jetzt dir!`); renderGarage(); drawHud();
}
function paint(id){
  const p=PNT[id]; if(!p) return;
  if(state.paints[id]){ state.paintOf[state.active]=id; save(true); Sound.play('tap'); renderGarage(); return; }
  if(state.coins<p.price){ toast(`Für ${p.name} fehlen noch ${p.price-state.coins} Münzen.`); return; }
  if(pendingBuy!=='paint:'+id){ armBuy('paint:'+id); return; }
  pendingBuy=null; state.coins-=p.price; state.paints[id]=1; state.paintOf[state.active]=id;
  save(true); Sound.play('buy'); toast(`Neue Farbe: ${p.name}!`); renderGarage(); drawHud();
}

/* ---------- parents ---------- */
function renderGate(){
  gateQ={a:12+rnd(8),b:3+rnd(6)};
  $('#screen-gate').innerHTML=`<div class="wrap"><div class="card gate"><div class="eyebrow">Eltern-Bereich</div>
    <h1 class="section-h" style="margin:0">Nur für Erwachsene</h1><p class="muted">Bitte löse diese Aufgabe:</p>
    <div class="q">${gateQ.a} × ${gateQ.b} = ?</div>
    <input class="field" id="gate-input" inputmode="numeric" autocomplete="off" aria-label="Ergebnis">
    <div class="err" id="gate-err"></div>
    <div class="ractions"><button class="btn btn-go" data-act="gate-check">Öffnen</button><button class="btn" data-act="home">Zurück</button></div></div></div>`;
  setTimeout(()=>{ const i=$('#gate-input'); if(i) i.focus(); },50);
}
function checkGate(){ const i=$('#gate-input'); if(!i) return; if(parseInt(i.value,10)===gateQ.a*gateQ.b){ resetArmed=false; show('parents'); } else { $('#gate-err').textContent='Das stimmt leider nicht.'; i.value=''; } }
const KINDS={pair:'Verliebte Zahlen',add:'Plus über die 10',sub:'Minus über die 10',fam:'Aufgabenfamilie',ana:'Analogieaufgabe',tens:'Zehnerzahlen',add100:'Plus bis 100',sub100:'Minus bis 100'};
function fmtKey(k){
  const i=k.indexOf(':'),kind=k.slice(0,i),r=k.slice(i+1),f=s=>s.replace('-',` ${MI} `).replace('+',' + ');
  switch(kind){
    case 'pair': return `${r} + □ = 10`;
    case 'fam': { const [x,y]=r.split('+').map(Number); return `${x}, ${y}, ${x+y}`; }
    case 'ana': return `${f(r)} → 1${f(r)}`;
    case 'tens': return f(r.replace(/\d+/g,m=>m+'0'));
    default: return f(r);
  }
}
function weekChart(){
  const days=[],now=new Date();
  for(let i=6;i>=0;i--){ const d=new Date(now); d.setDate(now.getDate()-i); const rec=state.days[dayKey(d)]; days.push({lab:WD[d.getDay()],min:rec?Math.floor(rec.sec/60):0,today:i===0}); }
  const goal=state.settings.goalMin,max=Math.max(goal,...days.map(d=>d.min),1)*1.2,Wd=440,base=150,top=22,bw=38,gap=(Wd-40-7*bw)/6,y=v=>base-(v/max)*(base-top);
  let s=`<svg viewBox="0 0 ${Wd} 180" class="wchart" role="img" aria-label="Übungsminuten der letzten 7 Tage">`;
  s+=`<line x1="20" x2="${Wd-20}" y1="${y(goal)}" y2="${y(goal)}" class="wc-goal"/><text x="${Wd-20}" y="${y(goal)-6}" text-anchor="end" class="wc-goaltxt">Ziel ${goal} Min</text>`;
  days.forEach((d,i)=>{ const x=20+i*(bw+gap),hh=base-y(d.min);
    if(hh>0) s+=`<rect x="${x}" y="${y(d.min)}" width="${bw}" height="${hh}" rx="6" class="wc-bar${d.min>=goal?' hit':''}${d.today?' today':''}"/>`;
    s+=`<text x="${x+bw/2}" y="${y(d.min)-6}" text-anchor="middle" class="wc-val">${d.min}</text><text x="${x+bw/2}" y="${base+20}" text-anchor="middle" class="wc-lab">${d.today?'Heute':d.lab}</text>`; });
  return s+`<line x1="16" x2="${Wd-16}" y1="${base}" y2="${base}" class="wc-axis"/></svg>`;
}
function renderParents(){
  const d=day(),weekSec=(()=>{ let s=0; const now=new Date(); for(let i=0;i<7;i++){ const x=new Date(now); x.setDate(now.getDate()-i); const r=state.days[dayKey(x)]; if(r) s+=r.sec; } return s; })();
  const rows=DISTRICTS.map(D=>{ const s=state.skill[D.id]||{n:0,f:0},pct=s.n?Math.round(s.f/s.n*100):null;
    return `<tr><td>${D.name}<br><small class="muted">${D.skill}</small></td><td>${s.n}</td><td>${pct==null?'<span class="muted">noch nicht geübt</span>':`<span class="acc"><i class="${pct<60?'low':pct<80?'mid':''}" style="width:${Math.max(4,pct*.8)}px"></i>${pct} %</span>`}</td></tr>`; }).join('');
  const trouble=Object.entries(state.facts).filter(([,f])=>f.w>0).sort((a,b)=>(b[1].w/b[1].n)-(a[1].w/a[1].n)||b[1].w-a[1].w).slice(0,10);
  const tl=trouble.length?`<ul class="trouble">${trouble.map(([k,f])=>`<li><div><div class="t-eq">${esc(fmtKey(k))}</div><div class="t-kind">${KINDS[k.split(':')[0]]||''}</div></div><span class="t-n">${f.w} von ${f.n} mit Fehler</span></li>`).join('')}</ul><p class="muted" style="margin-top:10px">Diese Aufgaben kommen in den Missionen automatisch öfter dran.</p>`:'<p class="muted">Noch keine Fehler gesammelt. Sobald Aufgaben schwerfallen, erscheinen sie hier.</p>';
  $('#screen-parents').innerHTML=`<div class="wrap"><div class="ghead"><button class="btn" data-act="home">${icon('back')} Zur Stadt</button><h1>Eltern-Bereich</h1></div>
  <div class="pgrid">
    <section class="card"><h2 class="section-h">Übungszeit</h2>
      <div class="stat-row"><div class="stat"><b>${Math.floor(d.sec/60)} Min</b><span>heute</span></div><div class="stat"><b>${d.tasks}</b><span>Aufgaben heute</span></div><div class="stat"><b>${Math.floor(weekSec/60)} Min</b><span>letzte 7 Tage</span></div><div class="stat"><b>${state.totalTasks}</b><span>Aufgaben gesamt</span></div></div>
      ${weekChart()}<p class="muted">Gezählt wird nur aktive Zeit in Missionen. Empfohlen sind 10 bis 15 Minuten pro Schultag.</p></section>
    <section class="card"><h2 class="section-h">Übt noch</h2>${tl}</section>
    <section class="card"><h2 class="section-h">Stadtteile</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Stadtteil</th><th>Aufgaben</th><th>Sofort richtig</th></tr></thead><tbody>${rows}</tbody></table></div></section>
    <section class="card"><h2 class="section-h">Einstellungen</h2>
      <div class="setting"><label for="name-input">Name des Kindes<small>Erscheint in der Begrüßung. Bleibt nur auf diesem Gerät.</small></label><input class="field" id="name-input" value="${esc(state.name)}" maxlength="20" autocomplete="off" placeholder="Vorname"></div>
      <div class="setting"><span class="lbl">Tagesziel<small>Bonus von 20 Münzen, wenn es erreicht ist</small></span><span class="seg">${[10,15,20].map(m=>`<button data-act="goal-min" data-v="${m}" class="${state.settings.goalMin===m?'on':''}">${m} Min</button>`).join('')}</span></div>
      <div class="setting"><span class="lbl">Ton</span><span class="seg"><button data-act="sound-set" data-v="1" class="${state.settings.sound?'on':''}">An</button><button data-act="sound-set" data-v="0" class="${state.settings.sound?'':'on'}">Aus</button></span></div>
      <div class="setting"><span class="lbl">Alle Stadtteile offen<small>Sonst öffnen sie nacheinander</small></span><span class="seg"><button data-act="unlock-set" data-v="1" class="${state.unlockedAll?'on':''}">Ja</button><button data-act="unlock-set" data-v="0" class="${state.unlockedAll?'':'on'}">Nein</button></span></div>
      <div class="setting"><span class="lbl">Speicherstand<small>${Cloud.status==='cloud'?'Auf diesem Gerät und in deinem Claude-Konto gesichert.':'Auf diesem Gerät im Browser gespeichert.'}</small></span>
        ${resetArmed?`<span style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-warn" data-act="reset-yes">Ja, alles löschen</button><button class="btn" data-act="reset-no">Abbrechen</button></span>`:'<button class="btn" data-act="reset">Fortschritt löschen</button>'}</div>
      ${resetArmed?'<p class="err">Münzen, Fahrzeuge, Sterne und Statistik werden gelöscht. Das lässt sich nicht rückgängig machen.</p>':''}
      <div class="setting"><span class="lbl">Als App auf dem iPad<small>In Safari auf „Teilen“ tippen, dann „Zum Home-Bildschirm“. Zehner-City öffnet sich dann wie eine App, und der Spielstand bleibt zuverlässig gespeichert.</small></span></div>
    </section>
    <section class="card method" style="grid-column:1/-1"><h2 class="section-h">Der Rechenweg der Schule</h2>
      <p><b>Verliebte Zahlen</b> ergeben zusammen immer 10: <span class="eqline">1 + 9, 2 + 8, 3 + 7, 4 + 6, 5 + 5</span>.</p>
      <p><b>Zehnerübergang:</b> erst bis zur 10, dann weiter. Die 2. Zahl wird so zerlegt, dass man erst bis zur 10 rechnet und dann den Rest addiert oder subtrahiert: <span class="eqline">8 + 9 = 8 + 2 + 7 = 17</span> und <span class="eqline">13 ${MI} 8 = 13 ${MI} 3 ${MI} 5 = 5</span>.</p>
      <p><b>Flexibel denken:</b> Aufgabenfamilien mit Tausch- und Umkehraufgaben, z. B. <span class="eqline">5 + 2 = 7</span> und <span class="eqline">7 ${MI} 2 = 5</span>.</p>
      <p><b>Analogieaufgaben:</b> <span class="eqline">4 + 5 = 9</span>, also <span class="eqline">14 + 5 = 19</span>. Im Zahlenraum bis 100 gilt derselbe Trick: <span class="eqline">38 + 5 = 38 + 2 + 3 = 43</span>.</p>
      <p class="muted">Hinweise im Spiel gehen in diesen Schritten vor. Nach drei Fehlversuchen wird die Lösung gezeigt und muss einmal eingetippt werden. Es gibt keine Zeitlimits.</p></section>
  </div></div>`;
}

/* ---------- hands-on crate loading ----------
   The concrete step before the written method. The child moves the crates;
   the rule "truck 1 first" (or "empty truck 2 first" for minus) makes the split at 10 happen. */
function initLoad(t){
  const L=t.load,ld={mode:L.mode,t1:[],t2:[],dock:0,out:0,target:0,acted:false,done:false,anim:null,pulse:0,msg:'',msgCls:''};
  if(L.mode==='add'){ for(let i=0;i<10;i++){ ld.t1.push(i<L.a?'a':'e'); ld.t2.push('e'); } ld.dock=L.b; ld.msg=`Lade die ${L.b} Kisten auf. Erst Laster 1!`; }
  else if(L.mode==='fill'){ for(let i=0;i<10;i++) ld.t1.push(i<L.n?'a':'e'); ld.dock=10-L.n+3; ld.msg='Mach Laster 1 voll!'; }
  else { for(let i=0;i<10;i++){ ld.t1.push(i<Math.min(L.a,10)?'n':'e'); ld.t2.push(i<L.a-10?'n':'e'); } ld.target=L.b; ld.msg=`Lade ${L.b} Kisten ab. Erst Laster 2!`; }
  return ld;
}
function loadSceneHTML(){
  const L=M.ld,cell=(k,t,i)=>k==='e'||k==='x'?{k:'e'}:{k,anim:!!(L.anim&&L.anim.t===t&&L.anim.i===i)};
  const c1=L.t1.map((k,i)=>cell(k,1,i)),c2=L.t2.map((k,i)=>cell(k,2,i)),full1=L.mode!=='sub'&&L.t1.indexOf('e')<0;
  let trucks=`<button class="truckbtn${L.pulse===1?' pulse':''}" data-act="load-truck" data-t="1" aria-label="Laster 1">${truckSVG(c1,1,full1)}</button>`;
  if(L.mode!=='fill') trucks+=`<button class="truckbtn${L.pulse===2?' pulse':''}" data-act="load-truck" data-t="2" aria-label="Laster 2">${truckSVG(c2,2,false)}</button>`;
  let pal='';
  if(L.mode==='sub'){ for(let i=0;i<L.target;i++) pal+=i<L.out?'<span class="dcrate"></span>':'<span class="dspot"></span>'; }
  else for(let i=0;i<L.dock;i++) pal+='<span class="dcrate" data-drag="1"></span>';
  L.anim=null; L.pulse=0;
  return `<div class="loadscene${L.mode==='sub'?' sub':''}"><div class="trucks">${trucks}</div><div class="dock"${L.mode==='sub'?' data-dock="1"':''}><span class="dock-label">${L.mode==='sub'?'Abladeplatz':'Ladeplatz'}</span><div class="pallet">${pal}</div></div></div>`;
}
function drawLoadBubble(el){
  const L=M.ld,mood=L.msgCls==='good'?'happy':L.msgCls==='hint'?'think':'';
  const tip=!L.acted&&M.ti===0?(L.mode==='sub'?'Tippe auf einen Laster oder zieh Kisten zum Abladeplatz.':'Tippe auf einen Laster oder zieh die Kisten hinauf.'):'';
  el.className='bubble'+(L.msgCls?' '+L.msgCls:'');
  el.innerHTML=`<span class="ava ${mood}">${fox(mood)}</span><div class="msg"><span class="main">${fmt(L.msg)}</span>${tip?`<span class="sub">${fmt(tip)}</span>`:''}</div>${Speech.ok?`<button class="iconbtn soft" data-act="speak" aria-label="Vorlesen">${icon('speaker')}</button>`:''}`;
  M.lastSpeech=L.msg;
}
function loadMsg(text,cls){ M.ld.msg=text; M.ld.msgCls=cls||''; drawBubble(); }
const lastIdx=(arr,k)=>arr.lastIndexOf(k);
function loadAct(t){
  if(!M||M.phase!=='load'||M.busy) return;
  const L=M.ld; if(L.done) return;
  L.acted=true;
  if(L.mode==='add'||L.mode==='fill'){
    if(L.dock<=0) return;
    const free1=L.t1.indexOf('e'),free2=L.t2.indexOf('e');
    if(t===1){
      if(free1<0){ loadMsg(L.mode==='fill'?'Laster 1 ist schon voll.':'Laster 1 ist voll. Lade auf Laster 2!','hint'); L.pulse=L.mode==='fill'?0:2; drawVisual(); return; }
      L.t1[free1]='b'; L.anim={t:1,i:free1};
    } else {
      if(free1>=0){ loadMsg('Erst Laster 1 voll machen!','hint'); L.pulse=1; Sound.play('wrong'); drawVisual(); return; }
      if(free2<0) return;
      L.t2[free2]='b'; L.anim={t:2,i:free2};
    }
    L.dock--; Sound.play('tap');
    const justFull=t===1&&L.t1.indexOf('e')<0;
    if(justFull){ setTimeout(()=>Sound.play('honk'),120); if(L.mode==='fill'){ drawVisual(); finishLoad(); return; } loadMsg('Laster 1 ist voll: 10! Der Rest kommt auf Laster 2.','good'); }
    else if(L.msgCls==='hint') loadMsg(L.t1.indexOf('e')<0?'Weiter auf Laster 2.':'Weiter so!','');
    drawVisual();
    if(L.mode==='add'&&L.dock===0) finishLoad();
  } else {
    if(L.out>=L.target) return;
    const last2=lastIdx(L.t2,'n'),last1=lastIdx(L.t1,'n');
    if(t===2){
      if(last2<0){ loadMsg('Laster 2 ist schon leer. Jetzt Laster 1!','hint'); L.pulse=1; drawVisual(); return; }
      L.t2[last2]='x'; L.anim={t:2,i:last2};
    } else {
      if(last2>=0){ loadMsg('Erst Laster 2 leer machen!','hint'); L.pulse=2; Sound.play('wrong'); drawVisual(); return; }
      if(last1<0) return;
      L.t1[last1]='x'; L.anim={t:1,i:last1};
    }
    L.out++; Sound.play('tap');
    if(t===2&&lastIdx(L.t2,'n')<0){ setTimeout(()=>Sound.play('honk'),120); loadMsg('Laster 2 ist leer! Auf Laster 1 sind 10. Weiter mit Laster 1.','good'); }
    else if(L.msgCls==='hint') loadMsg('Weiter so!','');
    drawVisual();
    if(L.out===L.target) finishLoad();
  }
}
function loadHint(){
  const L=M.ld; if(!L||L.done) return;
  if(L.mode==='sub'){ const two=lastIdx(L.t2,'n')>=0; L.pulse=two?2:1; loadMsg(two?'Tippe auf Laster 2, bis er leer ist.':'Jetzt von Laster 1 abladen.','hint'); }
  else { const one=L.t1.indexOf('e')>=0; L.pulse=one?1:2; loadMsg(one?'Tippe auf Laster 1, bis er voll ist.':'Jetzt kommt der Rest auf Laster 2.','hint'); }
  Sound.play('tap'); drawVisual();
}
function finishLoad(){
  const L=M.ld; L.done=true; M.busy=true;
  loadMsg(L.mode==='sub'?'Alles abgeladen!':L.mode==='fill'?'Voll! Jetzt sind 10 Kisten drauf.':'Alles geladen!','good');
  Sound.play('step'); burst($('#m-visual'),14);
  setTimeout(()=>{ if(!M||current!=='mission') return; M.busy=false; curTask().loadDone=true; M.phase='calc'; M.ld=null; M.lastVis=null; drawAll(); },1500);
}
let drag=null;
document.addEventListener('pointerdown',e=>{
  if(!M||M.phase!=='load'||current!=='mission'||!M.ld||M.ld.done) return;
  const sub=M.ld.mode==='sub'; let src=null,from=0;
  if(sub){ const tb=e.target.closest('.truckbtn'); if(tb){ src=tb; from=+tb.dataset.t; } }
  else src=e.target.closest('.dcrate[data-drag]');
  if(!src) return;
  const g=document.createElement('span'); g.className='dcrate ghost';
  drag={g,from,x0:e.clientX,y0:e.clientY,moved:false,id:e.pointerId,src};
  if(!sub) e.preventDefault();
});
document.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id) return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)>8){ drag.moved=true; fxLayer().appendChild(drag.g); if(!drag.from) drag.src.style.visibility='hidden'; }
  if(drag.moved){ drag.g.style.transform=`translate(${e.clientX-20}px,${e.clientY-20}px)`; e.preventDefault(); }
},{passive:false});
document.addEventListener('pointerup',e=>{
  if(!drag||e.pointerId!==drag.id) return;
  const d=drag; drag=null; d.g.remove(); if(d.src&&d.src.isConnected) d.src.style.visibility='';
  if(!M||M.phase!=='load') return;
  if(!d.moved){ if(!d.from) loadMsg('Zieh die Kiste auf einen Laster. Oder tippe auf den Laster.','hint'); return; }
  const el=document.elementFromPoint(e.clientX,e.clientY); if(!el) return;
  if(M.ld.mode==='sub'){ if(el.closest('[data-dock]')) loadAct(d.from); }
  else { const tb=el.closest('.truckbtn'); if(tb) loadAct(+tb.dataset.t); }
});
document.addEventListener('pointercancel',()=>{ if(drag){ drag.g.remove(); if(drag.src&&drag.src.isConnected) drag.src.style.visibility=''; drag=null; } });

/* ================= events ================= */
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-act]'); if(!el||el.disabled) return;
  lastInput=Date.now(); Sound.ensure();
  const act=el.dataset.act,id=el.dataset.id;
  switch(act){
    case 'home': show('city'); break;
    case 'district':{ const i=DISTRICTS.findIndex(D=>D.id===id); if(!districtUnlocked(i)){ toast(`Schaffe zuerst eine Mission in ${DISTRICTS[i-1].name}.`); return; } show('district',id); break; }
    case 'hq': if(!hqUnlocked()){ toast('Die Zentrale öffnet nach Mission 1 auf der Zehnerbrücke.'); return; } startMission('hq'); break;
    case 'garage': pendingBuy=null; show('garage'); break;
    case 'play': startMission(id,+el.dataset.mi||0); break;
    case 'intro-close': { const i=$('#m-intro'); if(i) i.remove(); break; }
    case 'load-truck': loadAct(+el.dataset.t); break;
    case 'play-rec':{ const r=recommended(); startMission(r.did,r.mi); break; }
    case 'replay': if(M) startMission(M.did,M.mi); break;
    case 'digit': pressDigit(el.dataset.d); break;
    case 'del': pressDel(); break;
    case 'ok': pressOk(); break;
    case 'hint': pressHint(); break;
    case 'speak': if(M) Speech.say(M.lastSpeech); break;
    case 'quit':{
      const btn=$('#quit-btn');
      if(quitArmed){ quitArmed=false; const did=M.did; clearTimeout(M.advanceTimer); M=null; if(did==='hq') show('city'); else show('district',did); return; }
      quitArmed=true; btn.classList.add('armed'); btn.textContent='Beenden?'; toast('Nochmal tippen zum Beenden. Deine Münzen bleiben.');
      setTimeout(()=>{ quitArmed=false; if(btn.isConnected){ btn.classList.remove('armed'); btn.innerHTML=icon('close'); } },3000); break; }
    case 'sound': state.settings.sound=!state.settings.sound; save(true); drawHud(); if(state.settings.sound) Sound.play('step'); break;
    case 'sound-set': state.settings.sound=el.dataset.v==='1'; save(true); drawHud(); renderParents(); break;
    case 'parents': show('gate'); break;
    case 'gate-check': checkGate(); break;
    case 'welcome-go': submitWelcome(false); break;
    case 'welcome-skip': submitWelcome(true); break;
    case 'buy': buy(el.dataset.kind,id); break;
    case 'select': if(state.owned[id]){ state.active=id; save(true); Sound.play('step'); renderGarage(); } break;
    case 'paint': paint(id); break;
    case 'goal-min': state.settings.goalMin=+el.dataset.v; save(true); renderParents(); drawHud(); break;
    case 'unlock-set': state.unlockedAll=el.dataset.v==='1'; save(true); renderParents(); break;
    case 'reset': resetArmed=true; renderParents(); break;
    case 'reset-no': resetArmed=false; renderParents(); break;
    case 'reset-yes':{ const name=state.name; state=defaultState(); state.name=name; resetArmed=false; save(true); toast('Fortschritt gelöscht.'); show('city'); break; }
  }
});
document.addEventListener('change',e=>{
  if(e.target&&e.target.id==='name-input'){ state.name=(e.target.value||'').trim().slice(0,20); state.nameAsked=true; save(true); toast(state.name?'Name gespeichert.':'Name entfernt.'); }
});
document.addEventListener('keydown',e=>{
  lastInput=Date.now();
  const tg=e.target&&e.target.tagName;
  if(tg==='INPUT'||tg==='TEXTAREA'){ if(e.key==='Enter'&&e.target.id==='gate-input') checkGate(); if(e.key==='Enter'&&e.target.id==='welcome-name'){ e.preventDefault(); submitWelcome(false); } return; }
  if(current!=='mission'||!M) return;
  if(/^[0-9]$/.test(e.key)){ e.preventDefault(); pressDigit(e.key); }
  else if(e.key==='Backspace'){ e.preventDefault(); pressDel(); }
  else if(e.key==='Enter'){ e.preventDefault(); pressOk(); }
});
document.addEventListener('pointerdown',()=>{ lastInput=Date.now(); },{passive:true});
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden'&&Cloud.ref&&Cloud.timer){ clearTimeout(Cloud.timer); Cloud.flush(); } });

/* Practice time: counts only while a mission is open, visible and touched within the last 90 s. */
setInterval(()=>{
  if(current!=='mission'||document.visibilityState!=='visible'||Date.now()-lastInput>90000) return;
  const d=day(); d.sec+=5;
  if(!d.goal&&d.sec>=state.settings.goalMin*60){ d.goal=1; state.coins+=20; save(true); toast(`Tagesziel geschafft! +20 Münzen`); Sound.play('coin'); bumpCoins(); }
  else persistLocal();
  drawHud();
},5000);

/* ================= boot ================= */
let booted=false;
function boot(data){
  if(booted) return; booted=true;
  try{
    if(data&&data.M&&!data.M.finished&&data.M.tasks){ M=data.M; M.advanceTimer=null; M.busy=false; M.intro=false; show('mission'); if(M.taskDone) M.advanceTimer=setTimeout(nextTask,800); }
    else if(data&&data.screen==='district'&&DIST[data.district]) show('district',data.district);
    else if(!state.name&&!state.nameAsked) show('welcome');
    else show('city');
  }catch(e){ M=null; show('city'); }
  Cloud.init();
}
const hot=window.claude&&window.claude.hot;
if(hot&&typeof hot.snapshot==='function'){ try{ hot.snapshot(()=>({screen:current,district:curDistrict,M:M&&!M.finished?Object.assign({},M,{advanceTimer:null}):null})); }catch(e){} }
if(hot&&typeof hot.ready==='function'){ try{ hot.ready(boot); }catch(e){ boot({}); } setTimeout(()=>boot({}),1500); }
else boot((hot&&hot.data)||{});
/* development helper, only on a local test server */
if(location.hostname==='localhost') window.__zc={startMission,show,loadAct,pressDigit,pressOk,get M(){ return M; },curBlank:()=>curBlank()};
})();
