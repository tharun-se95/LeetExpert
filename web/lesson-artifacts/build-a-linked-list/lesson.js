/* Build a Linked List From Scratch. The list below is real nodes and pointers; every
   operation records a snapshot after each pointer write, and every view on the page
   draws a snapshot. Nothing is drawn from a script of what should happen. */

/* ---------- the list, recorded ---------- */
var uid=0;
function mkNode(v,next){return {id:++uid,value:v,next:next||null};}
function List(){this.head=null;this.tail=null;this.size=0;}
function idOf(n){return n?n.id:null;}
function nm(py,ts){return '<span class="c-py">'+py+'</span><span class="c-ts">'+ts+'</span>';}
var OPN={push_front:nm('push_front','pushFront'),push_back:nm('push_back','pushBack'),delete:'delete',find:'find'};

function snap(L,note,o){
  o=o||{};
  var roots=[L.head,L.tail,o.prev,o.curr,o.node].filter(Boolean),seen={},nodes=[];
  roots.forEach(function(r){for(var c=r,g=0;c&&!seen[c.id]&&g<64;c=c.next,g++){seen[c.id]=1;nodes.push({id:c.id,value:c.value,next:idOf(c.next)});}});
  var chain=[],c=L.head,g=0;for(;c&&g<64;c=c.next,g++){chain.push(c.id);c.idx=g;}
  nodes.forEach(function(n){var real=findReal(L,o,n.id);if(real&&real.idx!==undefined)n.idx=real.idx;});
  return {note:note,head:idOf(L.head),tail:idOf(L.tail),size:L.size,nodes:nodes,chain:chain,cyclic:!!c,
    tags:{prev:idOf(o.prev),curr:idOf(o.curr),node:idOf(o.node)},hi:o.hi||[],done:!!o.done};
}
/* the real node behind a snapshot entry, so a node that left the chain keeps the slot it last held */
function findReal(L,o,id){var roots=[L.head,L.tail,o.prev,o.curr,o.node].filter(Boolean),seen={};
  for(var r=0;r<roots.length;r++)for(var c=roots[r],g=0;c&&!seen[c.id]&&g<64;c=c.next,g++){if(c.id===id)return c;seen[c.id]=1;}return null;}
function reaches(L,n){for(var c=L.head,g=0;c&&g<64;c=c.next,g++)if(c===n)return true;return false;}

function opPushFront(L,v,rec){
  var node=mkNode(v,L.head);
  rec('Make a node holding '+v+'. Its <code>next</code> is the current head'+(L.head?', '+L.head.value:', which is null')+'.',{node:node,hi:['next:'+node.id]});
  L.head=node;rec('<code>head</code> now points at the new node.',{node:node,hi:['head']});
  if(L.tail===null){L.tail=node;rec('The list was empty, so the new node is the <code>tail</code> as well.',{node:node,hi:['tail']});}
  L.size++;rec('<code>size</code> becomes '+L.size+'. Done: a fixed number of writes, whatever the length, so O(1).',{hi:['size'],done:true});
}
function opPushBack(L,v,rec){
  var node=mkNode(v,null);
  rec('Make a node holding '+v+'. Its <code>next</code> is null: it will be the last node.',{node:node});
  if(L.tail===null){L.head=L.tail=node;rec('The list was empty, so there is no old tail to link onto: <code>head</code> and <code>tail</code> both point at the new node.',{node:node,hi:['head','tail']});}
  else{
    var old=L.tail;old.next=node;
    rec(reaches(L,old)?'The old tail, '+old.value+', links on: <code>tail.next = node</code>.':'<code>tail</code> still names '+old.value+', the node that was deleted. The new node is linked onto it, where nothing reachable from <code>head</code> leads.',{node:node,hi:['next:'+old.id]});
    L.tail=node;rec('<code>tail</code> moves to the new node. No walk was needed.',{node:node,hi:['tail']});
  }
  L.size++;rec('<code>size</code> becomes '+L.size+'.'+(reaches(L,node)?' Done, in O(1).':' But '+v+' cannot be reached from <code>head</code>: the value is lost, and size counts a node the list does not have.'),{hi:['size'],done:true});
}
function opDelete(L,v,rec,leaky){
  var prev=null,curr=L.head;
  rec('Start the pair: <code>prev</code> is null and <code>curr</code> is the head'+(curr?', '+curr.value:', which is null: the list is empty')+'.',{prev:prev,curr:curr});
  while(curr!==null){
    if(curr.value===v){
      if(prev===null){L.head=curr.next;rec(curr.value+' is the value, and <code>prev</code> is null, so this is the head. <code>head = curr.next</code>.',{curr:curr,hi:['head']});}
      else{prev.next=curr.next;rec(curr.value+' is the value. Splice it out: <code>prev.next = curr.next</code>, so '+prev.value+' now leads to '+(curr.next?curr.next.value:'null')+'.',{prev:prev,curr:curr,hi:['next:'+prev.id]});}
      if(curr===L.tail){
        if(!leaky){L.tail=prev;rec('<code>curr</code> was the tail, so the tail moves back: <code>tail = prev</code>'+(prev?', '+prev.value:', null, since the list is now empty')+'.',{prev:prev,curr:curr,hi:['tail']});}
        else rec('<code>curr</code> was the tail, but this version never moves <code>tail</code>. It still names '+curr.value+', which is no longer in the list.',{prev:prev,curr:curr,hi:['tail']});
      }
      L.size--;rec('<code>size</code> becomes '+L.size+'. Nothing reachable from <code>head</code> leads to '+v+' now, so it is garbage.',{curr:curr,hi:['size'],done:true});
      return true;
    }
    prev=curr;curr=curr.next;
    rec(prev.value+' is not '+v+'. Move both on: <code>prev = curr</code>, <code>curr = curr.next</code>'+(curr?', '+curr.value:', null')+'.',{prev:prev,curr:curr});
  }
  rec('<code>curr</code> ran off the end without finding '+v+'. Return false; the list is unchanged.',{prev:prev,done:true});
  return false;
}
function opFind(L,v,rec){
  var curr=L.head;
  rec('Start at the head'+(curr?', '+curr.value:'')+'. A walk can only ever start here.',{curr:curr});
  while(curr!==null){
    if(curr.value===v){rec('Found '+v+'. Return this node. It took as many steps as its position in the list.',{curr:curr,done:true});return curr;}
    curr=curr.next;rec('Not '+v+'. <code>curr = curr.next</code>'+(curr?', '+curr.value:', null')+'.',{curr:curr});
  }
  rec(v+' is not in the list. Return null.',{done:true});return null;
}
function run(L,op,v,leaky){var steps=[],rec=function(n,o){steps.push(snap(L,n,o));};
  ({push_front:opPushFront,push_back:opPushBack,delete:opDelete,find:opFind})[op](L,v,rec,leaky);return steps;}
function quiet(L,op,v){({push_front:opPushFront,push_back:opPushBack,delete:opDelete,find:opFind})[op](L,v,function(){});}
function listOf(vals){var L=new List();vals.forEach(function(v){quiet(L,'push_back',v);});return L;}
function toArr(L){var o=[];for(var c=L.head,g=0;c&&g<64;c=c.next,g++)o.push(c.value);return o;}

function invariants(s){
  var last=s.chain.length?s.chain[s.chain.length-1]:null;
  return [!s.cyclic,s.tail===last,s.size===s.chain.length];
}

/* Load-time check: random operations against a plain array, with the invariants after
   every one; and the trap's exact claim, that the leaky delete loses the append. */
(function selfCheck(){
  var seed=20260924,rnd=function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(var t=0;t<300;t++){
    var L=new List(),A=[];
    for(var k=0,n=1+Math.floor(rnd()*16);k<n;k++){
      var op=['push_front','push_back','delete','delete','find'][Math.floor(rnd()*5)],v=Math.floor(rnd()*6);
      var steps=run(L,op,v);
      if(op==='push_front')A.unshift(v);else if(op==='push_back')A.push(v);else if(op==='delete'){var i=A.indexOf(v);if(i>=0)A.splice(i,1);}
      var last=steps[steps.length-1],inv=invariants(last);
      if(toArr(L).join()!==A.join()||!inv[0]||!inv[1]||!inv[2]||!last.done)throw new Error('linked list check failed after '+op+'('+v+')');
    }
  }
  var B=listOf([7,3,12]);run(B,'delete',12,true);run(B,'push_back',5,true);
  if(toArr(B).join()!=='7,3'||B.size!==3)throw new Error('trap check failed: the leaky list should lose 5');
})();

/* ---------- the view ---------- */
var SLOT=118,BW=78,BH=46,ROWY=[84,190];
/* Deterministic, from the snapshot alone, so stepping forward and back draw the same
   frame: the chain in order on the top row; a node that left the chain drops below the
   slot it last held; a new node sits below where it will join. */
function layout(s){
  var pos={};
  s.chain.forEach(function(id,i){pos[id]={x:i,y:0};});
  var rest=s.nodes.filter(function(n){return !pos[n.id];});
  function freeX(){var x=s.chain.length;for(var k in pos)if(pos[k].y===1)x=Math.max(x,Math.ceil(pos[k].x+1));return x;}
  rest.filter(function(n){return n.idx!==undefined;}).forEach(function(n){pos[n.id]={x:n.idx,y:1};});
  for(var pass=0;pass<4;pass++)rest.forEach(function(n){
    if(pos[n.id])return;
    var from=s.nodes.filter(function(m){return m.next===n.id&&pos[m.id];})[0];
    if(from){pos[n.id]={x:pos[from.id].x+1,y:1};return;}
    if(n.next&&pos[n.next]&&pos[n.next].y===0){pos[n.id]={x:pos[n.next].x-.5,y:1};return;}
    if(pass===3||!n.next)pos[n.id]={x:freeX(),y:1};
  });
  return pos;
}
function span(pos){var lo=0,hi=2;for(var k in pos){lo=Math.min(lo,pos[k].x);hi=Math.max(hi,pos[k].x);}return [lo,hi];}

/* The list player: draws snapshots and moves between them softly. Nodes glide to their
   new slots, new nodes fade in and removed ones fade out, a pointer that changed draws
   itself in, and each name (head, tail, prev, curr) glides to the node it now names. */
var TWEEN=720,HOLD=2800;
var soft=function(p){return p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;};
/* time on a step: long enough to read its caption */
function dwell(s){var words=s.note.replace(/<[^>]+>/g,'').split(/\s+/).length;return Math.max(2200,Math.min(5200,1200+words*190));}
var INV=[['reaches every node','head reaches every node and the walk ends at null'],['tail is last','tail is the last of those nodes, null only when empty'],['size matches','size equals the number of nodes']];

function ListPlayer(host,o){
  o=o||{};var self=this;
  host.innerHTML='<div class="lp">'+
    '<div class="lp-stage"></div>'+
    '<div class="lp-meta"><span class="lp-fields"></span><span class="lp-inv" role="list" aria-label="Invariants"></span></div>'+
    '<p class="lp-note" aria-live="polite"></p>'+
    '<div class="lp-bar"><button type="button" class="lp-btn pv" aria-label="Previous step">'+icon('i-prev')+'</button>'+
    '<button type="button" class="lp-btn lp-main pp" aria-label="Play"></button>'+
    '<button type="button" class="lp-btn nx" aria-label="Next step">'+icon('i-next')+'</button>'+
    '<div class="lp-track" role="group" aria-label="Steps"></div><span class="lp-count"></span></div></div>';
  var stage=host.querySelector('.lp-stage'),fields=host.querySelector('.lp-fields'),inv=host.querySelector('.lp-inv'),note=host.querySelector('.lp-note'),
      track=host.querySelector('.lp-track'),count=host.querySelector('.lp-count'),pp=host.querySelector('.pp'),pv=host.querySelector('.pv'),nx=host.querySelector('.nx');
  var svg=S('svg',{role:'img'},stage),mid=(o.id||'lp')+'Arrow';
  svg.innerHTML='<defs><marker id="'+mid+'" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto"><path d="M1,1.5 L8.5,5 L1,8.5" fill="none" stroke="context-stroke" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><g class="lp-root"></g>';
  var root=svg.querySelector('.lp-root'),arrow='url(#'+mid+')';
  var steps=[],i=0,shown=null,shownPos={},timer=0,raf=0,playing=false,visible=!o.loop;
  this.onNode=null;

  /* One canvas size for the player's whole life (o.slots wide, both rows tall): the list is
     centred inside it and glides to its new centre, so nothing around the stage ever moves. */
  var VBW=(o.slots||6)*SLOT+40,VBH=262;
  svg.setAttribute('viewBox','0 0 '+VBW+' '+VBH);svg.style.minWidth=Math.round(VBW*.72)+'px';
  function geo(pos){var sp=span(pos),n=sp[1]-sp[0]+2,vbw=VBW;
    return {vbw:vbw,ox:-(40+sp[0]*SLOT+SLOT/2)+20+(vbw-(n*SLOT+40))/2,low:Object.keys(pos).some(function(k){return pos[k].y===1;})};}
  function at(g,p){return {x:g.ox+40+(p.x+1)*SLOT,y:ROWY[0]+(ROWY[1]-ROWY[0])*p.y};}
  function lerp(a,b,t){return a+(b-a)*t;}
  /* where each name sits in a snapshot: above its node for head/tail, below for the walk */
  function tagPlaces(s,pos,g){
    var out={},up={},down={};
    function put(list,name,id){var k=id===null?'nil':id;(list[k]=list[k]||[]).push(name);}
    put(up,'head',s.head);put(up,'tail',s.tail);
    ['prev','curr','node'].forEach(function(t){var id=s.tags[t];if(id!==null&&!(t==='node'&&id===s.tags.curr))put(down,t,id);});
    function anchor(k){return k==='nil'?at(g,{x:0,y:0}):(pos[k]?at(g,pos[k]):null);}
    Object.keys(up).forEach(function(k){var a=anchor(k);if(!a)return;var names=up[k];
      names.forEach(function(n,j){out[n]={x:a.x+(names.length>1?(j?22:-22):0),y:a.y-BH/2-12,nil:k==='nil',walk:false};});});
    Object.keys(down).forEach(function(k){var a=anchor(k);if(!a)return;var off=s.chain.indexOf(+k)<0?16:0;
      down[k].forEach(function(n,j){out[n]={x:a.x,y:a.y+BH/2+14+off+j*18,nil:false,walk:true};});});
    return out;
  }
  function draw(s,pos,t,fromS,fromPos){
    var g=geo(pos),fg=fromS?geo(fromPos):g,eg={vbw:lerp(fg.vbw,g.vbw,t),ox:lerp(fg.ox,g.ox,t)},low=g.low||(t<1&&fg.low);
    var P=function(id){var tp=pos[id],fp=fromPos&&fromPos[id];if(!tp)return null;var a=fp&&t<1?{x:lerp(fp.x,tp.x,t),y:lerp(fp.y,tp.y,t)}:tp;
      return {x:eg.ox+40+(a.x+1)*SLOT,y:ROWY[0]+(ROWY[1]-ROWY[0])*a.y};};
    var h=[],hi=s.hi,byFrom={};
    if(fromS)fromS.nodes.forEach(function(n){byFrom[n.id]=n;});
    function arrowPath(a,b){var x1=a.x+BW/2-13,y1=a.y,x2=b.x-BW/2-4,y2=b.y;
      if(Math.abs(y1-y2)<1&&x2>x1)return 'M'+x1+','+y1+' L'+x2+','+y2;
      var bend=Math.max(40,Math.abs(x2-x1)*.45);return 'M'+x1+','+y1+' C'+(x1+bend)+','+y1+' '+(x2-bend)+','+y2+' '+x2+','+y2;}
    /* outgoing: nodes and pointers that this step removed, fading where they were */
    if(fromS&&t<1){
      fromS.nodes.forEach(function(n){var here=s.nodes.some(function(m){return m.id===n.id;});var a=fromPos[n.id];if(!a)return;var A={x:fg.ox+40+(a.x+1)*SLOT,y:ROWY[0]+(ROWY[1]-ROWY[0])*a.y};
        if(!here)h.push(nodeSvg(n,A,false,1-t,''));
        var same=here&&s.nodes.filter(function(m){return m.id===n.id;})[0].next===n.next;
        if(n.next&&!same&&fromPos[n.next]){var B=fromPos[n.next];h.push('<path class="lp-arrow" style="opacity:'+(1-t)+'" d="'+arrowPath(A,{x:fg.ox+40+(B.x+1)*SLOT,y:ROWY[0]+(ROWY[1]-ROWY[0])*B.y})+'" marker-end="'+arrow+'"/>');}});
    }
    s.nodes.forEach(function(n){var a=P(n.id);if(!a||!n.next)return;var b=P(n.next);if(!b)return;
      var was=byFrom[n.id],fresh=fromS&&(!was||was.next!==n.next),reveal=fresh&&t<1?' pathLength="1" stroke-dasharray="1" stroke-dashoffset="'+(1-t).toFixed(3)+'"':'';
      h.push('<path class="lp-arrow'+(hi.indexOf('next:'+n.id)>=0?' hi':'')+'" d="'+arrowPath(a,b)+'"'+reveal+' marker-end="'+(fresh&&t<.85?'none':arrow)+'"/>');});
    s.nodes.forEach(function(n){var a=P(n.id);if(!a)return;var enter=fromS&&!byFrom[n.id]?t:1;
      h.push(nodeSvg(n,{x:a.x,y:a.y-(1-enter)*10},s.chain.indexOf(n.id)>=0,enter,hi.indexOf('next:'+n.id)>=0?' hi':''));});
    var to=tagPlaces(s,pos,g),from=fromS&&t<1?tagPlaces(fromS,fromPos,fg):null;
    var names={};Object.keys(to).forEach(function(k){names[k]=1;});if(from)Object.keys(from).forEach(function(k){names[k]=1;});
    Object.keys(names).forEach(function(name){var a=to[name],b=from&&from[name],op=1,p;
      if(a&&b)p={x:lerp(b.x,a.x,t),y:lerp(b.y,a.y,t),nil:a.nil,walk:a.walk};else if(a){p=a;op=from?t:1;}else{p=b;op=1-t;}
      var label=name+(p.nil?' = null':''),dy=p.walk?-11:0;
      h.push('<g class="lp-tag'+(p.walk?' walk':'')+(hi.indexOf(name)>=0?' hi':'')+'" style="opacity:'+op.toFixed(3)+'">'+
        (p.nil?'':'<line x1="'+p.x+'" x2="'+p.x+'" y1="'+(p.walk?p.y-15:p.y+3)+'" y2="'+(p.walk?p.y-6:p.y+10)+'"/>')+
        '<text x="'+p.x+'" y="'+(p.y+dy+(p.walk?14:0))+'" text-anchor="middle">'+label+'</text></g>');});
    root.innerHTML=h.join('');
  }
  function nodeSvg(n,a,inChain,op,extra){
    var x=a.x-BW/2,y=a.y-BH/2,btn=self.onNode&&inChain?' role="button" tabindex="0" aria-label="Delete '+n.value+'"':'';
    return '<g class="lp-node'+(inChain?'':' off')+extra+'" data-v="'+n.value+'"'+btn+' style="opacity:'+(inChain?op:op*.62).toFixed(3)+'">'+
      '<rect class="lp-box" x="'+x+'" y="'+y+'" width="'+BW+'" height="'+BH+'" rx="13"/>'+
      '<rect class="lp-port" x="'+(x+BW-27)+'" y="'+(y+5)+'" width="22" height="'+(BH-10)+'" rx="8"/>'+
      '<text class="lp-val" x="'+(x+(BW-26)/2+1)+'" y="'+(a.y+5.5)+'" text-anchor="middle">'+n.value+'</text>'+
      (n.next?'<circle class="lp-dot" cx="'+(x+BW-16)+'" cy="'+a.y+'" r="3"/>':'<text class="lp-nil" x="'+(x+BW-16)+'" y="'+(a.y+4)+'" text-anchor="middle">∅</text>')+'</g>';
  }
  function valueOf(s,id){for(var j=0;j<s.nodes.length;j++)if(s.nodes[j].id===id)return s.nodes[j].value;return '?';}
  function chrome(k){
    var s=steps[k],hiF=function(f){return s.hi.indexOf(f)>=0?' class="hi"':'';};
    fields.innerHTML='<span'+hiF('head')+'>head <b>'+(s.head===null?'null':valueOf(s,s.head))+'</b></span><span'+hiF('tail')+'>tail <b>'+(s.tail===null?'null':valueOf(s,s.tail))+'</b></span><span'+hiF('size')+'>size <b>'+s.size+'</b></span>';
    var iv=invariants(s),between=s.done||k===0;
    inv.innerHTML=INV.map(function(t,j){var st=between?(iv[j]?'ok':'bad'):'mid';
      return '<span role="listitem" class="'+st+'" title="'+t[1]+'" aria-label="'+t[1]+': '+(st==='mid'?'mid-operation, not checked':(st==='ok'?'holds':'broken'))+'"><i></i>'+t[0]+'</span>';}).join('');
    note.innerHTML=s.note;
    track.querySelectorAll('button').forEach(function(b,j){b.classList.toggle('on',j<=k);b.setAttribute('aria-current',j===k?'step':'false');});
    count.textContent=(k+1)+' / '+steps.length;pv.disabled=k===0;nx.disabled=k===steps.length-1&&!o.loop;
    svg.setAttribute('aria-label','List '+(s.chain.length?s.chain.map(function(id){return valueOf(s,id);}).join(' → ')+' → null':'is empty'));
  }
  function show(k,animate){
    var s=steps[k],pos=layout(s),from=shown,fromPos=shownPos;
    cancelAnimationFrame(raf);i=k;chrome(k);
    if(!animate||reduce||!from)draw(s,pos,1);
    else{var t0=performance.now();(function tick(now){var p=Math.min(1,(now-t0)/TWEEN);draw(s,pos,soft(p),from,fromPos);if(p<1)raf=requestAnimationFrame(tick);})(t0);}
    shown=s;shownPos=pos;
  }
  function buildTrack(){track.innerHTML='';steps.forEach(function(_,j){var b=el('button','lp-seg');b.type='button';b.setAttribute('aria-label','Step '+(j+1));
    b.addEventListener('click',function(){stop();show(j,true);});track.appendChild(b);});}
  function setIcon(){pp.innerHTML=icon(playing?'i-pause':'i-play');pp.setAttribute('aria-label',playing?'Pause':(o.loop||i<steps.length-1?'Play':'Replay'));}
  function stop(){playing=false;clearTimeout(timer);setIcon();}
  function tick(){
    clearTimeout(timer);if(!playing)return;
    if(!visible){timer=setTimeout(tick,700);return;}  // off screen: hold this step until it is back
    if(i<steps.length-1){timer=setTimeout(function(){if(!playing)return;show(i+1,true);tick();},dwell(steps[i]));return;}
    if(o.loop){timer=setTimeout(function(){if(!playing)return;shown=null;show(0,false);fadeIn();tick();},HOLD);return;}
    stop();
  }
  function fadeIn(){if(reduce)return;stage.animate&&stage.animate([{opacity:0},{opacity:1}],{duration:500,easing:'ease-out'});}
  function play(){if(reduce&&o.loop)return;if(i>=steps.length-1&&!o.loop){show(o.replayFrom||0,false);}playing=true;setIcon();tick();}
  pp.addEventListener('click',function(){if(playing)stop();else play();});
  pv.addEventListener('click',function(){stop();if(i>0)show(i-1,true);});
  nx.addEventListener('click',function(){stop();if(i<steps.length-1)show(i+1,true);else if(o.loop){shown=null;show(0,false);}});
  function pick(e){var n=e.target.closest&&e.target.closest('.lp-node[role="button"]');if(n&&self.onNode)self.onNode(+n.dataset.v);}
  svg.addEventListener('click',pick);
  svg.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(e);}});
  /* a looping player runs only while on screen, and never under reduced motion */
  if(o.loop&&'IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){visible=e.isIntersecting;
    if(visible&&o.autoplay&&!self.touched&&!playing&&!reduce)play();});},{threshold:.35}).observe(host);}
  host.addEventListener('pointerdown',function(e){if(e.target.closest('.lp-bar'))self.touched=true;});
  /* reserve the caption's height for the longest caption given, so a wrap never moves the controls */
  var reserveNotes=[];
  function reserve(){var probe=note.cloneNode(false);probe.removeAttribute('aria-live');probe.setAttribute('aria-hidden','true');
    probe.style.cssText='position:absolute;visibility:hidden;left:0;top:0;min-height:0;width:'+note.clientWidth+'px';note.parentNode.appendChild(probe);
    var h=0;reserveNotes.concat(steps.map(function(x){return x.note;})).forEach(function(t){probe.innerHTML=t;h=Math.max(h,probe.offsetHeight);});
    probe.remove();if(h)note.style.minHeight=h+'px';}
  if('ResizeObserver' in window)new ResizeObserver(function(){reserve();}).observe(host);
  this.reserve=function(notes){reserveNotes=notes;reserve();};
  this.load=function(list){stop();steps=list;shown=null;shownPos={};buildTrack();show(0,false);reserve();centre();
    if(o.autoplay&&visible&&!reduce&&!self.touched&&o.loop)play();};
  /* the playground: append one operation and play it through once */
  this.push=function(list){stop();var from=steps.length;steps=steps.concat(list);o.replayFrom=from-1;buildTrack();reserve();show(from,true);
    if(reduce){show(steps.length-1,false);return;}playing=true;setIcon();tick();};
  function centre(){if(stage.scrollWidth>stage.clientWidth)stage.scrollLeft=(stage.scrollWidth-stage.clientWidth)/2;}
  this.busy=function(){return playing&&!o.loop;};
  this.redraw=function(){if(shown)draw(shown,shownPos,1);};
  setIcon();
}

/* ---------- the playground ---------- */
function mountPlay(w){
  var L,player=new ListPlayer(w.querySelector('.lvhost'),{id:'play',slots:8}),pf=$('#pf'),pb=$('#pb'),hint=$('#playHint'),MAX=6;
  function nextValue(){var have=toArr(L);for(var k=0;k<40;k++){var v=[4,9,1,6,8,2,5,11,14,10][k%10];if(have.indexOf(v)<0)return v;}return 20;}
  function label(){var v=nextValue();pf.innerHTML=OPN.push_front+'('+v+')';pb.innerHTML=OPN.push_back+'('+v+')';
    var full=L.size>=MAX;pf.disabled=pb.disabled=full;hint.textContent=full?'full: click a node to delete one':(L.size?'or click a node to delete it':'empty: push a value');}
  function reset(){L=listOf([7,3,12]);player.load([snap(L,'The list 7 → 3 → 12. Push a value onto either end, or click a node to delete it.',{done:true})]);label();}
  function doOp(op,v){if(player.busy())return;player.push(run(L,op,v));label();}
  pf.addEventListener('click',function(){doOp('push_front',nextValue());});
  pb.addEventListener('click',function(){doOp('push_back',nextValue());});
  $('#rs').addEventListener('click',reset);
  player.onNode=function(v){doOp('delete',v);};
  onRepaint(player.redraw);
  reset();
  /* every caption an operation can produce, run on a throwaway list of the widest values */
  var S6=listOf([14,11,10,9,8,6]),S0=new List(),notes=[];
  [[S6,'delete',14],[S6,'delete',9],[S6,'delete',6],[S6,'delete',99],[S0,'push_front',11],[S0,'delete',11],[S0,'push_back',11],[S6,'push_back',11],[S6,'push_front',14]].forEach(function(c){
    run(c[0],c[1],c[2]).forEach(function(x){notes.push(x.note);});});
  player.reserve(notes);
}

/* ---------- tabbed walkthroughs: play on arrival, loop while on screen ---------- */
function mountTabs(w,examples,id){
  var tabs=w.querySelector('.extabs'),player=new ListPlayer(w.querySelector('.lvhost'),{id:id,loop:true,autoplay:true});
  function load(k){tabs.querySelectorAll('button').forEach(function(b,j){b.setAttribute('aria-pressed',j===k);});player.touched=false;player.load(examples[k].steps());}
  examples.forEach(function(e,k){var b=el('button','tab',e.name);b.type='button';b.addEventListener('click',function(){load(k);});tabs.appendChild(b);});
  player.reserve([].concat.apply([],examples.map(function(e){return e.steps().map(function(x){return x.note;});})));
  onRepaint(player.redraw);load(0);
}
function scripted(start,ops,intro,leaky,outro){
  return function(){var L=listOf(start),steps=[snap(L,intro,{done:true})];
    ops.forEach(function(p){steps=steps.concat(run(L,p[0],p[1],leaky));});
    if(outro)steps.push(snap(L,outro(L),{done:true}));return steps;};
}

/* ---------- hero: the disk strip above, the chain in file order below ---------- */
function mountHero(){
  var svg=$('#heroDisk'),num=$('#heroNum'),unit=$('#heroUnit'),cap=$('#heroCap');
  var ADDR=[4,9,1,7,11],VALS=[7,3,12,5,9],N=12,bw=38,gap=6,x0=16,by=34;
  var h='<text class="hd-lab" x="16" y="22">disk blocks, by address</text><text class="hd-lab" x="16" y="176">the file, in order: head → …</text>';
  var bx=function(a){return x0+a*(bw+gap);};
  for(var a=0;a<N;a++){var used=ADDR.indexOf(a)>=0;h+='<rect class="hd-blk'+(used?' used':'')+'" data-a="'+a+'" x="'+bx(a)+'" y="'+by+'" width="'+bw+'" height="40" rx="6"/><text class="hd-addr" data-a="'+a+'" x="'+(bx(a)+bw/2)+'" y="'+(by+24)+'" text-anchor="middle">#'+(a<10?'0':'')+a+'</text>';}
  var nw=84,ng=22,nx0=(560-(5*nw+4*ng))/2,ny=196,nx=function(i){return nx0+i*(nw+ng);};
  ADDR.forEach(function(a,i){h+='<line class="hd-link" data-i="'+i+'" x1="'+(nx(i)+nw/2)+'" y1="'+ny+'" x2="'+(bx(a)+bw/2)+'" y2="'+(by+40)+'"/>';});
  ADDR.forEach(function(a,i){if(i<4)h+='<line class="hd-arrow" data-i="'+i+'" x1="'+(nx(i)+nw)+'" y1="'+(ny+23)+'" x2="'+(nx(i+1)-3)+'" y2="'+(ny+23)+'" marker-end="url(#hdArrow)"/>';
    h+='<rect class="hd-node" data-i="'+i+'" x="'+nx(i)+'" y="'+ny+'" width="'+nw+'" height="46" rx="9"/><text class="hd-val" x="'+(nx(i)+28)+'" y="'+(ny+29)+'" text-anchor="middle">'+VALS[i]+'</text>'+
      '<text class="hd-nx" x="'+(nx(i)+62)+'" y="'+(ny+27)+'" text-anchor="middle">'+(i<4?'#'+(ADDR[i+1]<10?'0':'')+ADDR[i+1]:'∅')+'</text>';});
  h+='<defs><marker id="hdArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="context-stroke"/></marker></defs>';
  svg.innerHTML=h;
  function show(k){/* k blocks read */
    svg.querySelectorAll('.hd-blk,.hd-addr').forEach(function(e){e.classList.toggle('lit',ADDR.slice(0,k).indexOf(+e.dataset.a)>=0);});
    svg.querySelectorAll('.hd-node,.hd-link').forEach(function(e){e.classList.toggle('lit',+e.dataset.i<k);});
    svg.querySelectorAll('.hd-arrow').forEach(function(e){e.classList.toggle('lit',+e.dataset.i<k-1);});
    num.textContent=k;unit.textContent=k===1?'block':'blocks';
    cap.innerHTML=k===0?'The directory names only the first block: <b>#04</b>':(k<5?'Block #'+(ADDR[k-1]<10?'0':'')+ADDR[k-1]+' says: next is <b>#'+(ADDR[k]<10?'0':'')+ADDR[k]+'</b>':'Block #11 says next is <b>∅</b>: end of file');
  }
  if(reduce||!M||!M.animate){show(5);return;}
  var last=-1;M.animate(0,7,{duration:7*1.9,ease:'linear',repeat:Infinity,onUpdate:function(v){var k=Math.min(5,Math.floor(v));if(k!==last){last=k;show(k);}}});
}

/* ---------- banners ---------- */
function chainArt(svg,vals,x0,y,o){
  o=o||{};var w=70,g=34,out=[];
  vals.forEach(function(v,i){var x=x0+i*(w+g);
    out.push(S('rect',{x:x,y:y,width:w,height:36,rx:8,class:'bn-mid'},svg));
    S('line',{x1:x+w-22,x2:x+w-22,y1:y,y2:y+36,class:'bn-edge'},svg);
    var t=S('text',{x:x+(w-22)/2,y:y+23,class:'bn-t','text-anchor':'middle',style:'font-size:14px;font-weight:600'},svg);t.textContent=v;
    var nt=S('text',{x:x+w-11,y:y+22,class:'bn-t','text-anchor':'middle'},svg);nt.textContent=i===vals.length-1||o.cut===i?'∅':'•';});
  return function(i){return x0+i*(w+g);};
}
var banners={
  node:function(svg){
    var X=chainArt(svg,[7,3,12],200,52),arrows=[0,1].map(function(i){return S('line',{x1:X(i)+60,y1:70,x2:X(i)+60,y2:70,class:'bn-path','marker-end':'url(#bnA)'},svg);});
    svg.insertAdjacentHTML('afterbegin','<defs><marker id="bnA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="context-stroke"/></marker></defs>');
    var hd=S('text',{x:X(0)+35,y:38,class:'bn-t','text-anchor':'middle'},svg),tl=S('text',{x:X(2)+35,y:38,class:'bn-t','text-anchor':'middle'},svg),sz=S('text',{x:560,y:76,class:'bn-big'},svg);
    return function(){arrows.forEach(function(l,i){M.animate(0,1,{duration:.45,delay:.2+i*.45,onUpdate:function(v){l.setAttribute('x2',X(i)+60+(X(i+1)-X(i)-63)*v);}});});
      M.animate(0,1,{duration:.3,delay:1.2,onUpdate:function(v){hd.textContent=v>.5?'head':'';tl.textContent=v>.5?'tail':'';}});
      M.animate(0,3,{duration:.8,delay:1.4,onUpdate:function(v){sz.textContent='size '+Math.round(v);}});};
  },
  walk:function(svg){
    var X=chainArt(svg,[7,3,12,5],150,56),pv=S('text',{class:'bn-t','text-anchor':'middle',y:112},svg),cu=S('text',{class:'bn-t','text-anchor':'middle',y:112},svg);
    var arc=S('path',{class:'bn-path b2',d:'M'+(X(1)+60)+',56 C'+(X(1)+90)+',8 '+(X(3)-40)+',8 '+(X(3)-4)+',56',style:'stroke-dasharray:400;stroke-dashoffset:400'},svg);
    var lab=S('text',{x:X(2)+35,y:22,class:'bn-t','text-anchor':'middle'},svg);
    return function(){M.animate(0,2,{duration:1.6,onUpdate:function(v){var k=Math.round(v);pv.setAttribute('x',X(k)+35);cu.setAttribute('x',X(k+1)+35);pv.textContent=k>=0?'prev':'';cu.textContent='curr';}});
      M.animate(400,0,{duration:.7,delay:1.8,onUpdate:function(v){arc.style.strokeDashoffset=v;}});
      M.animate(0,1,{duration:.2,delay:2.4,onUpdate:function(v){lab.textContent=v>.5?'prev.next = curr.next':'';}});};
  },
  trap:function(svg){
    var X=chainArt(svg,[7,3],120,30,{cut:1});
    var gx=X(2)+30,g=S('rect',{x:gx,y:74,width:70,height:36,rx:8,class:'bn-mid',style:'stroke-dasharray:5 4;fill:none'},svg),gt=S('text',{x:gx+24,y:97,class:'bn-t','text-anchor':'middle',style:'font-size:14px'},svg);gt.textContent='12';
    var nx=gx+104,n=S('rect',{x:nx,y:74,width:70,height:36,rx:8,class:'bn-mid',style:'stroke-dasharray:5 4;fill:none;opacity:0'},svg),nt=S('text',{x:nx+24,y:97,class:'bn-t','text-anchor':'middle',style:'font-size:14px;opacity:0'},svg);nt.textContent='5';
    var ln=S('line',{x1:gx+60,y1:92,x2:gx+60,y2:92,class:'bn-path b2'},svg),tag=S('text',{x:gx+35,y:66,class:'bn-t','text-anchor':'middle'},svg);
    var big=S('text',{x:560,y:48,class:'bn-big red'},svg),sub=S('text',{x:560,y:72,class:'bn-t'},svg);
    return function(){M.animate(0,1,{duration:.3,delay:.3,onUpdate:function(v){tag.textContent=v>.5?'tail (stale)':'';}});
      M.animate(0,1,{duration:.6,delay:.9,onUpdate:function(v){n.style.opacity=v;nt.style.opacity=v;ln.setAttribute('x2',gx+60+(nx-gx-63)*v);}});
      M.animate(0,1,{duration:.3,delay:1.6,onUpdate:function(v){big.textContent=v>.5?'size 3':'';sub.textContent=v>.5?'head reaches 2':'';}});};
  }
};

/* ---------- cost ---------- */
function appendVisits(n,withTail){
  var head=null,tail=null,visits=0;
  for(var k=0;k<n;k++){var node=mkNode(k);
    if(withTail){if(tail)tail.next=node;else head=node;tail=node;}
    else if(!head)head=node;
    else{var c=head;visits++;while(c.next){c=c.next;visits++;}c.next=node;}}
  return visits;
}
function mountCost(){
  var pts=[];for(var n=0;n<=64;n+=8){var a=appendVisits(n,false),b=appendVisits(n,true);
    if(a!==n*(n-1)/2||b!==0)throw new Error('append cost check failed at n='+n);pts.push([n,a,b]);}
  costChart($('#cost-chart'),{pts:pts,xlabel:'values appended',xticks:[0,16,32,48,64],aria:'Nodes visited to append n values: without a tail pointer the count grows as n(n − 1)/2, reaching 2,016 at 64 values; with a tail pointer it stays at 0.'});
  var big=10000;
  $('#cost-note').innerHTML='Appending 64 values without a tail visits <b>'+fmt(pts[pts.length-1][1])+'</b> nodes, counted by running it; with the tail it visits <b>0</b>. At '+fmt(big)+' values the walk would visit '+fmt(big*(big-1)/2)+' nodes: O(n²) to build a list that should cost O(n).';
}

var QUIZ=[
 {q:'<code>delete</code> walks two references, <code>prev</code> and <code>curr</code>. Why not just <code>curr</code>?',
  opts:['Removing curr means rewriting the next pointer of the node before it, and a singly linked list gives curr no way back to that node.',
        'Holding both lets the loop stop the moment it finds a match; with curr alone it would have to scan to the end before it could delete anything.',
        'prev keeps a count of the nodes visited so far, which delete needs so that it can lower size by the right amount when it removes a node.'],
  a:0,why:'The pointer that changes belongs to the node before the one being removed. From <code>curr</code> there is no way back to it, so the walk carries the predecessor along. A doubly linked list stores a <code>prev</code> in every node precisely to avoid this, and pays a second reference per node for it.'},
 {q:'A <code>delete</code> leaves out the tail branch. You delete the last node, then append 5. What happens?',
  opts:['The append links 5 onto the removed node that tail still names. No walk from head reaches it, so 5 is lost with no error and size is one too high.',
        'The append raises an error at once, because tail points at a node that was deleted, and reading the next field of a deleted node fails on the spot.',
        'Nothing goes wrong: head still reaches every real node, and the append walks from head to find the end, so the stale tail is never actually used.'],
  a:0,why:'In Python and TypeScript a removed node is an ordinary object until nothing refers to it, and <code>tail</code> still refers to it, so no error is raised. The append trusts <code>tail</code>, which is the whole point of keeping it, and links the new node where no walk from <code>head</code> will ever arrive. The trap widget above runs exactly this sequence.'},
 {q:'Halfway through a push to the front, <code>head</code> already points at the new node but <code>size</code> has not been raised. Is the list broken at that moment?',
  opts:['No. Invariants must hold whenever a method returns. Inside one they may briefly fail, since with one thread no other code can run mid-call.',
        'Yes. Every invariant has to hold after every single line, so size should be raised first, before the new node is created or linked into the list.',
        'No, because size is only a cache: the list recounts its nodes whenever size is read, so a stale value in the middle of a push is never seen.'],
  a:0,why:'An invariant is a promise about the list between operations. Some temporary break is unavoidable, since no single pointer write can move <code>head</code> and <code>size</code> together. What matters is that every method restores all three before it returns. In this class <code>size</code> is a stored field, never recounted, which is why forgetting to update it is a real bug.'}
];

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountHero();
  $('#code-full').appendChild(codeBlock(CODE.solution.py,CODE.solution.ts,'The whole class'));
  mountPlay($('#play'));
  mountTabs($('#walker'),[
    {name:'delete(3): the middle',steps:scripted([7,3,12],[['delete',3]],'The list 7 → 3 → 12. Delete 3.')},
    {name:'delete(7): the head',steps:scripted([7,3,12],[['delete',7]],'The list 7 → 3 → 12. Delete 7, the head.')},
    {name:'delete(12): the tail',steps:scripted([7,3,12],[['delete',12]],'The list 7 → 3 → 12. Delete 12, the tail.')},
    {name:'delete(9): not there',steps:scripted([7,3,12],[['delete',9]],'The list 7 → 3 → 12. Delete 9, which is not in it.')},
    {name:'find(12)',steps:scripted([7,3,12],[['find',12]],'The list 7 → 3 → 12. Find 12.')}
  ],'walk');
  mountTabs($('#trapper'),[
    {name:'Correct delete',steps:scripted([7,3,12],[['delete',12],['push_back',5]],'The list 7 → 3 → 12. Delete 12, then append 5.',false,
      function(L){return 'The walk from head gives '+toArr(L).join(' → ')+', size is '+L.size+', and all three invariants hold.';})},
    {name:'Delete that forgets the tail',steps:scripted([7,3,12],[['delete',12],['push_back',5]],'The list 7 → 3 → 12. Delete 12 with the version that forgets the tail branch, then append 5.',true,
      function(L){return 'The walk from head gives '+toArr(L).join(' → ')+', but size says '+L.size+'. The append returned normally and its value is gone.';})}
  ],'trap');
  var w=el('div','callout warn');
  w.innerHTML='<div class="cl"><svg class="i"><use href="#i-warn"/></svg>Watch out</div><p>Deleting the tail must move <code>tail</code> back to <code>prev</code>. Without that line, deleting 12 from 7 → 3 → 12 and then appending 5 leaves a list whose walk from head is 7 → 3 while <code>size</code> is 3: both runtimes lose the 5, and nothing raises an error.</p>';
  w.appendChild(codeBlock(CODE.mistake.py,CODE.mistake.ts,'The delete that forgets the tail'));
  $('#warnbox').appendChild(w);
  mountBanners(banners);
  mountCost();
  mountVariants($('#vlist'),[
    ['Pointer Surgery Patterns','next lesson','A dummy node in front of the head: every real node then has a node before it, so deleting the head becomes an ordinary splice and most branches here disappear.'],
    ['Reverse Linked List','problem','Turn every next pointer to face backwards, holding three references at once so no part of the list is lost halfway through the flip.'],
    ['Middle of the Linked List','problem','A fast reference moves two nodes for every one a slow reference moves. When the fast one reaches the end, the slow one is in the middle.'],
    ['Linked List Cycle','problem','The same two speeds detect a loop: if next ever leads back into the list, the fast reference laps the slow one and they meet.']
  ]);
  mountQuiz($('#qlist'),QUIZ);
  kinetic();riseIn();
})();
