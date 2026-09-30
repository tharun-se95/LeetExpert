/* kit/plots.js: cost plots, a view for the step player (player.js) and the static costChart. A plot is named
   series of y against n on one pair of axes:
     curve    a formula, of(n): the named class, or c·g(n)
     points   counts measured by running code, [[n, v]], joined by a line, a staircase or nothing
     bars     a cost per item (the i-th append), [[i, v]]
     range    best to worst at each n, [[n, lo, hi]], measured over every input of that size
   and, between steps, a cursor walking n (each series' value at it is read out beside the plot), named
   horizontal lines (a budget), named vertical lines (n₀, where a curve crosses the budget) and counters.
   Text is HTML, never SVG text: the SVG is drawn at its real pixel size, re-laid out from its box's width, and
   tick labels, axis names and line names sit over it at the page's type scale. Series are told apart by ink,
   dash and marker shape, and named in the readout, so no series rests on colour.
   PlotTrace / plotWalk: the page runs the algorithm first and records steps of small operations (reveal, hide,
   cursor, level, at, count); plotWalk replays them on a model and reads every snapshot back through plotRead,
   which sees the snapshot and not the trace, and throws when it disagrees with plotState, the pure function of
   the first k steps (as intervals.js does). plotCheck holds a measured series to an independent statement of it.
   Included by build.py only in lessons that plot (KIT_OPTIONAL). costChart needs nothing else; the stepped
   player is plotplayer.js, which a page ships only when it steps through a plot, with player.js before it. Spec: docs/superpowers/specs/2026-09-30-cost-plot-player-design.md.
   Names are prefixed (pl*, plot*). */

var PL_H=264,PL_M={l:58,r:18,t:30,b:42};
/* the six hue inks every page carries, each held to AA on every surface in both themes by shared.py */
var PL_INKS=['--b-ink','--o-ink','--g-ink','--r-ink','--p-ink','--y-ink'];
var PL_TONES={info:'--b-ink',cur:'--o-ink',good:'--g-ink',bad:'--r-ink',plain:'--p-ink',warn:'--y-ink'};
var PL_DASH=['','8 5','2 4','12 4 2 4','5 3','1 5'];
var PL_SHAPES=['circle','square','triangle','diamond','cross','bar'];
var PL_KINDS=['curve','points','bars','range'];
var PL_JOINS=['line','step','none'];
/* the named complexity classes, labelled as the app labels them (held to BigOObservatory by the kit test) */
var PL_CLASSES={
  one:['O(1)',function(){return 1;}],
  log:['O(log n)',function(n){return Math.log2(n);}],
  n:['O(n)',function(n){return n;}],
  nlogn:['O(n log n)',function(n){return n*Math.log2(n);}],
  n2:['O(n²)',function(n){return n*n;}],
  exp:['O(2ⁿ)',function(n){return Math.pow(2,n);}]
};
var PL_SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};

function plNum(x){return typeof x==='number'&&isFinite(x);}
function plEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function plPow(base,e){return base+String(e).split('').map(function(c){return PL_SUP[c];}).join('');}
/* a count as a reader says it: grouped digits up to a trillion, then a power of ten; a range as lo–hi */
function plotFmt(v){
  if(Array.isArray(v))return plotFmt(v[0])+'–'+plotFmt(v[1]);
  if(v===null||v===undefined)return '–';
  if(v===Infinity)return 'over 10³⁰⁸';
  if(!plNum(v))throw new Error('plotFmt: '+v+' is not a number');
  var a=Math.abs(v);
  if(a>=1e12){var e=Math.floor(Math.log10(a)),m=v/Math.pow(10,e);
    return (Math.abs(m-Math.round(m))<5e-4?String(Math.round(m)):m.toFixed(2).replace(/0+$/,'').replace(/\.$/,''))+' × '+plPow('10',e);}
  if(Number.isInteger(v))return v.toLocaleString('en-US');
  return (+v.toPrecision(4)).toLocaleString('en-US',{maximumFractionDigits:3});
}
/* a tick as short as it can be read: 10⁶ rather than 1,000,000 on a log axis, 2k on a busy linear one */
function plTickText(v,log){
  if(log&&v>=1e4){var e=Math.round(Math.log10(v));if(Math.abs(Math.pow(10,e)-v)<1e-9*v)return plPow('10',e);
    var e2=Math.round(Math.log2(v));if(Math.pow(2,e2)===v)return plPow('2',e2);}
  if(v>=1e6&&v%1e6===0)return (v/1e6)+'M';
  if(v>=1e4&&v%1e3===0)return (v/1e3)+'k';
  return plotFmt(v);
}

/* ---------- the trace: the series and the steps ---------- */
/* new PlotTrace({x:{name, scale, lo, hi, ticks}, y:{...}, series:[{id, name, kind, of|cls|data, join, tone}]}).
   Values are checked as they are given: finite, and positive on a log axis, since a log axis draws 0 nowhere. */
function PlotTrace(o){
  o=o||{};var self=this;
  ['x','y'].forEach(function(k){
    var a=o[k];if(!a||!a.name)throw new Error('a plot names its '+k+' axis');
    if(a.scale&&a.scale!=='lin'&&a.scale!=='log')throw new Error(k+' axis: scale is lin or log, not '+a.scale);
    if(a.lo!=null&&!plNum(a.lo)||a.hi!=null&&!plNum(a.hi))throw new Error(k+' axis: lo and hi are numbers');
    if(a.lo!=null&&a.hi!=null&&!(a.lo<a.hi))throw new Error(k+' axis: lo must be below hi');
    if(a.scale==='log'&&a.lo!=null&&!(a.lo>0))throw new Error(k+' axis: a log axis starts above 0');
    self[k]={name:a.name,short:a.short||a.name.split(' ')[0],scale:a.scale||'lin',lo:a.lo==null?null:a.lo,hi:a.hi==null?null:a.hi,ticks:a.ticks||null};});
  if(!Array.isArray(o.series)||!o.series.length)throw new Error('a plot has at least one series');
  if(o.series.length>PL_INKS.length)throw new Error('a plot draws at most '+PL_INKS.length+' series: there is no seventh ink');
  var ids={},inks={},next=0;this.series=[];this.by={};
  o.series.forEach(function(d,j){
    if(!d.id||ids[d.id])throw new Error('series '+j+' needs an id of its own');ids[d.id]=1;
    if(PL_KINDS.indexOf(d.kind)<0)throw new Error(d.id+': kind is one of '+PL_KINDS.join(', ')+', not '+d.kind);
    var s={id:d.id,name:d.name,kind:d.kind,join:d.join||(d.kind==='points'?'line':null),dash:PL_DASH[j],shape:PL_SHAPES[j]};
    if(s.join&&PL_JOINS.indexOf(s.join)<0)throw new Error(d.id+': join is one of '+PL_JOINS.join(', '));
    if(d.kind==='curve'){
      if(d.cls){var c=PL_CLASSES[d.cls];if(!c)throw new Error(d.id+': no class '+d.cls);s.of=c[1];s.name=s.name||c[0];}
      else if(typeof d.of==='function')s.of=d.of;else throw new Error(d.id+': a curve is a formula: of(n) or cls');
    }else{
      if(!Array.isArray(d.data)||!d.data.length)throw new Error(d.id+': a '+d.kind+' series is data measured by running code');
      var seen={};s.data=d.data.map(function(p){
        var w=d.kind==='range'?3:2;if(!Array.isArray(p)||p.length!==w||!p.every(plNum))throw new Error(d.id+': each entry is '+(w===3?'[n, lo, hi]':'[n, value]')+' of finite numbers, not '+JSON.stringify(p));
        if(seen[p[0]])throw new Error(d.id+': n = '+p[0]+' is given twice');seen[p[0]]=1;
        if(d.kind==='range'&&p[1]>p[2])throw new Error(d.id+': at n = '+p[0]+' the best case '+p[1]+' is above the worst '+p[2]);
        if(d.kind==='bars'&&!Number.isInteger(p[0]))throw new Error(d.id+': a bar stands at a whole number, not '+p[0]);
        return p.slice();}).sort(function(a,b){return a[0]-b[0];});
    }
    if(!s.name)throw new Error(d.id+': a series is named in the readout, so it needs a name');
    if(d.tone){if(!PL_TONES[d.tone])throw new Error(d.id+': tone is one of '+Object.keys(PL_TONES).join(', '));s.ink=PL_TONES[d.tone];}
    if(s.ink){if(inks[s.ink])throw new Error(d.id+' and '+inks[s.ink]+' share an ink');inks[s.ink]=d.id;}
    self.series.push(s);self.by[s.id]=s;});
  /* series without a tone take the inks the toned ones left, in table order */
  this.series.forEach(function(s){if(s.ink)return;while(inks[PL_INKS[next]])next++;s.ink=PL_INKS[next];inks[s.ink]=s.id;});
  this.series.forEach(function(s){plLogOk(self,s);});
  this.events=[];
}
function plLogOk(T,s){
  if(!s.data)return;
  s.data.forEach(function(p){
    if(T.x.scale==='log'&&!(p[0]>0))throw new Error(s.id+': n = '+p[0]+' cannot sit on a log axis');
    if(T.y.scale==='log'&&p.slice(1).some(function(v){return !(v>0);}))throw new Error(s.id+': at n = '+p[0]+' a value of 0 or less cannot sit on a log axis');});
}
PlotTrace.prototype={
  step:function(note,ops,hi){
    if(!Array.isArray(ops)||!ops.every(Array.isArray))throw new Error('a step is a list of operations');
    this.events.push({note:note,ops:ops,hi:hi||[]});return this;
  },
  /* show a series up to x = upTo (all of it when upTo is left out) */
  reveal:function(id,upTo){return ['reveal',id,upTo===undefined?Infinity:upTo];},
  hide:function(id){return ['hide',id];},
  cursor:function(x){return ['cursor',x];},
  level:function(name,y){return ['level',name,y];},
  at:function(name,x){return ['at',name,x];},
  count:function(name,v){return ['count',name,v];},
  done:function(){if(!this.events.length)throw new Error('an empty plot walkthrough');plotState(this,this.events.length);return this;}
};

/* ---------- the reference: steps applied to plain data ---------- */
/* a series' value at exactly x, read straight off what it was given; it shares no code with the model's plValue */
function plRefAt(s,x){
  if(s.kind==='curve')return s.of(x);
  for(var i=0;i<s.data.length;i++)if(s.data[i][0]===x)return s.kind==='range'?[s.data[i][1],s.data[i][2]]:s.data[i][1];
  return null;
}
function plApply(T,S,op){
  var a=op[0];
  if(a==='reveal'){if(!T.by[op[1]])throw new Error('reveal: there is no series '+op[1]);if(!(op[2]===Infinity||plNum(op[2])))throw new Error('reveal: '+op[1]+' up to '+op[2]+'?');S.shown[op[1]]=op[2];}
  else if(a==='hide'){if(!T.by[op[1]])throw new Error('hide: there is no series '+op[1]);delete S.shown[op[1]];}
  else if(a==='cursor'){if(op[1]!==null&&!plNum(op[1]))throw new Error('cursor: '+op[1]+' is not a number');S.cursor=op[1];}
  else if(a==='level'||a==='at'){var bag=a==='level'?S.levels:S.ats;
    if(op[2]===null)delete bag[op[1]];else if(!plNum(op[2]))throw new Error(a+' '+op[1]+': '+op[2]+' is not a number');else bag[op[1]]=op[2];}
  else if(a==='count'){var hit=S.counts.filter(function(c){return c[0]===op[1];})[0];if(hit)hit[1]=String(op[2]);else S.counts.push([op[1],String(op[2])]);}
  else throw new Error('unknown plot operation '+a);
}
function plStart(T){
  var S={shown:{},cursor:null,levels:{},ats:{},counts:[]},named={};
  /* every counter is on the fields line from the first step, reading a dash until it is set, so the line never grows */
  T.events.forEach(function(e){e.ops.forEach(function(op){if(op[0]==='count'&&!named[op[1]]){named[op[1]]=1;S.counts.push([op[1],'–']);}});});
  return S;
}
function plView(T,S){
  var shown={},lv={},at={};Object.keys(S.shown).forEach(function(k){shown[k]=S.shown[k];});
  Object.keys(S.levels).forEach(function(k){lv[k]=S.levels[k];});Object.keys(S.ats).forEach(function(k){at[k]=S.ats[k];});
  var rows=T.series.map(function(s){
    var up=S.shown[s.id],v=up===undefined||S.cursor===null||S.cursor>up?null:plRefAt(s,S.cursor);
    return [s.id,up===undefined?'not shown':S.cursor===null?'':plotFmt(v)];});
  return {shown:shown,cursor:S.cursor,levels:lv,ats:at,rows:rows,counts:S.counts.map(function(c){return [c[0],c[1]];})};
}
/* the whole picture after the first k steps, from the steps alone */
function plotState(T,k){
  var S=plStart(T);
  for(var j=0;j<k&&j<T.events.length;j++)T.events[j].ops.forEach(function(op){plApply(T,S,op);});
  return plView(T,S);
}

/* ---------- the model the view draws: the same operations, built again ---------- */
/* a series' value at x: the model's own lookup (a map built once), so a wrong readout in either disagrees */
function plValue(s,x){
  if(s.kind==='curve'){var v=s.of(x);if(!(plNum(v)||v===Infinity))throw new Error(s.id+': of('+x+') is '+v);return v;}
  if(!s.at){s.at={};s.data.forEach(function(p){s.at[p[0]]=s.kind==='range'?[p[1],p[2]]:p[1];});}
  return Object.prototype.hasOwnProperty.call(s.at,x)?s.at[x]:null;
}
function PlotModel(T){this.T=T;this.shown={};this.cursor=null;this.levels={};this.ats={};this.counts=[];}
PlotModel.prototype={
  apply:function(op){
    var a=op[0],T=this.T;
    if(a==='reveal'){if(!T.by[op[1]])throw new Error('no series '+op[1]);this.shown[op[1]]=op[2];}
    else if(a==='hide')delete this.shown[op[1]];
    else if(a==='cursor')this.cursor=op[1];
    else if(a==='level'){if(op[2]===null)delete this.levels[op[1]];else this.levels[op[1]]=op[2];}
    else if(a==='at'){if(op[2]===null)delete this.ats[op[1]];else this.ats[op[1]]=op[2];}
    else if(a==='count'){var c=this.counts.filter(function(x){return x[0]===op[1];})[0];if(c)c[1]=String(op[2]);else this.counts.push([op[1],String(op[2])]);}
  },
  snap:function(note,hi,ax,more){
    var self=this,T=this.T,shown={},lv={},at={};
    Object.keys(this.shown).forEach(function(k){shown[k]=self.shown[k];});
    Object.keys(this.levels).forEach(function(k){lv[k]=self.levels[k];});Object.keys(this.ats).forEach(function(k){at[k]=self.ats[k];});
    /* the readout, as the view prints it: every series, in order, so a tab's key never reflows */
    var rows=T.series.map(function(s){var up=shown[s.id],on=up!==undefined;
      return {id:s.id,name:s.name,ink:s.ink,dash:s.dash,shape:s.shape,kind:s.kind,on:on,
        text:!on?'not shown':self.cursor===null?'':plotFmt(self.cursor>up?null:plValue(s,self.cursor))};});
    return {note:note,hi:hi||[],done:true,fields:this.counts.map(function(c){return [c[0],c[1]];}).concat(more||[]),
      plot:{T:T,ax:ax,shown:shown,cursor:this.cursor,levels:lv,ats:at,rows:rows}};
  }
};
/* the same picture read back off a recorded snapshot, with no access to the trace's steps */
function plotRead(s){
  var p=s.plot,shown={},lv={},at={};
  Object.keys(p.shown).forEach(function(k){shown[k]=p.shown[k];});
  Object.keys(p.levels).forEach(function(k){lv[k]=p.levels[k];});Object.keys(p.ats).forEach(function(k){at[k]=p.ats[k];});
  return {shown:shown,cursor:p.cursor,levels:lv,ats:at,rows:p.rows.map(function(r){return [r.id,r.text];}),
    counts:s.fields.map(function(f){return [f[0],String(f[1])];})};
}
function plotSame(want,got,k){
  var bad=null,J=function(x){return JSON.stringify(x,function(_,v){return v===Infinity?'∞':v;});};
  ['shown','levels','ats'].forEach(function(f){if(!bad&&J(want[f])!==J(got[f]))bad=f+' should be '+J(want[f])+' but is drawn '+J(got[f]);});
  if(!bad&&want.cursor!==got.cursor)bad='the cursor should be at '+want.cursor+' but is drawn at '+got.cursor;
  want.rows.forEach(function(r,i){if(!bad&&J(r)!==J(got.rows[i]))bad='the readout for '+r[0]+' should say '+r[1]+' but says '+J(got.rows[i]);});
  want.counts.forEach(function(c,i){if(!bad&&J(c)!==J(got.counts[i]))bad='counter '+c[0]+' should read '+c[1]+' but is drawn '+J(got.counts[i]);});
  if(bad)throw new Error('plot step '+k+': '+bad);
}

/* ---------- scales, fixed for the player's life ---------- */
/* the next round number at or above v; fine enough that a peak of 2,016 gets a 2,500 axis, not 5,000 */
function plNiceHi(v){if(v<=0)return 1;var e=Math.pow(10,Math.floor(Math.log10(v))),m=v/e;
  return [1,1.2,1.5,2,2.5,3,4,5,6,8,10].filter(function(c){return c>=m-1e-9;})[0]*e;}
/* the extent of everything any step draws: every revealed series (curves over the x extent), every line and the
   cursor, after every single operation. An axis the walkthrough sets is kept as given. */
function plotExtent(T){
  var xs=[],ys=[],S=plStart(T),ever={};
  function see(){
    Object.keys(S.shown).forEach(function(id){ever[id]=Math.max(ever[id]===undefined?-Infinity:ever[id],S.shown[id]);});
    if(S.cursor!==null)xs.push(S.cursor);Object.keys(S.ats).forEach(function(n){xs.push(S.ats[n]);});
    Object.keys(S.levels).forEach(function(n){ys.push(S.levels[n]);});}
  see();T.events.forEach(function(e){e.ops.forEach(function(op){plApply(T,S,op);see();});});
  Object.keys(ever).forEach(function(id){var s=T.by[id];if(s.data)s.data.forEach(function(p){if(p[0]<=ever[id])xs.push(p[0]);});});
  var x=plAxis(T.x,xs,'x');
  Object.keys(ever).forEach(function(id){var s=T.by[id];
    if(s.data)s.data.forEach(function(p){if(p[0]<=ever[id])ys.push.apply(ys,p.slice(1));});
    else for(var i=0;i<=64;i++){var t=i/64,xv=x.scale==='log'?x.lo*Math.pow(x.hi/x.lo,t):x.lo+(x.hi-x.lo)*t;
      if(xv>ever[id])break;var v=s.of(xv);if(plNum(v)&&(T.y.scale!=='log'||v>0))ys.push(v);}});
  return {x:x,y:plAxis(T.y,ys,'y')};
}
function plAxis(a,vs,k){
  var lo=a.lo,hi=a.hi;
  if(lo===null||hi===null){
    if(!vs.length)throw new Error('the '+k+' axis has nothing on it: give it lo and hi, or reveal a series');
    var mn=Math.min.apply(null,vs),mx=Math.max.apply(null,vs);
    if(a.scale==='log'){var b=Math.log10(mx/Math.max(mn,1e-300))>=3?10:2;
      if(lo===null)lo=Math.pow(b,Math.floor(Math.log(mn)/Math.log(b)+1e-9));if(hi===null)hi=Math.pow(b,Math.ceil(Math.log(mx)/Math.log(b)-1e-9));}
    else{if(lo===null)lo=Math.min(0,mn);if(hi===null)hi=k==='y'?plNiceHi(mx):mx;}
    if(!(hi>lo))hi=a.scale==='log'?lo*2:lo+1;
  }
  return {name:a.name,short:a.short,scale:a.scale,lo:lo,hi:hi,ticks:a.ticks};
}
/* map an axis onto [p0, p1] pixels, with ticks that leave `gap` pixels for each label */
function plScale(a,p0,p1,gap){
  var log=a.scale==='log',L0=log?Math.log10(a.lo):a.lo,L1=log?Math.log10(a.hi):a.hi;
  var map=function(v){return p0+(p1-p0)*((log?Math.log10(v):v)-L0)/(L1-L0);};
  var len=Math.abs(p1-p0),ticks=[];
  if(a.ticks)ticks=a.ticks.slice();
  else if(log){var b=Math.log10(a.hi/a.lo)>=3?10:2,e0=Math.ceil(Math.log(a.lo)/Math.log(b)-1e-9),e1=Math.floor(Math.log(a.hi)/Math.log(b)+1e-9),every=1;
    while((e1-e0)/every*gap>len&&every<64)every++;
    for(var e=e0;e<=e1;e+=every)ticks.push(Math.pow(b,e));}
  else{var steps=[],d;for(d=-3;d<=15;d++)[1,2,5].forEach(function(m){steps.push(m*Math.pow(10,d));});
    var st=steps.filter(function(s){return (a.hi-a.lo)/s*gap<=len;})[0]||steps[steps.length-1];
    for(var t=Math.ceil(a.lo/st-1e-9)*st;t<=a.hi+1e-9*st;t+=st)ticks.push(+t.toPrecision(12));}
  return {map:map,ticks:ticks,log:log,lo:a.lo,hi:a.hi,name:a.name,short:a.short};
}

/* ---------- drawing ---------- */
function plShape(shape,x,y,r){
  x=+x.toFixed(1);y=+y.toFixed(1);
  if(shape==='circle')return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'"/>';
  if(shape==='square')return '<rect x="'+(x-r)+'" y="'+(y-r)+'" width="'+2*r+'" height="'+2*r+'"/>';
  if(shape==='triangle')return '<path d="M'+x+','+(y-r-1)+' L'+(x+r+1)+','+(y+r)+' L'+(x-r-1)+','+(y+r)+' Z"/>';
  if(shape==='diamond')return '<path d="M'+x+','+(y-r-1.5)+' L'+(x+r+1.5)+','+y+' L'+x+','+(y+r+1.5)+' L'+(x-r-1.5)+','+y+' Z"/>';
  if(shape==='cross')return '<path class="pl-x" d="M'+(x-r)+','+(y-r)+' L'+(x+r)+','+(y+r)+' M'+(x+r)+','+(y-r)+' L'+(x-r)+','+(y+r)+'"/>';
  return '<rect x="'+(x-1.5)+'" y="'+(y-r-1)+'" width="3" height="'+(2*r+2)+'"/>';
}
/* the swatch beside a readout row: the series' own dash and marker, so the key can be read without colour */
function plSwatch(r){
  var line=r.kind==='bars'?'<rect x="9" y="3" width="10" height="11" class="pl-bar"/>':(r.kind==='range'?'<rect x="1" y="4" width="26" height="9" class="pl-band"/>':'')+
    (r.kind==='bars'?'':'<line x1="1" x2="27" y1="8.5" y2="8.5"'+(r.dash?' stroke-dasharray="'+r.dash+'"':'')+'/>');
  return '<svg class="pl-sw" width="28" height="17" aria-hidden="true" style="color:var('+r.ink+')">'+line+(r.kind==='bars'?'':'<g class="pl-mk">'+plShape(r.shape,14,8.5,3.5)+'</g>')+'</svg>';
}
function plLerp(a,b,t){return a+(b-a)*t;}

/* the view: mount / layout / draw / fields / label, as player.js's contract says. costChart uses it alone. */
function PlotView(o){
  o=o||{};var box,svg,text,read,uid='pl'+Math.floor(Math.random()*1e9),rows=0,self;
  function size(){var w=box.clientWidth||560;return {w:Math.max(260,w),h:PL_H};}
  function geo(s){
    var z=size(),ax=s.plot.ax,m=PL_M;
    return {w:z.w,h:z.h,x:plScale(ax.x,m.l,z.w-m.r,56),y:plScale(ax.y,z.h-m.b,m.t,26),x0:m.l,x1:z.w-m.r,y0:z.h-m.b,y1:m.t};
  }
  function clip(g,v,lo,hi){return Math.max(lo,Math.min(hi,v));}
  function seriesSvg(g,s,upPx,op,on){
    var T=s,h='',X=g.x.map,Y=g.y.map,yl=g.y.log?g.y.lo:Math.max(g.y.lo,0);
    if(s.kind==='curve'){var pts=[],n=Math.max(24,Math.round((upPx-g.x0)/3));
      for(var i=0;i<=n;i++){var px=g.x0+(upPx-g.x0)*i/n,xv=g.x.log?g.x.lo*Math.pow(g.x.hi/g.x.lo,(px-g.x0)/(g.x1-g.x0)):g.x.lo+(g.x.hi-g.x.lo)*(px-g.x0)/(g.x1-g.x0),v=T.of(xv);
        /* log 0 is -∞ and a log axis has no 0: those points are nowhere on the plot, so the line starts after them */
        if(v!==Infinity&&!plNum(v)||g.y.log&&!(v>0)||v<g.y.lo)continue;
        var py=v===Infinity?g.y1-8:Math.max(g.y1-8,Y(v));pts.push(px.toFixed(1)+','+py.toFixed(1));}
      h+='<polyline class="pl-ln" points="'+pts.join(' ')+'"'+(s.dash?' stroke-dasharray="'+s.dash+'"':'')+'/>';}
    else{var d=s.data.filter(function(p){return X(p[0])<=upPx+0.5;});
      if(s.kind==='bars'){var w=s.data.length>1?Math.min(18,0.7*Math.abs(X(s.data[1][0])-X(s.data[0][0]))):14;
        d.forEach(function(p){var y=Y(p[1]),b=Y(yl);h+='<rect class="pl-bar" x="'+(X(p[0])-w/2).toFixed(1)+'" y="'+Math.min(y,b).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+Math.max(1,Math.abs(b-y)).toFixed(1)+'"/>';});}
      else if(s.kind==='range'&&d.length){
        h+='<path class="pl-band" d="M'+d.map(function(p){return X(p[0]).toFixed(1)+','+Y(p[2]).toFixed(1);}).join(' L')+' L'+d.slice().reverse().map(function(p){return X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1);}).join(' L')+' Z"/>';
        ['2','1'].forEach(function(k){h+='<polyline class="pl-ln pl-edge" points="'+d.map(function(p){return X(p[0]).toFixed(1)+','+Y(p[+k]).toFixed(1);}).join(' ')+'"'+(s.dash?' stroke-dasharray="'+s.dash+'"':'')+'/>';});}
      else if(s.kind==='points'&&d.length){
        if(s.join!=='none'){var path=d.map(function(p,i){var x=X(p[0]).toFixed(1),y=Y(p[1]).toFixed(1);
            return i===0?'M'+x+','+y:(s.join==='step'?'H'+x+' V'+y:'L'+x+','+y);}).join(' ');
          h+='<path class="pl-ln" d="'+path+'"'+(s.dash?' stroke-dasharray="'+s.dash+'"':'')+'/>';}
        /* markers thin out on a dense series, always keeping the last one drawn */
        var every=Math.max(1,Math.ceil(d.length/24));h+='<g class="pl-mk">';
        d.forEach(function(p,i){if(i%every===0||i===d.length-1)h+=plShape(s.shape,X(p[0]),Y(p[1]),3.2);});h+='</g>';}
    }
    return '<g class="pl-s'+(on?' hi':'')+'" style="color:var('+s.ink+');opacity:'+op.toFixed(3)+'" clip-path="url(#'+uid+'c)">'+h+'</g>';
  }
  /* where each series has drawn up to, in pixels: a revealed series draws on left to right */
  function upPx(g,v){return v===Infinity?g.x1+1:clip(g,g.x.map(Math.max(v,g.x.lo)),g.x0,g.x1+1);}
  function draw(s,L,t,fromS){
    var g=geo(s),p=s.plot,T=p.T,fp=fromS&&fromS.plot&&fromS.plot.T===T?fromS.plot:null,h='',tx='';
    t=t===undefined?1:t;
    svg.setAttribute('width',g.w);svg.setAttribute('height',g.h);box.style.height=g.h+'px';
    h+='<defs><clipPath id="'+uid+'c"><rect x="'+(g.x0-6)+'" y="'+(g.y1-4)+'" width="'+(g.x1-g.x0+12)+'" height="'+(g.y0-g.y1+10)+'"/></clipPath></defs>';
    g.y.ticks.forEach(function(v){var y=g.y.map(v).toFixed(1);h+='<line class="pl-grid" x1="'+g.x0+'" x2="'+g.x1+'" y1="'+y+'" y2="'+y+'"/>';
      tx+='<span class="pl-t pl-ty" style="top:'+y+'px;right:'+(g.w-g.x0+8)+'px">'+plTickText(v,g.y.log)+'</span>';});
    g.x.ticks.forEach(function(v){var x=g.x.map(v).toFixed(1);h+='<line class="pl-tk" x1="'+x+'" x2="'+x+'" y1="'+g.y0+'" y2="'+(g.y0+5)+'"/>';
      tx+='<span class="pl-t pl-tx" style="left:'+x+'px;top:'+(g.y0+8)+'px">'+plTickText(v,g.x.log)+'</span>';});
    h+='<line class="pl-axis" x1="'+g.x0+'" x2="'+g.x1+'" y1="'+g.y0+'" y2="'+g.y0+'"/><line class="pl-axis" x1="'+g.x0+'" x2="'+g.x0+'" y1="'+g.y1+'" y2="'+g.y0+'"/>';
    tx+='<span class="pl-an pl-anx" style="left:'+((g.x0+g.x1)/2).toFixed(1)+'px;top:'+(g.y0+24)+'px">'+plEsc(g.x.name)+(g.x.log?' (log scale)':'')+'</span>'+
      '<span class="pl-an pl-any" style="left:'+(g.x0-PL_M.l+4)+'px;top:0">'+plEsc(g.y.name)+(g.y.log?' (log scale)':'')+'</span>';
    T.series.forEach(function(se){
      var to=p.shown[se.id],fr=fp?fp.shown[se.id]:undefined,on=s.hi.indexOf(se.id)>=0;
      if(to!==undefined){var a=upPx(g,to),b=fr===undefined?(fp?g.x0:a):upPx(g,fr);h+=seriesSvg(g,se,plLerp(b,a,t),1,on);}
      else if(fr!==undefined)h+=seriesSvg(g,se,upPx(g,fr),1-t,on);});
    /* labels are placed, not stacked: each is sized from its text and moved to the next free place (the cursor's
       name on the axis, a line's name above or below it, a vertical line's name on the first free row), so two
       close lines never print over each other */
    var placed=[];
    function place(txt,cls,op,tries){
      var w=Math.ceil(txt.replace(/<[^>]+>/g,'').length*7.2+12),h=19;
      for(var i=0;i<tries.length;i++){var x=Math.max(g.x0+2,Math.min(g.x1-w,tries[i][0]-(tries[i][2]==='c'?w/2:tries[i][2]==='r'?w:0))),y=tries[i][1],
          free=placed.every(function(r){return x+w<=r.x0||x>=r.x1||y+h<=r.y0||y>=r.y1;});
        if(free||i===tries.length-1){placed.push({x0:x-3,x1:x+w+3,y0:y-1,y1:y+h+1});
          tx+='<span class="'+cls+'" style="opacity:'+op.toFixed(3)+';left:'+x.toFixed(1)+'px;top:'+y.toFixed(1)+'px">'+txt+'</span>';return;}}
    }
    /* the cursor, and where each shown series is on it */
    if(p.cursor!==null||(fp&&fp.cursor!==null)){
      var c=p.cursor!==null?p.cursor:fp.cursor,cx=g.x.map(c),cop=p.cursor===null?1-t:1;
      if(fp&&fp.cursor!==null&&p.cursor!==null)cx=plLerp(g.x.map(fp.cursor),cx,t);
      h+='<line class="pl-cur" style="opacity:'+cop.toFixed(3)+'" x1="'+cx.toFixed(1)+'" x2="'+cx.toFixed(1)+'" y1="'+g.y1+'" y2="'+g.y0+'"/>';
      if(p.cursor!==null&&t===1)T.series.forEach(function(se){var up=p.shown[se.id];if(up===undefined||c>up)return;var v=plValue(se,c);
        if(v===null)return;[].concat(v).forEach(function(y){if(!(plNum(y)&&(!g.y.log||y>0)))return;
          if(y<g.y.lo||y>g.y.hi)return;h+='<g class="pl-at" style="color:var('+se.ink+')">'+plShape(se.shape,cx,g.y.map(y),4.2)+'</g>';});});
      place(plEsc(g.x.short)+' = '+plotFmt(c),'pl-cn',cop,[[cx,g.y0-24,'c']]);
    }
    /* the named lines: a name in both glides, a new one fades in, a gone one fades out */
    function lines(bag,fbag,horiz){
      var keys={};Object.keys(bag).forEach(function(k){keys[k]=1;});if(fbag)Object.keys(fbag).forEach(function(k){keys[k]=1;});
      Object.keys(keys).sort().forEach(function(k){
        var a=bag[k],f=fbag?fbag[k]:undefined,op=a!==undefined?(f!==undefined||!fbag?1:t):1-t,v=a!==undefined?a:f,
            px=horiz?g.y.map(v):g.x.map(v);
        if(a!==undefined&&f!==undefined)px=plLerp(horiz?g.y.map(f):g.x.map(f),px,t);
        var on=s.hi.indexOf(k)>=0?' hi':'';
        if(horiz){h+='<line class="pl-ref'+on+'" style="opacity:'+op.toFixed(3)+'" x1="'+g.x0+'" x2="'+g.x1+'" y1="'+px.toFixed(1)+'" y2="'+px.toFixed(1)+'"/>';
          place(plEsc(k)+' '+plotFmt(v),'pl-rn'+on,op,[[g.x1-4,px-21,'r'],[g.x1-4,px+3,'r'],[g.x0+6,px-21,'l'],[g.x0+6,px+3,'l']]);}
        else{h+='<line class="pl-ref'+on+'" style="opacity:'+op.toFixed(3)+'" x1="'+px.toFixed(1)+'" x2="'+px.toFixed(1)+'" y1="'+g.y1+'" y2="'+g.y0+'"/>';
          var rows=[];for(var r=0;r<6;r++)rows.push([px,g.y1+2+21*r,'c']);
          place(plEsc(k)+' = '+plotFmt(v),'pl-rn'+on,op,rows);}
      });
    }
    lines(p.levels,fp&&fp.levels,true);lines(p.ats,fp&&fp.ats,false);
    svg.innerHTML=h;text.innerHTML=tx;
    read.innerHTML=p.rows.map(function(r){return '<li class="'+(r.on?'':'off')+(s.hi.indexOf(r.id)>=0?' hi':'')+'">'+plSwatch(r)+'<span class="pl-nm">'+plEsc(r.name)+'</span><b>'+plEsc(r.text)+'</b></li>';}).join('');
    read.style.minHeight=rows?(rows*26)+'px':'';
  }
  function describe(s){
    var p=s.plot,ax=p.ax,out=o.aria||('A plot of '+ax.y.name+(ax.y.log?' on a log scale':'')+' against '+ax.x.name+(ax.x.log?' on a log scale':'')+'.');
    if(o.aria)return out;
    var on=p.rows.filter(function(r){return r.on;});
    if(p.cursor!==null)out+=' At '+ax.x.short+' = '+plotFmt(p.cursor)+': '+(on.length?on.map(function(r){return r.name+' '+r.text;}).join('; '):'nothing is drawn yet')+'.';
    else out+=on.length?' Drawn: '+on.map(function(r){return r.name;}).join('; ')+'.':' Nothing is drawn yet.';
    var lv=Object.keys(p.levels).sort().map(function(k){return k+' at '+plotFmt(p.levels[k]);}),at=Object.keys(p.ats).sort().map(function(k){return k+' at '+ax.x.short+' = '+plotFmt(p.ats[k]);});
    if(lv.length||at.length)out+=' Lines: '+lv.concat(at).join(', ')+'.';
    return out;
  }
  self={
    mount:function(stage){
      stage.innerHTML='<div class="pl"><div class="pl-box"><svg class="pl-svg" role="img"></svg><div class="pl-text" aria-hidden="true"></div></div><ul class="pl-read" aria-label="Values at the cursor"></ul></div>';
      box=stage.querySelector('.pl-box');svg=box.querySelector('svg');text=box.querySelector('.pl-text');read=stage.querySelector('.pl-read');
    },
    layout:function(s){return {cursor:s.plot.cursor};},
    draw:draw,
    /* every tab's readout keeps the tallest tab's rows, so switching tabs never moves the controls below */
    sizeTo:function(all){all.forEach(function(s){rows=Math.max(rows,s.plot.rows.length);});},
    inv:[],check:function(){return [];},
    fields:function(s,hiF){return s.fields.map(function(f){return '<span'+hiF(f[0])+'>'+plEsc(f[0])+' <b>'+plEsc(f[1])+'</b></span>';}).join('');},
    label:function(s){svg.setAttribute('aria-label',describe(s));}
  };
  return self;
}

/* the invariant every plot shows: what was measured, and every line and the cursor, lie inside the axes. A curve
   may leave the top (2ⁿ does), and is drawn cut off there. */
var PL_INV=[['on the axes','every measured value, every named line and the cursor lie inside the axes',function(s){
  var p=s.plot,ax=p.ax,inX=function(v){return v>=ax.x.lo-1e-9&&v<=ax.x.hi*(1+1e-9);},inY=function(v){return v>=ax.y.lo-1e-9&&v<=ax.y.hi*(1+1e-9);},ok=true;
  Object.keys(p.shown).forEach(function(id){var se=p.T.by[id];if(se.data)se.data.forEach(function(d){if(d[0]<=p.shown[id]&&!(inX(d[0])&&d.slice(1).every(inY)))ok=false;});});
  Object.keys(p.levels).forEach(function(k){if(!inY(p.levels[k]))ok=false;});Object.keys(p.ats).forEach(function(k){if(!inX(p.ats[k]))ok=false;});
  return ok&&(p.cursor===null||inX(p.cursor));}]];

/* hold a measured series to an independent statement of it: want(n) is the closed form or a second
   implementation. Throws at the first n where they differ, so a wrong count is a page that fails. */
function plotCheck(data,want,what){
  data.forEach(function(p){var w=want(p[0]),got=p.length===3?[p[1],p[2]]:p[1];
    if(JSON.stringify(w)!==JSON.stringify(got))throw new Error((what||'plot')+': at n = '+p[0]+' the count is '+JSON.stringify(got)+' but should be '+JSON.stringify(w));});
  return data;
}

/* Record a finished trace as steps for a PlotPlayer. o.intro and o.outro are the first and last captions;
   o.fields(state) adds to the fields line after the trace's own counters; o.inv, [[short, long, fn(snapshot)]],
   are this walkthrough's own claims, shown and checked beside the plot's. */
function plotWalk(T,o){
  o=o||{};T.done();
  var ax=plotExtent(T),M=new PlotModel(T),steps=[];
  T.events.forEach(function(e){e.ops.forEach(function(op){if(op[0]==='count'&&!M.counts.some(function(c){return c[0]===op[1];}))M.counts.push([op[1],'–']);});});
  function rec(note,hi){var k=steps.length,s=M.snap(note,hi,ax,o.fields?o.fields(plotState(T,k)):null);s.plot.inv=o.inv||null;steps.push(s);plotSame(plotState(T,k),plotRead(s),k);}
  rec(o.intro||'The axes, before anything is drawn.');
  T.events.forEach(function(e){e.ops.forEach(function(op){M.apply(op);});rec(e.note,e.hi);});
  if(o.outro)rec(o.outro,[]);
  return steps;
}
/* o.inv: [[short, long, fn(snapshot) -> bool]], the lesson's own claims, checked on every step */
/* The static chart five lessons draw: one picture, no player. pts = [[x, a, b]] measured by running both
   versions; names = [a's name, b's name]; log scales the y axis; xticks fixes the x ticks. Drawn by PlotView, so
   its text is HTML and its two series differ in ink, dash and marker as well as colour. */
function costChart(host,o){
  var pts=o.pts,xmax=o.xmax||pts[pts.length-1][0],names=o.names||['naive','once'];
  var T=new PlotTrace({x:{name:o.xlabel,lo:0,hi:xmax,ticks:o.xticks},y:{name:o.ylabel||'work',scale:o.log?'log':'lin'},
    series:[{id:'a',name:names[0],kind:'points',tone:'bad',data:pts.map(function(p){return [p[0],p[1]];}).filter(function(p){return !o.log||p[1]>0;})},
            {id:'b',name:names[1],kind:'points',tone:'good',data:pts.map(function(p){return [p[0],p[2]];}).filter(function(p){return !o.log||p[1]>0;})}]});
  T.step('',[T.reveal('a'),T.reveal('b'),T.cursor(pts[pts.length-1][0])]);
  var s=plotWalk(T)[1],view=PlotView({aria:o.aria});
  host.classList.add('pl-chart');view.mount(host);view.sizeTo([s]);
  var redraw=function(){view.draw(s,view.layout(s),1);view.label(s);};
  redraw();onRepaint(redraw);if('ResizeObserver' in window)new ResizeObserver(redraw).observe(host);
  return {redraw:redraw};
}
