/* kit/stacks.js: lanes of values recorded one move at a time, and the player that draws them.
   One model covers the stack and queue shapes of the course: a stack (a column, top up), a queue
   or deque (a row, front left), a plain row (an input array, or a ring buffer's fixed slots), and
   call frames (a stack whose items carry a second line of locals). Several lanes can share a
   player, and an item moved between lanes keeps its identity, so it glides from one to the other
   (a queue built from two stacks, a value read off the input onto a stack).
   Included by build.py only in lessons that use it (KIT_OPTIONAL). Names are prefixed (lane*)
   because every kit file and the lesson share one scope. */

var laneUid=0;
/* defs: [{id, kind:'stack'|'queue'|'row', label, cap}]. cap fixes a lane's slots: a row with cap
   holds holes (null) and is written by slot, like a ring buffer's backing array. o.fields(M) gives
   the fields line for every snapshot: [[name, value]]. */
function Lanes(defs,o){
  this.o=o||{};this.order=[];this.by={};this.ends={};
  var self=this;
  defs.forEach(function(d){var l={id:d.id,kind:d.kind,label:d.label||d.id,cap:d.cap||0,items:[],marks:{}};
    if(l.cap&&l.kind==='row')for(var k=0;k<l.cap;k++)l.items.push(null);
    self.order.push(d.id);self.by[d.id]=l;});
}
function laneItem(v,sub){return {id:++laneUid,v:v,sub:sub==null?null:sub,tone:null};}
Lanes.prototype={
  lane:function(id){var l=this.by[id];if(!l)throw new Error('no lane '+id);return l;},
  size:function(id){return this.lane(id).items.filter(function(x){return x;}).length;},
  /* a stack's top or a queue's back; front=true puts it at a queue's front (a deque) */
  push:function(id,v,sub,front){var l=this.lane(id),it=laneItem(v,sub);this._fits(l);front?l.items.unshift(it):l.items.push(it);this.ends[it.id]=front?'front':'back';return it;},
  pushFront:function(id,v,sub){return this.push(id,v,sub,true);},
  /* a stack's top or a queue's back; front=true takes a queue's front (dequeue) */
  pop:function(id,front){var l=this.lane(id);if(!l.items.length)throw new Error(id+' is empty');var it=front?l.items.shift():l.items.pop();this.ends[it.id]=front?'front':'back';return it;},
  popFront:function(id){return this.pop(id,true);},
  peek:function(id,front){var l=this.lane(id);return l.items.length?l.items[front?0:l.items.length-1]:null;},
  /* take from one lane and put the same item on another: it glides between them */
  move:function(from,to,fromFront,toFront){var it=this.pop(from,fromFront),l=this.lane(to);this._fits(l);toFront?l.items.unshift(it):l.items.push(it);delete this.ends[it.id];return it;},
  /* a fixed row: write or clear one slot */
  put:function(id,slot,v,sub){var l=this.lane(id),it=laneItem(v,sub);this._slot(l,slot);l.items[slot]=it;return it;},
  clear:function(id,slot){var l=this.lane(id);this._slot(l,slot);var it=l.items[slot];l.items[slot]=null;return it;},
  /* change an item in place (a frame's locals, a value rewritten): same item, new text */
  set:function(it,v,sub){if(v!==undefined)it.v=v;if(sub!==undefined)it.sub=sub;return it;},
  /* 'dim' (done with), 'good', 'bad', or null */
  tone:function(it,t){it.tone=t||null;return it;},
  /* a named index into a lane (i, head, tail); null removes it */
  mark:function(id,name,slot){var l=this.lane(id);if(slot===null||slot===undefined)delete l.marks[name];else l.marks[name]=slot;},
  _fits:function(l){if(l.kind==='row'&&l.cap)throw new Error(l.id+' has fixed slots: use put');if(l.cap&&l.items.length>=l.cap)throw new Error(l.id+' is full');},
  _slot:function(l,slot){if(!(l.kind==='row'&&l.cap))throw new Error(l.id+' is not a fixed row');if(slot<0||slot>=l.cap)throw new Error(l.id+': slot '+slot+' is out of range');},
  snap:function(note,o){
    o=o||{};var self=this,ends=self.ends;self.ends={};
    return {note:note,hi:o.hi||[],done:!!o.done,fields:self.o.fields?self.o.fields(self):[],ends:ends,
      lanes:self.order.map(function(id){var l=self.by[id],marks={},n=l.items.length;
        for(var k in l.marks)marks[k]=l.marks[k];
        /* the ends every lesson names, drawn unless the lesson placed its own of that name */
        if(l.kind==='stack'&&n&&!('top' in marks))marks.top=n-1;
        if(l.kind==='queue'&&n){if(!('front' in marks))marks.front=0;if(!('back' in marks))marks.back=n-1;}
        return {id:l.id,kind:l.kind,label:l.label,cap:l.cap,marks:marks,
          items:l.items.map(function(it){return it?{id:it.id,v:String(it.v),sub:it.sub==null?null:String(it.sub),tone:it.tone}:null;})};})};
  }
};
function laneHi(it){return 'item:'+it.id;}


/* ---------- the view ---------- */
var LCH=40,LCH2=54,LGAP=6,LPAD=10,LBLOCK=30,LMARGIN=24;
/* JetBrains Mono advances at 0.6em: 16px values, 12px locals */
function laneCellW(items){var w=56;items.forEach(function(x){if(!x)return;w=Math.max(w,Math.ceil(x.v.length*9.6+26),x.sub?Math.ceil(x.sub.length*7.2+24):0);});return w;}

/* o.inv: [[short, long, fn(s) -> bool]], the invariants the panel checks at rest. o.len: how
   many slots a growing lane shows when the player is not sized to its snapshots (a playground). */
function LanePlayer(host,o){
  o=o||{};var svg,root,dims=null,VBW=0,VBH=0,inv=o.inv||[];

  /* Fixed per lane for the player's life: cell size and how many slots it draws. */
  function measure(all){
    var d={};
    all.forEach(function(s){s.lanes.forEach(function(l){
      var m=d[l.id]||(d[l.id]={kind:l.kind,label:l.label,cap:l.cap,cw:56,ch:LCH,len:Math.max(l.cap||0,o.len||0,1)});
      m.cw=Math.max(m.cw,laneCellW(l.items));if(l.items.some(function(x){return x&&x.sub;}))m.ch=LCH2;
      m.len=Math.max(m.len,l.items.length);});});
    return d;
  }
  /* Blocks down the canvas: each row lane is a block, and consecutive stacks stand side by side in
     one block. Every lane's box is fixed by dims, so nothing moves but the items. */
  function place(d,order){
    var blocks=[],cur=null;
    order.forEach(function(id){var m=d[id];
      if(m.kind==='stack'){if(!cur||cur.kind!=='stack'){cur={kind:'stack',ids:[]};blocks.push(cur);}cur.ids.push(id);}
      else{cur={kind:'row',ids:[id]};blocks.push(cur);cur=null;}});
    var y=0,w=0;
    blocks.forEach(function(b){
      if(b.kind==='stack'){
        /* a column is its cells plus room on the right for the names that point into it */
        var cols=b.ids.map(function(id){var m=d[id];return {id:id,w:m.cw+2*LPAD,h:m.len*(m.ch+LGAP)-LGAP+LPAD,side:68};});
        var bw=cols.reduce(function(a,c){return a+c.w+c.side;},0)+(cols.length-1)*24,bh=Math.max.apply(null,cols.map(function(c){return c.h;}))+26;
        b.w=bw;b.h=bh;b.y=y;b.cols=cols;y+=bh+LBLOCK;w=Math.max(w,bw);
      }else{
        var m=d[b.ids[0]];b.top=m.cap?36:20;b.w=m.len*(m.cw+8)-8+2*LPAD;b.h=b.top+m.ch+2*LPAD+46;b.y=y;y+=b.h+LBLOCK;w=Math.max(w,b.w);
      }
    });
    return {blocks:blocks,w:w,h:y-LBLOCK};
  }
  /* one lane set's boxes on the shared canvas, centred both ways */
  function boxesOf(d,pl){
    var boxes={},y0=(VBH-pl.h)/2;
    pl.blocks.forEach(function(b){
      var x0=(VBW-b.w)/2,y=y0+b.y;
      if(b.kind==='stack'){var x=x0;b.cols.forEach(function(c){var m=d[c.id];
          boxes[c.id]={kind:'stack',x:x,y:y+b.h-26-c.h,w:c.w,h:c.h,cw:m.cw,ch:m.ch,len:m.len,label:m.label};x+=c.w+c.side+24;});}
      else{var m=d[b.ids[0]];boxes[b.ids[0]]={kind:m.kind,x:x0,y:y+b.top,w:b.w,h:m.ch+2*LPAD,cw:m.cw,ch:m.ch,len:m.len,label:m.label,cap:m.cap};}
    });
    return boxes;
  }
  function sig(s){return s.lanes.map(function(l){return l.id;}).join('|');}
  /* Size the canvas once, to the largest lane set any snapshot shows (each tab of a walkthrough
     may have its own), and give every set its own centred boxes on it. */
  function sizeAll(all){
    var d=measure(all),sets={},plans={};VBW=320;VBH=0;
    all.forEach(function(s){var k=sig(s);if(plans[k])return;plans[k]=place(d,s.lanes.map(function(l){return l.id;}));
      VBW=Math.max(VBW,plans[k].w+2*LMARGIN);VBH=Math.max(VBH,plans[k].h+2*LMARGIN);});
    Object.keys(plans).forEach(function(k){sets[k]=boxesOf(d,plans[k]);});
    dims={d:d,sets:sets};setBox();
  }
  function boxesFor(s){return dims.sets[sig(s)]||{};}

  /* drawn at 1:1, so text keeps its size: a lane that is wider than the stage scrolls inside it */
  function setBox(){svg.setAttribute('viewBox','0 0 '+VBW+' '+VBH);svg.setAttribute('width',VBW);svg.setAttribute('height',VBH);}
  function ensure(s){if(!dims)sizeAll([s]);}
  /* the centre of slot k in a lane's box */
  function slotAt(b,k){
    if(b.kind==='stack')return {x:b.x+b.w/2,y:b.y+b.h-LPAD-b.ch/2-k*(b.ch+LGAP)};
    return {x:b.x+LPAD+b.cw/2+k*(b.cw+8),y:b.y+b.h/2};
  }
  function layout(s){
    ensure(s);var items={},marks={},bx=boxesFor(s);
    s.lanes.forEach(function(l){var b=bx[l.id];if(!b)return;
      l.items.forEach(function(it,k){if(!it)return;var c=slotAt(b,k);items[it.id]={x:c.x,y:c.y,w:b.cw,h:b.ch,kind:b.kind};});
      /* names on one slot share it: one under another below a row's cell, one over another beside a column's */
      var at={};Object.keys(l.marks).sort().forEach(function(n){var k=l.marks[n];(at[k]=at[k]||[]).push(n);});
      Object.keys(at).forEach(function(k){var c=slotAt(b,+k),names=at[k];
        names.forEach(function(n,j){marks[l.id+'.'+n]=b.kind==='stack'?
          {x:c.x+b.cw/2+LPAD+14,y:c.y+(j-(names.length-1)/2)*15,side:'r',name:n}:
          {x:c.x,y:c.y+b.ch/2+18+j*15,side:'b',name:n};});});
    });
    return {items:items,marks:marks};
  }
  function lerp(a,b,t){return a+(b-a)*t;}
  function esc(x){return String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function laneSvg(id,b,s){
    var hi=s.hi.indexOf('lane:'+id)>=0?' hi':'',h='<g class="ln-lane'+hi+'">';
    if(b.kind==='stack'){
      /* open at the top: the only end a stack is used from */
      h+='<path class="ln-wall" d="M'+b.x+','+b.y+' V'+(b.y+b.h)+' H'+(b.x+b.w)+' V'+b.y+'"/>';
      h+='<text class="ln-label" x="'+(b.x+b.w/2)+'" y="'+(b.y+b.h+19)+'" text-anchor="middle">'+esc(b.label)+'</text>';
    }else if(b.kind==='queue'){
      /* open at both ends: in at the back, out at the front */
      h+='<line class="ln-wall" x1="'+b.x+'" x2="'+(b.x+b.w)+'" y1="'+b.y+'" y2="'+b.y+'"/><line class="ln-wall" x1="'+b.x+'" x2="'+(b.x+b.w)+'" y1="'+(b.y+b.h)+'" y2="'+(b.y+b.h)+'"/>';
      h+='<text class="ln-label" x="'+b.x+'" y="'+(b.y-7)+'">'+esc(b.label)+'</text>';
    }else{
      h+='<text class="ln-label" x="'+b.x+'" y="'+(b.y-(b.cap?23:7))+'">'+esc(b.label)+'</text>';
      /* a fixed row draws every slot and its index, so the empty ones and the wrap are visible */
      if(b.cap)for(var k=0;k<b.len;k++){var c=slotAt(b,k);
        h+='<rect class="ln-slot" x="'+(c.x-b.cw/2)+'" y="'+(c.y-b.ch/2)+'" width="'+b.cw+'" height="'+b.ch+'" rx="10"/>'+
          '<text class="ln-idx" x="'+c.x+'" y="'+(b.y-7)+'" text-anchor="middle">'+k+'</text>';}
    }
    return h+'</g>';
  }
  function itemSvg(it,a,op,extra,old,t){
    var x=a.x-a.w/2,y=a.y-a.h/2,two=!!(it.sub||(old&&old.sub));
    /* a value rewritten in place crossfades: the old text out, the new in */
    function txt(v,sub,o2){return '<g style="opacity:'+o2.toFixed(3)+'">'+(two?
      '<text class="ln-val" x="'+a.x+'" y="'+(a.y-4)+'" text-anchor="middle">'+esc(v)+'</text><text class="ln-sub" x="'+a.x+'" y="'+(a.y+14)+'" text-anchor="middle">'+esc(sub||'')+'</text>':
      '<text class="ln-val" x="'+a.x+'" y="'+(a.y+5.5)+'" text-anchor="middle">'+esc(v)+'</text>')+'</g>';}
    var changed=old&&(old.v!==it.v||old.sub!==it.sub)&&t<1;
    return '<g class="ln-item'+(it.tone?' '+it.tone:'')+extra+'" style="opacity:'+op.toFixed(3)+'">'+
      '<rect class="ln-box" x="'+x+'" y="'+y+'" width="'+a.w+'" height="'+a.h+'" rx="10"/>'+
      (changed?txt(old.v,old.sub,1-t)+txt(it.v,it.sub,t):txt(it.v,it.sub,1))+'</g>';
  }
  /* where an item comes from or goes to off its lane: a stack's top, the queue end it used, above a row */
  function away(a,end){return a.kind==='stack'?{x:a.x,y:a.y-26}:(a.kind==='row'?{x:a.x,y:a.y-18}:{x:a.x+(end==='front'?-30:30),y:a.y});}
  function draw(s,L,t,fromS,fromL){
    var h=[],hi=s.hi,byFrom={};
    if(fromS)fromS.lanes.forEach(function(l){l.items.forEach(function(it){if(it)byFrom[it.id]=it;});});
    var bx=boxesFor(s);s.lanes.forEach(function(l){if(bx[l.id])h.push(laneSvg(l.id,bx[l.id],s));});
    var now={};s.lanes.forEach(function(l){l.items.forEach(function(it){if(it)now[it.id]=it;});});
    /* outgoing: items this step removed, drifting off the end they left by */
    if(fromS&&t<1)Object.keys(byFrom).forEach(function(id){if(now[id])return;var a=fromL.items[id];if(!a)return;
      var e=away(a,s.ends[id]);h.push(itemSvg(byFrom[id],{x:lerp(a.x,e.x,t),y:lerp(a.y,e.y,t),w:a.w,h:a.h},1-t,'',null,1));});
    s.lanes.forEach(function(l){l.items.forEach(function(it){if(!it)return;var a=L.items[it.id],f=fromS&&t<1?fromL.items[it.id]:null,was=byFrom[it.id],q,op=1;
      if(f)q={x:lerp(f.x,a.x,t),y:lerp(f.y,a.y,t),w:lerp(f.w,a.w,t),h:lerp(f.h,a.h,t)};
      else if(fromS&&!was&&t<1){var e=away(a,s.ends[it.id]);q={x:lerp(e.x,a.x,t),y:lerp(e.y,a.y,t),w:a.w,h:a.h};op=t;}
      else q=a;
      h.push(itemSvg(it,q,op,hi.indexOf('item:'+it.id)>=0?' hi':'',f?was:null,t));});});
    var to=L.marks,from=fromS&&t<1?fromL.marks:null,keys={};
    Object.keys(to).forEach(function(k){keys[k]=1;});if(from)Object.keys(from).forEach(function(k){keys[k]=1;});
    Object.keys(keys).forEach(function(k){var a=to[k],b=from&&from[k],op=1,q;
      if(a&&b&&a.side===b.side)q={x:lerp(b.x,a.x,t),y:lerp(b.y,a.y,t),side:a.side,name:a.name};else if(a){q=a;op=from?t:1;}else{q=b;op=1-t;}
      var cls='ln-mark'+(hi.indexOf(q.name)>=0?' hi':'');
      h.push(q.side==='r'?
        '<g class="'+cls+'" style="opacity:'+op.toFixed(3)+'"><line x1="'+(q.x-10)+'" x2="'+(q.x-3)+'" y1="'+q.y+'" y2="'+q.y+'"/><text x="'+q.x+'" y="'+(q.y+4)+'">'+esc(q.name)+'</text></g>':
        '<g class="'+cls+'" style="opacity:'+op.toFixed(3)+'"><line x1="'+q.x+'" x2="'+q.x+'" y1="'+(q.y-14)+'" y2="'+(q.y-6)+'"/><text x="'+q.x+'" y="'+(q.y+6)+'" text-anchor="middle">'+esc(q.name)+'</text></g>');});
    root.innerHTML=h.join('');
  }
  function describe(s){
    return s.lanes.map(function(l){var vs=l.items.map(function(x){return x?x.v+(x.sub?' ('+x.sub+')':''):'empty';});
      var what=l.kind==='stack'?'Stack '+l.label+(vs.length?', bottom to top: ':' is empty'):(l.kind==='queue'?'Queue '+l.label+(vs.length?', front to back: ':' is empty'):'Row '+l.label+': ');
      var ms=Object.keys(l.marks).map(function(n){return n+' at '+l.marks[n];});
      return what+vs.join(', ')+(ms.length?'; '+ms.join(', '):'');}).join('. ')+'.';
  }
  return new StepPlayer(host,o,{
    mount:function(stage){svg=S('svg',{role:'img','class':'ln-svg'},stage);svg.innerHTML='<g class="lp-root"></g>';root=svg.querySelector('.lp-root');},
    /* size every lane to the largest it will ever be, over every snapshot (every tab's) */
    sizeTo:function(all){if(all.length)sizeAll(all);},
    /* what the step is about, within w: a cursor it names on a row first (where the reading is), then
     its highlighted items and names while they still fit beside it; with nothing named, the row cursors */
    focus:function(s,L,w){
      var first=[],then=[];
      Object.keys(L.marks).forEach(function(k){var m=L.marks[k];if(s.hi.indexOf(m.name)>=0)(m.side==='b'?first:then).push([m.x-20,m.x+20]);});
      Object.keys(L.items).forEach(function(id){if(s.hi.indexOf('item:'+id)>=0){var a=L.items[id];then.push([a.x-a.w/2,a.x+a.w/2]);}});
      if(!first.length&&!then.length)Object.keys(L.marks).forEach(function(k){var m=L.marks[k];if(m.side==='b')first.push([m.x-20,m.x+20]);});
      var r=null;first.concat(then).forEach(function(x,n){var u=r?[Math.min(r[0],x[0]),Math.max(r[1],x[1])]:x;if(!r||n<first.length||u[1]-u[0]<=w)r=u;});
      return r;},
    layout:layout,draw:draw,inv:inv.map(function(x){return [x[0],x[1]];}),
    check:function(s){return inv.map(function(x){return !!x[2](s);});},
    fields:function(s,hiF){return s.fields.map(function(f){return '<span'+hiF(f[0])+'>'+esc(f[0])+' <b>'+esc(f[1])+'</b></span>';}).join('');},
    label:function(s){svg.setAttribute('aria-label',describe(s));}
  });
}
function mountLaneTabs(w,examples,o){return mountPlayerTabs(w,examples,function(h,x){return new LanePlayer(h,x);},o);}
