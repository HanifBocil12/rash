import os
import sys
import argparse
from PyPDF2 import PdfMerger

# Paksa stdout ke UTF-8
sys.stdout.reconfigure(encoding='utf-8')
# ===============================
# Prioritas urutan file PDF
# ===============================
PRIORITAS = ["pesanan", "adendum", "bast", "fp"]

def prioritas_index(nama):
    """Menentukan urutan prioritas berdasarkan nama file."""
    nama_lc = nama.lower()
    for i, p in enumerate(PRIORITAS):
        if p in nama_lc:
            return i
    return len(PRIORITAS)

def gabung_pdf_dalam_folder(folder_path, folder_output):
    """Gabungkan semua file PDF dalam satu folder menjadi satu file PDF."""
    pdf_files = [f for f in os.listdir(folder_path) if f.lower().endswith(".pdf")]
    if not pdf_files:
        print(f"⚠️ Tidak ada PDF di {folder_path}, lewati.")
        return None

    # Urutkan berdasarkan prioritas dan nama file
    pdf_files.sort(key=lambda x: (prioritas_index(x), x.lower()))

    merger = PdfMerger()
    for f in pdf_files:
        full_path = os.path.join(folder_path, f)
        try:
            merger.append(full_path)
            print(f"  ➕ Ditambahkan: {f}")
        except Exception as e:
            print(f"  ⚠️ Gagal menambahkan {f}: {e}")

    nama_folder = os.path.basename(folder_path.rstrip("\\/"))
    output_path = os.path.join(folder_output, f"{nama_folder}.pdf")

    try:
        merger.write(output_path)
        print(f"✅ Gabung selesai: {output_path}\n")
    finally:
        merger.close()

    return output_path

# ===============================
# MAIN PROGRAM
# ===============================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gabungkan semua PDF dalam subfolder.")
    parser.add_argument("--input_folder", required=True, help="Folder utama berisi subfolder PDF")
    parser.add_argument("--output_folder", required=True, help="Folder tujuan hasil gabungan PDF")
    args = parser.parse_args()

    folder_root = args.input_folder
    folder_output = args.output_folder

    # Validasi input
    if not os.path.exists(folder_root):
        print(f"❌ Folder input tidak ditemukan: {folder_root}")
        exit(1)

    os.makedirs(folder_output, exist_ok=True)
    print(f"📂 Folder output: {folder_output}")

    # Proses semua subfolder di folder input
    subfolders = [f for f in os.listdir(folder_root) if os.path.isdir(os.path.join(folder_root, f))]

    if not subfolders:
        print("⚠️ Tidak ada subfolder ditemukan di input_folder.")
        exit(0)

    for subfolder in subfolders:
        path_sub = os.path.join(folder_root, subfolder)
        print(f"\n📁 Memproses folder: {subfolder}")
        gabung_pdf_dalam_folder(path_sub, folder_output)

    print("\n🏁 Semua selesai!")