# # ==============================================
# # perfecfast_auto.py
# # ==============================================
# # Script otomatisasi unduhan dokumen Inaproc (FULL AUTOMATIC)
# # - Tidak perlu klik ENTER
# # - Menunggu halaman Inaproc siap 5 detik
# # - Bisa dijalankan langsung atau via Streamlit
# # ==============================================

# from selenium import webdriver
# from selenium.webdriver.chrome.service import Service
# from selenium.webdriver.chrome.options import Options
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# import requests, time, os, re


# class InaprocAutoClicker:
#     def __init__(self, debugger_url="http://localhost:9222"):
#         """Hubungkan ke Chrome aktif (debug port 9222)"""
#         self.debugger_url = debugger_url
#         self.driver = self._attach_driver()
#         self.wait = WebDriverWait(self.driver, 10)

#         # =======================
#         # Folder download tetap
#         # =======================
#         self.download_root = r"C:\web\zip\download"
#         os.makedirs(self.download_root, exist_ok=True)

#         self.folder_prefix = f"{time.strftime('%Y')} Pengadaan "

#     # ----------------------------------------------
#     def _attach_driver(self):
#         """Sambungkan ke Chrome debugging aktif"""
#         try:
#             requests.get(f"{self.debugger_url}/json").json()
#             options = Options()
#             options.debugger_address = "localhost:9222"
#             options.page_load_strategy = "eager"
#             service = Service()
#             print("✅ Tersambung ke Chrome Debugging aktif.")
#             return webdriver.Chrome(service=service, options=options)
#         except Exception as e:
#             raise RuntimeError(f"❌ Gagal tersambung ke Chrome Debugging: {e}")

#     # ----------------------------------------------
#     def set_download_dir(self, folder_name):
#         """Atur folder download berdasarkan nama produk"""
#         full_name = f"{self.folder_prefix}{folder_name.strip()}"
#         safe_name = re.sub(r'[\\/*?:"<>|]', "_", full_name)
#         path = os.path.join(self.download_root, safe_name)
#         os.makedirs(path, exist_ok=True)
#         try:
#             self.driver.execute_cdp_cmd(
#                 "Page.setDownloadBehavior",
#                 {"behavior": "allow", "downloadPath": path}
#             )
#         except:
#             pass

#     # ----------------------------------------------
#     def ambil_semua_lihat_detail(self):
#         """Ambil semua tombol 'Lihat Detail' di halaman"""
#         try:
#             return self.wait.until(
#                 EC.presence_of_all_elements_located((By.XPATH, "//button[span[text()='Lihat Detail']]"))
#             )
#         except:
#             return []

#     # ----------------------------------------------
#     def ambil_nama_produk(self, tombol, index):
#         """Ambil nama produk dari card"""
#         try:
#             card = tombol.find_element(By.XPATH, "./ancestor::div[starts-with(@id, 'order-list-card-')]")
#             nama = card.find_element(By.XPATH, ".//p[contains(@class,'font-bold')]").text.strip()
#             return nama or f"pesanan_{index}"
#         except:
#             return f"pesanan_{index}"

#     # ----------------------------------------------
#     def ambil_semua_label_dokumen(self):
#         """Ambil label dokumen (BAST, Adendum, dsb)"""
#         try:
#             labels = self.wait.until(
#                 EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.text-body-sm-semibold.text-tertiary500"))
#             )
#             return [el.text.strip() for el in labels if el.text.strip()]
#         except:
#             return []

#     # ----------------------------------------------
#     def klik_lihat_dokumen_dan_unduh(self, label):
#         """Klik 'Lihat Dokumen' dan unduh"""
#         try:
#             section = self.wait.until(EC.presence_of_element_located((By.XPATH, f"//div[contains(text(), '{label}')]")))
#             self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", section)
#             time.sleep(0.5)

#             link = section.find_element(By.XPATH, ".//following::a[contains(text(),'Lihat Dokumen')][1]")
#             self.driver.execute_script("arguments[0].removeAttribute('target'); arguments[0].click();", link)

#             unduh_btn = self.wait.until(EC.element_to_be_clickable((By.ID, "download-btn")))
#             self.driver.execute_script("arguments[0].click();", unduh_btn)
#             print(f"✅ Unduh '{label}' berhasil")
#             time.sleep(1)
#             return True
#         except:
#             print(f"⚠️ Gagal unduh {label}")
#             return False

#     # ----------------------------------------------
#     def klik_tombol_svg_footer(self):
#         """Klik tombol kembali (go back)"""
#         try:
#             tombol_back = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Go back']")))
#             self.driver.execute_script("arguments[0].click();", tombol_back)
#             time.sleep(1)
#         except:
#             pass

#     # ----------------------------------------------
#     def proses_dokumen(self):
#         """Unduh semua dokumen penting"""
#         labels = self.ambil_semua_label_dokumen()
#         target_labels = ["Surat Pesanan", "BAST", "Surat Adendum", "Faktur Pajak"]
#         for label in target_labels:
#             if label in labels:
#                 self.klik_lihat_dokumen_dan_unduh(label)
#                 self.driver.back()
#                 time.sleep(1)

#     # ----------------------------------------------
#     def klik_tombol_pagination_berikutnya(self, halaman):
#         """Klik tombol next page"""
#         try:
#             time.sleep(1)
#             next_btns = self.driver.find_elements(By.CSS_SELECTOR, "button.Pagination_button_m7YbP")
#             if next_btns:
#                 next_btn = next_btns[-1]
#                 self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", next_btn)
#                 time.sleep(0.3)
#                 self.driver.execute_script("arguments[0].click();", next_btn)
#                 print(f"➡️ Pindah ke halaman {halaman + 1}...")
#                 time.sleep(2)
#                 return True
#             return False
#         except Exception as e:
#             print(f"⚠️ Gagal klik next page: {e}")
#             return False

#     # ----------------------------------------------
#     def run(self):
#         """Jalankan otomatisasi sepenuhnya tanpa input manual"""
#         print("🟡 Membuka halaman Inaproc...")
#         print("➡️ Pastikan Chrome sudah terbuka dengan '--remote-debugging-port=9222'")

#         # ✨ Delay otomatis 2 detik sebelum mulai
#         print("⏳ Menunggu halaman Inaproc siap (2 detik)...")
#         time.sleep(2)

#         halaman, i = 1, 0
#         while True:
#             print(f"\n📄 Halaman {halaman}")
#             tombol_list = self.ambil_semua_lihat_detail()
#             if not tombol_list:
#                 print("🚫 Tidak ada pesanan di halaman ini.")
#                 break

#             for index in range(len(tombol_list)):
#                 try:
#                     i += 1
#                     tombol_list = self.ambil_semua_lihat_detail()
#                     tombol = tombol_list[index]
#                     nama_p = self.ambil_nama_produk(tombol, i)
#                     self.set_download_dir(nama_p)

#                     self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", tombol)
#                     self.driver.execute_script("arguments[0].click();", tombol)

#                     self.proses_dokumen()
#                     self.klik_tombol_svg_footer()
#                 except Exception as e:
#                     print(f"⚠️ Gagal proses {i}: {e}")

#             if not self.klik_tombol_pagination_berikutnya(halaman):
#                 print("🏁 Semua halaman selesai diproses.")
#                 break
#             halaman += 1


# # ==============================================
# # ✅ Fungsi utama agar bisa dijalankan dari Streamlit
# # ==============================================
# def main():
#     bot = InaprocAutoClicker()
#     bot.run()


# # ==============================================
# # ✅ Tetap bisa dijalankan langsung
# # ==============================================
# if __name__ == "__main__":
#     main()
