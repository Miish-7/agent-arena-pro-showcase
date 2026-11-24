/* Original AGENT//ARENA artwork. WebGL 1, no libraries or external requests. */
(() => {
  'use strict';
  const host = document.querySelector('[data-scene]');
  const canvas = host && host.querySelector('.scene-canvas');
  const fallback = host && host.querySelector('.scene-fallback');
  if (!canvas) return;

  const TAU = Math.PI * 2;
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const mix = (a, b, t) => a + (b - a) * t;
  const colorMix = (a, b, t) => a.map((v, i) => mix(v, b[i], t));
  const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  const sub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
  const unit = a => { const l = Math.hypot(...a) || 1; return a.map(v => v/l); };
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const identity = () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  function mul(a,b) {
    const m = new Float32Array(16);
    for (let c=0;c<4;c++) for(let r=0;r<4;r++) {
      m[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];
    }
    return m;
  }
  function pose(x,y,z, ry=0, rx=0, rz=0) {
    const a=Math.cos(ry), b=Math.sin(ry), c=Math.cos(rx), d=Math.sin(rx), e=Math.cos(rz), f=Math.sin(rz);
    return new Float32Array([a*e+b*d*f,c*f,-b*e+a*d*f,0, -a*f+b*d*e,c*e,b*f+a*d*e,0, b*c,-d,a*c,0, x,y,z,1]);
  }
  function look(camera, target) {
    const z=unit(sub(camera,target)), x=unit(cross([0,1,0],z)), y=cross(z,x);
    return new Float32Array([x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0, -dot(x,camera),-dot(y,camera),-dot(z,camera),1]);
  }
  function perspective(aspect,fov) {
    const f=1/Math.tan(fov/2), n=.12, far=46;
    return new Float32Array([f/aspect,0,0,0, 0,f,0,0, 0,0,(far+n)/(n-far),-1, 0,0,2*far*n/(n-far),0]);
  }
  function random(seed) {
    return () => {seed=(Math.imul(1664525,seed)+1013904223)>>>0; return seed/4294967296;};
  }
  const icy=[.22,.7,1], ice=[.65,.91,1], white=[.94,.97,1], blue=[.13,.38,.94], gold=[1,.57,.22], amber=[1,.76,.47];
  const skyVS=[
    'attribute vec2 aP; varying vec2 uv;',
    'void main(){uv=aP*.5+.5;gl_Position=vec4(aP,0.999,1.);}'
  ].join('\n');
  const skyFS=[
    'precision mediump float; varying vec2 uv; uniform float uTime; uniform vec2 uAim;',
    'float g(vec2 p,vec2 axis){vec2 a=p/axis;return exp(-dot(a,a));}',
    'void main(){',
    'vec2 p=uv-.5; vec3 c=vec3(.024,.055,.088);',
    'c+=vec3(.018,.08,.145)*g(p-vec2(-.02,.06)-uAim*.009,vec2(.31,.53));',
    'c+=vec3(.03,.11,.17)*g(p-vec2(-.21,-.15),vec2(.30,.13));',
    'c+=vec3(.24,.115,.052)*g(p-vec2(.26,-.215),vec2(.20,.077));',
    'c+=vec3(.025,.067,.097)*g(p-vec2(.0,-.29),vec2(.44,.12));',
    'float stripe=g(vec2(p.x-.43*p.y+.11+.008*sin(uTime*.13),p.y-.16),vec2(.033,.37));',
    'c+=vec3(.012,.025,.043)*stripe;',
    'float fade=1.-smoothstep(.31,.53,abs(p.x));c=mix(vec3(.026,.055,.084),c,fade);',
    'float d=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*4375.5453);c+=(d-.5)*.007;',
    'gl_FragColor=vec4(c,1.);}'
  ].join('\n');
  const meshVS=[
    'attribute vec3 aP; attribute vec3 aN; attribute vec4 aC; uniform mat4 uVP,uModel;',
    'varying vec3 n,p; varying vec4 col; void main(){vec4 w=uModel*vec4(aP,1.);p=w.xyz;',
    'n=normalize(mat3(uModel)*aN);col=aC;gl_Position=uVP*w;}'
  ].join('\n');
  const meshFS=[
    'precision mediump float; varying vec3 n,p; varying vec4 col; uniform vec3 uEye;',
    'uniform float uTime,uKind; uniform vec2 uAim;',
    'float strip(float delta,float width){float v=delta/width;return exp(-v*v);}',
    'void main(){vec3 v=normalize(uEye-p);vec3 N=normalize(n);if(dot(N,v)<0.)N=-N;',
    'vec3 r=reflect(-v,N);float f=pow(1.-max(dot(N,v),0.),2.35);',
    'float d=max(dot(N,normalize(vec3(-.65,.80,1.))),0.);',
    'float k=uTime*.16;float sc=strip(r.x+.43*r.y+.13*sin(k)+uAim.x*.08-.06,.15);',
    'float thin=strip(r.x+.45*r.y+.13*sin(k)+uAim.x*.08-.16,.035);',
    'float sh=strip(r.x-.31*r.y-.09*cos(k*.8)-.57,.15);',
    'float top=strip(r.y+.18*r.x-.34,.13);',
    'vec3 lights=vec3(.19,.57,.99)*sc+vec3(.71,.92,1.)*thin+vec3(.92,.48,.20)*sh+vec3(.18,.32,.50)*top;',
    'if(uKind < .5){',
    'float edge=clamp(abs(p.x)*.7-.28,0.,1.);float beam=strip(p.x+.46*p.y+.22-.075*sin(k),.13);',
    'vec3 c=col.rgb*(.40+.38*d)+lights*.62+vec3(.11,.38,.60)*(f+.36*edge)+vec3(.22,.44,.70)*beam;',
    'gl_FragColor=vec4(c,clamp(col.a+(.12*sc+.07*sh)*col.a+.2*f,0.,.79));',
    '}else if(uKind < 1.5){',
    'vec3 c=col.rgb*(.24+.63*d+.25*f)+lights*(.40+.42*f)+vec3(.015,.032,.057);',
    'float field=strip(p.x+.45*p.y-.53,.33);c+=vec3(.42,.21,.07)*field*max(.3,p.z);',
    'if(p.y < -1.16){c*=.77;c+=vec3(.0,.30,.62)*strip(p.x+1.07,.29)+vec3(.64,.30,.075)*strip(p.x-.89,.27);}',
    'gl_FragColor=vec4(c,col.a);',
    '}else if(uKind < 2.5){',
    'float radial=length(p.xz);float ring=strip(radial-1.46,.045);',
    'float core=exp(-dot(p.xz,p.xz)*2.6);float cut=.51+.49*cos(radial*123.);',
    'vec3 c=col.rgb*(.36+.28*d)+lights*.14+vec3(.028,.113,.145)*ring;',
    'c+=mix(vec3(.055,.30,.48),vec3(.66,.33,.10),smoothstep(-.45,.52,p.x))*core;',
    'c+=vec3(.010,.022,.030)*cut+vec3(.24,.12,.04)*strip(p.x-.89+.11*p.z,.19)*.65;',
    'gl_FragColor=vec4(c,col.a);',
    '}else{gl_FragColor=col;}}'
  ].join('\n');
  const inkVS=[
    'attribute vec3 aP,aEnd; attribute vec4 aC; attribute vec2 aPart;',
    'uniform mat4 uVP,uModel; uniform float uTime,uPx,uTravel; varying vec4 col;',
    'void main(){vec3 p=aP; float ph=aPart.y;float activity=1.;',
    'if(uTravel>.5){float t=fract(uTime*.14+ph);p=mix(aP,aEnd,t);activity=.25+.75*sin(3.14159*t);}',
    'vec4 clip=uVP*uModel*vec4(p,1.);gl_Position=clip;',
    'gl_PointSize=clamp(aPart.x*uPx*clamp(6.5/clip.w,.48,1.75),1.,56.);',
    'col=vec4(aC.rgb,aC.a*activity);}'
  ].join('\n');
  const inkFS=[
    'precision mediump float;varying vec4 col;uniform float uDots;',
    'void main(){if(uDots<.5){gl_FragColor=col;return;}',
    'vec2 q=gl_PointCoord*2.-1.;float r2=dot(q,q);if(r2>1.)discard;',
    'float core=exp(-r2*18.);float halo=exp(-r2*4.5);',
    'vec3 c=mix(col.rgb,vec3(.96,.99,1.),core*.42);',
    'gl_FragColor=vec4(c,col.a*(1.08*core+.63*halo));}'
  ].join('\n');


  // Two compact Gaussian passes gather the scene's own emissive edges and points.
  // The multisampled default framebuffer remains the source for the sharp layer.
  const postVS=[
    'attribute vec2 aP;varying vec2 uv;',
    'void main(){uv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}'
  ].join('\n');
  const postFS=[
    'precision mediump float;uniform sampler2D uSource,uGlow;uniform vec2 uDelta;uniform float uPass;',
    'varying vec2 uv;',
    'vec3 pick(vec2 at){vec3 c=texture2D(uSource,at).rgb;',
    'if(uPass<.5){float y=max(c.r,max(c.g,c.b));return c*smoothstep(.26,.84,y);}return c;}',
    'void main(){if(uPass>1.5){vec3 c=texture2D(uSource,uv).rgb;vec3 g=texture2D(uGlow,uv).rgb;',
    'gl_FragColor=vec4(c+g*(vec3(.89,1.02,1.13)-c*.43)*.77,1.);return;}',
    'vec3 c=pick(uv)*.227027;c+=(pick(uv+uDelta*1.3846)+pick(uv-uDelta*1.3846))*.316216;',
    'c+=(pick(uv+uDelta*3.2308)+pick(uv-uDelta*3.2308))*.070270;gl_FragColor=vec4(c,1.);}'
  ].join('\n');
  function makeArtwork(compact) {
    const rand=random(10293847);
    const parts={};
    const meshSlot=name=>parts[name]={layout:'mesh',v:[]};
    const inkSlot=name=>parts[name]={layout:'ink',v:[]};
    function mv(b,p,n,col,alpha) {b.v.push(...p,...n,...col,alpha);}
    function quad(b,aa,bb,cc,dd,n,col,alpha=1) {
      for (const pair of [[aa,bb,cc],[aa,cc,dd]]) for (const p of pair) mv(b,p,n,col,alpha);
    }
    function quadN(b,p,q,r,s,ns,cs,alpha) {
      for (const i of [0,1,2,0,2,3]) mv(b,[p,q,r,s][i],ns[i],cs[i],alpha);
    }
    function iv(b,p,c,a,sz=1,phase=0,end=p) {b.v.push(...p,...end,...c,a,sz,phase);}
    function line(b,p,q,c,a,d=c,a2=a) {iv(b,p,c,a);iv(b,q,d,a2);}
    function streak(b,points,c,a) {for(let i=1;i<points.length;i++)line(b,points[i-1],points[i],c,a);}
    const stage=meshSlot('stage'), top=meshSlot('stageTop'), rails=inkSlot('stageRings'), stagePts=inkSlot('stagePts');
    function circle(r,y,t){return [Math.cos(t)*r,y,Math.sin(t)*r];}
    const slices=compact?88:144;
    function barrel(rows) {
      for(let j=1;j<rows.length;j++){
        const [r0,y0,col0]=rows[j-1],[r1,y1,col1]=rows[j];
        for(let i=0;i<slices;i++) {
          const t=i*TAU/slices,t1=(i+1)*TAU/slices;
          const outward=unit([y1-y0,r0-r1,0]);
          const normal=a=>[outward[0]*Math.cos(a),outward[1],outward[0]*Math.sin(a)];
          quadN(stage,circle(r0,y0,t),circle(r0,y0,t1),circle(r1,y1,t1),circle(r1,y1,t),
            [normal(t),normal(t1),normal(t1),normal(t)],[col0,col0,col1,col1],1);
        }
      }
    }
    barrel([[2.06,-1.58,[.025,.056,.10]],[2.15,-1.55,[.15,.22,.28]],[2.15,-1.51,[.045,.072,.12]],[2.06,-1.47,[.19,.26,.31]],[1.77,-1.46,[.065,.11,.16]]]);
    barrel([[1.64,-1.47,[.08,.13,.20]],[1.72,-1.42,[.12,.20,.27]],[1.72,-1.37,[.026,.052,.083]],[1.66,-1.34,[.30,.36,.39]],[1.58,-1.33,[.12,.21,.26]]]);
    barrel([[1.42,-1.33,[.04,.07,.10]],[1.47,-1.30,[.20,.27,.33]],[1.47,-1.22,[.055,.098,.16]],[1.42,-1.185,[.39,.46,.49]]]);
    function cap(r,y,clr){
      for(let i=0;i<slices;i++){
        const n=[0,1,0],p=[0,y,0],a=circle(r,y,i*TAU/slices),b=circle(r,y,(i+1)*TAU/slices);
        for (const v of [p,a,b]) mv(top,v,n,clr,1);
      }
    }
    cap(2.07,-1.469,[.038,.072,.115]);cap(1.65,-1.333,[.08,.137,.19]);cap(1.42,-1.184,[.105,.18,.24]);
    function ring(b,r,y,c,a,start=0,end=TAU,count=slices){
      let p=circle(r,y,start);
      for(let i=1;i<=count;i++){const q=circle(r,y,mix(start,end,i/count));line(b,p,q,c,a);p=q;}
    }
    for(const [rad,y,col,a] of [[2.17,-1.54,icy,.44],[2.08,-1.464,ice,.55],[1.95,-1.463,blue,.55],[1.74,-1.399,ice,.7],[1.73,-1.424,blue,.83],[1.56,-1.331,icy,.85],[1.483,-1.255,icy,.97],[1.475,-1.248,ice,.8],[1.406,-1.178,ice,.68],[1.25,-1.179,icy,.58],[1.07,-1.179,blue,.53],[.85,-1.179,ice,.23],[.53,-1.178,amber,.57],[.38,-1.178,gold,.58]])ring(rails,rad,y,col,a);
    for(const angle of [-.25,1.20,2.40,4.91]){
      ring(rails,2.156,-1.517,amber,.94,angle,angle+.29,14);ring(rails,2.156,-1.51,gold,.60,angle,angle+.28,14);
      ring(rails,1.724,-1.405,gold,.93,angle,angle+.53,17);ring(rails,1.478,-1.252,white,.78,angle+.65,angle+1.04,13);
    }
    for(let i=0;i<(compact?54:84);i++){
      const a=TAU*i/(compact?54:84);
      line(rails,circle(1.68,-1.333,a),circle(1.64-(i%6===0?.08:0),-1.333,a),i%6===0?amber:ice,i%6===0?.72:.40);
      line(rails,circle(1.725,-1.418,a),circle(1.725,-1.38,a),icy,i%3===0?.49:.15);
    }
    for(let j=0;j<19;j++){const t=rand()*TAU;iv(stagePts,circle(j%3===0?2.11:1.47,-1.22-(j%3===0?.28:0),t),j%4?icy:amber,.54,j%3===0?7:4);}
    iv(stagePts,[.01,-1.167,.14],amber,.96,35);
    iv(stagePts,[.0,-1.158,.11],white,1,14);

    const terrain=inkSlot('terrain'),dust=inkSlot('dust');
    function ridge(x,z) {
      const amp=.14+.61*(1-Math.exp(-Math.pow(Math.abs(x)/3.3,2)));
      const waves=.42*Math.sin(x*1.11+z*.72)+.34*Math.sin(x*1.90-z*.53)+.19*Math.cos(z*1.95+x*.46);
      const scar=.21*Math.exp(-Math.pow((x+3.42+z*.12)/.50,2))+.17*Math.exp(-Math.pow((x-4.18-z*.11)/.72,2));
      return -1.38+amp*(.17+waves)+scar;
    }
    const rows=compact?15:23, cols=compact?84:144;
    for(let j=0;j<rows;j++){
      const z=-6+j*5.47/(rows-1);
      for(let k=0;k<cols;k++){
        const x=-8+16*k/(cols-1), y=ridge(x,z), p=[x,y,z];
        const g=clamp((x+2.3)*.27+.1*Math.sin(z)),c=colorMix([.105,.47,.68],[.76,.46,.25],g);
        const distance=clamp(1-Math.abs(x)/10,.2,1), a=(.14+.17*(j/rows))*distance;
        if(k+1<cols && (j%4===0 || j===rows-1)) {const xx=x+16/(cols-1);line(terrain,p,[xx,ridge(xx,z),z],c,a*.84);}
        if(k%5===0&&j+1<rows){const zz=z+5.47/(rows-1);line(terrain,p,[x,ridge(x,zz),zz],c,a*.27);}
        if(Math.abs(x)>1.12)iv(dust,p,c,a+.13,2.2);
      }
    }
    for(let j=0;j<(compact?32:62);j++){
      const x=(rand()-.5)*9,y=rand()*3.9-.85,z=-2-rand()*4;
      iv(dust,[x,y,z],j%7?icy:amber,.18+rand()*.25,2+rand()*1.9);
    }
    const shell=meshSlot('shell'),back=meshSlot('back'),rim=meshSlot('rim'), shieldInk=inkSlot('shieldInk'), shieldDots=inkSlot('shieldDots');
    const curves=[
      [[0,1.50],[.31,1.31],[.79,1.16],[1.14,1.105]],
      [[1.14,1.105],[1.176,1.10],[1.194,1.082],[1.193,1.04]],
      [[1.193,1.04],[1.203,.66],[1.202,.25],[1.146,-.008]],
      [[1.146,-.008],[1.033,-.55],[.531,-.98],[.06,-1.258]],
      [[.06,-1.258],[.026,-1.28],[.01,-1.287],[0,-1.289]]
    ];
    const half=[];
    for(let j=0;j<curves.length;j++){
      const a=curves[j], steps=[12,4,10,15,3][j];
      for(let k=0;k<=steps;k++){if(j && k===0)continue;const t=k/steps,q=1-t;
        half.push([0,1].map(axis=>q*q*q*a[0][axis]+3*q*q*t*a[1][axis]+3*q*t*t*a[2][axis]+t*t*t*a[3][axis]));
      }
    }
    const outline=half.concat(half.slice(1,-1).reverse().map(p=>[-p[0],p[1]]));
    const atShield=(p,r,z)=>[p[0]*r,p[1]*r,z];
    const nFor=(p,f=.26)=>unit([f*p[0],f*p[1]*.53,1]);
    function contourTone(p) {
      const warmth=clamp((.28-p[1])*.75+(p[0]-.34)*.72);
      return colorMix(colorMix([.12,.52,.96],white,clamp((p[1]-.40)*.88+(p[0]+.22)*.22)),colorMix(gold,amber,.32),warmth);
    }
    for(let i=0;i<outline.length;i++){
      const p=outline[i],q=outline[(i+1)%outline.length], v=[q[1]-p[1],p[0]-q[0]],g=unit([-v[0],-v[1],0]);
      const brim=[ [.94,-.19],[.988,-.16],[1,.025],[.987,.143],[.946,.221],[.909,.223],[.883,.194] ];
      for(let k=1;k<brim.length;k++){
        const [ra,za]=brim[k-1],[rb,zb]=brim[k];
        const outward=unit([g[0]*Math.abs(zb-za),g[1]*Math.abs(zb-za),ra-rb]);
        const base=k===2?[.086,.23,.37]:k===4?[.33,.51,.64]:k===5?[.18,.35,.51]:[.2,.37,.49];
        let cp=colorMix(base,contourTone(p),k===4?.55:.21),cq=colorMix(base,contourTone(q),k===4?.55:.21);
        quadN(rim,atShield(p,ra,za),atShield(q,ra,za),atShield(q,rb,zb),atShield(p,rb,zb),[outward,outward,outward,outward],[cp,cq,cq,cp],k===2?.84:.98);
      }
      for(const [rr,zz,alpha] of [[1,.026,.83],[.987,.141,.8],[.947,.224,.85],[.912,.223,.93],[.881,.195,.42],[.944,-.183,.48],[.811,.217,.25]]){
        line(shieldInk,atShield(p,rr,zz),atShield(q,rr,zz),contourTone(p),alpha,contourTone(q));
      }
      for(const [rad1,rad2] of [[.001,.27],[.27,.54],[.54,.73],[.73,.883]]){
        const glassDepth=r=>.194+.157*(1-r*r/(.883*.883));
        const a=atShield(p,rad1,glassDepth(rad1)), b=atShield(q,rad1,glassDepth(rad1)), c=atShield(q,rad2,glassDepth(rad2)), d=atShield(p,rad2,glassDepth(rad2));
        const cc=[.085,.26,.43];
        quadN(shell,a,b,c,d,[a,b,c,d].map(x=>nFor(x,.34)),[cc,cc,cc,cc],.155+rad1*.032);
      }
      const a=atShield(p,.94,-.185),b=atShield(q,.94,-.185),o=[0,0,-.12];
      [o,a,b].forEach(v=>mv(back,v,[0,0,1],[.032,.114,.19],.30));
      if(i%10===0) {
        const a=atShield(p,.911,.224),b=atShield(p,.947,.22);
        line(shieldInk,a,b,ice,.34);
      }
    }
    for(const [x,y,s,c] of [[-.98,1.14,21,ice],[.17,1.39,14,ice],[1.13,.93,18,amber],[-1.15,.19,14,icy],[.01,-1.252,24,amber],[.83,-.56,10,amber]])iv(shieldDots,[x,y,.19],c,.75,s);

    const neurons=inkSlot('neurons'),spikes=inkSlot('spikes'),brainPts=inkSlot('brainPts'),pulses=inkSlot('pulses'),veins=inkSlot('veins');
    function neuralColor(p) {
      const w=clamp(.52+p[0]*.82-p[1]*.65+p[2]*.10);
      return colorMix(colorMix([.14,.48,1],ice,clamp(.36+p[2]*.78+p[1]*.12)),colorMix(gold,amber,.25+clamp(p[2])*.53),w*w*(3-2*w));
    }
    function cortex(side,theta,phi) {
      const above=Math.cos(theta), belt=Math.sin(theta), cc=Math.cos(phi), ss=Math.sin(phi);
      const grain=1+.052*Math.sin(4*phi+2.7*theta+side)*Math.sin(2.6*theta)+.048*Math.sin(6.3*theta-1.8*phi)*belt;
      const x=side*(.029+(.88+.06*above)*belt*Math.abs(cc)*grain);
      const lowerLobe=.10*Math.exp(-Math.pow((Math.abs(x)-.53)/.24,2)-Math.pow((above+.45)/.38,2));
      const y=.10+.515*above*grain+.071*ss*belt-.049*Math.pow(Math.abs(x),2)-lowerLobe;
      const z=-.025+.58*belt*ss*grain;
      return [x,y,z];
    }
    const pts=[];
    for(const side of [-1,1]){
      const number=compact?83:127;
      for(let i=0;i<number;i++){
        const theta=Math.acos(1-2*(i+.33)/number), phi=((i*2.3999632 +side*.37)%TAU)+.14*(rand()-.5);
        const p=cortex(side,theta,phi);
        pts.push({p,side,c:neuralColor(p)});
      }
    }
    const linked=new Set();
    for(let i=0;i<pts.length;i++){
      const a=pts[i];
      const near=[];
      for(let j=0;j<pts.length;j++){
        if(i===j||pts[j].side!==a.side)continue;
        const d=Math.hypot(...sub(a.p,pts[j].p));
        if(d>.059)near.push([d,j]);
      }
      near.sort((x,y)=>x[0]-y[0]);
      for(const item of near.slice(0,compact?4:5)){
        const j=item[1],key=Math.min(i,j)*pts.length+Math.max(i,j);
        if(linked.has(key))continue;linked.add(key);
        const b=pts[j], front=clamp(.5+(a.p[2]+b.p[2])*.60),bright=(.27+.52*front)*(.70+rand()*.49);
        line(neurons,a.p,b.p,a.c,bright,b.c,bright);
        if(rand()<.08)iv(pulses,a.p,colorMix(a.c,amber,.18),.8,5+rand()*3,rand(),b.p);
      }
      const f=clamp(.5+a.p[2]*.78),rank=rand();
      iv(brainPts,a.p,a.c,.63+f*.42,(rank>.91?15:rank>.66?8.3:4.6)*(.88+.26*f));
      if(rank>.935) {iv(brainPts,a.p,a.c,.46,22);iv(brainPts,a.p,white,1,5);}
    }
    // A sparse subset of larger axonal bundles bridges the median fissure.
    for(let i=0;i<12;i++){
      const a=pts[(compact?3:5)*i], b=pts.slice(pts.length/2).reduce((best,p)=>Math.hypot(...sub(a.p,p.p))<Math.hypot(...sub(a.p,best.p))?p:best);
      if(Math.hypot(...sub(a.p,b.p))<.44)line(neurons,a.p,b.p,a.c,.33,b.c);
    }
    for(const side of [-1,1])for(let k=0;k<7;k++){
      const list=[],phi=.05+k*.46;
      for(let j=0;j<22;j++){const t=j/21;
        const p=cortex(side,.42+t*1.91+.09*Math.sin(t*8+k),phi+.11*Math.sin(t*9+k*.72));
        list.push(p.map(v=>v*1.013));
      }
      const c=neuralColor(list[10]);
      streak(veins,list,c,.24);
    }
    // Fine descending axon fibres let the brain retain an anatomical silhouette.
    for(let j=0;j<(compact?12:20);j++) {
      const xx=(j/(compact?11:19)-.5),phase=rand()*TAU,list=[];
      for(let i=0;i<27;i++){
        const t=i/26;
        const x=xx*(.77*Math.pow(1-t,1.7)+.07)-.13*Math.sin(t*3.9)+.10*t;
        const y=-.15-t*1.23+.045*Math.cos(phase)*(1-t);
        const z=.035+.052*Math.sin(phase+t*5)+.093*Math.sin(t*3.3);
        list.push([x+.035*Math.sin(phase+t*4)*(1-t),y,z]);
      }
      const c=j%5===0?gold:colorMix(icy,amber,j/(compact?12:20));
      for(let i=1;i<list.length;i++)line(veins,list[i-1],list[i],c,.22+.34*(1-i/list.length));
      if(j%4===0){const k=7+j%9;iv(spikes,list[k],c,.9,6);iv(pulses,list[k],c,.72,6,rand(),list[k+7]);}
    }

    const pane=meshSlot('pane'),panelInk=inkSlot('panelInk'),panelPts=inkSlot('panelPts');
    function roundRect(w,h,r,z,offsetX=0,offsetY=0){
      const pts=[];for(let corner=0;corner<4;corner++){
        const angle=corner*Math.PI/2, cx=(corner===0||corner===3?1:-1)*(w/2-r),cy=(corner<2?1:-1)*(h/2-r);
        for(let j=0;j<=6;j++){const t=angle+j*Math.PI/12;pts.push([offsetX+cx+r*Math.cos(t),offsetY+cy+r*Math.sin(t),z]);}
      }
      pts.push(pts[0]);return pts;
    }
    const outlinePanel=roundRect(.81,.67,.075,0);
    for(let i=1;i<outlinePanel.length;i++){
      const p=outlinePanel[i-1],q=outlinePanel[i];
      [[0,0,0],p,q].forEach(v=>mv(pane,v,[0,0,1],[.09,.23,.37],.66));
      line(panelInk,p,q,icy,.71);
      const a=[p[0]-.043,p[1]+.028,-.075],b=[q[0]-.043,q[1]+.028,-.075];
      line(panelInk,a,b,ice,.32);if(i%7===0)line(panelInk,p,a,ice,.43);
    }
    for(const [x,y] of [[-.30,.234],[.30,-.233]]){line(panelInk,[x,y,.008],[x+Math.sign(-x)*.09,y,.008],ice,.88);iv(panelPts,[x,y,.009],icy,.6,4);}
    const icons=[];
    for(let i=0;i<3;i++)icons.push(inkSlot('icon'+i));
    function path2(b,pts,col=ice,a=.93) {streak(b,pts.map(p=>[p[0],p[1],.018]),col,a);}
    const bot=icons[0],check=icons[1],chart=icons[2];
    streak(bot,roundRect(.293,.202,.036,.019,0,.02),ice,.95);
    streak(bot,roundRect(.024,.039,.008,.020,-.061,.029),ice,1);
    streak(bot,roundRect(.024,.039,.008,.020,.061,.029),ice,1);
    path2(bot,[[0,.122],[0,.174],[-.023,.184]],icy,.91);
    path2(bot,[[-.15,.045],[-.177,.045],[-.177,-.016],[-.15,-.016]],icy,.93);
    path2(bot,[[.15,.045],[.177,.045],[.177,-.016],[.15,-.016]],icy,.93);
    path2(bot,[[-.052,-.121],[.052,-.121]],icy,.73);
    path2(check,[[0,.163],[.143,.100],[.125,-.038],[.086,-.091],[0,-.15],[-.086,-.091],[-.125,-.038],[-.143,.10],[0,.163]],ice);
    path2(check,[[-.068,.01],[-.022,-.039],[.077,.064]],amber);
    path2(chart,[[-.17,-.12],[.17,-.12]],ice,.83);
    for(let i=0;i<4;i++){const x=-.13+i*.073,h=.06+.044*i;
      path2(chart,[[x,-.10],[x,-.10+h],[x+.035,-.10+h],[x+.035,-.10]],i===3?amber:ice);
    }
    return parts;
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motion = !reduce.matches && document.documentElement.dataset.motion !== 'paused';
  let visible = true, frame = 0, elapsed = 0, last = 0, nextPaint = 0, width = 0, height = 0;
  let aimX = 0, aimY = 0, smoothX=0, smoothY=0, quality=1, underBudget=0, lastRender=0;
  let gl, resources, disposed=false, hadContextLoss=false;
  function fallbackMode() {
    host.dataset.renderer='fallback';host.dataset.motion='paused';
    canvas.hidden=true;if(fallback)fallback.hidden=false;
  }
  function compile(kind,src){
    const s=gl.createShader(kind);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw Error('Shader unavailable');}return s;
  }
  function program(vs,fs,names,uniforms){
    const p=gl.createProgram(),v=compile(gl.VERTEX_SHADER,vs),f=compile(gl.FRAGMENT_SHADER,fs);
    gl.attachShader(p,v);gl.attachShader(p,f);names.forEach((name,i)=>gl.bindAttribLocation(p,i,name));
    gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)){gl.deleteProgram(p);throw Error('Program unavailable');}
    const loc=Object.create(null);uniforms.forEach(name=>loc[name]=gl.getUniformLocation(p,name));
    return {p,u:loc};
  }
  function upload(arr) {
    const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.STATIC_DRAW);return b;
  }
  function initialize(){
    gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,powerPreference:'low-power',preserveDrawingBuffer:false});
    if(!gl){fallbackMode();return;}
    const sky=program(skyVS,skyFS,['aP'],['uTime','uAim']);
    const mesh=program(meshVS,meshFS,['aP','aN','aC'],['uVP','uModel','uTime','uKind','uEye','uAim']);
    const ink=program(inkVS,inkFS,['aP','aEnd','aC','aPart'],['uVP','uModel','uTime','uPx','uTravel','uDots']);
    const compact=window.matchMedia('(max-width: 720px)').matches || (navigator.deviceMemory && navigator.deviceMemory<=3);
    const post=program(postVS,postFS,['aP'],['uSource','uGlow','uDelta','uPass']);
    const art=makeArtwork(compact);
    const objects=Object.create(null);
    Object.keys(art).forEach(k=>{
      const v=art[k].v, layout=art[k].layout;
      objects[k]={b:upload(v),count:v.length/(layout==='mesh'?10:12),layout};
    });
    resources={sky,mesh,ink,post,objects,compact,bloom:null,backdrop:upload([-1,-1,3,-1,-1,3])};
    host.dataset.renderer='webgl';host.dataset.quality=compact?'compact':'full';
    canvas.hidden=false;
    width=height=0;resize();
    paint();
    // Keep the local illustration underneath the opaque rendered sky while the GPU composites or restores a frame.
    if(fallback)fallback.hidden=false;
    syncMotion();
  }
  function resize(){
    if(!gl||!resources||hadContextLoss)return;
    const w=Math.max(1,canvas.clientWidth || host.clientWidth),h=Math.max(1,canvas.clientHeight || host.clientHeight);
    const ratio=Math.min(window.devicePixelRatio||1,resources.compact?1.5:1.75,(resources.compact?880:1240)/w)*quality;
    const W=Math.max(1,Math.round(w*ratio)),H=Math.max(1,Math.round(h*ratio));
    if(W!==width||H!==height){width=W;height=H;canvas.width=W;canvas.height=H;gl.viewport(0,0,W,H);requestStill();}
  }
  function paint(){
    if(!resources||hadContextLoss||disposed||!width||!height)return;
    const {sky,mesh,ink,objects,compact}=resources;
    const aspect=width/height, time=elapsed;
    const eye=[.30+smoothX*.52,.95+smoothY*.19,6.12];
    const center=[0,-.34,0];
    const vp=mul(perspective(aspect,Math.max(.754,2*Math.atan(2.59/(6.17*aspect)))),look(eye,center));
    const idle=Math.sin(time*.265);
    const shield=pose(0,.02,0,-.235+idle*.090+smoothX*.205, .017+smoothY*.075, -.011+smoothX*.022);
    const brain=mul(shield,pose(-.006,.315,.024,-.39-.045*Math.sin(time*.215),-.055,.033));
    const panePos=[
      pose(-1.719,.41+.034*Math.sin(time*.71),-.105,.33+smoothX*.063,-.026,-.025),
      pose(1.672,.71+.037*Math.sin(time*.62+1.3),-.23,-.29+smoothX*.063,.025,.027),
      pose(1.865,-.19+.033*Math.sin(time*.67+3),.065,-.33+smoothX*.063,.017,.025)
    ];
    const world=identity();
    // Let the existing illustration show until the opaque sky and geometry reach the compositor.
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
    gl.useProgram(sky.p);gl.bindBuffer(gl.ARRAY_BUFFER,resources.backdrop);
    gl.enableVertexAttribArray(0);gl.disableVertexAttribArray(1);gl.disableVertexAttribArray(2);gl.disableVertexAttribArray(3);
    gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    gl.uniform1f(sky.u.uTime,time);gl.uniform2f(sky.u.uAim,smoothX,smoothY);gl.drawArrays(gl.TRIANGLES,0,3);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);
    let active=null;
    function activate(which){
      if(active===which)return;
      active=which;gl.useProgram(which.p);
      gl.uniformMatrix4fv(which.u.uVP,false,vp);
      gl.uniform1f(which.u.uTime,time);
      if(which===mesh){
        gl.uniform3fv(which.u.uEye,eye);gl.uniform2f(which.u.uAim,smoothX,smoothY);
        gl.disableVertexAttribArray(3);
      }else{
        gl.uniform1f(which.u.uPx,clamp(height/395,.57,2.2));
        gl.enableVertexAttribArray(3);
      }
      gl.enableVertexAttribArray(0);gl.enableVertexAttribArray(1);gl.enableVertexAttribArray(2);
    }
    function drawMesh(key,m,kind){
      const o=objects[key];activate(mesh);gl.bindBuffer(gl.ARRAY_BUFFER,o.b);
      gl.vertexAttribPointer(0,3,gl.FLOAT,false,40,0);gl.vertexAttribPointer(1,3,gl.FLOAT,false,40,12);gl.vertexAttribPointer(2,4,gl.FLOAT,false,40,24);
      gl.uniformMatrix4fv(mesh.u.uModel,false,m);gl.uniform1f(mesh.u.uKind,kind);gl.drawArrays(gl.TRIANGLES,0,o.count);
    }
    function drawInk(key,m,points=false,travel=false){
      const o=objects[key];if(!o.count)return;activate(ink);gl.bindBuffer(gl.ARRAY_BUFFER,o.b);
      gl.vertexAttribPointer(0,3,gl.FLOAT,false,48,0);gl.vertexAttribPointer(1,3,gl.FLOAT,false,48,12);
      gl.vertexAttribPointer(2,4,gl.FLOAT,false,48,24);gl.vertexAttribPointer(3,2,gl.FLOAT,false,48,40);
      gl.uniformMatrix4fv(ink.u.uModel,false,m);gl.uniform1f(ink.u.uDots,points?1:0);gl.uniform1f(ink.u.uTravel,travel?1:0);
      gl.drawArrays(points?gl.POINTS:gl.LINES,0,o.count);
    }
    const alpha=()=>gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    const glow=()=>gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    gl.enable(gl.BLEND);gl.depthMask(false);glow();
    drawInk('terrain',world);drawInk('dust',world,true);
    gl.depthMask(true);alpha();drawMesh('stage',world,1);drawMesh('stageTop',world,2);
    gl.depthMask(false);glow();drawInk('stageRings',world);drawInk('stagePts',world,true);
    for(let i=0;i<3;i++){const model=panePos[i];alpha();drawMesh('pane',model,0);glow();drawInk('panelInk',model);drawInk('panelPts',model,true);drawInk('icon'+i,model);}
    alpha();drawMesh('back',shield,0);
    glow();drawInk('veins',brain);drawInk('neurons',brain);drawInk('brainPts',brain,true);drawInk('spikes',brain,true);drawInk('pulses',brain,true,true);
    alpha();drawMesh('shell',shield,0);drawMesh('rim',shield,1);
    glow();drawInk('shieldInk',shield);drawInk('shieldDots',shield,true);
    gl.depthMask(true);
    finishLighting();
  }
  function finishLighting(){
    const {post,backdrop}=resources;
    const w=Math.max(2,Math.round(width/3.1)), h=Math.max(2,Math.round(height/3.1));
    let pack=resources.bloom;
    if(!pack || pack.width!==width || pack.height!==height){
      if(pack){for(const t of pack.tex)gl.deleteTexture(t);for(const f of pack.fb)gl.deleteFramebuffer(f);}
      function makeTexture(W,H){
        const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null);return t;
      }
      const tex=[makeTexture(width,height),makeTexture(w,h),makeTexture(w,h)];
      const fb=tex.slice(1).map(t=>{const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return f;});
      const valid=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      pack=resources.bloom={width,height,tex,fb,valid};
    }
    if(!pack.valid)return;
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,pack.tex[0]);
    gl.copyTexSubImage2D(gl.TEXTURE_2D,0,0,0,0,0,width,height);
    gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.useProgram(post.p);
    gl.enableVertexAttribArray(0);gl.disableVertexAttribArray(1);gl.disableVertexAttribArray(2);gl.disableVertexAttribArray(3);
    gl.bindBuffer(gl.ARRAY_BUFFER,backdrop);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    gl.uniform1i(post.u.uSource,0);gl.uniform1i(post.u.uGlow,1);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,null);
    gl.activeTexture(gl.TEXTURE0);gl.viewport(0,0,w,h);
    for(let pass=0;pass<2;pass++){
      gl.bindFramebuffer(gl.FRAMEBUFFER,pack.fb[pass]);gl.bindTexture(gl.TEXTURE_2D,pack.tex[pass]);
      gl.uniform2f(post.u.uDelta,pass?0:1.20/w,pass?1.24/h:0);gl.uniform1f(post.u.uPass,pass);gl.drawArrays(gl.TRIANGLES,0,3);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,width,height);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,pack.tex[2]);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,pack.tex[0]);gl.uniform1f(post.u.uPass,2);gl.drawArrays(gl.TRIANGLES,0,3);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,null);gl.activeTexture(gl.TEXTURE0);
  }
  function run(ts){
    frame=0;if(!resources||hadContextLoss||!motion||!visible||document.hidden||disposed)return;
    const delta=last ? Math.min((ts-last)/1000,.085) : 0;
    last=ts;elapsed+=delta;
    const damping=1-Math.exp(-delta*6);
    smoothX+=(aimX-smoothX)*damping;smoothY+=(aimY-smoothY)*damping;
    if(ts>=nextPaint){
      const step=resources.compact?1000/30:1000/45;
      if(lastRender){
        const interval=ts-lastRender;
        // Persistent budget misses include very slow visible devices. One isolated stall is insufficient.
        underBudget=interval>step*2.4?underBudget+1:Math.max(0,underBudget-1);
        if(underBudget>=14&&quality>.73){quality=.72;host.dataset.quality='adaptive';underBudget=0;resize();}
      }
      lastRender=ts;nextPaint=ts+step-2;paint();
    }
    frame=requestAnimationFrame(run);
  }
  function requestStill(){
    if(!frame&&!hadContextLoss&&visible&&!document.hidden&&resources)frame=requestAnimationFrame(ts=>{
      frame=0;
      if(motion){run(ts);}else paint();
    });
  }
  function syncMotion(){
    if(frame){cancelAnimationFrame(frame);frame=0;}
    last=lastRender=nextPaint=0;
    if(!resources||hadContextLoss||disposed)return;
    host.dataset.motion=motion&&visible&&!document.hidden?'running':'paused';
    if(!visible||document.hidden)return;
    if(!motion){aimX=aimY=smoothX=smoothY=0;paint();return;}
    frame=requestAnimationFrame(run);
  }
  function pointer(event){
    if(!motion||!resources||event.pointerType==='touch')return;
    const box=host.getBoundingClientRect();
    aimX=clamp((event.clientX-box.left)/box.width*2-1,-1,1);
    aimY=clamp(1-(event.clientY-box.top)/box.height*2,-1,1);
  }
  host.addEventListener('pointermove',pointer,{passive:true});
  host.addEventListener('pointerleave',()=>{aimX=aimY=0;},{passive:true});
  document.addEventListener('arena-motion',event=>{
    if(event.detail && typeof event.detail.enabled==='boolean'){motion=event.detail.enabled;syncMotion();}
  });
  reduce.addEventListener('change',event=>{motion=!event.matches&&document.documentElement.dataset.motion!=='paused';syncMotion();});
  document.addEventListener('visibilitychange',syncMotion);
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncMotion();},{rootMargin:'0px'}).observe(host);
  }
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(host);
  else window.addEventListener('resize',resize,{passive:true});
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();hadContextLoss=true;if(frame)cancelAnimationFrame(frame);frame=0;resources=null;fallbackMode();
  });
  canvas.addEventListener('webglcontextrestored',()=>{
    hadContextLoss=false;try {initialize();} catch {resources=null;fallbackMode();}
  });
  window.addEventListener('pagehide',()=>{disposed=true;if(frame)cancelAnimationFrame(frame);frame=0;});
  window.addEventListener('pageshow',()=>{if(disposed){disposed=false;syncMotion();}});
  try {initialize();} catch {resources=null;fallbackMode();}
})();
