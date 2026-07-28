function longestWord(words) {
  const present = new Set(words);
  let best = "";
  for (const w of [...words].sort()) {
    let buildable = true;
    for (let i = 1; i < w.length; i++) {
      if (!present.has(w.slice(0, i))) {
        buildable = false;
        break;
      }
    }
    if (buildable && w.length > best.length) best = w;
  }
  return best;
}
