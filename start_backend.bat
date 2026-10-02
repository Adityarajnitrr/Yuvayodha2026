@echo off
echo Installing required packages...
C:\Windows\py.exe -m pip install flask flask-cors numpy pandas scikit-learn xgboost joblib

echo.
echo Starting XGBoost backend...
C:\Windows\py.exe backend\app.py

pause
