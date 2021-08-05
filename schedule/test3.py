import pandas as pd
import copy
import warnings
from constraint import *
import json
import sys
import time
import datetime

def station(fn, pt):
    with open(fn, 'r') as f:
        jata = json.load(f)
    if type(pt) == str:
        ptl = [pt]
        pts = str(ptl)
    else:
        pts = str(pt)
    if len(jata[pts][0]) == 1:
        jns = jata[pts][0][0]
        jpts = jata[pts][2][jata[pts][0].index(jns)]
    else:
        jns = 0
        jnf = ['站別3-1', '站別3-2', '站別5']#@
        jnsubset = set(jata[pts][0]).issubset(set(jnf))
        for jnc in jata[pts][0]:
            jcn = dtcsv[jnc][dtcsv[jnc] > 0].count() / jata[pts][2][jata[pts][0].index(jnc)]
            if jns == 0:
                jns = jnc
            elif jcn < jsn:
                if jnsubset == False:
                    jns = jnc
                elif jsn >= 1 and jsn > jcn:
                    jns = jnc
            jpts = jata[pts][2][jata[pts][0].index(jns)]
            jsn = dtcsv[jns][dtcsv[jns] > 0].count() / jpts
    dtcsv[jns].iloc[-1] = 1
    return jns, jata[pts][1], jpts

#新增變數
def variable(tg, a1, edi, jn, ji, js, hE3):
    g = copy.deepcopy(a1)
    mg = max(a1) + 1
    vd = {}
    i = []
    mask = dtcsv[jn] == 1
    ji.append(tg)
    with open('ot3.json', 'r') as f:
        suppsta = json.load(f)
    if suppsta.get(str([jn])):
        ji.append(str(suppsta[str([jn])]))
    ji = list(set(ji))
    if hE3:
        ji.remove('PTS2')
    for ji1 in ji:
        h = dtcsv[mask][ji1].tolist()
        hu = list(set(h))
        for g1 in hu:
            if g1 != 0:
                if vd.get(g1, False):
                    if len(ji1) > 7:
                        vd[g1] = vd[g1] - h.count(g1)
                    else:
                        vd[g1] = vd[g1] + h.count(g1)
                else:
                    if len(ji1) > 7:
                        vd[g1] = 0 - h.count(g1)
                    else:
                        vd[g1] = h.count(g1)
    for vdk in vd.keys():
        if vd[vdk] >= js:
            if vdk in g:
                g.remove(vdk)
            else:
                i.append(vdk)
    i = list(set(i))
    while len(g) != len(a1):
        if mg not in i and mg not in g:
            g.append(mg)
        mg += 1
    if tg in edi:
        #print(tg, g)
        p.addVariable(tg, g)
    return g

def condition_c(e1, ed1, a):
    for c1 in e1:#須一起做
        if set(c1).issubset(set(thing)):
            ls1, ls2 = [], []
            c1s = c1
            for i1 in c1:
                ls1.append([i1, dtcsv[i1].max(axis = 0)])
            ls1 = sorted(ls1, key = lambda l : l[1], reverse = True)
            for i2 in ls1:
                ls2.append(i2[0])
            c1 = ls2
            jn, ji, js = station('ot2.json', c1s)
            rc[str(c1s)] = jn
            if c1 in E3:
                hE3 = True
            else:
                hE3 = False
            for c8 in c1:
                if c8 == c1[0]:
                    gb1 = variable(c8, a, ed1, jn, ji, js, hE3)
                else:
                    variable(c8, gb1, ed1, jn, ji, js, hE3)
            for c2 in c1[:(len(c1) - 1)]:
                #print(c2, c1[c1.index(c2) + 1], '1')
                p.addConstraint(lambda x, y : x == y, (c2, c1[c1.index(c2) + 1]))
            ed1 = list(set(ed1).difference(set(c1)))
            hc1.append(c1)
            a = gb1
    return ed1, a

def condition_s(e1, ed1, a, uninum):
    for c1 in e1:#先後要求
        if set(c1).issubset(set(thing)):
            ls1, ls2 = [], []
            if len(c1) > 2:
                for i3 in c1[1:]:
                    ls1.append([i3, dtcsv[i3].max(axis = 0)])
                ls1 = sorted(ls1, key = lambda l : l[1], reverse = True)
                del c1[1:]
                for i2 in ls1:
                    ls2.append(i2[0])
                c1.extend(ls2)
            if uninum == 0:
                c1.reverse()
            for c8 in c1:
                jn, ji, js = station('ot2.json', c8)
                c8l = [c8]
                rc[str(c8l)] = jn
                if c8 == c1[0]:
                    if uninum == 0:
                        ad = [ai + (len(c1) - 1) for ai in a]
                    else:
                        ad = a
                    gb1 = variable(c8, ad, ed1, jn, ji, js, False)
                else:
                    gb1 = variable(c8, gb1, ed1, jn, ji, js, False)
                if uninum == 0:
                    gb1 = [gbi - 1 for gbi in gb1]
                else:
                    gb1 = [gbi + 1 for gbi in gb1]
                for gbi in gb1:
                    if gbi < 1:
                        gb1.remove(gbi)
            for c2 in c1[:(len(c1) - 1)]:
                if uninum == 0:
                    p.addConstraint(lambda x, y : x == y + 1, (c2, c1[c1.index(c2) + 1]))
                else:
                    p.addConstraint(lambda x, y : x == y - 1, (c2, c1[c1.index(c2) + 1]))
            ed1 = list(set(ed1).difference(set(c1)))
            hc1.append(c1)
            a = gb1
    return ed1, a

warnings.filterwarnings('ignore')
dtcsv = pd.read_csv('testcsp2.csv')

#刪除過期資料
if dtcsv.empty == False:
    if dtcsv.isnull().any().any() == True:
        dtcsv.dropna(inplace = True)
    for dindex in dtcsv.index:
        if datetime.datetime.now().day != dtcsv.loc[dindex]['date']:
            dtcsv.drop(dindex, inplace = True)#'''
    dtcsv.reset_index(inplace = True, drop = True)
    #delth = [{"code":2, "sites":["PTS8"]}]
    delth = json.loads(sys.argv[4])
    if len(delth) > 0:
        for delth1 in delth:
            for delth2 in delth1['sites']:
                dtcsv.loc[dtcsv['patient'].isin([delth1['code']]), delth2] = 0
        dcols = list(dtcsv.columns)
        dcn = 1
        for dcol in dcols:
            if 'PTS' in dcol and len(dcol) < 10:
                dcn += 1
        b = 0
        for a3 in (dtcsv.iloc[:, 1:dcn] != 0).astype(int).sum(axis = 1):
            if a3 == 0:
                dtcsv.drop(b, inplace = True)
            b += 1#'''
    '''oldata = dtcsv.loc[dtcsv['patient'].isin([thingall[0]])]
    if oldata.empty == False:
        dtcsv.drop(oldata.index.tolist(), inplace = True)
        dtcsv.reset_index(inplace = True, drop = True)#'''
    dtcsv.to_csv('testcsp2.csv', index = False)

#暫替輸入端
dtcsv.loc[len(dtcsv)] = 0
#thingall = [1, 'PTS1-1', 'PTS2', 'PTS7', 'PTS8']
thingall = json.loads(sys.argv[1])
thing = thingall[1:]
x = len(thing) + 1
a = list(range(1, x))
aold = list(range(1, x))

#新增條件
p = Problem()
hc1 = []
rc = {}
ed1 = copy.deepcopy(thing)
#E3 = []
E3 = json.loads(sys.argv[5])
#E2 = [['PTS2', 'PTS1-1']]
E2 = json.loads(sys.argv[3])
#E1 = []
E1 = json.loads(sys.argv[2])
uninum = 0
for E3i in E3:
    for E2i in E2:
        uninum = len(set(E3i) & set(E2i))
ed1, a = condition_c(E3, ed1, a)
ed1, a = condition_s(E2, ed1, a, uninum)
ed1, a = condition_c(E1, ed1, aold)

ed2 = copy.deepcopy(thing)
hc2 = copy.deepcopy(hc1)
if len(hc1) != 0:
    for c4 in hc1:
        for c5 in hc2:
            if c4 != c5:#有特別要求項目組之間
                for c6 in c4:
                    for c7 in c5:
                        hc4 = [c6, c7]
                        #hc4.sort()
                        cd1 = c6 != c7
                        cd2 = hc4 not in hc1
                        if len(E3) > 0:
                            cd3 = set(hc4).issubset(set(E3[0]))
                        else:
                            cd3 = False
                        if cd1 and cd2 and not cd3:
                            #print(c6, c7, '3')
                            p.addConstraint(lambda x, y : x != y, (c6, c7))
        if c4 in hc2:
            hc2.remove(c4)#'''

    if len(ed1) != 0:#剩餘無特別要求項目
        for d1 in ed1:
            jn, ji, js = station('ot2.json', d1)
            d1l = [d1]
            rc[str(d1l)] = jn
            variable(d1, a, ed1, jn, ji, js, False)
            for d2 in ed2:
                if d1 != d2:
                    #print(d2, d1, '4')
                    p.addConstraint(lambda x, y : x != y, (d2, d1))
            ed2.remove(d1)
else:#全項目無特別要求
    for oth in ed2:
        jn, ji, js = station('ot2.json', oth)
        othl = [oth]
        rc[str(othl)] = jn
        variable(oth, a, ed1, jn, ji, js, False)
    p.addConstraint(AllDifferentConstraint())

#選擇結果
def answerchange(j2, j5, pg):
    j3 = j2
    j6 = j5
    pgm = pg[-1][1]
    pgw = pg
    return j3, j6, pgm, pgw

pgm, j3, j4, j6 = 0, -1, 0, 0
e3 = []#超過20分鐘的項目
pgfirst = ['PTS2', 'PTS3-2']#@
for pgs in p.getSolutions():
    #print(pgs)
    pg = sorted(pgs.items(), key = lambda item : item[1])
    if pgm == 0 or pgm >= pg[-1][1]:
        j1, j2, j5 = 0, 0, 0
        for k in pg:
            if k[1] - j1 > 1:
                if k[0] in e3:#需等e3裡有的項目
                    j2 += (k[1] - j1 - 1) * 1.33
                else:
                    j2 += k[1] - j1 - 1
            j1 = k[1]
            j5 += k[1]
        if j3 == -1:
            j3, j6, pgm, pgw = answerchange(j2, j5, pg)
        else:
            if j3 > j2:#多等的時間最少者
                j3, j6, pgm, pgw = answerchange(j2, j5, pg)
            elif j3 == j2:
                if pg[0][0] in pgfirst:
                    j3, j6, pgm, pgw = answerchange(j2, j5, pg)
                elif j6 > j5:
                    j3, j6, pgm, pgw = answerchange(j2, j5, pg)
    '''j5 = 0
    for pi in pg:
        j5 += pi[1]
    if j4 == 0 or j4 > j5:
        j4 = j5
        pgw = pg#'''

#print(pgw)
#記錄結果
js, js1 = [], []
jsn = pgw[0][1]
for f1 in pgw:
    dtcsv[f1[0]].iloc[-1] = f1[1]
    for e1l in E1:
        if f1[0] in e1l:
            dtcsv[str(e1l)].iloc[-1] = f1[1]
    if jsn != f1[1]:
        js.append(js1)
        js1 = []
    js1.append(f1[0])
    jsn = f1[1]
js.append(js1)
with open('ot4.json', 'r') as f:
    belongcheck = json.load(f)
for js2 in js:
    js3 = str(js2)
    inficheck = 0
    while True:
        if js3 in rc.keys():
            js2.append(rc[js3])
            if js3 in belongcheck:
                js2.append(True)
            else:
                js2.append(False)
            break
        else:
            js3 = eval(js3)
            js30 = js3.pop(0)
            js3.append(js30)
            if inficheck < len(js3):
                inficheck += 1
            else:
                inficheck = 0
                js3.reverse()
            js3 = str(js3)
print(json.dumps(js))#輸出給網頁
dtcsv['patient'].iloc[-1] = thingall[0]
dtcsv['date'] = datetime.datetime.now().day
dtcsv.to_csv('testcsp2.csv', index = False)#'''
#print(dtcsv)