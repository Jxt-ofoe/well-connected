# Deploy Full Stack to Vercel

## ✅ Setup Complete

Your project is now configured to deploy both frontend and backend to Vercel as a single application.

## How It Works

- **Frontend:** Next.js app in `/frontend`
- **Backend:** Express API served as serverless functions via `/api`
- **Database:** Turso (already configured)

## Deployment Steps

### 1. Install Backend Dependencies

```bash
cd frontend
npm install
```

This will install all backend dependencies needed for the API routes.

### 2. Push to GitHub

```bash
cd "c:\Users\LENOVO\Desktop\well connected"
git init
git add .
git commit -m "Full stack deployment"
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

### 3. Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Important:** Leave root directory as `.` (root)
5. Framework will auto-detect as Next.js

### 4. Add Environment Variables

In Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_a3d400788bf61ab4075869ec060e784abdf20c52

TURSO_DATABASE_URL=libsql://connected-ernest20.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzU2MTIzMTYsImlkIjoiMDE5ZDZhYmQtYTkwMS03MjEyLWI1NDQtYzA1ODM2NzMyYWNhIiwicmlkIjoiNTQ1M2NiMDktM2Y0YS00OTc3LWIxMTAtYmFlYzBiZTVkMzk3In0.aeRWplGdeALBNHSGkjTubEVP5mqP3QQqODJJLpW-rIzBt-J71jhd1bAXxNPz33h0a7MRtrHjUfz_EKVEbSnYAQ
JWT_SECRET=your-super-secret-jwt-key-change-me
PAYSTACK_SECRET_KEY=sk_live_your_actual_secret_key
```

### 5. Deploy

Click "Deploy" and wait for build to complete.

### 6. Seed Database (One-time)

After first deployment, you need to seed the database. Two options:

**Option A: Local Seed (Recommended)**
```bash
cd backend
npm run seed
```

**Option B: Create Seed API Endpoint (Advanced)**
Create `frontend/api/seed.js`:
```javascript
const { db } = require('../../backend/src/seed');
module.exports = async (req, res) => {
  // Add authentication check here
  if (req.headers.authorization !== 'Bearer YOUR_SECRET_TOKEN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    await require('../../backend/src/seed');
    res.json({ message: 'Database seeded' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

Then visit: `https://your-app.vercel.app/api/seed` with auth header.

---

## API Routes

Your backend API will be available at:

- `https://your-app.vercel.app/api/products`
- `https://your-app.vercel.app/api/orders`
- `https://your-app.vercel.app/api/admin/login`
- etc.

Frontend will automatically use these routes since `NEXT_PUBLIC_API_URL=/api`

---

## Testing After Deployment

1. **Visit your site:** `https://your-app.vercel.app`
2. **Test API:** `https://your-app.vercel.app/api/health`
3. **Admin login:** `admin@wellconnected.com` / `admin123`
4. **Change password immediately**
5. **Test checkout with Paystack**

---

## Advantages of This Setup

✅ Single deployment (no separate backend)
✅ Automatic HTTPS
✅ No CORS issues
✅ Serverless scaling
✅ Free tier available
✅ Easy rollbacks

---

## Important Notes

### Serverless Function Limits

Vercel free tier has limits:
- **Execution time:** 10 seconds per function
- **Payload size:** 4.5 MB
- **Invocations:** 100GB-hours/month

Your app should be fine, but if you get timeouts:
- Optimize database queries
- Add caching
- Upgrade to Pro plan

### Cold Starts

First request after inactivity may be slow (1-3 seconds). Subsequent requests are fast.

### Database Connection

Turso is perfect for serverless because it's designed for edge computing. Each API call creates a new connection (this is normal for serverless).

---

## Troubleshooting

### "Module not found" error
- Run `npm install` in frontend folder
- Ensure all backend dependencies are in frontend/package.json

### API routes return 404
- Check vercel.json routes configuration
- Ensure frontend/api/index.js exists

### Database connection fails
- Verify TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel env vars
- Check Turso dashboard for connection issues

### Build fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are installed
- Verify no syntax errors

---

## Local Development

For local development, you still need to run backend separately:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Update frontend/.env.local for local dev:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production, it uses `/api` (same domain).

---

## Updating After Deployment

1. Make changes locally
2. Test locally
3. Commit and push to GitHub
4. Vercel auto-deploys on push
5. Or manually trigger deployment in Vercel dashboard

---

## Cost

**Vercel Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- Serverless functions included
- Custom domain support

Should be sufficient for small to medium traffic. Upgrade to Pro ($20/month) if needed.

---

## 🎉 You're Ready!

Run `npm install` in frontend folder, push to GitHub, and deploy to Vercel!
