# ==============================================
# pdf_excel_batal.py — Streamlit Controller
# ==============================================
import streamlit as st
import requests
from components.utils import include_sidebar, load_css

# ========================
# KONFIGURASI HALAMAN
# ========================
st.set_page_config(
    page_title="PDF & Excel Batal",
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
# BAGIAN 1 — PDF BATAL
# ========================
st.markdown("### 📕 Langkah 1 — Jalankan PDF Batal")

pdf_start_row = st.number_input(
    "Masukkan baris mulai untuk PDF Batal (biarkan 0 untuk otomatis):",
    min_value=0,
    value=0,
    step=1
)

if st.button("🚀 Jalankan PDF Batal via Agent"):
    st.info("Mengirim perintah ke Railway untuk menjalankan PDF Batal...")
    try:
        payload = {"task": "batal", "start_row": int(pdf_start_row)}
        response = requests.post(f"{api_url}/trigger", json=payload, timeout=10)
        if not response.text.strip():
            st.error("❌ Response kosong dari Railway server.")
        else:
            data = response.json()
            if data.get("status") == "success":
                st.success(f"✅ PDF Batal berhasil dikirim ke Railway agent! (mulai dari baris {pdf_start_row or 'otomatis'})")
            else:
                st.error(f"❌ Gagal kirim: {data.get('message', 'Tidak ada detail error')}")
    except requests.exceptions.RequestException as e:
        st.error(f"❌ Gagal menghubungi Railway: {e}")

# ========================
# BAGIAN 2 — EXCEL BATAL
# ========================
st.markdown("### 📊 Langkah 2 — Jalankan Excel Batal (batal_excel.py)")

excel_start_row = st.number_input(
    "Masukkan baris mulai untuk Excel Batal (biarkan 0 untuk otomatis lanjut):",
    min_value=0,
    value=0,
    step=1
)

if st.button("▶️ Jalankan Excel Batal via Agent"):
    st.info("Mengirim perintah ke Railway untuk menjalankan Excel Batal...")
    try:
        payload = {"task": "batal_excel", "start_row": int(excel_start_row)}
        response = requests.post(f"{api_url}/trigger", json=payload, timeout=10)
        if not response.text.strip():
            st.error("❌ Response kosong dari Railway server.")
        else:
            data = response.json()
            if data.get("status") == "success":
                st.success(f"✅ Excel Batal berhasil dikirim ke Railway agent! (mulai dari baris {excel_start_row or 'otomatis'})")
            else:
                st.error(f"❌ Gagal kirim: {data.get('message', 'Tidak ada detail error')}")
    except requests.exceptions.RequestException as e:
        st.error(f"❌ Gagal menghubungi Railway: {e}")

# ========================
# BAGIAN 3 — SEARCH BATAL
# ========================
st.markdown("### 🔍 Langkah 3 — Jalankan Search Batal (search_batal.py)")

if st.button("🔎 Jalankan Search Batal via Agent"):
    st.info("Mengirim perintah ke Railway untuk menjalankan Search Batal...")
    try:
        payload = {"task": "search_batal"}
        response = requests.post(f"{api_url}/trigger", json=payload, timeout=10)
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
