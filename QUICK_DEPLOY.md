# Quick Deploy Reference

## 🚀 Deploy in 3 Steps (30 minutes)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "XGBoost ML model integration"
git remote add origin https://github.com/YOUR-USERNAME/YuvaYodhaProjectSchneider.git
git push -u origin main
```

### Step 2: Deploy Backend (Render)
1. Go to https://render.com
2. Sign up with GitHub
3. New + → Web Service
4. Connect your repo
5. Configure:
   - **Build**: `cd backend && pip install -r requirements.txt`
   - **Start**: `cd backend && gunicorn -c gunicorn_config.py app:app`
   - **Instance**: Free
6. Deploy!
7. **Copy your URL**: `https://your-api.onrender.com`

### Step 3: Deploy Frontend (Vercel)
1. Update `.env.production` with your Render URL
2. Push changes: `git push`
3. Go to https://vercel.com
4. Sign up with GitHub
5. New Project → Import your repo
6. Add Environment Variable:
   - Name: `VITE_API_BASE`
   - Value: `https://your-api.onrender.com/api`
7. Deploy!

## ✅ Done!

Your website is live at: `https://your-project.vercel.app`

Anyone can now use your XGBoost forecasting model online! 🎉

---

## Test Your Deployment

```bash
# Test backend
curl https://your-api.onrender.com/api/health

# Visit frontend
open https://your-project.vercel.app
```

---

## Update Deployment

```bash
# Make changes
git add .
git commit -m "Update"
git push

# Both Render and Vercel auto-deploy!
```

---

## Free Hosting Features

✅ Automatic SSL (HTTPS)  
✅ Auto-deploy on git push  
✅ Global CDN  
✅ No credit card required  
✅ Unlimited bandwidth  

---

## Costs

**Free forever:**
- Frontend: Vercel (unlimited)
- Backend: Render (750 hrs/month)

**Optional upgrade:** $7/month for always-on backend

---

## Quick Links

- **Full Guide**: See `DEPLOYMENT_STEP_BY_STEP.md`
- **Troubleshooting**: See `DEPLOYMENT.md`
- **Architecture**: See `ARCHITECTURE.md`

---

## Your Final URLs

After deployment:

```
Frontend: https://[your-project].vercel.app
Backend:  https://[your-api].onrender.com
GitHub:   https://github.com/[username]/YuvaYodhaProjectSchneider
```

Share these links everywhere! 🌐
