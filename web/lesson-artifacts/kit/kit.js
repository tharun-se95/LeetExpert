/* kit/kit.js: everything a lesson page needs that is not about its own topic.
   Reveals, code blocks, players, quiz, variant cards, animated banners, kinetic
   headline, scroll reveals, contents rail, code-language switch, theme repaint and
   the embedding contract with the app. Concatenated after engine.js in one closure. */

var svgNS='http://www.w3.org/2000/svg';
function S(tag,attrs,parent){var e=document.createElementNS(svgNS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
function $(s,r){return (r||document).querySelector(s);}
function inView(node,fn){if(M&&M.inView)M.inView(node,fn,{amount:.35});else fn();}

/* SVG note: the page CSS sets stroke on .edges line, and CSS beats presentation attributes, so edge colours go through style. */
/* things that must redraw when the theme changes (the palette is read into JS, not CSS) */
var REPAINT=[];
function onRepaint(fn){REPAINT.push(fn);}

function playerHtml(id,label){
  return '<div class="player" role="group" aria-label="Walkthrough: '+label+'"><div class="stage"></div><div class="note" aria-live="off"></div><div class="stats"></div>'+
    '<div class="ctl"><button type="button" class="btn main pp" id="'+id+'-pp"></button><button type="button" class="btn pv" id="'+id+'-pv" aria-label="Previous frame">'+icon('i-prev')+'</button><button type="button" class="btn nx" id="'+id+'-nx" aria-label="Next frame">'+icon('i-next')+'</button>'+
    '<div class="track"><div class="ticks"></div><div class="head"></div><input type="range" id="'+id+'-rg" min="0" max="1000" value="0" aria-label="Scrub the walkthrough"></div><span class="cnt"></span><button type="button" class="btn spd" id="'+id+'-sp" aria-label="Playback speed">1×</button></div></div>';
}

/* A stepper widget: tabs choose an example, each builds a fresh Scene. `make(i)` returns a scene definition. */
function mountStepper(host,examples,make,id){
  var tabs=host.querySelector('.extabs'),pl=host.querySelector('.plhost'),scene=null;
  function load(i){
    tabs.querySelectorAll('button').forEach(function(b,k){b.setAttribute('aria-pressed',k===i);});
    if(scene&&scene.stop)scene.stop();
    var d=make(i);pl.innerHTML=playerHtml(id||'walk',d.label);
    scene=new Scene(d,pl.querySelector('.player'));scene.start();
  }
  examples.forEach(function(e,i){var b=el('button','tab',e.name);b.type='button';b.addEventListener('click',function(){load(i);});tabs.appendChild(b);});
  onRepaint(function(){if(scene)scene.refresh();});
  load(0);
}

/* reveals: the content is created on click, so Ctrl+F cannot find it first */
function reveal(host,label,build){
  var b=el('button','reveal-btn',icon('i-eye')+'<span>'+label+'</span>');b.type='button';b.setAttribute('aria-expanded','false');
  var body=el('div','reveal-body');body.hidden=true;host.appendChild(b);host.appendChild(body);
  b.addEventListener('click',function(){var open=b.getAttribute('aria-expanded')==='true';
    if(open){b.setAttribute('aria-expanded','false');body.hidden=true;body.innerHTML='';return;}
    body.innerHTML='';build(body);body.hidden=false;b.setAttribute('aria-expanded','true');});
}

/* code blocks: Python and TypeScript follow the page's language switch */
function codeBlock(py,ts,title){
  var d=el('div','code navy');d.innerHTML='<header><span>'+title+'</span><span class="c-py">Python</span><span class="c-ts">TypeScript</span></header><pre class="c-py"></pre><pre class="c-ts"></pre>';
  /* HL holds build-time Shiki colouring keyed by the exact source; without it, plain text */
  [['pre.c-py',py],['pre.c-ts',ts]].forEach(function(p){var pre=d.querySelector(p[0]),h=typeof HL!=='undefined'&&HL[p[1]];
    if(h){pre.classList.add('shiki');pre.innerHTML='<code>'+h+'</code>';}else pre.textContent=p[1];});
  return d;
}

function callout(kind,label,iconId,html){
  return el('div','callout '+kind,'<div class="cl"><svg class="i"><use href="#'+iconId+'"/></svg>'+label+'</div><p>'+html+'</p>');
}

function mountVariants(host,list){
  list.forEach(function(v){host.appendChild(el('div','vcard','<div class="vt">'+v[0]+'</div><div class="vs">'+v[1]+'</div><p>'+v[2]+'</p>'));});
}

/* quiz: each answer's slot comes from a hash of its question, so it moves between
   questions with no pattern to learn. The fixed-seed shuffle this replaced put every
   answer third. The checks throw at load, as the frame checks do: an
   answer longer than every distractor, or every answer in one slot, gives it away. */
function slotOf(text,n){var h=2166136261;for(var i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h%n;}
function plainLen(html){var d=document.createElement('div');d.innerHTML=html;return d.textContent.length;}
function mountQuiz(host,QUIZ){
  var slots=QUIZ.map(function(item,qi){
    var len=item.opts.map(plainLen),rest=len.filter(function(_,i){return i!==item.a;});
    if(len[item.a]>Math.max.apply(null,rest))throw new Error('quiz '+(qi+1)+': the answer is longer than every other option ('+len.join(', ')+')');
    return slotOf(item.q,item.opts.length);
  });
  if(QUIZ.length>1&&slots.every(function(x){return x===slots[0];}))throw new Error('quiz: every answer sits in slot '+slots[0]);
  QUIZ.forEach(function(item,qi){
    var idx=item.opts.map(function(_,i){return i;}).filter(function(i){return i!==item.a;});idx.splice(slots[qi],0,item.a);
    var card=el('div','qcard');card.appendChild(el('div','qq','<span class="qn navy" aria-hidden="true">'+(qi+1)+'</span><span><span class="sr">Question '+(qi+1)+'. </span>'+item.q+'</span>'));
    var opts=el('div','qopts'),fb=el('div','fb');card.appendChild(opts);card.appendChild(fb);
    idx.forEach(function(oi,pos){
      var b=el('button','qopt','<span class="ql">'+String.fromCharCode(65+pos)+'</span><span>'+item.opts[oi]+'</span>');b.type='button';opts.appendChild(b);
      b.addEventListener('click',function(){
        var right=oi===item.a;opts.querySelectorAll('.qopt').forEach(function(x,k){x.disabled=true;if(idx[k]===item.a)x.classList.add('good');});
        if(!right)b.classList.add('bad');fb.innerHTML=(right?'<b>Correct.</b> ':'<b>Not quite.</b> ')+item.why;fb.classList.add('on');
      });
    });
    host.appendChild(card);
  });
}

/* Predict widget: a question per case with numeric choices; `draw(host, case)` paints the case, `after` shows the why. */
function mountPredict(host,cases,opts){
  cases.forEach(function(c,ci){
    var card=el('div','pcard'),view=el('div','tv-wrap'),q=el('div','pq',opts.question(c)),ch=el('div','choices'),fb=el('div','fb');
    card.appendChild(q);card.appendChild(view);card.appendChild(ch);card.appendChild(fb);host.appendChild(card);
    var paint=opts.draw(view,c);
    opts.choices(c).forEach(function(v){
      var b=el('button','choice',String(v));b.type='button';ch.appendChild(b);
      b.addEventListener('click',function(){
        var right=v===c.expect;ch.querySelectorAll('.choice').forEach(function(x){x.disabled=true;if(x.textContent===String(c.expect))x.classList.add('good');});
        if(!right)b.classList.add('bad');
        fb.innerHTML=(right?'<b>Yes.</b> ':'<b>Not quite.</b> ')+opts.why(c);fb.classList.add('on');if(paint&&paint.reveal)paint.reveal();
      });
    });
  });
}

/* animated banners: one small SVG scene per section, played when it scrolls into view */
function mountBanners(kinds){
  document.querySelectorAll('.banner').forEach(function(host){
    var kind=host.dataset.b;if(!kinds[kind])return;
    var svg=S('svg',{viewBox:'0 0 720 120','aria-hidden':'true'},host);
    var run=kinds[kind](svg),done=false;
    if(reduce||!M||!M.animate){settle(run);return;}
    inView(host,function(){if(done)return;done=true;run();});
  });
}
/* Without motion a banner shows its last frame, never its first: a start frame reads
   "record: 0 hops" or draws no arrows at all. Every banner animates numbers through
   M.animate, so each call jumps to its end value. */
function settle(run){
  var real=M;
  M={animate:function(from,to,o){if(o&&o.onUpdate)o.onUpdate(to);if(o&&o.onComplete)o.onComplete();return {stop:function(){},cancel:function(){}};}};
  try{run();}finally{M=real;}
}
function kinetic(){
  var h=$('#h1');if(!h||!M||!M.animate||reduce)return;
  if(!h.querySelector('.kw')){var words=h.textContent.split(' ');h.innerHTML=words.map(function(w){return '<span class="kw">'+w+'</span>';}).join(' ');}
  M.animate('.kw',{opacity:[0.15,1],y:[26,0]},{duration:.7,delay:M.stagger(.09),ease:'easeOut'});
  M.animate('.hero-art',{opacity:[.3,1],x:[24,0]},{duration:.8,ease:'easeOut'});
}
function riseIn(){
  if(!M||!M.inView||reduce)return;
  document.querySelectorAll('.widget,.callout,.vcard,.qcard,.rosetta').forEach(function(node){
    M.inView(node,function(){M.animate(node,{opacity:[.25,1],y:[18,0]},{duration:.55,ease:'easeOut'});},{amount:.2});
  });
}

/* contents rail, language switch, theme repaint, and the embedding contract */
function wirePage(){
  var links=[].slice.call(document.querySelectorAll('.toc a')),secs=links.map(function(a){return document.querySelector(a.getAttribute('href'));});
  var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var i=secs.indexOf(e.target);links.forEach(function(a){a.removeAttribute('aria-current');});if(i>=0)links[i].setAttribute('aria-current','true');}});},{rootMargin:'-30% 0px -60% 0px'}):null;
  if(io)secs.forEach(function(s){if(s)io.observe(s);});
  var mainEl=$('main'),bpy=$('#lang-py'),bts=$('#lang-ts');
  function setLang(l){mainEl.dataset.code=l;bpy.setAttribute('aria-pressed',l==='py');bts.setAttribute('aria-pressed',l==='ts');store('lesson-lang',l);}
  window.__setLessonLang=setLang;
  bpy.addEventListener('click',function(){setLang('py');});bts.addEventListener('click',function(){setLang('ts');});
  var sv=store('lesson-lang');if(sv==='py'||sv==='ts')setLang(sv);
  function repaint(){readPal();REPAINT.forEach(function(fn){fn();});}
  if(window.matchMedia)matchMedia('(prefers-color-scheme: dark)').addEventListener('change',repaint);
  new MutationObserver(repaint).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

  /* embedded in the app: theme and code language come from the parent page */
  var q=new URLSearchParams(location.search);
  function applyTheme(t){if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}
  if(q.get('embed')==='1'){document.documentElement.classList.add('embed');applyTheme(q.get('theme'));}
  window.addEventListener('message',function(e){
    if(e.origin!==location.origin||!e.data||e.data.source!=='leetexpert')return;
    applyTheme(e.data.theme);
    if((e.data.code==='python'||e.data.code==='typescript')&&window.__setLessonLang)window.__setLessonLang(e.data.code==='python'?'py':'ts');
  });
}

/* Two-series cost chart: `naive` in red, `once` in green. pts = [[x, naive, once]]; log scales the y axis (for exponential growth). */
function costChart(host,o){
  var pts=o.pts,W=560,H=280,m={l:64,r:96,t:16,b:40},xmax=o.xmax||pts[pts.length-1][0],last=pts[pts.length-1],ymax=Math.max(last[1],last[2]);
  var Y=o.log?function(v){return H-m.b-(H-m.t-m.b)*Math.log10(Math.max(1,v))/Math.log10(ymax);}:function(v){return H-m.b-(H-m.t-m.b)*v/ymax;};
  var X=function(v){return m.l+(W-m.l-m.r)*v/xmax;};
  var yt=o.log?[1,10,100,1000,10000,100000,1000000].filter(function(v){return v<=ymax;}):[0,.5,1].map(function(f){return Math.round(ymax*f);});
  var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+o.aria+'">';
  yt.forEach(function(v){s+='<line x1="'+m.l+'" x2="'+(W-m.r)+'" y1="'+Y(v)+'" y2="'+Y(v)+'" class="grid"/><text x="'+(m.l-8)+'" y="'+(Y(v)+4)+'" class="ax" text-anchor="end">'+fmt(v)+'</text>';});
  (o.xticks||[0,xmax]).forEach(function(v){s+='<text x="'+X(v)+'" y="'+(H-m.b+18)+'" class="ax" text-anchor="middle">'+v+'</text>';});
  s+='<text x="'+(m.l+(W-m.l-m.r)/2)+'" y="'+(H-4)+'" class="ax" text-anchor="middle">'+o.xlabel+'</text>';
  s+='<polyline class="ln naive" points="'+pts.map(function(p){return X(p[0])+','+Y(p[1]);}).join(' ')+'"/><polyline class="ln once" points="'+pts.map(function(p){return X(p[0])+','+Y(p[2]);}).join(' ')+'"/>';
  [[1,'naive'],[2,'once']].forEach(function(k){s+='<circle cx="'+X(xmax)+'" cy="'+Y(last[k[0]])+'" r="4" class="dot '+k[1]+'"/><text x="'+(X(xmax)+8)+'" y="'+(Y(last[k[0]])+4)+'" class="lab '+k[1]+'">'+fmt(last[k[0]])+'</text>';});
  host.innerHTML=s+'</svg>';
}

/* A row of letter cells drawn with the scene player's palette; `paint(kinds)` recolours it and survives theme changes. */
function strip(host,chars,onPick){
  host.innerHTML='';host.className=(host.className.replace(/\bbrd\b/g,'')+' brd').trim();
  var cs=Math.max(24,Math.min(44,Math.floor(((host.parentNode.clientWidth||360)-16)/chars.length)-3));
  host.style.gridTemplateColumns='repeat('+chars.length+','+cs+'px)';host.style.setProperty('--cs',cs+'px');host.style.setProperty('--fs',Math.round(cs*.42)+'px');
  var els=chars.map(function(c,i){var e=el(onPick?'button':'div','cell');if(onPick){e.type='button';e.setAttribute('aria-label','Position '+i+', '+c);e.addEventListener('click',function(){onPick(i);});}e.textContent=c;host.appendChild(e);return e;});
  var last=null;
  function paint(kinds){last=kinds;els.forEach(function(e,i){var st=styleOf({k:kinds[i]||'idle'});e.style.background=rgb(st.f);e.style.color=rgb(st.i);});}
  onRepaint(function(){if(last)paint(last);});
  paint(chars.map(function(){return 'idle';}));
  return {els:els,paint:paint};
}

/* A node-link view of a small graph, drawn with the scene player's palette and geometry.
   G = {nodes:[{x,d,l}], edges:[[from,to]], width, depth, directed}. `update(cells, edgeStates)` recolours it;
   edgeStates entries are 0 idle, 1 lit, 2 current. Nodes become buttons when `onPick` is given. */
function graphView(host,G,o){
  o=o||{};host.innerHTML='';host.className=(host.className.replace(/\btree\b/g,'')+' brd tree').trim();
  var W=Math.max(220,(host.parentNode.clientWidth||360)-8),nx=Math.max(1,G.width),dx=Math.min(62,(W-40)/Math.max(1,nx-1)),d=Math.min(36,Math.max(24,dx*.7));
  var rowsN=G.depth+1,dy=rowsN>4?46:(rowsN>3?52:58),width=(nx-1)*dx+d+8,height=(rowsN-1)*dy+d+8,ox=d/2+4,oy=d/2+4;
  host.style.width=width+'px';host.style.height=height+'px';
  var svg=document.createElementNS(svgNS,'svg');svg.setAttribute('class','edges');svg.setAttribute('width',width);svg.setAttribute('height',height);host.appendChild(svg);
  var marker='';
  if(G.directed){var mid='gv'+Math.floor(Math.random()*1e9);svg.insertAdjacentHTML('afterbegin','<defs><marker id="'+mid+'" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="context-stroke"/></marker></defs>');marker='url(#'+mid+')';}
  var lines=G.edges.map(function(e){
    var a=G.nodes[e[0]],c=G.nodes[e[1]],ln=document.createElementNS(svgNS,'line'),x1=ox+a.x*dx,y1=oy+a.d*dy,x2=ox+c.x*dx,y2=oy+c.d*dy;
    if(G.directed){var len=Math.hypot(x2-x1,y2-y1)||1,back=d/2+3;x2-=(x2-x1)/len*back;y2-=(y2-y1)/len*back;ln.setAttribute('marker-end',marker);}
    ln.setAttribute('x1',x1);ln.setAttribute('y1',y1);ln.setAttribute('x2',x2);ln.setAttribute('y2',y2);svg.appendChild(ln);return ln;});
  var els=G.nodes.map(function(nd,i){
    var c=el(o.onPick?'button':'div','cell node');c.style.width=d+'px';c.style.height=d+'px';c.style.left=(ox+nd.x*dx-d/2)+'px';c.style.top=(oy+nd.d*dy-d/2)+'px';c.style.fontSize=Math.max(11,Math.round(d*.36))+'px';
    if(o.onPick){c.type='button';c.setAttribute('aria-label','Course '+nd.l);c.addEventListener('click',function(){o.onPick(i);});}
    host.appendChild(c);return c;});
  var lastC=null,lastE=null;
  function update(cells,edges){
    lastC=cells;lastE=edges;
    els.forEach(function(c,i){var s=styleOf(cells[i]);c.style.background=rgb(s.f);c.style.color=rgb(s.i);c.textContent=cells[i].t;});
    lines.forEach(function(ln,i){var v=edges?edges[i]:0;ln.style.stroke=rgb(EDGE[v===2?'cur':(v===1?'path':'idle')]);ln.style.strokeWidth=v?4:2;});
  }
  var api={update:update,els:els};
  onRepaint(function(){if(lastC)update(lastC,lastE);});
  return api;
}
