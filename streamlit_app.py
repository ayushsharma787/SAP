"""Proactive Risk Sentinel — Streamlit host.

Embeds the self-contained SAP Fiori Horizon prototype (risk_sentinel.html)
in a full-bleed iframe so it presents like a native SAP BTP application.
"""
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="Proactive Risk Sentinel",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Strip Streamlit chrome so only the SAP Fiori app shows (presentation mode).
st.markdown(
    """
    <style>
      #MainMenu, header[data-testid="stHeader"], footer {visibility: hidden; height: 0;}
      [data-testid="stToolbar"], [data-testid="stDecoration"], [data-testid="stStatusWidget"] {display: none;}
      .block-container {padding: 0 !important; max-width: 100% !important;}
      [data-testid="stAppViewContainer"] {background: #F7F7F7;}
      [data-testid="stMainBlockContainer"] {padding: 0 !important;}
      .stApp {background: #F7F7F7;}
      iframe {border: none !important;}
    </style>
    """,
    unsafe_allow_html=True,
)

HTML_PATH = Path(__file__).parent / "risk_sentinel.html"
html = HTML_PATH.read_text(encoding="utf-8")

# Fixed app-window height; the SAP shell bar + tab bar stay pinned and the
# content area scrolls internally, exactly like a real Fiori app.
components.html(html, height=900, scrolling=False)
