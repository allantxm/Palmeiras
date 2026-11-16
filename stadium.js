/* ============================================================================
   Estádio 3D · Allianz Parque
   Reprodução dos gols da partida: para cada gol, em ordem de minuto, um jogador do time que marcou
   corre até a bola no centro do campo e chuta para o gol; autor e minuto acompanham a bola.
   Toda a animação é uma função pura do tempo (st.el): pausar, acelerar e pular para um gol é trivial.
   ============================================================================ */
function init3(){
const W=THREE,cv=$("#cv"),rd=new W.WebGLRenderer({canvas:cv,antialias:true}),sn=new W.Scene(),cam=new W.PerspectiveCamera(45,1,.5,1000);
sn.background=new W.Color(0x040a07);sn.fog=new W.Fog(0x040a07,260,640);rd.shadowMap.enabled=true;
sn.add(new W.HemisphereLight(0xcfe6d8,0x0a1a12,1));
const dl=new W.DirectionalLight(0xffffff,.8);dl.position.set(70,140,60);dl.castShadow=true;dl.shadow.mapSize.set(2048,2048);
Object.assign(dl.shadow.camera,{left:-130,right:130,top:130,bottom:-130,far:420});sn.add(dl);

/* ---------- gramado ---------- */
const pc=document.createElement("canvas");pc.width=1050;pc.height=680;const px=pc.getContext("2d");
for(let i=0;i<14;i++){px.fillStyle=i%2?"#1f7a3f":"#268c49";px.fillRect(i*75,0,75,680)}
px.strokeStyle="#fff";px.lineWidth=4;px.strokeRect(20,20,1010,640);px.beginPath();px.moveTo(525,20);px.lineTo(525,660);px.stroke();
px.beginPath();px.arc(525,340,91,0,7);px.stroke();px.beginPath();px.arc(525,340,5,0,7);px.fillStyle="#fff";px.fill();
px.strokeRect(20,138,165,404);px.strokeRect(865,138,165,404);px.strokeRect(20,230,55,220);px.strokeRect(975,230,55,220);
const turf=new W.Mesh(new W.PlaneGeometry(105,68),new W.MeshLambertMaterial({map:new W.CanvasTexture(pc)}));turf.rotation.x=-Math.PI/2;turf.position.y=.05;turf.receiveShadow=true;sn.add(turf);

/* ---------- arquibancadas, placar e gols ---------- */
const bx=(w,h,d,col,X,Y,Z,o)=>{const m=new W.Mesh(new W.BoxGeometry(w,h,d),new W.MeshLambertMaterial({color:col,...o}));m.position.set(X,Y,Z);sn.add(m);return m};
const rr=(a,b,r)=>{const s=new W.Shape(),P=Math.PI;s.moveTo(-a+r,-b);s.lineTo(a-r,-b);s.absarc(a-r,-b+r,r,-P/2,0);s.lineTo(a,b-r);s.absarc(a-r,b-r,r,0,P/2);s.lineTo(-a+r,b);s.absarc(-a+r,b-r,r,P/2,P);s.lineTo(-a,-b+r);s.absarc(-a+r,-b+r,r,P,P*1.5);return s};
const slab=(a,b,r,ha,hb,hr,h,col,y)=>{const s=rr(a,b,r);if(ha)s.holes.push(rr(ha,hb,hr));const m=new W.Mesh(new W.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:16}),new W.MeshLambertMaterial({color:col}));m.rotation.x=-Math.PI/2;m.position.y=y;m.castShadow=m.receiveShadow=true;sn.add(m);return m};
slab(100,82,30,0,0,0,1.2,0x14221a,-1.2);slab(60,42,18,0,0,0,.03,0x1f6f3a,0);
const tc=[0x1e8f4a,0x177a3c,0xd9dfda,0x1e8f4a,0x177a3c,0xd9dfda,0x1e8f4a];for(let i=0;i<7;i++)slab(62.6+i*2.6,44.6+i*2.6,20.6+i*2.6,60+i*2.6,42+i*2.6,18+i*2.6,2+i*2.4,tc[i],0);
slab(84,66,24,81,63,21,22,0x2b3d33,0);slab(84,66,24,62,46,18,1.6,0x35493e,21.2);
const sg=document.createElement("canvas");sg.width=512;sg.height=64;const sx=sg.getContext("2d");sx.fillStyle="#f4f6f4";sx.fillRect(0,0,512,64);sx.fillStyle="#2a5fd1";sx.font="bold 40px sans-serif";sx.textAlign="center";sx.fillText("Allianz Parque",256,46);
const sm=new W.MeshBasicMaterial({map:new W.CanvasTexture(sg)});
for(const[X,Z,r]of[[0,-56,0],[0,56,0],[-73,0,1.5708],[73,0,1.5708]]){const p=new W.Mesh(new W.PlaneGeometry(40,5),sm);p.rotation.set(-Math.PI/2,0,r);p.position.set(X,22.9,Z);sn.add(p)}
for(const a of[-1,1])for(const b of[-1,1]){bx(8,22,10,0x39c43b,a*77,11,b*59);const g=new W.CylinderGeometry(5,9,7,4);for(const w of[0,1]){const m=new W.Mesh(g,new W.MeshLambertMaterial(w?{color:0x8a948d,wireframe:true}:{color:0xf4f6f4}));m.rotation.y=Math.PI/4;m.position.set(a*77,25.6,b*59);m.scale.setScalar(w?1.01:1);sn.add(m)}}
bx(26,12,5,0x3fd13a,-48,6,69);for(let i=0;i<5;i++)bx(25,.6,.3,0x1f5a24,-48,2+i*2.1,71.6);
for(const s of[-1,1]){bx(.3,2.44,.3,0xffffff,s*52.5,1.22,3.66);bx(.3,2.44,.3,0xffffff,s*52.5,1.22,-3.66);bx(.3,.3,7.6,0xffffff,s*52.5,2.44,0);bx(2,2.4,7.3,0xffffff,s*53.5,1.2,0,{wireframe:true,transparent:true,opacity:.5})}
const bc=document.createElement("canvas");bc.width=1024;bc.height=256;const bt=new W.CanvasTexture(bc),bm=new W.Mesh(new W.PlaneGeometry(42,10.5),new W.MeshBasicMaterial({map:bt}));bm.position.set(0,16,-46.2);sn.add(bm);

/* ---------- bonequinhos ---------- */
const MC={},mat=c=>MC[c]||(MC[c]=new W.MeshLambertMaterial({color:c}));
const GEO={torso:new W.BoxGeometry(.95,1.05,.52),head:new W.SphereGeometry(.38,12,10),thigh:new W.BoxGeometry(.36,.55,.38),shin:new W.BoxGeometry(.3,.55,.32),arm:new W.BoxGeometry(.24,.85,.24)};
const SKIN=[0xe8c8a0,0xc68e5f,0x8d5a3a];
function fig(shirt,shorts,sock,skin){
 const g=new W.Group(),put=(m,x,y,z,p)=>{m.position.set(x,y,z);m.castShadow=true;(p||g).add(m);return m};
 put(new W.Mesh(GEO.torso,mat(shirt)),0,1.65,0);put(new W.Mesh(GEO.head,mat(skin)),0,2.5,0);
 const leg=x=>{const p=new W.Group();p.position.set(x,1.1,0);put(new W.Mesh(GEO.thigh,mat(shorts)),0,-.25,0,p);put(new W.Mesh(GEO.shin,mat(sock)),0,-.82,0,p);g.add(p);return p};
 const arm=x=>{const p=new W.Group();p.position.set(x,2.08,0);put(new W.Mesh(GEO.arm,mat(shirt)),0,-.4,0,p);g.add(p);return p};
 g.userData={lL:leg(-.24),lR:leg(.24),aL:arm(-.62),aR:arm(.62)};g.scale.setScalar(1.15);return g}
/* pose: rp = fase da corrida, kick = ângulo da perna que chuta (null = corrida), up = braços para cima */
function pose(g,rp,kick,up){const u=g.userData,s=Math.sin(rp)*.9;u.lL.rotation.x=s;u.lR.rotation.x=kick==null?-s:kick;u.aL.rotation.x=up?-2.9:-s*.8;u.aR.rotation.x=up?-2.9:s*.8}
const KIT={P:[0x0a8a4a,0xf4f4f4,0x0a8a4a],O:[0xf2f2f2,0x27406b,0xf2f2f2]},KGK={P:[0xe8b923,0x222222,0xe8b923],O:[0xe05a3c,0x222222,0xe05a3c]};
const FORM=[[48,0],[30,-24],[30,-8],[30,8],[30,24],[14,-24],[14,-8],[14,8],[14,24],[2,-8],[2,8]],team={P:[],O:[]};
for(const sd of"PO"){const sgn=sd=="P"?-1:1;FORM.forEach(([a,z],i)=>{const k=(i?KIT:KGK)[sd],g=fig(k[0],k[1],k[2],SKIN[(i*3+(sd=="P"?0:1))%3]),o={g,x:sgn*a,z,ry:-sgn*Math.PI/2};g.position.set(o.x,0,o.z);g.rotation.y=o.ry;sn.add(g);team[sd].push(o)})}

/* ---------- bola, marca do pontapé e rastro ---------- */
const ballM=new W.Mesh(new W.SphereGeometry(.9,16,12),new W.MeshLambertMaterial({color:0xffffff,emissive:0x2a2a2a}));ballM.castShadow=true;sn.add(ballM);
const ring=new W.Mesh(new W.RingGeometry(2.3,2.9,40),new W.MeshBasicMaterial({color:0xe6cb80,transparent:true,opacity:0,side:W.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.12;sn.add(ring);
const TN=44,trail=new W.Line(new W.BufferGeometry().setFromPoints(Array.from({length:TN},()=>new W.Vector3())),new W.LineBasicMaterial({color:0xe6cb80,transparent:true,opacity:.9}));trail.frustumCulled=false;trail.visible=false;sn.add(trail);

/* ---------- etiqueta do gol (autor + minuto) que acompanha o jogador e a bola ---------- */
const LW=272,LH=62,TYL={P:"Pênalti",F:"Falta",H:"De cabeça",C:"Gol contra"},IMG={};
const mkImg=(pid,cb)=>{if(!PH[pid])return null;if(IMG[pid])return IMG[pid];const i=new Image();i.onload=cb;i.src=PH[pid];return IMG[pid]=i};
function rrect(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+r,Y,r);x.closePath()}
function mkLabel(ev,m){
 const c=document.createElement("canvas");c.width=560;c.height=128;const tex=new W.CanvasTexture(c),x=c.getContext("2d");
 const P=ev.side=="P",ac=P?"#1fa463":"#dfe5e0",tnm=P?"Palmeiras":m.o,who=ev.au||"Gol do "+tnm;
 const draw=()=>{x.clearRect(0,0,560,128);
  rrect(x,4,4,552,120,24);x.fillStyle="rgba(6,18,12,.95)";x.fill();x.lineWidth=3;x.strokeStyle=ac;x.stroke();
  x.save();rrect(x,4,4,552,120,24);x.clip();x.fillStyle=ac;x.fillRect(4,4,16,120);x.restore();
  const cx=74,cy=64,r=44,im=ev.pid?mkImg(ev.pid,()=>{draw();tex.needsUpdate=true}):null;
  x.save();x.beginPath();x.arc(cx,cy,r,0,7);x.clip();
  if(im&&im.complete&&im.naturalWidth){x.fillStyle="#0b4a2c";x.fillRect(cx-r,cy-r,2*r,2*r);x.drawImage(im,0,0,im.naturalWidth,im.naturalWidth,cx-r-4,cy-r-2,2*r+8,2*r+8)}
  else{x.fillStyle=P?"#0b4a2c":"#4a5a52";x.fillRect(cx-r,cy-r,2*r,2*r);x.fillStyle="rgba(255,255,255,.85)";x.font="700 38px sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(ini(who),cx,cy+2)}
  x.restore();x.beginPath();x.arc(cx,cy,r,0,7);x.lineWidth=3;x.strokeStyle=ac;x.stroke();
  x.textBaseline="alphabetic";x.textAlign="left";let fs=38;x.font="700 "+fs+"px sans-serif";while(x.measureText(who).width>292&&fs>20){fs-=2;x.font="700 "+fs+"px sans-serif"}
  x.fillStyle="#fff";x.fillText(who,134,60);
  const sub=ev.typ=="C"?"Gol contra · a favor do "+tnm:(TYL[ev.typ]?TYL[ev.typ]+" · ":"")+tnm;let sf=23;x.font="500 "+sf+"px sans-serif";while(x.measureText(sub).width>292&&sf>14){sf-=1;x.font="500 "+sf+"px sans-serif"}
  x.fillStyle="#9fb3a8";x.fillText(sub,134,96);
  if(ev.lab){x.textAlign="right";x.font="700 54px Georgia,serif";x.fillStyle="#e6cb80";x.fillText(ev.lab+"'",540,86)}
  tex.needsUpdate=true};
 draw();const sp=new W.Sprite(new W.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false}));sp.renderOrder=10;sp.visible=false;sn.add(sp);return{sp,tex}}

/* ---------- estado, linha do tempo e utilitários ---------- */
const V={th:.6,ph:.95,r:190,auto:false,follow:true},st={m:null,T:[],labels:[],el:0,total:0,spd:1,playing:false},cs={x:0,z:0,r:190},_v=new W.Vector3();
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=u=>1-(1-u)*(1-u),easeIO=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2,lerp=(a,b,u)=>a+(b-a)*u;
const END_Z=[-2.6,1.4,-.6,2.4,.4,-1.8,2.8],END_Y=[1,1.7,.8,1.9,1.25],POOL=[5,6,7,8,9,10],XE=53.9;
const sht=n=>{const w=String(n||"").trim().split(/\s+/);return w.length>1?w[0][0]+". "+w[w.length-1]:w[0]||""};

/* placar do estádio: resultado parcial e último gol (autor + minuto) */
function lay(g,o,last){const m=st.m,x=bc.getContext("2d"),H=m.l=="Casa";
 x.fillStyle="#0b1511";x.fillRect(0,0,1024,256);x.fillStyle={V:"#1a9a55",E:"#c79a1e",D:"#c8372d"}[m.r];x.fillRect(0,0,1024,14);
 const pal="PALMEIRAS",op=m.o.toUpperCase().slice(0,15),a=H?pal:op,z=H?op:pal;
 x.fillStyle="#fff";x.font="bold 44px sans-serif";x.textAlign="left";x.fillText(a,30,86);x.textAlign="right";x.fillText(z,994,86);
 x.textAlign="center";x.font="bold 104px sans-serif";x.fillText((H?g:o)+" x "+(H?o:g),512,186);
 x.font="26px sans-serif";x.fillStyle=last?"#e6cb80":"#9fb3a8";x.fillText(last||(sc(m.c)+" · "+fd(m.d)+(m.f?" · "+m.f:"")),512,236);bt.needsUpdate=true}

/* linha do tempo: cada gol vira uma sequência relógio -> corrida -> chute -> voo -> comemoração -> volta */
function build(m){
 const evs=evOf(m),T=[];let t=.7,pb=0;
 evs.forEach((e,i)=>{
  const dir=e.side=="P"?1:-1,base=Math.floor(e.key+1e-6),cd=Math.abs(base-pb)<2?.5:cl(.7+Math.abs(base-pb)*.028,.8,2.1);
  const sp=team[e.side][POOL[(i*5+(dir>0?0:3))%POOL.length]],kx=-dir*1.7,run=cl(Math.hypot(sp.x-kx,sp.z)/11,.9,1.9);
  const a={e,i,dir,base,pb,sp,kx,t0:t,tr:t+cd,tk:t+cd+run};a.tf=a.tk+.22;a.tl=a.tf+1.5;a.tc=a.tl+1.5;a.te=a.tc+1.2;
  a.xE=dir*XE;a.zE=END_Z[(i*3+(dir>0?0:1))%7];a.yE=END_Y[(i*2)%5];a.arc=5+(i%3)*1.4;T.push(a);t=a.te;pb=base});
 st.fc0=t;st.fpb=pb;st.fc1=t+(pb>=90?.3:cl(.6+(90-pb)*.03,.6,2.2));st.total=st.fc1+(m.pen?2.6:1.6);st.T=T;return evs}
/* trajetória da bola do centro até o gol (u de 0 a 1) */
const BP=(a,u)=>{const k=1-Math.pow(1-u,1.6);return[a.xE*k,.9+(a.yE-.9)*k+a.arc*Math.sin(Math.PI*k)*(1-.25*k),a.zE*k]};

/* ---------- um quadro da animação, calculado só a partir do tempo ---------- */
const hud={};
const setT=(id,v)=>{if(hud[id+"v"]!==v){hud[id+"v"]=v;(hud[id]||(hud[id]=$("#"+id))).innerHTML=v}};
function frame(el,dt){
 const T=st.T,m=st.m,H=m.l=="Casa";let g=0,o=0,cur=-1;
 for(const q of T){if(el>=q.tl)q.e.side=="P"?g++:o++;if(el>=q.t0)cur=q.i}
 for(const sd of"PO")for(const p of team[sd]){p.g.position.set(p.x,0,p.z);p.g.rotation.y=p.ry;pose(p.g,0,null,0)}
 let b=[0,.9,0],an=null,lo=0,tn=0,rg=0,foc=false;
 const a=T[cur];
 if(a&&el<a.te){
  const p=a.sp.g,s=a.sp,rp=el*14;let X=s.x,Z=s.z,RY=s.ry,jump=0;
  if(el>=a.tr-.3)foc=true;
  if(el<a.tr){/* relógio correndo; jogador aguardando */}
  else if(el<a.tk){const u=ease((el-a.tr)/(a.tk-a.tr));X=lerp(s.x,a.kx,u);Z=lerp(s.z,0,u);RY=Math.atan2(a.kx-s.x,-s.z)||RY;pose(p,rp,null,0);an=[X,2.8,Z];lo=cl((el-a.tr)/.3,0,1);rg=lo*(.6+.4*Math.sin(el*9))}
  else if(el<a.tf){const w=(el-a.tk)/(a.tf-a.tk);X=a.kx;Z=0;RY=a.dir*Math.PI/2;pose(p,0,lerp(0,.95,easeIO(w)),0);an=[X,2.8,Z];lo=1;rg=.7}
  else if(el<a.tl){const w=(el-a.tf)/(a.tl-a.tf);X=a.kx;Z=0;RY=a.dir*Math.PI/2;pose(p,0,lerp(-1.3,0,cl((el-a.tf)/.35,0,1)),0);b=BP(a,w);an=b;lo=1;tn=1;trail.userData.u=w}
  else if(el<a.tc){const w=(el-a.tl)/(a.tc-a.tl),q=cl(w*2,0,1);b=[a.xE,Math.max(.9,a.yE-(a.yE-.9)*q)+Math.abs(Math.sin(w*8))*.4*(1-q),a.zE];an=b;
   X=a.kx+a.dir*cl(w*1.3,0,1)*9;Z=Math.sin(w*3)*2.5;RY=a.dir*Math.PI/2+Math.sin(w*9)*.6;jump=Math.abs(Math.sin(w*9))*1.1;pose(p,el*16,null,1);
   lo=w<.65?1:cl((1-w)/.35,0,1);tn=1;trail.userData.u=1}
  else{const w=ease((el-a.tc)/(a.te-a.tc)),sx_=a.kx+a.dir*9,sz_=Math.sin(3)*2.5;X=lerp(sx_,s.x,w);Z=lerp(sz_,s.z,w);RY=Math.atan2(s.x-sx_,s.z-sz_);pose(p,rp,null,0)}
  p.position.set(X,jump,Z);p.rotation.y=RY;
  trail.visible=tn>0&&el<a.tc;
  if(trail.visible){const pos=trail.geometry.attributes.position,u=trail.userData.u||0;for(let i=0;i<TN;i++){const q=BP(a,u*i/(TN-1));pos.setXYZ(i,q[0],q[1],q[2])}pos.needsUpdate=true;trail.material.opacity=.9*cl((a.tc-el)/.5,0,1)}
  st.labels.forEach((q,i)=>q.sp.visible=!!an&&lo>.01&&i==a.i);
  if(an&&lo>.01){const L=st.labels[a.i];_v.set(an[0],an[1],an[2]);const d=cam.position.distanceTo(_v),ps=2*d*Math.tan(cam.fov*Math.PI/360)/Math.max(1,cv.clientHeight);
   L.sp.scale.set(LW*ps,LH*ps,1);L.sp.position.set(an[0],an[1]+(LH/2+16)*ps,an[2]);L.sp.material.opacity=lo}
 }else{trail.visible=false;st.labels.forEach(q=>q.sp.visible=false)}
 ballM.position.set(b[0],b[1],b[2]);ballM.rotation.x=el*6;ballM.rotation.z=el*3;
 ring.material.opacity=.7*rg;ring.scale.setScalar(1+.12*Math.sin(el*9));

 /* câmera automática: acompanha o jogador, a bola e a rede */
 const fol=V.follow&&foc,k=1-Math.exp(-(dt||.016)*3.6);
 cs.x+=((fol&&an?an[0]*.85:0)-cs.x)*k;cs.z+=((fol&&an?an[2]*.85:0)-cs.z)*k;cs.r+=((fol?Math.min(V.r,78):V.r)-cs.r)*k;

 /* relógio da partida */
 let txt="0'",val=0;
 for(const q of T){if(el>=q.t0){if(el<q.tr){val=lerp(q.pb,q.base,easeIO((el-q.t0)/(q.tr-q.t0)));txt=Math.floor(val)+"'"}else{val=q.e.key;txt=(q.e.lab||Math.round(q.e.key))+"'"}}}
 let half=val<46?"1º tempo":"2º tempo";
 if(el>=st.fc0){const u=cl((el-st.fc0)/(st.fc1-st.fc0),0,1);val=lerp(st.fpb,90,easeIO(u));if(u>=1){txt="FIM";val=90;half=m.pen?"Pênaltis: Palmeiras "+m.pen.replace("-"," × "):"Fim de jogo"}else{txt=Math.floor(val)+"'";half=val<46?"1º tempo":"2º tempo"}}
 setT("clk",txt);setT("half",half);
 const hp=hud.ph||(hud.ph=$("#ph3"));if(hp)hp.style.left=cl(Math.floor(val)/90*100,0,100)+"%";
 /* placar e último gol */
 const kk=g+"-"+o;
 if(st.k!==kk){st.k=kk;const q=T.filter(z=>el>=z.tl).pop(),last=q?"⚽ "+(q.e.au?sht(q.e.au):"Gol")+(q.e.lab?" "+q.e.lab+"'":"")+(TYL[q.e.typ]?" · "+TYL[q.e.typ]:""):null;lay(g,o,last);
  $("#sb3").innerHTML=H?"<span>Palmeiras</span><b>"+g+"</b> × <b>"+o+"</b><span>"+esc(m.o)+"</span>":"<span>"+esc(m.o)+"</span><b>"+o+"</b> × <b>"+g+"</b><span>Palmeiras</span>"}
 /* lista de gols */
 const act=a&&el<a.te?a.i:-1,hl=kk+"|"+act;
 if(st.hl!==hl){st.hl=hl;const n=g+o;document.querySelectorAll("#g3 .gl").forEach(r=>{const i=+r.dataset.i;r.classList.toggle("on",i<n);r.classList.toggle("now",i==act)})}
 /* "GOL!" */
 const gi=a&&el>=a.tl&&el<a.tl+1.7?a.i:-1;
 if(st.gi!==gi){st.gi=gi;const gl=$("#gol");gl.classList.remove("show");if(gi>=0){const e=T[gi].e;gl.innerHTML="GOL!<small>"+esc(e.au?e.au+(e.lab?" · "+e.lab+"'":""):(e.side=="P"?"Palmeiras":m.o))+"</small>";gl.className="gol "+e.side;void gl.offsetWidth;gl.style.animationDuration=(1.7/st.spd)+"s";gl.classList.add("show")}}
}

/* ---------- interface ---------- */
function syncUI(){
 const bp=$("#bp");if(bp)bp.textContent=st.el>=st.total?"↻ Rever":st.playing?"⏸ Pausar":"▶ Continuar";
 document.querySelectorAll("#v3 [data-v^='spd:']").forEach(b=>b.classList.toggle("on",+b.dataset.v.slice(4)==st.spd));
 const f=document.querySelector("#v3 [data-v='follow']"),au=document.querySelector("#v3 [data-v='auto']");if(f)f.classList.toggle("on",V.follow);if(au)au.classList.toggle("on",V.auto)}
function listHTML(m,evs){
 const real=evs.length&&!evs[0].ill;
 if(!evs.length)return`<h3 class="t">Gols da partida</h3><p class="mu sm" style="margin:0">Sem gols (${m.gp} × ${m.gc}): a bola fica parada no centro do campo.</p>`;
 return`<h3 class="t">Gols da partida <span class="r">em ordem de minuto${real?"":" · ilustrativo"}</span></h3>`+evs.map((e,i)=>`<div class="gl ${e.side}" data-v="seek:${i}" data-i="${i}" title="Ver este gol"><span class="mn">${e.lab?e.lab+"'":"–"}</span><span class="wh">${e.pid?av({id:e.pid,n:e.au},26):`<span class="av" style="--s:26px"><i>${esc(ini(e.au||"?"))}</i></span>`}<b>${esc(e.au||"Autor não informado")}</b>${TYL[e.typ]?`<em>${TYL[e.typ]}</em>`:""}</span><span class="tt">${e.side=="P"?"Palmeiras":esc(m.o)}</span></div>`).join("")}
function trackHTML(evs){
 return`<div class="trk"><span class="tick" style="left:0">0'</span><span class="tick" style="left:50%;transform:translateX(-50%)">45'</span><span class="tick" style="right:0">90'</span><i id="ph3" class="phd"></i>`+evs.map((e,i)=>`<button class="mk ${e.side}" style="left:${cl(e.key/90*100,1,99)}%" data-v="seek:${i}" title="${esc((e.au||"Gol")+" "+(e.lab?e.lab+"'":""))}" aria-label="Gol ${e.lab?"aos "+e.lab+" minutos":""}"></button>`).join("")+`</div>`}

setMatch=m=>{
 st.m=m;st.labels.forEach(q=>{sn.remove(q.sp);q.tex.dispose();q.sp.material.dispose()});st.labels=[];
 const evs=build(m);st.labels=evs.map(e=>mkLabel(e,m));
 st.el=-.5;st.playing=true;st.k=null;st.hl=null;st.gi=-2;Object.keys(hud).forEach(k=>{if(/v$/.test(k))delete hud[k]});
 const d=DT[m.id]||{},real=evs.length&&!evs[0].ill;
 let t=m.l=="Casa"?"Jogo em casa, no Allianz Parque. ":"Jogo disputado fora; o cenário é ilustrativo (Allianz Parque). ";
 t+=!evs.length?"Partida sem gols: a bola permanece no centro.":real?"Cada gol é reproduzido na ordem dos minutos: um jogador do time que marcou vai até a bola, no centro do campo, e chuta para o gol; autor e minuto acompanham a bola. Em gol contra, o gol vale para o time beneficiado e a etiqueta mostra o autor.":"Esta partida não tem autor e minuto dos gols cadastrados, então os gols são uma animação ilustrativa.";
 if(m.pen)t+=` Decidido nos pênaltis: Palmeiras ${m.pen.replace("-"," x ")}.`;
 if(d.i)t+=" Atenção: a base agrupa gols do mesmo autor (ex.: “2x”); a ligação entre autor e minuto segue a ordem da lista da planilha.";
 if(d.st=="p")t+=" Dados parciais: "+(d.sn||"")+".";
 $("#i3").textContent=t;
 $("#l3").querySelectorAll(".mr").forEach(r=>r.classList.toggle("sel",+r.dataset.m==m.i));
 $("#g3").innerHTML=listHTML(m,evs);$("#tr3").innerHTML=trackHTML(evs);hud.ph=null;
 lay(0,0);$("#sb3").innerHTML="";ctx3(m);syncUI()};

/* ---------- câmera (arrastar e roda do mouse) ---------- */
let dr=null;cv.onpointerdown=e=>{dr=[e.clientX,e.clientY];V.auto=false;syncUI();cv.setPointerCapture(e.pointerId);cv.style.cursor="grabbing"};cv.onpointerup=()=>{dr=null;cv.style.cursor="grab"};
cv.onpointermove=e=>{if(!dr)return;V.th-=(e.clientX-dr[0])*.006;V.ph=Math.min(1.5,Math.max(.25,V.ph-(e.clientY-dr[1])*.005));dr=[e.clientX,e.clientY]};
cv.onwheel=e=>{e.preventDefault();V.r=Math.min(320,Math.max(35,V.r+e.deltaY*.1))};

/* ---------- laço de desenho ---------- */
let last=0,W0=0,H0=0,DPR=0;
const loop=t=>{requestAnimationFrame(loop);if($("#v3").hidden||document.hidden){last=t;return}
 const dt=Math.min(.1,(t-last)/1000||0);last=t;
 const w=cv.clientWidth,h=cv.clientHeight,dpr=Math.min(window.devicePixelRatio||1,2);
 if(w!=W0||h!=H0||dpr!=DPR){W0=w;H0=h;DPR=dpr;rd.setPixelRatio(dpr);rd.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
 if(V.auto)V.th+=.004;
 if(st.m){if(st.playing){st.el+=dt*st.spd;if(st.el>=st.total){st.el=st.total;st.playing=false;syncUI()}}
  cam.position.set(cs.x+cs.r*Math.sin(V.ph)*Math.sin(V.th),cs.r*Math.cos(V.ph),cs.z+cs.r*Math.sin(V.ph)*Math.cos(V.th));cam.lookAt(cs.x,0,cs.z);
  frame(st.el,dt)}
 rd.render(sn,cam)};
requestAnimationFrame(loop);

const seek=i=>{const a=st.T[i];if(!a)return;st.el=Math.max(0,a.t0-.05);st.playing=true;st.k=null;st.hl=null;syncUI()};
S3={cam:V,W,sn,rd,cam3:cam,st,seek,syncUI,frame,build,team,ballM,lay};return S3}

/* controles da aba do estádio */
$("#v3").onclick=e=>{const t=e.target,r=t.closest("#l3 [data-m]");if(r){SEL=+r.dataset.m;setMatch(M[SEL]);return}
 const b=t.closest("[data-v]");if(!b)return;const d=b.dataset.v;
 if(d=="ficha"){openG(SEL);return}
 if(!S3)return;const V=S3.cam,st=S3.st;
 if(d=="replay")setMatch(M[SEL]);
 else if(d=="bp"){if(st.el>=st.total)setMatch(M[SEL]);else{st.playing=!st.playing;S3.syncUI()}}
 else if(d.startsWith("spd:")){st.spd=+d.slice(4);S3.syncUI()}
 else if(d.startsWith("seek:"))S3.seek(+d.slice(5));
 else if(d=="follow"){V.follow=!V.follow;S3.syncUI()}
 else if(d=="auto"){V.auto=!V.auto;S3.syncUI()}
 else if(d.includes(",")){const[p,rr,th]=d.split(",").map(Number);V.ph=p;V.r=rr;V.th=th;V.auto=false;S3.syncUI()}};
