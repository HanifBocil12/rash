import streamlit as st
import os
from components.utils import include_navbar,load_css,include_sidebar

# ========================
# KONFIGURASI HALAMAN
# ========================
st.set_page_config(
    page_title="Excel Checker Dashboard",
    page_icon="📊",
    layout="centered",
)

# ========================
# LOAD CSS EKSTERNAL
# ========================
load_css()

# ========================
# NAVBAR GLOBAL
# ========================
# include_navbar()  # 👈 dipanggil di sini, setelah CSS dan set_page_config
include_sidebar()
# ========================
# KONTEN HALAMAN HOME
# ========================
st.markdown("<h2>📊 Excel Checker Dashboard</h2>", unsafe_allow_html=True)
st.write("""
Selamat datang di **Excel Checker** — aplikasi berbasis *Streamlit* untuk membantu
mengecek hal-hal yang berhubungan dengan data Inaproc secara otomatis, saya raja ai.

Gunakan menu di bawah untuk berpindah ke halaman:
- 📄 **Document Contract** – menampilkan daftar dan pengecekan dokumen kontrak.  
- 📋 **Daftar Project Inaproc** – menjalankan otomatisasi dan analisis project dari Inaproc.
""")

st.info("Gunakan menu navigasi di atas untuk memulai proses pemeriksaan data.")

# ========================
# FOOTER
# ========================
st.markdown("""
<hr style='margin-top:40px;'>
<div style='text-align:center; color:#777; font-size:0.9rem;'>
    Dibuat dengan ❤️ menggunakan <b>Python</b> & <b>Streamlit</b>
</div>
""", unsafe_allow_html=True)
