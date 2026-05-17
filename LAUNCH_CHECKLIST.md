# 🚀 NutriNest Launch Checklist

## Pre-Launch Setup

### 1. Environment Configuration
- [ ] Create `.env.local` in root directory
- [ ] Add Supabase URL and anon key
- [ ] Add API_URL pointing to backend
- [ ] Create `backend/.env` with database credentials
- [ ] Add JWT_SECRET (min 32 characters)
- [ ] Add Razorpay keys (test keys for development)

### 2. Database Setup
- [ ] Verify Supabase project created
- [ ] Tables created (see database schema)
- [ ] RLS policies enabled
- [ ] Triggers created for auto-profile creation
- [ ] Indexes created for performance
- [ ] Test user account created

### 3. Backend Setup
- [ ] Install dependencies: `pnpm install`
- [ ] Verify all route files created
- [ ] Database connection working
- [ ] CORS enabled for frontend URL
- [ ] JWT middleware functional
- [ ] Test endpoints with Postman/curl

### 4. Frontend Setup
- [ ] Install dependencies: `pnpm install`
- [ ] All pages created and routed
- [ ] Components imported correctly
- [ ] Cart context working
- [ ] No console errors
- [ ] Mobile responsive verified

## Testing Checklist

### Authentication Flow
- [ ] Login page loads correctly
- [ ] OTP input field accepts numbers only
- [ ] OTP verified successfully
- [ ] JWT token stored in localStorage
- [ ] User redirected to home on success
- [ ] Error messages display properly

### User Flow - Customer
- [ ] Home page shows authenticated content
- [ ] Menu page displays all meals
- [ ] Search functionality works
- [ ] Can add items to cart
- [ ] Cart count updates
- [ ] Cart page shows correct items
- [ ] Can increase/decrease quantities
- [ ] Can remove items from cart
- [ ] Checkout page loads with totals
- [ ] Order creation succeeds

### Payment Flow
- [ ] Razorpay payment modal opens
- [ ] Test payment completes successfully
- [ ] Order status updated to completed
- [ ] User receives order confirmation
- [ ] Order appears in order history

### Order Management
- [ ] Can view past orders
- [ ] Order details show correct information
- [ ] Order status displays properly
- [ ] Delivery tracking shows location

### Wallet & Referrals
- [ ] Wallet balance displays
- [ ] Can add money to wallet
- [ ] Referral code generates
- [ ] Can share referral code
- [ ] Bonus applies when code used

### Navigation & Routing
- [ ] All bottom nav links work
- [ ] Back buttons work correctly
- [ ] No broken links
- [ ] All pages render without errors

### Responsive Design
- [ ] Mobile (320px): All elements visible
- [ ] Tablet (768px): Proper layout
- [ ] Desktop (1024px): Full experience
- [ ] Touch targets ≥ 44px
- [ ] No horizontal scroll
- [ ] Images scale properly

## Performance Tests

### Mobile Performance
- [ ] Page load < 3 seconds
- [ ] Smooth scrolling
- [ ] No jank on animations
- [ ] Buttons responsive

### API Performance
- [ ] Backend responds < 500ms
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Pagination works for large lists

## Security Verification

### Authentication
- [ ] JWT tokens expire properly
- [ ] Protected routes secured
- [ ] No sensitive data in localStorage
- [ ] Passwords not visible in forms

### API Security
- [ ] CORS properly configured
- [ ] No exposed credentials
- [ ] Rate limiting on auth
- [ ] SQL injection prevented
- [ ] XSS protection active

### Data Security
- [ ] RLS policies working
- [ ] Users can't access others' data
- [ ] Admin functions protected
- [ ] Payments encrypted

## Deployment Preparation

### Code Quality
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] No unused imports
- [ ] Clean git history

### Documentation
- [ ] README.md updated
- [ ] SETUP.md completed
- [ ] API endpoints documented
- [ ] Environment variables documented

### Backup & Recovery
- [ ] Database backups enabled
- [ ] Git repository backed up
- [ ] Environment variables saved securely
- [ ] Disaster recovery plan

## Production Deployment

### Frontend (Vercel)
- [ ] Push code to GitHub
- [ ] Create Vercel project
- [ ] Add environment variables
- [ ] Enable auto-deployment
- [ ] Set production domain
- [ ] Enable analytics

### Backend (Railway/Render)
- [ ] Push code to GitHub
- [ ] Create deployment project
- [ ] Configure .env variables
- [ ] Set database connection
- [ ] Enable auto-deploy
- [ ] Monitor logs

### Database (Supabase)
- [ ] Backup production database
- [ ] Enable automated backups
- [ ] Monitor storage usage
- [ ] Set resource limits
- [ ] Enable Sentry for errors

### Payments (Razorpay)
- [ ] Switch to production keys
- [ ] Update webhook URLs
- [ ] Test production payment
- [ ] Enable email notifications
- [ ] Set up reconciliation

## Monitoring & Maintenance

### Error Tracking
- [ ] Sentry configured
- [ ] Error alerts enabled
- [ ] Log aggregation active
- [ ] Performance monitoring on

### Analytics
- [ ] Google Analytics enabled
- [ ] User tracking active
- [ ] Conversion tracking set
- [ ] Funnel analysis ready

### Regular Tasks
- [ ] Check daily logs
- [ ] Monitor API performance
- [ ] Review error rates
- [ ] Check user feedback
- [ ] Update dependencies (monthly)
- [ ] Security patches (as needed)

## Business Setup

### Legal
- [ ] Terms of Service written
- [ ] Privacy Policy published
- [ ] Refund policy defined
- [ ] Customer support email set

### Operations
- [ ] Customer support system ready
- [ ] Escalation procedures defined
- [ ] Team training completed
- [ ] Documentation centralized

### Marketing
- [ ] Landing page ready
- [ ] Social media profiles created
- [ ] Press release prepared
- [ ] Marketing materials ready

## Post-Launch

### Week 1
- [ ] Monitor for critical bugs
- [ ] Respond to user feedback
- [ ] Check all API endpoints
- [ ] Verify payment processing
- [ ] Review user analytics

### Week 2-4
- [ ] Performance optimization
- [ ] User testing sessions
- [ ] Feature refinement
- [ ] Documentation updates
- [ ] Team retrospective

### Month 2+
- [ ] Feature releases
- [ ] User growth tracking
- [ ] Revenue monitoring
- [ ] Competitor analysis
- [ ] Roadmap updates

---

## Quick Start Commands

```bash
# Install all dependencies
pnpm install

# Start frontend (Terminal 1)
pnpm dev

# Start backend (Terminal 2)
pnpm run dev:backend

# Build for production
pnpm build

# Run production build
pnpm start

# Run backend in production
NODE_ENV=production pnpm run start:backend
```

## Critical Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_URL
DB_HOST
DB_USER
DB_PASSWORD
JWT_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

## Emergency Contacts

- **Supabase Support**: https://supabase.com/support
- **Razorpay Support**: https://razorpay.com/support
- **Vercel Support**: https://vercel.com/support

---

**Status: Ready for Launch! 🎉**

Once all items are checked, NutriNest is production-ready!
