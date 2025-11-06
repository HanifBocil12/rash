import streamlit as st
import requests
from components.utils import include_sidebar, load_css

# ========================
# KONFIGURASI HALAMAN
# ========================
st.set_page_config(
    page_title="PDF Batal",
    page_icon="📋",
    layout="centered",
)

load_css()
include_sidebar()

st.markdown("## ⬇️ PDF & Excel Batal")
st.info("Gunakan tombol di bawah untuk mengirim perintah ke Railway agent agar menjalankan proses otomatis yang diinginkan.")

# ========================
# KONFIGURASI API RAILWAY
# ========================
default_api_url = "https://api-web.up.railway.app"
api_url = st.text_input("Masukkan URL Railway API:", default_api_url)

# ========================
# STATUS AGENT
# ========================
st.markdown("### 🟢 Status Agent")
try:
    res = requests.get(f"{api_url}/state", timeout=5)
    if res.status_code == 200:
        flag = res.json().get("flag", "UNKNOWN")
        if flag == "RUN":
            st.warning("⚙️ Agent sedang **berjalan** (flag = RUN)")
        elif flag == "IDLE":
            st.success("✅ Agent **siap menerima perintah** (flag = IDLE)")
        else:
            st.info(f"ℹ️ Status agent tidak diketahui: {flag}")
    else:
        st.error(f"❌ Tidak dapat mengambil status agent (HTTP {res.status_code})")
except Exception as e:
    st.error(f"⚠️ Gagal menghubungi Railway API: {e}")

# ========================
# AKSI: BAGIAN 1 — PDF BATAL
# ========================
st.markdown("### 📕 Langkah 1 — Jalankan PDF Batal")
if st.button("🚀 Jalankan PDF Batal via Agent"):
    st.info("Mengirim perintah ke Railway untuk menjalankan PDF Batal...")
    try:
        response = requests.post(f"{api_url}/trigger", json={"task": "batal"}, timeout=10)
        if not response.text.strip():
            st.error("❌ Response kosong dari Railway server.")
        else:
            data = response.json()
            if data.get("status") == "success":
                st.success("✅ PDF Batal berhasil dikirim ke Railway agent!")
            else:
                st.error(f"❌ Gagal kirim: {data.get('message', 'Tidak ada detail error')}")
    except requests.exceptions.RequestException as e:
        st.error(f"❌ Gagal menghubungi Railway: {e}")

# ========================
# AKSI: BAGIAN 2 — EXCEL CHECKER
# ========================
st.markdown("### 📊 Langkah 2 — Jalankan Excel Checker (xls.py)")
if st.button("▶️ Jalankan Excel Checker via Agent"):
    st.info("Mengirim perintah ke Railway untuk menjalankan XLS Checker...")
    try:
        response = requests.post(f"{api_url}/trigger", json={"task": "xls"}, timeout=10)
        if not response.text.strip():
            st.error("❌ Response kosong dari Railway server.")
        else:
            data = response.json()
            if data.get("status") == "success":
                st.success("✅ XLS Checker berhasil dikirim ke Railway agent!")
            else:
                st.error(f"❌ Gagal kirim: {data.get('message', 'Tidak ada detail error')}")
    except requests.exceptions.RequestException as e:
        st.error(f"❌ Gagal menghubungi Railway: {e}")

# ========================
# AKSI: BAGIAN 3 — SEARCH BATAL
# ========================
st.markdown("### 🔍 Langkah 3 — Jalankan Search Batal (search_batal.py)")
if st.button("🔎 Jalankan Search Batal via Agent"):
    st.info("Mengirim perintah ke Railway untuk menjalankan Search Batal...")
    try:
        response = requests.post(f"{api_url}/trigger", json={"task": "search_batal"}, timeout=10)
        if not response.text.strip():
            st.error("❌ Response kosong dari Railway server.")
        else:
            data = response.json()
            if data.get("status") == "success":
                st.success("✅ Search Batal berhasil dikirim ke Railway agent!")
            else:
                st.error(f"❌ Gagal kirim: {data.get('message', 'Tidak ada detail error')}")
    except requests.exceptions.RequestException as e:
        st.error(f"❌ Gagal menghubungi Railway: {e}")

# ========================
# FOOTER
# ========================
st.markdown("""
<hr style='margin-top:40px;'>
<div style='text-align:center; color:#777; font-size:0.9rem;'>
    Dibuat dengan ❤️ menggunakan <b>Python</b> & <b>Streamlit</b>
</div>
""", unsafe_allow_html=True)
