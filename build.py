"""Gera o index.html do Painel Palmeiras a partir da planilha, do template e das fotos.

Uso:  python build.py [planilha.xlsx]      (requer pandas, openpyxl e pillow)

Planilha padrão: Palmeiras_Base_Projeto_Integrada_2026.xlsx (ou a primeira Palmeiras_Base*.xlsx da pasta).

Novidades da base integrada 2026
  - "Detalhes Partidas 2026": autor, minuto e tipo dos gols, cartões e assistências de cada jogo.
  - "Gols Confirmados 2026": correção linha a linha dos gols de 4 jogos (prevalece sobre o texto da outra aba).
  - "Notas integração 2026": avisos de qualidade, exibidos no painel.
O script transforma esses textos livres em eventos estruturados (ordem cronológica) e CONFERE cada
jogo contra o placar da aba Resultados; jogos que não fecham caem no modo "ilustrativo" do 3D.

Fotos: coloque em fotos/ um arquivo por jogador, nomeado com o ID da planilha (ex.: PAL024.webp).
"""
import base64, glob, io, json, os, re, sys, unicodedata
import pandas as pd
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
os.chdir(AQUI)
ARQ = sys.argv[1] if len(sys.argv) > 1 else 'Palmeiras_Base_Projeto_Integrada_2026.xlsx'
if not os.path.exists(ARQ):
    c = sorted(glob.glob('Palmeiras_Base*.xlsx'))
    if not c:
        sys.exit('Planilha não encontrada (Palmeiras_Base*.xlsx).')
    ARQ = c[-1]
X = pd.read_excel(ARQ, sheet_name=None)
AVISOS = []


def n(v):
    """Converte para int/float/None (célula vazia = dado ausente, nunca zero)."""
    if v is None or pd.isna(v):
        return None
    return int(v) if float(v) == int(float(v)) else float(v)


def s(v):
    return None if v is None or pd.isna(v) else str(v)


def dia(v):
    return None if pd.isna(v) else v.strftime('%Y-%m-%d')


def nz(t):
    return ''.join(c for c in unicodedata.normalize('NFD', str(t).lower()) if unicodedata.category(c) != 'Mn').strip()


# ---------- jogadores (cadastro) ----------
J = X['Jogadores']
pl = {r['ID Jogador']: [r['Nome'], s(r['Posição']), s(r['Nacionalidade']), n(r['Altura (m)']), n(r['Peso (kg)'])]
      for _, r in J.iterrows()}
POR_NOME = {nz(v[0]): k for k, v in pl.items()}
# apelidos usados na aba de detalhes -> nome do cadastro
APELIDO = {'flaco lopez': 'Jose Manuel Lopez', 'allan': 'Allan Elias', 'luighi': 'Luighi Hanri',
           'murilo cerqueira': 'Murilo'}


def jogador(nome):
    """(nome canônico, ID) de um jogador do Palmeiras citado nos textos; ID None se não achar."""
    k = nz(nome)
    pid = POR_NOME.get(k) or POR_NOME.get(nz(APELIDO.get(k, '')))
    return (pl[pid][0], pid) if pid else (nome, None)


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


R = X['Resultados'].sort_values('Data')
m = []
for _, a in R.iterrows():
    m.append([dia(a.Data), a['Competição'], a.Visitante if a['Local Palmeiras'] == 'Casa' else a.Mandante,
              a['Local Palmeiras'], int(a.GP), int(a.GC), a['Situação'], s(a.Fase), pen(a), int(a.Temporada), a['ID']])
f = [[dia(a.Data), a['Competição'], a.Visitante if a['Local Palmeiras'] == 'Casa' else a.Mandante,
      a['Local Palmeiras'], s(a.Hora), int(a.Temporada)] for _, a in X['Calendário'].iterrows()]
PLACAR = {a['ID']: (int(a.GP), int(a.GC)) for _, a in R.iterrows()}


# ---------- detalhes das partidas: gols, cartões, assistências ----------
def split_top(t):
    """Divide em , ou ; ignorando o que está entre parênteses."""
    out, buf, d = [], '', 0
    for ch in str(t):
        d += (ch == '(') - (ch == ')')
        if ch in ',;' and d <= 0:
            out.append(buf)
            buf = ''
        else:
            buf += ch
    out.append(buf)
    return [x.strip() for x in out if x.strip()]


def lado(tag):
    return 'P' if tag == 'PAL' else 'O'


def outro(l):
    return 'O' if l == 'P' else 'P'


TAGRE = re.compile(r'^(.*?)\s*\(\s*([A-Z]{2,4})\s*(?:-\s*([^)]*))?\)\s*$')


def autores(txt):
    """[(nome, lado do AUTOR, quantidade, contra?)] na ordem do texto."""
    r = []
    for tok in split_top(txt):
        q = TAGRE.match(tok)
        if not q:
            continue
        nota = q[3] or ''
        c = re.search(r'(\d+)\s*(?:x|gols?)\b', nota)
        r.append((q[1].strip(), lado(q[2]), int(c[1]) if c else 1, 'contra' in nota.lower()))
    return r


def chave(mn, ex):
    return int(mn) + (int(ex) / 100 if ex else 0)


def rotulo(mn, ex):
    return f"{mn}+{ex}" if ex else str(mn)


def minutos(txt):
    """[(rotulo, chave, lado|None)] na ordem do texto. Lado vem da etiqueta do grupo (beneficiado)."""
    t = re.sub(r"\(\s*\d+'?\s*2ºT\s*\)|\(\s*ou [^)]*\)", '', str(txt))
    out = []
    for g in t.split(';'):
        ms = re.findall(r"(\d+)(?:\+(\d+))?'", g)
        tg = re.findall(r'\(\s*([A-Z]{2,4})\s*\)', g)
        for mn, ex in ms:
            out.append((rotulo(mn, ex), chave(mn, ex), lado(tg[-1]) if tg else None))
    return out


def tipos(tipo_txt, nome, unico):
    """Tipo do gol a partir do texto livre: N normal, P pênalti, F falta, H cabeça."""
    t = str(tipo_txt)
    toks = [w for w in nz(nome).replace('.', ' ').split() if len(w) > 2]
    for seg in re.split(r';', t):
        mk = re.match(r'\s*(p[eê]nalti|falta)\s*(?:\((.*)\))?', nz(seg))
        if not mk:
            continue
        k = 'P' if mk[1].startswith('p') else 'F'
        nomes = mk[2] or ''
        if (not nomes and unico) or any(w in nomes for w in toks):
            return k
    if unico and 'cabeca' in nz(t):
        return 'H'
    return 'N'


def gols_texto(row, gp, gc):
    """Eventos [rotulo, chave, lado_beneficiado, autor, tipo, pid] + flag de pareamento inferido."""
    A, Mn = autores(row['Autor dos gols']), minutos(row['Minuto dos gols'])
    lista = []
    for nome, ld, q, ct in A:
        for _ in range(q):
            lista.append((nome, ld, ct, outro(ld) if ct else ld))
    # autores agrupados ("2x") com outros autores do mesmo time: a ordem entre eles vem da lista da planilha
    inferido = any(q > 1 and len({x[0] for x in lista if x[3] == lado_} ) > 1
                   for _, ld_, q, ct_ in A for lado_ in [outro(ld_) if ct_ else ld_])
    if len(lista) != len(Mn):
        return None, f'{len(lista)} autores x {len(Mn)} minutos'
    com, sem = [x for x in Mn if x[2]], [x for x in Mn if not x[2]]
    pares = []
    if com and sem:
        return None, 'minutos parcialmente sem etiqueta de time'
    if sem:                                   # sem etiquetas: pareia na ordem do texto
        pares = list(zip(lista, Mn))
    else:                                     # com etiquetas: pareia por lado beneficiado
        for ld in 'PO':
            a, b = [x for x in lista if x[3] == ld], [x for x in Mn if x[2] == ld]
            if len(a) != len(b):
                return None, f'lado {ld}: {len(a)} autores x {len(b)} minutos'
            pares += list(zip(a, b))
    unico = len(lista) == 1
    ev = []
    for (nome, ld, ct, ben), (rt, ch, _) in pares:
        if ld == 'P':
            nome, pid = jogador(nome)
        else:
            pid = None
        ev.append([rt, round(ch, 2), ben, nome, 'C' if ct else tipos(row['Tipo de gol'], nome, unico), pid])
    ev.sort(key=lambda x: x[1])
    return ev, inferido


def gols_confirmados(df):
    """Aba 'Gols Confirmados 2026': prevalece sobre o texto da aba de detalhes."""
    out = {}
    for _, r in df.iterrows():
        mm = re.match(r"(\d+)(?:\+(\d+))?'?", str(r['Minuto do gol']).strip())
        ld = lado('PAL' if r['Equipe do autor'] == 'Palmeiras' else 'X')
        tp = nz(r['Tipo'])
        contra = 'contra' in tp
        ben = outro(ld) if contra else ld
        nome, pid = jogador(r['Autor / jogador']) if ld == 'P' else (r['Autor / jogador'], None)
        ex = mm[2]
        out.setdefault(r['ID partida'], []).append(
            [rotulo(mm[1], ex), round(chave(mm[1], ex), 2), ben, nome,
             'C' if contra else 'P' if 'penalti' in tp else 'N', pid])
    for v in out.values():
        v.sort(key=lambda x: x[1])
    return out


VAZIO = re.compile(r'^(-|nenhum)$', re.I)


def itens(txt):
    """Cartões/assistências: ([[nome, minuto|None, lado, nota|None, qtd]], texto não estruturado | None).
    '-' e 'Nenhum' = nada a registrar; textos como 'Não informado' são mantidos como observação."""
    if txt is None or pd.isna(txt) or VAZIO.match(str(txt).strip()):
        return [], None
    out, resto = [], []
    for tok in split_top(re.sub(r"\(\s*\d+'?\s*2ºT\s*\)", '', str(txt))):
        q = TAGRE.match(tok)
        if not q:
            resto.append(tok)
            continue
        nome, nota = q[1].strip(), (q[3] or '').strip()
        mn = None
        mm = re.match(r"^(.*?)\s+(\d+(?:\+\d+)?)'$", nome)
        if mm:
            nome, mn = mm[1], mm[2]
        c = re.search(r'(\d+)x', nota)
        nota = re.sub(r'\d+x', '', nota).strip(' -') or None
        if q[2] == 'PAL':
            nome = jogador(nome)[0]
        out.append([nome, mn, lado(q[2]), nota, int(c[1]) if c else 1])
    return out, ('; '.join(x for x in resto if not VAZIO.match(x)) or None)


def status(t):
    t = str(t)
    return ('c', None) if t.strip() == 'Completo' else ('p', t)


DT = {}
D = X['Detalhes Partidas 2026']
CONF = gols_confirmados(X['Gols Confirmados 2026'])
for _, r in D.iterrows():
    mid = r['ID partida']
    gp, gc = PLACAR.get(mid, (None, None))
    if gp is None:
        AVISOS.append(f'{mid}: sem linha em Resultados')
        continue
    if mid in CONF:
        ev, inf, fonte = CONF[mid], False, 'Gols confirmados (texto/imagem ESPN)'
    elif re.match(r'^nenhum', str(r['Autor dos gols']), re.I):
        ev, inf, fonte = [], False, None
    else:
        ev, inf = gols_texto(r, gp, gc)
        fonte = None
        if ev is None:
            AVISOS.append(f'{mid}: não foi possível ordenar os gols ({inf})')
            inf = False
    d = {}
    if ev is not None:
        pg, og = sum(1 for x in ev if x[2] == 'P'), sum(1 for x in ev if x[2] == 'O')
        if (pg, og) != (gp, gc):
            AVISOS.append(f'{mid}: gols detalhados {pg}x{og} diferem do placar {gp}x{gc} — usando modo ilustrativo')
        else:
            d['g'] = ev
    if inf:
        d['i'] = 1
    if fonte:
        d['f'] = fonte
    for chave_, col in (('ca', 'Cartões amarelos'), ('cv', 'Cartões vermelhos'), ('as', 'Assistências')):
        lst, obs = itens(r[col])
        if lst: d[chave_] = lst
        if obs: d[chave_ + 'n'] = obs
    st, stn = status(r['Status Coleta'])
    d['st'] = st
    if stn: d['sn'] = stn
    DT[mid] = d

# ---------- notas da integração e metadados ----------
ini = X['Início']
upd = re.search(r'\d{2}/\d{2}/\d{4}', str(ini[ini.iloc[:, 0] == 'Atualização'].iloc[0, 1]))
notas = [[str(a), str(b)] for a, b in X['Notas integração 2026'].values
         if not re.match(r'^(Partidas|Registros)', str(a))]
meta = dict(upd=upd[0] if upd else '', notas=notas)

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
        AVISOS.append(f'foto sem jogador correspondente: {p}')

im = Image.open('escudo-palmeiras.png').convert('RGBA').resize((260, 260), Image.LANCZOS)   # PNG com fundo transparente
b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
logo = 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()

data = dict(seasons=seasons, pl=pl, e=e, m=m, f=f, rec=rec, seq=seq, pub=pub, dt=DT, meta=meta)
tpl = open('tpl.html', encoding='utf-8').read()
h = (tpl.replace('__DATA__', json.dumps(data, ensure_ascii=False, separators=(',', ':')))
        .replace('__PHOTOS__', json.dumps(ph, separators=(',', ':')))
        .replace('__LOGO__', logo)
        .replace('__STADIUM__', open('stadium.js', encoding='utf-8').read()))
open('index.html', 'w', encoding='utf-8').write(h)

# ---------- relatório ----------
com_g = sum(1 for v in DT.values() if 'g' in v)
tot = sum(len(v.get('g', [])) for v in DT.values())
ident = sum(1 for v in DT.values() for g in v.get('g', []) if g[5])
print(f'index.html: {len(h)//1024} KB | planilha {ARQ}')
print(f'temporadas {seasons} | {len(e)} linhas de elenco | {len(m)} jogos | {len(ph)} fotos')
print(f'detalhes: {len(DT)} jogos | {com_g} com gols ordenados ({tot} gols; {ident} de jogadores do elenco) | '
      f'{sum(1 for v in DT.values() if v.get("i"))} com pareamento autor×minuto inferido pela ordem da lista')
for a in AVISOS:
    print('AVISO:', a)
