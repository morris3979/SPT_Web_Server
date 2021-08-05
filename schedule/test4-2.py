import copy
import json
import pandas as pd

a = json.load(open('maintain_data.json','r',encoding="utf-8"))
d, g = {}, {}
for b in a:
    station = [b['name']]#站別
    for b1 in b['treatmentSeats']:
        item = []
        for c in b1['treatmentItems']:
            item.append(c['treatmentCode'])#項目
            sstation = str(station)
            if len(item) > 1 and g.get(sstation, False) == False:
                g[sstation] = []
                g[sstation].extend(item)
        if str(item) not in d.keys():
            d[str(item)] = []
            d[str(item)].append(station)
            if len(item) > 1:
                d[str(item)].append(item)
            else:
                d[str(item)].append([])
            d[str(item)].append([1])
        else:
            if b['name'] not in d[str(item)][0]:
                d[str(item)][0] += station
                d[str(item)][2] = d[str(item)][2] + [1]
            else:
                d[str(item)][2][d[str(item)][0].index(b['name'])] += 1
        if len(item) > 1:
            for si in item:
                e = copy.deepcopy(item)
                e.remove(si)
                sil = [si]
                if str(sil) not in d.keys():
                    d[str(sil)] = []
                    d[str(sil)].append(station)
                    d[str(sil)].append(e)
                    d[str(sil)].append([1])
                else:
                    d[str(sil)][1] = d[str(sil)][1] + e
                    d[str(sil)][1] = list(set(d[str(sil)][1]))
                    if b['name'] not in d[str(sil)][0]:
                        d[str(sil)][0] = d[str(sil)][0] + station
                        d[str(sil)][2] = d[str(sil)][2] + [1]
                    else:
                        d[str(sil)][2][d[str(sil)][0].index(b['name'])] += 1

d["['PTS8']"][1].append('PTS8-2')
d["['PTS8-2']"][1].append('PTS8')
d["['PTS3-2', 'PTS8-2']"][1].append('PTS8')

h = []
d["['PTS2', 'PTS3']"] = d["['PTS3']"]
d["['PTS2', 'PTS3']"][1].append(eval("['PTS3']")[0])
h.append("['PTS2', 'PTS3']")
d["['PTS2', 'PTS7']"] = d["['PTS7']"]
d["['PTS2', 'PTS7']"][1].append(eval("['PTS7']")[0])
h.append("['PTS2', 'PTS7']")
d["['PTS2', 'PTS8']"] = d["['PTS8']"]
d["['PTS2', 'PTS8']"][1].append(eval("['PTS8']")[0])
h.append("['PTS2', 'PTS8']")
d["['PTS2', 'PTS9']"] = d["['PTS9']"]
d["['PTS2', 'PTS9']"][1].append(eval("['PTS9']")[0])
h.append("['PTS2', 'PTS9']")
d["['PTS2', 'PTS11']"] = d["['PTS11']"]
d["['PTS2', 'PTS11']"][1].append(eval("['PTS11']")[0])
h.append("['PTS2', 'PTS11']")
d["['PTS2', 'PTS3', 'PTS9']"] = d["['PTS3', 'PTS9']"]
d["['PTS2', 'PTS3', 'PTS9']"][1].append(eval("['PTS3', 'PTS9']")[0])
h.append("['PTS2', 'PTS3', 'PTS9']")
d["['PTS2', 'PTS8', 'PTS9']"] = d["['PTS8', 'PTS9']"]
d["['PTS2', 'PTS8', 'PTS9']"][1].append(eval("['PTS8', 'PTS9']")[0])
h.append("['PTS2', 'PTS8', 'PTS9']")

with open('ot2.json', 'w') as f:
    json.dump(d, f)
with open('ot3.json', 'w') as f:
    json.dump(g, f)
with open('ot4.json', 'w') as f:
    json.dump(h, f)

keyl = list(d.keys())
keyc = copy.deepcopy(keyl)
keyf, keyo, stl = [], [], []
for kl in keyl:
    if len(eval(kl)) > 1:
        keyo.append(str(kl))
        keyc.remove(kl)
    else:
        keyf.append(eval(kl)[0])
for kl in keyc:
    for st in d[kl][0]:
        if st not in stl:
            stl.append(st)
keyf.extend(keyo)
keyf.extend(stl)
keyf.insert(0, 'patient')
keyf.append('date')
dtcsv = pd.read_csv('testcsp2.csv')
dtcsv.drop(dtcsv.index, inplace = True)
dtcsv.reset_index(inplace = True, drop = True)
lend = len(dtcsv.columns) - len(keyf)
if lend < 0:
    for cl in range(abs(lend)):
        dtcsv[cl] = cl
else:
    for cl in range(lend):
        del dtcsv[keyf[cl]]
dtcsv.columns = keyf
dtcsv.to_csv('testcsp2.csv', index = False)
print(dtcsv)#'''