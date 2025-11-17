import time
import subprocess
import requests
import os
import sys
from datetime import datetime

API_URL = "https://api-web.up.railway.app"  # URL Railway API Flask kamu
WORKDIR = r"C:\web\zip\Perlengkapan"        # Direktori script lokal

os.chdir(WORKDIR)
print(f"[AGENT] 📁 Working directory: {WORKDIR}")
print(f"[AGENT] 🔗 Terhubung ke API: {API_URL}\n")

SCRIPT_MAP = {
    "xls": "xls2.py",
    "sheet": "sheet_auto.py",
    "status": "inaproc_status_agent.py",
    "perfect": "perfecfast.py",
    "gabung": "gabung.py",
    "batal": "batal.py",
    "search_batal": "fa.py",
    "sheet_batal": "sheet_batal.py",
}

def reset_flag():
    """Reset flag ke IDLE di server"""
    try:
        requests.post(f"{API_URL}/reset", timeout=5)
        print("[AGENT] 🔄 Flag di-reset ke IDLE")
    except Exception as e:
        print(f"[AGENT] ⚠️ Gagal reset flag: {e}")

def kirim_hasil(task, code, stdout, stderr):
    """Kirim hasil eksekusi ke server API"""
    try:
        requests.post(
            f"{API_URL}/result",
            json={
                "task": task,
                "exit_code": code,
                "stdout": stdout[-3000:],  # batasi panjang
                "stderr": stderr[-2000:],
                "timestamp": datetime.now().isoformat()
            },
            timeout=10
        )
        print("[AGENT] 📤 Hasil dikirim ke API.")
    except Exception as e:
        print(f"[AGENT] ⚠️ Gagal kirim hasil ke API: {e}")

# Reset flag saat start
reset_flag()
print("[AGENT] 🔎 Memulai monitoring perintah dari API...\n")

while True:
    try:
        # Ambil status dari server
        res = requests.get(f"{API_URL}/state", timeout=5)
        if res.status_code != 200:
            print(f"[AGENT] ⚠️ API status {res.status_code}, coba lagi nanti.")
            time.sleep(5)
            continue

        data = res.json()
        flag = data.get("flag", "IDLE")
        task = data.get("last_task")
        params = data.get("last_params", {}) or {}
        print(f"[AGENT] 🧩 Flag={flag}, Task={task}, Params={params}")

        if flag == "RUN" and task:
            script_name = SCRIPT_MAP.get(task)
            if not script_name:
                print(f"[AGENT] ⚠️ Task '{task}' tidak dikenali.")
                reset_flag()
                continue

            script_path = os.path.join(WORKDIR, script_name)
            if not os.path.exists(script_path):
                print(f"[AGENT] ❌ File {script_path} tidak ditemukan.")
                reset_flag()
                continue

            # Validasi folder input/output jika ada
            input_folder = params.get("input_folder")
            output_folder = params.get("output_folder")

            # Pastikan path diubah menjadi raw string agar backslash aman
            if input_folder:
                input_folder = rf"{input_folder}"
            if output_folder:
                output_folder = rf"{output_folder}"

            if input_folder and not os.path.exists(input_folder):
                msg = f"❌ Folder input tidak ditemukan: {input_folder}"
                print(f"[AGENT] {msg}")
                kirim_hasil(task, 1, "", msg)
                reset_flag()
                continue

            if output_folder:
                os.makedirs(output_folder, exist_ok=True)
            print(f"[AGENT] 🚀 Menjalankan task '{task}' ({script_name}) ...")

            # Bangun command
            cmd = [sys.executable, script_path]
            if isinstance(params, dict) and params:
                for key, val in params.items():
                    cmd.append(f"--{key}")
                    cmd.append(str(val))
            # Tambahkan start_row jika ada di params
            if task == "batal" and "start_row" in params:
                cmd.append("--start_row")
                cmd.append(str(params["start_row"]))

            # Ambil Excel path opsional dari API
            try:
                excel_path_res = requests.get(f"{API_URL}/excel_path", timeout=5)
                if excel_path_res.ok:
                    excel_data = excel_path_res.json()
                    path_excel = excel_data.get("excel_path")
                    if path_excel:
                        wb_path = r"{}".format(path_excel)
                        print(f"[AGENT] 📄 Menggunakan Excel path: {wb_path}")
                        cmd.append("--excel_path")
                        cmd.append(path_excel)
            except Exception as e:
                print(f"[AGENT] ⚠️ Gagal ambil Excel path: {e}")

            # Jalankan subprocess
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
                errors="replace"
            )
            stdout, stderr = process.communicate()

            print(f"[AGENT] ✅ Task '{task}' selesai (exit code {process.returncode})")
            if stdout:
                print("[AGENT] --- STDOUT ---")
                print(stdout)
            if stderr:
                print("[AGENT] --- STDERR ---")
                print(stderr)

            # Kirim hasil eksekusi ke API
            kirim_hasil(task, process.returncode, stdout, stderr)

            # Reset status
            reset_flag()
        else:
            print("[AGENT] ⏳ Tidak ada task aktif, menunggu...")

    except requests.exceptions.ConnectionError:
        print("[AGENT] 🌐 Tidak dapat menghubungi API (connection error).")
    except Exception as e:
        print(f"[AGENT] 💥 Error polling: {e}")

    time.sleep(2)
