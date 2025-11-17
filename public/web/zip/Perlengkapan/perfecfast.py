# ==============================================
# perfecfast.py
# ==============================================
# Script otomatisasi unduhan dokumen Inaproc (FULL AUTOMATIC)
# - Tidak perlu klik ENTER
# - Menunggu halaman Inaproc siap 5 detik
# - Bisa dijalankan langsung atau via Agent/Streamlit
# ==============================================

import os
import re
import sys
import time
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ==============================================
# Konfigurasi encoding agar emoji tidak error di Windows
# ==============================================
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='ignore')

class InaprocAutoClicker:
    def __init__(self, debugger_url="http://localhost:9222"):
        """Hubungkan ke Chrome aktif (debug port 9222)"""
        self.debugger_url = debugger_url
        self.driver = self._attach_driver()
        self.wait = WebDriverWait(self.driver, 10)

        # Folder root download
        self.download_root = r"C:\web\zip\Perlengkapan\download"
        os.makedirs(self.download_root, exist_ok=True)
        self.folder_prefix = f"{time.strftime('%Y')} Pengadaan "

    # ----------------------------------------------
    def _attach_driver(self):
        """Sambungkan ke Chrome debugging aktif"""
        try:
            requests.get(f"{self.debugger_url}/json", timeout=3).json()
            options = Options()
            options.debugger_address = "localhost:9222"
            options.page_load_strategy = "eager"
            service = Service()
            print("[OK] Terhubung ke Chrome Debugging aktif.")
            return webdriver.Chrome(service=service, options=options)
        except Exception as e:
            raise RuntimeError(
                f"[ERROR] Tidak bisa tersambung ke Chrome Debugging. "
                f"Pastikan Chrome dibuka dengan --remote-debugging-port=9222\nDetail: {e}"
            )

    # ----------------------------------------------
    def ambil_nomor_halaman_aktif(self):
        """Ambil nomor halaman aktif dari pagination"""
        try:
            btn = self.driver.find_element(
                By.CSS_SELECTOR, "button.Pagination_button__m7YBp[data-active='true']"
            )
            nomor = btn.text.strip()
            return int(nomor) if nomor.isdigit() else 1
        except:
            return 1

    # ----------------------------------------------
    def set_download_dir(self, path):
        """Atur folder download (path sudah lengkap)"""
        os.makedirs(path, exist_ok=True)
        try:
            self.driver.execute_cdp_cmd(
                "Page.setDownloadBehavior",
                {"behavior": "allow", "downloadPath": path},
            )
        except Exception as e:
            print(f"[WARN] Gagal atur folder unduhan: {e}")

    # ----------------------------------------------
    def ambil_semua_lihat_detail(self):
        """Ambil semua tombol 'Lihat Detail' di halaman"""
        try:
            return self.wait.until(
                EC.presence_of_all_elements_located(
                    (By.XPATH, "//button[span[text()='Lihat Detail']]")
                )
            )
        except:
            return []

    # ----------------------------------------------
    def ambil_nama_produk(self, tombol, index):
        """Ambil nama produk dari card"""
        try:
            card = tombol.find_element(
                By.XPATH, "./ancestor::div[starts-with(@id, 'order-list-card-')]"
            )
            nama = card.find_element(
                By.XPATH, ".//p[contains(@class,'font-bold')]"
            ).text.strip()
            return nama or f"pesanan_{index}"
        except:
            return f"pesanan_{index}"

    # ----------------------------------------------
    def ambil_semua_label_dokumen(self):
        """Ambil label dokumen (BAST, Adendum, dsb)"""
        try:
            labels = self.wait.until(
                EC.presence_of_all_elements_located(
                    (By.CSS_SELECTOR, "div.text-body-sm-semibold.text-tertiary500")
                )
            )
            return [el.text.strip() for el in labels if el.text.strip()]
        except:
            return []

    # ----------------------------------------------
    def klik_lihat_dokumen_dan_unduh(self, label):
        """Klik 'Lihat Dokumen' dan unduh"""
        try:
            section = self.wait.until(
                EC.presence_of_element_located(
                    (By.XPATH, f"//div[contains(text(), '{label}')]")
                )
            )
            self.driver.execute_script(
                "arguments[0].scrollIntoView({block:'center'});", section
            )
            time.sleep(0.5)

            link = section.find_element(
                By.XPATH, ".//following::a[contains(text(),'Lihat Dokumen')][1]"
            )
            self.driver.execute_script(
                "arguments[0].removeAttribute('target'); arguments[0].click();", link
            )

            unduh_btn = self.wait.until(
                EC.element_to_be_clickable((By.ID, "download-btn"))
            )
            self.driver.execute_script("arguments[0].click();", unduh_btn)
            print(f"[OK] Unduh '{label}' berhasil")
            time.sleep(1)
            return True
        except:
            print(f"[WARN] Gagal unduh {label}")
            return False

    # ----------------------------------------------
    def klik_tombol_svg_footer(self):
        """Klik tombol kembali (go back)"""
        try:
            tombol_back = self.wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[@aria-label='Go back']"))
            )
            self.driver.execute_script("arguments[0].click();", tombol_back)
            time.sleep(1)
        except:
            pass

    # ----------------------------------------------
    def proses_dokumen(self):
        """Unduh semua dokumen penting"""
        labels = self.ambil_semua_label_dokumen()
        target_labels = ["Surat Pesanan", "BAST", "Surat Adendum", "Faktur Pajak"]
        for label in target_labels:
            if label in labels:
                self.klik_lihat_dokumen_dan_unduh(label)
                self.driver.back()
                time.sleep(1)

    # ----------------------------------------------
    def klik_tombol_pagination_berikutnya(self, halaman):
        """Klik tombol next page secara aman"""
        try:
            time.sleep(1)
            all_buttons = self.driver.find_elements(By.CSS_SELECTOR, "button.Pagination_button__m7YBp")
            
            # Cari tombol next dengan teks '>' atau 'Next'
            next_btn = None
            for btn in all_buttons:
                if btn.text.strip() in [">", "Next"]:
                    next_btn = btn
                    break

            if next_btn and next_btn.is_enabled():
                self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", next_btn)
                time.sleep(0.3)
                self.driver.execute_script("arguments[0].click();", next_btn)
                print(f"[INFO] Pindah ke halaman {halaman + 1}...")
                time.sleep(2)
                return True

            # Tidak ada tombol next → sudah di halaman terakhir
            return False

        except Exception as e:
            print(f"[WARN] Gagal klik next page: {e}")
            return False

    # ----------------------------------------------
    def run(self):
        """Jalankan otomatisasi sepenuhnya tanpa input manual"""
        print("[RUN] Membuka halaman Inaproc...")
        print("[NOTE] Pastikan Chrome dibuka dengan '--remote-debugging-port=9222'")
        print("[WAIT] Menunggu halaman Inaproc siap (5 detik)...")
        time.sleep(5)

        halaman = self.ambil_nomor_halaman_aktif()
        folder_halaman = os.path.join(self.download_root, f"hal {halaman}")
        os.makedirs(folder_halaman, exist_ok=True)
        print(f"[INIT] Folder halaman aktif dibuat: {folder_halaman}")

        i = 0
        while True:
            print(f"\n[PAGE] Halaman {halaman}")
            tombol_list = self.ambil_semua_lihat_detail()
            if not tombol_list:
                print("[STOP] Tidak ada pesanan di halaman ini.")
                break

            for index in range(len(tombol_list)):
                try:
                    i += 1
                    tombol_list = self.ambil_semua_lihat_detail()
                    tombol = tombol_list[index]
                    nama_p = self.ambil_nama_produk(tombol, i)

                    safe_name = re.sub(r'[\\/*?:"<>|]', "_", nama_p.strip())
                    folder_nama_p = os.path.join(folder_halaman, safe_name)
                    os.makedirs(folder_nama_p, exist_ok=True)

                    self.set_download_dir(folder_nama_p)

                    self.driver.execute_script(
                        "arguments[0].scrollIntoView({block:'center'});", tombol
                    )
                    self.driver.execute_script("arguments[0].click();", tombol)

                    self.proses_dokumen()
                    self.klik_tombol_svg_footer()
                except Exception as e:
                    print(f"[WARN] Gagal proses produk {i}: {e}")

            if not self.klik_tombol_pagination_berikutnya(halaman):
                print("[DONE] Semua halaman selesai diproses.")
                break

            halaman += 1
            folder_halaman = os.path.join(self.download_root, f"hal {halaman}")
            os.makedirs(folder_halaman, exist_ok=True)
            print(f"[NEW] Folder halaman {halaman} dibuat: {folder_halaman}")

# ==============================================
# Main entry
# ==============================================
def main(agent=False):
    print(f"[START] perfecfast.py dijalankan {'dari agent' if agent else 'manual'}")
    bot = InaprocAutoClicker()
    bot.run()

if __name__ == "__main__":
    main(agent="--agent" in sys.argv)
