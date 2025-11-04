from win32com.client import Dispatch
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

# ==========================
# Ambil data visible dari Excel (yang difilter)
# ==========================
def ambil_visible_status_excel(kolom_status=14):
    """Ambil baris visible dan status dari Excel."""
    excel = Dispatch("Excel.Application")
    wb = excel.ActiveWorkbook
    ws = excel.ActiveSheet
    data = []

    for row in ws.UsedRange.Rows:
        if not row.Hidden:
            status = ws.Cells(row.Row, kolom_status).Value
            if status:
                data.append((row.Row, status))
    print(f"📊 Terbaca {len(data)} baris visible dari Excel.")
    return data

# ==========================
# Update Google Sheets
# ==========================
def update_google_sheets(data):
    """Update Google Sheets sesuai baris dan kolom dari Excel."""
    options = Options()
    options.debugger_address = "localhost:9222"
    driver = webdriver.Chrome(options=options)

    print("✅ Terhubung ke Chrome aktif (9222).")
    input("➡️ Buka Google Sheets (yang akan di-update), lalu tekan ENTER...")

    for row, status in data:
        cell_ref = f"N{row}"  # kolom N di Google Sheets (sama seperti Excel)
        print(f"\n🔁 Memperbarui cell {cell_ref} → '{status}'")

        try:
            # klik name box
            name_box = driver.find_element(By.CSS_SELECTOR, "input#t-name-box")
            name_box.click()
            name_box.clear()
            name_box.send_keys(cell_ref)
            name_box.send_keys(Keys.ENTER)
            time.sleep(0.8)

            # edit isi cell
            cell_input = driver.find_element(By.CSS_SELECTOR, "div.cell-input")
            cell_input.click()
            cell_input.send_keys(Keys.CONTROL, "a")
            cell_input.send_keys(status)
            cell_input.send_keys(Keys.ENTER)
            print(f"✅ {cell_ref} berhasil diubah jadi '{status}'.")

        except Exception as e:
            print(f"⚠️ Gagal ubah {cell_ref}: {e}")
            continue

    print("\n🏁 Semua status berhasil dikirim ke Google Sheets!")

# ==========================
# MAIN
# ==========================
def main():
    data = ambil_visible_status_excel(kolom_status=14)  # kolom N
    update_google_sheets(data)

if __name__ == "__main__":
    main()
