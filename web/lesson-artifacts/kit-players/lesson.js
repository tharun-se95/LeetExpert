/* kit-players: a specimen of every shape kit/lanes.js and kit/grids.js draw. Not a lesson: a fixture the browser
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

/* ---------- grids (kit/grids.js) ---------- */
function spiralSteps(){
  var A=[[1,2,3,4],[5,6,7,8],[9,10,11,12]],RN=A.length,CN=A[0].length,order=[],
      M=new Lanes([{id:'g',kind:'grid',label:'matrix',rows:RN,cols:CN},{id:'out',kind:'row',label:'spiral order',idx:true}],{fields:function(){return [['visited',order.length+' of '+RN*CN]];}}),
      R=recorder(M),cells=M.fill('g',A),top=0,bottom=RN-1,left=0,right=CN-1;
  function bounds(){if(top<=bottom&&left<=right){M.axis('g','top','r',top);M.axis('g','bottom','r',bottom);M.axis('g','left','c',left);M.axis('g','right','c',right);}
    else['top','bottom','left','right'].forEach(function(n){M.axis('g',n,null);});M.rect('g','bounds',top,left,bottom,right);}
  function visit(r,c){var k=M.at('g',r,c);order.push(k);M.path('g','order',order);var it=M.copy('g',k,'out');M.tone(cells[r][c],'cur');
    R.rec('Read '+A[r][c]+' at ('+r+', '+c+').',{hi:[laneHi(it),laneHi(cells[r][c]),'order','visited']});M.tone(cells[r][c],'dim');}
  bounds();R.rec('Walk the matrix in a spiral. Four bounds close in on the cells not yet read, one side per pass.',{hi:['bounds'],done:true});
  while(top<=bottom&&left<=right){
    for(var c=left;c<=right;c++)visit(top,c);
    top++;bounds();R.rec('The top row is read, so <code>top</code> moves down to '+top+'.',{hi:['top','bounds'],done:true});
    for(var r=top;r<=bottom;r++)visit(r,right);
    right--;bounds();R.rec('The right column is read, so <code>right</code> moves left to '+right+'.',{hi:['right','bounds'],done:true});
    if(top<=bottom){for(c=right;c>=left;c--)visit(bottom,c);bottom--;bounds();R.rec('The bottom row is read, right to left, so <code>bottom</code> moves up to '+bottom+'.',{hi:['bottom','bounds'],done:true});}
    if(left<=right){for(r=bottom;r>=top;r--)visit(r,left);left++;bounds();R.rec('The left column is read, bottom to top, so <code>left</code> moves right to '+left+'.',{hi:['left','bounds'],done:true});}
  }
  /* the turn-when-blocked walk, which shares nothing with the bounds above */
  var seen={},dr=[0,1,0,-1],dc=[1,0,-1,0],d=0,y=0,x=0,want=[];
  for(var n=0;n<RN*CN;n++){want.push(A[y][x]);seen[y+','+x]=1;var ny=y+dr[d],nx=x+dc[d];
    if(ny<0||ny>=RN||nx<0||nx>=CN||seen[ny+','+nx]){d=(d+1)%4;ny=y+dr[d];nx=x+dc[d];}y=ny;x=nx;}
  if(order.map(function(k){return A[Math.floor(k/CN)][k%CN];}).join()!==want.join())throw new Error('spiral order disagrees with the turn-when-blocked walk');
  R.rec('The bounds have crossed: every cell is read once, in spiral order.',{hi:['order'],done:true});
  return R.steps;
}
function transposeSteps(){
  var A=[[1,2,3],[4,5,6],[7,8,9]],N=A.length,M=new Lanes([{id:'g',kind:'grid',label:'matrix',rows:N,cols:N}]),R=recorder(M),cells=M.fill('g',A);
  for(var d=0;d<N;d++)M.tone(cells[d][d],'good');
  R.rec('Transpose in place: cell (r, c) trades with (c, r). The diagonal, where r equals c, stays where it is.',{done:true});
  for(var r=0;r<N;r++)for(var c=r+1;c<N;c++){
    M.axis('g','r','r',r);M.axis('g','c','c',c);var x=M.cell('g',r,c),y=M.cell('g',c,r);M.swap('g',M.at('g',r,c),M.at('g',c,r));M.tone(x,'good');M.tone(y,'good');
    R.rec('Swap ('+r+', '+c+') with ('+c+', '+r+'): '+x.v+' and '+y.v+' cross the diagonal.',{hi:[laneHi(x),laneHi(y),'r','c']});}
  M.axis('g','r',null);M.axis('g','c',null);
  var got=M.snap('check').lanes[0].items.map(function(x){return +x.v;}),want=[];
  for(r=0;r<N;r++)for(c=0;c<N;c++)want.push(A[c][r]);
  if(got.join()!==want.join())throw new Error('in-place transpose disagrees with reading columns as rows');
  R.rec('Each pair above the diagonal was swapped once, so row r now holds what column r held.',{done:true});
  return R.steps;
}
function islandsSteps(){
  var G=['11000','11010','00110','00001'].map(function(x){return x.split('');}),RN=G.length,CN=G[0].length,count=0,seen={},
      M=new Lanes([{id:'g',kind:'grid',label:'grid',rows:RN,cols:CN,w:36},{id:'q',kind:'queue',label:'BFS queue'}],{fields:function(){return [['islands',count]];}}),
      R=recorder(M),cells=M.fill('g',G),Q=[];
  G.forEach(function(row,r){row.forEach(function(v,c){if(v==='0')M.tone(cells[r][c],'dim');});});
  function queue(r,c){seen[r+','+c]=1;Q.push([r,c]);var it=M.copy('g',M.at('g',r,c),'q');M.set(it,'('+r+','+c+')');M.tone(cells[r][c],'cur');return it;}
  function at(r,c){M.axis('g','r','r',r);M.axis('g','c','c',c);}
  R.rec('Scan every cell. Land (1) that is not yet visited starts a new island, and a breadth-first search floods it.',{done:true});
  for(var r=0;r<RN;r++)for(var c=0;c<CN;c++){
    if(G[r][c]!=='1'||seen[r+','+c])continue;
    count++;at(r,c);var it=queue(r,c);
    R.rec('Land at ('+r+', '+c+') that is not yet visited: island '+count+'. Mark it and queue it.',{hi:[laneHi(it),'islands','r','c']});
    while(Q.length){var p=Q.shift();M.popFront('q');at(p[0],p[1]);M.tone(cells[p[0]][p[1]],'good');var got=[],hi=['r','c'];
      [[-1,0],[1,0],[0,-1],[0,1]].forEach(function(o){var y=p[0]+o[0],x=p[1]+o[1];
        if(y<0||y>=RN||x<0||x>=CN||G[y][x]!=='1'||seen[y+','+x])return;got.push('('+y+', '+x+')');hi.push(laneHi(queue(y,x)));});
      R.rec('Take ('+p[0]+', '+p[1]+') off the front. '+(got.length?'Its unvisited land neighbours '+got.join(' and ')+' are marked and queued.':'It has no unvisited land neighbours.'),{hi:hi});}
  }
  M.axis('g','r',null);M.axis('g','c',null);
  /* a depth-first count, which shares nothing with the scan above */
  var mark={},dfs=function(y,x){if(y<0||y>=RN||x<0||x>=CN||G[y][x]!=='1'||mark[y+','+x])return;mark[y+','+x]=1;dfs(y+1,x);dfs(y-1,x);dfs(y,x+1);dfs(y,x-1);},want=0;
  for(r=0;r<RN;r++)for(c=0;c<CN;c++)if(G[r][c]==='1'&&!mark[r+','+c]){want++;dfs(r,c);}
  if(want!==count)throw new Error('BFS island count disagrees with a depth-first count');
  R.rec('Every cell scanned: '+count+' islands. Each land cell was queued once, so the work is one visit per cell.',{hi:['islands'],done:true});
  return R.steps;
}
var PFX_A=[[3,1,4],[1,5,9],[2,6,5]];
function pfxBlock(r,c){var t=0;for(var y=0;y<r;y++)for(var x=0;x<c;x++)t+=PFX_A[y][x];return t;}
function prefixSteps(){
  var A=PFX_A,N=A.length,P=[],q=null,
      M=new Lanes([{id:'a',kind:'grid',label:'values',rows:N,cols:N},{id:'p',kind:'grid',label:'prefix sums',rows:N+1,cols:N+1}],{fields:function(){return [['answer',q===null?'not yet':q]];}}),
      R=recorder(M),cells=M.fill('a',A),pc=[];
  for(var r=0;r<=N;r++){P.push([]);pc.push([]);for(var c=0;c<=N;c++){P[r].push(0);pc[r].push(null);}}
  for(r=0;r<=N;r++){pc[r][0]=M.put('p',M.at('p',r,0),0);}
  for(c=1;c<=N;c++){pc[0][c]=M.put('p',M.at('p',0,c),0);}
  R.rec('Row 0 and column 0 of the prefix grid hold 0: the sum of an empty block. They save a bounds check on every read.',{done:true});
  for(r=0;r<N;r++)for(c=0;c<N;c++){
    P[r+1][c+1]=A[r][c]+P[r][c+1]+P[r+1][c]-P[r][c];pc[r+1][c+1]=M.put('p',M.at('p',r+1,c+1),P[r+1][c+1]);M.rect('a','block',0,0,r,c);M.tone(cells[r][c],'cur');
    R.rec('P('+(r+1)+', '+(c+1)+') = '+A[r][c]+' + '+P[r][c+1]+' + '+P[r+1][c]+' − '+P[r][c]+' = '+P[r+1][c+1]+'. The block above and the block to the left overlap in P('+r+', '+c+'), counted twice, so it is taken away once.',{hi:[laneHi(pc[r+1][c+1]),'block'],done:true});
    M.tone(cells[r][c],null);}
  M.rect('a','block',null);
  var r1=1,c1=1,r2=2,c2=2;
  M.rect('a','query',r1,c1,r2,c2);R.rec('Query the block over rows '+r1+' to '+r2+' and columns '+c1+' to '+c2+'. Four reads answer it, whatever its size.',{hi:['query'],done:true});
  var reads=[['total',r2+1,c2+1,0,0,r2,c2,'Start from P('+(r2+1)+', '+(c2+1)+'), the whole block from (0, 0) to ('+r2+', '+c2+').'],
    ['above',r1,c2+1,0,0,r1-1,c2,'Take away P('+r1+', '+(c2+1)+'): the rows above the query.'],
    ['left',r2+1,c1,0,0,r2,c1-1,'Take away P('+(r2+1)+', '+c1+'): the columns left of the query.'],
    ['corner',r1,c1,0,0,r1-1,c1-1,'Add back P('+r1+', '+c1+'): the corner was taken away twice.']],prev=null;
  q=0;reads.forEach(function(x,j){if(prev)M.rect('a',prev,null);M.rect('a',x[0],x[3],x[4],x[5],x[6]);prev=x[0];var it=pc[x[1]][x[2]],v=P[x[1]][x[2]];
    q+=(j===1||j===2?-1:1)*v;M.tone(it,'cur');R.rec(x[7]+' Running total: '+q+'.',{hi:[laneHi(it),x[0],'answer']});M.tone(it,'dim');});
  M.rect('a',prev,null);
  var want=0;for(r=r1;r<=r2;r++)for(c=c1;c<=c2;c++)want+=A[r][c];
  if(want!==q)throw new Error('prefix-sum query disagrees with adding the block cell by cell');
  R.rec('The answer is '+q+', read from four cells: the same four reads for a block of any size.',{hi:['query','answer'],done:true});
  return R.steps;
}
/* every filled prefix cell equals the sum of the block above and left of it */
function prefixHolds(s){var p=s.lanes.filter(function(l){return l.id==='p';})[0];
  return p.items.every(function(x,k){return !x||+x.v===pfxBlock(Math.floor(k/p.cols),k%p.cols);});}

/* a bucket is a small stack, open at the top; several buckets, consecutive in one Lanes(), stand
   side by side as one block (lanes.js's own "several stacks" case) — no new lane kind needed */
function bucketDefs(idPrefix,labelPrefix,cap){var defs=[];for(var k=0;k<cap;k++)defs.push({id:idPrefix+k,kind:'stack',label:labelPrefix+k});return defs;}
function hashOf(str,cap){var h=0;for(var i=0;i<str.length;i++)h+=str.charCodeAt(i);return h%cap;}

function chainingSteps(){
  var CAP=4,KEYS=['cat','dog','god','emu'],
      M=new Lanes(bucketDefs('b','',CAP),{fields:function(){return [['capacity',CAP],['entries',KEYS.length]];}}),
      R=recorder(M),put={};
  R.rec('Four buckets, all empty. A key’s bucket is the sum of its character codes, mod '+CAP+'.',{done:true});
  KEYS.forEach(function(k){var b=hashOf(k,CAP),already=M.lane('b'+b).items.length,it=M.push('b'+b,k);put[k]=b;
    R.rec('Hash “'+k+'” to bucket '+b+'. '+(already?'“'+M.lane('b'+b).items[0].v+'” is already there: it hangs behind it.':'It lands alone.'),{hi:[laneHi(it),'lane:b'+b]});});
  var lookK='god',lb=put[lookK],chain=M.lane('b'+lb).items.slice(),found=null;
  R.rec('Look up “'+lookK+'”: hash it to bucket '+lb+', then walk the chain from the bottom.',{hi:['lane:b'+lb]});
  chain.forEach(function(it){if(found)return;M.tone(it,'cur');
    if(it.v===lookK){M.tone(it,'good');found=it;R.rec('“'+it.v+'” matches.',{hi:[laneHi(it)],done:true});}
    else{R.rec('“'+it.v+'” does not match. Keep walking the chain.',{hi:[laneHi(it)]});M.tone(it,null);}});
  var ref={};for(var k=0;k<CAP;k++)ref[k]=[];
  KEYS.forEach(function(x){ref[hashOf(x,CAP)].push(x);});
  for(k=0;k<CAP;k++){var got=M.lane('b'+k).items.map(function(x){return x.v;});
    if(got.join(',')!==ref[k].join(','))throw new Error('bucket '+k+' disagrees with a plain hash map built the same way');}
  R.rec('The finished buckets match a plain hash map built with the same rule.',{done:true});
  return R.steps;
}
function resizeChainSteps(){
  var OLD=2,NEW=4,KEYS=['a','b','c'],
      M=new Lanes(bucketDefs('o','old ',OLD).concat(bucketDefs('n','new ',NEW)),{fields:function(){return [['load factor',lf.toFixed(2)]];}}),
      R=recorder(M),lf=0,n=0;
  R.rec('A 2-bucket table. A key’s bucket is its character code mod the capacity.',{done:true});
  KEYS.forEach(function(k){var b=hashOf(k,OLD),it=M.push('o'+b,k);n++;lf=n/OLD;
    R.rec('Hash “'+k+'” to bucket '+b+' (mod '+OLD+').',{hi:[laneHi(it),'lane:o'+b,'load factor']});});
  R.rec('Load factor '+lf.toFixed(2)+' crosses the resize threshold. Allocate 4 buckets and recompute every key’s bucket mod '+NEW+'.',
    {hi:['lane:n0','lane:n1','lane:n2','lane:n3']});
  for(var b=0;b<OLD;b++)M.lane('o'+b).items.forEach(function(it,idx){var nb=hashOf(it.v,NEW),c=M.copy('o'+b,idx,'n'+nb);
    R.rec('Copy “'+it.v+'” into bucket '+nb+' of the new table.',{hi:[laneHi(c),'lane:n'+nb]});});
  for(b=0;b<OLD;b++)M.lane('o'+b).items.forEach(function(it){M.tone(it,'dim');});
  var ref={};for(var k=0;k<NEW;k++)ref[k]=[];
  KEYS.forEach(function(x){ref[hashOf(x,NEW)].push(x);});
  for(k=0;k<NEW;k++){var got=M.lane('n'+k).items.map(function(x){return x.v;});
    if(got.join(',')!==ref[k].join(','))throw new Error('resized bucket '+k+' disagrees with rehashing at the new capacity');}
  R.rec('The table is rehashed: '+KEYS.length+' entries across '+NEW+' buckets, none sharing one.',{done:true});
  return R.steps;
}
/* a brute-force LCS, sharing nothing with the tabulation above, to check dp[m][n] against */
function lcsRef(a,b){function rec(i,j){if(i===0||j===0)return 0;
  if(a[i-1]===b[j-1])return 1+rec(i-1,j-1);return Math.max(rec(i-1,j),rec(i,j-1));}return rec(a.length,b.length);}
function lcsSteps(){
  var X='ABC',Y='AC',m=X.length,n=Y.length,
      M=new Lanes([{id:'dp',kind:'grid',label:'dp',rows:m+1,cols:n+1,rkeys:['∅'].concat(X.split('')),ckeys:['∅'].concat(Y.split('')),w:34}]),
      R=recorder(M),cells=[];
  for(var r=0;r<=m;r++){cells.push([]);for(var c=0;c<=n;c++)cells[r].push(null);}
  for(r=0;r<=m;r++)cells[r][0]=M.put('dp',M.at('dp',r,0),0);
  for(c=1;c<=n;c++)cells[0][c]=M.put('dp',M.at('dp',0,c),0);
  R.rec('An empty prefix of either string shares nothing: row ∅ and column ∅ hold 0.',{done:true});
  for(r=1;r<=m;r++)for(c=1;c<=n;c++){
    var match=X[r-1]===Y[c-1],to=M.at('dp',r,c),v,srcs,note;
    if(match){v=cells[r-1][c-1].v+1;srcs=[M.at('dp',r-1,c-1)];
      note='“'+X[r-1]+'” matches “'+Y[c-1]+'”: extend the diagonal, dp['+(r-1)+']['+(c-1)+'] + 1 = '+v+'.';}
    else{var up=cells[r-1][c].v,left=cells[r][c-1].v;v=Math.max(up,left);srcs=[M.at('dp',r-1,c),M.at('dp',r,c-1)];
      note='“'+X[r-1]+'” and “'+Y[c-1]+'” differ: the better of dp['+(r-1)+']['+c+']='+up+' and dp['+r+']['+(c-1)+']='+left+' is '+v+'.';}
    M.deps('dp','d',to,srcs);var it=M.put('dp',to,v);cells[r][c]=it;M.tone(it,'cur');
    R.rec(note,{hi:[laneHi(it),'d']});M.tone(it,'good');
  }
  M.deps('dp','d',null);
  var got=cells[m][n].v,want=lcsRef(X,Y);
  if(got!==want)throw new Error('LCS table disagrees with a brute-force recursion');
  R.rec('dp['+m+']['+n+'] = '+got+': the length of the longest common subsequence, checked against a brute-force recursion.',{hi:[laneHi(cells[m][n])],done:true});
  return R.steps;
}

/* ---------- heaps (kit/heaps.js) ---------- */
/* append, then swap toward the root while a parent is worse than its child: the ONLY repair push needs */
function heapPush(M,R,id,v,cmp){
  var it=M.push(id,v),i=M.lane(id).items.length-1;
  M.mark(id,'i',i);R.rec('Push '+v+' onto the end, index '+i+'.',{hi:[laneHi(it),'i']});
  while(i>0){
    var items=M.lane(id).items,p=(i-1)>>1,pv=+items[p].v,cv=+items[i].v,better=cmp==='max'?cv>pv:cv<pv;
    if(!better){R.rec('Index '+i+' ('+cv+') is no better than its parent, index '+p+' ('+pv+'). Sifting up stops.',{hi:['i']});break;}
    var a=items[i],b=items[p];M.swap(id,i,p);
    R.rec('Index '+i+' ('+cv+') beats its parent, index '+p+' ('+pv+'). Swap up.',{hi:[laneHi(a),laneHi(b),'i']});
    i=p;M.mark(id,'i',i);
  }
  M.mark(id,'i',null);
  return it;
}
/* swap the root with the last slot, drop the empty end, then swap toward a leaf while the better
   child beats the node: the ONLY repair pop needs */
function heapPop(M,R,id,cmp){
  var items=M.lane(id).items,n=items.length,root=items[0],word=cmp==='max'?'≥':'≤';
  if(n===1){M.remove(id,0);R.rec('Pop '+root.v+': it was the only value left.',{done:true});return root;}
  M.mark(id,'i',0);R.rec('Pop the root, '+root.v+'. Move the last value, index '+(n-1)+', to the root, then drop the empty end.',{hi:['i',laneHi(items[n-1])]});
  M.swap(id,0,n-1);var taken=M.remove(id,n-1),i=0;
  for(;;){
    items=M.lane(id).items;n=items.length;
    var l=2*i+1,r=2*i+2,best=i,worse=function(a,b){return cmp==='max'?+items[a].v>+items[b].v:+items[a].v<+items[b].v;};
    if(l<n&&worse(l,best))best=l;
    if(r<n&&worse(r,best))best=r;
    M.mark(id,'i',i);
    if(best===i){R.rec('Index '+i+' ('+items[i].v+') already '+word+' both children. Sifting down stops.',{hi:['i']});break;}
    var a=items[i],b=items[best];M.swap(id,i,best);
    R.rec('Index '+best+' ('+b.v+') beats index '+i+' ('+a.v+'). Swap down.',{hi:[laneHi(a),laneHi(b),'i']});
    i=best;
  }
  M.mark(id,'i',null);
  return taken;
}
/* the min-heap holds, for every lane the walkthrough draws as a heap (a tab may draw one or none) */
function heapInv(s){return s.lanes.filter(function(l){return l.kind==='heap';}).every(heapHolds);}

function pushPopSteps(){
  var VALUES=[5,3,8,1],M=new Lanes([{id:'h',kind:'heap',label:'heap'}],{fields:function(M){return [['size',M.size('h')]];}}),R=recorder(M);
  R.rec('An empty min-heap. Push appends, then sifts up; pop removes the root, then sifts down.',{done:true});
  VALUES.forEach(function(v){heapPush(M,R,'h',v,'min');});
  R.rec('Every push landed at the end, then sifted up until a parent no larger stopped it.',{hi:['size'],done:true});
  var order=[];while(M.size('h'))order.push(+heapPop(M,R,'h','min').v);
  var want=VALUES.slice().sort(function(a,b){return a-b;});
  if(order.join()!==want.join())throw new Error('pop order disagrees with Array.prototype.sort');
  R.rec('Popped in order: '+order.join(', ')+' — sorted, exactly as repeated extract-min always is.',{done:true});
  return R.steps;
}
function heapifySteps(){
  var RAW=[5,3,8,4,1,9,2],M=new Lanes([{id:'h',kind:'heap',label:'heap'}]),R=recorder(M);
  RAW.forEach(function(v){M.push('h',v);});
  R.rec('Load the raw array as a complete tree: every slot filled, no ordering yet.',{done:true});
  var n=RAW.length,start=(n-2)>>1;
  for(var i=start;i>=0;i--){
    var cur=i;
    for(;;){
      var items=M.lane('h').items,l=2*cur+1,r=2*cur+2,best=cur;
      if(l<n&&+items[l].v<+items[best].v)best=l;
      if(r<n&&+items[r].v<+items[best].v)best=r;
      M.mark('h','i',cur);
      if(best===cur)break;
      var a=items[cur],b=items[best];M.swap('h',cur,best);
      R.rec('Sifting down from index '+i+': index '+best+' ('+b.v+') beats index '+cur+' ('+a.v+'). Swap.',{hi:[laneHi(a),laneHi(b),'i']});
      cur=best;
    }
  }
  M.mark('h','i',null);
  var got=heapLaneOf(M.snap('check'),'h');
  if(!heapHolds(got))throw new Error('heapify result violates the heap property');
  var gotVals=got.items.map(function(x){return +x.v;}).slice().sort(function(a,b){return a-b;}),
      wantVals=RAW.slice().sort(function(a,b){return a-b;});
  if(gotVals.join()!==wantVals.join())throw new Error('heapify result holds a different multiset than the input');
  R.rec('Every non-leaf sifted down, from the last one back to the root: the heap property holds everywhere, same values, four swaps.',{done:true});
  return R.steps;
}
function heapLaneOf(s,id){return s.lanes.filter(function(l){return l.id===id;})[0];}
function topKSteps(){
  var A=[3,1,5,2],K=2,M=new Lanes([{id:'in',kind:'row',label:'stream',idx:true},{id:'h',kind:'heap',label:'k largest'}],
      {fields:function(M){return [['k',K],['size',M.size('h')]];}}),R=recorder(M),cells=A.map(function(v){return M.push('in',v);});
  R.rec('Keep the '+K+' largest values seen in a MIN-heap of size '+K+': its root is the smallest of the k largest, so a new value only has to beat that root.',{hi:['k'],done:true});
  A.forEach(function(v,i){
    M.tone(cells[i],'cur');R.rec('Read '+v+' at index '+i+'.',{hi:[laneHi(cells[i])]});
    heapPush(M,R,'h',v,'min');
    if(M.size('h')>K)heapPop(M,R,'h','min');
    M.tone(cells[i],'dim');
  });
  var got=heapLaneOf(M.snap('check'),'h').items.map(function(x){return +x.v;}).sort(function(a,b){return a-b;}),
      want=A.slice().sort(function(a,b){return a-b;}).slice(-K);
  if(got.join()!==want.join())throw new Error('k-largest heap disagrees with sorting the whole stream');
  R.rec('Every value read once: the heap holds the '+K+' largest, '+got.join(', ')+', and its root is the Kth largest.',{done:true});
  return R.steps;
}


/* ---------- graphs (kit/graphs.js) ---------- */
/* Each walkthrough runs its algorithm on the model and records as it goes, then checks its answer
   against a reference that shares no code with it, so a wrong step fails on load, not in a reader's
   head. Edges a step examines are drawn 'cur' and settle at the next step into what they turned out
   to be, so the step that decides an edge is the step that shows it. */
function grSettle(M,id,cur){cur.forEach(function(e){M.edge(id,e[0],e[1],e[2]);});cur.length=0;}
function grNames(G,ks){return ks.map(function(k){return G.nodes[k].l;}).join(' and ');}

var BFS_G={nodes:[{x:0,d:0,l:'A'},{x:2,d:0,l:'B'},{x:4,d:0,l:'C'},{x:1,d:1,l:'D'},{x:3,d:1,l:'E'},{x:2,d:2,l:'F'}],
  edges:[[0,1],[0,3],[1,3],[1,4],[2,4],[3,5],[4,5]]};
function bfsSteps(){
  var G=BFS_G,dist={},Q=[],cur=[],
      M=new Lanes([{id:'g',kind:'graph',label:'graph',nodes:G.nodes,edges:G.edges},{id:'q',kind:'queue',label:'queue'}],
        {fields:function(){return [['seen',Object.keys(dist).length]];}}),
      R=recorder(M),node=M.nodes('g');
  function see(v,d){dist[v]=d;Q.push(v);M.set(node[v],undefined,'d '+d);M.tone(node[v],'cur');return M.copy('g',v,'q');}
  var first=see(0,0);
  R.rec('Breadth-first search from A. A is at distance 0: mark it seen and queue it.',{hi:[laneHi(first),'seen'],done:true});
  while(Q.length){
    grSettle(M,'g',cur);
    var u=Q.shift();M.popFront('q');M.tone(node[u],'good');M.mark('g','u',u);
    var found=[],again=[],hi=['u'];
    M.adj('g',u).forEach(function(n){var v=n.to;
      if(dist[v]===undefined){M.edge('g',u,v,'cur');cur.push([u,v,'tree']);hi.push(laneHi(see(v,dist[u]+1)));found.push(v);}
      else if(M.edge('g',u,v).state==='idle'){M.edge('g',u,v,'cur');cur.push([u,v,'seen']);again.push(v);}});
    R.rec('Take '+G.nodes[u].l+' off the front (distance '+dist[u]+'). '+
      (found.length?'Unseen neighbour'+(found.length>1?'s ':' ')+grNames(G,found)+' '+(found.length>1?'are':'is')+' one step further, at distance '+(dist[u]+1)+': mark and queue.':'It has no unseen neighbours.')+
      (again.length?' '+grNames(G,again)+(again.length>1?' were':' was')+' already seen, so '+(again.length>1?'those edges add':'that edge adds')+' nothing.':''),{hi:hi});
  }
  grSettle(M,'g',cur);M.mark('g','u',null);
  /* reference: relax every edge, both ways, once per node; unit weights make that the shortest hop count */
  var ref=G.nodes.map(function(_,k){return k===0?0:Infinity;});
  G.nodes.forEach(function(){G.edges.forEach(function(e){ref[e[1]]=Math.min(ref[e[1]],ref[e[0]]+1);ref[e[0]]=Math.min(ref[e[0]],ref[e[1]]+1);});});
  G.nodes.forEach(function(_,k){if(ref[k]!==dist[k])throw new Error('BFS distance to '+G.nodes[k].l+' disagrees with relaxing every edge n times');});
  R.rec('The queue is empty. The queue hands out nodes in the order they were seen, so every node at distance d is taken before any at d + 1, and each node was first seen from one a step nearer. The solid edges are the shortest-path tree.',{done:true});
  return R.steps;
}

var KAHN_G={nodes:[{x:0,d:0,l:'0'},{x:0,d:2,l:'1'},{x:1,d:0,l:'2'},{x:1,d:2,l:'3'},{x:2,d:1,l:'4'},{x:3,d:1,l:'5'}],
  edges:[[0,2],[1,2],[1,3],[2,4],[3,4],[4,5]]};
function kahnSteps(){
  var G=KAHN_G,n=G.nodes.length,deg=[],cell=[],order=[],Q=[],cur=[],
      M=new Lanes([{id:'g',kind:'graph',label:'prerequisites',directed:true,nodes:G.nodes,edges:G.edges},
        {id:'deg',kind:'row',label:'in-degree',cap:n,keys:G.nodes.map(function(x){return x.l;})},
        {id:'q',kind:'queue',label:'ready'},{id:'out',kind:'row',label:'order',idx:true}]),
      R=recorder(M),node=M.nodes('g');
  G.nodes.forEach(function(_,k){deg[k]=0;});G.edges.forEach(function(e){deg[e[1]]++;});
  G.nodes.forEach(function(_,k){cell[k]=M.put('deg',k,deg[k]);});
  R.rec('An edge a → b means a must come before b. Count each node\'s incoming edges: its in-degree, the prerequisites it still waits for.',{hi:['lane:deg'],done:true});
  var ready=[];
  G.nodes.forEach(function(_,k){if(!deg[k]){Q.push(k);ready.push(k);M.tone(node[k],'cur');M.copy('g',k,'q');}});
  R.rec('In-degree 0 means nothing is left to wait for: '+grNames(G,ready)+' join the ready queue.',{hi:['lane:q']});
  while(Q.length){
    grSettle(M,'g',cur);
    var u=Q.shift(),it=M.move('q','out',true);order.push(u);M.tone(node[u],'good');M.mark('g','u',u);
    var outs=M.adj('g',u),freed=[],hi=['u',laneHi(it)];
    outs.forEach(function(e){var v=e.to;deg[v]--;M.set(cell[v],deg[v]);M.edge('g',u,v,'cur');cur.push([u,v,'seen']);hi.push(laneHi(cell[v]));
      if(!deg[v]){Q.push(v);freed.push(v);M.tone(node[v],'cur');hi.push(laneHi(M.copy('g',v,'q')));}});
    R.rec('Take '+G.nodes[u].l+' from the ready queue and append it to the order. '+
      (outs.length?'Its edge'+(outs.length>1?'s':'')+' to '+grNames(G,outs.map(function(e){return e.to;}))+' '+(outs.length>1?'are':'is')+' now satisfied, so '+(outs.length>1?'each in-degree drops':'that in-degree drops')+' by 1'+
        (freed.length?'; '+grNames(G,freed)+' reach'+(freed.length>1?'':'es')+' 0 and '+(freed.length>1?'are':'is')+' ready.':'.'):'Nothing depends on it.'),{hi:hi});
  }
  grSettle(M,'g',cur);M.mark('g','u',null);
  /* reference: the definition itself. Every node placed once, and every edge runs forward in the order. */
  var at={};order.forEach(function(k,i){at[k]=i;});
  if(order.length!==n)throw new Error('Kahn placed '+order.length+' of '+n+' nodes in an acyclic graph');
  G.edges.forEach(function(e){if(!(at[e[0]]<at[e[1]]))throw new Error('order puts '+e[1]+' before its prerequisite '+e[0]);});
  R.rec('Every node was placed, so the graph has no cycle (a node on a cycle never reaches in-degree 0). Every edge points forward in the order: '+order.map(function(k){return G.nodes[k].l;}).join(', ')+'.',{hi:['lane:out'],done:true});
  return R.steps;
}

var UF_G={nodes:[{x:0,d:0,l:'1'},{x:2,d:0,l:'2'},{x:2,d:2,l:'3'},{x:0,d:2,l:'4'},{x:1,d:3,l:'5'}],
  input:[[0,1],[1,2],[2,3],[0,3],[0,4]]};
function unionFindSteps(){
  var G=UF_G,n=G.nodes.length,parent=[],cell=[],cur=[],redundant=null,name=function(k){return G.nodes[k].l;},
      M=new Lanes([{id:'in',kind:'row',label:'edges',idx:true},
        {id:'f',kind:'graph',label:'parent pointers',directed:true,nodes:G.nodes},
        {id:'par',kind:'row',label:'parent',cap:n,keys:G.nodes.map(function(x){return x.l;})}]),
      R=recorder(M),node=M.nodes('f'),edges=G.input.map(function(e){return M.push('in',name(e[0])+'–'+name(e[1]));});
  G.nodes.forEach(function(_,k){parent[k]=k;cell[k]=M.put('par',k,name(k));});
  R.rec('Find the edge that closes a cycle. Every node starts as its own set: its parent is itself, so it is its own root.',{hi:['lane:par'],done:true});
  function find(k){var path=[k];while(parent[k]!==k){k=parent[k];path.push(k);}return path;}
  G.input.forEach(function(e,i){
    grSettle(M,'f',cur);if(i&&edges[i-1].tone!=='bad')M.tone(edges[i-1],'dim');
    var a=find(e[0]),b=find(e[1]),ra=a[a.length-1],rb=b[b.length-1];
    M.tone(edges[i],'cur');M.mark('f','root '+name(e[0]),ra);M.mark('f','root '+name(e[1]),rb);
    var walk=function(p){return p.length>1?p.map(name).join(' → '):name(p[0])+' (a root already)';},
        note='Edge '+name(e[0])+'–'+name(e[1])+'. Follow parents to each root: '+walk(a)+', and '+walk(b)+'. ';
    if(ra===rb){redundant=i;M.tone(edges[i],'bad');
      if(!M.hasEdge('f',e[0],e[1])&&!M.hasEdge('f',e[1],e[0])){M.link('f',e[0],e[1]);M.edge('f',e[0],e[1],'bad');}
      R.rec(note+'Both reach '+name(ra)+': they are already connected, so this edge closes a cycle. It is the redundant one.',{hi:[laneHi(edges[i]),'root '+name(e[0]),'root '+name(e[1])]});}
    else{parent[ra]=rb;M.link('f',ra,rb);M.edge('f',ra,rb,'cur');cur.push([ra,rb,'idle']);M.set(cell[ra],name(rb));
      R.rec(note+'Different roots, so the edge joins two sets: point root '+name(ra)+' at root '+name(rb)+'.',{hi:[laneHi(edges[i]),laneHi(cell[ra]),'root '+name(e[0]),'root '+name(e[1])]});}
    Object.keys(M.lane('f').marks).forEach(function(nm){M.mark('f',nm,null);});
  });
  grSettle(M,'f',cur);M.tone(edges[G.input.length-1],redundant===G.input.length-1?'bad':'dim');
  /* reference: the last edge whose removal leaves n nodes connected by n - 1 edges, a tree */
  var want=null;
  for(var r=G.input.length-1;r>=0&&want===null;r--){
    var rest=G.input.filter(function(_,j){return j!==r;}),seen={0:1},stack=[0];
    while(stack.length){var x=stack.pop();rest.forEach(function(e){var y=e[0]===x?e[1]:(e[1]===x?e[0]:-1);if(y>=0&&!seen[y]){seen[y]=1;stack.push(y);}});}
    if(rest.length===n-1&&Object.keys(seen).length===n)want=r;}
  if(want!==redundant)throw new Error('union-find picked edge '+redundant+'; removing edge '+want+' is what leaves a tree');
  R.rec('Every edge read. Only '+G.input[redundant].map(name).join('–')+' joined two nodes that were already connected; without it the rest form a tree.',{hi:[laneHi(edges[redundant])],done:true});
  return R.steps;
}

/* a min-heap of (distance, node): distance is the value it orders by, the node its second line */
function grHeapIn(M,id,v,sub){var it=M.push(id,v,sub),i=M.lane(id).items.length-1;
  while(i>0){var p=(i-1)>>1,xs=M.lane(id).items;if(+xs[p].v<=+xs[i].v)break;M.swap(id,i,p);i=p;}return it;}
function grHeapOut(M,id){var n=M.lane(id).items.length;M.swap(id,0,n-1);var top=M.remove(id,n-1),i=0;
  for(;;){var xs=M.lane(id).items,l=2*i+1,r=l+1,b=i;n=xs.length;
    if(l<n&&+xs[l].v<+xs[b].v)b=l;if(r<n&&+xs[r].v<+xs[b].v)b=r;if(b===i)return top;M.swap(id,i,b);i=b;}}
var DIJ_G={nodes:[{x:0,d:1,l:'A'},{x:1,d:0,l:'B'},{x:1,d:2,l:'C'},{x:2,d:1,l:'D'},{x:3,d:2,l:'E'}],
  edges:[[0,1,4],[0,2,1],[1,2,2],[1,3,1],[2,3,5],[2,4,8],[3,4,3]]};
function dijkstraSteps(){
  var G=DIJ_G,dist=G.nodes.map(function(_,k){return k?Infinity:0;}),done={},via={},cur=[],byName={},
      M=new Lanes([{id:'g',kind:'graph',label:'weighted graph',nodes:G.nodes,edges:G.edges},{id:'pq',kind:'heap',label:'frontier'}]),
      R=recorder(M),node=M.nodes('g'),fmt=function(d){return d===Infinity?'∞':String(d);};
  G.nodes.forEach(function(x,k){byName[x.l]=k;M.set(node[k],undefined,'d '+fmt(dist[k]));});
  grHeapIn(M,'pq',0,'A');
  R.rec('Shortest distances from A. A is 0 and every other node ∞ until a path is found. The frontier is a min-heap of (distance, node).',{hi:['lane:pq'],done:true});
  while(M.size('pq')){
    grSettle(M,'g',cur);
    var top=grHeapOut(M,'pq'),u=byName[top.sub],d=+top.v;
    if(done[u]){M.mark('g','u',null);
      R.rec('Pop ('+d+', '+top.sub+'). '+top.sub+' was already settled at '+dist[u]+', so this entry went stale when a shorter path replaced it. Skip it.',{});continue;}
    done[u]=1;M.tone(node[u],'good');M.mark('g','u',u);
    var better=[],worse=[],hi=['u'];
    M.adj('g',u).forEach(function(e){var v=e.to,nd=d+e.w,x=G.nodes[v].l;if(done[v])return;M.edge('g',u,v,'cur');
      if(nd<dist[v]){if(via[v]!=null)M.edge('g',via[v],v,'seen');
        better.push(x+' '+fmt(dist[v])+' → '+nd);dist[v]=nd;via[v]=u;cur.push([u,v,'tree']);
        M.set(node[v],undefined,'d '+nd);M.tone(node[v],'cur');hi.push(laneHi(node[v]),laneHi(grHeapIn(M,'pq',nd,x)));}
      else{worse.push(x+' ('+d+' + '+e.w+' = '+nd+' is not below '+dist[v]+')');cur.push([u,v,'seen']);}});
    R.rec('Pop ('+d+', '+top.sub+'): the smallest distance left. Weights are never negative, so no path through a node still waiting can come back shorter: '+top.sub+' is settled. '+
      (better.length?'Its edges improve '+better.join(', ')+', and each new distance joins the frontier.':'')+(worse.length?(better.length?' ':'')+'No better way to '+worse.join(', ')+'.':'')+(!better.length&&!worse.length?'Every neighbour is already settled.':''),{hi:hi});
  }
  grSettle(M,'g',cur);M.mark('g','u',null);
  /* reference: Bellman-Ford, relaxing every edge both ways n - 1 times; it needs no heap and no order */
  var ref=G.nodes.map(function(_,k){return k?Infinity:0;});
  for(var r=1;r<G.nodes.length;r++)G.edges.forEach(function(e){ref[e[1]]=Math.min(ref[e[1]],ref[e[0]]+e[2]);ref[e[0]]=Math.min(ref[e[0]],ref[e[1]]+e[2]);});
  G.nodes.forEach(function(x,k){if(ref[k]!==dist[k])throw new Error('Dijkstra distance to '+x.l+' disagrees with Bellman-Ford');});
  R.rec('The frontier is empty. Distances from A: '+G.nodes.map(function(x,k){return x.l+' '+dist[k];}).join(', ')+'. The solid edges are the shortest-path tree.',{done:true});
  return R.steps;
}


/* call trees: the algorithm runs into a CallTrace and callTreeWalk records it, so no expected state is written
   by hand. Each demo checks its answer against a reference that shares none of its code. */
function ctList(a){return '['+a.join(',')+']';}
function subsetsSteps(){
  var nums=[1,2,3],n=nums.length,T=new CallTrace(),out=[],path=[];
  function dfs(i,note){
    var id=T.call(ctList(path),'i='+i,note,['subsets('+i+')','path='+ctList(path)]);
    if(i===n){out.push(path.slice());T.base(id,null,'<code>i = '+n+'</code>: every element has been decided, so <code>'+ctList(path)+'</code> is one whole subset. Record it and return.');return;}
    /* choose, explore, unchoose; then the branch that skips it */
    path.push(nums[i]);dfs(i+1,'Choose '+nums[i]+': the path becomes <code>'+ctList(path)+'</code>. Call the next decision, <code>i='+(i+1)+'</code>.');path.pop();
    dfs(i+1,'Skip '+nums[i]+': the path stays <code>'+ctList(path)+'</code>. Call the next decision, <code>i='+(i+1)+'</code>.');
    T.ret(id,null,'Both branches of <code>'+ctList(path)+'</code> at <code>i='+i+'</code> are explored, so it returns to its caller.');
  }
  dfs(0,null);
  var got=out.map(ctList).sort().join(),want=[];
  for(var m=0;m<1<<n;m++)want.push(ctList(nums.filter(function(_,b){return m>>b&1;})));
  if(got!==want.sort().join())throw new Error('the call tree collected '+got+' but the bitmask subsets of '+ctList(nums)+' are '+want.sort().join());
  return callTreeWalk(T,{label:'subsets of [1, 2, 3]',lanes:[{id:'out',kind:'row',label:'subsets found',idx:true}],
    on:function(e,node,M){if(e.ev==='base'){var it=M.push('out',node.v);return [laneHi(it)];}},
    fields:function(M){return [['found',M.size('out')]];},
    outro:'Every call has returned. The leaves are the '+out.length+' subsets, one for each way to answer "take it or skip it" three times: 2 × 2 × 2. The tree has '+T.nodes.length+' calls, which is 1 + 2 + 4 + 8.'});
}
function comboSteps(){
  var cands=[2,3,5],target=8,T=new CallTrace(),out=[],path=[];
  function dfs(start,rem,note){
    var id=T.call('rem='+rem,ctList(path),note,['combo('+start+', '+rem+')','path='+ctList(path)]);
    if(rem===0){out.push(path.slice());T.base(id,null,'The remainder is 0: <code>'+ctList(path)+'</code> adds up to '+target+'. Record it.');return;}
    for(var i=start;i<cands.length;i++){
      var c=cands[i];
      if(c>rem){T.prune('rem='+(rem-c),ctList(path.concat(c)),'Choosing '+c+' would leave <code>rem = '+(rem-c)+'</code>, below zero. The candidates are sorted, so every larger one overshoots too: cut this branch and stop the loop.');break;}
      path.push(c);dfs(i,rem-c,'Choose '+c+': the path becomes <code>'+ctList(path)+'</code> and the remainder <code>'+(rem-c)+'</code>. It may be chosen again, so the next call starts at the same candidate.');path.pop();
    }
    T.ret(id,null,'Every candidate from '+(start<cands.length?cands[start]:'the end')+' on has been tried at <code>rem='+rem+'</code>, so the call returns and its caller unchooses.');
  }
  dfs(0,target,null);
  /* reference: count the ways with a coin-change table, which never recurses on paths */
  var ways=[1];for(var s=1;s<=target;s++)ways[s]=0;
  cands.forEach(function(c){for(var s=c;s<=target;s++)ways[s]+=ways[s-c];});
  if(out.length!==ways[target])throw new Error('combination sum found '+out.length+' combinations; the table counts '+ways[target]);
  out.forEach(function(p){if(p.reduce(function(a,b){return a+b;},0)!==target)throw new Error(ctList(p)+' does not sum to '+target);});
  return callTreeWalk(T,{label:'combination sum, [2, 3, 5], target 8',lanes:[{id:'out',kind:'row',label:'combinations found',idx:true}],
    on:function(e,node,M){if(e.ev==='base'){var it=M.push('out',node.sub);return [laneHi(it)];}},
    fields:function(M){return [['found',M.size('out')]];},
    intro:'Find every way to reach 8 by adding 2s, 3s and 5s, reusing them freely. Each call picks the next number to add; a pick that overshoots is cut.',
    outro:'Every call has returned. '+out.length+' combinations reach 8, and the pruned calls are the picks that overshot. Without the cut, each of them would have been entered and would have gone on adding.'});
}

/* intervals: the algorithm runs and records into an IvTrace, so no state is written by hand, and each demo checks
   its answer against an implementation that shares none of its code, and the last picture against its answer. */
function ivPairs(a){return a.map(function(p){return '['+p[0]+','+p[1]+']';}).join(', ');}
/* reference for merge: fold in one interval at a time until no two blocks touch, comparing every pair. No sort. */
function ivMergeRef(input){
  var blocks=input.map(function(p){return [p[0],p[1]];}),again=true;
  while(again){again=false;
    for(var i=0;i<blocks.length&&!again;i++)for(var j=i+1;j<blocks.length&&!again;j++)
      if(blocks[i][0]<=blocks[j][1]&&blocks[j][0]<=blocks[i][1]){
        blocks[i]=[Math.min(blocks[i][0],blocks[j][0]),Math.max(blocks[i][1],blocks[j][1])];blocks.splice(j,1);again=true;}}
  return blocks.sort(function(a,b){return a[0]-b[0];});
}
/* reference for the rooms: the busiest instant is the start of some meeting, so count what is running at each start */
function ivRoomsRef(input){
  return Math.max.apply(null,input.map(function(p){
    return input.filter(function(q){return q[0]<=p[0]&&p[0]<q[1];}).length;}));
}
function ivFinal(T,answer,what){
  var last=ivState(T,T.events.length).order.map(function(b){return [b.lo,b.hi];});
  if(JSON.stringify(last)!==JSON.stringify(answer))throw new Error(what+': the last picture shows '+ivPairs(last)+' but the answer is '+ivPairs(answer));
}
function ivMergeSteps(){
  var input=[[1,3],[2,6],[8,10],[15,18]],
      T=new IvTrace(input,{label:'merge intervals',band:'a gap: no interval covers it',
        states:[['waiting',null,'not read yet'],['active','cur','the block being built'],['merged','good','a finished block of the answer']]}),
      iv=input.map(function(p,i){return {id:i,lo:p[0],hi:p[1]};}).sort(function(a,b){return a.lo-b.lo;}),out=[],gaps=0;
  T.step('Sort by start, so any interval that overlaps the block being built is the very next one. These are already in order, so every row stays where it is.',[T.sort('lo')]);
  var cur={id:iv[0].id,lo:iv[0].lo,hi:iv[0].hi};
  T.step('Start a block with the first interval, '+ivLabel(cur.lo,cur.hi)+'. Its end is the only thing the sweep has to remember.',
    [T.state(cur.id,'active'),T.mark('end',cur.hi),T.count('blocks done',0)],[cur.id,'end']);
  for(var i=1;i<iv.length;i++){
    var nx=iv[i];
    if(nx.lo<=cur.hi){
      var hi=Math.max(cur.hi,nx.hi);
      T.step(ivLabel(nx.lo,nx.hi)+' starts at '+nx.lo+', no later than the block\'s end '+cur.hi+', so they overlap. The two bars become one: '+ivLabel(cur.lo,hi)+
        (hi===cur.hi?' (the block already reached '+nx.hi+', so the end stays)':'; the end moves to '+hi)+'.',
        [T.merge(cur.id,nx.id),T.mark('end',hi)],[cur.id,nx.id,'end']);
      cur.hi=hi;
    }else{
      gaps++;out.push([cur.lo,cur.hi]);
      T.step(ivLabel(nx.lo,nx.hi)+' starts at '+nx.lo+', after the block\'s end '+cur.hi+': nothing covers '+cur.hi+' to '+nx.lo+', so the block '+ivLabel(cur.lo,cur.hi)+
        ' is final and '+ivLabel(nx.lo,nx.hi)+' begins the next.',
        [T.state(cur.id,'merged'),T.band('gap '+gaps,cur.hi,nx.lo),T.count('blocks done',out.length),T.state(nx.id,'active'),T.mark('end',nx.hi)],[cur.id,nx.id,'gap '+gaps,'end']);
      cur={id:nx.id,lo:nx.lo,hi:nx.hi};
    }
  }
  out.push([cur.lo,cur.hi]);
  T.step('No interval is left, so the last block is final too.',[T.state(cur.id,'merged'),T.mark('end',null),T.count('blocks done',out.length)],[cur.id,'blocks done']);
  var want=ivMergeRef(input);
  if(JSON.stringify(out)!==JSON.stringify(want))throw new Error('merge produced '+ivPairs(out)+'; pairwise folding gives '+ivPairs(want));
  ivFinal(T,out,'merge');
  var steps=ivWalk(T,{intro:'Merge overlapping intervals. Four bars share one axis, one to a row; touching or overlapping bars will become a single bar.',
    outro:'The answer is '+ivPairs(out)+'. Each step either widened the block or closed it, so the pass never looked back at an interval it had finished.'});
  steps.answer=out;return steps;
}
function ivRoomsSteps(){
  var input=[[0,30],[5,10],[15,20]],
      T=new IvTrace(input,{label:'meetings',
        states:[['waiting',null,'not started yet'],['running','cur','in progress at the sweep line'],['ended','dim','over, its room is free']]}),
      starts=input.map(function(p,i){return {t:p[0],id:i};}).sort(function(a,b){return a.t-b.t;}),
      ends=input.map(function(p,i){return {t:p[1],id:i};}).sort(function(a,b){return a.t-b.t;}),
      s=0,e=0,rooms=0,most=0;
  T.step('Split every meeting into two events, a start and an end, and sweep a line along the axis in time order. The line stops only at events. The counter is how many meetings are running at the line.',
    [T.mark('sweep',starts[0].t),T.count('rooms in use',0),T.count('most so far',0)],['sweep']);
  while(s<input.length){
    if(starts[s].t<ends[e].t){
      rooms++;most=Math.max(most,rooms);var st=starts[s++];
      T.step('At '+st.t+' meeting '+ivLabel(input[st.id][0],input[st.id][1])+' starts: one more room in use, '+rooms+' in all'+(rooms===most?(rooms>1?', the most so far':''):'')+'.',
        [T.mark('sweep',st.t),T.state(st.id,'running'),T.count('rooms in use',rooms),T.count('most so far',most)],[st.id,'sweep','rooms in use']);
    }else{
      rooms--;var en=ends[e++];
      T.step('At '+en.t+' meeting '+ivLabel(input[en.id][0],input[en.id][1])+' ends first, so its room is free again: '+rooms+' in use. A meeting that starts exactly when another ends can reuse its room, which is why an end wins a tie.',
        [T.mark('sweep',en.t),T.state(en.id,'ended'),T.count('rooms in use',rooms)],[en.id,'sweep','rooms in use']);
    }
  }
  var want=ivRoomsRef(input);
  if(most!==want)throw new Error('the sweep found '+most+' rooms; counting what runs at each start gives '+want);
  var steps=ivWalk(T,{intro:'Meeting Rooms II: the fewest rooms that hold every meeting. Three meetings on one axis; the answer is the most that are ever running at once.',
    outro:'Every start has been swept, so no later moment can hold more meetings than '+most+'. The answer is '+most+' rooms: the long meeting plus whichever short one is running.'});
  steps.answer=most;return steps;
}

/* tries: the algorithm walks a TrieTrace, which records each move, so no state is written by hand, and each
   demo checks its answers against an implementation that shares none of its code (a set of words, a regular
   expression, a search of the board per word). */
function trQ(s){return '<code>'+laneEsc(s)+'</code>';}
/* insert: follow the edge for each letter, making the ones that are missing, then set the flag */
function trInsert(T,w){
  for(var i=0;i<w.length;i++){var ch=w[i],k=T.child(ch),pre=trQ(w.slice(0,i+1));
    if(k<0)T.make(ch,'No edge '+trQ(ch)+' from '+trQ(JSON.stringify(w.slice(0,i)))+': make a node for '+pre+' and move into it.');
    else T.go(k,'The edge '+trQ(ch)+' is already there, so '+pre+' is shared: follow it.');}
  T.end(w,'Set the flag: '+trQ(w)+' is a stored word, and its node says so.');
}
/* walk a prefix; the last step's caption is given by the caller. -1 when a letter has no edge. */
function trWalk(T,w,last){
  for(var i=0;i<w.length;i++){var ch=w[i],k=T.child(ch);
    if(k<0){T.miss(ch,'No edge '+trQ(ch)+' from '+trQ(JSON.stringify(w.slice(0,i)))+', so no stored word starts with '+trQ(w.slice(0,i+1))+'.');return -1;}
    T.go(k,i===w.length-1&&last?last:'Follow '+trQ(ch)+'.');}
  return T.at;
}
function trieInsertSteps(){
  var T=new TrieTrace(),words=['card','cat'],stored={},got=[];
  words.forEach(function(w,j){if(j)T.reset('Back to the root for the next word, '+trQ(w)+'.');trInsert(T,w);stored[w]=1;});
  /* search reads the flag at the end of the walk; startsWith only needs the walk to survive */
  T.reset('Now search. '+trQ('search("car")')+' starts at the root.');
  var at=trWalk(T,'car','Every edge of '+trQ('car')+' exists, because '+trQ('card')+' needed them. But no word ends on this node: nothing ever set its flag, so search("car") is False.');
  got.push(['search','car',at>=0&&!!T.nodes[at].word]);
  T.reset(trQ('search("card")')+' starts at the root.');
  at=trWalk(T,'card');if(at>=0&&T.nodes[at].word)T.found('The walk survives and this node ends '+trQ('card')+': search("card") is True.');
  got.push(['search','card',at>=0&&!!T.nodes[at].word]);
  T.reset(trQ('startsWith("ca")')+' starts at the root.');
  at=trWalk(T,'ca');if(at>=0)T.found('The walk survives, and that is all a prefix query asks: startsWith("ca") is True, whatever the flag says.');
  got.push(['startsWith','ca',at>=0]);
  got.forEach(function(g){
    var want=g[0]==='search'?!!stored[g[1]]:Object.keys(stored).some(function(w){return w.indexOf(g[1])===0;});
    if(g[2]!==want)throw new Error(g[0]+'("'+g[1]+'") gave '+g[2]+'; the stored words say '+want);});
  var steps=trieWalk(T,{label:'trie of card, cat',
    intro:'Insert '+trQ('card')+' and '+trQ('cat')+', then query. An empty trie is only its root, the empty prefix "", and the cursor <code>node</code> starts there.',
    outro:'Two words, one shared spine: '+trQ('c → a')+' is stored once. A node on a walk is only a prefix; the word under a node is what makes it a stored word.'});
  steps.answer=got.map(function(g){return [g[0],g[1],g[2]];});steps.trace=T;return steps;
}
/* wildcard search: a dot tries every child, and a branch that fails is abandoned */
function trieWildSteps(){
  var T=new TrieTrace(),words=['bad','bat','cot'],pat='.ot';
  words.forEach(function(w,j){if(j)T.reset('Back to the root for '+trQ(w)+'.');trInsert(T,w);});
  T.reset('Search '+trQ(pat)+'. A dot matches any one letter, so at a dot the search must try every child in turn.');
  function dfs(i){
    if(i===pat.length){
      if(T.word()){T.found('The pattern is used up on a node that ends '+trQ(T.word())+': a match, so the search stops.');return true;}
      return false;}
    var ch=pat[i];
    if(ch==='.'){
      var kids=T.children();
      for(var j=0;j<kids.length;j++){
        T.go(kids[j],'A dot: try '+trQ(T.nodes[kids[j]].ch)+'.');
        if(dfs(i+1))return true;
        T.back(true,'Nothing under '+trQ(T.prefix())+' matches the rest of '+trQ(pat)+': abandon it and try the next child.');}
      return false;}
    var k=T.child(ch);
    if(k<0){T.miss(ch,'No edge '+trQ(ch)+' from '+trQ(T.prefix())+', so this branch cannot match.');return false;}
    T.go(k,'Follow '+trQ(ch)+'.');
    if(dfs(i+1))return true;
    T.back(true,'The rest of the pattern does not match below '+trQ(T.prefix())+'.');
    return false;
  }
  var ok=dfs(0),want=words.some(function(w){return new RegExp('^'+pat+'$').test(w);});
  if(ok!==want)throw new Error('wildcard search for '+pat+' gave '+ok+'; a regular expression over the words gives '+want);
  var steps=trieWalk(T,{label:'trie of bad, bat, cot',
    intro:'Store '+trQ('bad')+', '+trQ('bat')+' and '+trQ('cot')+', then search the pattern '+trQ(pat)+'.',
    outro:'The dot sent the search down '+trQ('b')+' first, where it died, and then down '+trQ('c')+', where it matched. Each branch tried costs a walk; a pattern of all dots tries every node.'});
  steps.answer=ok;steps.trace=T;return steps;
}
/* Word Search II: walk the board and the trie in lockstep; a found word is cleared so it is reported once,
   and a leaf with nothing left below it is removed so no later walk enters it */
var TR_BOARD=[['o','a'],['e','t']],TR_WORDS_B=['oat','ate','eat'];
function trBoardRef(board,w){
  var R=board.length,C=board[0].length;
  function go(r,c,i,seen){
    if(r<0||c<0||r>=R||c>=C||seen[r*C+c]||board[r][c]!==w[i])return false;
    if(i===w.length-1)return true;
    seen[r*C+c]=1;var ok=go(r+1,c,i+1,seen)||go(r-1,c,i+1,seen)||go(r,c+1,i+1,seen)||go(r,c-1,i+1,seen);seen[r*C+c]=0;return ok;}
  for(var r=0;r<R;r++)for(var c=0;c<C;c++)if(go(r,c,0,{}))return true;
  return false;
}
function trieBoardSteps(){
  var B=TR_BOARD,R=B.length,C=B[0].length,T=new TrieTrace(),found=[];
  TR_WORDS_B.forEach(function(w,j){if(j)T.reset('Back to the root for '+trQ(w)+'.');trInsert(T,w);});
  T.reset('Now walk the board. Start a walk at every cell whose letter is an edge from the root, and move to a neighbour only while the trie has an edge for its letter.');
  var seen={},D=[[-1,0],[0,1],[1,0],[0,-1]];
  function cell(r,c){return '('+r+', '+c+')';}
  function dfs(r,c){
    var k=T.child(B[r][c]);
    if(k<0){T.miss(B[r][c],'Cell '+cell(r,c)+' holds '+trQ(B[r][c])+', and there is no edge '+trQ(B[r][c])+' from '+trQ(JSON.stringify(T.prefix()))+': no word goes this way, so the walk does not step there.',{miss:r*C+c});return;}
    T.go(k,'Step onto '+cell(r,c)+': the board spells '+trQ(T.prefix()+B[r][c])+', and the trie has it.',{go:r*C+c});
    seen[r*C+c]=1;
    if(T.word()){var w=T.word();found.push(w);
      T.found('A word ends here: '+trQ(w)+' is on the board.',{found:w});
      T.unend('Clear the word, so a second path spelling '+trQ(w)+' is not reported again.');}
    for(var d=0;d<D.length&&T.children().length;d++){var nr=r+D[d][0],nc=c+D[d][1];
      if(nr<0||nc<0||nr>=R||nc>=C||seen[nr*C+nc])continue;dfs(nr,nc);}
    seen[r*C+c]=0;
    if(!T.children().length&&!T.word())T.drop('Nothing is left below '+trQ(T.prefix())+' and no word ends on it, so remove the node: no later walk will enter it.',{back:r*C+c});
    else T.back(false,'Every neighbour of '+cell(r,c)+' has been tried; step back.',{back:r*C+c});
  }
  for(var r=0;r<R;r++)for(var c=0;c<C;c++)dfs(r,c);
  var want=TR_WORDS_B.filter(function(w){return trBoardRef(B,w);});
  if(found.slice().sort().join()!==want.slice().sort().join())throw new Error('the lockstep walk found '+found.join(',')+'; searching the board per word finds '+want.join(','));
  var walk=[];
  var steps=trieWalk(T,{label:'trie of oat, ate, eat',
    lanes:[{id:'b',kind:'grid',label:'board',rows:R,cols:C},{id:'w',kind:'row',label:'words found',idx:true}],
    init:function(M){M.fill('b',B);},
    on:function(e,M){var d=e.data;if(!d)return;
      if(d.go!==undefined){walk.push(d.go);M.path('b','walk',walk);M.tone(M.lane('b').items[d.go],'cur');return [laneHi(M.lane('b').items[d.go])];}
      if(d.back!==undefined){walk.pop();M.path('b','walk',walk.length?walk:null);M.tone(M.lane('b').items[d.back],null);return [laneHi(M.lane('b').items[d.back])];}
      if(d.miss!==undefined)return [laneHi(M.lane('b').items[d.miss])];
      if(d.found!==undefined){var it=M.push('w',d.found);M.tone(it,'good');return [laneHi(it)];}},
    fields:function(M){return [['found',M.size('w')]];},
    intro:'Word Search II: which of '+trQ('oat')+', '+trQ('ate')+' and '+trQ('eat')+' can be spelled by a walk of neighbouring cells? Build the trie of the words first.',
    outro:'The board was walked once for all three words. '+trQ('eat')+' was never entered past '+trQ('e')+': the trie had no edge for any neighbour of the '+trQ('e')+' cell, so '+found.length+' of 3 words are on the board.'});
  steps.answer=found.slice();steps.trace=T;return steps;
}

/* cost plots: every count is taken by running the loop and counting where the work is, and each is held to an
   independent statement of it (plotCheck) before anything is drawn. Every number in a caption comes from those counts. */
function plDoubling(n){var c=0;for(var i=1;i<n;i*=2)c++;return c;}
function plNested(n){var c=0;for(var i=0;i<n;i++)for(var j=0;j<i;j++)c++;return c;}
function plLoopsSteps(){
  var d=[],q=[];for(var n=2;n<=64;n++){d.push([n,plDoubling(n)]);q.push([n,plNested(n)]);}
  /* independent: the doubling loop runs once per binary digit of n − 1; the nested loop is the triangular number */
  plotCheck(d,function(n){return (n-1).toString(2).length;},'doubling loop');
  plotCheck(q,function(n){return n*(n-1)/2;},'dependent nested loop');
  var T=new PlotTrace({x:{name:'n, the size of the input',short:'n',lo:0,hi:64,ticks:[0,16,32,48,64]},y:{name:'iterations',scale:'log',lo:1,hi:10000},
    series:[{id:'dbl',name:'doubling loop, counted',kind:'points',join:'step',tone:'info',data:d},
            {id:'lg',name:'log₂ n',kind:'curve',cls:'log',tone:'cur'},
            {id:'nest',name:'nested loop, counted',kind:'points',tone:'bad',data:q},
            {id:'sq',name:'n²',kind:'curve',cls:'n2',tone:'plain'}]});
  T.step('Run the doubling loop at n = 8 and count: i takes the values 1, 2 and 4, and 8 is not below 8, so it runs <b>'+plDoubling(8)+'</b> times.',[T.reveal('dbl',8),T.cursor(8)],['dbl']);
  T.step('Doubling n adds one iteration, never doubles the work: at n = 64 the loop runs <b>'+plDoubling(64)+'</b> times. Each count here is measured by running the loop.',[T.reveal('dbl'),T.cursor(64)],['dbl']);
  T.step('log₂ n is the number of doublings that reach n, so the count is log₂ n rounded up: the staircase sits on the curve at every power of two.',[T.reveal('lg')],['lg']);
  T.step('The dependent nested loop runs 0 + 1 + ⋯ + (n − 1) times: <b>'+plotFmt(plNested(16))+'</b> at n = 16.',[T.reveal('nest',16),T.cursor(16)],['nest']);
  T.step('At n = 64 it is <b>'+plotFmt(plNested(64))+'</b>, exactly 64 · 63 / 2. Every count was measured, and every one matched n(n − 1)/2.',[T.reveal('nest'),T.cursor(64)],['nest']);
  T.step('n² runs parallel to it on a log scale: the loop does half of n², a constant factor, so it grows the same way. That is O(n²).',[T.reveal('sq')],['sq']);
  return plotWalk(T,{intro:'Iterations of two loops, counted by running them, against the curves that name their growth.',
    inv:[['nested ≤ n²','the dependent loop never runs more than n² times',function(s){return s.plot.cursor===null||plNested(s.plot.cursor)<=s.plot.cursor*s.plot.cursor;}]]});
}
/* a dynamic array that doubles when full, starting at capacity 1: the cost of an append is its write plus every copy */
function plAppends(m){
  var cap=1,size=0,total=0,cost=[],tot=[];
  for(var i=1;i<=m;i++){var c=1;if(size===cap){c+=size;cap*=2;}size++;total+=c;cost.push([i,c]);tot.push([i,total]);}
  return {cost:cost,tot:tot};
}
function plAppendSteps(){
  var r=plAppends(32);
  /* independent: an append resizes exactly when the count before it is a power of two; the copies before append i
     sum to the powers of two below it, 2^(⌊log₂(i − 1)⌋ + 1) − 1 */
  plotCheck(r.cost,function(i){return i>1&&((i-1)&(i-2))===0?i:1;},'append cost');
  plotCheck(r.tot,function(i){return i===1?1:i+Math.pow(2,Math.floor(Math.log2(i-1))+1)-1;},'running total');
  var at=function(i){return r.cost[i-1][1];},sum=function(i){return r.tot[i-1][1];};
  var T=new PlotTrace({x:{name:'append number',short:'append',lo:0,hi:32,ticks:[0,8,16,24,32]},y:{name:'work (writes and copies)'},
    series:[{id:'cost',name:'this append',kind:'bars',tone:'cur',data:r.cost},
            {id:'tot',name:'all appends so far',kind:'points',tone:'info',data:r.tot},
            {id:'lim',name:'3n',kind:'curve',of:function(n){return 3*n;},tone:'good'}]});
  T.step('Append 1 writes into the free slot: work <b>'+at(1)+'</b>. Append 2 finds the array full, copies 1 value into a new array twice the size, then writes: work <b>'+at(2)+'</b>.',[T.reveal('cost',2),T.cursor(2)],['cost']);
  T.step('Append 5 finds 4 values in a full array of 4: it copies all 4 and writes, work <b>'+at(5)+'</b>. The appends between cost 1 each.',[T.reveal('cost',5),T.cursor(5)],['cost']);
  T.step('The spikes come at appends 2, 3, 5, 9, 17: each twice as far apart as the last, and each as big as the array it copies. Append 17 costs <b>'+at(17)+'</b>.',[T.reveal('cost',17),T.cursor(17)],['cost']);
  T.step('Add them up as they come. After 9 appends the total is <b>'+sum(9)+'</b>, and after 32 it is <b>'+sum(32)+'</b>.',[T.reveal('cost'),T.reveal('tot'),T.cursor(32)],['tot']);
  T.step('The total never crosses 3n: 32 appends cost '+sum(32)+', under '+3*32+'. Spread over the appends, that is under 3 each: O(1) amortized.',[T.reveal('lim')],['lim']);
  return plotWalk(T,{intro:'The work of each append to an array that doubles when it is full, measured by running it.',
    inv:[['total ≤ 3n','the work of the first n appends is at most 3n',function(s){var c=s.plot.cursor;return c===null||sum(c)<=3*c;}]]});
}
/* the largest n a cost fits in, found by running the cost function: double until it is too big, then halve the gap */
function plReach(f,budget){
  var lo=1,hi=2;while(f(hi)<=budget)hi*=2;
  while(hi-lo>1){var mid=Math.floor((lo+hi)/2);if(f(mid)<=budget)lo=mid;else hi=mid;}
  return lo;
}
function plHardwareSteps(){
  var lin=function(n){return n;},sq=function(n){return n*n;},ex=function(n){return Math.pow(2,n);},b0=1e6,b1=1e8;
  var r0=[plReach(lin,b0),plReach(sq,b0),plReach(ex,b0)],r1=[plReach(lin,b1),plReach(sq,b1),plReach(ex,b1)];
  /* independent: the inverse of each cost, worked out directly */
  [[b0,r0],[b1,r1]].forEach(function(p){var b=p[0],r=p[1];
    if(r[0]!==b||r[1]!==Math.floor(Math.sqrt(b))||r[2]!==Math.floor(Math.log2(b)))throw new Error('reach under '+b+': '+r.join(', '));});
  var T=new PlotTrace({x:{name:'n, the size of the input',short:'n',scale:'log',lo:1,hi:1e9},y:{name:'operations',scale:'log',lo:1,hi:1e10},
    series:[{id:'lin',name:'n',kind:'curve',cls:'n',tone:'good'},{id:'sq',name:'n²',kind:'curve',cls:'n2',tone:'cur'},{id:'ex',name:'2ⁿ',kind:'curve',cls:'exp',tone:'bad'}]});
  T.step('Three algorithms: n, n² and 2ⁿ operations on an input of size n. Both axes are logarithmic, so each step right or up is ten times more.',[T.reveal('lin'),T.reveal('sq'),T.reveal('ex')]);
  T.step('A machine that does 10⁶ operations in the time allowed. Each algorithm reaches the largest n whose cost fits under that line.',
    [T.level('budget',b0),T.at('n reaches',r0[0]),T.at('n² reaches',r0[1]),T.at('2ⁿ reaches',r0[2])],['budget']);
  T.step('A machine 100 times faster. The linear algorithm now handles <b>'+(r1[0]/r0[0])+'</b> times more, the quadratic one <b>'+(r1[1]/r0[1])+'</b> times more, and the exponential one <b>'+(r1[2]-r0[2])+'</b> more elements.',
    [T.level('budget',b1),T.at('n reaches',r1[0]),T.at('n² reaches',r1[1]),T.at('2ⁿ reaches',r1[2])],['n reaches','n² reaches','2ⁿ reaches']);
  return plotWalk(T,{intro:'How far a faster machine gets you depends on the shape of the cost, not on the machine.'});
}

/* ---------- residue rings (kit/rings.js) ---------- */
/* residue rings: where each value lands is counted by walking it one cell at a time from 0, wrapping at the ends and
   counting every pass over 0, which shares no arithmetic with the kit's floor division. Each walkthrough holds every
   snapshot to it, and every number in a caption comes from it. JavaScript's answers are % run on this page; the kit
   test runs Python on every Python answer shown. */
function rgSim(a,m){
  var cell=0,turns=0,d=a<0?-1:1;
  for(var i=0;i<Math.abs(a);i++){cell+=d;if(cell===m){cell=0;turns++;}else if(cell<0){cell=m-1;turns--;}}
  return {cell:cell,turns:turns};
}
function rgWalked(s){var r=s.ring;return r.rows.every(function(x){if(!x.on)return true;var w=rgSim(r.at[x.id],r.T.m);return x.cell===w.cell&&x.turns===w.turns;});}
var RG_COUNTED=[['counted','each cell matches walking one cell at a time from 0',rgWalked]];
function rgClockSteps(){
  var m=5,a=rgSim(8,m),b=rgSim(-7,m),fix=((-7%m)+m)%m;
  if(a.cell!==b.cell||fix!==b.cell)throw new Error('8 and −7 on a 5-ring: '+a.cell+', '+b.cell+', fix '+fix);
  var T=new RingTrace({m:m,name:'slot',langs:true,tokens:[{id:'p',name:'walks 8',tone:'cur'},{id:'n',name:'walks −7',tone:'info'}]});
  T.step('A carousel of '+m+' slots. Both values start at slot 0, where every walk is counted from.',[T.put('p',0),T.put('n',0)]);
  T.step('Walk 8 forward: '+a.turns+' whole turn back to 0, then '+a.cell+' more. 8 = '+a.turns+' × '+m+' + '+a.cell+', so it lands on slot <b>'+a.cell+'</b>.',[T.walk('p',8)],['p']);
  T.step('Walk 7 backward: past 0 '+(-b.turns)+' times, so '+b.turns+' turns, and on to slot <b>'+b.cell+'</b>. −7 = '+b.turns+' × '+m+' + '+b.cell+': a different number, the same slot.',[T.walk('n',-7)],['n']);
  return ringWalk(T,{intro:'Where 8 and −7 land on a 5-slot carousel.',
    outro:'Python\'s <code>-7 % 5</code> is the slot, '+b.cell+'. JavaScript\'s is <b>'+rgNum(-7%m)+'</b>, which is not a slot; <code>((-7 % 5) + 5) % 5</code> shifts it back to '+fix+'.',inv:RG_COUNTED});
}
function rgWrapSteps(){
  var m=5,last=rgSim(5,m),back=rgSim(-1,m);
  var T=new RingTrace({m:m,name:'index',langs:true,tokens:[{id:'i',name:'next index',tone:'info'},{id:'j',name:'previous index',tone:'bad'}]});
  T.step('A ring buffer of '+m+' cells. The write index stands at 3.',[T.put('i',3)],['i']);
  T.step('<code>(i + 1) % 5</code>: one step forward, to index '+rgSim(4,m).cell+', the last cell.',[T.walk('i',1)],['i']);
  T.step('One more step forward is 5, and <code>5 % 5</code> is <b>'+last.cell+'</b>: the index falls off the end and comes back at the start.',[T.walk('i',1)],['i']);
  T.step('Now step back from index 0: <code>(i - 1) % 5</code>. Walking one cell back from 0 lands on <b>'+back.cell+'</b>, the last cell. Python says '+back.cell+'; JavaScript says <b>'+rgNum(-1%m)+'</b>, an index that does not exist.',[T.put('j',0),T.walk('j',-1)],['j']);
  return ringWalk(T,{intro:'Wrap-around indexing: stepping off either end of a ring buffer.',inv:RG_COUNTED});
}
function rgHashSteps(){
  var m=7,keys=[15,22,40,-8],ids=['a','b','c','d'],land=keys.map(function(k){return rgSim(k,m).cell;});
  if(land[0]!==land[1])throw new Error('15 and 22 should share a bucket of 7');
  var T=new RingTrace({m:m,name:'bucket',langs:true,tokens:keys.map(function(k,i){return {id:ids[i],name:'key '+rgNum(k)};})});
  T.step('A table of '+m+' buckets. Each key goes to bucket <code>key % 7</code>: walk it from 0.',ids.map(function(id){return T.put(id,0);}));
  T.step('Key 15 is '+rgSim(15,m).turns+' turns and '+land[0]+' more: bucket <b>'+land[0]+'</b>.',[T.walk('a',15)],['a']);
  T.step('Key 22 is '+rgSim(22,m).turns+' turns and '+land[1]+' more: bucket <b>'+land[1]+'</b> as well. Two keys share a bucket, a collision.',[T.walk('b',22),T.count('collisions',1)],['b']);
  T.step('Key 40 goes round '+rgSim(40,m).turns+' times and lands in bucket <b>'+land[2]+'</b>. The ring glides through '+RG_LAPS+' turns; the readout keeps the true count.',[T.walk('c',40)],['c']);
  T.step('Key −8 walks backward to bucket <b>'+land[3]+'</b>. In JavaScript, <code>-8 % 7</code> is <b>'+rgNum(-8%m)+'</b>, which is no bucket at all: hash a negative key with the shifted remainder.',[T.walk('d',-8)],['d']);
  return ringWalk(T,{intro:'Reducing keys to buckets with % 7.',inv:RG_COUNTED});
}

/* ---------- pointer lists (kit/lists.js ptrSnap): nodes at authored places, pointers that move ---------- */
function plReverseSteps(){
  var ns=ptrRow([1,2,3,4]),prev=null,curr=ns[0],nxt,steps=[];
  function rec(note,hi,done){var tags={prev:prev,curr:curr};if(nxt!==undefined)tags.nxt=nxt;
    steps.push(ptrSnap(note,{nodes:ns,head:prev||curr,tags:tags,above:[],nil:{prev:'left'},hi:hi||[],done:done}));}
  rec('Reverse 1 → 2 → 3 → 4 in place. <code>prev</code> is null, the reversed part, still empty; <code>curr</code> is 1, the head of the part not yet touched.',[],true);
  while(curr!==null){
    nxt=curr.next;rec('Save the lifeline: <code>nxt = curr.next</code>, '+(nxt?nxt.value:'null')+'. The flip is about to overwrite the only pointer to it.',['nxt']);
    curr.next=prev;rec('Flip: <code>curr.next = prev</code>. '+curr.value+' now points at '+(prev?prev.value:'null')+'.',['next:'+curr.id]);
    prev=curr;curr=nxt;nxt=undefined;
    rec('March: <code>prev = curr</code>, <code>curr = nxt</code>. The reversed part is '+ptrText(prev)+'; '+(curr?'the rest starts at '+curr.value+'.':'nothing is left.'),['prev','curr'],true);
  }
  rec('<code>curr</code> is null, so every node is flipped. Return <code>prev</code>: '+ptrText(prev)+'.',[],true);
  var got=[];for(var c=prev;c;c=c.next)got.push(c.value);
  if(got.join()!=='4,3,2,1')throw new Error('pointer reversal gave '+got.join());
  return steps;
}
/* Floyd on a rho: 1 → 2 → 3 → 4 → 5 → 6, and 6 links back to 3. The loop is laid out as a box over two rows. */
function plFloydSteps(){
  var ns=ptrRow([1,2,3,4]),tail=[5,6].map(function(v){return mkNode(v);});
  tail[0].x=3;tail[0].y=1;tail[1].x=2;tail[1].y=1;ns[3].next=tail[0];tail[0].next=tail[1];tail[1].next=ns[2];ns=ns.concat(tail);
  var slow=ns[0],fast=ns[0],k=0,steps=[];
  function rec(note,hi,done){steps.push(ptrSnap(note,{nodes:ns,head:ns[0],tags:{slow:slow,fast:fast},above:[],hi:hi||[],done:done,data:{slow:k,fast:2*k}}));}
  rec('1 → 2 → 3 → 4 → 5 → 6, and 6 links back to 3: a cycle. <code>slow</code> and <code>fast</code> both start at the head.',[],true);
  while(fast&&fast.next){
    slow=slow.next;fast=fast.next.next;k++;
    var met=slow===fast;
    rec('<code>slow</code> moves one node, to '+slow.value+'; <code>fast</code> moves two, to '+fast.value+'.'+(met?' They meet: the list has a cycle.':''),['slow','fast'],true);
    if(met)break;
  }
  if(slow!==fast||k!==4)throw new Error('Floyd on the rho met after '+k+' steps');
  return steps;
}
var PL_REV=[['two parts','prev heads the reversed part, which ends at null; curr heads the untouched rest; together they hold every node once']],
    PL_FLOYD=[['fast = 2 × slow','fast has taken twice as many steps as slow']];
var PL_OPTS={
  inv:function(s){return 'slow' in s.tags?PL_FLOYD:PL_REV;},
  check:function(s){
    if('slow' in s.tags)return [s.data.fast===2*s.data.slow];
    var a=snapWalk(s,s.tags.prev),b=snapWalk(s,s.tags.curr),all={};
    a.ids.concat(b.ids).forEach(function(id){all[id]=1;});
    return [a.ends&&b.ends&&Object.keys(all).length===a.ids.length+b.ids.length&&a.ids.length+b.ids.length===s.nodes.length];},
  fields:function(s,hiF,val){return Object.keys(s.tags).map(function(k){var id=s.tags[k];return '<span'+hiF(k)+'>'+k+' <b>'+(id===null?'null':val(id))+'</b></span>';}).join('');}
};

mountLesson();
new LanePlayer($('#stackw .lvhost'),{id:'stk',loop:true,autoplay:true,inv:[['size matches','size equals the number of items',sizeOk('s')]]}).load(stackSteps());
mountLaneTabs($('#qtabs'),[{name:'Queue from two stacks',steps:twoStackSteps},{name:'Deque',steps:dequeSteps},{name:'Ring buffer',steps:ringSteps}],{id:'q'});
new LanePlayer($('#frames .lvhost'),{id:'fr',loop:true,autoplay:true}).load(frameSteps());
new LanePlayer($('#mono .lvhost'),{id:'mono',loop:true,autoplay:true}).load(monoSteps());
mountLaneTabs($('#atabs'),[{name:'Reverse in place',steps:reverseSteps},{name:'Sliding window',steps:windowSteps},{name:'Resize',steps:resizeSteps},{name:'Count letters',steps:countSteps}],{id:'a'});
mountLaneTabs($('#gtabs'),[{name:'Spiral order',steps:spiralSteps},{name:'Transpose',steps:transposeSteps},{name:'Number of islands',steps:islandsSteps}],{id:'g'});
new LanePlayer($('#prefix .lvhost'),{id:'pfx',loop:true,autoplay:true,inv:[['prefix holds','every filled prefix cell equals the sum of its block',prefixHolds]]}).load(prefixSteps());
mountLaneTabs($('#ttabs'),[{name:'Chaining',steps:chainingSteps},{name:'Resize',steps:resizeChainSteps},{name:'LCS table',steps:lcsSteps}],{id:'t'});
mountLaneTabs($('#htabs'),[{name:'Push and pop',steps:pushPopSteps},{name:'Heapify',steps:heapifySteps},{name:'Top k',steps:topKSteps}],
  {id:'h',inv:[['heap holds','every parent dominates both children',heapInv]]});
mountLaneTabs($('#grtabs'),[{name:'Breadth-first search',steps:bfsSteps},{name:'Topological sort',steps:kahnSteps},{name:'Union-find',steps:unionFindSteps},{name:'Dijkstra',steps:dijkstraSteps}],
  {id:'gr',inv:[['heap holds','every parent in the frontier is no larger than its children',heapInv]]});
mountCallTreeTabs($('#cttabs'),[{name:'Subsets',steps:subsetsSteps},{name:'Combination sum',steps:comboSteps}],{id:'ct'});
mountIvTabs($('#ivtabs'),[{name:'Merge intervals',steps:ivMergeSteps},{name:'Meeting rooms II',steps:ivRoomsSteps}],{id:'iv'});
mountTrieTabs($('#trtabs'),[{name:'Insert and search',steps:trieInsertSteps},{name:'Wildcard search',steps:trieWildSteps},{name:'Word Search II',steps:trieBoardSteps}],{id:'tr'});
mountPlayerTabs($('#ptrtabs'),[{name:'Reverse in place',steps:plReverseSteps},{name:'A cycle, by Floyd',steps:plFloydSteps}],function(h,o){return new ListPlayer(h,Object.assign(o,PL_OPTS));},{id:'ptr'});
mountPlotTabs($('#pltabs'),[{name:'Loops',steps:plLoopsSteps},{name:'Amortized appends',steps:plAppendSteps},{name:'Growth beats hardware',steps:plHardwareSteps}],{id:'pl'});
mountRingTabs($('#rgtabs'),[{name:'8 and −7',steps:rgClockSteps},{name:'Wrap-around',steps:rgWrapSteps},{name:'Hash buckets',steps:rgHashSteps}],{id:'rg'});
