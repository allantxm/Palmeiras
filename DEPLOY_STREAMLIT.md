# Publicar no Streamlit Community Cloud

1. Envie para o GitHub **todos os arquivos desta pasta**, incluindo `app.py`, `requirements.txt`, `index.html`, `tpl.html`, `build.py`, `stadium.js`, a planilha, o escudo e a pasta `fotos/`.
2. No Streamlit Community Cloud, configure o **Main file path** como `app.py` se os arquivos estão na raiz do repositório, ou `palmeiras-painel/app.py` se mantiver essa subpasta.
3. Em **Advanced settings**, se disponível, prefira Python 3.12 ou 3.13. O projeto também informa dependências com suporte a versões atuais.
4. Clique em Deploy/Reboot app. Se a implantação atual estiver apontando para `build.py`, altere o arquivo principal para `app.py` nas configurações (ou crie um novo deploy).

## Atualizar dados

Após editar `Palmeiras_Base_Dados_Completa.xlsx`, execute localmente `python build.py`, confirme que `index.html` foi atualizado, e envie **a planilha e o index.html** ao GitHub. Assim o Streamlit mostrará os novos dados sem reconstruir toda vez.

## Por que houve o erro?

O `build.py` usa `pandas.read_excel`, que requer o pacote `openpyxl` para ler arquivos `.xlsx`. O projeto original não tinha `requirements.txt`. Além disso, `build.py` é um gerador de HTML, não um programa de interface Streamlit.
