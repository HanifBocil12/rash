import subprocess
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

# Path Chrome dan profil debug
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
debug_profile = r"C:\chrome-debug"

# Start Chrome di background
subprocess.Popen([chrome_path,
                  "--remote-debugging-port=9222",
                  f"--user-data-dir={debug_profile}"])

# Konfigurasi Selenium untuk connect ke Chrome debugging
options = Options()
options.debugger_address = "localhost:9222"

driver = None
for i in range(30):  # retry maksimal 30x (sekitar 30 detik)
    try:
        driver = webdriver.Chrome(options=options)
        print("✅ Chrome siap dan terhubung dengan Selenium")
        break
    except Exception as e:
        print(f"⏳ Menunggu Chrome siap... percobaan {i+1}")
        time.sleep(1)

if driver is None:
    print("❌ Gagal connect ke Chrome debugging. Tutup script.")
    exit(1)

# Sekarang driver siap untuk digunakan
