/* ================= Coin Change: the lesson ================= */

/* ---------- the algorithm, executed: one trace, plus independent references ---------- */
var INF=Infinity;
function dpTrace(coins,amount){
  var dp=[0],par=[-1],steps=[];
  for(var a=1;a<=amount;a++){
    var cands=[],best=INF,bc=-1;
    coins.forEach(function(c){if(c<=a){var v=dp[a-c]+1;cands.push({c:c,from:a-c,v:v});if(v<best){best=v;bc=c;}}});
    dp[a]=best;par[a]=bc;steps.push({a:a,cands:cands,best:best,coin:bc,dp:dp.slice()});
  }
  return {dp:dp,par:par,steps:steps,ans:dp[amount]===INF?-1:dp[amount]};
}
function orderOf(tr,amount){var out=[];for(var a=amount;a>0&&tr.par[a]>0;a-=tr.par[a])out.push(tr.par[a]);return out;}
/* a different algorithm: breadth-first search over amounts, one launch per level */
function bfsFewest(coins,amount){
  if(amount===0)return 0;
  var seen={0:true},level=[0],steps=0;
  while(level.length){steps++;var next=[];
    for(var i=0;i<level.length;i++)for(var j=0;j<coins.length;j++){var t=level[i]+coins[j];
      if(t===amount)return steps;if(t<amount&&!seen[t]){seen[t]=true;next.push(t);}}
    level=next;}
  return -1;
}
/* what greedy does: the biggest size that fits, again and again */
function greedyOrder(coins,amount){
  var out=[],left=amount,cs=coins.slice().sort(function(x,y){return y-x;});
  cs.forEach(function(c){while(left>=c){out.push(c);left-=c;}});
  return left===0?out:null;
}
/* the recursion from the page, run for real, counting every call and every different amount asked about */
function recursionCost(coins,amount){
  var calls=0,asked={};
  function f(a){calls++;asked[a]=true;if(a===0)return 0;var best=INF;coins.forEach(function(c){if(c<=a)best=Math.min(best,f(a-c)+1);});return best;}
  var r=f(amount);return {calls:calls,asked:Object.keys(asked).length,ans:r===INF?-1:r};
}
function vc(n){return n+' vCPU'+(n===1?'':'s');}
function inputFor(coins){return '{'+coins.join(', ')+'}';}

var CASES=[[[1,2,5],11],[[2],3],[[1],0],[[2],0],[[1,3,4],6],[[5],5],[[186,419,83,408],6249],[[7,9],11]];
CASES.forEach(function(c){
  var d=dpTrace(c[0],c[1]).ans,b=bfsFewest(c[0],c[1]);
  if(d!==b)throw new Error('table and breadth-first search disagree on '+JSON.stringify(c));
});
[[[1,2,5],11,3],[[2],3,-1]].forEach(function(c){if(dpTrace(c[0],c[1]).ans!==c[2])throw new Error('problem statement example failed');});

/* ---------- 1. explore: build an order by hand ---------- */
var SCEN=[{name:'sizes 1, 2, 5 · need 11',coins:[1,2,5],amount:11},{name:'sizes 1, 3, 4 · need 6',coins:[1,3,4],amount:6},{name:'size 2 · need 3',coins:[2],amount:3}];
function mountExplore(host){
  var tabs=host.querySelector('.extabs'),bar=host.querySelector('.fleet'),out=host.querySelector('.readout'),picksEl=host.querySelector('.picks'),cur=0,picks=[];
  function total(){return picks.reduce(function(a,b){return a+b;},0);}
  function draw(msg){
    var sc=SCEN[cur],t=total(),left=sc.amount-t;
    bar.innerHTML='';bar.setAttribute('role','img');bar.setAttribute('aria-label',picks.length+' instances so far, '+t+' of '+sc.amount+' vCPUs');
    picks.forEach(function(p){var s=el('span','seg',String(p));s.style.flexGrow=p;bar.appendChild(s);});
    if(left>0){var g=el('span','gap',left+' left');g.style.flexGrow=left;bar.appendChild(g);}
    picksEl.querySelectorAll('button').forEach(function(b){b.disabled=+b.dataset.size>left;});
    var F=dpTrace(sc.coins,sc.amount).ans;
    if(msg){out.innerHTML=msg;return;}
    if(left===0)out.innerHTML='Exactly '+sc.amount+' vCPUs with <b>'+picks.length+'</b> instances. '+(picks.length===F?'That is the fewest possible.':'The fewest possible is <b>'+F+'</b>, so a better order exists.');
    else if(!sc.coins.some(function(c){return c<=left;}))out.innerHTML='<b>Stuck:</b> '+vc(left)+' left and no size is that small. Undo and try a different mix.';
    else out.innerHTML=(picks.length?picks.length+' instances launched, ':'Nothing launched yet, ')+'<b>'+left+'</b> '+(left===1?'vCPU':'vCPUs')+' still to fill.';
  }
  function pick(size){picks.push(size);draw();}
  function load(i){
    cur=i;picks=[];
    tabs.querySelectorAll('button').forEach(function(b,k){b.setAttribute('aria-pressed',k===i);});
    picksEl.innerHTML='';
    SCEN[i].coins.forEach(function(c){var b=el('button','btn2','+ '+c+' vCPU');b.type='button';b.dataset.size=c;b.addEventListener('click',function(){pick(c);});picksEl.appendChild(b);});
    draw();
  }
  SCEN.forEach(function(s,i){var b=el('button','tab',s.name);b.type='button';b.addEventListener('click',function(){load(i);});tabs.appendChild(b);});
  host.querySelector('.undo').addEventListener('click',function(){picks.pop();draw();});
  host.querySelector('.best').addEventListener('click',function(){
    var sc=SCEN[cur],tr=dpTrace(sc.coins,sc.amount);picks=[];
    if(tr.ans<0){draw('No order adds up to exactly '+sc.amount+': every size is even, so every total is even.');return;}
    picks=orderOf(tr,sc.amount);draw('A fewest order: '+picks.join(' + ')+' = '+sc.amount+', <b>'+tr.ans+'</b> instances. No order uses fewer.');
  });
  load(0);
}

/* ---------- 2. predict ---------- */
var PREDICT=[[[1,2,5],11],[[1,3,4],6],[[2],3]].map(function(c){var tr=dpTrace(c[0],c[1]);return {coins:c[0],amount:c[1],expect:tr.ans,order:orderOf(tr,c[1]),greedy:greedyOrder(c[0],c[1])};});
function mountGuess(host){
  mountPredict(host,PREDICT,{
    question:function(c){return 'Sizes <code>'+inputFor(c.coins)+'</code>, capacity <code>'+c.amount+'</code>. What is the fewest instances that add up to exactly '+c.amount+'?';},
    choices:function(){return [-1,1,2,3,4];},
    draw:function(view,c){
      var row=el('div','sizes',c.coins.map(function(s){return '<span class="sz">'+s+' vCPU</span>';}).join('')+'<span class="sz need">need '+c.amount+'</span>');view.appendChild(row);
      return {reveal:function(){row.appendChild(el('span','sz ans',c.expect<0?'impossible':c.order.join(' + ')+' = '+c.amount));}};
    },
    why:function(c){
      if(c.expect<0)return 'Every size is even, so every total is even and '+c.amount+' can never be reached. That is the case the <code>-1</code> is for.';
      var g=c.greedy;
      return 'An order that works: <code>'+c.order.join(' + ')+'</code>, '+c.expect+' instances. '+(g&&g.length===c.expect?'Greedy happens to find it here too.':(g?'Greedy would launch <code>'+g.join(' + ')+'</code>, which is '+g.length+' instances, so it is not the fewest.':'Greedy would fail outright here.'));
    }
  });
}

/* ---------- 3. the two traps ---------- */
function mountGreedyTable(host){
  var sets=[[[1,2,5],11],[[1,3,4],6],[[1,5,6,9],11],[[3,5],9]],wrong=0;
  sets.forEach(function(c){
    var opt=dpTrace(c[0],c[1]).ans,g=greedyOrder(c[0],c[1]),gl=g?g.length:-1,bad=gl!==opt;if(bad)wrong++;
    host.appendChild(el('div','',
      '<span>sizes '+inputFor(c[0])+', need '+c[1]+'</span><em>greedy → '+(g?g.join('+')+' = '+gl:'gets stuck, -1')+' · fewest → '+opt+(bad?' <b style="color:var(--r-ink)">greedy is wrong</b>':' <b style="color:var(--g-ink)">agree</b>')+'</em>'));
  });
  if(wrong<2||greedyOrder([3,5],9)!==null||greedyOrder([1,3,4],6).join('+')!=='4+1+1'||dpTrace([3,5],9).ans!==3)throw new Error('the greedy examples in the prose no longer hold');
  $('#greedy-note').innerHTML='Greedy is wrong on <b>'+wrong+'</b> of these '+sets.length+'. On <code>{3, 5}</code> with 9 it takes a 5, is left with 4, and gives up, although 3 + 3 + 3 reaches 9 exactly. The answers in the "fewest" column come from the table you are about to build and are cross-checked by a breadth-first search.';
  sets.forEach(function(c){if(dpTrace(c[0],c[1]).ans!==bfsFewest(c[0],c[1]))throw new Error('greedy table reference mismatch');});
}
function mountCost(host){
  var pts=[],c=[1,2,5],calls=[1];
  for(var a=1;a<=25;a++){
    var r=recursionCost(c,a),f=1;c.forEach(function(x){if(x<=a)f+=calls[a-x];});calls[a]=f;
    if(r.calls!==f||r.asked!==a+1||r.ans!==dpTrace(c,a).ans)throw new Error('recursion cost check failed at '+a);
    pts.push([a,r.calls,r.asked]);
  }
  var last=pts[pts.length-1];
  costChart(host,{pts:pts,xmax:25,log:true,xticks:[0,5,10,15,20,25],xlabel:'amount to make',aria:'Calls made by the plain recursion against different questions, on a log scale: the recursion reaches '+fmt(last[1])+' calls at amount 25 while there are only '+last[2]+' different questions.'});
  host.parentNode.querySelector('.cost-note').innerHTML='Making <b>25</b> takes the recursion <b>'+fmt(last[1])+'</b> calls, yet it only ever asks <b>'+last[2]+'</b> different questions, one per amount from 0 to 25. The axis is logarithmic because the red line multiplies by about '+(last[1]/pts[pts.length-2][1]).toFixed(1)+' with every step. Each call count is measured by running the recursion, and matches the recurrence calls(a) = 1 + the sum of calls(a − c) over sizes that fit.';
}

/* ---------- 4. the table, frame by frame ---------- */
function tableFrames(coins,amount){
  var tr=dpTrace(coins,amount),n=amount+1,frames=[],ix=[];
  for(var i=0;i<n;i++)ix.push({k:'dim',t:String(i)});
  function val(v){return v===INF?'∞':String(v);}
  function cells(a,srcs,filled){
    var out=[];
    for(var i=0;i<n;i++){
      var k='idle',t='';
      if(i<=filled){t=val(tr.dp[i]);k=tr.dp[i]===INF?'dim':'idle';}
      if(i===0)k='done';
      if(srcs&&srcs.indexOf(i)>=0){k='win';}
      if(i===a){k='cur';}
      out.push({k:k,t:t});}
    return out;
  }
  frames.push({b:{ix:ix,dp:cells(-1,null,0)},note:'The table has one cell per amount, from 0 to '+amount+'. Cell a will hold the fewest instances that add up to exactly a vCPUs. Cell 0 is 0: no capacity needs no instances.',stats:[['sizes',coins.join(' ')],['need',amount]]});
  tr.steps.forEach(function(st){
    var srcs=st.cands.map(function(x){return x.from;});
    var note;
    if(!st.cands.length)note='Amount '+st.a+': no size is small enough to be the last instance, so it stays ∞.';
    else{
      var parts=st.cands.map(function(x){return x.c+' → dp['+x.from+'] + 1 = '+(x.v===INF?'∞':x.v);});
      note='Amount '+st.a+': try each size as the last instance. '+parts.join(', ')+'. '+(st.best===INF?'Every remainder is unreachable, so it stays ∞.':'The smallest is '+st.best+', so dp['+st.a+'] = '+st.best+'.');
    }
    frames.push({b:{ix:ix,dp:cells(st.a,srcs,st.a)},note:note,stats:[['amount',st.a],['dp['+st.a+']',val(st.best)]],ev:st.best===INF?'bad':null});
  });
  var path=orderOf(tr,amount),onPath=[];
  if(tr.ans>=0){var a=amount;onPath.push(a);while(a>0&&tr.par[a]>0){a-=tr.par[a];onPath.push(a);}}
  var fin=[];for(var i=0;i<n;i++){var k=onPath.indexOf(i)>=0?'done':(tr.dp[i]===INF?'dim':'idle');fin.push({k:k,t:val(tr.dp[i])});}
  frames.push({b:{ix:ix,dp:fin},note:tr.ans<0?'Done: dp['+amount+'] is ∞, so no order adds up to exactly '+amount+'. The answer is -1.':'Done: dp['+amount+'] = '+tr.ans+'. Following the winning last size back from '+amount+' gives '+path.join(' + ')+' = '+amount+'.',stats:[['answer',tr.ans]],ev:'key'});
  var ref=bfsFewest(coins,amount);if(ref!==tr.ans)throw new Error('frames disagree with breadth-first search');
  return {frames:frames,step:1.0,poster:frames.length-1,
    boards:[{id:'ix',label:'amount',g:0,cols:n,rows:1,cap:44,wide:true},{id:'dp',label:'fewest instances',g:0,cols:n,rows:1,cap:44,wide:true}],
    label:'Filling the table for sizes '+inputFor(coins)+' and capacity '+amount+'.'};
}
var EXAMPLES=[{name:'1, 2, 5 · 11',coins:[1,2,5],amount:11},{name:'1, 3, 4 · 6 (where greedy fails)',coins:[1,3,4],amount:6},{name:'2 · 5 (impossible)',coins:[2],amount:5}];
function mountWalk(host){mountStepper(host,EXAMPLES,function(i){return tableFrames(EXAMPLES[i].coins,EXAMPLES[i].amount);},'walk');}

/* ---------- 5. quiz ---------- */
var OPS=10000*12;
var QUIZ=[
 {q:'Why is it enough to try every size as the <em>last</em> instance and take the best, when greedy\'s single choice is not?',
  opts:['Any fewest order for a ends in some size c, and what remains must be a fewest order for a − c, or the whole could be shorter. So 1 + the best dp[a − c] over all c misses nothing.',
        'Trying every size makes the table record every order in which instances could be launched, and taking the minimum then picks the cheapest of those orders once all of them are listed.',
        'Taking the minimum over every size ends up choosing the smallest size at each step, and building the order from small sizes is what keeps the count of instances as low as it can go.'],
  a:0,why:'This is optimal substructure: the best solution contains a best solution to a smaller version of the same problem. Greedy commits to one candidate without comparing, so a locally big choice can strand an awkward remainder. Trying every last size compares them all, and the order in which instances are launched never matters to the total.'},
 {q:'The table starts with <code>dp[0] = 0</code> and every other entry at <code>amount + 1</code>. Why not start them all at 0?',
  opts:['A 0 would win every minimum, so every cell would claim zero instances. amount + 1 means "not reachable yet": any real count beats it, and a cell still holding it at the end is unreachable.',
        'Zero would give the same answers, since cells that are never reached are never read; the large value only guards against integer overflow when 1 is added to an entry that is already large.',
        'Starting high lets the inner loop stop early: once one size gives a count below the starting value, the remaining sizes cannot do better, so the comparison exits on most steps.'],
  a:0,why:'Take sizes {2} and capacity 3. With zeros everywhere, dp[1] and dp[3] would stay at their starting 0 and the code would answer 0, claiming no instances are needed. With the placeholder, dp[3] stays at 4 and the check turns it into -1. Forgetting that check, as the warning below shows, returns the placeholder itself.'},
 {q:'For the constraint\'s largest input, an amount of 10⁴ with 12 sizes, roughly how many inner steps does the table version take?',
  opts:['About '+fmt(OPS)+' steps: each of the 10⁴ amounts is solved once, and solving one tries each of the 12 sizes once, so 10⁴ × 12.',
        'About 2¹² = 4,096 steps, since each of the 12 sizes is either used or not, and the table only settles which subset of sizes the best order draws from.',
        'About 10⁴ steps, since the table has 10⁴ cells and each is filled by one lookup into the cell for the largest size that fits, which keeps the work linear.'],
  a:0,why:'Each of the 10⁴ cells tries every one of the 12 sizes, and a try is one lookup and one comparison. The plain recursion, by contrast, asks the same question again and again, and its call count multiplies at every step: see the chart above. The table is the same recurrence with each answer stored once.'}
];

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountExplore($('#explore'));
  mountGuess($('#predict'));
  reveal($('#hint'),'Hint: look only at the last instance',function(b){
    b.innerHTML='<p>Suppose you already knew the fewest instances for every smaller capacity. How would you use that to answer for capacity a?</p><p>Whatever the best order is, one instance was launched last, and it had some size c. Take it away and you are looking at an order for a − c. So the answer for a is one more than the answer for a − c, for whichever c was last.</p><p>You do not know which c was last, so try each size that fits and keep the smallest result.</p>';
  });
  $('#greedy-code').appendChild(codeBlock(CODE.mistake_greedy.py,CODE.mistake_greedy.ts,'Greedy: the biggest size that fits'));
  mountGreedyTable($('#greedy-table'));
  $('#slow-code').appendChild(codeBlock(CODE.slow_recursion.py,CODE.slow_recursion.ts,'Try every last size, recursively'));
  mountCost($('#cost'));
  mountWalk($('#stepper'));
  reveal($('#solbox'),'Show the solution',function(b){
    b.appendChild(codeBlock(CODE.solution.py,CODE.solution.ts,'Fill the table from 0 to amount'));
    var notes=el('div','notes');
    notes.innerHTML='<p>The outer loop walks the amounts upward, so when cell <code>a</code> is computed every cell it reads, <code>a - c</code>, is already final. The inner loop tries each size as the last instance. <code>c &lt;= a</code> skips sizes that are too big. After the loops, a cell that still holds the placeholder was never reachable, and that becomes <code>-1</code>.</p>';
    b.appendChild(notes);
    var small=dpTrace([1,2,5],11),steps=small.steps.length,tries=steps*3,fits=small.steps.reduce(function(s,st){return s+st.cands.length;},0);
    var cx=el('div','complexity');
    cx.innerHTML='<div class="cx-h">Complexity, derived</div><p><b>Time O(amount × sizes).</b> The table has amount + 1 cells and each one tries every size once. For sizes {1, 2, 5} and amount 11 that is '+steps+' cells and '+tries+' tries, of which '+fits+' fit and do a lookup. At the constraint\'s limits, 10⁴ × 12 is '+fmt(OPS)+' tries. The recursion could not say this: it repeated questions instead of storing them.</p><p><b>Space O(amount).</b> One number per amount from 0 to amount, '+(small.dp.length)+' cells in the small example and 10,001 at the limit.</p>';
    b.appendChild(cx);
    var raws=[[[2],3],[[7,9],11]].map(function(c){var t=dpTrace(c[0],c[1]);return {c:c,raw:t.dp[c[1]]===INF?c[1]+1:t.dp[c[1]]};});
    var w=el('div','callout warn');
    w.innerHTML='<div class="cl"><svg class="i"><use href="#i-warn"/></svg>Watch out</div><p>Do not return <code>dp[amount]</code> as it is. For an amount no order can reach, that cell still holds the placeholder <code>amount + 1</code>, so the answer comes out as '+raws.map(function(r){return '<b>'+r.raw+'</b> for sizes <code>'+inputFor(r.c[0])+'</code> and amount '+r.c[1];}).join(' and ')+' instead of <b>-1</b>.</p>';
    w.appendChild(codeBlock(CODE.mistake_inf.py,CODE.mistake_inf.ts,'The mistake'));
    b.appendChild(w);
  });
  mountVariants($('#vlist'),[
    ['Coin Change II','count the ways','Same sizes, but the question is how many different combinations reach the amount. The loop order changes: put the sizes in the outer loop, so 2 + 1 and 1 + 2 count as one combination and not two.'],
    ['Perfect Squares','sizes are the squares','The sizes are 1, 4, 9, 16 and so on, and the question is the fewest that sum to n. It is this table exactly, with the sizes generated on the fly.'],
    ['Minimum Cost For Tickets','last ticket decides','A day is covered by a 1-day, 7-day or 30-day pass, and the cheapest plan for each day depends on the cheapest plan a fixed number of days earlier. It is the same "try every last piece" recurrence over days instead of vCPUs.']]);
  mountQuiz($('#qlist'),QUIZ);
})();

/* ================= systems layer: the table hero and the animated banners ================= */
(function(){
  var COINS=[1,2,5],AMT=11,tr=dpTrace(COINS,AMT),CW=38,X0=(560-12*CW)/2;
  function heroFleet(){
    var svg=$('#heroFleet');if(!svg)return;
    COINS.forEach(function(c,i){
      var x=170+i*80;S('rect',{x:x,y:40,width:64,height:48,rx:10,class:'hf-inst'},svg);
      S('text',{x:x+32,y:70,class:'hf-ch','text-anchor':'middle'},svg).textContent=c+' vCPU';});
    S('text',{x:280,y:24,class:'hn-lab','text-anchor':'middle'},svg).textContent='sizes on sale';
    var cells=[];
    for(var i=0;i<=AMT;i++){
      var g=S('g',{},svg);
      var r=S('rect',{x:X0+i*CW,y:150,width:CW-6,height:CW-6,rx:8,class:'hf-cell'},g);
      var t=S('text',{x:X0+i*CW+(CW-6)/2,y:150+(CW-6)/2+6,class:'hf-ch','text-anchor':'middle'},g);
      S('text',{x:X0+i*CW+(CW-6)/2,y:212,class:'hn-lab','text-anchor':'middle'},svg).textContent=i;
      cells.push([r,t]);
    }
    var num=$('#heroNum'),cap=$('#heroCap');
    function draw(k){
      var st=k===0?null:tr.steps[k-1];
      cells.forEach(function(p,i){
        var cls='hf-cell',txt='';
        if(i===0){cls+=' base';txt='0';}
        else if(st&&i<=st.a){txt=String(tr.dp[i]);}
        if(st&&i===st.a)cls+=' cur';
        if(st&&st.cands.some(function(x){return x.from===i;}))cls+=' src';
        p[0].setAttribute('class',cls);p[1].textContent=txt;
        p[1].setAttribute('class','hf-ch'+((st&&i===st.a)?' onink':''));
      });
      var unit=document.getElementById('heroUnit');
      if(!st){num.textContent='0';unit.textContent='instances';cap.textContent='zero capacity needs zero instances';return;}
      num.textContent=String(st.best);unit.textContent=st.best===1?'instance':'instances';
      cap.innerHTML='dp['+st.a+'] = 1 + min('+st.cands.map(function(x){return 'dp['+x.from+']';}).join(', ')+') = <b>'+st.best+'</b>';
    }
    draw(AMT);
    if(M&&M.animate&&!reduce){
      var last=-1,total=AMT+2;
      M.animate(0,total,{duration:total*.85,ease:'linear',repeat:Infinity,onUpdate:function(v){var k=Math.min(AMT,Math.floor(v));if(k!==last){last=k;draw(k);}}});
    }
  }
  var banners={
    problem:function(svg){
      var parts=[5,5,1],x=60,segs=[];
      S('rect',{x:60,y:44,width:600,height:30,rx:8,class:'bn-track'},svg);
      parts.forEach(function(p,i){var w=p/11*600,r=S('rect',{x:x,y:44,width:0,height:30,rx:8,class:'bn-bar'},svg);segs.push([r,x,w]);x+=w;});
      var big=S('text',{x:60,y:28,class:'bn-big'},svg);big.textContent='0 of 11 vCPUs';
      S('text',{x:360,y:104,class:'bn-t','text-anchor':'middle'},svg).textContent='5 + 5 + 1: three instances add up to exactly 11';
      return function(){segs.forEach(function(s,i){M.animate(0,s[2]-4,{duration:.5,delay:i*.6,ease:'easeOut',onUpdate:function(v){s[0].setAttribute('width',v);}});});
        M.animate(0,11,{duration:1.9,ease:'linear',onUpdate:function(v){big.textContent=Math.round(v)+' of 11 vCPUs';}});};
    },
    attempt:function(svg){
      S('text',{x:180,y:28,class:'bn-t','text-anchor':'middle'},svg).textContent='greedy: 4 + 1 + 1';
      S('text',{x:540,y:28,class:'bn-t','text-anchor':'middle'},svg).textContent='best: 3 + 3';
      var a=[4,1,1].map(function(p,i){return S('rect',{x:70+[0,4,5][i]*22,y:40,width:0,height:26,rx:6,class:'bn-bar'},svg);}),
          b=[3,3].map(function(p,i){var r=S('rect',{x:430+i*3*22,y:40,width:0,height:26,rx:6,class:'bn-bar'},svg);r.style.fill='var(--o-ink)';return r;});
      S('text',{x:180,y:104,class:'bn-big red','text-anchor':'middle'},svg).textContent='3 instances';
      S('text',{x:540,y:104,class:'bn-big','text-anchor':'middle'},svg).textContent='2 instances';
      return function(){a.forEach(function(r,i){M.animate(0,[4,1,1][i]*22-3,{duration:.4,delay:i*.4,onUpdate:function(v){r.setAttribute('width',v);}});});b.forEach(function(r,i){M.animate(0,66-3,{duration:.5,delay:.3+i*.5,onUpdate:function(v){r.setAttribute('width',v);}});});};
    },
    trap:function(svg){
      var big=S('text',{x:360,y:50,class:'bn-big red','text-anchor':'middle'},svg);big.textContent='1 call';
      S('text',{x:360,y:84,class:'bn-t','text-anchor':'middle'},svg).textContent='to make 25, the recursion asks about the same amounts again and again';
      S('text',{x:360,y:104,class:'bn-t','text-anchor':'middle'},svg).textContent='but there are only 26 different amounts';
      var last=recursionCost([1,2,5],25).calls;
      return function(){M.animate(1,last,{duration:2.6,ease:'easeIn',onUpdate:function(v){big.textContent=count(Math.round(v),'call','calls');}});};
    },
    insight:function(svg){
      var xs=[100,220,340,460,580];S('line',{x1:100,y1:74,x2:580,y2:74,class:'bn-edge'},svg);
      var cs=xs.map(function(x,i){return S('circle',{cx:x,cy:74,r:14,class:i===4?'bn-end':'bn-mid'},svg);});
      xs.forEach(function(x,i){S('text',{x:x,y:78,class:'bn-t','text-anchor':'middle'},svg).textContent=i===4?'a':'a−'+(4-i);});
      var arcs=[3,2,0].map(function(i){var p=S('path',{d:'M580,60 Q'+((xs[i]+580)/2)+',6 '+xs[i]+',60',class:'bn-path',fill:'none'},svg);p.style.opacity=0;return p;});
      S('text',{x:360,y:112,class:'bn-t','text-anchor':'middle'},svg).textContent='dp[a] reads the cells one size behind it';
      return function(){arcs.forEach(function(p,i){M.animate(0,1,{duration:.5,delay:i*.5,onUpdate:function(v){p.style.opacity=v;}});});};
    },
    solution:function(svg){
      var cells=[];for(var i=0;i<12;i++){var r=S('rect',{x:60+i*50,y:40,width:44,height:36,rx:8,class:'bn-mid'},svg);var t=S('text',{x:82+i*50,y:64,class:'bn-t','text-anchor':'middle'},svg);cells.push([r,t]);}
      S('text',{x:360,y:104,class:'bn-t','text-anchor':'middle'},svg).textContent='each cell is filled once, from the ones before it';
      return function(){tr.dp.forEach(function(v,i){M.animate(0,1,{duration:.2,delay:i*.18,onUpdate:function(p){cells[i][1].textContent=p>.5?String(v):'';}});});};
    }
  };
  heroFleet();mountBanners(banners);kinetic();riseIn();
})();
