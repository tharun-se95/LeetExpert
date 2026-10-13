---
title: "Writing & Running Code"
kicker: "Writing & Running Code · Getting Started module · concept lesson"
headline: "How does a browser tab tell you which case your code broke?"
lede: "A cook-off station comes stocked: ingredients laid out, a pan on the stove, a panel of tasters waiting. A problem lesson's workspace is the same. You write a draft, press Run, and your function is called once for every test case. Each case is judged on its own, so you never get a bare \"wrong\": you get the call, what it returned and what it should have returned. This page runs a draft with a real bug through six cases so you can watch the reports arrive."
chips:
  - "runs **every case**"
  - "reports **got and expected**"
  - "keeps **one draft per language**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroRun" viewBox="0 0 560 300" role="img" aria-label="Animation: six test cases in a row. A draft runs against them and four turn to a tick while two turn to a cross, so the counter reads four of six. The draft is fixed and run again, and all six turn to a tick."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">passed</span></div><div id="heroCap"></div></div></div></div>
---

## Your own station {#problem}

```caption
A problem lesson opens a workspace: the reading on one side, an editor with starter code on the other.
```

```vig "Two panes side by side: a column of tabs and text on the left, an editor with a few lines of code and a run button on the right"
<rect class="st" x="12" y="14" width="100" height="84" rx="6"/><rect class="fa" x="20" y="22" width="20" height="8" rx="3"/><rect class="fa" x="44" y="22" width="20" height="8" rx="3"/><rect class="fa" x="68" y="22" width="20" height="8" rx="3"/><path class="st" d="M22 46H100M22 58H92M22 70H100M22 82H78"/><rect class="st" x="124" y="14" width="104" height="84" rx="6"/><path class="sc" d="M134 30H188M142 42H206M142 54H176"/><rect class="fk" x="190" y="80" width="30" height="12" rx="4"/>
```

When you open a problem, the page splits in two. On one side are the lesson's tabs: Description, Explanation, Solution and Quiz. On the other is a ==workspace==: an editor that already holds ==starter code==. Starter code is scaffolding, not a stub with the answer inside: it has the function's signature and one line saying what to return, and nothing that gives the algorithm away.

Nothing installs. There is no Python or Node setup and no repository to clone, because the editor and the thing that runs your code both live in the tab you already have open. Your code runs in a worker inside the browser, away from the page itself, which is also what lets the page stop a run that never ends.

This lesson is a concept lesson, so it has no editor of its own. The widgets below are small models of the real one: a draft with a bug, six cases, and the places the results land. They run in your browser, and the page labels each one as a model of the real behaviour.

## One draft per language {#inplace}

```caption
Two slots, one per language: switching changes which one the editor shows, and neither is touched.
```

```vig "Two stacked slots labelled by a short bar each, with an arrow between them swapping which one is lit"
<rect class="fk" x="40" y="14" width="120" height="36" rx="6"/><rect class="st" x="40" y="62" width="120" height="36" rx="6"/><path class="st" d="M190 32V80"/><path class="st" d="M185 38L190 32L195 38"/><path class="st" d="M185 74L190 80L195 74"/><path class="fa" d="M52 32H110"/><path class="sc" d="M52 80H100"/>
```

Lessons teach in Python and TypeScript, but the editor runs ==Python and JavaScript==. A browser can run JavaScript as it stands, while TypeScript's type annotations are a syntax error to it, and shipping a converter just to strip them would cost more than it teaches. The algorithm is the point, so the types stay in the lesson text and out of the editor.

Every problem has starter code in both languages, and the editor keeps your code **per language**, saving as you type into this browser's storage. Switch from Python to JavaScript and the Python draft is not discarded or submitted. It waits in its own slot. Switching does clear the results of the last run, because they described the other language's code. If you sign in, problem drafts sync to your account and follow you to another device; signed out, everything stays in this browser and goes nowhere.

```widget #drafts "Model: two draft slots"
<div class="extabs" role="group" aria-label="Choose a language"></div><textarea class="wr-editor" id="wrEditor" rows="7" spellcheck="false" aria-label="Draft editor" aria-describedby="wrSlots"></textarea><div class="actions"><button type="button" class="btn2" id="wrReset">Reset this language</button><span class="lv-hint" id="wrHint"></span></div><dl class="wr-slots" id="wrSlots"></dl>
```

**Reset** is the toolbar button beside Run. It puts the starter code back for the language you are on, deletes that language's saved draft and clears the results, and it does so at once, without asking. The other language's slot is untouched. Try it in the model: edit Python, reset JavaScript, and watch which slot changes.

## Running your code {#attempt}

```caption
Run calls your function once per case; the rail under the editor reports how many returned the expected value.
```

```vig "A row of six small squares, four ticked and two crossed, under an editor outline"
<rect class="st" x="14" y="12" width="212" height="52" rx="6"/><path class="sc" d="M26 28H120M26 42H96"/><rect class="fg" x="22" y="78" width="26" height="22" rx="4"/><rect class="fg" x="56" y="78" width="26" height="22" rx="4"/><rect class="fg" x="90" y="78" width="26" height="22" rx="4"/><rect class="fr" x="124" y="78" width="26" height="22" rx="4"/><rect class="fr" x="158" y="78" width="26" height="22" rx="4"/><rect class="fg" x="192" y="78" width="26" height="22" rx="4"/>
```

Press **Run** and the workspace calls your function with each test case's inputs and compares what comes back with the expected value. The cases are not just the example from the description. They include the edge cases the lesson's constraints name: an empty input, duplicates, a single element, the boundary of a range. Each case runs by itself, so one case that returns the wrong value, or throws, does not stop the others from running. A run that never finishes is stopped by a time limit, and says so.

The first Python run in a visit pauses while the browser downloads the Python runtime. The Run button reads "Starting Python…" and a line under the editor says the download happens once and is cached. JavaScript needs no download, because the browser already contains an engine for it.

Below the editor, a rail always shows the verdict, either "All … tests passed" or "X of Y tests passed", beside three tabs: **Insight**, **Tests** and **Console**. The panels are folded away until you click a tab, and clicking the open tab again folds it. After a run, Tests is the tab that is selected, and its label carries the count. The widget below is that rail, working on a made-up problem: return the largest sum of any run of neighbouring numbers in `nums`. The constraints say `nums` is never empty and may hold negative numbers, so one of the six cases is a list of only negatives.

```widget #runner "Model: Run a draft against six cases"
<div class="extabs" role="group" aria-label="Choose a draft"></div><div class="actions"><button type="button" class="btn2 best" id="wrRun">Run</button><span class="lv-hint" id="wrRunHint"></span></div><div class="wr-rail" id="wrRail" aria-live="polite"></div><div class="extabs wr-rtabs" id="wrTabs" role="group" aria-label="Result tabs"></div><div class="wr-panel" id="wrPanel"></div><div class="wr-coach" id="wrCoach" hidden></div>
```

The draft starts at the **buggy** version, which fails some cases. Press Run, read the verdict on the rail, then click Tests: it marks each case, and a failing case lists its input, what was expected and what the draft returned.

```key
A failing case is a concrete mismatch, and the cases that fail are evidence: the bug lives in whatever they share.
```

## Reading a failure {#trap}

```caption
Both failing cases are lists of only negative numbers, so the bug is about what the draft does when nothing is positive.
```

```vig "Two crossed cases pointing to a shared card drawn below them, and four ticked cases pushed to the side"
<rect class="fr" x="40" y="14" width="30" height="24" rx="4"/><rect class="fr" x="90" y="14" width="30" height="24" rx="4"/><path class="sc" d="M55 38L80 72M105 38L80 72"/><rect class="fk" x="52" y="72" width="56" height="26" rx="5"/><rect class="fg" x="158" y="14" width="22" height="18" rx="4"/><rect class="fg" x="186" y="14" width="22" height="18" rx="4"/><rect class="fg" x="158" y="38" width="22" height="18" rx="4"/><rect class="fg" x="186" y="38" width="22" height="18" rx="4"/>
```

The Tests tab shows one chip per case, ticked or crossed, and the case you select shows three things: its **Input**, the **Expected** value, and **Your output**. Expected values are not typed in by a person: the course computes them by running a reference solution, so a mismatch means your code differs from a verified answer.

With the buggy draft, two cases fail. One returns 0 where the answer is −1, and the other returns 0 where the answer is −5. What the two inputs have in common is that every number is negative. That points at the starting value of `best`, which the draft sets to 0. The empty run sums to 0, so 0 is always on the table, and when every real run sums to less than 0, the empty run wins.

````warn
Starting `best` at 0 lets an empty run beat every real one. When all the numbers are negative, the draft returns 0, a sum that no non-empty run has. In both languages it returns 0 for [−3, −1, −2] and for [−5], where the answers are −1 and −5.

```code mistake "The draft that starts from 0"
```
````

The fix is to start from a real element, since the answer is always the sum of at least one number:

```code solution "Starting from nums[0]"
```

Switch the widget to the fixed draft and run it again: every case passes, the rail reads "All … tests passed", and the problem counts as solved. That mark is kept in this browser, and syncs to your account if you are signed in.

## Console and Insight {#insight}

```caption
Console shows what your code printed, case by case; Insight shows what the case is, not what your code did.
```

```vig "A small terminal box with two printed lines beside a card with a gauge and a short list"
<rect class="st" x="14" y="16" width="100" height="78" rx="6"/><path class="sc" d="M24 36H70M24 52H88"/><rect class="fa" x="24" y="68" width="40" height="8" rx="3"/><rect class="st" x="130" y="16" width="98" height="78" rx="6"/><circle class="fa" cx="152" cy="40" r="10"/><path class="st" d="M174 36H214M174 46H204M144 66H214M144 78H196"/>
```

The **Console** tab holds whatever the draft printed: `print()` in Python, `console.log()` in JavaScript, grouped under the case that printed it. It is the quick taste in the middle of cooking: it lets you look at a value without changing the test cases. A case that printed nothing says so, and a run that printed nothing anywhere says that your code ran without printing and suggests adding a print.

Select the draft with a print in the widget above, run it and open Console. It adds one line to the buggy draft, printing `best` just before returning:

```code debug "The buggy draft with one print"
```

The all-negative case prints `best 0`. No run of those numbers sums to 0, so the printed value tells you the draft was wrong before it even returned. That is the whole workflow: a print turns a failing case into the value that went wrong.

The **Insight** tab is different in kind. It does not trace your code. It shows four things tied to the case you have selected: how fast the problem should run (the time and extra memory the lesson aims for), the case's input drawn as cells, the case's input, expected value and your last run's output and status, and a short list of things to watch for. It is a picture of the case, not a debugger, and it never contains solution code.

## When you are stuck {#solution}

```caption
The Coach reads the first failing case and points at the next hint; it never writes your function.
```

```vig "A speech bubble beside a small card holding a crossed case"
<rect class="st" x="20" y="14" width="120" height="52" rx="10"/><path class="st" d="M44 66L36 86L64 66"/><path class="sc" d="M36 32H118M36 46H96"/><rect class="fr" x="162" y="30" width="44" height="34" rx="6"/><path class="st" d="M176 40L192 54M192 40L176 54"/>
```

A **Coach** panel reads your failing results and offers a diagnosis before you spend a hint on something a closer look would have told you. In the model, a failing run adds a strip under the report; the real Coach names the first failing case, what it returned and what was expected, then points at the next authored hint to open on the Explanation tab. On a wide screen the floating panel opens by itself the first time a run fails, and its thread is kept in this browser.

You can also ask it a direct question. That chat depends on the service being configured and has a daily allowance, so it can be unavailable, while the diagnosis never needs it. Whatever you ask, the Coach is told never to implement the function, never to paste the algorithm and never to hand over a code fence. It supplements the hints; it does not replace trying the problem first, because it reacts to code you already wrote.

## Where next {#next}

```vig "Three sketches: a page with a sloped ramp, a path through five boxes, and a ticked editor"
<rect class="st" x="8" y="30" width="56" height="52" rx="5"/><path class="sc" d="M16 70L56 40"/><rect class="fa" x="88" y="52" width="14" height="14" rx="3"/><rect class="fa" x="108" y="52" width="14" height="14" rx="3"/><rect class="fa" x="128" y="52" width="14" height="14" rx="3"/><path class="st" d="M102 59H108M122 59H128"/><rect class="st" x="168" y="30" width="62" height="52" rx="5"/><path class="st" d="M184 58L196 70L216 44"/>
```

```variants
[
  {
    "title": "The Roadmap",
    "source": "next lesson",
    "text": "The course's modules form stages, ordered by what each leans on. A map of the order, and a check that an order respects it."
  },
  {
    "title": "Maximum Subarray (Kadane's Algorithm)",
    "source": "Prefix Sum module",
    "text": "The problem this page's model is borrowed from. The real lesson has its own cases, so its report will not match the six here."
  },
  {
    "title": "How Lessons & Problems Work",
    "source": "previous lesson",
    "text": "The order of the tabs around the editor and why the hints come after you have tried: the reading that sits beside this workspace."
  }
]
```

## Check yourself {#quiz}

```vig "Three questions as rows, the first one answered and ticked"
<circle class="fg" cx="36" cy="24" r="10"/><path class="st" d="M31 24L35 28L42 20"/><circle class="st" cx="36" cy="56" r="10"/><circle class="st" cx="36" cy="88" r="10"/><rect class="fa" x="58" y="19" width="150" height="10" rx="5"/><rect class="fa" x="58" y="51" width="118" height="10" rx="5"/><rect class="fa" x="58" y="83" width="138" height="10" rx="5"/>
```

```quiz
{
  "questions": [
    {
      "question": "You have been working in Python on a problem and switch the editor to JavaScript to compare approaches. What happens to your Python draft?",
      "options": [
        "It is converted to JavaScript by the editor, so both slots now hold the same logic and the Python text is gone.",
        "It stays in its own slot and is there when you switch back; only the last run's results are cleared.",
        "It is discarded, because the editor keeps one language's code at a time and loads the starter for the other."
      ],
      "answer": 1,
      "explanation": "Drafts are kept per language and saved as you type. Switching only changes which slot the editor shows; it clears the results of the last run, which described the other language's code, but nothing is converted, discarded or submitted."
    },
    {
      "question": "A draft passes {{passedBuggy}} of {{total}} cases. The {{failedBuggy}} that fail are {{failingInputs}}. What do those failures best support?",
      "options": [
        "Look at what they share: every number is negative, so check what the draft does when nothing is positive.",
        "The draft has a flaw hiding in the passing cases, and the failures are only the two places it happens to show.",
        "Six cases are too few to say anything, so run it again until a different set of cases fails and compare the two sets."
      ],
      "answer": 0,
      "explanation": "Each case is judged on its own, so a failure is direct evidence about that input. The two failures share one property, and the draft starts best at 0, which beats every real sum when all are negative. The passing cases each contain a positive number, so they never tested that path."
    },
    {
      "question": "The Console shows best 0 under the all-negative case. What does that tell you?",
      "options": [
        "The print changed the result: output is captured per case, so printing makes the draft return 0 for that case.",
        "The cases ran in the wrong order, and best carried a value over from the case that ran just before.",
        "best was already 0 when the loop ended, yet no run of those numbers sums to 0, so its starting value is wrong."
      ],
      "answer": 2,
      "explanation": "The print only reports; it does not change what the function returns. Each case calls the function fresh, with its own best and cur, so nothing leaks between cases. The value itself is the clue: a largest sum of 0 is impossible for a list of only negatives, which points at best's starting value."
    }
  ]
}
```
