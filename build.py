"""Gera o index.html do Painel Palmeiras a partir da planilha, do template e das fotos.

Uso:  python build.py        (requer pandas, openpyxl e pillow)

Fotos: coloque em fotos/ um arquivo por jogador, nomeado com o ID da planilha
(ex.: PAL024.png, PAL024.webp ou PAL024.jpg). O script otimiza e embute tudo no HTML.
"""
import base64, glob, io, json, os, re
import pandas as pd
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
os.chdir(AQUI)
X = pd.read_excel('Palmeiras_Base_Dados_Completa.xlsx', sheet_name=None)


def n(v):
    """Converte para int/float/None (célula vazia = dado ausente, nunca zero)."""
    if v is None or pd.isna(v):
        return None
    return int(v) if float(v) == int(float(v)) else float(v)


def s(v):
    return None if v is None or pd.isna(v) else str(v)


def dia(v):
    return None if pd.isna(v) else v.strftime('%Y-%m-%d')


# ---------- jogadores (cadastro) ----------
J = X['Jogadores']
pl = {r['ID Jogador']: [r['Nome'], s(r['Posição']), s(r['Nacionalidade']), n(r['Altura (m)']), n(r['Peso (kg)'])]
      for _, r in J.iterrows()}

# ---------- elenco por temporada e competição ----------
# linha: [id, temporada, competição, pos, camisa, idade, J, SUB, G, A, FC, FS, CA, CV, D, GS]
rows = {}
for _, r in X['Elenco'].iterrows():
    k = (r['ID Jogador'], int(r['Temporada']), r['Competição'])
    rows[k] = [r['ID Jogador'], int(r['Temporada']), r['Competição'], s(r['POS']), n(r['Camisa']), n(r['Idade']),
               n(r['J']), n(r['SUB']), n(r['G']), n(r['A']), n(r['FC']), n(r['FS']), n(r['CA']), n(r['CV']),
               n(r['D']), n(r['GS'])]

# gols e assistências: o ranking (Top 25) prevalece sobre a coluna do elenco quando existe
for _, r in X['Gols e Assistências'].iterrows():
    if r['ID Jogador'] not in pl:
        continue
    k = (r['ID Jogador'], int(r['Temporada']), r['Competição'])
    if k not in rows:
        b = pl[r['ID Jogador']]
        rows[k] = [k[0], k[1], k[2], b[1], None, None] + [None] * 10
    row = rows[k]
    if pd.notna(r['Total']):
        row[8 if r['Ranking de'] == 'Gols' else 9] = int(r['Total'])
    if row[6] is None and pd.notna(r['J']):          # jogos ausentes no elenco: usa o do ranking
        row[6] = int(r['J'])
e = sorted(rows.values(), key=lambda x: (-x[1], x[2], x[0]))

# ---------- jogos (resultados e calendário) ----------
def pen(a):
    q = re.search(r'PAL (vence|perde) p[êe]naltis (\d+)-(\d+)', str(a['Observação original']))
    if not q:
        return None
    x, y = int(q[2]), int(q[3])
    return f"{x}-{y}" if q[1] == 'vence' else f"{y}-{x}"

m = []
for _, a in X['Resultados'].sort_values('Data').iterrows():
    m.append([dia(a.Data), a['Competição'], a.Visitante if a['Local Palmeiras'] == 'Casa' else a.Mandante,
              a['Local Palmeiras'], int(a.GP), int(a.GC), a['Situação'], s(a.Fase), pen(a), int(a.Temporada)])
f = [[dia(a.Data), a['Competição'], a.Visitante if a['Local Palmeiras'] == 'Casa' else a.Mandante,
      a['Local Palmeiras'], s(a.Hora), int(a.Temporada)] for _, a in X['Calendário'].iterrows()]

# ---------- recordes ----------
rec = [[r['Competição'], int(r['Temporada']), r['Categoria'], n(r['Valor']), s(r['Mandante']), s(r['Placar']),
        s(r['Visitante']), dia(r['Data'])] for _, r in X['Rendimento'].iterrows()]
seq = [[r['Competição'], int(r['Temporada']), r['Categoria'], n(r['Partidas'])] for _, r in X['Sequências'].iterrows()]
pub = [[r['Competição'], int(r['Temporada']), r['Categoria'], n(r['Público']), s(r['Mandante']), s(r['Placar']),
        s(r['Visitante']), dia(r['Data'])] for _, r in X['Público'].iterrows()]

seasons = sorted({x[1] for x in e} | {x[9] for x in m} | {x[1] for x in rec + seq + pub}, reverse=True)

# ---------- imagens ----------
def webp(path, box, q=84):
    im = Image.open(path).convert('RGBA')
    im = im.resize(box, Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()

ph = {}
for p in sorted(glob.glob('fotos/PAL*.*')):
    pid = os.path.splitext(os.path.basename(p))[0]
    if pid in pl:
        ph[pid] = webp(p, (360, 420))
    else:
        print('AVISO: foto sem jogador correspondente:', p)

im = Image.open('escudo-palmeiras.png').convert('RGBA').resize((260, 260), Image.LANCZOS)   # PNG com fundo transparente
b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
logo = 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()

data = dict(seasons=seasons, pl=pl, e=e, m=m, f=f, rec=rec, seq=seq, pub=pub)
tpl = open('tpl.html', encoding='utf-8').read()
h = (tpl.replace('__DATA__', json.dumps(data, ensure_ascii=False, separators=(',', ':')))
        .replace('__PHOTOS__', json.dumps(ph, separators=(',', ':')))
        .replace('__LOGO__', logo)
        .replace('__STADIUM__', open('stadium.js', encoding='utf-8').read()))
open('index.html', 'w', encoding='utf-8').write(h)
print(f'index.html: {len(h)//1024} KB | temporadas {seasons} | {len(e)} linhas de elenco | {len(m)} jogos | {len(ph)} fotos')
