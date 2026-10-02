# 🚀 Deploy Your XGBoost ML Model Website

## What This Is

A complete power demand forecasting website powered by your XGBoost machine learning model, ready to deploy online for **FREE**.

## 🎯 Quick Links

- **Start Here**: [`QUICK_DEPLOY.md`](QUICK_DEPLOY.md) - Deploy in 3 steps
- **Detailed Guide**: [`DEPLOYMENT_STEP_BY_STEP.md`](DEPLOYMENT_STEP_BY_STEP.md) - Full walkthrough
- **Local Setup**: [`SETUP.md`](SETUP.md) - Run on your computer
- **Python Install**: [`INSTALL_PYTHON.md`](INSTALL_PYTHON.md) - If you need Python

## 📦 What's Included

### Frontend (React + TypeScript)
- Power grid monitoring dashboard
- Demand forecasting page with ML predictions
- Interactive charts (Recharts)
- Responsive design (Tailwind CSS)

### Backend (Python + Flask)
- XGBoost model API
- 8 trained models (demand + solar × 4 horizons)
- Real-time predictions
- Production-ready with Gunicorn

### ML Models (XGBoost)
- Demand forecasting: 15/30/45/60 minutes ahead
- Solar generation forecasting
- Trained on synthetic Raipur dataset
- ~5.8% MAPE for 60-min demand
- ~11.3% nMAE for 60-min solar

## 🌐 Deployment Options

### Recommended: Vercel + Render
- ✅ **100% Free**
- ✅ Auto-deploy on git push
- ✅ Global CDN
- ✅ Free SSL
- ⚠️ Backend sleeps after 15 min (free tier)

### Your URLs After Deployment
```
Frontend: https://your-project.vercel.app
Backend:  https://your-api.onrender.com
```

## ⚡ Quick Deploy (30 minutes)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Deploy XGBoost ML model"
git remote add origin https://github.com/YOUR-USERNAME/YuvaYodhaProjectSchneider.git
git push -u origin main
```

### 2. Deploy Backend (Render)
1. Go to https://render.com → Sign up with GitHub
2. New + → Web Service → Connect your repo
3. Build: `cd backend && pip install -r requirements.txt`
4. Start: `cd backend && gunicorn -c gunicorn_config.py app:app`
5. Deploy → Copy your URL

### 3. Deploy Frontend (Vercel)
1. Update `.env.production` with your Render URL
2. Push changes
3. Go to https://vercel.com → Sign up with GitHub
4. New Project → Import repo
5. Add env var: `VITE_API_BASE=https://your-api.onrender.com/api`
6. Deploy → Visit your site!

## 📊 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | Fast, modern web app |
| UI | Tailwind CSS | Responsive design |
| Charts | Recharts | Data visualization |
| Backend | Flask | Python web server |
| ML | XGBoost | Demand/solar forecasting |
| Server | Gunicorn | Production WSGI server |
| Hosting | Vercel + Render | Free deployment |

## 📁 Project Structure

```
YuvaYodhaProjectSchneider/
├── src/                    # React frontend
│   ├── pages/forecast/     # Forecast page (uses ML)
│   └── api/gridApi.ts      # API client
├── backend/                # Python Flask API
│   ├── models/             # XGBoost models
│   │   ├── demand_h*.joblib
│   │   └── solar_h*.joblib
│   └── app.py              # Flask server
├── .env.production         # Production config
├── vercel.json             # Vercel config
└── render.yaml             # Render config
```

## 🎓 Your ML Model

### Training (Colab)
Your `raipur_forecasting_xgboost_colab.ipynb` trained:
- 8 XGBoost models
- On synthetic 30-zone Raipur grid data
- Features: time, weather, current readings
- Jan-Mar 2024 training data

### Performance
| Horizon | Demand MAPE | Solar nMAE |
|---------|-------------|------------|
| 15 min  | ~2.5%       | ~6.2%      |
| 30 min  | ~3.8%       | ~8.1%      |
| 45 min  | ~4.9%       | ~9.7%      |
| 60 min  | ~5.8%       | ~11.3%     |

Better than baseline persistence forecasting!

### Integration
Your models now power the website's forecast page:
- Load `.joblib` files on startup
- Generate predictions via API
- Display in interactive charts
- Anyone can use it online!

## 💰 Cost

**Free Tier:**
- Frontend: Vercel (unlimited)
- Backend: Render (750 hrs/month)
- Total: **$0/month**

**Optional Upgrade:**
- Always-on backend: $7/month
- More RAM: $21/month

For demo/portfolio/competition: **FREE is perfect!**

## 🧪 Test Deployment

### Backend Health
```bash
curl https://your-api.onrender.com/api/health
```

Expected:
```json
{"status": "ok", "models_loaded": true}
```

### Frontend
1. Visit your Vercel URL
2. Click "Demand Forecast"
3. Click "Show Forecast"
4. See XGBoost predictions!

## 📚 Documentation

| File | Description | Read When |
|------|-------------|-----------|
| [`QUICK_DEPLOY.md`](QUICK_DEPLOY.md) | 1-page deploy guide | Starting deployment |
| [`DEPLOYMENT_STEP_BY_STEP.md`](DEPLOYMENT_STEP_BY_STEP.md) | Detailed walkthrough | During deployment |
| [`DEPLOYMENT_SUMMARY.md`](DEPLOYMENT_SUMMARY.md) | Complete overview | Understanding system |
| [`SETUP.md`](SETUP.md) | Local development | Running locally |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | System design | Technical details |
| [`STATUS.md`](STATUS.md) | Current status | Checking progress |

## 🎯 Use Cases

Perfect for:
- ✅ Competition submissions (Yuva Yodha Challenge)
- ✅ Portfolio projects
- ✅ Resume/LinkedIn
- ✅ Job interviews (live demo!)
- ✅ Academic presentations
- ✅ Sharing with friends/colleagues

## 🔧 Local Development

### Prerequisites
- Node.js 16+
- Python 3.8+ (for backend)

### Run Locally

**Frontend:**
```bash
npm install
npm run dev
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

Visit: http://localhost:5173

## 🚀 Deployment Flow

```
1. Code Ready ✅
      ↓
2. Push to GitHub
      ↓
3. Deploy Backend (Render)
      ↓
4. Get Backend URL
      ↓
5. Update .env.production
      ↓
6. Deploy Frontend (Vercel)
      ↓
7. Share Your URL! 🎉
```

## ✨ Features

### Frontend
- Real-time demand forecasting
- Interactive 24-hour charts
- Demand vs supply visualization
- Peak demand prediction
- Renewable energy percentage
- Areas needing attention
- Mobile responsive

### Backend API
- `/api/health` - System status
- `/api/forecast` - Get predictions
- `/api/snapshot` - Current state
- CORS enabled
- Error handling
- Logging

### ML Capabilities
- Demand forecasting (15/30/45/60 min)
- Solar generation forecasting
- Day/night solar handling
- Uncertainty bands (P10/P90)
- Supply mix optimization

## 🛠️ Maintenance

### Update Models
1. Train new models in Colab
2. Replace files in `backend/models/`
3. Commit and push
4. Render auto-deploys

### Update UI
1. Edit React components
2. Commit and push
3. Vercel auto-deploys

## 🔒 Security

✅ HTTPS/SSL (free)  
✅ CORS configured  
✅ Environment variables  
✅ Input validation  
✅ Error handling  

## 📈 Performance

**Frontend (Vercel):**
- Initial load: <2s
- Global CDN
- Auto-scaling

**Backend (Render Free):**
- Cold start: ~30s (after sleep)
- Warm requests: <200ms
- Model inference: ~50ms

**Tip:** Use UptimeRobot to keep backend awake

## 🆘 Troubleshooting

### Backend sleeps
✅ Normal on free tier  
✅ First request wakes it (~30s)  
✅ Use UptimeRobot to prevent sleep  

### Models don't load
✅ Check Render logs  
✅ Verify files < 500MB  
✅ Try paid tier if needed  

### CORS errors
✅ Check `.env.production`  
✅ Verify backend URL  
✅ Redeploy frontend  

## 🎓 Learn More

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [XGBoost Documentation](https://xgboost.readthedocs.io)
- [Flask Documentation](https://flask.palletsprojects.com)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

## 🤝 Support

**Questions about:**
- Deployment: See `DEPLOYMENT_STEP_BY_STEP.md`
- Local setup: See `SETUP.md`
- Python install: See `INSTALL_PYTHON.md`
- Architecture: See `ARCHITECTURE.md`

## 📝 License

This project is for educational and competition purposes.

## 🏆 Credits

- **ML Model**: XGBoost demand & solar forecasting
- **Dataset**: Synthetic Raipur 30-zone grid data
- **Competition**: Yuva Yodha Challenge - Schneider Electric
- **Framework**: React + Flask full-stack

## 🎉 Ready to Deploy?

**Start here:** [`QUICK_DEPLOY.md`](QUICK_DEPLOY.md)

Get your project online in 30 minutes! 🚀

---

**After deployment, your URLs:**
```
Frontend: https://____________.vercel.app
Backend:  https://____________.onrender.com
```

**Share them everywhere!** This is your portfolio piece. 💪
