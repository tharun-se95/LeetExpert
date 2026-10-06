/* ================= Merge Two Sorted Lists: the lesson =================
   list1's nodes stand on the top row, list2's on the bottom row and the dummy between them on the
   left, each where it starts, so the merged chain shows as a zigzag of rewired arrows and no node
   ever moves. The walkthroughs record a snapshot after each statement of real code (kit/lists.js
   ptrSnap), and every number the prose quotes is computed below by running the code it describes. */

function mgBuild(a,b){var A=ptrRow(a,0),B=ptrRow(b,1),d=mkNode('·');d.x=-1;d.y=.5;
  return {A:A,B:B,dummy:d,nodes:[d].concat(A,B),l1:A[0]||null,l2:B[0]||null};}
function mgShow(a){return '['+a.join(',')+']';}

/* the page's code, as running code: each mirrors a file in code/, which the code gate runs in both languages.
   mgCmp counts comparisons; mgSteps counts loop passes plus nodes walked to attach the leftover. */
var mgCmp=0,mgSteps=0;
function mergeSolution(l1,l2,strict){var dummy=mkNode('·'),tail=dummy;mgCmp=0;
  while(l1!==null&&l2!==null){mgCmp++;if(strict?l1.value<l2.value:l1.value<=l2.value){tail.next=l1;l1=l1.next;}else{tail.next=l2;l2=l2.next;}tail=tail.next;}
  tail.next=l1!==null?l1:l2;mgSteps=mgCmp+1;return dummy.next;}
function mergeNoRemainder(l1,l2){var dummy=mkNode('·'),tail=dummy;
  while(l1!==null&&l2!==null){if(l1.value<=l2.value){tail.next=l1;l1=l1.next;}else{tail.next=l2;l2=l2.next;}tail=tail.next;}return dummy.next;}
function mergeNoDummy(l1,l2){if(l1===null)return l2;if(l2===null)return l1;var head;
  if(l1.value<=l2.value){head=l1;l1=l1.next;}else{head=l2;l2=l2.next;}var tail=head;
  while(l1!==null&&l2!==null){if(l1.value<=l2.value){tail.next=l1;l1=l1.next;}else{tail.next=l2;l2=l2.next;}tail=tail.next;}
  tail.next=l1!==null?l1:l2;return head;}
/* the costed alternative the page describes but does not show: it walks the leftover node by node */
function mergeWalkRest(l1,l2){var dummy=mkNode('·'),tail=dummy;mgSteps=0;
  while(l1!==null&&l2!==null){mgSteps++;if(l1.value<=l2.value){tail.next=l1;l1=l1.next;}else{tail.next=l2;l2=l2.next;}tail=tail.next;}
  var rest=l1!==null?l1:l2;while(rest!==null){mgSteps++;tail.next=rest;tail=rest;rest=rest.next;}return dummy.next;}
function mgList(a){return ptrRow(a)[0]||null;}

/* the sandbox's four inputs; the expected merge is the two arrays concatenated and sorted, independent of any list code */
var CASES=[[[1,2,4],[1,3,4]],[[],[]],[[],[0]],[[5],[1,2,3]]];
var SPLICE_CHECKS=300;
(function selfCheck(){
  var seed=20261001,rnd=function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;},pairs=CASES.slice();
  for(var t=0;t<SPLICE_CHECKS;t++){var m=Math.floor(rnd()*9),n=Math.floor(rnd()*9),a=[],b=[];
    for(var i=0;i<m;i++)a.push(Math.floor(rnd()*6));for(var j=0;j<n;j++)b.push(Math.floor(rnd()*6));
    pairs.push([a.sort(function(x,y){return x-y;}),b.sort(function(x,y){return x-y;})]);}
  pairs.forEach(function(p,k){
    var want=p[0].concat(p[1]).sort(function(x,y){return x-y;}).join();
    var A=ptrRow(p[0]),B=ptrRow(p[1]),before=A.concat(B),out=mergeSolution(A[0]||null,B[0]||null),seen=[];
    for(var c=out;c;c=c.next)seen.push(c);
    if(seen.map(function(n){return n.value;}).join()!==want)throw new Error('merge failed on '+mgShow(p[0])+' + '+mgShow(p[1]));
    if(seen.length!==before.length||before.some(function(n){return seen.indexOf(n)<0;}))throw new Error('merge did not splice the input nodes');
    if(mgCmp>Math.max(0,p[0].length+p[1].length-1))throw new Error('more than m + n - 1 comparisons');
    if(ptrVals(mergeNoDummy(mgList(p[0]),mgList(p[1]))).join()!==want)throw new Error('no-dummy merge failed');
    if(ptrVals(mergeWalkRest(mgList(p[0]),mgList(p[1]))).join()!==want)throw new Error('walk-rest merge failed');
    /* stability: with <= every tie is taken from list1 first, read off the nodes themselves */
    var A2=ptrRow(p[0]),B2=ptrRow(p[1]),o2=[];for(var q=mergeSolution(A2[0]||null,B2[0]||null);q;q=q.next)o2.push(q);
    for(var z=0;z+1<o2.length;z++)if(o2[z].value===o2[z+1].value&&B2.indexOf(o2[z])>=0&&A2.indexOf(o2[z+1])>=0)throw new Error('<= should take ties from list1 first');
  });
})();

/* ---------- invariants and fields, from a snapshot alone ---------- */
var MG_INV=[['merged is sorted','dummy.next through tail are the nodes taken so far, in sorted order'],['tail ≤ fronts','tail holds no value larger than either list\'s front']];
function mgCheck(s){
  var by={};s.nodes.forEach(function(n){by[n.id]=n;});
  var vals=[],c=by[s.tags.dummy].next,seen={};
  if(s.tags.tail!==s.tags.dummy)for(;c!==null&&!seen[c];c=by[c].next){seen[c]=1;vals.push(by[c].value);if(c===s.tags.tail)break;}
  var sorted=vals.every(function(v,i){return i===0||vals[i-1]<=v;});
  var t=s.tags.tail===s.tags.dummy?-Infinity:by[s.tags.tail].value,ok=true;
  ['l1','l2'].forEach(function(k){if(s.tags[k]!==null&&s.tags[k]!==undefined&&by[s.tags[k]].value<t)ok=false;});
  return [sorted,ok];
}
function mgFields(s,hiF,val){
  return ['l1','l2','tail'].map(function(k){var id=s.tags[k];return '<span'+hiF(k)+'>'+k+' <b>'+(id===null?'null':(id===s.tags.dummy?'dummy':val(id)))+'</b></span>';}).join('')+
    '<span'+hiF('cmp')+'>compared <b>'+s.data.cmp+'</b></span>';
}
var MG_OPTS={inv:MG_INV,check:mgCheck,fields:mgFields};

/* ---------- a walkthrough: two snapshots per comparison ---------- */
function mergeSteps(a,b,o){
  o=o||{};var G=mgBuild(a,b),l1=G.l1,l2=G.l2,tail=G.dummy,cmp=0,steps=[];
  function rec(note,hi,done){steps.push(ptrSnap(note,{nodes:G.nodes,head:G.dummy,tags:{dummy:G.dummy,tail:tail,l1:l1,l2:l2},above:['dummy'],
    nil:{l1:{x:a.length,y:0},l2:{x:b.length,y:1}},hi:hi||[],done:done,data:{cmp:cmp}}));}
  rec('list1 is '+mgShow(a)+' and list2 is '+mgShow(b)+'. <code>tail</code> starts on the dummy, before the merged list\'s first node.',[],true);
  while(l1!==null&&l2!==null){
    cmp++;var take1=o.strict?l1.value<l2.value:l1.value<=l2.value,pick=take1?l1:l2,
      why=l1.value===l2.value?(take1?' A tie: <code>&lt;=</code> takes list1\'s first.':' A tie: <code>&lt;</code> is false, so list2\'s goes first.'):'';
    tail.next=pick;
    rec('Compare the fronts: '+l1.value+' and '+l2.value+'.'+why+' Link '+pick.value+' from '+(take1?'list1':'list2')+' on: <code>tail.next = '+(take1?'list1':'list2')+'</code>.',['next:'+tail.id]);
    if(take1)l1=l1.next;else l2=l2.next;tail=pick;
    rec((take1?'<code>list1</code>':'<code>list2</code>')+' moves on, to '+((take1?l1:l2)?(take1?l1:l2).value:'null')+', and <code>tail</code> moves onto '+tail.value+'.',[take1?'l1':'l2','tail'],true);
  }
  var rest=l1!==null?l1:l2,restName=l1!==null?'list1':'list2';
  if(!o.noRest&&(a.length||b.length)){tail.next=rest;
    rec(rest?(restName==='list1'?'list2':'list1')+' is empty. Everything left in '+restName+', '+ptrText(rest)+', is linked on by one write: <code>tail.next = '+restName+'</code>.':
      'Both lists are empty. <code>tail.next</code> becomes null.',['next:'+tail.id],true);}
  var out=ptrVals(G.dummy.next);
  rec(o.noRest&&rest?'The loop ended, and this version returns at once. <code>dummy.next</code> gives '+mgShow(out)+': '+ptrText(rest).replace(/ → null$/,'')+' never joined it.':
    'Return <code>dummy.next</code>: '+mgShow(out)+'.',[],true);
  var want=o.noRest?ptrVals(mergeNoRemainder(mgList(a),mgList(b))):a.concat(b).sort(function(x,y){return x-y;});
  if(out.join()!==want.join())throw new Error('merge walkthrough returned '+mgShow(out));
  return steps;
}

/* ---------- 1. by hand ---------- */
function mountByHand(w){
  var A0=[1,4,6],B0=[2,3,7],player=new ListPlayer(w.querySelector('.lvhost'),Object.assign({id:'hand'},MG_OPTS)),G,l1,l2,tail,cmp,attached;
  function snap(note,hi){return ptrSnap(note,{nodes:G.nodes,head:G.dummy,tags:{dummy:G.dummy,tail:tail,l1:l1,l2:l2},above:['dummy'],
    nil:{l1:{x:A0.length,y:0},l2:{x:B0.length,y:1}},hi:hi||[],done:true,data:{cmp:cmp}});}
  var b1=w.querySelector('[data-take="l1"]'),b2=w.querySelector('[data-take="l2"]'),br=w.querySelector('[data-take="rest"]');
  function label(){
    b1.innerHTML=l1?'Take '+l1.value+' from list1':'list1 is empty';b2.innerHTML=l2?'Take '+l2.value+' from list2':'list2 is empty';
    b1.disabled=!l1||attached;b2.disabled=!l2||attached;br.disabled=attached||!!(l1&&l2)||!(l1||l2);
  }
  function take(which){
    var pick=which==='l1'?l1:l2,other=which==='l1'?l2:l1,ok=!other||pick.value<=other.value;
    tail.next=pick;if(which==='l1')l1=l1.next;else l2=l2.next;tail=pick;
    return snap('Linked '+pick.value+' on after the merged part'+(other?(ok?', the smaller front.':', but '+other.value+' in the other list is smaller: the merged list is now out of order.'):'.')+
      (l1&&l2?'':' One list is empty: attach the rest.'),[which,'tail','next:'+pick.id]);
  }
  function reset(){G=mgBuild(A0,B0);l1=G.l1;l2=G.l2;tail=G.dummy;cmp=0;attached=false;
    player.load([snap('list1 is '+mgShow(A0)+' and list2 is '+mgShow(B0)+'. Take whichever front belongs next.')]);label();}
  [b1,b2].forEach(function(b){b.addEventListener('click',function(){if(player.busy())return;player.push([take(b.dataset.take)]);label();});});
  br.addEventListener('click',function(){if(player.busy())return;var rest=l1||l2,name=l1?'list1':'list2';tail.next=rest;attached=true;
    var out=ptrVals(G.dummy.next),sorted=out.every(function(v,i){return i===0||out[i-1]<=v;});
    player.push([snap('One write links the rest of '+name+' on. The merged list is '+mgShow(out)+(sorted?': sorted, made of the original six nodes.':', which is not sorted.'),['next:'+tail.id])]);label();});
  w.querySelector('.reset').addEventListener('click',reset);
  onRepaint(player.redraw);
  /* size the stage and caption for the states a learner can reach: the right order, and a wrong first pick */
  var all=[];[['l1','l2','l2','l1','l1'],['l2','l1','l1','l2']].forEach(function(seq){
    G=mgBuild(A0,B0);l1=G.l1;l2=G.l2;tail=G.dummy;cmp=0;attached=false;all.push(snap('list1 is '+mgShow(A0)+' and list2 is '+mgShow(B0)+'. Take whichever front belongs next.'));
    seq.forEach(function(k){if((k==='l1'?l1:l2))all.push(take(k));});});
  player.sizeTo(all);player.reserve(all.map(function(s){return s.note;}).concat(['One write links the rest of list2 on. The merged list is [1,2,3,4,6,7]: sorted, made of the original six nodes.']),all);
  reset();
}

/* ---------- 2. predict the comparisons ---------- */
var PREDICT=[[[1,2,4],[1,3,4]],[[5],[1,2,3]],[[1,2,3],[4,5,6]]].map(function(p){mergeSolution(mgList(p[0]),mgList(p[1]));return {p:p,expect:mgCmp};});
function mountGuess(host){
  mountPredict(host,PREDICT,{
    question:function(c){return 'list1 = <code>'+mgShow(c.p[0])+'</code>, list2 = <code>'+mgShow(c.p[1])+'</code>. How many times does the loop compare two fronts?';},
    choices:function(c){var lo=Math.max(1,c.expect-2);return [lo,lo+1,lo+2,lo+3,lo+4,lo+5].filter(function(v){return v<=c.p[0].length+c.p[1].length;});},
    draw:function(view,c){var row=el('div','pl-mini','<span>'+mgShow(c.p[0])+'</span><span>'+mgShow(c.p[1])+'</span>');view.appendChild(row);
      return {reveal:function(){row.innerHTML+='<span>'+c.expect+' comparison'+(c.expect>1?'s':'')+', then one write</span>';}};},
    why:function(c){var n=c.p[0].length+c.p[1].length,left=n-c.expect;
      return 'Each comparison links one node, and the loop stops the moment either list is empty. Here that is after '+c.expect+' comparison'+(c.expect>1?'s':'')+', with '+left+' node'+(left>1?'s':'')+' left in the other list, linked on by a single write: no comparison is needed for '+(left>1?'them':'it')+'.';}
  });
}

/* ---------- 3. the leftover, walked against linked ---------- */
function mountCost(){
  var pts=[];for(var n=0;n<=48;n+=6){var b=[];for(var i=1;i<=n;i++)b.push(i);
    mergeSolution(mgList([0]),mgList(b));var one=mgSteps;mergeWalkRest(mgList([0]),mgList(b));pts.push([n,mgSteps,one]);}
  var last=pts[pts.length-1];
  costChart($('#cost'),{names:['walk the leftover node by node','link the leftover in one write'],ylabel:'steps',pts:pts,xlabel:'nodes left in list2 after list1 runs out',xticks:[0,12,24,36,48],
    aria:'Steps to merge [0] with a list of n larger values: walking the leftover takes '+last[1]+' steps at n = 48 and grows with n; linking it takes '+last[2]+' at every size.'});
  $('#costNote').innerHTML='Counted by running both on list1 = [0] and list2 = [1 … n]: one comparison empties list1, then the walking version takes a step per leftover node, <b>'+last[1]+'</b> in all at n = 48, while the one-write version takes <b>'+last[2]+'</b>.';
}

/* ---------- the numbers lesson.md quotes as {{name}}: computed here, never typed ---------- */
function listWords(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];}
var FACTS=(function(){
  mergeSolution(mgList([1,2,4]),mgList([1,3,4]));var c=mgCmp;
  return {cmpExample:c+' comparison'+(c>1?'s':''),spliceChecks:fmt(SPLICE_CHECKS),
    noRemainderAnswers:listWords(CASES.map(function(p){return mgShow(ptrVals(mergeNoRemainder(mgList(p[0]),mgList(p[1]))));}))};
})();

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountLesson();
  var make=function(h,o){return new ListPlayer(h,Object.assign(o,MG_OPTS));};
  mountByHand($('#byhand'));
  mountGuess($('#predict'));
  mountPlayerTabs($('#trapper'),[{name:'With the last write',steps:function(){return mergeSteps([5],[1,2,3]);}},{name:'Without it',steps:function(){return mergeSteps([5],[1,2,3],{noRest:true});}}],make,{id:'trap'});
  $('#trapNote').innerHTML='Run on [5] and [1,2,3]: with the last write the merge returns '+mgShow(ptrVals(mergeSolution(mgList([5]),mgList([1,2,3]))))+'; without it, '+mgShow(ptrVals(mergeNoRemainder(mgList([5]),mgList([1,2,3]))))+'.';
  mountCost();
  mountPlayerTabs($('#stepper'),CASES.map(function(p){return {name:mgShow(p[0])+' + '+mgShow(p[1]),steps:function(){return mergeSteps(p[0],p[1]);}};})
    .concat([{name:'a tie, with <=',steps:function(){return mergeSteps([1,2],[1,3]);}},{name:'a tie, with <',steps:function(){return mergeSteps([1,2],[1,3],{strict:true});}}]),make,{id:'walk'});
})();

/* ================= systems layer: the two logs hero, animated banners ================= */
(function(){
  function heroMerge(){
    var svg=$('#heroMerge');if(!svg)return;
    var A=[[1,'09:01'],[4,'09:04'],[6,'09:06']],B=[[2,'09:02'],[3,'09:03'],[7,'09:07']],x0=150,dx=120,ya=90,yb=200;
    var h='<defs><marker id="hmA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="context-stroke"/></marker></defs>'+
      '<text class="hd-lab" x="20" y="'+(ya-36)+'">server A</text><text class="hd-lab" x="20" y="'+(yb+48)+'">server B</text>';
    var P={},order=[];A.forEach(function(e,i){P['a'+i]=[x0+i*dx,ya];});B.forEach(function(e,i){P['b'+i]=[x0+i*dx+dx/2,yb];});
    var i=0,j=0;while(i<A.length||j<B.length){if(j>=B.length||(i<A.length&&A[i][0]<=B[j][0]))order.push('a'+i++);else order.push('b'+j++);}
    var pts=[[60,145]].concat(order.map(function(k){return P[k];}));
    for(var k=0;k+1<pts.length;k++){var a=pts[k],b=pts[k+1],d=Math.hypot(b[0]-a[0],b[1]-a[1]),r=k?26:10,ux=(b[0]-a[0])/d,uy=(b[1]-a[1])/d;
      h+='<line class="hm-link" data-k="'+k+'" x1="'+(a[0]+ux*r)+'" y1="'+(a[1]+uy*r)+'" x2="'+(b[0]-ux*29)+'" y2="'+(b[1]-uy*29)+'" marker-end="url(#hmA)"/>';}
    h+='<circle class="hm-d" cx="60" cy="145" r="8"/><text class="hd-lab" x="60" y="174" text-anchor="middle">dummy</text>';
    A.concat(B).forEach(function(e,n){var key=n<A.length?'a'+n:'b'+(n-A.length),p=P[key];
      h+='<rect class="hm-e" data-key="'+key+'" x="'+(p[0]-26)+'" y="'+(p[1]-20)+'" width="52" height="40" rx="8"/><text class="hd-val" x="'+p[0]+'" y="'+(p[1]+5)+'" text-anchor="middle">'+e[1]+'</text>';});
    svg.innerHTML=h;
    var num=$('#heroNum'),unit=$('#heroUnit'),cap=$('#heroCap'),N=order.length;
    var tm=function(key){return (key[0]==='a'?A:B)[+key.slice(1)][1];};
    function capOf(k){return k===0?'Each server\'s log is already in time order':(k<N?'Linked <b>'+tm(order[k-1])+'</b>, the older of the two fronts':'One timeline, from the same six entries');}
    /* hold the count at its widest ("6 entries"): "1 entry" is narrower, so at that step the caption fit
       beside the count, the readout row unwrapped from two lines to one and the hero, centred, moved its art
       19 px each way (the gate measured 0.08 of layout shift at 1366 px). Then hold the tallest caption. */
    var box=num.parentNode,caps=order.map(function(_,k){return capOf(k);}).concat(capOf(N));
    /* measured with the widest text, then the shown text put back: the observer also fires mid-animation */
    var reserveRead=function(){var n=num.textContent,u=unit.textContent;box.style.minWidth='';num.textContent=N;unit.textContent='entries';
      box.style.minWidth=Math.ceil(box.getBoundingClientRect().width)+'px';num.textContent=n;unit.textContent=u;reserveHeight(cap,caps);};
    reserveRead();if('ResizeObserver' in window)new ResizeObserver(reserveRead).observe(box.parentNode);
    function show(k){/* k entries linked */
      svg.querySelectorAll('.hm-link').forEach(function(l){l.classList.toggle('on',+l.dataset.k<k);});
      svg.querySelectorAll('.hm-e').forEach(function(e){e.classList.toggle('on',order.indexOf(e.dataset.key)<k);});
      num.textContent=k;unit.textContent=k===1?'entry':'entries';
      cap.innerHTML=capOf(k);
    }
    if(reduce||!M||!M.animate){show(N);return;}
    var lastK=-1;M.animate(0,N+2,{duration:(N+2)*1.5,ease:'linear',repeat:Infinity,onUpdate:function(v){var k=Math.min(N,Math.floor(v));if(k!==lastK){lastK=k;show(k);}}});
  }

  var banners={
    /* two rows become one zigzag */
    problem:function(svg){
      var up=[1,4,6],dn=[2,3,7],P=[];up.forEach(function(v,i){P.push([v,180+i*150,32]);});dn.forEach(function(v,i){P.push([v,255+i*150,92]);});
      P.sort(function(a,b){return a[0]-b[0];});
      var line=S('polyline',{points:P.map(function(p){return p[1]+','+p[2];}).join(' '),class:'bn-path',style:'fill:none;stroke-dasharray:1400;stroke-dashoffset:1400'},svg);
      P.forEach(function(p){var g=S('g',{},svg);S('rect',{x:p[1]-20,y:p[2]-14,width:40,height:28,rx:7,class:'bn-mid'},g);var t=S('text',{x:p[1],y:p[2]+5,class:'bn-t','text-anchor':'middle',style:'font-size:13px;font-weight:600'},g);t.textContent=p[0];});
      return function(){M.animate(1400,0,{duration:1.6,delay:.3,onUpdate:function(v){line.style.strokeDashoffset=v;}});};
    },
    /* a dummy and a tail walking on */
    attempt:function(svg){
      var X=chainArt(svg,['·',1,2,3],150,36),t=S('text',{y:98,class:'bn-t','text-anchor':'middle'},svg),d=S('text',{x:X(0)+35,y:26,class:'bn-t','text-anchor':'middle'},svg);d.textContent='dummy';t.textContent='tail';
      return function(){M.animate(0,3,{duration:2.2,ease:'easeInOut',onUpdate:function(v){t.setAttribute('x',X(v)+35);}});};
    },
    /* a leftover left hanging */
    trap:function(svg){
      chainArt(svg,[1,2,3],80,30);var g=S('g',{},svg);chainArt(g,[5],420,74);
      var big=S('text',{x:620,y:58,class:'bn-big bad','text-anchor':'middle'},svg),sub=S('text',{x:620,y:84,class:'bn-t','text-anchor':'middle'},svg);
      return function(){M.animate(0,1,{duration:.8,delay:.5,onUpdate:function(v){g.style.opacity=1-.6*v;big.textContent=v>.5?'[5] lost':'';sub.textContent=v>.5?'never linked on':'';}});};
    },
    /* the picture kept true */
    insight:function(svg){
      var big=S('text',{x:360,y:64,class:'bn-big','text-anchor':'middle'},svg),sub=S('text',{x:360,y:96,class:'bn-t','text-anchor':'middle'},svg);
      sub.textContent='merged part sorted · tail ≤ both fronts';
      return function(){M.animate(0,6,{duration:2.4,ease:'easeOut',onUpdate:function(v){big.textContent=Math.round(v)+' of 6 linked';}});};
    },
    /* comparisons, bounded */
    solution:function(svg){
      S('rect',{x:60,y:52,width:520,height:14,rx:7,class:'bn-track'},svg);var fill=S('rect',{x:60,y:52,width:0,height:14,rx:7,class:'bn-bar'},svg);
      var big=S('text',{x:60,y:36,class:'bn-big'},svg);
      return function(){M.animate(0,5,{duration:2.4,ease:'easeOut',onUpdate:function(v){fill.setAttribute('width',520*v/6);big.textContent=Math.round(v)+' comparisons, at most m + n − 1';}});};
    }
  };
  heroMerge();mountBanners(banners);kinetic();riseIn();
})();
