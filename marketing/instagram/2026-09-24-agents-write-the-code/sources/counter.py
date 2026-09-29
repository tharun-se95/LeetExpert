import asyncio
from playwright.async_api import async_playwright
HTML="""<html><head><link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet"><style>
body{margin:0;width:1080px;height:1920px;background:#141c2b;color:#e7ebf1;font-family:'Space Grotesk';display:flex;flex-direction:column;justify-content:center;padding:0 100px;box-sizing:border-box}
.lbl{font:500 44px 'Space Grotesk';color:#94a3b8;margin:0 0 10px}
.big{font:700 120px/1.05 'Space Mono';letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.n{color:#e7ebf1}.c{color:#fbbf24;font-size:92px}
.row{margin-bottom:90px}
.frm{font:400 40px 'Space Mono';color:#64748b;margin-top:-40px;margin-bottom:90px}
.run{font:700 52px 'Space Grotesk';color:#f87171;opacity:0;display:flex;gap:22px;align-items:center}
.sp{width:46px;height:46px;border:7px solid #f8717155;border-top-color:#f87171;border-radius:50%}
</style></head><body>
<div class="row"><div class="lbl">numbers</div><div class="big n" id="n">4</div></div>
<div class="row"><div class="lbl">pair checks</div><div class="big c" id="c">6</div></div>
<div class="frm">n × (n − 1) ÷ 2</div>
<div class="run" id="run"><div class="sp" id="sp"></div>still running…</div>
<script>
const fmt=x=>Math.round(x).toLocaleString('en-US');
window.setT=t=>{ // seconds from segment start
  const T1=1.56,T2=3.86,T3=4.5;
  let n=4,c=6;
  if(t>=T1){const p=Math.min(1,(t-T1)/0.5);n=4+(1e6-4)*(p<1?p*p:1);
    const q=Math.min(1,(t-T1)/(T2-T1));c=6+(499999500000-6)*Math.pow(q,3);}
  document.getElementById('n').textContent=fmt(n);
  document.getElementById('c').textContent=fmt(c);
  const r=document.getElementById('run');r.style.opacity=t>=T3?Math.min(1,(t-T3)/0.25):0;
  document.getElementById('sp').style.transform=`rotate(${t*360}deg)`;
}
</script></body></html>"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1080,"height":1920})
        await pg.set_content(HTML,wait_until="networkidle"); await pg.wait_for_timeout(500)
        N=int(6.48*30)+1
        for i in range(N):
            await pg.evaluate(f"setT({i/30})")
            await pg.screenshot(path=f"counter/{i:04d}.png",type="png")
        await b.close()
asyncio.run(main())
