# NutriNest Implementation Guide

## Completed Tasks

### 1. Database Schema & Supabase ✓
- Created 12 PostgreSQL tables with proper relationships
- Implemented Row Level Security (RLS) policies
- Added database triggers for auto-creating profiles and wallets
- Set up indexes for optimal query performance ss

**Tables Created:**
- users, thalis, subscriptions, orders, payments, wallet, wallet_transactions, referrals, delivery_tracking, admin_metrics

### 2. Express.js Backend API ✓
- Complete REST API with 9 route modules
- Authentication with OTP and JWT tokens
- Role-based access control (customer, delivery_boy, admin)
- Razorpay payment integration
- Database connection pooling

**Available Endpoints:**
- `/api/auth/*` - Authentication (login, signup, profile)
- `/api/thalis/*` - Meal management
- `/api/orders/*` - Order creation and tracking
- `/api/subscriptions/*` - Subscription management
- `/api/wallet/*` - Wallet operations
- `/api/payments/*` - Razorpay integration
- `/api/referrals/*` - Referral system
- `/api/delivery/*` - Delivery assignment and tracking
- `/api/admin/*` - Admin dashboard metrics

### 3. Next.js Customer Frontend ✓
- Home page with meal browsing
- Authentication pages (login/signup with OTP)
- Menu page with search functionality
- Orders page with filtering
- Account/Profile page
- Bottom navigation for mobile
- Warm color theme (orange/brown palette)

## Remaining Tasks

### 4. Integrate Razorpay & Checkout (In Progress)

**Required Files to Create:**
1. `/app/checkout/page.tsx` - Checkout page with cart
2. `/app/cart/page.tsx` - Shopping cart management
3. `/components/payment-modal.tsx` - Razorpay payment modal
4. `/lib/api-client.ts` - API wrapper functions

**Implementation Steps:**
1. Create cart context for state management
2. Build checkout form with address and payment method selection
3. Integrate Razorpay checkout script
4. Handle payment verification
5. Create order after successful payment

### 5. Build Order Management System

**Pages Needed:**
1. `/app/order/[id]/page.tsx` - Order detail page with real-time tracking
2. `/app/subscriptions/page.tsx` - Manage subscriptions
3. `/components/order-tracking.tsx` - Live order tracking with map

**Features:**
- Real-time order status updates
- Live delivery tracking with location
- Subscription management (pause/cancel)
- Order history with filters

### 6. Implement Wallet & Referrals

**Pages Needed:**
1. `/app/wallet/page.tsx` - Wallet balance and transactions
2. `/app/referrals/page.tsx` - Referral code sharing
3. `/components/add-money.tsx` - Add money modal

**Features:**
- View wallet balance and transaction history
- Add money to wallet (via Razorpay)
- Generate and share referral code
- Track referral earnings

### 7. Build Delivery Boy Panel

**Pages Needed:**
1. `/app/delivery/dashboard/page.tsx` - Delivery boy dashboard
2. `/app/delivery/orders/page.tsx` - Assigned orders list
3. `/app/delivery/tracking/[id]/page.tsx` - Real-time tracking
4. `/app/delivery/profile/page.tsx` - Delivery boy profile

**Features:**
- View assigned orders for the day
- Real-time GPS location tracking
- Mark orders as delivered
- View earnings dashboard

### 8. Admin Dashboard (Not in Original Todo)

**Pages Needed:**
1. `/app/admin/dashboard/page.tsx` - Main dashboard with metrics
2. `/app/admin/orders/page.tsx` - All orders management
3. `/app/admin/users/page.tsx` - User management
4. `/app/admin/thalis/page.tsx` - Meal management
5. `/app/admin/analytics/page.tsx` - Revenue analytics

## Setup Instructions

### Environment Variables

Create `.env.local` in the project root:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

Create `backend/.env`:
```
SUPABASE_HOST=your-project.supabase.co
SUPABASE_PORT=5432
SUPABASE_USER=postgres
SUPABASE_PASSWORD=your-password
SUPABASE_DB=postgres
JWT_SECRET=your-256-char-secret-key-here
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### Running the Application

**Terminal 1 - Frontend:**
```bash
npm run dev
# Visit http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
npm run dev:backend
# API running at http://localhost:5000
```

## API Integration Patterns

### Authenticated Requests
```javascript
const token = localStorage.getItem('nutriNestToken')
const response = await fetch('http://localhost:5000/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Creating Orders
```
POST /api/orders
{
  thaliId: "uuid",
  quantity: 1,
  deliveryDate: "2026-05-20",
  deliveryTime: "morning",
  deliveryAddress: "123 Main St",
  totalPrice: 250,
  paymentMethod: "razorpay"
}
```

### Payment Flow
1. Get order ID from `/api/orders`
2. Create Razorpay order via `/api/payments/create-order`
3. Render Razorpay checkout form
4. Verify payment via `/api/payments/verify-payment`
5. Update order status

## Database Query Examples

### Get User's Orders
```sql
SELECT o.*, t.name as thali_name
FROM public.orders o
JOIN public.thalis t ON o.thali_id = t.id
WHERE o.user_id = 'user-id'
ORDER BY o.delivery_date DESC
```

### Get Admin Metrics
```sql
SELECT 
  COUNT(*) as total_orders,
  SUM(total_price) as total_revenue,
  COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered
FROM public.orders
WHERE DATE(delivery_date) = CURRENT_DATE
```

## Common Issues & Solutions

### CORS Errors
- Ensure backend CORS allows `http://localhost:3000`
- Check `backend/server.js` CORS configuration

### Authentication Failed
- Verify JWT_SECRET is set correctly
- Check token is stored in localStorage
- Ensure token is passed in Authorization header

### Razorpay Integration Not Working
- Add Razorpay script to page: `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`
- Verify Razorpay keys in backend .env
- Test in non-production mode first

### Database Connection Issues
- Verify Supabase credentials are correct
- Ensure SSL connection is configured
- Check database is running and accessible

## Testing Checklist

- [ ] User signup and login works
- [ ] OTP verification works (mock in development)
- [ ] Browse thalis on home and menu pages
- [ ] Add items to cart
- [ ] Complete checkout with Razorpay
- [ ] View orders and track delivery
- [ ] Manage subscriptions
- [ ] Add money to wallet
- [ ] Share referral code
- [ ] Delivery boy can view assigned orders
- [ ] Admin can see all orders and metrics

## Next Steps

1. Install Razorpay library: `npm install razorpay`
2. Create cart management system using Context API
3. Build checkout flow with Razorpay integration
4. Implement order tracking with real-time updates
5. Add delivery boy mobile app functionality
6. Create admin dashboard
7. Test all payment flows
8. Deploy to production

## Useful Libraries for Remaining Tasks

```bash
npm install:
- swr (data fetching)
- zustand (state management)
- react-map-gl (for delivery tracking map)
- date-fns (date utilities)
- clsx (conditional classnames)
```

## Architecture Notes

- Frontend uses Next.js 16 App Router
- Backend is Express.js REST API
- Database is PostgreSQL with Supabase
- Authentication via JWT tokens
- Payments via Razorpay
- State management via Context API + localStorage
- Styling with Tailwind CSS + shadcn/ui

This implementation covers the full customer journey with secure authentication, meal browsing, order management, and payment processing.
