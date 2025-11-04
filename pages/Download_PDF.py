# ==============================================
# app_streamlit.py
# ==============================================
# Streamlit interface untuk menjalankan perfecfast.py via agent API
# Ngrok URL sudah langsung diset
# ==============================================

import streamlit as st
import requests
from components.utils import include_navbar, load_css, include_sidebar

# ========================
# KONFIGURASI HALAMAN
# ========================
st.set_page_config(
    page_title="Download Pdf",
    page_icon="📋",
    layout="centered",
)

# ========================
# NAVBAR & CSS
# ========================
load_css()
include_sidebar()

# ========================
# KONTEN HALAMAN
# ========================
st.markdown("## ⬇️ Download PDF")
st.info("Klik tombol di bawah untuk menjalankan script `perfecfast.py` melalui agent di server Anda.")

# ========================
# INPUT API URL (ngrok atau server)
# ========================
default_api_url = "https://luscious-eliseo-unsolemnly.ngrok-free.dev/run"  # URL ngrokmu
api_url = st.text_input(
    "Masukkan URL agent API:",
    default_api_url
)

# ========================
# TOMBOL JALANKAN perfecfast.py via API
# ========================
if st.button("🚀 Jalankan Excel Checker via API"):
    st.info("Mengirim request ke agent...")

    try:
        response = requests.post(api_url, timeout=15)

        # cek jika response kosong
        if not response.text.strip():
            st.error("❌ Response kosong dari agent. Pastikan agent dan Chrome debug aktif di server.")
        else:
            try:
                data = response.json()
                if data.get("status") == "success":
                    st.success("✅ Script berhasil dijalankan oleh agent!")
                else:
                    st.error(f"❌ Gagal dijalankan: {data.get('message', 'Tidak ada detail error')}")
            except Exception:
                st.error(f"❌ Response tidak valid JSON:\n{response.text}")

    except requests.exceptions.RequestException as e:
        st.error(f"❌ Gagal menghubungi agent: {e}")

# ========================
# FOOTER
# ========================
st.markdown("""
<hr style='margin-top:40px;'>
<div style='text-align:center; color:#777; font-size:0.9rem;'>
    Dibuat dengan ❤️ menggunakan <b>Python</b> & <b>Streamlit</b>
</div>
""", unsafe_allow_html=True)
