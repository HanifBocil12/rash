import argparse
from win32com.client import Dispatch
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests, re


class InaprocSearchExcel:
    def __init__(self, start_row=2):
        self.start_row = start_row
        self.excel = Dispatch("Excel.Application")
        self.wb = self.excel.ActiveWorkbook
        self.ws = self.excel.ActiveSheet
        print(f"Terhubung ke Excel: {self.wb.Name}")

        self.debugger_url = "http://localhost:9222"
        self.driver = self._attach_driver()
        self.wait = WebDriverWait(self.driver, 10)

    def _attach_driver(self):
        try:
            requests.get(f"{self.debugger_url}/json").json()
            opts = Options()
            opts.debugger_address = "localhost:9222"
            service = Service()
            print("Tersambung ke Chrome Debugging aktif.")
            return webdriver.Chrome(service=service, options=opts)
        except Exception as e:
            raise RuntimeError(f"Gagal tersambung ke Chrome Debugging: {e}")

    def _loop_until(self, condition, desc=""):
        """Block tanpa sleep, sampai kondisi True"""
        while not condition():
            pass
        if desc:
            print(desc)

    def cari_produk(self):
        row = self.start_row
        while True:
            nama = self.ws.Cells(row, 2).Value  # kolom B
            tanggal_excel = self.ws.Cells(row, 8).Value  # kolom H
            if not nama:
                break

            print(f"\nMencari: {nama}")
            print(f"Target tanggal: {tanggal_excel}")

            try:
                search_box = self.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Cari produk']")
                search_box.clear()
                search_box.send_keys(str(nama))
                print(f"Diketik: {nama}")

                def tanggal_cocok():
                    produk_blocks = self.driver.find_elements(
                        By.XPATH, "//div[.//span[contains(@class,'text-sm text-tertiary300')]]")
                    for block in produk_blocks:
                        try:
                            t = block.find_element(By.CSS_SELECTOR, "span.text-sm.text-tertiary300").text.strip()
                            if not tanggal_excel or str(tanggal_excel).strip() in t:
                                btn = block.find_element(By.XPATH, ".//button[.//span[text()='Lihat Detail']]")
                                self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", btn)
                                btn.click()
                                print(f"Klik 'Lihat Detail' (match tanggal: {t})")
                                return True
                        except:
                            pass
                    return False

                self._loop_until(tanggal_cocok)

                # Nama Instansi
                try:
                    instansi = self.wait.until(EC.presence_of_element_located((
                        By.XPATH,
                        "//div[contains(@class,'flex items-start')][div[contains(.,'Nama Instansi')]]/div[last()]"
                    ))).text.strip()
                    print(f"Nama Instansi: {instansi}")
                    self.ws.Cells(row, 4).Value = instansi
                except:
                    print("Instansi tidak ditemukan.")
                    self.ws.Cells(row, 4).Value = "Tidak ditemukan"

                # Satuan Kerja
                try:
                    satuan = self.driver.find_element(
                        By.XPATH,
                        "//div[contains(@class,'flex items-start')][div[contains(.,'Satuan Kerja')]]/div[last()]"
                    ).text.strip()
                    print(f"Satuan Kerja: {satuan}")
                    self.ws.Cells(row, 5).Value = satuan
                except:
                    print("Satuan Kerja tidak ditemukan.")
                    self.ws.Cells(row, 5).Value = "Tidak ditemukan"

                # Tunggu Nama/No ada
                def data_penerima_muncul():
                    return len(self.driver.find_elements(By.XPATH,
                        "//div[contains(@class,'flex items-start')][div[contains(.,'Nama Penerima')]]"
                    )) > 0 or len(self.driver.find_elements(By.XPATH,
                        "(//div[contains(@class,'flex items-start')][div[normalize-space(text())='Nama']]/div[@class='text-sm leading-tight '])[last()]"
                    )) > 0

                self._loop_until(data_penerima_muncul, "Detail penerima muncul ✅")

                # Ambil Nama / Nomor sampai nomor benar-benar muncul
                def ambil_data():
                    try:
                        blk = self.driver.find_element(By.XPATH,
                            "//div[contains(@class,'flex items-start')][div[contains(.,'Nama Penerima')]]")
                        tx = blk.find_element(By.CSS_SELECTOR, "div.font-semibold").text.strip()
                    except:
                        tx = self.driver.find_element(By.XPATH,
                            "(//div[contains(@class,'flex items-start')][div[normalize-space(text())='Nama']]/div[@class='text-sm leading-tight '])[last()]"
                        ).text.strip()

                    nama = re.sub(r'\s*\(.*?\)\s*', '', tx)
                    nomor = re.search(r'\((\d+)\)', tx)
                    nomor = nomor.group(1) if nomor else ""

                    if nomor.startswith("6208"):
                        nomor = nomor[2:]
                    elif nomor.startswith("62"):
                        nomor = "0" + nomor[2:]

                    nomor = f"'{nomor}" if nomor else ""

                    return nama.strip(), nomor

                def nomor_sudah_dapat():
                    n,_ = ambil_data()
                    return bool(n)

                self._loop_until(nomor_sudah_dapat)

                nama_penerima, nomor = ambil_data()
                print(f"Nama Penerima: {nama_penerima}")
                print(f"Nomor Kontak: {nomor if nomor else 'Kosong'}")

                self.ws.Cells(row, 6).Value = nama_penerima
                self.ws.Cells(row, 7).Value = nomor

                print("✅ Data tersimpan → Kembali ke pencarian")
                self.driver.back()

                self.wait.until(EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "input[placeholder*='Cari produk']")))

            except Exception as e:
                print(f"Error {nama}: {e}")

            row += 1

        self.wb.Save()
        print("\n✅ Semua data tersimpan (D,E,F,G). Proses selesai.")


def main():
    try:
        r = int(input("Mulai dari baris berapa? > "))
    except:
        r = 2
    InaprocSearchExcel(start_row=r).cari_produk()


if __name__ == "__main__":
    main()
