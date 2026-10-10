/* kit/engine.js: colour palette, animation clock and the scene player (grid boards and node-link boards).
   Shared by every lesson page; concatenated inside one closure by kit/build.py. */
var M = window.Motion || null;
var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var clamp=function(x,a,b){a=a==null?0:a;b=b==null?1:b;return Math.min(b,Math.max(a,x));};
var ease=function(p){return p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;};
function h2r(h){h=h.trim();if(h[0]==='#'){if(h.length===4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];return [1,3,5].map(function(i){return parseInt(h.slice(i,i+2),16);});}var m=h.match(/[\d.]+/g)||[0,0,0];return m.slice(0,3).map(Number);}
/* relative luminance, for picking the readable ink over a fill that is mid-transition */
var lumc=function(c){var f=function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]);};
var crat=function(a,b){var x=lumc(a),y=lumc(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
var mixc=function(a,b,p){return [Math.round(a[0]+(b[0]-a[0])*p),Math.round(a[1]+(b[1]-a[1])*p),Math.round(a[2]+(b[2]-a[2])*p)];};
/* the ink for a fill that is mid-transition: the endpoint ink that reads better, or, when neither
   clears AA, one pushed toward whichever of black and white contrasts more with this fill, only as far
   as AA needs. Each state clears 4.5:1 with its own ink, but tints tuned close to that floor
   (accent_cell) left both inks at 4.1-4.4:1 over a blend of two of them: a white ink cannot be pushed
   whiter, so the direction comes from the fill, never the ink. One extreme always reaches 4.58:1
   (sqrt 21, where black and white tie), so the push always lands. */
var WHITE=[255,255,255],BLACK=[0,0,0];
function legible(f,ia,ib){
  var ink=crat(f,ia)>=crat(f,ib)?ia:ib;if(crat(f,ink)>=4.5)return ink;
  var to=crat(f,WHITE)>=crat(f,BLACK)?WHITE:BLACK,from=(lumc(ia)>lumc(f))===(to===WHITE)?ia:ib;
  for(var p=.1;p<1;p+=.1){var t=mixc(from,to,p);if(crat(f,t)>=4.5)return t;}
  return to;
}
var rgb=function(a){return 'rgb('+a[0]+','+a[1]+','+a[2]+')';};
var fmt=function(n){return n.toLocaleString('en-US');};
/* a count with its unit: counters animate through 1, where "1 hops" would show */
var count=function(n,one,many){return fmt(n)+' '+(n===1?one:many);};
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function icon(id){return '<svg class="i" aria-hidden="true"><use href="#'+id+'"/></svg>';}
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}
function run(from,to,dur,onUpdate,onDone){
  if(M&&M.animate){
    var c=M.animate(from,to,{duration:dur,ease:'linear',onUpdate:onUpdate,onComplete:onDone});
    return {stop:function(){try{c.stop();}catch(e){try{c.cancel();}catch(e2){/* already finished: neither call is needed */}}}};
  }
  var t0=performance.now(),id=0,dead=false;
  (function tick(now){if(dead)return;var p=clamp((now-t0)/(dur*1000));onUpdate(from+(to-from)*p);if(p<1)id=requestAnimationFrame(tick);else if(onDone)onDone();})(t0);
  return {stop:function(){dead=true;cancelAnimationFrame(id);}};
}

/* palette from the page's CSS tokens: light and dark both come from the app.
   Read inside a .navy probe, not from :root: every painted board sits on a navy
   instrument card, whose inks differ from the paper's in the light theme. */
var KINDS=['idle','cur','acc','done','bad','warn','dim','viol','win'];
var PAL={},EDGE={};
function readPal(){
  var probe=document.createElement('div');probe.className='navy';probe.hidden=true;document.body.appendChild(probe);
  var cs=getComputedStyle(probe);
  KINDS.forEach(function(k){PAL[k]={f:h2r(cs.getPropertyValue('--k-'+k)),i:h2r(cs.getPropertyValue('--k-'+k+'-ink'))};});
  EDGE.idle=h2r(cs.getPropertyValue('--e-idle'));EDGE.path=h2r(cs.getPropertyValue('--e-path'));EDGE.cur=h2r(cs.getPropertyValue('--e-cur'));
  probe.remove();
}
/* s (0 to 1) shades a cell by value, from the idle fill toward the accent: a pixel's brightness,
   a tile's place in an image. Its ink is whichever of the two reads better on that exact fill. */
function styleOf(c){
  if(c.s!=null){var f=mixc(PAL.idle.f,PAL.acc.f,clamp(c.s));return {f:f,i:legible(f,PAL.idle.i,PAL.acc.i)};}
  var P=PAL[c.k]||PAL.idle;return {f:P.f,i:P.i};
}
/* win's fill sits about 1.1:1 off idle on the navy card, so the state is carried by a ring (.cell.win),
   not the fill (#72). Every path that paints a cell's fill marks its state here too. */
function markState(e,k){e.classList.toggle('win',k==='win');}
/* A frame blends each fill from the last state to the next, so a cell leaving win still shows win's fill
   at the start of the step. Its ring stays until the fill has finished moving, or for that moment it is a
   win fill with nothing to tell it from idle (CI's gate caught it mid-play on sliding-window). */
function ringKind(from,to,p){return to==='win'||(p<1&&from==='win')?'win':to;}

var mk=function(n,f){var a=[];for(var i=0;i<n;i++)a.push(f(i));return a;};
var cp=function(a){return a.map(function(x){return {k:x.k,t:x.t,s:x.s};});};
function zeros(n){return mk(n,function(){return 0;});}

/* ---------- Scene player ---------- */
var SCENES=[];
function Scene(def,root){
  var self=this,frames=def.frames,n=frames.length,step=def.step,total=n*step,t=def.poster*step+step*.5,speed=1,playing=false,ctl=null,cells={},edgeEls={},ovs={},last={};
  var stage=root.querySelector('.stage'),note=root.querySelector('.note'),stats=root.querySelector('.stats'),cnt=root.querySelector('.cnt'),head=root.querySelector('.head'),range=root.querySelector('input[type=range]'),ticks=root.querySelector('.ticks'),playB=root.querySelector('.pp'),spdB=root.querySelector('.spd');
  var groups=[];
  def.boards.forEach(function(b){
    if(!groups[b.g]){groups[b.g]=el('div','grp'+(b.wide?' wide':''));stage.appendChild(groups[b.g]);}
    var w=el('div','bw'),lab=el('div','bl',b.label),brd=el('div','brd'+(b.tree?' tree':'')+(b.strip?' strip':''));
    cells[b.id]=[];
    if(b.tree){
      var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','edges');brd.appendChild(svg);b.svg=svg;
      if(b.tree.directed){var mid='ah'+b.id+Math.floor(Math.random()*1e6);
        svg.insertAdjacentHTML('afterbegin','<defs><marker id="'+mid+'" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="context-stroke"/></marker></defs>');
        b.marker='url(#'+mid+')';}
      edgeEls[b.id]=b.tree.edges.map(function(){var l=document.createElementNS('http://www.w3.org/2000/svg','line');if(b.marker)l.setAttribute('marker-end',b.marker);svg.appendChild(l);return l;});
      b.tree.nodes.forEach(function(){var c=el('div','cell node');brd.appendChild(c);cells[b.id].push(c);});
    }else{
      brd.style.gridTemplateColumns='repeat('+b.cols+',var(--cs))';
      for(var i=0;i<b.rows*b.cols;i++){var c2=el('div','cell');brd.appendChild(c2);cells[b.id].push(c2);}
      /* a rectangle over cells (a filter's window, a spiral's untouched bounds), made only for a board
         a frame draws one on, so no other board's markup changes; it follows the cells' tween */
      if(frames.some(function(f){return f.ov&&f.ov[b.id];})){var ov=el('div','ov');ov.setAttribute('aria-hidden','true');brd.appendChild(ov);ovs[b.id]=ov;brd.classList.add('has-ov');}
    }
    w.appendChild(lab);w.appendChild(brd);groups[b.g].appendChild(w);b.el=brd;
  });
  frames.forEach(function(f,i){var tk=el('i',f.ev||'');tk.title='Frame '+(i+1);tk.addEventListener('click',function(){pause();t=i*step+step*.5;render();});ticks.appendChild(tk);});
  var tickEls=ticks.children;

  function statsHtml(f){return (f.stats||[]).map(function(s){return '<span>'+s[0]+' <b>'+s[1]+'</b></span>';}).join('');}
  /* Hold the caption and the stats row at the tallest any frame needs, measured at this width:
     they change length every frame, and a row that wraps moved everything below the player. */
  function reserveText(){
    [[note,function(f){var d=document.createElement('div');d.textContent=f.note||'';return d.innerHTML;}],[stats,statsHtml]].forEach(function(p){
      var box=p[0],probe=box.cloneNode(false),h=0;probe.removeAttribute('aria-live');probe.setAttribute('aria-hidden','true');
      probe.style.cssText='position:absolute;visibility:hidden;left:0;top:0;min-height:0;width:'+box.clientWidth+'px';box.parentNode.appendChild(probe);
      frames.forEach(function(f){probe.innerHTML=p[1](f);h=Math.max(h,probe.offsetHeight);});probe.remove();
      if(h)box.style.minHeight=h+'px';});
  }
  function fit(){
    def.boards.forEach(function(b){
      var g=b.el.closest('.grp'),gw=g.clientWidth||260;
      if(b.tree){
        var W=Math.max(220,gw-8),nx=Math.max(1,b.tree.width),dx=Math.min(62,(W-40)/Math.max(1,nx-1||1)),d=Math.min(36,Math.max(24,dx*.7,0)),dy=Math.min(70,110/Math.max(1,1)+0);
        var rowsN=b.tree.depth+1;dy=rowsN>4?46:(rowsN>3?52:58);
        var width=(nx-1)*dx+d+8,height=(rowsN-1)*dy+d+8;
        b.geo={dx:dx,dy:dy,d:d,ox:d/2+4,oy:d/2+4};
        b.el.style.width=width+'px';b.el.style.height=height+'px';b.svg.setAttribute('width',width);b.svg.setAttribute('height',height);
        var fs=Math.max(10,Math.round(d*.34));
        b.tree.nodes.forEach(function(nd,i){var c=cells[b.id][i];c.style.width=d+'px';c.style.height=d+'px';c.style.left=(b.geo.ox+nd.x*dx-d/2)+'px';c.style.top=(b.geo.oy+nd.d*dy-d/2)+'px';c.style.fontSize=fs+'px';});
        b.tree.edges.forEach(function(e,i){var a=b.tree.nodes[e[0]],c=b.tree.nodes[e[1]],ln=edgeEls[b.id][i];
          var x1=b.geo.ox+a.x*dx,y1=b.geo.oy+a.d*dy,x2=b.geo.ox+c.x*dx,y2=b.geo.oy+c.d*dy;
          if(b.tree.directed){var len=Math.hypot(x2-x1,y2-y1)||1,back=d/2+3;x2-=(x2-x1)/len*back;y2-=(y2-y1)/len*back;}
          ln.setAttribute('x1',x1);ln.setAttribute('y1',y1);ln.setAttribute('x2',x2);ln.setAttribute('y2',y2);});
      }else{
        /* a strip is memory: narrow cells in one row, a wider gap every 4 (one cache line), no text */
        var cap=b.cap||(b.strip?18:56),gap=b.strip?2:3,extra=b.strip?Math.floor(b.cols/4)*3:0;
        var cs=Math.floor(Math.min(cap,(gw-8-(b.cols-1)*gap-extra)/b.cols));cs=Math.max(cs,b.strip?5:20);
        b.el.style.setProperty('--cs',cs+'px');b.el.style.setProperty('--fs',Math.max(9,Math.round(cs*.4))+'px');
      }
    });
    last={};reserveText();render();
  }
  /* o: {r0,c0,r1,c1} in cells, both corners included; measured from the laid-out cells, so it
     follows whatever size fit() gave them */
  function ovRect(b,o){
    var cs=cells[b.id],c0=cs[0],stepX=cs.length>1&&b.cols>1?cs[1].offsetLeft-c0.offsetLeft:c0.offsetWidth,
        stepY=b.rows>1?cs[b.cols].offsetTop-c0.offsetTop:c0.offsetHeight,gapX=stepX-c0.offsetWidth,gapY=stepY-c0.offsetHeight;
    return {x:c0.offsetLeft+o.c0*stepX-3,y:c0.offsetTop+o.r0*stepY-3,w:(o.c1-o.c0+1)*stepX-gapX+6,h:(o.r1-o.r0+1)*stepY-gapY+6};
  }
  function render(){
    var fi=Math.min(n-1,Math.floor(t/step+1e-9)),loc=(t-fi*step)/step,p=fi===0?1:ease(clamp(loc/.45));
    var cur=frames[fi],prev=frames[Math.max(0,fi-1)];
    def.boards.forEach(function(b){
      var a=prev.b[b.id],c=cur.b[b.id],els=cells[b.id];
      for(var i=0;i<els.length;i++){
        var sa=styleOf(a[i]),sb=styleOf(c[i]),fm=mixc(sa.f,sb.f,p),f=rgb(fm),ink=rgb(legible(fm,sa.i,sb.i));
        // the ink never blends: half-way between two states both fill and ink sat mid-tone and the
        // letter nearly vanished (the browser gate measured 1.47:1), so it takes whichever reads better
        var changed=a[i].k!==c[i].k||a[i].t!==c[i].t||a[i].s!==c[i].s;
        var sc=changed&&p<1?1+.12*Math.sin(Math.PI*p):1,tx=(p<.3?a[i].t:c[i].t)||'';
        var rk=ringKind(a[i].k,c[i].k,p),key=f+ink+sc.toFixed(3)+tx+rk,e=els[i],id=b.id+i;
        if(last[id]===key)continue;last[id]=key;
        markState(e,rk);e.style.background=f;e.style.color=ink;e.style.transform=sc===1?'':'scale('+sc.toFixed(3)+')';
        if(e.textContent!==tx)e.textContent=tx;
      }
      var o=ovs[b.id];
      if(o){var oc=cur.ov&&cur.ov[b.id],op=prev.ov&&prev.ov[b.id];
        if(oc){var r1=ovRect(b,oc),r0=op?ovRect(b,op):r1,q=op?p:1;
          o.className='ov'+(oc.cls==='bounds'?' bounds':'');
          // moved by transform from a fixed box: a changing left/top is a layout shift at every frame
          o.style.transform='translate('+(r0.x+(r1.x-r0.x)*q).toFixed(1)+'px,'+(r0.y+(r1.y-r0.y)*q).toFixed(1)+'px)';
          o.style.width=(r0.w+(r1.w-r0.w)*q)+'px';o.style.height=(r0.h+(r1.h-r0.h)*q)+'px';o.style.opacity=op?1:p;}
        else o.style.opacity=0;}
      if(b.tree){
        var ea=prev.e&&prev.e[b.id],ec=cur.e&&cur.e[b.id];
        edgeEls[b.id].forEach(function(ln,i){
          var va=ea?ea[i]:0,vc=ec?ec[i]:0,ca=EDGE[va===2?'cur':(va===1?'path':'idle')],cc=EDGE[vc===2?'cur':(vc===1?'path':'idle')];
          var w0=va?4:2,w1=vc?4:2,key='e'+b.id+i+va+vc+p.toFixed(2);if(last[key])return;last[key]=1;
          ln.style.stroke=rgb(mixc(ca,cc,p));ln.style.strokeWidth=(w0+(w1-w0)*p).toFixed(2);
        });
      }
    });
    if(note.dataset.f!==String(fi)){note.dataset.f=fi;note.textContent=cur.note||'';
      stats.innerHTML=statsHtml(cur);
      for(var k=0;k<tickEls.length;k++)tickEls[k].classList.toggle('on',k<=fi&&!tickEls[k].classList.contains('key')&&!tickEls[k].classList.contains('bad'));}
    cnt.textContent=(fi+1)+' / '+n;
    var pct=total?clamp(t/total)*100:0;head.style.left=pct+'%';
    if(document.activeElement!==range||playing)range.value=Math.round(pct*10);
    range.setAttribute('aria-valuetext','Frame '+(fi+1)+' of '+n);
  }
  function ui(){var again=t>=total-step*.6;playB.innerHTML=icon(playing?'i-pause':(again?'i-replay':'i-play'));playB.setAttribute('aria-label',playing?'Pause':(again?'Replay':'Play'));}
  /* def.loop: hold the last frame, then play again, until the learner takes the controls */
  var touched=false,loopT=0;
  function pause(){clearTimeout(loopT);if(ctl){ctl.stop();ctl=null;}playing=false;ui();}
  function play(){
    if(playing)return;
    if(t>=total-step*.6)t=0;
    playing=true;ui();
    var from=t,dur=(total-step*.5-from)/speed;
    ctl=run(from,total-step*.5,Math.max(.05,dur),function(v){t=v;render();},function(){playing=false;ctl=null;t=total-step*.5;render();ui();
      if(def.loop&&!touched&&!reduce)loopT=setTimeout(function(){if(!touched){t=0;play();}},2400);});
  }
  ['.pp','.pv','.nx'].forEach(function(sel){root.querySelector(sel).addEventListener('pointerdown',function(){touched=true;});});
  range.addEventListener('pointerdown',function(){touched=true;});
  playB.addEventListener('click',function(){playing?pause():play();});
  root.querySelector('.pv').addEventListener('click',function(){pause();var fi=Math.min(n-1,Math.floor(t/step));t=Math.max(0,fi-1)*step+step*.5;render();ui();});
  root.querySelector('.nx').addEventListener('click',function(){pause();var fi=Math.min(n-1,Math.floor(t/step));t=Math.min(n-1,fi+1)*step+step*.5;render();ui();});
  spdB.addEventListener('click',function(){speed=speed===1?2:(speed===2?.5:1);spdB.textContent=speed+'×';if(playing){pause();play();}});
  range.addEventListener('input',function(){pause();t=clamp(range.value/1000)*total;render();});
  if('ResizeObserver' in window){new ResizeObserver(function(){fit();}).observe(stage);}else{window.addEventListener('resize',fit);}
  self.refresh=function(){last={};render();};self.stop=pause;
  self.start=function(){if(reduce)return;pause();t=0;render();play();};
  fit();ui();
}

