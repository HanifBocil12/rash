import streamlit as st
import base64
from components.utils import include_sidebar, load_css

load_css()
include_sidebar()

st.title("⬇️ Download Perlengkapan")

# Path file lokal
file_path = r"C:\raja iblis\zip.rar"
file_name = "web.rar"

# Baca file sebagai biner
with open(file_path, "rb") as f:
    file_data = f.read()

# Buat tombol download
st.download_button(
    label="💾 Download ZIP",
    data=file_data,
    file_name=file_name,
    mime="application/x-rar-compressed"
)
