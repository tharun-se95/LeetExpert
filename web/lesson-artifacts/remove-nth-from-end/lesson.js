/* ================= Remove Nth Node From End of List: the lesson =================
   The list stands on one row with its dummy before it, every node where it starts; the walkthroughs
   record a snapshot after each statement of real code (kit/lists.js ptrSnap), and every number the
   prose quotes is computed below by running the code it describes. */

function rmBuild(vals){var ns=ptrRow(vals),d=mkNode('·');d.x=-1;d.y=0;d.next=ns[0]||null;return {ns:ns,dummy:d,nodes:[d].concat(ns)};}
function rmList(vals){return ptrRow(vals)[0]||null;}
function rmShow(a){return '['+a.join(',')+']';}
function rmRange(n){var a=[];for(var i=1;i<=n;i++)a.push(i);return a;}

/* the page's code, as running code: each mirrors a file in code/, which the code gate runs in both languages */
var rmLead=0,rmTrail=0,rmReads=0;
function removeSolution(head,n){var dummy=mkNode('·');dummy.next=head;var lead=dummy,trail=dummy;rmLead=0;rmTrail=0;
  for(var i=0;i<n;i++){lead=lead.next;rmLead++;}while(lead.next!==null){lead=lead.next;trail=trail.next;rmLead++;rmTrail++;}
  trail.next=trail.next.next;rmReads=rmLead+rmTrail;return dummy.next;}
function removeTwoPass(head,n){var L=0;rmReads=0;for(var c=head;c!==null;c=c.next){L++;rmReads++;}var dummy=mkNode('·');dummy.next=head;var pred=dummy;
  for(var i=0;i<L-n;i++){pred=pred.next;rmReads++;}pred.next=pred.next.next;return dummy.next;}
/* both mistakes read from null on some inputs; JavaScript throws there, as the shown code does */
function removeNoDummy(head,n){var lead=head,trail=head;for(var i=0;i<n;i++)lead=lead.next;while(lead.next!==null){lead=lead.next;trail=trail.next;}trail.next=trail.next.next;return head;}
function removeTooFar(head,n){var dummy=mkNode('·');dummy.next=head;var lead=dummy,trail=dummy;for(var i=0;i<n;i++)lead=lead.next;
  while(lead!==null){lead=lead.next;trail=trail.next;}trail.next=trail.next.next;return dummy.next;}
function outcome(f,vals,n){try{return rmShow(ptrVals(f(rmList(vals),n)));}catch(e){return 'throws';}}

/* the sandbox's seven inputs; the expected list drops index L - n from the array, independent of any list code */
var CASES=[[[1,2,3,4,5],2],[[1],1],[[1,2],2],[[1,2],1],[[1,2,3],3],[[1,2,3],1],[[7,7,7,7],4]];
(function selfCheck(){
  for(var L=1;L<=30;L++)for(var n=1;n<=L;n++){var a=rmRange(L),want=a.slice(0,L-n).concat(a.slice(L-n+1)).join();
    if(ptrVals(removeSolution(rmList(a),n)).join()!==want)throw new Error('remove failed at L='+L+' n='+n);
    if(rmLead!==L||rmTrail!==L-n)throw new Error('step counts failed at L='+L+' n='+n);var one=rmReads;
    if(ptrVals(removeTwoPass(rmList(a),n)).join()!==want)throw new Error('two-pass failed at L='+L+' n='+n);
    if(rmReads!==one)throw new Error('the two versions should read the same number of links, L='+L+' n='+n);
    if((outcome(removeNoDummy,a,n)==='throws')!==(n===L))throw new Error('no-dummy should throw exactly when n = L');}
  CASES.forEach(function(c){var a=c[0];if(ptrVals(removeSolution(rmList(a),c[1])).join()!==a.slice(0,a.length-c[1]).concat(a.slice(a.length-c[1]+1)).join())throw new Error('case failed');});
})();

/* ---------- invariants and fields, from a snapshot alone ---------- */
var RM_START=[['on the dummy','lead and trail both start on the dummy']],RM_GAP=[['gap = n','lead is exactly n nodes ahead of trail, counting from the dummy']],RM_DONE=[['target gone','following next from the dummy no longer reaches the removed node']];
/* a node's position counting from the dummy as 0; one past the end when the name is null */
function rmIdx(s,id){var w=snapWalk(s,s.tags.dummy);return id===null?w.ids.length:w.ids.indexOf(id);}
/* the claim that holds depends on the phase: before the gap opens there is no gap to keep */
function rmInv(s){return s.data.phase==='start'?RM_START:(s.data.phase==='done'?RM_DONE:RM_GAP);}
function rmCheck(s){
  if(s.data.phase==='start')return [s.tags.lead===s.tags.dummy&&s.tags.trail===s.tags.dummy];
  if(s.data.phase==='done')return [snapWalk(s,s.tags.dummy).ids.indexOf(s.data.target)<0];
  return [rmIdx(s,s.tags.lead)-rmIdx(s,s.tags.trail)===s.data.n];}
function rmFields(s,hiF,val){
  return ['lead','trail'].map(function(k){var id=s.tags[k];return '<span'+hiF(k)+'>'+k+' <b>'+(id===null?'null':(id===s.tags.dummy?'dummy':val(id)))+'</b></span>';}).join('')+
    '<span>n <b>'+s.data.n+'</b></span>';
}
var RM_OPTS={inv:rmInv,check:rmCheck,fields:rmFields};

/* ---------- a walkthrough: open the gap, march, splice ---------- */
function removeSteps(vals,n,o){
  o=o||{};var G=rmBuild(vals),lead=G.dummy,trail=G.dummy,L=vals.length,target=G.ns[L-n],steps=[],phase='start';
  function rec(note,hi,done){steps.push(ptrSnap(note,{nodes:G.nodes,head:G.dummy,tags:{dummy:G.dummy,lead:lead,trail:trail},above:['dummy'],hi:hi||[],done:done,
    data:{n:n,target:target?target.id:null,phase:phase}}));}
  rec('The list '+rmShow(vals)+', n = '+n+': remove '+(target?target.value+(n===L?', the head':'')+', the node '+n+' from the end':'nothing')+'. A dummy stands before the head, and both walkers start on it.',[],true);
  phase='open';
  for(var i=0;i<n;i++){lead=lead.next;rec('Open the gap: <code>lead</code> moves to '+lead.value+'. '+(i+1)+' of '+n+'.',['lead'],i===n-1);}
  var stop=o.tooFar?function(){return lead===null;}:function(){return lead.next===null;};
  if(!o.tooFar&&stop())rec('<code>lead</code> is already on the last node, so the march takes no steps: <code>trail</code> stays on the dummy.',[],true);
  while(!stop()){lead=lead.next;trail=trail.next;
    rec('March: both move one node. <code>lead</code> to '+(lead?lead.value:'null')+', <code>trail</code> to '+trail.value+'.'+
      (o.tooFar&&lead===null?' This last step was one too many: <code>trail</code> is on '+trail.value+', the target itself.':(!o.tooFar&&lead.next===null?' <code>lead</code> is on the last node: stop.':'')),['lead','trail'],true);}
  if(o.tooFar&&trail.next===null){rec('<code>trail.next</code> is null, so <code>trail.next.next</code> reads from null and the function throws.',[],true);return steps;}
  var gone=trail.next;trail.next=trail.next.next;phase='done';
  rec('Splice: <code>trail.next = trail.next.next</code>. '+(trail===G.dummy?'The dummy':'Node '+trail.value)+' now skips '+gone.value+(o.tooFar?', the node <b>after</b> the target.':'.'),['next:'+trail.id],true);
  var out=ptrVals(G.dummy.next);
  rec('Return <code>dummy.next</code>: '+rmShow(out)+'.'+(o.tooFar?' The target, '+target.value+', is still there.':''),[],true);
  var want=o.tooFar?outcome(removeTooFar,vals,n):rmShow(vals.slice(0,L-n).concat(vals.slice(L-n+1)));
  if(rmShow(out)!==want)throw new Error('walkthrough returned '+rmShow(out)+' for '+rmShow(vals)+', n = '+n);
  return steps;
}
/* ---------- predict where trail stops ---------- */
var PREDICT=[2,6,1].map(function(n){var a=rmRange(6);return {n:n,vals:a,expect:6-n===0?'dummy':String(a[6-n-1])};});
function mountGuess(host){
  mountPredict(host,PREDICT,{
    question:function(c){return 'The list <code>'+rmShow(c.vals)+'</code>, n = '+c.n+'. When the march ends, which node is <code>trail</code> on?';},
    choices:function(c){var all=['dummy','1','2','3','4','5','6'],i=all.indexOf(c.expect),lo=Math.max(0,Math.min(i-1,all.length-4));return all.slice(lo,lo+4);},
    draw:function(view,c){var row=el('div','pl-mini','<span>dummy → '+ptrText(rmList(c.vals))+'</span>');view.appendChild(row);
      return {reveal:function(){row.innerHTML+='<span>trail stops on '+c.expect+'</span>';}};},
    why:function(c){var L=c.vals.length,t=L-c.n+1;return 'The target, '+c.n+' from the end, is node '+t+'. Counting from the dummy as 0, <code>trail</code> makes L − n = '+(L-c.n)+' march'+(L-c.n===1?'':'es')+' and stops on node '+(L-c.n)+(L-c.n===0?', the dummy, which is the head\'s predecessor':', the target\'s predecessor')+'.';}
  });
}

/* ---------- links read, both versions ---------- */
function mountCost(){
  var pts=[];for(var L=2;L<=30;L+=4){removeSolution(rmList(rmRange(L)),2);var one=rmReads;removeTwoPass(rmList(rmRange(L)),2);pts.push([L,rmReads,one]);}
  var last=pts[pts.length-1];
  costChart($('#cost'),{names:['two passes: count, then walk','one pass: lead and trail'],ylabel:'links read',pts:pts,xlabel:'list length L, removing n = 2',xticks:[0,10,20,30],
    aria:'Links read to remove the second node from the end, against list length: the two lines coincide; at L = 30 both read '+last[1]+'.'});
  $('#costNote').innerHTML='Counted by running both, removing n = 2: at every length the two read exactly the same number of links, <b>'+last[1]+'</b> at L = 30. That is L to reach the end once plus L − n to reach the predecessor, in either order. The two series lie on top of each other.';
}

/* ---------- the numbers lesson.md quotes as {{name}}: computed here, never typed ---------- */
function listWords(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];}
var FACTS=(function(){
  removeSolution(rmList([1,2,3,4,5]),2);
  var crash=CASES.filter(function(c){return outcome(removeNoDummy,c[0],c[1])==='throws';});
  if(crash.some(function(c){return c[1]!==c[0].length;}))throw new Error('no-dummy should only throw on head removal');
  /* judged by identity: does the target node itself leave the list? By value alone a list of equal
     values hides the wrong removal, which the page says rather than counts as a pass */
  var far=CASES.map(function(c){var ns=ptrRow(c[0]),target=ns[c[0].length-c[1]],out;
    try{out=removeTooFar(ns[0]||null,c[1]);}catch(e){return {c:c,text:'throws'};}
    var kept=[];for(var q=out;q;q=q.next)kept.push(q);
    if(kept.indexOf(target)<0)throw new Error('too-far should never remove the target itself');
    var want=c[0].slice(0,c[0].length-c[1]).concat(c[0].slice(c[0].length-c[1]+1));
    return {c:c,text:'gives '+rmShow(ptrVals(out)),lucky:ptrVals(out).join()===want.join()};});
  var lucky=far.filter(function(f){return f.lucky;});
  return {leadSteps:rmLead,trailSteps:rmTrail,
    noDummyAnswers:'throws on the '+crash.length+' that remove the head and is right on the other '+(CASES.length-crash.length),
    tooFarAnswers:far.slice(0,3).map(function(f){return rmShow(f.c[0])+', n = '+f.c[1]+' '+f.text;}).join('; ')+
      '. It never removes the target itself'+(lucky.length?', and on '+listWords(lucky.map(function(f){return rmShow(f.c[0]);}))+' the answer only looks right because the node it removes holds the same value':'')};
})();

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountLesson();
  var make=function(h,o){return new ListPlayer(h,Object.assign(o,RM_OPTS));};
  mountPlayerTabs($('#gaps'),[1,2,3,5].map(function(n){return {name:'n = '+n,steps:function(){var all=removeSteps([1,2,3,4,5],n);return all.slice(0,all.length-2);}};}),make,{id:'gap'});
  mountGuess($('#predict'));
  mountCost();
  mountPlayerTabs($('#trapper'),[{name:'while lead.next',steps:function(){return removeSteps([1,2,3,4,5],2);}},{name:'while lead',steps:function(){return removeSteps([1,2,3,4,5],2,{tooFar:true});}}],make,{id:'trap'});
  $('#trapNote').innerHTML='Run on [1,2,3,4,5] with n = 2: stopping on the last node gives '+outcome(function(h,n){return removeSolution(h,n);},[1,2,3,4,5],2)+'; marching until <code>lead</code> is null gives '+outcome(removeTooFar,[1,2,3,4,5],2)+', the wrong node removed.';
  mountPlayerTabs($('#stepper'),CASES.slice(0,5).map(function(c){return {name:rmShow(c[0])+', n = '+c[1],steps:function(){return removeSteps(c[0],c[1]);}};}),make,{id:'walk'});
})();

/* ================= systems layer: the scout and the reader, animated banners ================= */
(function(){
  function heroGap(){
    var svg=$('#heroGap');if(!svg)return;
    var N=7,n=2,x0=48,dx=72,y=130;
    var h='<defs><marker id="hgA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="context-stroke"/></marker></defs>'+
      '<text class="hd-lab" x="'+x0+'" y="56">a change log, oldest first; drop the one '+n+' back from the newest</text>';
    for(var i=0;i<N-1;i++)h+='<line class="hg-link" data-i="'+i+'" x1="'+(x0+i*dx+24)+'" y1="'+y+'" x2="'+(x0+(i+1)*dx-27)+'" y2="'+y+'" marker-end="url(#hgA)"/>';
    h+='<path class="hg-skip" d="M'+(x0+(N-n-1)*dx+12)+','+(y-20)+' C'+(x0+(N-n-1)*dx+30)+','+(y-70)+' '+(x0+(N-n+1)*dx-30)+','+(y-70)+' '+(x0+(N-n+1)*dx-12)+','+(y-22)+'" marker-end="url(#hgA)"/>';
    for(var j=0;j<N;j++)h+='<rect class="hg-e" data-i="'+j+'" x="'+(x0+j*dx-22)+'" y="'+(y-18)+'" width="44" height="36" rx="8"/><text class="hd-val" x="'+(x0+j*dx)+'" y="'+(y+5)+'" text-anchor="middle">v'+(j+1)+'</text>';
    h+='<text class="hg-tag" id="hgLead" y="'+(y+44)+'" text-anchor="middle">scout</text><text class="hg-tag rd" id="hgTrail" y="'+(y+62)+'" text-anchor="middle">reader</text>';
    svg.innerHTML=h;
    var num=$('#heroNum'),cap=$('#heroCap'),T=N-n,K=n+T+1;
    /* entries are 0..N-1 and the dummy is -1, where both start (not drawn). k = 1..n opens the gap, the
       next T steps march until the scout is on the newest entry, and step K is the splice */
    function show(k){
      var m=Math.max(0,Math.min(k-n,T)),lead=Math.min(k,n)-1+m,trail=m-1,cut=k>=K;
      $('#hgLead').setAttribute('x',x0+Math.max(0,lead)*dx);$('#hgLead').style.opacity=lead>=0?1:0;
      $('#hgTrail').setAttribute('x',x0+Math.max(0,trail)*dx);$('#hgTrail').style.opacity=trail>=0?1:0;
      num.textContent=lead-trail;
      svg.querySelector('.hg-skip').style.opacity=cut?1:0;
      svg.querySelectorAll('.hg-link').forEach(function(l){var i=+l.dataset.i;l.style.opacity=cut&&(i===N-n-1||i===N-n)?.15:1;});
      svg.querySelectorAll('.hg-e').forEach(function(e){var i=+e.dataset.i;e.classList.toggle('gone',cut&&i===N-n);e.classList.toggle('lit',i===trail);});
      cap.innerHTML=k<=n?'The scout gets '+n+' entries ahead':(cut?'Entry <b>v'+(N-n+1)+'</b> unlinked: the reader\'s entry now skips it':'Both move one entry at a time');
    }
    if(reduce||!M||!M.animate){show(K);return;}
    var last=-1;M.animate(0,K+2,{duration:(K+2)*1.2,ease:'linear',repeat:Infinity,onUpdate:function(v){var k=Math.min(K,Math.floor(v));if(k!==last){last=k;show(k);}}});
  }

  var banners={
    /* the node n from the end, counted back */
    problem:function(svg){
      var X=chainArt(svg,[1,2,3,4,5],100,40),t=S('text',{y:110,class:'bn-t','text-anchor':'middle'},svg);
      return function(){M.animate(0,2,{duration:1.2,delay:.4,onUpdate:function(v){var k=Math.round(v);t.setAttribute('x',X(4-Math.max(0,k-1))+35);t.textContent=k?k+' from the end':'';}});};
    },
    /* a dummy before the head */
    attempt:function(svg){
      var X=chainArt(svg,['·',1,2,3],170,40),d=S('text',{x:X(0)+35,y:30,class:'bn-t','text-anchor':'middle'},svg);d.textContent='dummy';
      var l=S('text',{y:100,class:'bn-t','text-anchor':'middle'},svg),t=S('text',{y:116,class:'bn-t','text-anchor':'middle'},svg);l.textContent='lead';t.textContent='trail';
      return function(){M.animate(0,2,{duration:1.6,ease:'easeInOut',onUpdate:function(v){l.setAttribute('x',X(v)+35);t.setAttribute('x',X(0)+35);}});};
    },
    /* one step too many */
    trap:function(svg){
      var X=chainArt(svg,[1,2,3,4,5],100,30),t=S('text',{y:92,class:'bn-t','text-anchor':'middle'},svg),big=S('text',{x:650,y:58,class:'bn-big red','text-anchor':'middle'},svg);t.textContent='trail';
      return function(){M.animate(2,3,{duration:.8,delay:.6,onUpdate:function(v){t.setAttribute('x',X(v)+35);big.textContent=v>2.5?'on the target':'';}});};
    },
    /* the gap stays n */
    insight:function(svg){
      var big=S('text',{x:360,y:66,class:'bn-big','text-anchor':'middle'},svg),sub=S('text',{x:360,y:98,class:'bn-t','text-anchor':'middle'},svg);sub.textContent='both move one node per step';
      return function(){M.animate(0,1,{duration:1.2,onUpdate:function(v){big.textContent='gap = n';}});};
    },
    /* one pass, L steps */
    solution:function(svg){
      S('rect',{x:60,y:52,width:520,height:14,rx:7,class:'bn-track'},svg);var fill=S('rect',{x:60,y:52,width:0,height:14,rx:7,class:'bn-bar'},svg);
      var big=S('text',{x:60,y:36,class:'bn-big'},svg);
      return function(){M.animate(0,5,{duration:2.2,ease:'easeOut',onUpdate:function(v){fill.setAttribute('width',520*v/5);big.textContent='lead: '+Math.round(v)+' of 5 steps';}});};
    }
  };
  heroGap();mountBanners(banners);kinetic();riseIn();
})();
