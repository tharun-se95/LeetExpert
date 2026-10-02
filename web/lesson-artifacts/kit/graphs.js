/* kit/graphs.js: the graph lane, registered on lanes.js's seam (LANE_KINDS). A graph is a FIXED lane
   whose slot k is node k: its item carries the node's label, so tone, highlight, mark and copy work
   through the generic lane API unchanged, and a traversal's copy(graph, k, 'q') enters the queue from
   the node itself. What a graph adds is its edges, held on the lane with a state each (idle, seen,
   tree, cur, bad) and drawn in the under layer, border to border, so the nodes sit on top of them.
   A structure that GROWS while it plays (a call tree, kit/calltrees.js) still fixes every node's
   position up front: it names all its nodes, leaves their slots empty, and puts a node in its slot
   (and links its edge) when it appears, so nothing that is drawn ever moves.
   Node positions are authored by the lesson in grid units ({x, d}, the shape scene boards and
   graphView already use) and fixed for the player's life: a layout that moved when an edge was added
   would break the rule every player keeps, that only the items move.
   Spec: docs/superpowers/specs/2026-09-28-graph-player-design.md. Included by build.py only in
   lessons that draw a graph (KIT_OPTIONAL), always after lanes.js. */

/* room between neighbouring nodes: enough for a weight plate on a straight edge between them */
var GRGAPX=34,GRGAPY=30,GRPAD=6,GRLABEL=24,GRMARKS=34,GREDGE_STATES=['idle','seen','tree','cur','bad'];
function graphOf(M,id){var l=M.lane(id);if(l.kind!=='graph')throw new Error(id+' is not a graph');return l;}
/* an undirected edge is stored once, lower endpoint first; a directed one as written */
function graphKey(l,a,b){return l.directed?a+'>'+b:(a<b?a+'-'+b:b+'-'+a);}
function graphNode(l,k,what){if(!(k>=0&&k<l.cap&&k===Math.floor(k)))throw new Error(l.id+': '+what+' node '+k+' is out of range');}
function graphAdd(l,a,b,w){
  graphNode(l,a,'edge');graphNode(l,b,'edge');
  if(a===b)throw new Error(l.id+': edge ('+a+', '+b+') is a self-loop');
  var key=graphKey(l,a,b);if(l.edges[key])throw new Error(l.id+': edge ('+a+', '+b+') already exists');
  var lo=l.directed?a:Math.min(a,b),hi=l.directed?b:Math.max(a,b);
  l.edges[key]={a:lo,b:hi,w:w==null?null:w,state:'idle'};l.edgeOrder.push(key);
  return l.edges[key];
}
function graphEdge(l,a,b){var e=l.edges[graphKey(l,a,b)];if(!e)throw new Error(l.id+': no edge ('+a+', '+b+')');return e;}

LANE_KINDS.graph={
  fixed:true,
  /* its marks name nodes and sit under them, drawn (and glided) by the generic row marks */
  rowMarks:true,
  /* two tabs that each call their graph 'g' but draw different shapes are measured apart */
  key:function(l){return l.gap.join('x')+' '+l.nodes.map(function(n){return n.x+','+n.d;}).join(' ');},
  init:function(l,d){
    if(!Array.isArray(d.nodes)||!d.nodes.length)throw new Error(l.id+': a graph needs nodes');
    var seen={};
    l.nodes=d.nodes.map(function(n,k){
      if(!(n.x>=0&&n.d>=0))throw new Error(l.id+': node '+k+' needs a position {x, d}');
      var at=n.x+','+n.d;if(seen[at])throw new Error(l.id+': nodes '+seen[at][0]+' and '+k+' share the position ('+at+')');
      seen[at]=[k];return {x:n.x,d:n.d,l:n.l==null?String(k):String(n.l)};});
    /* Lanes pushes the cap empty slots after init, as for every fixed lane */
    l.cap=l.nodes.length;l.directed=!!d.directed;l.edges={};l.edgeOrder=[];
    /* gap: [x, y] room between neighbouring nodes (a tree with no weight plates needs far less);
       words: what each tone is called in the accessible description, for a lesson whose states have their own names */
    l.gap=d.gap||[GRGAPX,GRGAPY];l.words=d.words||null;
    /* plain: no "(directed)" after the label, where the arrows already say so (a call tree) */
    l.plain=!!d.plain;
    (d.edges||[]).forEach(function(e){graphAdd(l,e[0],e[1],e[2]);});
  },
  mark:function(l,name,slot){
    if(slot===null||slot===undefined){delete l.marks[name];return;}
    graphNode(l,slot,'marked');l.marks[name]=slot;
  },
  span:function(l){throw new Error(l.id+' is a graph: name a node with mark(), not span()');},
  /* edges are copied, so a later state change or unlink never reaches an earlier snapshot */
  snap:function(l,out){
    out.nodes=l.nodes.map(function(n){return {x:n.x,d:n.d,l:n.l};});out.directed=l.directed;out.gap=l.gap;out.words=l.words;out.plain=l.plain;
    out.edges=l.edgeOrder.map(function(k){var e=l.edges[k];return {key:k,a:e.a,b:e.b,w:e.w,state:e.state};});
  },

  /* ---------- the view ---------- */
  /* fixed for the player's life: cell size from every label and second line any snapshot shows */
  measure:function(m,l){
    /* the generic measure has already widened cw to a row cell's 56; a node box is its own size */
    m.gcw=Math.max(m.gcw||0,laneCellW(l.items,l.w||40));m.cw=m.gcw;
    if(l.items.some(function(x){return x&&x.sub;}))m.ch=LCH2;
    m.nodes=l.nodes;m.gap=l.gap;
  },
  block:function(m){
    var mx=0,md=0;m.nodes.forEach(function(n){mx=Math.max(mx,n.x);md=Math.max(md,n.d);});
    m.ux=m.cw+m.gap[0];m.uy=m.ch+m.gap[1];
    m.gw=mx*m.ux+m.cw+2*GRPAD;m.gh=GRLABEL+md*m.uy+m.ch+GRMARKS;
    return {w:m.gw,h:m.gh};
  },
  box:function(m,x0,y){
    return {kind:'graph',x:x0,y:y,w:m.gw,h:m.gh,cw:m.cw,ch:m.ch,label:m.label,nodes:m.nodes,ux:m.ux,uy:m.uy,
      left:x0+GRPAD+m.cw/2,top:y+GRLABEL+m.ch/2};
  },
  slotAt:function(b,k){var n=b.nodes[k];return {x:b.left+n.x*b.ux,y:b.top+n.d*b.uy};},

  svg:function(id,b,l,s){
    return '<g class="ln-lane gr-lane'+(s.hi.indexOf('lane:'+id)>=0?' hi':'')+'">'+
      '<text class="ln-label" x="'+b.x+'" y="'+(b.y+12)+'">'+laneEsc(b.label)+(l.directed&&!l.plain?' (directed)':'')+'</text></g>';
  },
  /* (layout and describe read a snapshot, whose edges are an array: see snap) each edge's two node centres, keyed by lane and endpoints so an unlink fades only its own line;
     a directed pair drawn both ways is pulled apart so the two arrows do not lie on one another */
  layout:function(l,b,extra){
    var edges=extra.grEdges||(extra.grEdges={}),K=LANE_KINDS.graph,has={};
    l.edges.forEach(function(e){has[e.key]=1;});
    l.edges.forEach(function(e){var k=e.key,p=K.slotAt(b,e.a),q=K.slotAt(b,e.b),off=0;
      if(l.directed&&has[e.b+'>'+e.a])off=5;
      if(off){var dx=q.x-p.x,dy=q.y-p.y,n=Math.sqrt(dx*dx+dy*dy)||1,ox=-dy/n*off,oy=dx/n*off;p={x:p.x+ox,y:p.y+oy};q={x:q.x+ox,y:q.y+oy};}
      edges[l.id+':'+k]={a:p,b:q,w:e.w,state:e.state,directed:l.directed,hw:b.cw/2,hh:b.ch/2};});
  },
  /* edges under the nodes, trimmed to the node boxes' borders (as the DP arrows are), so an arrowhead
     touches the box it points at; a state change crossfades, a link fades in and an unlink out */
  under:function(L,fromL,t,s){
    var to=L.extra.grEdges||{},from=fromL&&fromL.extra.grEdges||{},keys={},h=[];
    Object.keys(to).forEach(function(k){keys[k]=1;});Object.keys(from).forEach(function(k){keys[k]=1;});
    Object.keys(keys).forEach(function(k){var e=to[k],f=from[k];
      if(e&&f&&e.state!==f.state){h.push(graphEdgeSvg(f,1-t));h.push(graphEdgeSvg(e,t));}
      else if(e)h.push(graphEdgeSvg(e,f||!fromL?1:t));
      else h.push(graphEdgeSvg(f,1-t));});
    return h.join('');
  },
  /* on a phone: the endpoints of the edge a step is examining (its highlighted names are the
     generic row marks, which the player's own focus already reads) */
  focus:function(s,L,first){
    var E=L.extra.grEdges||{};
    Object.keys(E).forEach(function(k){var e=E[k];if(e.state!=='cur')return;
      first.push([Math.min(e.a.x,e.b.x)-e.hw,Math.max(e.a.x,e.b.x)+e.hw]);});
  },
  describe:function(l){
    var TONE=Object.assign({cur:'current',good:'done',bad:'rejected',dim:'finished'},l.words),STATE={idle:'',seen:'examined',tree:'chosen',cur:'current',bad:'rejected'};
    var name=function(k){var it=l.items[k];return it?it.v:l.nodes[k].l;};
    /* a slot still empty is a node that has not appeared yet: it is not there to describe */
    var nodes=l.items.map(function(it,k){if(!it)return null;var t=it.tone&&TONE[it.tone];return name(k)+(it.sub?' ('+it.sub+')':'')+(t?', '+t:'');}).filter(Boolean);
    var edges=l.edges.map(function(e){var st=STATE[e.state];return name(e.a)+(l.directed?' to ':'–')+name(e.b)+(e.w!=null?' weight '+e.w:'')+(st?', '+st:'');});
    var ms=Object.keys(l.marks).map(function(n){return n+' at '+name(l.marks[n]);});
    return 'Graph '+l.label+(l.directed?' (directed)':'')+'. Nodes: '+nodes.join('; ')+'. Edges: '+(edges.length?edges.join('; '):'none')+(ms.length?'. '+ms.join(', '):'')+'.';
  }
};
/* one edge at opacity op: a line whose ends stop at the two node boxes, an arrowhead when directed,
   and the weight on a plate over its midpoint so it stays legible where lines cross. State is a
   class, never a presentation attribute (CLAUDE.md §4), and tree and cur also draw thicker. */
function graphEdgeSvg(e,op){
  var dx=e.b.x-e.a.x,dy=e.b.y-e.a.y,n=Math.sqrt(dx*dx+dy*dy)||1,ux=dx/n,uy=dy/n;
  /* distance from a box's centre to its border along (ux, uy), plus a hair of air */
  var r=Math.min(ux?e.hw/Math.abs(ux):1e9,uy?e.hh/Math.abs(uy):1e9)+3;
  var x0=e.a.x+ux*r,y0=e.a.y+uy*r,x1=e.b.x-ux*r,y1=e.b.y-uy*r,cls='gr-edge '+e.state,h='<g class="'+cls+'" style="opacity:'+op.toFixed(3)+'">';
  if(e.directed){var ah=8,aw=4.5,bx=x1-ux*ah,by=y1-uy*ah;
    h+='<line x1="'+x0.toFixed(1)+'" y1="'+y0.toFixed(1)+'" x2="'+bx.toFixed(1)+'" y2="'+by.toFixed(1)+'"/>'+
      '<path d="M'+x1.toFixed(1)+','+y1.toFixed(1)+' L'+(bx-uy*aw).toFixed(1)+','+(by+ux*aw).toFixed(1)+' L'+(bx+uy*aw).toFixed(1)+','+(by-ux*aw).toFixed(1)+' Z"/>';}
  else h+='<line x1="'+x0.toFixed(1)+'" y1="'+y0.toFixed(1)+'" x2="'+x1.toFixed(1)+'" y2="'+y1.toFixed(1)+'"/>';
  if(e.w!=null){var tx=String(e.w),pw=tx.length*7.2+10,mx=(x0+x1)/2,my=(y0+y1)/2;
    h+='<rect class="gr-plate" x="'+(mx-pw/2).toFixed(1)+'" y="'+(my-9).toFixed(1)+'" width="'+pw.toFixed(1)+'" height="18" rx="5"/>'+
      '<text class="gr-weight" x="'+mx.toFixed(1)+'" y="'+(my+4).toFixed(1)+'" text-anchor="middle">'+laneEsc(tx)+'</text>';}
  return h+'</g>';
}

/* A tidy tree in the graph lane's grid units, for a tree that grows while it plays (a call tree, a trie):
   node 0 is the root, each node lists its kids in the order they are drawn and has a depth. Depth goes
   down, leaves go left to right in kid order, and every parent sits over the middle of its first and last
   child, so two nodes never share a position. */
function graphTreeLayout(nodes){
  var xs=[],leaf=0;
  (function put(i){var n=nodes[i];
    if(!n.kids.length){xs[i]=leaf++;return;}
    n.kids.forEach(put);xs[i]=(xs[n.kids[0]]+xs[n.kids[n.kids.length-1]])/2;})(0);
  return nodes.map(function(n,i){return {x:xs[i],d:n.depth};});
}

/* write every node's label into its slot (the lane's items, in node order), as grids' fill does */
Lanes.prototype.nodes=function(id){var l=graphOf(this,id),self=this;return l.nodes.map(function(n,k){return self.put(id,k,n.l);});};
/* an edge's record; with state, set it first. A typo'd edge throws rather than drawing nothing. */
Lanes.prototype.edge=function(id,a,b,state){
  var l=graphOf(this,id),e=graphEdge(l,a,b);
  if(state!==undefined){if(GREDGE_STATES.indexOf(state)<0)throw new Error(id+": edge state is one of "+GREDGE_STATES.join(', ')+", not "+state);e.state=state;}
  return e;
};
Lanes.prototype.hasEdge=function(id,a,b){var l=graphOf(this,id);return !!l.edges[graphKey(l,a,b)];};
/* the edges out of node a (directed) or at node a (undirected), in the order they were added */
Lanes.prototype.adj=function(id,a){var l=graphOf(this,id);graphNode(l,a,'asked');
  return l.edgeOrder.map(function(k){return l.edges[k];}).filter(function(e){return e.a===a||(!l.directed&&e.b===a);})
    .map(function(e){return {to:e.a===a?e.b:e.a,w:e.w};});};
/* structures whose edges ARE the state: a union-find forest re-points a parent, a clone grows */
Lanes.prototype.link=function(id,a,b,w){return graphAdd(graphOf(this,id),a,b,w);};
Lanes.prototype.unlink=function(id,a,b){var l=graphOf(this,id),k=graphKey(l,a,b);graphEdge(l,a,b);
  delete l.edges[k];l.edgeOrder.splice(l.edgeOrder.indexOf(k),1);};
Lanes.prototype.weight=function(id,a,b,w){graphEdge(graphOf(this,id),a,b).w=w;};
