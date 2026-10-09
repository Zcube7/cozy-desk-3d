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
const C={skin:mat('#f5c9ae'),pink:mat('#eaa0a3'),hair:mat('#222630',.82),hairLight:mat('#2b303b',.85),shirt:mat('#80bce3'),shirtDark:mat('#5697c7'),shorts:mat('#edd0ce'),sole:mat('#f4f1ee'),shoe:mat('#434e63'),white:mat('#fffaf2'),fur:mat('#f2eff0'),furShade:mat('#d9d0d3'),paw:mat('#e39caa'),ink:mat('#3d3640'),wood:mat('#d6a579'),woodLight:mat('#ecc8a0'),blue:mat('#779bc6'),chair:mat('#7499be'),chairDark:mat('#4c6989'),cream:mat('#f5f1e6'),metal:mat('#b6c4d2',.48),leaf:mat('#7fa38c'),leaf2:mat('#a4bc91')};
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

// Continuous silhouettes keep cheeks, clothing, and fur soft from every angle.
function softForm(parent,m,pos,size,{cheeks=0,fluff=0}={}){
 const geo=new THREE.SphereGeometry(1,40,28),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  const round=cheeks*Math.exp(-(((y+.30)/.48)**2));
  const fur=1+fluff*(Math.sin(x*23+y*7)*Math.sin(z*21-y*11)+.4*Math.sin(y*29+z*13));
  p.setXYZ(i,x*size[0]*(1+round)*fur,y*size[1]*fur,z*size[2]*fur+Math.max(0,z)*round*.12);
 }
 geo.computeVertexNormals();return mesh(geo,m,parent,pos);
}
function hairLock(parent,points,width,depth,m=C.hair){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),positions=[],indices=[];
 const steps=18,sides=10;
 for(let i=0;i<=steps;i++){
  const t=i/steps,c=curve.getPoint(t),tangent=curve.getTangent(t);
  const across=new THREE.Vector3(tangent.y,-tangent.x,0).normalize();
  const front=new THREE.Vector3().crossVectors(across,tangent).normalize();
  const taper=.018+Math.pow(Math.sin(Math.PI*t),.62)*(1-.35*t);
  for(let j=0;j<=sides;j++){
   const a=j/sides*Math.PI*2,v=c.clone().addScaledVector(across,Math.cos(a)*width*taper).addScaledVector(front,Math.sin(a)*depth*taper);
   positions.push(v.x,v.y,v.z);
   if(i<steps&&j<sides){const k=i*(sides+1)+j;indices.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}
  }
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();return mesh(geo,m,parent);
}

const torso=group(person,[0,1.46,.04]);
box(torso,C.shirt,[0,.015,0],[.82,.77,.59],.19);
box(torso,C.shirtDark,[0,-.32,.018],[.79,.060,.56],.025);
ball(torso,C.skin,[0,.39,0],[.15,.15,.145]);
const collar=mesh(new THREE.TorusGeometry(.165,.030,10,32),C.shirtDark,torso,[0,.342,.10]);collar.rotation.x=-Math.PI*.36;
line(torso,mat('#acd7ef'),[[-.28,-.25,.29],[0,-.267,.303],[.28,-.25,.29]],.006);
const pocket=box(torso,mat('#8ac5e9'),[-.20,.085,.291],[.205,.205,.026],.042);
line(torso,C.shirtDark,[[-.297,.17,.309],[-.105,.17,.309]],.007);
const badge=group(torso,[-.20,.080,.315]);
ball(badge,C.cream,[-.015,.012,0],[.025,.026,.008]);ball(badge,C.cream,[.015,.012,0],[.025,.026,.008]);ball(badge,C.cream,[0,-.015,0],[.020,.024,.008]);
const legs=[];
for(const side of [-1,1]){
 const leg=group(person,[side*.225,1.05,.1]);
 box(leg,C.shorts,[0,.012,.18],[.42,.31,.64],.115);
 box(leg,mat('#d7b4b8'),[0,-.041,.452],[.405,.065,.073],.025);
 line(leg,mat('#bc999f'),[[side*.16,.09,.416],[side*.105,-.015,.492],[side*.028,-.025,.510]],.006);
 ball(leg,C.skin,[0,-.32,.435],[.165,.345,.164]);
 ball(leg,C.cream,[0,-.632,.46],[.166,.093,.166]);
 line(leg,mat('#ccd8e3'),[[-.12,-.627,.565],[0,-.623,.619],[.12,-.627,.565]],.008);
 ball(leg,C.shoe,[0,-.77,.57],[.201,.153,.282]);
 box(leg,C.sole,[0,-.863,.60],[.405,.082,.55],.040);
 ball(leg,mat('#65798f'),[0,-.723,.731],[.174,.099,.095]);
 for(let i=0;i<2;i++)line(leg,C.cream,[[-.11,-.650-i*.035,.57+i*.078],[0,-.637-i*.036,.58+i*.080],[.11,-.650-i*.035,.57+i*.078]],.012);
 legs.push(leg);
}
const head=group(person,[0,2.26,.09]);head.userData.target='head';
softForm(head,C.skin,[0,0,0],[.658,.645,.575],{cheeks:.075});
const faceZ=(x,y)=>.578*Math.sqrt(Math.max(.035,1-(x/.678)**2-(y/.657)**2))+.012;
const fp=(x,y,offset=.008)=>[x,y,faceZ(x,y)+offset];
for(const side of [-1,1]){
 const ear=group(head,[side*.625,-.08,-.002]);ear.rotation.z=side*-.10;
 ball(ear,C.skin,[0,0,0],[.13,.17,.10]);ball(ear,mat('#e8ad9e'),[side*.014,0,.073],[.060,.100,.025]);
 line(ear,C.skin,[[side*.04,.05,.096],[side*-.018,.045,.107],[side*-.031,-.045,.096]],.020);
}

// A single scalp with a shaped hairline, then broad tapered, swept locks.
const hairGeo=new THREE.SphereGeometry(1,64,32,0,Math.PI*2,0,Math.PI/2),hairPosition=hairGeo.attributes.position;
for(let i=0;i<hairPosition.count;i++){
 const x=hairPosition.getX(i),y=hairPosition.getY(i),z=hairPosition.getZ(i),azimuth=Math.atan2(x,z);
 const front=Math.max(0,Math.cos(azimuth)),boundary=1.91-.72*front*front+.11*Math.max(0,-Math.cos(azimuth));
 const angle=Math.acos(THREE.MathUtils.clamp(y,-1,1))/(Math.PI/2)*boundary;
 const groove=1+.009*Math.cos(azimuth*17+angle*3)*Math.sin(angle);
 hairPosition.setXYZ(i,Math.sin(azimuth)*Math.sin(angle)*.695*groove,Math.cos(angle)*.705+.042,Math.cos(azimuth)*Math.sin(angle)*.621*groove-.01);
}
hairGeo.computeVertexNormals();mesh(hairGeo,C.hair,head);
const locks=[
 {p:[[-.23,.68,.18],[-.48,.57,.32],[-.62,.24,.25],[-.61,-.015,.15]],w:.15,d:.075},
 {p:[[-.19,.68,.20],[-.40,.57,.48],[-.48,.29,.46],[-.43,.145,.46]],w:.18,d:.095},
 {p:[[-.14,.68,.22],[-.27,.53,.55],[-.27,.28,.565],[-.17,.137,.552]],w:.18,d:.095},
 {p:[[-.09,.68,.22],[-.04,.54,.57],[.04,.30,.601],[.13,.184,.575]],w:.185,d:.082},
 {p:[[-.04,.68,.21],[.21,.57,.49],[.32,.35,.556],[.35,.21,.504]],w:.175,d:.085},
 {p:[[.02,.67,.18],[.43,.54,.37],[.55,.29,.37],[.57,.07,.29]],w:.15,d:.080}
];
for(const [i,l] of locks.entries())hairLock(head,l.p,l.w,l.d,i===2||i===5?C.hairLight:C.hair);
hairLock(head,[[-.24,.62,-.17],[-.29,.76,-.04],[-.12,.777,.02],[.008,.701,.11]],.085,.045,C.hairLight);
for(const side of [-1,1])hairLock(head,[[side*.53,.41,.16],[side*.655,.20,.11],[side*.61,-.12,.09]],.075,.05);

const cheekMaterial=mat('#eb969e',.95,{transparent:true,opacity:.52,depthWrite:false});
for(const side of [-1,1]){
 const blush=ball(head,cheekMaterial,fp(side*.37,-.183,.007),[.112,.059,.010]);blush.rotation.y=side*.60;
 for(let i=0;i<2;i++){const x=side*.37+(i-.5)*.031;line(head,mat('#d89197'),[fp(x-.006,-.205,.018),fp(x+.006,-.171,.018)],.0035);}
}
ball(head,mat('#edb79b'),fp(0,-.125,.004),[.037,.039,.039]);
const faces={idle:group(head),hurt:group(head),laugh:group(head)};
const idleEyes=[];
for(const side of [-1,1]){
 const x=side*.232,eye=group(faces.idle,fp(x,-.015,.006));eye.rotation.y=side*.27;
 ball(eye,mat('#fff9f0'),[0,0,0],[.073,.088,.019]);
 ball(eye,mat('#463d3c',.48),[0,-.002,.017],[.056,.074,.012]);
 ball(eye,mat('#25272f',.45),[.002,.012,.027],[.035,.048,.004]);
 ball(eye,C.white,[-.018,.030,.031],[.015,.018,.005]);ball(eye,C.white,[.017,-.027,.030],[.006,.008,.003]);idleEyes.push(eye);
 line(faces.idle,C.hair,[fp(x-.076,.136),fp(x,.154),fp(x+.067,.139)],.012);
 line(faces.hurt,C.ink,[fp(x-.066,-.020),fp(x,-.052),fp(x+.061,-.020)],.016);
 line(faces.hurt,C.hair,[fp(x-.076,.126+(side<0?0:.056)),fp(x,.161),fp(x+.073,.126+(side>0?0:.056))],.013);
 line(faces.laugh,C.ink,[fp(x-.078,-.037),fp(x,.021),fp(x+.075,-.037)],.019);
 line(faces.laugh,C.hair,[fp(x-.068,.151),fp(x,.170),fp(x+.062,.151)],.011);
}
line(faces.idle,C.ink,[fp(-.095,-.234),fp(0,-.265),fp(.095,-.234)],.010);
line(faces.hurt,C.ink,[fp(-.071,-.278),fp(0,-.237),fp(.071,-.278)],.011);
const tear=ball(faces.hurt,mat('#92cfe9',.22,{transparent:true,opacity:.85}),fp(.302,-.127,.022),[.027,.056,.017]);tear.rotation.z=-.13;
ball(faces.laugh,mat('#673847'),fp(0,-.248,.012),[.107,.084,.025]);
ball(faces.laugh,C.pink,fp(0,-.285,.034),[.065,.027,.009]);
faces.hurt.visible=false;faces.laugh.visible=false;

const limbGeo=new THREE.CapsuleGeometry(1,3,6,16);limbGeo.scale(1,.20,1);
function makeArm(side){
 const g=group(person),upper=mesh(limbGeo,C.shirt,g),lower=mesh(limbGeo,C.skin,g);
 const elbow=ball(g,C.skin,[0,0,0],[.111,.115,.113]);
 const hand=group(g);
 ball(hand,C.skin,[0,0,0],[.118,.137,.085]);
 for(let i=0;i<3;i++)ball(hand,C.skin,[(i-1)*.049,.068,0],[.035,.074,.076]);
 const thumb=ball(hand,C.skin,[side*.095,-.025,.030],[.055,.087,.060]);thumb.rotation.z=side*-.40;
 for(const x of [-.025,.025])line(hand,mat('#dcaa92'),[[x,.060,.073],[x,.102,.068]],.003);
 const sleeve=ball(g,C.shirt,[side*.382,1.677,.014],[.185,.180,.201]);
 return {g,upper,lower,elbow,hand,side,sleeve};
}
const arms=[makeArm(-1),makeArm(1)];
function poseArm(arm,elbow,hand){const shoulder=[arm.side*.40,1.66,.045];bone(arm.upper,shoulder,elbow,.154);bone(arm.lower,elbow,hand,.103);arm.elbow.position.set(...elbow);arm.hand.position.set(...hand);arm.hand.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...hand).sub(new THREE.Vector3(...elbow)).normalize());}
poseArm(arms[0],[-.64,1.34,.10],[-.80,1.39,-.11]);poseArm(arms[1],[.50,1.24,.23],[.33,1.27,.46]);

// A curled, long-haired cat with a rounded muzzle and a separately posed head.
const rug=group(world,[1.69,.10,1.04]);const rugMesh=cyl(rug,mat('#c7bbd2'),[0,0,0],1,.04);rugMesh.scale.set(1.05,.04,.77);
const innerRug=cyl(rug,mat('#e0d8e6'),[0,.025,0],1,.024);innerRug.scale.set(.94,.024,.67);
const cat=group(world,[1.69,.47,1.04]);cat.rotation.y=-.10;cat.userData.target='cat';
const catRoll=group(cat);
const catCoat=mat('#f8f6f2',.97),catSilver=mat('#d9dce0',.98),catCream=mat('#eddcd6',1);
const catBody=softForm(catRoll,catCoat,[.14,0,0],[.64,.315,.365],{fluff:.011});
softForm(catRoll,catCoat,[-.23,.045,.015],[.385,.33,.355],{fluff:.019});
const belly=softForm(catRoll,catCream,[.13,-.294,.025],[.387,.043,.232],{fluff:.025});
const catHead=group(catRoll,[-.48,.105,.145]);catHead.rotation.y=.24;
softForm(catHead,catCoat,[0,0,0],[.383,.327,.313],{cheeks:.055,fluff:.009});
mesh(new THREE.SphereGeometry(1,32,20,0,Math.PI*2,0,Math.PI*.49),catSilver,catHead,[.035,.090,-.065],[.345,.272,.295]);
const earShape=new THREE.Shape();earShape.moveTo(-.132,-.10);earShape.quadraticCurveTo(-.135,.025,-.026,.220);earShape.quadraticCurveTo(.002,.264,.045,.20);earShape.quadraticCurveTo(.135,.018,.128,-.10);earShape.quadraticCurveTo(0,-.142,-.132,-.10);
const earGeo=new THREE.ExtrudeGeometry(earShape,{depth:.07,bevelEnabled:true,bevelThickness:.024,bevelSize:.021,bevelSegments:3,steps:1,curveSegments:10});
for(const side of [-1,1]){
 const ear=group(catHead,[side*.242,.257,-.024]);ear.rotation.z=-side*.23;
 mesh(earGeo,catSilver,ear);mesh(earGeo,mat('#e9b7bb'),ear,[0,.012,.104],[.64,.68,.13]);
 for(let i=0;i<3;i++)hairLock(catHead,[[side*.27,.03-i*.058,.10],[side*(.38+i*.012),-.02-i*.050,.14],[side*(.36+i*.011),-.13-i*.045,.105]],.037,.031,catCoat);
}
const catPoint=(x,y,offset=.011)=>[x,y,.319*Math.sqrt(Math.max(.05,1-(x/.397)**2-(y/.34)**2))+offset];
for(const side of [-1,1]){
 ball(catHead,catCoat,[side*.083,-.104,.285],[.117,.076,.064]);
 for(let i=0;i<3;i++)line(catHead,mat('#9fa5af'),[[side*.175,-.107+i*.027,.274],[side*.33,-.100+i*.040,.299],[side*(.475-i*.027),-.136+i*.062,.252]],.0035);
 ball(catHead,mat('#b7adb0'),[side*.15,-.099,.328],[.007,.006,.003]);
}
const noseShape=new THREE.Shape();noseShape.moveTo(-.034,.005);noseShape.quadraticCurveTo(-.04,.026,0,.023);noseShape.quadraticCurveTo(.041,.026,.033,.005);noseShape.quadraticCurveTo(.014,-.025,0,-.027);noseShape.quadraticCurveTo(-.013,-.025,-.034,.005);
mesh(new THREE.ExtrudeGeometry(noseShape,{depth:.008,bevelEnabled:true,bevelThickness:.005,bevelSize:.005,bevelSegments:2,steps:1}),C.paw,catHead,[0,-.078,.352]);
line(catHead,mat('#80656d'),[[0,-.098,.357],[0,-.138,.349],[-.049,-.153,.337]],.006);line(catHead,mat('#80656d'),[[0,-.138,.349],[.049,-.153,.337]],.006);
const catFaces={sleep:group(catHead),love:group(catHead)};
for(const side of [-1,1]){
 const x=side*.148;
 line(catFaces.sleep,mat('#77707a'),[catPoint(x-.063,.031),catPoint(x,.002),catPoint(x+.063,.031)],.011);
 const eye=group(catFaces.love,catPoint(x,.026,.012));eye.rotation.y=side*.26;
 ball(eye,mat('#fffef9'),[0,0,0],[.092,.102,.018]);ball(eye,mat('#71848c',.38),[0,-.003,.016],[.077,.087,.013]);ball(eye,mat('#293942',.28),[0,.004,.028],[.055,.070,.008]);ball(eye,C.white,[-.024,.030,.035],[.025,.027,.004]);ball(eye,C.white,[.027,-.030,.035],[.009,.011,.003]);
 const blush=ball(catFaces.love,mat('#e8b7bd'),catPoint(side*.252,-.079,.014),[.047,.025,.009]);blush.rotation.y=side*.6;
}
catFaces.love.visible=false;
const paws=[];
for(let i=0;i<4;i++){
 const p=group(catRoll,[i<2?-.28:.43,-.14,i%2?-.19:.24]);
 softForm(p,catCoat,[0,-.031,0],[.133,.119,.130],{fluff:.012});
 ball(p,C.paw,[0,-.145,.0],[.061,.012,.055]);
 for(let j=0;j<4;j++){const a=(j-1.5)*.48;ball(p,C.paw,[Math.sin(a)*.088,-.126,Math.cos(a)*.096],[.022,.011,.023]);}
 paws.push(p);
}
const tail=group(catRoll,[.52,.045,-.14]);
const tailCurve=new THREE.CatmullRomCurve3([[0,0,0],[.31,.015,-.05],[.44,-.06,.20],[.27,-.12,.48],[-.05,-.115,.50],[-.31,-.07,.40]].map(p=>new THREE.Vector3(...p)));
const tailGeo=new THREE.TubeGeometry(tailCurve,36,.143,12,false),tailPosition=tailGeo.attributes.position;
for(let i=0;i<=36;i++){const center=tailCurve.getPointAt(i/36),taper=.99-.77*(i/36)**1.8;for(let j=0;j<=12;j++){const index=i*13+j;const v=new THREE.Vector3().fromBufferAttribute(tailPosition,index).sub(center).multiplyScalar(taper).add(center);tailPosition.setXYZ(index,v.x,v.y,v.z);}}
tailGeo.computeVertexNormals();mesh(tailGeo,catCoat,tail);ball(tail,catSilver,[-.31,-.07,.40],[.039,.038,.039]);

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
 if(kind==='head'&&amount>0){head.rotation.x=-.12*amount;head.rotation.z=Math.sin(t*6)*.06*amount;person.position.y-=.055*amount;leftElbow=mixPoint(leftElbow,[-.82,2.08,.08],amount);leftHand=mixPoint(leftHand,[-.48,2.75,.27],amount);rightElbow=mixPoint(rightElbow,[.82,2.08,.08],amount);rightHand=mixPoint(rightHand,[.50,2.75,.27],amount);setFace(amount>.28?'hurt':'idle');}
 else if(kind==='body'&&amount>0){const shake=reducedMotion?0:Math.sin(t*24)*.038*amount;person.rotation.z=shake;person.position.y+=Math.abs(Math.sin(t*16))*.035*amount;head.rotation.x=-.13*amount;head.rotation.z=-shake;torso.scale.y=1-.07*amount;leftElbow=mixPoint(leftElbow,[-.55,1.3,.35],amount);leftHand=mixPoint(leftHand,[-.16,1.48,.40],amount);rightElbow=mixPoint(rightElbow,[.55,1.3,.35],amount);rightHand=mixPoint(rightHand,[.20,1.36,.44],amount);setFace(amount>.22?'laugh':'idle');}
 else{setFace('idle');leftHand[1]+=(reducedMotion?0:Math.sin(elapsed*7)*.008);}
 for(const [i,leg] of legs.entries())leg.rotation.x=kind==='body'?Math.sin(t*13+i)*.06*amount:(reducedMotion?0:Math.sin(elapsed*1.8+i)*.014);
 poseArm(arms[0],leftElbow,leftHand);poseArm(arms[1],rightElbow,rightHand);
 const blinkPhase=elapsed%4.8,blink=blinkPhase>4.6?Math.sin((blinkPhase-4.6)/.2*Math.PI):0;
 for(const eye of idleEyes)eye.scale.y=1-blink*.93;
}
function updateCat(){const t=elapsed-actionState.catStart;let amt=actionState.cat==='belly'?envelope(t,duration.cat):0;if(actionState.cat==='belly'&&t>=duration.cat){actionState.cat='sleep';$('#cat-speech').classList.remove('show');actionButtons.filter(b=>b.dataset.action==='cat').forEach(b=>b.classList.remove('active'));updateMood();amt=0;}
 catRoll.rotation.x=-Math.PI*.77*amt;
 cat.position.y=.47+Math.sin(Math.PI*amt)*.095+.06*amt;
 catRoll.position.y=(reducedMotion?0:Math.sin(elapsed*2.1)*.008)*(1-amt);
 // Turn the head toward the visitor as the torso rolls; keep the muzzle off the rug.
 catHead.rotation.x=Math.PI*.67*amt;catHead.rotation.z=(reducedMotion?0:Math.sin(t*4)*.055*amt);catHead.position.y=.105-.065*amt;catHead.position.z=.145-.235*amt;
 catFaces.sleep.visible=amt<.38;catFaces.love.visible=amt>=.38;
 for(const [i,p] of paws.entries()){p.position.y=-.14-.145*amt;p.position.x=(i<2?-.28:.43)+(i<2?.32:0)*amt;p.rotation.z=(i<2?-1:1)*.24*amt+(reducedMotion?0:Math.sin(t*5.5+i)*.17*amt);p.rotation.x=(i%2?-.12:.12)*amt;p.position.z=(i%2?-.19:.24)+(i%2?-.025:.04)*amt;}
 tail.rotation.x=(reducedMotion?0:Math.sin(elapsed*1.5)*.018)+Math.sin(t*5)*.12*amt;
 catBody.scale.y=1+(reducedMotion?0:Math.sin(elapsed*2.1)*.017);
 $('#sleep').style.opacity=String(1-amt);
}
function positionLabels(){head.getWorldPosition(wp);const hp=project(wp.clone().add(new THREE.Vector3(.25,.95,0)));$('#head-hint').style.left=hp.x+'px';$('#head-hint').style.top=hp.y+'px';$('#head-hint').style.opacity=actionState.person==='idle'?'1':'0';$('#head-hint').style.pointerEvents=actionState.person==='idle'?'auto':'none';const sp=project(wp.clone().add(new THREE.Vector3(.05,1,0)));$('#speech').style.left=THREE.MathUtils.clamp(sp.x,125,stage.clientWidth-125)+'px';$('#speech').style.top=Math.max(130,sp.y)+'px';
 cat.getWorldPosition(wp);const cp=project(wp.clone().add(new THREE.Vector3(.35,.92,0)));$('#cat-hint').style.left=cp.x+'px';$('#cat-hint').style.top=cp.y+'px';$('#cat-hint').style.opacity=actionState.cat==='sleep'?'1':'0';$('#cat-hint').style.pointerEvents=actionState.cat==='sleep'?'auto':'none';$('#cat-speech').style.left=THREE.MathUtils.clamp(cp.x,120,stage.clientWidth-120)+'px';$('#cat-speech').style.top=cp.y+'px';const zp=project(wp.clone().add(new THREE.Vector3(-.50,.44,0)));$('#sleep').style.left=zp.x+'px';$('#sleep').style.top=zp.y-30+'px';}
document.addEventListener('visibilitychange',()=>{lastTime=performance.now();});
function frame(now){requestAnimationFrame(frame);const dt=(now-lastTime)/1000;lastTime=now;if(document.hidden)return;elapsed+=dt;updatePerson();updateCat();controls.update();world.updateMatrixWorld(true);positionLabels();renderer.render(scene,camera);}
renderer.render(scene,camera);$('#loading').hidden=true;requestAnimationFrame(frame);

// Browser agent tools reuse exactly the actions offered by the visible controls.
if(document.modelContext?.registerTool){const lifecycle=new AbortController();addEventListener('pagehide',()=>lifecycle.abort(),{once:true});try{void Promise.resolve(document.modelContext.registerTool({name:'interact_with_companions',title:'和人物或猫咪互动',description:'锤下人物脑袋、挠人物身体，或摸猫咪，播放对应的动作。',inputSchema:{type:'object',properties:{target:{type:'string',enum:['head','body','cat']}},required:['target'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async input=>{if(!input||Object.keys(input).some(k=>k!=='target')||!['head','body','cat'].includes(input.target))throw new TypeError('target must be head, body, or cat');const result=activate(input.target);await new Promise(requestAnimationFrame);return result;}},{signal:lifecycle.signal})).catch(()=>{});}catch{}}
