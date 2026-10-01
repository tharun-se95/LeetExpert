/* ================= Reverse Linked List: the lesson =================
   Every list on the page is real nodes, laid out where they start and never moved: the
   walkthroughs record a snapshot after each statement of real code (kit/lists.js ptrSnap), and
   every number the prose quotes is computed below by running the code it describes. */

function rlShow(a){return '['+a.join(',')+']';}
function rlList(vals){return ptrRow(vals)[0]||null;}

/* the page's code, as running code: each mirrors a file in code/, which the code gate runs in both languages */
var revWrites=0,revHeld=0,revDepth=0;
function revSolution(head){var prev=null,curr=head;revWrites=0;while(curr!==null){var nxt=curr.next;curr.next=prev;revWrites++;prev=curr;curr=nxt;}return prev;}
function revFlipFirst(head){var prev=null,curr=head;while(curr!==null){curr.next=prev;prev=curr;curr=curr.next;}return prev;}
function revReturnCurr(head){var prev=null,curr=head;while(curr!==null){var nxt=curr.next;curr.next=prev;prev=curr;curr=nxt;}return curr;}
function revNaive(head){var ns=[];for(var c=head;c!==null;c=c.next)ns.push(c);revHeld=ns.length;
  for(var i=ns.length-1;i>0;i--)ns[i].next=ns[i-1];if(!ns.length)return null;ns[0].next=null;return ns[ns.length-1];}
function revRecursive(head,d){d=d||1;revDepth=Math.max(revDepth,d);
  if(head===null||head.next===null)return head;var nh=revRecursive(head.next,d+1);head.next.next=head;head.next=null;return nh;}
function rlRange(n){var a=[];for(var i=1;i<=n;i++)a.push(i);return a;}

/* the sandbox's four lists; the expected answer is the array reversed, independent of any list code */
var CASES=[[1,2,3,4,5],[1,2],[1],[]];
(function selfCheck(){
  var seed=20261001,rnd=function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;},lists=CASES.slice();
  for(var t=0;t<60;t++){var n=Math.floor(rnd()*12),a=[];for(var k=0;k<n;k++)a.push(Math.floor(rnd()*9));lists.push(a);}
  lists.forEach(function(a){
    var want=a.slice().reverse().join();
    [revSolution,revNaive,function(h){revDepth=0;return revRecursive(h);}].forEach(function(f){if(ptrVals(f(rlList(a))).join()!==want)throw new Error('reversal check failed on '+rlShow(a));});
    revSolution(rlList(a));if(revWrites!==a.length)throw new Error('one write per node failed on '+rlShow(a));
    var ff=ptrVals(revFlipFirst(rlList(a))).join();if(ff!==a.slice(0,1).join())throw new Error('the flip-first claim failed on '+rlShow(a));
    if(revReturnCurr(rlList(a))!==null)throw new Error('return-curr claim failed');
  });
})();

/* ---------- the two-chain invariant, read from a snapshot alone ---------- */
var RL_INV=[['two chains','prev heads the nodes already flipped and curr the nodes not yet touched; each chain ends at null and every node is in exactly one'],
            ['nothing lost','every node can still be reached from prev, curr or nxt']];
function rlCheck(s){
  var a=snapWalk(s,s.tags.prev),b=snapWalk(s,s.tags.curr),seen={},dup=false;
  a.ids.concat(b.ids).forEach(function(id){if(seen[id])dup=true;seen[id]=1;});
  return [a.ends&&b.ends&&!dup&&a.ids.length+b.ids.length===s.nodes.length,s.live.length===s.nodes.length];
}
function rlFields(s,hiF,val){
  return ['prev','curr','nxt'].filter(function(k){return k in s.tags;}).map(function(k){var id=s.tags[k];return '<span'+hiF(k)+'>'+k+' <b>'+(id===null?'null':val(id))+'</b></span>';}).join('')+
    '<span'+hiF('writes')+'>writes <b>'+s.data.writes+'</b></span>';
}
var RL_OPTS={inv:RL_INV,check:rlCheck,fields:rlFields};

/* ---------- a walkthrough, one snapshot per statement ---------- */
function revSteps(vals,flipFirst){
  var ns=ptrRow(vals),prev=null,curr=ns[0]||null,nxt,writes=0,steps=[];
  function rec(note,hi,done){var tags={prev:prev,curr:curr};if(nxt!==undefined)tags.nxt=nxt;
    steps.push(ptrSnap(note,{nodes:ns,head:prev||curr,tags:tags,above:[],nil:{prev:'left'},hi:hi||[],done:done,data:{writes:writes}}));}
  function lost(){var live={};[prev,curr,nxt].forEach(function(r){for(var q=r;q&&!live[q.id];q=q.next)live[q.id]=1;});return ns.filter(function(n){return !live[n.id];});}
  rec(vals.length?'The list '+ptrText(ns[0])+'. <code>prev</code> starts at null: the flipped chain is empty. <code>curr</code> starts at the head: every node is still untouched.':
    'An empty list: <code>head</code> is null, so <code>curr</code> starts at null and the loop never runs.',[],true);
  while(curr!==null){
    if(!flipFirst){nxt=curr.next;rec('Save the lifeline: <code>nxt = curr.next</code>, which is '+(nxt?nxt.value:'null')+'. The next line overwrites the only pointer to it.',['nxt']);}
    curr.next=prev;writes++;
    var gone=lost();
    rec('Flip: <code>curr.next = prev</code>, so '+curr.value+' now points at '+(prev?prev.value:'null')+'.'+(gone.length?' Nothing names '+gone[0].value+' any more, so '+gone.map(function(n){return n.value;}).join(', ')+(gone.length>1?' are':' is')+' lost.':''),['next:'+curr.id]);
    prev=curr;
    if(flipFirst){curr=curr.next;rec('<code>prev = curr</code>, then <code>curr = curr.next</code>. But <code>curr.next</code> was just set to <code>prev</code>, '+(curr?curr.value:'null')+', so the walk turns back on itself and the loop ends.',['prev','curr'],true);break;}
    curr=nxt;
    rec('March: <code>prev = curr</code>, <code>curr = nxt</code>. Flipped: '+ptrText(prev)+'. Untouched: '+ptrText(curr)+'.',['prev','curr'],true);
  }
  var out=ptrVals(prev),gone=lost();
  rec(flipFirst&&gone.length?'Return <code>prev</code>: '+rlShow(out)+'. The other '+gone.length+' node'+(gone.length>1?'s are':' is')+' still in memory, but no pointer leads to '+(gone.length>1?'them':'it')+'.':
    (vals.length?'<code>curr</code> is null, so the untouched chain is empty. Return <code>prev</code>: '+ptrText(prev)+'.':'Return <code>prev</code>, which is null: the empty list reversed.'),[],true);
  var want=flipFirst?vals.slice(0,1):vals.slice().reverse();
  if(out.join()!==want.join())throw new Error('walkthrough of '+rlShow(vals)+' returned '+rlShow(out));
  return steps;
}

/* ---------- 1. by hand: four statements, any order ---------- */
function mountByHand(w){
  var VALS=[1,2,3,4,5],player=new ListPlayer(w.querySelector('.lvhost'),Object.assign({id:'hand'},RL_OPTS)),hint=$('#byhandHint');
  var ns,prev,curr,nxt,writes,history;
  function snap(note,hi){var tags={prev:prev,curr:curr};if(nxt!==undefined)tags.nxt=nxt;
    return ptrSnap(note,{nodes:ns,head:prev||curr,tags:tags,above:[],nil:{prev:'left'},hi:hi||[],done:nxt===undefined||nxt===curr,data:{writes:writes}});}
  function lostVals(){var live={};[prev,curr,nxt].forEach(function(r){for(var q=r;q&&!live[q.id];q=q.next)live[q.id]=1;});
    return ns.filter(function(n){return !live[n.id];}).map(function(n){return n.value;});}
  function name(n){return n===null?'null':String(n.value);}
  /* each statement, run on the real nodes; the caption says what changed */
  var OPS={
    save:function(){nxt=curr.next;return ['<code>nxt = curr.next</code>: <code>nxt</code> now names '+name(nxt)+'.',['nxt']];},
    flip:function(){var before=lostVals().length;curr.next=prev;writes++;var gone=lostVals();
      return ['<code>curr.next = prev</code>: '+curr.value+(prev===curr?' now points at itself.':' now points at '+name(prev)+'.')+
        (gone.length>before?' Nothing names '+gone.join(', ')+' any more: '+(gone.length>1?'they are':'it is')+' lost, and no statement can get '+(gone.length>1?'them':'it')+' back.':''),['next:'+curr.id]];},
    prev:function(){prev=curr;return ['<code>prev = curr</code>: <code>prev</code> now names '+name(prev)+'.',['prev']];},
    curr:function(){curr=nxt;var done=curr===null&&lostVals().length===0&&ptrVals(prev).join()===VALS.slice().reverse().join();
      return ['<code>curr = nxt</code>: <code>curr</code> now names '+name(curr)+'.'+(done?' The untouched chain is empty and <code>prev</code> heads '+ptrText(prev)+': reversed. Return <code>prev</code>.':''),['curr']];}
  };
  function label(){
    w.querySelectorAll('[data-op]').forEach(function(b){var op=b.dataset.op;b.disabled=(op==='curr'?nxt===undefined||curr===nxt:curr===null);});
    var gone=lostVals().length;
    hint.textContent=gone?gone+(gone>1?' nodes':' node')+' lost: start again':(curr===null?'curr is null: nothing left to flip':'pick any statement');
  }
  function reset(){
    ns=ptrRow(VALS);prev=null;curr=ns[0];nxt=undefined;writes=0;history=[];
    player.load([snap('The list '+ptrText(ns[0])+'. <code>prev</code> is null and <code>curr</code> is the head. Run the four statements in any order.')]);label();
  }
  w.querySelectorAll('[data-op]').forEach(function(b){b.addEventListener('click',function(){
    if(player.busy())return;var r=OPS[b.dataset.op]();history.push(b.dataset.op);player.push([snap(r[0],r[1])]);label();});});
  w.querySelector('.reset').addEventListener('click',reset);
  onRepaint(player.redraw);
  /* size the stage and its caption for every state a learner can reach: the full correct run, a flip
     made too early, and a node pointed at itself */
  var all=[];
  [['save','flip','prev','curr','save','flip','prev','curr','save','flip','prev','curr','save','flip','prev','curr','save','flip','prev','curr'],
   ['flip','prev','save','curr'],['prev','flip','save','curr','save']].forEach(function(seq,si){
    ns=ptrRow(VALS);prev=null;curr=ns[0];nxt=undefined;writes=0;all.push(snap(''));
    seq.forEach(function(op){if(op==='curr'&&nxt===undefined)return;if(op!=='curr'&&curr===null)return;var r=OPS[op]();all.push(snap(r[0],r[1]));});
    /* the full run must end reversed with nothing lost, or the captions it sized for are not what a learner sees */
    if(si===0&&(ptrVals(prev).join()!==VALS.slice().reverse().join()||lostVals().length||writes!==VALS.length))throw new Error('by-hand: the correct order does not reverse the list');
    if(si===1&&lostVals().length!==VALS.length-1)throw new Error('by-hand: flipping first should lose '+(VALS.length-1)+' nodes');});
  player.sizeTo(all);player.reserve(all.map(function(s){return s.note;}).concat(['The list '+ptrText(ptrRow(VALS)[0])+'. <code>prev</code> is null and <code>curr</code> is the head. Run the four statements in any order.']),all);
  reset();
}

/* ---------- 2. predict where prev and curr stand ---------- */
function stateAfter(vals,k){var ns=ptrRow(vals),prev=null,curr=ns[0];for(var i=0;i<k&&curr;i++){var nxt=curr.next;curr.next=prev;prev=curr;curr=nxt;}return {prev:prev,curr:curr};}
function pc(st){return 'prev '+(st.prev?st.prev.value:'null')+', curr '+(st.curr?st.curr.value:'null');}
var PREDICT=[1,3,5].map(function(k){
  var V=[1,2,3,4,5],right=stateAfter(V,k),c={k:k,vals:V,expect:pc(right),state:right};
  var opts=[pc(right)];
  if(k>0)opts.push(pc(stateAfter(V,k-1)));
  if(k<V.length)opts.push(pc(stateAfter(V,k+1)));
  /* the slip that confuses the flipped chain's head with its tail: prev left on the first node */
  opts.push(pc({prev:ptrRow(V)[0],curr:right.curr}));
  c.choices=opts.filter(function(o,i){return opts.indexOf(o)===i;}).sort();
  return c;
});
function mountGuess(host){
  mountPredict(host,PREDICT,{
    question:function(c){return 'Run the loop on <code>'+rlShow(c.vals)+'</code>. After <b>'+c.k+'</b> pass'+(c.k>1?'es':'')+' of the loop, where do <code>prev</code> and <code>curr</code> stand?';},
    choices:function(c){return c.choices;},
    draw:function(view,c){
      var row=el('div','pl-mini','<span>'+ptrText(rlList(c.vals))+'</span>');view.appendChild(row);
      return {reveal:function(){row.innerHTML='<span>flipped: '+ptrText(c.state.prev)+'</span><span>untouched: '+ptrText(c.state.curr)+'</span>';}};
    },
    why:function(c){return 'Each pass moves one node from the untouched chain to the flipped one, so after '+c.k+' pass'+(c.k>1?'es':'')+' the first '+c.k+' node'+(c.k>1?'s are':' is')+' flipped. <code>prev</code> names the last node moved, '+(c.state.prev?c.state.prev.value:'null')+', and <code>curr</code> the first one left, '+(c.state.curr?c.state.curr.value:'null')+'.'+
      (c.k>1?' The flipped chain starts at <code>prev</code> and ends at 1, the old head: 1 is its tail, not its head.':'');}
  });
}

/* ---------- 3. the cost of the array version ---------- */
function mountCost(){
  var pts=[];
  for(var n=0;n<=64;n+=8){revNaive(rlList(rlRange(n)));if(revHeld!==n)throw new Error('array held '+revHeld+' at n='+n);pts.push([n,revHeld,3]);}
  costChart($('#cost'),{names:['array beside the list: one per node','three pointers: prev, curr, nxt'],ylabel:'references held at once',pts:pts,xlabel:'nodes in the list',xticks:[0,16,32,48,64],
    aria:'References held at once while reversing: the array version holds one per node, 64 at 64 nodes; the three-pointer loop holds 3 at every size.'});
  revNaive(rlList(rlRange(5000)));
  $('#costNote').innerHTML='Counted by running both: at 64 nodes the array holds <b>'+fmt(pts[pts.length-1][1])+'</b> references while the loop holds 3, and at the constraint\'s 5000 the array holds <b>'+fmt(revHeld)+'</b>. Both write each <code>next</code> once; only the memory differs.';
}

/* ---------- the numbers lesson.md quotes as {{name}}: computed here, never typed ---------- */
function listWords(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];}
var FACTS=(function(){
  revSolution(rlList(rlRange(5)));var writes5=revWrites;
  revNaive(rlList(rlRange(5000)));var held=revHeld;
  revDepth=0;var r=revRecursive(rlList(rlRange(5000)));if(ptrVals(r).length!==5000)throw new Error('recursive reversal at 5000 failed');
  var rc=CASES.map(function(c){return rlShow(ptrVals(revReturnCurr(rlList(c))));});
  if(rc.some(function(x){return x!=='[]';}))throw new Error('return-curr fact failed');
  return {flipFirstAnswers:listWords(CASES.map(function(c){return rlShow(ptrVals(revFlipFirst(rlList(c))));})),
    writes5:writes5,naiveRefs:fmt(held),returnCurrAnswers:'[] on all '+CASES.length,recFrames:fmt(revDepth)};
})();

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountLesson();
  mountByHand($('#byhand'));
  mountGuess($('#predict'));
  mountPlayerTabs($('#trapper'),[{name:'Save, then flip',steps:function(){return revSteps([1,2,3,4]);}},{name:'Flip first',steps:function(){return revSteps([1,2,3,4],true);}}],
    function(h,o){return new ListPlayer(h,Object.assign(o,RL_OPTS));},{id:'trap'});
  $('#trapNote').innerHTML='Run on the lesson\'s four test lists, flipping first returns '+FACTS.flipFirstAnswers+'. Saving first returns '+listWords(CASES.map(function(c){return rlShow(ptrVals(revSolution(rlList(c))));}))+'.';
  mountCost();
  mountPlayerTabs($('#stepper'),CASES.map(function(c){return {name:c.length?rlShow(c):'[ ] (empty)',steps:function(){return revSteps(c);}};}),
    function(h,o){return new ListPlayer(h,Object.assign(o,RL_OPTS));},{id:'walk'});
})();

/* ================= systems layer: the FAT chain hero, animated banners ================= */
(function(){
  function heroFlip(){
    var svg=$('#heroFlip');if(!svg)return;
    var ADDR=[4,9,1,7,11],bw=86,bh=62,gap=20,x0=(560-(5*bw+4*gap))/2,y=96,ax=function(i){return x0+i*(bw+gap);};
    var a2=function(a){return '#'+(a<10?'0':'')+a;};
    var h='<defs><marker id="hfA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="context-stroke"/></marker></defs>'+
      '<text class="hd-lab" x="'+x0+'" y="40">a log file, block by block, in file order</text>';
    for(var i=0;i<4;i++){
      h+='<line class="hf-fw" data-i="'+i+'" x1="'+(ax(i)+bw)+'" y1="'+(y+20)+'" x2="'+(ax(i+1)-3)+'" y2="'+(y+20)+'" marker-end="url(#hfA)"/>';
      h+='<line class="hf-bw" data-i="'+i+'" x1="'+ax(i+1)+'" y1="'+(y+42)+'" x2="'+(ax(i)+bw+3)+'" y2="'+(y+42)+'" marker-end="url(#hfA)"/>';}
    ADDR.forEach(function(a,i){
      h+='<rect class="hd-node" data-i="'+i+'" x="'+ax(i)+'" y="'+y+'" width="'+bw+'" height="'+bh+'" rx="10"/>'+
        '<text class="hd-val" x="'+(ax(i)+bw/2)+'" y="'+(y+26)+'" text-anchor="middle">'+a2(a)+'</text>'+
        '<text class="hd-nx" data-i="'+i+'" x="'+(ax(i)+bw/2)+'" y="'+(y+48)+'" text-anchor="middle"></text>';});
    ['prev','curr','nxt'].forEach(function(t){h+='<text class="hf-tag" data-t="'+t+'" y="'+(y+bh+28)+'" text-anchor="middle">'+t+'</text>';});
    h+='<text class="hd-lab" id="hfDir" x="'+x0+'" y="252"></text>';
    svg.innerHTML=h;
    var num=$('#heroNum'),unit=$('#heroUnit'),cap=$('#heroCap');
    function entry(i,k){return i<k?(i===0?'next ∅':'next '+a2(ADDR[i-1])):(i===4?'next ∅':'next '+a2(ADDR[i+1]));}
    function show(k){/* k entries rewritten */
      svg.querySelectorAll('.hf-fw').forEach(function(e){e.classList.toggle('on',+e.dataset.i>=k);});
      svg.querySelectorAll('.hf-bw').forEach(function(e){e.classList.toggle('on',+e.dataset.i<k-1);});
      svg.querySelectorAll('.hd-node').forEach(function(e){e.classList.toggle('lit',+e.dataset.i<k);});
      svg.querySelectorAll('.hd-nx').forEach(function(e){var i=+e.dataset.i;e.textContent=entry(i,k);e.classList.toggle('lit',i<k);});
      var at={prev:k-1,curr:k,nxt:k+1};
      svg.querySelectorAll('.hf-tag').forEach(function(e){var i=at[e.dataset.t];e.style.opacity=i>=0&&i<5?1:0;if(i>=0&&i<5)e.setAttribute('x',ax(i)+bw/2);});
      num.textContent=k;unit.textContent=k===1?'entry':'entries';
      $('#hfDir').textContent=k===5?'the file now starts at '+a2(ADDR[4])+' and runs backwards':'';
      cap.innerHTML=k===0?'Each entry is the only record of the block after it':(k<5?'Next: save '+a2(ADDR[k])+'\'s entry, '+(k<4?a2(ADDR[k+1]):'∅')+', then rewrite it to name '+a2(ADDR[k-1]):'Five entries rewritten, three addresses held at a time');
    }
    if(reduce||!M||!M.animate){show(5);return;}
    var last=-1;M.animate(0,7,{duration:7*1.9,ease:'linear',repeat:Infinity,onUpdate:function(v){var k=Math.min(5,Math.floor(v));if(k!==last){last=k;show(k);}}});
  }

  function arrowDefs(svg){svg.insertAdjacentHTML('afterbegin','<defs><marker id="bnRA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="context-stroke"/></marker></defs>');}
  var banners={
    /* four nodes; their arrows turn round one at a time */
    problem:function(svg){
      arrowDefs(svg);var X=chainArt(svg,[1,2,3,4],170,42),fw=[],bw=[];
      for(var i=0;i<3;i++){fw.push(S('line',{x1:X(i)+60,y1:56,x2:X(i+1)-3,y2:56,class:'bn-path','marker-end':'url(#bnRA)'},svg));
        bw.push(S('line',{x1:X(i+1),y1:70,x2:X(i)+73,y2:70,class:'bn-path b2','marker-end':'url(#bnRA)',style:'opacity:0'},svg));}
      return function(){for(var i=0;i<3;i++)(function(i){M.animate(0,1,{duration:.4,delay:.4+i*.6,onUpdate:function(v){fw[i].style.opacity=1-v;bw[i].style.opacity=v;}});})(i);};
    },
    /* three names walk the chain together */
    attempt:function(svg){
      var X=chainArt(svg,[1,2,3,4,5],100,30),tags=['prev','curr','nxt'].map(function(t){var e=S('text',{y:96,class:'bn-t','text-anchor':'middle'},svg);e.textContent=t;return e;});
      return function(){M.animate(0,3,{duration:2.4,ease:'easeInOut',onUpdate:function(v){tags.forEach(function(e,j){var p=v+j-1;e.style.opacity=p<0||p>4?0:1;e.setAttribute('x',X(Math.max(0,Math.min(4,p)))+35);});}});};
    },
    /* flip first: the first node's next goes to ∅ and the rest fades out */
    trap:function(svg){
      arrowDefs(svg);var g1=S('g',{},svg),g2=S('g',{},svg);chainArt(g1,[1],120,40);var X=chainArt(g2,[2,3,4],224,40);
      [0,1].forEach(function(i){S('line',{x1:X(i)+60,y1:58,x2:X(i+1)-3,y2:58,class:'bn-path','marker-end':'url(#bnRA)'},g2);});
      var big=S('text',{x:600,y:58,class:'bn-big red','text-anchor':'middle'},svg),sub=S('text',{x:600,y:84,class:'bn-t','text-anchor':'middle'},svg);
      return function(){M.animate(0,1,{duration:.8,delay:.6,onUpdate:function(v){g2.style.opacity=1-.62*v;big.textContent=v>.5?'3 lost':'';sub.textContent=v>.5?'nothing names 2':'';}});};
    },
    /* two chains: one node at a time crosses from untouched to flipped */
    insight:function(svg){
      S('line',{x1:360,x2:360,y1:18,y2:104,class:'bn-edge',style:'stroke-dasharray:4 4'},svg);
      var l=S('text',{x:180,y:20,class:'bn-t','text-anchor':'middle'},svg),r=S('text',{x:540,y:20,class:'bn-t','text-anchor':'middle'},svg);l.textContent='flipped';r.textContent='untouched';
      var boxes=[1,2,3,4].map(function(v){var g=S('g',{},svg);S('rect',{x:-26,y:-16,width:52,height:32,rx:8,class:'bn-mid'},g);var t=S('text',{y:5,class:'bn-t','text-anchor':'middle',style:'font-size:14px;font-weight:600'},g);t.textContent=v;return g;});
      /* k nodes flipped, node k u of the way across: the flipped ones make room, the untouched close up */
      function place(k,u){boxes.forEach(function(g,i){
        var x=i<k?300-(k-1-i)*62-62*u:(i===k?420-120*u:420+(i-k)*62-62*u);
        g.setAttribute('transform','translate('+x+',64)');});}
      place(0,0);
      return function(){M.animate(0,4,{duration:4,ease:'linear',onUpdate:function(v){var k=Math.min(3,Math.floor(v)),u=v-k;if(v>=4){k=4;u=0;}place(k,Math.min(1,u*1.6));}});};
    },
    /* one write per node: a counter that ends on n */
    solution:function(svg){
      S('rect',{x:60,y:52,width:520,height:14,rx:7,class:'bn-track'},svg);var fill=S('rect',{x:60,y:52,width:0,height:14,rx:7,class:'bn-bar'},svg);
      var big=S('text',{x:60,y:36,class:'bn-big'},svg);big.textContent='0 writes';
      var memo=S('text',{x:580,y:96,class:'bn-t','text-anchor':'end'},svg);memo.textContent='held at once: prev, curr, nxt';
      return function(){M.animate(0,5,{duration:2.6,ease:'easeOut',onUpdate:function(v){fill.setAttribute('width',520*v/5);var k=Math.round(v);big.textContent=k+(k===1?' write':' writes')+' for 5 nodes';}});};
    }
  };
  heroFlip();mountBanners(banners);kinetic();riseIn();
})();
