# Railway Deployment Troubleshooting

## Common Crash Reasons & Fixes

### 1. Missing Environment Variables

**Check Railway Dashboard:**
- Go to your project → Variables tab
- Ensure ALL these are set:

```
PORT=5000
TURSO_DATABASE_URL=libsql://connected-ernest20.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzU2MTIzMTYsImlkIjoiMDE5ZDZhYmQtYTkwMS03MjEyLWI1NDQtYzA1ODM2NzMyYWNhIiwicmlkIjoiNTQ1M2NiMDktM2Y0YS00OTc3LWIxMTAtYmFlYzBiZTVkMzk3In0.aeRWplGdeALBNHSGkjTubEVP5mqP3QQqODJJLpW-rIzBt-J71jhd1bAXxNPz33h0a7MRtrHjUfz_EKVEbSnYAQ
JWT_SECRET=your-super-secret-jwt-key-change-me
FRONTEND_URL=http://localhost:3000
PAYSTACK_SECRET_KEY=sk_live_your_actual_secret_key
```

**Note:** You can temporarily set `FRONTEND_URL=*` until frontend is deployed.

---

### 2. Wrong Root Directory

**In Railway Settings:**
- Click on your service
- Go to Settings → Service
- Set **Root Directory** to: `backend`
- Click "Save"
- Redeploy

---

### 3. Node Version Issue

**Add to backend/package.json:**
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

Then redeploy.

---

### 4. Check Logs

**View Railway Logs:**
1. Go to your Railway project
2. Click on the backend service
3. Click "Deployments" tab
4. Click on the latest deployment
5. View logs to see exact error

**Common Error Messages:**

**Error: "Cannot find module"**
- Solution: Root directory not set to `backend`

**Error: "EADDRINUSE"**
- Solution: PORT already in use (Railway handles this automatically)

**Error: "Database connection failed"**
- Solution: Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN

**Error: "Missing environment variable"**
- Solution: Add all required env vars in Railway dashboard

---

### 5. Database Connection Issue

**Test Turso Connection:**
```bash
# In backend folder locally
node -e "
const { createClient } = require('@libsql/client');
const db = createClient({
  url: 'libsql://connected-ernest20.aws-us-east-1.turso.io',
  authToken: 'YOUR_TOKEN_HERE'
});
db.execute('SELECT 1').then(() => console.log('✅ Connected')).catch(e => console.error('❌ Failed:', e));
"
```

If this fails locally, your Turso credentials are wrong.

---

### 6. Build Fails

**Check package.json:**
- Ensure all dependencies are in `dependencies` (not `devDependencies`)
- Run `npm install` locally to verify

---

## Step-by-Step Railway Deployment

### Method 1: From GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   cd "c:\Users\LENOVO\Desktop\well connected"
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_URL
   git push -u origin main
   ```

2. **Deploy on Railway:**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect and deploy

3. **Configure:**
   - Click on the service
   - Go to Settings
   - Set Root Directory: `backend`
   - Go to Variables tab
   - Add all environment variables
   - Redeploy

### Method 2: Railway CLI

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Deploy:**
   ```bash
   cd "c:\Users\LENOVO\Desktop\well connected\backend"
   railway init
   railway up
   ```

4. **Add Variables:**
   ```bash
   railway variables set PORT=5000
   railway variables set TURSO_DATABASE_URL=libsql://...
   railway variables set TURSO_AUTH_TOKEN=...
   railway variables set JWT_SECRET=...
   railway variables set FRONTEND_URL=*
   railway variables set PAYSTACK_SECRET_KEY=sk_live_...
   ```

---

## Alternative: Deploy to Render

If Railway keeps crashing, try Render:

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Configure:
   - **Name:** well-connected-backend
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

5. Add Environment Variables (same as Railway)

6. Click "Create Web Service"

---

## Verify Deployment

Once deployed, test the health endpoint:

```bash
curl https://your-backend-url.railway.app/api/health
```

Should return:
```json
{"status":"OK","timestamp":"2024-..."}
```

---

## Quick Fix Checklist

- [ ] Root directory set to `backend`
- [ ] All environment variables added
- [ ] TURSO credentials are correct
- [ ] Node version >= 18
- [ ] Checked deployment logs
- [ ] Health endpoint responds

---

## Still Crashing?

**Share the error logs:**
1. Go to Railway → Deployments → Latest deployment
2. Copy the error message from logs
3. Common issues:
   - Missing env vars
   - Wrong root directory
   - Database connection failed
   - Port binding issue (fixed with 0.0.0.0 binding)

**Emergency Fallback:**
Deploy to Render instead (instructions above).
