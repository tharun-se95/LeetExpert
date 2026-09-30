/* kit/tries.js: tries (prefix trees), on lanes.js and graphs.js. Like calltrees.js it adds NO lane kind:
   a trie is a directed graph lane whose nodes are the trie's nodes. What is new is the bookkeeping that keeps
   a tree that GROWS honest under the player's rule that only items move:
     - TrieTrace IS the trie. The lesson's real algorithm walks it (child is a lookup; make, go, miss, end,
       unend, found, back, drop and reset each record one step), so once the algorithm has finished every
       node that ever existed is known and its position is fixed before the first step is drawn (the tidy
       layout in graphs.js, children in letter order).
     - A node shows its letter (the root shows "", the empty prefix), and the word that ends at it on its
       second line: the end-of-word flag as text, never as colour. The cursor is the mark 'node', the
       variable the lessons walk with; the edges from the root to it are the current path, and the fields
       line spells the prefix so far.
   A node is in one of four states, named by what they mean and drawn with the lane tones:
     path     (cur)   on the walk from the root to the cursor
     found    (good)  a query succeeded here (it stays found after the walk leaves, until a reset)
     dead     (bad)   a branch the walk left with no way on (a miss itself only lights the node: the
                      node may still go on by another letter)
     explored (dim)   walked into and left without a verdict
   The state after k steps is a PURE function of the first k (trieState), and trieWalk reads every snapshot
   it records back (trieRead) and throws when the drawing disagrees, so a step can be shown out of order (a
   seek, a tab switch, the track) and mean the same thing.
   Included by build.py only in lessons that draw a trie (KIT_OPTIONAL), after lanes.js and graphs.js.
   Spec: docs/superpowers/specs/2026-09-30-trie-player-design.md. Names are prefixed (trie*, TR_*). */

var TR_TONE={path:'cur',found:'good',dead:'bad',explored:'dim'};
var TR_STATE={cur:'path',good:'found',bad:'dead',dim:'explored'};
/* what each tone is called by the graph lane's description and by the key beside the player */
var TR_WORDS={cur:'on the walk',good:'found',bad:'dead end',dim:'explored'};
var TR_MEANING={path:'on the walk: from the root to node',found:'found: the query succeeds here',
  dead:'dead end: no stored word continues this way',explored:'explored: walked into and left'};
/* a tree carries no weight plates, so its nodes sit as close as a call tree's */
var TR_GAP=[16,26];

function TrieTrace(){
  this.nodes=[{id:0,ch:'',parent:-1,kids:{},depth:0,gone:false,word:''}];
  this.at=0;this.events=[];
}
TrieTrace.prototype={
  _cur:function(){return this.nodes[this.at];},
  _ev:function(ev,note,data,x){var e={ev:ev,node:this.at,note:note||null,data:data===undefined?null:data};
    if(x)Object.keys(x).forEach(function(k){e[k]=x[k];});this.events.push(e);return e;},
  _ch:function(ch,what){if(typeof ch!=='string'||ch.length!==1)throw new Error(what+': a trie edge is one character, not '+JSON.stringify(ch));},
  /* the cursor's child for ch, or -1: a lookup the algorithm branches on, not a step */
  child:function(ch){var k=this._cur().kids[ch];return k===undefined?-1:k;},
  /* the cursor's children, in letter order (a wildcard tries each) */
  children:function(){var n=this._cur();return Object.keys(n.kids).sort().map(function(ch){return n.kids[ch];});},
  /* the word stored at the cursor, or '' */
  word:function(){return this._cur().word;},
  /* the prefix the cursor spells */
  prefix:function(id){var s='',n=this.nodes[id===undefined?this.at:id];while(n.parent>=0){s=n.ch+s;n=this.nodes[n.parent];}return s;},
  /* a new child of the cursor, which moves into it */
  make:function(ch,note,data){
    this._ch(ch,'make');var p=this._cur();
    if(p.kids[ch]!==undefined)throw new Error('make: node '+p.id+' already has a child '+ch+': go to it instead');
    var n={id:this.nodes.length,ch:ch,parent:p.id,kids:{},depth:p.depth+1,gone:false,word:''};
    this.nodes.push(n);p.kids[ch]=n.id;this.at=n.id;this._ev('make',note,data);return n.id;
  },
  /* the cursor moves to an existing child */
  go:function(id,note,data){
    var n=this.nodes[id],p=this._cur();
    if(!n||n.gone||n.parent!==p.id)throw new Error('go: node '+id+' is not a child of the cursor (node '+p.id+')');
    this.at=id;this._ev('go',note,data);return id;
  },
  /* the cursor has no child ch: the walk ends here */
  miss:function(ch,note,data){
    this._ch(ch,'miss');if(this._cur().kids[ch]!==undefined)throw new Error('miss: node '+this.at+' does have a child '+ch);
    this._ev('miss',note,data,{ch:ch});
  },
  /* the end-of-word flag: the word that ends at the cursor; unend clears it */
  end:function(word,note,data){
    if(!this.at)throw new Error('end: the root is the empty prefix, not a word');
    if(word!==this.prefix())throw new Error('end: the cursor spells '+JSON.stringify(this.prefix())+', not '+JSON.stringify(word));
    this._cur().word=word;this._ev('end',note,data,{word:word});
  },
  unend:function(note,data){if(!this._cur().word)throw new Error('unend: no word ends at node '+this.at);this._cur().word='';this._ev('unend',note,data);},
  found:function(note,data){this._ev('found',note,data);},
  /* the cursor returns to the parent; dead says the node it leaves has no way on */
  back:function(dead,note,data){
    var n=this._cur();if(n.parent<0)throw new Error('back: the cursor is at the root');
    this._ev('back',note,data,{dead:!!dead});this.at=n.parent;
  },
  /* the cursor's node, a leaf with no word, is removed; the cursor returns to the parent */
  drop:function(note,data){
    var n=this._cur();
    if(n.parent<0)throw new Error('drop: the root cannot be removed');
    if(Object.keys(n.kids).length)throw new Error('drop: node '+n.id+' still has children');
    if(n.word)throw new Error('drop: node '+n.id+' still ends the word '+n.word);
    this._ev('drop',note,data);n.gone=true;delete this.nodes[n.parent].kids[n.ch];this.at=n.parent;
  },
  /* a new query: every state cleared, the cursor at the root */
  reset:function(note,data){this.at=0;this._ev('reset',note,data);},
  done:function(){if(!this.events.length)throw new Error('an empty trie walkthrough');return this;}
};

/* the nodes as the tidy layout wants them: kids in letter order, including nodes removed later (their
   slot stays reserved, so nothing drawn ever moves) */
function trieShape(T){
  var all={};T.nodes.forEach(function(n){all[n.id]=[];});
  T.nodes.forEach(function(n){if(n.parent>=0)all[n.parent].push(n);});
  return T.nodes.map(function(n){return {kids:all[n.id].sort(function(a,b){return a.ch<b.ch?-1:a.ch>b.ch?1:0;}).map(function(k){return k.id;}),depth:n.depth};});
}

/* the whole picture after the first k steps, from the events alone: every node that exists, its state and
   word, the edge into it (cur on the path from the root to the cursor, else idle), and the cursor */
function trieState(T,k){
  var nodes={0:{state:'path',word:'',hit:false}},cur=0;
  function path(){var p={},n=cur;while(n>=0){p[n]=1;n=T.nodes[n].parent;}return p;}
  for(var j=0;j<k&&j<T.events.length;j++){
    var e=T.events[j],id=e.node;
    if(e.ev==='make'){nodes[id]={state:'path',word:'',hit:false};cur=id;}
    else if(e.ev==='go'){nodes[id].state='path';cur=id;}
    /* a miss is a lookup that failed: the step lights the node, and its state is decided when the walk leaves it */
    else if(e.ev==='end')nodes[id].word=e.word;
    else if(e.ev==='unend')nodes[id].word='';
    else if(e.ev==='found'){nodes[id].state='found';nodes[id].hit=true;}
    else if(e.ev==='back'){var b=nodes[id];b.state=b.hit?'found':e.dead?'dead':'explored';cur=T.nodes[id].parent;}
    else if(e.ev==='drop'){delete nodes[id];cur=T.nodes[id].parent;}
    else if(e.ev==='reset'){Object.keys(nodes).forEach(function(n){nodes[n].state=null;nodes[n].hit=false;});nodes[0].state='path';cur=0;}
  }
  var on=path(),edges={},out={};
  Object.keys(nodes).forEach(function(n){out[n]={state:nodes[n].state,word:nodes[n].word};if(+n)edges[n]=on[n]?'cur':'idle';});
  return {nodes:out,edges:edges,cursor:cur};
}

/* the same picture read back off a recorded snapshot's trie lane, with no access to the trace */
function trieRead(snap,laneId){
  var l=snap.lanes.filter(function(x){return x.id===(laneId||'trie');})[0];
  if(!l)throw new Error('no trie lane in this snapshot');
  var nodes={},edges={};
  l.items.forEach(function(it,k){if(!it)return;nodes[k]={state:it.tone?(TR_STATE[it.tone]||'?'):null,word:it.sub||''};});
  l.edges.forEach(function(e){edges[e.b]=e.state;});
  return {nodes:nodes,edges:edges,cursor:l.marks.node===undefined?-1:l.marks.node};
}

/* throws when a drawn step is not what the events say it should be */
function trieSame(want,got,k){
  var bad=null;
  Object.keys(want.nodes).concat(Object.keys(got.nodes)).forEach(function(id){
    var a=want.nodes[id],b=got.nodes[id];
    if(!bad&&(!a||!b||a.state!==b.state||a.word!==b.word))bad='node '+id+' should be '+JSON.stringify(a)+' but is drawn '+JSON.stringify(b);});
  Object.keys(want.edges).concat(Object.keys(got.edges)).forEach(function(id){
    if(!bad&&want.edges[id]!==got.edges[id])bad='the edge into node '+id+' should be '+want.edges[id]+' but is drawn '+got.edges[id];});
  if(!bad&&want.cursor!==got.cursor)bad='the cursor should be at node '+want.cursor+' but is drawn at '+got.cursor;
  if(bad)throw new Error('trie step '+k+': '+bad);
}

/* invariants the player shows, for LanePlayer's inv option */
function trieLaneOf(s){return s.lanes.filter(function(x){return x.id==='trie';})[0];}
var TRIE_INV=[
  ['a path','the current edges form one chain from the root down to node',function(s){
    var l=trieLaneOf(s),cur=l.marks.node,into={};l.edges.forEach(function(e){into[e.b]=e;});
    var on=0,n=cur;while(n!==0&&into[n]){if(into[n].state!=='cur')return false;on++;n=into[n].a;}
    return n===0&&on===l.edges.filter(function(e){return e.state==='cur';}).length;}],
  ['one parent','every node but the root has exactly one edge into it',function(s){
    var l=trieLaneOf(s),into={};l.edges.forEach(function(e){into[e.b]=(into[e.b]||0)+1;});
    return l.items.every(function(it,k){return !it||(k===0?!into[0]:into[k]===1);});}],
  ['letters unique','no two children of a node share a letter',function(s){
    var l=trieLaneOf(s),seen={};
    return l.edges.every(function(e){var key=e.a+':'+l.nodes[e.b].l;if(seen[key])return false;seen[key]=1;return true;});}]
];

/* Record a finished trace as steps for a LanePlayer. o.label names the trie lane; o.lanes are further lanes
   for the lesson (a board, the words found), filled by o.init(M, items) before the first step and driven
   from o.on(ev, M, items), each of which may return more highlights; o.fields(M) adds to the fields line; o.intro and o.outro are the first and last captions.
   The result carries .states, the states that occur, for the key. */
function trieWalk(T,o){
  o=o||{};T.done();
  var pos=graphTreeLayout(trieShape(T)),item={},steps=[],states={path:1},cur=0,
      defs=[{id:'trie',kind:'graph',label:o.label||'trie',directed:true,plain:true,gap:TR_GAP,words:TR_WORDS,
        nodes:pos.map(function(p,k){return {x:p.x,d:p.d,l:k?T.nodes[k].ch:'""'};})}];
  (o.lanes||[]).forEach(function(d){defs.push(d);});
  var M=new Lanes(defs,{fields:function(){return [['prefix','"'+T.prefix(cur)+'"']].concat(o.fields?o.fields(M):[]);}});
  function rec(note,hi){var k=steps.length;steps.push(M.snap(note,{hi:hi||[],done:true}));trieSame(trieState(T,k),trieRead(steps[k]),k);}
  function tone(id,st){M.tone(item[id],TR_TONE[st]);if(st)states[st]=1;}
  function to(id){cur=id;M.mark('trie','node',id);}
  function parent(id){return T.nodes[id].parent;}
  function q(s){return '<code>'+laneEsc(s)+'</code>';}
  /* a node's state after a walk leaves it: found stays found until a reset */
  var hit={};
  item[0]=M.put('trie',0,'""');tone(0,'path');to(0);
  var introHi=o.init?o.init(M,item):null;
  rec(o.intro||'An empty trie is just its root, the empty prefix "". The cursor <code>node</code> starts there.',introHi||[]);
  T.events.forEach(function(e){
    var id=e.node,n=T.nodes[id],hi=[],note=e.note;
    if(e.ev==='make'){
      item[id]=M.put('trie',id,n.ch);M.link('trie',n.parent,id);M.edge('trie',n.parent,id,'cur');tone(id,'path');to(id);
      hi=[laneHi(item[id])];note=note||'No child '+q(n.ch)+' yet: make one, and move into it.';
    }else if(e.ev==='go'){
      tone(id,'path');M.edge('trie',n.parent,id,'cur');to(id);hi=[laneHi(item[id])];note=note||'Follow the edge '+q(n.ch)+'.';
    }else if(e.ev==='miss'){
      hi=[laneHi(item[id])];note=note||'There is no edge '+q(e.ch)+' from here, so no stored word continues this way.';
    }else if(e.ev==='end'){
      M.set(item[id],undefined,e.word);hi=[laneHi(item[id])];note=note||'Mark the end of '+q(e.word)+'.';
    }else if(e.ev==='unend'){
      M.set(item[id],undefined,'');hi=[laneHi(item[id])];note=note||'Clear the word here, so it is not reported again.';
    }else if(e.ev==='found'){
      tone(id,'found');hit[id]=1;hi=[laneHi(item[id])];note=note||'Found.';
    }else if(e.ev==='back'){
      tone(id,hit[id]?'found':e.dead?'dead':'explored');M.edge('trie',n.parent,id,'idle');to(n.parent);
      hi=[laneHi(item[id]),laneHi(item[n.parent])];note=note||'Back up to the parent.';
    }else if(e.ev==='drop'){
      M.unlink('trie',n.parent,id);M.clear('trie',id);delete item[id];to(n.parent);
      hi=[laneHi(item[n.parent])];note=note||'Nothing is left below this node, so remove it.';
    }else if(e.ev==='reset'){
      Object.keys(item).forEach(function(k){if(+k){M.tone(item[k],null);M.edge('trie',parent(+k),+k,'idle');}});
      hit={};tone(0,'path');to(0);hi=[laneHi(item[0])];note=note||'A new query starts at the root.';
    }
    if(o.on){var more=o.on(e,M,item);if(more)hi=hi.concat(more);}
    rec(note,hi);
  });
  rec(o.outro||'The walkthrough is over.');
  steps.states=['path','found','dead','explored'].filter(function(k){return states[k];});
  return steps;
}

/* tabbed trie walkthroughs: each example's steps() comes from trieWalk, and the key follows the tab */
function trieKey(host,before){
  var k=laneKey(host,before),entries=function(states){return states&&states.map(function(s){return {tone:TR_TONE[s],label:TR_MEANING[s]};});};
  return {el:k.el,set:function(states){k.set(entries(states));},reserve:function(list){k.reserve(list.map(entries));}};
}
function mountTrieTabs(w,examples,o){
  var host=w.querySelector('.lvhost'),key=trieKey(host.parentNode,host),seen=[];
  var wrapped=examples.map(function(e,k){return {name:e.name,steps:function(){var s=e.steps();seen[k]=s.states;return s;}};});
  var p=mountLaneTabs(w,wrapped,Object.assign({inv:TRIE_INV},o));
  [].forEach.call(w.querySelectorAll('.extabs button'),function(b,k){b.addEventListener('click',function(){key.set(seen[k]);});});
  key.reserve(seen);key.set(seen[0]);
  return p;
}
