/* ================= Product of Array Except Self: the lesson =================
   Every array on the page is real data, and every number the prose quotes is computed below by
   running the code it describes. The PURE block has no DOM: check.py runs it in node, recomputes its
   facts in Python and compares the code files in both runtimes against it. */

/* PURE:begin (no DOM below this line until PURE:end) */
/* -0 is a real value in JavaScript, and String(-0) hides it */
function ppNum(x){return Object.is(x,-0)?'-0':String(x);}
function ppShow(a){return '['+a.map(ppNum).join(',')+']';}
function ppSpaced(a){return '['+a.map(ppNum).join(', ')+']';}
function ppProd(a){var p=1;a.forEach(function(x){p*=x;});return p;}

/* the page's code, as running code: each mirrors a file in code/ */
function ppSolution(nums){ /* solution.* */
  var n=nums.length,a=[],mults=0,i;
  for(i=0;i<n;i++)a.push(1);
  for(i=1;i<n;i++){a[i]=a[i-1]*nums[i-1];mults++;}
  var right=1;
  for(i=n-1;i>=0;i--){a[i]*=right;mults++;right*=nums[i];mults++;}
  return {answer:a,mults:mults};
}
function ppNaive(nums){ /* naive.* */
  var out=[],mults=0;
  for(var i=0;i<nums.length;i++){var p=1;for(var j=0;j<nums.length;j++)if(j!==i){p*=nums[j];mults++;}out.push(p);}
  return {answer:out,mults:mults};
}
function ppTwoArrays(nums){ /* alt_two_arrays.* */
  var n=nums.length,l=[],r=[],i;
  for(i=0;i<n;i++){l.push(1);r.push(1);}
  for(i=1;i<n;i++)l[i]=l[i-1]*nums[i-1];
  for(i=n-2;i>=0;i--)r[i]=r[i+1]*nums[i+1];
  return nums.map(function(_,k){return l[k]*r[k];});
}
function ppDivision(nums){ /* mistake_division.*, JavaScript's division */
  var t=ppProd(nums);return nums.map(function(x){return t/x;});
}
function ppSwapOrder(nums){ /* mistake_swap_order.* */
  var n=nums.length,a=[],i;for(i=0;i<n;i++)a.push(1);
  for(i=1;i<n;i++)a[i]=a[i-1]*nums[i-1];
  var right=1;for(i=n-1;i>=0;i--){right*=nums[i];a[i]*=right;}
  return a;
}
/* the same sweeps in BigInt: exact however large the products grow */
function ppBigSolution(nums){
  var n=nums.length,a=[],i;for(i=0;i<n;i++)a.push(BigInt(1));
  for(i=1;i<n;i++)a[i]=a[i-1]*BigInt(nums[i-1]);
  var right=BigInt(1);for(i=n-1;i>=0;i--){a[i]*=right;right*=BigInt(nums[i]);}
  return a;
}
/* what Python prints for the zero example: its ints have no negative zero (check.py runs solution.py to confirm) */
var PP_PY_PRINT='[0, 0, 9, 0, 0]';

/* the arrays the prose names */
var PP_A=[1,2,3,4],PP_Z=[-1,1,0,-3,3],PP_ZZ=[3,0,0,2],PP_S=[-1,2,-3],PP_P=[2,3,4],PP_ONE=[1,0,3,4];
var PP_BIG=[12345678,87654321,11111111,99999999];
var PP_LIMIT=100000,PP_BUDGET=100000000;

function ppRnd(seed){return function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
function ppHistory(n,seed,top){var r=ppRnd(seed),a=[];for(var i=0;i<n;i++)a.push(1+Math.floor(r()*top));return a;}

/* every implementation against the definition (multiply every other element), on examples and random arrays */
function ppSelfCheck(){
  var rnd=ppRnd(20261020),runs=0,lists=[PP_A,PP_Z,PP_ZZ,PP_S,PP_P,PP_ONE,[2,3],[1,1,1,1],[0,0],[5,0],[0,5,0],[-2,-2]];
  for(var t=0;t<300;t++){var n=2+Math.floor(rnd()*8),a=[];for(var k=0;k<n;k++)a.push(Math.floor(rnd()*7)-3);lists.push(a);}
  lists.forEach(function(a){
    var want=ppSpaced(ppNaive(a).answer);
    if(ppSpaced(ppSolution(a).answer)!==want||ppSpaced(ppTwoArrays(a))!==want)throw new Error('product implementations disagree on '+ppShow(a));
    var swapped=ppSwapOrder(a),total=ppProd(a);
    if(swapped.some(function(x){return x!==total;}))throw new Error('the swapped-order mistake is not the total everywhere on '+ppShow(a));
    runs++;
  });
  [[PP_A,'[24, 12, 8, 6]'],[PP_Z,'[-0, 0, 9, -0, 0]'],[[2,3],'[3, 2]'],[[1,1,1,1],'[1, 1, 1, 1]']].forEach(function(c){
    if(ppSpaced(ppSolution(c[0]).answer)!==c[1])throw new Error('lesson example failed: '+ppShow(c[0]));});
  return runs;
}
function ppNegZeros(a){return a.filter(function(x){return Object.is(x,-0);}).length;}

/* every number lesson.md quotes as {{name}}, computed here and nowhere else */
function ppFacts(fmt){
  var agree=ppSelfCheck();
  var s4=ppSolution(PP_A),n4=ppNaive(PP_A),ones=[];
  for(var q=0;q<PP_LIMIT;q++)ones.push(1);
  var big=ppSolution(ones);
  /* the closed forms the prose uses, held to the counts */
  [2,3,4,7,12].forEach(function(n){var h=ppHistory(n,n,9);
    if(ppNaive(h).mults!==n*(n-1)||ppSolution(h).mults!==3*n-1)throw new Error('multiplication count formulas fail at n='+n);});
  var naiveLimit=PP_LIMIT*(PP_LIMIT-1);
  var zJs=ppSolution(PP_Z).answer,bigJs=ppSolution(PP_BIG).answer,bigExact=ppBigSolution(PP_BIG).map(String);
  var differs=bigJs.filter(function(x,i){return BigInt(x)!==BigInt(bigExact[i]);}).length;
  var sum=PP_A.reduce(function(x,y){return x+y;},0),total=ppProd(PP_A);
  return {
    agree:agree,mults4:s4.mults,naive4:n4.mults,limitN:fmt(PP_LIMIT),limitMults:fmt(big.mults),
    limitNaive:fmt(naiveLimit),halfPairs:fmt(naiveLimit/2),naiveSecs:Math.round(naiveLimit/PP_BUDGET),
    swapAnswers:ppSpaced(ppSwapOrder(PP_A)),swapTotal:total,
    zeroJs:ppSpaced(zJs),zeroPy:PP_PY_PRINT,negZeros:ppNegZeros(zJs),
    divZero:ppSpaced(ppDivision(PP_Z)),
    safeInt:fmt(Number.MAX_SAFE_INTEGER),bigDiffers:differs,bigCount:PP_BIG.length,
    sumExcept:ppSpaced(PP_A.map(function(x){return sum-x;})),
    divOk:ppSpaced(PP_A.map(function(x){return total/x;}))
  };
}
/* PURE:end */

/* ---------- 1. by hand: bypass one stage ---------- */
var PP_PICK=[{name:'1, 2, 3, 4',p:PP_A},{name:'-1, 1, 0, -3, 3 (one zero)',p:PP_Z}];
function ppTerms(list){return list.length?list.map(ppNum).join(' × ')+' = <b>'+ppNum(ppProd(list))+'</b>':'<b>1</b> (nothing there: the empty product)';}
function mountPick(host){
  var tabs=host.querySelector('.extabs'),box=host.querySelector('.pp-stages'),out=host.querySelector('.readout'),cur=0,sel=null,all=false,btns=[];
  function paint(){
    var p=PP_PICK[cur].p,want=ppNaive(p).answer;
    btns.forEach(function(b,i){
      b.classList.toggle('byp',i===sel);b.classList.toggle('up',sel!==null&&i<sel);b.classList.toggle('down',sel!==null&&i>sel);
      b.setAttribute('aria-pressed',i===sel);
      b.tag.textContent=sel===null?' ':(i===sel?'bypass':(i<sel?'upstream':'downstream'));
      b.ans.textContent=all?ppNum(want[i]):' ';
    });
    if(all){out.innerHTML='Every answer, each one the product of all the other stages: <b>'+ppSpaced(want)+'</b>. Check one against the definition: bypass a stage and multiply the rest.';return;}
    if(sel===null){out.innerHTML='Press a stage to bypass it. Its answer is the gain of everything else.';return;}
    var up=p.slice(0,sel),down=p.slice(sel+1);
    out.innerHTML='Bypass stage '+sel+' (gain '+ppNum(p[sel])+'). Upstream: '+ppTerms(up)+'. Downstream: '+ppTerms(down)+'. All the others: '+ppNum(ppProd(up))+' × '+ppNum(ppProd(down))+' = <b>'+ppNum(want[sel])+'</b>.';
  }
  function load(k){
    cur=k;sel=null;all=false;tabs.querySelectorAll('button').forEach(function(b,j){b.setAttribute('aria-pressed',j===k);});
    box.innerHTML='';btns=[];
    PP_PICK[k].p.forEach(function(v,i){
      var b=el('button','pp-st'),cell=el('span','cell',ppNum(v)),tag=el('span','tag','&nbsp;'),ans=el('span','ans','&nbsp;');
      b.type='button';b.setAttribute('aria-label','Stage '+i+', gain '+ppNum(v));
      b.appendChild(el('span','dn','stage '+i));b.appendChild(cell);b.appendChild(tag);b.appendChild(ans);b.tag=tag;b.ans=ans;
      b.addEventListener('click',function(){sel=i;all=false;paint();});box.appendChild(b);btns.push(b);
    });
    paint();
  }
  PP_PICK.forEach(function(s,k){var b=el('button','tab',s.name);b.type='button';b.addEventListener('click',function(){load(k);});tabs.appendChild(b);});
  host.querySelector('.reset').addEventListener('click',function(){sel=null;all=false;paint();});
  host.querySelector('.best').addEventListener('click',function(){all=true;sel=null;paint();});
  load(0);
}

/* ---------- 2. predict the answer array ---------- */
function ppAnswerText(a){return ppSpaced(a.map(function(x){return x+0;}));}
var PP_PREDICT=[PP_P,PP_ONE,PP_S].map(function(p){
  var want=ppNaive(p).answer,total=ppProd(p),left=[],right=[];
  p.forEach(function(_,i){left.push(ppProd(p.slice(0,i)));right.push(ppProd(p.slice(i+1)));});
  var absAll=want.map(Math.abs);
  var opts=[ppAnswerText(want),ppAnswerText(p.map(function(){return total;})),ppAnswerText(left),ppAnswerText(right),ppAnswerText(absAll)];
  opts=opts.filter(function(v,i){return opts.indexOf(v)===i;}).sort();
  return {p:p,expect:ppAnswerText(want),want:want,total:total,left:left,right:right,choices:opts};
});
function mountGuess(host){
  mountPredict(host,PP_PREDICT,{
    question:function(c){return 'Gains <code>'+ppSpaced(c.p)+'</code>. What is the array of "the product of every other element"?';},
    choices:function(c){return c.choices;},
    draw:function(view,c){
      var row=el('div','pp-chips',c.p.map(function(v){return '<span class="chip">'+ppNum(v)+'</span>';}).join(''));view.appendChild(row);
      return {reveal:function(){row.appendChild(el('span','chip ans','→ '+c.expect));}};
    },
    why:function(c){
      var out=['Each answer is the product of everything except that position, so '+c.expect+'.'];
      var i=c.p.findIndex(function(x){return x===0;});
      if(i>=0)out.push('The zero at position '+i+' is in every other position\'s product, so those answers are 0; only position '+i+' leaves it out.');
      if(c.p.some(function(x){return x<0;})&&c.want.some(function(x){return x<0;}))out.push('Signs carry through: each answer takes the sign of the product of the others, which is why they are not all positive.');
      out.push('Repeating the whole product ('+c.total+') at every position forgets to leave the element out.');
      return out.join(' ');
    }
  });
}

/* ---------- 3. the two traps ---------- */
var PP_TABLE=[PP_A,PP_Z,PP_ZZ,[2,0,5]];
function mountDivisionTable(host){
  var bad=0;
  PP_TABLE.forEach(function(p){
    var d=ppDivision(p),w=ppNaive(p).answer,ok=d.every(function(x,i){return x===w[i];});if(!ok)bad++;
    host.appendChild(el('div','','<span>nums '+ppShow(p)+'</span><em>total ÷ each → '+ppSpaced(d)+' · answer → '+ppSpaced(w)+(ok?' <b style="color:var(--g-ink)">agree</b>':' <b style="color:var(--r-ink)">wrong</b>')+'</em>'));
  });
  /* the prose: right with no zero, broken with one or more (NaN where a zero divides the zero total) */
  if(bad!==PP_TABLE.length-1||ppDivision(PP_A).some(function(x,i){return x!==ppNaive(PP_A).answer[i];}))throw new Error('the division table no longer shows "right only without a zero"');
  if(!ppDivision(PP_Z).some(Number.isNaN))throw new Error('the zero example no longer divides 0 by 0');
  $('#divNote').innerHTML='Without a zero it is exact, and that is what makes it tempting. With one, the total is 0, so every position that is <em>not</em> the zero gets 0 ÷ x = 0, which happens to be right, and the zero\'s own position gets 0 ÷ 0: here <b>NaN</b> instead of '+ppNaive(PP_Z).answer[PP_Z.indexOf(0)]+'. Python\'s <code>//</code> raises <code>ZeroDivisionError</code> at that same position instead of returning anything.';
}
function mountCost(){
  var pts=[];
  for(var n=0;n<=48;n+=6){
    /* gains of 1 or 2, so every product stays below 2^53 and the two orders of multiplying agree exactly */
    var h=n?ppHistory(n,n+5,2):[],a=ppNaive(h),b=ppSolution(h);
    if(n&&(ppSpaced(a.answer)!==ppSpaced(b.answer)||a.mults!==n*(n-1)||b.mults!==3*n-1))throw new Error('cost check failed at n='+n);
    pts.push([n,a.mults,b.mults]);
  }
  var last=pts[pts.length-1];
  costChart($('#cost'),{names:['multiply the others, per position','two sweeps'],ylabel:'multiplications made',pts:pts,xlabel:'elements',xticks:[0,12,24,36,48],
    aria:'Multiplications made by the brute force against the two sweeps: at '+last[0]+' elements the brute force makes '+fmt(last[1])+' and the sweeps make '+last[2]+'.'});
  $('#costNote').innerHTML='Counted by running both: at <b>'+last[0]+'</b> elements the brute force makes <b>'+fmt(last[1])+'</b> multiplications and the sweeps make <b>'+last[2]+'</b>. At the constraint\'s '+fmt(PP_LIMIT)+' elements that is <b>'+fmt(PP_LIMIT*(PP_LIMIT-1))+'</b> against <b>'+fmt(3*PP_LIMIT-1)+'</b>: about '+Math.round(PP_LIMIT*(PP_LIMIT-1)/PP_BUDGET)+' seconds at 10⁸ a second, against a few thousandths.';
}

/* ---------- 4/5. the sweeps on lanes ---------- */
function ppLane(s,id){return s.lanes.filter(function(l){return l.id===id;})[0];}
function ppVals(l){return l.items.map(function(x){return x?+x.v:null;});}
function ppField(s,name){var f=s.fields.filter(function(x){return x[0]===name;})[0];return f?f[1]:null;}

/* the helper-arrays version: left, right, then combine */
function ppSteps2(nums){
  var n=nums.length,pass='start',at='–';
  /* the size is in each label so tabs of different lengths keep their own lane sizes (kit/lanes.js laneDimKey) */
  var M=new Lanes([{id:'n',kind:'row',label:'gain of each of '+n+' stages',idx:true},
    {id:'l',kind:'row',label:'left ('+n+'): product of the stages before',cap:n},
    {id:'r',kind:'row',label:'right ('+n+'): product of the stages after',cap:n},
    {id:'a',kind:'row',label:'answer ('+n+'): left × right',cap:n}],
    {fields:function(){return [['sweep',pass],['i',at]];}});
  var N=[];nums.forEach(function(x){N.push(M.push('n',x));});
  var steps=[],left=[],right=[];
  function rec(note,o){steps.push(M.snap(note,o));}
  rec('Four rows for '+n+' stages: the gains, then <code>left</code>, <code>right</code> and <code>answer</code>, which start empty. Each answer will be <code>left[i] × right[i]</code>.',{done:true});
  pass='left sweep';
  for(var i=0;i<n;i++){
    at=i;left[i]=i===0?1:left[i-1]*nums[i-1];M.mark('n','i',i);
    M.put('l',i,left[i]);var it=M.lane('l').items[i];
    rec(i===0?'<code>left[0] = 1</code>: nothing is upstream of stage 0, and the product of nothing is 1.':
      '<code>left['+i+'] = left['+(i-1)+'] × nums['+(i-1)+']</code> = '+ppNum(left[i-1])+' × '+ppNum(nums[i-1])+' = <b>'+ppNum(left[i])+'</b>. Each entry extends the one before it by one multiplication.',{hi:['i',laneHi(it)],done:true});
  }
  pass='right sweep';
  for(var j=n-1;j>=0;j--){
    at=j;right[j]=j===n-1?1:right[j+1]*nums[j+1];M.mark('n','i',j);
    M.put('r',j,right[j]);var ir=M.lane('r').items[j];
    rec(j===n-1?'<code>right['+j+'] = 1</code>: nothing is downstream of the last stage.':
      '<code>right['+j+'] = right['+(j+1)+'] × nums['+(j+1)+']</code> = '+ppNum(right[j+1])+' × '+ppNum(nums[j+1])+' = <b>'+ppNum(right[j])+'</b>. The same idea, built from the other end.',{hi:['i',laneHi(ir)],done:true});
  }
  pass='combine';
  for(var k=0;k<n;k++){
    at=k;M.mark('n','i',k);var v=left[k]*right[k];M.put('a',k,v);var ia=M.lane('a').items[k];M.tone(ia,'good');
    rec('<code>answer['+k+'] = left['+k+'] × right['+k+']</code> = '+ppNum(left[k])+' × '+ppNum(right[k])+' = <b>'+ppNum(v)+'</b>: everything upstream times everything downstream, which is everything except stage '+k+'.',{hi:['i',laneHi(ia)],done:true});
  }
  M.mark('n','i',null);at='–';pass='done';
  var want=ppNaive(nums).answer;
  rec('Every answer is filled: '+ppSpaced(want)+'. '+(nums.indexOf(0)>=0?'A zero needed no special case: it is a factor in every answer but its own.':'No stage is ever multiplied into its own answer.'),{done:true});
  if(ppSpaced(want)!==ppSpaced(ppTwoArrays(nums)))throw new Error('helper-array walkthrough of '+ppShow(nums)+' disagrees');
  return steps;
}
/* each filled cell against the definition, read from the snapshot alone */
var PP_INV2=[
  ['left','every filled left entry is the product of the stages before it',function(s){var nums=ppVals(ppLane(s,'n')),l=ppVals(ppLane(s,'l'));return l.every(function(v,j){return v===null||v===ppProd(nums.slice(0,j));});}],
  ['right','every filled right entry is the product of the stages after it',function(s){var nums=ppVals(ppLane(s,'n')),r=ppVals(ppLane(s,'r'));return r.every(function(v,j){return v===null||v===ppProd(nums.slice(j+1));});}],
  ['answer','every filled answer is the product of every other stage',function(s){var nums=ppVals(ppLane(s,'n')),a=ppVals(ppLane(s,'a'));return a.every(function(v,j){return v===null||v===ppProd(nums.slice(0,j).concat(nums.slice(j+1)));});}]
];

/* the one-array version: the answer holds the lefts, then a scalar carries the rights */
function ppSteps1(nums){
  var n=nums.length,pass='start',at='–',right='–';
  var M=new Lanes([{id:'n',kind:'row',label:'gain of each of '+n+' stages',idx:true},{id:'a',kind:'row',label:'answer ('+n+' entries)',cap:n}],
    {fields:function(){return [['sweep',pass],['i',at],['right',right]];}});
  var N=[];nums.forEach(function(x){N.push(M.push('n',x));});
  var steps=[],ans=[];
  function rec(note,o){steps.push(M.snap(note,o));}
  for(var q=0;q<n;q++){ans.push(1);M.put('a',q,1);}
  rec('<code>answer = [1] * n</code>: the output array starts as all ones. It will hold the left products first, then each right product is folded into it.',{done:true});
  pass='forward';
  for(var i=1;i<n;i++){
    at=i;M.mark('n','i',i);ans[i]=ans[i-1]*nums[i-1];var it=M.lane('a').items[i];M.set(it,ans[i]);
    rec('<code>answer['+i+'] = answer['+(i-1)+'] × nums['+(i-1)+']</code> = '+ppNum(ans[i-1])+' × '+ppNum(nums[i-1])+' = <b>'+ppNum(ans[i])+'</b>: the product of everything left of stage '+i+'.',{hi:['i',laneHi(it)],done:true});
  }
  pass='backward';right=1;at='–';
  rec('The forward sweep is done: each <code>answer[i]</code> holds the product of everything to its left. Now <code>right = 1</code>, the product of the nothing to the right of the last stage.',{hi:['right'],done:true});
  for(var j=n-1;j>=0;j--){
    at=j;M.mark('n','i',j);var before=ans[j];ans[j]=ans[j]*right;var ij=M.lane('a').items[j];M.set(ij,ans[j]);M.tone(ij,'good');
    rec('<code>answer['+j+'] *= right</code>: '+ppNum(before)+' × '+ppNum(right)+' = <b>'+ppNum(ans[j])+'</b>. Left times right is everything except stage '+j+'.',{hi:['i','right',laneHi(ij)],done:false});
    right=right*nums[j];
    rec('<code>right *= nums['+j+']</code> → <b>'+ppNum(right)+'</b>. Only now does stage '+j+' join the right side, '+(j>0?'ready for stage '+(j-1)+'.':'and with no stage left, this value is the whole product, which nothing reads.'),{hi:['right'],done:true});
  }
  M.mark('n','i',null);at='–';pass='done';
  var want=ppNaive(nums).answer;
  if(ppSpaced(ans)!==ppSpaced(want))throw new Error('one-array walkthrough of '+ppShow(nums)+' returned '+ppSpaced(ans));
  rec('Both sweeps are done and <code>answer</code> is '+ppSpaced(want)+'. The array that held the left products now holds the result, and the only extra storage was the one number <code>right</code>.',{done:true});
  return steps;
}
/* checked at rest: forward, entries up to i hold the left products and the rest are still 1; backward,
   entries from i on are finished and the ones before it still hold the left products */
function ppState1(s){return {nums:ppVals(ppLane(s,'n')),a:ppVals(ppLane(s,'a')),pass:ppField(s,'sweep'),i:ppField(s,'i'),right:ppField(s,'right')};}
function ppOthers(nums,j){return ppProd(nums.slice(0,j).concat(nums.slice(j+1)));}
var PP_INV1=[
  ['left','entries not yet finished hold the product of the stages before them (or still 1, ahead of the forward sweep)',function(s){
    var t=ppState1(s);if(t.pass==='done')return true;
    return t.a.every(function(v,j){
      var left=ppProd(t.nums.slice(0,j));
      if(t.pass==='start')return v===1;
      if(t.pass==='forward')return j<=t.i?v===left:v===1;
      return typeof t.i==='number'&&j>=t.i?true:v===left;});
  }],
  ['right','right is the product of the stages after the one being finished',function(s){
    var t=ppState1(s);if(t.pass!=='backward')return true;
    return +t.right===(typeof t.i==='number'?ppProd(t.nums.slice(t.i)):1);
  }],
  ['answer','finished entries are the product of every other stage',function(s){
    var t=ppState1(s);
    if(t.pass==='done')return t.a.every(function(v,j){return v===ppOthers(t.nums,j);});
    if(t.pass!=='backward'||typeof t.i!=='number')return true;
    return t.a.every(function(v,j){return j<t.i||v===ppOthers(t.nums,j);});
  }]
];
var PP_WALK=[{name:'1, 2, 3, 4',p:PP_A},{name:'-1, 1, 0, -3, 3 (one zero)',p:PP_Z},{name:'3, 0, 0, 2 (two zeros)',p:PP_ZZ}];

/* ---------- 6. where the two languages differ ---------- */
function mountLanguages(host){
  var js=ppSolution(PP_Z).answer;
  host.appendChild(el('div','','<span>nums '+ppShow(PP_Z)+'</span><em>Python prints → '+PP_PY_PRINT+' · JavaScript holds → '+ppSpaced(js)+'</em>'));
  host.appendChild(el('div','','<span>compare with <code>===</code> and JSON</span><em>every entry equal: <b>'+js.every(function(x,i){return x===[0,0,9,0,0][i];})+'</b> · <code>JSON.stringify</code> → '+JSON.stringify(js)+'</em>'));
  host.appendChild(el('div','','<span>compare with <code>Object.is</code></span><em>entries that differ from a plain 0: <b>'+ppNegZeros(js)+'</b> of '+js.length+' · <code>x + 0</code> clears them → '+ppSpaced(js.map(function(x){return x+0;}))+'</em>'));
  var bigJs=ppSolution(PP_BIG).answer,exact=ppBigSolution(PP_BIG).map(String);
  host.appendChild(el('div','','<span>nums '+ppShow(PP_BIG)+', past 2<sup>53</sup></span><em>Number → '+bigJs.map(String).join(', ')+'</em>'));
  host.appendChild(el('div','','<span>the same sweeps in BigInt, and Python\'s ints</span><em>exact → '+exact.join(', ')+'</em>'));
}

/* ---------- the numbers lesson.md quotes as {{name}} ---------- */
var FACTS=ppFacts(fmt);

/* ---------- assemble ---------- */
(function(){
  readPal();
  mountPick($('#pick'));
  mountGuess($('#predict'));
  mountLesson();
  mountDivisionTable($('#div-table'));
  mountCost();
  mountLaneTabs($('#helpers'),PP_WALK.map(function(w){return {name:w.name,steps:function(){return ppSteps2(w.p);}};}),{id:'helpers',inv:PP_INV2});
  mountLaneTabs($('#stepper'),PP_WALK.map(function(w){return {name:w.name,steps:function(){return ppSteps1(w.p);}};}),{id:'sweeps',inv:PP_INV1});
  mountLanguages($('#lang-table'));
})();

/* ================= systems layer: the pipeline hero ================= */
(function(){
  var box=$('#heroPipe');if(!box)return;
  var P=PP_A,n=P.length;
  /* the answer array after each write of solution.*, so the picture is the code's own trace */
  var ev=[],a=P.map(function(){return 1;}),i,right;
  ev.push({a:a.slice(),i:0,v:1,phase:'left',expr:'answer starts as all ones: nothing is upstream of stage 0',fin:-1});
  for(i=1;i<n;i++){a[i]=a[i-1]*P[i-1];ev.push({a:a.slice(),i:i,v:a[i],phase:'left',expr:'upstream of stage '+i+': '+ev[ev.length-1].a[i-1]+' × '+P[i-1]+' = '+a[i],fin:-1});}
  right=1;
  for(i=n-1;i>=0;i--){var was=a[i];a[i]*=right;ev.push({a:a.slice(),i:i,v:a[i],phase:'right',expr:'answer['+i+'] = '+was+' × '+right+' = '+a[i]+(i===n-1?', nothing downstream':', downstream is '+right),fin:i});right*=P[i];}
  var want=ppNaive(P).answer;if(ppSpaced(ev[ev.length-1].a)!==ppSpaced(want))throw new Error('hero trace disagrees');
  var top=el('div','ph-row'),bot=el('div','ph-row'),lt=el('span','ph-lab','stage gain'),lb=el('span','ph-lab','all the others');
  var cells=[];
  P.forEach(function(p,k){var t=el('span','ph-cell',String(p)),b=el('span','ph-cell out','1');top.appendChild(t);bot.appendChild(b);cells.push({t:t,b:b});});
  box.appendChild(lt);box.appendChild(top);box.appendChild(lb);box.appendChild(bot);
  var num=$('#heroNum'),unit=$('#heroUnit'),cap=$('#heroCap');
  function unitOf(e){return 'written to answer['+e.i+']';}
  function reserve(){reserveHeight(cap,ev.map(function(e){return e.expr;}));}
  reserve();if('ResizeObserver' in window)new ResizeObserver(reserve).observe(cap.parentNode);
  function draw(k){
    var e=ev[k];
    cells.forEach(function(c,j){
      c.b.textContent=String(e.a[j]);
      c.b.classList.toggle('fin',e.phase==='right'&&j>=e.fin);c.b.classList.toggle('cur',e.i===j);c.t.classList.toggle('cur',e.phase==='right'&&e.i===j);
    });
    num.textContent=String(e.v);unit.textContent=unitOf(e);cap.innerHTML=e.expr;
  }
  draw(ev.length-1);
  if(M&&M.animate&&!reduce){
    var last=-1,total=ev.length+2;
    M.animate(0,total,{duration:total*.9,ease:'linear',repeat:Infinity,onUpdate:function(v){var k=Math.min(ev.length-1,Math.floor(v));if(k!==last){last=k;draw(k);}}});
  }
  kinetic();riseIn();
})();
