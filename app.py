"""Aplicativo Streamlit para publicar o Painel Palmeiras."""
from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

BASE = Path(__file__).resolve().parent
st.set_page_config(page_title="Painel Palmeiras | Estatísticas", page_icon="⚽", layout="wide", initial_sidebar_state="collapsed")

# O index.html já é gerado pelo build.py e traz os dados e fotos incorporados.
# Não é necessário reconstruí-lo a cada acesso ao aplicativo.
html_path = BASE / "index.html"
if not html_path.exists():
    st.error("Arquivo index.html não encontrado. Execute 'python build.py' antes de publicar.")
    st.stop()

st.markdown("""<style>
.block-container {padding: 0 !important; max-width: 100% !important;}
[data-testid="stHeader"], [data-testid="stToolbar"], footer {display: none;}
iframe {border: 0 !important;}
</style>""", unsafe_allow_html=True)
components.html(html_path.read_text(encoding="utf-8"), height=1100, scrolling=True)
