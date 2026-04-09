# Deployment Guide - Monorepo Structure

## Option 1: Deploy Frontend Only (Recommended)

Since you have a monorepo, the easiest approach is to deploy frontend and backend separately.

### Frontend (Vercel)

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your repository
4. **Important Settings:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

5. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_a3d400788bf61ab4075869ec060e784abdf20c52
   ```

6. Click "Deploy"

### Backend (Railway)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. **Important Settings:**
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`

5. **Environment Variables:**
   ```
   PORT=5000
   TURSO_DATABASE_URL=libsql://connected-ernest20.aws-us-east-1.turso.io
   TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzU2MTIzMTYsImlkIjoiMDE5ZDZhYmQtYTkwMS03MjEyLWI1NDQtYzA1ODM2NzMyYWNhIiwicmlkIjoiNTQ1M2NiMDktM2Y0YS00OTc3LWIxMTAtYmFlYzBiZTVkMzk3In0.aeRWplGdeALBNHSGkjTubEVP5mqP3QQqODJJLpW-rIzBt-J71jhd1bAXxNPz33h0a7MRtrHjUfz_EKVEbSnYAQ
   JWT_SECRET=your-super-secret-jwt-key-change-me
   FRONTEND_URL=https://your-frontend.vercel.app
   PAYSTACK_SECRET_KEY=sk_live_your_actual_secret_key
   ```

6. Deploy
7. Run seed command in Railway console: `npm run seed`

---

## Option 2: Split into Separate Repos (Alternative)

If Vercel requires separate repos:

### 1. Create Two New Repos

**Repo 1: well-connected-frontend**
- Copy only the `frontend/` folder contents to root
- Push to GitHub

**Repo 2: well-connected-backend**
- Copy only the `backend/` folder contents to root
- Push to GitHub

### 2. Deploy Separately

**Frontend on Vercel:**
- Import `well-connected-frontend` repo
- Root directory: `.` (root)
- Framework: Next.js
- Add environment variables

**Backend on Railway:**
- Import `well-connected-backend` repo
- Root directory: `.` (root)
- Add environment variables

---

## Option 3: Use Vercel Monorepo (Advanced)

The `vercel.json` file is already configured. When deploying:

1. Import the entire repo to Vercel
2. Vercel will detect the monorepo structure
3. It will only build the `frontend/` directory
4. Backend must be deployed separately to Railway/Render

---

## Recommended Approach

**Use Option 1** - It's the simplest and most reliable:
- Deploy frontend to Vercel (set root directory to `frontend`)
- Deploy backend to Railway (set root directory to `backend`)
- Update environment variables
- Done!

---

## Quick Commands

### If you need to split repos:

```bash
# Create frontend repo
cd "c:\Users\LENOVO\Desktop"
mkdir well-connected-frontend
cd well-connected-frontend
xcopy "..\well connected\frontend\*" . /E /I
git init
git add .
git commit -m "Initial frontend"
git remote add origin YOUR_GITHUB_URL
git push -u origin main

# Create backend repo
cd "c:\Users\LENOVO\Desktop"
mkdir well-connected-backend
cd well-connected-backend
xcopy "..\well connected\backend\*" . /E /I
git init
git add .
git commit -m "Initial backend"
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

---

## Troubleshooting

**Vercel Error: "No framework detected"**
- Solution: Set root directory to `frontend` in project settings

**Railway Error: "Cannot find module"**
- Solution: Set root directory to `backend` in project settings

**CORS Error after deployment**
- Solution: Update `FRONTEND_URL` in backend environment variables
- Redeploy backend

---

## Final Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set correctly
- [ ] Database seeded (`npm run seed`)
- [ ] CORS configured with frontend URL
- [ ] Paystack secret key added
- [ ] Test payment flow works
- [ ] Change admin password
