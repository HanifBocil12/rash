import streamlit as st
import os


def load_css():
    """Memuat file style.css global (untuk navbar + sidebar)."""
    css_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "style.css")
    if os.path.exists(css_path):
        with open(css_path, "r", encoding="utf-8") as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
    else:
        st.warning("⚠️ File style.css tidak ditemukan.")


def include_navbar():
    """Menampilkan navbar di bagian atas halaman."""
    navbar_path = os.path.join(os.path.dirname(__file__), "navbar.html")
    if os.path.exists(navbar_path):
        with open(navbar_path, "r", encoding="utf-8") as f:
            navbar_html = f.read()
            st.markdown(navbar_html, unsafe_allow_html=True)
            # Spacer agar konten tidak tertutup navbar
            st.markdown('<div class="navbar-spacer"></div>', unsafe_allow_html=True)
    else:
        st.warning("⚠️ Navbar file tidak ditemukan.")


def include_sidebar():
    """Menampilkan sidebar custom di sisi kiri halaman."""
    sidebar_path = os.path.join(os.path.dirname(__file__), "sidebar.html")
    if os.path.exists(sidebar_path):
        with open(sidebar_path, "r", encoding="utf-8") as f:
            sidebar_html = f.read()
            st.markdown(sidebar_html, unsafe_allow_html=True)
            # Tidak perlu spacer untuk sidebar (karena fixed di kiri)
    else:
        st.warning("⚠️ Sidebar file tidak ditemukan.")
