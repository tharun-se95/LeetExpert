"""Recompute every number that appears on these slides, from the repo itself.

Run from the repo root:  python3 marketing/instagram/2026-09-12-what-is-leetexpert/sources/verify-counts.py
A figure printed on a public image must be reproducible, not remembered.
"""
import re, glob, sys, os

root = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..')
os.chdir(os.path.abspath(root))

src = open('web/src/lib/course/manifest.ts').read()
body = src[src.index('export const MODULES'):]

concepts = len(re.findall(r'\bconcept\(\s*"', body))
problems = len(re.findall(r'\bproblem\(\s*"', body))
practice = len(re.findall(r'practiceLesson\(\)', body))
stages   = [int(n) for n in re.findall(r'stage: (\d+)', src)]
modules  = len(stages)
files    = glob.glob('courses/dsa/*/*.md')
has      = lambda tag: sum(1 for f in files if f'```{tag}' in open(f).read())

per_stage = {s: stages.count(s) for s in sorted(set(stages))}

print(f'modules                : {modules}   (on disk: {len(glob.glob("courses/dsa/*/")) })')
print(f'modules per stage      : {per_stage}')
print(f'lesson .md files       : {len(files)}')
print(f'  concept entries      : {concepts}')
print(f'  problem entries      : {problems}')
print(f'  practice entries     : {practice}')
print(f'  sum                  : {concepts + problems + practice}')
print(f'sandbox blocks         : {has("sandbox")}')
print(f'viz tracer blocks      : {has("viz")}')
print(f'diagram blocks         : {has("diagram")}')

ok = True
def check(label, cond):
    global ok
    print(('  PASS  ' if cond else '  FAIL  ') + label)
    ok = ok and cond

print('\nclaims made on the slides:')
check('24 modules',                         modules == 24)
check('five stages',                        len(per_stage) == 5)
check('stage sizes 3/6/6/5/4',              [per_stage[s] for s in range(5)] == [3, 6, 6, 5, 4])
check('220 lessons',                        len(files) == 220)
check('83 concepts / 116 problems / 21 practice',
      (concepts, problems, practice) == (83, 116, 21))
check('every problem lesson has a sandbox', has('sandbox') == problems)
check('27 tracers, 61 diagrams',            (has('viz'), has('diagram')) == (27, 61))
sys.exit(0 if ok else 1)
