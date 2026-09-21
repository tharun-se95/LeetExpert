/* kit/engine.js: colour palette, animation clock and the scene player (grid boards and node-link boards).
   Shared by every lesson page; concatenated inside one closure by kit/build.py. */
var M = window.Motion || null;
var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var clamp=function(x,a,b){a=a==null?0:a;b=b==null?1:b;return Math.min(b,Math.max(a,x));};
var ease=function(p){return p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;};
function h2r(h){h=h.trim();if(h[0]==='#'){if(h.length===4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];return [1,3,5].map(function(i){return parseInt(h.slice(i,i+2),16);});}var m=h.match(/[\d.]+/g)||[0,0,0];return m.slice(0,3).map(Number);}
var mixc=function(a,b,p){return [Math.round(a[0]+(b[0]-a[0])*p),Math.round(a[1]+(b[1]-a[1])*p),Math.round(a[2]+(b[2]-a[2])*p)];};
var rgb=function(a){return 'rgb('+a[0]+','+a[1]+','+a[2]+')';};
var fmt=function(n){return n.toLocaleString('en-US');};
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function icon(id){return '<svg class="i" aria-hidden="true"><use href="#'+id+'"/></svg>';}
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}
function run(from,to,dur,onUpdate,onDone){
  if(M&&M.animate){
    var c=M.animate(from,to,{duration:dur,ease:'linear',onUpdate:onUpdate,onComplete:onDone});
    return {stop:function(){try{c.stop();}catch(e){try{c.cancel();}catch(e2){}}}};
  }
  var t0=performance.now(),id=0,dead=false;
  (function tick(now){if(dead)return;var p=clamp((now-t0)/(dur*1000));onUpdate(from+(to-from)*p);if(p<1)id=requestAnimationFrame(tick);else if(onDone)onDone();})(t0);
  return {stop:function(){dead=true;cancelAnimationFrame(id);}};
}

/* palette from the page's CSS tokens: light and dark both come from the app */
var KINDS=['idle','cur','acc','done','bad','warn','dim','viol','win'];
var PAL={},EDGE={};
function readPal(){
  var cs=getComputedStyle(document.documentElement);
  KINDS.forEach(function(k){PAL[k]={f:h2r(cs.getPropertyValue('--k-'+k)),i:h2r(cs.getPropertyValue('--k-'+k+'-ink'))};});
  EDGE.idle=h2r(cs.getPropertyValue('--e-idle'));EDGE.path=h2r(cs.getPropertyValue('--e-path'));EDGE.cur=h2r(cs.getPropertyValue('--e-cur'));
}
function styleOf(c){var P=PAL[c.k]||PAL.idle;return {f:P.f,i:P.i};}

var mk=function(n,f){var a=[];for(var i=0;i<n;i++)a.push(f(i));return a;};
var cp=function(a){return a.map(function(x){return {k:x.k,t:x.t};});};
function zeros(n){return mk(n,function(){return 0;});}

/* ---------- Scene player ---------- */
var SCENES=[];
function Scene(def,root){
  var self=this,frames=def.frames,n=frames.length,step=def.step,total=n*step,t=def.poster*step+step*.5,speed=1,playing=false,ctl=null,cells={},edgeEls={},last={};
  var stage=root.querySelector('.stage'),note=root.querySelector('.note'),stats=root.querySelector('.stats'),cnt=root.querySelector('.cnt'),head=root.querySelector('.head'),range=root.querySelector('input[type=range]'),ticks=root.querySelector('.ticks'),playB=root.querySelector('.pp'),spdB=root.querySelector('.spd');
  var groups=[];
  def.boards.forEach(function(b){
    if(!groups[b.g]){groups[b.g]=el('div','grp'+(b.wide?' wide':''));stage.appendChild(groups[b.g]);}
    var w=el('div','bw'),lab=el('div','bl',b.label),brd=el('div','brd'+(b.tree?' tree':''));
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
    }
    w.appendChild(lab);w.appendChild(brd);groups[b.g].appendChild(w);b.el=brd;
  });
  frames.forEach(function(f,i){var tk=el('i',f.ev||'');tk.title='Frame '+(i+1);tk.addEventListener('click',function(){pause();t=i*step+step*.5;render();});ticks.appendChild(tk);});
  var tickEls=ticks.children;

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
        var cap=b.cap||56,gap=3,cs=Math.floor(Math.min(cap,(gw-8-(b.cols-1)*gap)/b.cols));cs=Math.max(cs,20);
        b.el.style.setProperty('--cs',cs+'px');b.el.style.setProperty('--fs',Math.max(9,Math.round(cs*.4))+'px');
      }
    });
    last={};render();
  }
  function render(){
    var fi=Math.min(n-1,Math.floor(t/step+1e-9)),loc=(t-fi*step)/step,p=fi===0?1:ease(clamp(loc/.45));
    var cur=frames[fi],prev=frames[Math.max(0,fi-1)];
    def.boards.forEach(function(b){
      var a=prev.b[b.id],c=cur.b[b.id],els=cells[b.id];
      for(var i=0;i<els.length;i++){
        var sa=styleOf(a[i]),sb=styleOf(c[i]),f=rgb(mixc(sa.f,sb.f,p)),ink=rgb(mixc(sa.i,sb.i,p));
        var changed=a[i].k!==c[i].k||a[i].t!==c[i].t;
        var sc=changed&&p<1?1+.12*Math.sin(Math.PI*p):1,tx=(p<.3?a[i].t:c[i].t)||'';
        var key=f+ink+sc.toFixed(3)+tx,e=els[i],id=b.id+i;
        if(last[id]===key)continue;last[id]=key;
        e.style.background=f;e.style.color=ink;e.style.transform=sc===1?'':'scale('+sc.toFixed(3)+')';
        if(e.textContent!==tx)e.textContent=tx;
      }
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
      stats.innerHTML=(cur.stats||[]).map(function(s){return '<span>'+s[0]+' <b>'+s[1]+'</b></span>';}).join('');
      for(var k=0;k<tickEls.length;k++)tickEls[k].classList.toggle('on',k<=fi&&!tickEls[k].classList.contains('key')&&!tickEls[k].classList.contains('bad'));}
    cnt.textContent=(fi+1)+' / '+n;
    var pct=total?clamp(t/total)*100:0;head.style.left=pct+'%';
    if(document.activeElement!==range||playing)range.value=Math.round(pct*10);
    range.setAttribute('aria-valuetext','Frame '+(fi+1)+' of '+n);
  }
  function ui(){var again=t>=total-step*.6;playB.innerHTML=icon(playing?'i-pause':(again?'i-replay':'i-play'));playB.setAttribute('aria-label',playing?'Pause':(again?'Replay':'Play'));}
  function pause(){if(ctl){ctl.stop();ctl=null;}playing=false;ui();}
  function play(){
    if(playing)return;
    if(t>=total-step*.6)t=0;
    playing=true;ui();
    var from=t,dur=(total-step*.5-from)/speed;
    ctl=run(from,total-step*.5,Math.max(.05,dur),function(v){t=v;render();},function(){playing=false;ctl=null;t=total-step*.5;render();ui();});
  }
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

