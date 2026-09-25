function history(head: Commit | null): string[] {
  // commit ids from HEAD back to the first commit
  const out: string[] = [];
  for (let node = head; node !== null; node = node.parent) out.push(node.id);
  return out;
}
