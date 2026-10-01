/* ================= Middle of the Linked List: the lesson =================
   Every list is real nodes at fixed places; the walkthroughs record a snapshot after each
   statement of real code (kit/lists.js ptrSnap), and every number the prose quotes is computed
   below by running the code it describes. */

function mlList(vals){return ptrRow(vals)[0]||null;}
function mlRange(n){var a=[];for(var i=1;i<=n;i++)a.push(i);return a;}
function mlShow(a){return '['+a.join(',')+']';}

/* the page's code, as running code: each mirrors a file in code/, which the code gate runs in both languages.
   The two-walker versions report how many passes they made and how many links they read. */
var mlPasses=0,mlReads=0;
function midSolution(head){var slow=head,fast=head;mlPasses=0;mlReads=0;
  while(fast!==null&&fast.next!==null){slow=slow.next;fast=fast.next.next;mlPasses++;mlReads+=3;}return slow;}
function midTwoPass(head){var n=0,node=head;mlReads=0;while(node!==null){n++;node=node.next;mlReads++;}
  node=head;for(var i=0;i<Math.floor(n/2);i++){node=node.next;mlReads++;}return node;}
function midFirstMiddle(head){var slow=head,fast=head;while(fast.next!==null&&fast.next.next!==null){slow=slow.next;fast=fast.next.next;}return slow;}
/* the swapped condition reads fast.next with fast null on even lengths: JavaScript throws, as the shown code does */
function midSwapped(head){var slow=head,fast=head;while(fast.next!==null&&fast!==null){slow=slow.next;fast=fast.next.next;}return slow;}

/* the sandbox's four lists; the expected middle is index floor(n / 2), stated without any list code */
var CASES=[[1,2,3,4,5],[1,2,3,4,5,6],[1],[1,2]];
(function selfCheck(){
  for(var n=1;n<=100;n++){
    var a=mlRange(n),want=a.slice(Math.floor(n/2)).join();
    if(ptrVals(midSolution(mlList(a))).join()!==want)throw new Error('middle check failed at n='+n);
    var oneReads=mlReads;
    if(mlPasses!==Math.floor(n/2))throw new Error('pass count failed at n='+n);
    if(ptrVals(midTwoPass(mlList(a))).join()!==want)throw new Error('two-pass check failed at n='+n);
    if(Math.abs(mlReads-oneReads)>1)throw new Error('the two versions should read within one link of each other, n='+n);
    var fm=ptrVals(midFirstMiddle(mlList(a))).join(),wantFirst=a.slice(n%2?Math.floor(n/2):n/2-1).join();
    if(fm!==wantFirst)throw new Error('first-middle claim failed at n='+n);
    var threw=false;try{midSwapped(mlList(a));}catch(e){threw=true;}
    if(threw!==(n%2===0))throw new Error('swapped condition should throw exactly on even lengths, n='+n);
  }
})();

/* ---------- the two-to-one invariant, from a snapshot alone ---------- */
var ML_INV=[['fast = 2 × slow','fast has gone exactly twice as far as slow, counting from the head']];
/* a pointer's index from the head, the length when it is null: one past the end */
function mlIndex(s,id){var w=snapWalk(s,s.head);return id===null?w.ids.length:w.ids.indexOf(id);}
function mlCheck(s){return [mlIndex(s,s.tags.fast)===2*mlIndex(s,s.tags.slow)];}
function mlFields(s,hiF,val){
  return ['slow','fast'].map(function(k){var id=s.tags[k];return '<span'+hiF(k)+'>'+k+' <b>'+(id===null?'null':val(id))+'</b></span>';}).join('')+
    '<span'+hiF('passes')+'>passes <b>'+s.data.passes+'</b></span>';
}
var ML_OPTS={inv:ML_INV,check:mlCheck,fields:mlFields};

/* ---------- a walkthrough: one snapshot per pass ---------- */
function midSteps(vals,early){
  var ns=ptrRow(vals),head=ns[0],slow=head,fast=head,passes=0,steps=[];
  function rec(note,hi,done){steps.push(ptrSnap(note,{nodes:ns,head:head,tags:{slow:slow,fast:fast},above:['head'],hi:hi||[],done:done!==false,data:{passes:passes}}));}
  var cond=early?'<code>fast.next</code> and <code>fast.next.next</code> exist':'<code>fast</code> and <code>fast.next</code> exist';
  rec('The list '+ptrText(head)+', '+vals.length+' node'+(vals.length>1?'s':'')+'. <code>slow</code> and <code>fast</code> both start at the head. The loop runs while '+cond+'.',[]);
  for(;;){
    var go=early?fast.next!==null&&fast.next.next!==null:fast!==null&&fast.next!==null;
    if(!go)break;
    slow=slow.next;fast=fast.next.next;passes++;
    rec('Pass '+passes+': <code>slow</code> steps once, to '+slow.value+'; <code>fast</code> steps twice, to '+(fast?fast.value:'null, past the end')+'.',['slow','fast']);
  }
  var why=early?(fast.next===null?'<code>fast.next</code> is null':'<code>fast.next.next</code> is null'):(fast===null?'<code>fast</code> is null: the last double step ran past the end':'<code>fast</code> is on the last node, with no <code>next</code>');
  rec('The loop stops: '+why+'. Return <code>slow</code>: '+mlShow(ptrVals(slow))+'.',[],true);
  var n=vals.length,want=vals.slice(early&&n%2===0?n/2-1:Math.floor(n/2));
  if(ptrVals(slow).join()!==want.join())throw new Error('walkthrough of '+mlShow(vals)+' returned '+mlShow(ptrVals(slow)));
  return steps;
}

/* ---------- 2. predict where slow stops ---------- */
var PREDICT=[4,5,6].map(function(n){
  var a=mlRange(n),stop=ptrVals(midSolution(mlList(a)))[0];
  return {n:n,vals:a,expect:stop,passes:mlPasses};
});
function mountGuess(host){
  mountPredict(host,PREDICT,{
    question:function(c){return 'The list <code>'+mlShow(c.vals)+'</code> has '+c.n+' nodes. Which node is <code>slow</code> on when the loop stops?';},
    choices:function(c){return [2,3,4];},
    draw:function(view,c){
      var row=el('div','pl-mini','<span>'+ptrText(mlList(c.vals))+'</span>');view.appendChild(row);
      return {reveal:function(){row.innerHTML='<span>slow stops on '+c.expect+' after '+c.passes+' pass'+(c.passes>1?'es':'')+'</span><span>returns '+mlShow(c.vals.slice(c.expect-1))+'</span>';}};
    },
    why:function(c){
      var odd=c.n%2===1;
      return 'After '+c.passes+' pass'+(c.passes>1?'es':'')+' <code>slow</code> is on node '+c.expect+' and <code>fast</code> '+(odd?'is on the last node, '+c.n+', with no <code>next</code>':'has stepped past the end to null')+', so the loop stops. '+
        (odd?'With an odd length there is one middle.':'With an even length that is the <b>second</b> middle: '+(c.expect-1)+' and '+c.expect+' are both in the middle, and the condition lets the last double step run.');
    }
  });
}

/* ---------- 3. what each version costs, counted ---------- */
function mountCost(){
  var pts=[];
  for(var n=0;n<=100;n+=10){var m=Math.max(1,n);midSolution(mlList(mlRange(m)));var one=mlReads;midTwoPass(mlList(mlRange(m)));pts.push([m,mlReads,one]);}
  var last=pts[pts.length-1];
  costChart($('#cost'),{names:['two passes: count, then walk half','two walkers: one step and two'],ylabel:'links read',pts:pts,xlabel:'nodes in the list',xticks:[0,25,50,75,100],
    aria:'Links read to find the middle, against list length up to 100: the two-pass version and the two walkers read about the same number, roughly one and a half times the length; at 100 nodes they read '+last[1]+' and '+last[2]+'.'});
  $('#costNote').innerHTML='Counted by running both: at 100 nodes the two-pass version reads <b>'+last[1]+'</b> links and the two walkers <b>'+last[2]+'</b>. At every length from 1 to 100 the two counts are within one of each other.';
}

/* ---------- the numbers lesson.md quotes as {{name}}: computed here, never typed ---------- */
function listWords(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];}
var FACTS=(function(){
  midSolution(mlList(mlRange(100)));var p100=mlPasses;
  var crashed=CASES.filter(function(c){try{midSwapped(mlList(c));return false;}catch(e){return true;}}).map(mlShow);
  var fm=CASES.filter(function(c){return c.length%2===0;}).map(function(c){return mlShow(c)+' gives '+mlShow(ptrVals(midFirstMiddle(mlList(c))));});
  return {passes100:p100,orderCrashes:'throws on '+listWords(crashed)+', the two even ones, and passes the two odd ones',
    firstMiddleAnswers:listWords(fm)};
})();

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountLesson();
  var make=function(h,o){return new ListPlayer(h,Object.assign(o,ML_OPTS));};
  mountPlayerTabs($('#race'),[1,2,3,4,5,6,7,8].map(function(n){return {name:'n = '+n,steps:function(){return midSteps(mlRange(n));}};}),make,{id:'race'});
  mountGuess($('#predict'));
  mountCost();
  mountPlayerTabs($('#trapper'),[{name:'fast and fast.next',steps:function(){return midSteps([1,2,3,4,5,6]);}},{name:'fast.next and fast.next.next',steps:function(){return midSteps([1,2,3,4,5,6],true);}}],make,{id:'trap'});
  $('#trapNote').innerHTML='Both loops agree on odd lengths. On [1,2,3,4,5,6] the first stops with <code>slow</code> on '+ptrVals(midSolution(mlList(mlRange(6))))[0]+', the second middle, and the second with <code>slow</code> on '+ptrVals(midFirstMiddle(mlList(mlRange(6))))[0]+', the first.';
  mountPlayerTabs($('#stepper'),CASES.map(function(c){return {name:mlShow(c),steps:function(){return midSteps(c);}};}),make,{id:'walk'});
})();

/* ================= systems layer: the commit chain hero, animated banners ================= */
(function(){
  function heroRace(){
    var svg=$('#heroRace');if(!svg)return;
    var N=9,x0=40,dx=60,y=136,HASH=['e3f1','9a0c','41bd','c72e','5d19','b804','27fa','f06b','8c35'];
    var h='<text class="hd-lab" x="'+x0+'" y="54">git log: newest first, each commit naming its parent</text>';
    for(var i=0;i<N-1;i++)h+='<line class="hr-link" x1="'+(x0+i*dx+15)+'" y1="'+y+'" x2="'+(x0+(i+1)*dx-15)+'" y2="'+y+'"/>';
    for(var i=0;i<N;i++)h+='<circle class="hr-c" data-i="'+i+'" cx="'+(x0+i*dx)+'" cy="'+y+'" r="13"/><text class="hr-h" x="'+(x0+i*dx)+'" y="'+(y-26)+'" text-anchor="middle">'+HASH[i]+'</text>';
    h+='<text class="hr-tag" id="hrSlow" y="'+(y+40)+'" text-anchor="middle">slow</text><text class="hr-tag fast" id="hrFast" y="'+(y+60)+'" text-anchor="middle">fast</text>';
    h+='<text class="hd-lab" x="'+x0+'" y="'+(y+110)+'" id="hrNote"></text>';
    svg.innerHTML=h;
    var num=$('#heroNum'),unit=$('#heroUnit'),cap=$('#heroCap'),passes=Math.floor(N/2);
    function show(k){/* k passes made */
      var sl=k,fa=Math.min(N-1,2*k);
      $('#hrSlow').setAttribute('x',x0+sl*dx);$('#hrFast').setAttribute('x',x0+fa*dx);
      svg.querySelectorAll('.hr-c').forEach(function(c){var i=+c.dataset.i;c.classList.toggle('mid',k===passes&&i===sl);c.classList.toggle('seen',i<=fa);});
      num.textContent=k;unit.textContent=k===1?'pass':'passes';
      $('#hrNote').textContent=k===passes?'fast is on the first commit ever made: slow is halfway, on '+HASH[sl]:'';
      cap.innerHTML=k<passes?'slow moves one parent, fast moves two':'Commit <b>'+HASH[sl]+'</b> is the one bisect tests first';
    }
    if(reduce||!M||!M.animate){show(passes);return;}
    var last=-1;M.animate(0,passes+2,{duration:(passes+2)*1.6,ease:'linear',repeat:Infinity,onUpdate:function(v){var k=Math.min(passes,Math.floor(v));if(k!==last){last=k;show(k);}}});
  }

  var banners={
    /* a chain with its middle marked */
    problem:function(svg){
      var X=chainArt(svg,[1,2,3,4,5],100,42),ring=S('rect',{x:X(2)-6,y:36,width:82,height:48,rx:11,class:'bn-path',style:'fill:none;opacity:0'},svg);
      var t=S('text',{x:X(2)+35,y:110,class:'bn-t','text-anchor':'middle'},svg);
      return function(){M.animate(0,1,{duration:.6,delay:.5,onUpdate:function(v){ring.style.opacity=v;t.textContent=v>.5?'the middle':'';}});};
    },
    /* two walkers, speeds one and two */
    attempt:function(svg){
      var X=chainArt(svg,[1,2,3,4,5],100,30),s=S('text',{y:92,class:'bn-t','text-anchor':'middle'},svg),f=S('text',{y:110,class:'bn-t','text-anchor':'middle'},svg);s.textContent='slow';f.textContent='fast';
      return function(){M.animate(0,2,{duration:2,ease:'easeInOut',onUpdate:function(v){s.setAttribute('x',X(v)+35);f.setAttribute('x',X(Math.min(4,2*v))+35);}});};
    },
    /* the honest count: two bars that end level */
    trap:function(svg){
      var a=S('rect',{x:200,y:30,width:0,height:16,rx:6,class:'bn-bar'},svg),b=S('rect',{x:200,y:70,width:0,height:16,rx:6,class:'bn-bar'},svg);
      S('text',{x:190,y:43,class:'bn-t','text-anchor':'end'},svg).textContent='two passes';S('text',{x:190,y:83,class:'bn-t','text-anchor':'end'},svg).textContent='two walkers';
      var ta=S('text',{y:43,class:'bn-t'},svg),tb=S('text',{y:83,class:'bn-t'},svg);
      return function(){M.animate(0,150,{duration:1.6,ease:'easeOut',onUpdate:function(v){var w=v*2.4;a.setAttribute('width',w);b.setAttribute('width',w);ta.setAttribute('x',208+w);tb.setAttribute('x',208+w);ta.textContent=Math.round(v)+' links';tb.textContent=Math.round(v)+' links';}});};
    },
    /* indices k and 2k */
    insight:function(svg){
      for(var i=0;i<=8;i++){S('line',{x1:80+i*70,x2:80+i*70,y1:56,y2:64,class:'bn-edge'},svg);S('text',{x:80+i*70,y:84,class:'bn-t','text-anchor':'middle'},svg).textContent=i;}
      S('line',{x1:80,x2:640,y1:60,y2:60,class:'bn-edge'},svg);
      var s=S('circle',{cx:80,cy:60,r:8,class:'hn-pk'},svg),f=S('circle',{cx:80,cy:60,r:8,class:'bn-end'},svg),lab=S('text',{x:360,y:24,class:'bn-t','text-anchor':'middle'},svg);
      return function(){M.animate(0,4,{duration:3.2,ease:'linear',onUpdate:function(v){s.setAttribute('cx',80+v*70);f.setAttribute('cx',80+2*v*70);var k=Math.round(v);lab.textContent='slow on '+k+', fast on '+2*k;}});};
    },
    /* passes: n ÷ 2 */
    solution:function(svg){
      S('rect',{x:60,y:52,width:520,height:14,rx:7,class:'bn-track'},svg);var fill=S('rect',{x:60,y:52,width:0,height:14,rx:7,class:'bn-bar'},svg);
      var big=S('text',{x:60,y:36,class:'bn-big'},svg);
      return function(){M.animate(0,50,{duration:2.6,ease:'easeOut',onUpdate:function(v){fill.setAttribute('width',520*v/100);big.textContent=Math.round(v)+' passes for 100 nodes';}});};
    }
  };
  heroRace();mountBanners(banners);kinetic();riseIn();
})();
