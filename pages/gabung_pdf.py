import streamlit as st
import importlib.util
import os
import sys
from components.utils import include_navbar,load_css,include_sidebar

# ========================
# KONFIGURASI HALAMAN
# ========================
st.set_page_config(
    page_title="Gabung Pdf",
    page_icon="📎",
    layout="centered",
)



# ========================
# LOAD CSS EKSTERNAL
# ========================
load_css()

# ========================
# NAVBAR GLOBAL
# ========================
# include_navbar()

include_sidebar()

# ========================
# KONTEN HALAMAN
# ========================
st.markdown("## 📎 Gabung PDF")
st.info("Gunakan tombol di bawah untuk menjalankan script `gabung.py`.")

# ========================
# LOKASI SCRIPT
# ========================
base_dir = os.path.dirname(os.path.dirname(__file__))
script_path = os.path.join(base_dir, "gabung.py")

# ========================
# DEBUG INFO
# ========================
with st.expander("⚙️ Debug Info"):
    st.write("Python executable:", sys.executable)
    st.write("Current working dir:", os.getcwd())
    st.write("Script path:", script_path)

# ========================
# TOMBOL JALANKAN
# ========================
if not os.path.exists(script_path):
    st.error("❌ File 'gabung.py' tidak ditemukan di folder utama!")
else:
    if st.button("🚀 Jalankan Document Contract Checker"):
        status_placeholder = st.empty()
        status_placeholder.info("Menjalankan script gabung.py...")

        try:
            # Load gabung.py
            spec = importlib.util.spec_from_file_location("gabung", script_path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)

            # Jalankan main() secara blocking
            if hasattr(module, "main"):
                module.main()

            status_placeholder.success("✅ Script gabung.py selesai dijalankan!")
        except Exception as e:
            status_placeholder.error(f"❌ Gagal menjalankan gabung.py: {e}")

# ========================
# FOOTER
# ========================
st.markdown("""
<hr style='margin-top:40px;'>
<div style='text-align:center; color:#777; font-size:0.9rem;'>
    Dibuat dengan ❤️ menggunakan <b>Python</b> & <b>Streamlit</b>
</div>
""", unsafe_allow_html=True)
