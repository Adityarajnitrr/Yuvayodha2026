# Step-by-Step Deployment Guide

## Goal
Deploy your XGBoost ML model website online so anyone can access it via a public URL.

**What you'll have at the end:**
- ✅ Public website URL (e.g., `https://yuva-yodha.vercel.app`)
- ✅ Working ML model predictions
- ✅ Anyone can visit and use your forecasting tool
- ✅ 100% free hosting

**Time needed:** 30-45 minutes

---

## Prerequisites

- [x] GitHub account
- [x] Your model files copied to `backend/models/` ✅ (you already did this!)
- [x] Code ready to deploy

---

## Part 1: Push Code to GitHub (10 minutes)

### Step 1: Create GitHub Repository

1. Go to https://github.com
2. Click "+" → "New repository"
3. Name: `YuvaYodhaProjectSchneider`
4. Keep it Public (so free hosting works)
5. Don't initialize with README (you already have one)
6. Click "Create repository"

### Step 2: Initialize Git (if not already)

Open terminal in your project folder:

```bash
cd YuvaYodhaProjectSchneider
git init
git add .
git commit -m "Initial commit with XGBoost ML model"
```

### Step 3: Push to GitHub

Copy the commands from GitHub (they look like this):

```bash
git remote add origin https://github.com/YOUR-USERNAME/YuvaYodhaProjectSchneider.git
git branch -M main
git push -u origin main
```

✅ **Checkpoint:** Your code is now on GitHub!

---

## Part 2: Deploy Backend to Render (15 minutes)

### Step 1: Create Render Account

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub
4. Authorize Render to access your repositories

### Step 2: Create New Web Service

1. In Render Dashboard, click "New +" → "Web Service"
2. Click "Connect" next to your `YuvaYodhaProjectSchneider` repository
3. If you don't see it, click "Configure account" and grant access

### Step 3: Configure Service

Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `yuva-yodha-api` (or your choice) |
| **Region** | Oregon (or closest to you) |
| **Branch** | `main` |
| **Root Directory** | Leave empty |
| **Runtime** | Python 3 |
| **Build Command** | `cd backend && pip install -r requirements.txt` |
| **Start Command** | `cd backend && gunicorn -c gunicorn_config.py app:app` |
| **Instance Type** | Free |

### Step 4: Add Environment Variables (Optional)

Click "Advanced" → Add Environment Variable:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `PYTHON_VERSION` | `3.11` |

### Step 5: Deploy!

1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Watch the logs - you should see:
   ```
   ✓ Loaded 8 models successfully
   📊 Models loaded: True
   ```

### Step 6: Get Your Backend URL

After deployment completes:
1. Look at the top of the page
2. Copy your URL: `https://yuva-yodha-api.onrender.com`
3. **Save this URL** - you'll need it for the frontend!

### Step 7: Test Your Backend

Open a browser or use curl:

```bash
curl https://yuva-yodha-api.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "models_loaded": true,
  "timestamp": "2024-01-15T10:30:00"
}
```

✅ **Checkpoint:** Your ML model API is live!

---

## Part 3: Deploy Frontend to Vercel (10 minutes)

### Step 1: Update Environment Variables

Edit `.env.production` file:

```env
VITE_API_BASE=https://yuva-yodha-api.onrender.com/api
```

Replace with YOUR actual Render URL from Part 2, Step 6.

### Step 2: Commit Changes

```bash
git add .env.production
git commit -m "Add production API URL"
git push
```

### Step 3: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub
4. Authorize Vercel

### Step 4: Import Project

1. Click "Add New..." → "Project"
2. Find your `YuvaYodhaProjectSchneider` repository
3. Click "Import"

### Step 5: Configure Project

Vercel auto-detects Vite! Just:

1. **Framework Preset**: Vite (auto-detected)
2. **Root Directory**: `./` (leave as default)
3. **Build Command**: `npm run build` (auto-filled)
4. **Output Directory**: `dist` (auto-filled)

### Step 6: Add Environment Variable

**Important!** Click "Environment Variables":

| Name | Value |
|------|-------|
| `VITE_API_BASE` | `https://yuva-yodha-api.onrender.com/api` |

(Use YOUR Render URL)

### Step 7: Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes
3. Watch the build logs

### Step 8: Visit Your Live Site!

After deployment:
1. Vercel shows your URL: `https://yuva-yodha-project.vercel.app`
2. Click "Visit" or open the URL
3. **Your website is live!** 🎉

✅ **Checkpoint:** Website is deployed!

---

## Part 4: Test Everything (5 minutes)

### Test 1: Homepage

Visit your Vercel URL → Should see the homepage

### Test 2: Forecast Page

1. Click "Demand Forecast" in navigation
2. Click "Show Forecast" button
3. Should see predictions loading
4. Check "About this forecast" section
5. Should say "Model: XGBoost"

### Test 3: Check Browser Console

1. Press F12 → Console tab
2. Should see successful API calls:
   ```
   POST https://yuva-yodha-api.onrender.com/api/forecast → 200 OK
   ```

### Test 4: Verify ML Predictions

The forecast page should show:
- Real demand predictions (MW)
- Solar generation forecasts
- Peak demand time
- Renewable percentage
- 24-hour chart

✅ **Success!** Your ML model is working online!

---

## Part 5: Share Your Project

### Your URLs

**Website (Frontend):**
```
https://yuva-yodha-project.vercel.app
```

**API (Backend):**
```
https://yuva-yodha-api.onrender.com
```

### Share Links

Share your website URL with:
- ✅ Friends
- ✅ Recruiters
- ✅ On LinkedIn
- ✅ In your resume
- ✅ Competition judges

### Add to README

Update your GitHub README with:

```markdown
## Live Demo

🌐 **Website**: https://yuva-yodha-project.vercel.app
🔗 **API**: https://yuva-yodha-api.onrender.com

Features:
- Real-time power demand forecasting using XGBoost
- 15/30/45/60 minute ahead predictions
- Solar generation forecasting
- Interactive charts and visualizations
```

---

## Common Issues & Solutions

### Issue 1: Backend Shows "Models not loaded"

**Cause:** Model files too large for free tier (>500MB)

**Solutions:**
1. Compress models (use `joblib.dump(model, compress=3)`)
2. Use smaller models
3. Upgrade to Render paid plan ($7/month)

**Quick Fix:**
Backend runs in mock mode - predictions work but aren't from your model

### Issue 2: "Cannot connect to API"

**Cause:** CORS or wrong API URL

**Solutions:**
1. Check `.env.production` has correct URL
2. Redeploy frontend on Vercel
3. Check backend logs on Render

### Issue 3: Backend is slow (30+ seconds)

**Cause:** Free tier sleeps after 15 min inactivity

**Solutions:**
1. Accept first-request delay (free tier limitation)
2. Use UptimeRobot to ping every 14 minutes (keeps it awake)
3. Upgrade to paid tier ($7/month for always-on)

### Issue 4: Build fails on Render

**Cause:** Python version or dependency issues

**Solutions:**
1. Check Render logs for error
2. Verify `requirements.txt` is correct
3. Try Python 3.11 in environment variables

### Issue 5: Frontend 404 on refresh

**Cause:** SPA routing issue

**Solution:**
Already fixed with `vercel.json` - Vercel handles this automatically

---

## Monitoring Your Deployment

### Check Backend Health

```bash
curl https://yuva-yodha-api.onrender.com/api/health
```

### View Logs

**Render:**
1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. See real-time logs

**Vercel:**
1. Go to Vercel dashboard
2. Click your project
3. Click "Deployments"
4. Click latest deployment
5. View build and runtime logs

### Monitor Uptime (Free)

Use UptimeRobot (free):
1. Go to https://uptimerobot.com
2. Add HTTP monitor
3. URL: Your Render backend URL
4. Check interval: 5 minutes
5. Get alerts if your site goes down

---

## Update Your Deployment

### Update Backend (New Models)

1. Replace model files in `backend/models/`
2. Commit and push:
   ```bash
   git add backend/models/
   git commit -m "Update XGBoost models"
   git push
   ```
3. Render auto-deploys (or click "Manual Deploy")

### Update Frontend (UI Changes)

1. Make changes to `src/` files
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update UI"
   git push
   ```
3. Vercel auto-deploys in ~2 minutes

### Force Redeploy

**Render:** Click "Manual Deploy" → "Deploy latest commit"  
**Vercel:** Go to Deployments → Click ⋮ → "Redeploy"

---

## Cost & Limits

### Free Tier Limits

**Render (Backend):**
- ✅ 750 hours/month (plenty!)
- ✅ 512 MB RAM
- ⚠️ Sleeps after 15 min inactivity
- ✅ Free SSL

**Vercel (Frontend):**
- ✅ Unlimited bandwidth
- ✅ 100 deployments/day
- ✅ Free SSL
- ✅ Global CDN

### When to Upgrade

Consider paid plans ($7-20/month) if you need:
- Backend always-on (no sleep)
- More RAM for larger models
- Faster response times
- Custom domain
- More concurrent users

---

## Advanced: Custom Domain (Optional)

### Buy Domain

Cheapest options (~$10/year):
- Namecheap.com
- Porkbun.com
- Google Domains

### Add to Vercel (Frontend)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `yuvayodha.com`
3. Follow DNS instructions
4. Wait 24 hours for propagation
5. Your site: `https://yuvayodha.com` 🎉

### Add to Render (Backend)

1. Render Dashboard → Your Service → Settings → Custom Domain
2. Add: `api.yuvayodha.com`
3. Update DNS CNAME record
4. Update `.env.production` with new API URL

---

## Troubleshooting Checklist

Before asking for help, verify:

- [ ] Backend deployed successfully on Render
- [ ] Backend health check returns "ok"
- [ ] Models loaded successfully (check Render logs)
- [ ] `.env.production` has correct backend URL
- [ ] Frontend deployed successfully on Vercel
- [ ] Environment variable added in Vercel settings
- [ ] Can access website URL
- [ ] Browser console shows no CORS errors
- [ ] Forecast page loads (even if slow first time)

---

## Success Criteria

✅ Website accessible via public URL  
✅ Forecast page loads predictions  
✅ ML model returns real XGBoost predictions  
✅ No errors in browser console  
✅ API health check returns "models_loaded: true"  
✅ Charts and visualizations work  
✅ Can share URL with others  

---

## Next Steps

1. ✅ Test all features thoroughly
2. ✅ Share your live demo link
3. ✅ Add to portfolio/resume
4. ✅ Write documentation about your model
5. ✅ Consider custom domain
6. ✅ Monitor usage and performance

---

## Summary

🎉 **Congratulations!** You've deployed a full-stack ML application:

- ✅ React frontend on Vercel
- ✅ Python Flask backend on Render
- ✅ XGBoost ML models serving predictions
- ✅ 100% free hosting
- ✅ Public URLs anyone can access

**Your Links:**
- Frontend: `https://[your-project].vercel.app`
- Backend: `https://[your-api].onrender.com`

Anyone in the world can now use your ML-powered forecasting tool! 🚀

---

Questions? Check `DEPLOYMENT.md` for more details or the troubleshooting section above.
