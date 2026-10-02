import asyncio
from playwright.async_api import async_playwright
from rec import *
from t_editor import CODE
async def main():
    async with async_playwright() as p:
        b,pg=await new_page(p)
        await pg.goto("https://www.leetexpert.com/courses/dsa/problems/two-sum",wait_until="networkidle")
        await dismiss(pg)
        await pg.get_by_text("Code",exact=True).first.click(); await pg.wait_for_timeout(800)
        ed=pg.locator(".cm-content").first
        await ed.click(); await pg.keyboard.press("Control+A"); await pg.keyboard.press("Delete")
        await pg.mouse.click(5,5)  # blur so no tooltip
        await pg.wait_for_timeout(500)
        # C1: AI types fast
        r=Recorder(pg,"c1_ai_types"); await r.start()
        await pg.wait_for_timeout(300)
        await ed.click()
        for i in range(0,len(CODE),5):
            await pg.keyboard.insert_text(CODE[i:i+5]); await pg.wait_for_timeout(18)
        await pg.wait_for_timeout(1200)
        await r.stop(hold=1.0)
        # C2: run and fail
        r=Recorder(pg,"c2_run"); await r.start()
        await pg.wait_for_timeout(400)
        await pg.get_by_role("button",name="Run").first.click()
        await pg.get_by_text("tests passed").first.wait_for(timeout=20000)
        await pg.wait_for_timeout(1800)
        await r.stop(hold=1.0)
        # C3: coach
        r=Recorder(pg,"c3_coach"); await r.start()
        await pg.wait_for_timeout(300)
        await pg.get_by_text("Coach",exact=True).first.click(); await pg.wait_for_timeout(1800)
        chip=pg.get_by_role("button").filter(has_text="fail?").first
        await chip.click()
        await pg.wait_for_timeout(12000)
        await r.stop(hold=1.0)
        await pg.screenshot(path="c3_end.png")
        # C5: explanation (cost)
        await pg.get_by_text("Explanation",exact=True).first.click(); await pg.wait_for_timeout(1200)
        r=Recorder(pg,"c5_cost"); await r.start()
        await pg.wait_for_timeout(2500)
        await r.stop(hold=1.0)
        # C4: tracer
        await pg.goto("https://www.leetexpert.com/courses/dsa/two-pointers/converging-pointers",wait_until="networkidle")
        await dismiss(pg)
        sf=pg.get_by_role("button",name="Step forward").first
        await sf.scroll_into_view_if_needed()
        await pg.get_by_role("button",name="Expand to fullscreen").first.click(); await pg.wait_for_timeout(1200)
        r=Recorder(pg,"c4_tracer"); await r.start()
        await pg.wait_for_timeout(600)
        for i in range(6):
            await pg.get_by_role("button",name="Step forward").last.click(); await pg.wait_for_timeout(900)
        await pg.wait_for_timeout(600)
        await r.stop(hold=0.8)
        # C6: heatmap on homepage
        await pg.goto("https://www.leetexpert.com/",wait_until="networkidle"); await pg.wait_for_timeout(800)
        hm=pg.get_by_text("Every practice day lights a square").first
        await hm.scroll_into_view_if_needed(); await pg.evaluate("window.scrollBy(0,-120)"); await pg.wait_for_timeout(1500)
        r=Recorder(pg,"c6_heat"); await r.start()
        await pg.wait_for_timeout(300)
        for _ in range(12):
            await pg.mouse.wheel(0,25); await pg.wait_for_timeout(120)
        await pg.wait_for_timeout(1200)
        await r.stop(hold=1.0)
        await b.close()
asyncio.run(main())
