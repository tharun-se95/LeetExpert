function joinBad(words) {
  let result = "";
  for (const w of words) {
    result += w;
  }
  return result;
}

function joinGood(words) {
  const parts = [];
  for (const w of words) {
    parts.push(w);
  }
  return parts.join("");
}

module.exports = { joinBad, joinGood };
