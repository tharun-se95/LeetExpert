import json, html, datetime, subprocess
from pathlib import Path
K = json.load(open("october.json"))
root = str(Path(__file__).resolve().parents[2] / "instagram") + "/"
MEDIA = {
 "p02": {"kind":"Carousel · 8 slides (cover first, then 7 videos)","files":[("cover","f5d42622d15a833d97516a11cdf8ac8b","png")]+[(f"slide {i}",x,"mp4") for i,x in enumerate(["6a23d0298b937dbf6905aeb2622344e9","ec7462379891629d7e95c4ba8d70f798","069e5f7bd0485d111bc4a0822a6e0da6","3708c50e127b57179567961ea29dfd1a","aa1755956c541bdbde4f1bdb5cda0ff9","0fde4188e8939ca9deafecf30e1eb0ed","596b9a4b108a3d3f135c69bfc950299a"],1)]},
 "p03": {"video":"e660bd895bf25bb916d065a39e0903a7","cover":"76db0065e7ec4ccd475de910fae32e69"},
 "p04": {"video":"fbb82c372d89befb4dd4af80196299d6","cover":"001aa095252b2b9654432906a893667d"},
 "p07": {"video":"12be7aa02550bb935f3baa0638c31958","cover":"0a04196905559ed368c735be5428c81b"},
 "p08": {"video":"8e1014f3c8ec3deba7b6e6d2e8ec4aa2","cover":"465d82455afcaba99dd60ab4067bc77b"},
 "p09": {"video":"2ef16137ad264995a3b580bfc38f9fe9","cover":"7f5295c6269d196665c0b87a95423f25"},
 "p10": {"video":"196a73751dbbb593206d09aff0cfd464","cover":"97049e47c4e7cda68b04e045aa7b6279"},
 "p11": {"video":"2341ace3be2f3fa432766e21788a5991","cover":"b8f3887f5bf37c2a47d4e723b63aedb1"},
 "p12": {"video":"de55db693d421fc8546a6a1da33c9134","cover":"581b0bdabab7e735f60b19e0e4b7f9f8"},
 "p13": {"video":"2674fc9758b9ae64ddef4524747c7d9c","cover":"3b020c9cf46e4ec9914b676d21390868"},
 "p14": {"video":"0e5cbcbaca54a8df1b879e503482df62","cover":"f4679b772e51c28d50574b144f471eee"},
 "p15": {"kind":"Single image","files":[("card","9d589aa2cdeeeea7f51baf4d075b42c2","png")]},
 "p16": {"video":"c789681fd6b64c0015d4d30c3e3268a4","cover":"108cdc88d62234e5374eadc3054df9b1"},
 "p17": {"video":"7bf0f9ea9ac00854c02139a7bfa717cc","cover":"a95504c381009ab0250fff70391b686b"},
 "p18": {"video":"f1c1830c81e83506b35b9abafb411666","cover":"60141626831f6b780f406e1372f0ea59"},
}
def dur(d):
    s = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",root+d+"/reel.mp4"]))
    return f"{int(s//60)}:{round(s%60):02d}"
e = html.escape
weeks = {}
for r in K:
    d = datetime.date.fromisoformat(r["date"])
    mon = d - datetime.timedelta(days=d.weekday())
    wk = "Launch: three a day, Oct 1–3" if (d.month, d.day) <= (10, 3) else "Then one a day"
    m = MEDIA.get(r["post"])
    if m is None:
        # a package whose media are not yet assets of the kit artifact: listed, marked, not saveable
        n = len(list(Path(root, r["dir"]).glob("slide*.png")))
        m = {"kind": f"Carousel · {n} slides · media not uploaded yet", "files": []}
    slug = r["dir"][11:]
    if "video" in m:
        kind = f"Reel · {dur(r['dir'])}"
        files = [("video", m["video"], "mp4"), ("cover", m["cover"], "png")]
        media = f'<video controls playsinline preload="none" poster="/_blob/{m["cover"]}" src="/_blob/{m["video"]}"></video>'
    else:
        kind = m["kind"]; files = m["files"]
        media = f'<img src="/_blob/{files[0][1]}" alt="">' if files else ""
    caption = r["caption"].strip() + "\n\n" + r["hashtags"].strip()
    saves = "".join(f'<button class="sv" data-id="{fid}" data-name="{e(slug)}-{e(lab.replace(" ", ""))}.{ext}">Save {e(lab)}</button>' for lab, fid, ext in files)
    hook = r["hook"].split("\n")[0].strip()
    weeks.setdefault(wk, []).append(f'''<article class="post" id="{r["post"]}">
 <div class="when"><span class="day">{d.strftime("%a")}</span><span class="date">{d.strftime("%b")} {d.day}</span><span class="slot">{e(r.get("slot", ""))}</span></div>
 <div class="body">
  <label class="done"><input type="checkbox" id="done-{r["post"]}" data-post="{r["post"]}"> Scheduled</label>
  <p class="kind">{e(kind)} · {r["post"].upper()}</p>
  <h3>{e(hook)}</h3>
  <div class="media">{media}</div>
  <div class="saves">{saves}</div>
  <div class="copies"><button class="cp" data-src="cap-{r["post"]}">Copy caption + hashtags</button><button class="cp" data-src="alt-{r["post"]}">Copy alt text</button></div>
  <details><summary>Caption</summary><pre id="cap-{r["post"]}">{e(caption)}</pre></details>
  <details><summary>Alt text</summary><pre id="alt-{r["post"]}">{e(r["alt"].strip())}</pre></details>
 </div>
</article>''')
body = "".join(f'<section><h2>{e(w)}</h2>{"".join(c)}</section>' for w, c in weeks.items())
page = open("template.html").read().replace("%%POSTS%%", body).replace("%%N%%", str(len(K)))
open("index.html", "w").write(page)
print(len(K), "posts", len(page)//1024, "KB", list(weeks))
missing = [r["post"] for r in K if r["post"] not in MEDIA]
if missing:
    print("no media assets yet (upload them to the kit artifact and add them to MEDIA):", ", ".join(missing))
