import asyncio
from playwright.async_api import async_playwright
FONT='<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">'
BASE="""<html><head>"""+FONT+"""<style>
html,body{margin:0;width:1080px;height:1920px;background:transparent;font-family:'Space Grotesk',sans-serif;color:#16202e}
.cap{position:absolute;left:50%;transform:translateX(-50%);max-width:920px;width:max-content;background:#fff;border-radius:22px;padding:26px 38px;
 font:700 56px/1.2 'Space Mono',monospace;text-align:center;box-shadow:0 10px 40px rgba(10,20,40,.28);letter-spacing:-.01em}
.cap em{font-style:normal;color:#107d6e}
.card{position:absolute;inset:0;background:#f1f4f9;display:flex;flex-direction:column;justify-content:center;padding:0 90px}
.brand{font:700 44px 'Space Grotesk';display:flex;align-items:center;gap:14px}
.dot{width:26px;height:26px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#3fae5a,#15632b)}
h1{font:700 96px/1.12 'Space Mono',monospace;letter-spacing:-.03em;margin:60px 0 0}
h1 .t{color:#107d6e}
.stats{font:500 46px/1.4 'Space Grotesk';color:#4a5567;margin-top:44px}
.cta{margin-top:70px;display:inline-block;background:#107d6e;color:#fff;font:700 52px 'Space Grotesk';padding:30px 56px;border-radius:999px;align-self:flex-start}
.hook{font:700 52px/1.3 'Space Mono';color:#4a5567;margin-top:56px}
</style></head><body>"""
CAPS={
 "k_ai":("Your AI wrote this<br>in 3 seconds.",1280),
 "k_run":("Run it.",980),
 "k_pass":("4/4 tests pass.<br><em>Ship it?</em>",980),
 "k_notfast":("Not so fast.",1280),
 "k_loops":("Two loops:<br>every pair gets checked.",1280),
 "k_still":("Tests pass.<br>Still slow.",980),
 "k_bar":("leetExpert shows<br>you the bar.",700),
 "k_on":("Aim for <em>O(n)</em>.",700),
 "k_coach":("Ask the coach.",1330),
 "k_nudge":("It nudges.<br>You write the fix.",1330),
 "k_visual":("Every concept,<br>visualized.",1400),
}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1080,"height":1920})
        for k,(t,y) in CAPS.items():
            await pg.set_content(BASE+f'<div class="cap" style="top:{y}px">{t}</div></body></html>',wait_until="networkidle")
            await pg.screenshot(path=f"cards/{k}.png",omit_background=True)
        end=BASE+"""<div class="card"><div class="brand">leetExpert<span class="dot"></span></div>
        <h1>DSA for the<br>age of <span class="t">AI.</span></h1>
        <div class="stats">24 modules. 220 lessons.<br>116 problems, in your browser.</div>
        <div class="cta">Start free. Link in bio.</div></div></body></html>"""
        await pg.set_content(end,wait_until="networkidle"); await pg.screenshot(path="cards/end.png")
        cover=BASE+"""<div class="card"><div class="brand">leetExpert<span class="dot"></span></div>
        <h1>Agents write the <span class="t">code.</span><br>You decide if it's right.</h1>
        <div class="hook">Your AI wrote this in 3 seconds. Would you ship it?</div></div></body></html>"""
        await pg.set_content(cover,wait_until="networkidle"); await pg.screenshot(path="cards/cover.png")
        await b.close()
if __name__=="__main__": asyncio.run(main())
