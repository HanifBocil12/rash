import streamlit as st
import importlib.util
import os
import sys
from components.utils import include_sidebar, load_css

# ========================
# KONFIGURASI HALAMAN
# ========================
st.set_page_config(
    page_title="Document Contract",
    page_icon="📄",
    layout="centered",
)

# ========================
# LOAD CSS EKSTERNAL
# ========================
load_css()

# ========================
# SIDEBAR GLOBAL
# ========================
include_sidebar()

# ========================
# KONTEN HALAMAN
# ========================
st.markdown("## 📄 Document Contract")
st.info("Ikuti langkah di bawah ini secara berurutan untuk menjalankan pemeriksaan dokumen.")

# ========================
# PATH DASAR
# ========================
base_dir = os.path.dirname(os.path.dirname(__file__))
xls_path = os.path.join(base_dir, "xls.py")
sheet_path = os.path.join(base_dir, "sheet.py")

# ========================
# FUNGSI JALANKAN SCRIPT
# ========================
def jalankan_script(script_path, nama_script):
    """Fungsi untuk load dan eksekusi file Python eksternal"""
    if not os.path.exists(script_path):
        st.error(f"❌ File '{os.path.basename(script_path)}' tidak ditemukan!")
        return False

    try:
        spec = importlib.util.spec_from_file_location(nama_script, script_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        if hasattr(module, "main"):
            module.main()
            st.success(f"✅ Script {os.path.basename(script_path)} selesai dijalankan!")
        else:
            st.warning(f"⚠️ Script {os.path.basename(script_path)} tidak memiliki fungsi main().")

        return True
    except Exception as e:
        st.error(f"❌ Gagal menjalankan {nama_script}: {e}")
        return False


# ========================
# LANGKAH 1: XLS
# ========================
st.markdown("### 🧩 Langkah 1 — Jalankan Excel Checker (`xls.py`)")
if st.button("▶️ Jalankan XLS Checker"):
    with st.spinner("Menjalankan xls.py..."):
        jalankan_script(xls_path, "xls")

# ========================
# LANGKAH 2: SHEET
# ========================
st.markdown("### 📊 Langkah 2 — Jalankan Sheet Uploader (`sheet.py`)")
st.caption("Pastikan langkah 1 sudah selesai sebelum menjalankan ini.")

if st.button("🚀 Jalankan Sheet Uploader"):
    with st.spinner("Menjalankan sheet.py..."):
        jalankan_script(sheet_path, "sheet")

# ========================
# DEBUG INFO (Opsional)
# ========================
with st.expander("⚙️ Debug Info"):
    st.write("Python executable:", sys.executable)
    st.write("Current working dir:", os.getcwd())
    st.write("Base dir:", base_dir)
    st.write("XLS path:", xls_path)
    st.write("Sheet path:", sheet_path)

# ========================
# FOOTER
# ========================
st.markdown("""
<hr style='margin-top:40px;'>
<div style='text-align:center; color:#777; font-size:0.9rem;'>
    Dibuat dengan ❤️ menggunakan <b>Python</b> & <b>Streamlit</b>
</div>
""", unsafe_allow_html=True)
