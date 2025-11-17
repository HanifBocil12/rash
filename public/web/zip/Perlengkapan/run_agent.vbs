Option Explicit

Dim WshShell, fso, pythonwPath, scriptPath, chosenPython, cmd
Dim tempFile, ts, line

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' --- Path spesifik user (bisa kosong atau tidak ada) ---
pythonwPath = "C:\Users\admin\AppData\Local\Python\bin\python.exe"

' --- Path ke agent.py ---
scriptPath = "C:\web\zip\Perlengkapan\agent.py"

' --- Fungsi helper: cek file ada ---
Function FileExists(path)
    FileExists = False
    If Trim(path) <> "" Then
        On Error Resume Next
        FileExists = fso.FileExists(path)
        On Error GoTo 0
    End If
End Function

' --- Fungsi: cari python executable via where, output ke file sementara ---
Function FindPythonViaWhere(exeName)
    Dim tempFilePath, result
    result = ""
    tempFilePath = WshShell.ExpandEnvironmentStrings("%TEMP%") & "\python_path.txt"

    ' Jalankan hidden CMD dan arahkan output ke file
    WshShell.Run "%COMSPEC% /c where " & exeName & " > """ & tempFilePath & """", 0, True

    ' Baca file dan ambil path pertama yang valid
    If fso.FileExists(tempFilePath) Then
        Set ts = fso.OpenTextFile(tempFilePath, 1)
        Do While Not ts.AtEndOfStream
            line = Trim(ts.ReadLine)
            If line <> "" And FileExists(line) Then
                result = line
                Exit Do
            End If
        Loop
        ts.Close
        fso.DeleteFile tempFilePath
    End If

    FindPythonViaWhere = result
End Function

' --- Pilih Python ---
chosenPython = ""

' 1) Pakai path spesifik dulu jika ada
If FileExists(pythonwPath) Then
    chosenPython = pythonwPath
End If

' 2) Jika tidak ada, cari python.exe dulu supaya window muncul
If chosenPython = "" Then chosenPython = FindPythonViaWhere("python.exe")

' 3) Jika tidak ada python.exe, fallback ke pythonw.exe
If chosenPython = "" Then chosenPython = FindPythonViaWhere("pythonw.exe")

' 4) Jika tetap tidak ada, tampilkan error dan keluar
If chosenPython = "" Then
    WshShell.Popup "Tidak menemukan pythonw/python di sistem. Pastikan Python terinstall dan PATH sudah benar.", 0, "Error", 16
    WScript.Quit 1
End If

' --- Siapkan command (quotes aman) ---
cmd = """" & chosenPython & """" & " " & """" & scriptPath & """"

' --- Jalankan script ---
' Parameter 1 = normal window (bisa diklik), False = tidak menunggu proses selesai
WshShell.Run cmd, 0, False
