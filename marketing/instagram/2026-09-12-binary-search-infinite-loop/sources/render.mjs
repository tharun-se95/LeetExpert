import pw from '/Volumes/Seagate/auto-flow/node_modules/playwright/index.js';
const { chromium } = pw;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
await p.goto('file://' + process.cwd() + '/slides.html', { waitUntil: 'domcontentloaded' });
await p.evaluate(() => document.fonts.ready);
// Prove the real faces are active — a silent fallback to a system font is an
// invisible brand defect. Assert per FAMILY, not per weight: faces load lazily,
// so checking a weight the page happens not to use reports a false failure.
const fam = await p.evaluate(() => {
  const loaded = new Set();
  document.fonts.forEach((f) => { if (f.status === 'loaded') loaded.add(f.family.replace(/"/g, '')); });
  return [...loaded];
});
console.log('families loaded:', fam);
for (const required of ['Space Mono', 'Space Grotesk', 'JetBrains Mono']) {
  if (!fam.includes(required)) {
    throw new Error(`${required} did not load — refusing to render with a fallback.`);
  }
}
const slides = await p.$$('.slide');
console.log('slides found:', slides.length);
for (let i = 0; i < slides.length; i++) {
  await slides[i].screenshot({ path: `../${String(i + 1).padStart(2, '0')}.png` });
}
await b.close();
console.log('done');
