# ⚡ NutriNest - Quick Start Guide

## 🎯 60-Second Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Create environment files
cp backend/.env.example backend/.env
cp .env.example .env.local

# 3. Fill in your credentials (Supabase, Razorpay)
# Edit backend/.env and .env.local with your keys

# 4. Start development servers
# Terminal 1:
pnpm dev

# Terminal 2:
pnpm run dev:backend
```

Done! App running at http://localhost:3000 🚀

---

## 📋 Environment Setup

### .env.local (Frontend)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### backend/.env (Backend)
```env
PORT=5000
NODE_ENV=development
SUPABASE_HOST=xxxxx.supabase.co
SUPABASE_PORT=5432
SUPABASE_USER=postgres
SUPABASE_PASSWORD=your_password
SUPABASE_DB=postgres
JWT_SECRET=your_secret_key_min_32_chars
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

---

## 🎨 What You Get

### Pages (All Responsive)
✅ Login/Signup - OTP authentication
✅ Home - Browse meals
✅ Menu - Search & filter
✅ Cart - Shopping cart
✅ Checkout - Order & payment
✅ Orders - Track deliveries
✅ Wallet - Money management
✅ Referrals - Share & earn
✅ Account - User profile
✅ Delivery Panel - For delivery boys
✅ Admin Dashboard - Business metrics

### Design
✅ Modern color scheme (orange/purple/red)
✅ Fully responsive (mobile → desktop)
✅ Professional UI with smooth animations
✅ Touch-friendly controls
✅ Bottom navigation on all pages

### Backend Features
✅ 30+ API endpoints
✅ JWT authentication
✅ Razorpay payment processing
✅ Real-time order tracking
✅ Wallet system
✅ Referral program
✅ Admin metrics

---

## 🧪 Test the App

### Login Flow
1. Go to http://localhost:3000
2. Click "Sign In"
3. Enter any phone number (e.g., +91 9876543210)
4. Click "Send OTP"
5. Enter any 6 digits (e.g., 123456)
6. Click "Verify & Sign In"

### Browse Meals
1. After login, you're on home page
2. Click "Menu" in bottom navigation
3. Search for meals by name
4. Click "Add to Cart" on any meal

### Checkout
1. Click cart icon (top right)
2. Review items in cart
3. Click "Proceed to Checkout"
4. Fill delivery address
5. Click "Razorpay" for payment
6. Use Razorpay test card:
   - Number: 4111111111111111
   - Expiry: Any future date
   - CVV: Any 3 digits

---

## 📁 Important Files

### Frontend Pages
```
app/page.tsx               Home page
app/auth/login/page.tsx   Login
app/auth/signup/page.tsx  Signup
app/menu/page.tsx         Menu
app/cart/page.tsx         Cart
app/checkout/page.tsx     Checkout
```

### Backend Routes
```
backend/routes/auth.js       Authentication
backend/routes/thalis.js     Meals
backend/routes/orders.js     Orders
backend/routes/payments.js   Razorpay
backend/routes/wallet.js     Wallet
```

### Configuration
```
app/globals.css           Colors & theme
app/layout.tsx           Root layout
backend/.env.example     Backend template
```

---

## 🔧 Common Commands

```bash
# Start frontend
pnpm dev

# Start backend
pnpm run dev:backend

# Build for production
pnpm build

# Run production build
pnpm start

# Lint code
pnpm lint

# Check types
pnpm tsc --noEmit
```

---

## 🎨 Customization

### Change Colors
Edit `app/globals.css` (lines 6-39):
```css
:root {
  --primary: oklch(0.58 0.2 45);      /* Change this */
  --secondary: oklch(0.5 0.18 280);   /* Change this */
  --accent: oklch(0.62 0.22 20);      /* Change this */
  /* ... other colors */
}
```

### Change Meal Data
Meals are fetched from backend:
```javascript
// In app/page.tsx, around line 33:
const response = await fetch('http://localhost:5000/api/thalis')
```

To add sample meals, use the Razorpay API:
```bash
curl -X POST http://localhost:5000/api/admin/thalis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Paneer Tikka",
    "price": 150,
    "description": "Delicious paneer",
    "cuisine_type": "Indian"
  }'
```

---

## ✅ Verification Checklist

- [ ] Frontend loads at localhost:3000
- [ ] Backend API responds at localhost:5000
- [ ] Database connection successful
- [ ] Login page displays correctly
- [ ] Can login with OTP
- [ ] Menu page shows meals
- [ ] Cart functionality works
- [ ] All pages are responsive
- [ ] Bottom navigation works on all pages
- [ ] No console errors

---

## 🚨 Troubleshooting

### Backend won't start
```bash
# Kill existing process on port 5000
lsof -i :5000
kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

### Database connection error
```bash
# Verify credentials in backend/.env
# Check Supabase IP whitelist
# Test connection:
psql postgresql://user:pass@host:5432/db
```

### Frontend shows blank page
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install

# Start fresh
pnpm dev
```

### CORS errors
```bash
# Add your frontend URL to backend CORS
# In backend/server.js, check CORS configuration
```

---

## 📚 Documentation

- **README.md** - Project overview & features
- **SETUP.md** - Detailed setup instructions
- **IMPROVEMENTS.md** - Design improvements made
- **LAUNCH_CHECKLIST.md** - Pre-launch tasks
- **COMPLETION_SUMMARY.md** - What's been built

---

## 🚀 Next Steps

1. **Setup** - Add environment variables
2. **Test** - Run login & order flow
3. **Customize** - Update meals, colors, branding
4. **Deploy** - Push to Vercel & Railway
5. **Monitor** - Check logs & analytics

---

## 💡 Tips

1. Use Supabase dashboard to view data
2. Test Razorpay in test mode first
3. Keep JWT_SECRET secure (32+ chars)
4. Monitor backend logs for errors
5. Use Chrome DevTools for debugging

---

## 📞 Need Help?

- Check SETUP.md for detailed instructions
- See IMPLEMENTATION_GUIDE.md for features
- Review LAUNCH_CHECKLIST.md for deployment

---

**You're all set! Happy coding! 🎉**

*Start the dev servers and visit http://localhost:3000 to see your food delivery platform in action!*
