/* kit/rings.js: residue rings, a view for the step player (player.js). A ring is m cells in a circle, cell 0 at the
   top and positive steps clockwise, as a clock; named tokens stand on it and walk a number of cells forward or back
   from where they stand. A token's position is the whole number it has reached, never the cell: the cell it lands on
   is derived (a − m·⌊a/m⌋, in [0, m)), and so are the whole turns it made (⌊a/m⌋), so the readout can say
   a = turns · m + cell. A walk's trail moves outward one lane per whole turn, so the turns can be counted on the
   picture. With langs, each row also says what each language's % returns for a % m: JavaScript's is computed here
   with %, which is the runtime's own; Python's is computed as Python defines it (floor division) and the kit test
   runs python3 on every one the specimen shows.
   Text is HTML, never SVG text: the SVG is drawn at its real pixel size from its box's width, and cell names sit
   over it on a solid patch of the surface. Tokens differ by ink, marker shape and trail dash, and are named in the
   readout, so none rests on colour.
   RingTrace / ringWalk: the page records steps of small operations (put, walk, count); ringWalk replays them on a
   model and reads every snapshot back through ringRead, which sees the snapshot and not the trace, and throws when
   it disagrees with ringState, the pure function of the first k steps (as plots.js does).
   Included by build.py only in lessons that draw a ring (KIT_OPTIONAL), with player.js before it.
   Spec: docs/superpowers/specs/2026-10-18-residue-ring-player-design.md. Names are prefixed (rg*, ring*). */

var RG_MAX_M=24,RG_MAX_TOKENS=6,RG_SPAN=1e15;
/* the six hue inks every page carries, each held to AA on every surface in both themes by shared.py */
var RG_INKS=['--b-ink','--o-ink','--g-ink','--r-ink','--p-ink','--y-ink'];
var RG_TONES={info:'--b-ink',cur:'--o-ink',good:'--g-ink',bad:'--r-ink',plain:'--p-ink',warn:'--y-ink'};
var RG_DASH=['','7 4','2 4','10 3 2 3','4 3','1 4'];
var RG_SHAPES=['circle','square','triangle','diamond','cross','bar'];
/* a walk longer than this many turns glides through this many; the readout carries the true count */
var RG_LAPS=3;

function rgInt(x){return typeof x==='number'&&Number.isInteger(x)&&Math.abs(x)<=RG_SPAN;}
function rgEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
/* Python's a % m for m > 0: the remainder of floor division, so it is always a cell */
function rgFloorMod(a,m){return a-m*Math.floor(a/m);}
/* a whole number as a reader says it, with a true minus sign; JavaScript's -0 is printed as it is */
function rgNum(v){if(Object.is(v,-0))return '−0';return (v<0?'−':'')+Math.abs(v).toLocaleString('en-US');}

/* ---------- the trace: the ring, its tokens and the steps ---------- */
/* new RingTrace({m, name, cells, tokens:[{id, name, tone}], langs}) */
function RingTrace(o){
  o=o||{};var self=this;
  if(!rgInt(o.m)||o.m<2||o.m>RG_MAX_M)throw new Error('a ring has 2 to '+RG_MAX_M+' cells, not '+o.m);
  this.m=o.m;this.name=o.name||'slot';this.langs=!!o.langs;
  if(o.cells!==undefined){
    if(!Array.isArray(o.cells)||o.cells.length!==o.m)throw new Error('cells names each of the '+o.m+' cells');
    var seen={};o.cells.forEach(function(c){if(typeof c!=='string'||!c||seen[c])throw new Error('each cell needs a name of its own, not '+JSON.stringify(c));seen[c]=1;});
    this.cells=o.cells.slice();
  }else{this.cells=[];for(var c=0;c<o.m;c++)this.cells.push(String(c));}
  if(!Array.isArray(o.tokens)||!o.tokens.length)throw new Error('a ring has at least one token');
  if(o.tokens.length>RG_MAX_TOKENS)throw new Error('a ring draws at most '+RG_MAX_TOKENS+' tokens: there is no seventh ink');
  var ids={},inks={},next=0;this.tokens=[];this.by={};
  o.tokens.forEach(function(d,j){
    if(!d||!d.id||ids[d.id])throw new Error('token '+j+' needs an id of its own');ids[d.id]=1;
    if(!d.name)throw new Error(d.id+': a token is named in the readout, so it needs a name');
    var t={id:d.id,name:d.name,dash:RG_DASH[j],shape:RG_SHAPES[j]};
    if(d.tone){if(!RG_TONES[d.tone])throw new Error(d.id+': tone is one of '+Object.keys(RG_TONES).join(', '));t.ink=RG_TONES[d.tone];
      if(inks[t.ink])throw new Error(d.id+' and '+inks[t.ink]+' share an ink');inks[t.ink]=d.id;}
    self.tokens.push(t);self.by[t.id]=t;});
  /* tokens without a tone take the inks the toned ones left, in table order */
  this.tokens.forEach(function(t){if(t.ink)return;while(inks[RG_INKS[next]])next++;t.ink=RG_INKS[next];inks[t.ink]=t.id;});
  this.events=[];
}
RingTrace.prototype={
  step:function(note,ops,hi){
    if(!Array.isArray(ops)||!ops.every(Array.isArray))throw new Error('a step is a list of operations');
    this.events.push({note:note,ops:ops,hi:hi||[]});return this;
  },
  /* stand a token at the whole number at (any sign) without walking; null takes it off the ring */
  put:function(id,at){return ['put',id,at];},
  /* move a token by cells from where it stands: forward (clockwise) when by > 0 */
  walk:function(id,by){return ['walk',id,by];},
  count:function(name,v){return ['count',name,v];},
  done:function(){if(!this.events.length)throw new Error('an empty ring walkthrough');ringState(this,this.events.length);return this;}
};

/* the readout row's words, from a position and its decomposition, however they were worked out */
function rgRow(T,a,cell,turns){
  var row={text:T.name+' '+T.cells[cell],eq:rgNum(a)+' = '+rgNum(turns)+' × '+T.m+' + '+cell};
  if(T.langs){row.expr=rgNum(a)+' % '+T.m;row.py=rgNum(rgFloorMod(a,T.m));row.js=rgNum(a%T.m);}
  return row;
}

/* ---------- the reference: steps applied to plain data ---------- */
function rgApply(T,S,op){
  var a=op[0];
  if(a==='put'){if(!T.by[op[1]])throw new Error('put: there is no token '+op[1]);
    if(op[2]===null){delete S.at[op[1]];delete S.from[op[1]];}
    else if(!rgInt(op[2]))throw new Error('put '+op[1]+': '+op[2]+' is not a whole number');
    else{S.at[op[1]]=op[2];S.from[op[1]]=null;}}
  else if(a==='walk'){if(!T.by[op[1]])throw new Error('walk: there is no token '+op[1]);
    if(!(op[1] in S.at))throw new Error('walk '+op[1]+': put it on the ring first');
    if(!rgInt(op[2]))throw new Error('walk '+op[1]+': '+op[2]+' is not a whole number of cells');
    if(!rgInt(S.at[op[1]]+op[2]))throw new Error('walk '+op[1]+': '+(S.at[op[1]]+op[2])+' is past the ring\'s range');
    S.from[op[1]]=S.at[op[1]];S.at[op[1]]+=op[2];}
  else if(a==='count'){var hit=S.counts.filter(function(c){return c[0]===op[1];})[0];if(hit)hit[1]=String(op[2]);else S.counts.push([op[1],String(op[2])]);}
  else throw new Error('unknown ring operation '+a);
}
/* the whole picture after the first k steps, from the steps alone. The cell is worked out as the shifted remainder,
   not by the model's floor division, so a wrong cell in either disagrees. */
function ringState(T,k){
  var S={at:{},from:{},counts:[]},named={};
  T.events.forEach(function(e){e.ops.forEach(function(op){if(op[0]==='count'&&!named[op[1]]){named[op[1]]=1;S.counts.push([op[1],'–']);}});});
  for(var j=0;j<k&&j<T.events.length;j++)T.events[j].ops.forEach(function(op){rgApply(T,S,op);});
  var at={},from={};Object.keys(S.at).forEach(function(id){at[id]=S.at[id];from[id]=S.from[id];});
  var rows=T.tokens.map(function(t){
    if(!(t.id in S.at))return [t.id,'not on the ring','','',''];
    var a=S.at[t.id],cell=((a%T.m)+T.m)%T.m,r=rgRow(T,a,cell,(a-cell)/T.m);
    return [t.id,r.text,r.eq,r.py||'',r.js||''];});
  return {at:at,from:from,rows:rows,counts:S.counts.map(function(c){return [c[0],c[1]];})};
}

/* ---------- the model the view draws: the same operations, built again ---------- */
function RingModel(T){this.T=T;this.at={};this.from={};this.counts=[];}
RingModel.prototype={
  apply:function(op){
    var a=op[0];
    if(a==='put'){if(op[2]===null){delete this.at[op[1]];delete this.from[op[1]];}else{this.at[op[1]]=op[2];this.from[op[1]]=null;}}
    else if(a==='walk'){this.from[op[1]]=this.at[op[1]];this.at[op[1]]=this.at[op[1]]+op[2];}
    else if(a==='count'){var c=this.counts.filter(function(x){return x[0]===op[1];})[0];if(c)c[1]=String(op[2]);else this.counts.push([op[1],String(op[2])]);}
  },
  snap:function(note,hi,more){
    var self=this,T=this.T,at={},from={};
    Object.keys(this.at).forEach(function(id){at[id]=self.at[id];from[id]=self.from[id];});
    /* every token has a row, in order, so a tab's key never reflows */
    var rows=T.tokens.map(function(t){var on=t.id in at,base={id:t.id,name:t.name,ink:t.ink,dash:t.dash,shape:t.shape,on:on};
      if(!on){base.text='not on the ring';base.eq=base.py=base.js='';return base;}
      var cell=rgFloorMod(at[t.id],T.m),r=rgRow(T,at[t.id],cell,Math.floor(at[t.id]/T.m));
      base.cell=cell;base.turns=Math.floor(at[t.id]/T.m);base.text=r.text;base.eq=r.eq;base.expr=r.expr||'';base.py=r.py||'';base.js=r.js||'';return base;});
    return {note:note,hi:hi||[],done:true,fields:this.counts.map(function(c){return [c[0],c[1]];}).concat(more||[]),
      ring:{T:T,at:at,from:from,rows:rows}};
  }
};
/* the same picture read back off a recorded snapshot, with no access to the trace's steps */
function ringRead(s){
  var r=s.ring,at={},from={};
  Object.keys(r.at).forEach(function(id){at[id]=r.at[id];from[id]=r.from[id];});
  return {at:at,from:from,rows:r.rows.map(function(x){return [x.id,x.text,x.eq,x.py,x.js];}),
    counts:s.fields.map(function(f){return [f[0],String(f[1])];})};
}
function ringSame(want,got,k){
  var bad=null,J=JSON.stringify;
  ['at','from'].forEach(function(f){if(!bad&&J(want[f])!==J(got[f]))bad=f+' should be '+J(want[f])+' but is drawn '+J(got[f]);});
  want.rows.forEach(function(r,i){if(!bad&&J(r)!==J(got.rows[i]))bad='the readout for '+r[0]+' should say '+J(r)+' but says '+J(got.rows[i]);});
  want.counts.forEach(function(c,i){if(!bad&&J(c)!==J(got.counts[i]))bad='counter '+c[0]+' should read '+c[1]+' but is drawn '+J(got.counts[i]);});
  if(bad)throw new Error('ring step '+k+': '+bad);
}

/* the invariant every ring shows, checked with arithmetic the model does not use */
var RG_INV=[['one cell','every token lands on exactly one cell: 0 ≤ cell < m, and its position is whole turns of m plus that cell',function(s){
  var r=s.ring,m=r.T.m;
  return r.rows.every(function(x){if(!x.on)return true;var a=r.at[x.id],c=((a%m)+m)%m;
    return x.cell===c&&c>=0&&c<m&&a===x.turns*m+x.cell;});}]];

/* Record a finished trace as steps for a RingPlayer. o.intro and o.outro are the first and last captions;
   o.fields(state) adds to the fields line after the trace's own counters; o.inv, [[short, long, fn(snapshot)]],
   are this walkthrough's own claims, shown and checked beside the ring's. */
function ringWalk(T,o){
  o=o||{};T.done();
  var M=new RingModel(T),steps=[];
  T.events.forEach(function(e){e.ops.forEach(function(op){if(op[0]==='count'&&!M.counts.some(function(c){return c[0]===op[1];}))M.counts.push([op[1],'–']);});});
  function rec(note,hi){var k=steps.length,s=M.snap(note,hi,o.fields?o.fields(ringState(T,k)):null);s.ring.inv=o.inv||null;steps.push(s);ringSame(ringState(T,k),ringRead(s),k);}
  rec(o.intro||'The ring, before anything stands on it.');
  T.events.forEach(function(e){e.ops.forEach(function(op){M.apply(op);});rec(e.note,e.hi);});
  if(o.outro)rec(o.outro,[]);
  return steps;
}

/* ---------- drawing ---------- */
function rgShape(shape,x,y,r){
  x=+x.toFixed(1);y=+y.toFixed(1);
  if(shape==='circle')return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'"/>';
  if(shape==='square')return '<rect x="'+(x-r)+'" y="'+(y-r)+'" width="'+2*r+'" height="'+2*r+'"/>';
  if(shape==='triangle')return '<path d="M'+x+','+(y-r-1)+' L'+(x+r+1)+','+(y+r)+' L'+(x-r-1)+','+(y+r)+' Z"/>';
  if(shape==='diamond')return '<path d="M'+x+','+(y-r-1.5)+' L'+(x+r+1.5)+','+y+' L'+x+','+(y+r+1.5)+' L'+(x-r-1.5)+','+y+' Z"/>';
  if(shape==='cross')return '<path class="rg-x" d="M'+(x-r)+','+(y-r)+' L'+(x+r)+','+(y+r)+' M'+(x+r)+','+(y-r)+' L'+(x-r)+','+(y+r)+'"/>';
  return '<rect x="'+(x-2)+'" y="'+(y-r-1)+'" width="4" height="'+(2*r+2)+'"/>';
}
function rgSwatch(r){
  return '<svg class="rg-sw" width="28" height="17" aria-hidden="true" style="color:var('+r.ink+')"><line x1="1" x2="27" y1="8.5" y2="8.5"'+
    (r.dash?' stroke-dasharray="'+r.dash+'"':'')+'/><g class="rg-mk">'+rgShape(r.shape,14,8.5,4)+'</g></svg>';
}
/* the cells a walk glides through: all of it up to RG_LAPS turns, else as many whole turns as fit and then the
   remainder, so it still ends on the right cell */
function rgSpan(by,m){var n=Math.abs(by);if(n<=RG_LAPS*m)return by;return (by<0?-1:1)*((RG_LAPS-1)*m+n%m);}

function RingView(o){
  o=o||{};var box,svg,text,read,rows=0,self;
  function geo(T){
    var D=Math.max(240,Math.min(box.clientWidth||340,380)),c=D/2,ro=c-48;
    return {D:D,c:c,ro:ro,ri:ro*0.58,track:ro+11,lane:9,m:T.m};
  }
  /* the angle of position p: cell 0 at the top, clockwise on the screen */
  function ang(g,p){return -Math.PI/2+2*Math.PI*p/g.m;}
  function pt(g,p,r){var a=ang(g,p);return [g.c+r*Math.cos(a),g.c+r*Math.sin(a)];}
  function sector(g,k){
    var gap=Math.min(0.06,0.5/g.m),a0=k-0.5+gap,a1=k+0.5-gap,o0=pt(g,a0,g.ro),o1=pt(g,a1,g.ro),i1=pt(g,a1,g.ri),i0=pt(g,a0,g.ri),big=0,f=function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);};
    return 'M'+f(o0)+' A'+g.ro.toFixed(1)+','+g.ro.toFixed(1)+' 0 '+big+' 1 '+f(o1)+' L'+f(i1)+' A'+g.ri.toFixed(1)+','+g.ri.toFixed(1)+' 0 '+big+' 0 '+f(i0)+' Z';
  }
  /* a walk's trail: a spiral that moves out one lane per whole turn, so turns can be counted */
  function trail(g,from,q){
    var span=q-from,n=Math.max(2,Math.ceil(Math.abs(span)*10)),pts=[];
    for(var i=0;i<=n;i++){var p=from+span*i/n,r=g.track+g.lane*(1+Math.abs(p-from)/g.m);var xy=pt(g,p,r);pts.push(xy[0].toFixed(1)+','+xy[1].toFixed(1));}
    return pts.join(' ');
  }
  function endR(g,from,q){return from===null?g.track:g.track+g.lane*(1+Math.abs(q-from)/g.m);}
  /* where each token is drawn at tween progress t: a token walked this step glides along its trail */
  function placeOf(s,fromS,t,id){
    var r=s.ring,a=r.at[id],f=r.from[id],fr=fromS&&fromS.ring&&fromS.ring.T===r.T?fromS.ring:null;
    if(f===null||f===undefined)return {from:null,q:a,op:fr&&fr.at[id]===a?1:t,walked:false};
    var span=rgSpan(a-f,r.T.m),glide=fr&&fr.at[id]===f&&fr.at[id]!==a;
    return {from:f,span:span,q:f+span*(glide?t:1),op:1,walked:true};
  }
  function draw(s,L,t,fromS){
    var r=s.ring,T=r.T,g=geo(T),h='',tx='',fr=fromS&&fromS.ring&&fromS.ring.T===T?fromS.ring:null;
    t=t===undefined?1:t;
    svg.setAttribute('width',g.D);svg.setAttribute('height',g.D);box.style.height=g.D+'px';box.style.width=g.D+'px';
    /* which cell each standing token lands on, so a cell takes the ink of the first token on it */
    var focus=T.tokens.some(function(tk){return s.hi.indexOf(tk.id)>=0;}),lit={},stand={};T.tokens.forEach(function(tk){if(!(tk.id in r.at))return;var c=rgFloorMod(r.at[tk.id],T.m);if(!(c in lit))lit[c]=tk;(stand[c]=stand[c]||[]).push(tk.id);});
    for(var k=0;k<T.m;k++){var on=lit[k],hi=on&&s.hi.indexOf(on.id)>=0;
      h+='<path class="rg-cell'+(on?' on':'')+(hi?' hi':'')+'"'+(on?' style="color:var('+on.ink+');--rg-op:'+t.toFixed(3)+'"':'')+' d="'+sector(g,k)+'"/>';
      var mid=pt(g,k,(g.ro+g.ri)/2);
      tx+='<span class="rg-cn'+(on?' on':'')+'" style="left:'+mid[0].toFixed(1)+'px;top:'+mid[1].toFixed(1)+'px">'+rgEsc(T.cells[k])+'</span>';}
    /* the zero mark: where every walk is counted from */
    var z0=pt(g,-0.5,g.ri-4),z1=pt(g,-0.5,g.track+g.lane*(RG_LAPS+1));
    h+='<line class="rg-zero" x1="'+z0[0].toFixed(1)+'" y1="'+z0[1].toFixed(1)+'" x2="'+z1[0].toFixed(1)+'" y2="'+z1[1].toFixed(1)+'"/>';
    var tokens='';
    T.tokens.forEach(function(tk){
      var here=tk.id in r.at,was=fr&&tk.id in fr.at;
      if(!here&&!was)return;
      var hi=s.hi.indexOf(tk.id)>=0;
      if(!here){var c0=rgFloorMod(fr.at[tk.id],T.m),xy0=pt(g,c0,g.track);
        tokens+='<g class="rg-tk" style="color:var('+tk.ink+');opacity:'+(1-t).toFixed(3)+'">'+rgShape(tk.shape,xy0[0],xy0[1],5)+'</g>';return;}
      var P=placeOf(s,fromS,t,tk.id),c=rgFloorMod(r.at[tk.id],T.m),sib=stand[c],j=sib.indexOf(tk.id),
          off=t===1||!P.walked?(j-(sib.length-1)/2)*Math.min(0.28,0.7/sib.length):0,rr=endR(g,P.from,P.q);
      /* a trail the step is not about steps back, so the walk it is about reads first */
      if(P.walked){
        h+='<g class="rg-trail'+(hi?' hi':focus?' dim':'')+'" style="color:var('+tk.ink+')"><polyline points="'+trail(g,P.from,P.q)+'"'+(tk.dash?' stroke-dasharray="'+tk.dash+'"':'')+'/>';
        var st=pt(g,P.from,g.track+g.lane);h+='<circle class="rg-start" cx="'+st[0].toFixed(1)+'" cy="'+st[1].toFixed(1)+'" r="3.2"/></g>';}
      var xy=pt(g,P.q+off,rr);
      tokens+='<g class="rg-tk'+(hi?' hi':'')+'" style="color:var('+tk.ink+');opacity:'+P.op.toFixed(3)+'">'+rgShape(tk.shape,xy[0],xy[1],hi?6:5)+'</g>';});
    svg.innerHTML=h+tokens;text.innerHTML=tx;
    read.innerHTML=r.rows.map(function(x){
      var neg=x.js&&x.js.charAt(0)==='−';
      return '<li class="'+(x.on?'':'off')+(s.hi.indexOf(x.id)>=0?' hi':'')+'">'+rgSwatch(x)+'<span class="rg-nm">'+rgEsc(x.name)+'</span><b>'+rgEsc(x.text)+'</b>'+
        (x.on?'<span class="rg-eq">'+rgEsc(x.eq)+'</span>':'')+
        (x.on&&T.langs?'<span class="rg-lang"><i>Python</i> <code>'+rgEsc(x.expr)+'</code> → <b>'+rgEsc(x.py)+'</b></span>'+
          '<span class="rg-lang"><i>JavaScript</i> <code>'+rgEsc(x.expr)+'</code> → <b>'+rgEsc(x.js)+'</b>'+(neg?' <em>not a '+rgEsc(T.name)+'</em>':'')+'</span>':'')+'</li>';}).join('');
    read.style.minHeight=rows?(rows*(T.langs?96:50))+'px':'';
  }
  function describe(s){
    var r=s.ring,T=r.T,out=o.aria||('A ring of '+T.m+' '+T.name+'s, '+T.cells[0]+' to '+T.cells[T.m-1]+', counted clockwise from the top.');
    if(o.aria)return out;
    var on=r.rows.filter(function(x){return x.on;});
    if(!on.length)return out+' Nothing stands on it yet.';
    return out+' '+on.map(function(x){var f=r.from[x.id];
      return x.name+(f!==null?', walked from '+rgNum(f):'')+' to '+rgNum(r.at[x.id])+': '+x.eq+', lands on '+x.text+
        (T.langs?'; Python '+x.expr+' is '+x.py+', JavaScript '+x.expr+' is '+x.js:'');}).join('. ')+'.';
  }
  self={
    mount:function(stage){
      stage.innerHTML='<div class="rg"><div class="rg-box"><svg class="rg-svg" role="img"></svg><div class="rg-text" aria-hidden="true"></div></div><ul class="rg-read" aria-label="Where each token lands"></ul></div>';
      box=stage.querySelector('.rg-box');svg=box.querySelector('svg');text=box.querySelector('.rg-text');read=stage.querySelector('.rg-read');
    },
    layout:function(s){return {at:s.ring.at};},
    draw:draw,
    /* every tab's readout keeps the tallest tab's rows, so switching tabs never moves the controls below */
    sizeTo:function(all){all.forEach(function(s){rows=Math.max(rows,s.ring.rows.length);});},
    inv:[],check:function(){return [];},
    fields:function(s,hiF){return s.fields.map(function(f){return '<span'+hiF(f[0])+'>'+rgEsc(f[0])+' <b>'+rgEsc(f[1])+'</b></span>';}).join('');},
    label:function(s){svg.setAttribute('aria-label',describe(s));}
  };
  return self;
}

/* the stepped ring: RingView run by the step player, with the ring's own invariant and each walkthrough's claims */
function RingPlayer(host,o){
  o=o||{};var view=RingView(o),all=function(s){return RG_INV.concat(o.inv||[],s.ring.inv||[]);};
  view.inv=function(s){return all(s).map(function(x){return [x[0],x[1]];});};view.check=function(s){return all(s).map(function(x){return !!x[2](s);});};
  var p=new StepPlayer(host,o,view);
  if('ResizeObserver' in window)new ResizeObserver(function(){p.redraw();}).observe(host);
  return p;
}
function mountRingTabs(w,examples,o){return mountPlayerTabs(w,examples,function(h,x){return new RingPlayer(h,x);},o);}
