/* The Line Underneath: an overview of the four linear structures through eight systems.
   Content is data (SYS below) rendered by one function; every scene is produced by running the
   algorithm, and every scene checks itself against an independent answer while the page loads.
   The code each system shows is executed by check.py in Python and TypeScript. */

/* ---------- the algorithms, as the scenes run them ---------- */
function jsAddress(base,i,size){return base+i*(size||4);}
function jsCopies(n,byOne){var size=0,cap=1,copies=0;for(var k=0;k<n;k++){if(size===cap){copies+=size;cap=byOne?cap+1:cap*2;}size++;}return copies;}
function cellsOf(n,f){return mk(n,f);}

/* 1. audio: samples found by arithmetic */
function sceneAudio(){
  var S=[3,7,9,6,1,-4,-8,-5,0,5,8,4],BASE=4096,reads=[0,1,2,7,11,4],frames=[],seen={};
  frames.push({b:{mem:S.map(function(v){return {k:'idle',t:String(v)};})},note:'Twelve samples of a sound wave, 4 bytes each, stored one after another from address 4,096.',stats:[['base',fmt(BASE)],['reads',0]]});
  reads.forEach(function(i,k){
    var a=jsAddress(BASE,i);if(a!==BASE+4*i)throw new Error('audio scene check failed');
    frames.push({b:{mem:S.map(function(v,j){return {k:j===i?'cur':(seen[j]?'acc':'idle'),t:String(v)};})},
      note:'Sample '+i+' is at 4,096 + '+i+' × 4 = '+fmt(a)+'. One multiply, whether it is the first sample or the last.',stats:[['address',fmt(a)],['reads',k+1]],ev:'key'});
    seen[i]=1;});
  return {frames:frames,step:1.5,poster:frames.length-1,loop:true,boards:[{id:'mem',rows:1,cols:12,g:0,label:'12 samples × 4 bytes, one after another',cap:52,wide:true}],label:'Reading samples by index',meta:{}};
}

/* 2. growth: appends into a doubling block */
function sceneGrowth(){
  var N=9,size=0,cap=1,copies=0,items=[],frames=[];
  function cells(cur,moving,capNow){return cellsOf(16,function(j){
    if(j<size)return {k:moving?'warn':(j===cur?'cur':'acc'),t:String(items[j])};
    return j<capNow?{k:'idle',t:''}:{k:'dim',t:''};});}
  frames.push({b:{blk:cells(-1,false,cap)},note:'An empty dynamic array. It owns one slot so far.',stats:[['size',0],['capacity',1],['copies',0]]});
  for(var k=1;k<=N;k++){
    if(size===cap){
      frames.push({b:{blk:cells(-1,true,cap*2)},note:'Full at '+cap+'. Allocate a block of '+(cap*2)+' and copy all '+size+' item'+(size===1?'':'s')+' across before the next one fits.',
        stats:[['size',size],['capacity',cap*2],['copies',copies+size]],ev:'bad'});
      copies+=size;cap*=2;}
    items.push(k);size++;
    frames.push({b:{blk:cells(size-1,false,cap)},note:'Append '+k+': a free slot is waiting, so it costs one write.',stats:[['size',size],['capacity',cap],['copies',copies]]});
  }
  if(copies!==jsCopies(N)||copies!==Math.pow(2,Math.ceil(Math.log2(N)))-1)throw new Error('growth scene check failed');
  return {frames:frames,step:1.2,poster:frames.length-1,loop:true,boards:[{id:'blk',rows:1,cols:16,g:0,label:'the block the array owns (grey: not allocated yet)',cap:40,wide:true}],label:'Appending into a doubling block',meta:{copies:copies}};
}

/* 3. history: parent pointers from HEAD */
function sceneHistory(){
  var ids=['e5c','9a1','41f','c07','7b2','1d0'],frames=[];
  var node=null;for(var q=ids.length-1;q>=0;q--)node={id:ids[q],parent:node};
  var walked=[];for(var c=node;c;c=c.parent)walked.push(c.id);
  if(walked.join()!==ids.join())throw new Error('history scene check failed');
  frames.push({b:{log:ids.map(function(id){return {k:'idle',t:id};})},note:'Six commits. Each one stores the id of its parent, and nothing else about the history.',stats:[['commits read',0]]});
  walked.forEach(function(id,k){
    var last=k===walked.length-1;
    frames.push({b:{log:ids.map(function(x,j){return {k:j===k?(last?'done':'cur'):(j<k?'acc':'idle'),t:x};})},
      note:last?id+' has no parent: the walk ends at the first commit. '+walked.length+' commits read, '+(walked.length-1)+' pointers followed.':(k===0?'Start at HEAD, '+id+'. ':'')+id+' names its parent, '+walked[k+1]+': follow the pointer.',
      stats:[['commits read',k+1]],ev:last?'key':null});
  });
  return {frames:frames,step:1.5,poster:frames.length-1,loop:true,boards:[{id:'log',rows:1,cols:6,g:0,label:'HEAD on the left, each commit pointing to the one on its right',cap:64,wide:true}],label:'git log walking parent pointers',meta:{n:walked.length}};
}

/* 4. LRU: hits move to the front, the back is evicted */
function sceneLru(){
  var REQ='ABCABDAB'.split(''),CAP=3,order=[],hits=0,misses=0,evicted=0,frames=[];
  frames.push({b:{req:REQ.map(function(r){return {k:'idle',t:r};}),cache:cellsOf(CAP,function(){return {k:'dim',t:''};})},note:'Requests arrive left to right. The cache holds 3 keys, most recently used first.',stats:[['hits',0],['misses',0],['evicted',0]]});
  REQ.forEach(function(key,i){
    var hit=order.indexOf(key)>=0,out=null,note;
    if(hit){hits++;order.splice(order.indexOf(key),1);note=key+' is cached: unlink its node and relink it at the front. No search, no shifting.';}
    else{misses++;if(order.length===CAP){out=order.pop();evicted++;}
      note=key+' is not cached.'+(out?' The cache is full, so '+out+' at the back, the least recently used, is evicted.':'')+' '+key+' goes in at the front.';}
    order.unshift(key);
    frames.push({b:{req:REQ.map(function(r,j){return {k:j===i?(hit?'done':'cur'):(j<i?'dim':'idle'),t:r};}),
      cache:cellsOf(CAP,function(j){return j<order.length?{k:j===0?(hit?'done':'cur'):'acc',t:order[j]}:{k:'dim',t:''};})},
      note:note,stats:[['hits',hits],['misses',misses],['evicted',evicted]],ev:hit?'key':(out?'bad':null)});
  });
  if(order.join('')!=='BAD'||hits!==4)throw new Error('lru scene check failed');
  return {frames:frames,step:1.6,poster:frames.length-1,loop:true,boards:[{id:'req',rows:1,cols:REQ.length,g:0,label:'requests',cap:44},{id:'cache',rows:1,cols:CAP,g:0,label:'cache, most recent first',cap:56}],label:'An LRU cache serving requests',meta:{hits:hits,misses:misses,evicted:evicted}};
}

/* 5. calls: frames pushed and popped by fact(3) */
function sceneCalls(){
  var ROWS=5,stack=[],frames=[],deepest=0;
  function cells(tag){var pad=ROWS-stack.length;return cellsOf(ROWS,function(r){if(r<pad)return {k:'dim',t:''};var f=stack[r-pad];return {k:r===pad?(tag||'cur'):'acc',t:f};});}
  function push(label,note){stack.unshift(label);deepest=Math.max(deepest,stack.length);frames.push({b:{stk:cells()},note:note,stats:[['frames',stack.length]]});}
  push('main','The program starts in main. Its frame is the bottom of the stack.');
  function fact(n){
    push('f('+n+')',n===3?'main calls fact(3). Its frame waits on top until fact(3) has an answer.':'fact('+(n+1)+') needs fact('+n+'), so a new frame goes on top and fact('+(n+1)+') waits.');
    var r;
    if(n===0){r=1;stack[0]='='+r;frames.push({b:{stk:cells('done')},note:'fact(0) is the base case: it returns 1 without calling anything, so the stack stops growing.',stats:[['frames',stack.length],['returned',r]],ev:'key'});}
    else{var below=fact(n-1);r=n*below;stack[0]='='+r;frames.push({b:{stk:cells('done')},note:'fact('+(n-1)+') returned '+below+', so fact('+n+') returns '+n+' × '+below+' = '+r+'.',stats:[['frames',stack.length],['returned',r]]});}
    stack.shift();return r;
  }
  var result=fact(3);
  frames.push({b:{stk:cells()},note:'Back in main with fact(3) = '+result+'. Every frame was popped in the reverse order it was pushed.',stats:[['frames',stack.length],['returned',result]],ev:'key'});
  if(result!==6||deepest!==5)throw new Error('calls scene check failed');
  return {frames:frames,step:1.4,poster:frames.length-1,loop:true,boards:[{id:'stk',rows:ROWS,cols:1,g:0,label:'call stack, top first',cap:76}],label:'Frames pushed and popped by fact(3)',meta:{deepest:deepest,result:result}};
}

/* 6. brackets: a stack of openers */
function sceneBrackets(){
  var s='{[()]}(]'.split(''),PAIR={')':'(',']':'[','}':'{'},stack=[],frames=[],ok=true,deepest=0,failAt=-1;
  function cells(i,tag){return {in:s.map(function(ch,j){return {k:j===i?tag:(j<i?'dim':'idle'),t:ch};}),stk:cellsOf(4,function(j){return j<stack.length?{k:j===stack.length-1?'cur':'acc',t:stack[j]}:{k:'dim',t:''};})};}
  frames.push({b:cells(-1,'idle'),note:'Read left to right. Openers wait on a stack; each closer must match the opener on top.',stats:[['position',0],['stack',0]]});
  for(var i=0;i<s.length;i++){
    var ch=s[i];
    if('([{'.indexOf(ch)>=0){stack.push(ch);deepest=Math.max(deepest,stack.length);frames.push({b:cells(i,'cur'),note:ch+' opens something. Push it: it waits for its closer.',stats:[['position',i+1],['stack',stack.length]]});}
    else{var top=stack.pop();
      if(top!==PAIR[ch]){ok=false;failAt=i;frames.push({b:cells(i,'bad'),note:ch+' should close '+PAIR[ch]+', but the opener on top is '+(top||'nothing')+'. The brackets are not balanced: return false.',stats:[['position',i+1],['stack',stack.length]],ev:'bad'});break;}
      frames.push({b:cells(i,'done'),note:ch+' closes the '+top+' on top of the stack. Pop it.',stats:[['position',i+1],['stack',stack.length]],ev:'key'});}
  }
  var t=s.join('');while(/\(\)|\[\]|\{\}/.test(t))t=t.replace(/\(\)|\[\]|\{\}/g,'');
  if(ok!==(t===''))throw new Error('brackets scene check failed');
  return {frames:frames,step:1.4,poster:frames.length-1,loop:true,boards:[{id:'in',rows:1,cols:s.length,g:0,label:'input',cap:48},{id:'stk',rows:1,cols:4,g:0,label:'stack, top on the right',cap:48}],label:'Checking brackets with a stack',meta:{deepest:deepest,failAt:failAt,n:s.length}};
}

/* 7. ring buffer: head and tail wrap */
function sceneRing(){
  var CAP=6,buf=mk(CAP,function(){return null;}),head=0,size=0,frames=[],popped=[],dropped=0,wraps=0;
  var OPS=['p1','p2','p3','p4','p5','pop','pop','p6','p7','p8','p9'];
  function cells(cur,tag){return cellsOf(CAP,function(j){return j===cur?{k:tag,t:buf[j]||''}:(buf[j]?{k:'acc',t:buf[j]}:{k:'idle',t:''});});}
  function st(){return [['head',head],['tail',(head+size)%CAP],['queued',size],['dropped',dropped]];}
  frames.push({b:{ring:cells(-1)},note:'Six slots. The tail is where the next packet lands; the head is where the next one is read.',stats:st()});
  OPS.forEach(function(op){
    if(op==='pop'){var x=buf[head];popped.push(x);var at=head;frames.push({b:{ring:cells(at,'done')},note:'Read '+x+' at the head, slot '+at+'.',stats:st()});
      buf[at]=null;head=(head+1)%CAP;size--;return;}
    if(size===CAP){dropped++;frames.push({b:{ring:cells(-1)},note:'All six slots are full, so '+op+' is dropped. A real card counts these drops.',stats:st(),ev:'bad'});return;}
    var slot=(head+size)%CAP;if(head+size>=CAP)wraps++;buf[slot]=op;size++;
    frames.push({b:{ring:cells(slot,'cur')},note:op+' lands in slot '+slot+(head+size-1>=CAP?', wrapping past the end back to the front':'')+'.',stats:st()});
  });
  if(popped.join()!=='p1,p2'||dropped!==1||size!==CAP)throw new Error('ring scene check failed');
  return {frames:frames,step:1.3,poster:frames.length-1,loop:true,boards:[{id:'ring',rows:1,cols:CAP,g:0,label:'6 slots; both ends wrap past the last slot',cap:60,wide:true}],label:'A ring buffer receiving packets',meta:{cap:CAP,dropped:dropped,wraps:wraps}};
}

/* 8. rate limiter: timestamps inside the last 3,000 ms */
function sceneLimiter(){
  var PINGS=[1,100,3001,3002,4500,6200],W=3000,q=[],frames=[],drops=0;
  function cells(fresh,stale){return cellsOf(6,function(j){if(j>=q.length)return {k:'dim',t:''};return {k:stale&&stale.indexOf(j)>=0?'bad':(j===q.length-1&&fresh?'cur':'acc'),t:String(q[j])};});}
  frames.push({b:{q:cells(false)},note:'Calls are allowed while fewer than a set number arrived in the last 3,000 ms. The queue keeps their timestamps, oldest on the left.',stats:[['now',0],['in window',0]]});
  PINGS.forEach(function(t){
    q.push(t);var stale=[];q.forEach(function(u,j){if(u<t-W)stale.push(j);});
    if(stale.length){frames.push({b:{q:cells(true,stale)},note:'A call at '+fmt(t)+'. The window now starts at '+fmt(t-W)+', so '+stale.map(function(j){return fmt(q[j]);}).join(' and ')+' fall'+(stale.length===1?'s':'')+' out of it.',stats:[['now',fmt(t)],['in window',q.length-stale.length]],ev:'bad'});
      q=q.slice(stale.length);drops+=stale.length;}
    var brute=PINGS.filter(function(u){return u<=t&&u>=t-W;}).length;if(brute!==q.length)throw new Error('limiter scene check failed');
    frames.push({b:{q:cells(true)},note:'At '+fmt(t)+': '+q.length+' call'+(q.length===1?'':'s')+' inside ['+fmt(t-W)+', '+fmt(t)+'].'+(t===3001?' The call at 1 is exactly 3,000 ms old and still counts.':''),stats:[['now',fmt(t)],['in window',q.length]]});
  });
  return {frames:frames,step:1.4,poster:frames.length-1,loop:true,boards:[{id:'q',rows:1,cols:6,g:0,label:'timestamps in the window, oldest first',cap:64,wide:true}],label:'A sliding-window rate limiter',meta:{drops:drops,last:q.length}};
}

/* ---------- content, as data ---------- */
var SYS={
 audio:{lesson:'Arrays · Contiguous Memory',kick:'audio drivers · codecs · DAWs',title:'Audio is one long array',scene:sceneAudio,
  story:'Sound is stored as samples: numbers measured thousands of times a second and laid end to end. A player that wants sample 1,000 does not search for it. It multiplies, because every sample is the same size and they sit back to back.',
  when:'<b>You have met this</b> as scrubbing: dragging the playhead to minute 42 is instant because the position of any sample is a calculation, not a walk.',
  seen:['Audio buffers','Video frames','Image pixels','Typed arrays in JavaScript'],
  facts:function(){return [{v:48000*4,l:'bytes a second of mono 48 kHz audio at 4 bytes a sample'},{v:jsAddress(4096,1000),l:'address of sample 1,000 in a buffer starting at 4,096'},{v:1,l:'multiplication to reach any sample, first or last'}];},
  code:'audio',watch:'Adding the index without multiplying by the sample size. Every sample after the first is read from the middle of another one, so playback is noise rather than an error.'},
 growth:{lesson:'Arrays · Dynamic Arrays',kick:'logs · lists in every language',title:'A log that keeps growing',scene:sceneGrowth,
  story:'A growable array hides the fact that its block is a fixed size. When it fills, the array allocates a bigger block and copies everything across. Doubling the size each time makes the copies rare enough that an append costs O(1) on average.',
  when:'<b>You have met this</b> every time you called append or push without a size. Python lists, JavaScript arrays and Java\'s ArrayList (which grows by 1.5×) all do this behind the call.',
  seen:['Python list','JavaScript Array','Java ArrayList','Go slices'],
  facts:function(m){return [{v:jsCopies(1000),l:'items copied while appending 1,000 with doubling'},{v:jsCopies(1000,true),l:'items copied if the block grew by one slot each time'},{v:(jsCopies(1000)/1000).toFixed(2),l:'copies per append on average with doubling: always under 2'}];},
  code:'growth',watch:'Growing by one slot instead of by a factor. Every append then copies the whole array, and appending n items does n(n − 1)/2 copies: correct, and quadratic.'},
 history:{lesson:'Linked Lists · Nodes & Pointers',kick:'version control · blockchains',title:'git log walks a linked list',scene:sceneHistory,
  story:'A commit records the id of its parent and nothing about the commits before that. So the history is a chain of back-pointers from the newest commit, and reading it means following them one by one. A merge commit has two parents; a straight history is a plain linked list.',
  when:'<b>You have met this</b> when git log on a long history takes a moment to reach the first commit: there is no index to jump to, only parents to follow.',
  seen:['git and other version control','Blockchains','Undo histories that store parents'],
  facts:function(m){return [{v:m.n,l:'commits read to get from HEAD to the first one in this history'},{v:m.n-1,l:'parent pointers followed on the way'},{v:'O(n)',l:'to reach the oldest commit: a walk, never a jump'}];},
  code:'history',watch:'Looping while the node has a parent instead of while the node exists. The walk stops one commit early, so the first commit never appears.'},
 lru:{lesson:'Linked Lists · Pointer Surgery',kick:'CDNs · databases · browsers',title:'An LRU cache splices in O(1)',scene:sceneLru,
  story:'A least-recently-used cache keeps keys in the order they were last used and evicts from the back. A hash map finds a key\'s node in O(1), and a doubly linked list moves that node to the front in O(1): unlink it, relink it, no shifting of anything else.',
  when:'<b>You have met this</b> behind every cache that stays fast as it fills: browsers, CDNs and database buffer pools keep recently used items and drop the oldest.',
  seen:['Database buffer pools','Browser caches','Java LinkedHashMap','Memoisation with a size limit'],
  facts:function(m){return [{v:m.hits,l:'hits in this request stream, each moved to the front'},{v:m.evicted,l:'evictions from the back once the cache was full'},{v:6,l:'pointer writes to move a hit to the front: 2 to unlink, 4 to relink'}];},
  code:'lru',watch:'Relinking a hit at the front without unlinking it first. The node is now in the list twice, the order is corrupt, and a later eviction removes the wrong key.'},
 calls:{lesson:'Stacks · LIFO & the Call Stack',kick:'every running program',title:'Every stack trace is a stack',scene:sceneCalls,
  story:'When a function calls another, the caller\'s frame waits on the call stack until the callee returns. The last function called is the first to finish, so the stack is exactly the list of functions waiting on each other.',
  when:'<b>You have met this</b> in every stack trace: read from the top, it is the chain of calls that were waiting when the error happened.',
  seen:['Stack traces','Debuggers','Recursion','Stack overflow errors'],
  facts:function(m){return [{v:m.deepest,l:'frames on the stack at the deepest point of fact(3), counting main'},{v:m.result,l:'fact(3), built on the way back down the stack'},{v:1,l:'base case, which is what stops the stack from growing'}];},
  code:'calls',watch:'A recursion with no base case. Frames pile up until the runtime refuses: RecursionError in Python, RangeError in JavaScript.'},
 brackets:{lesson:'Stacks · Valid Parentheses',kick:'compilers · linters · editors',title:'A parser checks every bracket',scene:sceneBrackets,
  story:'Nested brackets close in the reverse order they opened, which is the last-in, first-out order of a stack. Push each opener, and each closer must match the one on top. Anything left over, or any mismatch, means the input is broken.',
  when:'<b>You have met this</b> when an editor highlighted the bracket that closes the one under your cursor, or a linter reported an unexpected token right where the nesting went wrong.',
  seen:['Compilers and parsers','JSON and HTML validation','Editor bracket matching'],
  facts:function(m){return [{v:m.failAt+1,l:'characters read before the mismatch was found'},{v:m.deepest,l:'openers waiting at once, at the deepest point'},{v:'O(n)',l:'one pass: each character is pushed or popped once'}];},
  code:'brackets',watch:'Returning true at the end without checking the stack is empty. Input such as "(((" never meets a wrong closer, so it passes, though nothing was ever closed.'},
 ring:{lesson:'Queues · Ring Buffer',kick:'network cards · audio · logging',title:'A network card\'s ring buffer',scene:sceneRing,
  story:'A network card writes arriving packets into a fixed ring of slots while the driver reads them out. Two indices chase each other round the ring, each wrapping past the last slot back to the first, so nothing is ever shifted or reallocated.',
  when:'<b>You have met this</b> as dropped packets under load: when the ring is full, the card has nowhere to put the next packet and counts a drop instead.',
  seen:['NIC receive rings','Audio buffers','Kernel log buffers','Bounded producer-consumer queues'],
  facts:function(m){return [{v:m.cap,l:'slots in the ring: its size never changes'},{v:m.dropped,l:'packet dropped because the ring was full'},{v:'O(1)',l:'per packet in and out: two indices, one modulo'}];},
  code:'ring',watch:'Advancing the head without wrapping it. It walks past the last slot, and the next read goes outside the ring instead of back to slot 0.'},
 limiter:{lesson:'Queues · Number of Recent Calls',kick:'APIs · login protection',title:'A rate limiter queues timestamps',scene:sceneLimiter,
  story:'To allow at most so many calls in any 3,000 ms, keep the timestamps of recent calls in a queue. New calls join at the back; calls older than the window leave from the front. The queue\'s length is the number of calls that count.',
  when:'<b>You have met this</b> as an HTTP 429, "too many requests", from an API that counts your recent calls against a limit.',
  seen:['API gateways','Login attempt limits','Sliding-window metrics'],
  facts:function(m){return [{v:m.last,l:'calls inside the window after the last one, at 6,200'},{v:m.drops,l:'timestamps that aged out of the window along the way'},{v:'3,000',l:'ms: a call exactly this old still counts'}];},
  code:'limiter',watch:'Dropping calls that are exactly 3,000 ms old. The window is inclusive, so a call at 1 must still count at 3,001; with <= in place of < it does not.'}
};
/* Each system's mark (the index row, beside its title) and its spot drawing (beside its heading),
   as The Grid Underneath's tiles and vignettes. Both are decoration: the title carries the meaning. */
var LI_ICON={audio:'<path d="M3 12h1.5M7 8v8M11 4.5v15M15 8.5v7M19 10.5v3M21.5 12h-1"/>',
  growth:'<rect x="2.5" y="9" width="7" height="6" rx="1"/><rect x="13" y="5.5" width="8.5" height="13" rx="1"/><path d="M9.5 12h3.5M11.5 10l1.5 2-1.5 2"/>',
  history:'<circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/><path d="M9.8 12H7.2M16.8 12h-2.6"/>',
  lru:'<rect x="3" y="14" width="5" height="5" rx="1"/><rect x="10" y="14" width="5" height="5" rx="1"/><rect x="17" y="14" width="4.5" height="5" rx="1"/><path d="M19 11.5C19 6 8 4.5 5.5 10.5M5.5 10.5l-.4-2.8M5.5 10.5l2.6-1"/>',
  calls:'<rect x="5" y="4" width="14" height="4" rx="1.2"/><rect x="5" y="10" width="14" height="4" rx="1.2"/><rect x="5" y="16" width="14" height="4" rx="1.2"/>',
  brackets:'<path d="M8.5 4C5 4 6 10 3.5 12 6 14 5 20 8.5 20M15.5 4C19 4 18 10 20.5 12 18 14 19 20 15.5 20"/>',
  ring:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3.5v5M20.5 12h-5M12 20.5v-5M3.5 12h5"/>',
  limiter:'<path d="M3.5 16.5a8.5 8.5 0 1 1 17 0"/><path d="M12 16.5l4.2-5.2"/><circle cx="12" cy="16.5" r="1.2"/>'};
function liIcon(id){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+LI_ICON[id]+'</svg>';}
function vigSvg(id){
  var r=function(x,y,w,h,c,rx){return '<rect class="'+c+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(rx==null?3:rx)+'"/>';},
      ln=function(d,c){return '<path class="'+(c||'st')+'" d="'+d+'"/>';},o='',i;
  if(id==='audio'){ // a waveform sampled into one strip of cells; sample 7 is reached by arithmetic
    var pts=[];for(i=0;i<12;i++)pts.push((19+20*i)+','+(28-14*Math.sin(i*.9)).toFixed(1));
    o+=ln('M'+pts.join(' L'));for(i=0;i<12;i++)o+=r(10+20*i,60,18,22,i===7?'fc':'fp st');
    o+=ln('M159 '+(28-14*Math.sin(6.3)).toFixed(1)+'V58','sc');}
  if(id==='growth'){ // a full block of 4 copied into one of 8, with room for the next append
    for(i=0;i<4;i++)o+=r(10+20*i,36,18,24,'fk');o+=ln('M98 48h18M110 42l7 6-7 6','sc');
    for(i=0;i<8;i++)o+=r(124+17*i,36,15,24,i<4?'fk':(i===4?'fc':'fp st'));}
  if(id==='history'){ // commits, each pointing back at its parent; HEAD is the newest
    for(i=0;i<5;i++){o+='<circle class="'+(i===4?'fc':'fp st')+'" cx="'+(30+50*i)+'" cy="48" r="11"/>';if(i)o+=ln('M'+(30+50*i-13)+' 48H'+(30+50*(i-1)+14)+'M'+(30+50*(i-1)+20)+' 43l-6 5 6 5');}}
  if(id==='lru'){ // a hit is unlinked and relinked at the front
    for(i=0;i<5;i++)o+=r(14+48*i,58,34,24,i===3?'fc':(i===0?'fa':'fp st'));
    o+=ln('M31 58V52M31 52l-4 5M31 52l4 5','sc');o+=ln('M175 56C175 14 31 12 31 50','sc');}
  if(id==='calls'){ // frames stacked on main; the top one runs, the rest wait
    for(i=0;i<4;i++)o+=r(70,70-18*i,120,15,i===3?'fc':'fp st');o+=ln('M204 20v48M198 62l6 6 6-6','sc');}
  if(id==='brackets'){ // openers matched to closers in reverse: the innermost pair first
    '([{}])'.split('').forEach(function(c,k){o+='<text class="gl" x="'+(40+36*k)+'" y="74">'+c+'</text>';});
    [[0,5,14],[1,4,28],[2,3,42]].forEach(function(p,k){var a=40+36*p[0],b=40+36*p[1];o+=ln('M'+a+' 50C'+a+' '+p[2]+' '+b+' '+p[2]+' '+b+' 50',k===2?'sc':'st');});}
  if(id==='ring'){ // eight fixed slots; the head chases the tail round and wraps
    for(i=0;i<8;i++){var t=i/8*2*Math.PI-Math.PI/2,x=(130+34*Math.cos(t)-8).toFixed(1),y=(48+34*Math.sin(t)-8).toFixed(1);o+=r(x,y,16,16,i===5?'fc':(i>=1&&i<5?'fk':'fp st'));}
    o+=ln('M99.2 87.4A50 50 0 0 1 80.5 55.0M80.5 55.0l-2.4 6.6M80.5 55.0l4.1 5.7','sc');} // just outside the head, pointing on to the next slot (clockwise)
  if(id==='limiter'){ // timestamps on a line; only those inside the window count
    o+=r(142,34,108,34,'fa',8);o+=ln('M10 70H250');
    [22,58,96,128,160,190,214,238].forEach(function(x){o+='<circle class="'+(x>142?'fk':'fp st')+'" cx="'+x+'" cy="51" r="7"/>';});}
  return '<svg class="vig" viewBox="0 0 260 96" aria-hidden="true" focusable="false">'+o+'</svg>';
}
var STRUCTS={audio:'array',growth:'array',history:'linked list',lru:'linked list',calls:'stack',brackets:'stack',ring:'queue',limiter:'queue'};
var ORDER=['audio','growth','history','lru','calls','brackets','ring','limiter'];

/* ---------- rendering ---------- */
function renderSystem(host,id,n){
  var s=SYS[id],def=s.scene(),sec=el('div','sys');sec.id='sys-'+id;
  sec.innerHTML='<div class="sys-head"><div><div class="sys-kick"><span class="sys-n">'+n+'</span>'+s.lesson+' · '+s.kick+'</div><h3>'+s.title+'</h3></div>'+vigSvg(id)+'</div>';
  var duo=el('div','duo'),text=el('div','duo-text'),scene=el('div','duo-scene');
  text.appendChild(el('p','',s.story));text.appendChild(el('p','sys-when',s.when));
  text.appendChild(el('div','seen',s.seen.map(function(x){return '<span>'+x+'</span>';}).join('')));
  mountFacts(text,s.facts(def.meta));
  text.appendChild(codeBlock(CODE[s.code].py,CODE[s.code].ts,s.title));
  var w=el('div','callout warn');w.innerHTML='<div class="cl"><svg class="i"><use href="#i-warn"/></svg>Watch out</div><p>'+s.watch+'</p>';
  w.appendChild(codeBlock(CODE[s.code+'_mistake'].py,CODE[s.code+'_mistake'].ts,'The mistake'));
  text.appendChild(w);
  var wid=el('div','widget navy');wid.innerHTML='<div class="wl">'+def.label+'</div>'+playerHtml('p-'+id,def.label);
  scene.appendChild(wid);duo.appendChild(text);duo.appendChild(scene);sec.appendChild(duo);host.appendChild(sec);
  var sc=new Scene(def,wid.querySelector('.player'));onRepaint(function(){sc.refresh();});
  inView(wid,function(){sc.start();});
}

/* The index is itself an array: eight rows of one width, so row i is i widths past the first. */
function mountIndex(){
  var host=$('#liIndex'),W=48,rows='';
  ORDER.forEach(function(id,i){rows+='<a class="li-row" href="#sys-'+id+'" data-i="'+i+'"><span class="li-i">'+i+'</span><span class="li-ic">'+liIcon(id)+'</span><b>'+SYS[id].title+'</b><span class="li-s">'+STRUCTS[id]+'</span></a>';});
  host.innerHTML='<div class="li-rows">'+rows+'</div><div class="li-read"><span>This index is an array of 8 rows</span><span id="liRead"></span></div>';
  var read=$('#liRead'),els=host.querySelectorAll('.li-row'),cur=0,held=false;
  function on(i){cur=i;els.forEach(function(e,j){e.dataset.on=j===i?'1':'0';});read.innerHTML='row '+i+' at <b>0</b> + <b>'+i+'</b> × '+W+' = <b>'+jsAddress(0,i,W)+'</b>';}
  els.forEach(function(e,i){e.addEventListener('mouseenter',function(){held=true;on(i);});e.addEventListener('focus',function(){held=true;on(i);});
    e.addEventListener('mouseleave',function(){held=false;});e.addEventListener('blur',function(){held=false;});});
  on(0);
  if(!reduce)setInterval(function(){if(!held&&document.visibilityState==='visible')on((cur+1)%ORDER.length);},2200);
}

(function(){
  readPal();
  mountIndex();
  var n=0;
  document.querySelectorAll('.sysgroup').forEach(function(g){g.dataset.s.split(',').forEach(function(id){renderSystem(g,id,++n);});});
  mountVariants($('#shapes'),[
    ['Do you need item i right now?','array','Reaching any position by arithmetic is what an array is for. Audio, images and lookup tables all index straight into a block.'],
    ['Do you insert or remove next to a node you hold?','linked list','Splicing is a few pointer writes. An LRU cache moves a node to the front without touching anything else.'],
    ['Does the newest thing finish first?','stack','Anything nested closes in reverse: calls wait on calls, brackets wait for their closers.'],
    ['Is everything served in the order it arrived?','queue','Packets, requests and jobs in turn. A ring buffer does it in fixed memory; a deque does it without a limit.']
  ]);
  $('#practice').innerHTML='<span>Practise them:</span>'+['Contiguous Memory','Dynamic Arrays','Nodes & Pointers','Pointer Surgery','LIFO & the Call Stack','Valid Parentheses','Ring Buffer','Number of Recent Calls'].map(function(x){return '<span class="pill">'+x+'</span>';}).join('');
  kinetic();riseIn();
})();
