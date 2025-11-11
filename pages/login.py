import streamlit as st
import streamlit.components.v1 as components

# Set page configuration
st.set_page_config(
    page_title="Login",
    page_icon="🔒",
    layout="centered"
)

# Custom CSS for styling
st.markdown("""
<style>
    .login-container {
        max-width: 400px;
        margin: 50px auto;
        padding: 30px;
        border-radius: 10px;
        background-color: #ffffff;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .login-title {
        text-align: center;
        font-size: 2.5em;
        font-weight: bold;
        color: #222;
        margin-bottom: 30px;
    }
    
    .stTextInput > div > div > input {
        border-radius: 10px;
        padding: 12px;
        font-size: 16px;
        border: 1px solid #ddd;
        background-color: #f0f0f0;
    }
    
    .stTextInput > div > div > input:focus {
        border-color: #ff7733;
        box-shadow: 0 0 0 2px rgba(255, 119, 51, 0.2);
    }
    
    .stButton > button {
        width: 100%;
        border-radius: 10px;
        padding: 12px;
        font-size: 18px;
        font-weight: bold;
        background-color: #ff7733;
        color: white;
        border: none;
        transition: background-color 0.3s;
    }
    
    .stButton > button:hover {
        background-color: #ff6622;
    }
    
    .forgot-password {
        text-align: center;
        margin-top: 15px;
    }
    
    .forgot-password a {
        color: #1a73e8;
        text-decoration: underline;
        font-size: 16px;
    }
    
    .forgot-password a:hover {
        color: #1557b0;
    }
</style>
""", unsafe_allow_html=True)

# Create login container
st.markdown('<div class="login-container">', unsafe_allow_html=True)
st.markdown('<div class="login-title">Log In</div>', unsafe_allow_html=True)

# Email input
email = st.text_input("Enter your email", key="email")

# Password input with toggle visibility
password = st.text_input("Password", type="password", key="password")

# Forgot password link
st.markdown('<div class="forgot-password"><a href="#">Forgot password</a></div>', unsafe_allow_html=True)

# Login button
if st.button("Log In"):
    if not email or not password:
        st.error("Please enter both email and password")
    else:
        # Here you would typically validate credentials
        # For demo purposes, we'll just show a success message
        st.success(f"Welcome back, {email.split('@')[0]}!")
        
        # You can add your actual authentication logic here
        # Example: check_credentials(email, password)
        
        # For demonstration, let's simulate a successful login
        st.balloons()

# Optional: Add a "Don't have an account?" link
st.markdown("---")
st.markdown('<div style="text-align: center;">Don\'t have an account? <a href="#" style="color: #1a73e8; text-decoration: underline;">Sign Up</a></div>', unsafe_allow_html=True)

st.markdown('</div>', unsafe_allow_html=True)

# Add some footer information
st.markdown("---")
st.markdown("<small>© 2025 Your Company. All rights reserved.</small>", unsafe_allow_html=True)