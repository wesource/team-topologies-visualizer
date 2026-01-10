$env:READ_ONLY_MODE = "true"
.\venv\Scripts\python.exe -m uvicorn main:app --port 8001
