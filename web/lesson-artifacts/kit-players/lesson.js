/* kit-players: a specimen of every shape kit/lanes.js draws. Not a lesson: a fixture the browser
   gate runs so the lane player is held to the lesson bar before a lesson depends on it. */
function recorder(M){var steps=[];return {steps:steps,rec:function(note,o){steps.push(M.snap(note,o));}};}
var sizeOk=function(lane){return function(s){var l=s.lanes.filter(function(x){return x.id===lane;})[0],f=s.fields.filter(function(x){return x[0]==='size';})[0];
  return f&&+f[1]===l.items.filter(function(x){return x;}).length;};};

function stackSteps(){
  var M=new Lanes([{id:'s',kind:'stack',label:'stack'}],{fields:function(M){return [['size',M.size('s')],['top',M.size('s')?M.peek('s').v:'none']];}}),R=recorder(M);
  R.rec('An empty stack. Nothing to pop yet.',{done:true});
  [4,7,2].forEach(function(v){var it=M.push('s',v);R.rec('Push '+v+'. It lands on top.',{hi:[laneHi(it),'top','size'],done:true});});
  R.rec('Peek reads the top, 2, without removing it.',{hi:[laneHi(M.peek('s')),'top'],done:true});
  [2,7].forEach(function(v){var it=M.pop('s');R.rec('Pop takes '+it.v+' off the top. The last in is the first out.',{hi:['top','size'],done:true});});
  return R.steps;
}
function twoStackSteps(){
  var M=new Lanes([{id:'in',kind:'stack',label:'in'},{id:'out',kind:'stack',label:'out'}],{fields:function(M){return [['size',M.size('in')+M.size('out')]];}}),R=recorder(M);
  R.rec('Two empty stacks. Enqueue pushes onto <code>in</code>; dequeue pops from <code>out</code>.',{done:true});
  [1,2,3].forEach(function(v){var it=M.push('in',v);R.rec('Enqueue '+v+': push it onto <code>in</code>.',{hi:[laneHi(it)],done:true});});
  R.rec('Dequeue, but <code>out</code> is empty. Pour <code>in</code> into it, one pop and push at a time.',{hi:['lane:out']});
  while(M.size('in')){var it=M.move('in','out');R.rec('Move '+it.v+' from <code>in</code> to <code>out</code>. The order reverses.',{hi:[laneHi(it)]});}
  var got=M.pop('out');R.rec('Pop '+got.v+' from <code>out</code>: the first value enqueued is the first out.',{done:true});
  return R.steps;
}
function dequeSteps(){
  var M=new Lanes([{id:'d',kind:'queue',label:'deque'}],{fields:function(M){return [['size',M.size('d')]];}}),R=recorder(M);
  R.rec('An empty deque: both ends take pushes and pops.',{done:true});
  var a=M.push('d',5);R.rec('Push 5 at the back.',{hi:[laneHi(a),'back'],done:true});
  var b=M.pushFront('d',3);R.rec('Push 3 at the front.',{hi:[laneHi(b),'front'],done:true});
  var c=M.push('d',8);R.rec('Push 8 at the back.',{hi:[laneHi(c),'back'],done:true});
  M.popFront('d');R.rec('Pop the front: 3 leaves on the left.',{hi:['front'],done:true});
  M.pop('d');R.rec('Pop the back: 8 leaves on the right.',{hi:['back'],done:true});
  M.popFront('d');R.rec('Pop the front again: 5 was the only item, and it leaves by the front.',{done:true});
  return R.steps;
}
function ringSteps(){
  var CAP=4,M=new Lanes([{id:'buf',kind:'row',label:'buffer',cap:CAP}],{fields:function(M){return [['count',M.size('buf')],['capacity',CAP]];}}),R=recorder(M),head=0,n=0;
  function marks(){M.mark('buf','head',n?head:null);M.mark('buf','tail',n?(head+n-1)%CAP:null);}
  R.rec('Four fixed slots, all empty. <code>head</code> is the oldest item; the next write goes to <code>(head + count) % 4</code>.',{done:true});
  function put(v){var slot=(head+n)%CAP,it=M.put('buf',slot,v);n++;marks();R.rec('Write '+v+' to slot '+slot+'.',{hi:[laneHi(it),'tail','count'],done:true});}
  function take(){var it=M.clear('buf',head);head=(head+1)%CAP;n--;marks();R.rec('Read '+it.v+' from the head. <code>head</code> moves on to slot '+head+'.',{hi:['head','count'],done:true});}
  put(10);put(20);put(30);take();take();put(40);put(50);
  return R.steps;
}
function frameSteps(){
  var M=new Lanes([{id:'calls',kind:'stack',label:'call stack'}]),R=recorder(M),fr={};
  R.rec('<code>reverse(1)</code> is called on the list 1 → 2 → 3.',{done:true});
  [1,2,3].forEach(function(v){fr[v]=M.push('calls','reverse('+v+')','head='+v+' · rest=?');R.rec('Call <code>reverse('+v+')</code>. '+(v<3?'It calls itself on '+(v+1)+' before doing anything else.':'3 has no next, so it is the new head.'),{hi:[laneHi(fr[v])]});});
  M.set(fr[3],undefined,'head=3 · returns 3');R.rec('<code>reverse(3)</code> returns 3, the new head.',{hi:[laneHi(fr[3])]});
  M.pop('calls');M.set(fr[2],undefined,'head=2 · rest=3');R.rec('Back in <code>reverse(2)</code>: 3 now points at 2, and 2 points at null.',{hi:[laneHi(fr[2])]});
  M.pop('calls');M.set(fr[1],undefined,'head=1 · rest=3');R.rec('Back in <code>reverse(1)</code>: 2 now points at 1, and 1 points at null.',{hi:[laneHi(fr[1])]});
  M.pop('calls');R.rec('The stack is empty again: 3 → 2 → 1, with one frame per node used at the deepest point.',{done:true});
  return R.steps;
}
function monoSteps(){
  var T=[73,74,75,71,69,72,76],N=T.length,M=new Lanes([{id:'t',kind:'row',label:'temps',cap:N},{id:'s',kind:'stack',label:'waiting (index)'},{id:'ans',kind:'row',label:'days to wait',cap:N}]),R=recorder(M),cells=T.map(function(v,k){return M.put('t',k,v);});
  for(var k=0;k<N;k++)M.put('ans',k,0);
  R.rec('Walk the temperatures once. The stack holds the days still waiting for a warmer one.',{done:true});
  for(var i=0;i<N;i++){
    M.mark('t','i',i);
    while(M.size('s')&&T[+M.peek('s').v]<T[i]){var d=M.pop('s'),j=+d.v;M.clear('ans',j);var a=M.put('ans',j,i-j);M.tone(cells[j],'dim');
      R.rec(T[i]+' is warmer than day '+j+' ('+T[j]+'). Pop it: it waited '+(i-j)+' day'+(i-j===1?'':'s')+'.',{hi:[laneHi(a),'i']});}
    var it=M.push('s',i);R.rec('Push day '+i+' ('+T[i]+'). The stack stays in falling temperature order.',{hi:[laneHi(it),'i']});
  }
  M.mark('t','i',null);R.rec('Days still on the stack never found a warmer day, so their answer stays 0.',{done:true});
  return R.steps;
}

function reverseSteps(){
  var A=[1,2,3,4,5,6,7],M=new Lanes([{id:'a',kind:'row',label:'array',idx:true}]),R=recorder(M),l=0,r=A.length-1;
  A.forEach(function(v){M.push('a',v);});
  function at(){M.mark('a','l',l<=r?l:null);M.mark('a','r',l<=r?r:null);}
  at();R.rec('Reverse in place: <code>l</code> starts at the first slot and <code>r</code> at the last.',{hi:['l','r'],done:true});
  while(l<r){var x=M.lane('a').items[l],y=M.lane('a').items[r];M.swap('a',l,r);
    R.rec('Swap slots '+l+' and '+r+': '+x.v+' and '+y.v+' trade places.',{hi:[laneHi(x),laneHi(y),'l','r']});
    l++;r--;at();R.rec(l<r?'Step both inward. They have not met, so there is more to swap.':(l===r?'<code>l</code> and <code>r</code> meet on the middle slot, which stays where it is. Done.':'<code>l</code> has passed <code>r</code>. Every pair is swapped. Done.'),{hi:['l','r'],done:l>=r});}
  return R.steps;
}
function windowSteps(){
  var A=[2,1,5,1,3,2],K=3,M=new Lanes([{id:'a',kind:'row',label:'array',idx:true}],{fields:function(){return [['sum',sum],['best',best]];}}),R=recorder(M),sum=0,best=0,cells=[];
  A.forEach(function(v){cells.push(M.push('a',v));});
  M.span('a','window',0,-1);R.rec('Find the largest sum of '+K+' neighbours. The window starts empty.',{hi:['window'],done:true});
  for(var r=0;r<A.length;r++){
    sum+=A[r];var lo=Math.max(0,r-K+1);
    if(r>=K){sum-=A[r-K];M.tone(cells[r-K],'dim');}
    M.span('a','window',lo,r);M.tone(cells[r],'cur');
    if(r>=K-1)best=Math.max(best,sum);
    R.rec(r<K?'Add '+A[r]+'. The window holds '+(r+1)+' of '+K+'.':'Add '+A[r]+' and drop '+A[r-K]+': the window slides one slot, and its sum changes by two values, not '+K+'.',{hi:['window','sum','best'].concat([laneHi(cells[r])])});
    M.tone(cells[r],null);
  }
  var bf=0;for(var i=0;i+K<=A.length;i++){var t=0;for(var j=i;j<i+K;j++)t+=A[j];bf=Math.max(bf,t);}
  if(bf!==best)throw new Error('window sum disagrees with brute force');
  R.rec('Done: the largest window sum is '+best+'.',{hi:['best'],done:true});
  return R.steps;
}
function resizeSteps(){
  var M=new Lanes([{id:'old',kind:'row',label:'array, capacity 2',cap:2},{id:'big',kind:'row',label:'new array, capacity 4',cap:4}],{fields:function(){return [['size',size],['capacity',cap]];}}),R=recorder(M),size=0,cap=2;
  R.rec('A dynamic array with room for 2.',{done:true});
  [7,3].forEach(function(v){var it=M.put('old',size,v);size++;R.rec('Append '+v+' into slot '+(size-1)+'.',{hi:[laneHi(it),'size'],done:true});});
  R.rec('Append 9, but all 2 slots are full. Allocate an array twice the size.',{hi:['lane:big','capacity']});cap=4;
  for(var k=0;k<2;k++){var c=M.copy('old',k,'big',k);R.rec('Copy slot '+k+', '+c.v+', into the new array.',{hi:[laneHi(c)]});}
  M.lane('old').items.forEach(function(x){if(x)M.tone(x,'dim');});
  var n=M.put('big',size,9);size++;R.rec('Write 9 into slot 2. The old array is no longer used. The copy cost 2 writes; the next append needs no copy.',{hi:[laneHi(n),'size','capacity'],done:true});
  return R.steps;
}
function countSteps(){
  var S='anagram',keys=S.split('').filter(function(c,i,a){return a.indexOf(c)===i;}).sort(),
      M=new Lanes([{id:'s',kind:'row',label:'string',idx:true,w:36},{id:'n',kind:'row',label:'count per letter',cap:keys.length,keys:keys,w:36}]),R=recorder(M),n={},cells=[];
  S.split('').forEach(function(c){cells.push(M.push('s',c));});
  keys.forEach(function(k,i){n[k]=0;M.put('n',i,0);});
  R.rec('Count each letter of "'+S+'" into one slot per letter.',{done:true});
  S.split('').forEach(function(c,i){n[c]++;var slot=keys.indexOf(c),it=M.lane('n').items[slot];M.set(it,n[c]);M.mark('s','i',i);M.tone(cells[i],'cur');
    R.rec('Read '+c+' at index '+i+'. Its count becomes '+n[c]+'.',{hi:['i',laneHi(it)]});M.tone(cells[i],'dim');});
  M.mark('s','i',null);R.rec('Every letter read once. Two strings are anagrams exactly when these counts match.',{done:true});
  return R.steps;
}

mountLesson();
new LanePlayer($('#stackw .lvhost'),{id:'stk',loop:true,autoplay:true,inv:[['size matches','size equals the number of items',sizeOk('s')]]}).load(stackSteps());
mountLaneTabs($('#qtabs'),[{name:'Queue from two stacks',steps:twoStackSteps},{name:'Deque',steps:dequeSteps},{name:'Ring buffer',steps:ringSteps}],{id:'q'});
new LanePlayer($('#frames .lvhost'),{id:'fr',loop:true,autoplay:true}).load(frameSteps());
new LanePlayer($('#mono .lvhost'),{id:'mono',loop:true,autoplay:true}).load(monoSteps());
mountLaneTabs($('#atabs'),[{name:'Reverse in place',steps:reverseSteps},{name:'Sliding window',steps:windowSteps},{name:'Resize',steps:resizeSteps},{name:'Count letters',steps:countSteps}],{id:'a'});
