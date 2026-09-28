/* kit-players: a specimen of every shape kit/stacks.js draws. Not a lesson: a fixture the browser
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

mountLesson();
new LanePlayer($('#stackw .lvhost'),{id:'stk',loop:true,autoplay:true,inv:[['size matches','size equals the number of items',sizeOk('s')]]}).load(stackSteps());
mountLaneTabs($('#qtabs'),[{name:'Queue from two stacks',steps:twoStackSteps},{name:'Deque',steps:dequeSteps},{name:'Ring buffer',steps:ringSteps}],{id:'q'});
new LanePlayer($('#frames .lvhost'),{id:'fr',loop:true,autoplay:true}).load(frameSteps());
new LanePlayer($('#mono .lvhost'),{id:'mono',loop:true,autoplay:true}).load(monoSteps());
