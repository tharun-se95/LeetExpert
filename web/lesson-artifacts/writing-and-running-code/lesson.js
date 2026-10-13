/* ================= Writing & Running Code: the lesson =================
   The page is a small model of the problem workspace: a draft with a real bug runs against six cases, and the
   verdict, the Tests, Console and Insight tabs and the Coach strip are all computed from that run. The
   drafts are the page's code files (code/*.py, code/*.ts) ported to JavaScript below, between the PURE
   markers, so check.py can run this very block in node and compare it with the Python and TypeScript files
   executing the same cases. Expected values come from a brute-force search over every run, never typed. */

/*PURE-BEGIN*/
var WR_CASES=[
  {nums:[1],why:'one element: the only run is that element'},
  {nums:[-2,1,-3,4,-1,2,1,-5,4],why:'a mix: the best run starts and stops in the middle'},
  {nums:[5,4,-1,7,8],why:'the best run is the whole list'},
  {nums:[-3,-1,-2],why:'every number is negative'},
  {nums:[-5],why:'one element, and it is negative'},
  {nums:[3,-10,2],why:'the best run is a single element at an end'}
];
function wrBrute(a){var best=-Infinity;for(var i=0;i<a.length;i++){var s=0;for(var j=i;j<a.length;j++){s+=a[j];if(s>best)best=s;}}return best;}
function wrFixed(a){var best=a[0],cur=a[0];for(var i=1;i<a.length;i++){cur=Math.max(a[i],cur+a[i]);best=Math.max(best,cur);}return best;}
function wrDraft(a,log){var best=0,cur=0;for(var i=0;i<a.length;i++){cur=Math.max(a[i],cur+a[i]);best=Math.max(best,cur);}if(log)log('best '+best);return best;}
function wrList(a){return '['+a.join(', ')+']';}
/* one run: every case is called on its own copy, with its own log, and judged against the brute-force answer */
function wrRun(fn){return WR_CASES.map(function(c){var logs=[],got=fn(c.nums.slice(),function(s){logs.push(s);}),exp=wrBrute(c.nums);
  return {nums:c.nums,why:c.why,got:got,expected:exp,passed:got===exp,logs:logs};});}
function wrCount(rs){return rs.filter(function(r){return r.passed;}).length;}
/* the three drafts the widget offers: the buggy one, the buggy one with a print, the fixed one */
var WR_DRAFTS=[
  {name:'Buggy draft',fn:function(a){return wrDraft(a);},note:'best starts at 0'},
  {name:'Buggy + print',fn:function(a,log){return wrDraft(a,log);},note:'prints best before returning'},
  {name:'Fixed draft',fn:function(a){return wrFixed(a);},note:'best starts at nums[0]'}
];
/*PURE-END*/

/* load-time check: the fixed draft agrees with the brute force on every page case and on random lists,
   and the buggy one is wrong exactly where a positive sum is impossible */
(function selfCheck(){
  var seed=20261013,rnd=function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(var t=0;t<300;t++){var a=[],n=1+Math.floor(rnd()*8);for(var k=0;k<n;k++)a.push(Math.floor(rnd()*13)-6);
    if(wrFixed(a)!==wrBrute(a))throw new Error('fixed draft check failed on '+wrList(a));
    var allNeg=a.every(function(x){return x<0;});
    if((wrDraft(a)!==wrBrute(a))!==allNeg)throw new Error('the buggy draft should fail exactly on all-negative lists: '+wrList(a));}
  var bug=wrRun(WR_DRAFTS[0].fn);
  if(wrCount(bug)!==WR_CASES.length-2||bug.filter(function(r){return !r.passed;}).some(function(r){return !r.nums.every(function(x){return x<0;});}))throw new Error('the buggy draft should fail only the two all-negative cases');
  if(wrCount(wrRun(WR_DRAFTS[2].fn))!==WR_CASES.length)throw new Error('the fixed draft should pass every case');
})();

/* ---------- the numbers lesson.md quotes as {{name}}: computed here, never typed ---------- */
var FACTS=(function(){
  var bug=wrRun(WR_DRAFTS[0].fn),failed=bug.filter(function(r){return !r.passed;});
  return {total:WR_CASES.length,passedBuggy:wrCount(bug),failedBuggy:failed.length,
    failingInputs:failed.map(function(r){return wrList(r.nums);}).join(' and ')};
})();

/* ---------- the rail's verdict, the app's own wording (Sandbox.tsx railStatus) ---------- */
function wrVerdict(rs){var p=wrCount(rs);return p===rs.length?'All '+rs.length+' tests passed':p+' of '+rs.length+' tests passed';}
/* the Coach's first-failure sentence, built as lib/coach/diagnose.ts failProse builds it for a wrong value */
function wrDiagnosis(r){return 'max_subarray('+wrList(r.nums)+') returned '+r.got+'; expected '+r.expected+'. Open Hint 1 on Explanation for the next authored nudge.';}

/* ---------- 1. the runner ---------- */
function mountRunner(w){
  var tabs=w.querySelector('.extabs'),runBtn=$('#wrRun'),hint=$('#wrRunHint'),rail=$('#wrRail'),rtabs=$('#wrTabs'),panel=$('#wrPanel'),coach=$('#wrCoach');
  var draft=0,results=null,tab='tests',open=false,sel=0;
  var TABS=[['insight','Insight'],['tests','Tests'],['console','Console']];
  var draftBtns=WR_DRAFTS.map(function(d,i){var b=el('button','tab',d.name);b.type='button';b.addEventListener('click',function(){draft=i;results=null;sel=0;paint();});tabs.appendChild(b);return b;});
  var tabBtns=TABS.map(function(t){var b=el('button','tab','');b.type='button';b.dataset.t=t[0];b.addEventListener('click',function(){
    if(open&&tab===t[0])open=false;else{tab=t[0];open=true;}paint();});rtabs.appendChild(b);return b;});
  runBtn.addEventListener('click',function(){results=wrRun(WR_DRAFTS[draft].fn);var f=results.findIndex(function(r){return !r.passed;});sel=f>=0?f:0;tab='tests';paint();});
  function caseChips(rs,onPick,dot){
    var row=el('div','wr-cases');row.setAttribute('role','group');row.setAttribute('aria-label','Test cases');
    WR_CASES.forEach(function(c,i){var r=rs?rs[i]:null,b=el('button','wr-case'+(r?(r.passed?' ok':' no'):'')+(i===sel?' on':''),(r&&!dot?(r.passed?'✓ ':'✗ '):'')+'Case '+(i+1)+(dot?'<span class="wr-n">'+r.logs.length+'</span>':''));
      b.type='button';b.setAttribute('aria-pressed',i===sel);b.addEventListener('click',function(){sel=i;paint();});row.appendChild(b);});
    return row;
  }
  function field(label,val,cls){return '<div class="wr-f"><span class="wr-fl">'+label+'</span><code class="'+(cls||'')+'">'+val+'</code></div>';}
  function paintPanel(){
    panel.hidden=!open;panel.innerHTML='';if(!open)return;
    var c=WR_CASES[sel],r=results?results[sel]:null;
    if(tab==='tests'){
      panel.appendChild(caseChips(results,true));
      var body=el('div','wr-body',(r?'<div class="wr-st '+(r.passed?'ok':'no')+'">'+(r.passed?'✓ Passed':'✗ Failed')+'</div>':'')+
        field('Input','nums = '+wrList(c.nums))+field('Expected',r?r.expected:wrBrute(c.nums),'ok')+(r?field('Your output',r.got,r.passed?'ok':'no'):'')+
        '<p class="wr-why">Why this case is here: '+c.why+'.</p>');
      panel.appendChild(body);
    }else if(tab==='console'){
      var withLogs=results?results.filter(function(x){return x.logs.length;}):[];
      if(!withLogs.length){panel.appendChild(el('div','wr-empty','<b>'+(results?'Nothing printed':'No output yet')+'</b><span>'+(results?'Your code ran without printing anything. Add a print() or console.log() to trace what it is doing.':'Run your code — anything you print() or console.log() lands here, grouped by case.')+'</span>'));return;}
      panel.appendChild(caseChips(results,true,true));
      var cur=results[sel];panel.appendChild(el('div','wr-body',cur.logs.length?'<pre class="wr-log">'+cur.logs.join('\n')+'</pre>':'<p class="wr-why">Case '+(sel+1)+' printed nothing.</p>'));
    }else{
      /* Insight: the lesson's target, the case as cells, the case with the last run, and what to watch for */
      panel.appendChild(caseChips(results,true));
      var cells=c.nums.map(function(v){return '<span class="wr-cell'+(v<0?' neg':'')+'">'+v+'</span>';}).join('');
      panel.appendChild(el('div','wr-body','<h4 class="wr-h">How fast it should be</h4><p>Aim for <code>O(n)</code> time and <code>O(1)</code> extra memory.</p>'+
        '<h4 class="wr-h">This test case</h4><div class="wr-cells" aria-label="nums">'+cells+'</div>'+
        '<h4 class="wr-h">'+(r?'This case and your last run':'This case')+'</h4><dl class="wr-vars"><dt>input</dt><dd>'+wrList(c.nums)+'</dd><dt>expected</dt><dd>'+(r?r.expected:wrBrute(c.nums))+'</dd>'+
        (r?'<dt>output</dt><dd>'+r.got+'</dd><dt>status</dt><dd class="'+(r.passed?'ok':'no')+'">'+(r.passed?'passed':'failed')+'</dd>':'')+'</dl>'+
        '<h4 class="wr-h">What to watch for</h4><ul class="wr-list"><li>Can every number be negative?</li><li>Is a single element a valid run?</li></ul>'));
    }
  }
  function paint(){
    draftBtns.forEach(function(b,i){b.setAttribute('aria-pressed',i===draft);});
    rail.innerHTML='';
    var status=results?wrVerdict(results):'Not run yet';
    rail.appendChild(el('span','wr-verdict'+(results?(wrCount(results)===results.length?' ok':' no'):''),status));
    tabBtns.forEach(function(b,i){var t=TABS[i];b.setAttribute('aria-pressed',open&&tab===t[0]);
      b.innerHTML=t[1]+(t[0]==='tests'?' <span class="wr-n">'+(results?wrCount(results)+'/'+results.length:WR_CASES.length)+'</span>':'');});
    hint.textContent=results?(open?'':'Click Tests to open the report'):WR_DRAFTS[draft].note;
    paintPanel();
    var f=results?results.filter(function(r){return !r.passed;})[0]:null;
    coach.hidden=!f;coach.innerHTML=f?'<span class="wr-cl">Coach</span><span>'+wrDiagnosis(f)+'</span>':'';
  }
  paint();
}

/* ---------- 2. two draft slots (a model of the editor's per-language drafts) ---------- */
var WR_STARTER={python:'def max_subarray(nums):\n    # Return the largest sum of any run of neighbouring numbers in nums.\n    pass\n',
  javascript:'function maxSubarray(nums) {\n  // Return the largest sum of any run of neighbouring numbers in nums.\n}\n'};
var WR_LANG={python:'Python',javascript:'JavaScript'};
function mountDrafts(w){
  var tabs=w.querySelector('.extabs'),ta=$('#wrEditor'),reset=$('#wrReset'),hint=$('#wrHint'),slots=$('#wrSlots');
  var lang='python',drafts={python:WR_STARTER.python,javascript:WR_STARTER.javascript},btns={};
  Object.keys(WR_LANG).forEach(function(l){var b=el('button','tab',WR_LANG[l]);b.type='button';b.addEventListener('click',function(){lang=l;paint();});tabs.appendChild(b);btns[l]=b;});
  ta.addEventListener('input',function(){drafts[lang]=ta.value;paintSlots();});
  reset.addEventListener('click',function(){drafts[lang]=WR_STARTER[lang];paint();});
  function state(l){return drafts[l]===WR_STARTER[l]?'starter code':'your draft, '+drafts[l].length+' characters';}
  function paintSlots(){slots.innerHTML=Object.keys(WR_LANG).map(function(l){return '<div class="wr-slot'+(l===lang?' on':'')+'"><dt>'+WR_LANG[l]+' slot'+(l===lang?' (shown)':'')+'</dt><dd>'+state(l)+'</dd></div>';}).join('');
    hint.textContent='saved as you type, per language';}
  function paint(){Object.keys(btns).forEach(function(l){btns[l].setAttribute('aria-pressed',l===lang);});ta.value=drafts[lang];paintSlots();}
  paint();
}

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountLesson();
  mountDrafts($('#drafts'));
  mountRunner($('#runner'));
})();

/* ================= systems layer: the test run hero ================= */
(function(){
  function heroRun(){
    var svg=$('#heroRun');if(!svg)return;
    var N=WR_CASES.length,bug=wrRun(WR_DRAFTS[0].fn),fix=wrRun(WR_DRAFTS[2].fn),bw=62,gap=12,x0=(560-(N*bw+(N-1)*gap))/2,y=140;
    var h='<text class="hd-lab" x="'+x0+'" y="84">a draft, run against each case on its own</text>';
    WR_CASES.forEach(function(c,i){var x=x0+i*(bw+gap);
      h+='<rect class="hr-case" id="hrC'+i+'" x="'+x+'" y="'+y+'" width="'+bw+'" height="74" rx="8"/><text class="hr-id" x="'+(x+bw/2)+'" y="'+(y+24)+'" text-anchor="middle">case '+(i+1)+'</text>'+
        '<text class="hr-mark" id="hrM'+i+'" x="'+(x+bw/2)+'" y="'+(y+58)+'" text-anchor="middle"></text>';});
    svg.innerHTML=h;
    var num=$('#heroNum'),unit=$('#heroUnit'),cap=$('#heroCap');
    function show(k){/* 0: waiting; 1..N: the buggy run reveals case k; N+1: the fix; N+2: the fixed run */
      var rs=k>N?fix:bug,upto=k>N?(k>N+1?N:0):k,fixing=k>N;
      WR_CASES.forEach(function(c,i){var r=rs[i],on=i<upto,m=$('#hrM'+i),box=$('#hrC'+i);
        box.setAttribute('class','hr-case'+(on?(r.passed?' ok':' no'):''));m.textContent=on?(r.passed?'✓':'✗'):'';});
      var p=0;for(var i=0;i<upto;i++)if(rs[i].passed)p++;
      num.textContent=p;unit.textContent='of '+N+' passed';
      cap.innerHTML=k===0?'Press Run: the function is called once per case':k<=N?'Case '+k+' of '+N+(bug[k-1].passed?' returned the expected value':' returned the wrong value'):k===N+1?'The draft is fixed: best now starts at <code>nums[0]</code>':'Run again: every case returns what was expected';
    }
    if(reduce||!M||!M.animate){show(N+2);return;}
    var last=-1,steps=N+3;
    M.animate(0,steps,{duration:steps*.9,ease:'linear',repeat:Infinity,onUpdate:function(v){var k=Math.min(steps-1,Math.floor(v));if(k!==last){last=k;show(k);}}});
  }
  heroRun();kinetic();riseIn();
})();
