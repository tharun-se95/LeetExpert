/* ================= Diameter of Binary Tree: the lesson ================= */
function fromLevels(a){
  if(!a.length||a[0]==null)return null;
  var nodes=a.map(function(v){return v==null?null:{v:v,l:null,r:null};}),q=[nodes[0]],i=1;
  while(q.length&&i<a.length){var n=q.shift();
    if(i<a.length){var l=nodes[i++];if(l){n.l=l;q.push(l);}}
    if(i<a.length){var r=nodes[i++];if(r){n.r=r;q.push(r);}}}
  return nodes[0];
}
function adjacency(T){var adj=T.nodes.map(function(){return [];});T.edges.forEach(function(e){adj[e[0]].push(e[1]);adj[e[1]].push(e[0]);});return adj;}
/* the reference: BFS from every node, keep the farthest pair. Independent of the recursion the lesson teaches. */
function longestPath(T){
  var adj=adjacency(T),best={len:0,a:0,b:0,prev:{0:-1}};
  for(var s=0;s<T.nodes.length;s++){
    var dist={},prev={};dist[s]=0;prev[s]=-1;var q=[s];
    while(q.length){var u=q.shift();adj[u].forEach(function(v){if(dist[v]===undefined){dist[v]=dist[u]+1;prev[v]=u;q.push(v);}});}
    for(var k in dist)if(dist[k]>best.len)best={len:dist[k],a:s,b:+k,prev:prev};
  }
  var path=[];for(var c=best.b;c!==-1;c=best.prev[c])path.push(c);
  return {len:best.len,path:path.reverse()};
}
function pathBetween(T,a,b){
  var adj=adjacency(T),prev={},q=[a];prev[a]=-1;
  while(q.length){var u=q.shift();adj[u].forEach(function(v){if(prev[v]===undefined){prev[v]=u;q.push(v);}});}
  var p=[];for(var c=b;c!==-1;c=prev[c])p.push(c);return p.reverse();
}
function pathEdges(T,path){var st=zeros(T.edges.length);for(var i=0;i+1<path.length;i++){var e=edgeIndex(T,path[i],path[i+1]);if(e<0)e=edgeIndex(T,path[i+1],path[i]);st[e]=1;}return st;}

/* the lesson's three solutions, as running code */
function heightOf(n){return n?1+Math.max(heightOf(n.l),heightOf(n.r)):0;}
function diameterSolution(root){var best=0;function height(n){if(!n)return 0;var l=height(n.l),r=height(n.r);best=Math.max(best,l+r);return 1+Math.max(l,r);}height(root);return best;}
function diameterNaive(n){if(!n)return 0;return Math.max(heightOf(n.l)+heightOf(n.r),diameterNaive(n.l),diameterNaive(n.r));}
function diameterMistake(root){var best=0;function f(n){if(!n)return 0;var l=f(n.l),r=f(n.r);best=Math.max(best,l+r);return l+r;}f(root);return best;}
function countCalls(root){var c=0;function height(n){c++;if(!n)return 0;var l=height(n.l),r=height(n.r);return 1+Math.max(l,r);}height(root);return c;}
function naiveWork(root){var c=0;function h(n){if(!n)return 0;c++;return 1+Math.max(h(n.l),h(n.r));}function d(n){if(!n)return 0;c++;var t=h(n.l)+h(n.r);return Math.max(t,d(n.l),d(n.r));}d(root);return c;}
function onceWork(root){var c=0;function h(n){if(!n)return 0;c++;var l=h(n.l),r=h(n.r);return 1+Math.max(l,r);}h(root);return c;}
function chain(n){var r=null;for(var i=n;i>=1;i--)r={v:i,l:r,r:null};return r;}

/* the lesson's own cases (expected values from the lesson), plus one added here that bends below the root */
var CASES=[
  {a:[1,2,3,4,5],expect:3},{a:[1,2],expect:1},{a:[1],expect:0},{a:[1,2,null,3,null,4,null,5],expect:4},
  {a:[1,2,3,4,null,null,5,6,null,null,7],expect:6},{a:[1,2,3,4,5,null,null,6,7],expect:4}
];
var BEND={a:[1,2,null,3,4,5,null,null,6],expect:4};
CASES.concat([BEND]).forEach(function(c){
  var root=fromLevels(c.a),T=layout(root),ref=longestPath(T).len;
  if(ref!==c.expect||diameterSolution(root)!==c.expect||diameterNaive(root)!==c.expect)throw new Error('diameter cases disagree for '+JSON.stringify(c.a));
});

/* ---------- static / interactive tree drawing ---------- */
function paintTree(host,T,opts){
  opts=opts||{};host.innerHTML='';host.className=(host.className.replace(/\btree\b/g,'')+' brd tree').trim();
  var W=Math.max(220,(host.parentNode.clientWidth||360)-8),nx=Math.max(1,T.width),dx=Math.min(62,(W-40)/Math.max(1,nx-1)),d=Math.min(36,Math.max(24,dx*.7));
  var rowsN=T.depth+1,dy=rowsN>4?46:(rowsN>3?52:58),width=(nx-1)*dx+d+8,height=(rowsN-1)*dy+d+8,ox=d/2+4,oy=d/2+4;
  host.style.width=width+'px';host.style.height=height+'px';
  var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','edges');svg.setAttribute('width',width);svg.setAttribute('height',height);host.appendChild(svg);
  var lines=T.edges.map(function(e){var a=T.nodes[e[0]],c=T.nodes[e[1]],ln=document.createElementNS('http://www.w3.org/2000/svg','line');
    ln.setAttribute('x1',ox+a.x*dx);ln.setAttribute('y1',oy+a.d*dy);ln.setAttribute('x2',ox+c.x*dx);ln.setAttribute('y2',oy+c.d*dy);svg.appendChild(ln);return ln;});
  var els=T.nodes.map(function(nd){
    var c=el(opts.onPick?'button':'div','cell node');c.style.width=d+'px';c.style.height=d+'px';c.style.left=(ox+nd.x*dx-d/2)+'px';c.style.top=(oy+nd.d*dy-d/2)+'px';c.style.fontSize=Math.max(11,Math.round(d*.36))+'px';
    if(opts.onPick){c.type='button';c.setAttribute('aria-label','Node '+nd.v);c.addEventListener('click',function(){opts.onPick(nd.id);});}
    host.appendChild(c);return c;});
  var lastCells=null,lastEdges=null;
  function update(cells,edges){
    lastCells=cells;lastEdges=edges;
    els.forEach(function(c,i){var s=styleOf(cells[i]);c.style.background=rgb(s.f);c.style.color=rgb(s.i);c.textContent=cells[i].t;});
    lines.forEach(function(ln,i){var on=edges&&edges[i];ln.style.stroke=rgb(on?EDGE.path:EDGE.idle);ln.style.strokeWidth=on?4:2;});
  }
  var api={update:update,els:els,repaint:function(){if(lastCells)update(lastCells,lastEdges);}};onRepaint(api.repaint);return api;
}
function plainCells(T,path,mark){return T.nodes.map(function(n){var k='idle';if(path&&path.indexOf(n.id)>=0)k='acc';if(mark&&mark.indexOf(n.id)>=0)k='cur';return {k:k,t:String(n.v)};});}

/* ---------- 1. explore: pick two nodes ---------- */
function mountExplore(host){
  var T=layout(fromLevels([1,2,3,4,5])),sel=[],out=host.querySelector('.readout'),tv=host.querySelector('.tv');
  var pt=paintTree(tv,T,{onPick:pick});
  function show(path,msg){pt.update(plainCells(T,path,sel),path?pathEdges(T,path):null);out.innerHTML=msg;}
  function pick(id){if(sel.length===2)sel=[];sel.push(id);
    if(sel.length===1){show(null,'Now pick a second node.');}
    else if(sel[0]===sel[1]){sel=[sel[0]];show(null,'Pick a different node for the second end.');}
    else{var p=pathBetween(T,sel[0],sel[1]);show(p,'Path '+p.map(function(i){return T.nodes[i].v;}).join(' → ')+' has <b>'+(p.length-1)+'</b> edges.'+(p.length-1===3?' That is as long as any path in this tree gets.':''));}}
  host.querySelector('.clear').addEventListener('click',function(){sel=[];show(null,'Pick any two nodes to measure the path between them.');});
  host.querySelector('.best').addEventListener('click',function(){var lp=longestPath(T);sel=[];show(lp.path,'A longest path: '+lp.path.map(function(i){return T.nodes[i].v;}).join(' → ')+', <b>'+lp.len+'</b> edges. The diameter is '+lp.len+'.');});
  show(null,'Pick any two nodes to measure the path between them.');
  return pt;
}

/* ---------- 2. predict before revealing ---------- */
function mountDiameterPredict(host,cases){
  cases.forEach(function(c,ci){
    var root=fromLevels(c.a),T=layout(root),lp=longestPath(T),rootThrough=(T.nodes[0].l>=0?heightOf(root.l):0)+(T.nodes[0].r>=0?heightOf(root.r):0);
    var opts={};opts[lp.len]='answer';if(T.depth!==lp.len)opts[T.depth]=opts[T.depth]||'depth';if(rootThrough!==lp.len&&!opts[rootThrough])opts[rootThrough]='root';if(!opts[lp.len+1])opts[lp.len+1]='nodes';
    var vals=Object.keys(opts).map(Number).sort(function(a,b){return a-b;});
    var card=el('div','pcard'),tv=el('div','tv-wrap');card.appendChild(el('div','pq','Case '+(ci+1)+': the tree is <code>'+JSON.stringify(c.a).replace(/null/g,'null')+'</code>. What is its diameter, the worst-case number of hops?'));
    var box=el('div','tv');tv.appendChild(box);card.appendChild(tv);
    var row=el('div','choices'),fb=el('div','fb');card.appendChild(row);card.appendChild(fb);host.appendChild(card);
    var pt=paintTree(box,T,{});pt.update(plainCells(T),null);
    vals.forEach(function(v){
      var b=el('button','choice',String(v));b.type='button';row.appendChild(b);
      b.addEventListener('click',function(){
        var right=v===lp.len;
        row.querySelectorAll('.choice').forEach(function(x){x.disabled=true;x.classList.toggle('good',+x.textContent===lp.len);x.classList.toggle('bad',x===b&&!right);});
        var through=lp.path.indexOf(0)>=0,why;
        if(right)why='Yes, '+lp.len+'.';
        else if(opts[v]==='depth')why='That is the tree\'s depth: the longest path <em>down from the root</em>. A longest path does not have to start there.';
        else if(opts[v]==='root')why='That is the longest path <em>through the root</em>. Here a longer path bends lower down.';
        else why='That counts the nodes on the path. The diameter counts <em>edges</em>, one fewer.';
        pt.update(plainCells(T,lp.path),pathEdges(T,lp.path));
        fb.innerHTML=why+' The longest path is '+lp.path.map(function(i){return T.nodes[i].v;}).join(' → ')+' ('+lp.len+' edges), and it '+(through?'passes through':'<b>skips</b>')+' the root.';
        fb.classList.add('on');
      });
    });
  });
}

/* ---------- 3. what the naive version costs ---------- */
function mountCost(host){
  var pts=[];for(var n=2;n<=64;n+=2){var r=chain(n),nv=naiveWork(r),one=onceWork(r);
    if(nv!==n*(n+1)/2||one!==n)throw new Error('cost formula check failed at n='+n);
    if(diameterNaive(r)!==diameterSolution(r))throw new Error('naive and one-pass disagree');pts.push([n,nv,one]);}
  var last=pts[pts.length-1];
  costChart(host,{names:['naive: diameter with a separate height call','one pass'],ylabel:'node visits',pts:pts,xmax:64,xticks:[0,16,32,48,64],xlabel:'nodes in a skewed tree',aria:'Work done as a skewed tree grows: the naive version grows with n squared, the one-pass version with n.'});
  var big=10000*10001/2;
  host.parentNode.querySelector('.cost-note').innerHTML='On a skewed tree of 64 nodes the naive version does <b>'+fmt(last[1])+'</b> node visits and the one-pass version <b>64</b>. The naive count is exactly n(n + 1) / 2, checked for every size plotted. At the constraint\'s n = 10⁴ that is <b>'+fmt(big)+'</b> visits, against 10,000.';
}

/* ---------- 4. the one-pass walk, frame by frame ---------- */
function diameterFrames(a){
  var root=fromLevels(a),T=layout(root),n=T.nodes.length,post=[];
  (function w(id){var x=T.nodes[id];if(x.l>=0)w(x.l);if(x.r>=0)w(x.r);post.push(id);})(0);
  var h={},seen=[],best=0,bestPath=[],frames=[];
  function chainDown(id){var c=[id];for(;;){var x=T.nodes[c[c.length-1]],l=x.l>=0?h[x.l]:0,r=x.r>=0?h[x.r]:0;if(!l&&!r)break;c.push(l>=r?x.l:x.r);}return c;}
  function cells(cur,path){return treeCells(T,function(x){var d=seen.indexOf(x.id)>=0;return {k:x.id===cur?'cur':(path.indexOf(x.id)>=0?'acc':(d?'done':'idle')),t:(d||x.id===cur)?String(h[x.id]):String(x.v)};});}
  frames.push({b:{t:cells(-1,[])},e:{t:zeros(T.edges.length)},note:'Every call returns a height. Each node shows its value until its call finishes, then the height it returned. Alongside, a single number, best, remembers the longest bending path seen so far.',stats:[['nodes',n],['best',0]]});
  post.forEach(function(id){
    var x=T.nodes[id],lh=x.l>=0?h[x.l]:0,rh=x.r>=0?h[x.r]:0,hh=1+Math.max(lh,rh),through=lh+rh,upd=through>best,path=[],ed=zeros(T.edges.length);
    h[id]=hh;
    if(upd){best=through;var L=x.l>=0?chainDown(x.l):[],R=x.r>=0?chainDown(x.r):[];bestPath=L.slice().reverse().concat([id],R);ed=pathEdges(T,bestPath);path=bestPath;}
    seen.push(id);
    frames.push({b:{t:cells(id,upd?path:[])},e:{t:ed},
      note:(x.l<0&&x.r<0?'Node '+x.v+' is a leaf: both arms are 0, so a path bending here has 0 + 0 = 0 edges, and it returns height 1.':
        'Node '+x.v+': left arm '+lh+', right arm '+rh+'. A path bending here has '+lh+' + '+rh+' = '+through+' edges. It returns height 1 + max('+lh+', '+rh+') = '+hh+' to its parent.')+
        (upd?' That beats best, so best becomes '+best+'.':' best stays '+best+'.'),
      stats:[['bends here',through],['returns',hh],['best',best]],ev:upd?'key':null});
  });
  var ref=longestPath(T);if(ref.len!==best)throw new Error('one-pass and reference disagree');
  frames.push({b:{t:cells(-1,bestPath)},e:{t:pathEdges(T,bestPath)},note:'Done: best = '+best+', the diameter. The highlighted path is a longest one'+(bestPath.indexOf(0)>=0?', and it passes through the root.':', and it <b>skips the root</b>: it bends at node '+T.nodes[bestPath.reduce(function(m,i){return T.nodes[i].d<T.nodes[m].d?i:m;},bestPath[0])].v+'.'),stats:[['diameter',best]],ev:'key'});
  return {frames:frames,step:1.1,poster:frames.length-1,boards:[treeBoard('t',T,'the tree, after each call returns',0)],label:'One postorder pass returning heights while best collects the diameter.'};
}
var EXAMPLES=[{name:'The lesson\'s first example',a:[1,2,3,4,5]},{name:'A bend below the root',a:BEND.a},{name:'A deeper tree',a:CASES[4].a}];
function mountWalk(host){mountStepper(host,EXAMPLES,function(i){return diameterFrames(EXAMPLES[i].a);},'walk');}
/* ---------- the numbers lesson.md quotes as {{name}}: computed here, never typed ---------- */
var FACTS=(function(){
  var calls=countCalls(fromLevels([1,2,3,4,5]));
  if(calls!==2*5+1)throw new Error('call count check failed');
  var res=CASES.concat([BEND]).map(function(c){return diameterMistake(fromLevels(c.a));});
  var wrongAll=res.every(function(v){return v===0;});
  return {calls:calls,balancedFrames:Math.ceil(Math.log2(10001)),
    mistakeAnswers:wrongAll?'0 on all '+res.length+' trees tested here':res.join(', ')};
})();
/* ---------- assemble ---------- */
(function(){
  readPal();
  var $=function(s){return document.querySelector(s);};
  mountExplore($('#explore'));
  mountDiameterPredict($('#predict'),[CASES[0],BEND,CASES[4]]);
  mountLesson();
  mountCost($('#cost'));
  mountWalk($('#stepper'));
})();

/* ================= systems layer: network hero, animated banners ================= */
(function(){
  var NETH=B('core',B('a',B('a1',B('a11',B('a111'))),B('a2',B('a21',B('a211')))),B('b'));
  function heroNet(){
    var svg=$('#heroNet');if(!svg)return;
    var T=layout(NETH),idOf={};T.nodes.forEach(function(n){idOf[n.v]=n.id;});
    var W=560,sx=(W-80)/(T.width-1),P=T.nodes.map(function(n){return [40+n.x*sx,44+n.d*52];});
    T.edges.forEach(function(e){S('line',{x1:P[e[0]][0],y1:P[e[0]][1],x2:P[e[1]][0],y2:P[e[1]][1],class:'hn-edge'},svg);});
    var through=pathBetween(T,idOf.a111,idOf.b),best=pathBetween(T,idOf.a111,idOf.a211);
    var trail=S('polyline',{class:'hn-trail',points:''},svg);
    var nodes=T.nodes.map(function(n,i){var g=S('g',{},svg);S('circle',{cx:P[i][0],cy:P[i][1],r:13,class:'hn-node'+(n.v==='core'?' core':'')},g);return g.firstChild;});
    var lab=S('text',{x:P[0][0],y:P[0][1]-22,class:'hn-lab','text-anchor':'middle'},svg);lab.textContent='core switch';
    var pk=S('circle',{r:7,class:'hn-pk',cx:P[best[0]][0],cy:P[best[0]][1]},svg);
    var ro=$('#heroRead'),num=$('#heroNum'),cap=$('#heroCap');
    function place(path,t){
      var pts=path.map(function(i){return P[i];}),segs=pts.length-1,f=Math.min(segs*.9999,t*segs),k=Math.floor(f),u=f-k;
      var x=pts[k][0]+(pts[k+1][0]-pts[k][0])*u,y=pts[k][1]+(pts[k+1][1]-pts[k][1])*u;
      pk.setAttribute('cx',x);pk.setAttribute('cy',y);
      trail.setAttribute('points',pts.slice(0,k+1).map(function(p){return p.join(',');}).join(' ')+' '+x+','+y);
      nodes.forEach(function(c,i){var at=path.indexOf(i);c.setAttribute('r',13+(at>=0&&at<=k+.5&&f-at<1.2?4*(1-Math.min(1,f-at)):0));c.classList.toggle('on',at>=0&&at<=f+.02);});
      return Math.min(segs,Math.floor(f+.02));
    }
    function show(phase,hops){
      cap.innerHTML=phase===0?'A route through the <b>core</b>':'A route that <b>bends at a</b> and never touches the core';
      num.textContent=hops;document.getElementById('heroUnit').textContent=hops===1?'hop':'hops';ro.dataset.phase=phase;
    }
    function still(){place(best,1);show(1,best.length-1);}
    var reduceM=window.matchMedia&&matchMedia('(prefers-color-scheme: light)')&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduceM||!M||!M.animate){still();return;}
    var lastPhase=-1;
    M.animate(0,2,{duration:11,ease:'linear',repeat:Infinity,onUpdate:function(v){
      var phase=Math.floor(v)%2,t=v-Math.floor(v),path=phase===0?through:best,tt=Math.min(1,t/.8);
      var hops=place(path,ease(tt));
      if(phase!==lastPhase){lastPhase=phase;nodes.forEach(function(c){c.classList.remove('on');});}
      show(phase,t<.8?hops:path.length-1);
    }});
  }

  var banners={
    problem:function(svg){
      var P=[[70,92],[160,64],[250,38],[340,64],[430,92]],line=S('polyline',{points:P.map(function(p){return p.join(',');}).join(' '),class:'bn-path'},svg);
      P.forEach(function(p,i){S('circle',{cx:p[0],cy:p[1],r:i===0||i===4?11:8,class:i===0||i===4?'bn-end':'bn-mid'},svg);});
      var pk=S('circle',{r:6,class:'hn-pk',cx:P[0][0],cy:P[0][1]},svg),t=S('text',{x:560,y:64,class:'bn-big','text-anchor':'middle'},svg);t.textContent='4 hops';
      S('text',{x:70,y:114,class:'bn-t','text-anchor':'middle'},svg).textContent='server';S('text',{x:430,y:114,class:'bn-t','text-anchor':'middle'},svg).textContent='server';S('text',{x:250,y:16,class:'bn-t','text-anchor':'middle'},svg).textContent='where the two branches meet';
      return function(){M.animate(0,1,{duration:3.4,ease:'linear',repeat:Infinity,onUpdate:function(v){var f=v*4,k=Math.min(3,Math.floor(f)),u=f-k;pk.setAttribute('cx',P[k][0]+(P[k+1][0]-P[k][0])*u);pk.setAttribute('cy',P[k][1]+(P[k+1][1]-P[k][1])*u);}});};
    },
    attempt:function(svg){
      var a=[[70,20],[130,90],[190,20]],b=[[420,10],[420,100]];
      var pa=S('polyline',{points:'70,20 130,90 190,20',class:'bn-path',fill:'none'},svg);
      S('polyline',{points:'70,20 130,90 190,20',class:'bn-path',fill:'none','stroke-dasharray':'0'},svg);
      S('text',{x:130,y:112,class:'bn-t','text-anchor':'middle'},svg).textContent='bends here: left + right';
      var pb=S('line',{x1:420,y1:10,x2:420,y2:92,class:'bn-path b2'},svg);
      S('text',{x:420,y:112,class:'bn-t','text-anchor':'middle'},svg).textContent='straight down: 1 + max(left, right)';
      S('text',{x:300,y:60,class:'bn-big','text-anchor':'middle'},svg).textContent='≠';
      return function(){[pa,pb].forEach(function(p,i){var L=p.getTotalLength?p.getTotalLength():200;p.style.strokeDasharray=L;M.animate(L,0,{duration:1.4,delay:i*.5,ease:'easeOut',onUpdate:function(v){p.style.strokeDashoffset=v;}});});};
    },
    trap:function(svg){
      var n=8,rows=[];
      for(var i=0;i<n;i++){S('circle',{cx:40,cy:12+i*14,r:5,class:'bn-mid'},svg);var bar=S('rect',{x:60,y:8+i*14,width:0,height:8,rx:2,class:'bn-bar'},svg);rows.push(bar);}
      S('text',{x:380,y:30,class:'bn-t'},svg).textContent='naive: every switch re-walks everything below it';
      var c1=S('text',{x:380,y:64,class:'bn-big red'},svg);c1.textContent='0';
      S('text',{x:380,y:96,class:'bn-t'},svg).textContent='one pass: each switch is visited once, 8';
      return function(){var total=0;rows.forEach(function(r,i){var len=(n-i)*22;M.animate(0,len,{duration:.35,delay:i*.28,ease:'easeOut',onUpdate:function(v){r.setAttribute('width',v);}});M.animate(0,n-i,{duration:.35,delay:i*.28,onUpdate:function(v){}});});
        var cur=0;M.animate(0,36,{duration:8*.28+.3,ease:'linear',onUpdate:function(v){c1.textContent=count(Math.round(v),'visit','visits');}});};
    },
    insight:function(svg){
      var P=[[300,14],[190,58],[410,58],[130,104],[250,104],[350,104],[470,104]];
      [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]].forEach(function(e){S('line',{x1:P[e[0]][0],y1:P[e[0]][1],x2:P[e[1]][0],y2:P[e[1]][1],class:'bn-edge'},svg);});
      P.forEach(function(p){S('circle',{cx:p[0],cy:p[1],r:9,class:'bn-mid'},svg);});
      var chips=[3,4,5,6].map(function(i){var g=S('g',{},svg);S('circle',{r:7,cx:P[i][0],cy:P[i][1],class:'hn-pk'},g);return g.firstChild;});
      var lab=S('text',{x:600,y:60,class:'bn-big','text-anchor':'middle'},svg);lab.textContent='';
      S('text',{x:600,y:88,class:'bn-t','text-anchor':'middle'},svg).textContent='heights flow up';
      return function(){var par=[1,1,2,2];chips.forEach(function(c,k){var from=P[[3,4,5,6][k]],to=P[par[k]];M.animate(0,1,{duration:1.2,delay:k*.35,ease:'easeInOut',repeat:Infinity,repeatDelay:1.6,onUpdate:function(v){c.setAttribute('cx',from[0]+(to[0]-from[0])*v);c.setAttribute('cy',from[1]+(to[1]-from[1])*v);c.setAttribute('opacity',v>.98?0:1);}});});};
    },
    solution:function(svg){
      S('rect',{x:60,y:52,width:520,height:14,rx:7,class:'bn-track'},svg);var fill=S('rect',{x:60,y:52,width:0,height:14,rx:7,class:'bn-bar'},svg);
      for(var i=0;i<=6;i++){S('line',{x1:60+i*520/6,x2:60+i*520/6,y1:70,y2:78,class:'bn-edge'},svg);S('text',{x:60+i*520/6,y:94,class:'bn-t','text-anchor':'middle'},svg).textContent=i;}
      var big=S('text',{x:60,y:36,class:'bn-big'},svg);big.textContent='record: 0 hops';
      return function(){M.animate(0,6,{duration:3.2,ease:'easeOut',onUpdate:function(v){fill.setAttribute('width',520*v/6);big.textContent='record: '+count(Math.round(v),'hop','hops');}});};
    }
  };
  heroNet();mountBanners(banners);kinetic();riseIn();
})();
