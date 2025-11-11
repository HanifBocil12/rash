import streamlit as st
import streamlit.components.v1 as components

# Set page config
st.set_page_config(
    page_title="Login",
    page_icon="🔒",
    layout="wide"
)

# Custom CSS for styling the card and overall layout
st.markdown("""
<style>
    /* Sidebar styling */
    .css-1d391kg {
        background-color: #f0f2f6 !important;
    }
    
    /* Card styling */
    .login-card {
        max-width: 450px;
        margin: 50px auto;
        padding: 30px;
        border-radius: 12px;
        background-color: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        border: 1px solid #e0e0e0;
    }
    
    .login-title {
        text-align: center;
        font-size: 2.2em;
        font-weight: bold;
        color: #222;
        margin-bottom: 25px;
    }
    
    .stTextInput > div > div > input {
        border-radius: 8px;
        padding: 12px;
        font-size: 16px;
        border: 1px solid #ddd;
        background-color: #f5f5f5;
        transition: border-color 0.3s;
    }
    
    .stTextInput > div > div > input:focus {
        border-color: #ff7733;
        box-shadow: 0 0 0 2px rgba(255, 119, 51, 0.2);
    }
    
    .stButton > button {
        width: 100%;
        border-radius: 8px;
        padding: 12px;
        font-size: 16px;
        font-weight: bold;
        background-color: #ff7733;
        color: white;
        border: none;
        transition: background-color 0.3s;
        margin-top: 10px;
    }
    
    .stButton > button:hover {
        background-color: #ff6622;
    }
    
    .forgot-password {
        text-align: center;
        margin: 15px 0;
    }
    
    .forgot-password a {
        color: #1a73e8;
        text-decoration: underline;
        font-size: 14px;
    }
    
    .signup-link {
        text-align: center;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #eee;
    }
    
    .signup-link a {
        color: #1a73e8;
        text-decoration: underline;
        font-weight: 500;
    }
</style>
""", unsafe_allow_html=True)

# Sidebar menu
with st.sidebar:
    st.write("Menu")
    st.page_link("pages/home.py", label="Home", icon="🏠")
    st.page_link("pages/document_batal.py", label="Document Batal", icon="📄")
    st.page_link("pages/document_contract.py", label="Document Contract", icon="📑")
    st.page_link("pages/download_pdf.py", label="Download PDF", icon="⬇️")
    st.page_link("pages/gabung_pdf.py", label="Gabung PDF", icon="📎")
    st.page_link("pages/login.py", label="Login", icon="🔑", use_container_width=True)
    st.page_link("pages/perlengkapan.py", label="Perlengkapan", icon="🛠️")

# Main content - Login Card
st.markdown('<div class="login-card">', unsafe_allow_html=True)
st.markdown('<div class="login-title">Log In</div>', unsafe_allow_html=True)

# Email input
email = st.text_input("Enter your email", key="email")

# Password input
password = st.text_input("Password", type="password", key="password")

# Forgot password link
st.markdown('<div class="forgot-password"><a href="#">Forgot password</a></div>', unsafe_allow_html=True)

# Login button
if st.button("Log In"):
    if not email or not password:
        st.error("Please enter both email and password")
    else:
        # Simulate successful login
        st.success(f"Welcome back, {email.split('@')[0]}!")
        st.balloons()

# Sign up link
st.markdown('<div class="signup-link">Don\'t have an account? <a href="#">Sign Up</a></div>', unsafe_allow_html=True)

st.markdown('</div>', unsafe_allow_html=True)

# Footer
st.markdown("---")
st.markdown("<small>© 2025 Your Company. All rights reserved.</small>", unsafe_allow_html=True)