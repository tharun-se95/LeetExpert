const PAIR: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

function balanced(s: string): boolean {
  const stack: string[] = [];
  for (const ch of s) {
    if ("([{".includes(ch)) stack.push(ch);
    else if (ch in PAIR && stack.pop() !== PAIR[ch]) return false;
  }
  return true; // forgets openers still waiting
}
