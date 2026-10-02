# Deploy Your ML Model Website (Free Hosting)

## Overview

Deploy your XGBoost forecasting website online so anyone can access it via a URL.

**Recommended Stack (100% Free):**
- Frontend: **Vercel** (free, fast, easy)
- Backend: **Render** (free tier, perfect for Python)

**Final Result:**
- Frontend URL: `https://your-project.vercel.app`
- Backend API: `https://your-api.onrender.com`
- Anyone can access your website and use your ML model!

---

## Option 1: Vercel + Render (Easiest, Recommended)

### Part A: Deploy Backend to Render

#### Step 1: Prepare Backend for Deployment

The backend is already configured! Just need to add one file:

Create `backend/render.yaml` (already done for you below)

#### Step 2: Create Render Account

1. Go to: https://render.com
2. Sign up with GitHub (free)
3. Verify your email

#### Step 3: Deploy Backend

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Add ML model backend"
   git push
   ```

2. **In Render Dashboard**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `YuvaYodhaProjectSchneider` repo
   - Configure:
     - **Name**: `yuva-yodha-api` (or your choice)
     - **Environment**: Python 3
     - **Build Command**: `cd backend && pip install -r requirements.txt`
     - **Start Command**: `cd backend && gunicorn app:app`
     - **Instance Type**: Free
   - Click "Create Web Service"

3. **Wait 5-10 minutes** for deployment

4. **Copy your API URL**: Something like `https://yuva-yodha-api.onrender.com`

#### Step 4: Test Backend

```bash
curl https://yuva-yodha-api.onrender.com/api/health
```

Should return: `{"status": "ok", "models_loaded": true}`

### Part B: Deploy Frontend to Vercel

#### Step 1: Update Frontend Configuration

Edit `.env.production`:
```env
VITE_API_BASE=https://yuva-yodha-api.onrender.com/api
```
(Use your actual Render URL)

#### Step 2: Create Vercel Account

1. Go to: https://vercel.com
2. Sign up with GitHub (free)

#### Step 3: Deploy Frontend

1. **In Vercel Dashboard**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select `YuvaYodhaProjectSchneider`
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `./`
     - **Environment Variables**: Add `VITE_API_BASE` with your Render URL
   - Click "Deploy"

2. **Wait 2-3 minutes**

3. **Your site is live!** 🎉
   - URL: `https://yuva-yodha-project.vercel.app`

### Part C: Test Everything

1. Visit your Vercel URL
2. Navigate to "Demand Forecast" page
3. Click "Show Forecast"
4. Should see real predictions from your XGBoost model!

---

## Option 2: GitHub Pages + Railway (Alternative)

### Part A: Deploy Backend to Railway

#### Step 1: Create Railway Account

1. Go to: https://railway.app
2. Sign up with GitHub

#### Step 2: Deploy

1. Click "New Project" → "Deploy from GitHub repo"
2. Select your repository
3. Railway auto-detects Python
4. Add environment variables if needed
5. Deploy!

#### Step 3: Get Public URL

- Railway gives you: `https://your-project.up.railway.app`

### Part B: Deploy Frontend to GitHub Pages

Already configured in your repo! Just:

1. Update `.env.production` with Railway URL
2. Build:
   ```bash
   npm run build
   ```
3. Push to GitHub:
   ```bash
   git add dist -f
   git commit -m "Deploy"
   git push
   ```
4. Enable GitHub Pages in repo settings
5. Live at: `https://yourusername.github.io/YuvaYodhaProjectSchneider/`

---

## Important Files for Deployment

### 1. Backend Production Server (Gunicorn)

Create `backend/gunicorn_config.py`:
```python
bind = "0.0.0.0:5000"
workers = 2
timeout = 120
```

### 2. Backend Procfile (for Render/Railway)

Already handled in instructions above.

### 3. Environment Variables

**Production .env** (`.env.production`):
```env
VITE_API_BASE=https://your-actual-backend-url.com/api
```

---

## Cost Breakdown

### Free Tier Limits

**Render (Backend):**
- ✅ 512 MB RAM
- ✅ Shared CPU
- ⚠️ Sleeps after 15 min inactivity (wakes in ~30 seconds)
- ✅ 750 hours/month free

**Vercel (Frontend):**
- ✅ Unlimited bandwidth
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ 100 GB bandwidth/month

**Total Cost: $0/month** 💰

### Paid Upgrade (Optional, ~$7-20/month)

If you need:
- No sleep on inactivity
- More RAM for models
- Faster response times

**Render:** $7/month for always-on  
**Railway:** $5/month for always-on

---

## Performance Optimization

### Backend Performance

**Problem**: Free tier sleeps after inactivity  
**Solution**: Add a keep-alive service

Create `backend/keep_alive.py`:
```python
import requests
import time

API_URL = "https://your-api.onrender.com/api/health"

while True:
    try:
        requests.get(API_URL)
        print("Ping sent")
    except:
        pass
    time.sleep(14 * 60)  # Every 14 minutes
```

Or use: https://uptimerobot.com (free service to ping your API)

### Model Loading Speed

Models load once on startup (~3 seconds). After that, predictions are fast (<200ms).

---

## Troubleshooting

### Backend doesn't load models

**Issue**: Model files too large for free tier  
**Solution**: 
1. Use model compression
2. Or upgrade to paid tier
3. Or use smaller models

### CORS errors

**Issue**: Frontend can't call backend  
**Solution**: Check `flask-cors` is installed and `CORS(app)` is in `app.py` (already done)

### Backend sleeps

**Issue**: First request after inactivity takes 30 seconds  
**Solutions**:
1. Accept the delay (free tier limitation)
2. Use UptimeRobot to ping every 5 min
3. Upgrade to paid tier ($7/month)

### Frontend 404 on refresh

**Issue**: Vite routing on production  
**Solution**: Vercel handles this automatically. For GitHub Pages, add `vercel.json` (already configured).

---

## Security for Production

### Add to Backend

1. **Rate Limiting**:
```python
from flask_limiter import Limiter

limiter = Limiter(app, default_limits=["100 per hour"])
```

2. **API Key** (optional):
```python
@app.before_request
def check_api_key():
    key = request.headers.get('X-API-Key')
    if key != os.environ.get('API_KEY'):
        return jsonify({'error': 'Unauthorized'}), 401
```

3. **HTTPS Only**: Both Vercel and Render provide free SSL

---

## Monitoring

### Free Tools

1. **Vercel Analytics**: Built-in, shows traffic
2. **Render Logs**: View backend logs in dashboard
3. **UptimeRobot**: Monitor uptime (free)

### Check Health

```bash
# Backend
curl https://your-api.onrender.com/api/health

# Frontend
curl https://your-site.vercel.app
```

---

## Update Deployment

### Update Backend (New Models)

1. Update model files in `backend/models/`
2. Push to GitHub:
   ```bash
   git add backend/models/
   git commit -m "Update models"
   git push
   ```
3. Render auto-deploys (or click "Manual Deploy")

### Update Frontend

1. Make changes
2. Push to GitHub
3. Vercel auto-deploys in ~2 minutes

---

## Domain Setup (Optional)

### Custom Domain

Both Vercel and Render support custom domains (free):

**Vercel:**
1. Buy domain (Namecheap, ~$10/year)
2. Add to Vercel project
3. Update DNS records
4. Your site: `https://yuvayodha.com`

**Render:**
1. Add custom domain in settings
2. Update CNAME record
3. API: `https://api.yuvayodha.com`

---

## Quick Deploy Commands

```bash
# 1. Prepare code
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Build frontend locally (test)
npm run build
npm run preview

# 3. Deploy backend to Render
# (Use Render dashboard - connects to GitHub)

# 4. Deploy frontend to Vercel
# (Use Vercel dashboard - connects to GitHub)

# 5. Update environment variable
# In Vercel: Add VITE_API_BASE with Render URL

# 6. Redeploy frontend
# Vercel auto-redeploys on git push
```

---

## Summary

✅ **Free hosting** for both frontend and backend  
✅ **Automatic deployments** from GitHub  
✅ **SSL/HTTPS** included  
✅ **Global CDN** for fast loading  
✅ **Your ML model** accessible to anyone  

**Deployment time:** ~30 minutes for first time

**Your final URLs:**
- Website: `https://your-project.vercel.app`
- API: `https://your-api.onrender.com`

Anyone can visit your website and use your XGBoost forecasting model!

---

## Next Steps

1. ✅ Push code to GitHub (if not already)
2. ✅ Deploy backend to Render
3. ✅ Deploy frontend to Vercel
4. ✅ Test everything
5. ✅ Share your link!

See `DEPLOYMENT_STEP_BY_STEP.md` for detailed walkthrough with screenshots.
