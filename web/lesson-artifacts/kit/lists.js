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

/* A snapshot of plain nodes, for a walkthrough of code that holds no List, only nodes and the
   pointers a solution keeps (spec 2026-10-01-pointer-list-player-design.md). o.nodes is every node
   the walkthrough made, each with a fixed {x, y} the lesson authors, so only arrows and names move;
   o.tags maps any pointer name to a node or null; o.head names the node the chain is read from;
   o.above lists the names drawn over their node (the rest sit under it); o.nil puts a null name at
   the 'left' of row 0 or (the default) the 'right'; o.data rides along for an invariant that counts
   something positions cannot show (how many steps each pointer has taken). */
function ptrSnap(note,o){
  var nodes=o.nodes.map(function(n){return {id:n.id,value:n.value,next:idOf(n.next),x:n.x,y:n.y||0};});
  var chain=[],seen={},c=o.head||null;
  for(;c&&!seen[c.id];c=c.next){seen[c.id]=1;chain.push(c.id);}
  var tags={};Object.keys(o.tags||{}).forEach(function(k){tags[k]=idOf(o.tags[k]);});
  /* live: what some name still reaches. A node no name reaches is garbage, and is drawn as dropped,
     which is how a flip made before saving next shows the rest of the list being lost */
  var live={};[o.head].concat(Object.keys(o.tags||{}).map(function(k){return o.tags[k];})).forEach(function(r){
    for(var q=r;q&&!live[q.id];q=q.next)live[q.id]=1;});
  return {note:note,head:idOf(o.head||null),tail:null,size:chain.length,nodes:nodes,chain:chain,cyclic:!!c,live:Object.keys(live).map(Number),
    tags:tags,above:o.above||['head','tail'],nil:o.nil||{},data:o.data||null,hi:o.hi||[],done:!!o.done,fixed:true};
}
/* helpers the module's walkthroughs share: nodes on one row at the slot they start in; the values a
   chain holds and its text ("1 → 2 → null", or "… → back to 3" when it loops); and a walk over a
   snapshot's own pointers, for an invariant checked from the snapshot alone */
function ptrRow(vals,y){var ns=vals.map(function(v,i){var n=mkNode(v);n.x=i;n.y=y||0;return n;});ns.forEach(function(n,i){n.next=ns[i+1]||null;});return ns;}
function ptrVals(h){var o=[],seen={};for(var c=h;c&&!seen[c.id];c=c.next){seen[c.id]=1;o.push(c.value);}return o;}
function ptrText(h){var o=[],seen={},c=h;for(;c&&!seen[c.id];c=c.next){seen[c.id]=1;o.push(c.value);}
  return (o.length?o.join(' → ')+' → ':'')+(c?'back to '+c.value:'null');}
function snapWalk(s,id){var by={},out=[],seen={};s.nodes.forEach(function(n){by[n.id]=n;});
  for(var c=id;c!==null&&c!==undefined&&!seen[c];c=by[c].next){seen[c]=1;out.push(c);}return {ids:out,ends:c===null||c===undefined};}
/* every name a snapshot draws, and its node id or null: a List snapshot's head and tail live on the snapshot */
function listNames(s){return s.fixed?s.tags:Object.assign({head:s.head,tail:s.tail},s.tags);}


/* ---------- the view ---------- */
var SLOT=118,BW=78,BH=46,ROWY=[84,190];
/* Deterministic, from the snapshot alone, so stepping forward and back draw the same
   frame: the chain in order on the top row; a node that left the chain drops below the
   slot it last held; a new node sits below where it will join. */
function listLayout(s){
  var pos={};
  /* authored positions, and the two places a null name can stand: past either end of row 0 */
  if(s.fixed){var lo=Infinity,hi=-Infinity;
    s.nodes.forEach(function(n){pos[n.id]={x:n.x,y:n.y};if(n.y===0){lo=Math.min(lo,n.x);hi=Math.max(hi,n.x);}});
    if(lo===Infinity){lo=0;hi=-1;}
    var names=listNames(s);Object.keys(names).forEach(function(k){if(names[k]!==null)return;
      var side=s.nil[k]==='left'?'left':'right';pos['nil:'+side]={x:side==='left'?lo-1:hi+1,y:0};});
    return pos;}
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

/* The list view (kit/player.js runs it): nodes glide to their new slots, new nodes fade in and
   removed ones fade out, a pointer that changed draws itself in, and each name (head, tail, prev,
   curr) glides to the node it now names. */
var INV=[['reaches every node','head reaches every node and the walk ends at null'],['tail is last','tail is the last of those nodes, null only when empty'],['size matches','size equals the number of nodes']];

function ListPlayer(host,o){
  o=o||{};var p,svg,root,arrow;
  /* One canvas size for the player's whole life (o.slots wide, both rows tall): the list is
     centred inside it and glides to its new centre, so nothing around the stage ever moves. */
  var VBW=(o.slots||6)*SLOT+40,VBH=262;
  function setBox(){svg.setAttribute('viewBox','0 0 '+VBW+' '+VBH);svg.style.minWidth=Math.round(VBW*.72)+'px';}
  function geo(pos){var sp=listSpan(pos),n=sp[1]-sp[0]+2,vbw=VBW;
    return {vbw:vbw,ox:-(40+sp[0]*SLOT+SLOT/2)+20+(vbw-(n*SLOT+40))/2,low:Object.keys(pos).some(function(k){return pos[k].y===1;})};}
  function at(g,q){return {x:g.ox+40+(q.x+1)*SLOT,y:ROWY[0]+(ROWY[1]-ROWY[0])*q.y};}
  function lerp(a,b,t){return a+(b-a)*t;}
  /* where each name sits in a snapshot: above its node for head/tail, below for the walk */
  function tagPlaces(s,pos,g){
    var out={},up={},down={};
    function put(list,name,id){var k=id===null?'nil':id;(list[k]=list[k]||[]).push(name);}
    var names=listNames(s),above=s.above||['head','tail'];
    Object.keys(names).forEach(function(t){var id=names[t];
      if(above.indexOf(t)>=0){put(up,t,id);return;}
      /* a List walk hides a finished name; a pointer walkthrough shows it as name = null */
      if(id===null){if(s.fixed)put(down,t,'nil:'+(s.nil[t]==='left'?'left':'right'));return;}
      if(!(t==='node'&&id===names.curr))put(down,t,id);});
    function anchor(k){return k==='nil'?at(g,{x:0,y:0}):(pos[k]?at(g,pos[k]):null);}
    Object.keys(up).forEach(function(k){var a=anchor(k);if(!a)return;var names=up[k];
      names.forEach(function(n,j){out[n]={x:a.x+(names.length>1?(j?22:-22):0),y:a.y-BH/2-12,nil:k==='nil',walk:false};});});
    Object.keys(down).forEach(function(k){var a=anchor(k);if(!a)return;var nil=k.indexOf('nil:')===0,off=!s.fixed&&s.chain.indexOf(+k)<0?16:0;
      down[k].forEach(function(n,j){out[n]={x:a.x,y:nil?a.y-((down[k].length-1)*18)/2+j*18:a.y+BH/2+14+off+j*18,nil:nil,walk:!nil};});});
    return out;
  }
  function draw(s,pos,t,fromS,fromPos){
    var g=geo(pos),fg=fromS?geo(fromPos):g,eg={vbw:lerp(fg.vbw,g.vbw,t),ox:lerp(fg.ox,g.ox,t)};
    var P=function(id){var tp=pos[id],fp=fromPos&&fromPos[id];if(!tp)return null;var a=fp&&t<1?{x:lerp(fp.x,tp.x,t),y:lerp(fp.y,tp.y,t)}:tp;
      return {x:eg.ox+40+(a.x+1)*SLOT,y:ROWY[0]+(ROWY[1]-ROWY[0])*a.y};};
    var h=[],hi=s.hi,byFrom={};
    if(fromS)fromS.nodes.forEach(function(n){byFrom[n.id]=n;});
    /* pair: the target points straight back (a two-node loop, or a flip made before its neighbour's), so
       the two arrows would share one line; each moves to the right of its own direction of travel */
    function arrowPath(a,b,pair){var x1=a.x+BW/2-13,y1=a.y,x2=b.x-BW/2-4,y2=b.y;
      if(pair&&s.fixed){var L0=Math.hypot(b.x-a.x,b.y-a.y)||1,nx=-(b.y-a.y)/L0*7,ny=(b.x-a.x)/L0*7;a={x:a.x+nx,y:a.y+ny};b={x:b.x+nx,y:b.y+ny};y1=a.y;y2=b.y;}
      if(Math.abs(y1-y2)<1&&x2>x1)return 'M'+x1+','+y1+' L'+x2+','+y2;
      /* authored layouts: a flipped pointer runs left, edge to edge (2 ← 3); one between rows is
         straight and trimmed to both boxes, so a rho or a merge never curves through other nodes */
      if(s.fixed){
        /* a node whose next is itself (prev = curr, then curr.next = prev): a loop over its own box */
        if(Math.abs(a.x-b.x)<1&&Math.abs(a.y-b.y)<1){var r=a.x+BW/2-16,l=a.x-BW/2+16,t0=a.y-BH/2;
          return 'M'+r+','+t0+' C'+r+','+(t0-40)+' '+l+','+(t0-40)+' '+l+','+(t0-4);}
        if(Math.abs(y1-y2)<1)return 'M'+(a.x-BW/2)+','+y1+' L'+(b.x+BW/2+4)+','+y2;
        var dx=b.x-a.x,dy=b.y-a.y,ta=Math.min(BW/2/Math.abs(dx||1e-9),BH/2/Math.abs(dy||1e-9)),tb=Math.min((BW/2+4)/Math.abs(dx||1e-9),(BH/2+4)/Math.abs(dy||1e-9));
        return 'M'+(a.x+dx*ta).toFixed(1)+','+(a.y+dy*ta).toFixed(1)+' L'+(b.x-dx*tb).toFixed(1)+','+(b.y-dy*tb).toFixed(1);}
      var bend=Math.max(40,Math.abs(x2-x1)*.45);return 'M'+x1+','+y1+' C'+(x1+bend)+','+y1+' '+(x2-bend)+','+y2+' '+x2+','+y2;}
    /* outgoing: nodes and pointers that this step removed, fading where they were */
    if(fromS&&t<1){
      fromS.nodes.forEach(function(n){var here=s.nodes.some(function(m){return m.id===n.id;});var a=fromPos[n.id];if(!a)return;var A={x:fg.ox+40+(a.x+1)*SLOT,y:ROWY[0]+(ROWY[1]-ROWY[0])*a.y};
        if(!here)h.push(nodeSvg(n,A,false,1-t,''));
        var same=here&&s.nodes.filter(function(m){return m.id===n.id;})[0].next===n.next;
        if(n.next&&!same&&fromPos[n.next]){var B=fromPos[n.next];h.push('<path class="lp-arrow" style="opacity:'+(1-t)+'" d="'+arrowPath(A,{x:fg.ox+40+(B.x+1)*SLOT,y:ROWY[0]+(ROWY[1]-ROWY[0])*B.y},byFrom[n.next]&&byFrom[n.next].next===n.id)+'" marker-end="'+arrow+'"/>');}});
    }
    var byTo={};s.nodes.forEach(function(n){byTo[n.id]=n;});
    s.nodes.forEach(function(n){var a=P(n.id);if(!a||!n.next)return;var b=P(n.next);if(!b)return;
      var pair=n.next!==n.id&&byTo[n.next]&&byTo[n.next].next===n.id,was=byFrom[n.id],fresh=fromS&&(!was||was.next!==n.next),reveal=fresh&&t<1?' pathLength="1" stroke-dasharray="1" stroke-dashoffset="'+(1-t).toFixed(3)+'"':'';
      h.push('<path class="lp-arrow'+(hi.indexOf('next:'+n.id)>=0?' hi':'')+'" d="'+arrowPath(a,b,pair)+'"'+reveal+' marker-end="'+(fresh&&t<.85?'none':arrow)+'"/>');});
    s.nodes.forEach(function(n){var a=P(n.id);if(!a)return;var enter=fromS&&!byFrom[n.id]?t:1;
      h.push(nodeSvg(n,{x:a.x,y:a.y-(1-enter)*10},(s.fixed?s.live:s.chain).indexOf(n.id)>=0,enter,hi.indexOf('next:'+n.id)>=0?' hi':''));});
    var to=tagPlaces(s,pos,g),from=fromS&&t<1?tagPlaces(fromS,fromPos,fg):null;
    var names={};Object.keys(to).forEach(function(k){names[k]=1;});if(from)Object.keys(from).forEach(function(k){names[k]=1;});
    Object.keys(names).forEach(function(name){var a=to[name],b=from&&from[name],op=1,q;
      if(a&&b)q={x:lerp(b.x,a.x,t),y:lerp(b.y,a.y,t),nil:a.nil,walk:a.walk};else if(a){q=a;op=from?t:1;}else{q=b;op=1-t;}
      var label=name+(q.nil?' = null':''),dy=q.walk?-11:0;
      h.push('<g class="lp-tag'+(q.walk?' walk':'')+(hi.indexOf(name)>=0?' hi':'')+'" style="opacity:'+op.toFixed(3)+'">'+
        (q.nil?'':'<line x1="'+q.x+'" x2="'+q.x+'" y1="'+(q.walk?q.y-15:q.y+3)+'" y2="'+(q.walk?q.y-6:q.y+10)+'"/>')+
        '<text x="'+q.x+'" y="'+(q.y+dy+(q.walk?14:0))+'" text-anchor="middle">'+label+'</text></g>');});
    root.innerHTML=h.join('');
  }
  function nodeSvg(n,a,inChain,op,extra){
    var x=a.x-BW/2,y=a.y-BH/2,btn=p.onNode&&inChain?' role="button" tabindex="0" aria-label="Delete '+n.value+'"':'';
    return '<g class="lp-node'+(inChain?'':' off')+extra+'" data-v="'+n.value+'"'+btn+' style="opacity:'+(inChain?op:op*.62).toFixed(3)+'">'+
      '<rect class="lp-box" x="'+x+'" y="'+y+'" width="'+BW+'" height="'+BH+'" rx="13"/>'+
      '<rect class="lp-port" x="'+(x+BW-27)+'" y="'+(y+5)+'" width="22" height="'+(BH-10)+'" rx="8"/>'+
      '<text class="lp-val" x="'+(x+(BW-26)/2+1)+'" y="'+(a.y+5.5)+'" text-anchor="middle">'+n.value+'</text>'+
      (n.next?'<circle class="lp-dot" cx="'+(x+BW-16)+'" cy="'+a.y+'" r="3"/>':'<text class="lp-nil" x="'+(x+BW-16)+'" y="'+(a.y+4)+'" text-anchor="middle">∅</text>')+'</g>';
  }
  function valueOf(s,id){for(var j=0;j<s.nodes.length;j++)if(s.nodes[j].id===id)return s.nodes[j].value;return '?';}
  function pick(e){var n=e.target.closest&&e.target.closest('.lp-node[role="button"]');if(n&&p.onNode)p.onNode(+n.dataset.v);}
  p=new StepPlayer(host,o,{
    mount:function(stage,player){
      p=player;p.onNode=null;
      svg=S('svg',{role:'img'},stage);var mid=(o.id||'lp')+'Arrow';
      svg.innerHTML='<defs><marker id="'+mid+'" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto"><path d="M1,1.5 L8.5,5 L1,8.5" fill="none" stroke="context-stroke" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><g class="lp-root"></g>';
      root=svg.querySelector('.lp-root');arrow='url(#'+mid+')';setBox();
      svg.addEventListener('click',pick);
      svg.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(e);}});
    },
    /* Size the canvas to the largest frame this player will ever show (every tab's steps), so a
       short walkthrough does not float in an empty stage and switching tabs never resizes it. */
    sizeTo:function(all){if(o.slots)return;var n=4,low=false;
      all.forEach(function(st){var pos=listLayout(st),sp=listSpan(pos);n=Math.max(n,sp[1]-sp[0]+2);
        for(var k in pos)if(pos[k].y===1)low=true;});
      VBW=n*SLOT+40;VBH=low?262:150;
      var deep=0;all.forEach(function(st){var pos=listLayout(st);for(var k in pos)deep=Math.max(deep,pos[k].y);});
      if(deep>1)VBH=262+(deep-1)*(ROWY[1]-ROWY[0]);setBox();},
    layout:listLayout,draw:draw,inv:o.inv||INV,check:o.check||listInvariants,
    fields:o.fields?function(s,hiF){return o.fields(s,hiF,function(id){return valueOf(s,id);});}:function(s,hiF){return '<span'+hiF('head')+'>head <b>'+(s.head===null?'null':valueOf(s,s.head))+'</b></span><span'+hiF('tail')+'>tail <b>'+(s.tail===null?'null':valueOf(s,s.tail))+'</b></span><span'+hiF('size')+'>size <b>'+s.size+'</b></span>';},
    label:function(s){
      /* a pointer walkthrough has no one list to name: say where each name leads */
      if(s.fixed){var by={};s.nodes.forEach(function(n){by[n.id]=n;});
        svg.setAttribute('aria-label',Object.keys(s.tags).map(function(k){var o=[],seen={},c=s.tags[k];
          for(;c!==null&&!seen[c];c=by[c].next){seen[c]=1;o.push(by[c].value);}
          return k+': '+(o.length?o.join(' → ')+(c===null?' → null':' → back to '+by[c].value):'null');}).join('; ')+
          (s.live.length<s.nodes.length?'; '+(s.nodes.length-s.live.length)+' unreachable':''));return;}
      var back=s.cyclic?s.nodes.filter(function(n){return n.id===s.chain[s.chain.length-1];})[0].next:null;
      svg.setAttribute('aria-label','List '+(s.chain.length?s.chain.map(function(id){return valueOf(s,id);}).join(' → ')+(s.cyclic?' → back to '+valueOf(s,back):' → null'):'is empty'));}
  });
  return p;
}

/* ---------- banner art: a row of boxes with next ports, shared by the module's lessons ---------- */
function chainArt(svg,vals,x0,y,o){
  o=o||{};var w=70,g=34,out=[];
  vals.forEach(function(v,i){var x=x0+i*(w+g);
    out.push(S('rect',{x:x,y:y,width:w,height:36,rx:8,class:'bn-mid'},svg));
    S('line',{x1:x+w-22,x2:x+w-22,y1:y,y2:y+36,class:'bn-edge'},svg);
    var t=S('text',{x:x+(w-22)/2,y:y+23,class:'bn-t','text-anchor':'middle',style:'font-size:14px;font-weight:600'},svg);t.textContent=v;
    var nt=S('text',{x:x+w-11,y:y+22,class:'bn-t','text-anchor':'middle'},svg);nt.textContent=i===vals.length-1||o.cut===i?'∅':'•';});
  return function(i){return x0+i*(w+g);};
}

/* ---------- tabbed walkthroughs of the list ---------- */
function mountTabs(w,examples,id){return mountPlayerTabs(w,examples,function(h,o){return new ListPlayer(h,o);},{id:id});}
function scripted(start,ops,intro,leaky,outro){
  return function(){var L=listOf(start),steps=[listSnap(L,intro,{done:true})];
    ops.forEach(function(p){steps=steps.concat(listRun(L,p[0],p[1],leaky));});
    if(outro)steps.push(listSnap(L,outro(L),{done:true}));return steps;};
}

