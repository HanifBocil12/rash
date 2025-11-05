import streamlit as st
import os
from components.utils import include_sidebar, load_css

load_css()
include_sidebar()

st.title("⬇️ Download Perlengkapan")

# Cari path absolut berdasarkan environment (Windows / Linux)
base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, "static", "zip.rar")
file_name = "web.rar"

# Pastikan file ada
if not os.path.exists(file_path):
    st.error(f"❌ File tidak ditemukan di: {file_path}")
else:
    # Baca file sebagai biner
    with open(file_path, "rb") as f:
        file_data = f.read()

    # Tombol download
    st.download_button(
        label="💾 Download ZIP",
        data=file_data,
        file_name=file_name,
        mime="application/x-rar-compressed"
    )
