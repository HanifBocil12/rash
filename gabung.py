import os
from PyPDF2 import PdfMerger

# ==== KONFIGURASI ====
folder_root = r"C:\raja iblis\downloads\i"   # folder utama berisi subfolder produk
folder_output = r"C:\raja iblis\hasil\i"
prioritas = ["pesanan", "adendum", "bast", "fp"]
# ======================

if not os.path.exists(folder_root):
    print(f"❌ Folder root tidak ditemukan: {folder_root}")
    exit()

os.makedirs(folder_output, exist_ok=True)
print(f"📂 Folder output: {folder_output}")

def prioritas_index(nama):
    nama_lc = nama.lower()
    for i, p in enumerate(prioritas):
        if p in nama_lc:
            return i
    return len(prioritas)

def gabung_pdf_dalam_folder(folder_path):
    pdf_files = [f for f in os.listdir(folder_path) if f.lower().endswith(".pdf")]
    if not pdf_files:
        print(f"⚠️ Tidak ada PDF di {folder_path}, lewati.")
        return None

    # urutkan berdasarkan prioritas dan nama
    pdf_files.sort(key=lambda x: (prioritas_index(x), x.lower()))

    merger = PdfMerger()
    for f in pdf_files:
        full_path = os.path.join(folder_path, f)
        try:
            merger.append(full_path)
            print(f"  ➕ {f}")
        except Exception as e:
            print(f"  ⚠️ Gagal tambah {f}: {e}")

    nama_folder = os.path.basename(folder_path.rstrip("\\/"))
    output_path = os.path.join(folder_output, f"{nama_folder}.pdf")

    merger.write(output_path)
    merger.close()
    print(f"✅ Gabung selesai: {output_path}\n")

# === Proses semua subfolder ===
for subfolder in os.listdir(folder_root):
    path_sub = os.path.join(folder_root, subfolder)
    if os.path.isdir(path_sub):
        print(f"\n📁 Memproses folder: {subfolder}")
        gabung_pdf_dalam_folder(path_sub)

print("\n🏁 Semua selesai!")
