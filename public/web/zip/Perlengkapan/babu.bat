@echo off
REM ========================================================
REM [Auto-hide saat run di Scheduler]
REM ========================================================
if not "%1"=="hidden" (
    powershell -WindowStyle Hidden -Command "Start-Process '%~f0' -ArgumentList 'hidden'"
    exit /b
)

REM ========================================================
REM [Auto Admin Elevation]
REM ========================================================
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo 🟡 Script belum dijalankan sebagai Administrator, mencoba ulang dengan Run as Admin...
    powershell -Command "Start-Process '%~f0' -Verb runAs"
    exit /b
)

REM ========================================================
REM Auto install Python (latest), dependencies (skip if installed), jalankan chrome.py & agent.py
REM ========================================================

cd /d %~dp0 || (
    echo ❌ Gagal pindah ke folder script
    pause
    exit /b
)

REM =============================
REM 1️⃣ Cek Python launcher
REM =============================
where py >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo 🐍 Python belum terinstall. Mengunduh versi terbaru dari python.org...
    set "PYTHON_INSTALLER=%TEMP%\python_latest_installer.exe"

    powershell -Command ^
        "$url = (Invoke-WebRequest -Uri 'https://www.python.org/downloads/windows/').Links | Where-Object href -Match 'python-[0-9]+\.[0-9]+\.[0-9]+-amd64\.exe$' | Select-Object -First 1 -ExpandProperty href; " ^
        "$full = 'https://www.python.org' + $url; " ^
        "Write-Host '🔽 Mengunduh: ' $full; " ^
        "Invoke-WebRequest -Uri $full -OutFile '%PYTHON_INSTALLER%'"

    echo 🚀 Menginstall Python secara silent...
    "%PYTHON_INSTALLER%" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0

    timeout /t 10 >nul
    echo ✅ Python versi terbaru berhasil diinstall
)

REM =============================
REM 2️⃣ Cek dan install dependencies (skip kalau sudah)
REM =============================
IF EXIST "requirements.txt" (
    echo 🔍 Mengecek dependencies...
    for /f %%p in ('type requirements.txt') do (
        py -m pip show %%p >nul 2>&1
        if %ERRORLEVEL% NEQ 0 (
            set INSTALL_REQUIRED=1
        )
    )

    if defined INSTALL_REQUIRED (
        echo 📦 Beberapa dependencies belum ada. Menginstall...
        py -m pip install -r requirements.txt
    ) else (
        echo ✅ Semua dependencies sudah terinstall. Lewati langkah ini.
    )
) ELSE (
    echo ⚠ requirements.txt tidak ditemukan. Lewati install package.
)

REM =============================
REM 3️⃣ Jalankan chrome.py dulu (background)
REM =============================
echo ▶ Menjalankan chrome.py...
start "" py chrome.py
timeout /t 5 >nul

REM =============================
REM 4️⃣ Tambahkan .bat ini ke Task Scheduler agar auto-run saat startup
REM =============================
set "TASK_NAME=AutoRunAgent"
set "BAT_PATH=%~f0"

echo 🧠 Membuat Task Scheduler "%TASK_NAME%"...
schtasks /Delete /TN "%TASK_NAME%" /F >nul 2>&1
schtasks /Create /SC ONLOGON /RL HIGHEST /TN "%TASK_NAME%" /TR "\"%BAT_PATH%\"" /F >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ Task Scheduler berhasil dibuat: %TASK_NAME%
) else (
    echo ❌ Gagal membuat Task Scheduler: %TASK_NAME%
)

REM =============================
REM 5️⃣ Jalankan run_agent.vbs secara silent
REM =============================
set "VBS_PATH=C:\web\zip\Perlengkapan\run_agent.vbs"
if exist "%VBS_PATH%" (
    echo ▶ Menjalankan run_agent.vbs...
    wscript "%VBS_PATH%"
) else (
    echo ⚠ File run_agent.vbs tidak ditemukan di: %VBS_PATH%
)

echo.
echo 🏁 Selesai. Tekan tombol apapun untuk keluar...
pause
