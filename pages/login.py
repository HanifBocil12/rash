import streamlit as st
from streamlit.components.v1 import html

st.set_page_config(page_title="Login", layout="centered")

# CSS styling for login card
css = """
<style>
    .login-card {
        max-width: 450px;
        margin: 50px auto;
        padding: 30px;
        border-radius: 12px;
        background-color: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        border: 1px solid #e0e0e0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .login-title {
        text-align: center;
        font-size: 2.2em;
        font-weight: bold;
        color: #222;
        margin-bottom: 25px;
    }
    
    .input-group {
        margin-bottom: 20px;
    }
    
    .input-label {
        display: block;
        margin-bottom: 5px;
        font-size: 14px;
        color: #555;
    }
    
    .input-field {
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #ddd;
        background-color: #f5f5f5;
        font-size: 16px;
        box-sizing: border-box;
    }
    
    .input-field:focus {
        outline: none;
        border-color: #ff7733;
        box-shadow: 0 0 0 2px rgba(255, 119, 51, 0.2);
    }
    
    .password-container {
        position: relative;
    }
    
    .toggle-password {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        color: #888;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 4px;
    }
    
    .toggle-password:hover {
        background-color: #f0f0f0;
    }
    
    .toggle-password svg {
        width: 16px;
        height: 16px;
        stroke: #666;
        fill: none;
        transition: stroke 0.2s;
    }
    
    .toggle-password:hover svg {
        stroke: #333;
    }
    
    .login-btn {
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        background-color: #ff7733;
        color: white;
        border: none;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    .login-btn:hover {
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
"""

# HTML + JS Form
html_content = css + """
<div class="login-card">
    <div class="login-title">Log In</div>
    
    <form id="loginForm">
        <div class="input-group">
            <label class="input-label">Enter your email</label>
            <input type="email" id="email" class="input-field" placeholder="Enter your email" required>
        </div>
        
        <div class="input-group">
            <label class="input-label">Password</label>
            <div class="password-container">
                <input type="password" id="password" class="input-field" placeholder="Password" required>
                <span class="toggle-password" onclick="togglePassword()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </span>
            </div>
        </div>
        
        <div class="forgot-password">
            <a href="#">Forgot password</a>
        </div>
        
        <button type="submit" class="login-btn">Log In</button>
    </form>
    
    <div class="signup-link">
        Don't have an account? <a href="#">Sign Up</a>
    </div>
</div>

<script>
function togglePassword() {
    var pf = document.getElementById("password");
    var toggleBtn = document.querySelector(".toggle-password svg");
    
    if (pf.type === "password") {
        pf.type = "text";
        // Ubah ikon jadi "mata tertutup"
        toggleBtn.outerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    } else {
        pf.type = "password";
        // Kembalikan ke ikon "mata terbuka"
        toggleBtn.outerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}
</script>
"""

html(html_content, height=600)

st.markdown("---")
st.markdown("<small>© 2025 Your Company. All rights reserved.</small>", unsafe_allow_html=True)