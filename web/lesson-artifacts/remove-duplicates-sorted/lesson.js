/* ================= Remove Duplicates from Sorted Array: the lesson =================
   Every array on the page is the lane player's row of real items. The walkthroughs run the same loop the
   code shows, one snapshot per statement, and every number the prose quotes is computed in the PURE block
   below by running that loop (check.py re-runs the block in node and recomputes the facts in Python). */

/* PURE:begin (no DOM below this line until PURE:end) */
/* the sandbox's five arrays, in the order courses/dsa/arrays/remove-duplicates-sorted.md lists them */
var RD_CASES=[[1,1,2],[0,0,1,1,1,2,2,3,3,4],[5],[2,2,2,2],[-100,-100,0,100]];
/* a sorted array's distinct values, counted without two pointers: the independent answer */
function rdDistinct(a){var out=[];a.forEach(function(v){if(out.indexOf(v)<0)out.push(v);});return out;}
/* the loop. against = the slot each value is compared with: the last kept value (right) or the slot to fill (the trap) */
function rdLoop(a,wrongSlot){
  var n=a.slice(),w=1,cmps=0,writes=0;
  for(var r=1;r<n.length;r++){
    cmps++;
    var against=wrongSlot?n[w]:n[w-1];
    if(n[r]!==against){n[w]=n[r];w++;writes++;}
  }
  return {k:w,nums:n,cmps:cmps,writes:writes};
}
/* deleting each repeat by shifting the tail: a repeat at original index p moves the n−1−p elements after it
   (deleting earlier repeats shifts p and the length down together, so their difference stays) */
function rdDeleteMoves(a){
  var n=a.length,moves=0;
  for(var p=1;p<n;p++)if(a[p]===a[p-1])moves+=n-1-p;
  return moves;
}
/* a sorted array of n values in which every value appears twice */
function rdTwice(n){var a=[];for(var i=0;i<n;i++)a.push(Math.floor(i/2));return a;}
/* a sorted array of n values spread over the constraint's 201 possible values */
function rdSpread(n){var a=[];for(var i=0;i<n;i++)a.push(-100+Math.floor(i*201/n));return a;}
/* the second list the copying version builds */
function rdCopyHeld(a){var held=0;a.forEach(function(x,i){if(i===0||x!==a[i-1])held++;});return held;}
/* the sweep the hero replays: the state after reading each slot */
function rdTimeline(a){
  var out=[{r:0,w:1,nums:a.slice()}],n=a.slice(),w=1;
  for(var r=1;r<n.length;r++){if(n[r]!==n[w-1]){n[w]=n[r];w++;}out.push({r:r,w:w,nums:n.slice()});}
  return out;
}
var RD_HAND=[3,3,5,5,5,8,9,9];

var FACTS=(function(){
  var big=RD_CASES[1],run=rdLoop(big),bad=rdLoop(big,true),spread=rdSpread(30000),wrongPass=0;
  RD_CASES.forEach(function(c){var w=rdLoop(c,true),want=rdDistinct(c);if(w.k===want.length&&w.nums.slice(0,w.k).join()===want.join())wrongPass++;});
  return {
    k10:run.k,cmps10:run.cmps,writes10:run.writes,
    wrongK10:bad.k,wrongPass:wrongPass,cases:RD_CASES.length,
    deleteMoves30k:rdDeleteMoves(spread).toLocaleString('en-US'),writes30k:rdLoop(spread).writes.toLocaleString('en-US'),
    heldAtMost:rdCopyHeld(spread).toLocaleString('en-US')
  };
})();
/* PURE:end */

/* ---------- the loop, as a walkthrough: one snapshot per statement ---------- */
function rdShow(a){return '['+a.join(', ')+']';}
/* The machine behind every player on the page. mode 'last' compares with the last kept value; 'slot' is the
   trap, which compares with the slot about to be filled. It holds the lane and gives out snapshots. */
function RdMachine(vals,mode){
  var n=vals.length,w=1,proc=n>0?1:0,self=this;
  var M=new Lanes([{id:'a',kind:'row',label:'nums',idx:true,w:38}],{fields:function(){
    return [['read',proc<n?proc:'done'],['write',w],['distinct so far',rdDistinct(vals.slice(0,proc)).join(', ')]];}});
  var cells=vals.map(function(v){return M.push('a',v);});
  function slotItem(k){return M.lane('a').items[k];}
  function marks(reading){
    M.mark('a','read',reading!==null&&reading<n?reading:null);
    M.mark('a','write',w<n?w:null);
    M.span('a','kept',0,w-1);
  }
  function tones(reading){cells.forEach(function(c,i){M.tone(c,i===reading?'cur':(i>=w&&i<proc?'dim':null));});}
  this.n=n;
  this.more=function(){return proc<n;};
  this.against=function(){return slotItem(mode==='slot'?w:w-1);};
  this.intro=function(){
    marks(n>1?1:null);tones(null);
    return M.snap(n>1?'The first value is always kept: nothing comes before it, so it cannot repeat anything. <code>write</code> starts at 1, the slot for the next new value, and <code>read</code> at 1, the first value that needs a decision.':
      'One value: nothing to compare, so it is kept and the answer is 1.',{hi:['kept','read','write'],done:true});
  };
  this.compare=function(){
    var r=proc,v=vals[r],ag=self.against(),last=slotItem(w-1).v;
    marks(r);tones(r);
    var note;
    if(mode==='slot'){
      note='Read slot '+r+': it holds '+v+'. The test compares it with <code>nums[write]</code>, slot '+w+', which holds '+ag.v+'. That slot is about to be filled; the last kept value is '+last+'. '+
        (v!==ag.v?'The two differ, so the test calls it new.':'The two are equal, so the test calls it a repeat.');
    }else{
      note='Read slot '+r+': it holds '+v+'. The last kept value, <code>nums[write − 1]</code>, sits in slot '+(w-1)+' and holds '+last+'. '+
        (v!==last?'The two differ, so it is new.':'The two are equal, so it is a repeat.');
    }
    return M.snap(note,{hi:['read',laneHi(cells[r]),laneHi(ag)]});
  };
  /* what the code does with the value under the finger; the by-hand widget asks the learner for it */
  this.decide=function(){return slotItem(proc).v!==self.against().v;};
  this.act=function(keep){
    var r=proc,v=vals[r],target=slotItem(w),onSelf=target===cells[r],note;
    if(keep){
      M.set(target,v);
      note=onSelf?'Keep it: <code>nums[write] = nums[read]</code> writes '+v+' onto itself, since both name slot '+r+'. Then <code>write</code> moves to '+(w+1)+'.':
        'Keep it: <code>nums[write] = nums[read]</code> copies '+v+' down into slot '+w+'. Then <code>write</code> moves to '+(w+1)+'.';
      w++;
    }else note='Skip it: <code>write</code> stays at '+w+', so the next new value will overwrite from here. The finger moves on.';
    proc++;
    marks(proc<n?proc:null);tones(null);
    return M.snap(note,{hi:keep?['write',laneHi(target),'kept']:['read'],done:true});
  };
  /* the learner chose the wrong way in the by-hand widget: same state, a note on why */
  this.refuse=function(keep){
    var r=proc,v=vals[r],last=slotItem(w-1).v;marks(r);tones(r);
    return M.snap(keep?'Not that one. '+v+' equals the last kept value, '+last+', so keeping it would put a repeat in the kept prefix.':
      'Not that one. '+v+' differs from the last kept value, '+last+', so it is new, and skipping it would lose it.',{hi:['read',laneHi(cells[r])]});
  };
  this.end=function(){
    marks(null);tones(null);
    var k=w;
    return M.snap('<code>read</code> has run off the end, so the pass is over. <code>write</code> is '+k+', the count of distinct values: <code>nums[0..'+k+')</code> holds '+rdShow(rdDistinct(vals))+'. The slots from '+k+' on keep whatever they held; the tests never look at them.',{hi:['kept','write'],done:true});
  };
  this.kept=function(){return M.lane('a').items.slice(0,w).map(function(it){return it.v;});};
  this.k=function(){return w;};
}
/* the whole loop as snapshots; the walk is held to the independent answer (and, for the trap, to the loop) */
function rdSteps(vals,mode){
  var m=new RdMachine(vals,mode),steps=[m.intro()];
  while(m.more()){steps.push(m.compare());steps.push(m.act(m.decide()));}
  steps.push(m.end());
  var ref=rdLoop(vals,mode==='slot');
  if(m.k()!==ref.k||m.kept().join()!==ref.nums.slice(0,ref.k).join())throw new Error('the walk of '+rdShow(vals)+' disagrees with the loop');
  if(mode!=='slot'&&m.kept().join()!==rdDistinct(vals).join())throw new Error('the walk of '+rdShow(vals)+' disagrees with the distinct values');
  return steps;
}
/* the two claims the panel checks at rest, read from a snapshot alone */
function rdLane(s){return s.lanes[0];}
var RD_INV=[
  ['strictly rising','the kept slots rise strictly: no value appears twice among them',function(s){
    var l=rdLane(s),hi=l.spans.kept.hi,v=l.items.slice(0,hi+1).map(function(x){return +x.v;});
    return v.every(function(x,i){return i===0||x>v[i-1];});}],
  ['all distinct values','the kept slots hold exactly the distinct values read so far',function(s){
    var l=rdLane(s),hi=l.spans.kept.hi,f=s.fields.filter(function(x){return x[0]==='distinct so far';})[0];
    return l.items.slice(0,hi+1).map(function(x){return x.v;}).join(', ')===String(f[1]);}]
];

/* ---------- 1. by hand: keep or skip ---------- */
function mountHand(host){
  var player=new LanePlayer(host.querySelector('.lvhost'),{id:'hand',inv:RD_INV}),hint=$('#handHint'),m;
  var keepB=host.querySelector('[data-op="keep"]'),skipB=host.querySelector('[data-op="skip"]');
  function label(){
    var over=!m.more();keepB.disabled=skipB.disabled=over;
    hint.textContent=over?'every value decided: '+m.k()+' kept':'pick keep or skip';
  }
  function reset(){m=new RdMachine(RD_HAND,'last');m.intro();player.load([m.compare()]);label();}
  [keepB,skipB].forEach(function(b){b.addEventListener('click',function(){
    if(player.busy()||!m.more())return;
    var keep=b.dataset.op==='keep';
    if(keep===m.decide()){var out=[m.act(keep)];out.push(m.more()?m.compare():m.end());player.push(out);}
    else player.push([m.refuse(keep)]);
    label();});});
  host.querySelector('.reset').addEventListener('click',reset);
  onRepaint(player.redraw);
  /* size the stage and its caption for every state a learner can reach: the whole correct run and each wrong pick */
  var all=[],notes=[],g=new RdMachine(RD_HAND,'last');
  g.intro();all.push(g.compare());
  while(g.more()){
    var d=g.decide();
    var wrong=g.refuse(!d);all.push(wrong);notes.push(wrong.note);
    all.push(g.act(d));all.push(g.more()?g.compare():g.end());
  }
  if(g.kept().join()!==rdDistinct(RD_HAND).join())throw new Error('by hand: the correct picks do not give the distinct values');
  all.forEach(function(s){notes.push(s.note);});
  player.sizeTo(all);player.reserve(notes,all);
  reset();
}

/* ---------- 2. predict: where write stands after some reads ---------- */
var RD_PREDICT_ARRAY=[1,1,1,2,4,4,5,5,5,9];
function rdAfter(a,p){/* the state once the first p values have been decided */
  var n=a.slice(),w=1;for(var r=1;r<p;r++)if(n[r]!==n[w-1]){n[w]=n[r];w++;}
  return {w:w,prefix:n.slice(0,w),nums:n};
}
function rdState(st){return 'write '+st.w+', prefix '+rdShow(st.prefix);}
var PREDICT=[4,6,9].map(function(p){
  var A=RD_PREDICT_ARRAY,right=rdAfter(A,p),c={p:p,vals:A,state:right,expect:rdState(right)};
  var opts=[rdState(right)];
  if(p>1)opts.push(rdState(rdAfter(A,p-1)));
  opts.push(rdState(rdAfter(A,p+1)));
  /* the slip that takes the first `write` values as they were, forgetting that earlier writes changed them */
  opts.push(rdState({w:right.w,prefix:A.slice(0,right.w)}));
  c.choices=opts.filter(function(o,i){return opts.indexOf(o)===i;}).sort();
  return c;
});
function mountGuess(host){
  mountPredict(host,PREDICT,{
    question:function(c){return 'Run the loop on <code>'+rdShow(c.vals)+'</code>. Once the first <b>'+c.p+'</b> values have been decided, where does <code>write</code> stand and what do the kept slots hold?';},
    choices:function(c){return c.choices;},
    draw:function(view,c){
      var row=el('div','pl-mini','<span>'+rdShow(c.vals)+'</span>');view.appendChild(row);
      return {reveal:function(){row.innerHTML='<span>after '+c.p+' decided: '+rdShow(c.state.nums)+'</span><span>kept: '+rdShow(c.state.prefix)+'</span>';}};
    },
    why:function(c){
      var st=c.state,distinct=rdDistinct(c.vals.slice(0,c.p));
      return 'The kept slots hold the distinct values among the first '+c.p+' read, in order: '+rdShow(distinct)+', so <code>write</code> is '+st.w+'. '+
        'The slots are not the first '+st.w+' values as they started: earlier keeps overwrote them, so the array now reads '+rdShow(st.nums)+'.';
    }
  });
}

/* ---------- 3. what the repeats cost: shifting against the write pointer ---------- */
function mountCost(){
  var pts=[];
  for(var n=0;n<=64;n+=8){var a=rdTwice(n);pts.push([n,rdDeleteMoves(a),rdLoop(a).writes]);}
  var last=pts[pts.length-1];
  costChart($('#costplot'),{names:['delete each repeat: elements shifted','write pointer: elements written'],ylabel:'elements moved',pts:pts,xlabel:'values in the array (each appears twice)',xticks:[0,16,32,48,64],
    aria:'Elements moved while removing the repeats from an array in which every value appears twice: deleting each repeat shifts '+last[1]+' elements at '+last[0]+' values; the write pointer writes '+last[2]+'. The first grows with the square of the length, the second with the length.'});
  $('#costNote').innerHTML='Counted by running both: at <b>'+last[0]+'</b> values the deleting version shifted <b>'+fmt(last[1])+'</b> elements and the write pointer wrote <b>'+last[2]+'</b>. At the constraint\'s 30,000 values, spread over the 201 values it allows, deleting shifts <b>'+FACTS.deleteMoves30k+'</b> elements and the pointer writes <b>'+FACTS.writes30k+'</b>. The copying version\'s second list never exceeds <b>'+FACTS.heldAtMost+'</b> values, but only because the constraint caps the distinct values; the O(1) the problem asks for does not lean on that.';
}

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountLesson();
  mountHand($('#byhand'));
  mountGuess($('#predict'));
  mountLaneTabs($('#trapper'),[{name:'Compare with the last kept',steps:function(){return rdSteps(RD_CASES[1],'last');}},
    {name:'Compare with the slot to fill',steps:function(){return rdSteps(RD_CASES[1],'slot');}}],{id:'trap',inv:RD_INV});
  $('#trapNote').innerHTML='Run on the lesson\'s '+FACTS.cases+' test arrays, the slot comparison passes <b>'+FACTS.wrongPass+'</b> and fails the rest. It is right whenever no repeat survives to be overwritten, which is why the short arrays hide it.';
  mountCost();
  mountLaneTabs($('#stepper'),[RD_CASES[0],RD_CASES[1],RD_CASES[3]].map(function(c){return {name:rdShow(c),steps:function(){return rdSteps(c,'last');}};}),{id:'walk',inv:RD_INV});
})();

/* ================= the register hero: a finger reads, a pen keeps ================= */
(function(){
  function heroSweep(){
    var svg=$('#heroSweep');if(!svg)return;
    var A=RD_CASES[1],T=rdTimeline(A),n=A.length,cw=46,gap=6,x0=(560-(n*cw+(n-1)*gap))/2,y=70,ch=58,cx=function(i){return x0+i*(cw+gap);};
    var h='<text class="hd-lab" x="'+x0+'" y="40">a sorted register, one line per night</text>';
    A.forEach(function(v,i){
      h+='<rect class="hd-node" data-i="'+i+'" x="'+cx(i)+'" y="'+y+'" width="'+cw+'" height="'+ch+'" rx="9"/>'+
        '<text class="hd-val" data-i="'+i+'" x="'+(cx(i)+cw/2)+'" y="'+(y+36)+'" text-anchor="middle">'+v+'</text>'+
        '<text class="hd-ix" x="'+(cx(i)+cw/2)+'" y="'+(y-8)+'" text-anchor="middle">'+i+'</text>';});
    h+='<text class="hf-tag" id="hsRead" y="'+(y+ch+30)+'" text-anchor="middle">read</text><text class="hf-tag" id="hsWrite" y="'+(y+ch+50)+'" text-anchor="middle">write</text>';
    h+='<text class="hd-lab" id="hsDir" x="'+x0+'" y="'+(y+ch+86)+'"></text>';
    svg.innerHTML=h;
    var num=$('#heroNum'),cap=$('#heroCap'),nodes=svg.querySelectorAll('.hd-node'),vals=svg.querySelectorAll('.hd-val'),rd=$('#hsRead'),wr=$('#hsWrite');
    function show(f){
      var s=T[f];
      for(var i=0;i<n;i++){
        vals[i].textContent=s.nums[i];
        nodes[i].classList.toggle('lit',i<s.w);
        nodes[i].classList.toggle('cur',i===s.r&&f>0);
        nodes[i].classList.toggle('off',i>=s.w&&i<=s.r);
      }
      rd.setAttribute('x',cx(s.r)+cw/2);
      wr.setAttribute('x',s.w<n?cx(s.w)+cw/2:cx(n-1)+cw/2);wr.style.opacity=s.w<n?1:0;
      num.textContent=s.w;
      $('#hsDir').textContent=f===T.length-1?'the first '+s.w+' lines now hold each guest once':'';
      cap.textContent=f===0?'Read each value; keep it only when it differs from the last one kept':(s.w>(T[f-1].w)?'Read '+A[s.r]+': new, so the pen writes it':'Read '+A[s.r]+': same as the last kept, so the pen waits');
    }
    if(reduce||!M||!M.animate){show(T.length-1);return;}
    var last=-1,total=T.length+2;
    M.animate(0,total,{duration:total*1.3,ease:'linear',repeat:Infinity,onUpdate:function(v){var f=Math.min(T.length-1,Math.floor(v));if(f!==last){last=f;show(f);}}});
  }
  heroSweep();kinetic();riseIn();
})();
