function history(head: Commit | null): string[] {
  const out: string[] = [];
  for (let node = head; node !== null && node.parent !== null; node = node.parent) out.push(node.id); // stops one short
  return out;
}
