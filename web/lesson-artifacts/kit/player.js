/* kit/player.js: the step player every structure player shares (lists.js, stacks.js). It owns the
   chrome and the clock: a stage, one quiet line of fields and invariants, a caption, and a slim step
   track; soft motion between snapshots, a loop while on screen, nothing moving under reduced motion.
   What a snapshot looks like and how it is drawn belongs to a view:
     view.mount(stage, player)   build the drawing surface inside the stage
     view.layout(s)              where everything in snapshot s sits (deterministic, from s alone)
     view.draw(s,L,t,fromS,fromL) draw s at tween progress t (1 = settled) from the previous snapshot
     view.fields(s,hi)           the fields line; hi(name) gives ' class="hi"' when s highlights it
     view.inv, view.check(s)     invariant labels [short, long] and whether each holds in s
     view.label(s)               the stage's accessible name
     view.focus(s,L,w)           optional: [x0, x1] in drawing units to keep in view, no wider than w
                                 when it can help it; a stage narrower than its drawing scrolls to it
     view.sizeTo(all)            optional: size the canvas once for every snapshot it will show;
                                 load() calls it with the loaded steps unless the page sized it first
   Included by build.py whenever a player is (KIT_DEPS). */

var TWEEN=720,HOLD=2800;
var soft=function(p){return p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;};
/* time on a step: long enough to read its caption */
function dwell(s){var words=s.note.replace(/<[^>]+>/g,'').split(/\s+/).length;return Math.max(2200,Math.min(5200,1200+words*190));}

function StepPlayer(host,o,view){
  o=o||{};var self=this;
  host.innerHTML='<div class="lp">'+
    '<div class="lp-stage"></div>'+
    '<div class="lp-meta"><span class="lp-fields"></span><span class="lp-inv" role="list" aria-label="Invariants"></span></div>'+
    '<p class="lp-note" aria-live="polite"></p>'+
    '<div class="lp-bar"><button type="button" class="lp-btn pv" aria-label="Previous step">'+icon('i-prev')+'</button>'+
    '<button type="button" class="lp-btn lp-main pp" aria-label="Play"></button>'+
    '<button type="button" class="lp-btn nx" aria-label="Next step">'+icon('i-next')+'</button>'+
    '<div class="lp-track" role="group" aria-label="Steps"></div><span class="lp-count"></span></div></div>';
  var stage=host.querySelector('.lp-stage'),fields=host.querySelector('.lp-fields'),inv=host.querySelector('.lp-inv'),note=host.querySelector('.lp-note'),
      track=host.querySelector('.lp-track'),count=host.querySelector('.lp-count'),pp=host.querySelector('.pp'),pv=host.querySelector('.pv'),nx=host.querySelector('.nx');
  var steps=[],i=0,shown=null,shownL={},timer=0,raf=0,playing=false,visible=!o.loop;
  view.mount(stage,self);
  var sized=false;
  this.sizeTo=function(all){sized=true;if(view.sizeTo)view.sizeTo(all);};

  function chrome(k){
    var s=steps[k],hiF=function(f){return s.hi.indexOf(f)>=0?' class="hi"':'';};
    fields.innerHTML=view.fields(s,hiF);
    var iv=view.check(s),between=s.done||k===0;
    inv.innerHTML=view.inv.map(function(t,j){var st=between?(iv[j]?'ok':'bad'):'mid';
      return '<span role="listitem" class="'+st+'" title="'+t[1]+'" aria-label="'+t[1]+': '+(st==='mid'?'mid-operation, not checked':(st==='ok'?'holds':'broken'))+'"><i></i>'+t[0]+'</span>';}).join('');
    note.innerHTML=s.note;
    track.querySelectorAll('button').forEach(function(b,j){b.classList.toggle('on',j<=k);b.setAttribute('aria-current',j===k?'step':'false');});
    count.textContent=(k+1)+' / '+steps.length;pv.disabled=k===0;nx.disabled=k===steps.length-1&&!o.loop;
    view.label(s);
  }
  function show(k,animate){
    var s=steps[k],L=view.layout(s),from=shown,fromL=shownL;
    cancelAnimationFrame(raf);i=k;chrome(k);follow(s,L);
    if(!animate||reduce||!from)view.draw(s,L,1);
    else{var t0=performance.now();(function tick(now){var p=Math.min(1,(now-t0)/TWEEN);view.draw(s,L,soft(p),from,fromL);if(p<1)raf=requestAnimationFrame(tick);})(t0);}
    shown=s;shownL=L;
  }
  /* on a phone a drawing can be wider than its stage: keep what the caption is about in view */
  function follow(s,L){
    if(!view.focus||stage.scrollWidth<=stage.clientWidth+1)return;var r=view.focus(s,L,stage.clientWidth-32);if(!r)return;
    var d=stage.firstElementChild,base=d.getBoundingClientRect().left-stage.getBoundingClientRect().left+stage.scrollLeft,
        a=base+r[0]-16,b=base+r[1]+16,l=stage.scrollLeft,w=stage.clientWidth;
    if(a>=l&&b<=l+w)return;
    var to=b-a>w?a:(a<l?a:b-w);stage.scrollTo({left:Math.max(0,to),behavior:reduce?'auto':'smooth'});
  }
  function buildTrack(){track.innerHTML='';steps.forEach(function(_,j){var b=el('button','lp-seg');b.type='button';b.setAttribute('aria-label','Step '+(j+1));
    b.addEventListener('click',function(){stop();show(j,true);});track.appendChild(b);});}
  function setIcon(){pp.innerHTML=icon(playing?'i-pause':'i-play');pp.setAttribute('aria-label',playing?'Pause':(o.loop||i<steps.length-1?'Play':'Replay'));}
  function stop(){playing=false;clearTimeout(timer);setIcon();}
  function tick(){
    clearTimeout(timer);if(!playing)return;
    if(!visible){timer=setTimeout(tick,700);return;}  // off screen: hold this step until it is back
    if(i<steps.length-1){timer=setTimeout(function(){if(!playing)return;show(i+1,true);tick();},dwell(steps[i]));return;}
    if(o.loop){timer=setTimeout(function(){if(!playing)return;shown=null;show(0,false);fadeIn();tick();},HOLD);return;}
    stop();
  }
  function fadeIn(){if(reduce)return;stage.animate&&stage.animate([{opacity:0},{opacity:1}],{duration:500,easing:'ease-out'});}
  function play(){if(reduce&&o.loop)return;if(i>=steps.length-1&&!o.loop){show(o.replayFrom||0,false);}playing=true;setIcon();tick();}
  pp.addEventListener('click',function(){if(playing)stop();else play();});
  pv.addEventListener('click',function(){stop();if(i>0)show(i-1,true);});
  nx.addEventListener('click',function(){stop();if(i<steps.length-1)show(i+1,true);else if(o.loop){shown=null;show(0,false);}});
  /* a looping player runs only while on screen, and never under reduced motion */
  if(o.loop&&'IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){visible=e.isIntersecting;
    if(visible&&o.autoplay&&!self.touched&&!playing&&!reduce)play();});},{threshold:.35}).observe(host);}
  host.addEventListener('pointerdown',function(e){if(e.target.closest('.lp-bar'))self.touched=true;});
  /* reserve the caption's height for the longest caption given, so a wrap never moves the controls */
  var reserveNotes=[];
  function reserve(){var probe=note.cloneNode(false);probe.removeAttribute('aria-live');probe.setAttribute('aria-hidden','true');
    probe.style.cssText='position:absolute;visibility:hidden;left:0;top:0;min-height:0;width:'+note.clientWidth+'px';note.parentNode.appendChild(probe);
    var h=0;reserveNotes.concat(steps.map(function(x){return x.note;})).forEach(function(t){probe.innerHTML=t;h=Math.max(h,probe.offsetHeight);});
    probe.remove();if(h)note.style.minHeight=h+'px';}
  if('ResizeObserver' in window)new ResizeObserver(function(){reserve();}).observe(host);
  this.reserve=function(notes){reserveNotes=notes;reserve();};
  this.load=function(list){stop();steps=list;shown=null;shownL={};if(!sized&&view.sizeTo)view.sizeTo(list);buildTrack();show(0,false);reserve();centre();
    if(o.autoplay&&visible&&!reduce&&!self.touched&&o.loop)play();};
  /* the playground: append one operation and play it through once */
  this.push=function(list){stop();var from=steps.length;steps=steps.concat(list);o.replayFrom=from-1;buildTrack();reserve();show(from,true);
    if(reduce){show(steps.length-1,false);return;}playing=true;setIcon();tick();};
  function centre(){if(stage.scrollWidth>stage.clientWidth)stage.scrollLeft=(stage.scrollWidth-stage.clientWidth)/2;}
  this.busy=function(){return playing&&!o.loop;};
  this.redraw=function(){if(shown)view.draw(shown,shownL,1);};
  setIcon();
}

/* tabbed walkthroughs: play on arrival, loop while on screen. make(host,o) builds the player. */
function mountPlayerTabs(w,examples,make,o){
  var tabs=w.querySelector('.extabs'),player=make(w.querySelector('.lvhost'),Object.assign({loop:true,autoplay:true},o));
  function load(k){tabs.querySelectorAll('button').forEach(function(b,j){b.setAttribute('aria-pressed',j===k);});player.touched=false;player.load(examples[k].steps());}
  examples.forEach(function(e,k){var b=el('button','tab',e.name);b.type='button';b.addEventListener('click',function(){load(k);});tabs.appendChild(b);});
  var every=[].concat.apply([],examples.map(function(e){return e.steps();}));
  player.sizeTo(every);
  player.reserve(every.map(function(x){return x.note;}));
  onRepaint(player.redraw);load(0);
  return player;
}
