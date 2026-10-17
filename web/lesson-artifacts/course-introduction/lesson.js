/* ================= Course Introduction: the lesson =================
   One technique, first_repeat, answers three problems that look different; a shelf of recipe cards keyed
   by exact title answers one. Every number the page shows is computed in the PURE block below by running
   the code it describes, and check.py runs that block in node, re-derives each number independently in
   Python, and compares the module and stage counts with the app's own manifest. */

/* PURE:begin (no DOM below this line until PURE:end) */
/* the course's stages and how many modules each holds: check.py compares this table with manifest.ts */
var COURSE={stages:[['Foundations',3],['Linear Structures',6],['Techniques on Linear Data',6],['Recursive & Hierarchical',5],['Global Reasoning',4]]};

/* the technique: the first item that appeared earlier. checks counts the membership questions asked */
function frRepeat(items){
  var seen=new Set(),checks=0;
  for(var i=0;i<items.length;i++){checks++;if(seen.has(items[i]))return {answer:items[i],at:i,checks:checks};seen.add(items[i]);}
  return {answer:null,at:-1,checks:checks};
}
/* the nested-loop version: compare each item with every item before it. compares counts the comparisons */
function frNested(items){
  var compares=0;
  for(var i=0;i<items.length;i++)for(var j=0;j<i;j++){compares++;if(items[j]===items[i])return {answer:items[i],compares:compares};}
  return {answer:null,compares:compares};
}
var PROBLEMS=[
  {name:'Numbers',title:'Duplicate numbers in an array',items:[4,9,2,7,9,5],show:'[4, 9, 2, 7, 9, 5]',what:'numbers'},
  {name:'Letters',title:'First repeated letter in a word',items:'balloon'.split(''),show:'"balloon"',what:'letters'},
  {name:'Words',title:'First repeated word in a sentence',items:'the cat saw the dog'.split(' '),show:'"the cat saw the dog"',what:'words'}
];
/* the recipe shelf: one card, filed under the exact title it was written for */
var SHELF={'Duplicate numbers in an array':'compare each number with the ones before it'};
function frCard(p){return Object.prototype.hasOwnProperty.call(SHELF,p.title)?frNested(p.items).answer:undefined;}
/* worst case for both versions: a list with no repeat, so each does all of its work */
function frDistinct(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a;}
var COSTS=[10,20,30,40,50,60,70,80,90,100].map(function(n){return [n,frNested(frDistinct(n)).compares,frRepeat(frDistinct(n)).checks];});
function frGroup(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');}
var FACTS=(function(){
  var last=COSTS[COSTS.length-1];
  return {
    problems:PROBLEMS.length,
    recipeHits:PROBLEMS.filter(function(p){return frCard(p)!==undefined;}).length,
    techHits:PROBLEMS.filter(function(p){return frRepeat(p.items).answer!==null;}).length,
    modules:COURSE.stages.reduce(function(s,x){return s+x[1];},0),
    stages:COURSE.stages.length,
    costN:last[0],nestedAt:frGroup(last[1]),setAt:frGroup(last[2]),ratio:Math.round(last[1]/last[2])
  };
})();
/* PURE:end */

/* ---------- 1. the shelf against the technique ---------- */
function frShow(v){return typeof v==='string'?'"'+v+'"':String(v);}
function frSteps(p){
  var items=p.items,scanned=0,size=0,answer=null;
  var M2=new Lanes([{id:'in',kind:'row',label:p.what+', in order',idx:true},{id:'seen',kind:'row',label:'seen (a set)'}],
    {fields:function(){return [['scanned',scanned],['seen',size],['answer',answer===null?'none yet':frShow(answer)]];}});
  var cells=items.map(function(v){return M2.push('in',v);}),steps=[],seenItems={};
  function rec(note,hi){steps.push(M2.snap(note,{hi:hi||[],done:true}));}
  rec('Read the '+p.what+' left to right. <code>seen</code> starts empty: nothing has been read yet.');
  for(var i=0;i<items.length;i++){
    var v=items[i],cell=cells[i];scanned=i+1;M2.mark('in','i',i);M2.tone(cell,'cur');
    if(Object.prototype.hasOwnProperty.call(seenItems,String(v))){
      var twin=seenItems[String(v)];M2.tone(cell,'good');M2.tone(twin,'good');answer=v;
      rec('Read '+frShow(v)+'. Is it in <code>seen</code>? Yes: it was read earlier. Return '+frShow(v)+', after '+scanned+' step'+(scanned===1?'':'s')+'.',[laneHi(cell),laneHi(twin),'answer']);
      break;
    }
    rec('Read '+frShow(v)+'. Is it in <code>seen</code>? No.',[laneHi(cell),'scanned']);
    seenItems[String(v)]=M2.copy('in',i,'seen');size++;M2.tone(cell,'dim');
    rec('Add '+frShow(v)+' to <code>seen</code>.',[laneHi(seenItems[String(v)]),'seen']);
  }
  /* the walk must agree with the pure technique: same answer, same number of items read */
  var want=frRepeat(items);
  if(want.answer!==answer||want.checks!==scanned)throw new Error('the lane walk disagrees with frRepeat for '+p.title);
  return steps;
}
function frInv(){
  var by=function(s,id){return s.lanes.filter(function(l){return l.id===id;})[0];};
  return [
    ['one of each','a set holds each value once',function(s){var v=by(s,'seen').items.map(function(x){return x.v;});return v.every(function(x,k){return v.indexOf(x)===k;});}],
    ['only the past','every value in seen has already been read',function(s){var at=by(s,'in').marks.i,i=at===undefined?-1:at,read=by(s,'in').items.slice(0,i+1).map(function(x){return x.v;});
      return by(s,'seen').items.every(function(x){return read.indexOf(x.v)>=0;});}]
  ];
}
function frPanel(k){
  var p=PROBLEMS[k],card=frCard(p),tech=frRepeat(p.items).answer;
  return '<div class="rc-row"><span class="rc-k">Recipe shelf</span><span class="rc-q">look up the title <b>'+p.title+'</b></span>'+
    (card!==undefined?'<span class="rc-v good">card found: '+SHELF[p.title]+' → '+frShow(card)+'</span>':'<span class="rc-v bad">no card with this title</span>')+'</div>'+
    '<div class="rc-row"><span class="rc-k">Technique</span><span class="rc-q"><code>first_repeat</code> on <b>'+p.show+'</b></span><span class="rc-v good">'+frShow(tech)+'</span></div>'+
    '<div class="rc-score">Over all '+FACTS.problems+' problems: the shelf answers <b>'+FACTS.recipeHits+'</b>, the technique <b>'+FACTS.techHits+'</b>.</div>';
}
function mountCooks(w){
  var rc=$('#rc'),cur=0,all=PROBLEMS.map(function(_,k){return frPanel(k);});
  /* the panel keeps the height of its tallest tab, so changing tab never moves the player under it */
  function paint(k){cur=k;rc.innerHTML=all[k];}
  function fit(){rc.style.minHeight='';reserveHeight(rc,all);}
  mountLaneTabs(w,PROBLEMS.map(function(p){return {name:p.name,steps:function(){return frSteps(p);}};}),{id:'cooks',inv:frInv()});
  w.querySelectorAll('.extabs button').forEach(function(b,k){b.addEventListener('click',function(){paint(k);});});
  paint(0);fit();
  if('ResizeObserver' in window)new ResizeObserver(fit).observe(w);
}

/* ---------- 2. the cost: nested loops against a set ---------- */
function mountCost(){
  var last=COSTS[COSTS.length-1];
  costChart($('#cmp'),{names:['nested loops: comparisons','seen-set: membership checks'],pts:COSTS,xlabel:'items in the list (no repeat)',xticks:[0,20,40,60,80,100],ylabel:'questions asked',
    aria:'Work to find the first repeat in a list with no repeat: nested loops make '+last[1]+' comparisons at '+last[0]+' items, growing with the square of the length; the seen-set asks '+last[2]+' questions, growing in step with the length.'});
  $('#costNote').innerHTML='Counted by running both versions: at <b>'+FACTS.costN+'</b> items the nested loops made <b>'+FACTS.nestedAt+'</b> comparisons and the set asked <b>'+FACTS.setAt+'</b> questions, about <b>'+FACTS.ratio+'</b> times fewer. Double the list and the set doubles its work; the nested loops make four times as many comparisons.';
}

/* ---------- 3. the road: modules per stage ---------- */
function mountStages(){
  var h=$('#stages');
  COURSE.stages.forEach(function(s,k){
    var pips='';for(var i=0;i<s[1];i++)pips+='<i></i>';
    h.appendChild(el('div','st-row','<span class="st-n">Stage '+k+'</span><span class="st-t">'+s[0].replace(/&/g,'&amp;')+'</span><span class="st-p" aria-hidden="true">'+pips+'</span><span class="st-c">'+s[1]+' modules</span>'));
  });
  h.appendChild(el('div','st-total','<b>'+FACTS.modules+'</b> modules in <b>'+FACTS.stages+'</b> stages'));
}

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountLesson();
  mountCooks($('#shelf'));
  mountCost();
  mountStages();
})();

/* ================= systems layer: the shelf hero ================= */
(function(){
  function heroShelf(){
    var svg=$('#heroShelf');if(!svg)return;
    var X0=150,CW=124,rows=[{y:116,label:'recipe shelf',hit:function(k){return frCard(PROBLEMS[k])!==undefined;}},{y:208,label:'technique',hit:function(k){return frRepeat(PROBLEMS[k].items).answer!==null;}}];
    S('text',{x:280,y:30,class:'hd-lab','text-anchor':'middle'},svg).textContent='three problems arrive, one after another';
    PROBLEMS.forEach(function(p,k){
      S('rect',{x:X0+k*CW,y:44,width:CW-12,height:34,rx:8,class:'hs-prob'},svg);
      S('text',{x:X0+k*CW+(CW-12)/2,y:66,class:'hs-pt','text-anchor':'middle'},svg).textContent=p.name;
    });
    var cells=[];
    rows.forEach(function(r,ri){
      S('text',{x:X0-14,y:r.y+26,class:'hd-lab','text-anchor':'end'},svg).textContent=r.label;
      PROBLEMS.forEach(function(p,k){
        var g=S('g',{},svg),ok=r.hit(k);
        S('rect',{x:X0+k*CW,y:r.y,width:CW-12,height:44,rx:8,class:'hs-cell '+(ok?'ok':'no')},g);
        S('text',{x:X0+k*CW+(CW-12)/2,y:r.y+27,class:'hs-ct','text-anchor':'middle'},g).textContent=ok?'answer: '+frShow(ri===0?frCard(p):frRepeat(p.items).answer):'no card';
        g.style.opacity=0;cells.push({g:g,row:ri,k:k,ok:ok});
      });
    });
    var num=$('#heroNum'),unit=$('#heroUnit'),cap=$('#heroCap');
    function show(n){/* n problems have arrived: 0..3 */
      cells.forEach(function(c){c.g.style.opacity=c.k<n?1:0;});
      var shelf=0;for(var k=0;k<n;k++)if(rows[0].hit(k))shelf++;
      num.textContent=shelf;unit.textContent='of '+n+' answered by the shelf';
      cap.innerHTML=n===0?'The shelf and the technique wait for a problem':'The technique has answered '+n+' of '+n;
    }
    if(reduce||!M||!M.animate){show(PROBLEMS.length);return;}
    var last=-1;M.animate(0,5,{duration:5*1.6,ease:'linear',repeat:Infinity,onUpdate:function(v){var n=Math.min(3,Math.floor(v));if(n!==last){last=n;show(n);}}});
  }
  heroShelf();kinetic();riseIn();
})();
