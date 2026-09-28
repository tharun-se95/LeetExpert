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

mountLesson();
new LanePlayer($('#stackw .lvhost'),{id:'stk',loop:true,autoplay:true,inv:[['size matches','size equals the number of items',sizeOk('s')]]}).load(stackSteps());
mountLaneTabs($('#qtabs'),[{name:'Queue from two stacks',steps:twoStackSteps},{name:'Deque',steps:dequeSteps},{name:'Ring buffer',steps:ringSteps}],{id:'q'});
new LanePlayer($('#frames .lvhost'),{id:'fr',loop:true,autoplay:true}).load(frameSteps());
new LanePlayer($('#mono .lvhost'),{id:'mono',loop:true,autoplay:true}).load(monoSteps());
mountLaneTabs($('#atabs'),[{name:'Reverse in place',steps:reverseSteps},{name:'Sliding window',steps:windowSteps},{name:'Resize',steps:resizeSteps},{name:'Count letters',steps:countSteps}],{id:'a'});
mountLaneTabs($('#gtabs'),[{name:'Spiral order',steps:spiralSteps},{name:'Transpose',steps:transposeSteps},{name:'Number of islands',steps:islandsSteps}],{id:'g'});
new LanePlayer($('#prefix .lvhost'),{id:'pfx',loop:true,autoplay:true,inv:[['prefix holds','every filled prefix cell equals the sum of its block',prefixHolds]]}).load(prefixSteps());
mountLaneTabs($('#ttabs'),[{name:'Chaining',steps:chainingSteps},{name:'Resize',steps:resizeChainSteps},{name:'LCS table',steps:lcsSteps}],{id:'t'});
