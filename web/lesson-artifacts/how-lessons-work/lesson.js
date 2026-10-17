/* ================= How Lessons & Problems Work: the lesson =================
   The page demonstrates each interactive block on itself. Everything it counts is computed in the PURE block
   below by running the code it describes; check.py runs that block in node, re-derives each number
   independently in Python, and compares the course tables (lesson types, hint counts, solution tabs) with the
   app's manifest and the course files, so a course change fails the gate. */

/* PURE:begin (no DOM below this line until PURE:end) */
/* the two arcs, from the course's own lesson text; `tab` is where a problem step sits in the workspace */
var HW={
  concept:{name:'Concept lesson',role:'demonstration',steps:[
    {t:'Motivation',d:'What problem exists that this thing solves, and what breaks without it.',b:['prose']},
    {t:'Mechanics',d:'How it works, down to memory layout, with visualizations you can step through.',b:['diagrams']},
    {t:'Operations and their costs',d:'Every operation, with its complexity and the reasoning that produces the number.',b:['complexity box']},
    {t:'Implementation',d:'Built from scratch, in Python and TypeScript.',b:['code in both languages']},
    {t:'Trade-offs',d:'When to reach for it, and when an alternative wins.',b:['prose']},
    {t:'Quiz',d:'A short check that it stuck, with an explanation either way.',b:['quiz']}]},
  problem:{name:'Problem lesson',role:'cook-off',steps:[
    {t:'Statement and constraints',d:'The task, worked examples and the limits the input obeys.',b:['examples','constraints'],tab:'Problem tab, Description section'},
    {t:'Your attempt',d:'Write code in the editor beside the problem and run it against the cases.',b:['sandbox'],tab:'Code (beside the Problem tab on a wide screen)'},
    {t:'Hints',d:'Progressive nudges, one reveal each. Take the smallest push you need, then go back to your attempt.',b:['reveals'],tab:'Problem tab, Explanation section'},
    {t:'Brute force and its cost',d:'The obvious solution and exactly what it costs, so the improvement has something to beat.',b:['code in both languages','complexity box'],tab:'Problem tab, Explanation section'},
    {t:'The key insight',d:'The one observation that removes the waste, derived rather than asserted.',b:['prose'],tab:'Problem tab, Explanation section'},
    {t:'The optimal solution',d:'The improved solution in both languages, with its complexity and the reason for it.',b:['reveal','code in both languages','complexity box'],tab:'Problem tab, Solution section'},
    {t:'Variants',d:'The same idea under changed conditions, to see what transfers.',b:['prose'],tab:'Problem tab, Solution section'}]}
};
/* the course tables the page quotes; check.py compares each with the manifest and the lesson files (and asserts every problem lesson has a Solution section) */
var CORPUS={types:{concept:83,practice:21,problem:116},hints:{1:75,2:37,3:4}};
CORPUS.navTotal=CORPUS.types.concept+CORPUS.types.practice;
CORPUS.hintLessons=CORPUS.hints[1]+CORPUS.hints[2]+CORPUS.hints[3];

/* the page's example: contains_duplicate, instrumented to count the loop's iterations */
function cdRun(nums){
  var seen=new Set(),it=0;
  for(var i=0;i<nums.length;i++){it++;if(seen.has(nums[i]))return {answer:true,iterations:it,seen:seen.size};seen.add(nums[i]);}
  return {answer:false,iterations:it,seen:seen.size};
}
/* the neighbours-only mistake, as code/mistake.* write it */
function cdNeighbours(nums){for(var i=1;i<nums.length;i++)if(nums[i]===nums[i-1])return true;return false;}
function cdTrace(nums){
  var seen=[],lines=[];
  for(var i=0;i<nums.length;i++){
    var x=nums[i],hit=seen.indexOf(x)>=0;
    lines.push('Iteration '+(i+1)+': '+x+(hit?' is already in seen, so return True.':' is not in seen yet, so add it. seen is now {'+seen.concat([x]).join(', ')+'}.'));
    if(hit)return lines;
    seen.push(x);
  }
  lines.push('The list is used up with no repeat, so return False.');
  return lines;
}
function cdLabel(r){return (r.answer?'True':'False')+', after '+r.iterations+' iteration'+(r.iterations===1?'':'s');}
var CD_CASES=[[3,1,3],[1,2,3],[5,5,1,2]];
var CD_PREDICT=CD_CASES.map(function(a){var r=cdRun(a);return {nums:a,run:r,expect:cdLabel(r),trace:cdTrace(a)};});
var CD_CHOICES=['True, after 2 iterations','True, after 3 iterations','False, after 3 iterations','False, after 4 iterations'];
/* worst and best case for the cost chart: a list with no repeat, and one whose first two items are equal */
function cdDistinct(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a;}
function cdEarly(n){var a=cdDistinct(n);a[1]=a[0];return a;}
var COSTS=[10,20,30,40,50,60,70,80,90,100].map(function(n){return [n,cdRun(cdDistinct(n)).iterations,cdRun(cdEarly(n)).iterations];});

/* the progress model: which of the page's five pretend lessons are open, solved, and how many quiz answers */
var PG_LESSONS=[{id:'a',type:'concept'},{id:'b',type:'concept'},{id:'c',type:'practice'},{id:'d',type:'problem'},{id:'e',type:'problem'}];
function pgNav(l){return l.type==='concept'||l.type==='practice';}
function pgApply(s,act){
  var n={visited:s.visited.slice(),solved:s.solved.slice(),quiz:s.quiz};
  if(act.k==='open'&&n.visited.indexOf(act.id)<0)n.visited.push(act.id);
  if(act.k==='solve'){if(n.visited.indexOf(act.id)<0)n.visited.push(act.id);if(n.solved.indexOf(act.id)<0)n.solved.push(act.id);}
  if(act.k==='quiz')n.quiz=s.quiz+1;
  return n;
}
function pgChip(s){return PG_LESSONS.filter(function(l){return pgNav(l)&&s.visited.indexOf(l.id)>=0;}).length;}
/* where each kind of progress lives: visited, solved and problem drafts sync once signed in; quiz answers never do */
var PG_KINDS=[
  {id:'visited',name:'Visited lessons',syncs:true},
  {id:'solved',name:'Solved problems',syncs:true},
  {id:'drafts',name:'Problem code drafts',syncs:true},
  {id:'quiz',name:'Quiz answers',syncs:false}
];
function pgWhere(k,signedIn){return signedIn&&k.syncs?'this browser, and your account':'this browser only';}

var FACTS={
  costN:COSTS[COSTS.length-1][0],worstAt:COSTS[COSTS.length-1][1],bestAt:COSTS[COSTS.length-1][2],
  navTotal:CORPUS.navTotal,conceptSteps:HW.concept.steps.length,problemSteps:HW.problem.steps.length
};
/* PURE:end */

/* ---------- 1. the two arcs, stepped ---------- */
function hwPanel(arc,i){
  var st=HW[arc].steps[i],blocks=st.b.map(function(x){return '<span class="hw-b">'+x+'</span>';}).join('');
  return '<div class="hw-h"><span class="hw-n">Step '+(i+1)+' of '+HW[arc].steps.length+'</span><b>'+st.t+'</b></div><p class="hw-d">'+st.d+'</p>'+
    '<div class="hw-row"><span class="hw-k">Blocks</span><span>'+blocks+'</span></div>'+
    (st.tab?'<div class="hw-row"><span class="hw-k">Where</span><span>'+st.tab+'</span></div>':'');
}
function mountArcs(w){
  var tabs=w.querySelector('.extabs'),track=$('#hwTrack'),panel=$('#hwPanel'),prev=$('#hwPrev'),next=$('#hwNext'),note=$('#hwNote');
  var arc='concept',i=0,btns={};
  var all=[];Object.keys(HW).forEach(function(a){HW[a].steps.forEach(function(_,k){all.push(hwPanel(a,k));});});
  Object.keys(HW).forEach(function(a){var b=el('button','tab',HW[a].name+' ('+HW[a].role+')');b.type='button';b.addEventListener('click',function(){arc=a;i=0;paint();});tabs.appendChild(b);btns[a]=b;});
  prev.addEventListener('click',function(){if(i>0){i--;paint();}});
  next.addEventListener('click',function(){if(i<HW[arc].steps.length-1){i++;paint();}});
  function paint(){
    Object.keys(btns).forEach(function(a){btns[a].setAttribute('aria-pressed',a===arc);});
    track.innerHTML='';
    HW[arc].steps.forEach(function(st,k){
      var b=el('button','hw-dot'+(k===i?' on':k<i?' done':''),'<span class="sr">'+st.t+'</span><i aria-hidden="true">'+(k+1)+'</i>');b.type='button';b.title=st.t;
      if(k===i)b.setAttribute('aria-current','step');
      b.addEventListener('click',function(){i=k;paint();});track.appendChild(b);});
    panel.innerHTML=hwPanel(arc,i);
    prev.disabled=i===0;next.disabled=i===HW[arc].steps.length-1;
    note.innerHTML=arc==='problem'?'A problem lesson also has a <b>Quiz</b> tab of its own.':'A concept lesson reads top to bottom on one page.';
  }
  paint();
  var fit=function(){panel.style.minHeight='';reserveHeight(panel,all);};
  fit();if('ResizeObserver' in window)new ResizeObserver(fit).observe(w);
}

/* ---------- 2. hints per problem lesson ---------- */
function mountHints(){
  var h=$('#hintBars'),max=Math.max(CORPUS.hints[1],CORPUS.hints[2],CORPUS.hints[3]);
  [1,2,3].forEach(function(n){
    var c=CORPUS.hints[n];
    h.appendChild(el('div','hb-row','<span class="hb-k">'+n+' hint'+(n>1?'s':'')+'</span><span class="hb-bar" aria-hidden="true"><i style="width:'+Math.round(c/max*100)+'%"></i></span><span class="hb-c">'+c+' lessons</span>'));
  });
  h.appendChild(el('div','hb-total','Across all <b>'+CORPUS.types.problem+'</b> problem lessons: <b>'+CORPUS.hintLessons+'</b> carry at least one hint.'));
}

/* ---------- 3. predict ---------- */
function mountGuess(host){
  mountPredict(host,CD_PREDICT.map(function(c){return {c:c,expect:c.expect};}),{
    question:function(x){return 'What does <code>contains_duplicate(['+x.c.nums.join(', ')+'])</code> return, and after how many loop iterations?';},
    choices:function(){return CD_CHOICES;},
    draw:function(view,x){
      var row=el('div','pl-mini','<span>nums = ['+x.c.nums.join(', ')+']</span>');view.appendChild(row);
      return {reveal:function(){row.innerHTML='<span>'+x.c.expect+'</span><span>seen ends with '+x.c.run.seen+' item'+(x.c.run.seen===1?'':'s')+'</span>';}};
    },
    why:function(x){return x.c.trace.join(' ');}
  });
}

/* ---------- 4. cost ---------- */
function mountCost(){
  var last=COSTS[COSTS.length-1];
  costChart($('#cmp'),{names:['no repeat: iterations','repeat in the first two: iterations'],pts:COSTS,xlabel:'items in the list',xticks:[0,20,40,60,80,100],ylabel:'loop iterations',
    aria:'Loop iterations of contains_duplicate against list length up to 100: with no repeat it runs once per item, '+last[1]+' at 100 items; when the first two items are equal it stops after '+last[2]+' at every length.'});
  $('#costNote').innerHTML='Counted by running it: at <b>'+FACTS.costN+'</b> items a list with no repeat takes <b>'+FACTS.worstAt+'</b> iterations, and one whose first two items match takes <b>'+FACTS.bestAt+'</b>. The bound has to cover the first kind, so it is O(n) even though the second stops at once.';
}

/* ---------- 5. the progress model ---------- */
function mountProgress(w){
  var s={visited:[],solved:[],quiz:0},signed=false,btnHost=$('#pgActions'),chip=$('#pgChip'),rows=$('#pgRows'),sw=$('#pgSign');
  var LABEL={a:'a concept lesson',b:'another concept lesson',c:'a practice chapter',d:'a problem lesson',e:'another problem lesson'};
  function add(text,act,cls){var b=el('button','btn2'+(cls?' '+cls:''),text);b.type='button';b.addEventListener('click',function(){s=pgApply(s,act);paint();});btnHost.appendChild(b);}
  PG_LESSONS.forEach(function(l){add('Open '+LABEL[l.id],{k:'open',id:l.id});});
  add('Pass every test on '+LABEL.d,{k:'solve',id:'d'},'best');
  add('Answer a quiz question',{k:'quiz'});
  sw.addEventListener('click',function(){signed=!signed;paint();});
  function count(kind){return kind==='visited'?s.visited.length:kind==='solved'?s.solved.length:kind==='quiz'?s.quiz:null;}
  function paint(){
    sw.setAttribute('aria-pressed',signed);sw.textContent=signed?'Signed in':'Signed out';
    chip.innerHTML='<b>'+pgChip(s)+'</b>/'+CORPUS.navTotal;
    rows.innerHTML=PG_KINDS.map(function(k){var c=count(k.id);
      return '<div class="pg-row"><span class="pg-k">'+k.name+'</span><span class="pg-c">'+(c===null?'saved as you type':c)+'</span><span class="pg-w'+(signed&&k.syncs?' sync':'')+'">'+pgWhere(k,signed)+'</span></div>';}).join('');
    $('#pgNote').textContent='Visited '+s.visited.length+' of the '+PG_LESSONS.length+' model lessons, '+pgChip(s)+' of them counted by the chip: problem lessons are marked visited but the chip counts only concept lessons and practice chapters.';
  }
  paint();
}

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountLesson();
  mountArcs($('#arcs'));
  mountHints();
  mountGuess($('#predict'));
  mountCost();
  mountProgress($('#progress'));
})();

/* ================= systems layer: the two arcs hero ================= */
(function(){
  function heroArcs(){
    var svg=$('#heroArcs');if(!svg)return;
    var rows=[{arc:'concept',y:112},{arc:'problem',y:212}],X0=70,DX=62,dots=[];
    S('text',{x:280,y:30,class:'hd-lab','text-anchor':'middle'},svg).textContent='two kinds of session, each with its own order';
    rows.forEach(function(r){
      S('text',{x:X0-14,y:r.y-22,class:'hd-lab'},svg).textContent=HW[r.arc].name.toLowerCase()+': a '+HW[r.arc].role;
      S('path',{d:'M'+X0+' '+r.y+'H'+(X0+(HW[r.arc].steps.length-1)*DX),class:'ha-line'},svg);
      HW[r.arc].steps.forEach(function(st,k){var c=S('circle',{cx:X0+k*DX,cy:r.y,r:13,class:'ha-dot'},svg);dots.push({c:c,arc:r.arc,k:k});});
    });
    var num=$('#heroNum'),unit=$('#heroUnit'),cap=$('#heroCap'),N=HW.problem.steps.length;
    function show(n){/* n steps taken: 0..N */
      dots.forEach(function(d){d.c.setAttribute('class','ha-dot'+(d.k<n?' on':d.k===n?' now':''));});
      num.textContent=n;unit.textContent='of '+N+' steps taken';
      var st=n===0?null:HW.problem.steps[n-1];
      cap.innerHTML=st?'Problem lesson, step '+n+': '+st.t:'Both start at step one. Only the problem lesson hands you the work.';
    }
    if(reduce||!M||!M.animate){show(N);return;}
    var last=-1,total=N+2;
    M.animate(0,total,{duration:total*1.1,ease:'linear',repeat:Infinity,onUpdate:function(v){var n=Math.min(N,Math.floor(v));if(n!==last){last=n;show(n);}}});
  }
  heroArcs();kinetic();riseIn();
})();
