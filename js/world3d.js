// 3D worlds for Zehner-City. Three.js r160 + Kenney CC0 models (assets/models).
// Numbers are crates: one crate is 1, a full carrier holds 10 in two rows of five (like the Zehnerfeld).
// Every district has its own carrier: boat, truck, mine cart, tractor trailer, forklift pallet, freight wagon.
// For every step of a task a layout is computed; crates and carriers move smoothly between layouts.
// Three.js from jsDelivr as ES modules (+esm links share one copy of three, no import map needed)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js/+esm';
import {RoundedBoxGeometry} from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js/+esm';

const MODELS = new URL('../assets/models/', import.meta.url).href;
const EXT = window.ZC_MODEL_EXT || '.glb'; // the Claude artifact copy serves the same models as .json (glTF)
const loader = new GLTFLoader();
const cache = new Map();
const wait = ms => new Promise(r => setTimeout(r, ms));
async function fetchModel(name){
  for(let i=0;;i++){
    try{ const g = await loader.loadAsync(MODELS + name + EXT); g.scene.traverse(o => { if(o.isMesh){ o.castShadow = true; o.receiveShadow = true; } }); return g.scene; }
    catch(e){ if(i>=2) throw e; await wait(500*(i+1)); }   // shaky connections: try three times
  }
}
function load(name){
  if(!cache.has(name)) cache.set(name, fetchModel(name).catch(e => { cache.delete(name); throw e; }));
  return cache.get(name);
}
const models = {};
// Scenery may be missing (it is skipped); only the models a carrier is made of are required.
async function need(list, required){
  const res = await Promise.allSettled(list.map(async n => { models[n] = await load(n); }));
  const bad = list.filter((n,i) => res[i].status==='rejected');
  if(bad.length) console.warn('models not loaded', bad);
  const miss = (required||[]).filter(n => !models[n]);
  if(miss.length) throw new Error('required models missing: '+miss.join(', '));
}
const inst = name => models[name].clone(true);

/* ---------- carriers: 10 slots in two rows of five ---------- */
const CS = 0.86; // crate size in world units
const UP = new THREE.Vector3(0,1,0);
// length = extent along x (the front points to +x, towards the crate pad), width = extent along z.
// slot(j,row): j = 0..4 from left to right, row 0 = back row (filled first), in model units * s.
const CARRIER = {
  truck:    { model:'car/delivery-flat', s:2.4, deck:.5, rotY:Math.PI/2, length:7.8, width:3.6, slot:(j,row)=>({x:row?-.29:.29, z:-1.4+j*.4}), hit:[8.2,3.4,3.8], plate:[2.55,1.75,1.83] },
  wagon:    { build:()=>buildWagon(), s:1, deck:1.17, rotY:0, length:6.4, width:2.5, slot:(j,row)=>({x:-1.96+j*.98, z:row?.5:-.5}), hit:[6.6,3.2,2.9], rails:.72, tenGap:.2, tenCols:5, plate:[-2.35,.93,1.18,.36] },
  boat:     { build:()=>buildBoat(), s:1, deck:.47, rotY:0, length:8.6, width:3.2, slot:(j,row)=>({x:.2-1.96+j*.98, z:row?.5:-.5}), hit:[8.8,3.2,3.6], plate:[-1.0,.62,1.58,.5], tenGap:1.1 },
  lore:     { build:()=>buildLore(), s:1, deck:.97, rotY:0, length:6.0, width:2.5, slot:(j,row)=>({x:-1.96+j*.98, z:row?.5:-.5}), hit:[6.4,3,2.9], rails:.72, tenGap:.4, plate:[-2.25,1.22,1.25,.46] },
  trailer:  { build:()=>buildTrailer(), models:['car/tractor'], s:1, deck:1.02, rotY:0, length:9.7, width:3.0, slot:(j,row)=>({x:-2.25-1.96+j*.98, z:row?.5:-.5}), hit:[9.9,3.4,3.2], plate:[-4.5,1.17,1.26,.3] },
  forklift: { build:()=>buildForklift(), s:1, deck:.55, rotY:0, length:7.8, width:2.6, slot:(j,row)=>({x:-1.2-1.96+j*.98, z:row?.5:-.5}), hit:[8,3.6,3], plate:[2.98,1.1,1.03,.55] },
};
const WORLD = {
  harbor:  { carrier:'boat',     ground:'#e2cd98', water:true,  pad:'pier',           sky:'#bfe3f2' },
  bridge:  { carrier:'truck',    ground:'#86a95d', water:true,  pad:'roads/tile-low', sky:'#cfe6f2' },
  tunnel:  { carrier:'lore',     ground:'#8fa766', water:false, pad:'roads/tile-low', sky:'#d3e4ec' },
  suburb:  { carrier:'trailer',  ground:'#8db063', water:false, pad:'roads/tile-low', sky:'#d6ebf3' },
  tower:   { carrier:'forklift', ground:'#b9b7b0', water:false, pad:'roads/tile-low', sky:'#d0dfe8' },
  station: { carrier:'wagon',    ground:'#a9a88f', water:false, pad:'roads/tile-low', sky:'#d4e2ea' },
};
const DECOR = {
  harbor:['pirate/ship-small','pirate/palm-straight','pirate/palm-bend','pirate/palm-detailed-straight','pirate/rocks-sand-a','pirate/rocks-sand-b','pirate/barrel','pirate/chest','pirate/flag-high-pennant','pirate/tower-watch','pirate/structure-platform-dock','pirate/structure-fence'],
  bridge:['roads/road-bridge','roads/bridge-pillar-wide','roads/road-straight','nature/tree_oak','nature/tree_default','nature/rock_largeA','nature/plant_bush','car/sedan','car/van','roads/light-square'],
  tunnel:['nature/cliff_cave_rock','nature/cliff_large_rock','nature/cliff_block_rock','nature/cliff_top_rock','roads/road-straight','nature/tree_pineRoundA','nature/tree_pineTallA','nature/rock_largeB','roads/construction-cone','nature/plant_bushLarge'],
  suburb:['suburban/building-type-a','suburban/building-type-b','suburban/building-type-c','suburban/building-type-d','suburban/building-type-e','suburban/building-type-f','suburban/tree-large','suburban/tree-small','suburban/fence-1x3','suburban/planter','roads/road-straight'],
  tower:['commercial/building-skyscraper-a','commercial/building-skyscraper-b','commercial/building-skyscraper-c','commercial/building-skyscraper-d','commercial/building-a','commercial/building-c','commercial/detail-parasol-a','nature/tree_default','roads/light-curved','car/taxi'],
  station:['train/train-locomotive-a','train/railroad-straight','commercial/building-b','commercial/building-d','commercial/building-e','nature/tree_fat','nature/tree_default','train/train-carriage-container-red','train/train-carriage-box','roads/light-square'],
};
const BASE_MODELS = ['roads/tile-low','pirate/structure-platform-dock-small','nature/grass_large','nature/grass','nature/flower_yellowA','nature/flower_redA'];

/* ---------- engine ---------- */
let C = null;
export function dispose(){
  if(!C) return;
  cancelAnimationFrame(C.raf); C.alive = false;
  try{ C.ro && C.ro.disconnect(); }catch(e){}
  try{ C.renderer.dispose(); C.renderer.forceContextLoss && C.renderer.forceContextLoss(); C.renderer.domElement.remove(); }catch(e){}
  C = null;
}
function dark(){ const t=document.documentElement.getAttribute('data-theme'); if(t) return t==='dark'; try{ return matchMedia('(prefers-color-scheme: dark)').matches; }catch(e){ return false; } }

function makeEngine(host){
  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.innerHTML = ''; host.appendChild(renderer.domElement);
  const cam = new THREE.PerspectiveCamera(32, 1, .5, 400);
  const E = { host, renderer, cam, scene:null, world:null, alive:true, raf:0, last:0, tweens:[], byId:new Map(), slots:{1:[],2:[]}, pallet:[], tens:new Map(), carriers:{}, ghosts:[], spots:[], hl:[], badge:null,
    drag:null, pending:null, key:null, user:{zoom:1,px:0,pz:0}, ptrs:new Map(), pinch:null, pan:null, snap:false, bounds:{hw:10,hd:6}, frameIns:null, ctl:null, phase:null, camGoal:{x:0,z:0,d:30}, camCur:null, ray:new THREE.Raycaster(), ndc:new THREE.Vector2(), dragPlane:new THREE.Plane(new THREE.Vector3(0,1,0),-2.6), tmp:new THREE.Vector3(), v:new THREE.Vector3(), api:null, view:null, water:null, pulse:null, bounce:null };
  const resize = () => { const r = host.getBoundingClientRect(); if(!r.width || !r.height) return; renderer.setSize(r.width, r.height, false); cam.aspect = r.width / r.height; cam.updateProjectionMatrix(); if(E.lastLay) frame(E.lastLay); E.camCur = null; };
  E.resize = resize; resize();
  try{ E.ro = new ResizeObserver(resize); E.ro.observe(host); }catch(e){}
  const el = renderer.domElement;
  el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove); el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onCancel);
  el.addEventListener('wheel', e => { if(!C) return; e.preventDefault(); C.api && C.api.touch(); zoomBy(Math.exp(e.deltaY * (e.ctrlKey ? .01 : .0015))); }, {passive:false});
  const ctl = document.createElement('div'); ctl.className = 'w3-ctl';
  const ico = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  ctl.innerHTML = `<button type="button" data-z="in" aria-label="Näher heran">${ico('M12 5v14M5 12h14')}</button><button type="button" data-z="out" aria-label="Weiter weg">${ico('M5 12h14')}</button><button type="button" data-z="reset" aria-label="Ansicht zurücksetzen" hidden>${ico('M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5M9 12h6M12 9v6')}</button>`;
  ctl.addEventListener('pointerdown', ev => ev.stopPropagation());
  ctl.addEventListener('click', ev => { const b = ev.target.closest('button'); if(!b || !C) return; C.api && C.api.touch(); const k = b.dataset.z; if(k==='in') zoomBy(.72, true); else if(k==='out') zoomBy(1.38, true); else resetView(); });
  host.appendChild(ctl); E.ctl = ctl;
  el.addEventListener('contextmenu', e => e.preventDefault());
  return E;
}

function textureCanvas(w, h, draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'), w, h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
function rng(seed){ let a=seed|0; return () => { a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function place(name, x, z, s, ry, y){ if(!models[name]){ console.warn('model not loaded', name); return new THREE.Group(); } const o=inst(name); o.position.set(x, y||0, z); o.scale.setScalar(s); o.rotation.y=ry||0; C.scene.add(o); return o; }

function buildWorld(id){
  const W = WORLD[id], D = dark(), r = rng(id.length*97+3);
  const scene = new THREE.Scene();
  const sky = new THREE.Color(D ? '#3a4560' : W.sky);
  scene.background = sky; scene.fog = new THREE.Fog(sky, 55, 120);
  scene.add(new THREE.HemisphereLight(D?'#aab6e8':'#fff8ee', D?'#2e2a22':'#7d7058', D?1.1:1.6));
  const sun = new THREE.DirectionalLight(D?'#ffcf9e':'#fff2df', D?1.6:2.6);
  sun.position.set(-14, 26, 16); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048);
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .03;
  Object.assign(sun.shadow.camera, {left:-28, right:30, top:22, bottom:-24, near:1, far:90});
  scene.add(sun);
  C.scene = scene; C.world = id; C.sun = sun;
  const groundTex = textureCanvas(256,256,(g,w,h)=>{ g.fillStyle='#ffffff'; g.fillRect(0,0,w,h); for(let i=0;i<2600;i++){ const l=Math.random(); g.fillStyle=l<.5?'rgba(0,0,0,.05)':'rgba(255,255,255,.08)'; const s=1+Math.random()*3; g.fillRect(Math.random()*w,Math.random()*h,s,s); } });
  groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping; groundTex.repeat.set(26,26);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240,240), new THREE.MeshStandardMaterial({color:new THREE.Color(D?shade(W.ground,.55):W.ground), map:groundTex, roughness:.95}));
  ground.rotation.x = -Math.PI/2; ground.position.set(0,0,-20); ground.receiveShadow = true; scene.add(ground);
  if(W.water){
    const wt = textureCanvas(256,256,(g,w,h)=>{ g.fillStyle='#ffffff'; g.fillRect(0,0,w,h); g.strokeStyle='rgba(255,255,255,.0)'; for(let i=0;i<70;i++){ const x=Math.random()*w,y=Math.random()*h,l=10+Math.random()*28; g.strokeStyle=`rgba(${190+Math.random()*40},${235},${255},.55)`; g.lineWidth=1.4; g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+l/2,y-3,x+l,y); g.stroke(); } });
    wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(10,10);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(240, id==='harbor'?240:16, 60, 30), new THREE.MeshStandardMaterial({color:D?'#2c6f86':'#3aa7c4', map:wt, roughness:.18, metalness:.05, transparent:true, opacity:.94}));
    water.rotation.x = -Math.PI/2; water.receiveShadow = true;
    if(id==='harbor'){ water.position.set(0,.05,-20); } else { water.position.set(0,.05,-24); }
    scene.add(water); C.water = water;
    if(id==='harbor'){ const sandTex=groundTex.clone(); sandTex.needsUpdate=true; sandTex.repeat.set(8,10);
      for(const [x0,x1] of [[-80,-12.5],[11.6,80]]){ const beach=new THREE.Mesh(new RoundedBoxGeometry(x1-x0, .8, 100, 2, .3), new THREE.MeshStandardMaterial({color:new THREE.Color(D?shade(W.ground,.55):W.ground), map:sandTex, roughness:.95})); beach.position.set((x0+x1)/2, -.08, -20); beach.receiveShadow=true; scene.add(beach); } }
  } else C.water = null;
  // grass tufts and flowers around the yard
  for(let i=0;i<90;i++){ const x=(r()-.5)*80, z=10-r()*50; if(id==='harbor') continue; if(W.water&&z<-15&&z>-33) continue; if(Math.abs(x)<17&&z>-15&&z<9) continue; place(r()<.8?'nature/grass_large':(r()<.5?'nature/flower_yellowA':'nature/flower_redA'), x, z, 2.2+r()*1.6, r()*6); }
  decorate(id, r);
}
function shade(hex,k){ const c=new THREE.Color(hex); c.multiplyScalar(k); return '#'+c.getHexString(); }
function decorate(id, r){
  // play area: x -7..9, z -6..5 (more to the back when full trucks are parked)
  const trees = (pts, kinds, s) => pts.forEach(([x,z]) => place(kinds[Math.floor(r()*kinds.length)], x, z, s*(.85+r()*.35), r()*6));
  if(id==='harbor'){
    place('pirate/ship-small', 2, -22, 1.45, .2);
    place('pirate/structure-platform-dock', -15.5, -15, 2.4); place('pirate/structure-platform-dock', 16, -15, 2.4);
    place('pirate/tower-watch', 16.5, -7, 2.3, -.5, .32);
    place('pirate/flag-high-pennant', -14.5, -10, 2.5, 0, .32);
    trees([[-15,-3],[-16.5,3.5],[15.5,2.2],[16.5,7]], ['pirate/palm-bend','pirate/palm-straight','pirate/palm-detailed-straight'], 2.6);
    [[-14.4,-7.6],[-15.8,-8.1],[-15,-6.4],[13.6,-9.2],[14.8,-8.7]].forEach(([x,z],i)=>place('pirate/barrel',x,z,2.1,i,.32));
    place('pirate/chest',14.2,5.2,2.2,.4,.32); place('pirate/structure-fence',-14,0,2.4,Math.PI/2,.32);
  } else if(id==='bridge'){
    for(let i=-7;i<=7;i++) place('roads/road-bridge', i*6, -22, 6, Math.PI/2);
    for(let i=-6;i<=6;i+=3) place('roads/bridge-pillar-wide', i*6, -22, 6, Math.PI/2);
    place('car/sedan', -6, -22.6, 2.3, Math.PI/2, 2.6); place('car/van', 9, -21.4, 2.3, -Math.PI/2, 2.6);
    trees([[-12,-9],[-14,-2],[14.5,-9],[16,-2],[-13,5],[15,6],[-24,-33],[-6,-35],[12,-34],[28,-32]], ['nature/tree_oak','nature/tree_default'], 3.6);
    place('nature/rock_largeA',-11,7,2.6,1); place('nature/plant_bush',13,7.5,3,2); place('roads/light-square',-10,-12,3.3); place('roads/light-square',12,-12,3.3);
  } else if(id==='tunnel'){
    place('nature/cliff_large_rock', -12, -14, 8); place('nature/cliff_cave_rock', -1, -14, 8); place('nature/cliff_large_rock', 10, -14, 8);
    place('nature/cliff_block_rock', -21, -13, 8); place('nature/cliff_block_rock', 19, -13, 8);
    place('nature/cliff_top_rock', -6, -22, 8); place('nature/cliff_top_rock', 6, -22, 8);
    trees([[-12,-9],[-14,-1],[14,-10],[16,-2],[-14,6],[16,6]], ['nature/tree_pineRoundA','nature/tree_pineTallA'], 3.6);
    place('nature/rock_largeB',-11,7,2.6,1); place('roads/construction-cone',-4,-11,3); place('roads/construction-cone',4,-11,3); place('nature/plant_bushLarge',12,7,3,2);
  } else if(id==='suburb'){
    const houses=['suburban/building-type-a','suburban/building-type-b','suburban/building-type-c','suburban/building-type-d','suburban/building-type-e','suburban/building-type-f'];
    for(let i=0;i<6;i++){ place(houses[i], -26+i*10.5, -19, 5, Math.PI); place('suburban/fence-1x3', -26+i*10.5, -13.8, 5, Math.PI); }
    for(let i=0;i<9;i++) place('roads/road-straight', -32+i*8, -10.5, 8, Math.PI/2);
    trees([[-13,-4],[-14,3],[15,-4],[16,3],[-13,8],[15,8]], ['suburban/tree-large','suburban/tree-small'], 4.6);
    place('suburban/planter',-11,6,4.3); place('suburban/planter',12,-1,4.3);
  } else if(id==='tower'){
    const sky=['commercial/building-skyscraper-a','commercial/building-skyscraper-b','commercial/building-skyscraper-c','commercial/building-skyscraper-d','commercial/building-a','commercial/building-c'];
    [[-24,-24],[-12,-27],[0,-25],[12,-28],[24,-24],[36,-27]].forEach(([x,z],i)=>place(sky[i],x,z,7.2));
    place('commercial/detail-parasol-a',-12,5,4); place('commercial/detail-parasol-a',14,6,4);
    trees([[-13,-6],[15,-6],[-14,1],[16,1]], ['nature/tree_default'], 3.4);
    place('car/taxi',-8,-15,2.4,Math.PI/2); place('roads/light-curved',12,-14,3.3);
  } else if(id==='station'){
    for(let i=-9;i<=9;i++){ place('train/railroad-straight', i*4.4, -17, 4.4, Math.PI/2); place('train/railroad-straight', i*4.4, -21.5, 4.4, Math.PI/2); }
    place('train/train-locomotive-a', 9, -17, 2.3, Math.PI/2);
    place('train/train-carriage-container-red', 3, -17, 2.3, Math.PI/2); place('train/train-carriage-box', -3, -17, 2.3, Math.PI/2); place('train/train-carriage-container-red', -9, -17, 2.3, Math.PI/2);
    [[-22,-31,'commercial/building-b'],[-8,-33,'commercial/building-d'],[7,-32,'commercial/building-e'],[22,-31,'commercial/building-b']].forEach(([x,z,m])=>place(m,x,z,7));
    trees([[-14,5],[16,5],[-15,-5],[17,-5]], ['nature/tree_fat','nature/tree_default'], 3.3);
    place('roads/light-square',-12,-11,3.3); place('roads/light-square',13,-11,3.3);
  }
}

/* ---------- vehicles built from simple shapes (sized for exactly 2 x 5 crates) ---------- */
const _mats = new Map();
function mat(color, rough){ const k=color+(rough||.7); if(!_mats.has(k)) _mats.set(k, new THREE.MeshStandardMaterial({color, roughness:rough||.7})); return _mats.get(k); }
function part(geo, color, x, y, z, parent, rough){ const m=new THREE.Mesh(geo, mat(color, rough)); m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; parent.add(m); return m; }
function box(w, h, d, color, x, y, z, parent, r){ const rr=Math.min(r==null?.04:r, w/2-.001, h/2-.001, d/2-.001); return part(rr>.004 ? new RoundedBoxGeometry(w, h, d, 2, rr) : new THREE.BoxGeometry(w, h, d), color, x, y, z, parent); }
function wheel(r, t, x, y, z, parent, color){ const g=new THREE.Group(); g.position.set(x,y,z); parent.add(g);
  const tire=part(new THREE.CylinderGeometry(r, r, t, 18), color||'#2b2c31', 0,0,0, g, .9); tire.rotation.x=Math.PI/2;
  const hub=part(new THREE.CylinderGeometry(r*.48, r*.48, t+.02, 12), '#b9bcc4', 0,0,0, g, .5); hub.rotation.x=Math.PI/2; return g; }
function hullShape(x0, x1, xb, hw, rs){ const s=new THREE.Shape(); s.moveTo(x0,-hw); s.lineTo(x1,-hw); s.quadraticCurveTo(xb-.35,-hw*.9, xb,0); s.quadraticCurveTo(xb-.35,hw*.9, x1,hw); s.lineTo(x0,hw); s.quadraticCurveTo(x0-rs,0, x0,-hw); return s; }
function extrudeUp(shape, depth, color, y, parent){ const geo=new THREE.ExtrudeGeometry(shape,{depth, bevelEnabled:true, bevelThickness:.05, bevelSize:.05, bevelSegments:2, curveSegments:14}); geo.rotateX(-Math.PI/2); return part(geo, color, 0, y, 0, parent, .55); }
function buildBoat(){
  const g=new THREE.Group();
  extrudeUp(hullShape(-4.2, 2.5, 4.3, 1.5, .25), .72, '#2f5577', -.32, g);              // hull below the deck
  const rim=hullShape(-4.2, 2.5, 4.3, 1.5, .25); rim.holes.push(hullShape(-3.98, 2.45, 3.92, 1.3, .2));
  extrudeUp(rim, .4, '#f3efe4', .4, g);                                                     // white gunwale
  extrudeUp(hullShape(-4.25, 2.5, 4.36, 1.54, .25), .05, '#c2543f', .38, g);               // red stripe
  const deck=part(new THREE.ShapeGeometry(hullShape(-3.98, 2.45, 3.92, 1.3, .2)), '#c89b64', 0, .47, 0, g, .8); deck.rotation.x=-Math.PI/2;
  box(1.35, 1.15, 2.0, '#f3efe4', -3.25, 1.02, 0, g, .06);                                  // wheelhouse
  box(1.37, .3, 2.02, '#33465c', -3.25, 1.26, 0, g, .03);                                    // windows
  box(1.6, .12, 2.25, '#2f5577', -3.25, 1.66, 0, g, .04);                                    // roof
  part(new THREE.CylinderGeometry(.05, .05, 1.2, 8), '#5b4a3a', -3.5, 2.3, 0, g);           // mast
  const flag=new THREE.Shape(); flag.moveTo(0,0); flag.lineTo(.62,-.18); flag.lineTo(0,-.36);
  const f=part(new THREE.ShapeGeometry(flag), '#e0533e', -3.48, 2.86, 0, g); f.material.side=THREE.DoubleSide;
  const ring=part(new THREE.TorusGeometry(.24, .075, 8, 20), '#f08a2c', -2.9, 1.0, 1.03, g, .6);
  return g;
}
function buildLore(){
  const g=new THREE.Group(), rust='#b7653c', dk='#7a4328', steel='#40434a';
  box(5.0, .22, 1.1, steel, 0, .62, 0, g);
  for(const x of [-1.75, 1.75]) for(const z of [-.72, .72]) wheel(.34, .16, x, .52, z, g, '#33353b');
  box(5.7, .14, 2.45, rust, 0, .9, 0, g, .03);                                               // floor
  for(const z of [-1.16, 1.16]) box(5.7, .5, .13, rust, 0, 1.22, z, g, .03);                // sides
  for(const x of [-2.79, 2.79]) box(.13, .5, 2.45, rust, x, 1.22, 0, g, .03);               // ends
  for(const z of [-1.18, 1.18]) box(5.76, .08, .17, dk, 0, 1.48, z, g, .02);                // rim
  for(const x of [-2.82, 2.82]) box(.17, .08, 2.5, dk, x, 1.48, 0, g, .02);
  for(const x of [-1.4, 0, 1.4]) for(const z of [-1.24, 1.24]) box(.14, .5, .04, dk, x, 1.22, z, g, .01);
  for(const x of [-2.95, 2.95]) box(.3, .14, .3, steel, x, .66, 0, g);                       // couplers
  return g;
}
function buildTrailer(){
  const g=new THREE.Group(), wood='#b9874f', board='#3f6b4a', steel='#3c3f45';
  box(5.4, .18, 2.5, wood, -2.25, .92, 0, g, .03);                                           // bed
  for(let i=-2;i<=2;i++) box(.04, .01, 2.46, '#8d6236', -2.25+i*1.05, 1.015, 0, g, 0);
  for(const z of [-1.2, 1.2]) box(5.4, .32, .1, board, -2.25, 1.17, z, g, .03);             // low side boards
  box(.1, .32, 2.5, board, -4.9, 1.17, 0, g, .03); box(.1, .55, 2.5, board, .4, 1.28, 0, g, .03);
  box(4.6, .22, .9, steel, -2.25, .7, 0, g);
  for(const x of [-3.35, -1.15]) for(const z of [-1.08, 1.08]) wheel(.45, .3, x, .45, z, g);
  box(1.0, .12, .14, steel, .95, .6, 0, g, .02);                                             // drawbar
  if(models['car/tractor']){ const t=inst('car/tractor'); t.scale.setScalar(1.6); t.rotation.y=Math.PI/2; t.position.set(1.35+1.101*1.6, 0, 0); g.add(t); }
  return g;
}
function buildForklift(){
  const g=new THREE.Group(), yel='#efb233', dyel='#c98d22', dark='#34363b', wood='#caa06b', dwood='#a57b4a';
  for(const z of [-.55, .55]) box(4.1, .07, .26, '#5a5d63', -.55, .24, z, g, .02);             // forks
  for(const z of [-.98, 0, .98]) box(5.3, .2, .34, dwood, -1.2, .37, z, g, .03);            // pallet blocks
  for(let i=0;i<8;i++) box(.56, .07, 2.3, wood, -1.2-2.36+i*.674, .51, 0, g, .02);         // pallet boards
  for(const z of [-.62, .62]) box(.14, 3.0, .16, dark, 1.68, 1.6, z, g, .03);                // mast
  for(const y of [1.0, 2.1, 3.05]) box(.12, .1, 1.4, dark, 1.68, y, 0, g, .02);
  box(.1, .9, 1.5, dark, 1.55, .66, 0, g, .02);                                              // backrest
  box(1.75, 1.05, 2.0, yel, 2.65, .98, 0, g, .12);                                           // body
  box(.5, 1.2, 2.0, dyel, 3.6, 1.06, 0, g, .12);                                             // counterweight
  box(.55, .14, .7, dark, 2.95, 1.58, 0, g, .05); box(.12, .55, .6, dark, 3.2, 1.86, 0, g, .04); // seat
  part(new THREE.CylinderGeometry(.05, .05, .7, 8), dark, 2.25, 1.75, 0, g).rotation.z=.5;   // steering column
  for(const x of [2.05, 3.45]) for(const z of [-.88, .88]) box(.09, 1.45, .09, dark, x, 2.2, z, g, .02);
  box(1.6, .09, 1.95, dark, 2.75, 2.95, 0, g, .03);                                           // roof guard
  box(.22, .16, .22, '#f2761f', 3.3, 3.07, 0, g, .05);                                       // beacon
  for(const z of [-1.0, 1.0]){ wheel(.42, .32, 2.2, .42, z, g); wheel(.34, .28, 3.45, .34, z*.96, g); }
  return g;
}
function buildWagon(){
  const g=new THREE.Group(), red='#8e3a2c', dk='#3a3d44', wood='#b98a55';
  for(const x of [-2.05, 2.05]){ box(1.8, .26, 1.3, dk, x, .62, 0, g); for(const dx of [-.5, .5]) for(const z of [-.72, .72]) wheel(.3, .14, x+dx, .48, z, g, '#30323a'); }
  box(6.0, .3, 2.3, red, 0, .92, 0, g, .04);                                                   // frame
  box(5.9, .1, 2.5, wood, 0, 1.12, 0, g, .02);                                                 // deck
  for(let i=-2;i<=2;i++) box(.03, .01, 2.46, '#8d6236', i*1.18, 1.175, 0, g, 0);
  for(const x of [-2.9, 2.9]) for(const z of [-1.17, 1.17]) box(.12, .5, .12, red, x, 1.4, z, g, .03); // corner stakes
  for(const x of [-3.1, 3.1]) for(const z of [-.62, .62]){ const b=part(new THREE.CylinderGeometry(.13, .13, .24, 10), dk, x, .92, z, g); b.rotation.z=Math.PI/2; } // buffers
  return g;
}
function addRails(g, def, len){
  const L=len||def.length+1.4, gz=def.rails;
  for(let x=-L/2+.3; x<L/2; x+=.72) box(.32, .08, gz*2+.6, '#6e5640', x, .04, 0, g, .02);
  for(const z of [-gz, gz]) box(L, .1, .1, '#8b8f97', 0, .13, z, g, .02);
}
function plateTex(n){ return textureCanvas(128,128,(c,w,h)=>{ c.fillStyle='#fffaf0'; c.beginPath(); c.roundRect(6,6,w-12,h-12,22); c.fill(); c.lineWidth=8; c.strokeStyle='#26324a'; c.stroke(); c.fillStyle='#26324a'; c.font='800 86px Lexend, system-ui, sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(String(n), w/2, h/2+6); }); }

/* ---------- carriers and crates ---------- */
function carrierDef(){ return CARRIER[WORLD[C.world].carrier]; }
function makeCarrier(num, full, kind, scaleK, noRails){
  const def = carrierDef(), g = new THREE.Group(), body = def.build ? def.build() : inst(def.model);
  if(!def.build){ body.scale.setScalar(def.s); body.rotation.y = def.rotY; }
  g.add(body); g.userData.num = num; g.userData.def = def;
  if(def.rails && !noRails) addRails(g, def, scaleK ? def.length + (def.tenGap||.2)/scaleK : 0);
  if(num && def.plate){ const ps = def.plate[3]||.62, pl = new THREE.Mesh(new THREE.PlaneGeometry(ps,ps), new THREE.MeshStandardMaterial({map:plateTex(num), roughness:.6})); pl.position.set(def.plate[0], def.plate[1], def.plate[2]); g.add(pl); }
  const hit = new THREE.Mesh(new THREE.BoxGeometry(def.hit[0], def.hit[1], def.hit[2]), new THREE.MeshBasicMaterial({visible:false}));
  hit.position.y = 1.4; hit.userData.carrier = num; g.add(hit); g.userData.hit = hit;
  if(full){ const mat = crateMat(kind); for(let i=0;i<10;i++){ const m = new THREE.Mesh(crateGeo(), mat); m.castShadow=true; const p = slotLocal(def,i); m.position.copy(p); m.scale.setScalar(CS); g.add(m); } g.userData.crateMat = mat; }
  g.scale.setScalar(scaleK || 1);
  C.scene.add(g); return g;
}
function slotLocal(def,i){ const s = def.slot(i%5, i<5?0:1); return new THREE.Vector3(s.x*def.s, def.deck*def.s + CS/2, s.z*def.s).applyAxisAngle(UP, def.rotY); }
let _crateGeo = null, _crateTex = null;
function crateGeo(){ if(!_crateGeo) _crateGeo = new RoundedBoxGeometry(1, 1, 1, 3, .09); return _crateGeo; }
function crateTex(){
  if(_crateTex) return _crateTex;
  _crateTex = textureCanvas(128,128,(g,w,h)=>{
    g.fillStyle='#ffffff'; g.fillRect(0,0,w,h);
    g.fillStyle='rgba(0,0,0,.08)'; for(let y=0;y<h;y+=32) g.fillRect(0,y+30,w,2);
    g.strokeStyle='rgba(0,0,0,.22)'; g.lineWidth=12; g.strokeRect(8,8,w-16,h-16);
    g.lineWidth=9; g.beginPath(); g.moveTo(16,h-16); g.lineTo(w-16,16); g.stroke();
    g.fillStyle='rgba(255,255,255,.22)'; g.fillRect(14,14,w-28,4);
    for(let i=0;i<220;i++){ g.fillStyle=`rgba(0,0,0,${Math.random()*.05})`; g.fillRect(Math.random()*w,Math.random()*h,8+Math.random()*16,1.5); }
  });
  return _crateTex;
}
function crateMat(kind){
  return new THREE.MeshStandardMaterial({ map:crateTex(), color: kind==='a' ? '#e05a40' : '#3f80e0', roughness:.6, emissive:'#ffcf6a', emissiveIntensity:0 });
}
function newCrate(kind, pos){ const m = new THREE.Mesh(crateGeo(), crateMat(kind)); m.scale.setScalar(CS); m.castShadow = m.receiveShadow = true; m.position.copy(pos); m.userData.kind = kind; C.scene.add(m); return m; }
function slotWorld(t, i){ const g = C.carriers[t]; g.updateMatrixWorld(true); const p = slotLocal(g.userData.def, i); return g.localToWorld(p); }
const OFFX = -2.4;
function padBase(){ return {x: C.nCar===0 ? 0 : OFFX + carrierDef().length/2 + 3.8, z: 0}; }
function palletWorld(k){ const b = padBase(); return new THREE.Vector3(b.x - 1.96 + (k%5)*.98, padTop() + CS/2 + Math.floor(k/15)*CS, b.z - .98 + Math.floor((k%15)/5)*.98); }
function padTop(){ return C.padY!=null ? C.padY : .5; }
function makePier(b){
  const g = new THREE.Group(), wood = '#b98a5a', dk = '#6e5238';
  box(6.6, .24, 4.6, wood, b.x, .52, b.z, g, .03);
  for(let i=0;i<9;i++) box(.03, .01, 4.5, dk, b.x-3.1+i*.775, .645, b.z, g, 0);
  box(12, .24, 1.9, wood, b.x+3.3+6, .5, b.z, g, .03);
  for(const [dx,dz] of [[-3.1,-2.1],[3.1,-2.1],[-3.1,2.1],[3.1,2.1],[6,-.8],[6,.8],[9.5,-.8],[9.5,.8]]) part(new THREE.CylinderGeometry(.13,.15,1.3,8), dk, b.x+dx, -.15, b.z+dz, g, .9);
  for(const dz of [-2.2, 2.2]) for(const dx of [-2.2, 2.2]) part(new THREE.CylinderGeometry(.1,.12,.32,10), '#3b3f46', b.x+dx, .8, b.z+dz, g, .6);
  C.scene.add(g); return g;
}
function tenWorld(j){
  const def = carrierDef(), w = def.width, len = def.length, k = .62, gx = def.tenGap!=null ? def.tenGap : 1.4, cols = def.tenCols || 3;
  const z0 = C.nCar===0 ? 0 : C.nCar===2 ? -(w + 2.6 + w*k/2) : -(w/2 + 2.6 + w*k/2);
  return new THREE.Vector3(OFFX - (len*k + gx) + (j%cols)*(len*k + gx), 0, z0 - Math.floor(j/cols)*(w*k + 1.4));
}
function setCarriers(n){
  if(C.nCar === n) return;
  Object.values(C.carriers).forEach(g => C.scene.remove(g)); C.carriers = {}; C.nCar = n;
  const def = carrierDef(), gap = def.width/2 + .9;
  if(n===1){ C.carriers[1] = makeCarrier(1); C.carriers[1].position.x = OFFX; }
  else if(n===2){ C.carriers[1] = makeCarrier(1); C.carriers[1].position.set(OFFX,0,-gap); C.carriers[2] = makeCarrier(2); C.carriers[2].position.set(OFFX,0,gap); }
  if(C.padObj){ C.scene.remove(C.padObj); C.padObj = null; }
  if(n>0){ const b = padBase(), pad = WORLD[C.world].pad; C.padObj = pad==='pier' ? makePier(b) : place(pad, b.x, b.z, pad==='roads/tile-low' ? 5.6 : 2.5); C.padObj.updateMatrixWorld(true);
    let top = 0; const rc = new THREE.Raycaster();
    for(const [dx,dz] of [[0,0],[.7,.4],[-.7,-.4],[1.2,-.6],[-1.2,.6],[.3,-.9],[-.3,.9]]){ rc.set(new THREE.Vector3(b.x+dx, 30, b.z+dz), new THREE.Vector3(0,-1,0)); const h = rc.intersectObject(C.padObj, true)[0]; if(h && h.point.y < 4) top = Math.max(top, h.point.y); }
    C.padY = top || .5; }
  if(C.badge){ C.scene.remove(C.badge); C.badge = null; }
}

/* ---------- layouts (same rules as the 2D version) ---------- */
function newLay(n){ return {carriers:n, slots:{1:Array(10).fill(null),2:Array(10).fill(null)}, pallet:[], spots:0, ghosts:[], tens:[], hl:[], badge:false, free1:[]}; }
const ids = (p,n) => Array.from({length:Math.max(0,n)}, (_,i) => p+i);
function seq(lay, list){ list.forEach((id,j) => { if(id) lay.slots[j<10?1:2][j%10] = id; }); }
const onC = (lay,t) => lay.slots[t].filter(Boolean);
function L_add(sc,p){ const u=sc.a%10,k=Math.floor(sc.a/10),r=10-u,s=sc.b-r,lay=newLay(2),bl=ids('b',sc.b);
  lay.tens=ids('T',k).map(id=>({id,kind:'a'})); for(let i=0;i<u;i++) lay.slots[1][i]='r'+i;
  const n1=p>=1?r:0,n2=p>=2?s:0; for(let i=0;i<n1;i++) lay.slots[1][u+i]=bl[i]; for(let i=0;i<n2;i++) lay.slots[2][i]=bl[r+i];
  lay.pallet=bl.map((id,j)=>j>=n1+n2?id:null); lay.badge=n1===r; lay.free1=ids('',10-u-n1).map((_,i)=>u+n1+i); return lay; }
function L_sub(sc,p){ const u=sc.a%10,k=Math.floor(sc.a/10)-1,r=u,s=sc.b-r,lay=newLay(2);
  lay.tens=ids('T',k).map(id=>({id,kind:'b'})); for(let i=0;i<10;i++) lay.slots[1][i]='n'+i; for(let i=0;i<u;i++) lay.slots[2][i]='n'+(10+i);
  const order=[]; for(let i=u-1;i>=0;i--) order.push({t:2,i}); for(let i=9;i>=10-s;i--) order.push({t:1,i});
  const off=p>=2?r+s:p>=1?r:0; order.forEach((o,j)=>{ if(j<off){ lay.pallet[j]=lay.slots[o.t][o.i]; lay.slots[o.t][o.i]=null; } });
  lay.spots=sc.b; lay.r=r; lay.s=s; return lay; }
function L_pair(sc,p,load){ const lay=newLay(1),n=sc.n;
  if(sc.op==='+'){ for(let i=0;i<n;i++) lay.slots[1][i]='r'+i;
    if(load){ const bl=ids('b',10-n+3),mv=p?10-n:0; for(let i=0;i<mv;i++) lay.slots[1][n+i]=bl[i]; lay.pallet=bl.map((id,j)=>j>=mv?id:null); }
    else if(p) for(let i=n;i<10;i++) lay.slots[1][i]='b'+(i-n);
    lay.badge=!!p; lay.free1=p?[]:ids('',10-n).map((_,i)=>n+i); }
  else { for(let i=0;i<10;i++) lay.slots[1][i]='n'+i; if(p) for(let j=0;j<sc.take;j++){ const i=9-j; lay.pallet[j]=lay.slots[1][i]; lay.slots[1][i]=null; } }
  return lay; }
function L_fam(sc,ph){ const c=sc.a+sc.b,lay=newLay(c>10?2:1),R=ids('r',sc.a),B=ids('b',sc.b); seq(lay,ph==='swap'?[...B,...R]:[...R,...B]);
  if(ph==='minusB'||ph==='minusA'){ const rm=ph==='minusB'?B:R; let k=0; for(const t of [1,2]) for(let i=0;i<10;i++){ const id=lay.slots[t][i]; if(id&&rm.includes(id)){ lay.slots[t][i]=null; lay.pallet[k++]=id; } } }
  return lay; }
function L_ana(sc,step){ const lay=newLay(1);
  if(sc.op==='+') seq(lay,[...ids('r',sc.a),...ids('b',sc.b)]); else { seq(lay,ids('n',sc.a)); for(let j=0;j<sc.b;j++){ const i=sc.a-1-j; lay.pallet[j]=lay.slots[1][i]; lay.slots[1][i]=null; } }
  const T=step>=1&&sc.Ts.length?sc.Ts[Math.min(step,sc.Ts.length)-1]:0; lay.tens=ids('T',T/10).map(id=>({id,kind:'a'})); return lay; }
function L_tens(sc,step){ if(step<1) return L_ana({a:sc.a,b:sc.b,op:sc.op,Ts:[]},0); const lay=newLay(0);
  lay.tens=sc.op==='+'?[...ids('T',sc.a).map(id=>({id,kind:'a'})),...ids('U',sc.b).map(id=>({id,kind:'b'}))]:ids('T',sc.a-sc.b).map(id=>({id,kind:'a'})); return lay; }
const SIDING = -4.4, LOCO_K = .62;
function L_couple(sc, n){
  const lay=newLay(0), plus=sc.op==='+', def=carrierDef(), sp=def.length*.62+.2, locoLen=2.6*2.3*LOCO_K;
  const all = plus ? [...ids('W',sc.a).map(id=>({id,kind:'a'})), ...ids('V',sc.b).map(id=>({id,kind:'b'}))] : ids('W',sc.a).map(id=>({id,kind:'a'}));
  const inTrain = plus ? n : sc.a-n, xr = (locoLen + .3 + all.length*sp)/2;
  all.forEach((w,i)=>{ w.pos = new THREE.Vector3(xr - locoLen - .3 - sp/2 - i*sp, 0, i<inTrain ? 0 : SIDING); w.inTrain = i<inTrain; });
  lay.tens = all; lay.noRails = true; lay.loco = {x: xr - locoLen/2, z: 0}; lay.tracks = {x0: xr - locoLen - .3 - all.length*sp - 2.5, x1: xr + 3};
  return lay;
}
function loadInit(t){ const sc=t.sc; if(t.load&&t.load.mode==='couple') return L_couple(sc,0); return sc.type==='add'?L_add(sc,0):sc.type==='sub'?L_sub(sc,0):L_pair(sc,0,true); }
function layoutFor(V){
  const t=V.t, sc=t.sc, done=V.done, b=done?null:t.blanks[V.bi], step=done?99:V.bi, h=b?b.h:0, load=!!t.load; let lay;
  if(sc.type==='add'||sc.type==='sub'){
    const pro=t.blanks.filter(x=>!x.auto).length===1, p=load||done?2:pro?Math.min(2,h):step;
    lay=sc.type==='add'?L_add(sc,p):L_sub(sc,p);
    if(!done){ const v=pro?h:step;
      if(sc.type==='add'){ if(load||pro){ if(load?v===0:v===1) lay.hl=lay.slots[1].filter(id=>id&&id[0]==='b'); else if(load?v===1:v>=2) lay.hl=onC(lay,2); }
        else if(v===0) lay.ghosts=lay.free1.map(i=>({t:1,i})); else if(v===1) lay.hl=lay.pallet.filter(Boolean); else lay.hl=onC(lay,2); }
      else { if(load||pro){ if(load?v===0:v===1) lay.hl=lay.pallet.slice(0,lay.r).filter(Boolean); else if(load?v===1:v>=2) lay.hl=lay.pallet.slice(lay.r).filter(Boolean); else if(load&&v===2) lay.hl=[...onC(lay,1),...onC(lay,2)]; }
        else if(v===0) lay.hl=onC(lay,2); else if(v===1) lay.hl=lay.slots[1].slice(10-lay.s).filter(Boolean); else lay.hl=[...onC(lay,1),...onC(lay,2)]; } }
  } else if(sc.type==='pair'){
    lay=L_pair(sc,load||done?1:0,load);
    if(!done){ if(sc.op==='+'){ if(load) lay.hl=lay.slots[1].filter(id=>id&&id[0]==='b'); else lay.ghosts=lay.free1.map(i=>({t:1,i})); } else if(sc.f===2||h>=1) lay.hl=lay.slots[1].slice(10-sc.take); }
  } else if(sc.type==='fam'){
    const ph=sc.mode==='basic'?['base','swap','minusB','minusA']:['swap','minusB','minusB'], st=done?ph.length-1:Math.min(step,ph.length-1);
    lay=L_fam(sc,ph[st]); if(!done){ if(sc.mode!=='basic'&&st===2) lay.hl=lay.pallet.filter(Boolean); else if(ph[st]==='minusA'||ph[st]==='minusB') lay.hl=[...onC(lay,1),...onC(lay,2)]; }
  } else if(sc.type==='ana'){ const st=done?sc.Ts.length:step; lay=L_ana(sc,st); if(!done&&st>0) lay.hl=lay.tens.map(x=>x.id); }
  else if(t.load&&t.load.mode==='couple'){ lay=L_couple(sc, sc.op==='+'?sc.a+sc.b:sc.b); if(!done&&step>=1) lay.hl=lay.tens.filter(x=>x.inTrain).map(x=>x.id); }
  else { const st=done?1:step; lay=L_tens(sc,st); }
  return lay;
}

/* ---------- applying layouts with smooth motion ---------- */
function tween(obj, to, o){ o=o||{}; C.tweens=C.tweens.filter(t=>t.obj!==obj);
  C.tweens.push({obj, from:obj.position.clone(), to:to.clone(), t0:performance.now()+(o.delay||0)*1000, dur:o.dur||(o.arc>1?560:360), arc:o.arc||0, spin:o.spin||0, land:!!o.land, fade:!!o.fade, done:o.done||null}); }
function fly(m, to, arc, delay){ tween(m, to, {arc, delay, land:true, spin:arc>.5?(Math.random()-.5)*.7:0}); }
function vanish(m){ m.material.transparent=true; tween(m, m.position.clone().add(new THREE.Vector3(0,2.4,0)), {dur:440, fade:true, done:()=>{ C.scene.remove(m); m.material.dispose(); }}); }
function returnHome(m){ const k=C.pallet.indexOf(m); if(k>=0){ fly(m, palletWorld(k), .6); return; } for(const t of [1,2]){ const i=C.slots[t].indexOf(m); if(i>=0){ fly(m, slotWorld(t,i), .4); return; } } }
function apply(lay, instant){
  setCarriers(lay.carriers);
  const wantT = new Map(lay.tens.map((t,j)=>[t.id,{kind:t.kind,j,pos:t.pos}]));
  setYard(lay);
  for(const [id,g] of [...C.tens]){ if(!wantT.has(id)||g.userData.kind!==wantT.get(id).kind){ C.tens.delete(id); tween(g, g.position.clone().add(new THREE.Vector3(40,0,0)), {dur:900, done:()=>C.scene.remove(g)}); } }
  for(const [id,t] of wantT){ const pos=t.pos||tenWorld(t.j); let g=C.tens.get(id);
    if(!g){ g=makeCarrier(0,true,t.kind,.62,lay.noRails); g.userData.kind=t.kind; C.tens.set(id,g); if(instant) g.position.copy(pos); else { g.position.copy(pos).add(new THREE.Vector3(-42,0,0)); tween(g,pos,{dur:1000,delay:t.j*.12}); } }
    else if(g.position.distanceTo(pos)>.01) tween(g,pos,{dur:650}); }
  const want = new Map();
  for(const t of [1,2]) lay.slots[t].forEach((id,i)=>{ if(id&&lay.carriers>=t) want.set(id,{t,i}); });
  lay.pallet.forEach((id,k)=>{ if(id) want.set(id,{k}); });
  for(const [id,m] of [...C.byId]){ if(!want.has(id)){ C.byId.delete(id); vanish(m); } }
  C.slots={1:Array(10).fill(null),2:Array(10).fill(null)}; C.pallet=[];
  let d=0;
  for(const [id,loc] of want){
    const pos = loc.k!=null ? palletWorld(loc.k) : slotWorld(loc.t, loc.i); let m=C.byId.get(id);
    if(!m){ m=newCrate(id[0]==='r'?'a':'b', pos); m.userData.id=id; C.byId.set(id,m); if(!instant){ m.position.y+=6; fly(m,pos,0,d); d+=.035; } }
    else { const mv=C.tweens.find(t=>t.obj===m); if(m.position.distanceTo(pos)>.02 && !(mv&&mv.to.distanceTo(pos)<.02)){ if(instant){ C.tweens=C.tweens.filter(t=>t.obj!==m); m.position.copy(pos); } else { fly(m,pos,1.4,d); d+=.07; } } }
    if(loc.k!=null) C.pallet[loc.k]=m; else C.slots[loc.t][loc.i]=m;
  }
  [...C.ghosts,...C.spots].forEach(g=>{ C.scene.remove(g); g.material.dispose(); }); C.ghosts=[]; C.spots=[];
  for(let k=0;k<lay.spots;k++){ const p=palletWorld(k), sp=new THREE.Mesh(new THREE.PlaneGeometry(.9,.9), new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.5})); sp.rotation.x=-Math.PI/2; sp.position.set(p.x, padTop()+.02, p.z); C.scene.add(sp); C.spots.push(sp); }
  lay.ghosts.forEach(gh=>{ const g=new THREE.Mesh(new THREE.BoxGeometry(CS,CS,CS), new THREE.MeshStandardMaterial({color:'#fff4d2',transparent:true,opacity:.3,depthWrite:false,emissive:'#ffcf6a',emissiveIntensity:.2})); g.position.copy(slotWorld(gh.t,gh.i)); C.scene.add(g); C.ghosts.push(g); });
  if(lay.badge && !C.badge) badge(instant); else if(!lay.badge && C.badge){ C.scene.remove(C.badge); C.badge=null; }
  C.hl=[];
  (lay.hl||[]).forEach(id=>{ const m=C.byId.get(id); if(m) C.hl.push(m.material); else { const g=C.tens.get(id); if(g&&g.userData.crateMat) C.hl.push(g.userData.crateMat); } });
  C.ghosts.forEach(g=>C.hl.push(g.material));
  C.byId.forEach(m=>{ if(!C.hl.includes(m.material)) m.material.emissiveIntensity=0; });
  C.tens.forEach(g=>{ if(g.userData.crateMat&&!C.hl.includes(g.userData.crateMat)) g.userData.crateMat.emissiveIntensity=0; });
  C.lastLay=lay; frame(lay);
}
function setYard(lay){
  const key = lay.tracks ? [lay.tracks.x0, lay.tracks.x1, lay.loco.x].map(v=>v.toFixed(2)).join() : '';
  if(C.yardKey === key) return; C.yardKey = key;
  if(C.yard){ C.scene.remove(C.yard); C.yard = null; }
  if(!lay.tracks) return;
  const g = new THREE.Group(), L = lay.tracks.x1 - lay.tracks.x0, cx = (lay.tracks.x0 + lay.tracks.x1)/2;
  for(const z of [0, SIDING]){
    for(let x=lay.tracks.x0+.3; x<lay.tracks.x1; x+=.72*.62*1.6) box(.32*.62*1.6, .06, 1.5, '#6e5640', x, .03, z, g, .02);
    for(const dz of [-.45, .45]) box(L, .08, .08, '#8b8f97', cx, .09, z+dz, g, .02);
  }
  if(models['train/train-locomotive-a']){ const l = inst('train/train-locomotive-a'); l.scale.setScalar(2.3*LOCO_K); l.rotation.y = Math.PI/2; l.position.set(lay.loco.x, .06, lay.loco.z); g.add(l); g.userData.loco = l; }
  C.scene.add(g); C.yard = g;
}
function badge(instant){
  if(!C.carriers[1]) return;
  const tex = textureCanvas(256,96,g=>{ g.fillStyle='#2f8a58'; g.beginPath(); g.roundRect(6,8,244,80,40); g.fill(); g.fillStyle='#fff'; g.font='700 52px Lexend, system-ui, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('10 voll',128,52); });
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex, depthTest:false})); sp.renderOrder=9;
  const p=C.carriers[1].position; sp.position.set(p.x-.6, 4.2, p.z); sp.userData.base=[3.4,1.28]; sp.userData.t0=instant?0:performance.now(); sp.scale.set(instant?3.4:.01, instant?1.28:.01, 1);
  C.scene.add(sp); C.badge=sp;
}
function frame(lay){
  const cam=C.cam, tan=Math.tan(cam.fov*Math.PI/360), def=carrierDef(), L=def.length/2, Wd=def.width/2;
  let xmin=1e9,xmax=-1e9,zmin=1e9,zmax=-1e9; const add=(x0,x1,z0,z1)=>{ xmin=Math.min(xmin,x0); xmax=Math.max(xmax,x1); zmin=Math.min(zmin,z0); zmax=Math.max(zmax,z1); };
  Object.values(C.carriers).forEach(g=>add(g.position.x-L,g.position.x+L,g.position.z-Wd,g.position.z+Wd));
  if(lay.carriers>0){ const b=padBase(); add(b.x-2.8,b.x+2.8,b.z-1.8,b.z+1.8); }
  lay.tens.forEach((t,j)=>{ const p=t.pos||tenWorld(j); add(p.x-L*.66,p.x+L*.66,p.z-Wd*.66,p.z+Wd*.66); });
  if(lay.loco){ const h=2.6*2.3*LOCO_K/2; add(lay.loco.x-h,lay.loco.x+h,lay.loco.z-1.2,lay.loco.z+1.2); }
  if(xmin>xmax) add(-6,6,-3,3);
  const cx=(xmin+xmax)/2, cz=(zmin+zmax)/2, hw=(xmax-xmin)/2+.6, hd=(zmax-zmin)/2+.4;
  // fit into the part of the view that the floating panels leave free (equation panel on the left or on top,
  // whichever leaves the scene bigger) and centre the scene there
  const r=C.host.getBoundingClientRect(), W=r.width||1, H=r.height||1, base=C.inset||{l:0,t:0,r:0,b:0};
  let best=null;
  for(const ins of [base, base.alt].filter(Boolean)){
    const ew=Math.max(80,W-ins.l-(ins.r||0)), eh=Math.max(80,H-ins.t-ins.b);
    const d=Math.max(hw/(tan*(ew/H)), (hd*.78+1.4)/(tan*(eh/H)), 10);
    if(!best||d<best.d) best={d,ins,ew,eh};
  }
  cam.setViewOffset(W, H, W/2-(best.ins.l+best.ew/2), H/2-(best.ins.t+best.eh/2), W, H);
  C.camGoal={x:cx, z:cz+.4, d:best.d}; C.bounds={hw,hd}; C.frameIns=best.ins;
  if(C.ctl) C.ctl.style.top=Math.round(best.ins.t+10)+'px';
}
/* ---------- zoom and pan (pinch, drag on empty ground, mouse wheel, buttons) ---------- */
const ZMIN=.4, ZMAX=1.9;
function zoomBy(f, smooth){ if(!C) return; const u=C.user; u.zoom=Math.min(ZMAX, Math.max(ZMIN, u.zoom*f)); if(!smooth) C.snap=true; updateCtl(); kick(); }
function panBy(dx, dy){
  if(!C) return; const H=C.host.getBoundingClientRect().height||1, cc=C.camCur||C.camGoal, tan=Math.tan(C.cam.fov*Math.PI/360), wpp=2*cc.d*tan/H, u=C.user, B=C.bounds;
  u.px=Math.max(-B.hw-2, Math.min(B.hw+2, u.px-dx*wpp)); u.pz=Math.max(-B.hd-2, Math.min(B.hd+2, u.pz-dy*wpp/.68));
  C.snap=true; updateCtl(); kick();
}
function resetView(){ if(!C) return; C.user={zoom:1,px:0,pz:0}; updateCtl(); kick(); }
function updateCtl(){ if(!C||!C.ctl) return; const u=C.user, moved=Math.abs(u.zoom-1)>.02||Math.abs(u.px)>.05||Math.abs(u.pz)>.05; C.ctl.querySelector('[data-z="reset"]').hidden=!moved; }
function rekey(lay){
  const map=new Map(), used=new Set(), kindOf=id=>id[0]==='r'?'a':'b';
  for(const t of [1,2]) lay.slots[t].forEach((id,i)=>{ const m=C.slots[t][i]; if(id&&m&&m.userData.kind===kindOf(id)&&!used.has(m)){ map.set(id,m); used.add(m); } });
  lay.pallet.forEach((id,k)=>{ const m=C.pallet[k]; if(id&&m&&!used.has(m)&&m.userData.kind===kindOf(id)){ map.set(id,m); used.add(m); } });
  const spare=[...new Set([...C.byId.values(),...C.slots[1],...C.slots[2],...C.pallet])].filter(m=>m&&!used.has(m));
  const all=[]; for(const t of [1,2]) lay.slots[t].forEach(id=>id&&all.push(id)); lay.pallet.forEach(id=>id&&all.push(id));
  all.filter(id=>!map.has(id)).forEach(id=>{ const j=spare.findIndex(m=>m.userData.kind===kindOf(id)); if(j>=0) map.set(id,spare.splice(j,1)[0]); });
  spare.forEach((m,i)=>map.set('_x'+i,m)); map.forEach((m,id)=>{ m.userData.id=id; }); C.byId=map;
}

/* ---------- public entry: called by the game on every change ---------- */
let building = null;
export function sync(host, V, api){
  if(!C || C.host !== host || !host.isConnected){ dispose(); C = makeEngine(host); }
  C.api = api; C.view = V;
  const ins = V.inset||{l:0,t:0,r:0,b:0}; if(JSON.stringify(ins)!==JSON.stringify(C.inset||{})){ C.inset = ins; if(C.lastLay) frame(C.lastLay); C.camCur=null; }
  if(C.world !== V.world){
    if(building && building.world===V.world) return;
    const world = V.world, cd = CARRIER[WORLD[world].carrier], list = [...BASE_MODELS, ...(cd.model?[cd.model]:[]), ...(cd.models||[]), ...(WORLD[world].pad==='pier'?[]:[WORLD[world].pad]), ...DECOR[world]];
    building = {world};
    need(list, [...(cd.model?[cd.model]:[]), ...(cd.models||[])]).then(()=>{ if(!C||C.view.world!==world) return; building=null;
      C.byId=new Map(); C.tens=new Map(); C.carriers={}; C.nCar=-1; C.badge=null; C.padObj=null; C.yard=null; C.yardKey=''; C.key=null; C.tweens=[]; C.ghosts=[]; C.spots=[];
      buildWorld(world); const w=C.host.querySelector('.w3-wait'); if(w) w.remove(); sync(C.host, C.view, C.api); })
      .catch(err=>{ building=null; console.warn('3D models failed', err); api.failed&&api.failed(); });
    return;
  }
  const key = V.key;
  if(C.key !== key){
    const first = C.key===null; C.key=key;
    if(!first){ C.byId.forEach(m=>vanish(m)); C.byId=new Map(); C.user={zoom:1,px:0,pz:0}; updateCtl(); }
    C.phase=V.phase; apply(V.phase==='load'?loadInit(V.t):layoutFor(V), first); kick(); return;
  }
  if(V.phase==='load' && V.ld && V.ld.mode==='couple'){ C.phase='load'; apply(L_couple(V.t.sc, V.ld.n), false); kick(); return; }
  if(V.phase==='load' && V.ld){
    C.phase='load'; const L=V.ld;
    if(L.anim){ const a=L.anim; L.anim=null;
      if(L.mode==='sub'){ const m=C.slots[a.t][a.i]; C.slots[a.t][a.i]=null; const k=L.out-1; if(m){ C.pallet[k]=m; fly(m, palletWorld(k), C.pending===m?.35:1.6); } if(a.t===2&&C.slots[2].every(x=>!x)) C.bounce={t:2,t0:performance.now()}; }
      else { let m=C.pending&&C.pallet.includes(C.pending)?C.pending:null; if(!m) for(let k=C.pallet.length-1;k>=0;k--) if(C.pallet[k]){ m=C.pallet[k]; break; }
        if(m){ const j=C.pallet.indexOf(m); if(j>=0) C.pallet[j]=null; C.slots[a.t][a.i]=m; fly(m, slotWorld(a.t,a.i), C.pending===m?.45:1.7); }
        if(a.t===1&&L.t1.indexOf('e')<0) setTimeout(()=>{ if(C){ C.bounce={t:1,t0:performance.now()}; badge(); } },440); }
      C.pending=null; }
    if(L.pulse){ C.pulse={t:L.pulse,t0:performance.now()}; L.pulse=0; }
    if(C.pending){ returnHome(C.pending); C.pending=null; }
    kick(); return;
  }
  const lay=layoutFor(V);
  if(C.phase==='load'){ rekey(lay); C.phase='calc'; }
  apply(lay,false); kick();
}

/* ---------- touch and mouse for hands-on loading ---------- */
function pick(e, objs){ const r=C.renderer.domElement.getBoundingClientRect(); C.ndc.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1); C.ray.setFromCamera(C.ndc, C.cam); return C.ray.intersectObjects(objs, false)[0] || null; }
function pickDeep(e, objs){ const r=C.renderer.domElement.getBoundingClientRect(); C.ndc.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1); C.ray.setFromCamera(C.ndc, C.cam); return C.ray.intersectObjects(objs, true)[0] || null; }
function carrierHits(){ return Object.values(C.carriers).map(g=>g.userData.hit); }
const canLoad = () => C.view && C.view.phase==='load' && C.view.ld && !C.view.ld.done && !C.view.busy;
function onDown(e){
  if(!C) return; C.api && C.api.touch();
  C.ptrs.set(e.pointerId, {x:e.clientX, y:e.clientY});
  try{ C.renderer.domElement.setPointerCapture(e.pointerId); }catch(_){}
  e.preventDefault();
  if(C.ptrs.size===2){ // second finger: pinch zoom, drop whatever the first finger was doing
    if(C.drag){ if(C.drag.mesh && C.drag.moved) returnHome(C.drag.mesh); C.drag=null; }
    const [a,b]=[...C.ptrs.values()]; C.pan=null; C.pinch={d:Math.hypot(a.x-b.x,a.y-b.y), mx:(a.x+b.x)/2, my:(a.y+b.y)/2}; return;
  }
  if(C.ptrs.size>2) return;
  if(canLoad() && C.view.ld.mode==='couple'){
    const objs=[...C.tens.values()]; if(C.yard&&C.yard.userData.loco) objs.push(C.yard.userData.loco);
    if(pickDeep(e,objs)){ C.drag={carrier:1,kind:'tap',id:e.pointerId,x0:e.clientX,y0:e.clientY,moved:false}; return; }
  }
  else if(canLoad()){
    const L=C.view.ld, crates=[...C.pallet,...C.slots[1],...C.slots[2]].filter(Boolean);
    const h=pick(e,[...crates,...carrierHits()]);
    if(h){ const o=h.object; let t=o.userData.carrier||0; if(!t) for(const k of [1,2]) if(C.slots[k].includes(o)) t=k;
      let d=null;
      if(L.mode!=='sub'){ if(C.pallet.includes(o)) d={mesh:o,kind:'pallet'}; else if(t) d={carrier:t,kind:'tap'}; }
      else if(t){ const arr=C.slots[t]; let m=null; for(let i=arr.length-1;i>=0;i--) if(arr[i]){ m=arr[i]; break; } d={carrier:t,mesh:m,kind:'unload'}; }
      if(d){ Object.assign(d,{id:e.pointerId,x0:e.clientX,y0:e.clientY,moved:false}); C.drag=d; return; } }
  }
  C.pan={id:e.pointerId, x:e.clientX, y:e.clientY, moved:false};
}
function onMove(e){
  if(!C) return; const p=C.ptrs.get(e.pointerId); if(!p) return; const px=p.x, py=p.y; p.x=e.clientX; p.y=e.clientY;
  if(C.pinch && C.ptrs.size>=2){ const [a,b]=[...C.ptrs.values()], d=Math.hypot(a.x-b.x,a.y-b.y), mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
    if(C.pinch.d>12 && d>12) zoomBy(C.pinch.d/d); panBy(mx-C.pinch.mx, my-C.pinch.my); C.pinch={d,mx,my}; return; }
  const d=C.drag;
  if(d && e.pointerId===d.id){
    const far=Math.hypot(e.clientX-d.x0,e.clientY-d.y0)>9;
    if(!d.mesh){ if(far){ C.drag=null; C.pan={id:e.pointerId, x:e.clientX, y:e.clientY, moved:true}; panBy(e.clientX-d.x0, e.clientY-d.y0); } return; } // a swipe that began on a vehicle moves the view
    if(!d.moved && far){ d.moved=true; C.tweens=C.tweens.filter(t=>t.obj!==d.mesh); }
    if(d.moved){ const r=C.renderer.domElement.getBoundingClientRect(); C.ndc.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1); C.ray.setFromCamera(C.ndc,C.cam); if(C.ray.ray.intersectPlane(C.dragPlane,C.tmp)) d.goal=C.tmp.clone(); C.api.touch(); kick(); }
    return;
  }
  const pn=C.pan;
  if(pn && e.pointerId===pn.id){
    if(!pn.moved){ if(Math.hypot(e.clientX-pn.x,e.clientY-pn.y)<6) return; pn.moved=true; panBy(e.clientX-pn.x, e.clientY-pn.y); }
    else panBy(e.clientX-px, e.clientY-py);
  }
}
function onUp(e){
  if(!C) return; C.ptrs.delete(e.pointerId);
  if(C.pinch){ if(C.ptrs.size<2){ C.pinch=null; if(C.ptrs.size===1){ const [id,p]=[...C.ptrs.entries()][0]; C.pan={id, x:p.x, y:p.y, moved:true}; } } return; }
  if(C.pan && e.pointerId===C.pan.id){ C.pan=null; return; }
  const d=C.drag; if(!d || e.pointerId!==d.id) return; C.drag=null;
  if(!d.moved){ if(d.kind==='pallet') C.api.loadMsg('Zieh die Kiste {auf} {einen} {N}. Oder tippe auf {den} {N}.','hint'); else C.api.loadAct(d.carrier); kick(); return; }
  C.pending=d.mesh;
  if(d.kind==='unload'){ const r=C.renderer.domElement.getBoundingClientRect(); const b=padBase(); C.ndc.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1); C.ray.setFromCamera(C.ndc,C.cam); if(C.ray.ray.intersectPlane(C.dragPlane,C.tmp)&&Math.abs(C.tmp.x-b.x)<4&&Math.abs(C.tmp.z-b.z)<3.4) C.api.loadAct(d.carrier); }
  else { const h=pick(e,carrierHits()); if(h) C.api.loadAct(h.object.userData.carrier); }
  if(C.pending){ returnHome(C.pending); C.pending=null; }
  kick();
}
function onCancel(e){
  if(!C) return; C.ptrs.delete(e.pointerId); if(C.ptrs.size<2) C.pinch=null; if(C.pan && C.pan.id===e.pointerId) C.pan=null;
  if(C.drag && C.drag.id===e.pointerId){ if(C.drag.mesh) returnHome(C.drag.mesh); C.drag=null; }
}

/* ---------- animation loop ---------- */
const ease = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
function kick(){ if(!C||C.running) return; C.running=true; C.last=0; C.raf=requestAnimationFrame(loop); }
function loop(now){
  if(!C) return; const dt=Math.min(.05, C.last?(now-C.last)/1000:.016); C.last=now; let busy=false;
  for(let i=C.tweens.length-1;i>=0;i--){ const tw=C.tweens[i]; if(now<tw.t0){ busy=true; continue; }
    const u=Math.min(1,(now-tw.t0)/tw.dur), e=ease(u); tw.obj.position.lerpVectors(tw.from,tw.to,e); tw.obj.position.y+=Math.sin(Math.PI*u)*tw.arc;
    if(tw.spin) tw.obj.rotation.z=Math.sin(Math.PI*u)*tw.spin; if(tw.fade&&tw.obj.material) tw.obj.material.opacity=1-u; busy=true;
    if(u>=1){ if(tw.spin) tw.obj.rotation.z=0; C.tweens.splice(i,1); if(tw.land){ C.api&&C.api.sound('thud'); tw.obj.userData.squash=now; } if(tw.done) tw.done(); } }
  C.byId.forEach(m=>{ if(m.userData.squash){ const a=(now-m.userData.squash)/240; if(a>=1){ m.scale.setScalar(CS); m.userData.squash=0; } else { const s=Math.sin(a*Math.PI)*.13; m.scale.set(CS*(1+s*.5),CS*(1-s),CS*(1+s*.5)); busy=true; } } });
  if(C.drag&&C.drag.moved&&C.drag.mesh&&C.drag.goal){ const m=C.drag.mesh,f=1-Math.exp(-dt*18); m.position.x+=(C.drag.goal.x-m.position.x)*f; m.position.y+=(2.6-m.position.y)*f; m.position.z+=(C.drag.goal.z-m.position.z)*f; busy=true; }
  if(C.bounce){ const a=(now-C.bounce.t0)/720, g=C.carriers[C.bounce.t]; if(g&&a<1){ g.position.y=Math.sin(a*Math.PI*3)*.1*(1-a); busy=true; } else { if(g) g.position.y=0; C.bounce=null; } }
  if(C.pulse){ const a=(now-C.pulse.t0)/1600, g=C.carriers[C.pulse.t]; if(g&&a<1){ g.scale.setScalar(1+.03*Math.sin(a*Math.PI*6)); busy=true; } else { if(g) g.scale.setScalar(1); C.pulse=null; } }
  if(C.badge&&C.badge.userData.t0){ const a=Math.min(1,(now-C.badge.userData.t0)/380), s=Math.min(1,a*1.4)*(1+Math.sin(a*Math.PI)*.2*(1-a)), [bw,bh]=C.badge.userData.base; C.badge.scale.set(bw*s,bh*s,1); if(a<1) busy=true; else C.badge.userData.t0=0; }
  if(C.hl.length){ const k=.5+.5*Math.sin(now/260); C.hl.forEach(m=>{ m.emissiveIntensity=.04+.14*k; if(m.transparent&&m.depthWrite===false) m.opacity=.22+.32*k; });
    C.byId.forEach(m=>{ if(!m.userData.squash) m.scale.setScalar(C.hl.includes(m.material)?CS*(1+.07*k):CS); }); busy=true; }
  if(C.water){ C.water.material.map.offset.x=(now/60000)%1; C.water.material.map.offset.y=(now/90000)%1; C.water.position.y=.05+Math.sin(now/900)*.03; busy=true; }
  if(C.scene){
    const a=C.camGoal, u=C.user, g={x:a.x+u.px, z:a.z+u.pz, d:a.d*u.zoom}; if(!C.camCur||C.snap){ C.camCur={x:g.x,z:g.z,d:g.d}; C.snap=false; } const cc=C.camCur, f=1-Math.exp(-dt*3);
    if(Math.abs(cc.x-g.x)+Math.abs(cc.z-g.z)+Math.abs(cc.d-g.d)>.01){ cc.x+=(g.x-cc.x)*f; cc.z+=(g.z-cc.z)*f; cc.d+=(g.d-cc.d)*f; busy=true; }
    C.cam.position.set(cc.x, .8+cc.d*.68, cc.z+cc.d*.73); C.cam.lookAt(cc.x,.8,cc.z);
    if(C.scene.fog){ C.scene.fog.near=cc.d*1.15; C.scene.fog.far=cc.d*2.8; }
    C.renderer.render(C.scene, C.cam);
  }
  if(busy&&C.host.isConnected&&document.visibilityState==='visible') C.raf=requestAnimationFrame(loop); else C.running=false;
}
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') kick(); });

export function debug(){ return C; }
