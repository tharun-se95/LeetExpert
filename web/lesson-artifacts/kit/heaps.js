/* kit/heaps.js: the heap lane, registered on lanes.js's seam (LANE_KINDS). A heap is a growing lane
   (push, pop-by-swap-then-remove, and every repair swap already work on it unchanged: nothing about
   a heap needs a new mutation primitive) drawn TWICE from the same items: its array cell, the item's
   one real position (what the ordinary tween already glides on a swap, an entrance or an exit), and
   a read-only copy in the complete binary tree above it, at the position completeness forces for
   node k -- children at 2k+1 and 2k+2, parent at (k-1)>>1 (heap-property-and-array-representation.md).
   A slot is named the same way a plain row names one, mark(id, name, slot); the edge highlighted in
   the tree is simply the edge into whichever slot a currently highlighted mark names, since a heap
   step is always "this index versus its parent" or "against a child" -- no second annotation needed.
   Spec: docs/superpowers/specs/2026-09-28-heap-player-design.md. Included by build.py only in
   lessons that draw a heap (KIT_OPTIONAL), always after lanes.js. */

var HLVL=46,HCOLGAP=14,HTREEGAP=30;
/* depth of index k in a complete tree (0 = root): floor(log2(k+1)), found by exact bit-length rather
   than Math.log2, which can round the wrong way exactly at a power of two */
function heapDepthOf(k){return 31-Math.clz32(k+1);}
/* every parent dominates both children, in the direction cmp names; works on a snapshotted lane (out
   of Lanes#snap), so the model tests and a walkthrough's own inv can both use it without the live model */
function heapHolds(l){
  var ok=l.cmp==='max'?function(p,c){return +p>=+c;}:function(p,c){return +p<=+c;};
  for(var k=1;k<l.items.length;k++){var it=l.items[k];if(!it)continue;var p=l.items[(k-1)>>1];if(p&&!ok(p.v,it.v))return false;}
  return true;
}

LANE_KINDS.heap={
  /* i, l, r are named under the array cells by the generic row marks, so they glide between steps
     (drawn here as chrome, they jumped: found in review) */
  rowMarks:true,
  init:function(l,d){if(d.cmp&&d.cmp!=='min'&&d.cmp!=='max')throw new Error(l.id+": cmp is 'min' or 'max', not "+d.cmp);l.cmp=d.cmp||'min';},
  span:function(l){throw new Error(l.id+' is a heap: name a slot with mark(), not span()');},
  snap:function(l,out){out.cmp=l.cmp;},

  /* ---------- the view ---------- */
  /* fixed for the player's life: cell size and the deepest level any snapshot reaches, so a push or
     pop never resizes the canvas or shifts a node that did not move */
  measure:function(m,l){
    m.cw=Math.max(m.cw,laneCellW(l.items,l.w||44));
    if(l.items.some(function(x){return x&&x.sub;}))m.ch=LCH2;
    m.n=Math.max(m.n||0,l.items.length);m.cmp=l.cmp;
  },
  block:function(m){
    var depth=m.n>0?heapDepthOf(m.n-1):0,leaves=Math.pow(2,depth);
    m.depth=depth;m.leaves=leaves;m.xunit=m.cw+HCOLGAP;
    m.treeW=leaves*m.xunit;m.arrW=Math.max(m.n,1)*(m.cw+8)-8+2*LPAD;
    var w=Math.max(m.treeW,m.arrW,140);
    m.treeTop=26+m.ch/2;
    var treeBottom=m.treeTop+depth*HLVL+m.ch/2;
    m.arrTop=treeBottom+HTREEGAP+16+m.ch/2;
    return {w:w,h:m.arrTop+m.ch/2+28};
  },
  box:function(m,x0,y){
    var w=Math.max(m.treeW,m.arrW,140);
    return {kind:'heap',x:x0,y:y,cw:m.cw,ch:m.ch,n:m.n,cmp:m.cmp,label:m.label,
      depth:m.depth,leaves:m.leaves,xunit:m.xunit,
      treeLeft:x0+(w-m.treeW)/2,treeTop:y+m.treeTop,
      arrLeft:x0+(w-m.arrW)/2+LPAD+m.cw/2,arrTop:y+m.arrTop,
      w:w,h:m.arrTop+m.ch/2+28};
  },
  /* the array cell: an item's one real position, so a swap, a push or the final pop glides here
     through the player's ordinary tween, exactly as a plain row's items do */
  slotAt:function(b,k){return {x:b.arrLeft+k*(b.cw+8),y:b.arrTop};},

  svg:function(id,b,l,s){
    var h='<g class="ln-lane hp-lane'+(s.hi.indexOf('lane:'+id)>=0?' hi':'')+'">';
    h+='<text class="ln-label" x="'+b.treeLeft+'" y="'+(b.y+14)+'">'+laneEsc(b.label)+' ('+(b.cmp==='max'?'max':'min')+'-heap)</text>';
    var K=LANE_KINDS.heap,n=l.items.length;
    for(var k=0;k<n;k++){var c=K.slotAt(b,k);
      h+='<text class="ln-idx" x="'+c.x+'" y="'+(b.arrTop-b.ch/2-7)+'" text-anchor="middle">'+k+'</text>';}
    return h+'</g>';
  },
  /* node k's position: above the leaf span its own subtree owns, the derivation
     heap-property-and-array-representation.md makes (the same placement the static HeapArrayDiagram
     uses), so a node never moves when a sibling subtree grows or shrinks. Value, tone and highlight
     travel with the position, so an item leaving the tree still has what it needs to fade out --
     the under/over seam does not pass the previous snapshot's items, only its layout. */
  layout:function(l,b,extra){
    var nodes=extra.heapNodes||(extra.heapNodes={});
    l.items.forEach(function(it,k){if(!it)return;
      var d=heapDepthOf(k),first=Math.pow(2,d)-1,pos=k-first,span=b.leaves/Math.pow(2,d),
          x=b.treeLeft+(pos+.5)*span*b.xunit,y=b.treeTop+d*HLVL;
      nodes[it.id]={x:x,y:y,w:b.cw,h:b.ch,v:it.v,sub:it.sub,tone:it.tone,idx:k,lane:l.id};
    });
  },
  /* every parent-child edge for the lanes present, keyed by lane#childIndex so two heaps in one
     player never collide; the one edge whose child slot is a currently highlighted mark is the
     comparison a step is explaining, and draws highlighted -- no separate annotation for it */
  over:function(L,fromL,t,s){
    var to=L.extra.heapNodes||{},from=fromL&&fromL.extra.heapNodes||{},keys={},pos={},h=[];
    Object.keys(to).forEach(function(k){keys[k]=1;});Object.keys(from).forEach(function(k){keys[k]=1;});
    var lerp=function(a,b){return a+(b-a)*t;};
    Object.keys(keys).forEach(function(k){var a=to[k],b=from[k],q,op;
      if(a&&b){q={x:lerp(b.x,a.x),y:lerp(b.y,a.y),w:a.w,h:a.h};op=1;}
      else if(a){q={x:a.x,y:a.y,w:a.w,h:a.h};op=fromL?t:1;}
      else{q={x:b.x,y:b.y,w:b.w,h:b.h};op=1-t;}
      pos[k]=q;});
    function byLaneIdx(map){var out={};Object.keys(map).forEach(function(id){var n=map[id];out[n.lane+'#'+n.idx]=id;});return out;}
    function edgesOf(map,idx){var out={};Object.keys(map).forEach(function(id){var n=map[id];if(n.idx===0)return;
      var pid=idx[n.lane+'#'+((n.idx-1)>>1)];if(pid==null)return;out[n.lane+'#'+n.idx]={a:pid,b:id};});return out;}
    var idxTo=byLaneIdx(to),idxFrom=byLaneIdx(from),eTo=edgesOf(to,idxTo),eFrom=fromL?edgesOf(from,idxFrom):{},ek={};
    Object.keys(eTo).forEach(function(k){ek[k]=1;});Object.keys(eFrom).forEach(function(k){ek[k]=1;});
    var hiIdx={};s.lanes.forEach(function(l){if(l.kind!=='heap')return;Object.keys(l.marks).forEach(function(nm){if(s.hi.indexOf(nm)>=0)hiIdx[l.id+'#'+l.marks[nm]]=true;});});
    Object.keys(ek).forEach(function(k){var e=eTo[k],f=eFrom[k],cur=e||f,pa=pos[cur.a],pb=pos[cur.b];if(!pa||!pb)return;
      var op=e&&f?1:(e?(fromL?t:1):1-t),hi=!!(e&&hiIdx[k]);
      h.push('<line class="hp-edge'+(hi?' hi':'')+'" style="opacity:'+op.toFixed(3)+'" x1="'+pa.x.toFixed(1)+'" y1="'+pa.y.toFixed(1)+'" x2="'+pb.x.toFixed(1)+'" y2="'+pb.y.toFixed(1)+'"/>');});
    Object.keys(keys).forEach(function(k){var n=to[k]||from[k],q=pos[k],op=(to[k]&&from[k])?1:(to[k]?(fromL?t:1):1-t),
        hi=s.hi.indexOf('item:'+k)>=0?' hi':'',tone=n.tone?' '+n.tone:'';
      h.push('<g class="ln-item hp-node'+tone+hi+'" style="opacity:'+op.toFixed(3)+'">'+
        '<rect class="ln-box" x="'+(q.x-q.w/2).toFixed(1)+'" y="'+(q.y-q.h/2).toFixed(1)+'" width="'+q.w+'" height="'+q.h+'" rx="10"/>'+
        '<text class="ln-val" x="'+q.x.toFixed(1)+'" y="'+(q.y+5.5).toFixed(1)+'" text-anchor="middle">'+laneEsc(n.v)+'</text></g>');});
    return h.join('');
  },
  /* on a phone: the array cell of any item a currently highlighted mark names */
  focus:function(s,L,first){
    s.lanes.forEach(function(l){if(l.kind!=='heap')return;
      Object.keys(l.marks).forEach(function(nm){if(s.hi.indexOf(nm)<0)return;var it=l.items[l.marks[nm]];if(!it)return;
        var a=L.items[it.id];if(a)first.push([a.x-20,a.x+20]);});});
  },
  describe:function(l){
    var vs=l.items.map(function(x){return x?x.v:'empty';}),
      ms=Object.keys(l.marks).map(function(n){return n+' at index '+l.marks[n];});
    return (l.cmp==='max'?'Max':'Min')+'-heap '+l.label+', as an array, index 0 first: '+vs.join(', ')+(ms.length?'; '+ms.join(', '):'')+'.';
  }
};
