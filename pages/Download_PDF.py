import streamlit as st
import requests
from components.utils import include_navbar, load_css, include_sidebar

# ========================
# KONFIGURASI HALAMAN
# ========================
st.set_page_config(
    page_title="PDF Selesai",
    page_icon="📋",
    layout="centered",
)

load_css()
include_sidebar()

st.markdown("## ⬇️ Download PDF Otomatis")
st.info("Klik tombol di bawah untuk memberi sinyal ke agent lokal melalui Railway API agar menjalankan `perfecfast.py`.")

# ========================
# INPUT URL API
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
        data = res.json()
        flag = data.get("flag", "UNKNOWN")
        last_task = data.get("last_task", "None")

        if flag == "RUN":
            st.warning(f"⚙️ Agent sedang **berjalan** (`flag = RUN`, task: {last_task})")
        elif flag == "IDLE":
            st.success("✅ Agent **siap menerima perintah** (`flag = IDLE`)")
        else:
            st.info(f"ℹ️ Status agent tidak diketahui: {flag}")
    else:
        st.error(f"❌ Tidak dapat mengambil status agent (HTTP {res.status_code})")
except Exception as e:
    st.error(f"⚠️ Gagal menghubungi Railway API: {e}")

# ========================
# TOMBOL JALANKAN TASK
# ========================
st.markdown("---")
if st.button("🚀 Jalankan Downloader PDF via Agent"):
    st.info("Mengirim sinyal ke Railway untuk menjalankan `perfecfast.py`...")
    try:
        response = requests.post(
            f"{api_url}/trigger",
            json={"task": "perfect"},  # ✅ task yang sesuai dengan SCRIPT_MAP
            timeout=10
        )

        if not response.text.strip():
            st.error("❌ Response kosong dari Railway server.")
        else:
            data = response.json()
            if data.get("status") == "success":
                st.success("✅ Perintah dikirim ke Railway! Agent lokal akan segera menjalankan `perfecfast.py`.")
            elif data.get("status") == "busy":
                st.warning("⚙️ Agent sedang sibuk menjalankan task lain.")
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
