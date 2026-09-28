/* kit/graphs.js: the graph lane, registered on lanes.js's seam (LANE_KINDS). A graph is a fixed lane
   of nodes (items) drawn at author-specified positions, with edges between them. Nodes have fixed
   positions on a grid; edges have states and can be added or removed while the player runs.
   Spec: docs/superpowers/specs/2026-09-28-graph-player-design.md. Included by build.py only in
   lessons that use kind:'graph' (KIT_OPTIONAL), always after lanes.js. */

var GXUNIT=48,GYUNIT=48,GNODEW=32,GNODEH=32,GPADX=16,GPADY=16;
/* store edges by (min, max) key for undirected, or directed key for directed */
function graphOf(M,id){var l=M.lane(id);if(l.kind!=='graph')throw new Error(id+' is not a graph');return l;}
function graphKey(a,b,directed){return directed?a+'>'+b:(a<b?a+','+b:b+','+a);}

LANE_KINDS.graph={
  fixed:true,
  key:function(l){return l.nodes.length+'n';},
  init:function(l,d){
    if(!d.nodes||!Array.isArray(d.nodes))throw new Error(l.id+': graph needs nodes array');
    if(!d.edges||!Array.isArray(d.edges))throw new Error(l.id+': graph needs edges array');
    l.nodes=d.nodes.slice();l.directed=!!d.directed;l.cap=l.nodes.length;
    l.edgeMap={};l.edgeList=[];
    d.edges.forEach(function(e){
      var a=e[0],b=e[1],w=e[2];
      if(!(a>=0&&a<l.cap&&b>=0&&b<l.cap))throw new Error(l.id+': edge ('+a+', '+b+') endpoint out of range');
      var key=graphKey(a,b,l.directed);
      if(l.edgeMap[key]!==undefined)throw new Error(l.id+': duplicate edge ('+a+', '+b+')');
      l.edgeMap[key]={state:'idle',a:l.directed?a:Math.min(a,b),b:l.directed?b:Math.max(a,b),w:w,directed:l.directed};
      l.edgeList.push(l.edgeMap[key]);
    });
    for(var k=0;k<l.cap;k++)l.items.push(null);
  },
  mark:function(l,name,slot){
    if(slot===null||slot===undefined)delete l.marks[name];
    else{if(!(slot>=0&&slot<l.cap))throw new Error(l.id+': node '+slot+' is out of range');l.marks[name]=slot;}
  },
  span:function(l){throw new Error(l.id+' is a graph: span() does not apply');},
  snap:function(l,out){
    out.nodes=l.nodes.slice();out.directed=l.directed;
    out.edgeMap={};out.edgeList=[];
    Object.keys(l.edgeMap).forEach(function(k){var e=l.edgeMap[k];out.edgeMap[k]={state:e.state,a:e.a,b:e.b,w:e.w,directed:e.directed};});
    l.edgeList.forEach(function(e){out.edgeList.push(out.edgeMap[graphKey(e.a,e.b,l.directed)]);});
  },

  /* ---------- the view ---------- */
  measure:function(m,l){
    m.cw=GNODEW;m.ch=GNODEH;m.nodes=l.nodes.length;
    if(l.items.some(function(x){return x&&x.sub;}))m.ch=50;
    var maxX=0,maxD=0;
    l.nodes.forEach(function(n){maxX=Math.max(maxX,n.x||0);maxD=Math.max(maxD,n.d||0);});
    m.maxX=maxX;m.maxD=maxD;
  },
  block:function(m){
    var w=(m.maxX+1)*GXUNIT+2*GPADX,h=(m.maxD+1)*GYUNIT+2*GPADY;
    return {w:Math.max(w,100),h:Math.max(h,100)};
  },
  box:function(m,x0,y){
    var w=(m.maxX+1)*GXUNIT+2*GPADX,h=(m.maxD+1)*GYUNIT+2*GPADY;
    return {kind:'graph',x:x0,y:y,w:Math.max(w,100),h:Math.max(h,100),cw:m.cw,ch:m.ch,
      left:x0+GPADX,top:y+GPADY,xunit:GXUNIT,yunit:GYUNIT,label:m.label,nodes:m.nodes};
  },
  slotAt:function(b,k){
    var n=b.nodes[k];if(!n)return {x:b.left,y:b.top};
    return {x:b.left+(n.x||0)*b.xunit+b.xunit/2,y:b.top+(n.d||0)*b.yunit+b.yunit/2};
  },

  svg:function(id,b,l,s){
    var h='<g class="ln-lane gr-lane'+(s.hi.indexOf('lane:'+id)>=0?' hi':'')+'">';
    h+='<text class="ln-label" x="'+b.x+'" y="'+(b.y+14)+'">'+laneEsc(b.label)+'</text>';
    return h+'</g>';
  },
  layout:function(l,b,out){
    var nodes=out.grNodes||(out.grNodes={}),edges=out.grEdges||(out.grEdges={});
    var K=LANE_KINDS.graph;
    l.items.forEach(function(it,k){if(!it)return;
      var c=K.slotAt(b,k);
      nodes[it.id]={x:c.x,y:c.y,w:b.cw,h:b.ch,v:it.v,sub:it.sub,tone:it.tone,idx:k};
    });
    l.edgeList.forEach(function(e,i){
      var apos=K.slotAt(b,e.a),bpos=K.slotAt(b,e.b);
      edges[l.id+'#'+i]={a:apos,b:bpos,w:e.w,state:e.state,directed:e.directed};
    });
  },
  under:function(L,fromL,t,s){
    var to=L.extra.grEdges||{},from=fromL&&fromL.extra.grEdges||{},keys={},h=[];
    Object.keys(to).forEach(function(k){keys[k]=1;});Object.keys(from).forEach(function(k){keys[k]=1;});
    var lerp=function(a,b){return a+(b-a)*t;};
    Object.keys(keys).forEach(function(k){var e=to[k],f=fromL?from[k]:null,op,state;
      if(e&&f){op=1;state=e.state;}else if(e){op=fromL?t:1;state=e.state;}else{op=1-t;state=f.state;}
      if(!e&&!f)return;
      var ea=e?e.a:f.a,eb=e?e.b:f.b;
      if(f&&e){ea={x:lerp(f.a.x,e.a.x),y:lerp(f.a.y,e.a.y)};eb={x:lerp(f.b.x,e.b.x),y:lerp(f.b.y,e.b.y)};}
      var dx=eb.x-ea.x,dy=eb.y-ea.y,len=Math.sqrt(dx*dx+dy*dy)||1,ux=dx/len,uy=dy/len;
      var r=GNODEW/2,x0=ea.x+ux*r,y0=ea.y+uy*r,x1=eb.x-ux*r,y1=eb.y-uy*r;
      var cls='gr-edge '+state+(s.hi.indexOf(k)>=0?' hi':'');
      h.push('<line class="'+cls+'" style="opacity:'+op.toFixed(3)+'" x1="'+x0.toFixed(1)+'" y1="'+y0.toFixed(1)+'" x2="'+x1.toFixed(1)+'" y2="'+y1.toFixed(1)+'"/>');
      if((e||f).directed){
        var ah=6,aw=4,bx=x1-ux*ah,by=y1-uy*ah,nx=-uy*aw,ny=ux*aw;
        h.push('<path class="'+cls+'" style="opacity:'+op.toFixed(3)+'" d="M'+x1.toFixed(1)+','+y1.toFixed(1)+' L'+(bx+nx).toFixed(1)+','+(by+ny).toFixed(1)+' L'+(bx-nx).toFixed(1)+','+(by-ny).toFixed(1)+' Z"/>');
      }
      if((e||f).w){
        var mx=(x0+x1)/2,my=(y0+y1)/2,wtext=laneEsc((e||f).w);
        h.push('<g style="opacity:'+op.toFixed(3)+'"><rect class="gr-wplate" x="'+(mx-18)+'" y="'+(my-8)+'" width="36" height="16" rx="4"/>'+
          '<text class="gr-wtext" x="'+mx.toFixed(1)+'" y="'+(my+4)+'" text-anchor="middle">'+wtext+'</text></g>');
      }
    });
    return h.join('');
  },
  over:function(L,fromL,t,s){
    var to=L.extra.grNodes||{},from=fromL&&fromL.extra.grNodes||{},keys={},h=[];
    Object.keys(to).forEach(function(k){keys[k]=1;});Object.keys(from).forEach(function(k){keys[k]=1;});
    var lerp=function(a,b){return a+(b-a)*t;};
    Object.keys(keys).forEach(function(k){var n=to[k]||from[k],op=(to[k]&&from[k])?1:(to[k]?(fromL?t:1):1-t);
      if(!n)return;
      var pos=n,tone=n.tone?' '+n.tone:'';
      h.push('<g class="ln-item gr-node'+tone+(s.hi.indexOf('item:'+k)>=0?' hi':'')+'" style="opacity:'+op.toFixed(3)+'">'+
        '<circle class="gr-nodecircle" cx="'+pos.x.toFixed(1)+'" cy="'+pos.y.toFixed(1)+'" r="'+GNODEW/2+'"/>'+
        '<text class="ln-val" x="'+pos.x.toFixed(1)+'" y="'+(pos.y+5.5)+'" text-anchor="middle">'+laneEsc(n.v)+'</text>'+
        (n.sub?'<text class="ln-sub" x="'+pos.x.toFixed(1)+'" y="'+(pos.y+19)+'" text-anchor="middle">'+laneEsc(n.sub)+'</text>':'')+'</g>');
    });
    return h.join('');
  },
  focus:function(s,L,first){
    s.lanes.forEach(function(l){if(l.kind!=='graph')return;
      Object.keys(l.marks).forEach(function(nm){if(s.hi.indexOf(nm)<0)return;var n=l.items[l.marks[nm]];if(!n)return;
        var a=L.items[n.id];if(a)first.push([a.x-20,a.x+20]);});});
  },
  describe:function(l){
    var nodes=[];for(var k=0;k<l.items.length;k++){var n=l.items[k];nodes.push((k+': '+(n?n.v+(n.sub?' ('+n.sub+')':''):'empty')));}
    var edges=[];l.edgeList.forEach(function(e){edges.push(e.a+'–'+e.b+' '+e.state+(e.w?' weight '+e.w:''));});
    var ms=Object.keys(l.marks).map(function(nm){return nm+' at '+l.marks[nm];});
    return 'Graph '+l.label+(l.directed?' (directed)':'')+'.\nNodes: '+nodes.join(', ')+'.\nEdges: '+edges.join(', ')+(ms.length?'.\nMarks: '+ms.join(', '):'')+'.';}
};

Lanes.prototype.edge=function(id,a,b,state){
  var l=graphOf(this,id);
  var key=graphKey(a,b,l.directed);if(!l.edgeMap[key])throw new Error(id+': no edge ('+a+', '+b+')');
  if(state!==undefined)l.edgeMap[key].state=state;
  return l.edgeMap[key];
};
Lanes.prototype.link=function(id,a,b,w){
  var l=graphOf(this,id);
  if(!(a>=0&&a<l.cap&&b>=0&&b<l.cap))throw new Error(id+': node out of range');
  var key=graphKey(a,b,l.directed);if(l.edgeMap[key]!==undefined)throw new Error(id+': edge ('+a+', '+b+') already exists');
  l.edgeMap[key]={state:'idle',a:l.directed?a:Math.min(a,b),b:l.directed?b:Math.max(a,b),w:w,directed:l.directed};
  l.edgeList.push(l.edgeMap[key]);return l.edgeMap[key];
};
Lanes.prototype.unlink=function(id,a,b){
  var l=graphOf(this,id);
  var key=graphKey(a,b,l.directed);if(l.edgeMap[key]===undefined)throw new Error(id+': no edge ('+a+', '+b+')');
  var e=l.edgeMap[key];
  l.edgeList=l.edgeList.filter(function(x){return x!==e;});
  delete l.edgeMap[key];
};
Lanes.prototype.weight=function(id,a,b,w){
  var l=graphOf(this,id);
  var key=graphKey(a,b,l.directed);if(!l.edgeMap[key])throw new Error(id+': no edge ('+a+', '+b+')');
  l.edgeMap[key].w=w;
};
