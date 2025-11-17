# ==============================================
# xls2.py (versi support --excel_path dari agent)
# ==============================================
# Script otomatisasi update status paket dari Excel ke Inaproc
# - Ambil hanya baris visible di Excel
# - Hubungkan ke Chrome aktif (debug port 9222)
# - Update status di Excel
# - Bisa dijalankan langsung atau lewat agent (--agent)
# - Bisa menerima --excel_path dari agent
# ==============================================

import sys, io, time, argparse
from datetime import datetime
from win32com.client import Dispatch, GetObject
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Pastikan encoding UTF-8 agar emoji & karakter spesial tidak error
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='ignore')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='ignore')

# ==============================================
# Kelas utama
# ==============================================
class InaprocStatusAgent:
    def __init__(self):
        """Inisialisasi koneksi Chrome"""
        self.driver = self._attach_driver()
        self.wait = WebDriverWait(self.driver, 6)

    # ----------------------------------------------
    def _attach_driver(self):
        """Sambungkan ke Chrome debugging aktif"""
        try:
            options = Options()
            options.debugger_address = "localhost:9222"
            driver = webdriver.Chrome(options=options)
            print("[OK] Terhubung ke Chrome aktif (9222)")
            return driver
        except Exception as e:
            raise RuntimeError(
                f"[ERROR] Tidak bisa tersambung ke Chrome Debugging.\n"
                f"Pastikan Chrome dibuka dengan perintah:\n"
                f'chrome.exe --remote-debugging-port=9222 --user-data-dir=\"C:\\chrome_debug\"\nDetail: {e}'
            )

    # ----------------------------------------------
    def ambil_visible_nama_excel(self, excel_path=None):
        """Ambil nama paket dari Excel yang visible (terfilter) dengan retry sampai 10 kali."""
        if not excel_path:
            raise RuntimeError("[FATAL] Path Excel wajib dikirim lewat --excel_path dari agent!")

        excel = None
        for attempt in range(5):
            try:
                excel = GetObject(None, "Excel.Application")
                print(f"[OK] Terhubung ke Excel aktif (percobaan ke-{attempt+1})")
                break
            except Exception:
                print(f"[INFO] Excel belum ada, mencoba buat instance baru ({attempt+1}/10)...")
                try:
                    excel = Dispatch("Excel.Application")
                    excel.Visible = True
                    print("[OK] Membuat instance Excel baru")
                    break
                except Exception:
                    print(f"[WAIT] Gagal buat Excel instance, tunggu 1 detik...")
                    time.sleep(1)

        if not excel:
            raise RuntimeError("[FATAL] Tidak bisa membuat atau attach ke Excel.")

        # Paksa buka workbook dari path Excel yang dikirim
        try:
          
            wb = excel.Workbooks.Open(excel_path)
            print(f"[OK] Workbook dibuka: {excel_path}")
        except Exception as e:
            raise RuntimeError(f"[FATAL] Gagal membuka workbook dari path: {excel_path}\nDetail: {e}")

        ws = excel.ActiveSheet
        if not ws:
            raise RuntimeError("[FATAL] Tidak ada sheet aktif di Excel!")

        visible = []
        for row in ws.UsedRange.Rows:
            if not row.Hidden:
                nama = ws.Cells(row.Row, 2).Value  # kolom B
                if not nama or str(nama).strip().upper() == "NAMA PAKET PEKERJAAN":
                    continue
                visible.append((row.Row, nama))

        return visible, wb, ws

    # ----------------------------------------------
    def proses_update_status(self, visible_rows, wb, ws):
        """Loop utama update status tiap paket"""
        updated_rows = 0

        for row, nama_paket in visible_rows:
            try:
                print(f"\n[SEARCH] [{row}] Mencari: {nama_paket}")

                # Tunggu kolom pencarian
                search_box = self.wait.until(EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "input[placeholder='Cari produk, pembeli, kurir, no. pesanan, resi']"))
                )

                # Isi kolom pencarian
                search_box.click()
                search_box.clear()
                search_box.send_keys(nama_paket)
                time.sleep(0.5)
                search_box.send_keys(Keys.ENTER)
                print(f"[ACTION] Mencari '{nama_paket}' di Inaproc...")
                time.sleep(2.5)

                hasil = self.driver.find_elements(By.XPATH, "//p[contains(@class,'font-bold')]")
                if not hasil:
                    print("[WARN] Tidak ada hasil ditemukan.")
                    continue

                # ==============================
                # Ambil pasangan tanggal + status (sejajar)
                # ==============================
                try:
                    blok_list = self.driver.find_elements(By.CSS_SELECTOR, "div.border-tertiary100.flex.items-center.gap-1.p-4")
                    tanggal_status_pairs = []

                    for blok in blok_list:
                        try:
                            tanggal_el = blok.find_element(By.CSS_SELECTOR, "span.text-tertiary300.text-sm")
                            status_el = blok.find_element(By.CSS_SELECTOR, "span.Chips_chips__wLizu")

                            tanggal_text = " ".join(tanggal_el.text.strip().split()[:2])
                            status_text = status_el.text.strip()

                            tanggal_status_pairs.append((tanggal_text, status_text))
                        except Exception:
                            continue

                    print(f"[DEBUG] Ditemukan {len(tanggal_status_pairs)} pasangan tanggal+status: {tanggal_status_pairs}")

                    if not tanggal_status_pairs:
                        print("[WARN] Tidak ada pasangan tanggal+status ditemukan.")
                        continue

                    # Ambil tanggal Excel dan cocokkan
                    tanggal_excel_raw = ws.Cells(row, 9).Value
                    if isinstance(tanggal_excel_raw, datetime):
                        tanggal_excel_str = tanggal_excel_raw.strftime("%d %b")
                    elif isinstance(tanggal_excel_raw, str):
                        tanggal_excel_str = " ".join(tanggal_excel_raw.strip().split()[:2])
                    else:
                        print(f"[WARN] Tanggal Excel tidak valid: {tanggal_excel_raw}")
                        continue

                    tanggal_excel_str = tanggal_excel_str.strip()
                    print(f"[DEBUG] Row {row} | Excel (trim): {tanggal_excel_str}")

                    cocok_status = None
                    for tgl, sts in tanggal_status_pairs:
                        if tanggal_excel_str.lower() == tgl.lower():
                            cocok_status = sts
                            print(f"[MATCH] Tanggal cocok: {tgl} → {sts}")
                            break

                    if not cocok_status:
                        print(f"[SKIP] Tidak ada tanggal web yang cocok dengan Excel ({tanggal_excel_str}).")
                        continue

                    # --- Tambahan logika baru di sini ---
                    status_text = cocok_status
                    # Normalisasi status tertentu
                    if status_text.strip() == "Pesanan Diselesaikan Diluar Sistem":
                        status_text = "Paket Selesai"
                    elif status_text.strip() == "Persiapan Pengerjaan":
                        status_text = "Persiapan Pengiriman"
                    elif status_text.strip() == "Pesanan Selesai":
                        status_text = "Paket Selesai"
                    elif status_text.strip() == " Progres Pekerjaan Diajukan":
                        status_text = "Pesanan Tiba"
                    elif status_text.strip() == "  Tiba Sebagian":
                        status_text = "Pesanan Tiba"
                    # ------------------------------------

                    print(f"[INFO] Status cocok untuk tanggal {tanggal_excel_str}: {status_text}")

                    if status_text.strip().lower() == "adendum sedang disiapkan":
                        status_excel = "Persiapan Pengiriman"
                    else:
                        status_excel = status_text

                    status_excel_sekarang = ws.Cells(row, 14).Value
                    if status_excel_sekarang != status_excel:
                        ws.Cells(row, 14).Value = status_excel
                        updated_rows += 1
                        print(f"[OK] STATUS baris {row} diperbarui ke '{status_excel}'.")
                    else:
                        print(f"[SKIP] STATUS baris {row} sudah sama, tidak diubah.")

                except Exception as e:
                    print(f"[WARN] Gagal ambil/bandingkan tanggal: {e}")
                    continue

            except Exception as e:
                print(f"[ERR] Gagal proses baris {row}: {e}")

        return updated_rows

    # ----------------------------------------------
    def run(self, excel_path=None):
        """Jalankan seluruh proses"""
        print("[RUN] Menjalankan update status Inaproc otomatis...")
        print("[WAIT] Menunggu halaman Inaproc siap (2 detik)...")
        time.sleep(2)

        visible_rows, wb, ws = self.ambil_visible_nama_excel(excel_path)
        print(f"[INFO] Terbaca {len(visible_rows)} paket visible di Excel.")

        if not visible_rows:
            print("[WARN] Tidak ada data visible di Excel.")
            return 0

        updated = self.proses_update_status(visible_rows, wb, ws)

        wb.Save()
        print("\n[SAVE] Semua perubahan disimpan ke Excel.")
        print(f"[DONE] Proses selesai. Total baris diperbarui: {updated}")
        return updated

# ==============================================
# Main entry
# ==============================================
def main(agent=False, excel_path=None):
    print(f"[START] inaproc_status_agent.py dijalankan {'dari agent' if agent else 'manual'}")
    try:
        bot = InaprocStatusAgent()
        updated = bot.run(excel_path)
        if agent:
            return {"status": "success", "updated_rows": updated}
    except Exception as e:
        print(f"[FATAL] Terjadi kesalahan fatal: {e}")
        if agent:
            return {"status": "error", "message": str(e)}

# ==============================================
# Entry point
# ==============================================
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--agent", action="store_true", help="Jalankan dari agent")
    parser.add_argument("--excel_path", type=str, default=None, help="Path Excel dari API agent")
    args = parser.parse_args()

    main(agent=args.agent, excel_path=args.excel_path)
