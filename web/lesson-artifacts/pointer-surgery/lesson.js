/* ================= Pointer Surgery Patterns: the lesson =================
   Every list is real nodes at fixed places, with its dummy before it on the left; the walkthroughs
   record a snapshot after each statement of real code (kit/lists.js ptrSnap), and every claim the
   prose makes about running code is checked below by running it. */

function psBuild(vals){var ns=ptrRow(vals),d=mkNode('·');d.x=-1;d.y=0;d.next=ns[0]||null;return {ns:ns,dummy:d,nodes:[d].concat(ns)};}
function psShow(a){return '['+a.join(',')+']';}

/* the page's code, as running code (code/solution.* and code/mistake.*, executed by check.py) */
function deleteAll(head,target,advancing){var dummy=mkNode('·');dummy.next=head;var prev=dummy;
  while(prev.next!==null){if(prev.next.value===target){prev.next=prev.next.next;if(advancing)prev=prev.next;}else prev=prev.next;}
  return dummy.next;}
/* the fast-and-slow guard the prose warns about: only fast is checked before reading fast.next.next */
function middleGuardOne(head){var slow=head,fast=head;while(fast!==null){slow=slow.next;fast=fast.next.next;}return slow;}
var GUARD_N=10;
(function selfCheck(){
  var seed=20261002,rnd=function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(var t=0;t<300;t++){var a=[],n=Math.floor(rnd()*9);for(var i=0;i<n;i++)a.push(Math.floor(rnd()*4));var tg=Math.floor(rnd()*4);
    if(ptrVals(deleteAll(ptrRow(a)[0]||null,tg)).join()!==a.filter(function(v){return v!==tg;}).join())throw new Error('delete check failed');}
  if(ptrVals(deleteAll(ptrRow([7,7,3])[0],7,true)).join()!=='7,3')throw new Error('advancing should leave [7,3]');
  var threw=false;try{deleteAll(ptrRow([3,7])[0],7,true);}catch(e){threw=true;}if(!threw)throw new Error('advancing should throw on [3,7]');
})();

/* ---------- the dummy delete, one snapshot per statement ---------- */
var PS_DEL=[['none behind prev','no node between the dummy and prev holds the target']];
function deleteSteps(vals,target,advancing){
  var G=psBuild(vals),prev=G.dummy,steps=[],splices=0;
  function rec(note,hi,done){steps.push(ptrSnap(note,{nodes:G.nodes,head:G.dummy,tags:{dummy:G.dummy,prev:prev},above:['dummy'],nil:{prev:{x:vals.length,y:0}},hi:hi||[],done:done,data:{kind:'del',target:target,splices:splices}}));}
  rec('The list '+psShow(vals)+'; delete every '+target+'. <code>prev</code> starts on the dummy, the head\'s predecessor.',[],true);
  while(prev.next!==null){
    var nx=prev.next;
    if(nx.value===target){prev.next=nx.next;splices++;
      rec(nx.value+' is a '+target+': <code>prev.next = prev.next.next</code>. '+(prev===G.dummy?'The dummy':'Node '+prev.value)+' now skips it.'+(advancing?'':' <code>prev</code> stays: <code>prev.next</code> is a node nobody has inspected.'),['next:'+prev.id],!advancing);
      if(advancing){prev=prev.next;
        if(prev===null){rec('<code>prev = prev.next</code> anyway, and that was the last node: <code>prev</code> is null, so the next check reads <code>null.next</code> and throws.',['prev'],true);return steps;}
        rec('<code>prev = prev.next</code> anyway: <code>prev</code> is now on '+prev.value+', which it never inspected'+(prev.value===target?', a '+target+' that stays in the list.':'.'),['prev'],true);}
    }else{prev=nx;rec(nx.value+' is not a '+target+': <code>prev = prev.next</code>, onto '+nx.value+'.',['prev'],true);}
  }
  var out=ptrVals(G.dummy.next);
  rec('<code>prev.next</code> is null: done. Return <code>dummy.next</code>: '+psShow(out)+'.',[],true);
  if(out.join()!==ptrVals(deleteAll(ptrRow(vals)[0]||null,target,advancing)).join())throw new Error('delete walkthrough disagrees with the code');
  return steps;
}

/* ---------- three moves ---------- */
function reverseMove(vals){
  var ns=ptrRow(vals),prev=null,curr=ns[0],nxt,steps=[];
  function rec(note,hi,done){var tags={prev:prev,curr:curr};if(nxt!==undefined)tags.nxt=nxt;steps.push(ptrSnap(note,{nodes:ns,head:prev||curr,tags:tags,above:[],nil:{prev:'left'},hi:hi||[],done:done,data:{kind:'rev'}}));}
  rec('Reverse '+ptrText(ns[0])+'. <code>prev</code> is null, <code>curr</code> the head.',[],true);
  while(curr!==null){nxt=curr.next;rec('Save <code>nxt = curr.next</code>: '+(nxt?nxt.value:'null')+'.',['nxt']);
    curr.next=prev;rec('Flip <code>curr.next = prev</code>: '+curr.value+' now points at '+(prev?prev.value:'null')+'.',['next:'+curr.id]);
    prev=curr;curr=nxt;nxt=undefined;rec('March: <code>prev</code> on '+prev.value+', <code>curr</code> on '+(curr?curr.value:'null')+'.',['prev','curr'],true);}
  rec('<code>curr</code> is null: <code>prev</code> heads '+ptrText(prev)+'.',[],true);return steps;
}
function middleMove(vals){
  var ns=ptrRow(vals),slow=ns[0],fast=ns[0],k=0,steps=[];
  function rec(note,hi){steps.push(ptrSnap(note,{nodes:ns,head:ns[0],tags:{slow:slow,fast:fast},above:[],hi:hi||[],done:true,data:{kind:'mid',k:k}}));}
  rec('Find the middle of '+ptrText(ns[0])+'. Both walkers start on the head.',[]);
  while(fast!==null&&fast.next!==null){slow=slow.next;fast=fast.next.next;k++;rec('<code>slow</code> one node, to '+slow.value+'; <code>fast</code> two, to '+(fast?fast.value:'null')+'.',['slow','fast']);}
  rec('<code>fast</code> cannot take another double step: <code>slow</code> is on '+slow.value+', the middle.',[]);return steps;
}
function gapMove(vals,n){
  var G=psBuild(vals),lead=G.dummy,trail=G.dummy,steps=[],open=false;
  function rec(note,hi,done){steps.push(ptrSnap(note,{nodes:G.nodes,head:G.dummy,tags:{dummy:G.dummy,lead:lead,trail:trail},above:['dummy'],hi:hi||[],done:done,data:{kind:'gap',n:n,open:open}}));}
  rec('Find the node '+n+' from the end of '+psShow(vals)+'. Both walkers start on the dummy.',[],true);
  for(var i=0;i<n;i++){lead=lead.next;open=i===n-1;rec('Open the gap: <code>lead</code> to '+lead.value+'.',['lead'],open);}
  while(lead.next!==null){lead=lead.next;trail=trail.next;rec('Both move one node: <code>lead</code> to '+lead.value+', <code>trail</code> to '+trail.value+'.',['lead','trail'],true);}
  rec('<code>lead</code> is on the last node, so <code>trail</code>, on '+(trail===G.dummy?'the dummy':trail.value)+', is the predecessor of '+trail.next.value+', the node '+n+' from the end.',[],true);return steps;
}
/* invariants, by move, read from the snapshot alone */
var PS_INV={del:PS_DEL,rev:[['two parts','prev heads the reversed part and curr the untouched rest; together they hold every node']],
  mid:[['fast = 2 × slow','fast is exactly twice as far from the head as slow']],gap:[['gap = n','the lead is exactly n nodes ahead of the trailer']]};
function psIdx(s,from,id){var w=snapWalk(s,from);return id===null?w.ids.length:w.ids.indexOf(id);}
function psCheck(s){var by={};s.nodes.forEach(function(n){by[n.id]=n;});
  switch(s.data.kind){
    case 'del':{var ok=true;for(var c=by[s.tags.dummy].next;c!==null&&c!==undefined&&s.tags.prev!==null;c=by[c].next){if(by[c].value===s.data.target){ok=false;break;}if(c===s.tags.prev)break;}
      if(s.tags.prev===s.tags.dummy)ok=true;return [ok];}
    case 'rev':{var a=snapWalk(s,s.tags.prev),b=snapWalk(s,s.tags.curr);return [a.ends&&b.ends&&a.ids.length+b.ids.length===s.nodes.length&&a.ids.every(function(x){return b.ids.indexOf(x)<0;})];}
    case 'mid':return [psIdx(s,s.head,s.tags.fast)===2*psIdx(s,s.head,s.tags.slow)];
    case 'gap':return [!s.data.open||psIdx(s,s.tags.dummy,s.tags.lead)-psIdx(s,s.tags.dummy,s.tags.trail)===s.data.n];
  }
}
function psFields(s,hiF,val){return Object.keys(s.tags).filter(function(k){return k!=='dummy';}).map(function(k){var id=s.tags[k];
  return '<span'+hiF(k)+'>'+k+' <b>'+(id===null?'null':(id===s.tags.dummy?'dummy':val(id)))+'</b></span>';}).join('');}
var PS_OPTS={inv:function(s){return PS_INV[s.data.kind];},check:psCheck,fields:psFields};

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountLesson();
  var make=function(h,o){return new ListPlayer(h,Object.assign(o,PS_OPTS));};
  mountPlayerTabs($('#dummy'),[[[7,7,3],7],[[1,7,2,7],7],[[7],7],[[1,2,3],7]].map(function(c){return {name:psShow(c[0]),steps:function(){return deleteSteps(c[0],c[1]);}};}),make,{id:'dummy'});
  mountPlayerTabs($('#trapper'),[{name:'advance only in else',steps:function(){return deleteSteps([7,7,3],7);}},{name:'advance every time',steps:function(){return deleteSteps([7,7,3],7,true);}}],make,{id:'trap'});
  mountPlayerTabs($('#moves'),[{name:'Reversal',steps:function(){return reverseMove([1,2,3,4]);}},{name:'Fast and slow',steps:function(){return middleMove([1,2,3,4,5]);}},{name:'A gap of 2',steps:function(){return gapMove([1,2,3,4,5],2);}}],make,{id:'moves'});
  /* the guard claim, run: only fast checked, on every length from 1 to GUARD_N */
  var odd=[],even=[];for(var n=1;n<=GUARD_N;n++){var r=[];for(var i=1;i<=n;i++)r.push(i);var threw=false;try{middleGuardOne(ptrRow(r)[0]);}catch(e){threw=true;}(threw?odd:even).push(n);}
  if(odd.some(function(n){return n%2===0;})||even.some(function(n){return n%2===1;}))throw new Error('the guard claim should split on parity');
  $('#movesNote').innerHTML='Guarding only <code>fast</code>, run on every length from 1 to '+GUARD_N+': it throws on '+odd.join(', ')+' and returns normally on '+even.join(', ')+'. On an even length <code>fast.next.next</code> happens to be null rather than unreadable, so tests that use only even lengths never see the bug.';
})();

/* ================= systems layer: the sentinel hero, animated banners ================= */
(function(){
  function heroSentinel(){
    var svg=$('#heroSentinel');if(!svg)return;
    var P=[['run','1'],['done','2'],['done','3'],['run','4'],['done','5']],x0=40,dx=86,y=140;
    var h='<defs><marker id="hsA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="context-stroke"/></marker></defs>'+
      '<text class="hd-lab" x="'+x0+'" y="60">a process list behind a sentinel; unlink the finished ones</text>'+
      '<rect class="hs-sent" x="'+(x0-26)+'" y="'+(y-22)+'" width="52" height="44" rx="10"/><text class="hd-lab" x="'+x0+'" y="'+(y+5)+'" text-anchor="middle">head</text>';
    var X=function(i){return x0+(i+1)*dx;};
    for(var i=0;i<P.length;i++)h+='<rect class="hs-p '+P[i][0]+'" data-i="'+i+'" x="'+(X(i)-26)+'" y="'+(y-22)+'" width="52" height="44" rx="10"/><text class="hd-val" x="'+X(i)+'" y="'+(y-1)+'" text-anchor="middle">p'+P[i][1]+'</text><text class="hs-st" x="'+X(i)+'" y="'+(y+14)+'" text-anchor="middle">'+P[i][0]+'</text>';
    h+='<g id="hsLinks"></g><text class="hs-cur" id="hsCur" y="'+(y+48)+'" text-anchor="middle">prev</text>';
    svg.innerHTML=h;
    /* one frame per node inspected: a finished one is unlinked and the cursor stays; a running one is stepped onto */
    var frames=[{gone:[],prev:-1,cap:'The cursor stands on the sentinel and inspects the next node'}],gone=[],prev=-1;
    P.forEach(function(p,j){if(p[0]==='done'){gone.push(j);frames.push({gone:gone.slice(),prev:prev,cap:'p'+p[1]+' finished: unlinked, and the cursor stays'+(prev<0?', on the sentinel: the first node is no special case':'')});}
      else{prev=j;frames.push({gone:gone.slice(),prev:prev,cap:'p'+p[1]+' is still running: the cursor moves onto it'});}});
    var num=$('#heroNum'),unit=$('#heroUnit'),cap=$('#heroCap');
    function show(k){var f=frames[k],chain=[-1].concat(P.map(function(_,i){return i;}).filter(function(i){return f.gone.indexOf(i)<0;})),xs=function(i){return i<0?x0:X(i);};
      svg.querySelectorAll('.hs-p').forEach(function(r){r.classList.toggle('gone',f.gone.indexOf(+r.dataset.i)>=0);});
      $('#hsLinks').innerHTML=chain.slice(1).map(function(i,n){var a=xs(chain[n]),b=xs(i);return '<line class="hs-link" x1="'+(a+26)+'" y1="'+y+'" x2="'+(b-29)+'" y2="'+y+'" marker-end="url(#hsA)"/>';}).join('');
      $('#hsCur').setAttribute('x',xs(f.prev));
      num.textContent=f.gone.length;unit.textContent=f.gone.length===1?'splice':'splices';cap.innerHTML=f.cap;}
    if(reduce||!M||!M.animate){show(frames.length-1);return;}
    var last=-1,K=frames.length-1;M.animate(0,K+2,{duration:(K+2)*1.6,ease:'linear',repeat:Infinity,onUpdate:function(v){var k=Math.min(K,Math.floor(v));if(k!==last){last=k;show(k);}}});
  }

  var banners={
    /* a dummy before the head */
    node:function(svg){
      var X=chainArt(svg,['·',7,3],200,42),d=S('text',{x:X(0)+35,y:30,class:'bn-t','text-anchor':'middle'},svg),p=S('text',{x:X(0)+35,y:104,class:'bn-t','text-anchor':'middle'},svg);
      return function(){M.animate(0,1,{duration:.6,delay:.3,onUpdate:function(v){d.textContent=v>.5?'dummy':'';p.textContent=v>.5?'prev':'';}});};
    },
    /* the 7 that a careless advance steps over */
    trap:function(svg){
      var X=chainArt(svg,[7,7,3],180,42),t=S('text',{y:104,class:'bn-t','text-anchor':'middle'},svg),big=S('text',{x:640,y:66,class:'bn-big red','text-anchor':'middle'},svg);t.textContent='prev';
      return function(){M.animate(0,1,{duration:1,delay:.4,onUpdate:function(v){t.setAttribute('x',X(v)+35);big.textContent=v>.9?'7 skipped':'';}});};
    },
    /* three names on one list */
    walk:function(svg){
      var X=chainArt(svg,[1,2,3,4],180,36),names=['prev','curr','nxt'].map(function(n,i){var e=S('text',{y:98,class:'bn-t','text-anchor':'middle'},svg);e.textContent=n;return e;});
      return function(){M.animate(0,2,{duration:2.2,ease:'easeInOut',onUpdate:function(v){names.forEach(function(e,i){var p=v+i-1;e.style.opacity=p<0||p>3?0:1;e.setAttribute('x',X(Math.max(0,Math.min(3,p)))+35);});}});};
    },
    /* nothing moved */
    insight:function(svg){
      var big=S('text',{x:360,y:64,class:'bn-big','text-anchor':'middle'},svg),sub=S('text',{x:360,y:96,class:'bn-t','text-anchor':'middle'},svg);sub.textContent='pointers re-aimed; values never copied';
      return function(){M.animate(0,1,{duration:.8,onUpdate:function(v){big.textContent='0 values moved';}});};
    }
  };
  heroSentinel();mountBanners(banners);kinetic();riseIn();
})();
