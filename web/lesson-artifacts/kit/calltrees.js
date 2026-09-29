/* kit/calltrees.js: recursion and backtracking call trees, on lanes.js and graphs.js. It adds NO lane
   kind and no layout engine of its own: a call tree is a directed graph lane whose nodes are the calls,
   plus (optionally) the call stack as an ordinary stack lane whose frames are the calls on the current
   path. What is new is only the bookkeeping that makes a tree that GROWS honest under the player's rule
   that only items move:
     - The algorithm runs first, into a CallTrace (call / base / ret / prune). Once it has finished the
       whole tree is known, so every node's position is fixed before the first step is drawn (a tidy
       n-ary layout: leaves in call order, a parent over the middle of its children).
     - The graph lane names every call as a node and leaves its slot empty. A call fills its slot and
       links its edge when the call is made, so the tree grows and nothing already drawn moves.
   A call is in one of four states, named by what they mean and drawn with the lane tones:
     active   (cur)   on the path from the root: a call that has not returned; its edge is the path edge
     returned (dim)   done with, its box emptied to a dashed outline
     base     (good)  a base case: it returned without calling itself
     pruned   (bad)   attempted and cut before it was entered (a conflict, an overshoot); never on the path
   The state after k events is a PURE function of the first k events (callTreeState), and callTreeWalk
   re-reads every snapshot it records and throws when the drawing disagrees with that function, so a
   step can be shown out of order (a seek, a tab switch, the track) and mean the same thing.
   Included by build.py only in lessons that draw a call tree (KIT_OPTIONAL), after lanes.js and
   graphs.js. Spec: docs/superpowers/specs/2026-09-29-call-tree-player-design.md. */

var CT_TONE={active:'cur',returned:'dim',base:'good',pruned:'bad'};
var CT_STATE={cur:'active',dim:'returned',good:'base',bad:'pruned'};
/* what each tone is called by the graph lane's description and by the key beside the player */
var CT_WORDS={cur:'active',dim:'returned',good:'base case',bad:'pruned'};
var CT_MEANING={active:'active: on the path from the root',returned:'returned',base:'base case',pruned:'pruned'};
/* a tree carries no weight plates, so its nodes sit closer than a graph's */
var CT_GAP=[16,26];

function CallTrace(){this.nodes=[];this.events=[];this.open=[];}
CallTrace.prototype={
  _top:function(){return this.open.length?this.open[this.open.length-1]:-1;},
  _node:function(v,sub,frame){
    var p=this._top();if(p<0&&this.nodes.length)throw new Error('a call tree has one root: the first call has not returned');
    var n={id:this.nodes.length,v:String(v),sub:sub==null?'':String(sub),parent:p,kids:[],frame:frame||null,depth:p<0?0:this.nodes[p].depth+1};
    this.nodes.push(n);if(p>=0)this.nodes[p].kids.push(n.id);return n;
  },
  /* a call is made: it joins the path, and its frame [value, locals] the stack (the label and args by default) */
  call:function(v,sub,note,frame){var n=this._node(v,sub,frame);this.open.push(n.id);this.events.push({ev:'call',node:n.id,note:note||null});return n.id;},
  /* the innermost call reached its base case and returns val (optional) without calling itself */
  base:function(id,val,note){return this._close(id,'base',val,note);},
  /* the innermost call has run every branch and returns val (optional) to its caller: the unchoose */
  ret:function(id,val,note){return this._close(id,'ret',val,note);},
  /* a child was attempted and cut before it was entered: it appears, marked, and the caller carries on */
  prune:function(v,sub,note){if(this._top()<0)throw new Error('a pruned call needs a caller: it is a child that was cut');var n=this._node(v,sub,null);this.events.push({ev:'prune',node:n.id,note:note||null});return n.id;},
  _close:function(id,ev,val,note){
    if(this._top()!==id)throw new Error(ev+'('+id+'): call '+id+' is not the innermost open call');
    this.open.pop();this.events.push({ev:ev,node:id,val:val==null?null:String(val),note:note||null});return id;
  },
  /* a finished trace has no call still open and at least a root */
  done:function(){if(!this.nodes.length)throw new Error('an empty call tree');if(this.open.length)throw new Error('call '+this.open[this.open.length-1]+' never returned');return this;}
};

/* where each node sits: the tidy tree layout, shared with tries (graphTreeLayout in graphs.js) */
function callTreeLayout(nodes){return graphTreeLayout(nodes);}

/* the whole picture after the first k events, from the events alone: every call that exists, its
   state and its second line, the edge into it, and the path from the root, root first */
function callTreeState(trace,k){
  var nodes={},edges={},path=[];
  /* past the last event nothing more happens: the outro step shows the finished tree */
  for(var j=0;j<k&&j<trace.events.length;j++){
    var e=trace.events[j],n=trace.nodes[e.node];
    if(e.ev==='call'){nodes[n.id]={state:'active',sub:n.sub};path.push(n.id);}
    else if(e.ev==='prune')nodes[n.id]={state:'pruned',sub:n.sub};
    else{
      if(path.pop()!==n.id)throw new Error('event '+j+' returns call '+n.id+', which is not the innermost');
      nodes[n.id]={state:e.ev==='base'?'base':'returned',sub:e.val!=null?'= '+e.val:n.sub};
    }
  }
  Object.keys(nodes).forEach(function(id){var n=trace.nodes[id];if(n.parent<0)return;
    edges[id]=nodes[id].state==='pruned'?'bad':(path.indexOf(n.id)>=0?'cur':'idle');});
  return {nodes:nodes,edges:edges,path:path};
}

/* the same picture read back off a recorded snapshot's tree lane, with no access to the trace */
function callTreeRead(snap,laneId){
  var l=snap.lanes.filter(function(x){return x.id===(laneId||'tree');})[0];
  if(!l)throw new Error('no call tree lane in this snapshot');
  var nodes={},edges={},act=[];
  l.items.forEach(function(it,k){if(!it)return;
    nodes[k]={state:CT_STATE[it.tone]||'?',sub:it.sub||''};if(it.tone==='cur')act.push(k);});
  l.edges.forEach(function(e){edges[e.b]=e.state;});
  act.sort(function(a,b){return l.nodes[a].d-l.nodes[b].d;});
  return {nodes:nodes,edges:edges,path:act};
}

/* invariants the player shows, for LanePlayer's inv option: the active calls are one per depth from the
   root, the call stack (when the walkthrough draws one) holds exactly as many frames as there are calls
   on that path, and a pruned call has nothing below it */
var CALLTREE_INV=[
  ['stack = path','the call stack holds one frame for each call on the path from the root',function(s){
    var t=callTreeRead(s),st=s.lanes.filter(function(x){return x.id==='stack';})[0];
    return !st||st.items.length===t.path.length;}],
  ['a path','the active calls are one per depth from the root down, with no gaps',function(s){
    var l=s.lanes.filter(function(x){return x.id==='tree';})[0],t=callTreeRead(s);
    return t.path.every(function(id,d){return l.nodes[id].d===d;});}],
  ['pruned are leaves','a pruned call was never entered, so nothing hangs below it',function(s){
    var l=s.lanes.filter(function(x){return x.id==='tree';})[0];
    return l.edges.every(function(e){var it=l.items[e.a];return !it||it.tone!=='bad';});}]
];

/* throws when a drawn step is not what the events say it should be */
function callTreeSame(want,got,k){
  var bad=null;
  Object.keys(want.nodes).concat(Object.keys(got.nodes)).forEach(function(id){
    var a=want.nodes[id],b=got.nodes[id];
    if(!bad&&(!a||!b||a.state!==b.state||a.sub!==b.sub))bad='call '+id+' should be '+JSON.stringify(a)+' but is drawn '+JSON.stringify(b);});
  Object.keys(want.edges).concat(Object.keys(got.edges)).forEach(function(id){
    if(!bad&&want.edges[id]!==got.edges[id])bad='the edge into call '+id+' should be '+want.edges[id]+' but is drawn '+got.edges[id];});
  if(!bad&&want.path.join()!==got.path.join())bad='the path should be '+want.path.join('>')+' but is drawn '+got.path.join('>');
  if(bad)throw new Error('call tree step '+k+': '+bad);
}

/* Record a finished trace as steps for a LanePlayer. o.label names the tree lane, o.stack:false drops
   the call stack, o.lanes are further lanes for the lesson to work in from o.on(ev, node, M, items)
   (the answers collected so far, a board), which may return more highlights; o.fields(M) adds to the
   fields line; o.intro and o.outro are the first and last captions. The result carries .states, the
   states that occur, for the key. */
function callTreeWalk(trace,o){
  o=o||{};trace.done();
  var pos=callTreeLayout(trace.nodes),item={},frame={},path=[],called=0,pruned=0,states={},steps=[],
      defs=[{id:'tree',kind:'graph',label:o.label||'call tree',directed:true,plain:true,gap:CT_GAP,words:CT_WORDS,
        nodes:pos.map(function(p,k){return {x:p.x,d:p.d,l:trace.nodes[k].v};})}];
  if(o.stack!==false)defs.push({id:'stack',kind:'stack',label:'call stack'});
  (o.lanes||[]).forEach(function(d){defs.push(d);});
  var M=new Lanes(defs,{fields:function(){
    var f=[['depth',path.length],['calls',called]];if(trace.events.some(function(e){return e.ev==='prune';}))f.push(['pruned',pruned]);
    return f.concat(o.fields?o.fields(M):[]);}});
  function rec(note,hi){var k=steps.length;steps.push(M.snap(note,{hi:hi||[],done:true}));callTreeSame(callTreeState(trace,k),callTreeRead(steps[k]),k);}
  function name(n){return '<code>'+laneEsc(n.v+(n.sub?' · '+n.sub:''))+'</code>';}
  function born(n,tone,edge){
    var it=M.put('tree',n.id,n.v,n.sub);M.tone(it,tone);item[n.id]=it;
    if(n.parent>=0){M.link('tree',n.parent,n.id);M.edge('tree',n.parent,n.id,edge);}
    return it;
  }
  rec(o.intro||'Nothing has been called yet. The tree grows one call at a time, and the path from the root is the chain of calls that have not returned.');
  trace.events.forEach(function(e){
    var n=trace.nodes[e.node],hi,note,it;
    if(e.ev==='call'){
      it=born(n,'cur','cur');called++;path.push(n.id);hi=[laneHi(it)];
      if(o.stack!==false){var prev=M.peek('stack');if(prev)M.tone(prev,null);
        var fr=n.frame||[n.v,n.sub];frame[n.id]=M.push('stack',fr[0],fr[1]||undefined);M.tone(frame[n.id],'cur');hi.push(laneHi(frame[n.id]));}
      note=e.note||'Call '+name(n)+'.';states.active=1;
    }else if(e.ev==='prune'){
      hi=[laneHi(born(n,'bad','bad'))];pruned++;note=e.note||'Cut '+name(n)+' before entering it.';states.pruned=1;
    }else{
      var base=e.ev==='base';it=item[n.id];
      M.tone(it,base?'good':'dim');if(e.val!=null)M.set(it,undefined,'= '+e.val);
      if(n.parent>=0)M.edge('tree',n.parent,n.id,'idle');
      path.pop();hi=[laneHi(it)];
      if(n.parent>=0)hi.push(laneHi(item[n.parent]));
      if(o.stack!==false){M.pop('stack');var t=M.peek('stack');if(t)M.tone(t,'cur');}
      states[base?'base':'returned']=1;
      note=e.note||(base?'Base case '+name(n)+(e.val!=null?': it returns '+laneEsc(e.val)+' without calling itself.':'.'):name(n)+' returns'+(e.val!=null?' '+laneEsc(e.val):'')+' and is done with.');
    }
    if(o.on){var more=o.on(e,n,M,item);if(more)hi=hi.concat(more);}
    rec(note,hi);
  });
  rec(o.outro||'Every call has returned, so the path is empty again. '+trace.nodes.length+' calls made in all.');
  steps.states=['active','returned','base','pruned'].filter(function(k){return states[k];});
  return steps;
}

/* The key of the states a walkthrough uses is the lane player's own (laneKey); set() takes state names. */
function callTreeKey(host,before){
  var k=laneKey(host,before),entries=function(states){return states&&states.map(function(s){return {tone:CT_TONE[s],label:CT_MEANING[s]};});};
  return {el:k.el,set:function(states){k.set(entries(states));},reserve:function(list){k.reserve(list.map(entries));}};
}
/* tabbed call-tree walkthroughs: each example's steps() comes from callTreeWalk, and the key follows the tab */
function mountCallTreeTabs(w,examples,o){
  var host=w.querySelector('.lvhost'),key=callTreeKey(host.parentNode,host),seen=[];
  var wrapped=examples.map(function(e,k){return {name:e.name,steps:function(){var s=e.steps();seen[k]=s.states;return s;}};});
  var p=mountLaneTabs(w,wrapped,Object.assign({inv:CALLTREE_INV},o));
  [].forEach.call(w.querySelectorAll('.extabs button'),function(b,k){b.addEventListener('click',function(){key.set(seen[k]);});});
  key.reserve(seen);key.set(seen[0]);
  return p;
}
