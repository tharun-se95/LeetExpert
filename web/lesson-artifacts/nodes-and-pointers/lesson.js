/* ================= Nodes and Pointers: the lesson =================
   Every list is real nodes at fixed places: an insert drops the new node into the gap below where it
   joins, so the page shows the one thing the lesson claims, that nothing moves but addresses. The
   walkthroughs record a snapshot after each statement of real code (kit/lists.js ptrSnap), and every
   number the prose and charts show is computed below by running the code it describes. */

/* the page's code, as running code (code/solution.* and code/mistake.*, executed by check.py) */
function npGet(head,i){var node=head;for(var k=0;k<i;k++)node=node.next;return node;}
function npInsert(node,value,swapped){var n=mkNode(value);if(swapped){node.next=n;n.next=node.next;}else{n.next=node.next;node.next=n;}return n;}
/* load-time check: random inserts and walks against a plain array, and the swapped writes' self-loop */
(function selfCheck(){
  var seed=20261002,rnd=function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(var t=0;t<200;t++){var A=[],n=1+Math.floor(rnd()*8);for(var k=0;k<n;k++)A.push(Math.floor(rnd()*9));var head=ptrRow(A)[0];
    for(var q=0;q<6;q++){var i=Math.floor(rnd()*A.length),v=Math.floor(rnd()*9);npInsert(npGet(head,i),v);A.splice(i+1,0,v);
      if(ptrText(head)!==A.join(' → ')+' → null')throw new Error('insert check failed');if(npGet(head,i+1).value!==v)throw new Error('get check failed');}}
  var h=ptrRow([7,3,12])[0],m=npInsert(npGet(h,1),9,true);if(m.next!==m||ptrVals(h).join()!=='7,3,9')throw new Error('the swapped writes should make 9 point at itself');
})();
/* originals two slots apart on row 0, so a node inserted after one drops into the gap below it */
function npSpaced(vals){var ns=vals.map(function(v,i){var n=mkNode(v);n.x=2*i;n.y=0;return n;});ns.forEach(function(n,i){n.next=ns[i+1]||null;});return ns;}

/* ---------- invariants and fields, from a snapshot alone ---------- */
var NP_INV=[['ends at null','following next from the head reaches null'],['nothing lost','every node can be reached from the head']];
function npCheck(s){var w=snapWalk(s,s.head);return [w.ends,w.ids.length===s.nodes.length];}
function npFields(s,hiF,val){
  return Object.keys(s.tags).map(function(k){var id=s.tags[k];return '<span'+hiF(k)+'>'+k+' <b>'+(id===null?'null':val(id))+'</b></span>';}).join('')+
    '<span'+hiF('writes')+'>writes <b>'+s.data.writes+'</b></span>';
}
var NP_OPTS={inv:NP_INV,check:npCheck,fields:npFields};

/* an insert, one snapshot per statement */
function insertSteps(ns,after,value,swapped,writes,steps,lead){
  var head=ns[0],node=after,created=mkNode(value);created.x=after.x+1;created.y=1;ns.push(created);
  function rec(note,hi,done){steps.push(ptrSnap(note,{nodes:ns,head:head,tags:{node:node,new:created},above:[],hi:hi||[],done:done,data:{writes:writes}}));}
  rec((lead||'')+'Make a node holding '+value+'. The allocator puts it wherever there is room; nothing points at it yet.',[]);
  if(!swapped){created.next=node.next;writes++;rec('<code>new.next = node.next</code>: the new node points where '+node.value+' points, '+(created.next?'at '+created.next.value:'at null')+'.',['next:'+created.id]);
    node.next=created;writes++;rec('<code>node.next = new</code>: '+node.value+' now points at '+value+'. Two writes, and no node moved.',['next:'+node.id],true);}
  else{node.next=created;writes++;rec('<code>node.next = new</code> first: '+node.value+' points at '+value+', and nothing points at '+'the rest any more.',['next:'+node.id]);
    created.next=node.next;writes++;rec('<code>new.next = node.next</code> now reads the new node: '+value+' points at itself. A walk from the head reads '+ptrVals(head).join(', ')+', '+value+', '+value+', … and never ends.',['next:'+created.id],true);}
  return writes;
}

/* ---------- 1. insert after a node, by hand ---------- */
function mountPlay(w){
  var START=[7,3,12],ADD={7:9,3:4,12:6},player=new ListPlayer(w.querySelector('.lvhost'),Object.assign({id:'play'},NP_OPTS)),btns=$('#playBtns'),hint=$('#playHint'),ns,writes,used;
  function intro(){return ptrSnap('The list 7 → 3 → 12, three nodes wherever memory had room. Insert a value after any of them.',{nodes:ns,head:ns[0],tags:{},hi:[],done:true,data:{writes:0}});}
  function label(){btns.querySelectorAll('button').forEach(function(b){b.disabled=!!used[b.dataset.v];});
    var n=Object.keys(used).length;hint.textContent=n?n+' insert'+(n>1?'s':'')+', '+writes+' writes, 0 nodes moved':'each insert is two writes';}
  function reset(){ns=npSpaced(START);writes=0;used={};player.load([intro()]);label();}
  START.forEach(function(v){var b=el('button','btn2','Insert '+ADD[v]+' after '+v);b.type='button';b.dataset.v=v;btns.appendChild(b);
    b.addEventListener('click',function(){if(player.busy()||used[v])return;used[v]=1;var after=ns.filter(function(n){return n.value===v&&n.y===0;})[0],steps=[];
      writes=insertSteps(ns,after,ADD[v],false,writes,steps);player.push(steps);label();});});
  w.querySelector('.reset').addEventListener('click',reset);
  onRepaint(player.redraw);
  /* size the stage for all three inserts made, and reserve every caption they can show */
  ns=npSpaced(START);writes=0;var all=[intro()];START.forEach(function(v){var after=ns.filter(function(n){return n.value===v&&n.y===0;})[0];writes=insertSteps(ns,after,ADD[v],false,writes,all);});
  if(ptrVals(ns[0]).join()!=='7,9,3,4,12,6')throw new Error('the three inserts should give 7, 9, 3, 4, 12, 6');
  player.sizeTo(all);player.reserve(all.map(function(s){return s.note;}),all);
  reset();
}

/* ---------- 2. walk to node i ---------- */
function walkSteps(vals,i){
  var ns=ptrRow(vals),node=ns[0],hops=0,steps=[];
  function rec(note,hi){steps.push(ptrSnap(note,{nodes:ns,head:ns[0],tags:{node:node},above:[],hi:hi||[],done:true,data:{writes:0,hops:hops}}));}
  rec('<code>get(head, '+i+')</code>. Start at the head, '+node.value+'. The only way to node '+i+' is through every node before it.',[]);
  for(var k=0;k<i;k++){node=node.next;hops++;rec('Follow <code>next</code> to '+node.value+'. '+hops+' of '+i+'.',['node']);}
  rec('Node '+i+' is '+node.value+', reached in <b>'+hops+'</b> step'+(hops===1?'':'s')+'. An array would have computed its address in one.',[]);
  if(npGet(ptrRow(vals)[0],i).value!==vals[i])throw new Error('walk check failed');
  return steps;
}

/* ---------- 3. binary search on a sorted list, counted ---------- */
/* holding the node at the range's start, each round walks to the middle; returns links followed */
function listBinaryHops(L,target){var lo=0,hi=L-1,hops=0;
  while(lo<=hi){var mid=(lo+hi)>>1;hops+=mid-lo;if(mid===target)return hops;if(mid<target){lo=mid+1;hops+=1;}else hi=mid-1;}return hops;}
function mountCost(){
  var pts=[];for(var L=8;L<=64;L+=8){var worst=0;for(var t=0;t<L;t++)worst=Math.max(worst,listBinaryHops(L,t));pts.push([L,worst,L-1]);}
  var last=pts[pts.length-1];
  if(pts.some(function(p){return p[1]>2*p[0];}))throw new Error('binary search hops should stay within about L');
  costChart($('#cost'),{names:['binary search, walking to each middle','scan from the head'],ylabel:'links followed, worst case',pts:pts,xlabel:'nodes in the sorted list',xticks:[0,16,32,48,64],
    aria:'Worst-case links followed to find a value in a sorted linked list: binary search walking to each middle follows '+last[1]+' at 64 nodes, a plain scan '+last[2]+'; both grow linearly.'});
  $('#costNote').innerHTML='Counted by running both on every target: at 64 nodes binary search follows up to <b>'+last[1]+'</b> links, because each round walks from the range\'s start to its middle, and a scan from the head follows up to <b>'+last[2]+'</b>. Both grow in step with L; the halving saves comparisons, not walking.';
}

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountLesson();
  mountPlay($('#play'));
  mountCost();
  var make=function(h,o){return new ListPlayer(h,Object.assign(o,NP_OPTS));};
  mountPlayerTabs($('#walker'),[0,1,2,3].map(function(i){return {name:'i = '+i,steps:function(){return walkSteps([7,3,12,5],i);}};}),
    function(h,o){return new ListPlayer(h,Object.assign(o,{inv:[],check:function(){return [];},fields:function(s,hiF,val){return '<span>node <b>'+val(s.tags.node)+'</b></span><span>steps <b>'+s.data.hops+'</b></span>';}}));},{id:'walk'});
  mountPlayerTabs($('#trapper'),[false,true].map(function(sw){return {name:sw?'node.next first':'new.next first',steps:function(){var ns=npSpaced([7,3,12]),steps=[ptrSnap('The list 7 → 3 → 12. Insert 9 after 3.',{nodes:ns,head:ns[0],tags:{},hi:[],done:true,data:{writes:0}})];
    insertSteps(ns,ns[1],9,sw,0,steps);return steps;}};}),make,{id:'trap'});
})();

/* ================= systems layer: the heap hero, animated banners ================= */
(function(){
  function heroHeap(){
    var svg=$('#heroHeap');if(!svg)return;
    /* twelve memory slots; the list's objects sit at scattered ones, and the new object lands in a free one */
    var SLOTS=12,bw=40,gap=4,x0=(560-(SLOTS*bw+(SLOTS-1)*gap))/2,y=150,AT=[1,9,4,10],VAL=[7,3,12,5],NEW=6,NV=9;
    var cx=function(s){return x0+s*(bw+gap)+bw/2;},hx=function(s){return '0x'+(16+s*8).toString(16);};
    var h='<defs><marker id="hhA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="context-stroke"/></marker></defs>'+
      '<text class="hd-lab" x="'+x0+'" y="66">memory, by address: the list\'s objects are wherever there was room</text>';
    for(var s=0;s<SLOTS;s++)h+='<rect class="hh-slot" x="'+(x0+s*(bw+gap))+'" y="'+(y-22)+'" width="'+bw+'" height="44" rx="6"/><text class="hh-addr" x="'+cx(s)+'" y="'+(y+40)+'" text-anchor="middle">'+hx(s)+'</text>';
    /* links arc above the strip, from object to object in list order */
    function arc(a,b,cls,id){var x1=cx(a),x2=cx(b),top=y-22-18-Math.abs(x2-x1)*.18;return '<path class="'+cls+'" id="'+id+'" d="M'+x1+','+(y-24)+' C'+x1+','+top+' '+x2+','+top+' '+x2+','+(y-26)+'" marker-end="url(#hhA)"/>';}
    h+=arc(AT[0],AT[1],'hh-l','hh01')+arc(AT[1],AT[2],'hh-l','hh12')+arc(AT[2],AT[3],'hh-l','hh23')+arc(AT[1],NEW,'hh-l nw','hh1n')+arc(NEW,AT[2],'hh-l nw','hhn2');
    AT.forEach(function(s,i){h+='<rect class="hh-obj" x="'+(x0+s*(bw+gap)+3)+'" y="'+(y-19)+'" width="'+(bw-6)+'" height="38" rx="5"/><text class="hd-val" x="'+cx(s)+'" y="'+(y+5)+'" text-anchor="middle">'+VAL[i]+'</text>';});
    h+='<rect class="hh-obj nw" id="hhNew" x="'+(x0+NEW*(bw+gap)+3)+'" y="'+(y-19)+'" width="'+(bw-6)+'" height="38" rx="5"/><text class="hd-val nw" id="hhNewT" x="'+cx(NEW)+'" y="'+(y+5)+'" text-anchor="middle">'+NV+'</text>';
    svg.innerHTML=h;
    var num=$('#heroNum'),unit=$('#heroUnit'),cap=$('#heroCap');
    function show(k){/* 0: the list; 1: new object allocated; 2: new.next written; 3: old.next written */
      $('#hhNew').style.opacity=k>=1?1:0;$('#hhNewT').style.opacity=k>=1?1:0;
      $('#hhn2').style.opacity=k>=2?1:0;$('#hh1n').style.opacity=k>=3?1:0;$('#hh12').style.opacity=k>=3?0:1;
      num.textContent=0;unit.textContent='objects';
      cap.innerHTML=['The list 7 → 3 → 12 → 5, scattered','New object 9 lands in a free slot','<code>new.next</code> ← the address of 12','<code>3.next</code> ← the address of 9: two writes'][k];
    }
    if(reduce||!M||!M.animate){show(3);return;}
    var last=-1;M.animate(0,5,{duration:5*1.8,ease:'linear',repeat:Infinity,onUpdate:function(v){var k=Math.min(3,Math.floor(v));if(k!==last){last=k;show(k);}}});
  }

  var banners={
    /* a node: a value and an address */
    node:function(svg){
      var g=S('g',{},svg);S('rect',{x:250,y:30,width:180,height:56,rx:12,class:'bn-mid'},g);S('line',{x1:350,x2:350,y1:30,y2:86,class:'bn-edge'},g);
      var v=S('text',{x:300,y:64,class:'bn-t','text-anchor':'middle',style:'font-size:18px;font-weight:600'},g);v.textContent='7';
      var a=S('text',{x:390,y:63,class:'bn-t','text-anchor':'middle'},g);
      var l1=S('text',{x:300,y:110,class:'bn-t','text-anchor':'middle'},svg),l2=S('text',{x:390,y:110,class:'bn-t','text-anchor':'middle'},svg);l1.textContent='value';l2.textContent='next';
      return function(){M.animate(0,1,{duration:.6,delay:.4,onUpdate:function(t){a.textContent=t>.5?'0x48':'';}});};
    },
    /* one link at a time */
    walk:function(svg){
      var X=chainArt(svg,[7,3,12,5],170,36),t=S('text',{y:100,class:'bn-t','text-anchor':'middle'},svg),c=S('text',{x:620,y:62,class:'bn-big','text-anchor':'middle'},svg);t.textContent='node';
      return function(){M.animate(0,3,{duration:2.4,ease:'linear',onUpdate:function(v){t.setAttribute('x',X(v)+35);c.textContent=Math.floor(v)+' steps';}});};
    },
    /* the swapped writes: a node pointing at itself */
    trap:function(svg){
      chainArt(svg,[7,3],150,42);var g=S('g',{},svg);chainArt(g,[12],480,42);
      var loop=S('path',{d:'M392,42 C392,6 352,6 352,40',class:'bn-path b2',style:'fill:none;opacity:0'},svg),n=S('rect',{x:330,y:42,width:70,height:36,rx:8,class:'bn-mid',style:'opacity:0'},svg);
      var t=S('text',{x:356,y:65,class:'bn-t','text-anchor':'middle',style:'font-size:14px;font-weight:600;opacity:0'},svg);t.textContent='9';
      var big=S('text',{x:660,y:66,class:'bn-big bad','text-anchor':'middle'},svg);
      return function(){M.animate(0,1,{duration:1,delay:.4,onUpdate:function(v){n.style.opacity=v;t.style.opacity=v;loop.style.opacity=v;g.style.opacity=1-.6*v;big.textContent=v>.5?'12 lost':'';}});};
    }
  };
  heroHeap();mountBanners(banners);kinetic();riseIn();
})();
