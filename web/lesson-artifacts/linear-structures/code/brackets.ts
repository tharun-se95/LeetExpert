const PAIR: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

function balanced(s: string): boolean {
  const stack: string[] = [];
  for (const ch of s) {
    if ("([{".includes(ch)) stack.push(ch); // an opener waits for its closer
    else if (ch in PAIR && stack.pop() !== PAIR[ch]) return false; // wrong closer, or none
  }
  return stack.length === 0; // every opener was closed
}
