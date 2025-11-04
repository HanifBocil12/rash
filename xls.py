from win32com.client import Dispatch
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


# ==========================
# Fungsi ambil nama paket (yang visible)
# ==========================
def ambil_visible_nama_excel():
    """Ambil nama-nama paket dari Excel yang visible (terfilter)."""
    excel = Dispatch("Excel.Application")
    wb = excel.ActiveWorkbook
    ws = excel.ActiveSheet
    visible = []

    for row in ws.UsedRange.Rows:
        if not row.Hidden:
            nama = ws.Cells(row.Row, 2).Value  # kolom B = Nama Paket
            if not nama or str(nama).strip().upper() == "NAMA PAKET PEKERJAAN":
                continue
            visible.append((row.Row, nama))
    return visible, wb, ws


# ==========================
# MAIN FUNCTION
# ==========================
def main():
    # === Ambil data dari Excel ===
    visible_rows, wb, ws = ambil_visible_nama_excel()
    print(f"📊 Terbaca {len(visible_rows)} paket dari Excel (yang visible).")

    # === Hubungkan ke Chrome aktif ===
    options = Options()
    options.debugger_address = "localhost:9222"
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 10)

    print("\n✅ Terhubung ke Chrome aktif (9222)")
    print("➡️ Menunggu halaman Inaproc siap (2 detik)...")
    time.sleep(2)

    # === Jalankan loop pencarian ===
    for row, nama_paket in visible_rows:
        try:
            print(f"\n🔍 [{row}] Mencari: {nama_paket}")

            # Tunggu kolom pencarian
            search_box = wait.until(EC.presence_of_element_located(
                (By.CSS_SELECTOR, "input[placeholder='Cari produk, pembeli, kurir, no. pesanan, resi']"))
            )

            # Isi kolom pencarian
            search_box.click()
            search_box.clear()
            search_box.send_keys(nama_paket)
            time.sleep(0.5)
            search_box.send_keys(Keys.ENTER)
            print(f"➡️ Mencari '{nama_paket}' di Inaproc...")
            time.sleep(3)

            # Ambil hasil pertama
            hasil = driver.find_elements(By.XPATH, "//p[contains(@class,'font-bold')]")
            if not hasil:
                print("⚠️ Tidak ada hasil ditemukan.")
                continue

            # Ambil status dari web
            try:
                status_el = driver.find_element(By.CSS_SELECTOR, "span.Chips_chips__wLizu")
                status_text = status_el.text.strip()
                print(f"📦 Status ditemukan di web: {status_text}")

                # Normalisasi khusus
                if status_text.strip().lower() == "adendum sedang disiapkan":
                    status_excel = "Persiapan Pengiriman"
                else:
                    status_excel = status_text

                # Update Excel hanya kalau beda
                status_excel_sekarang = ws.Cells(row, 14).Value
                if status_excel_sekarang != status_excel:
                    ws.Cells(row, 14).Value = status_excel
                    print(f"✅ STATUS PAKET baris {row} diperbarui ke '{status_excel}'.")
                else:
                    print(f"ℹ️ STATUS PAKET baris {row} sudah sama, tidak diubah.")

            except Exception as e:
                print(f"🚫 Tidak menemukan elemen status di hasil pencarian: {e}")

        except Exception as e:
            print(f"❌ Gagal proses baris {row}: {e}")

    # === Simpan workbook ===
    wb.Save()
    print("\n💾 Semua perubahan disimpan ke Excel.")
    print("🏁 Proses selesai.")


# ==========================
# Jalankan program
# ==========================
if __name__ == "__main__":
    main()
