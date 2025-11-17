# test_attach.py
import time
from win32com.client import GetObject

for i in range(3):
    try:
        excel = GetObject(None, "Excel.Application")
        print("OK: attached to Excel")
        break
    except Exception as e:
        print("FAIL attach:", e)
        time.sleep(1)
