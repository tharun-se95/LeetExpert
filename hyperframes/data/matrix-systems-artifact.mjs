// Independent JavaScript implementation of the eight matrix-systems scenes.
// Copied from the "The Grid Underneath" artifact, where the same code drives
// the in-page animations. build-matrix-systems.py is the Python implementation;
// check-matrix-systems.mjs requires the two to agree cell for cell.
// Also the source of the vignette artwork (matrix-systems-vignettes.json).
/* ---------- scene frame builders: each runs the real algorithm ---------- */
var mk=function(n,f){var a=[];for(var i=0;i<n;i++)a.push(f(i));return a;};
var cp=function(a){return a.map(function(x){return {k:x.k,t:x.t,s:x.s};});};

/* 1. row-major vs column-major against a toy cache */
function buildFramebuffer(){
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
  for(var c=0;c<C;c++)for(var r=0;r<R;r++)colO.push(r*C+c);
  var A=walk(rowO),B=walk(colO),frames=[];
  function side(W,k,strip){
    var seen={};
    for(var j=0;j<=k;j++)seen[W[j].off]=W[j];
    return mk(N,function(off){
      var s=seen[off];
      if(!s)return {k:'idle',t:strip?'':String(off)};
      var isCur=W[k].off===off;
      var kind=isCur?(s.hit?'done':'cur'):(s.hit?'acc':'warn');
      return {k:kind,t:strip?'':String(off)};
    });
  }
  for(var k=0;k<N;k++){
    var a=A[k],b=B[k];
    frames.push({
      b:{gA:side(A,k,false),sA:side(A,k,true),gB:side(B,k,false),sB:side(B,k,true)},
      note:'Step '+(k+1)+'. Row loop reads offset '+a.off+': '+(a.hit?'its cache line is already loaded, a hit.':'a new cache line, a miss.')+' Column loop reads offset '+b.off+': '+(b.hit?'a hit.':'a miss, the line it needs was evicted or never loaded.'),
      stats:[['row loop misses',a.miss],['column loop misses',b.miss]],
      ev:b.hit?null:'bad'
    });
  }
  return {frames:frames,step:.22,poster:N-1,
    boards:[{id:'gA',rows:R,cols:C,g:0,label:'for r: for c:  (row-major)'},{id:'sA',rows:1,cols:N,g:0,strip:1,label:'memory, one gap per cache line'},
            {id:'gB',rows:R,cols:C,g:1,label:'for c: for r:  (column-major)'},{id:'sB',rows:1,cols:N,g:1,strip:1,label:'same memory, different order'}],
    meta:{rowMiss:A[N-1].miss,colMiss:B[N-1].miss},label:'Two loops over the same 4 × 8 grid. Orange or gold cells are cache misses.'};
}

/* 2. 3x3 window blur with bounds checks */
function buildFilter(){
  var R=5,C=6,img=[[0,0,9,9,0,0],[0,0,9,9,0,0],[9,9,9,9,9,9],[0,0,9,9,0,0],[0,0,9,9,0,0]];
  var DIRS=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  var inn=mk(R*C,function(i){var v=img[Math.floor(i/C)][i%C];return {k:'idle',s:v/9,t:String(v)};});
  var out=mk(R*C,function(){return {k:'dim',t:''};});
  var frames=[{b:{'in':cp(inn),out:cp(out)},note:'A plus sign, brightness 0 to 9. Each output pixel will be the mean of its 3 × 3 window. Press play.',stats:[['pixels done',0]]}];
  var done=0;
  for(var r=0;r<R;r++)for(var c=0;c<C;c++){
    var sum=img[r][c],n=1,valid=0;
    DIRS.forEach(function(d){var nr=r+d[0],nc=c+d[1];if(nr>=0&&nr<R&&nc>=0&&nc<C){sum+=img[nr][nc];n++;valid++;}});
    var val=Math.round(sum/n);
    var i=r*C+c;
    var ib=cp(inn);ib[i]={k:'cur',t:String(img[r][c])};
    var ob=cp(out);ob[i]={k:'cur',t:String(val)};
    out[i]={k:'idle',s:val/9,t:String(val)};
    done++;
    var edge=valid<8?' The other '+(8-valid)+' fall off the edge, so the bounds check skips them.':'';
    frames.push({b:{'in':ib,out:ob},ov:{'in':{r0:r-1,c0:c-1,r1:r+1,c1:c+1,cls:'win'}},
      note:'Pixel ('+r+', '+c+'): '+valid+' of 8 neighbours are inside the image.'+edge+' Mean of '+n+' values = '+sum+' / '+n+' → '+val+'.',
      stats:[['neighbours in bounds',valid+' / 8'],['pixels done',done]],ev:valid<8?null:'key'});
  }
  frames.push({b:{'in':cp(inn),out:cp(out)},note:'Every pixel visited once. The hard edges of the plus have softened, and the border pixels used fewer neighbours.',stats:[['pixels done',done]]});
  return {frames:frames,step:.26,poster:frames.length-1,
    boards:[{id:'in',rows:R,cols:C,g:0,label:'input image'},{id:'out',rows:R,cols:C,g:1,label:'blurred output'}],
    meta:{},label:'A 3 × 3 mean filter sliding across a 5 × 6 image.'};
}

/* 3. flood fill over hot cells */
function buildIslands(){
  var G=['1100001110','1100100110','0001100000','0000001001','1000011101','1100001000','0000000000'].map(function(s){return s.split('').map(Number);});
  var R=G.length,C=G[0].length,COL=['acc','done','viol','warn'];
  var st=mk(R*C,function(i){return {k:G[Math.floor(i/C)][i%C]?'land':'water',t:''};});
  var land=0;G.forEach(function(row){row.forEach(function(v){land+=v;});});
  var seen=mk(R*C,function(){return false;}),frames=[],count=0,painted=0;
  frames.push({b:{g:cp(st)},note:'A thermal map of a server floor. Warm cells are racks over their temperature limit. The scan will walk the grid row by row.',stats:[['hot racks',land],['incidents',0]]});
  var D=[[1,0],[-1,0],[0,1],[0,-1]];
  for(var r=0;r<R;r++)for(var c=0;c<C;c++){
    if(!G[r][c]||seen[r*C+c])continue;
    count++;var kind=COL[(count-1)%COL.length];
    var q=[[r,c]];seen[r*C+c]=true;var prev=-1,first=true;
    while(q.length){
      var p=q.shift(),i=p[0]*C+p[1];
      if(prev>=0)st[prev]={k:kind,t:''};
      st[i]={k:'cur',t:''};prev=i;painted++;
      var fb=cp(st);
      frames.push({b:{g:fb},
        note:first?'New hot cell at ('+p[0]+', '+p[1]+'): incident #'+count+' starts. Flood outward to its neighbours.':'Flood: ('+p[0]+', '+p[1]+') is joined to incident #'+count+'.',
        stats:[['hot racks',land],['incidents',count]],ev:first?'key':null});
      first=false;
      D.forEach(function(d){var nr=p[0]+d[0],nc=p[1]+d[1];if(nr>=0&&nr<R&&nc>=0&&nc<C&&G[nr][nc]&&!seen[nr*C+nc]){seen[nr*C+nc]=true;q.push([nr,nc]);}});
    }
    st[prev]={k:kind,t:''};
  }
  frames.push({b:{g:cp(st)},note:'Scan finished: '+land+' hot racks collapse into '+count+' regions. Each cell was visited once, so the cost is proportional to the grid, O(m · n).',stats:[['hot racks',land],['incidents',count]],ev:'key'});
  return {frames:frames,step:.2,poster:frames.length-1,boards:[{id:'g',rows:R,cols:C,g:0,label:'rack temperature map (7 × 10)'}],meta:{land:land,count:count},label:'A flood fill grouping hot racks into incidents.'};
}

/* 4. in-place rotation: transpose then reverse rows */
function buildRotate(){
  var n=4,m=mk(n,function(r){return mk(n,function(c){return r*n+c+1;});}),orig=m.map(function(r){return r.slice();});
  var toCells=function(cur){var out=[];for(var r=0;r<n;r++)for(var c=0;c<n;c++){var v=m[r][c];out.push({k:cur&&cur.some(function(p){return p[0]===r&&p[1]===c;})?'cur':'idle',s:(v-1)/(n*n-1),t:String(v)});}return out;};
  var frames=[{b:{g:toCells()},note:'A 4 × 4 image. Each tile keeps its number, and the shade runs from dark at 1 to light at 16, so you can follow where every tile lands.',stats:[['swaps',0],['extra cells','0']]}];
  var swaps=0;
  function sw(a,b,c,d,txt){var t=m[a][b];m[a][b]=m[c][d];m[c][d]=t;swaps++;frames.push({b:{g:toCells([[a,b],[c,d]])},note:txt,stats:[['swaps',swaps],['extra cells','1 temp']],ev:'key'});}
  for(var i=0;i<n;i++)for(var j=i+1;j<n;j++)sw(i,j,j,i,'Transpose: swap ('+i+', '+j+') with ('+j+', '+i+'), a reflection across the main diagonal.');
  for(var r=0;r<n;r++)for(var j2=0;j2<n/2;j2++)sw(r,j2,r,n-1-j2,'Reverse row '+r+': swap column '+j2+' with column '+(n-1-j2)+'. Transposing and then flipping every row is a 90° clockwise turn.');
  for(var a=0;a<n;a++)for(var b=0;b<n;b++)if(m[a][b]!==orig[n-1-b][a])throw new Error('rotation check failed');
  frames.push({b:{g:toCells()},note:'Rotated 90° clockwise with '+swaps+' swaps and one temporary value. Tile 1 moved from the top-left corner to the top-right, tile 13 from bottom-left to top-left.',stats:[['swaps',swaps],['extra cells','1 temp']]});
  return {frames:frames,step:.3,poster:frames.length-1,boards:[{id:'g',rows:n,cols:n,g:0,label:'one grid, no second buffer',cap:64}],meta:{swaps:swaps},label:'Transpose, then reverse each row, all inside one grid.'};
}

/* 5. spiral with shrinking bounds */
function buildSpiral(){
  var R=5,C=6,top=0,bot=R-1,left=0,right=C-1,order=[];
  function add(r,c,dir){order.push({r:r,c:c,dir:dir,b:[top,bot,left,right]});}
  while(top<=bot&&left<=right){
    for(var j=left;j<=right;j++)add(top,j,'top row →');
    for(var i=top+1;i<=bot;i++)add(i,right,'right column ↓');
    if(top<bot)for(var j2=right-1;j2>=left;j2--)add(bot,j2,'bottom row ←');
    if(left<right)for(var i2=bot-1;i2>top;i2--)add(i2,left,'left column ↑');
    top++;bot--;left++;right--;
  }
  var vis=mk(R*C,function(){return 0;}),frames=[{b:{g:mk(R*C,function(){return {k:'idle',t:''};})},ov:{g:{r0:0,c0:0,r1:R-1,c1:C-1,cls:'bounds'}},note:'Four integers describe the untouched rectangle: top, bottom, left, right. Walk its edge, then shrink it.',stats:[['visited',0],['bounds','0 · 4 · 0 · 5']]}];
  order.forEach(function(o,k){
    vis[o.r*C+o.c]=k+1;
    var cells=mk(R*C,function(i){var v=vis[i];return v?{k:i===o.r*C+o.c?'cur':'acc',t:String(v)}:{k:'idle',t:''};});
    var b=o.b;
    frames.push({b:{g:cells},ov:{g:{r0:b[0],c0:b[2],r1:b[1],c1:b[3],cls:'bounds'}},note:'Cell '+(k+1)+' of '+order.length+': walking the '+o.dir+' of the rectangle from row '+b[0]+' to '+b[1]+' and column '+b[2]+' to '+b[3]+'.',
      stats:[['visited',k+1],['bounds',b[0]+' · '+b[1]+' · '+b[2]+' · '+b[3]]]});
  });
  return {frames:frames,step:.17,poster:frames.length-1,boards:[{id:'g',rows:R,cols:C,g:0,label:'tool path, cell by cell'}],meta:{cells:R*C},label:'A spiral over a 5 × 6 grid, tracked by four shrinking bounds.'};
}

/* 6. set matrix zeroes with the border as scratch space */
function buildMask(){
  var R=5,C=6,m=[[4,7,0,2,9,3],[5,3,8,6,0,1],[2,9,4,7,5,8],[6,0,3,1,4,2],[8,5,7,3,6,9]];
  var origZero={};m.forEach(function(row,i){row.forEach(function(v,j){if(v===0)origZero[i*C+j]=1;});});
  var marker={};
  var zeros=function(){var n=0;m.forEach(function(r){r.forEach(function(v){if(v===0)n++;});});return n;};
  function cells(cur,win,active){return mk(R*C,function(i){
    var r=Math.floor(i/C),c=i%C,v=m[r][c];
    var kind='idle';
    if(v===0)kind=(marker[i]&&active)?'warn':'bad';
    else if(win&&win(r,c))kind='win';
    if(cur&&cur[0]===r&&cur[1]===c)kind='cur';
    return {k:kind,t:String(v)};});}
  var frames=[],push=function(cur,win,active,note,ev){frames.push({b:{g:cells(cur,win,active)},note:note,stats:[['extra memory','2 flags'],['zeros',zeros()]],ev:ev||null});};
  push(null,null,true,'Three zeros: (0, 2), (1, 4), (3, 1). Each must wipe its whole row and column, but a zero written too early would look like a real one. Press play.');
  var firstRow=m[0].some(function(v){return v===0;}),firstCol=m.some(function(r){return r[0]===0;});
  push(null,function(r){return r===0;},true,'Row 0 already holds a zero, so remember it in a flag: first_row_zero = '+firstRow+'. Column 0 has none: first_col_zero = '+firstCol+'.');
  for(var i=1;i<R;i++)for(var j=1;j<C;j++){
    var hit=m[i][j]===0;
    if(hit){m[i][0]=0;m[0][j]=0;if(!origZero[i*C])marker[i*C]=1;if(!origZero[j])marker[j]=1;}
    push([i,j],null,true,hit?'Zero at ('+i+', '+j+'). Flag its row on the left border and its column on the top border. Gold cells are flags, not real zeros.':'('+i+', '+j+') is '+m[i][j]+'. Nothing to flag.',hit?'key':null);
  }
  for(var i2=1;i2<R;i2++){
    var rowNote=[];
    for(var j2=1;j2<C;j2++)if(m[i2][0]===0||m[0][j2]===0){if(m[i2][j2]!==0)rowNote.push(j2);m[i2][j2]=0;}
    push(null,function(r){return r===i2;},true,'Row '+i2+': the border flags say '+(rowNote.length?'columns '+rowNote.join(', ')+' become zero':'nothing new changes')+'. Interior first, border last, or the flags would be destroyed before they are read.');
  }
  if(firstRow)for(var jj=0;jj<C;jj++)m[0][jj]=0;
  if(firstCol)for(var ii=0;ii<R;ii++)m[ii][0]=0;
  frames.push({b:{g:cells(null,null,false)},note:'Border pass: first_row_zero is '+firstRow+', so row 0 is zeroed last. The flags have done their job.',stats:[['extra memory','2 flags'],['zeros',zeros()]],ev:'key'});
  return {frames:frames,step:.16,poster:frames.length-1,boards:[{id:'g',rows:R,cols:C,g:0,label:'telemetry: 5 servers × 6 metrics'}],meta:{R:R,C:C},label:'Zeroing rows and columns with the first row and column as flags.'};
}

/* 7. binary search over a flattened sorted grid */
function buildPages(){
  var R=5,C=6,N=R*C,keys=mk(N,function(i){return 3+i*4+(i%3);});
  for(var q=1;q<N;q++)if(keys[q]<=keys[q-1])throw new Error('keys not sorted');
  var target=keys[8],lo=0,hi=N-1,probes=0,frames=[];
  function cells(lo,hi,mid,found,strip){return mk(N,function(i){var kind=i<lo||i>hi?'dim':'win';if(i===mid)kind=found?'done':'cur';return {k:kind,t:strip?'':String(keys[i])};});}
  frames.push({b:{g:cells(0,N-1,-1,false,false),st:cells(0,N-1,-1,false,true)},note:'Five pages of six sorted keys. Find '+target+'. Read left to right, top to bottom, it is one sorted array of '+N+' keys.',stats:[['target',target],['probes',0]]});
  while(lo<=hi){
    var mid=Math.floor((lo+hi)/2),v=keys[mid];probes++;
    var rr=Math.floor(mid/C),cc=mid%C,ok=v===target;
    frames.push({b:{g:cells(lo,hi,mid,ok,false),st:cells(lo,hi,mid,ok,true)},
      note:'mid = ('+lo+' + '+hi+') // 2 = '+mid+' → page '+rr+', slot '+cc+' (row '+mid+' // '+C+', column '+mid+' % '+C+'). Key '+v+(ok?' equals '+target+': found.':(v<target?' is below '+target+', so drop the lower half.':' is above '+target+', so drop the upper half.')),
      stats:[['target',target],['probes',probes],['keys left',hi-lo+1]],ev:ok?'key':null});
    if(ok)break;
    if(v<target)lo=mid+1;else hi=mid-1;
  }
  return {frames:frames,step:1.1,poster:frames.length-1,boards:[{id:'g',rows:R,cols:C,g:0,label:'5 pages × 6 slots',cap:48},{id:'st',rows:1,cols:N,g:0,strip:1,label:'the same keys as one flat array'}],
    meta:{probes:probes,N:N},label:'Binary search on the flat index, translated back to (page, slot).'};
}

/* 8. word search DFS with backtracking */
function buildRoute(){
  var G=['ROUT'.split(''),'XUSX'.split(''),'XTEX'.split('')],R=G.length,C=G[0].length,W='ROUTE';
  var DIRS=[[-1,0],[0,1],[1,0],[0,-1]],path=[],frames=[],back=0;
  function cells(cur,badc,done){return mk(R*C,function(i){var r=Math.floor(i/C),c=i%C,kind='idle';
    if(path.some(function(p){return p[0]===r&&p[1]===c;}))kind=done?'done':'acc';
    if(cur&&cur[0]===r&&cur[1]===c)kind=badc?'bad':(done?'done':'cur');
    return {k:kind,t:G[r][c]};});}
  var emit=function(cur,badc,done,note,ev){frames.push({b:{g:cells(cur,badc,done)},note:note,stats:[['path length',path.length+' / '+W.length],['backtracks',back]],ev:ev||null});};
  emit(null,false,false,'Find '+W+' by moving up, right, down, left, never reusing a cell. Only one R exists, so the search starts at (0, 0).');
  function dfs(r,c,k){
    if(r<0||r>=R||c<0||c>=C||G[r][c]!==W[k])return false;
    path.push([r,c]);
    if(k===W.length-1){emit([r,c],false,true,'\''+W[k]+'\' matches at ('+r+', '+c+'). The whole word is spelled: found.','key');return true;}
    emit([r,c],false,false,'\''+W[k]+'\' matches at ('+r+', '+c+'). Mark it as used and look for \''+W[k+1]+'\' next.');
    for(var d=0;d<4;d++)if(dfs(r+DIRS[d][0],c+DIRS[d][1],k+1))return true;
    back++;
    emit([r,c],true,false,'No unused neighbour of ('+r+', '+c+') spells \''+W[k+1]+'\'. Dead end.','bad');
    path.pop();
    emit(null,false,false,'Backtrack: un-mark ('+r+', '+c+') so other routes can use it, then try the next direction from the cell before.');
    return false;
  }
  scan:for(var r=0;r<R;r++)for(var c=0;c<C;c++)if(G[r][c]===W[0]&&dfs(r,c,0))break scan;
  return {frames:frames,step:.85,poster:frames.length-1,boards:[{id:'g',rows:R,cols:C,g:0,label:'find ROUTE: up, right, down, left',cap:64}],meta:{back:back},label:'Depth-first search that marks cells while it walks and un-marks them on retreat.'};
}


var VG={
 framebuffer:function(){var s='<rect class="st" x="14" y="8" width="118" height="74" rx="7"/>';for(var r=0;r<5;r++)for(var c=0;c<8;c++)s+='<rect class="'+(r===2&&c===3?'fc':'fa')+'" x="'+(22+c*13.5)+'" y="'+(16+r*13)+'" width="10" height="10" rx="2"/>';
   s+='<path class="st" d="M57 88v8M40 96h34"/>';for(var i=0;i<16;i++)s+='<rect class="'+(i===7?'fc':'fb')+'" opacity="'+(i===7?1:.5)+'" x="'+(150+ (i%4)*22)+'" y="'+(20+Math.floor(i/4)*20)+'" width="18" height="14" rx="2"/>';
   s+='<path class="sc" d="M74 42C110 42 120 60 168 68"/>';return s;},
 filter:function(){var s='';for(var r=0;r<3;r++)for(var c=0;c<3;c++)s+='<rect class="'+(r===1&&c===1?'fc':'fa')+'" x="'+(24+c*26)+'" y="'+(14+r*26)+'" width="22" height="22" rx="4"/>';
   s+='<rect class="st" x="20" y="10" width="82" height="82" rx="8" stroke-dasharray="4 4"/><path class="st" d="M114 51h34M140 44l8 7-8 7"/><rect class="fb" x="160" y="29" width="44" height="44" rx="8"/><circle class="st" cx="182" cy="51" r="10"/><path class="st" d="M182 41v20M172 51h20"/>';return s;},
 rack:function(){var s='';for(var u=0;u<3;u++){s+='<rect class="st fp" x="24" y="'+(10+u*30)+'" width="130" height="24" rx="4"/>';for(var l=0;l<10;l++){var hot=(u===1&&l>=6&&l<9)||(u===2&&l===7)||(u===0&&l===8);s+='<circle class="'+(hot?'fr':'fg')+'" cx="'+(38+l*11.5)+'" cy="'+(22+u*30)+'" r="3.4"/>';}}
   s+='<path class="st" d="M174 20v70M168 90h12"/><circle class="fr" opacity=".25" cx="118" cy="52" r="26"/>';return s;},
 rotate:function(){var s='<rect class="st" x="44" y="6" width="58" height="92" rx="10"/>';for(var r=0;r<4;r++)for(var c=0;c<2;c++)s+='<rect class="'+(r===0&&c===0?'fc':'fa')+'" x="'+(53+c*22)+'" y="'+(16+r*18)+'" width="18" height="14" rx="2.5"/>';
   s+='<path class="sc" d="M124 34a34 34 0 1 1-2 40"/><path class="sc" d="M116 30l8 4-4 8"/><rect class="st" x="170" y="30" width="60" height="44" rx="8" transform="rotate(90 200 52)"/>';return s;},
 spiral:function(){var pts=[],x=110,y=56,d=[[1,0],[0,1],[-1,0],[0,-1]],len=8,k=0;pts.push([x,y]);for(var s=0;s<11;s++){var dd=d[k%4];x+=dd[0]*len;y+=dd[1]*len;pts.push([x,y]);if(s%2===1)len+=8;k++;}
   var p='M'+pts.map(function(q){return q[0]+' '+q[1];}).join('L');
   return '<rect class="st" x="30" y="6" width="160" height="100" rx="8"/><path class="sc" d="'+p+'"/><circle class="fb" cx="'+pts[pts.length-1][0]+'" cy="'+pts[pts.length-1][1]+'" r="6"/><path class="st" d="M214 20v46M208 66h12l-6 14z"/>';},
 mask:function(){var s='';for(var r=0;r<5;r++)for(var c=0;c<6;c++){var hot=r===2||c===3;s+='<rect class="'+(r===2&&c===3?'fr':(hot?'fa':'fp st'))+'" x="'+(24+c*30)+'" y="'+(8+r*19)+'" width="26" height="15" rx="3"/>';}
   return s+'<path class="st" style="stroke:var(--k-bad-ink)" d="M99 44l12 8M111 44l-12 8"/>';},
 pages:function(){var s='';for(var p=0;p<3;p++){s+='<rect class="st fp" x="'+(24+p*8)+'" y="'+(10+p*8)+'" width="120" height="64" rx="6"/>';}
   for(var r=0;r<5;r++)s+='<rect class="'+(r===2?'fc':'fa')+'" x="46" y="'+(34+r*10)+'" width="'+(r===2?96:78)+'" height="6" rx="3"/>';
   return s+'<circle class="st" cx="196" cy="54" r="22"/><path class="st" d="M212 70l16 18"/><path class="st" d="M186 54h20M196 44v20" opacity=".4"/>';},
 route:function(){var s='<rect class="st" x="20" y="6" width="190" height="102" rx="8"/>';
   [[44,30],[44,84],[100,30],[100,84],[166,30],[166,84],[100,57]].forEach(function(p,i){s+='<circle class="'+(i===0||i===5?'fb':'fa')+'" cx="'+p[0]+'" cy="'+p[1]+'" r="7"/>';});
   return s+'<path class="st" d="M51 84h42M107 84h52M100 37v13" opacity=".55"/><path class="sc" d="M44 30H86V57H166V77"/>';}
};
export const builders={framebuffer:buildFramebuffer,filter:buildFilter,alerts:buildIslands,rotate:buildRotate,spiral:buildSpiral,mask:buildMask,pages:buildPages,route:buildRoute};
export {VG};
