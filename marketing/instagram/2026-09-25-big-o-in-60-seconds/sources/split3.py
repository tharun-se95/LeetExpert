import json,subprocess
d=json.load(open('vo3/scribe.json')); W=[x for x in d['words'] if x['type']=='word']
norm=lambda t:t.lower().strip(".,?:!")
starts=[0]; 
seq=[("big",1),("let's",0),("next",0),("and",None),("so",None),("so",None)]
# locate each slide's first word after previous boundary using expected text
exp=["big","let's","next","and","so","so"]
k=0
for tok in exp:
    j=starts[-1]+3
    while norm(W[j]['text'])!=tok or not (W[j-1]['text'].endswith(('.','?','!'))): j+=1
    starts.append(j)
print([ (i,W[i]['text'],W[i]['start']) for i in starts])
D=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0","vo3/take.mp3"]))
cuts=[0.0]+[round((W[i-1]['end']+W[i]['start'])/2,3) for i in starts[1:]]+[D]
for k in range(7):
    a,b=cuts[k],cuts[k+1]
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i","vo3/take.mp3","-af",f"atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={b-a-0.03:.3f}:d=0.03,aresample=44100","-c:a","libmp3lame","-b:a","192k",f"vo3/vo{k+1}.mp3"],check=True)
    end=starts[k+1] if k<6 else len(W)
    words=[{"t":W[i]['text'],"s":round(W[i]['start']-a,2),"e":round(W[i]['end']-a,2)} for i in range(starts[k],end)]
    json.dump(words,open(f"vo3/vo{k+1}.json","w"))
    print(k+1, f"{b-a:.2f}s", words[0]['t'], "...", words[-1]['t'])
