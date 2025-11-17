@echo off
REM ========================================================
REM [Auto-hide saat run di Scheduler]
REM ========================================================
REM [Dihapus — handled by VBS launcher]
REM if not "%1"=="hidden" (
REM     powershell -WindowStyle Hidden -Command "Start-Process '%~f0' -ArgumentList 'hidden'"
REM     exit /b
REM )


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
set "NEED_INSTALL_PYTHON="
where py >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    set "NEED_INSTALL_PYTHON=1"
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
set "INSTALL_REQUIRED="
IF EXIST "requirements.txt" (
    echo 🔍 Mengecek dependencies...
    for /f %%p in ('type requirements.txt') do (
        py -m pip show %%p >nul 2>&1
        if errorlevel 1 set "INSTALL_REQUIRED=1"
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
REM 3️⃣ Jalankan Chrome dengan remote debugging
REM =============================
echo ▶ Menjalankan Chrome dengan remote debugging...
REM taskkill /IM chrome.exe /F >nul 2>&1
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug"
timeout /t 5 >nul

REM =============================
REM 4️⃣ Tambahkan .vbs wrapper ke Task Scheduler agar auto-run saat startup (silent)
REM =============================
set "TASK_NAME=AutoRunAgent"
set "BAT_PATH=%~f0"
set "VBS_PATH=%~dp0auto_run_silent.vbs"

REM Jika belum ada auto_run_silent.vbs, buat otomatis
if not exist "%VBS_PATH%" (
    (
        echo Set WshShell = CreateObject("WScript.Shell")
        echo Set sh = CreateObject("WScript.Shell")
        echo Set execs = GetObject("winmgmts:").ExecQuery("SELECT * FROM Win32_Process WHERE Name='cmd.exe'")
        echo alreadyRunning = False
        echo For Each p In execs
        echo   If InStr(LCase(p.CommandLine), "start_agent.bat") ^> 0 Then
        echo       alreadyRunning = True
        echo       Exit For
        echo   End If
        echo Next
        echo If Not alreadyRunning Then
        echo   WshShell.Run """%BAT_PATH%"" hidden", 0, False
        echo End If
    ) > "%VBS_PATH%"
)


echo 🧠 Mengecek Task Scheduler "%TASK_NAME%"...
schtasks /Query /TN "%TASK_NAME%" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Task "%TASK_NAME%" sudah ada, lewati pembuatan ulang.
) else (
    echo 🧠 Membuat Task Scheduler "%TASK_NAME%"...
    schtasks /Create /SC ONLOGON /RL HIGHEST /TN "%TASK_NAME%" ^
     /TR "wscript.exe \"%VBS_PATH%\"" /F >nul 2>&1

    if %ERRORLEVEL% EQU 0 (
        echo ✅ Task Scheduler berhasil dibuat: %TASK_NAME%
    ) else (
        echo ❌ Gagal membuat Task Scheduler: %TASK_NAME%
    )
)


if %ERRORLEVEL% EQU 0 (
    echo ✅ Task Scheduler berhasil dibuat: %TASK_NAME%
) else (
    echo ❌ Gagal membuat Task Scheduler: %TASK_NAME%
)


REM =============================
REM 5️⃣ Jalankan run_agent.vbs secara silent lalu tutup otomatis
REM =============================
set "VBS_PATH=C:\web\zip\Perlengkapan\run_agent.vbs"

REM === Tambahan logika visible/silent ===
if defined NEED_INSTALL_PYTHON (
    echo ⚙️ Instalasi Python baru saja dilakukan, tetap tampil agar pengguna melihat progres.
    echo Setelah selesai, script ini akan berjalan silent otomatis.
    timeout /t 5 >nul
    goto SKIP_SILENT
)
if defined INSTALL_REQUIRED (
    echo ⚙️ Dependencies baru saja diinstall, tetap tampil agar pengguna melihat progres.
    echo Setelah selesai, script ini akan berjalan silent otomatis.
    timeout /t 5 >nul
    goto SKIP_SILENT
)

REM === Mode silent (Python & deps sudah lengkap) ===
if exist "%VBS_PATH%" (
    echo ▶ Menjalankan run_agent.vbs secara silent...
    wscript "%VBS_PATH%" //B //Nologo
    exit /b
)

:SKIP_SILENT
if exist "%VBS_PATH%" (
    echo ▶ Menjalankan run_agent.vbs (non-silent, karena masih setup)...
    wscript "%VBS_PATH%"
)

REM =============================
REM 6️⃣ Selesai — tutup otomatis
REM =============================
exit
