/* ================= The Roadmap: the lesson =================
   The page is a map of the course's own modules and stages, a table of what leans on what (one line of reason per
   link), and a checker that holds an order to that table. Nothing about the modules is typed twice: the lists in the
   DATA block are compared with web/src/lib/course/manifest.ts by check.py, and the PURE block, the JavaScript
   port of code/solution.* and code/mistake.*, is run in node by check.py against the Python and TypeScript files. */

/*DATA-BEGIN*/
/* the modules and stages come from web/src/lib/course/manifest.ts (check.py compares them); the links are this lesson's own, each with its reason */
var RM_STAGES=[{"n": 0, "title": "Foundations", "description": "How the course works, and the analysis toolkit every later module leans on."},
  {"n": 1, "title": "Linear Structures", "description": "The core containers — how they sit in memory and what their operations really cost."},
  {"n": 2, "title": "Techniques on Linear Data", "description": "Algorithmic techniques that turn quadratic scans into linear or logarithmic work."},
  {"n": 3, "title": "Recursive & Hierarchical", "description": "Recursion as a tool, then the tree-shaped structures built on it."},
  {"n": 4, "title": "Global Reasoning", "description": "Problems where the answer depends on the whole input — greedy proofs, graphs, DP."}];
var RM_MODS=[{"slug": "getting-started", "title": "How to Learn This Course", "short": "Getting Started", "stage": 0},
  {"slug": "big-o", "title": "Big O & Complexity Analysis", "short": "Big O", "stage": 0},
  {"slug": "math-for-dsa", "title": "Math for DSA", "short": "Math", "stage": 0},
  {"slug": "arrays", "title": "Arrays & Dynamic Arrays", "short": "Arrays", "stage": 1},
  {"slug": "strings", "title": "Strings", "short": "Strings", "stage": 1},
  {"slug": "hash-tables", "title": "Hash Tables", "short": "Hash Tables", "stage": 1},
  {"slug": "linked-lists", "title": "Linked Lists", "short": "Linked Lists", "stage": 1},
  {"slug": "stacks", "title": "Stacks", "short": "Stacks", "stage": 1},
  {"slug": "queues", "title": "Queues", "short": "Queues", "stage": 1},
  {"slug": "two-pointers", "title": "Two Pointers", "short": "Two Pointers", "stage": 2},
  {"slug": "sliding-window", "title": "Sliding Window", "short": "Sliding Window", "stage": 2},
  {"slug": "prefix-sum", "title": "Prefix Sum", "short": "Prefix Sum", "stage": 2},
  {"slug": "binary-search", "title": "Binary Search", "short": "Binary Search", "stage": 2},
  {"slug": "sorting", "title": "Sorting", "short": "Sorting", "stage": 2},
  {"slug": "matrix", "title": "Matrix / 2D Traversal", "short": "Matrix", "stage": 2},
  {"slug": "recursion-backtracking", "title": "Recursion & Backtracking", "short": "Recursion", "stage": 3},
  {"slug": "binary-trees", "title": "Binary Trees", "short": "Binary Trees", "stage": 3},
  {"slug": "bst", "title": "BST & Ordered Structures", "short": "BST", "stage": 3},
  {"slug": "heaps", "title": "Heaps", "short": "Heaps", "stage": 3},
  {"slug": "tries", "title": "Tries", "short": "Tries", "stage": 3},
  {"slug": "intervals", "title": "Intervals", "short": "Intervals", "stage": 4},
  {"slug": "greedy", "title": "Greedy", "short": "Greedy", "stage": 4},
  {"slug": "graphs", "title": "Graphs", "short": "Graphs", "stage": 4},
  {"slug": "dynamic-programming", "title": "Dynamic Programming", "short": "DP", "stage": 4}];
var RM_DEPS=[
  ['arrays','big-o','every array operation, and the cost of resizing, is stated in Big O'],
  ['strings','arrays','a string is a sequence of characters, indexed and scanned like an array'],
  ['hash-tables','arrays','a table\'s buckets are an array, found by an index computed from the key'],
  ['hash-tables','math-for-dsa','a key\'s hash is reduced modulo a size, which is modular arithmetic'],
  ['linked-lists','arrays','a list is defined against the array: scattered nodes instead of one contiguous block'],
  ['stacks','arrays','push and pop at the end of an array are cheap, which is all a stack needs'],
  ['queues','linked-lists','a linked list makes changes at both ends of a queue cheap'],
  ['queues','arrays','a ring buffer keeps a queue inside a fixed array'],
  ['two-pointers','arrays','the two pointers are two indexes into one array'],
  ['two-pointers','strings','the same pointers walk the characters of a string'],
  ['sliding-window','arrays','the window is a stretch of an array'],
  ['sliding-window','hash-tables','a window problem keeps a hash map of what is inside the window'],
  ['sliding-window','two-pointers','a window is a left and a right pointer that only move forward'],
  ['prefix-sum','arrays','running totals are built into an array'],
  ['prefix-sum','hash-tables','a subarray sum is found by looking up an earlier prefix in a hash map'],
  ['binary-search','arrays','it needs a sorted array it can index into'],
  ['binary-search','math-for-dsa','halving the range each round is why it needs about log n rounds'],
  ['sorting','arrays','sorting rearranges an array'],
  ['sorting','big-o','sorts are compared by how their cost grows, n log n against n squared'],
  ['matrix','arrays','a grid is an array of arrays'],
  ['recursion-backtracking','stacks','each call is a frame on the call stack'],
  ['recursion-backtracking','big-o','a recursion\'s cost is read off its call tree, the method the Big O module teaches'],
  ['binary-trees','recursion-backtracking','tree algorithms are recursive: handle this node, then recurse left and right'],
  ['binary-trees','linked-lists','a tree is nodes holding pointers, a list whose nodes can have two nexts'],
  ['bst','binary-trees','a BST is a binary tree with an ordering rule'],
  ['bst','binary-search','the ordering lets a search discard one side, as binary search discards half'],
  ['heaps','binary-trees','a heap is a complete binary tree'],
  ['heaps','arrays','the tree is stored in an array, with children found by index arithmetic'],
  ['tries','strings','its keys are strings, one character per step down the tree'],
  ['tries','hash-tables','each node maps a character to a child, like a small hash map'],
  ['intervals','sorting','most interval work starts by sorting on the start time'],
  ['intervals','heaps','a min-heap of end times tracks which intervals are still running'],
  ['greedy','intervals','scheduling problems are where a greedy choice is first argued correct'],
  ['greedy','sorting','a greedy choice is often made over sorted input'],
  ['graphs','queues','breadth-first search is driven by a queue'],
  ['graphs','hash-tables','adjacency is stored as a map from each node to its neighbours'],
  ['graphs','heaps','Dijkstra\'s algorithm picks the nearest unvisited node with a heap'],
  ['graphs','recursion-backtracking','depth-first search is a recursion over neighbours'],
  ['dynamic-programming','recursion-backtracking','a DP is a recursion whose repeated calls are remembered'],
  ['dynamic-programming','arrays','the remembered answers live in an array or table']
];
/*DATA-END*/

/*PURE-BEGIN*/
/* each module's direct dependencies, as {slug: [slug, ...]}, from the table above */
function rmDeps(){var m={};RM_MODS.forEach(function(x){m[x.slug]=[];});RM_DEPS.forEach(function(d){m[d[0]].push(d[1]);});return m;}
var rmHas=function(o,k){return Object.prototype.hasOwnProperty.call(o,k);};
/* the first thing wrong with an order, or null: the same rules as code/solution.* in the same order, so a
   verdict here is the verdict the files give (check.py compares the two) */
function rmWhy(order,deps){
  var place={},i;
  for(i=0;i<order.length;i++){if(rmHas(place,order[i]))return {kind:'twice',module:order[i]};place[order[i]]=i;}
  for(var name in deps){if(!rmHas(deps,name))continue;
    if(!rmHas(place,name))return {kind:'missing',module:name};
    for(i=0;i<deps[name].length;i++){var dep=deps[name][i];
      if(!rmHas(place,dep))return {kind:'missing',module:dep,needed:name};
      if(place[dep]>=place[name])return {kind:'early',module:name,dep:dep};}}
  return null;
}
function rmValid(order,deps){return rmWhy(order,deps)===null;}
/* the tempting shortcut (code/mistake.*): only the next module is compared */
function rmNeighbours(order,deps){for(var i=0;i<order.length-1;i++){if((deps[order[i]]||[]).indexOf(order[i+1])>=0)return false;}return true;}
function rmCourseOrder(){return RM_MODS.map(function(m){return m.slug;});}
function rmSwap(o,a,b){var r=o.slice(),i=r.indexOf(a),j=r.indexOf(b);r[i]=b;r[j]=a;return r;}
function rmMoveAfter(o,mover,anchor){var r=o.filter(function(x){return x!==mover;});r.splice(r.indexOf(anchor)+1,0,mover);return r;}
var RM_PRESETS=[
  {name:'The course order',order:rmCourseOrder()},
  {name:'Reversed',order:rmCourseOrder().reverse()},
  {name:'Strings before Arrays',order:rmSwap(rmCourseOrder(),'arrays','strings')},
  {name:'Recursion after Heaps',order:rmMoveAfter(rmCourseOrder(),'recursion-backtracking','heaps')},
  {name:'Hash Tables left out',order:rmCourseOrder().filter(function(x){return x!=='hash-tables';})}
];
/*PURE-END*/

var RM_BY={};RM_MODS.forEach(function(m){RM_BY[m.slug]=m;});
var RM_DEP=rmDeps();
function rmUnder(slug,seen){seen=seen||{};RM_DEP[slug].forEach(function(d){if(!seen[d]){seen[d]=1;rmUnder(d,seen);}});return seen;}
function rmUsers(slug){return RM_MODS.filter(function(m){return RM_DEP[m.slug].indexOf(slug)>=0;}).map(function(m){return m.slug;});}
function rmName(slug){return RM_BY[slug].short;}
function rmReason(a,b){return RM_DEPS.filter(function(d){return d[0]===a&&d[1]===b;})[0][2];}

/* load-time checks: every link names real modules once, every link points to an earlier module in the course's
   own order, and the presets give the verdicts the lesson describes */
(function selfCheck(){
  var seen={};
  RM_DEPS.forEach(function(d){
    if(!RM_BY[d[0]]||!RM_BY[d[1]])throw new Error('unknown module in link '+d.join(' > '));
    if(seen[d[0]+'>'+d[1]])throw new Error('duplicate link '+d[0]+' > '+d[1]);seen[d[0]+'>'+d[1]]=1;
    if(!d[2])throw new Error('link '+d[0]+' > '+d[1]+' has no reason');});
  if(!rmValid(rmCourseOrder(),RM_DEP))throw new Error('the course order should satisfy every link');
  var verdicts=RM_PRESETS.map(function(p){return rmValid(p.order,RM_DEP);}).join(),near=RM_PRESETS.map(function(p){return rmNeighbours(p.order,RM_DEP);}).join();
  if(verdicts!=='true,false,false,false,false')throw new Error('preset verdicts changed: '+verdicts);
  if(near.split(',')[3]!=='true'||near.split(',')[4]!=='true'||near.split(',')[2]!=='false')throw new Error('the neighbour check should miss presets 4 and 5 and catch 3: '+near);
  /* random orders: the full check agrees with a plain position comparison */
  var seed=20261013,rnd=function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(var t=0;t<200;t++){var o=rmCourseOrder();for(var i=o.length-1;i>0;i--){var j=Math.floor(rnd()*(i+1)),x=o[i];o[i]=o[j];o[j]=x;}
    var ok=RM_DEPS.every(function(d){return o.indexOf(d[1])<o.indexOf(d[0]);});
    if(rmValid(o,RM_DEP)!==ok)throw new Error('the check disagrees with a position comparison');}
})();

/* ---------- 1. the map ---------- */
function mountMap(w){
  var host=$('#rmLanes'),read=$('#rmRead'),sel=null,btns={};
  RM_STAGES.forEach(function(s){
    var lane=el('div','rm-lane','<div class="rm-lh"><b>Stage '+s.n+'</b><span>'+s.title+'</span></div><p class="rm-ld">'+s.description+'</p>'),list=el('div','rm-mods');
    RM_MODS.filter(function(m){return m.stage===s.n;}).forEach(function(m){
      var b=el('button','rm-mod',m.short);b.type='button';b.setAttribute('aria-pressed','false');b.dataset.slug=m.slug;
      b.addEventListener('click',function(){sel=sel===m.slug?null:m.slug;paint();});list.appendChild(b);btns[m.slug]=b;});
    lane.appendChild(list);host.appendChild(lane);});
  function paint(){
    var under=sel?rmUnder(sel):{},users=sel?rmUsers(sel):[];
    RM_MODS.forEach(function(m){var b=btns[m.slug],c='rm-mod';
      if(m.slug===sel)c+=' sel';else if(sel&&RM_DEP[sel].indexOf(m.slug)>=0)c+=' dep';else if(sel&&under[m.slug])c+=' ind';else if(users.indexOf(m.slug)>=0)c+=' use';
      b.className=c;b.setAttribute('aria-pressed',m.slug===sel);});
    if(!sel){read.innerHTML='<p>Pick a module to see what it leans on.</p>';return;}
    var m=RM_BY[sel],direct=RM_DEP[sel],indirect=Object.keys(under).length-direct.length;
    read.innerHTML='<h4>'+m.title+' <span class="rm-st">Stage '+m.stage+'</span></h4>'+
      (direct.length?'<p class="rm-lab">Leans on directly</p><ul>'+direct.map(function(d){return '<li><b>'+rmName(d)+'</b>: '+rmReason(sel,d)+'.</li>';}).join('')+'</ul>'+
        '<p>'+(indirect>0?'Underneath those, '+indirect+' more '+(indirect===1?'module':'modules')+' it reaches only through them, '+(Object.keys(under).length)+' in all.':'Those are all the modules underneath it.')+'</p>'
        :'<p class="rm-lab">Leans on nothing in this table</p><p>It is a starting point: no module comes before it.</p>')+
      (users.length?'<p class="rm-lab">Leaned on directly by</p><p>'+users.map(rmName).join(', ')+'.</p>':'<p class="rm-lab">Leaned on by</p><p>No module in this table. It is somewhere you arrive.</p>');
  }
  sel='sliding-window';paint();
}

/* ---------- 2. the facts strip and the list of every link ---------- */
function mountFactsAndLinks(){
  var order=rmCourseOrder(),back=RM_DEPS.filter(function(d){return order.indexOf(d[1])<order.indexOf(d[0]);}).length;
  mountFacts($('#rmFacts'),[{v:RM_MODS.length,l:'modules'},{v:RM_STAGES.length,l:'stages'},{v:RM_DEPS.length,l:'links, each with a reason'},{v:back+' of '+RM_DEPS.length,l:'links that point to an earlier module in the course order'}]);
  var dl=$('#rmLinks');
  RM_MODS.forEach(function(m){var ds=RM_DEPS.filter(function(d){return d[0]===m.slug;});if(!ds.length)return;
    dl.appendChild(el('div','rm-lk','<dt>'+m.short+' <span>leans on</span></dt><dd><ul>'+ds.map(function(d){return '<li><b>'+rmName(d[1])+'</b>: '+d[2]+'.</li>';}).join('')+'</ul></dd>'));});
}

/* ---------- 3. check an order ---------- */
function mountOrder(w){
  var tabs=w.querySelector('.extabs'),list=$('#rmOrder'),full=$('#rmFull'),near=$('#rmNear'),status=$('#rmSwapHint');
  var cur=0,order=RM_PRESETS[0].order.slice(),pick=null,tabBtns=[];
  RM_PRESETS.forEach(function(p,i){var b=el('button','tab',p.name);b.type='button';b.addEventListener('click',function(){cur=i;order=p.order.slice();pick=null;paint();});tabs.appendChild(b);tabBtns.push(b);});
  function say(why){
    if(!why)return '<b class="ok">Valid.</b> Every module appears once, after everything it leans on.';
    if(why.kind==='twice')return '<b class="no">Invalid.</b> '+rmName(why.module)+' is listed twice, so it has no single place.';
    if(why.kind==='missing')return '<b class="no">Invalid.</b> '+rmName(why.module)+' is missing from the order'+(why.needed?', and '+rmName(why.needed)+' leans on it':'')+'.';
    return '<b class="no">Invalid.</b> '+rmName(why.module)+' (position '+(order.indexOf(why.module)+1)+') comes before '+rmName(why.dep)+' (position '+(order.indexOf(why.dep)+1)+'), which it leans on: '+rmReason(why.module,why.dep)+'.';
  }
  function paint(){
    tabBtns.forEach(function(b,i){b.setAttribute('aria-pressed',i===cur);});
    var why=rmWhy(order,RM_DEP),bad={};if(why&&why.kind==='early'){bad[why.module]=1;bad[why.dep]=1;}
    list.innerHTML='';
    order.forEach(function(slug,i){var b=el('button','rm-chip'+(bad[slug]?' bad':'')+(pick===i?' pick':''),'<i>'+(i+1)+'</i>'+rmName(slug));b.type='button';b.setAttribute('aria-pressed',pick===i);
      b.setAttribute('aria-label','Position '+(i+1)+', '+rmName(slug));
      b.addEventListener('click',function(){if(pick===null)pick=i;else{if(pick!==i){var t=order[pick];order[pick]=order[i];order[i]=t;cur=-1;}pick=null;}paint();});list.appendChild(b);});
    full.innerHTML='<span class="rm-vl">Full check</span> '+say(why);
    var n=rmNeighbours(order,RM_DEP);
    near.innerHTML='<span class="rm-vl">Neighbours only</span> '+(n?'<b class="'+(why?'no':'ok')+'">Valid.</b> '+(why?'It accepts an order the full check rejects: no module sits right next to the one it leans on.':'No module sits right before one it leans on.'):'<b class="no">Invalid.</b> Some module sits right before one it leans on.');
    status.textContent=pick===null?'click a module, then another, to swap them':'now click the module to swap with '+rmName(order[pick]);
  }
  paint();
}

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountLesson();
  mountFactsAndLinks();
  mountMap();
  mountOrder($('#order'));
})();

/* ================= systems layer: the five stages hero ================= */
(function(){
  function heroStages(){
    var svg=$('#heroMap');if(!svg)return;
    var S=RM_STAGES.length,cw=84,gap=14,x0=(560-(S*cw+(S-1)*gap))/2,top=84,dot=11,pitch=20,h='<text class="hd-lab" x="'+x0+'" y="46">modules, grouped by stage, each stage built on the ones before</text>',cum=[],tot=0;
    RM_STAGES.forEach(function(s,si){var mods=RM_MODS.filter(function(m){return m.stage===s.n;}),x=x0+si*(cw+gap);
      h+='<g id="hsS'+si+'" class="hs-stage"><rect class="hs-col" x="'+x+'" y="'+top+'" width="'+cw+'" height="124" rx="8"/><text class="hs-tag" x="'+(x+cw/2)+'" y="'+(top+22)+'" text-anchor="middle">stage '+s.n+'</text>';
      mods.forEach(function(m,mi){var cx=x+16+(mi%3)*26+dot/2,cy=top+50+Math.floor(mi/3)*pitch*1.4;h+='<circle class="hs-dot" cx="'+cx+'" cy="'+cy+'" r="'+dot/2+'"/>';});
      h+='</g>';tot+=mods.length;cum.push(tot);});
    svg.innerHTML=h;
    var num=$('#heroNum'),unit=$('#heroUnit'),cap=$('#heroCap');
    function show(k){/* k stages lit, in order */
      RM_STAGES.forEach(function(s,si){$('#hsS'+si).setAttribute('class','hs-stage'+(si<k?' lit':''));});
      num.textContent=k?cum[k-1]:0;unit.textContent='of '+RM_MODS.length+' modules';
      cap.innerHTML=k?'Stage '+RM_STAGES[k-1].n+': '+RM_STAGES[k-1].title:'Five stages, each leaning on the last';
    }
    if(reduce||!M||!M.animate){show(S);return;}
    var last=-1,steps=S+2;
    M.animate(0,steps,{duration:steps*1.3,ease:'linear',repeat:Infinity,onUpdate:function(v){var k=Math.min(S,Math.floor(v));if(v>=S+1)k=0;if(k!==last){last=k;show(k);}}});
  }
  heroStages();kinetic();riseIn();
})();
