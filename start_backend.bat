@echo off
echo ========================================
echo Starting XGBoost Forecast API Backend
echo ========================================
echo.

cd backend

echo Checking if models exist...
if not exist "models\demand_h1.joblib" (
    echo.
    echo WARNING: Model files not found!
    echo Please copy your trained models to backend\models\
    echo The API will run in MOCK MODE without models.
    echo.
    echo See INTEGRATION_GUIDE.md for instructions.
    echo.
    pause
)

echo.
echo Installing/checking dependencies...
pip install -r requirements.txt

echo.
echo Starting Flask API on port 5000...
echo.
python app.py

pause
