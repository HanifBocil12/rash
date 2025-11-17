from win32com.client import Dispatch
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

# ======================================================
# Ambil data visible (terlihat) dari Excel, skip header opsional
# ======================================================
def ambil_data_visible_excel(kolom_input, row_start=2):
    excel = Dispatch("Excel.Application")
    wb = excel.ActiveWorkbook
    ws = excel.ActiveSheet

    kolom_input = kolom_input.strip().replace(",", " ").split()
    kolom_input = [k.upper() for k in kolom_input if k.strip()]
    if not kolom_input:
        print("⚠️ Tidak ada kolom valid yang dimasukkan.")
        return [], []

    print(f"📘 Terhubung ke file: {wb.Name}")
    print(f"📄 Mengambil kolom: {', '.join(kolom_input)}")
    print(f"👁️ Hanya mengambil baris visible mulai dari baris {row_start} di Excel...")

    data = []
    for row in ws.UsedRange.Rows:
        if row.Row < row_start:
            continue
        if row.Hidden:
            continue
        baris_data = []
        for kol in kolom_input:
            try:
                nilai = ws.Range(f"{kol}{row.Row}").Value
            except:
                nilai = ""
            baris_data.append("" if nilai is None else str(nilai))
        data.append(baris_data)

    print(f"✅ Total baris visible terbaca mulai dari baris {row_start}: {len(data)}")
    return data, kolom_input


# ======================================================
# Kirim ke Google Sheets via Selenium
# ======================================================
def update_google_sheets(data, kolom_input, row_start=2):
    if not data:
        print("⚠️ Tidak ada data untuk dikirim ke Google Sheets.")
        return

    # Hubungkan ke Chrome aktif (debug mode)
    options = Options()
    options.debugger_address = "localhost:9222"
    driver = webdriver.Chrome(options=options)
    print("✅ Terhubung ke Chrome debugging aktif (9222).")

    input("➡️ Buka tab Google Sheets yang akan di-update, lalu tekan ENTER...")

    # Hitung posisi kolom awal di Google Sheets
    kolom_awal_excel = kolom_input[0]
    kol_awal_sheet = ord(kolom_awal_excel) - 64  # A=1, B=2, dst
    print(f"📍 Mulai tulis di Google Sheets dari kolom {kolom_awal_excel} (posisi {kol_awal_sheet})")

    # Baris di Google Sheets disamakan dengan baris di Excel
    for i, baris in enumerate(data, start=row_start):
        print(f"\n🔁 Mengisi baris {i} → {baris}")

        for j, nilai in enumerate(baris):
            kol_index = kol_awal_sheet + j
            kol_huruf = chr(64 + kol_index)
            cell_ref = f"{kol_huruf}{i}"

            try:
                # Arahkan ke cell lewat Name Box
                name_box = driver.find_element(By.CSS_SELECTOR, "input#t-name-box")
                name_box.click()
                name_box.clear()
                name_box.send_keys(cell_ref)
                name_box.send_keys(Keys.ENTER)
                time.sleep(0.4)

                # Edit isi cell
                cell_input = driver.find_element(By.CSS_SELECTOR, "div.cell-input")
                cell_input.click()
                cell_input.send_keys(Keys.CONTROL, "a")
                cell_input.send_keys(nilai)
                cell_input.send_keys(Keys.ENTER)

                print(f"✅ {cell_ref} = '{nilai}'")
            except Exception as e:
                print(f"⚠️ Gagal isi {cell_ref}: {e}")
                continue

    print("\n🏁 Semua data berhasil dikirim ke Google Sheets!")


# ======================================================
# MAIN
# ======================================================
def main():
    print("=== KIRIM DATA VISIBLE EXCEL → GOOGLE SHEETS ===")
    kolom_input = input("Masukkan kolom yang ingin dikirim (misal: B C D E F G): ").strip()
    try:
        row_start = int(input("Mulai dari baris ke berapa di Excel? (default 2): ").strip() or "2")
    except ValueError:
        row_start = 2

    data, kolom = ambil_data_visible_excel(kolom_input, row_start)
    update_google_sheets(data, kolom, row_start)

if __name__ == "__main__":
    main()
