import * as THREE from 'three';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const $=s=>document.querySelector(s);
const canvas=$('#scene'), stage=$('#stage');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(34,1,.1,100);
const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=false;
controls.minDistance=7.5;controls.maxDistance=17;
controls.minPolarAngle=.55;controls.maxPolarAngle=1.38;
controls.minAzimuthAngle=-.85;controls.maxAzimuthAngle=1.1;
controls.target.set(0,1.08,0);
const world=new THREE.Group();scene.add(world);
scene.add(new THREE.HemisphereLight(0xeaf3ff,0xc6af9a,2.0));
const key=new THREE.DirectionalLight(0xfff0d9,3.0);key.position.set(-3.5,8,5);key.castShadow=true;
key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;key.shadow.camera.near=.5;key.shadow.camera.far=20;key.shadow.normalBias=.035;key.shadow.bias=-.0002;key.shadow.radius=4;scene.add(key);
const fill=new THREE.DirectionalLight(0xcadfff,1.5);fill.position.set(5,4,-4);scene.add(fill);
const materials={};
function mat(color,roughness=.8,extra={}){const key=color+':'+roughness+JSON.stringify(extra);return materials[key]??=(new THREE.MeshStandardMaterial({color,roughness,...extra}));}
const C={skin:mat('#f9d0b6'),pink:mat('#efa9af'),hair:mat('#242a36',.62),hairLight:mat('#2a303c',.67),shirt:mat('#9bcced'),shirtDark:mat('#6eadd6'),shorts:mat('#f1d8d6'),sole:mat('#f4f1ee'),shoe:mat('#434e63'),white:mat('#fffaf2'),fur:mat('#f2eff0'),furShade:mat('#d9d0d3'),paw:mat('#eaa4b3'),ink:mat('#3d3640'),wood:mat('#d6a579'),woodLight:mat('#ecc8a0'),blue:mat('#779bc6'),chair:mat('#7499be'),chairDark:mat('#4c6989'),cream:mat('#f5f1e6'),metal:mat('#b6c4d2',.48),leaf:mat('#7fa38c'),leaf2:mat('#a4bc91')};
const sphereGeo=new THREE.SphereGeometry(1,32,24),cylinderGeo=new THREE.CylinderGeometry(1,1,1,20);
function mesh(geo,m,parent=world,pos=[0,0,0],scale){const o=new THREE.Mesh(geo,m);o.position.set(...pos);if(scale)o.scale.set(...scale);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function ball(parent,m,pos,size){return mesh(sphereGeo,m,parent,pos,size);}
function box(parent,m,pos,size,r=.08){return mesh(new RoundedBoxGeometry(...size,3,Math.min(r,Math.min(...size)/2)),m,parent,pos);}
function cyl(parent,m,pos,r,h){return mesh(cylinderGeo,m,parent,pos,[r,h,r]);}
function line(parent,m,points,r=.014){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*7),r,7,false),m,parent);}
function group(parent=world,pos=[0,0,0]){const g=new THREE.Group();g.position.set(...pos);parent.add(g);return g;}
function bone(o,a,b,r){a=new THREE.Vector3(...a);b=new THREE.Vector3(...b);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());o.scale.set(r,a.distanceTo(b),r);}

// A small, open diorama leaves all three touch targets clearly visible.
box(world,mat('#bfd0e5'),[0,-.22,0],[6.8,.4,5.15],.23);
box(world,mat('#e8dac7'),[0,-.005,0],[6.65,.12,5.02],.16);
for(let i=-3;i<=3;i++)box(world,mat('#d8c6af'),[i*.83,.059,0],[.015,.006,4.86],.002);
for(let i=-2;i<=2;i++)box(world,mat('#d8c6af'),[i*.83+.415,.06,i%2?.8:-.8],[.8,.005,.013],.002);
box(world,mat('#bfd3e7'),[0,1.30,-2.42],[6.55,2.6,.16],.09);
box(world,mat('#d8e5ed'),[-3.24,1.30,-.80],[.16,2.6,3.3],.09);
box(world,mat('#e4edf3'),[0,.16,-2.3],[6.3,.25,.065],.02);
box(world,mat('#e4edf3'),[-3.13,.16,-.8],[.065,.25,3.12],.02);

// Sunlit window, curtain, wall shelf, and a real desktop computer.
box(world,C.cream,[-1.5,1.68,-2.29],[1.65,1.52,.14],.06);
box(world,mat('#cae7f3',.6,{emissive:'#9ecbe3',emissiveIntensity:.23}),[-1.5,1.68,-2.205],[1.41,1.28,.025],.015);
ball(world,mat('#fff1bd',1,{emissive:'#ffe5ac',emissiveIntensity:.35}),[-1.81,2.02,-2.182],[.19,.19,.012]);
box(world,C.cream,[-1.5,1.68,-2.15],[.065,1.3,.07],.015);
box(world,C.cream,[-1.5,1.68,-2.15],[1.43,.06,.07],.015);
box(world,C.cream,[-1.5,.94,-2.15],[1.9,.11,.34],.04);
const curtain=mat('#f2ede5');
for(let i=0;i<4;i++)ball(world,curtain,[-2.45+i*.10,1.8,-2.07],[.087,.78,.07]);
for(let i=0;i<4;i++)ball(world,curtain,[-.86+i*.1,1.8,-2.07],[.087,.78,.07]);
line(world,C.wood,[[-2.55,2.57,-2.09],[-.40,2.57,-2.09]],.033);
box(world,C.woodLight,[1.05,2.06,-2.16],[1.92,.11,.43],.04);
box(world,C.wood,[.43,1.95,-2.19],[.07,.22,.27],.025);box(world,C.wood,[1.7,1.95,-2.19],[.07,.22,.27],.025);
for(const [i,col] of ['#dfb0a8','#eacb83','#9bbcd4','#97aea4'].entries()){const b=box(world,mat(col),[.5+i*.14,2.34,-2.19],[.115,.44+(i%2)*.07,.23],.015);b.rotation.z=(i===3?-.13:0);}
function plant(parent,pos,size=1){const p=group(parent,pos);p.scale.setScalar(size);cyl(p,mat('#e6c6b4'),[0,.16,0],.21,.32);cyl(p,mat('#736a55'),[0,.326,0],.18,.012);line(p,C.leaf,[[0,.31,0],[.02,.62,0],[-.02,.91,0]],.018);for(let i=0;i<6;i++){const a=i*2.4;const leaf=ball(p,i%2?C.leaf:C.leaf2,[Math.sin(a)*.15,.44+i*.07,Math.cos(a)*.11],[.09,.22,.055]);leaf.rotation.z=Math.sin(a)*.75;leaf.rotation.x=Math.cos(a)*.65;}return p;}
plant(world,[1.49,2.11,-2.16],.61);plant(world,[-2.62,.06,-1.49],1.55);
const picture=group(world,[2.35,1.71,-2.30]);box(picture,C.woodLight,[0,0,0],[.57,.68,.10],.045);box(picture,C.cream,[0,0,.058],[.45,.55,.01],.01);ball(picture,mat('#eac776'),[.06,.08,.072],[.095,.095,.008]);box(picture,mat('#acc5d0'),[0,-.15,.073],[.39,.13,.01],.02);

const desk=group(world,[-1.50,0,.42]);
box(desk,C.woodLight,[0,1.28,0],[2.85,.17,1.32],.09);
box(desk,C.wood,[-.97,.67,0],[.55,1.15,1.03],.04);
for(let i=0;i<3;i++){box(desk,mat('#e5bb91'),[-.97,.35+i*.33,.536],[.48,.29,.03],.018);box(desk,C.cream,[-.97,.38+i*.33,.56],[.14,.035,.035],.012);}
for(const z of [-.46,.46]){const leg=box(desk,C.cream,[1.13,.65,z],[.13,1.2,.13],.03);leg.rotation.z=-.07;}
const monitor=group(desk,[-.22,1.37,-.22]);monitor.rotation.y=1.05;
box(monitor,mat('#c4ced9'),[0,.04,0],[.62,.07,.37],.035);box(monitor,mat('#c4ced9'),[0,.3,0],[.10,.48,.10],.035);
box(monitor,mat('#cbd9e4'),[0,.7,0],[1.32,.88,.13],.055);
const monitorCanvas=document.createElement('canvas');monitorCanvas.width=512;monitorCanvas.height=320;const mc=monitorCanvas.getContext('2d');
mc.fillStyle='#263c59';mc.fillRect(0,0,512,320);mc.fillStyle='#344c6c';mc.fillRect(0,0,512,34);['#efa99d','#f0cb86','#a0cdb4'].forEach((c,i)=>{mc.fillStyle=c;mc.beginPath();mc.arc(19+i*19,17,5,0,Math.PI*2);mc.fill();});mc.fillStyle='#a7c5df';mc.font='20px monospace';mc.fillText('a little happy place',26,76);for(let i=0;i<7;i++){mc.fillStyle=['#92b9dd','#e5c693','#a9ceb2'][i%3];mc.fillRect(28+(i%3)*18,105+i*22,[180,238,100,185,270,170,140][i],7);}mc.fillStyle='#f3d6bd';mc.fillRect(369,88,83,92);mc.fillStyle='#d1e5ed';mc.fillRect(350,180,120,20);mc.fillStyle='#e8ae9f';mc.beginPath();mc.arc(409,129,18,0,Math.PI*2);mc.fill();
const screenTex=new THREE.CanvasTexture(monitorCanvas);screenTex.colorSpace=THREE.SRGBColorSpace;
mesh(new THREE.PlaneGeometry(1.19,.72),new THREE.MeshBasicMaterial({map:screenTex}),monitor,[0,.72,.073]);
ball(monitor,mat('#749abe'),[0,.308,.083],[.023,.008,.003]);
const keyboard=group(desk,[.95,1.4,.37]);keyboard.rotation.y=.95;
box(keyboard,mat('#c3cfdc'),[0,0,0],[.94,.07,.34],.03);
for(let r=0;r<4;r++)for(let c=0;c<11;c++)box(keyboard,mat((c+r)%5===0?'#a0b4cb':'#f7f5ef'),[-.405+c*.081,.045,-.11+r*.072],[.063,.022,.052],.008);
box(keyboard,C.cream,[0,.047,.107],[.33,.025,.04],.008);
ball(desk,C.cream,[.60,1.4,.49],[.085,.045,.13]);
const cup=group(desk,[-1.12,1.39,.28]);cyl(cup,mat('#eac4b6'),[0,.13,0],.115,.25);cyl(cup,mat('#5e4436'),[0,.263,0],.097,.005);const handle=mesh(new THREE.TorusGeometry(.085,.023,8,24),mat('#eac4b6'),cup,[.115,.13,0]);
box(desk,mat('#8bacc5'),[-.94,1.4,-.34],[.49,.075,.39],.025);box(desk,C.cream,[-.93,1.445,-.34],[.43,.03,.35],.012);

// Chair and seated chibi. Pose parts are separate joints, not image swaps.
const character=group(world,[.54,0,.21]);character.rotation.y=-.65;
const chair=group(character,[0,0,-.12]);
box(chair,C.chair,[0,1.07,-.12],[1.0,.2,.85],.16);
box(chair,C.chair,[0,1.48,-.47],[.94,1.0,.17],.14);
box(chair,C.chairDark,[0,.7,-.08],[.14,.61,.14],.04);
for(let i=0;i<5;i++){const a=i*Math.PI*2/5;line(chair,C.chairDark,[[0,.34,-.08],[Math.sin(a)*.57,.22,Math.cos(a)*.57-.08]],.055);ball(chair,C.shoe,[Math.sin(a)*.56,.15,Math.cos(a)*.56-.08],[.1,.09,.09]);}
const person=group(character);person.userData.target='body';
const torso=group(person,[0,1.46,.04]);
ball(torso,C.shirt,[0,0,0],[.43,.48,.31]);
box(torso,C.shirtDark,[0,-.31,.07],[.68,.11,.47],.05);
ball(torso,C.skin,[0,.43,0],[.16,.18,.15]);
const collar=mesh(new THREE.TorusGeometry(.18,.043,10,32),C.shirtDark,torso,[0,.36,.11]);collar.rotation.x=-Math.PI*.4;
const badge=group(torso,[-.17,.04,.292]);ball(badge,C.cream,[-.025,.016,0],[.037,.04,.011]);ball(badge,C.cream,[.025,.016,0],[.037,.04,.011]);const badgeTip=ball(badge,C.cream,[0,-.024,0],[.034,.04,.012]);badgeTip.rotation.z=.1;
const legs=[];
for(const side of [-1,1]){const leg=group(person,[side*.225,1.05,.1]);box(leg,C.shorts,[0,0,.18],[.41,.30,.65],.12);box(leg,mat('#dfc2c4'),[0,-.034,.455],[.415,.15,.075],.03);ball(leg,C.skin,[0,-.32,.45],[.155,.39,.155]);ball(leg,C.cream,[0,-.67,.49],[.159,.12,.16]);ball(leg,C.shoe,[0,-.78,.59],[.20,.15,.30]);box(leg,C.sole,[0,-.865,.61],[.4,.09,.57],.04);box(leg,C.cream,[0,-.706,.655],[.30,.035,.07],.015);legs.push(leg);}
const head=group(person,[0,2.21,.09]);head.userData.target='head';
ball(head,C.skin,[0,0,0],[.64,.65,.555]);ball(head,C.skin,[0,-.22,.03],[.55,.37,.51]);
for(const side of [-1,1]){ball(head,C.skin,[side*.60,-.04,.0],[.145,.19,.11]);ball(head,C.pink,[side*.64,-.035,.082],[.060,.095,.015]);}
ball(head,C.hair,[0,.13,-.24],[.63,.60,.38]);
mesh(new THREE.SphereGeometry(1,40,26,0,Math.PI*2,0,Math.PI*.47),C.hair,head,[0,.04,0],[.677,.66,.595]);
for(let i=0;i<7;i++){const x=-.47+i*.152;const bang=ball(head,i%3===0?C.hairLight:C.hair,[x,.39+(Math.abs(x)*.14),.415-Math.abs(x)*.12],[.17,.24+(i%3)*.018,.16]);bang.rotation.z=-.48+Math.sin(i*.8)*.23;bang.rotation.x=-.20;}
for(const side of [-1,1]){const hair=ball(head,C.hair,[side*.569,.18,.059],[.1,.33,.23]);hair.rotation.z=side*-.16;}
const cowlick=ball(head,C.hairLight,[-.23,.62,-.06],[.24,.11,.15]);cowlick.rotation.z=.28;
const blush=[];for(const side of [-1,1]){blush.push(ball(head,C.pink,[side*.35,-.17,.459],[.112,.052,.011]));for(let i=0;i<2;i++){line(head,mat('#d5919b'),[[side*.35-.018+i*.039,-.19,.474],[side*.35-.008+i*.039,-.145,.481]],.005);}}
ball(head,C.skin,[0,-.115,.553],[.046,.045,.039]);
const faces={idle:group(head),hurt:group(head),laugh:group(head)};
for(const side of [-1,1]){const x=side*.207;ball(faces.idle,C.ink,[x,-.01,.529],[.043,.063,.018]);ball(faces.idle,C.white,[x-.008,.014,.546],[.012,.014,.005]);line(faces.idle,C.hair,[[x-.065,.118,.519],[x,.135,.53],[x+.065,.117,.519]],.014);line(faces.hurt,C.ink,[[x-.054,-.01,.541],[x,-.045,.549],[x+.056,-.01,.541]],.016);line(faces.hurt,C.hair,[[x-.068,.103+(side<0?0:.045),.526],[x+.06,.103+(side>0?0:.045),.526]],.016);line(faces.laugh,C.ink,[[x-.066,-.035,.535],[x,.016,.548],[x+.064,-.035,.535]],.019);}
line(faces.idle,C.ink,[[-.09,-.237,.506],[0,-.265,.53],[.09,-.237,.506]],.012);
line(faces.hurt,C.ink,[[-.075,-.265,.507],[0,-.224,.541],[.075,-.265,.507]],.013);
ball(faces.hurt,mat('#a6d9f2',.35),[.28,-.115,.50],[.027,.062,.016]);
ball(faces.laugh,mat('#6c3845'),[0,-.235,.525],[.104,.081,.020]);ball(faces.laugh,C.pink,[0,-.273,.544],[.064,.030,.008]);
faces.hurt.visible=false;faces.laugh.visible=false;

function makeArm(side){const g=group(person);const upper=mesh(cylinderGeo,C.shirt,g),lower=mesh(cylinderGeo,C.skin,g);const elbow=ball(g,C.skin,[0,0,0],[.123,.123,.123]);const hand=ball(g,C.skin,[0,0,0],[.13,.12,.11]);const sleeve=ball(g,C.shirt,[side*.405,1.66,.025],[.19,.225,.22]);return {g,upper,lower,elbow,hand,side,sleeve};}
const arms=[makeArm(-1),makeArm(1)];
function poseArm(arm,elbow,hand){const shoulder=[arm.side*.41,1.66,.045];bone(arm.upper,shoulder,elbow,.155);bone(arm.lower,elbow,hand,.107);arm.elbow.position.set(...elbow);arm.hand.position.set(...hand);}
poseArm(arms[0],[-.64,1.34,.10],[-.80,1.39,-.11]);poseArm(arms[1],[.50,1.24,.23],[.33,1.27,.46]);

// The cat is a complete jointed mesh. Its belly rotates from the underside to face up.
const rug=group(world,[1.69,.10,1.04]);const rugMesh=cyl(rug,mat('#c7bbd2'),[0,0,0],1,.04);rugMesh.scale.set(1.05,.04,.77);
const innerRug=cyl(rug,mat('#e0d8e6'),[0,.025,0],1,.024);innerRug.scale.set(.94,.024,.67);
const cat=group(world,[1.69,.39,1.04]);cat.rotation.y=-.24;cat.userData.target='cat';
const catRoll=group(cat);
const catBody=ball(catRoll,C.white,[.13,0,0],[.60,.31,.35]);
ball(catRoll,C.fur,[.46,.015,-.025],[.30,.31,.33]);
const belly=ball(catRoll,mat('#f6dedf'),[.10,-.264,.035],[.34,.048,.22]);
const catHead=group(catRoll,[-.49,.105,.035]);
ball(catHead,C.white,[0,0,0],[.315,.285,.29]);
ball(catHead,C.fur,[-.12,.13,-.12],[.22,.19,.16]);
for(const side of [-1,1]){const ear=mesh(new THREE.ConeGeometry(.13,.29,4,1),C.white,catHead,[side*.20,.265,-.01]);ear.rotation.z=side*-.21;ear.rotation.y=Math.PI*.25;const earPink=mesh(new THREE.ConeGeometry(.076,.18,3,1),C.paw,catHead,[side*.20,.275,.069]);earPink.rotation.z=side*-.21;earPink.rotation.y=.1;}
ball(catHead,C.white,[-.10,-.068,.24],[.13,.10,.073]);ball(catHead,C.white,[.10,-.068,.24],[.13,.10,.073]);
ball(catHead,C.paw,[0,-.041,.307],[.037,.025,.015]);
line(catHead,C.ink,[[0,-.065,.308],[0,-.102,.31],[-.045,-.123,.298]],.007);line(catHead,C.ink,[[0,-.102,.31],[.046,-.123,.298]],.007);
for(const side of [-1,1])for(let i=0;i<3;i++)line(catHead,mat('#aaa1a6'),[[side*.17,-.08+i*.033,.24],[side*.36,-.10+i*.064,.19]],.004);
const catFaces={sleep:group(catHead),love:group(catHead)};
for(const side of [-1,1]){const x=side*.12;line(catFaces.sleep,C.ink,[[x-.055,.025,.260],[x,.001,.278],[x+.053,.025,.260]],.010);line(catFaces.love,C.ink,[[x-.055,.005,.265],[x,.048,.273],[x+.052,.005,.265]],.013);ball(catFaces.love,C.paw,[side*.208,-.040,.214],[.044,.022,.009]);}
catFaces.love.visible=false;
const paws=[];
for(let i=0;i<4;i++){const p=group(catRoll,[i<2?-.28:.43,-.16,i%2?-.20:.23]);const paw=ball(p,C.white,[0,-.056,.0],[.128,.147,.125]);ball(p,C.paw,[0,-.18,.01],[.062,.013,.061]);for(const k of [-1,0,1])ball(p,C.paw,[k*.04,-.168,.084],[.019,.014,.022]);paws.push(p);}
const tail=group(catRoll,[.52,.05,-.13]);line(tail,C.fur,[[0,0,0],[.26,.04,-.08],[.39,-.13,.02],[.29,-.20,.28],[-.03,-.19,.38],[-.28,-.14,.38]],.105);
for(let i=0;i<3;i++){const tuft=ball(catRoll,C.white,[-.22+i*.29,.20,.17],[.21,.14,.20]);tuft.rotation.z=.2;}

// Hit tests respect the frontmost surface, so clicking through furniture is impossible.
const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();let pointerStart=null;let hoverTarget=null;
const actionState={person:'idle',personStart:-100,cat:'sleep',catStart:-100};
const duration={head:3.15,body:3.6,cat:5.2};
let elapsed=0,lastTime=performance.now(),lastSound=-10,soundOn=false,audioCtx;
const actionButtons=[...document.querySelectorAll('[data-action]')];
function classify(object){for(let o=object;o;o=o.parent)if(o.userData.target)return o.userData.target;return null;}
function hitTest(clientX,clientY){const r=canvas.getBoundingClientRect();pointer.set((clientX-r.left)/r.width*2-1,-(clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(world.children,true)[0];return hit?classify(hit.object):null;}
function setFace(name){for(const [key,g] of Object.entries(faces))g.visible=key===name;}
function updateMood(){const p=actionState.person,c=actionState.cat;$('#mood').textContent=p==='head'?'别打别打！':p==='body'?'俺不中嘞':c==='belly'?'呼噜呼噜':'他在忙，猫在做梦。';}
function tone(freq,start,length,volume=.045,type='sine',end){if(!audioCtx)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,audioCtx.currentTime+start);if(end)o.frequency.exponentialRampToValueAtTime(end,audioCtx.currentTime+start+length);g.gain.setValueAtTime(0,audioCtx.currentTime+start);g.gain.linearRampToValueAtTime(volume,audioCtx.currentTime+start+.015);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+start+length);o.connect(g).connect(audioCtx.destination);o.start(audioCtx.currentTime+start);o.stop(audioCtx.currentTime+start+length+.02);}
function playSound(type){if(!soundOn||elapsed-lastSound<.2)return;lastSound=elapsed;try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();void audioCtx.resume();if(type==='head'){tone(560,0,.16,.04,'sine',350);tone(360,.16,.22,.035,'sine',260);}else if(type==='body'){for(let i=0;i<4;i++)tone(480+(i%2)*160,i*.13,.105,.045,'sine',420);}else{tone(610,0,.26,.035,'sine',830);tone(830,.26,.38,.025,'sine',510);tone(80,.65,.5,.022,'triangle',62);}}catch{soundOn=false;syncSound();}}
function project(position){const v=position.clone().project(camera),r=canvas.getBoundingClientRect();return {x:(v.x*.5+.5)*r.width,y:(-v.y*.5+.5)*r.height,visible:v.z>-1&&v.z<1};}
const wp=new THREE.Vector3();
function particles(type){if(reducedMotion)return;const anchor=type==='cat'?cat:head;const p=project(anchor.getWorldPosition(new THREE.Vector3()));for(let i=0;i<7;i++){const el=document.createElement('span');el.className='particle';el.textContent=type==='head'?'✧':type==='body'?'♪':'♥';el.style.left=p.x+(i-3)*15+'px';el.style.top=p.y-35+Math.sin(i)*13+'px';el.style.setProperty('--drift',(i-3)*19+'px');el.style.setProperty('--turn',(i-3)*10+'deg');el.style.animationDelay=i*.05+'s';if(type==='head')el.style.color='#89a9d3';$('#particles').append(el);setTimeout(()=>el.remove(),1900);}}
function activate(type){if(!['head','body','cat'].includes(type))throw new TypeError('Unknown interaction');if(type==='cat'){actionState.cat='belly';actionState.catStart=elapsed;$('#cat-speech').textContent='呼噜呼噜';$('#cat-speech').classList.add('show');}else{actionState.person=type;actionState.personStart=elapsed;$('#speech').textContent=type==='head'?'别打别打！':'俺不中嘞';$('#speech').classList.add('show');}actionButtons.forEach(b=>b.classList.toggle('active',(b.dataset.action==='cat'&&actionState.cat==='belly')||b.dataset.action===actionState.person));updateMood();particles(type);playSound(type);return {interaction:type,person:actionState.person,cat:actionState.cat};}
actionButtons.forEach(b=>b.addEventListener('click',()=>activate(b.dataset.action)));
canvas.addEventListener('pointerdown',e=>{if(e.isPrimary)pointerStart={x:e.clientX,y:e.clientY,id:e.pointerId,t:performance.now()};else pointerStart=null;});
canvas.addEventListener('pointerup',e=>{if(!pointerStart||e.pointerId!==pointerStart.id)return;const p=pointerStart;pointerStart=null;if(Math.hypot(e.clientX-p.x,e.clientY-p.y)>8||performance.now()-p.t>700)return;const target=hitTest(e.clientX,e.clientY);if(target)activate(target);});
canvas.addEventListener('pointercancel',()=>pointerStart=null);
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;hoverTarget=hitTest(e.clientX,e.clientY);canvas.style.cursor=hoverTarget?'pointer':'grab';});
canvas.addEventListener('pointerleave',()=>{hoverTarget=null;pointerStart=null;});
window.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.repeat||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;const key={1:'head',2:'body',3:'cat'}[e.key];if(key){e.preventDefault();activate(key);}});
function syncSound(){$('#sound').setAttribute('aria-pressed',String(soundOn));$('#sound').setAttribute('aria-label',soundOn?'关闭互动音效':'开启互动音效');$('#sound').title=soundOn?'关闭互动音效':'开启互动音效';$('#sound span').textContent=soundOn?'音效开':'音效关';$('#sound-path').setAttribute('d',soundOn?'M16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14':'m16 9 5 6m0-6-5 6');}
$('#sound').addEventListener('click',()=>{soundOn=!soundOn;syncSound();if(soundOn)playSound('cat');});
function resetCamera(){const mobile=stage.clientWidth<700;camera.position.set(mobile?7.4:7.55,mobile?6.5:5.8,mobile?13.6:10.7);controls.maxDistance=mobile?24:17;controls.target.set(0,1.07,0);camera.zoom=mobile?.82:1;camera.updateProjectionMatrix();controls.update();}
$('#reset').addEventListener('click',resetCamera);
let previousMobile=null;
function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;const mobile=w<700;if(previousMobile!==mobile){previousMobile=mobile;resetCamera();}camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(stage);resize();
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#error').hidden=false;$('#error-message').textContent='3D 显示暂停了，请重新打开小房间。';});

const smooth=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
function envelope(t,total){return ease(t/.38)*(1-ease((t-total+.55)/.55));}
function mixPoint(a,b,t){return a.map((v,i)=>smooth(v,b[i],t));}
function updatePerson(){const kind=actionState.person,t=elapsed-actionState.personStart;let amount=kind==='idle'?0:envelope(t,duration[kind]);if(kind!=='idle'&&t>=duration[kind]){actionState.person='idle';$('#speech').classList.remove('show');actionButtons.filter(b=>b.dataset.action!=='cat').forEach(b=>b.classList.remove('active'));updateMood();amount=0;}
 const breathe=reducedMotion?0:Math.sin(elapsed*2)*.012;person.position.y=breathe;person.rotation.set(0,0,0);head.rotation.set(0,.4+Math.sin(elapsed*.5)*.025,0);torso.scale.set(1,1,1);
 let leftElbow=[-.55,1.45,.56],leftHand=[-.42,1.40,1.03],rightElbow=[.50,1.24,.23],rightHand=[.33,1.27,.46];
 if(kind==='head'&&amount>0){head.rotation.x=-.12*amount;head.rotation.z=Math.sin(t*6)*.06*amount;person.position.y-=.065*amount;leftElbow=mixPoint(leftElbow,[-.81,2.04,.06],amount);leftHand=mixPoint(leftHand,[-.46,2.66,.30],amount);rightElbow=mixPoint(rightElbow,[.80,2.04,.06],amount);rightHand=mixPoint(rightHand,[.46,2.66,.30],amount);setFace(amount>.28?'hurt':'idle');}
 else if(kind==='body'&&amount>0){const shake=reducedMotion?0:Math.sin(t*24)*.038*amount;person.rotation.z=shake;person.position.y+=Math.abs(Math.sin(t*16))*.035*amount;head.rotation.x=-.13*amount;head.rotation.z=-shake;torso.scale.y=1-.07*amount;leftElbow=mixPoint(leftElbow,[-.55,1.3,.35],amount);leftHand=mixPoint(leftHand,[-.16,1.48,.37],amount);rightElbow=mixPoint(rightElbow,[.55,1.3,.35],amount);rightHand=mixPoint(rightHand,[.18,1.42,.39],amount);setFace(amount>.22?'laugh':'idle');}
 else{setFace('idle');leftHand[1]+=(reducedMotion?0:Math.sin(elapsed*7)*.008);}
 for(const [i,leg] of legs.entries())leg.rotation.x=kind==='body'?Math.sin(t*13+i)*.06*amount:(reducedMotion?0:Math.sin(elapsed*1.8+i)*.014);
 poseArm(arms[0],leftElbow,leftHand);poseArm(arms[1],rightElbow,rightHand);
 const blink=elapsed%4.8>4.62;faces.idle.scale.y=blink?.14:1;
}
function updateCat(){const t=elapsed-actionState.catStart;let amt=actionState.cat==='belly'?envelope(t,duration.cat):0;if(actionState.cat==='belly'&&t>=duration.cat){actionState.cat='sleep';$('#cat-speech').classList.remove('show');actionButtons.filter(b=>b.dataset.action==='cat').forEach(b=>b.classList.remove('active'));updateMood();amt=0;}
 catRoll.rotation.x=-Math.PI*amt;
 cat.position.y=.39+Math.sin(Math.PI*amt)*.095;
 catRoll.position.y=(reducedMotion?0:Math.sin(elapsed*2.1)*.008)*(1-amt);
 catHead.rotation.x=.14*amt;catHead.rotation.z=(reducedMotion?0:Math.sin(t*5)*.045*amt);catHead.position.y=.105-.04*amt;
 catFaces.sleep.visible=amt<.45;catFaces.love.visible=amt>=.45;
 for(const [i,p] of paws.entries()){p.position.y=-.16-.13*amt;p.rotation.z=(i<2?-1:1)*.22*amt+(reducedMotion?0:Math.sin(t*7+i)*.16*amt);p.position.z=(i%2?-.20:.23)+(i%2?-.02:.04)*amt;}
 tail.rotation.x=(reducedMotion?0:Math.sin(elapsed*1.5)*.018)+Math.sin(t*5)*.12*amt;
 catBody.scale.y=.31+(reducedMotion?0:Math.sin(elapsed*2.1)*.006);
 $('#sleep').style.opacity=String(1-amt);
}
function positionLabels(){head.getWorldPosition(wp);const hp=project(wp.clone().add(new THREE.Vector3(.25,.95,0)));$('#head-hint').style.left=hp.x+'px';$('#head-hint').style.top=hp.y+'px';$('#head-hint').style.opacity=actionState.person==='idle'?'1':'0';$('#head-hint').style.pointerEvents=actionState.person==='idle'?'auto':'none';const sp=project(wp.clone().add(new THREE.Vector3(.05,1,0)));$('#speech').style.left=THREE.MathUtils.clamp(sp.x,125,stage.clientWidth-125)+'px';$('#speech').style.top=Math.max(130,sp.y)+'px';
 cat.getWorldPosition(wp);const cp=project(wp.clone().add(new THREE.Vector3(.35,.92,0)));$('#cat-hint').style.left=cp.x+'px';$('#cat-hint').style.top=cp.y+'px';$('#cat-hint').style.opacity=actionState.cat==='sleep'?'1':'0';$('#cat-hint').style.pointerEvents=actionState.cat==='sleep'?'auto':'none';$('#cat-speech').style.left=THREE.MathUtils.clamp(cp.x,120,stage.clientWidth-120)+'px';$('#cat-speech').style.top=cp.y+'px';const zp=project(wp.clone().add(new THREE.Vector3(-.50,.44,0)));$('#sleep').style.left=zp.x+'px';$('#sleep').style.top=zp.y-30+'px';}
document.addEventListener('visibilitychange',()=>{lastTime=performance.now();});
function frame(now){requestAnimationFrame(frame);const dt=(now-lastTime)/1000;lastTime=now;if(document.hidden)return;elapsed+=dt;updatePerson();updateCat();controls.update();world.updateMatrixWorld(true);positionLabels();renderer.render(scene,camera);}
renderer.render(scene,camera);$('#loading').hidden=true;requestAnimationFrame(frame);

// Browser agent tools reuse exactly the actions offered by the visible controls.
if(document.modelContext?.registerTool){const lifecycle=new AbortController();addEventListener('pagehide',()=>lifecycle.abort(),{once:true});try{void Promise.resolve(document.modelContext.registerTool({name:'interact_with_companions',title:'和人物或猫咪互动',description:'锤下人物脑袋、挠人物身体，或摸猫咪，播放对应的动作。',inputSchema:{type:'object',properties:{target:{type:'string',enum:['head','body','cat']}},required:['target'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async input=>{if(!input||Object.keys(input).some(k=>k!=='target')||!['head','body','cat'].includes(input.target))throw new TypeError('target must be head, body, or cat');const result=activate(input.target);await new Promise(requestAnimationFrame);return result;}},{signal:lifecycle.signal})).catch(()=>{});}catch{}}
