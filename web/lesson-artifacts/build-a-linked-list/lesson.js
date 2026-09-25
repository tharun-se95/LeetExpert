/* Build a Linked List From Scratch. The list below is real nodes and pointers; every
   operation records a snapshot after each pointer write, and every view on the page
   draws a snapshot. Nothing is drawn from a script of what should happen. */

/* Load-time check: random operations against a plain array, with the invariants after
   every one; and the trap's exact claim, that the leaky delete loses the append. */
(function selfCheck(){
  var seed=20260924,rnd=function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(var t=0;t<300;t++){
    var L=new List(),A=[];
    for(var k=0,n=1+Math.floor(rnd()*16);k<n;k++){
      var op=['push_front','push_back','delete','delete','find'][Math.floor(rnd()*5)],v=Math.floor(rnd()*6);
      var steps=listRun(L,op,v);
      if(op==='push_front')A.unshift(v);else if(op==='push_back')A.push(v);else if(op==='delete'){var i=A.indexOf(v);if(i>=0)A.splice(i,1);}
      var last=steps[steps.length-1],inv=listInvariants(last);
      if(toArr(L).join()!==A.join()||!inv[0]||!inv[1]||!inv[2]||!last.done)throw new Error('linked list check failed after '+op+'('+v+')');
    }
  }
  var B=listOf([7,3,12]);listRun(B,'delete',12,true);listRun(B,'push_back',5,true);
  if(toArr(B).join()!=='7,3'||B.size!==3)throw new Error('trap check failed: the leaky list should lose 5');
})();

/* ---------- the playground ---------- */
function mountPlay(w){
  var L,player=new ListPlayer(w.querySelector('.lvhost'),{id:'play',slots:8}),pf=$('#pf'),pb=$('#pb'),hint=$('#playHint'),MAX=6;
  function nextValue(){var have=toArr(L);for(var k=0;k<40;k++){var v=[4,9,1,6,8,2,5,11,14,10][k%10];if(have.indexOf(v)<0)return v;}return 20;}
  function label(){var v=nextValue();pf.innerHTML=OPN.push_front+'('+v+')';pb.innerHTML=OPN.push_back+'('+v+')';
    var full=L.size>=MAX;pf.disabled=pb.disabled=full;hint.textContent=full?'full: click a node to delete one':(L.size?'or click a node to delete it':'empty: push a value');}
  function reset(){L=listOf([7,3,12]);player.load([listSnap(L,'The list 7 → 3 → 12. Push a value onto either end, or click a node to delete it.',{done:true})]);label();}
  function doOp(op,v){if(player.busy())return;player.push(listRun(L,op,v));label();}
  pf.addEventListener('click',function(){doOp('push_front',nextValue());});
  pb.addEventListener('click',function(){doOp('push_back',nextValue());});
  $('#rs').addEventListener('click',reset);
  player.onNode=function(v){doOp('delete',v);};
  onRepaint(player.redraw);
  reset();
  /* every caption an operation can produce, run on a throwaway list of the widest values */
  var S6=listOf([14,11,10,9,8,6]),S0=new List(),notes=[];
  [[S6,'delete',14],[S6,'delete',9],[S6,'delete',6],[S6,'delete',99],[S0,'push_front',11],[S0,'delete',11],[S0,'push_back',11],[S6,'push_back',11],[S6,'push_front',14]].forEach(function(c){
    listRun(c[0],c[1],c[2]).forEach(function(x){notes.push(x.note);});});
  player.reserve(notes);
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
  /* every number here is run, not typed: the walk count by appendVisits (checked against
     n(n - 1)/2 in mountCost), the writes by recording a real push_back */
  var writes=listRun(listOf([7,3,12]),'push_back',5).filter(function(st){return st.hi.some(function(h){return h==='head'||h==='tail'||h.indexOf('next:')===0;});}).length;
  var fsteps=listRun(listOf([7,3,12]),'find',12),hops=0;
  for(var q=1;q<fsteps.length;q++)if(fsteps[q].tags.curr!==null&&fsteps[q].tags.curr!==fsteps[q-1].tags.curr)hops++;
  if(hops!==2)throw new Error('fact check failed: moves to the third node');
  var big=10000,probe=appendVisits(64,false);
  if(probe!==64*63/2)throw new Error('fact check failed: append visits');
  mountFacts($('#cost-facts'),[
    {v:big*(big-1)/2,l:'nodes visited to append '+fmt(big)+' values with no tail pointer'},
    {v:writes,l:'pointer writes per append with a tail, counted on a real list: link on, then move tail'},
    {v:hops,l:'moves along next to reach the third node: a walk, never a jump'}
  ]);
  mountVariants($('#vlist'),[
    ['Pointer Surgery Patterns','next lesson','A dummy node in front of the head: every real node then has a node before it, so deleting the head becomes an ordinary splice and most branches here disappear.'],
    ['Reverse Linked List','problem','Turn every next pointer to face backwards, holding three references at once so no part of the list is lost halfway through the flip.'],
    ['Middle of the Linked List','problem','A fast reference moves two nodes for every one a slow reference moves. When the fast one reaches the end, the slow one is in the middle.'],
    ['Linked List Cycle','problem','The same two speeds detect a loop: if next ever leads back into the list, the fast reference laps the slow one and they meet.']
  ]);
  mountQuiz($('#qlist'),QUIZ);
  kinetic();riseIn();
})();
