/* ================= Best Time to Buy & Sell Stock: the lesson =================
   Every price history on the page is real data, and every number the prose quotes is computed
   below by running the code it describes. The PURE block has no DOM: check.py runs it in node,
   recomputes its facts in Python and compares the code files in both runtimes against it. */

/* PURE:begin (no DOM below this line until PURE:end) */
function btShow(a){return '['+a.join(',')+']';}

/* the page's code, as running code: each mirrors a file in code/ */
function btSweep(prices){ /* solution.* */
  var low=prices[0],lowDay=0,best=0,buy=0,sell=0,cmps=0,steps=[];
  for(var d=0;d<prices.length;d++){
    var p=prices[d],lowIn=low,lowDayIn=lowDay,gain=p-low;
    cmps++;if(gain>best){best=gain;buy=lowDay;sell=d;}
    cmps++;if(p<low){low=p;lowDay=d;}
    steps.push({d:d,price:p,low:lowIn,lowDay:lowDayIn,gain:gain,best:best,lowAfter:low,lowDayAfter:lowDay});
  }
  return {best:best,buy:buy,sell:sell,cmps:cmps,steps:steps};
}
function btBrute(prices){ /* naive.* */
  var best=0,pairs=0;
  for(var i=0;i<prices.length;i++)for(var j=i+1;j<prices.length;j++){pairs++;if(prices[j]-prices[i]>best)best=prices[j]-prices[i];}
  return {best:best,pairs:pairs};
}
function btRange(prices){ /* mistake_global_range.* */
  var hi=prices[0],lo=prices[0];
  prices.forEach(function(p){if(p>hi)hi=p;if(p<lo)lo=p;});
  return hi-lo;
}
function btMinZero(prices){ /* mistake_min_zero.* */
  var low=0,best=0;
  prices.forEach(function(p){if(p-low>best)best=p-low;if(p<low)low=p;});
  return best;
}
function btMinFirst(prices){ /* alt_min_first.* */
  var low=prices[0],best=0;
  prices.forEach(function(p){if(p<low)low=p;if(p-low>best)best=p-low;});
  return best;
}
/* a different algorithm for the same number: the best run of day-to-day changes, an empty run allowed */
function btKadane(prices){
  var cur=0,best=0;
  for(var i=1;i<prices.length;i++){cur=Math.max(0,cur+prices[i]-prices[i-1]);best=Math.max(best,cur);}
  return best;
}
/* the many-trades variant: every rise, summed */
function btRises(prices){var s=0;for(var i=1;i<prices.length;i++)if(prices[i]>prices[i-1])s+=prices[i]-prices[i-1];return s;}
function btDiffs(prices){var o=[];for(var i=1;i<prices.length;i++)o.push(prices[i]-prices[i-1]);return o;}
function btPairs(n){return n*(n-1)/2;}

/* the histories the prose names */
var BT_A=[7,1,5,3,6,4],BT_B=[7,6,4,3,1],BT_C=[3,2,6,5,0,3],BT_D=[5,8,1,3],BT_E=[2,4,1];
var BT_LIMIT=100000,BT_TOP=10000,BT_BUDGET=100000000;

/* seeded histories: the same on every load */
function btRnd(seed){return function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
function btHistory(n,seed,top){var r=btRnd(seed),a=[];for(var i=0;i<n;i++)a.push(Math.floor(r()*(top+1)));return a;}

/* every implementation against the others, on the examples, the edge shapes and random histories */
function btSelfCheck(){
  var rnd=btRnd(20261020),runs=0,lists=[BT_A,BT_B,BT_C,BT_D,BT_E,[1],[0],[5,5,5],[1,2,3,4,5],[5,4,3,2,1],[0,10000],[10000,0]];
  for(var t=0;t<300;t++){var n=1+Math.floor(rnd()*14),a=[];for(var k=0;k<n;k++)a.push(Math.floor(rnd()*20));lists.push(a);}
  lists.forEach(function(a){
    var want=btBrute(a).best;
    if(btSweep(a).best!==want||btKadane(a)!==want||btMinFirst(a)!==want)throw new Error('best-trade implementations disagree on '+btShow(a));
    if(btSweep(a).best>0&&btSweep(a).sell<=btSweep(a).buy)throw new Error('the trade sells on or before it buys on '+btShow(a));
    if(btMinZero(a)!==Math.max.apply(null,a))throw new Error('the min-zero mistake is not the highest price on '+btShow(a));
    runs++;
  });
  [[BT_A,5],[BT_B,0],[[1],0],[BT_E,2],[[3,3,3],0]].forEach(function(c){if(btSweep(c[0]).best!==c[1])throw new Error('lesson example failed: '+btShow(c[0]));});
  return runs;
}

/* every number lesson.md quotes as {{name}}, computed here and nowhere else */
function btFacts(fmt){
  var agree=btSelfCheck();
  var a=btSweep(BT_A),big=btSweep(btHistory(BT_LIMIT,7,BT_TOP));
  if(btBrute(BT_A).pairs!==btPairs(BT_A.length))throw new Error('pair count formula fails');
  var pairs=btPairs(BT_LIMIT);
  return {
    iters:a.steps.length,cmps:a.cmps,limitN:fmt(BT_LIMIT),limitCmps:fmt(big.cmps),
    pairs:fmt(pairs),secs:Math.round(pairs/BT_BUDGET),
    zeroAnswers:'<b>'+btMinZero(BT_A)+'</b> for <code>'+btShow(BT_A)+'</code> and <b>'+btMinZero(BT_B)+'</b> for <code>'+btShow(BT_B)+'</code>, where the answers are <b>'+btSweep(BT_A).best+'</b> and <b>'+btSweep(BT_B).best+'</b>',
    agree:agree,
    diffs:btShow(btDiffs(BT_A)),kadane:btKadane(BT_A),best:btSweep(BT_A).best,rises:btRises(BT_A),
    pairs6:btBrute(BT_A).pairs
  };
}
/* PURE:end */

/* ---------- price bars: a read-only picture, or buttons that pick a buy day and a sell day ---------- */
function btBars(host,prices,onPick){
  var top=Math.max.apply(null,prices.concat([1])),days=[];
  host.innerHTML='';
  prices.forEach(function(p,i){
    var d=el(onPick?'button':'div','bt-day'),col=el('span','col'),bar=el('span','bar');
    if(onPick){d.type='button';d.setAttribute('aria-label','Day '+i+', price '+p);d.addEventListener('click',function(){onPick(i);});}
    bar.style.height='max(4px,'+(100*p/top).toFixed(1)+'%)';col.appendChild(bar);d.appendChild(col);
    d.appendChild(el('span','v',String(p)));d.appendChild(el('span','dn','day '+i));
    var tag=el('span','tag','&nbsp;');d.appendChild(tag);d.tag=tag;
    host.appendChild(d);days.push(d);
  });
  return days;
}
function btMark(days,buy,sell){
  days.forEach(function(d,i){
    d.classList.toggle('buy',i===buy);d.classList.toggle('sell',i===sell);
    d.tag.textContent=i===buy?'buy':(i===sell?'sell':' ');
    if(d.tagName==='BUTTON')d.setAttribute('aria-pressed',i===buy||i===sell);
  });
}

/* ---------- 1. by hand: pick a buy day, then a later sell day ---------- */
var BT_PICK=[{name:'7, 1, 5, 3, 6, 4',p:BT_A},{name:'7, 6, 4, 3, 1 (only falls)',p:BT_B},{name:'5, 8, 1, 3 (the low comes last)',p:BT_D}];
function mountPick(host){
  var tabs=host.querySelector('.extabs'),box=host.querySelector('.bt-days'),out=host.querySelector('.readout'),cur=0,buy=null,sell=null,days=[];
  function note(msg){out.innerHTML=msg;}
  function paint(msg){
    var p=BT_PICK[cur].p,B=btSweep(p);btMark(days,buy,sell);
    if(msg){note(msg);return;}
    if(buy===null){note('Press a day to buy on. The best trade on this history is worth <b>'+B.best+'</b>.');return;}
    if(sell===null){note('Buying on day '+buy+' at '+p[buy]+'. Now press a <b>later</b> day to sell on.');return;}
    var g=p[sell]-p[buy];
    note('Buy on day '+buy+' at '+p[buy]+', sell on day '+sell+' at '+p[sell]+': '+(g>0?'a profit of <b>'+g+'</b>':(g===0?'no profit':'a loss of <b>'+(-g)+'</b>'))+'. '+
      (g===B.best?(g>0?'No trade does better.':'Not trading is as good as any trade here.'):'The best possible is <b>'+B.best+'</b>'+(B.best>0?', buying on day '+B.buy+' and selling on day '+B.sell+'.':': prices only fall, so you do not trade.')));
  }
  function pick(i){
    var p=BT_PICK[cur].p;
    if(buy===null||sell!==null){buy=i;sell=null;paint();return;}
    if(i>buy){sell=i;paint();return;}
    var was=buy;buy=i;paint('Day '+i+' is not after day '+was+', so it cannot be the sell day. It is your buy day now, at '+p[i]+'. Press a later day to sell.');
  }
  function load(k){cur=k;buy=sell=null;tabs.querySelectorAll('button').forEach(function(b,j){b.setAttribute('aria-pressed',j===k);});days=btBars(box,BT_PICK[k].p,pick);paint();}
  BT_PICK.forEach(function(s,k){var b=el('button','tab',s.name);b.type='button';b.addEventListener('click',function(){load(k);});tabs.appendChild(b);});
  host.querySelector('.reset').addEventListener('click',function(){buy=sell=null;paint();});
  host.querySelector('.best').addEventListener('click',function(){
    var B=btSweep(BT_PICK[cur].p);
    if(B.best===0){buy=sell=null;paint('No trade makes money on this history: every later price is at or below an earlier one, so the answer is <b>0</b>.');return;}
    buy=B.buy;sell=B.sell;paint();
  });
  load(0);
}

/* ---------- 2. predict the best profit ---------- */
var BT_PREDICT=[BT_A,BT_D,BT_C].map(function(p){
  var B=btSweep(p),hi=Math.max.apply(null,p),lo=Math.min.apply(null,p),loDay=p.indexOf(lo);
  var after=p.slice(loDay+1).reduce(function(m,x){return Math.max(m,x);},lo);
  var opts=[B.best,hi-lo,after-lo,0].filter(function(v,i,a){return a.indexOf(v)===i;}).sort(function(x,y){return x-y;});
  return {p:p,expect:B.best,B:B,range:hi-lo,hi:hi,lo:lo,afterLow:after-lo,choices:opts};
});
function mountGuess(host){
  mountPredict(host,BT_PREDICT,{
    question:function(c){return 'Prices <code>'+btShow(c.p)+'</code>. What is the most you can earn from one buy and a later sell?';},
    choices:function(c){return c.choices;},
    draw:function(view,c){
      var box=el('div','bt-days still');view.appendChild(box);var days=btBars(box,c.p,null);
      return {reveal:function(){btMark(days,c.B.best>0?c.B.buy:null,c.B.best>0?c.B.sell:null);}};
    },
    why:function(c){
      var out=[c.B.best>0?'The best trade buys on day '+c.B.buy+' at '+c.p[c.B.buy]+' and sells on day '+c.B.sell+' at '+c.p[c.B.sell]+', earning '+c.B.best+'.':'Prices never rise, so no trade makes money.'];
      var loDay=c.p.indexOf(c.lo),hiDay=c.p.lastIndexOf(c.hi);
      if(c.range!==c.expect)out.push('Highest minus lowest is '+c.range+', but the highest price (day '+hiDay+') comes '+(hiDay<loDay?'before':'after')+' the lowest (day '+loDay+'), '+(hiDay<loDay?'so you cannot buy at the low and then sell at the high.':'which is not the trade that earns most.'));
      if(c.afterLow!==c.expect&&c.afterLow!==c.range)out.push('Buying at the lowest price and selling at the best price after it earns only '+c.afterLow+'.');
      return out.join(' ');
    }
  });
}

/* ---------- 3. the two traps ---------- */
var BT_TABLE=[BT_A,BT_B,BT_D,BT_E,[1],[3,3,3]];
function mountRangeTable(host){
  var wrong=0;
  BT_TABLE.forEach(function(p){
    var r=btRange(p),b=btSweep(p).best,bad=r!==b;if(bad)wrong++;
    host.appendChild(el('div','','<span>prices '+btShow(p)+'</span><em>highest − lowest → '+r+' · best trade → '+b+(bad?' <b style="color:var(--r-ink)">wrong</b>':' <b style="color:var(--g-ink)">agree</b>')+'</em>'));
  });
  /* the prose says when it agrees: exactly when some lowest day comes before some highest day, or every price is equal */
  BT_TABLE.forEach(function(p){
    var lo=Math.min.apply(null,p),hi=Math.max.apply(null,p),ordered=p.indexOf(lo)<p.lastIndexOf(hi)||lo===hi;
    if((btRange(p)===btSweep(p).best)!==ordered)throw new Error('the range mistake agrees for a different reason on '+btShow(p));
  });
  if(wrong<3)throw new Error('the range-mistake table no longer shows enough wrong rows');
  var lo=Math.min.apply(null,BT_D),hi=Math.max.apply(null,BT_D);
  if(BT_D.indexOf(hi)>=BT_D.indexOf(lo))throw new Error('the prose claim about the high and the low no longer holds');
  $('#rangeNote').innerHTML='Wrong on <b>'+wrong+'</b> of these '+BT_TABLE.length+'. It agrees only when a lowest price comes before a highest one, or when every price is equal. On <code>'+btShow(BT_B)+'</code> it answers '+btRange(BT_B)+' for a history where every trade loses money. On <code>'+btShow(BT_D)+'</code> it answers '+btRange(BT_D)+', which is buying at '+lo+' and selling at '+hi+', but the '+hi+' came <em>before</em> the '+lo+'.';
}
function mountCost(){
  var pts=[];
  for(var n=0;n<=60;n+=6){
    var h=btHistory(n,n+3,BT_TOP),b=btBrute(h),s=n?btSweep(h).steps.length:0;
    if(b.pairs!==btPairs(n)||(n&&b.best!==btSweep(h).best))throw new Error('cost check failed at n='+n);
    pts.push([n,b.pairs,s]);
  }
  var last=pts[pts.length-1];
  costChart($('#cost'),{names:['every pair of days','one pass over the days'],ylabel:'comparisons made',pts:pts,xlabel:'days of prices',xticks:[0,12,24,36,48,60],
    aria:'Comparisons made by the pair search against the one-pass sweep: at '+last[0]+' days the pair search makes '+fmt(last[1])+' and the sweep makes '+last[2]+'.'});
  $('#costNote').innerHTML='Counted by running both: at <b>'+last[0]+'</b> days the pair search makes <b>'+fmt(last[1])+'</b> comparisons and the pass makes <b>'+last[2]+'</b>. At the constraint\'s '+fmt(BT_LIMIT)+' days the pairs number <b>'+fmt(btPairs(BT_LIMIT))+'</b>, from the formula n(n − 1) ÷ 2 that the counts above confirm; at about 10⁸ simple steps a second that is roughly <b>'+Math.round(btPairs(BT_LIMIT)/BT_BUDGET)+' seconds</b> for one history.';
}

/* ---------- 4. the sweep, one day at a time ---------- */
function btSteps(prices){
  var n=prices.length,sw=btSweep(prices),low=prices[0],lowDay=0,best=0,today=null;
  var M=new Lanes([{id:'p',kind:'row',label:'price each day',idx:true},
    {id:'low',kind:'row',label:'lowest price so far, going into the day',cap:n},
    {id:'gain',kind:'row',label:'profit if sold that day',cap:n}],
    {fields:function(){return [['day',today===null?'–':today],['min_so_far',low],['best',best]];}});
  var P=[];prices.forEach(function(p){P.push(M.push('p',p));});
  var steps=[];
  function rec(note,o){steps.push(M.snap(note,o));}
  M.mark('p','low',0);M.tone(P[0],'good');
  rec('The log holds '+n+' prices, one per day. <code>min_so_far</code> starts as day 0\'s price, '+low+', and <code>best</code> as 0. Day 0 can only be bought and sold against itself, which earns 0.',{hi:['low'],done:true});
  sw.steps.forEach(function(s){
    var d=s.d;today=d;M.mark('p','today',d);M.tone(P[d],'cur');M.put('low',d,s.low);
    rec('Day '+d+': the price is '+s.price+'. The lowest price going in is '+s.low+' (day '+s.lowDay+'), so that is the best day to have bought for a sale today.',{hi:['today','low'],done:false});
    var before=best;best=s.best;M.put('gain',d,s.gain);var g=M.lane('gain').items[d];M.tone(g,s.gain>before?'good':null);
    rec('Sell today: '+s.price+' − '+s.low+' = <b>'+s.gain+'</b>. '+(s.gain>before?'That beats the best so far ('+before+'), so <code>best</code> becomes '+s.gain+'.':(d===0?'Nothing to compare yet: <code>best</code> stays 0.':'That does not beat the best so far ('+before+'), so <code>best</code> stays '+before+'.')),{hi:['best',laneHi(g)],done:false});
    low=s.lowAfter;lowDay=s.lowDayAfter;
    M.mark('p','low',lowDay);
    P.forEach(function(it,i){M.tone(it,i===lowDay?'good':(i<=d?'dim':null));});
    rec(s.lowAfter<s.low?'Today\'s '+s.price+' is below the mark ('+s.low+'), so <code>min_so_far</code> drops to '+s.lowAfter+': day '+d+' is now the cheapest day to have bought.':
      'The mark stays '+s.low+': today\'s '+s.price+' is not lower, so day '+s.lowDay+' is still the cheapest day to have bought.',{hi:['low','min_so_far'],done:true});
  });
  M.mark('p','low',null);
  if(sw.best>0){
    M.mark('p','buy',sw.buy);M.mark('p','sell',sw.sell);
    P.forEach(function(it,i){M.tone(it,i===sw.buy||i===sw.sell?'good':'dim');});
    rec('Every day has been examined. <code>best</code> is <b>'+sw.best+'</b>: buy on day '+sw.buy+' at '+prices[sw.buy]+' and sell on day '+sw.sell+' at '+prices[sw.sell]+'. Return '+sw.best+'.',{hi:['best'],done:true});
  }else{
    P.forEach(function(it){M.tone(it,'dim');});
    rec('Every day has been examined, and no day sold for more than the cheapest earlier day: <code>best</code> is still <b>0</b>. Return 0.',{hi:['best'],done:true});
  }
  var ref=btBrute(prices).best;if(best!==ref)throw new Error('walkthrough of '+btShow(prices)+' ended on '+best+', not '+ref);
  return steps;
}
/* the claims the panel checks at rest, read from the snapshot alone and against brute force */
function btField(s,name){var f=s.fields.filter(function(x){return x[0]===name;})[0];return f?+f[1]:NaN;}
function btUpto(s){var p=s.lanes[0].items.map(function(x){return +x.v;}),t=s.lanes[0].marks.today;return {p:p,k:t===undefined?0:t};}
var BT_INV=[
  ['min_so_far','min_so_far is the lowest price on days 0 to the current day',function(s){var u=btUpto(s);return btField(s,'min_so_far')===Math.min.apply(null,u.p.slice(0,u.k+1));}],
  ['best','best is the best profit over every buy day and later sell day from day 0 to the current day',function(s){var u=btUpto(s);return btField(s,'best')===btBrute(u.p.slice(0,u.k+1)).best;}]
];
var BT_WALK=[{name:'7, 1, 5, 3, 6, 4',p:BT_A},{name:'7, 6, 4, 3, 1',p:BT_B},{name:'5, 8, 1, 3',p:BT_D}];

/* ---------- the numbers lesson.md quotes as {{name}} ---------- */
var FACTS=btFacts(fmt);

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountPick($('#pick'));
  mountGuess($('#predict'));
  mountLesson();
  mountRangeTable($('#range-table'));
  mountCost();
  mountLaneTabs($('#stepper'),BT_WALK.map(function(w){return {name:w.name,steps:function(){return btSteps(w.p);}};}),{id:'sweep',inv:BT_INV});
})();

/* ================= systems layer: the low-water-mark hero ================= */
(function(){
  var box=$('#heroBars');if(!box)return;
  var P=BT_A,top=Math.max.apply(null,P),sw=btSweep(P),cols=[],mark=el('div','hb-low'),lab=el('span','hb-lowlab','low-water mark');
  P.forEach(function(p,i){
    var c=el('div','hb-col'),plot=el('div','hb-plot'),bar=el('div','hb-bar'),gain=el('div','hb-gain'),v=el('span','hb-v',String(p)),d=el('span','hb-d','day '+i);
    bar.style.setProperty('--h',(p/top).toFixed(4));bar.appendChild(v);plot.appendChild(bar);plot.appendChild(gain);c.appendChild(plot);c.appendChild(d);box.appendChild(c);cols.push({c:c,bar:bar,gain:gain});
  });
  mark.appendChild(lab);box.appendChild(mark);
  var num=$('#heroNum'),cap=$('#heroCap');
  function capOf(s){return s?'day '+s.d+': '+s.price+' − '+s.low+' = <b>'+s.gain+'</b>'+(s.lowAfter<s.low?' · new low '+s.lowAfter:''):'one price a day, oldest first';}
  function reserve(){reserveHeight(cap,[capOf(null)].concat(sw.steps.map(capOf)));}
  reserve();if('ResizeObserver' in window)new ResizeObserver(reserve).observe(cap.parentNode);
  function draw(k){/* k days examined, 0..n */
    var s=k===0?null:sw.steps[k-1],low=s?s.lowAfter:P[0];
    mark.style.setProperty('--h',(low/top).toFixed(4));
    cols.forEach(function(x,i){
      x.c.classList.toggle('cur',!!s&&i===s.d);x.c.classList.toggle('lowd',!!s&&i===s.lowDayAfter);x.c.classList.toggle('past',!!s&&i<s.d);
      var g=s&&i===s.d&&s.gain>0?s.gain:0;x.gain.style.setProperty('--g',(g/top).toFixed(4));x.gain.style.setProperty('--b',(s&&i===s.d?s.low/top:0).toFixed(4));x.gain.classList.toggle('on',g>0);
    });
    num.textContent=String(s?s.best:0);cap.innerHTML=capOf(s);
  }
  draw(P.length);
  if(M&&M.animate&&!reduce){
    var last=-1,total=P.length+2;
    M.animate(0,total,{duration:total*.95,ease:'linear',repeat:Infinity,onUpdate:function(v){var k=Math.min(P.length,Math.floor(v));if(k!==last){last=k;draw(k);}}});
  }
  kinetic();riseIn();
})();
