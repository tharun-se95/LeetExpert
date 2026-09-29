# Builds a HyperFrames-ready rig: every state is a stacked group toggled by opacity.
import t2
from t2 import defs, hair_back, torso, arms, head, glasses, hair_front, brows, eye, mouth
EYES=["open","half","closed","happy","wide"]
MOUTHS={"rest":"smile","small":"talk","wide":"open","o":"o","e":"e","grin":"grin","flat":"flat","pout":"pout"}
BROWS=["neutral","up","focus","worry"]
POSES=["idle","pen","think","thumbs","tablet","mug"]
def rig(p="r"):
    S='transform="translate(300,456) scale(0.9) translate(-300,-456)"'
    face=head(("open","open"),"neutral","smile",p)
    # strip the default eyes/mouth from the face and add stacked variants
    import re
    face=re.sub(r'<g id="eyes">.*?</g></g></g>','',face,flags=re.S) if False else face
    base=face.split('<g id="eyes">')[0]
    eyes="".join(f'<g class="eyes" id="eyes-{e}" opacity="{1 if e=="open" else 0}">'
                 f'<g transform="translate(250,330) scale(1.12) translate(-250,-330)">{eye(250,330,e,False,p)}</g>'
                 f'<g transform="translate(350,330) scale(1.12) translate(-350,-330)">{eye(350,330,e,True,p)}</g></g>' for e in EYES)
    mouths="".join(f'<g class="mouth" id="m-{k}" opacity="{1 if k=="rest" else 0}">{mouth(v)}</g>' for k,v in MOUTHS.items())
    br="".join(f'<g class="brow" id="b-{b}" opacity="{1 if b=="neutral" else 0}">{brows(b)}</g>' for b in BROWS)
    ar="".join(f'<g class="arm" id="a-{a}" opacity="{1 if a=="idle" else 0}">{arms(a,p)}</g>' for a in POSES)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">{defs(p)}'
            f'<g {S}>{hair_back(p)}</g>{torso(p)}{ar}'
            f'<g {S}><g id="headTilt">{base}{eyes}{mouths}{glasses(p)}{hair_front(p)}<g opacity=".92">{br}</g></g></g></svg>')
if __name__=="__main__":
    open("tutor-rig.svg","w").write(rig())
    import cairosvg; cairosvg.svg2png(url="tutor-rig.svg",write_to="rig.png",output_width=300,background_color="#f4f6fa")
    print("ok", len(open("tutor-rig.svg").read()))
