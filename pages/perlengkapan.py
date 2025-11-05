import streamlit as st
import os

st.title("⬇️ Download Perlengkapan")

# Path relatif (berdasarkan lokasi file ini)
base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, "static", "zip.rar")

if not os.path.exists(file_path):
    st.error(f"❌ File tidak ditemukan di: {file_path}")
else:
    with open(file_path, "rb") as f:
        file_data = f.read()

    st.download_button(
        label="💾 Download ZIP",
        data=file_data,
        file_name="web.rar",
        mime="application/x-rar-compressed"
    )
