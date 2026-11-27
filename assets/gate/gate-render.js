/* Original AGENT//ARENA security gateway. Dependency-free WebGL 1, on-demand renderer. */
(() => {
'use strict';
const vert = 'attribute vec3 aP,aN,aColor;attribute float aMat;uniform vec3 uEye,uTarget,uR,uU,uF,uShift;uniform float uAspect,uScale,uMirror;varying vec3 p,n,c;varying float mat,height;void main(){vec3 q=aP+uShift;height=q.y;q.y*=uMirror;p=q;n=aN*vec3(1.,uMirror,1.);c=aColor;mat=aMat;vec3 d=q-uTarget;gl_Position=vec4(dot(d,uR)/(uScale*uAspect),dot(d,uU)/uScale,dot(d,uF)/30.,1.);}';
const frag = `precision highp float;
varying vec3 p,n,c;varying float mat,height;uniform vec3 uEye,uAccent;uniform float uMirror,uTime;uniform sampler2D uText;
float gauss(float x,float width){return exp(-x*x*width);}
float rnd(vec2 q){return fract(sin(dot(q,vec2(12.9898,78.233)))*43758.5453);}
float noise2(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(rnd(i),rnd(i+vec2(1,0)),f.x),mix(rnd(i+vec2(0,1)),rnd(i+vec2(1,1)),f.x),f.y);}
void main(){
 vec3 N=normalize(n),V=normalize(uEye-p);if(dot(N,V)<0.)N=-N;
 float facing=clamp(dot(N,V),0.,1.),fres=pow(1.-facing,3.);
 vec3 R=reflect(-V,N);float alpha=1.;vec3 rgb;
 vec2 uv=p.xz;
 float runway=p.x+.38*p.z;
 if(mat<.5){
  float distanceBehind=-dot(uv,normalize(uEye.xz));
  float edge=exp(-dot(uv,uv)*.042);
  float fog=exp(-.035*pow(distanceBehind-9.,2.));
  float beam=gauss(p.x-p.z*.31+2.4,2.)+.46*gauss(p.x-.34*p.z-1.4,1.5);
  float horizon=smoothstep(2.,12.,distanceBehind);
  float loc=gauss(runway,3.)*exp(-.02*p.z*p.z);
  float tile=max(gauss(sin(p.x*1.5),6200.),gauss(sin(p.z*1.4),6200.));
  float rough=.008*(noise2(uv*vec2(28.,8.))-.5)+.010*(noise2(uv*vec2(11.,80.))-.5);
  float nearFeet=exp(-3.*pow(abs(p.x)-1.39,2.)-6.*p.z*p.z);
  float floorwash=.42*gauss(p.x,1.45)*gauss(p.z,.64)+.33*gauss(abs(p.x)-1.24,17.)*gauss(p.z,1.8);
  float boxes=0.;for(int i=0;i<2;i++){float cz=i==0?3.04:-3.32;boxes+=exp(-5.1*pow(p.x+.38*cz,2.)-.92*pow(p.z-cz,2.));}
  rgb=mix(vec3(.013,.040,.052),vec3(.050,.115,.128),edge);
  rgb+=vec3(.024,.047,.057)*fog+vec3(.050,.090,.105)*beam*horizon*fog;
  rgb+=vec3(.015,.022,.022)*cos(distanceBehind*.3)*edge;
  rgb+=uAccent*(floorwash*.66+boxes*.31+.065*loc)*(.8+.22*noise2(uv*vec2(25.,6.)));
  rgb+=vec3(rough)*edge;rgb-=(.016*tile*edge+.032*nearFeet);
 }else if(mat<2.5){
  float front=abs(N.z),side=abs(N.x),top=max(N.y,0.);
  float a=gauss(R.y-.22+.55*R.x,10.);
  float b=gauss(R.z+.22-.47*R.y,17.);
  float grain=(noise2(vec2(dot(p.xz,vec2(1.2,.6))*4.,p.y*640.+p.x*83.))-.5)*.087;
  grain+=(noise2(vec2(p.z*3.5+p.x*9.,p.y*184.+p.x*31.))-.5)*.044;
  float along=sin(6.3*p.x+2.5*p.z-.34*p.y);
  float key=gauss(p.y-2.55+.68*p.x+.35*p.z,2.);
  float band=gauss(p.y-3.15+.33*p.x+.4*p.z,22.);
  float polished=gauss(p.y-.58+.11*p.z,1.7);
  float shadow=step(.01,p.x)*smoothstep(2.25,2.60,p.y);
  vec3 silver=vec3(.18,.218,.23)+vec3(.34,.335,.32)*a+vec3(.13,.19,.23)*b;
  silver+=vec3(.16,.17,.18)*top+vec3(.13,.13,.14)*fres;
  silver+=vec3(.36,.315,.28)*key*(1.-.68*shadow)+vec3(.24,.23,.22)*band+.03*along;
  silver+=vec3(.15,.16,.15)*polished*(.45+.55*p.x/1.78);
  silver*=1.-.53*shadow;silver+=.065*top+.185*(1.-shadow)*front+.095*side;
  silver+=vec3(.56,.71,.74)*max(0.,1.-abs(c.r-.94)*18.)*.65;
  silver+=uAccent*.34*pow(max(0.,1.-abs(abs(p.x)-1.23)*3.),2.)*exp(-p.y*.9);
  silver+=(grain+.012*sin(dot(p,vec3(45.,811.,22.))))*(.2+.8*front);
  silver*=.61+.47*c.r;
  if(mat<1.5)rgb=silver;else rgb=c*(.46+.48*top)+vec3(.04,.075,.086)*a+uAccent*.11*gauss(runway,4.)+.008*along;
 }else if(mat<3.5){
  rgb=mix(vec3(.91,1.,.99),uAccent,.46)*c;alpha=.98;
 }else if(mat<4.5){
  float across=p.x+.38*p.z,glint=gauss(p.x-.53*p.y+.36*p.z,7.);
  float lower=exp(-3.4*max(p.y-.05,0.));
  float stripe=gauss(p.y-.1-.26*across,11.);
  vec3 deep=mix(vec3(.008,.23,.29),c,.18);
  rgb=deep+uAccent*(.18+.38*fres+.19*lower)+vec3(.16,.26,.28)*glint+.13*abs(N.y);
  alpha=.17+.28*fres+.075*abs(N.y)+stripe*.09;
 }else if(mat<5.5){rgb=c;}
 else if(mat<6.5){rgb=uAccent;alpha=.14;}
 else if(mat<7.5){
  float near=abs(p.x+.38*p.z);
  rgb=uAccent*1.05+vec3(.12,.16,.17);alpha=.23*(1.-.36*near);
 }else if(mat<8.5){
  vec4 glyph=texture2D(uText,vec2((p.x+.93)/1.86,(2.47-p.y)/1.42));
  if(glyph.a<.02)discard;rgb=glyph.rgb;alpha=glyph.a;
 }else if(mat>=9.5){
  float cz=p.z>0.?3.08:-3.45;vec3 box=p-vec3(-.38*cz,.76,cz);
  vec3 af=abs(box);float edge=1.-smoothstep(.0,.18,min(min(max(.44-af.x,.44-af.y),max(.44-af.z,.44-af.y)),max(.44-af.z,.44-af.x)));
  float bounce=exp(-7.*abs(box.y+.41));float inner=exp(-12.*dot(box.xz+vec2(.22,-.1),box.xz+vec2(.22,-.1)));
  float sweep=gauss(box.x+.41*box.y+.43*box.z-.27,54.);
  rgb=mix(vec3(.014,.138,.18),uAccent,.18+.32*fres)+vec3(.29,.69,.79)*edge+uAccent*(.43*bounce+.18*inner)+vec3(.16,.23,.22)*sweep;
  alpha=.28+.23*fres+.32*edge+.13*bounce;
 }else{
  float core=exp(-10.*abs(p.y-.32));
  rgb=mix(uAccent,vec3(.87,1.,1.),core*.85);alpha=.48*core+.10;
 }
 if(uMirror<0.){if(mat<.5)discard;float rough=noise2(p.xz*vec2(11.,31.));alpha*=.29*exp(-1.72*height)*(.7+.3*rough);rgb=mix(vec3(.026,.092,.105),rgb,.69);}
 gl_FragColor=vec4(max(rgb,vec3(0.)),alpha);
}
`;
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const mul=(a,f)=>a.map(v=>v*f);
const norm=a=>mul(a,1/(Math.hypot(...a)||1));
const silver=[.72,.77,.79],white=[.94,.98,1],dark=[.03,.075,.085],teal=[.06,.70,.73],pale=[.74,.99,.98];
function geometry(){
 const data=new Map();
 const tri=(tag,a,b,c,col,mat)=>{const key=tag+':'+(mat===4||mat===6||mat>=7?'glass':'solid');if(!data.has(key))data.set(key,[]);const face=norm(cross(sub(b,a),sub(c,a)));const along=['track','incoming','outgoing','route','partial','packet','beam','halfbeam'].includes(tag);
 for(const v of [a,b,c]){const pos=along?[v[0]-.38*(tag==='incoming'?3.08:tag==='outgoing'?-3.45:v[2]),v[1],v[2]]:v;
 data.get(key).push(...pos,...face,...col,mat);}};
 const quad=(tag,a,b,c,d,col,mat)=>{tri(tag,a,b,c,col,mat);tri(tag,a,c,d,col,mat);};
 function prism(tag,poly,z0,z1,col,mat){
  const face=(p,z)=>[p[0],p[1],z],a=poly.map(p=>face(p,z0)),b=poly.map(p=>face(p,z1));
  for(let i=1;i+1<a.length;i++){tri(tag,a[0],a[i+1],a[i],col,mat);tri(tag,b[0],b[i],b[i+1],col,mat);}
  for(let i=0;i<a.length;i++){let j=(i+1)%a.length;quad(tag,a[i],a[j],b[j],b[i],col,mat);}
 }
 function rod(tag,a,b,r,col,mat=5){
  const u=norm(sub(b,a)),v=norm(cross(u,Math.abs(u[1])>.85?[1,0,0]:[0,1,0])),w=cross(u,v),ring=[];
  for(let i=0;i<6;i++){let q=Math.PI*i/3;ring.push(plus(mul(v,r*Math.cos(q)),mul(w,r*Math.sin(q))));}
  for(let i=0;i<6;i++){const j=(i+1)%6;quad(tag,plus(a,ring[i]),plus(a,ring[j]),plus(b,ring[j]),plus(b,ring[i]),col,mat);}
 }
 const outer=[[-1.74,.035],[-1.74,2.52],[0,3.55],[1.74,2.52],[1.74,.035]];
 const inner=[[-1.22,.035],[-1.22,2.25],[0,2.98],[1.22,2.25],[1.22,.035]];
 const contours=[[0,-.40],[0,.32],[.075,.39],[.90,.39],[1,.31],[1,-.36],[.89,-.44],[.075,-.44]];
 const shades=[silver,white,silver,[.45,.53,.56],[.15,.23,.26],[.54,.68,.69],[.60,.68,.7],[.29,.36,.39]];
 for(let s=0;s<4;s++){
   for(let i=0;i<contours.length;i++){
     const j=(i+1)%contours.length;
     const at=(v,k)=>[...mix(outer[v],inner[v],contours[k][0]),contours[k][1]];
     quad('gate',at(s,i),at(s+1,i),at(s+1,j),at(s,j),shades[i],1);
   }
   for(let layer=0;layer<3;layer++){
      const a=[inner[s][0]*(1.-layer*.014),inner[s][1],-.20-layer*.075];
      const b=[inner[s+1][0]*(1.-layer*.014),inner[s+1][1],-.20-layer*.075];
      rod('gate',a,b,.035,[.32,.95,.94],3);
   }
   for(const z of [-.46,.31]){
     const a=[...inner[s],z],b=[...inner[s+1],z];rod('gate',a,b,.027,white,3);
   }
   if(s===1||s===2){
    const a=[...mix(outer[s],inner[s],.11),.403],b=[...mix(outer[s+1],inner[s+1],.11),.403];rod('gate',a,b,.009,[.86,.88,.9],5);
   }
 }
 // Fine assembly seams divide the silver faces, revealing the real depth of the lintel.
 for(let i=1;i<4;i++)rod('gate',[...outer[i],.396],[...inner[i],.396],.009,dark,2);
 for(const z of [-.30,.19]){
  prism('gate',[[-1.10,.11],[-1.19,2.23],[0,2.95],[1.19,2.23],[1.10,.11]],z,z+.009,[.07,.62,.64],4);
 }
 // Bilingual technical lettering is projected onto the inspection plane.
 quad('label',[-.93,1.05,.28],[.93,1.05,.28],[.93,2.47,.28],[-.93,2.47,.28],white,8);
 rod('sill',[-1.225,.035,.30],[1.225,.035,.30],.025,white,3);
 for(let i=1;i<13;i++){const z=.31-(i/13)*.70;const v=.12+.70*Math.pow(i/13,1.65);
   rod('sill',[-1.22,.038,z],[1.22,.038,z],.018,[.40*v,.96*v,.92*v],5);}
 quad('ground',[-30,-.025,-32],[30,-.025,-32],[30,-.025,30],[-30,-.025,30],dark,0);
 // Bevelled graphite runways, their turquoise rails and the boundary painted on the floor.
 prism('track',[[-.57,.01],[-.57,.042],[-.52,.068],[.52,.068],[.57,.042],[.57,.01]],-6,6,[.12,.18,.2],2);
 for(const x of [-.52,.52])rod('track',[x,.072,-5.5],[x,.072,5.5],.009,[.30,.67,.66],5);
 for(const z of [-.76,.76]){
  for(let x=-2.04;x<2.04;x+=.22){rod('track',[x,.008,z],[x+.11,.008,z],.005,[.26,.52,.54],5);}
 }
 function cube(tag,z,s,icon){
  const x=0,y=.32,sc=s*.5;
  const pts=[];for(const x1 of [-sc,sc])for(const y1 of [0,s])for(const z1 of [-sc,sc])pts.push([x+x1,y+y1,z+z1]);
  const faces=[[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]];
  for(const ids of faces)quad(tag,...ids.map(i=>pts[i]),teal,10);
  for(let i=0;i<8;i++)for(const n of [1,2,4])if(!(i&n))rod(tag,pts[i],pts[i|n],.0105,[.73,.94,.97]);
  const center=[0,y+s*.5,z+sc+.021], mark=(dy,dx)=>[center[0]-dx*s,center[1]+dy*s,center[2]];
  prism(tag,[[-sc-.008,.055],[-sc-.008,.25],[-sc+.022,.31],[sc-.022,.31],[sc+.008,.25],[sc+.008,.055]],z-sc-.015,z+sc+.015,[.065,.118,.128],2);
  for(const yy of [.297,.321])rod(tag,[-sc,yy,z+sc],[sc,yy,z+sc],.014,[.72,.99,.99],3);
  for(let i=0;i<8;i++){const dy=.008+i*.022;quad(tag,[-sc,y+dy,z+sc],[sc,y+dy,z+sc],[sc,y+dy+.02,z+sc],[-sc,y+dy+.02,z+sc],white,9);}
  
  if(icon==='check'){
   for(let i=0;i<32;i++){const a=i*Math.PI/16,b=(i+1)*Math.PI/16;rod(tag,mark(.26*Math.cos(a),.26*Math.sin(a)),mark(.26*Math.cos(b),.26*Math.sin(b)),.012,white,3);}
   rod(tag,mark(.01,.15),mark(-.09,.035),.018,white,3);rod(tag,mark(-.09,.035),mark(.13,-.13),.018,white,3);
  }else{
   const star=[[.23,0],[.06,.065],[0,.23],[-.065,.07],[-.24,0],[-.065,-.065],[0,-.23],[.065,-.07],[.23,0]];
   for(let i=1;i<star.length;i++)rod(tag,mark(...star[i-1]),mark(...star[i]),.012,white);
  }
 }
 cube('incoming',3.08,.88,'spark');cube('outgoing',-3.45,.88,'check');
 function beam(tag,z1,z2){
  const w=.19,y=.68,h=.18;
  quad(tag,[-w,y-h,z1],[w,y-h,z1],[w,y-h,z2],[-w,y-h,z2],teal,7);
  quad(tag,[-w,y+h,z1],[w,y+h,z1],[w,y+h,z2],[-w,y+h,z2],teal,7);
  for(const x of [-w,w]){
   quad(tag,[x,y-h,z1],[x,y+h,z1],[x,y+h,z2],[x,y-h,z2],teal,7);
   for(const yy of [y-h,y+h])rod(tag,[x,yy,z1],[x,yy,z2],.008,[.52,.99,.99],3);
  }
 }
 beam('halfbeam',2.63,.27);beam('beam',.24,-2.99);
 
 // Small packet travels precisely along the selected route.
 const a=.038;prism('packet',[[-a,.68],[0,.72],[a,.68],[0,.64]],-a,a,[1,1,1],3);
 const badge=(tag,segments,col)=>segments.forEach(([a,b])=>rod(tag,[a[0],a[1],.56],[b[0],b[1],.56],.033,col,5));
 badge('denied',[[[-.20,1.02],[.20,.62]],[[-.20,.62],[.20,1.02]]],[1,.44,.41]);
 badge('waiting',[[[-.13,.63],[-.13,1.03]],[[.13,.63],[.13,1.03]]],[1,.74,.38]);
 return data;
}
const OPTICAL_FRAGMENT=`precision mediump float;varying vec2 uv;uniform sampler2D source;uniform vec2 pixel;uniform float cutout;uniform vec2 toe,entry,exitCube;uniform vec3 bounce;
vec3 lum(vec2 pos){vec4 c=texture2D(source,pos);float e=smoothstep(.50,.92,max(c.g,c.b));return c.rgb*e*e*c.a;}
void main(){vec4 c=texture2D(source,uv);vec3 blur=vec3(0.);vec2 stepPx=vec2(1.78*pixel.y,pixel.y);
for(int i=0;i<6;i++){float t=float(i)*1.04719755;vec2 dir=vec2(cos(t),sin(t))*stepPx;
 blur+=lum(uv+dir*2.)*.041+lum(uv+dir*4.5)*.025+lum(uv+dir*9.)*.016;}
vec3 rgb=c.rgb+blur*.69*(1.-.52*c.rgb);
if(cutout<.5){float haze=.015+.036*exp(-dot((uv-vec2(.69,.82))*vec2(1.8,4.),(uv-vec2(.69,.82))*vec2(1.8,4.)));
 float rays=.036*exp(-pow(uv.x-uv.y*.69-.10,2.)*200.)+.022*exp(-pow(uv.x-uv.y*.71+.17,2.)*320.);
 rgb+=vec3(.25,.62,.73)*(haze*1.55+rays*1.54);
 vec2 q=(uv-toe)*vec2(5.8,18.);float pool=exp(-dot(q,q));
 vec2 rail=(uv-toe)*vec2(10.2,53.);float hot=exp(-dot(rail,rail));
 vec2 ca=(uv-entry)*vec2(15.,43.),cb=(uv-exitCube)*vec2(16.,44.);
 float cubelight=exp(-dot(ca,ca))+.85*exp(-dot(cb,cb));
 float coat=.84+.16*cos(uv.y*841.+2.*sin(uv.x*29.));
 rgb+=bounce*(pool*.40+hot*.56+cubelight*.35)*coat+vec3(.17,.16,.14)*hot;
 
}gl_FragColor=vec4(rgb,c.a);}
`;
function make(canvas,options={}){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:false});
 if(!gl)return null;
 const program=gl.createProgram(),shaders=[],buffers=[];
 function shader(type,source){const obj=gl.createShader(type);gl.shaderSource(obj,source);gl.compileShader(obj);
 if(!gl.getShaderParameter(obj,gl.COMPILE_STATUS))throw new Error('Gateway shader unavailable');gl.attachShader(program,obj);shaders.push(obj);}
 shader(gl.VERTEX_SHADER,vert);shader(gl.FRAGMENT_SHADER,frag);gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Gateway program unavailable');
 shaders.forEach(s=>gl.deleteShader(s));gl.useProgram(program);
 const loc={},attrs={};for(const u of ['uEye','uTarget','uR','uU','uF','uShift','uAspect','uScale','uMirror','uAccent','uTime'])loc[u]=gl.getUniformLocation(program,u);
 for(const [n,sz,offset] of [['aP',3,0],['aN',3,12],['aColor',3,24],['aMat',1,36]]){const l=gl.getAttribLocation(program,n);attrs[n]=[l,sz,offset];gl.enableVertexAttribArray(l);}
 const slab=document.createElement('canvas');slab.width=640;slab.height=464;
 const ctx=slab.getContext('2d'),ar=document.documentElement.lang.startsWith('ar');
 const names=ar?['السياسة','الموافقة','التدقيق']:['POLICY','APPROVAL','AUDIT'];
 ctx.font=ar?'600 62px Tahoma, sans-serif':'600 60px "Segoe UI", sans-serif';ctx.lineCap='round';ctx.lineJoin='round';
 for(let i=0;i<3;i++){const y=86+i*139;
   ctx.strokeStyle='rgba(138,237,236,.74)';ctx.lineWidth=5;ctx.beginPath();ctx.arc(63,y-9,31,.32,Math.PI*1.8);ctx.stroke();
   ctx.strokeStyle='#affffc';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(48,y-12);ctx.lineTo(60,y);ctx.lineTo(87,y-30);ctx.stroke();
   ctx.fillStyle='#f4f8f7';ctx.direction=ar?'rtl':'ltr';ctx.textAlign=ar?'right':'left';ctx.fillText(names[i],ar?535:123,y+12);
   if(i<2){ctx.strokeStyle='rgba(104,199,208,.39)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(30,y+47);ctx.lineTo(617,y+47);ctx.stroke();}
 }
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,slab);gl.uniform1i(gl.getUniformLocation(program,'uText'),0);
 const objects=[];for(const [key,arr] of geometry()){const buffer=gl.createBuffer();buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.STATIC_DRAW);const [tag,kind]=key.split(':');objects.push({tag,kind,buffer,count:arr.length/10});}
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 const optics=gl.createProgram();
 function opticsStage(type,src){const q=gl.createShader(type);gl.shaderSource(q,src);gl.compileShader(q);
 if(!gl.getShaderParameter(q,gl.COMPILE_STATUS))throw new Error('Optics shader unavailable');gl.attachShader(optics,q);return q;}
 const stages=[opticsStage(gl.VERTEX_SHADER,'attribute vec2 a;varying vec2 uv;void main(){uv=.5*(a+1.);gl_Position=vec4(a,0.,1.);}'),opticsStage(gl.FRAGMENT_SHADER,OPTICAL_FRAGMENT)];
 gl.linkProgram(optics);if(!gl.getProgramParameter(optics,gl.LINK_STATUS))throw new Error('Optics program unavailable');
 stages.forEach(x=>gl.deleteShader(x));
 const screenBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,screenBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const screenTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,screenTexture);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const screenCoord=gl.getAttribLocation(optics,'a'),screenDims=gl.getUniformLocation(optics,'pixel'),screenMode=gl.getUniformLocation(optics,'cutout');
 let textureWidth=0,textureHeight=0;
 function opticsPass(w,h,points,color){
  gl.bindTexture(gl.TEXTURE_2D,screenTexture);
  if(textureWidth!==w||textureHeight!==h){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);textureWidth=w;textureHeight=h;}
  gl.copyTexSubImage2D(gl.TEXTURE_2D,0,0,0,0,0,w,h);
  gl.useProgram(optics);gl.disable(gl.BLEND);gl.disable(gl.DEPTH_TEST);gl.bindBuffer(gl.ARRAY_BUFFER,screenBuffer);
  for(const [l] of Object.values(attrs))gl.disableVertexAttribArray(l);
  gl.enableVertexAttribArray(screenCoord);gl.vertexAttribPointer(screenCoord,2,gl.FLOAT,false,0,0);
  for(const [name,xy] of Object.entries(points))gl.uniform2fv(gl.getUniformLocation(optics,name),xy);
 gl.uniform3fv(gl.getUniformLocation(optics,'bounce'),color);
 gl.uniform2f(screenDims,1/w,1/h);gl.uniform1f(screenMode,options.isolated?1:0);gl.drawArrays(gl.TRIANGLES,0,3);
  gl.disableVertexAttribArray(screenCoord);for(const [l] of Object.values(attrs))gl.enableVertexAttribArray(l);
  gl.enable(gl.BLEND);gl.enable(gl.DEPTH_TEST);gl.useProgram(program);
 }
 function render(state){
 const css=canvas.parentElement.getBoundingClientRect(),dpr=Math.min(1.45,window.devicePixelRatio||1,(options.hiRes?1800:1100)/Math.max(1,css.width));
 const w=Math.max(1,Math.round(css.width*dpr)),h=Math.max(1,Math.round(css.height*dpr));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 gl.viewport(0,0,w,h);gl.clearColor(.016,.040,.052,options.isolated?0:1);gl.depthMask(true);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 const angle=(options.isolated?.075:.52)+state.angle*Math.PI/180,eye=[Math.sin(angle)*9,2.88,Math.cos(angle)*9],target=[0,options.isolated?1.75:1.39,0];
 const forward=norm(sub(target,eye)),right=norm(cross(forward,[0,1,0])),up=cross(right,forward);
 gl.useProgram(program); const set3=(n,x)=>gl.uniform3fv(loc[n],x);
 for(const [n,v] of [['uEye',eye],['uTarget',target],['uR',right],['uU',up],['uF',forward],['uAccent',state.choice==='deny'?[1,.46,.4]:state.choice==='approval'&&state.stage<4?[1,.74,.40]:[.085,.92,.86]]])set3(n,v);
 gl.uniform1f(loc.uAspect,w/h);gl.uniform1f(loc.uScale,options.isolated?1.96:Math.max(2.38,3.99/(w/h)));gl.uniform1f(loc.uTime,state.time);
 const exited=state.choice==='allow'&&state.stage===2||state.choice==='approval'&&state.stage===4;
 function draw(o,mirror){
  if(options.isolated&&(o.tag!=='gate'||o.kind==='glass'))return;if((o.tag==='outgoing'||o.tag==='beam'||o.tag==='route')&&!exited)return;
  if(o.tag==='partial'&&exited||o.tag==='denied'&&(state.choice!=='deny'||state.stage<2)||o.tag==='waiting'&&(state.choice!=='approval'||state.stage!==2))return;
  set3('uShift',o.tag==='packet'?[-.38*state.position,0,state.position]:[0,0,0]);gl.uniform1f(loc.uMirror,mirror);
  gl.bindBuffer(gl.ARRAY_BUFFER,o.buffer);for(const [l,sz,offset] of Object.values(attrs))gl.vertexAttribPointer(l,sz,gl.FLOAT,false,40,offset);
  gl.drawArrays(gl.TRIANGLES,0,o.count);
 }
 gl.useProgram(program);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
 const ground=objects.find(o=>o.tag==='ground');if(!options.isolated)draw(ground,1);gl.clear(gl.DEPTH_BUFFER_BIT);
 gl.depthMask(false);for(const o of objects)if(!options.isolated&&!['ground','track','route','partial','label'].includes(o.tag))draw(o,-1);
 gl.depthMask(true);for(const o of objects)if(o.tag!=='ground'&&o.kind==='solid')draw(o,1);
 gl.depthMask(false);for(const o of objects)if(o.kind==='glass')draw(o,1);gl.depthMask(true);
 const scale=options.isolated?1.96:Math.max(2.38,3.99/(w/h));
 function uvAt(point){const d=sub(point,target);return [.5+.5*d.reduce((a,v,i)=>a+v*right[i],0)/(scale*w/h),.5+.5*d.reduce((a,v,i)=>a+v*up[i],0)/scale];}
 opticsPass(w,h,{toe:uvAt([0,.045,.24]),entry:uvAt([-1.17,.08,3.08]),exitCube:uvAt([1.31,.08,-3.45])},state.choice==='deny'?[.95,.37,.29]:state.choice==='approval'&&state.stage<4?[.9,.61,.3]:[.02,1.,.94]);
 }
 return {render,dispose(){buffers.forEach(b=>gl.deleteBuffer(b));gl.deleteTexture(texture);gl.deleteTexture(screenTexture);gl.deleteBuffer(screenBuffer);gl.deleteProgram(optics);gl.deleteProgram(program);}};
}
window.ArenaGateRenderer=make;
window.dispatchEvent(new Event('arena-gate-renderer-ready'));
})();

