import asyncio, base64, os, subprocess, time
from playwright.async_api import async_playwright

class Recorder:
    def __init__(self, page, name):
        self.page, self.name, self.frames = page, name, []
    async def start(self):
        self.cdp = await self.page.context.new_cdp_session(self.page)
        self.running = True
        async def loop():
            while self.running:
                try:
                    r = await self.cdp.send("Page.captureScreenshot", {"format":"jpeg","quality":90,"optimizeForSpeed":True})
                    self.frames.append((time.time(), base64.b64decode(r["data"])))
                except Exception: await asyncio.sleep(0.02)
        self.task = asyncio.ensure_future(loop())
        self.t0 = time.time()
    async def stop(self, hold=0.5):
        await asyncio.sleep(0.1)
        self.running = False
        await self.task
        d = f"raw/{self.name}"; os.makedirs(d, exist_ok=True)
        lines = []
        fr = [f for f in self.frames if f[0] >= self.t0 - 0.05] or self.frames
        for i,(t,data) in enumerate(fr):
            p = f"{d}/{i:05d}.jpg"; open(p,"wb").write(data)
            dur = (fr[i+1][0]-t) if i+1 < len(fr) else hold
            lines.append(f"file '{os.path.abspath(p)}'\nduration {max(dur,0.001):.4f}")
        lines.append(f"file '{os.path.abspath(p)}'")
        open(f"{d}/list.txt","w").write("\n".join(lines))
        out=f"clips/{self.name}.mp4"
        subprocess.run(["ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",f"{d}/list.txt",
            "-vf","scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xf1f4f9,fps=30,format=yuv420p",
            "-c:v","libx264","-crf","18",out],check=True)
        print(self.name, len(fr), "frames ->", out)

async def new_page(p, dark=False):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width":540,"height":960}, device_scale_factor=2, color_scheme="light")
    pg = await ctx.new_page()
    return b, pg

async def dismiss(pg):
    try: await pg.get_by_text("Continue without signing in").click(timeout=4000); await pg.wait_for_timeout(600)
    except Exception: pass
