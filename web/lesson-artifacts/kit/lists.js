/* kit/lists.js: a singly linked list recorded one pointer write at a time, and the player that
   draws it. Included by build.py only in lessons that use it (see KIT_OPTIONAL).
   Names are prefixed (listRun, listLayout, listSnap...) because every kit file and the lesson
   share one scope: the lesson's own `run` and `layout` once silently replaced engine.js's run and
   trees.js's layout on the page that defined them. */

var uid=0;
function mkNode(v,next){return {id:++uid,value:v,next:next||null};}
function List(){this.head=null;this.tail=null;this.size=0;}
function idOf(n){return n?n.id:null;}
function nm(py,ts){return '<span class="c-py">'+py+'</span><span class="c-ts">'+ts+'</span>';}
var OPN={push_front:nm('push_front','pushFront'),push_back:nm('push_back','pushBack'),delete:'delete',find:'find'};

function listSnap(L,note,o){
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
function listRun(L,op,v,leaky){var steps=[],rec=function(n,o){steps.push(listSnap(L,n,o));};
  ({push_front:opPushFront,push_back:opPushBack,delete:opDelete,find:opFind})[op](L,v,rec,leaky);return steps;}
function listQuiet(L,op,v){({push_front:opPushFront,push_back:opPushBack,delete:opDelete,find:opFind})[op](L,v,function(){});}
function listOf(vals){var L=new List();vals.forEach(function(v){listQuiet(L,'push_back',v);});return L;}
function toArr(L){var o=[];for(var c=L.head,g=0;c&&g<64;c=c.next,g++)o.push(c.value);return o;}

function listInvariants(s){
  var last=s.chain.length?s.chain[s.chain.length-1]:null;
  return [!s.cyclic,s.tail===last,s.size===s.chain.length];
}


/* ---------- the view ---------- */
var SLOT=118,BW=78,BH=46,ROWY=[84,190];
/* Deterministic, from the snapshot alone, so stepping forward and back draw the same
   frame: the chain in order on the top row; a node that left the chain drops below the
   slot it last held; a new node sits below where it will join. */
function listLayout(s){
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
function listSpan(pos){var lo=0,hi=2;for(var k in pos){lo=Math.min(lo,pos[k].x);hi=Math.max(hi,pos[k].x);}return [lo,hi];}

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
  function setBox(){svg.setAttribute('viewBox','0 0 '+VBW+' '+VBH);svg.style.minWidth=Math.round(VBW*.72)+'px';}
  setBox();
  /* Size the canvas to the largest frame this player will ever show (every tab's steps), so a
     short walkthrough does not float in an empty stage and switching tabs never resizes it. */
  this.sizeTo=function(all){if(o.slots)return;var n=4,low=false;
    all.forEach(function(st){var pos=listLayout(st),sp=listSpan(pos);n=Math.max(n,sp[1]-sp[0]+2);
      for(var k in pos)if(pos[k].y===1)low=true;});
    VBW=n*SLOT+40;VBH=low?262:150;setBox();};
  function geo(pos){var sp=listSpan(pos),n=sp[1]-sp[0]+2,vbw=VBW;
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
    var iv=listInvariants(s),between=s.done||k===0;
    inv.innerHTML=INV.map(function(t,j){var st=between?(iv[j]?'ok':'bad'):'mid';
      return '<span role="listitem" class="'+st+'" title="'+t[1]+'" aria-label="'+t[1]+': '+(st==='mid'?'mid-operation, not checked':(st==='ok'?'holds':'broken'))+'"><i></i>'+t[0]+'</span>';}).join('');
    note.innerHTML=s.note;
    track.querySelectorAll('button').forEach(function(b,j){b.classList.toggle('on',j<=k);b.setAttribute('aria-current',j===k?'step':'false');});
    count.textContent=(k+1)+' / '+steps.length;pv.disabled=k===0;nx.disabled=k===steps.length-1&&!o.loop;
    svg.setAttribute('aria-label','List '+(s.chain.length?s.chain.map(function(id){return valueOf(s,id);}).join(' → ')+' → null':'is empty'));
  }
  function show(k,animate){
    var s=steps[k],pos=listLayout(s),from=shown,fromPos=shownPos;
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

/* ---------- tabbed walkthroughs: play on arrival, loop while on screen ---------- */
function mountTabs(w,examples,id){
  var tabs=w.querySelector('.extabs'),player=new ListPlayer(w.querySelector('.lvhost'),{id:id,loop:true,autoplay:true});
  function load(k){tabs.querySelectorAll('button').forEach(function(b,j){b.setAttribute('aria-pressed',j===k);});player.touched=false;player.load(examples[k].steps());}
  examples.forEach(function(e,k){var b=el('button','tab',e.name);b.type='button';b.addEventListener('click',function(){load(k);});tabs.appendChild(b);});
  var every=[].concat.apply([],examples.map(function(e){return e.steps();}));
  player.sizeTo(every);
  player.reserve(every.map(function(x){return x.note;}));
  onRepaint(player.redraw);load(0);
}
function scripted(start,ops,intro,leaky,outro){
  return function(){var L=listOf(start),steps=[listSnap(L,intro,{done:true})];
    ops.forEach(function(p){steps=steps.concat(listRun(L,p[0],p[1],leaky));});
    if(outro)steps.push(listSnap(L,outro(L),{done:true}));return steps;};
}

