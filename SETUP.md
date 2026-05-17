# NutriNest - Complete Setup Guide

## 📋 Prerequisites

- Node.js 16+ installed
- PostgreSQL via Supabase account
- Razorpay account for payments

## 🚀 Quick Start

### 1. Environment Setup

Create `.env.local` file in root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Create `backend/.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=your_supabase_db_host
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 2. Install Dependencies

```bash
# Install all dependencies
pnpm install
```

### 3. Start Development Servers

**Terminal 1 - Frontend:**
```bash
pnpm dev
```

**Terminal 2 - Backend:**
```bash
pnpm run dev:backend
```

Frontend will be at: `http://localhost:3000`
Backend API will be at: `http://localhost:5000`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/register` - Register new user

### Meals
- `GET /api/thalis` - Get all available meals
- `GET /api/thalis/:id` - Get meal details

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id` - Update order status

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify Razorpay payment

### Wallet
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/add-money` - Add money to wallet
- `GET /api/wallet/transactions` - Get transaction history

### Referrals
- `GET /api/referrals/code` - Generate referral code
- `POST /api/referrals/apply` - Apply referral code

### Delivery (Delivery Boys)
- `GET /api/delivery/assigned-orders` - Get assigned orders
- `PATCH /api/delivery/orders/:id/status` - Update delivery status
- `POST /api/delivery/track` - Update location

### Admin
- `GET /api/admin/metrics` - Get dashboard metrics
- `GET /api/admin/orders` - Get all orders
- `POST /api/admin/thalis` - Create meal
- `GET /api/admin/revenue` - Get revenue reports

## 📱 Features

### Customer App
- ✅ OTP-based authentication
- ✅ Browse meals with search
- ✅ Add to cart & checkout
- ✅ Razorpay payment integration
- ✅ Order tracking
- ✅ Wallet management
- ✅ Referral system
- ✅ Mobile responsive design

### Delivery Boy Panel
- ✅ View assigned orders
- ✅ Real-time GPS tracking
- ✅ Earnings tracking
- ✅ Order acceptance/completion

### Admin Dashboard
- ✅ Revenue analytics
- ✅ User management
- ✅ Order management
- ✅ Delivery metrics

## 🎨 Design Features

- **Modern Color Scheme**: Professional gradient with orange/amber primary and purple accents
- **Fully Responsive**: Mobile-first design works on all devices
- **Bottom Navigation**: Easy access on mobile devices
- **Smooth Animations**: Hover effects and transitions
- **Professional UI**: Clean, modern card-based layouts

## 🔐 Security

- Row-Level Security (RLS) enabled on all tables
- JWT authentication for API endpoints
- Secure password hashing with bcrypt
- Protected payment endpoints

## 📚 Project Structure

```
/
├── app/                  # Next.js app directory
│   ├── auth/            # Authentication pages
│   ├── cart/            # Shopping cart
│   ├── checkout/        # Checkout page
│   ├── orders/          # Order tracking
│   ├── menu/            # Menu browsing
│   ├── wallet/          # Wallet management
│   ├── referrals/       # Referral page
│   ├── delivery/        # Delivery boy pages
│   └── globals.css      # Global styles
├── backend/             # Express.js API
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & validation
│   ├── config/          # Database config
│   └── server.js        # Express server
├── context/             # React contexts
├── components/          # UI components
└── lib/                 # Utilities
```

## 🆘 Troubleshooting

### Backend won't connect to database
- Check your Supabase credentials in `backend/.env`
- Ensure your IP is whitelisted in Supabase

### Login page not working
- Ensure backend is running on port 5000
- Check backend logs for errors
- Verify phone number format

### Payment issues
- Verify Razorpay keys are correct
- Check test mode is enabled in Razorpay dashboard

### Deployment
- Set all environment variables in Vercel/hosting provider
- Enable CORS for your domain in backend
- Use production database credentials

## 📞 Support

For issues or questions, refer to:
- Backend logs: Check terminal running `pnpm run dev:backend`
- Frontend logs: Check browser console (F12)
- Supabase dashboard for database issues

---

**Happy coding! 🚀**
