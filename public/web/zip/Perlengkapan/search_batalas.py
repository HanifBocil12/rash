import argparse
from win32com.client import Dispatch
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time, requests, re

class InaprocSearchExcel:
    def __init__(self, start_row=2):
        self.start_row = start_row  # mulai dari baris input
        # Hubungkan ke Excel aktif
        self.excel = Dispatch("Excel.Application")
        self.wb = self.excel.ActiveWorkbook
        self.ws = self.excel.ActiveSheet
        print(f"Terhubung ke Excel: {self.wb.Name}")

        # Hubungkan ke Chrome debugging aktif
        self.debugger_url = "http://localhost:9222"
        self.driver = self._attach_driver()
        self.wait = WebDriverWait(self.driver, 10)

    def _attach_driver(self):
        """Sambung ke Chrome debugging yang sudah dibuka dengan --remote-debugging-port"""
        try:
            requests.get(f"{self.debugger_url}/json").json()
            opts = Options()
            opts.debugger_address = "localhost:9222"
            service = Service()
            print("Tersambung ke Chrome Debugging aktif.")
            return webdriver.Chrome(service=service, options=opts)
        except Exception as e:
            raise RuntimeError(f"Gagal tersambung ke Chrome Debugging: {e}")

    def cari_produk(self):
        row = self.start_row  # gunakan start_row dari argumen
        while True:
            nama = self.ws.Cells(row, 2).Value  # kolom B
            tanggal_excel = self.ws.Cells(row, 8).Value  # kolom H
            if not nama:
                break

            print(f"\nMencari: {nama}")
            print(f"Target tanggal: {tanggal_excel}")

            try:
                # cari kolom pencarian
                search_box = self.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Cari produk']")
                search_box.clear()
                time.sleep(0.5)
                search_box.send_keys(str(nama))
                print(f"Diketik: {nama}")

                # tunggu hasil muncul otomatis (delay lebih panjang untuk load)
                time.sleep(4)

                # cari hasil produk
                produk_blocks = self.driver.find_elements(
                    By.XPATH, "//div[.//span[contains(@class,'text-sm text-tertiary300')]]"
                )

                found = False
                for block in produk_blocks:
                    try:
                        tanggal_el = block.find_element(By.CSS_SELECTOR, "span.text-sm.text-tertiary300")
                        tanggal_web = tanggal_el.text.strip()

                        if str(tanggal_excel).strip() in tanggal_web:
                            tombol = block.find_element(By.XPATH, ".//button[.//span[text()='Lihat Detail']]")
                            self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", tombol)
                            time.sleep(0.6)
                            tombol.click()
                            print(f"Klik 'Lihat Detail' (match tanggal: {tanggal_web})")
                            found = True
                            break
                    except Exception:
                        continue

                if not found:
                    print("Tidak ada hasil dengan tanggal cocok.")
                    row += 1
                    continue

                # tunggu halaman detail muncul
                time.sleep(3.5)

                # Ambil Nama Instansi
                try:
                    instansi_el = self.wait.until(EC.presence_of_element_located((
                        By.XPATH,
                        "//div[contains(@class,'flex items-start')][div[contains(.,'Nama Instansi')]]/div[last()]"
                    )))
                    time.sleep(0.5)
                    instansi = instansi_el.text.strip()
                    print(f"Nama Instansi: {instansi}")
                    self.ws.Cells(row, 4).Value = instansi  # kolom D
                except Exception:
                    print("Nama Instansi tidak ditemukan.")
                    self.ws.Cells(row, 4).Value = "Tidak ditemukan"

                # Ambil Satuan Kerja
                try:
                    time.sleep(0.5)
                    satuan_el = self.driver.find_element(
                        By.XPATH,
                        "//div[contains(@class,'flex items-start')][div[contains(.,'Satuan Kerja')]]/div[last()]"
                    )
                    satuan = satuan_el.text.strip()
                    print(f"Satuan Kerja: {satuan}")
                    self.ws.Cells(row, 5).Value = satuan  # kolom E
                except Exception:
                    print("Satuan Kerja tidak ditemukan.")
                    self.ws.Cells(row, 5).Value = "Tidak ditemukan"

                # Ambil Nama Penerima / Nama dan Nomor Kontak
                try:
                    time.sleep(0.5)
                    nama_penerima = ""
                    nomor = ""

                    # Coba cari "Nama Penerima"
                    try:
                        blok = self.driver.find_element(By.XPATH,
                            "//div[contains(@class,'flex items-start')][div[contains(.,'Nama Penerima')]]")

                        time.sleep(0.3)
                        penerima_el = blok.find_element(By.CSS_SELECTOR, "div.font-semibold")
                        penerima_text = penerima_el.text.strip()

                        # Ambil nama (tanpa nomor di dalam tanda kurung)
                        nama_penerima = re.sub(r'\s*\(.*?\)\s*', '', penerima_text).strip()

                        # Ambil nomor
                        match = re.search(r'\((\d+)\)', penerima_text)
                        if match:
                            nomor = match.group(1).strip()
                            if nomor.startswith("6208"):
                                nomor = nomor[2:]
                            elif nomor.startswith("62") and not nomor.startswith("620"):
                                nomor = "0" + nomor[2:]
                            nomor = f"'{nomor}"

                    except:
                        # Kalau tidak ada, coba blok dengan label persis "Nama"
                        try:
                            time.sleep(0.3)
                            penerima_el = self.driver.find_element(
                                By.XPATH,
                                "(//div[contains(@class,'flex items-start')][div[normalize-space(text())='Nama']]/div[@class='text-sm leading-tight '])[last()]"
                            )
                            nama_penerima = penerima_el.text.strip()
                            nomor = ""
                        except:
                            nama_penerima = ""
                            nomor = ""

                    if not nama_penerima:
                        print("Tidak menemukan elemen Nama / Nama Penerima.")
                        self.ws.Cells(row, 6).Value = "Tidak ditemukan"
                        self.ws.Cells(row, 7).Value = ""
                    else:
                        print(f"Nama Penerima: {nama_penerima}")
                        print(f"Nomor Kontak: {nomor if nomor else 'Kosong'}")
                        self.ws.Cells(row, 6).Value = nama_penerima  # kolom F
                        self.ws.Cells(row, 7).Value = nomor          # kolom G

                except Exception as e:
                    print(f"Error saat ambil Nama Penerima: {e}")
                    self.ws.Cells(row, 6).Value = "Tidak ditemukan"
                    self.ws.Cells(row, 7).Value = ""

                # kembali ke halaman sebelumnya
                print("Kembali ke halaman utama...")
                self.driver.back()
                time.sleep(4)

            except Exception as e:
                print(f"Error saat memproses {nama}: {e}")
                time.sleep(3)

            row += 1

        # simpan hasil
        self.wb.Save()
        print("\nSemua data tersimpan di Excel (D=Instansi, E=Satuan Kerja, F=Nama Penerima, G=No HP).")
        print("Proses selesai.")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--start_row", type=int, default=2, help="Baris awal Excel")
    args = parser.parse_args()

    bot = InaprocSearchExcel(start_row=args.start_row)
    bot.cari_produk()

if __name__ == "__main__":
    main()
