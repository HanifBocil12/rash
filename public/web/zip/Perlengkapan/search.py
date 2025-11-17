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
        # Hubungkan ke Excel aktif
        self.excel = Dispatch("Excel.Application")
        self.wb = self.excel.ActiveWorkbook
        self.ws = self.excel.ActiveSheet
        self.start_row = start_row
        print(f"📘 Terhubung ke Excel: {self.wb.Name}")
        print(f"📄 Mulai dari baris: {self.start_row}")

        # Hubungkan ke Chrome debugging aktif
        self.debugger_url = "http://localhost:9222"
        self.driver = self._attach_driver()
        self.wait = WebDriverWait(self.driver, 20)

    def _attach_driver(self):
        """Sambung ke Chrome debugging yang sudah dibuka dengan --remote-debugging-port"""
        try:
            requests.get(f"{self.debugger_url}/json").json()
            opts = Options()
            opts.debugger_address = "localhost:9222"
            service = Service()
            print("✅ Tersambung ke Chrome Debugging aktif.")
            return webdriver.Chrome(service=service, options=opts)
        except Exception as e:
            raise RuntimeError(f"❌ Gagal tersambung ke Chrome Debugging: {e}")

    def cari_produk(self):
        row = self.start_row
        while True:
            nama = self.ws.Cells(row, 2).Value  # kolom B
            tanggal_excel = self.ws.Cells(row, 8).Value  # kolom H
            if not nama:
                break

            print(f"\n🔍 Mencari: {nama}")
            print(f"📅 Target tanggal: {tanggal_excel}")

            try:
                # Kolom pencarian
                search_box = self.wait.until(EC.presence_of_element_located((
                    By.XPATH,
                    "//input[contains(@placeholder,'Cari') or contains(@aria-label,'Cari') or @type='search']"
                )))
                search_box.clear()
                time.sleep(0.3)
                search_box.send_keys(str(nama))
                print(f"✅ Diketik: {nama}")

                # Tunggu hasil muncul
                found = False
                start_time = time.time()

                while time.time() - start_time < 25:
                    produk_blocks = self.driver.find_elements(
                        By.XPATH, "//div[.//span[contains(@class,'text-sm text-tertiary300')]]"
                    )
                    for block in produk_blocks:
                        try:
                            tanggal_el = block.find_element(By.CSS_SELECTOR, "span.text-sm.text-tertiary300")
                            tanggal_web = tanggal_el.text.strip()

                            if str(tanggal_excel).strip() in tanggal_web:
                                tombol = block.find_element(By.XPATH, ".//button[.//span[text()='Lihat Detail']]")
                                self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", tombol)
                                time.sleep(0.3)
                                tombol.click()
                                print(f"🖱️ Klik 'Lihat Detail' (match tanggal: {tanggal_web})")
                                found = True
                                break
                        except Exception:
                            continue
                    if found:
                        break
                    time.sleep(0.8)

                if not found:
                    print("⚠️ Tidak ada hasil dengan tanggal cocok setelah 25 detik.")
                    row += 1
                    continue

                # Tunggu halaman detail
                try:
                    self.wait.until(EC.presence_of_element_located((
                        By.XPATH, "//div[contains(.,'Nama Instansi')]"
                    )))
                    print("✅ Halaman detail siap dibaca.")
                except:
                    print("⚠️ Halaman detail tidak lengkap, skip.")
                    row += 1
                    continue

                # Ambil data
                instansi = self._get_text("//div[contains(@class,'flex items-start')][div[contains(.,'Nama Instansi')]]/div[last()]")
                satuan = self._get_text("//div[contains(@class,'flex items-start')][div[contains(.,'Satuan Kerja')]]/div[last()]")

                # Tunggu sampai nama penerima muncul dulu
                try:
                    WebDriverWait(self.driver, 15).until(
                        lambda d: ("Nama Penerima" in d.page_source) or ("Nama" in d.page_source)
                    )
                except:
                    print("⚠️ Nama Penerima belum muncul di halaman.")

                nama_penerima, nomor = self._get_penerima()

                self.ws.Cells(row, 4).Value = instansi or "Tidak ditemukan"
                self.ws.Cells(row, 5).Value = satuan or "Tidak ditemukan"
                self.ws.Cells(row, 6).Value = nama_penerima or "Tidak ditemukan"
                self.ws.Cells(row, 7).Value = nomor or ""

                print(f"🏛️ Instansi: {instansi}")
                print(f"🏢 Satuan Kerja: {satuan}")
                print(f"👤 Penerima: {nama_penerima}")
                print(f"📞 Nomor: {nomor if nomor else 'Kosong'}")

                # Tunggu sampai Excel benar-benar terisi
                print("⏳ Menunggu data tersimpan di Excel...")
                start_wait = time.time()
                while True:
                    val = self.ws.Cells(row, 6).Value
                    if val and val != "Tidak ditemukan":
                        break
                    if time.time() - start_wait > 15:
                        print("⚠️ Nama Penerima belum muncul setelah 15 detik.")
                        break
                    time.sleep(1)

                # Kembali ke halaman utama
                print("↩️ Kembali ke halaman utama...")
                self.driver.back()
                try:
                    self.wait.until(EC.presence_of_element_located((
                        By.XPATH, "//input[contains(@placeholder,'Cari')]"
                    )))
                    print("✅ Halaman utama siap untuk pencarian berikutnya.")
                except:
                    print("⚠️ Halaman utama tidak muncul setelah kembali.")

            except Exception as e:
                print(f"❌ Error saat memproses {nama}: {e}")
                time.sleep(2)

            row += 1

        self.wb.Save()
        print("\n💾 Semua data tersimpan di Excel.")
        print("🏁 Proses selesai.")

    # --- Helper untuk ambil teks aman ---
    def _get_text(self, xpath):
        try:
            el = self.driver.find_element(By.XPATH, xpath)
            return el.text.strip()
        except:
            return ""

    # --- Helper untuk ambil nama & nomor ---
    def _get_penerima(self):
        try:
            blok = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((
                    By.XPATH,
                    "//div[contains(@class,'flex items-start')][div[contains(.,'Nama Penerima')]]"
                ))
            )

            start_time = time.time()
            penerima_text = ""
            while time.time() - start_time < 10:
                try:
                    penerima_el = blok.find_element(By.CSS_SELECTOR, "div.font-semibold")
                    penerima_text = penerima_el.text.strip()
                    if penerima_text:
                        break
                except:
                    pass
                time.sleep(0.3)

            if not penerima_text:
                raise Exception("Nama Penerima kosong walau elemen ada")

            nama = re.sub(r'\s*\(.*?\)\s*', '', penerima_text).strip()
            match = re.search(r'\((\d+)\)', penerima_text)
            nomor = ""
            if match:
                nomor = match.group(1).strip()
                if nomor.startswith("6208"):
                    nomor = nomor[2:]
                elif nomor.startswith("62") and not nomor.startswith("620"):
                    nomor = "0" + nomor[2:]
                nomor = f"'{nomor}"
            return nama, nomor

        except Exception:
            try:
                blok = WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((
                        By.XPATH,
                        "(//div[contains(@class,'flex items-start')][div[normalize-space(text())='Nama']]/div[@class='text-sm leading-tight '])[last()]"
                    ))
                )
                start_time = time.time()
                nama_text = ""
                while time.time() - start_time < 5:
                    nama_text = blok.text.strip()
                    if nama_text:
                        break
                    time.sleep(0.3)
                return nama_text, ""
            except:
                return "", ""


def main():
    try:
        start_row = int(input("Masukkan nomor baris awal (misal 2): ").strip() or 2)
    except ValueError:
        start_row = 2

    bot = InaprocSearchExcel(start_row)
    bot.cari_produk()


if __name__ == "__main__":
    main()
