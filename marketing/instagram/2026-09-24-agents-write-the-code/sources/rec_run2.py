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
        await pg.keyboard.insert_text(CODE); await pg.mouse.click(5,5)
        await pg.get_by_role("button",name="Run").first.click()
        await pg.get_by_text("tests passed").first.wait_for(timeout=30000)
        await pg.wait_for_timeout(500)
        r=Recorder(pg,"c2b_tests"); await r.start()
        await pg.wait_for_timeout(500)
        await pg.get_by_text("Tests",exact=False).filter(has_text="2/4").first.click()
        await pg.wait_for_timeout(2500)
        await r.stop(hold=0.5)
        await pg.screenshot(path="tests_open.png")
        await b.close()
asyncio.run(main())
