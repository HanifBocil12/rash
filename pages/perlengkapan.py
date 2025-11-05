import streamlit as st
import os

st.set_page_config(page_title="Download Perlengkapan", page_icon="⬇️", layout="centered")
st.title("⬇️ Download Perlengkapan")

# Path absolut ke file zip.rar
# Base directory /app/pages
base_dir = os.path.dirname(os.path.abspath(__file__))
# Karena file ada di /app/static, kita naik satu level dari pages
root_dir = os.path.dirname(base_dir)
file_path = os.path.join(root_dir, "static", "zip.rar")

st.write("📁 Path file:", file_path)  # Debug, bisa dihapus nanti

# Cek apakah file ada
if not os.path.exists(file_path):
    st.error(f"❌ File tidak ditemukan di: {file_path}")
else:
    with open(file_path, "rb") as f:
        file_data = f.read()

    st.download_button(
        label="💾 Download ZIP",
        data=file_data,
        file_name="web.rar",  # nama file saat di-download
        mime="application/x-rar-compressed"
    )
