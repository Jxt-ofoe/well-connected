# Deployment Guide - Well Connected

## ✅ Pre-Deployment Checklist

### Backend
- [x] Turso database configured
- [x] JWT secret set
- [x] All dependencies installed
- [ ] Database seeded (run `npm run seed` if not done)
- [ ] Change JWT_SECRET to a strong random string for production

### Frontend
- [x] Paystack live key configured (pk_live_...)
- [x] All dependencies installed
- [ ] Update NEXT_PUBLIC_API_URL to production backend URL

---

## 🚀 Deployment Steps

### 1. Deploy Backend (Railway/Render/Fly.io)

#### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set root directory to `/backend`
5. Add environment variables:
   ```
   PORT=5000
   TURSO_DATABASE_URL=libsql://connected-ernest20.aws-us-east-1.turso.io
   TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzU2MTIzMTYsImlkIjoiMDE5ZDZhYmQtYTkwMS03MjEyLWI1NDQtYzA1ODM2NzMyYWNhIiwicmlkIjoiNTQ1M2NiMDktM2Y0YS00OTc3LWIxMTAtYmFlYzBiZTVkMzk3In0.aeRWplGdeALBNHSGkjTubEVP5mqP3QQqODJJLpW-rIzBt-J71jhd1bAXxNPz33h0a7MRtrHjUfz_EKVEbSnYAQ
   JWT_SECRET=your-super-secret-jwt-key-change-me
   ```
6. Deploy and copy the generated URL (e.g., `https://your-app.railway.app`)

#### Option B: Render
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your repository
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables (same as above)
6. Deploy and copy the URL

### 2. Seed Database (One-time)
After backend is deployed, run seed command:
```bash
# SSH into your deployment or use the platform's console
npm run seed
```

### 3. Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your repository
4. Configure:
   - Root Directory: `frontend`
   - Framework Preset: Next.js
5. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_a3d400788bf61ab4075869ec060e784abdf20c52
   ```
6. Click "Deploy"

### 4. Update Backend CORS (Important!)
After frontend is deployed, update backend CORS to allow your frontend domain:

Edit `backend/src/index.js`:
```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

Redeploy backend.

---

## 🔐 Security Recommendations

1. **Change JWT Secret**: Generate a strong random string
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Environment Variables**: Never commit `.env` files to Git

3. **Paystack Webhook**: Set up webhook URL in Paystack dashboard:
   - URL: `https://your-backend-url/api/orders/webhook`
   - Events: `charge.success`

---

## 🧪 Testing After Deployment

1. **Frontend**: Visit your Vercel URL
2. **Admin Login**: 
   - Email: `admin@wellconnected.com`
   - Password: `admin123`
3. **Test Order**: Place a test order with Paystack test card:
   - Card: `4084 0840 8408 4081`
   - CVV: `408`
   - Expiry: Any future date
   - PIN: `0000`
4. **Verify**: Check admin dashboard for the order

---

## 📝 Post-Deployment

- [ ] Test all features (products, cart, checkout, payment)
- [ ] Test admin dashboard (login, products, orders)
- [ ] Test PDF generation (receipts, daily reports)
- [ ] Verify Paystack payments work
- [ ] Change default admin password
- [ ] Set up custom domain (optional)

---

## 🆘 Troubleshooting

### Payment not working
- Verify Paystack public key is correct
- Check browser console for errors
- Ensure backend URL is correct in frontend env

### CORS errors
- Add frontend domain to backend CORS whitelist
- Redeploy backend after changes

### Database errors
- Verify Turso credentials are correct
- Check if database was seeded
- Run migration if needed: `npm run migrate`

---

## 📞 Support

For issues, check:
- Backend logs in Railway/Render dashboard
- Frontend logs in Vercel dashboard
- Browser console for frontend errors
