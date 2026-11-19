// 3D vehicles and buildings for the garage, the city map and the mission progress bar.
// Low-poly models built from simple shapes, painted with the vehicle's two colours (c1 body, c2 accents).
// thumb() renders a still picture (one shared renderer), showroom() runs a live turntable in the garage.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm';
import {RoundedBoxGeometry} from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js/+esm';

/* ---------- building blocks ---------- */
const GLASS = '#33485e', DARK = '#2c2f36', TIRE = '#24262b', HUB = '#c3c7ce', LAMP = '#ffe7a3', WHITE = '#f3f1ea', RED = '#d9443a';
const mats = new Map();
function mat(c, o){
  const k = c + (o ? JSON.stringify(o) : '');
  if(!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:.55, metalness:.05}, o||{})));
  return mats.get(k);
}
const lamp = () => mat(LAMP, {emissive:LAMP, emissiveIntensity:.6, roughness:.3});
const glass = () => mat(GLASS, {roughness:.15, metalness:.3});
function put(g, geo, m, x, y, z){ const o = new THREE.Mesh(geo, typeof m === 'string' ? mat(m) : m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; g.add(o); return o; }
function box(g, w, h, d, m, x, y, z, r){ const rr = Math.min(r==null ? .08 : r, w/2-.001, h/2-.001, d/2-.001); return put(g, rr > .004 ? new RoundedBoxGeometry(w, h, d, 3, rr) : new THREE.BoxGeometry(w, h, d), m, x, y, z); }
function cyl(g, r1, r2, h, m, x, y, z, seg){ return put(g, new THREE.CylinderGeometry(r1, r2, h, seg||20), m, x, y, z); }
function ball(g, r, m, x, y, z, sx, sy, sz){ const o = put(g, new THREE.SphereGeometry(r, 24, 16), m, x, y, z); o.scale.set(sx||1, sy||1, sz||1); return o; }
function wheel(g, r, w, x, y, z){
  const t = cyl(g, r, r, w, mat(TIRE, {roughness:.9}), x, y, z, 26); t.rotation.x = Math.PI/2;
  const h = cyl(g, r*.52, r*.52, w+.03, mat(HUB, {roughness:.35, metalness:.35}), x, y, z, 16); h.rotation.x = Math.PI/2;
  const c = cyl(g, r*.18, r*.18, w+.06, DARK, x, y, z, 10); c.rotation.x = Math.PI/2;
}
function headlights(g, x, y, zs, r){ zs.forEach(z => { const l = cyl(g, r||.13, r||.13, .08, lamp(), x, y, z, 14); l.rotation.z = Math.PI/2; }); }
function extrudeSide(g, pts, depth, m, z){ // side profile in the x/y plane, extruded across the width
  const s = new THREE.Shape(); pts.forEach(([x,y],i) => i ? s.lineTo(x,y) : s.moveTo(x,y));
  const geo = new THREE.ExtrudeGeometry(s, {depth, bevelEnabled:true, bevelThickness:.05, bevelSize:.05, bevelSegments:2});
  geo.translate(0, 0, -depth/2); return put(g, geo, m, 0, 0, z||0);
}
function extrudeTop(g, pts, depth, m, y){ // outline seen from above (x forward, z sideways), extruded upwards
  const s = new THREE.Shape(); pts.forEach(([x,z],i) => i ? s.lineTo(x,-z) : s.moveTo(x,-z));
  const geo = new THREE.ExtrudeGeometry(s, {depth, bevelEnabled:true, bevelThickness:.04, bevelSize:.04, bevelSegments:2});
  geo.rotateX(-Math.PI/2); return put(g, geo, m, 0, y, 0);
}
function halfTube(r, len, open){ // arch along x, rounded side up
  const geo = new THREE.CylinderGeometry(r, r, len, 28, 1, !!open, -Math.PI/2, Math.PI);
  geo.rotateX(-Math.PI/2); geo.rotateY(Math.PI/2); return geo;
}
function rotor(g, n, len, x, y, z, m){
  const r = new THREE.Group(); r.position.set(x, y, z); r.userData.spin = true; g.add(r);
  cyl(r, .14, .14, .16, DARK, 0, 0, 0, 14);
  for(let i=0; i<n; i++){ const b = box(r, len, .05, .2, m||DARK, len/2, 0, 0, .02); const p = new THREE.Group(); p.rotation.y = i*2*Math.PI/n; p.add(b); r.add(p); }
  return r;
}

/* ---------- vehicles (front points to +x) ---------- */
const BUILD = {
  jeep(c1, c2){
    const g = new THREE.Group();
    box(g, 3.5, .62, 1.72, c1, -.05, .92, 0, .14);                 // tub
    box(g, 1.15, .34, 1.62, c1, 1.12, 1.36, 0, .12);               // hood
    box(g, .1, .48, 1.2, DARK, 1.72, 1.0, 0, .04);                  // grille
    for(let i=-2;i<=2;i++) box(g, .03, .38, .06, '#5a5e66', 1.78, 1.0, i*.2, .01);
    headlights(g, 1.76, 1.12, [-.62, .62], .14);
    box(g, .08, .72, 1.66, DARK, .5, 1.72, 0, .03);                 // windscreen frame
    box(g, .05, .56, 1.46, glass(), .52, 1.72, 0, .02);
    for(const z of [-.4, .4]){ box(g, .55, .14, .56, c2, -.25, 1.3, z, .06); box(g, .14, .55, .56, c2, -.5, 1.56, z, .06); }
    for(const z of [-.78, .78]) box(g, .1, .78, .1, DARK, -1.05, 1.62, z, .04);   // roll bar
    box(g, .1, .1, 1.66, DARK, -1.05, 2.0, 0, .04);
    for(const x of [1.12, -1.12]) for(const z of [-.88, .88]) box(g, 1.1, .14, .36, c2, x, 1.24, z, .05);  // fenders
    const sp = cyl(g, .42, .42, .3, mat(TIRE,{roughness:.9}), -1.92, 1.15, 0, 24); sp.rotation.z = Math.PI/2;
    const sh = cyl(g, .2, .2, .32, HUB, -1.92, 1.15, 0, 14); sh.rotation.z = Math.PI/2;
    for(const x of [1.12, -1.12]) for(const z of [-.86, .86]) wheel(g, .52, .4, x, .52, z);
    return g;
  },
  quad(c1, c2){
    const g = new THREE.Group();
    box(g, 1.7, .42, .95, c1, 0, .82, 0, .16);
    box(g, .7, .3, 1.2, c1, .68, .95, 0, .12); box(g, .7, .3, 1.2, c1, -.7, .95, 0, .12);   // mudguards
    box(g, .85, .2, .55, c2, -.15, 1.13, 0, .08);                    // seat
    box(g, .12, .5, .12, DARK, .45, 1.25, 0, .04); box(g, .1, .1, 1.05, DARK, .5, 1.5, 0, .04);   // handlebar
    for(const z of [-.5, .5]) box(g, .14, .14, .16, c2, .5, 1.5, z, .05);
    box(g, .55, .07, 1.0, DARK, .82, 1.15, 0, .02); box(g, .55, .07, 1.0, DARK, -.85, 1.15, 0, .02);  // racks
    headlights(g, 1.04, .98, [-.24, .24], .1);
    for(const x of [.68, -.7]) for(const z of [-.66, .66]) wheel(g, .4, .42, x, .4, z);
    return g;
  },
  monster(c1, c2){
    const g = new THREE.Group();
    box(g, 2.6, .25, 1.2, DARK, 0, 1.25, 0, .05);                    // frame
    for(const x of [1.1, -1.1]) box(g, .2, .7, 1.7, DARK, x, 1.0, 0, .05);
    box(g, 3.3, .55, 1.62, c1, 0, 1.68, 0, .14);                     // body
    box(g, 3.32, .14, 1.64, c2, 0, 1.6, 0, .05);                     // stripe
    box(g, 1.25, .66, 1.52, c1, .05, 2.25, 0, .14);                  // cab
    box(g, 1.27, .42, 1.4, glass(), .06, 2.3, 0, .06);
    box(g, .6, .06, 1.48, c1, -1.1, 1.97, 0, .02);                   // bed rim
    box(g, .2, .12, 1.0, LAMP, .1, 2.64, 0, .05);                    // light bar
    headlights(g, 1.66, 1.72, [-.55, .55], .14);
    for(const x of [1.1, -1.1]) for(const z of [-1.0, 1.0]) wheel(g, .88, .72, x, .88, z);
    return g;
  },
  truck(c1, c2){
    const g = new THREE.Group();
    box(g, 4.8, .3, 1.5, DARK, -.2, .85, 0, .05);                    // chassis
    box(g, 1.35, 1.35, 1.86, c1, 1.55, 1.62, 0, .16);                // cab
    box(g, .08, .6, 1.6, glass(), 2.23, 1.85, 0, .03);
    for(const z of [-.94, .94]) box(g, .7, .5, .04, glass(), 1.6, 1.85, z, .02);
    box(g, .1, .36, 1.3, DARK, 2.25, 1.15, 0, .03); headlights(g, 2.25, 1.22, [-.72, .72], .12);
    box(g, 3.35, .22, 1.92, DARK, -.6, 1.1, 0, .04);                 // bed
    box(g, 3.25, .62, 1.9, c2, -.6, 1.5, 0, .08);                    // canvas cover
    put(g, halfTube(.95, 3.25), c2, -.6, 1.8, 0);
    for(const x of [-2.0, -1.1, -.2, .7]){ const rib = put(g, new THREE.TorusGeometry(.96, .045, 6, 18, Math.PI), DARK, x, 1.8, 0); rib.rotation.y = Math.PI/2; }
    for(const x of [1.55, -.75, -1.8]) for(const z of [-.85, .85]) wheel(g, .46, .36, x, .46, z);
    return g;
  },
  armored(c1, c2){
    const g = new THREE.Group();
    extrudeSide(g, [[-2.2,.55],[2.0,.55],[2.35,1.1],[1.55,1.85],[-1.9,1.85],[-2.25,1.35]], 1.9, c1);   // hull
    box(g, 4.5, .2, 2.02, c2, 0, .78, 0, .05);                        // lower band
    for(const z of [-.55, .55]) box(g, .5, .14, .3, glass(), 1.95, 1.5, z, .03);  // vision slits
    box(g, .9, .3, .9, c1, -.5, 2.05, 0, .1);                         // hatch
    cyl(g, .2, .2, .12, DARK, -.5, 2.26, 0, 14);
    cyl(g, .14, .14, .3, DARK, .6, 2.0, .5, 12);                      // searchlight
    const sl = cyl(g, .2, .2, .22, lamp(), .78, 2.2, .5, 16); sl.rotation.z = Math.PI/2;
    box(g, .04, .9, .04, DARK, -1.6, 2.3, -.7, .01);                  // antenna
    headlights(g, 2.3, .95, [-.65, .65], .1);
    for(const x of [1.4, .1, -1.2]) for(const z of [-.98, .98]) wheel(g, .55, .42, x, .55, z);
    return g;
  },
  heli(c1, c2){
    const g = new THREE.Group();
    ball(g, 1, c1, .2, 1.45, 0, 1.55, .85, .85);                     // fuselage
    ball(g, .8, glass(), 1.05, 1.6, 0, .85, .72, .8);                 // cockpit
    const boom = cyl(g, .26, .13, 2.7, c1, -2.2, 1.6, 0, 16); boom.rotation.z = Math.PI/2;
    box(g, .7, .9, .1, c2, -3.45, 1.95, 0, .05);                      // tail fin
    box(g, .5, .08, 1.0, c2, -3.25, 1.6, 0, .03);
    rotor(g, 2, .6, -3.45, 2.05, .12).rotation.x = Math.PI/2;
    ball(g, 1.01, c2, .2, 1.45, 0, 1.2, .14, .86);                    // stripe
    for(const z of [-.84, .84]){ box(g, .5, .14, .04, WHITE, -.15, 1.55, z, .02); box(g, .14, .5, .04, WHITE, -.15, 1.55, z, .02); }  // rescue cross
    cyl(g, .3, .36, .4, DARK, .1, 2.35, 0, 16);                       // mast
    rotor(g, 4, 2.4, .1, 2.6, 0);
    for(const z of [-.75, .75]){ const sk = cyl(g, .07, .07, 2.6, DARK, .15, .12, z, 10); sk.rotation.z = Math.PI/2;
      for(const x of [-.5, .8]) box(g, .08, .7, .08, DARK, x, .45, z*.85, .02); }
    return g;
  },
  chinook(c1, c2){
    const g = new THREE.Group();
    box(g, 5.2, 1.45, 1.5, c1, 0, 1.5, 0, .55);                       // fuselage
    box(g, 5.0, .4, 1.52, c2, 0, .95, 0, .18);                        // belly
    ball(g, .75, glass(), 2.45, 1.7, 0, .7, .55, .85);                // cockpit
    for(let i=0;i<5;i++) for(const z of [-.76, .76]) box(g, .3, .26, .04, glass(), 1.2-i*.7, 1.75, z, .04);
    box(g, .9, .55, .8, c1, 1.85, 2.35, 0, .16);                      // front pylon
    box(g, 1.5, 1.25, .9, c1, -2.0, 2.55, 0, .22);                    // rear pylon
    rotor(g, 3, 2.3, 1.85, 2.72, 0); rotor(g, 3, 2.3, -2.05, 3.27, 0);
    for(const [x,z] of [[1.6,-.6],[1.6,.6],[-1.4,-.62],[-1.4,.62]]){ box(g, .1, .5, .1, DARK, x, .45, z, .03); wheel(g, .24, .18, x, .24, z*1.1); }
    return g;
  },
  jet(c1, c2){
    const g = new THREE.Group();
    const body = cyl(g, .48, .42, 4.4, c1, -.1, 1.25, 0, 22); body.rotation.z = Math.PI/2;
    const nose = cyl(g, .02, .48, 1.5, c1, 2.85, 1.25, 0, 22); nose.rotation.z = -Math.PI/2;
    ball(g, .5, glass(), 1.55, 1.6, 0, 1.35, .55, .62);                // canopy
    extrudeTop(g, [[1.0,0],[-.9,2.6],[-1.6,2.6],[-1.3,0],[-1.6,-2.6],[-.9,-2.6]], .08, c1, 1.12);   // wings
    extrudeTop(g, [[-1.9,0],[-2.6,1.2],[-2.95,1.2],[-2.75,0],[-2.95,-1.2],[-2.6,-1.2]], .06, c1, 1.22); // tailplane
    for(const z of [-.32, .32]){ const f = extrudeSide(g, [[-1.8,1.5],[-2.75,2.65],[-3.0,2.65],[-2.8,1.5]], .07, c2, z); f.rotation.x = z<0 ? -.18 : .18; }
    box(g, 3.4, .1, .99, c2, -.3, 1.62, 0, .05);                      // spine stripe
    const noz = cyl(g, .44, .36, .4, DARK, -2.45, 1.25, 0, 18); noz.rotation.z = Math.PI/2;
    for(const [x,z] of [[2.0,0],[-.9,-.75],[-.9,.75]]){ box(g, .08, .62, .08, DARK, x, .62, z, .02); wheel(g, .2, .14, x, .2, z); }
    return g;
  },
  stealth(c1, c2){
    const g = new THREE.Group();
    extrudeTop(g, [[2.8,0],[-.6,3.0],[-1.3,2.6],[-.9,1.9],[-1.6,1.5],[-1.2,.8],[-1.7,0],[-1.2,-.8],[-1.6,-1.5],[-.9,-1.9],[-1.3,-2.6],[-.6,-3.0]], .3, c1, .9);
    extrudeTop(g, [[2.3,0],[0,.75],[-1.3,.55],[-1.3,-.55],[0,-.75]], .3, c2, 1.15);   // centre spine
    ball(g, .5, mat('#1e2a38', {roughness:.1, metalness:.6}), .9, 1.5, 0, 1.4, .4, .6);  // canopy
    for(const z of [-.45, .45]) box(g, .5, .12, .3, DARK, -1.25, 1.35, z, .04);     // exhausts
    for(const [x,z] of [[1.6,0],[-.4,-1.0],[-.4,1.0]]){ box(g, .08, .5, .08, DARK, x, .55, z, .02); wheel(g, .18, .14, x, .18, z); }
    return g;
  },
  /* buildings */
  helipad(){
    const g = new THREE.Group();
    cyl(g, 2.7, 2.8, .3, '#9aa0a8', 0, .15, 0, 40);
    const ring = put(g, new THREE.TorusGeometry(2.25, .09, 6, 48), '#ffc83d', 0, .31, 0); ring.rotation.x = Math.PI/2;
    box(g, .3, .03, 1.7, WHITE, -.55, .31, 0, .01); box(g, .3, .03, 1.7, WHITE, .55, .31, 0, .01); box(g, 1.1, .03, .3, WHITE, 0, .31, 0, .01);
    for(let i=0;i<8;i++){ const a=i*Math.PI/4; cyl(g, .1, .12, .18, lamp(), Math.cos(a)*2.6, .36, Math.sin(a)*2.6, 10); }
    cyl(g, .05, .05, 2.2, DARK, 2.3, 1.1, -2.2, 8);
    const sock = cyl(g, .22, .1, .9, '#f2761f', 2.75, 2.05, -2.2, 12); sock.rotation.z = Math.PI/2;
    return g;
  },
  hangar(){
    const g = new THREE.Group();
    box(g, 6.2, .2, 5.4, '#9aa0a8', 0, .1, 0, .05);
    put(g, halfTube(2.3, 4.8, true), mat('#8d99a8', {side:THREE.DoubleSide, roughness:.5, metalness:.25}), 0, .2, 0);
    for(let i=0;i<7;i++){ const rib = put(g, new THREE.TorusGeometry(2.32, .05, 6, 24, Math.PI), '#6c7684', -2.4+i*.8, .2, 0); rib.rotation.y = Math.PI/2; }
    const back = put(g, new THREE.CircleGeometry(2.3, 28, 0, Math.PI), mat('#7d8896', {side:THREE.DoubleSide}), -2.4, .2, 0); back.rotation.y = Math.PI/2;
    box(g, .1, 2.0, 3.2, '#3a4049', 2.4, 1.2, 0, .03);               // door
    for(let i=-3;i<=3;i++) box(g, .12, 1.9, .03, '#59616c', 2.45, 1.2, i*.45, .01);
    box(g, .14, .3, 3.4, '#ffc83d', 2.42, 2.35, 0, .03);
    return g;
  },
};
export const has = id => !!BUILD[id];

/* ---------- framing and lights ---------- */
function stage(scene, shadowSize){
  scene.add(new THREE.HemisphereLight('#fff6ea', '#5d6470', 1.5));
  const sun = new THREE.DirectionalLight('#ffffff', 2.4); sun.position.set(6, 10, 7); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -.0005; sun.shadow.normalBias = .02;
  Object.assign(sun.shadow.camera, {left:-shadowSize, right:shadowSize, top:shadowSize, bottom:-shadowSize, near:1, far:40});
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#cfe2ff', .7); fill.position.set(-6, 4, -5); scene.add(fill);
}
// place the camera so the object fills `fill` of the picture (measured on screen, a few rounds)
function fit(cam, obj, aspect, fill){
  fill = fill || .86; cam.aspect = aspect; cam.updateProjectionMatrix();
  const box = new THREE.Box3().setFromObject(obj), c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
  const pts = []; for(const x of [box.min.x, box.max.x]) for(const y of [box.min.y, box.max.y]) for(const z of [box.min.z, box.max.z]) pts.push(new THREE.Vector3(x, y, z));
  const dir = new THREE.Vector3(.62, .48, 1).normalize(), t = c.clone(), v = new THREE.Vector3();
  let d = sz.length() * 2;
  for(let i=0; i<5; i++){
    cam.position.copy(t).addScaledVector(dir, d); cam.lookAt(t); cam.updateMatrixWorld();
    let x0=1e9, x1=-1e9, y0=1e9, y1=-1e9;
    pts.forEach(p => { v.copy(p).project(cam); x0=Math.min(x0,v.x); x1=Math.max(x1,v.x); y0=Math.min(y0,v.y); y1=Math.max(y1,v.y); });
    const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
    const hh = Math.tan(cam.fov*Math.PI/360) * d, hw = hh * aspect;
    t.addScaledVector(right, (x0+x1)/2 * hw).addScaledVector(up, (y0+y1)/2 * hh);
    d *= Math.max((x1-x0)/(2*fill), (y1-y0)/(2*fill));
  }
  cam.position.copy(t).addScaledVector(dir, d); cam.lookAt(t); cam.updateProjectionMatrix();
  return {c, sz};
}

/* ---------- still pictures ---------- */
let TR = null;
const cache = new Map();
export function thumb(id, c1, c2, w, h){
  w = w || 360; h = h || 220;
  const key = [id, c1, c2, w, h].join('|');
  if(cache.has(key)) return cache.get(key);
  if(!BUILD[id]) return null;
  if(!TR){
    const r = new THREE.WebGLRenderer({antialias:true, alpha:true, preserveDrawingBuffer:true});
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.setClearColor(0x000000, 0);
    TR = {r, cam: new THREE.PerspectiveCamera(26, 1, .1, 200)};
  }
  const scene = new THREE.Scene(); stage(scene, 7);
  const obj = BUILD[id](c1, c2); scene.add(obj);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({opacity:.22})); ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);
  TR.r.setSize(w, h, false); fit(TR.cam, obj, w/h, .88);
  TR.r.render(scene, TR.cam);
  const url = TR.r.domElement.toDataURL('image/png');
  scene.traverse(o => { if(o.geometry) o.geometry.dispose(); });
  cache.set(key, url); return url;
}

/* ---------- live turntable in the garage ---------- */
let S = null;
export function showroom(host, id, c1, c2){
  if(!BUILD[id]) return false;
  if(!S){
    const r = new THREE.WebGLRenderer({antialias:true, alpha:true});
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.setClearColor(0x000000, 0);
    const scene = new THREE.Scene(); stage(scene, 8);
    const disc = new THREE.Group(); scene.add(disc);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.3, .22, 64), new THREE.MeshStandardMaterial({color:'#3b3f48', roughness:.6, metalness:.2})); top.position.y = -.11; top.receiveShadow = true; disc.add(top);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(4.25, .05, 8, 64), new THREE.MeshStandardMaterial({color:'#ffc83d', emissive:'#ffc83d', emissiveIntensity:.35})); rim.rotation.x = Math.PI/2; rim.position.y = .01; disc.add(rim);
    for(let i=0;i<24;i++){ const a=i/24*Math.PI*2, m = new THREE.Mesh(new THREE.BoxGeometry(.5, .02, .06), new THREE.MeshStandardMaterial({color:'#555b66'})); m.position.set(Math.cos(a)*3.7, .005, Math.sin(a)*3.7); m.rotation.y = -a; disc.add(m); }
    S = {r, scene, disc, cam:new THREE.PerspectiveCamera(30, 1, .1, 200), obj:null, key:'', angle:-.5, drag:null, last:0, host:null, ro:null, raf:0, idle:0};
    const el = r.domElement; el.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;cursor:grab';
    el.addEventListener('pointerdown', e => { S.drag = {x:e.clientX, a:S.angle}; try{ el.setPointerCapture(e.pointerId); }catch(_){} });
    el.addEventListener('pointermove', e => { if(S.drag){ S.angle = S.drag.a + (e.clientX - S.drag.x) * .012; S.idle = performance.now(); } });
    const up = () => { S.drag = null; S.idle = performance.now(); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  if(S.host !== host){
    S.host = host; host.innerHTML = ''; host.appendChild(S.r.domElement);
    if(S.ro) S.ro.disconnect(); S.ro = new ResizeObserver(() => resize()); S.ro.observe(host); resize();
  }
  const key = [id, c1, c2].join('|');
  if(S.key !== key){
    if(S.obj){ S.disc.remove(S.obj); }
    S.obj = BUILD[id](c1, c2); S.obj.userData.air = /heli|chinook|jet|stealth/.test(id) && false; S.disc.add(S.obj); S.key = key;
    S.pop = performance.now(); resize();
  }
  if(!S.raf) S.raf = requestAnimationFrame(loop);
  return true;
}
function resize(){
  if(!S || !S.host) return; const b = S.host.getBoundingClientRect(); if(!b.width || !b.height) return;
  S.r.setSize(b.width, b.height, false); S.cam.aspect = b.width / b.height;
  const ang = S.disc.rotation.y; S.disc.rotation.y = 0;
  fit(S.cam, S.obj || S.disc, S.cam.aspect, .62); S.disc.rotation.y = ang;
}
function loop(now){
  if(!S) return;
  if(!S.host || !S.host.isConnected){ S.raf = 0; return; }
  const dt = Math.min(.05, S.last ? (now - S.last)/1000 : .016); S.last = now;
  if(!S.drag && now - S.idle > 1500) S.angle += dt * .45;
  S.disc.rotation.y += (S.angle - S.disc.rotation.y) * (1 - Math.exp(-dt*10));
  if(S.obj){
    const p = Math.min(1, (now - (S.pop||0)) / 450); S.obj.scale.setScalar(.85 + .15 * (1 - Math.pow(1-p, 3)));
    S.obj.traverse(o => { if(o.userData.spin) o.rotation.y += dt * 9; });
  }
  S.r.render(S.scene, S.cam);
  S.raf = document.visibilityState === 'visible' ? requestAnimationFrame(loop) : 0;
}
document.addEventListener('visibilitychange', () => { if(S && !S.raf && document.visibilityState === 'visible' && S.host && S.host.isConnected) S.raf = requestAnimationFrame(loop); });

/* ================= Probefahrt: drive or fly an owned vehicle on the test track =================
   Ground vehicles drive (ramps for jumps, cones to knock over), helicopters take off and land on the
   helipad, jets take off from the runway and land on it again. Stars to collect, no time limit. */
const KIND = {jeep:'car', quad:'car', monster:'car', truck:'car', armored:'car', heli:'heli', chinook:'heli', jet:'plane', stealth:'plane'};
const CAR = {jeep:{max:18, acc:9, turn:1.9}, quad:{max:22, acc:12, turn:2.3}, monster:{max:17, acc:8, turn:1.7}, truck:{max:12, acc:5, turn:1.3}, armored:{max:13, acc:5.5, turn:1.4}};
const PAD = {x:26, z:-34}, RUNWAY = {z:62, x0:-70, x1:70, w:12};
const RAMPS = [{x:-8, z:-18, rot:0, len:7, w:5, h:1.9}, {x:30, z:8, rot:Math.PI/2, len:7, w:5, h:1.6}, {x:-34, z:14, rot:-Math.PI/4, len:8, w:5, h:2.2}];
function rampHeight(r, x, z){ // wedge: rises along its local x from 0 to h, then drops
  const c = Math.cos(r.rot), s = Math.sin(r.rot), dx = x - r.x, dz = z - r.z, lx = dx*c - dz*s, lz = dx*s + dz*c;
  if(Math.abs(lz) > r.w/2 || lx < -r.len/2 || lx > r.len/2) return 0;
  return r.h * (lx + r.len/2) / r.len;
}
function groundH(x, z){ let h = 0; for(const r of RAMPS) h = Math.max(h, rampHeight(r, x, z)); const pd = Math.hypot(x-PAD.x, z-PAD.z); if(pd < 4.2) h = Math.max(h, .45); return h; }
function canvasTex(w, h, draw, rep){ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if(rep){ t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); } return t; }

let D = null;
export function drive(host, opt, api){
  if(D){ const c = D.close; stopDrive(); c && c(); }  // only one test drive at a time
  const kind = KIND[opt.id] || 'car';
  host.innerHTML = `<div class="drive-view"></div>
    <div class="drive-top"><button class="iconbtn drive-x" aria-label="Zurück zur Garage">✕</button><div class="drive-title">${opt.air?'Probeflug':'Probefahrt'} · ${opt.name}</div><div class="drive-stars">★ <b>0</b>/10</div></div>
    <div class="drive-hint">${kind==='car'?'Zieh den Knopf: nach oben fahren, zur Seite lenken. Spring über die Rampen!':kind==='heli'?'Halte ▲ zum Abheben. Mit dem Knopf fliegst du. Lande auf dem H!':'Zieh den Knopf nach oben: Gas geben und abheben. Zum Landen tief über die Startbahn fliegen.'}</div>
    <div class="joy"><div class="joy-knob"></div></div>
    ${kind==='heli'?'<div class="lift"><button class="lift-up" aria-label="Hoch">▲</button><button class="lift-down" aria-label="Runter">▼</button></div>':''}`;
  const view = host.querySelector('.drive-view');
  const r = new THREE.WebGLRenderer({antialias:true});
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.setPixelRatio(Math.min(2, devicePixelRatio||1)); r.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
  view.appendChild(r.domElement);
  const scene = new THREE.Scene(), sky = new THREE.Color('#bfe3f2'); scene.background = sky; scene.fog = new THREE.Fog(sky, 90, 260);
  scene.add(new THREE.HemisphereLight('#fff8ee', '#7d7058', 1.6));
  const sun = new THREE.DirectionalLight('#fff2df', 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03;
  Object.assign(sun.shadow.camera, {left:-40, right:40, top:40, bottom:-40, near:1, far:160}); scene.add(sun); scene.add(sun.target);
  const cam = new THREE.PerspectiveCamera(55, 1, .3, 600);

  // ground, track, runway, scenery
  const grass = canvasTex(256, 256, (g,w,h)=>{ g.fillStyle='#8db063'; g.fillRect(0,0,w,h); for(let i=0;i<3000;i++){ g.fillStyle=Math.random()<.5?'rgba(0,0,0,.05)':'rgba(255,255,255,.07)'; const s=1+Math.random()*3; g.fillRect(Math.random()*w,Math.random()*h,s,s); } }, 60);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({map:grass, roughness:.95})); ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);
  const asphalt = new THREE.MeshStandardMaterial({color:'#4a4e57', roughness:.9});
  const ring = new THREE.Shape(); ring.absarc(0, 0, 1, 0, Math.PI*2);
  const loop = (rx, rz) => { const s = new THREE.Shape(), n = 64; for(let i=0;i<=n;i++){ const a=i/n*Math.PI*2; const p=[Math.cos(a)*rx, Math.sin(a)*rz]; i ? s.lineTo(...p) : s.moveTo(...p); } return s; };
  const outer = loop(48, 30), inner = loop(40, 22); outer.holes.push(inner);
  const track = new THREE.Mesh(new THREE.ShapeGeometry(outer, 64), asphalt); track.rotation.x = -Math.PI/2; track.position.y = .02; track.receiveShadow = true; scene.add(track);
  for(let i=0;i<48;i++){ const a=i/48*Math.PI*2; const m = new THREE.Mesh(new THREE.BoxGeometry(2.2, .02, .35), mat('#f3f1ea')); m.position.set(Math.cos(a)*44, .04, Math.sin(a)*26); m.rotation.y = -Math.atan2(Math.cos(a)*26, -Math.sin(a)*44); scene.add(m); }
  const rw = new THREE.Mesh(new THREE.PlaneGeometry(RUNWAY.x1-RUNWAY.x0, RUNWAY.w), asphalt); rw.rotation.x = -Math.PI/2; rw.position.set(0, .03, RUNWAY.z); rw.receiveShadow = true; scene.add(rw);
  for(let x=RUNWAY.x0+6; x<RUNWAY.x1-4; x+=8){ const m = new THREE.Mesh(new THREE.BoxGeometry(4, .02, .4), mat('#f3f1ea')); m.position.set(x, .05, RUNWAY.z); scene.add(m); }
  for(const dz of [-RUNWAY.w/2+.4, RUNWAY.w/2-.4]){ const m = new THREE.Mesh(new THREE.BoxGeometry(RUNWAY.x1-RUNWAY.x0, .02, .3), mat('#ffc83d')); m.position.set(0, .05, RUNWAY.z+dz); scene.add(m); }
  const pad = BUILD.helipad(); pad.scale.setScalar(1.5); pad.position.set(PAD.x, 0, PAD.z); scene.add(pad);
  const hangar = BUILD.hangar(); hangar.scale.setScalar(2.2); hangar.position.set(-40, 0, RUNWAY.z+20); hangar.rotation.y = -Math.PI/2; scene.add(hangar);
  for(const R of RAMPS){ const s = new THREE.Shape(); s.moveTo(-R.len/2, 0); s.lineTo(R.len/2, R.h); s.lineTo(R.len/2, 0); s.lineTo(-R.len/2, 0);
    const geo = new THREE.ExtrudeGeometry(s, {depth:R.w, bevelEnabled:false}); geo.translate(0, 0, -R.w/2);
    const m = new THREE.Mesh(geo, mat('#e0a33a')); m.position.set(R.x, 0, R.z); m.rotation.y = R.rot; m.castShadow = m.receiveShadow = true; scene.add(m);
    for(let i=0;i<4;i++){ const st = new THREE.Mesh(new THREE.BoxGeometry(.5, .02, R.w*.9), mat('#2c2f36')); st.position.set(-R.len/2 + (i+.7)*R.len/4.5, (i+.7)/4.5*R.h + .03, 0); st.rotation.z = Math.atan2(R.h, R.len); m.add(st); } }
  const rnd = (() => { let a = 7; return () => { a = (a*16807) % 2147483647; return (a-1)/2147483646; }; })();
  for(let i=0;i<70;i++){ const a = rnd()*Math.PI*2, d = 70 + rnd()*90, x = Math.cos(a)*d, z = Math.sin(a)*d; if(Math.abs(z-RUNWAY.z) < 14) continue;
    const t = new THREE.Group(); cyl(t, .35, .45, 2, '#7a5a3c', 0, 1, 0, 8); cyl(t, 0, 2.2, 5, rnd()<.5?'#4f8a45':'#5f9a4f', 0, 4.4, 0, 10); t.position.set(x, 0, z); t.scale.setScalar(.8+rnd()*.8); scene.add(t); }
  for(let i=0;i<14;i++){ const a = i/14*Math.PI*2+.2, d = 170, h = 8+rnd()*22; box(scene, 10+rnd()*8, h, 10+rnd()*8, ['#d8c7a8','#b9c4cf','#e3d4c4','#c9b49a'][i%4], Math.cos(a)*d, h/2, Math.sin(a)*d, .3); }
  // cones and stars
  const cones = [];
  for(let i=0;i<14;i++){ const a = i/14*Math.PI*2, x = Math.cos(a)*34, z = Math.sin(a)*16; const c = new THREE.Group(); cyl(c, .08, .55, 1.3, '#f2761f', 0, .65, 0, 12); box(c, 1.1, .1, 1.1, '#f2761f', 0, .05, 0, .03); cyl(c, .3, .4, .2, WHITE, 0, .72, 0, 12); c.position.set(x, 0, z); scene.add(c); cones.push({o:c, v:null, spin:0}); }
  const starShape = new THREE.Shape(); for(let i=0;i<10;i++){ const a=i/10*Math.PI*2+Math.PI/2, rr=i%2?.45:1; i ? starShape.lineTo(Math.cos(a)*rr, Math.sin(a)*rr) : starShape.moveTo(Math.cos(a)*rr, Math.sin(a)*rr); }
  const starGeo = new THREE.ExtrudeGeometry(starShape, {depth:.25, bevelEnabled:true, bevelThickness:.08, bevelSize:.08, bevelSegments:2}); starGeo.center();
  const starMat = new THREE.MeshStandardMaterial({color:'#ffc83d', emissive:'#ffb300', emissiveIntensity:.5, roughness:.35, metalness:.3});
  const air = kind !== 'car';
  const spots = air ? [[0,8,0],[26,14,-34],[-30,10,-20],[40,18,30],[-50,22,40],[60,12,62],[-60,16,62],[0,26,-60],[70,20,-10],[-75,14,-30]]
                    : [[44,1.4,-16],[-44,1.4,0],[0,1.4,26],[0,1.4,-26],[-8,4.5,-18],[30,4,8],[-34,4.8,14],[31,1.4,19],[-31,1.4,-19],[26,1.8,-34]];
  const stars = spots.map(([x,y,z]) => { const m = new THREE.Mesh(starGeo, starMat); m.position.set(x, y, z); m.scale.setScalar(air ? 1.6 : 1); m.castShadow = true; scene.add(m); return m; });

  // the vehicle
  const veh = new THREE.Group(), body = BUILD[opt.id](opt.c1, opt.c2); veh.add(body); scene.add(veh);
  const st = {x:0, y:0, z:0, yaw:0, v:0, vy:0, up:0, ground:true, got:0, landed:true, msgT:0, pitch:0, roll:0, prevH:0};
  if(kind === 'car'){ st.x = 44; st.z = 0; st.yaw = Math.PI/2; }
  else if(kind === 'heli'){ st.x = PAD.x; st.z = PAD.z; st.y = .45; st.yaw = Math.PI; }
  else { st.x = RUNWAY.x0 + 10; st.z = RUNWAY.z; st.yaw = 0; }
  const P = CAR[opt.id] || CAR.jeep;

  // input: thumbstick, lift buttons, keyboard
  const inp = {x:0, y:0, lift:0}, keys = new Set();
  const joy = host.querySelector('.joy'), knob = host.querySelector('.joy-knob'); let jid = null;
  const joyMove = e => { const b = joy.getBoundingClientRect(), R = b.width/2; let dx = e.clientX-(b.left+R), dy = e.clientY-(b.top+R); const l = Math.hypot(dx, dy), m = R*.62; if(l > m){ dx *= m/l; dy *= m/l; } inp.x = dx/m; inp.y = -dy/m; knob.style.transform = `translate(${dx}px,${dy}px)`; };
  joy.addEventListener('pointerdown', e => { jid = e.pointerId; try{ joy.setPointerCapture(jid); }catch(_){} joyMove(e); hint(); e.preventDefault(); });
  joy.addEventListener('pointermove', e => { if(e.pointerId === jid) joyMove(e); });
  const joyEnd = e => { if(e.pointerId !== jid) return; jid = null; inp.x = inp.y = 0; knob.style.transform = ''; };
  joy.addEventListener('pointerup', joyEnd); joy.addEventListener('pointercancel', joyEnd);
  host.querySelectorAll('.lift button').forEach(b => { const d = b.classList.contains('lift-up') ? 1 : -1;
    b.addEventListener('pointerdown', e => { inp.lift = d; try{ b.setPointerCapture(e.pointerId); }catch(_){} hint(); e.preventDefault(); });
    const off = () => { if(inp.lift === d) inp.lift = 0; }; b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); });
  const kd = e => { const k = e.key.toLowerCase(); if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' ','shift','e','q'].includes(k)){ keys.add(k); e.preventDefault(); hint(); } if(k === 'escape') close(); };
  const ku = e => keys.delete(e.key.toLowerCase());
  window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
  let hinted = false; function hint(){ if(hinted) return; hinted = true; const h = host.querySelector('.drive-hint'); if(h) setTimeout(() => h.classList.add('off'), 2500); }
  const starsEl = host.querySelector('.drive-stars b');
  function say(t){ let el = host.querySelector('.drive-msg'); if(!el){ el = document.createElement('div'); el.className = 'drive-msg'; host.appendChild(el); } el.textContent = t; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); }
  function close(){ stopDrive(); api && api.close && api.close(); }
  host.querySelector('.drive-x').addEventListener('click', close);

  const resize = () => { const b = view.getBoundingClientRect(); if(!b.width) return; r.setSize(b.width, b.height, false); cam.aspect = b.width/b.height; cam.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(view); resize();
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(); let first = true, last = 0;

  function frame(now){
    if(!D || D.host !== host) return;
    const dt = Math.min(.04, last ? (now-last)/1000 : .016); last = now;
    let jx = inp.x, jy = inp.y, lift = inp.lift;
    if(keys.has('arrowleft') || keys.has('a')) jx = -1; if(keys.has('arrowright') || keys.has('d')) jx = 1;
    if(keys.has('arrowup') || keys.has('w')) jy = 1; if(keys.has('arrowdown') || keys.has('s')) jy = -1;
    if(keys.has(' ') || keys.has('e')) lift = 1; if(keys.has('shift') || keys.has('q')) lift = -1;
    const fx = Math.cos(st.yaw), fz = -Math.sin(st.yaw);
    if(kind === 'car'){
      const target = jy >= 0 ? jy*P.max : jy*P.max*.45, a = (Math.sign(target-st.v) !== Math.sign(st.v) && Math.abs(st.v) > .5) ? P.acc*2.2 : P.acc;
      st.v += Math.max(-a*dt, Math.min(a*dt, target - st.v)); if(!jy) st.v *= Math.pow(.6, dt);
      if(st.ground) st.yaw -= jx * P.turn * dt * Math.max(-1, Math.min(1, st.v/5));
      st.x += fx*st.v*dt; st.z += fz*st.v*dt;
      const h = groundH(st.x, st.z);
      if(st.ground){ if(h >= st.y - .35){ st.vy = (h - st.prevH)/dt; st.y = h; } else { st.ground = false; } }
      if(!st.ground){ st.vy -= 22*dt; st.y += st.vy*dt; if(st.y <= h){ st.y = h; if(st.vy < -6){ api.sound && api.sound('thud'); } st.vy = 0; st.ground = true; } }
      st.prevH = h;
      const hf = groundH(st.x+fx*1.4, st.z+fz*1.4), hb = groundH(st.x-fx*1.4, st.z-fz*1.4);
      const tp = st.ground ? Math.atan2(hf-hb, 2.8) : Math.atan2(st.vy, Math.max(4, Math.abs(st.v)))*.6;
      st.pitch += (tp - st.pitch)*(1-Math.exp(-dt*10)); st.roll += (-jx*Math.min(1, Math.abs(st.v)/P.max)*.08 - st.roll)*(1-Math.exp(-dt*6));
      for(const c of cones){ if(c.v){ c.v.y -= 22*dt; c.o.position.addScaledVector(c.v, dt); if(c.o.position.y < 0){ c.o.position.y = 0; c.v.multiplyScalar(.5); c.v.y = 0; } c.o.rotation.z += c.spin*dt; c.spin *= Math.pow(.2, dt); if(Math.abs(c.o.rotation.z) > 1.5){ c.o.rotation.z = Math.sign(c.o.rotation.z)*1.57; c.spin = 0; } continue; }
        if(Math.hypot(c.o.position.x-st.x, c.o.position.z-st.z) < 1.8 && Math.abs(st.v) > 2){ c.v = new THREE.Vector3(fx*st.v*.7, 5, fz*st.v*.7); c.spin = 6*Math.sign(st.v); api.sound && api.sound('thud'); } }
    } else if(kind === 'heli'){
      const g = groundH(st.x, st.z), onG = st.y <= g + .02;
      st.vy += ((lift ? lift*6 : 0) - st.vy)*(1-Math.exp(-dt*3)); if(onG && st.vy < 0) st.vy = 0;
      st.y = Math.min(45, Math.max(g, st.y + st.vy*dt));
      const flying = st.y > g + .3;
      if(flying){ st.v += ((jy*15) - st.v)*(1-Math.exp(-dt*1.6)); st.yaw -= jx*1.4*dt; } else { st.v *= Math.pow(.05, dt); if(Math.abs(jx) > .2) st.yaw -= jx*.8*dt; }
      st.x += fx*st.v*dt; st.z += fz*st.v*dt;
      if(flying) st.landed = false;
      else if(!st.landed){ st.landed = true; const onPad = Math.hypot(st.x-PAD.x, st.z-PAD.z) < 4.2; say(onPad ? 'Perfekt auf dem H gelandet!' : 'Gelandet!'); api.sound && api.sound(onPad ? 'win' : 'thud'); }
      st.pitch += (-st.v/15*.28 - st.pitch)*(1-Math.exp(-dt*4)); st.roll += (jx*(flying?.25:0) - st.roll)*(1-Math.exp(-dt*4));
    } else {
      const over = st.z > RUNWAY.z - RUNWAY.w/2 && st.z < RUNWAY.z + RUNWAY.w/2 && st.x > RUNWAY.x0 && st.x < RUNWAY.x1;
      if(st.ground){
        st.v += (jy > 0 ? jy*9 : jy < 0 ? -9 : -2)*dt; st.v = Math.max(0, Math.min(30, st.v));
        if(st.v > 2) st.yaw -= jx*.5*dt; else st.yaw -= jx*1.2*dt;
        if(st.v > 16 && jy > 0){ st.ground = false; st.vy = 3; say('Abgehoben!'); api.sound && api.sound('start'); }
        st.y = 0; st.pitch += ((st.v > 12 && jy > 0 ? .12 : 0) - st.pitch)*(1-Math.exp(-dt*4));
      } else {
        st.v += (26 - st.v)*(1-Math.exp(-dt*.8));
        st.vy += (jy*9 - st.vy)*(1-Math.exp(-dt*2)); st.yaw -= jx*.9*dt;
        st.y += st.vy*dt;
        if(st.y < 1.2){ if(over && st.vy < 1){ st.ground = true; st.y = 0; st.vy = 0; say('Gelandet!'); api.sound && api.sound('win'); } else { st.y = 1.2; st.vy = Math.abs(st.vy)*.5 + 2; } }
        st.y = Math.min(60, st.y);
        st.pitch += (Math.atan2(st.vy, st.v)*.9 - st.pitch)*(1-Math.exp(-dt*4));
      }
      st.roll += ((st.ground ? 0 : jx*.55) - st.roll)*(1-Math.exp(-dt*4));
      st.x += fx*st.v*dt; st.z += fz*st.v*dt;
    }
    const lim = 150; if(Math.abs(st.x) > lim || Math.abs(st.z) > lim){ st.x = Math.max(-lim, Math.min(lim, st.x)); st.z = Math.max(-lim, Math.min(lim, st.z)); if(kind !== 'car'){ st.yaw += Math.PI*dt; } }
    veh.position.set(st.x, st.y, st.z); veh.rotation.set(0, st.yaw, 0); body.rotation.set(st.roll, 0, st.pitch, 'YXZ');
    body.traverse(o => { if(o.userData.spin) o.rotation.y += dt * (kind === 'heli' ? (st.y > groundH(st.x, st.z)+.05 || inp.lift || keys.size ? 22 : 8) : 0); });
    for(const s of stars){ if(!s.visible) continue; s.rotation.y += dt*2; if(Math.hypot(s.position.x-st.x, s.position.y-(st.y+1), s.position.z-st.z) < (air ? 3.4 : 2.2)){ s.visible = false; st.got++; starsEl.textContent = st.got; api.sound && api.sound('coin'); say(st.got === stars.length ? 'Alle Sterne gesammelt!' : `Stern ${st.got} von ${stars.length}!`); } }
    // chase camera
    const dist = kind === 'car' ? 10 : kind === 'heli' ? 14 : 18, hgt = kind === 'car' ? 4.5 : 6;
    const want = new THREE.Vector3(st.x - fx*dist, st.y + hgt, st.z - fz*dist), look = new THREE.Vector3(st.x + fx*4, st.y + 1.2, st.z + fz*4);
    if(want.y < 1.5) want.y = 1.5;
    if(first){ camPos.copy(want); camLook.copy(look); first = false; } else { camPos.lerp(want, 1-Math.exp(-dt*3.5)); camLook.lerp(look, 1-Math.exp(-dt*6)); }
    cam.position.copy(camPos); cam.lookAt(camLook);
    sun.position.set(st.x - 20, st.y + 40, st.z + 25); sun.target.position.set(st.x, st.y, st.z);
    r.render(scene, cam);
    D.raf = requestAnimationFrame(frame);
  }
  D = {host, r, ro, kd, ku, close: api && api.close, raf: requestAnimationFrame(frame)};
}
export function stopDrive(){
  if(!D) return; cancelAnimationFrame(D.raf);
  window.removeEventListener('keydown', D.kd); window.removeEventListener('keyup', D.ku);
  try{ D.ro.disconnect(); D.r.dispose(); D.r.forceContextLoss && D.r.forceContextLoss(); }catch(e){}
  D = null;
}
