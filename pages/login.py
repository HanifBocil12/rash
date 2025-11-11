import streamlit as st

st.set_page_config(page_title="Login", layout="centered")

st.markdown("""
<style>
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
    }
    .forgot-password {
        text-align: center;
        margin: 15px 0;
    }
    .forgot-password a {
        color: #1a73e8;
        text-decoration: underline;
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

st.markdown('<div class="login-card">', unsafe_allow_html=True)
st.markdown('<div class="login-title">Log In</div>', unsafe_allow_html=True)

email = st.text_input("Enter your email", key="email")
password = st.text_input("Password", type="password", key="password")

st.markdown('<div class="forgot-password"><a href="#">Forgot password</a></div>', unsafe_allow_html=True)

if st.button("Log In"):
    if not email or not password:
        st.error("Please enter both email and password")
    else:
        st.success(f"Welcome back, {email.split('@')[0]}!")
        st.balloons()

st.markdown('<div class="signup-link">Don\'t have an account? <a href="#">Sign Up</a></div>', unsafe_allow_html=True)
st.markdown('</div>', unsafe_allow_html=True)