/* The Grid Underneath: an overview of the Matrix module through eight systems (#25).
   Rebuilt on the kit from the standalone page it began as: content is data (SYS below) rendered by
   one function; every scene is produced by running the algorithm, and every scene checks itself
   against an independent answer while the page loads. The code each system shows is executed by
   check.py in Python and TypeScript. */

/* ---------- the algorithms, as the scenes run them, and the independent answers they are held to ---------- */
function flatAt(r,c,C){return r*C+c;}
function windowMean(g,r,c){var s=0,n=0;for(var i=Math.max(0,r-1);i<=Math.min(g.length-1,r+1);i++)for(var j=Math.max(0,c-1);j<=Math.min(g[0].length-1,c+1);j++){s+=g[i][j];n++;}return Math.floor(s/n);}
function unionIslands(g){ // union-find over hot cells: a different method from the flood fill it checks
  var R=g.length,C=g[0].length,par={},find=function(x){while(par[x]!==x){par[x]=par[par[x]];x=par[x];}return x;};
  for(var r=0;r<R;r++)for(var c=0;c<C;c++)if(g[r][c])par[r*C+c]=r*C+c;
  for(var k in par){var r2=Math.floor(k/C),c2=k%C;if(r2+1<R&&g[r2+1][c2])par[find(k)]=find((r2+1)*C+c2);if(c2+1<C&&g[r2][c2+1])par[find(k)]=find(r2*C+c2+1);}
  var roots={};for(var q in par)roots[find(q)]=1;return Object.keys(roots).length;
}
function peelSpiral(g){ // take the top row, turn the rest a quarter, repeat
  var m=g.map(function(r){return r.slice();}),out=[];
  while(m.length){out=out.concat(m.shift());if(!m.length)break;var t=[];for(var c=m[0].length-1;c>=0;c--)t.push(m.map(function(r){return r[c];}));m=t;}
  return out;
}

/* 1. framebuffer: the same grid read in row order and in column order, against a toy cache */
function sceneFramebuffer(){
  var R=4,C=8,N=R*C,LINE=4,CAP=2;
  function walk(order){
    var cache=[],miss=0;
    return order.map(function(off){
      var line=Math.floor(off/LINE),ix=cache.indexOf(line),hit=ix>=0;
      if(hit)cache.splice(ix,1);else{miss++;if(cache.length>=CAP)cache.shift();}
      cache.push(line);
      return {off:off,hit:hit,miss:miss};
    });
  }
  var rowO=mk(N,function(i){return i;}),colO=[];
  for(var c=0;c<C;c++)for(var r=0;r<R;r++)colO.push(flatAt(r,c,C));
  var A=walk(rowO),B=walk(colO),frames=[];
  // row order loads each line once; column order reads 4 lines per column with room for 2, so every read misses
  if(A[N-1].miss!==N/LINE||B[N-1].miss!==N)throw new Error('framebuffer scene check failed');
  function side(W,k,strip){
    var seen={};
    for(var j=0;j<=k;j++)seen[W[j].off]=W[j];
    return mk(N,function(off){
      var s=seen[off];
      if(!s)return {k:'idle',t:strip?'':String(off)};
      var isCur=W[k].off===off;
      return {k:isCur?(s.hit?'done':'cur'):(s.hit?'acc':'warn'),t:strip?'':String(off)};
    });
  }
  for(var k=0;k<N;k++){
    var a=A[k],b=B[k];
    frames.push({b:{gA:side(A,k,false),sA:side(A,k,true),gB:side(B,k,false),sB:side(B,k,true)},
      note:'Read '+(k+1)+'. The row loop reads offset '+a.off+': '+(a.hit?'its cache line is already loaded, a hit.':'a new cache line, a miss.')+' The column loop reads offset '+b.off+': '+(b.hit?'a hit.':'a miss: the line it needs was evicted, or never loaded.'),
      stats:[['row loop misses',a.miss],['column loop misses',b.miss]],ev:b.hit?null:'bad'});
  }
  return {frames:frames,step:.22,poster:N-1,loop:true,
    boards:[{id:'gA',rows:R,cols:C,g:0,label:'for r: for c: (row order)'},{id:'sA',rows:1,cols:N,g:0,strip:1,label:'memory, a gap after every cache line'},
            {id:'gB',rows:R,cols:C,g:1,label:'for c: for r: (column order)'},{id:'sB',rows:1,cols:N,g:1,strip:1,label:'the same memory, read out of order'}],
    meta:{rowMiss:A[N-1].miss,colMiss:B[N-1].miss},label:'Two loops over the same 4 × 8 grid, with a cache that holds 2 lines of 4'};
}

/* 2. sorted pages: binary search on the flat index, read back as (page, slot) */
function scenePages(){
  var R=5,C=6,N=R*C,keys=mk(N,function(i){return 3+i*4+(i%3);});
  for(var q=1;q<N;q++)if(keys[q]<=keys[q-1])throw new Error('pages scene: keys not sorted');
  var target=keys[8],lo=0,hi=N-1,probes=0,frames=[],at=-1;
  function cells(lo,hi,mid,found,strip){return mk(N,function(i){var kind=i<lo||i>hi?'dim':'win';if(i===mid)kind=found?'done':'cur';return {k:kind,t:strip?'':String(keys[i])};});}
  frames.push({b:{g:cells(0,N-1,-1,false,false),st:cells(0,N-1,-1,false,true)},note:'Five pages of six sorted keys. Find '+target+'. Read left to right, top to bottom, they are one sorted array of '+N+' keys.',stats:[['target',target],['probes',0]]});
  while(lo<=hi){
    var mid=Math.floor((lo+hi)/2),v=keys[mid];probes++;
    var rr=Math.floor(mid/C),cc=mid%C,ok=v===target;
    frames.push({b:{g:cells(lo,hi,mid,ok,false),st:cells(lo,hi,mid,ok,true)},
      note:'mid = ('+lo+' + '+hi+') // 2 = '+mid+', which is page '+rr+', slot '+cc+' ('+mid+' // '+C+' and '+mid+' % '+C+'). Key '+v+(ok?' is '+target+': found.':(v<target?' is below '+target+', so drop the lower half.':' is above '+target+', so drop the upper half.')),
      stats:[['target',target],['probes',probes],['keys left',hi-lo+1]],ev:ok?'key':null});
    if(ok){at=mid;break;}
    if(v<target)lo=mid+1;else hi=mid-1;
  }
  if(at!==keys.indexOf(target)||probes>Math.ceil(Math.log2(N+1)))throw new Error('pages scene check failed');
  return {frames:frames,step:1.1,poster:frames.length-1,loop:true,boards:[{id:'g',rows:R,cols:C,g:0,label:'5 pages × 6 slots',cap:48},{id:'st',rows:1,cols:N,g:0,strip:1,label:'the same keys as one flat array'}],
    meta:{probes:probes,N:N},label:'Binary search on the flat index, read back as (page, slot)'};
}

/* 3. filter: a 3 × 3 mean with one bounds check */
function sceneFilter(){
  var R=5,C=6,img=[[0,0,9,9,0,0],[0,0,9,9,0,0],[9,9,9,9,9,9],[0,0,9,9,0,0],[0,0,9,9,0,0]];
  var DIRS=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  var inn=mk(R*C,function(i){var v=img[Math.floor(i/C)][i%C];return {k:'idle',s:v/9,t:String(v)};});
  var out=mk(R*C,function(){return {k:'dim',t:''};});
  var frames=[{b:{'in':cp(inn),out:cp(out)},note:'A plus sign, brightness 0 to 9. Each output pixel will be the mean of its 3 × 3 window, rounded down.',stats:[['pixels done',0]]}];
  var done=0;
  for(var r=0;r<R;r++)for(var c=0;c<C;c++){
    var sum=img[r][c],n=1,valid=0;
    DIRS.forEach(function(d){var nr=r+d[0],nc=c+d[1];if(nr>=0&&nr<R&&nc>=0&&nc<C){sum+=img[nr][nc];n++;valid++;}});
    var val=Math.floor(sum/n);
    if(val!==windowMean(img,r,c))throw new Error('filter scene check failed');
    var i=r*C+c,ib=cp(inn);ib[i]={k:'cur',t:String(img[r][c])};
    var ob=cp(out);ob[i]={k:'cur',t:String(val)};
    out[i]={k:'idle',s:val/9,t:String(val)};
    done++;
    var edge=valid<8?' The other '+(8-valid)+' fall off the edge, so the bounds check skips them.':'';
    frames.push({b:{'in':ib,out:ob},ov:{'in':{r0:Math.max(0,r-1),c0:Math.max(0,c-1),r1:Math.min(R-1,r+1),c1:Math.min(C-1,c+1)}},
      note:'Pixel ('+r+', '+c+'): '+valid+' of its 8 neighbours are inside the image.'+edge+' The mean of '+n+' values is '+sum+' / '+n+', rounded down to '+val+'.',
      stats:[['neighbours in bounds',valid+' / 8'],['pixels done',done]],ev:valid<8?null:'key'});
  }
  frames.push({b:{'in':cp(inn),out:cp(out)},note:'Every pixel visited once. The plus has softened at its edges, and the border pixels averaged fewer neighbours.',stats:[['pixels done',done]]});
  return {frames:frames,step:.26,poster:frames.length-1,loop:true,
    boards:[{id:'in',rows:R,cols:C,g:0,label:'input image'},{id:'out',rows:R,cols:C,g:1,label:'blurred output'}],
    meta:{},label:'A 3 × 3 mean filter sliding across a 5 × 6 image'};
}

/* 4. alerts: flood fill from each unvisited hot cell, in the order the shown code visits them */
function sceneAlerts(){
  var G=['1100001110','1100100110','0001100000','0000001001','1000011101','1100001000','0000000000'].map(function(s){return s.split('').map(Number);});
  var R=G.length,C=G[0].length,COL=['acc','done','viol','warn'],g=G.map(function(r){return r.slice();});
  var st=mk(R*C,function(i){return {k:G[Math.floor(i/C)][i%C]?'bad':'idle',t:''};});
  var land=0;G.forEach(function(row){row.forEach(function(v){land+=v;});});
  var frames=[],count=0,kind='acc',first=false,prev=-1;
  frames.push({b:{g:cp(st)},note:'A thermal map of a server floor. The hot cells are racks over their temperature limit, and each one would page someone on its own.',stats:[['hot racks',land],['incidents',0]]});
  function sink(r,c){
    if(r<0||r>=R||c<0||c>=C||g[r][c]!==1)return;
    g[r][c]=2;
    if(prev>=0)st[prev]={k:kind,t:''};
    var i=r*C+c;st[i]={k:'cur',t:''};prev=i;
    frames.push({b:{g:cp(st)},note:first?'Hot and not yet visited at ('+r+', '+c+'): incident '+count+' starts here, in a shade of its own. Mark it, then sink every hot neighbour.':'('+r+', '+c+') touches the region, so it joins incident '+count+'.',
      stats:[['hot racks',land],['incidents',count]],ev:first?'key':null});
    first=false;
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){sink(r+d[0],c+d[1]);});
  }
  for(var r=0;r<R;r++)for(var c=0;c<C;c++)if(g[r][c]===1){count++;kind=COL[(count-1)%COL.length];first=true;sink(r,c);}
  if(prev>=0)st[prev]={k:kind,t:''};
  if(count!==unionIslands(G))throw new Error('alerts scene check failed');
  frames.push({b:{g:cp(st)},note:'Scan finished: '+land+' hot racks are '+count+' incidents. Each cell was visited once, so the cost grows with the grid, O(m · n).',stats:[['hot racks',land],['incidents',count]],ev:'key'});
  return {frames:frames,step:.2,poster:frames.length-1,loop:true,legend:[['bad','hot, not yet grouped'],['cur','visiting now']],boards:[{id:'g',rows:R,cols:C,g:0,label:'rack temperature map, 7 × 10'}],meta:{land:land,count:count},label:'A flood fill grouping hot racks into incidents'};
}

/* 5. camera: transpose, then reverse each row, inside one grid */
function sceneCamera(){
  var n=4,m=mk(n,function(r){return mk(n,function(c){return r*n+c+1;});}),orig=m.map(function(r){return r.slice();});
  var toCells=function(cur){var out=[];for(var r=0;r<n;r++)for(var c=0;c<n;c++){var v=m[r][c];out.push({k:cur&&cur.some(function(p){return p[0]===r&&p[1]===c;})?'cur':'idle',s:cur&&cur.some(function(p){return p[0]===r&&p[1]===c;})?undefined:(v-1)/(n*n-1),t:String(v)});}return out;};
  var frames=[{b:{g:toCells()},note:'A 4 × 4 image. Each tile keeps its number, and its shade runs from 1 to 16, so you can follow where every tile lands.',stats:[['swaps',0],['extra memory','none yet']]}];
  var swaps=0,tswaps=0,fswaps=0;
  function sw(a,b,c,d,txt){var t=m[a][b];m[a][b]=m[c][d];m[c][d]=t;swaps++;frames.push({b:{g:toCells([[a,b],[c,d]])},note:txt,stats:[['swaps',swaps],['extra memory','1 temporary value']],ev:'key'});}
  for(var i=0;i<n;i++)for(var j=i+1;j<n;j++){sw(i,j,j,i,'Transpose: swap ('+i+', '+j+') with ('+j+', '+i+'), reflecting across the main diagonal.');tswaps++;}
  for(var r=0;r<n;r++)for(var j2=0;j2<n/2;j2++){sw(r,j2,r,n-1-j2,'Reverse row '+r+': swap column '+j2+' with column '+(n-1-j2)+'. A transpose followed by a flip of every row is a quarter turn clockwise.');fswaps++;}
  for(var a=0;a<n;a++)for(var b=0;b<n;b++)if(m[a][b]!==orig[n-1-b][a])throw new Error('camera scene check failed');
  frames.push({b:{g:toCells()},note:'Turned 90° clockwise with '+swaps+' swaps and one temporary value. Tile 1 went from the top-left corner to the top-right, and tile 13 from the bottom-left to the top-left.',stats:[['swaps',swaps],['extra memory','1 temporary value']]});
  return {frames:frames,step:.3,poster:frames.length-1,loop:true,boards:[{id:'g',rows:n,cols:n,g:0,label:'one grid, no second buffer',cap:64}],meta:{swaps:swaps,tswaps:tswaps,fswaps:fswaps},label:'Transpose, then reverse each row, all inside one grid'};
}

/* 6. mask: flags on the border, the interior from them, the border last */
function sceneMask(){
  var R=5,C=6,M0=[[4,7,0,2,9,3],[5,3,8,6,0,1],[2,9,4,7,5,8],[6,0,3,1,4,2],[8,5,7,3,6,9]],m=M0.map(function(r){return r.slice();});
  var origZero={};m.forEach(function(row,i){row.forEach(function(v,j){if(v===0)origZero[i*C+j]=1;});});
  var marker={},zeros=function(){var n=0;m.forEach(function(r){r.forEach(function(v){if(v===0)n++;});});return n;};
  function cells(cur,win,active){return mk(R*C,function(i){
    var r=Math.floor(i/C),c=i%C,v=m[r][c],kind='idle';
    if(v===0)kind=(marker[i]&&active)?'warn':'bad';
    else if(win&&win(r,c))kind='win';
    if(cur&&cur[0]===r&&cur[1]===c)kind='cur';
    return {k:kind,t:String(v)};});}
  var frames=[],push=function(cur,win,active,note,ev){frames.push({b:{g:cells(cur,win,active)},note:note,stats:[['extra memory','2 flags'],['zeros',zeros()]],ev:ev||null});};
  var zs=[];M0.forEach(function(row,i){row.forEach(function(v,j){if(v===0)zs.push('('+i+', '+j+')');});});
  push(null,null,true,zs.length+' zeros: '+zs.join(', ')+'. Each must wipe its whole row and column, but a zero written too early would look like a real one.');
  var firstRow=m[0].some(function(v){return v===0;}),firstCol=m.some(function(r){return r[0]===0;});
  push(null,function(r){return r===0;},true,'Before the border holds any flags, note its own zeros: row 0 has one, so first_row_zero = '+firstRow+'; column 0 has none, so first_col_zero = '+firstCol+'.');
  for(var i=1;i<R;i++)for(var j=1;j<C;j++){
    var hit=m[i][j]===0;
    if(hit){m[i][0]=0;m[0][j]=0;if(!origZero[i*C])marker[i*C]=1;if(!origZero[j])marker[j]=1;}
    push([i,j],null,true,hit?'Zero at ('+i+', '+j+'). Flag its row on the left border and its column on the top one. Gold cells are flags, not zeros from the data.':'('+i+', '+j+') is '+m[i][j]+'. Nothing to flag.',hit?'key':null);
  }
  for(var i2=1;i2<R;i2++){
    var wiped=[];
    for(var j2=1;j2<C;j2++)if(m[i2][0]===0||m[0][j2]===0){if(m[i2][j2]!==0)wiped.push(j2);m[i2][j2]=0;}
    push(null,function(r){return r===i2;},true,'Row '+i2+': the border flags say '+(wiped.length?'column'+(wiped.length>1?'s ':' ')+wiped.join(', ')+' become'+(wiped.length>1?'':'s')+' zero':'nothing new changes')+'. Interior first, border last, or the flags would be wiped before they were read.');
  }
  if(firstRow)for(var jj=0;jj<C;jj++)m[0][jj]=0;
  if(firstCol)for(var ii=0;ii<R;ii++)m[ii][0]=0;
  var rows={},cols={};M0.forEach(function(row,a){row.forEach(function(v,b){if(v===0){rows[a]=1;cols[b]=1;}});});
  for(var a=0;a<R;a++)for(var b=0;b<C;b++)if(m[a][b]!==((rows[a]||cols[b])?0:M0[a][b]))throw new Error('mask scene check failed');
  frames.push({b:{g:cells(null,null,false)},note:'The border last: first_row_zero is '+firstRow+', so row 0 is zeroed now, after its flags have been read.',stats:[['extra memory','2 flags'],['zeros',zeros()]],ev:'key'});
  return {frames:frames,step:.16,poster:frames.length-1,loop:true,boards:[{id:'g',rows:R,cols:C,g:0,label:'telemetry: 5 servers × 6 metrics'}],meta:{R:R,C:C},label:'Zeroing rows and columns, with the first row and column as flags'};
}

/* 7. cnc: a spiral tracked by four shrinking bounds */
function sceneCnc(){
  var R=5,C=6,top=0,bot=R-1,left=0,right=C-1,order=[];
  function add(r,c,dir){order.push({r:r,c:c,dir:dir,b:[top,bot,left,right]});}
  while(top<=bot&&left<=right){
    for(var j=left;j<=right;j++)add(top,j,'top row, left to right');
    for(var i=top+1;i<=bot;i++)add(i,right,'right column, downward');
    if(top<bot)for(var j2=right-1;j2>=left;j2--)add(bot,j2,'bottom row, right to left');
    if(left<right)for(var i2=bot-1;i2>top;i2--)add(i2,left,'left column, upward');
    top++;bot--;left++;right--;
  }
  var ids=mk(R,function(r){return mk(C,function(c){return r*C+c;});});
  if(order.map(function(o){return o.r*C+o.c;}).join()!==peelSpiral(ids).join())throw new Error('cnc scene check failed');
  var vis=mk(R*C,function(){return 0;}),frames=[{b:{g:mk(R*C,function(){return {k:'idle',t:''};})},ov:{g:{r0:0,c0:0,r1:R-1,c1:C-1,cls:'bounds'}},note:'Four integers describe the untouched rectangle: top, bottom, left and right. Walk its edge, then shrink it.',stats:[['visited',0],['bounds','0 · 4 · 0 · 5']]}];
  order.forEach(function(o,k){
    vis[o.r*C+o.c]=k+1;
    var cells=mk(R*C,function(i){var v=vis[i];return v?{k:i===o.r*C+o.c?'cur':'acc',t:String(v)}:{k:'idle',t:''};}),b=o.b;
    frames.push({b:{g:cells},ov:{g:{r0:b[0],c0:b[2],r1:b[1],c1:b[3],cls:'bounds'}},note:'Cell '+(k+1)+' of '+order.length+'. The untouched rectangle spans rows '+b[0]+' to '+b[1]+' and columns '+b[2]+' to '+b[3]+', and the walk is on its '+o.dir+'.',
      stats:[['visited',k+1],['bounds',b.join(' · ')]]});
  });
  return {frames:frames,step:.17,poster:frames.length-1,loop:true,boards:[{id:'g',rows:R,cols:C,g:0,label:'tool path, cell by cell'}],meta:{cells:order.length},label:'A spiral over a 5 × 6 grid, tracked by four shrinking bounds'};
}

/* 8. route: depth-first search that marks while it walks and un-marks on the way out */
function sceneRoute(){
  var G=['ORX'.split(''),'TOR'.split('')],R=G.length,C=G[0].length,W='ROTOR';
  var DIRS=[[-1,0],[0,1],[1,0],[0,-1]],path=[],frames=[],back=0,firstFail=null;
  function cells(cur,badc,done){return mk(R*C,function(i){var r=Math.floor(i/C),c=i%C,kind='idle';
    if(path.some(function(p){return p[0]===r&&p[1]===c;}))kind=done?'done':'acc';
    if(cur&&cur[0]===r&&cur[1]===c)kind=badc?'bad':(done?'done':'cur');
    return {k:kind,t:G[r][c]};});}
  var emit=function(cur,badc,done,note,ev){frames.push({b:{g:cells(cur,badc,done)},note:note,stats:[['path',path.length+' of '+W.length],['backtracks',back]],ev:ev||null});};
  emit(null,false,false,'Spell '+W+' moving up, right, down or left, never reusing a cell. The scan tries each R in turn as a start.');
  function dfs(r,c,k){
    if(r<0||r>=R||c<0||c>=C||G[r][c]!==W[k]||path.some(function(p){return p[0]===r&&p[1]===c;}))return false;
    path.push([r,c]);
    if(k===W.length-1){emit([r,c],false,true,'\''+W[k]+'\' at ('+r+', '+c+') ends the word. Found, using cells the first try had marked and then released.','key');return true;}
    emit([r,c],false,false,'\''+W[k]+'\' matches at ('+r+', '+c+'). Mark it as on the path and look for \''+W[k+1]+'\' next.');
    for(var d=0;d<4;d++)if(dfs(r+DIRS[d][0],c+DIRS[d][1],k+1))return true;
    back++;if(!firstFail)firstFail=path.slice();
    emit([r,c],true,false,'No free neighbour of ('+r+', '+c+') is \''+W[k+1]+'\'. Dead end.','bad');
    path.pop();
    emit(null,false,false,'Backtrack: un-mark ('+r+', '+c+') so a later try can use it.');
    return false;
  }
  var found=false;
  scan:for(var r=0;r<R;r++)for(var c=0;c<C;c++)if(G[r][c]===W[0]&&dfs(r,c,0)){found=true;break scan;}
  // the route found reuses a cell the failed try had marked: without the un-mark it would be missing
  var reused=path.some(function(p){return firstFail.some(function(q){return q[0]===p[0]&&q[1]===p[1];});});
  var spelled=path.map(function(p){return G[p[0]][p[1]];}).join('')===W&&path.every(function(p,i){return !i||Math.abs(p[0]-path[i-1][0])+Math.abs(p[1]-path[i-1][1])===1;});
  if(!found||!spelled||!reused)throw new Error('route scene check failed');
  return {frames:frames,step:.85,poster:frames.length-1,loop:true,boards:[{id:'g',rows:R,cols:C,g:0,label:'spell ROTOR: up, right, down, left',cap:64}],meta:{back:back,len:W.length},label:'A depth-first search that marks cells while it walks and un-marks them on retreat'};
}

/* ---------- content ---------- */
var SYS={
 framebuffer:{lesson:'Grid Representation & Coordinates',kick:'GPU memory · image libraries',title:'Your screen is one long array',scene:sceneFramebuffer,
  story:'A 1080p frame is not a table of pixels. It is one run of bytes, and pixel (x, y) is found by arithmetic: skip y whole rows, then walk x pixels into the row. Image libraries, video decoders and GPU texture uploads all do that multiplication.',
  when:'<b>You have met this</b> when a nested loop over an image got several times slower after you swapped the loop order. The work is identical. Only the order of the memory it touches changed.',
  seen:['GPU textures','OpenCV and NumPy strides','Video frames','Screenshots'],
  facts:function(m){return [{v:1920*1080*4,l:'bytes in one 1080p RGBA frame (1920 × 1080 × 4)'},{v:m.colMiss/m.rowMiss,l:'times as many cache misses for the column loop in the scene ('+m.colMiss+' against '+m.rowMiss+')'},{v:64/4,l:'RGBA pixels in one 64-byte cache line: a miss loads 16 row-mates'}];},
  code:'framebuffer',watch:'Using the width as the length of a row. Real buffers often pad each row, so the stride the API reports is wider than the width. Multiplying by the width reads the wrong pixels from the second row on, and nothing crashes.'},
 pages:{lesson:'Search a 2D Matrix',kick:'databases · storage engines',title:'A sorted grid is one sorted array',scene:scenePages,
  story:'Storage engines keep sorted keys in pages. If every row is sorted and each row starts above where the last one ended, the pages are a single sorted array folded into rows. Binary search the flat positions, then convert with divide and remainder.',
  when:'<b>You have met this</b> as an index lookup that did not scan the table. Real engines usually search the page boundaries first and then inside the page. Flattening does the same job as one search, with one line of arithmetic.',
  seen:['B-tree leaf pages','SSTable block indexes','Sorted lookup tables'],
  facts:function(m){return [{v:Math.ceil(Math.log2(1e6+1)),l:'probes at most to find one key among 1,000,000'},{v:m.probes,l:'probes in this scene, for '+m.N+' keys'},{v:1,l:'line of arithmetic: row = mid ÷ C, column = mid mod C'}];},
  code:'pages',watch:'Dividing by the row count, mid // R, where the column count belongs. On a square grid the two are equal and every test passes; on any other shape the search reads the wrong key, or a row that is not there.'},
 filter:{lesson:'Direction Vectors & Bounds',kick:'cameras · computer vision',title:'Every blur reads eight neighbours',scene:sceneFilter,
  story:'Blur, sharpen and edge detection compute each output pixel from the pixels around it. The clean way to write that is a list of direction vectors and one bounds check, so the corners and edges never read outside the image.',
  when:'<b>You have met this</b> as the off-by-one that crashed on the first or last row, or the dark border around a filtered image. The window hung off the edge, and something had to decide what was there.',
  seen:['Photo filters','Edge detection in driver assistance','Convolutions in CNNs','Game of Life'],
  facts:function(){return [{v:4000*3000*8,l:'neighbour reads to blur one 12-megapixel photo (4000 × 3000 × 8)'},{v:8,l:'neighbours for an interior pixel; 5 on an edge, 3 in a corner'},{v:8,l:'direction vectors in the whole technique'}];},
  code:'filter',watch:'Checking only the far edges, nr < R and nc < C. In Python a negative index quietly wraps to the other side of the grid, so the top row and left column average in pixels from the bottom and right: a wrong number and no error. JavaScript reads a row that is not there and throws.'},
 alerts:{lesson:'Number of Islands',kick:'observability · imagery',title:function(m){return m.land+' alerts are really '+m.count+' incidents';},scene:sceneAlerts,
  story:'Grid-shaped data keeps asking the same question: how many separate regions are there? A thermal map of a server floor, a satellite land mask and a microscope slide all reduce to counting connected cells. Flood fill answers it in one pass.',
  when:'<b>You have met this</b> at 3 a.m., when one cooling fault paged you once per rack. Grouping neighbouring hot cells turns the storm into a handful of things a person can act on.',
  seen:['Paint-bucket fill','Satellite land and water masks','Cell counting in microscopy','Heatmap alert grouping'],
  facts:function(m){return [{v:m.land,l:'hot racks: one page each if every cell alerts alone'},{v:m.count,l:'connected regions the flood fill finds'},{v:1,l:'visit per cell, so the cost grows with the grid, O(m · n)'}];},
  code:'alerts',watch:'Marking a cell visited after exploring its neighbours instead of before. Each neighbour steps straight back into it, the recursion never ends, and Python raises RecursionError (JavaScript, RangeError).'},
 camera:{lesson:'In-Place Transformations · Rotate Image',kick:'phones · embedded imaging',title:'Turn a photo without a second buffer',scene:sceneCamera,
  story:'Rotating an image by 90° usually means allocating a second one. In place, it is two mechanical steps: reflect across the diagonal (transpose), then reverse every row. No new grid, one temporary value.',
  when:'<b>You have met this</b> when a phone photo appeared sideways. Cameras store the sensor\'s orientation, and something has to either flag it or physically turn the pixels. When memory is tight, turning them in place is the option that fits.',
  seen:['Phone camera orientation','Tile-based image rotation','Matrix transpose in numeric libraries'],
  facts:function(m){return [{v:4000*3000*4,l:'bytes a copy would cost for a 12 MP RGBA photo (4000 × 3000 × 4)'},{v:m.swaps,l:'swaps to turn the 4 × 4 grid: '+m.tswaps+' to transpose, '+m.fswaps+' to flip the rows'},{v:1,l:'temporary value of extra memory'}];},
  code:'camera',watch:'Starting the inner loop at 0 instead of i + 1. Every pair is swapped twice, so the transpose undoes itself and only the row flips remain: the photo comes out mirrored, not turned.'},
 mask:{lesson:'Set Matrix Zeroes',kick:'data pipelines · telemetry',title:'Use the border as your scratch paper',scene:sceneMask,
  story:'When one cell is bad, its entire row and column go with it. The trap is writing zeros as you scan: fresh zeros look like real ones and spread further. The fix is to keep the flags inside the grid, in its own first row and first column.',
  when:'<b>You have met this</b> as the NaN that poisons a whole row of a feature matrix. The pattern is the same: find the bad cells first, act on their rows and columns second, and never confuse a flag with data.',
  seen:['NaN masks in feature matrices','Spreadsheet cleaning','Row and column invalidation in sensor grids'],
  facts:function(){return [{v:2,l:'flag variables replace two arrays of m + n booleans'},{v:10000+10000,l:'flags saved on a 10,000 × 10,000 grid'},{v:2,l:'passes over the grid: the cost is still O(m · n)'}];},
  code:'mask',watch:'Zeroing the first row or column before the second pass. Once row 0 is all zeros, every column reads as flagged, and the pass wipes columns that never held a zero.'},
 cnc:{lesson:'Traversal Orders · Spiral Matrix',kick:'manufacturing · displays',title:'Spiral in, with four numbers of state',scene:sceneCnc,
  story:'A spiral order looks hard to track until you notice the untouched region is always a rectangle. Keep its four edges (top, bottom, left, right), walk the outer ring, shrink the edges, and repeat until they cross.',
  when:'<b>You have met this</b> wherever something has to cover an area from the outside in: a milling tool clearing a pocket, an LED matrix boot animation, a reveal effect that spirals toward the centre.',
  seen:['CNC pocket clearing','LED matrix animations','Progressive reveal effects'],
  facts:function(m){return [{v:m.cells,l:'cells visited on a 5 × 6 grid, each exactly once'},{v:4,l:'integers of state, however large the grid is'},{v:1,l:'pass: O(m · n) time with O(1) extra space'}];},
  code:'cnc',watch:'Dropping the two if checks. When one row or one column is left, the walk turns back over cells it has just emitted, and the output repeats them.'},
 route:{lesson:'Word Search',kick:'EDA · puzzles · robotics',title:'Try a path, mark it, back out cleanly',scene:sceneRoute,
  story:'Searching a grid for a path means committing to a cell, exploring from it, and undoing the commitment if nothing works. Marking a cell as used while you are on it, and un-marking it on the way out, is what keeps one attempt from spoiling the next.',
  when:'<b>You have met this</b> in maze and puzzle solvers, and in the grid routers that lay wires on chips and circuit boards. Classic maze routing uses a breadth-first wave on the same kind of grid, with the same used-cell marks.',
  seen:['Chip and PCB autorouters','Boggle and crossword solvers','Robot path search'],
  facts:function(m){return [{v:m.back,l:'dead ends backed out of before the route is found'},{v:m.len,l:'letters, so the search never goes deeper than '+m.len+' cells'},{v:1,l:'board, reused as its own visited set'}];},
  code:'route',watch:'Forgetting to un-mark on the way out. A cell used by a failed attempt stays blocked, and a route that exists is reported missing. It only happens when the word repeats a letter, as ROTOR does: with distinct letters a cell can only ever sit at one place in a path, so a test on ROUTE never catches it.'}
};
/* Each system's mark (the index tile) and its spot drawing (beside its heading). Both are decoration:
   the title carries the meaning. The marks are The Grid Underneath's own. */
var GI_ICON={framebuffer:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><path d="M7 8h2M11 8h2M15 8h2M7 12h2M11 12h2"/>',
  pages:'<path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  filter:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16"/>',
  alerts:'<rect x="4" y="3" width="16" height="5" rx="1.2"/><rect x="4" y="9.5" width="16" height="5" rx="1.2"/><rect x="4" y="16" width="16" height="5" rx="1.2"/><path d="M7 5.5h.01M7 12h.01M7 18.5h.01M11 5.5h5M11 12h5M11 18.5h5"/>',
  camera:'<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.5 3.5v5h-5"/><rect x="9" y="8" width="6" height="8" rx="1.4"/>',
  mask:'<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17"/><path d="M10.4 10.4l3.2 3.2M13.6 10.4l-3.2 3.2"/>',
  cnc:'<path d="M12 12h2.2v-2.2H9.8v4.4h6.6V7.6H7.6v8.8H18.6V5.4H5.4v13.2h15.2"/>',
  route:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3"/><path d="M9 15h3v-3h3V9"/>'};
function giIcon(id){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+GI_ICON[id]+'</svg>';}
function vigSvg(id){
  var o='',r,c,i;
  if(id==='framebuffer'){o='<rect class="st" x="14" y="8" width="118" height="74" rx="7"/>';for(r=0;r<5;r++)for(c=0;c<8;c++)o+='<rect class="'+(r===2&&c===3?'fc':'fa')+'" x="'+(22+c*13.5)+'" y="'+(16+r*13)+'" width="10" height="10" rx="2"/>';
    o+='<path class="st" d="M57 88v8M40 96h34"/>';for(i=0;i<16;i++)o+='<rect class="'+(i===7?'fc':'fa')+'" x="'+(150+(i%4)*22)+'" y="'+(20+Math.floor(i/4)*20)+'" width="18" height="14" rx="2"/>';
    o+='<path class="sc" d="M74 42C110 42 120 60 168 68"/>';}
  if(id==='pages'){for(var p=0;p<3;p++)o+='<rect class="st fp" x="'+(24+p*8)+'" y="'+(10+p*8)+'" width="120" height="64" rx="6"/>';
    for(r=0;r<5;r++)o+='<rect class="'+(r===2?'fc':'fa')+'" x="46" y="'+(34+r*10)+'" width="'+(r===2?96:78)+'" height="6" rx="3"/>';
    o+='<circle class="st" cx="196" cy="54" r="22"/><path class="st" d="M212 70l16 18"/>';}
  if(id==='filter'){for(r=0;r<3;r++)for(c=0;c<3;c++)o+='<rect class="'+(r===1&&c===1?'fc':'fa')+'" x="'+(24+c*26)+'" y="'+(14+r*26)+'" width="22" height="22" rx="4"/>';
    o+='<rect class="st" x="20" y="10" width="82" height="82" rx="8" stroke-dasharray="4 4"/><path class="st" d="M114 51h34M140 44l8 7-8 7"/><rect class="fk" x="160" y="29" width="44" height="44" rx="8"/>';}
  if(id==='alerts'){for(var u=0;u<3;u++){o+='<rect class="st fp" x="24" y="'+(10+u*30)+'" width="130" height="24" rx="4"/>';for(var l=0;l<10;l++){var hot=(u===1&&l>=6&&l<9)||(u===2&&l===7)||(u===0&&l===8);o+='<circle class="'+(hot?'fr':'fg')+'" cx="'+(38+l*11.5)+'" cy="'+(22+u*30)+'" r="3.4"/>';}}
    o+='<path class="st" d="M174 20v70M168 90h12"/>';}
  if(id==='camera'){o='<rect class="st" x="44" y="6" width="58" height="92" rx="10"/>';for(r=0;r<4;r++)for(c=0;c<2;c++)o+='<rect class="'+(r===0&&c===0?'fc':'fa')+'" x="'+(53+c*22)+'" y="'+(16+r*18)+'" width="18" height="14" rx="2.5"/>';
    o+='<path class="sc" d="M124 34a34 34 0 1 1-2 40"/><path class="sc" d="M116 30l8 4-4 8"/><rect class="st" x="170" y="30" width="60" height="44" rx="8" transform="rotate(90 200 52)"/>';}
  if(id==='mask'){for(r=0;r<5;r++)for(c=0;c<6;c++){var hot2=r===2||c===3;o+='<rect class="'+(r===2&&c===3?'fr':(hot2?'fa':'fp st'))+'" x="'+(24+c*30)+'" y="'+(8+r*19)+'" width="26" height="15" rx="3"/>';}}
  if(id==='cnc'){var pts=[[110,56]],x=110,y=56,d=[[1,0],[0,1],[-1,0],[0,-1]],len=8;for(var s=0;s<11;s++){var dd=d[s%4];x+=dd[0]*len;y+=dd[1]*len;pts.push([x,y]);if(s%2===1)len+=8;}
    o='<rect class="st" x="30" y="6" width="160" height="100" rx="8"/><path class="sc" d="M'+pts.map(function(q){return q[0]+' '+q[1];}).join('L')+'"/><circle class="fk" cx="'+pts[pts.length-1][0]+'" cy="'+pts[pts.length-1][1]+'" r="6"/>';}
  if(id==='route'){o='<rect class="st" x="20" y="6" width="190" height="102" rx="8"/>';
    [[44,30],[44,84],[100,30],[100,84],[166,30],[166,84],[100,57]].forEach(function(p,k){o+='<circle class="'+(k===0||k===5?'fk':'fa')+'" cx="'+p[0]+'" cy="'+p[1]+'" r="7"/>';});
    o+='<path class="sc" d="M44 30H86V57H166V77"/>';}
  return '<svg class="vig" viewBox="0 0 240 112" aria-hidden="true" focusable="false">'+o+'</svg>';
}
var ORDER=['framebuffer','pages','filter','alerts','camera','mask','cnc','route'];

/* ---------- rendering ---------- */
function renderSystem(host,id,n){
  var s=SYS[id],def=s.scene(),sec=el('div','sys'),title=typeof s.title==='function'?s.title(def.meta):s.title;sec.id='sys-'+id;
  sec.innerHTML='<div class="sys-head"><div><div class="sys-kick"><span class="sys-n">'+n+'</span>'+s.lesson+' · '+s.kick+'</div><h3>'+title+'</h3></div>'+vigSvg(id)+'</div>';
  var duo=el('div','duo'),text=el('div','duo-text'),scene=el('div','duo-scene');
  text.appendChild(el('p','',s.story));text.appendChild(el('p','sys-when',s.when));
  text.appendChild(el('div','seen',s.seen.map(function(x){return '<span>'+x+'</span>';}).join('')));
  mountFacts(text,s.facts(def.meta));
  text.appendChild(codeBlock(CODE[s.code].py,CODE[s.code].ts,title));
  var w=el('div','callout warn');w.innerHTML='<div class="cl"><svg class="i"><use href="#i-warn"/></svg>Watch out</div><p>'+s.watch+'</p>';
  w.appendChild(codeBlock(CODE[s.code+'_mistake'].py,CODE[s.code+'_mistake'].ts,'The mistake'));
  text.appendChild(w);
  var wid=el('div','widget navy');wid.innerHTML='<div class="wl">'+def.label+'</div>'+playerHtml('p-'+id,def.label);
  scene.appendChild(wid);duo.appendChild(text);duo.appendChild(scene);sec.appendChild(duo);host.appendChild(sec);
  if(def.legend)stateKey(wid,def.legend,wid.querySelector('.player'));
  var sc=new Scene(def,wid.querySelector('.player'));onRepaint(function(){sc.refresh();});
  inView(wid,function(){sc.start();});
  return title;
}

/* The index is itself a matrix: 2 rows of 4, so tile (r, c) sits at offset r × 4 + c. */
function mountIndex(titles){
  var host=$('#giIndex'),tiles='';
  ORDER.forEach(function(id,k){tiles+='<a class="gi-tile" href="#sys-'+id+'" data-k="'+k+'"><span class="gi-rc">('+Math.floor(k/4)+', '+(k%4)+')</span><span class="gi-ic">'+giIcon(id)+'</span><b>'+titles[id]+'</b></a>';});
  host.innerHTML='<div class="gi-tiles">'+tiles+'</div><div class="gi-read"><span>This index is a 2 × 4 matrix</span><span id="giRead"></span></div>';
  var read=$('#giRead'),els=host.querySelectorAll('.gi-tile'),cur=0,held=false;
  function on(k){cur=k;els.forEach(function(e,j){e.dataset.on=j===k?'1':'0';});read.innerHTML='offset = <b>'+Math.floor(k/4)+'</b> × 4 + <b>'+(k%4)+'</b> = <b>'+flatAt(Math.floor(k/4),k%4,4)+'</b>';}
  els.forEach(function(e,k){e.addEventListener('mouseenter',function(){held=true;on(k);});e.addEventListener('focus',function(){held=true;on(k);});
    e.addEventListener('mouseleave',function(){held=false;});e.addEventListener('blur',function(){held=false;});});
  on(0);
  if(!reduce)setInterval(function(){if(!held&&document.visibilityState==='visible')on((cur+1)%ORDER.length);},2200);
}

(function(){
  readPal();
  var n=0,titles={};
  document.querySelectorAll('.sysgroup').forEach(function(g){g.dataset.s.split(',').forEach(function(id){titles[id]=renderSystem(g,id,++n);});});
  mountIndex(titles);
  mountVariants($('#shapes'),[
    ['Do neighbours matter?','direction vectors','Write the neighbours as a list of offsets and check the bounds once. Photo filters, alert regions and chip routing all start from the same eight or four offsets.'],
    ['Can you afford a second grid?','in place','If not, order the writes so nothing is overwritten before it is read: swap across the diagonal, or borrow the border as scratch space. Camera pipelines and data masking both do.'],
    ['Are the rows sorted end to end?','flatten','Then the grid is one sorted array folded into rows. Binary search the flat index, and turn it back into (row, column) with divide and remainder.'],
    ['Does the problem fix the order of the visit?','bounds and marks','A spiral keeps four bounds; a path keeps one mark per cell it is using. Keep that small state exact, and the walk is correct.']
  ]);
  $('#practice').innerHTML='<span>Practise them:</span>'+['Rotate Image','Number of Islands','Spiral Matrix','Set Matrix Zeroes','Search a 2D Matrix','Word Search'].map(function(x){return '<span class="pill">'+x+'</span>';}).join('');
  kinetic();riseIn();
})();
