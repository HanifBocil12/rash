# ==============================================
# batal.py — versi tampil di log agent (real-time) + excel_path
# ==============================================
from win32com.client import Dispatch
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests, time, argparse, re, sys, os
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


class InaprocAutoBatalExcel:
    def __init__(self, start_row=None, excel_path=None):
        print("🚀 Memulai proses BATAL Excel ...", flush=True)

        # Hubungkan ke Excel
        self.excel = Dispatch("Excel.Application")
        self.excel.Visible = True

        if excel_path:
            excel_path = os.path.abspath(excel_path)
            # Cek apakah workbook sudah terbuka
            wb_found = None
            for wb in self.excel.Workbooks:
                if os.path.abspath(wb.FullName) == excel_path:
                    wb_found = wb
                    break
            if wb_found:
                self.wb = wb_found
                print(f"📄 Workbook sudah terbuka: {excel_path}", flush=True)
            else:
                self.wb = self.excel.Workbooks.Open(excel_path)
                print(f"📄 Membuka workbook dari path: {excel_path}", flush=True)
        else:
            self.wb = self.excel.ActiveWorkbook
            print(f"📗 Terhubung ke Excel aktif: {self.wb.Name}", flush=True)

        self.ws = self.wb.ActiveSheet

        # Paksa kolom H sebagai Text
        self.ws.Columns(8).NumberFormat = "@"

        # Tentukan baris mulai
        self.start_row = self._tentukan_baris_mulai(start_row)

        # Hubungkan ke Chrome debugging aktif
        self.debugger_url = "http://localhost:9222"
        self.driver = self._attach_driver()
        self.wait = WebDriverWait(self.driver, 10)
        print("🟢 Inisialisasi selesai.\n", flush=True)

    def _tentukan_baris_mulai(self, start_row):
        if start_row:
            print(f"➡️ Mulai dari baris input: {start_row}", flush=True)
            return int(start_row)

        last_row = self.ws.Cells(self.ws.Rows.Count, 2).End(-4162).Row  # xlUp
        next_row = last_row + 1 if self.ws.Cells(last_row, 2).Value else last_row
        print(f"🧩 Deteksi otomatis: baris terakhir terisi = {last_row}, mulai tulis di {next_row}", flush=True)
        return next_row

    def _attach_driver(self):
        try:
            requests.get(f"{self.debugger_url}/json", timeout=3).json()
            options = Options()
            options.debugger_address = "localhost:9222"
            options.page_load_strategy = "eager"
            service = Service()
            print("🌐 Tersambung ke Chrome Debugging aktif.", flush=True)
            return webdriver.Chrome(service=service, options=options)
        except Exception as e:
            print(f"❌ Gagal tersambung ke Chrome Debugging: {e}", flush=True)
            raise

    # Semua fungsi lainnya tetap sama (ambil_total_halaman, klik_ke_halaman, ambil_nama_dan_waktu, tulis_ke_excel, run)

    def ambil_total_halaman(self):
        try:
            elements = self.wait.until(
                EC.presence_of_all_elements_located(
                    (By.CSS_SELECTOR, "button.Button_button__LbREC span")
                )
            )
            nomor_list = [int(el.text.strip()) for el in elements if el.text.strip().isdigit()]
            if nomor_list:
                total = max(nomor_list)
                print(f"📄 Total halaman terdeteksi: {total}", flush=True)
                return total
            else:
                print("⚠️ Tidak ada nomor halaman ditemukan.", flush=True)
                return 1
        except Exception:
            return 1

    def klik_ke_halaman(self, nomor):
        try:
            time.sleep(1.2)
            spans = self.driver.find_elements(By.CSS_SELECTOR, "button.Button_button__LbREC span")
            for span in spans:
                if span.text.strip() == str(nomor):
                    btn = span.find_element(By.XPATH, "./ancestor::button[1]")
                    self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", btn)
                    time.sleep(0.5)
                    self.driver.execute_script("arguments[0].click();", btn)
                    print(f"🔄 Pindah ke halaman {nomor}", flush=True)
                    time.sleep(2.5)
                    return True
            return False
        except Exception:
            return False

    def ambil_nama_dan_waktu(self):
        produk_elements = self.driver.find_elements(
            By.CSS_SELECTOR, "span.line-clamp-2.max-h-11.font-bold"
        )
        waktu_elements = self.driver.find_elements(
            By.CSS_SELECTOR, "span.text-sm.text-tertiary300"
        )

        nama_list = [el.text.strip() for el in produk_elements if el.text.strip()]
        waktu_list = [el.text.strip() for el in waktu_elements if el.text.strip()]

        panjang = min(len(nama_list), len(waktu_list))
        data = list(zip(nama_list[:panjang], waktu_list[:panjang]))
        data = [(n, str(w)) for n, w in data]

        return data[::-1]  # urutan bawah ke atas

    def tulis_ke_excel(self, data_list, start_row):
        for i, (nama, waktu) in enumerate(data_list, start=start_row):
            self.ws.Cells(i, 2).Value = str(nama) if nama else ""
            self.ws.Cells(i, 8).Value = str(waktu) if waktu else ""
            print(f"📝 B{i}: {nama} | H{i}: {waktu}", flush=True)
        return start_row + len(data_list)

    def run(self):
        print("⚙️ Mode ambil nama + waktu ke Excel dimulai...", flush=True)
        total_halaman = self.ambil_total_halaman()
        row_pos = self.start_row

        for halaman in range(total_halaman, 0, -1):
            print(f"➡️ Halaman {halaman}", flush=True)
            if halaman != total_halaman:
                self.klik_ke_halaman(halaman)
            time.sleep(1.5)

            data_list = self.ambil_nama_dan_waktu()
            if not data_list:
                print("⚠️ Tidak ada data di halaman ini.", flush=True)
                continue

            row_pos = self.tulis_ke_excel(data_list, row_pos)
            time.sleep(1.2)

        self.wb.Save()
        print("✅ Semua data tersimpan ke Excel (B & H). Proses selesai.\n", flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--start_row", type=int, help="Mulai dari baris ke berapa di Excel", default=None)
    parser.add_argument("--excel_path", type=str, help="Path Excel untuk dibuka", default=None)
    args = parser.parse_args()

    bot = InaprocAutoBatalExcel(start_row=args.start_row, excel_path=args.excel_path)
    bot.run()
    print("🏁 Script batal.py selesai dijalankan.", flush=True)


if __name__ == "__main__":
    main()