/* kit/intervals.js: intervals on a number line, registered on lanes.js's seam (LANE_KINDS). An interval
   lane is a growing lane whose items are BARS on one shared axis: the item's slot is its row, its extent
   [lo, hi] places it and sets its width, and everything else a lane item can do works unchanged (tone, a
   highlight, swap, insert, remove, move to another interval lane, a second line). What a row cannot say
   is where on the axis a thing is, so the lane adds exactly that:
     bar / reach     put a bar at [lo, hi] (at a row, or the end); change a bar's extent in place, so a
                     merge is one bar widening while the other leaves and the rows close up
     mark            a named coordinate: the sweep line, a burst arrow, the running end (x, not a slot)
     span            a named range of the axis: a gap, free time, a zone (lo, hi are coordinates)
   Rows are the lane's own order, so sorting a list of intervals is a run of swaps that glide, and a row
   never holds two bars: no overlap has to be avoided. A bar is as wide as its extent; a point (lo = hi)
   is drawn as wide as its label, centred on its coordinate. The scale is fixed for the player's life,
   from the axis and the widest label any step shows, so nothing moves but the items.
   States are the lane's tones, named by the walkthrough (IvTrace), never by colour.
   IvTrace / ivWalk: the algorithm records what it does as steps of small operations (sort, state, reach,
   merge, add, remove, mark, band, count); ivWalk replays them on the lane and reads every snapshot back
   through ivRead, which sees the snapshot and not the trace, and throws when it disagrees with ivState,
   the pure function of the first k steps (as calltrees.js does for a call tree). A step can therefore be
   shown in any order and mean the same thing.
   Included by build.py only in lessons that draw intervals (KIT_OPTIONAL), after lanes.js. Spec:
   docs/superpowers/specs/2026-09-29-intervals-player-design.md. Names are prefixed (iv*). */

var IVBAR=30,IVBAR2=46,IVGAP=8,IVTOP=24,IVPAD=36,IVUNIT=22,IVAXIS=30,IVZONE=16;
var IV_TONES=['cur','good','bad','dim'];
var IV_STEPS=[1,2,5,10,20,50,100,200,500,1000,2000,5000,10000];
function ivNum(x){return typeof x==='number'&&isFinite(x);}
function ivLabel(lo,hi){return lo===hi?'['+lo+']':'['+lo+','+hi+']';}
/* 13px JetBrains Mono advances 7.8px; a bar's label needs that plus its padding */
function ivLabelW(v){return Math.ceil(String(v).length*7.8+16);}
function ivOf(M,id){var l=M.lane(id);if(l.kind!=='intervals')throw new Error(id+' is not an interval lane');return l;}
function ivCheck(what,lo,hi){
  if(!ivNum(lo)||!ivNum(hi))throw new Error(what+': an interval needs a numeric start and end, not ['+lo+', '+hi+']');
  if(lo>hi)throw new Error(what+': ['+lo+', '+hi+'] ends before it starts');
}
function ivInAxis(l,lo,hi,what){
  if(lo<l.axis.lo||hi>l.axis.hi)throw new Error(l.id+': '+what+' ['+lo+', '+hi+'] is outside the axis '+l.axis.lo+' to '+l.axis.hi);
}
function ivX(b,c){return b.x+IVPAD+(c-b.axis.lo)*b.unit;}

LANE_KINDS.intervals={
  /* two tabs that each call their lane 'iv' but draw different axes are measured apart */
  key:function(l){return l.label+' '+l.axis.lo+','+l.axis.hi+','+(l.axis.step||0);},
  init:function(l,d){
    var a=d.axis;
    if(!a||!ivNum(a.lo)||!ivNum(a.hi)||!(a.lo<a.hi))throw new Error(l.id+': an interval lane needs an axis {lo, hi} with lo below hi');
    if(a.step!=null&&!(a.step>0))throw new Error(l.id+': the axis step must be positive');
    l.axis={lo:a.lo,hi:a.hi,step:a.step||0};l.words=d.words||null;
  },
  /* a mark is a coordinate on the axis (the sweep line), not a slot */
  mark:function(l,name,x){
    if(x===null||x===undefined){delete l.marks[name];return;}
    if(!ivNum(x))throw new Error(l.id+': mark '+name+' is at a coordinate, not '+x);
    ivInAxis(l,x,x,'mark '+name);l.marks[name]=x;
  },
  /* a span is a range of coordinates (a gap), not of slots */
  span:function(l,name,lo,hi){
    if(lo===null||lo===undefined){delete l.spans[name];return;}
    ivCheck(l.id+' span '+name,lo,hi);ivInAxis(l,lo,hi,'span '+name);l.spans[name]={lo:lo,hi:hi};
  },
  /* a bar with no extent, or one off the axis, would draw nowhere: refuse it here, at the step that made it */
  snap:function(l,out){
    out.axis={lo:l.axis.lo,hi:l.axis.hi,step:l.axis.step};out.words=l.words;
    out.ext=l.items.map(function(it,k){
      if(!it)return null;
      if(!ivNum(it.lo)||!ivNum(it.hi))throw new Error(l.id+': row '+k+' has no extent: add bars with bar(), not push()');
      ivCheck(l.id+' row '+k,it.lo,it.hi);ivInAxis(l,it.lo,it.hi,'row '+k);
      return {lo:it.lo,hi:it.hi};});
  },

  /* ---------- the view ---------- */
  measure:function(m,l){
    m.axis=l.axis;m.unit=Math.max(m.unit||IVUNIT,IVUNIT);
    l.items.forEach(function(it,k){if(!it)return;var e=l.ext[k],w=e.hi-e.lo;if(w>0)m.unit=Math.max(m.unit,Math.ceil(ivLabelW(it.v)/w));});
    m.ch=l.items.some(function(x){return x&&x.sub;})||m.ch===IVBAR2?IVBAR2:IVBAR;
    m.zones=Math.max(m.zones||0,Object.keys(l.marks).length+Object.keys(l.spans).length);
  },
  block:function(m){
    return {w:2*IVPAD+(m.axis.hi-m.axis.lo)*m.unit,h:IVTOP+m.len*(m.ch+IVGAP)+IVAXIS+(m.zones?m.zones*IVZONE+6:0)};
  },
  box:function(m,x0,y){
    var z=IVTOP+m.len*(m.ch+IVGAP),bl=LANE_KINDS.intervals.block(m);
    return {kind:'intervals',x:x0,y:y,w:bl.w,h:bl.h,cw:m.cw,ch:m.ch,len:m.len,label:m.label,axis:m.axis,unit:m.unit,
      rowsY:y+IVTOP,axisY:y+z,zoneY:y+z+IVAXIS+2};
  },
  slotAt:function(b,k){return {x:b.x+b.w/2,y:b.rowsY+k*(b.ch+IVGAP)+b.ch/2};},
  /* a bar is as wide as its extent, centred on it */
  place:function(b,k,l){
    var e=l.ext[k],c=LANE_KINDS.intervals.slotAt(b,k);if(!e)return c;
    var x0=ivX(b,e.lo),x1=ivX(b,e.hi);
    return {x:(x0+x1)/2,y:c.y,w:e.hi>e.lo?x1-x0:ivLabelW(l.items[k].v),h:b.ch};
  },
  svg:function(id,b,l,s){
    var h='<g class="ln-lane iv-lane'+(s.hi.indexOf('lane:'+id)>=0?' hi':'')+'"><text class="ln-label" x="'+b.x+'" y="'+(b.y+12)+'">'+laneEsc(b.label)+'</text>',
      digits=String(Math.max(Math.abs(b.axis.lo),Math.abs(b.axis.hi))).length+(b.axis.lo<0?1:0),gap=digits*6.3+6,step=b.axis.step;
    if(!step)for(var i=0;i<IV_STEPS.length&&!step;i++)if(IV_STEPS[i]*b.unit>=gap)step=IV_STEPS[i];
    step=step||IV_STEPS[IV_STEPS.length-1];
    h+='<line class="iv-axis" x1="'+ivX(b,b.axis.lo)+'" x2="'+ivX(b,b.axis.hi)+'" y1="'+b.axisY+'" y2="'+b.axisY+'"/>';
    for(var t=Math.ceil(b.axis.lo/step)*step;t<=b.axis.hi;t+=step){var x=ivX(b,t);
      h+='<line class="iv-grid" x1="'+x+'" x2="'+x+'" y1="'+(b.rowsY-4)+'" y2="'+b.axisY+'"/><line class="iv-tk" x1="'+x+'" x2="'+x+'" y1="'+b.axisY+'" y2="'+(b.axisY+5)+'"/>'+
        '<text class="iv-tick" x="'+x+'" y="'+(b.axisY+19)+'" text-anchor="middle">'+t+'</text>';}
    return h+'</g>';
  },
  /* marks and spans sit at coordinates, so they are laid out from the snapshot, one zone line each below the axis */
  layout:function(l,b,extra){
    var M=extra.ivMarks||(extra.ivMarks={}),B=extra.ivBands||(extra.ivBands={}),j=0;
    Object.keys(l.marks).sort().forEach(function(n){var x=l.marks[n];
      M[l.id+'.'+n]={x:ivX(b,x),y0:b.rowsY-4,y1:b.axisY,ty:b.zoneY+j*IVZONE+10,name:n,val:x};j++;});
    Object.keys(l.spans).sort().forEach(function(n){var r=l.spans[n];
      B[l.id+'.'+n]={x0:ivX(b,r.lo),x1:ivX(b,r.hi),y0:b.rowsY-4,y1:b.axisY,ty:b.zoneY+j*IVZONE+10,name:n,lo:r.lo,hi:r.hi};j++;});
  },
  under:function(L,fromL,t,s){return ivBlend(L.extra.ivBands,fromL&&fromL.extra.ivBands,t,function(q,op){return ivBandSvg(q,op,s.hi.indexOf(q.name)>=0);});},
  over:function(L,fromL,t,s){return ivBlend(L.extra.ivMarks,fromL&&fromL.extra.ivMarks,t,function(q,op){return ivMarkSvg(q,op,s.hi.indexOf(q.name)>=0);});},
  /* on a phone: the coordinate a step names, before the bars */
  focus:function(s,L,first){
    var M=L.extra.ivMarks||{},B=L.extra.ivBands||{};
    Object.keys(M).forEach(function(k){if(s.hi.indexOf(M[k].name)>=0)first.push([M[k].x-30,M[k].x+30]);});
    Object.keys(B).forEach(function(k){if(s.hi.indexOf(B[k].name)>=0)first.push([B[k].x0,B[k].x1]);});
  },
  rest:function(L,first){var M=L.extra.ivMarks||{},k=Object.keys(M).sort()[0];if(k)first.push([M[k].x-30,M[k].x+30]);},
  describe:function(l){
    var TONE=Object.assign({cur:'current',good:'done',bad:'rejected',dim:'finished'},l.words);
    var bars=l.items.map(function(it){if(!it)return null;var t=it.tone&&TONE[it.tone];return it.v+(it.sub?' ('+it.sub+')':'')+(t?', '+t:'');}).filter(Boolean);
    var at=Object.keys(l.marks).sort().map(function(n){return n+' at '+l.marks[n];}),
        sp=Object.keys(l.spans).sort().map(function(n){return n+' from '+l.spans[n].lo+' to '+l.spans[n].hi;});
    return 'Intervals '+l.label+' on an axis from '+l.axis.lo+' to '+l.axis.hi+(bars.length?', top to bottom: '+bars.join('; '):', none')+
      (at.length||sp.length?'. '+at.concat(sp).join(', '):'')+'.';
  }
};
/* the same picture at t between two snapshots: a name in both glides, one only in the new fades in, one only in the old fades out */
function ivBlend(to,from,t,draw){
  to=to||{};from=from||null;var keys={},h=[];
  Object.keys(to).forEach(function(k){keys[k]=1;});if(from)Object.keys(from).forEach(function(k){keys[k]=1;});
  Object.keys(keys).forEach(function(k){var a=to[k],f=from&&from[k];
    if(a&&f){var q={};Object.keys(a).forEach(function(n){q[n]=typeof a[n]==='number'?f[n]+(a[n]-f[n])*t:a[n];});h.push(draw(q,1));}
    else if(a)h.push(draw(a,from?t:1));else if(f)h.push(draw(f,1-t));});
  return h.join('');
}
/* a range: a soft band behind the bars, and its name bracketed under the axis (the bracket and the
   written extent, not the tint, are what name it, so it does not rest on colour) */
function ivBandSvg(q,op,on){
  return '<g class="iv-band'+(on?' hi':'')+'" style="opacity:'+op.toFixed(3)+'"><rect x="'+q.x0.toFixed(1)+'" y="'+q.y0+'" width="'+Math.max(q.x1-q.x0,1).toFixed(1)+'" height="'+(q.y1-q.y0)+'"/>'+
    '<path d="M'+q.x0.toFixed(1)+','+(q.ty-9)+' V'+(q.ty-4)+' H'+q.x1.toFixed(1)+' V'+(q.ty-9)+'"/>'+
    '<text x="'+((q.x0+q.x1)/2).toFixed(1)+'" y="'+(q.ty+8)+'" text-anchor="middle">'+laneEsc(q.name)+' '+ivLabel(q.lo,q.hi)+'</text></g>';
}
/* a coordinate: a line down through the rows to the axis, its name and value under it */
function ivMarkSvg(q,op,on){
  return '<g class="iv-mark'+(on?' hi':'')+'" style="opacity:'+op.toFixed(3)+'"><line x1="'+q.x.toFixed(1)+'" x2="'+q.x.toFixed(1)+'" y1="'+q.y0+'" y2="'+q.ty+'"/>'+
    '<path d="M'+(q.x-4).toFixed(1)+','+(q.y0-3)+' L'+(q.x+4).toFixed(1)+','+(q.y0-3)+' L'+q.x.toFixed(1)+','+(q.y0+4)+' Z"/>'+
    '<text x="'+q.x.toFixed(1)+'" y="'+(q.ty+11)+'" text-anchor="middle">'+laneEsc(q.name)+' = '+(+q.val.toFixed(3))+'</text></g>';
}

/* a bar at [lo, hi]: on the end of the lane, or at row `at`. Its label is its extent, so it can never disagree with it. */
Lanes.prototype.bar=function(id,lo,hi,at){
  var l=ivOf(this,id);ivCheck(id,lo,hi);ivInAxis(l,lo,hi,'bar');
  var it=at===undefined?this.push(id,ivLabel(lo,hi)):this.insert(id,at,ivLabel(lo,hi));
  it.lo=lo;it.hi=hi;return it;
};
/* change a bar's extent in place: it widens or narrows where it stands, and its label follows */
Lanes.prototype.reach=function(it,lo,hi){
  if(!ivNum(it.lo))throw new Error('reach() takes a bar made by bar()');
  ivCheck('reach',lo,hi);it.lo=lo;it.hi=hi;it.v=ivLabel(lo,hi);return it;
};

/* ---------- a recorded algorithm ---------- */
/* new IvTrace(intervals, {states, band, label, axis}). states: [[name, tone, meaning]], the words this
   walkthrough uses for what a bar can be, each drawn by its own tone (null: the bar is plain, and that
   state is what every bar starts in). Two states drawn alike would be told apart by nothing, so that is
   refused. band names what a span means, if the walkthrough draws one. */
function IvTrace(intervals,o){
  o=o||{};
  if(!Array.isArray(intervals))throw new Error('an IvTrace starts from a list of [start, end] pairs');
  this.start=intervals.map(function(p,i){ivCheck('interval '+i,p[0],p[1]);return {id:i,lo:p[0],hi:p[1]};});
  this.nextId=intervals.length;this.events=[];
  if(!o.states||!o.states.length)throw new Error('an interval walkthrough names its states');
  var seen={},tones={},self=this;this.states=[];this.tone={};this.initial=null;
  o.states.forEach(function(s){
    var name=s[0],tone=s[1]===undefined?null:s[1];
    if(seen[name])throw new Error('state '+name+' is named twice');
    if(tone!==null&&IV_TONES.indexOf(tone)<0)throw new Error('state '+name+': tone is one of '+IV_TONES.join(', ')+' or null, not '+tone);
    if(tones[String(tone)]!==undefined)throw new Error('states '+tones[String(tone)]+' and '+name+' are drawn alike, so nothing tells them apart');
    seen[name]=1;tones[String(tone)]=name;self.tone[name]=tone;self.states.push({name:name,tone:tone,means:s[2]||name});
    if(tone===null)self.initial=name;});
  this.bandMeans=o.band||null;this.label=o.label||'intervals';this.axis=o.axis||null;
}
IvTrace.prototype={
  /* one recorded step: what happened (the caption), its operations, and what to light (interval ids, names) */
  step:function(note,ops,hi){
    if(!Array.isArray(ops)||!ops.every(Array.isArray))throw new Error('a step is a list of operations');
    this.events.push({note:note,ops:ops,hi:hi||[]});return this;
  },
  sort:function(by){if(by!=='lo'&&by!=='hi')throw new Error("sort by 'lo' or 'hi', not "+by);return ['sort',by];},
  state:function(id,st){return ['state',id,st];},
  reach:function(id,lo,hi){return ['reach',id,lo,hi];},
  /* keep's extent becomes the hull of both, and gone leaves */
  merge:function(keep,gone){return ['merge',keep,gone];},
  /* a new bar at row `at` (the end by default): its id is allocated now */
  add:function(lo,hi,at){ivCheck('add',lo,hi);return ['add',this.nextId++,lo,hi,at];},
  remove:function(id){return ['remove',id];},
  mark:function(name,x){return ['mark',name,x];},
  band:function(name,lo,hi){return ['band',name,lo,hi];},
  count:function(name,val){return ['count',name,val];},
  done:function(){if(!this.events.length)throw new Error('an empty interval walkthrough');ivState(this,this.events.length);return this;}
};

/* one operation on plain data: the reference the drawing is read back against. It shares nothing with the
   lane, so a step the lane draws wrongly is a step that fails. */
function ivApply(T,S,op){
  function bar(id){var b=S.by[id];if(!b)throw new Error(op[0]+': there is no bar '+id+' now');return b;}
  var a=op[0];
  if(a==='sort'){var key=op[1],at={};S.order.forEach(function(id,i){at[id]=i;});
    S.order.sort(function(x,y){return S.by[x][key]-S.by[y][key]||at[x]-at[y];});}
  else if(a==='state'){var sb=bar(op[1]);if(!(op[2] in T.tone))throw new Error('state: '+op[2]+' is not one of this walkthrough\'s states');sb.st=op[2];}
  else if(a==='reach'){var rb=bar(op[1]);ivCheck('reach',op[2],op[3]);rb.lo=op[2];rb.hi=op[3];}
  else if(a==='merge'){var k=bar(op[1]),g=bar(op[2]);if(op[1]===op[2])throw new Error('merge: a bar cannot merge with itself');
    k.lo=Math.min(k.lo,g.lo);k.hi=Math.max(k.hi,g.hi);delete S.by[op[2]];S.gone[op[2]]=1;S.order.splice(S.order.indexOf(op[2]),1);}
  else if(a==='add'){if(S.by[op[1]]||S.gone[op[1]])throw new Error('add: bar '+op[1]+' already existed');
    var pos=op[4]===undefined?S.order.length:op[4];if(!(pos>=0&&pos<=S.order.length))throw new Error('add: row '+pos+' is out of range');
    S.by[op[1]]={id:op[1],lo:op[2],hi:op[3],st:T.initial};S.order.splice(pos,0,op[1]);}
  else if(a==='remove'){bar(op[1]);S.gone[op[1]]=1;delete S.by[op[1]];S.order.splice(S.order.indexOf(op[1]),1);}
  else if(a==='mark'){if(op[2]===null)delete S.marks[op[1]];else S.marks[op[1]]=op[2];}
  else if(a==='band'){if(op[2]===null)delete S.bands[op[1]];else{ivCheck('band '+op[1],op[2],op[3]);S.bands[op[1]]=[op[2],op[3]];}}
  else if(a==='count'){var hit=S.counts.filter(function(c){return c[0]===op[1];})[0];if(hit)hit[1]=String(op[2]);else S.counts.push([op[1],String(op[2])]);}
  else throw new Error('unknown operation '+a);
}
function ivStart(T){
  var S={order:[],by:{},gone:{},marks:{},bands:{},counts:[]};
  T.start.forEach(function(p){S.by[p.id]={id:p.id,lo:p.lo,hi:p.hi,st:T.initial};S.order.push(p.id);});
  /* every counter is on the fields line from the first step, reading a dash until it is first set, so the line
     does not grow (and wrap the invariants beside it onto another line) partway through a walkthrough */
  var named={};
  T.events.forEach(function(e){e.ops.forEach(function(op){if(op[0]==='count'&&!named[op[1]]){named[op[1]]=1;S.counts.push([op[1],'–']);}});});
  return S;
}
function ivView(T,S){
  var marks={},bands={};Object.keys(S.marks).forEach(function(n){marks[n]=S.marks[n];});Object.keys(S.bands).forEach(function(n){bands[n]=S.bands[n].slice();});
  return {order:S.order.map(function(id){var b=S.by[id];return {id:id,lo:b.lo,hi:b.hi,st:b.st,tone:b.st===null?null:T.tone[b.st]};}),
    marks:marks,bands:bands,counts:S.counts.map(function(c){return [c[0],c[1]];})};
}
/* the whole picture after the first k steps, from the steps alone. k past the last step is the last picture. */
function ivState(T,k){
  var S=ivStart(T);
  for(var j=0;j<k&&j<T.events.length;j++)T.events[j].ops.forEach(function(op){ivApply(T,S,op);});
  return ivView(T,S);
}
/* the same picture read back off a recorded snapshot's lane, with no access to the trace */
function ivRead(snap,laneId){
  var l=snap.lanes.filter(function(x){return x.id===(laneId||'iv');})[0];
  if(!l)throw new Error('no interval lane in this snapshot');
  var order=[],bands={},marks={};
  l.items.forEach(function(it,k){if(!it)return;order.push({lo:l.ext[k].lo,hi:l.ext[k].hi,tone:it.tone||null,label:it.v});});
  Object.keys(l.marks).forEach(function(n){marks[n]=l.marks[n];});
  Object.keys(l.spans).forEach(function(n){bands[n]=[l.spans[n].lo,l.spans[n].hi];});
  return {order:order,marks:marks,bands:bands,counts:snap.fields.map(function(f){return [f[0],String(f[1])];})};
}
/* throws when a drawn step is not what the steps say it should be. Counters are compared as far as the
   trace names them: a lesson may add fields of its own after them. */
function ivSame(want,got,k){
  var bad=null;
  if(want.order.length!==got.order.length)bad='there should be '+want.order.length+' bars but '+got.order.length+' are drawn';
  else want.order.forEach(function(w,i){var g=got.order[i];
    if(!bad&&(w.lo!==g.lo||w.hi!==g.hi||w.tone!==g.tone||g.label!==ivLabel(g.lo,g.hi)))
      bad='row '+i+' should be '+ivLabel(w.lo,w.hi)+' ('+w.tone+') but is drawn '+g.label+' ('+g.tone+')';});
  ['marks','bands'].forEach(function(f){
    Object.keys(want[f]).concat(Object.keys(got[f])).forEach(function(n){
      if(!bad&&JSON.stringify(want[f][n])!==JSON.stringify(got[f][n]))bad=f.slice(0,-1)+' '+n+' should be '+JSON.stringify(want[f][n])+' but is drawn '+JSON.stringify(got[f][n]);});});
  want.counts.forEach(function(c,i){if(!bad&&JSON.stringify(c)!==JSON.stringify(got.counts[i]))bad='counter '+c[0]+' should read '+c[1]+' but is drawn '+JSON.stringify(got.counts[i]);});
  if(bad)throw new Error('interval step '+k+': '+bad);
}

/* the axis every step fits, unless the walkthrough sets one: the extent of everything drawn after any single
   operation (a step may set a mark and clear it again), rounded out to whole numbers */
function ivExtent(T){
  var lo=Infinity,hi=-Infinity,S=ivStart(T);
  function see(){var s=ivView(T,S);
    s.order.forEach(function(b){lo=Math.min(lo,b.lo);hi=Math.max(hi,b.hi);});
    Object.keys(s.marks).forEach(function(n){lo=Math.min(lo,s.marks[n]);hi=Math.max(hi,s.marks[n]);});
    Object.keys(s.bands).forEach(function(n){lo=Math.min(lo,s.bands[n][0]);hi=Math.max(hi,s.bands[n][1]);});}
  see();
  T.events.forEach(function(e){e.ops.forEach(function(op){ivApply(T,S,op);see();});});
  lo=Math.floor(lo);hi=Math.ceil(hi);if(lo===hi)hi=lo+1;
  return {lo:lo,hi:hi};
}
/* the invariants every interval walkthrough shows */
var IV_INV=[
  ['start ≤ end','every bar starts no later than it ends',function(s){var l=s.lanes.filter(function(x){return x.id==='iv';})[0];return l.ext.every(function(e){return !e||e.lo<=e.hi;});}],
  ['on the axis','every bar, mark and range lies inside the axis',function(s){var l=s.lanes.filter(function(x){return x.id==='iv';})[0],a=l.axis,xs=[];
    l.ext.forEach(function(e){if(e)xs.push(e.lo,e.hi);});Object.keys(l.marks).forEach(function(n){xs.push(l.marks[n]);});
    Object.keys(l.spans).forEach(function(n){xs.push(l.spans[n].lo,l.spans[n].hi);});
    return xs.every(function(x){return x>=a.lo&&x<=a.hi;});}]
];

/* Record a finished trace as steps for a LanePlayer. o.lanes are further lanes (a result list) the lesson
   drives from o.on(step, M, items); o.fields(M) adds to the fields line, after the trace's own counters;
   o.intro and o.outro are the first and last captions. The result carries .key, the states that occur. */
function ivWalk(T,o){
  o=o||{};T.done();
  var axis=o.axis||T.axis||ivExtent(T),item={},counts=[],steps=[],tones={},words={},usesBand=false;
  T.states.forEach(function(s){if(s.tone)words[s.tone]=s.name;});
  var M=new Lanes([{id:'iv',kind:'intervals',label:T.label,axis:axis,words:words}].concat(o.lanes||[]),
    {fields:function(){return counts.map(function(c){return [c[0],c[1]];}).concat(o.fields?o.fields(M):[]);}});
  function rec(note,hi){
    var k=steps.length,s=M.snap(note,{hi:hi||[],done:true});steps.push(s);
    ivSame(ivState(T,k),ivRead(s),k);
    var l=s.lanes[0];l.items.forEach(function(it){if(it)tones[String(it.tone||null)]=1;});if(Object.keys(l.spans).length)usesBand=true;
  }
  function idx(id){var i=M.lane('iv').items.indexOf(item[id]);if(i<0)throw new Error('bar '+id+' is not in the lane');return i;}
  T.start.forEach(function(p){item[p.id]=M.bar('iv',p.lo,p.hi);});
  T.events.forEach(function(e){e.ops.forEach(function(op){
    if(op[0]==='count'&&!counts.some(function(c){return c[0]===op[1];}))counts.push([op[1],'–']);});});
  rec(o.intro||'The intervals, one to a row, on a shared axis.');
  T.events.forEach(function(e){
    e.ops.forEach(function(op){
      var a=op[0];
      if(a==='sort'){var key=op[1],cur=M.lane('iv').items.slice(),at={};cur.forEach(function(it,i){at[it.id]=i;});
        var want=cur.slice().sort(function(x,y){return x[key]-y[key]||at[x.id]-at[y.id];});
        want.forEach(function(it,t){var p=M.lane('iv').items.indexOf(it);if(p!==t)M.swap('iv',p,t);});}
      else if(a==='state')M.tone(item[op[1]],T.tone[op[2]]);
      else if(a==='reach')M.reach(item[op[1]],op[2],op[3]);
      else if(a==='merge'){var keep=item[op[1]],gone=item[op[2]];M.reach(keep,Math.min(keep.lo,gone.lo),Math.max(keep.hi,gone.hi));M.remove('iv',idx(op[2]));}
      else if(a==='add')item[op[1]]=M.bar('iv',op[2],op[3],op[4]);
      else if(a==='remove')M.remove('iv',idx(op[1]));
      else if(a==='mark')M.mark('iv',op[1],op[2]);
      else if(a==='band'){if(op[2]===null)M.span('iv',op[1],null);else M.span('iv',op[1],op[2],op[3]);}
      else if(a==='count'){var c=counts.filter(function(x){return x[0]===op[1];})[0];if(c)c[1]=String(op[2]);else counts.push([op[1],String(op[2])]);}
    });
    var hi=[];e.hi.forEach(function(h){
      if(typeof h==='number'){if(item[h]&&M.lane('iv').items.indexOf(item[h])>=0)hi.push(laneHi(item[h]));}else hi.push(h);});
    if(o.on){var more=o.on(e,M,item);if(more)hi=hi.concat(more);}
    rec(e.note,hi);
  });
  rec(o.outro||'The last step: nothing more to do.');
  if(usesBand&&!T.bandMeans)throw new Error('the walkthrough draws a range but names no meaning for it: pass band to IvTrace');
  steps.key=T.states.filter(function(s){return tones[String(s.tone)];}).map(function(s){return {tone:s.tone,label:s.name+': '+s.means};})
    .concat(usesBand?[{band:true,label:T.bandMeans}]:[]);
  return steps;
}
/* tabbed interval walkthroughs: each example's steps() comes from ivWalk, and the key follows the tab */
function mountIvTabs(w,examples,o){
  var host=w.querySelector('.lvhost'),key=laneKey(host.parentNode,host),seen=[];
  var wrapped=examples.map(function(e,k){return {name:e.name,steps:function(){var s=e.steps();seen[k]=s.key;return s;}};});
  var p=mountLaneTabs(w,wrapped,Object.assign({inv:IV_INV},o));
  [].forEach.call(w.querySelectorAll('.extabs button'),function(b,k){b.addEventListener('click',function(){key.set(seen[k]);});});
  key.reserve(seen);key.set(seen[0]);
  return p;
}
