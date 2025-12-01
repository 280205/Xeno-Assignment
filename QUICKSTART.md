# Quick Start Guide

## Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd "c:\Users\Nitin Pandey\Downloads\xeno"
npm install
```

This will install all required packages including Next.js, Prisma, NextAuth, Chart.js, and more.

### Step 2: Set Up Database

**Option A: Local PostgreSQL**

If you have PostgreSQL installed:

```bash
# Create database
createdb xeno_shopify

# Update .env
copy .env.example .env
# Edit .env and set DATABASE_URL to:
# DATABASE_URL="postgresql://localhost:5432/xeno_shopify"
```

**Option B: Free Cloud Database (Recommended)**

1. Go to [neon.tech](https://neon.tech) (free tier, no credit card)
2. Create new project
3. Copy connection string
4. Create `.env` file and paste:

```env
DATABASE_URL="postgresql://user:pass@host.neon.tech/dbname"
NEXTAUTH_SECRET="any-random-string-for-dev"
NEXTAUTH_URL="http://localhost:3000"
SHOPIFY_WEBHOOK_SECRET="test-secret"
```

### Step 3: Initialize Database

```bash
npx prisma db push
npx prisma generate
```

### Step 4: Seed Demo Data (Optional)

```bash
npm run db:seed
```

This creates:
- Demo user: `demo@example.com` / `demo123`
- Sample store with products, orders, customers
- Test data for dashboard

### Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 6: Explore

1. **Sign Up** or use demo credentials
2. **Add a store** with domain like `yourstore.myshopify.com`
3. **View dashboard** with demo data
4. **Test webhooks** (see below)

---

## Testing Webhooks Locally

### Method 1: Using ngrok (Easiest)

```bash
# Install ngrok
npm install -g ngrok

# In terminal 1: Run your app
npm run dev

# In terminal 2: Expose to internet
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### Method 2: Manual Testing with curl

```bash
# Test customer webhook
curl -X POST http://localhost:3000/api/webhooks/customers \
  -H "Content-Type: application/json" \
  -H "x-shopify-shop-domain: yourstore.myshopify.com" \
  -d '{
    "id": 999888777,
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "Customer",
    "total_spent": "100.00",
    "orders_count": 2
  }'

# Test order webhook
curl -X POST http://localhost:3000/api/webhooks/orders \
  -H "Content-Type: application/json" \
  -H "x-shopify-shop-domain: yourstore.myshopify.com" \
  -d '{
    "id": 123456789,
    "email": "test@example.com",
    "total_price": "99.99",
    "subtotal_price": "89.99",
    "total_tax": "10.00",
    "currency": "USD",
    "financial_status": "paid",
    "order_number": 1001,
    "line_items": [
      {
        "id": 111222333,
        "title": "Test Product",
        "quantity": 1,
        "price": "89.99"
      }
    ]
  }'
```

Check your dashboard - new data should appear!

---

## Shopify Development Store Setup

### Create Free Development Store

1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Create partner account (free)
3. Stores → Add store → Development store
4. Fill in details → Create

### Add Test Data

1. Products → Add product (create 3-5 products)
2. Customers → Add customer (create test customers)
3. Orders → Create order (place test orders)

### Configure Webhooks

1. Settings → Notifications → Webhooks
2. Add webhook subscriptions:
   - **Customer creation**: `https://your-ngrok-url.ngrok.io/api/webhooks/customers`
   - **Order creation**: `https://your-ngrok-url.ngrok.io/api/webhooks/orders`
   - **Product creation**: `https://your-ngrok-url.ngrok.io/api/webhooks/products`
3. Format: JSON
4. Copy webhook signing secret → Update `.env` → Restart server

### Test Live Webhooks

1. In Shopify, create a new order
2. Check Webhooks page → Recent deliveries
3. Should see 200 OK response
4. Check your dashboard → Order appears!

---

## Common Issues

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:** 
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env` is correct
- For cloud database, check internet connection

### Prisma Generate Fails

```
Error: Prisma schema not found
```

**Solution:**
```bash
# Make sure you're in project root
cd "c:\Users\Nitin Pandey\Downloads\xeno"
# Run generate
npx prisma generate
```

### Port Already in Use

```
Error: Port 3000 is already in use
```

**Solution:**
```bash
# Use different port
PORT=3001 npm run dev
```

Or kill the process using port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Alternative: Use port 3001
# Update NEXTAUTH_URL in .env to http://localhost:3001
```

### NextAuth Session Error

```
Error: NEXTAUTH_SECRET not set
```

**Solution:**
Add to `.env`:
```env
NEXTAUTH_SECRET="any-random-long-string-min-32-chars"
```

---

## Development Tools

### Prisma Studio (Database GUI)

```bash
npx prisma studio
```

Opens database GUI at [http://localhost:5555](http://localhost:5555)

### View Logs

```bash
# API logs appear in terminal where you ran `npm run dev`
# Watch for webhook processing, errors, etc.
```

### Database Reset

```bash
# Clear all data
npx prisma db push --force-reset

# Reseed
npm run db:seed
```

---

## Project Structure

```
xeno/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── auth/            # NextAuth & signup
│   │   ├── dashboard/       # Analytics endpoints
│   │   ├── tenants/         # Tenant management
│   │   └── webhooks/        # Shopify webhooks
│   ├── auth/                # Auth pages (signin/signup)
│   ├── dashboard/           # Dashboard page
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── DashboardView.tsx   # Main dashboard with charts
│   ├── TenantSelector.tsx  # Store dropdown
│   └── AddTenantModal.tsx  # Add store dialog
├── lib/                     # Utilities
│   ├── prisma.ts           # Prisma client
│   └── shopify-utils.ts    # HMAC verification
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Demo data
├── README.md               # Main documentation
├── ARCHITECTURE.md         # System design
├── API_DOCS.md            # API reference
├── DEPLOYMENT.md          # Deploy guide
└── DEMO_SCRIPT.md         # Video script
```

---

## Next Steps

1. ✅ Run locally and test all features
2. ✅ Connect real Shopify store and test webhooks
3. ✅ Deploy to Vercel (see DEPLOYMENT.md)
4. ✅ Configure production webhooks
5. ✅ Record demo video (see DEMO_SCRIPT.md)
6. ✅ Push to GitHub
7. ✅ Submit assignment

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Shopify Webhook Docs](https://shopify.dev/docs/api/admin-rest/latest/resources/webhook)
- [Chart.js Docs](https://www.chartjs.org/docs/latest/)

---

## Need Help?

Check the documentation files:
- `README.md` - Overview and setup
- `ARCHITECTURE.md` - How it works
- `API_DOCS.md` - API endpoints
- `DEPLOYMENT.md` - Deploy to production
- `DEMO_SCRIPT.md` - Record your video

Good luck! 🚀
