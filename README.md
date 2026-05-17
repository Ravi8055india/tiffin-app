# 🍽️ NutriNest - Modern Food Delivery Platform

A complete, production-ready food delivery SaaS platform built with **Next.js 16**, **Express.js**, **Supabase PostgreSQL**, and **Razorpay** payments.

![NutriNest - Professional Design](https://img.shields.io/badge/Design-Modern%20%26%20Professional-green)
![Full Stack](https://img.shields.io/badge/Stack-Full%20Stack-blue)
![Responsive](https://img.shields.io/badge/Mobile-Responsive-orange)

## ✨ Key Features

### 👥 Customer App
- **OTP Authentication**: Secure phone-based login/signup
- **Browse Meals**: Search and filter meal plans with real-time availability
- **Smart Cart**: Add items, apply promo codes, view real-time pricing
- **Seamless Checkout**: One-click Razorpay payment integration
- **Order Tracking**: Real-time delivery status and GPS tracking
- **Wallet System**: Add/manage money, get instant refunds
- **Referral Program**: Earn ₹100 bonus for each referral
- **Subscription Plans**: Flexible daily/weekly/alternate delivery options
- **Modern UI**: Professional, fully responsive design for all devices

### 🚚 Delivery Boy Panel
- **Order Assignment**: Accept/reject orders from dashboard
- **Real-time GPS Tracking**: Update location while delivering
- **Earnings Tracker**: View daily/weekly/monthly earnings
- **Route Optimization**: Smart delivery routing
- **Customer Contact**: Direct messaging and call integration

### 🎛️ Admin Dashboard
- **Revenue Analytics**: Daily/weekly/monthly revenue charts
- **Order Management**: Bulk actions and order filters
- **User Management**: Customer and delivery boy management
- **Metrics Dashboard**: KPIs and business insights
- **Meal Management**: Add/edit/delete meal plans
- **Delivery Tracking**: Monitor all active deliveries

## 🎨 Design Highlights

### Color Scheme
- **Primary**: Warm orange/amber (`oklch(0.58 0.2 45)`)
- **Secondary**: Deep purple/indigo (`oklch(0.5 0.18 280)`)
- **Accent**: Vibrant red/coral (`oklch(0.62 0.22 20)`)
- **Neutral**: Clean whites and grays for excellent contrast

### Responsive Design
- ✅ Mobile-first approach (320px+)
- ✅ Tablet optimized (768px+)
- ✅ Desktop enhanced (1024px+)
- ✅ Smooth animations and transitions
- ✅ Touch-friendly buttons and spacing

## 🚀 Tech Stack

### Frontend
```
Next.js 16                # React framework with App Router
Tailwind CSS v4          # Utility-first CSS
shadcn/ui               # High-quality components
React Context           # State management
```

### Backend
```
Express.js              # REST API server
PostgreSQL              # Primary database (via Supabase)
JWT                     # Authentication tokens
bcrypt                  # Password hashing
Razorpay SDK           # Payment processing
```

### Database
```
Supabase PostgreSQL     # Cloud database
Row Level Security      # Automatic access control
Database Triggers       # Auto-create profiles/wallets
PostgREST              # Auto-generated APIs
```

## 📁 Project Structure

```
nutriNest/
├── 📄 SETUP.md                    # Detailed setup instructions
├── 📄 IMPLEMENTATION_GUIDE.md     # Feature implementation guide
├── 📄 README.md                   # This file
│
├── 🎨 app/                        # Next.js App Router
│   ├── auth/                      # Login & signup pages
│   ├── page.tsx                   # Home page
│   ├── menu/                      # Browse meals
│   ├── cart/                      # Shopping cart
│   ├── checkout/                  # Payment & order creation
│   ├── orders/                    # Order tracking
│   ├── wallet/                    # Wallet management
│   ├── referrals/                 # Referral system
│   ├── account/                   # User profile
│   ├── delivery/                  # Delivery boy pages
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles & theme
│
├── 🔧 backend/                    # Express.js API
│   ├── server.js                  # Express server entry
│   ├── routes/
│   │   ├── auth.js               # OTP login/signup
│   │   ├── thalis.js             # Meal CRUD
│   │   ├── orders.js             # Order management
│   │   ├── subscriptions.js       # Subscription plans
│   │   ├── payments.js           # Razorpay integration
│   │   ├── wallet.js             # Wallet operations
│   │   ├── referrals.js          # Referral system
│   │   ├── delivery.js           # Delivery operations
│   │   └── admin.js              # Admin endpoints
│   ├── middleware/
│   │   └── auth.js               # JWT verification
│   ├── utils/
│   │   └── jwt.js                # Token management
│   ├── config/
│   │   └── database.js           # Supabase connection
│   └── .env.example              # Environment template
│
├── 📦 components/                 # Reusable UI components
│   └── ui/                        # shadcn components
│
├── 🎯 context/                    # React contexts
│   └── cart-context.tsx          # Cart state management
│
├── 📚 lib/                        # Utilities
│   └── utils.ts                  # Helper functions
│
├── 📄 package.json               # Dependencies
└── ⚙️ next.config.mjs            # Next.js config
```

## 🗄️ Database Schema

### Tables
- **users** - Customer profiles with location & preferences
- **thalis** - Meal plans with cuisine type and availability
- **subscriptions** - Active subscription details
- **orders** - Individual meal orders
- **payments** - Payment records with Razorpay reference
- **wallet** - User wallet balance and transactions
- **wallet_transactions** - Credit/debit history
- **referrals** - Referral codes and bonuses
- **delivery_tracking** - Real-time GPS location
- **admin_metrics** - Daily KPI snapshots

### Security
- ✅ Row Level Security (RLS) on all tables
- ✅ Automatic user profile creation via triggers
- ✅ JWT-based API authentication
- ✅ Secure password hashing
- ✅ Rate limiting on auth endpoints

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login-otp         Send OTP to phone
POST   /api/auth/verify-otp        Verify OTP & get token
POST   /api/auth/register          Create account with referral
```

### Meals & Orders
```
GET    /api/thalis                 Get all available meals
GET    /api/thalis/:id             Get meal details
POST   /api/orders                 Create new order
GET    /api/orders                 Get user orders
PATCH  /api/orders/:id             Update order status
```

### Payments
```
POST   /api/payments/create-order  Create Razorpay order
POST   /api/payments/verify        Verify payment
GET    /api/payments/:orderId      Get payment details
```

### Wallet & Referrals
```
GET    /api/wallet                 Get wallet balance
POST   /api/wallet/add-money       Add money to wallet
GET    /api/wallet/transactions    Get wallet history
GET    /api/referrals/code         Generate referral code
POST   /api/referrals/apply        Apply referral code
```

### Delivery
```
GET    /api/delivery/orders        Get assigned orders
PATCH  /api/delivery/track         Update GPS location
PATCH  /api/delivery/complete      Mark order delivered
GET    /api/delivery/earnings      Get earnings report
```

### Admin
```
GET    /api/admin/metrics          Dashboard KPIs
GET    /api/admin/orders           All orders
GET    /api/admin/users            All users
GET    /api/admin/revenue          Revenue reports
POST   /api/admin/thalis           Create meal
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- Supabase account (free tier ok)
- Razorpay account (test mode available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd nutriNest
   pnpm install
   ```

2. **Setup environment variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:5000
   
   # backend/.env
   PORT=5000
   NODE_ENV=development
   SUPABASE_HOST=your_host
   SUPABASE_USER=postgres
   SUPABASE_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_min_32_chars
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

3. **Start development servers**
   ```bash
   # Terminal 1 - Frontend
   pnpm dev
   
   # Terminal 2 - Backend
   pnpm run dev:backend
   ```

4. **Open in browser**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000

## 📊 Performance Optimizations

- ✅ Image optimization with Next.js Image
- ✅ Code splitting and lazy loading
- ✅ Database indexing on frequently queried columns
- ✅ Caching strategies for meal lists
- ✅ Efficient API pagination
- ✅ CSS-in-JS minimization

## 🔐 Security Features

- ✅ OTP-based authentication (no password storage)
- ✅ JWT tokens with 24-hour expiry
- ✅ CORS protection on all APIs
- ✅ Rate limiting on auth endpoints
- ✅ SQL injection prevention via parameterized queries
- ✅ XSS protection via React escaping
- ✅ HTTPS enforced in production

## 📱 Responsive Breakpoints

```css
Mobile:  320px - 640px   (Primary target)
Tablet:  641px - 1024px  (Optimized)
Desktop: 1025px+         (Enhanced)
```

## 🎯 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari 14+
- Chrome Android

## 📞 Support & Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000
# Kill process if needed: kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

### Database connection failed
```bash
# Verify credentials in backend/.env
# Check IP whitelist in Supabase settings
# Test connection: psql postgresql://user:pass@host/db
```

### Login page not working
```bash
# Ensure backend is running
pnpm run dev:backend

# Check CORS is enabled in backend
# Verify NEXT_PUBLIC_API_URL in .env.local
```

### Razorpay payment fails
```bash
# Verify keys in backend/.env
# Ensure test mode is enabled in Razorpay dashboard
# Check amount format (in smallest unit: paise)
```

## 🚀 Deployment

### Vercel (Frontend)
```bash
# Push to GitHub, connect to Vercel
# Add environment variables in Vercel dashboard
# Auto-deploys on push
```

### Railway/Render (Backend)
```bash
# Connect GitHub repository
# Add .env variables
# Database URL from Supabase
# Deploy!
```

## 📈 Future Enhancements

- [ ] Real-time order notifications with Socket.io
- [ ] AI-powered meal recommendations
- [ ] Subscription pause/resume functionality
- [ ] Customer reviews and ratings
- [ ] Multi-language support (Hindi, Tamil, Telugu)
- [ ] Advanced payment options (UPI, NetBanking)
- [ ] Admin mobile app
- [ ] Analytics dashboard with Recharts

## 📄 License

MIT License - feel free to use this project

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for delivering fresh meals to your doorstep!**

**Questions?** Check SETUP.md and IMPLEMENTATION_GUIDE.md for detailed guides.
