/* kit/grids.js: the grid lane, registered on lanes.js's seam (LANE_KINDS). A grid is a fixed lane of
   rows × cols slots read row-major, slot = r × cols + c, so put, clear, swap, copy, set and tone work
   on it unchanged, its values keep their identity as they move (a transpose, a rotation), and it
   shares a player with the other lanes (an island's cells read onto a queue). It adds what a board
   names: rows and columns (axis: top, bottom, r, c), rectangles over cells (rect: a spiral's
   bounds, a prefix-sum query) and trails through them in visit order (path). A cell is named by its
   axes and a tone, never by mark, so a grid has one way to say "here".
   Spec: docs/superpowers/specs/2026-09-28-grid-player-design.md. Included by build.py only in
   lessons that draw a grid (KIT_OPTIONAL), always after lanes.js. */

var GGAP=6,GKEY=16,GAXIS=14;
function gridOf(M,id){var l=M.lane(id);if(l.kind!=='grid')throw new Error(id+' is not a grid');return l;}
function gridSlot(l,r,c){if(!(r>=0&&r<l.rows&&c>=0&&c<l.cols))throw new Error(l.id+': cell ('+r+', '+c+') is out of range');return r*l.cols+c;}
function gridCopy(o){var x={};for(var k in o)x[k]=o[k];return x;}
/* an 11px JetBrains Mono name (0.6em advance) with room for its stem */
function gridNameW(n){return Math.ceil(String(n).length*6.6)+14;}

Lanes.prototype.at=function(id,r,c){return gridSlot(gridOf(this,id),r,c);};
Lanes.prototype.cell=function(id,r,c){var l=gridOf(this,id);return l.items[gridSlot(l,r,c)];};
/* put every value of a 2D array; gives back the items, row by row, for the lesson to tone later */
Lanes.prototype.fill=function(id,rows){var l=gridOf(this,id),self=this;
  if(rows.length!==l.rows||rows.some(function(x){return x.length!==l.cols;}))throw new Error(id+' holds '+l.rows+' rows of '+l.cols);
  return rows.map(function(row,r){return row.map(function(v,c){return self.put(id,r*l.cols+c,v);});});};
/* a named row ('r') or column ('c'); ax null removes it */
Lanes.prototype.axis=function(id,name,ax,i){var l=gridOf(this,id);
  if(ax===null||ax===undefined){delete l.axes[name];return;}
  if(ax!=='r'&&ax!=='c')throw new Error(id+': an axis is \'r\' or \'c\', not '+ax);
  if(!(i>=0&&i<(ax==='r'?l.rows:l.cols)))throw new Error(id+': '+(ax==='r'?'row ':'column ')+i+' is out of range');
  l.axes[name]={ax:ax,i:i};};
/* a named rectangle, both corners included; r0 > r1 or c0 > c1 is empty (bounds that have crossed)
   and is not drawn; r0 null removes it */
Lanes.prototype.rect=function(id,name,r0,c0,r1,c1){var l=gridOf(this,id);
  if(r0===null||r0===undefined){delete l.rects[name];return;}
  [[r0,l.rows],[r1,l.rows],[c0,l.cols],[c1,l.cols]].forEach(function(p){if(!(p[0]>=0&&p[0]<p[1]))throw new Error(id+': rect '+name+' reaches outside the grid');});
  l.rects[name]={r0:r0,c0:c0,r1:r1,c1:c1};};
/* a trail through slots in visit order (a copy is kept, so the lesson may go on growing its array);
   null removes it */
Lanes.prototype.path=function(id,name,slots){var l=gridOf(this,id);
  if(slots===null||slots===undefined){delete l.paths[name];return;}
  slots.forEach(function(k){if(!(k>=0&&k<l.cap))throw new Error(id+': slot '+k+' is out of range');});
  l.paths[name]=slots.slice();};

LANE_KINDS.grid={
  fixed:true,
  key:function(l){return l.rows+'x'+l.cols;},
  init:function(l,d){if(!(d.rows>0&&d.cols>0))throw new Error(l.id+': a grid needs rows and cols');
    l.rows=d.rows;l.cols=d.cols;l.cap=d.rows*d.cols;l.rkeys=d.rkeys||null;l.ckeys=d.ckeys||null;l.axes={};l.rects={};l.paths={};},
  mark:function(l){throw new Error(l.id+' is a grid: name a cell by its row and column with axis(), and tone() it');},
  span:function(l){throw new Error(l.id+' is a grid: a range of cells is a rect()');},
  snap:function(l,out){
    out.rows=l.rows;out.cols=l.cols;out.rkeys=l.rkeys?l.rkeys.slice():null;out.ckeys=l.ckeys?l.ckeys.slice():null;
    out.axes={};for(var a in l.axes)out.axes[a]=gridCopy(l.axes[a]);
    out.rects={};for(var r in l.rects)out.rects[r]=gridCopy(l.rects[r]);
    out.paths={};for(var p in l.paths)out.paths[p]=l.paths[p].slice();},

  /* ---------- the view ---------- */
  /* fixed for the player's life: cell size, and room for the most axis names any snapshot shows */
  measure:function(m,l){
    m.rows=l.rows;m.cols=l.cols;m.rkeys=l.rkeys;m.ckeys=l.ckeys;m.ch=LCH;
    m.gcw=Math.max(m.gcw||0,laneCellW(l.items,l.w||40));m.cw=m.gcw;
    var rowW={},colN={};
    Object.keys(l.axes).forEach(function(n){var a=l.axes[n];
      if(a.ax==='r')rowW[a.i]=(rowW[a.i]||0)+gridNameW(n);else colN[a.i]=(colN[a.i]||0)+1;});
    m.axR=Math.max(m.axR||0,Math.max.apply(null,[0].concat(Object.keys(rowW).map(function(k){return rowW[k];}))));
    m.axC=Math.max(m.axC||0,Math.max.apply(null,[0].concat(Object.keys(colN).map(function(k){return colN[k];}))));},
  block:function(m){
    var keys=m.rkeys||[String(m.rows-1)];
    m.keyW=Math.ceil(Math.max.apply(null,keys.map(function(k){return String(k).length;}))*6.3)+10;
    m.left=m.keyW+(m.axR?m.axR+6:0)+4;m.top=20+GKEY+(m.axC?m.axC*GAXIS+4:0);
    m.gw=m.cols*(m.cw+GGAP)-GGAP+2*LPAD;m.gh=m.rows*(m.ch+GGAP)-GGAP+2*LPAD;
    return {w:m.left+m.gw,h:m.top+m.gh+10};},
  box:function(m,x0,y){return {kind:'grid',x:x0+m.left,y:y+m.top,left:m.left,top:m.top,keyW:m.keyW,w:m.gw,h:m.gh,cw:m.cw,ch:m.ch,
    rows:m.rows,cols:m.cols,rkeys:m.rkeys,ckeys:m.ckeys,label:m.label,len:m.rows*m.cols};},
  slotAt:function(b,k){var r=Math.floor(k/b.cols),c=k%b.cols;
    return {x:b.x+LPAD+b.cw/2+c*(b.cw+GGAP),y:b.y+LPAD+b.ch/2+r*(b.ch+GGAP)};},
  /* the label, every slot's outline (so an empty cell is visible) and the row and column keys */
  svg:function(id,b,l,s){
    var K=LANE_KINDS.grid,h='<g class="ln-lane gd-lane'+(s.hi.indexOf('lane:'+id)>=0?' hi':'')+'">';
    h+='<text class="ln-label" x="'+(b.x-b.left)+'" y="'+(b.y-b.top+12)+'">'+laneEsc(b.label)+'</text>';
    for(var k=0;k<b.len;k++){var c=K.slotAt(b,k);
      h+='<rect class="ln-slot" x="'+(c.x-b.cw/2)+'" y="'+(c.y-b.ch/2)+'" width="'+b.cw+'" height="'+b.ch+'" rx="10"/>';}
    for(var cc=0;cc<b.cols;cc++){var p=K.slotAt(b,cc);
      h+='<text class="ln-idx" x="'+p.x+'" y="'+(b.y-5)+'" text-anchor="middle">'+laneEsc(b.ckeys?b.ckeys[cc]:cc)+'</text>';}
    for(var r=0;r<b.rows;r++){var q=K.slotAt(b,r*b.cols);
      h+='<text class="ln-idx" x="'+(b.x-4)+'" y="'+(q.y+4)+'" text-anchor="end">'+laneEsc(b.rkeys?b.rkeys[r]:r)+'</text>';}
    return h+'</g>';},
  layout:function(l,b,out){
    var K=LANE_KINDS.grid,axes=out.axes||(out.axes={}),rects=out.rects||(out.rects={}),paths=out.paths||(out.paths={});
    /* names on one row stand side by side leftward; names on one column stack upward */
    var onRow={},onCol={};
    Object.keys(l.axes).sort().forEach(function(n){var a=l.axes[n],g=a.ax==='r'?onRow:onCol;(g[a.i]=g[a.i]||[]).push(n);});
    Object.keys(onRow).forEach(function(i){var y=K.slotAt(b,(+i)*b.cols).y,off=0;
      onRow[i].forEach(function(n){axes[l.id+'.'+n]={ax:'r',x:b.x-b.keyW-8-off,y:y,name:n};off+=gridNameW(n);});});
    Object.keys(onCol).forEach(function(i){var x=K.slotAt(b,+i).x;
      onCol[i].forEach(function(n,j){axes[l.id+'.'+n]={ax:'c',x:x,y:b.y-GKEY-8-j*GAXIS,name:n};});});
    /* a rectangle's name sits on a tag at its top-left corner; tags sharing a corner stand side by side */
    var corner={};
    Object.keys(l.rects).sort().forEach(function(n){var r=l.rects[n],a=K.slotAt(b,r.r0*b.cols+r.c0),z=K.slotAt(b,r.r1*b.cols+r.c1),key=r.r0+','+r.c0,
        x=a.x-b.cw/2-4,y=a.y-b.ch/2-4;corner[key]=corner[key]||0;
      rects[l.id+'.'+n]={x:x,y:y,w:z.x-a.x+b.cw+8,h:z.y-a.y+b.ch+8,tx:x+corner[key],name:n,empty:r.r0>r.r1||r.c0>r.c1};
      corner[key]+=gridNameW(n)+2;});
    Object.keys(l.paths).forEach(function(n){paths[l.id+'.'+n]={name:n,pts:l.paths[n].map(function(k){return K.slotAt(b,k);})};});},
  /* trails run under the cells: the cells are opaque, so a trail shows in the gaps between them,
     a thread through what it visited. One that gained or lost its last cell grows or retracts it. */
  under:function(L,fromL,t,s){
    var to=L.extra.paths||{},from=fromL&&fromL.extra.paths||{},keys={},h=[];
    Object.keys(to).forEach(function(k){keys[k]=1;});Object.keys(from).forEach(function(k){keys[k]=1;});
    var lp=function(p,q){return {x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t};};
    Object.keys(keys).forEach(function(k){var a=to[k],b=fromL?from[k]:null,pts,op=1;
      if(a&&b){var na=a.pts.length,nb=b.pts.length;
        if(na===nb+1&&nb)pts=b.pts.concat([lp(b.pts[nb-1],a.pts[na-1])]);
        else if(na===nb-1&&na)pts=a.pts.concat([lp(b.pts[nb-1],a.pts[na-1])]);
        else if(na===nb)pts=a.pts.map(function(p,j){return lp(b.pts[j],p);});
        else pts=a.pts;}
      else if(a){pts=a.pts;op=fromL?t:1;}else{pts=b.pts;op=1-t;}
      var name=(a||b).name;
      if(pts.length>1)h.push('<g class="gd-path'+(s.hi.indexOf(name)>=0?' hi':'')+'" style="opacity:'+op.toFixed(3)+'"><polyline points="'+
        pts.map(function(p){return p.x.toFixed(1)+','+p.y.toFixed(1);}).join(' ')+'"/></g>');});
    return h.join('');},
  /* rectangles, then row and column names, over the cells */
  over:function(L,fromL,t,s){
    var h=[],lerp=function(a,b){return a+(b-a)*t;};
    var rto=L.extra.rects||{},rfrom=fromL&&fromL.extra.rects||{},rk={};
    Object.keys(rto).forEach(function(k){rk[k]=1;});Object.keys(rfrom).forEach(function(k){rk[k]=1;});
    Object.keys(rk).forEach(function(k){var a=rto[k],b=fromL?rfrom[k]:null,q,op;
      var va=a&&!a.empty,vb=b&&!b.empty;
      if(va&&vb){q={x:lerp(b.x,a.x),y:lerp(b.y,a.y),w:lerp(b.w,a.w),h:lerp(b.h,a.h),tx:lerp(b.tx,a.tx),name:a.name};op=1;}
      else if(va){q=a;op=fromL?t:1;}else if(vb){q=b;op=1-t;}else return;
      var tw=gridNameW(q.name)-2;
      h.push('<g class="gd-rect'+(s.hi.indexOf(q.name)>=0?' hi':'')+'" style="opacity:'+op.toFixed(3)+'">'+
        '<rect class="gd-box" x="'+q.x.toFixed(1)+'" y="'+q.y.toFixed(1)+'" width="'+q.w.toFixed(1)+'" height="'+q.h.toFixed(1)+'" rx="13"/>'+
        '<rect class="gd-tag" x="'+q.tx.toFixed(1)+'" y="'+(q.y-8).toFixed(1)+'" width="'+tw+'" height="16" rx="5"/>'+
        '<text x="'+(q.tx+tw/2).toFixed(1)+'" y="'+(q.y+4).toFixed(1)+'" text-anchor="middle">'+laneEsc(q.name)+'</text></g>');});
    var ato=L.extra.axes||{},afrom=fromL&&fromL.extra.axes||{},ak={};
    Object.keys(ato).forEach(function(k){ak[k]=1;});Object.keys(afrom).forEach(function(k){ak[k]=1;});
    Object.keys(ak).forEach(function(k){var a=ato[k],b=fromL?afrom[k]:null,q,op=1;
      if(a&&b&&a.ax===b.ax)q={x:lerp(b.x,a.x),y:lerp(b.y,a.y),ax:a.ax,name:a.name};else if(a){q=a;op=fromL?t:1;}else{q=b;op=1-t;}
      var cls='ln-mark gd-axis'+(s.hi.indexOf(q.name)>=0?' hi':'');
      h.push(q.ax==='r'?
        '<g class="'+cls+'" style="opacity:'+op.toFixed(3)+'"><line x1="'+(q.x+3)+'" x2="'+(q.x+9)+'" y1="'+q.y+'" y2="'+q.y+'"/><text x="'+q.x+'" y="'+(q.y+4)+'" text-anchor="end">'+laneEsc(q.name)+'</text></g>':
        '<g class="'+cls+'" style="opacity:'+op.toFixed(3)+'"><line x1="'+q.x+'" x2="'+q.x+'" y1="'+(q.y+3)+'" y2="'+(q.y+8)+'"/><text x="'+q.x+'" y="'+q.y+'" text-anchor="middle">'+laneEsc(q.name)+'</text></g>');});
    return h.join('');},
  /* on a phone: a highlighted column name or rectangle is where the reading is */
  focus:function(s,L,first){
    var ax=L.extra.axes||{},rc=L.extra.rects||{};
    Object.keys(ax).forEach(function(k){var a=ax[k];if(a.ax==='c'&&s.hi.indexOf(a.name)>=0)first.push([a.x-20,a.x+20]);});
    Object.keys(rc).forEach(function(k){var r=rc[k];if(!r.empty&&s.hi.indexOf(r.name)>=0)first.push([r.x,r.x+r.w]);});},
  rest:function(L,first){var ax=L.extra.axes||{};Object.keys(ax).forEach(function(k){var a=ax[k];if(a.ax==='c')first.push([a.x-20,a.x+20]);});},
  describe:function(l){
    var rows=[];for(var r=0;r<l.rows;r++)rows.push(l.items.slice(r*l.cols,(r+1)*l.cols).map(function(x){return x?x.v:'empty';}).join(' '));
    var at=function(k){return '('+Math.floor(k/l.cols)+', '+(k%l.cols)+')';},
      names=Object.keys(l.axes).map(function(n){var a=l.axes[n];return n+' at '+(a.ax==='r'?'row ':'column ')+a.i;})
        .concat(Object.keys(l.rects).map(function(n){var q=l.rects[n];return q.r0>q.r1||q.c0>q.c1?n+' empty':n+' over rows '+q.r0+' to '+q.r1+', columns '+q.c0+' to '+q.c1;}))
        .concat(Object.keys(l.paths).map(function(n){var p=l.paths[n];return n+(p.length?' through '+p.map(at).join(', '):' empty');}));
    return 'Grid '+l.label+', '+l.rows+' by '+l.cols+', row by row: '+rows.join('; ')+(names.length?'; '+names.join('; '):'');}
};
