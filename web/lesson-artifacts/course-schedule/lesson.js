/* ================= Course Schedule: the lesson ================= */

/* ---------- the algorithm, executed: one run, plus two independent references ---------- */
/* An edge goes from a prerequisite to the course that needs it. */
function edgesOf(prereqs){return prereqs.map(function(p){return [p[1],p[0]];});}
function kahnRun(n,prereqs){
  var unlocks=[],waiting=[],i;
  for(i=0;i<n;i++){unlocks.push([]);waiting.push(0);}
  prereqs.forEach(function(p){unlocks[p[1]].push(p[0]);waiting[p[0]]++;});
  var ready=[],order=[],steps=[],work=n+prereqs.length;
  for(i=0;i<n;i++)if(waiting[i]===0)ready.push(i);
  var startReady=ready.slice(),head=0;
  while(head<ready.length){
    var c=ready[head++];order.push(c);work++;
    var released=[],becameReady=[];
    unlocks[c].forEach(function(x){waiting[x]--;work++;released.push(x);if(waiting[x]===0){ready.push(x);becameReady.push(x);}});
    steps.push({course:c,released:released,becameReady:becameReady,waiting:waiting.slice(),ready:ready.slice(head),done:order.slice()});
  }
  var stuck=[];for(i=0;i<n;i++)if(order.indexOf(i)<0)stuck.push(i);
  return {order:order,steps:steps,stuck:stuck,ok:order.length===n,startReady:startReady,startWaiting:(function(){var w=[];for(var k=0;k<n;k++)w.push(0);prereqs.forEach(function(p){w[p[0]]++;});return w;})(),work:work};
}
/* independent reference 1: depth-first search with three colours (small graphs only, so recursion depth is no concern) */
function dfsHasCycle(n,prereqs){
  var adj=[],state=[],i;for(i=0;i<n;i++){adj.push([]);state.push(0);}
  prereqs.forEach(function(p){adj[p[1]].push(p[0]);});
  function visit(u){state[u]=1;for(var k=0;k<adj[u].length;k++){var v=adj[u][k];if(state[v]===1)return true;if(state[v]===0&&visit(v))return true;}state[u]=2;return false;}
  for(i=0;i<n;i++)if(state[i]===0&&visit(i))return true;
  return false;
}
/* independent reference 2: try every build order, counting the ones examined */
function bruteOrders(n,prereqs){
  var order=[],used=[],examined=0,found=false,i;for(i=0;i<n;i++)used.push(false);
  function rec(){
    if(found)return;
    if(order.length===n){examined++;var pos={};order.forEach(function(c,k){pos[c]=k;});if(prereqs.every(function(p){return pos[p[1]]<pos[p[0]];}))found=true;return;}
    for(var c=0;c<n&&!found;c++){if(used[c])continue;used[c]=true;order.push(c);rec();if(!found){order.pop();used[c]=false;}}
  }
  rec();return {ok:found,examined:examined};
}
function loopOf(n){var p=[];for(var i=0;i<n;i++)p.push([i,(i+1)%n]);return p;}
function factorial(n){return n<=1?1:n*factorial(n-1);}

/* three builds the page draws; positions are hand-laid, the answers are computed */
var BUILDS=[
  {name:'A diamond',n:4,prereqs:[[1,0],[2,0],[3,1],[3,2]],pos:[[1,0],[0,1],[2,1],[1,2]]},
  {name:'A loop of three',n:3,prereqs:[[0,1],[1,2],[2,0]],pos:[[1,0],[0,1],[2,1]]},
  {name:'A loop hiding downstream',n:5,prereqs:[[1,0],[2,1],[3,2],[4,3],[2,4]],pos:[[0,0],[1,0],[2,0],[3,1],[2,1]]}
];
var SANDBOX=[[2,[[1,0]]],[2,[[1,0],[0,1]]],[1,[]],[3,[]],[4,[[1,0],[2,0],[3,1],[3,2]]],[3,[[0,1],[1,2],[2,0]]],[5,[[1,0],[2,1],[3,2],[4,3]]]].concat(BUILDS.map(function(b){return [b.n,b.prereqs];}));
SANDBOX.forEach(function(c){
  var k=kahnRun(c[0],c[1]).ok,d=!dfsHasCycle(c[0],c[1]),b=bruteOrders(c[0],c[1]).ok;
  if(k!==d||k!==b)throw new Error('the three methods disagree on '+JSON.stringify(c));
});
[[[2,[[1,0]]],true],[[2,[[1,0],[0,1]]],false]].forEach(function(p){if(kahnRun(p[0][0],p[0][1]).ok!==p[1])throw new Error('problem statement example failed');});
BUILDS.forEach(function(b){b.G={nodes:b.pos.map(function(p,i){return {x:p[0],d:p[1],l:String(i)};}),edges:edgesOf(b.prereqs),width:Math.max.apply(null,b.pos.map(function(p){return p[0];}))+1,depth:Math.max.apply(null,b.pos.map(function(p){return p[1];})),directed:true};b.run=kahnRun(b.n,b.prereqs);});
/* the prose says these two have the same size and opposite answers */
if(BUILDS[0].n!==4||BUILDS[0].prereqs.length!==4||!BUILDS[0].run.ok||BUILDS[2].n!==5||BUILDS[2].prereqs.length!==5||BUILDS[2].run.ok)throw new Error('the 4/4 and 5/5 claim no longer holds');

function list(a){return a.join(', ');}
function nodeCells(b,kindOf){return b.G.nodes.map(function(nd,i){return {k:kindOf(i),t:nd.l};});}

/* ---------- 1. explore: run the build by hand ---------- */
function mountExplore(host){
  var tabs=host.querySelector('.extabs'),tv=host.querySelector('.tv'),out=host.querySelector('.readout'),cur=0,built=[],view=null,flash=-1;
  function unmet(b,i){return b.prereqs.filter(function(p){return p[0]===i&&built.indexOf(p[1])<0;}).map(function(p){return p[1];});}
  function draw(msg){
    var b=BUILDS[cur];
    view.update(nodeCells(b,function(i){if(built.indexOf(i)>=0)return 'done';if(i===flash)return 'bad';return unmet(b,i).length?'idle':'win';}),
      b.G.edges.map(function(e){return built.indexOf(e[0])>=0?1:0;}));
    var left=b.n-built.length,ready=[];for(var i=0;i<b.n;i++)if(built.indexOf(i)<0&&!unmet(b,i).length)ready.push(i);
    if(msg){out.innerHTML=msg;return;}
    if(left===0)out.innerHTML='All '+b.n+' built, in the order <b>'+list(built)+'</b>. An order exists, so the answer is <b>true</b>.';
    else if(!ready.length)out.innerHTML='<b>Stuck.</b> '+left+' course'+(left===1?'':'s')+' left ('+list(b.run.stuck)+') and none is ready: each waits on another that is also waiting. That loop is a cycle, so the answer is <b>false</b>.';
    else out.innerHTML=built.length+' built. Ready now: <b>'+list(ready)+'</b>. Click a ready (blue) course to build it, or try clicking one that is not ready.';
  }
  function pick(i){
    var b=BUILDS[cur];flash=-1;
    if(built.indexOf(i)>=0){draw();return;}
    var u=unmet(b,i);
    if(u.length){flash=i;draw('Course '+i+' has to wait: it needs '+list(u)+' built first.');return;}
    built.push(i);draw();
  }
  function load(k){
    cur=k;built=[];flash=-1;
    tabs.querySelectorAll('button').forEach(function(x,j){x.setAttribute('aria-pressed',j===k);});
    view=graphView(tv,BUILDS[k].G,{onPick:pick});draw();
  }
  BUILDS.forEach(function(b,k){var x=el('button','tab',b.name);x.type='button';x.addEventListener('click',function(){load(k);});tabs.appendChild(x);});
  host.querySelector('.reset').addEventListener('click',function(){load(cur);});
  host.querySelector('.best').addEventListener('click',function(){
    var b=BUILDS[cur];built=[];flash=-1;
    if(!b.run.ok){built=b.run.order.slice();draw('No valid order exists. The most a build can do is <b>'+list(b.run.order)+'</b>, and then courses '+list(b.run.stuck)+' are stuck waiting on each other.');return;}
    built=b.run.order.slice();draw('One valid order: <b>'+list(built)+'</b>. Every course comes after all of its prerequisites.');
  });
  load(0);
}

/* ---------- 2. predict ---------- */
function mountGuess(host){
  mountPredict(host,BUILDS.map(function(b){return {b:b,expect:b.run.ok?'Yes':'No'};}),{
    question:function(c){return c.b.name+': '+c.b.n+' courses and '+c.b.prereqs.length+' arrows. Can every course be finished?';},
    choices:function(){return ['Yes','No'];},
    draw:function(view,c){var inner=el('div');view.appendChild(inner);var v=graphView(inner,c.b.G);v.update(nodeCells(c.b,function(){return 'idle';}),c.b.G.edges.map(function(){return 0;}));return {reveal:function(){v.update(nodeCells(c.b,function(i){return c.b.run.stuck.indexOf(i)>=0?'bad':'done';}),c.b.G.edges.map(function(e){return c.b.run.stuck.indexOf(e[0])<0?1:0;}));}};},
    why:function(c){var r=c.b.run;return r.ok?'A valid order is <code>'+list(r.order)+'</code>: each course comes after everything it needs.':'Courses <code>'+list(r.stuck)+'</code> can never be built: each waits on another in the loop'+(r.order.length?', after <code>'+list(r.order)+'</code> have been built':'')+'. Red marks them.';}
  });
}

/* ---------- 3. the cost of trying every order ---------- */
function mountCost(host){
  var pts=[];
  for(var n=2;n<=8;n++){
    var p=loopOf(n),b=bruteOrders(n,p),k=kahnRun(n,p);
    if(b.ok||k.ok||b.examined!==factorial(n))throw new Error('loop cost check failed at '+n);
    pts.push([n,b.examined,k.work]);
  }
  var last=pts[pts.length-1];
  costChart(host,{pts:pts,xmax:8,log:true,xticks:[2,3,4,5,6,7,8],xlabel:'courses in a loop',aria:'Work to detect a loop of n courses, on a log scale: testing every order reaches '+fmt(last[1])+' at eight courses while peeling off what is ready takes '+last[2]+'.'});
  host.parentNode.querySelector('.cost-note').innerHTML='For a loop of <b>8</b> courses, testing every order examines <b>'+fmt(last[1])+'</b> orders (exactly 8!) before it can say no, and peeling off what is ready does about <b>'+last[2]+'</b> units of work. The axis is logarithmic because factorials multiply by a bigger number at every step: at 10 courses it would be '+fmt(factorial(10))+'. Both counts are measured by running the two methods.';
}

/* ---------- 4. the build, frame by frame ---------- */
function buildFrames(b){
  var r=b.run,n=b.n,frames=[],G=b.G;
  function cellsG(doneSet,cur,ready,stuck){return G.nodes.map(function(nd,i){var k='idle';if(doneSet.indexOf(i)>=0)k='done';else if(stuck&&stuck.indexOf(i)>=0)k='bad';else if(ready.indexOf(i)>=0)k='win';if(i===cur)k='cur';return {k:k,t:nd.l};});}
  function edgesG(doneSet,cur){return G.edges.map(function(e){return e[0]===cur?2:(doneSet.indexOf(e[0])>=0?1:0);});}
  function degCells(w,doneSet,hit){return w.map(function(v,i){var k=doneSet.indexOf(i)>=0?'dim':(v===0?'win':'idle');if(hit&&hit.indexOf(i)>=0)k='acc';return {k:k,t:doneSet.indexOf(i)>=0?'':String(v)};});}
  function ordCells(done){var o=[];for(var i=0;i<n;i++)o.push(i<done.length?{k:'done',t:String(done[i])}:{k:'idle',t:''});return o;}
  var w0=r.startWaiting;
  frames.push({b:{g:cellsG([],-1,r.startReady),deg:degCells(w0,[],null),ord:ordCells([])},e:{g:edgesG([],-1)},
    note:'Each arrow reads "must be built before". The number under a course is how many of its prerequisites are not built yet. '+(r.startReady.length?'Courses showing 0 are ready: '+list(r.startReady)+'.':'No course shows 0: every course has a prerequisite, so nothing is ready to start.'),
    stats:[['courses',n],['arrows',b.prereqs.length],['built',0]]});
  r.steps.forEach(function(s,k){
    var doneBefore=s.done.slice(0,-1);
    var note='Build course '+s.course+'. '+(s.released.length?'It releases '+list(s.released)+': each now waits on one fewer prerequisite.'+(s.becameReady.length?' Course'+(s.becameReady.length>1?'s ':' ')+list(s.becameReady)+' reached 0 and '+(s.becameReady.length>1?'are':'is')+' ready.':' None reached 0 yet.'):'Nothing waits on it.');
    frames.push({b:{g:cellsG(s.done,s.course,s.ready),deg:degCells(s.waiting,s.done,s.released),ord:ordCells(s.done)},e:{g:edgesG(s.done,s.course)},note:note,stats:[['building',s.course],['built',s.done.length],['ready',s.ready.length]],ev:s.becameReady.length?'key':null});
  });
  var last=r.steps.length?r.steps[r.steps.length-1]:null,doneAll=r.order,wEnd=last?last.waiting:w0;
  frames.push({b:{g:cellsG(doneAll,-1,[],r.stuck),deg:degCells(wEnd,doneAll,null),ord:ordCells(doneAll)},e:{g:edgesG(doneAll,-1)},
    note:r.ok?'Done: all '+n+' courses built, in the order '+list(r.order)+'. An order exists, so the answer is true.':'Nothing is ready, but only '+r.order.length+' of '+n+' courses were built. Courses '+list(r.stuck)+' (red) each wait on another course that is also waiting, so none of them can ever reach 0. The answer is false.',
    stats:[['built',r.order.length],['of',n],['answer',r.ok?'true':'false']],ev:r.ok?'key':'bad'});
  if(r.ok===dfsHasCycle(n,b.prereqs))throw new Error('frames disagree with the depth-first search');
  return {frames:frames,step:1.15,poster:frames.length-1,
    boards:[{id:'g',label:'the build (arrows: must be built before)',g:0,tree:G,wide:true},
            {id:'deg',label:'prerequisites still unbuilt',g:1,cols:n,rows:1,cap:40},{id:'ord',label:'build order',g:1,cols:n,rows:1,cap:40}],
    label:'Peeling off ready courses in "'+b.name.toLowerCase()+'".'};
}
function mountWalk(host){mountStepper(host,BUILDS,function(i){return buildFrames(BUILDS[i]);},'walk');}

/* ---------- 5. quiz ---------- */
var STALL=BUILDS[2].run;
var QUIZ=[
 {q:'The queue of ready courses has just run empty. Why is that alone not enough to say the answer is true?',
  opts:['It empties in two cases: every course was built, or the rest wait on each other in a loop and were never queued. Only the built count against the total tells them apart.',
        'An empty queue proves every course was queued at some point: a course enters the queue when its waiting count reaches zero, and every count reaches zero in the end.',
        'The queue also empties early when the input repeats a prerequisite pair, because the duplicate lowers one count twice; the final check is there to rule those duplicates out.'],
  a:0,why:'A course only enters the queue when its waiting count reaches zero. A course inside a cycle never gets there, so it is never queued and never built, yet the queue still ends up empty. That is why the code ends with <code>built == num_courses</code>. The version that returns true after the loop says true for the loop of three courses as well.'},
 {q:'On the build with prerequisites <code>[[1,0],[2,1],[3,2],[4,3],[2,4]]</code>, which courses get built before the process stalls?',
  opts:['Courses '+list(STALL.order)+'. Course 2 waits on 1 and on 4, 4 waits on 3, and 3 waits on 2, so courses '+list(STALL.stuck)+' never start.',
        'None of them: once the graph holds a cycle anywhere, the waiting counts never all reach zero, so the queue starts out empty and nothing is ever built.',
        'Courses 0, 1 and 2: course 2 becomes ready once course 1 is built, and the loop through 3 and 4 only blocks the courses that come after it.'],
  a:0,why:'A cycle blocks only what is inside it and what depends on it. Courses 0 and 1 have no prerequisites in the loop, so they are built. Course 2 has two prerequisites, 1 and 4. Course 1 is done, but 4 needs 3, and 3 needs 2, so 2 keeps waiting on 4 forever. The page above runs exactly this build in the third tab.'},
 {q:'Where does the O(V + E) time come from?',
  opts:['Each course leaves the queue once and each arrow is followed once, lowering one waiting count: V dequeues plus E decrements, plus the pass that builds the tables.',
        'Each built course scans the list of all E arrows to find the ones leaving it, but the scan stops at the first match, so on average it costs about one step per arrow.',
        'The queue holds at most V courses, and each is compared with every arrow when it is dequeued, so the work is V for the queue plus E for those comparisons.'],
  a:0,why:'The adjacency list means a built course only looks at the arrows leaving it, not at all E. Summed over every course, those are exactly E looks. Counting on the loop chart above: about 2n work for n courses, while testing every order needs n!.'}
];

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountExplore($('#explore'));
  mountGuess($('#predict'));
  reveal($('#hint'),'Hint: start from what can be built now',function(b){
    b.innerHTML='<p>Some courses have no prerequisites, so they can be taken immediately. Take them, and notice that other courses have now had a prerequisite satisfied.</p><p>Keep, for every course, the number of prerequisites not yet taken. When it reaches zero the course is ready. Repeat until nothing is ready.</p><p>Then ask how many courses you managed to take, and what it means if that is fewer than all of them.</p>';
  });
  $('#slow-code').appendChild(codeBlock(CODE.slow_orderings.py,CODE.slow_orderings.ts,'Try every build order'));
  mountCost($('#cost'));
  mountWalk($('#stepper'));
  reveal($('#solbox'),'Show the solution',function(b){
    b.appendChild(codeBlock(CODE.solution.py,CODE.solution.ts,'Build what is ready, then count'));
    var notes=el('div','notes');
    notes.innerHTML='<p>The first loop turns each pair into an arrow from the prerequisite to the course and counts, for every course, how many prerequisites it waits on. Every course with a count of zero starts in the queue. The main loop builds a ready course, lowers the count of each course that was waiting on it, and queues any that reach zero. At the end, <code>built</code> is compared with the number of courses: equal means every course was reachable, and fewer means the rest are locked in a cycle.</p><p>The loop is a queue and not recursion, so a chain of 2000 courses cannot overflow the call stack. A depth-first search with three colours finds cycles too, but in Python a chain that long would exceed the default recursion limit.</p>';
    b.appendChild(notes);
    var d=BUILDS[0],work=d.run.work,cx=el('div','complexity');
    cx.innerHTML='<div class="cx-h">Complexity, derived</div><p><b>Time O(V + E).</b> Reading the pairs is E steps and filling the tables is V. After that each course is dequeued exactly once, and each arrow is used exactly once, to lower a count. On the diamond (V = '+d.n+', E = '+d.prereqs.length+') that is '+d.n+' + '+d.prereqs.length+' setup steps plus '+d.n+' dequeues plus '+d.prereqs.length+' decrements, '+work+' in all, as measured. At the constraint\'s limits that is at most 2000 + 5000 in each phase, a few tens of thousands of steps, where testing every order was hopeless.</p><p><b>Space O(V + E).</b> The adjacency lists hold every arrow once, and the counts and queue hold one entry per course.</p>';
    b.appendChild(cx);
    var seen={},wrong=SANDBOX.filter(function(c){var key=JSON.stringify(c);if(seen[key])return false;seen[key]=1;return !kahnRun(c[0],c[1]).ok;});
    var w=el('div','callout warn');
    w.innerHTML='<div class="cl"><svg class="i"><use href="#i-warn"/></svg>Watch out</div><p>Do not return <code>true</code> just because the queue ran out. A loop of courses never enters the queue, so the queue empties with the loop still unbuilt. That version answers true for all '+wrong.length+' of the builds tested here that contain a cycle, including the loop of three courses in the second example, where the answer is false.</p>';
    w.appendChild(codeBlock(CODE.mistake_true.py,CODE.mistake_true.ts,'The mistake'));
    b.appendChild(w);
  });
  mountVariants($('#vlist'),[
    ['Course Schedule II','return the order','The same process, but you return the sequence in which courses were built, or an empty list when a cycle blocks it. The order you already recorded is the answer.'],
    ['Parallel Courses','count the rounds','Build everything that is ready at the same moment as one round, then the next wave. The number of waves is the fewest semesters, and a leftover course means the loop again.'],
    ['Task scheduling in real tools','same graph, real names','Package managers, build systems and CI pipelines all model tasks this way. A reported dependency cycle is exactly the stuck case: the tool lists the courses that never became ready.']]);
  mountQuiz($('#qlist'),QUIZ);
})();

/* ================= systems layer: the build hero and the animated banners ================= */
(function(){
  var NAMES=['core','log','db','api','ui','app'],PR=[[1,0],[2,0],[3,1],[3,2],[5,3],[5,4]],P=[[280,50],[170,120],[390,120],[280,190],[500,190],[390,255]],R=kahnRun(6,PR);
  function heroBuild(){
    var svg=$('#heroBuild');if(!svg)return;
    svg.insertAdjacentHTML('afterbegin','<defs><marker id="heroArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="context-stroke"/></marker></defs>');
    var lines=edgesOf(PR).map(function(e){
      var a=P[e[0]],c=P[e[1]],len=Math.hypot(c[0]-a[0],c[1]-a[1]),bk=30/len;
      return S('line',{x1:a[0]+(c[0]-a[0])*bk,y1:a[1]+(c[1]-a[1])*bk,x2:c[0]-(c[0]-a[0])*bk,y2:c[1]-(c[1]-a[1])*bk,class:'hb-edge','marker-end':'url(#heroArrow)'},svg);});
    var nodes=NAMES.map(function(nm,i){var g=S('g',{},svg);S('rect',{x:P[i][0]-34,y:P[i][1]-17,width:68,height:34,rx:9,class:'hb-node'},g);var t=S('text',{x:P[i][0],y:P[i][1]+5,class:'hb-lab','text-anchor':'middle'},g);t.textContent=nm;return g.firstChild;});
    var num=$('#heroNum'),cap=$('#heroCap');
    function draw(k){
      var done=R.order.slice(0,k),cur=k>0?R.order[k-1]:-1;
      nodes.forEach(function(nd,i){nd.setAttribute('class','hb-node'+(done.indexOf(i)>=0?' done':'')+(i===cur?' cur':''));nd.nextSibling.setAttribute('class','hb-lab'+((done.indexOf(i)>=0)?' onink':''));});
      lines.forEach(function(l,i){var e=edgesOf(PR)[i];l.setAttribute('class','hb-edge'+(done.indexOf(e[0])>=0?' lit':''));});
      num.textContent=String(k);
      cap.innerHTML=k===0?'nothing built yet':(k===6?'all built: no dependency loop':'built <b>'+NAMES[cur]+'</b>');
    }
    draw(6);
    if(M&&M.animate&&!reduce){
      var last=-1;M.animate(0,8,{duration:8*.9,ease:'linear',repeat:Infinity,onUpdate:function(v){var k=Math.min(6,Math.floor(v));if(k!==last){last=k;draw(k);}}});
    }
  }
  var banners={
    problem:function(svg){
      var xs=[110,250,390,530];
      svg.insertAdjacentHTML('afterbegin','<defs><marker id="bnArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="context-stroke"/></marker></defs>');
      var lines=[0,1,2].map(function(i){return S('line',{x1:xs[i]+22,y1:64,x2:xs[i]+22,y2:64,class:'bn-path'},svg);});
      // A line of zero length has no direction, so its arrowhead would point anywhere: add it once the line has grown.
      function grow(l,i,v){l.setAttribute('x2',xs[i]+22+(xs[i+1]-xs[i]-50)*v);if(v>.05)l.setAttribute('marker-end','url(#bnArrow)');}
      xs.forEach(function(x,i){S('rect',{x:x-24,y:44,width:48,height:40,rx:9,class:'bn-mid'},svg);S('text',{x:x,y:70,class:'bn-t','text-anchor':'middle'},svg).textContent=['A','B','C','D'][i];});
      S('text',{x:360,y:110,class:'bn-t','text-anchor':'middle'},svg).textContent='each arrow: must be built before';
      return function(){lines.forEach(function(l,i){M.animate(0,1,{duration:.5,delay:i*.5,onUpdate:function(v){grow(l,i,v);}});});};
    },
    attempt:function(svg){
      S('text',{x:180,y:58,class:'bn-big','text-anchor':'middle'},svg).textContent='4 courses, 4 arrows';
      S('text',{x:540,y:58,class:'bn-big','text-anchor':'middle'},svg).textContent='5 courses, 5 arrows';
      var a=S('text',{x:180,y:96,class:'bn-t','text-anchor':'middle'},svg),b=S('text',{x:540,y:96,class:'bn-t','text-anchor':'middle'},svg);
      return function(){M.animate(0,1,{duration:1.2,onUpdate:function(v){a.textContent=v>.5?'can be built':'';b.textContent=v>.9?'cannot: a loop':'';}});};
    },
    trap:function(svg){
      var big=S('text',{x:360,y:52,class:'bn-big red','text-anchor':'middle'},svg);big.textContent='1 order';
      S('text',{x:360,y:88,class:'bn-t','text-anchor':'middle'},svg).textContent='10 courses have 3,628,800 possible build orders';
      return function(){M.animate(1,factorial(10),{duration:2.6,ease:'easeIn',onUpdate:function(v){big.textContent=fmt(Math.round(v))+' orders';}});};
    },
    insight:function(svg){
      var cs=[0,1,2].map(function(i){var c=S('circle',{cx:160+i*200,cy:56,r:20,class:'bn-mid'},svg);return c;});
      var nums=[0,1,2].map(function(i){var t=S('text',{x:160+i*200,y:62,class:'bn-big','text-anchor':'middle'},svg);t.textContent=String(2-i>0?2-i:0);return t;});
      S('text',{x:360,y:108,class:'bn-t','text-anchor':'middle'},svg).textContent='a course is ready when its waiting count reaches 0';
      var vals=[2,1,0];
      return function(){[0,1,2].forEach(function(i){M.animate(0,1,{duration:.4,delay:i*.6,onUpdate:function(v){nums[i].textContent=String(Math.max(0,Math.round(vals[i]+(0-vals[i])*v)));cs[i].setAttribute('class',v>.9?'bn-end':'bn-mid');nums[i].setAttribute('class',v>.9?'bn-big on':'bn-big');}});});};
    },
    solution:function(svg){
      var cells=R.order.map(function(c,i){var r=S('rect',{x:120+i*80,y:44,width:60,height:40,rx:9,class:'bn-mid'},svg);var t=S('text',{x:150+i*80,y:70,class:'bn-t','text-anchor':'middle'},svg);return t;});
      S('text',{x:360,y:110,class:'bn-t','text-anchor':'middle'},svg).textContent='the order the scheduler found';
      return function(){R.order.forEach(function(c,i){M.animate(0,1,{duration:.2,delay:i*.3,onUpdate:function(v){cells[i].textContent=v>.5?NAMES[c]:'';}});});};
    }
  };
  heroBuild();mountBanners(banners);kinetic();riseIn();
})();
