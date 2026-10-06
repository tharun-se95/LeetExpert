/* ================= Longest Substring Without Repeating Characters: the lesson ================= */

/* ---------- the algorithm, executed: one trace, plus independent references ---------- */
/* Every step of the one-pass window is recorded, so the animation replays what ran and never a typed-in story. */
function windowTrace(s){
  var inSet={},l=0,best=0,bl=0,br=-1,steps=[],adds=0,removes=0;
  function snap(ev,r,extra){var o={ev:ev,r:r,l:l,best:best,bl:bl,br:br,set:Object.keys(inSet).filter(function(k){return inSet[k];})};for(var k in (extra||{}))o[k]=extra[k];steps.push(o);}
  for(var r=0;r<s.length;r++){
    var c=s[r],dup=!!inSet[c],prior=-1;
    if(dup){for(var q=l;q<r;q++)if(s[q]===c)prior=q;}
    snap('arrive',r,{dup:dup,prior:prior});
    while(inSet[c]){var gone=s[l];inSet[gone]=false;l++;removes++;snap('shrink',r,{gone:gone,goneAt:l-1,still:!!inSet[c]});}
    inSet[c]=true;adds++;
    var rec=false;if(r-l+1>best){best=r-l+1;bl=l;br=r;rec=true;}
    snap('add',r,{record:rec});
  }
  return {steps:steps,best:best,bl:bl,br:br,adds:adds,removes:removes};
}
/* O(n^3), obviously correct: try every substring, look for a repeat in it */
function bruteLongest(s){
  var best=0,at=0;
  for(var i=0;i<s.length;i++)for(var j=i;j<s.length;j++){
    var sub=s.slice(i,j+1),clean=true;
    for(var a=0;a<sub.length&&clean;a++)for(var b=a+1;b<sub.length;b++)if(sub[a]===sub[b]){clean=false;break;}
    if(clean&&sub.length>best){best=sub.length;at=i;}
  }
  return {len:best,at:at};
}
function mistakeLongest(s){var w={},l=0,best=0;for(var r=0;r<s.length;r++){best=Math.max(best,r-l+1);while(w[s[r]]){w[s[l]]=false;l++;}w[s[r]]=true;}return best;}
function jumpLongest(s,guard){var last={},l=0,best=0;for(var r=0;r<s.length;r++){var c=s[r];if(c in last&&(!guard||last[c]>=l))l=last[c]+1;last[c]=r;best=Math.max(best,r-l+1);}return best;}
/* characters examined: the restart version reads forward from every start; the window reads each character in and out once */
function restartReads(s){var reads=0;for(var st=0;st<s.length;st++){var seen={};for(var e=st;e<s.length;e++){reads++;if(seen[s[e]])break;seen[s[e]]=true;}}return reads;}
function windowReads(s){var t=windowTrace(s);return t.adds+t.removes;}
function cycle(n){var a='abcdefghijklmnopqrstuvwxyz',o='';for(var i=0;i<n;i++)o+=a[i%26];return o;}

/* the strings the page uses; the first three and their answers are the problem statement's own examples */
var STATEMENT=[['abcabcbb',3],['bbbbb',1],['pwwkew',3]];
var SANDBOX=['abcabcbb','bbbbb','pwwkew','',' ','dvdf','abba','tmmzuxt'];
SANDBOX.forEach(function(s){
  var ref=bruteLongest(s).len;
  if(windowTrace(s).best!==ref||jumpLongest(s,true)!==ref)throw new Error('window and brute force disagree on "'+s+'"');
});
STATEMENT.forEach(function(p){if(windowTrace(p[0]).best!==p[1])throw new Error('statement example failed: '+p[0]);});

/* ---------- 1. explore: pick a stretch ---------- */
function mountExplore(host){
  var str='abcabcbb',chars=str.split(''),sel=[],out=host.querySelector('.readout'),tv=host.querySelector('.tv');
  var st=strip(tv,chars,pick);
  function show(a,b,msg){
    var kinds=chars.map(function(){return 'idle';});
    if(a!=null){var lo=Math.min(a,b),hi=Math.max(a,b),seen={},bad={};
      for(var i=lo;i<=hi;i++){if(seen[chars[i]]!=null){bad[i]=1;bad[seen[chars[i]]]=1;}seen[chars[i]]=i;}
      for(var j=lo;j<=hi;j++)kinds[j]=bad[j]?'bad':'win';}
    st.paint(kinds);out.innerHTML=msg;
  }
  function describe(a,b){
    var lo=Math.min(a,b),hi=Math.max(a,b),sub=str.slice(lo,hi+1),seen={};
    for(var i=lo;i<=hi;i++){if(seen[str[i]]!=null)return {clean:false,text:'"'+sub+'" is <b>not clean</b>: backend <b>'+str[i]+'</b> is hit at positions '+seen[str[i]]+' and '+i+'.'};seen[str[i]]=i;}
    return {clean:true,text:'"'+sub+'" is <b>clean</b>: '+sub.length+' requests, no backend twice.'+(sub.length===bruteLongest(str).len?' That is as long as any clean stretch gets in this log.':'')};
  }
  function pick(i){
    if(sel.length===2)sel=[];sel.push(i);
    if(sel.length===1){show(i,i,'Now pick where the stretch ends.');return;}
    var d=describe(sel[0],sel[1]);show(sel[0],sel[1],d.text);
  }
  host.querySelector('.clear').addEventListener('click',function(){sel=[];show(null,null,'Pick two positions. The stretch between them, both included, is what gets tested.');});
  host.querySelector('.best').addEventListener('click',function(){var b=bruteLongest(str);sel=[];show(b.at,b.at+b.len-1,'A longest clean stretch: "'+str.slice(b.at,b.at+b.len)+'", <b>'+b.len+'</b> requests. Any stretch longer than that repeats a backend.');});
  show(null,null,'Pick two positions. The stretch between them, both included, is what gets tested.');
}

/* ---------- 2. predict ---------- */
var PREDICT=['abcabcbb','pwwkew','abba'].map(function(s){return {s:s,expect:bruteLongest(s).len,at:bruteLongest(s).at};});
function mountGuess(host){
  mountPredict(host,PREDICT,{
    question:function(c){return 'What is the longest clean stretch in <code>'+c.s+'</code>?';},
    choices:function(){return [1,2,3,4];},
    draw:function(view,c){var st=strip(view,c.s.split(''));return {reveal:function(){st.paint(c.s.split('').map(function(_,i){return i>=c.at&&i<c.at+c.expect?'acc':'idle';}));}};},
    why:function(c){return 'The stretch <code>'+c.s.slice(c.at,c.at+c.expect)+'</code> has '+c.expect+' requests and no backend twice. Extend it by one more request in either direction and a backend repeats, and a repeat cannot be undone by adding more.';}
  });
}

/* ---------- 3. the cost of restarting ---------- */
function mountCost(host){
  var pts=[];for(var n=26;n<=520;n+=26){var s=cycle(n),a=restartReads(s),b=windowReads(s);
    if(windowTrace(s).best!==26||bruteLongest(cycle(Math.min(n,78))).len!==26)throw new Error('cycle check failed at '+n);
    pts.push([n,a,b]);}
  var last=pts[pts.length-1];
  costChart(host,{names:['restart from every position','one pass with a window'],ylabel:'characters read',pts:pts,xmax:520,xticks:[0,130,260,390,520],xlabel:'requests in the log',aria:'Characters read as the log grows: restarting from every position reads about '+Math.round(last[1]/last[2])+' times as many characters as one pass with a window.'});
  host.parentNode.querySelector('.cost-note').innerHTML='On a log of <b>'+last[0]+'</b> requests cycling through 26 backends, restarting reads <b>'+fmt(last[1])+'</b> characters and the window <b>'+fmt(last[2])+'</b>, about <b>'+Math.round(last[1]/last[2])+'</b> times fewer. Each restart re-reads a whole clean stretch of 26 plus the repeat that stops it, so it costs about 27 per start; the window reads each character in once and out once. Both counts are measured by running the two versions.';
}

/* ---------- 4. the window, frame by frame ---------- */
function windowFrames(s){
  var t=windowTrace(s),chars=s.split(''),n=chars.length,order=[];
  chars.forEach(function(c){if(order.indexOf(c)<0)order.push(c);});
  var frames=[];
  function cellsFor(st){
    var kinds=chars.map(function(_,i){
      if(st.mode==='end')return (i>=t.bl&&i<=t.br)?'acc':'dim';
      if(st.mode==='start')return 'idle';
      if(i>st.r)return 'idle';
      if(st.ev==='arrive'&&i===st.r)return 'cur';
      if(st.ev==='arrive'&&i===st.prior)return 'bad';
      if(st.ev==='shrink'&&i===st.goneAt)return 'warn';
      if(i<st.l)return 'dim';
      if(st.ev==='add'&&st.record&&i>=st.l)return 'acc';
      return 'win';
    });
    return chars.map(function(c,i){return {k:kinds[i],t:c};});
  }
  function setCells(set){return order.map(function(c){return {k:set.indexOf(c)>=0?'win':'idle',t:c};});}
  frames.push({b:{s:cellsFor({mode:'start'}),u:setCells([])},note:'The log holds '+n+' requests, each labelled with the backend that served it. The window starts empty, and the set below records which backends are inside it.',stats:[['requests',n],['window',0],['best',0]]});
  t.steps.forEach(function(st){
    var w=st.ev==='add'?st.r-st.l+1:st.r-st.l,c=chars[st.r],note;
    if(st.ev==='arrive')note='Request '+(st.r+1)+' went to backend '+c+'. Is '+c+' already in the set? '+(st.dup?'Yes, at position '+(st.prior+1)+'. The window cannot grow while it holds a repeat.':'No, so it can join the window.');
    else if(st.ev==='shrink')note='Drop the oldest request, backend '+st.gone+', and move the left edge forward. '+(st.still?c+' is still in the window, so the repeat remains and dropping continues.':'The earlier '+c+' has left, so the repeat is gone.');
    else note='Add '+c+' to the window. It now spans '+(st.r-st.l+1)+' requests: '+chars.slice(st.l,st.r+1).join('')+'.'+(st.record?' That is a new record.':' The record stays '+st.best+'.');
    frames.push({b:{s:cellsFor(st),u:setCells(st.set)},note:note,stats:[['window',w],['best',st.best]],ev:st.record?'key':(st.dup?'bad':null)});
  });
  frames.push({b:{s:cellsFor({mode:'end'}),u:setCells([])},note:'Done. The longest clean stretch is '+s.slice(t.bl,t.br+1)+', so the answer is '+t.best+'. The right edge moved '+n+' times and the left edge '+t.removes+' times, and neither ever moved backward.',stats:[['answer',t.best]],ev:'key'});
  if(t.best!==bruteLongest(s).len)throw new Error('frames disagree with brute force');
  return {frames:frames,step:1.0,poster:frames.length-1,
    legend:[['win','in the window'],['cur','just arrived'],['bad','its earlier copy'],['warn','leaving'],['acc','the longest window'],['dim','already left']],
    boards:[{id:'s',label:'the log',g:0,cols:n,rows:1,cap:46,wide:true},{id:'u',label:'backends in the window',g:1,cols:order.length,rows:1,cap:40,wide:true}],
    label:'The window over the log "'+s+'": expand on a new backend, shrink on a repeat.'};
}
var EXAMPLES=[{name:'abcabcbb (the lesson\'s first example)',s:'abcabcbb'},{name:'pwwkew',s:'pwwkew'},{name:'abba (a repeat far back)',s:'abba'}];
function mountWalk(host){mountStepper(host,EXAMPLES,function(i){return windowFrames(EXAMPLES[i].s);},'walk');}

/* ---------- the abba case the quiz quotes: an unguarded jump drags the left edge back ---------- */
var abbaBad=jumpLongest('abba',false),abbaOk=jumpLongest('abba',true);
if(abbaOk!==bruteLongest('abba').len||abbaBad===abbaOk)throw new Error('abba guard example failed');
/* ---------- the numbers lesson.md quotes as {{name}}: computed here, never typed ---------- */
var FACTS=(function(){
  var tr=windowTrace('abcabcbb'),allOk=SANDBOX.every(function(s){var t=windowTrace(s);return t.adds===s.length&&t.removes<=s.length;});
  if(!allOk)throw new Error('add/remove bound failed');
  var wrong=SANDBOX.filter(function(s){return mistakeLongest(s)!==bruteLongest(s).len;});
  return {abbaBad:abbaBad,abbaOk:abbaOk,mistakeLongest_bbbbb:mistakeLongest('bbbbb'),adds:tr.adds,removes:tr.removes,
    wrongCases:wrong.map(function(s){return '<code>'+(s===' '?'" "':s)+'</code> (gives '+mistakeLongest(s)+', answer '+bruteLongest(s).len+')';}).join(', ')};
})();
/* ---------- assemble ---------- */
(function(){
  readPal();
  mountExplore($('#explore'));
  mountGuess($('#predict'));
  mountLesson();
  mountCost($('#cost'));
  mountWalk($('#stepper'));
})();

/* ================= systems layer: the stream hero and the animated banners ================= */
(function(){
  var HERO='abcabcbb',tr=windowTrace(HERO),TILE=54,X0=(560-8*TILE)/2+2;
  function heroStream(){
    var svg=$('#heroStream');if(!svg)return;
    S('text',{x:280,y:34,class:'hn-lab','text-anchor':'middle'},svg).textContent='load balancer';
    S('rect',{x:230,y:44,width:100,height:26,rx:8,class:'hs-lb'},svg);
    var tiles=HERO.split('').map(function(c,i){
      var g=S('g',{},svg);
      var r=S('rect',{x:X0+i*TILE,y:150,width:TILE-8,height:TILE-8,rx:9,class:'hs-tile'},g);
      var tx=S('text',{x:X0+i*TILE+(TILE-8)/2,y:150+(TILE-8)/2+6,class:'hs-ch','text-anchor':'middle'},g);tx.textContent=c;
      S('text',{x:X0+i*TILE+(TILE-8)/2,y:224,class:'hn-lab','text-anchor':'middle'},svg).textContent=i+1;
      return r;});
    var win=S('rect',{x:X0,y:142,width:0,height:TILE+8,rx:12,class:'hs-win'},svg);
    var arm=S('line',{x1:280,y1:70,x2:280,y2:150,class:'hs-arm'},svg);
    var num=$('#heroNum'),cap=$('#heroCap');
    function draw(k){
      var st=tr.steps[k];if(!st)return;
      var lo=st.l,hi=st.ev==='add'?st.r:st.r-1;
      if(st.ev==='arrive'||st.ev==='shrink'){hi=st.r-1;}
      var width=Math.max(0,hi-lo+1);
      win.setAttribute('x',X0+lo*TILE-4);win.setAttribute('width',width>0?width*TILE:0);
      tiles.forEach(function(t,i){var cls='hs-tile';
        if(i<lo)cls+=' out';else if(i<=hi)cls+=' in';
        if(i===st.r&&st.ev==='arrive')cls+=' cur';
        if(st.ev==='arrive'&&st.dup&&i===st.prior)cls+=' bad';
        t.setAttribute('class',cls);});
      arm.setAttribute('x2',X0+st.r*TILE+(TILE-8)/2);
      num.textContent=st.ev==='add'?(st.r-st.l+1):Math.max(0,width);
      cap.innerHTML=st.ev==='arrive'?(st.dup?'a repeat: backend <b>'+HERO[st.r]+'</b> again':'a new backend, <b>'+HERO[st.r]+'</b>'):(st.ev==='shrink'?'dropping <b>'+st.gone+'</b> from the left':'record so far <b>'+st.best+'</b>');
    }
    draw(tr.steps.length-1);
    if(M&&M.animate&&!reduce){
      var lastK=-1;
      M.animate(0,tr.steps.length,{duration:tr.steps.length*.8,ease:'linear',repeat:Infinity,onUpdate:function(v){var k=Math.min(tr.steps.length-1,Math.floor(v));if(k!==lastK){lastK=k;draw(k);}}});
    }
  }
  var banners={
    problem:function(svg){
      'abcabcbb'.split('').forEach(function(c,i){S('rect',{x:60+i*74,y:36,width:60,height:44,rx:9,class:'bn-mid'},svg);S('text',{x:90+i*74,y:65,class:'bn-big','text-anchor':'middle'},svg).textContent=c;});
      var win=S('rect',{x:56,y:30,width:0,height:56,rx:12,class:'bn-path','fill':'none'},svg);
      S('text',{x:360,y:108,class:'bn-t','text-anchor':'middle'},svg).textContent='one request per tile: the window grows while every backend is new';
      return function(){M.animate(0,3,{duration:2.2,ease:'easeOut',onUpdate:function(v){win.setAttribute('width',Math.max(0,v*74));}});};
    },
    attempt:function(svg){
      S('text',{x:180,y:64,class:'bn-big','text-anchor':'middle'},svg).textContent='seen it?';
      S('text',{x:540,y:64,class:'bn-big','text-anchor':'middle'},svg).textContent='how far to shrink?';
      S('text',{x:180,y:96,class:'bn-t','text-anchor':'middle'},svg).textContent='what state answers this in O(1)';
      S('text',{x:540,y:96,class:'bn-t','text-anchor':'middle'},svg).textContent='and what makes the window valid again';
      var q=S('circle',{cx:360,cy:60,r:5,class:'bn-end'},svg);
      return function(){M.animate(0,1,{duration:1.6,repeat:2,repeatType:'reverse',ease:'easeInOut',onUpdate:function(v){q.setAttribute('cx',330+60*v);}});};
    },
    trap:function(svg){
      var rows=[];for(var i=0;i<5;i++){S('text',{x:40,y:24+i*20,class:'bn-t','text-anchor':'end'},svg).textContent='start '+i;var bar=S('rect',{x:52,y:14+i*20,width:0,height:11,rx:3,class:'bn-bar'},svg);rows.push(bar);}
      S('text',{x:430,y:36,class:'bn-t'},svg).textContent='each restart re-reads the same requests';
      var c=S('text',{x:430,y:74,class:'bn-big bad'},svg);c.textContent='0 reads';
      return function(){rows.forEach(function(r,i){M.animate(0,(5-i)*26,{duration:.4,delay:i*.3,ease:'easeOut',onUpdate:function(v){r.setAttribute('width',v);}});});
        M.animate(0,15,{duration:5*.3+.4,ease:'linear',onUpdate:function(v){c.textContent=Math.round(v)+' reads';}});};
    },
    insight:function(svg){
      S('rect',{x:60,y:50,width:600,height:14,rx:7,class:'bn-track'},svg);
      var w=S('rect',{x:60,y:44,width:0,height:26,rx:9,class:'bn-path','fill':'none'},svg);
      var r=S('circle',{cx:60,cy:57,r:8,class:'bn-end'},svg),l=S('circle',{cx:60,cy:57,r:8,class:'bn-mid'},svg);
      S('text',{x:360,y:104,class:'bn-t','text-anchor':'middle'},svg).textContent='the right edge advances every step; the left edge only ever chases it';
      return function(){M.animate(0,1,{duration:3.2,ease:'linear',onUpdate:function(v){
        var rp=60+540*v,lp=60+540*Math.max(0,v-.28)*(1+(v>.5?.1:0));if(lp>rp)lp=rp;
        r.setAttribute('cx',rp);l.setAttribute('cx',lp);w.setAttribute('x',lp-8);w.setAttribute('width',Math.max(0,rp-lp+16));}});};
    },
    solution:function(svg){
      S('rect',{x:60,y:52,width:520,height:14,rx:7,class:'bn-track'},svg);var fill=S('rect',{x:60,y:52,width:0,height:14,rx:7,class:'bn-bar'},svg);
      for(var i=0;i<=6;i++){S('line',{x1:60+i*520/6,x2:60+i*520/6,y1:70,y2:78,class:'bn-edge'},svg);S('text',{x:60+i*520/6,y:94,class:'bn-t','text-anchor':'middle'},svg).textContent=i;}
      var big=S('text',{x:60,y:36,class:'bn-big'},svg);big.textContent='record: 0 requests';
      return function(){M.animate(0,3,{duration:2.6,ease:'easeOut',onUpdate:function(v){fill.setAttribute('width',520*v/6);big.textContent='record: '+count(Math.round(v),'request','requests');}});};
    }
  };
  heroStream();mountBanners(banners);kinetic();riseIn();
})();
