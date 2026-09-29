import subprocess,json
Z="crop=720:1280:0:120,scale=1080:1920:flags=lanczos"
BOX=",drawbox=x=170:y=392:w=840:h=122:color=0xfbbf24@0.95:t=6"
# (name, source, is_image, ss, dur, vfilter, caption)
S=[
 ("A","clips/n1_type.mp4",0,0.0,3.06,Z,"k_ai"),
 ("B1","clips/n2_run.mp4",0,0.2,0.78,"null","k_run"),
 ("B2","clips/n2_run.mp4",0,6.95,2.18,"null","k_pass"),
 ("C1","segs/n1_last.png",1,0,1.18,Z,"k_notfast"),
 ("C2","segs/n1_last.png",1,0,3.90,Z+BOX,"k_loops"),
 ("D","clips/n5_counter.mp4",0,0,6.48,"null",None),
 ("E","v2/n2_last.png",1,0,2.02,"null","k_still"),
 ("F1","clips/n3_insight.mp4",0,0.1,2.52,"null","k_bar"),
 ("F2","clips/n3_insight.mp4",0,2.62,1.90,"null","k_on"),
 ("G1","clips/n4_coach.mp4",0,0.36,2.98,"null","k_coach"),
 ("G2","clips/n4_coach.mp4",0,3.34,4.74,"null","k_nudge"),
 ("H","clips/n6_tracer.mp4",0,0.3,6.06,"null","k_visual"),
 ("I","clips/c0_hero.mp4",0,0,3.80,"null",None),
 ("J","cards/end.png",1,0,3.50,"format=yuv420p,fade=t=out:st=3.1:d=0.4",None),
]
V=["-c:v","libx264","-crf","18","-preset","medium","-pix_fmt","yuv420p","-r","30","-an"]
files=[];t=0
for n,src,img,ss,dur,vf,cap in S:
    out=f"v2/{n}.mp4"
    inp=(["-loop","1","-framerate","30","-t",f"{dur}","-i",src] if img else ["-ss",f"{ss}","-t",f"{dur}","-i",src])
    if cap:
        cmd=["ffmpeg","-y","-loglevel","error",*inp,"-i",f"cards/{cap}.png","-filter_complex",f"[0:v]{vf},fps=30[b];[b][1:v]overlay=0:0,format=yuv420p","-t",f"{dur}",*V,out]
    else:
        cmd=["ffmpeg","-y","-loglevel","error",*inp,"-vf",f"{vf},fps=30,format=yuv420p","-t",f"{dur}",*V,out]
    subprocess.run(cmd,check=True); files.append(out)
    d=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",out]))
    print(f"{n:3} start {t:6.2f} planned {dur:.2f} actual {d:.3f}"); t+=d
open("v2/list.txt","w").write("\n".join(f"file {f.split('/')[1]}" for f in files))
subprocess.run(["ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i","v2/list.txt","-c","copy","v2/video.mp4"],check=True)
print("total",t)
