/* ================= Linked List Cycle: the lesson =================
   Every list is real nodes at fixed places; a looping list is laid out as a rho, its tail on the top
   row and its loop as a box over two rows, so the cycle is a shape on the stage. The walkthroughs
   record a snapshot after each statement of real code (kit/lists.js ptrSnap), and every number the
   prose quotes is computed below by running the code it describes. */

/* the test's input: values, and pos, the index the tail links back to (-1: no cycle). Placed as a rho:
   the a tail nodes along row 0, then the C loop nodes, the first ceil(C / 2) on row 0 and the rest
   coming back along row 1, so the back link is one short arrow up or across. */
function clBuild(vals,pos){
  var ns=vals.map(function(v){return mkNode(v);}),C=pos<0?0:vals.length-pos,top=Math.ceil(C/2);
  ns.forEach(function(n,i){n.next=ns[i+1]||null;
    if(pos<0||i<pos){n.x=i;n.y=0;return;}
    var j=i-pos;if(j<top){n.x=pos+j;n.y=0;}else{n.x=pos+top-1-(j-top);n.y=1;}});
  if(pos>=0&&ns.length)ns[ns.length-1].next=ns[pos];
  return {ns:ns,head:ns[0]||null,a:pos<0?vals.length:pos,C:C};
}
function clShow(c){return '['+c.vals.join(',')+']'+(c.pos>=0?', pos = '+c.pos:', no cycle');}

/* the page's code, as running code: each mirrors a file in code/, which the code gate runs in both languages */
var clPasses=0;
function cycFloyd(head){var slow=head,fast=head;clPasses=0;
  while(fast!==null&&fast.next!==null){slow=slow.next;fast=fast.next.next;clPasses++;if(slow===fast)return true;}return false;}
function cycSeen(head){var seen=new Set();for(var n=head;n!==null;n=n.next){if(seen.has(n))return true;seen.add(n);}cycSeen.held=seen.size;return false;}
function cycValues(head){var slow=head,fast=head;while(fast!==null&&fast.next!==null){slow=slow.next;fast=fast.next.next;if(fast!==null&&slow.value===fast.value)return true;}return false;}
function cycCheckFirst(head){var slow=head,fast=head;while(fast!==null&&fast.next!==null){if(slow===fast)return true;slow=slow.next;fast=fast.next.next;}return false;}
/* the follow-up: the entry node, by a third phase from the head */
function cycEntry(head){var slow=head,fast=head;while(fast!==null&&fast.next!==null){slow=slow.next;fast=fast.next.next;
  if(slow===fast){var probe=head;while(probe!==slow){probe=probe.next;slow=slow.next;}return probe;}}return null;}

/* the sandbox's eight lists; whether each has a cycle is read from pos, not from any list code */
var CASES=[{vals:[3,2,0,-4],pos:1},{vals:[1,2],pos:0},{vals:[1],pos:0},{vals:[1,2],pos:-1},{vals:[1],pos:-1},{vals:[],pos:-1},{vals:[1,2,3,4,5],pos:4},{vals:[1,1,1,1],pos:-1}];
var maxPasses=0,ENTRY_A=12,ENTRY_C=12;
(function selfCheck(){
  CASES.forEach(function(c){var want=c.pos>=0;
    if(cycFloyd(clBuild(c.vals,c.pos).head)!==want||cycSeen(clBuild(c.vals,c.pos).head)!==want)throw new Error('cycle check failed on '+clShow(c));});
  /* every list of up to 100 nodes, the tail linked back to every node and to none: the walkers stop within n passes */
  for(var n=1;n<=100;n++)for(var pos=-1;pos<n;pos++){var vals=[];for(var i=0;i<n;i++)vals.push(i);var L=clBuild(vals,pos),r=cycFloyd(L.head);
    if(r!==(pos>=0))throw new Error('Floyd failed at n='+n+' pos='+pos);
    if(pos>=0&&clPasses>L.a+L.C)throw new Error('met later than a + C at n='+n+' pos='+pos);
    if(clPasses>n)throw new Error('more than n passes at n='+n+' pos='+pos);maxPasses=Math.max(maxPasses,clPasses);}
  /* the follow-up's claim, on every tail length and loop length up to the bounds the page quotes */
  for(var a=0;a<=ENTRY_A;a++)for(var C=1;C<=ENTRY_C;C++){var v=[];for(var q=0;q<a+C;q++)v.push(q);var L2=clBuild(v,a);
    if(cycEntry(L2.head)!==L2.ns[a])throw new Error('entry check failed at a='+a+' C='+C);}
})();

/* ---------- invariant and fields, from a snapshot alone ---------- */
var CL_INV=[['fast = 2 × slow','fast has taken exactly twice as many steps as slow']];
function clCheck(s){return [s.data.fast===2*s.data.slow];}
/* the gap: how many nodes fast must move forward to reach slow, once both are in the loop */
function clGap(s){
  if(s.tags.slow===null||s.tags.fast===null||!s.data.C)return null;
  var w=snapWalk(s,s.head),loop=w.ids.slice(s.data.a),i=loop.indexOf(s.tags.slow),j=loop.indexOf(s.tags.fast);
  return i<0||j<0?null:(i-j+s.data.C)%s.data.C;
}
function clFields(s,hiF,val){
  var g=clGap(s);
  return ['slow','fast'].map(function(k){var id=s.tags[k];return '<span'+hiF(k)+'>'+k+' <b>'+(id===null?'null':val(id))+'</b></span>';}).join('')+
    '<span'+hiF('passes')+'>passes <b>'+s.data.slow+'</b></span><span'+hiF('gap')+'>gap <b>'+(g===null?'–':g)+'</b></span>';
}
var CL_OPTS={inv:CL_INV,check:clCheck,fields:clFields};

/* ---------- Floyd, one snapshot per pass ---------- */
function floydSteps(c,byValue){
  var L=clBuild(c.vals,c.pos),slow=L.head,fast=L.head,k=0,steps=[];
  function rec(note,hi){steps.push(ptrSnap(note,{nodes:L.ns,head:L.head,tags:{slow:slow,fast:fast},hi:hi||[],done:true,data:{slow:k,fast:2*k,a:L.a,C:L.C}}));}
  rec(!c.vals.length?'An empty list: <code>fast</code> is null from the start, so the loop never runs. Return false.':
    'The list '+ptrText(L.head)+'. Both walkers start on the head. Each pass: <code>slow</code> one node, <code>fast</code> two, then compare.',[]);
  var answer=false;
  while(fast!==null&&fast.next!==null){
    slow=slow.next;fast=fast.next.next;k++;
    var same=slow===fast,eqVal=fast!==null&&slow.value===fast.value,hit=byValue?eqVal:same;
    var s=ptrSnap('',{nodes:L.ns,head:L.head,tags:{slow:slow,fast:fast},done:true,data:{slow:k,fast:2*k,a:L.a,C:L.C}}),g=clGap(s);
    var note='Pass '+k+': <code>slow</code> to '+slow.value+', <code>fast</code> to '+(fast?fast.value:'null')+'.';
    if(byValue)note+=hit?(same?' Same node: a cycle.':' Equal values, '+slow.value+' and '+fast.value+', on <b>different</b> nodes. The check says cycle, and it is wrong.'):' The values differ.';
    else note+=same?' The same node: the list has a cycle. Return true.':(g!==null?' Both are in the loop; <code>fast</code> is '+g+' node'+(g>1?'s':'')+' behind <code>slow</code>.':' Not the same node.');
    rec(note,['slow','fast']);
    if(hit){answer=true;break;}
  }
  if(!answer&&c.vals.length)rec('<code>fast</code> '+(fast===null?'is null':'has no next')+': it reached the end of the list. Return false: no cycle.',[]);
  if(!byValue&&answer!==(c.pos>=0))throw new Error('Floyd walkthrough disagrees on '+clShow(c));
  return steps;
}
/* one reader with no memory: as many steps as the list could ever need, if it ended */
function readerSteps(c,limit){
  var L=clBuild(c.vals,c.pos),node=L.head,k=0,steps=[];
  function rec(note){steps.push(ptrSnap(note,{nodes:L.ns,head:L.head,tags:{node:node},done:true,data:{slow:0,fast:0,a:L.a,C:L.C}}));}
  rec('One reader starts at the head and follows <code>next</code>, counting steps. It remembers nothing else.');
  while(node!==null&&k<limit){node=node.next;k++;
    rec(node===null?'Step '+k+': <code>next</code> is null. Only now does the reader know: this list ends, so it has no cycle.':
      'Step '+k+': node '+node.value+'. Still not null'+(k>=c.vals.length?', and the reader has taken more steps than a list this size would need. But it does not know the size, so it cannot tell.':'.'));}
  return steps;
}
/* the follow-up: after the meeting, probe from the head and slow, both at speed one */
function entrySteps(c){
  var L=clBuild(c.vals,c.pos),slow=L.head,fast=L.head,k=0,steps=[],probe;
  while(true){slow=slow.next;fast=fast.next.next;k++;if(slow===fast)break;}
  function rec(note,hi){var tags={slow:slow};if(probe!==undefined)tags.probe=probe;else tags.fast=fast;
    steps.push(ptrSnap(note,{nodes:L.ns,head:L.head,tags:tags,hi:hi||[],done:true,data:{slow:0,fast:0,a:L.a,C:L.C}}));}
  rec('The walkers met on '+slow.value+' after '+k+' pass'+(k>1?'es':'')+'.',['slow','fast']);
  probe=L.head;rec('Start <code>probe</code> at the head. From now on <code>probe</code> and <code>slow</code> both move one node per step.',['probe']);
  var m=0;while(probe!==slow){probe=probe.next;slow=slow.next;m++;
    rec('Step '+m+': <code>probe</code> to '+probe.value+', <code>slow</code> to '+slow.value+'.'+(probe===slow?' They meet on '+probe.value+', where the loop starts: the tail is '+m+' node'+(m>1?'s':'')+' long.':''),['probe','slow']);}
  if(m===0)rec('<code>probe</code> starts on the head, which is where <code>slow</code> already is: the loop starts at the head, and the tail is empty.',[]);
  if(probe!==L.ns[c.pos])throw new Error('entry walkthrough missed the entry on '+clShow(c));
  return steps;
}

/* ---------- predict the meeting pass ---------- */
var PREDICT=[CASES[0],{vals:[1,2,3,4,5,6],pos:2},CASES[6]].map(function(c){cycFloyd(clBuild(c.vals,c.pos).head);var L=clBuild(c.vals,c.pos);return {c:c,expect:clPasses,a:L.a,C:L.C};});
function mountGuess(host){
  mountPredict(host,PREDICT,{
    question:function(p){return 'The list <code>'+clShow(p.c)+'</code>: a tail of '+p.a+' node'+(p.a===1?'':'s')+' and a loop of '+p.C+'. On which pass do <code>slow</code> and <code>fast</code> first land on the same node?';},
    choices:function(p){var lo=Math.max(1,p.expect-2);return [lo,lo+1,lo+2,lo+3,lo+4];},
    draw:function(view,p){var row=el('div','pl-mini','<span>'+ptrText(clBuild(p.c.vals,p.c.pos).head)+'</span>');view.appendChild(row);
      return {reveal:function(){row.innerHTML+='<span>they meet on pass '+p.expect+'</span>';}};},
    why:function(p){return 'After '+p.a+' pass'+(p.a===1?'':'es')+' <code>slow</code> enters the loop of '+p.C+'. From then on the gap from <code>fast</code> to <code>slow</code> shrinks by one per pass until it is zero, which here happens on pass '+p.expect+'. Step through it in the walkthrough below to see the gap count down.';}
  });
}

/* ---------- the set's memory, counted ---------- */
function mountCost(){
  var pts=[];for(var n=0;n<=64;n+=8){var v=[];for(var i=0;i<n;i++)v.push(i);cycSeen(clBuild(v,-1).head);if(cycSeen.held!==n)throw new Error('set held '+cycSeen.held+' at n='+n);pts.push([n,cycSeen.held,2]);}
  costChart($('#cost'),{names:['remember every node: one set entry each','Floyd: slow and fast'],ylabel:'held at once',pts:pts,xlabel:'nodes in the list',xticks:[0,16,32,48,64],
    aria:'Memory held while checking a list with no cycle: the set holds one entry per node, '+pts[pts.length-1][1]+' at 64 nodes; Floyd holds 2 at every size.'});
  var big=[];for(var b=0;b<10000;b++)big.push(b);cycSeen(clBuild(big,-1).head);
  $('#costNote').innerHTML='Counted by running it: on a list of 64 nodes with no cycle the set ends with <b>'+pts[pts.length-1][1]+'</b> entries, and at the constraint\'s 10⁴ with <b>'+fmt(cycSeen.held)+'</b>. Floyd\'s walkers hold 2 references at every size.';
}

/* ---------- the numbers lesson.md quotes as {{name}}: computed here, never typed ---------- */
function listWords(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];}
var FACTS=(function(){
  var wrong=CASES.filter(function(c){return cycCheckFirst(clBuild(c.vals,c.pos).head)!==(c.pos>=0);});
  if(!wrong.length)throw new Error('check-first mistake should be wrong somewhere');
  return {maxPasses:maxPasses,entryTails:ENTRY_A,entryLoops:ENTRY_C,
    checkFirstAnswers:'reports a cycle on '+listWords(wrong.map(function(c){return '['+c.vals.join(',')+']';}))+', which have none, and is right on the other '+(CASES.length-wrong.length)};
})();

/* ---------- assemble ---------- */
(function(){
  readPal();
  var make=function(h,o){return new ListPlayer(h,Object.assign(o,CL_OPTS));};
  mountLesson({entrybox:function(b){mountPlayerTabs($('#entry',b),[CASES[0],{vals:[1,2,3,4,5,6],pos:2},{vals:[1,2,3],pos:0}].map(function(c){return {name:clShow(c),steps:function(){return entrySteps(c);}};}),make,{id:'entry'});}});
  mountPlayerTabs($('#walk1'),[{name:'[1,2,3,4,5], loop back to 3',steps:function(){return readerSteps({vals:[1,2,3,4,5],pos:2},9);}},{name:'[1,2,3,4,5,6,7], no loop',steps:function(){return readerSteps({vals:[1,2,3,4,5,6,7],pos:-1},9);}}],
    function(h,o){return new ListPlayer(h,Object.assign(o,{inv:[],check:function(){return [];},fields:function(s,hiF,val){return '<span>node <b>'+(s.tags.node===null?'null':val(s.tags.node))+'</b></span>';}}));},{id:'one'});
  mountGuess($('#predict'));
  mountCost();
  var V={vals:[1,1,1,1],pos:-1};
  mountPlayerTabs($('#trapper'),[{name:'slow is fast',steps:function(){return floydSteps(V);}},{name:'slow.val == fast.val',steps:function(){return floydSteps(V,true);}}],make,{id:'trap'});
  $('#trapNote').innerHTML='Run on [1,1,1,1]: comparing nodes returns <b>'+cycFloyd(clBuild(V.vals,V.pos).head)+'</b>, the right answer; comparing values returns <b>'+cycValues(clBuild(V.vals,V.pos).head)+'</b>.';
  mountPlayerTabs($('#stepper'),[CASES[0],CASES[6],CASES[1],CASES[3]].map(function(c){return {name:clShow(c),steps:function(){return floydSteps(c);}};}),make,{id:'walk'});
})();

/* ================= systems layer: the looping file hero================= */
(function(){
  function heroLoop(){
    var svg=$('#heroLoop');if(!svg)return;
    /* six blocks: #04 → #09 → #01 → #07 → #11 → #02, and #02's entry corrupt, naming #01 again */
    var ADDR=[4,9,1,7,11,2],P=[[70,110],[170,110],[270,110],[370,110],[370,210],[270,210]],L=clBuild(ADDR,2);
    var a2=function(a){return '#'+(a<10?'0':'')+a;};
    var h='<defs><marker id="hlA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="context-stroke"/></marker></defs>'+
      '<text class="hd-lab" x="40" y="54">a file\'s blocks; the last entry is corrupt</text>';
    var E=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,2]];
    E.forEach(function(e,i){var a=P[e[0]],b=P[e[1]],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d,r=24;
      h+='<line class="hl-edge'+(i===5?' bad':'')+'" x1="'+(a[0]+ux*r)+'" y1="'+(a[1]+uy*r)+'" x2="'+(b[0]-ux*(r+3))+'" y2="'+(b[1]-uy*(r+3))+'" marker-end="url(#hlA)"/>';});
    P.forEach(function(p,i){h+='<circle class="hl-b" data-i="'+i+'" cx="'+p[0]+'" cy="'+p[1]+'" r="22"/><text class="hd-val" x="'+p[0]+'" y="'+(p[1]+5)+'" text-anchor="middle">'+a2(ADDR[i])+'</text>';});
    h+='<text class="hl-tag" id="hlS" text-anchor="middle">slow</text><text class="hl-tag fast" id="hlF" text-anchor="middle">fast</text>';
    svg.innerHTML=h;
    var steps=[],slow=L.head,fast=L.head,idx=function(n){return L.ns.indexOf(n);};
    steps.push([0,0]);while(true){slow=slow.next;fast=fast.next.next;steps.push([idx(slow),idx(fast)]);if(slow===fast)break;}
    var num=$('#heroNum'),unit=$('#heroUnit'),cap=$('#heroCap'),K=steps.length-1;
    function show(k){var st=steps[k],ps=P[st[0]],pf=P[st[1]],same=st[0]===st[1];
      $('#hlS').setAttribute('x',ps[0]);$('#hlS').setAttribute('y',ps[1]+(ps[1]>150?44:-32));
      $('#hlF').setAttribute('x',pf[0]);$('#hlF').setAttribute('y',pf[1]+(pf[1]>150?44:-32)+(same?(pf[1]>150?16:-16):0));
      svg.querySelectorAll('.hl-b').forEach(function(c){c.classList.toggle('met',k===K&&+c.dataset.i===st[0]);});
      num.textContent=k;unit.textContent=k===1?'round':'rounds';
      cap.innerHTML=k===K?'Both readers on <b>'+a2(ADDR[st[0]])+'</b>: the chain loops':'One reader follows one entry per round, the other two';
    }
    if(reduce||!M||!M.animate){show(K);return;}
    var last=-1;M.animate(0,K+2,{duration:(K+2)*1.6,ease:'linear',repeat:Infinity,onUpdate:function(v){var k=Math.min(K,Math.floor(v));if(k!==last){last=k;show(k);}}});
  }

  heroLoop();kinetic();riseIn();
})();
