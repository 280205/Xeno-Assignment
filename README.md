# Xeno Shopify Insights - Multi-Tenant Data Ingestion & Analytics Platform

A production-ready multi-tenant platform for ingesting Shopify data and providing actionable business insights through an interactive dashboard.

## Project Overview

This platform enables multiple Shopify stores to:
- Automatically sync customer, order, product, and event data via webhooks
- View real-time analytics and business metrics
- Track customer behavior and purchasing patterns
- Monitor store performance with interactive charts

## Architecture

### High-Level Architecture

```

                        Shopify Stores                           
  (Multiple Tenants: store1.myshopify.com, store2.myshopify.com)

                      Webhooks (customers, orders, products)
                     

                      Next.js Application                        
    
                    API Routes (Webhook Handlers)             
    /api/webhooks/customers  /api/webhooks/orders             
    /api/webhooks/products   /api/webhooks/events             
    
    
                Authentication (NextAuth.js)                  
             Email/Password with JWT Sessions                 
    
    
                  Dashboard API & UI                          
      - Metrics Aggregation  - Chart Data Generation          
      - Tenant Isolation     - Date Range Filtering           
    

                     
                     

              PostgreSQL Database (via Prisma ORM)              
   
     Users     Tenants  Customers  Orders     Products    
                                                          
   UserTenant           OrderItems          CustomEvents  
   
              Multi-Tenant Data Isolation by tenantId           

```

### Technology Stack

**Backend:**
- Next.js 14 (App Router) - Full-stack React framework
- Prisma ORM - Type-safe database access
- PostgreSQL - Relational database
- NextAuth.js - Authentication

**Frontend:**
- React 18 - UI library
- TailwindCSS - Styling
- Chart.js & React-Chartjs-2 - Data visualization
- TanStack Query - Data fetching

## Database Schema

### Multi-Tenant Design

The database uses a tenant isolation pattern where each data record is associated with a `tenantId`:

```prisma
model Tenant {
  id                String   @id @default(cuid())
  name              String
  shopifyDomain     String   @unique
  shopifyAccessToken String?
  
  customers         Customer[]
  orders            Order[]
  products          Product[]
  customEvents      CustomEvent[]
}

model Customer {
  id                String   @id
  tenantId          String   // Isolates customer data per tenant
  shopifyCustomerId String
  email             String?
  totalSpent        Float
  ordersCount       Int
  
  @@unique([tenantId, shopifyCustomerId])
}

// Similar pattern for Order, Product, OrderItem, CustomEvent
```

**Key Features:**
- Composite unique constraints ensure data integrity per tenant
- Indexed fields for performance (tenantId, email, createdAt)
- Cascading deletes maintain referential integrity
- Separate UserTenant junction table for user-to-tenant relationships

## API Endpoints

### Webhook Endpoints (Public)

These endpoints receive data from Shopify:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhooks/customers` | POST | Sync customer data |
| `/api/webhooks/orders` | POST | Sync order data |
| `/api/webhooks/products` | POST | Sync product data |
| `/api/webhooks/events` | POST | Track custom events (cart abandoned, etc.) |

**Security:** HMAC signature verification using `x-shopify-hmac-sha256` header

### Authentication Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/signup` | POST | Register new user |
| `/api/auth/signin` | POST | Login (via NextAuth) |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |

### Dashboard Endpoints (Protected)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tenants` | GET | List user's stores |
| `/api/tenants` | POST | Add new store |
| `/api/dashboard/[tenantId]` | GET | Get analytics data |

**Query Parameters for Dashboard:**
- `startDate` - Filter orders from this date
- `endDate` - Filter orders until this date

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Shopify development store (free at partners.shopify.com)

### Installation

1. **Clone and Install Dependencies**
```bash
cd "c:\Users\Nitin Pandey\Downloads\xeno"
npm install
```

2. **Configure Environment Variables**

Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/xeno_shopify"
NEXTAUTH_SECRET="generate-a-secure-random-string"
NEXTAUTH_URL="http://localhost:3000"
SHOPIFY_WEBHOOK_SECRET="your-shopify-webhook-secret"
```

3. **Initialize Database**
```bash
npx prisma db push
npx prisma generate
```

4. **Run Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000`

### Setting Up Shopify Webhooks

1. Go to your Shopify Admin → Settings → Notifications
2. Add webhook subscriptions:
   - **Customer creation**: `https://your-domain.com/api/webhooks/customers`
   - **Customer update**: `https://your-domain.com/api/webhooks/customers`
   - **Order creation**: `https://your-domain.com/api/webhooks/orders`
   - **Order update**: `https://your-domain.com/api/webhooks/orders`
   - **Product creation**: `https://your-domain.com/api/webhooks/products`
   - **Product update**: `https://your-domain.com/api/webhooks/products`

3. Set webhook format to **JSON**
4. Note your webhook signing secret and add to `.env`

## Features Implemented

### Core Requirements

- [x] Multi-tenant architecture with data isolation
- [x] Shopify webhook integration (customers, orders, products)
- [x] Custom events tracking (cart abandoned, checkout started)
- [x] PostgreSQL database with Prisma ORM
- [x] Email authentication system
- [x] Tenant onboarding and management

### Dashboard Features

- [x] Total customers, orders, products, revenue metrics
- [x] Orders by date with date range filtering
- [x] Top 5 customers by spend
- [x] Revenue trend chart (line chart)
- [x] Orders trend chart (bar chart)
- [x] Custom events breakdown (doughnut chart)
- [x] Average order value calculation
- [x] Real-time data synchronization

### Additional Features

- [x] Responsive UI with TailwindCSS
- [x] Protected routes with session management
- [x] Type-safe database access with Prisma
- [x] Webhook signature verification
- [x] Automatic customer statistics updates
- [x] Order items tracking with product relationships

## Security Features

1. **HMAC Webhook Verification** - Validates Shopify webhook authenticity
2. **Password Hashing** - bcrypt with salt rounds
3. **JWT Sessions** - Secure session management
4. **Tenant Isolation** - Users can only access their authorized tenants
5. **Environment Variables** - Sensitive data stored securely

## Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy on Vercel**
   - Import project from GitHub
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Configure Database**
   - Use hosted PostgreSQL (Railway, Supabase, Neon)
   - Update `DATABASE_URL` in Vercel environment variables
   - Run migrations: `npx prisma db push`

### Environment Variables for Production

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="secure-random-string-for-production"
NEXTAUTH_URL="https://your-app.vercel.app"
SHOPIFY_WEBHOOK_SECRET="your-webhook-secret"
```

## Assumptions & Trade-offs

### Assumptions

1. **Webhook-Based Sync**: The system primarily relies on webhooks rather than polling Shopify APIs
2. **Single Currency**: Currently assumes USD; multi-currency support would require additional logic
3. **Simplified Product Model**: Stores basic product info; variants are aggregated
4. **Event Schema**: Custom events use JSON string for flexibility vs. structured fields

### Trade-offs

| Decision | Pros | Cons | Rationale |
|----------|------|------|-----------|
| Next.js App Router | Modern, full-stack, edge-ready | Steeper learning curve | Best developer experience, production-ready |
| Prisma ORM | Type-safe, great DX, auto-migrations | Adds abstraction layer | Faster development, fewer bugs |
| Webhook-only sync | Real-time, efficient | Misses historical data | For new stores; bulk import would be separate feature |
| JWT sessions | Stateless, scalable | Can't invalidate easily | Good for multi-region deployment |

## Data Flow

### Order Creation Flow

```
Shopify Order Created
    ↓
Webhook POST /api/webhooks/orders
    ↓
Verify HMAC Signature
    ↓
Find/Create Customer
    ↓
Upsert Order Record
    ↓
Create Order Items
    ↓
Update Customer Stats (totalSpent, ordersCount)
    ↓
Return 200 OK to Shopify
```

## Sample Queries

### Top Customers Query
```typescript
const topCustomers = await prisma.customer.findMany({
  where: { tenantId },
  orderBy: { totalSpent: 'desc' },
  take: 5,
})
```

### Revenue by Date
```typescript
const orders = await prisma.order.findMany({
  where: { 
    tenantId,
    createdAt: { gte: startDate, lte: endDate }
  },
})
// Aggregate in application layer
```

## Known Limitations

1. **No Bulk Import**: Currently webhook-only; no historical data import
2. **No Pagination**: Dashboard loads all data in date range
3. **Basic Event Schema**: Custom events use generic JSON field
4. **Single Region DB**: Would need read replicas for global scale
5. **No Real-time Updates**: Dashboard requires refresh to see new data

## Future Enhancements (Production Roadmap)

### Phase 1 - Core Improvements
- [ ] Background jobs for bulk data import (BullMQ + Redis)
- [ ] Rate limiting on webhook endpoints
- [ ] Retry mechanism for failed webhook processing
- [ ] Database connection pooling (PgBouncer)
- [ ] Comprehensive error logging (Sentry)

### Phase 2 - Advanced Features
- [ ] Customer segmentation engine
- [ ] Predictive analytics (churn prediction)
- [ ] Email campaign integration
- [ ] A/B test tracking
- [ ] Real-time dashboard updates (WebSockets)

### Phase 3 - Scale & Performance
- [ ] Database read replicas
- [ ] Redis caching layer
- [ ] CDN for static assets
- [ ] Horizontal API scaling
- [ ] Event streaming (Kafka/RabbitMQ)

### Phase 4 - Enterprise Features
- [ ] SSO integration (SAML, OAuth)
- [ ] Audit logs
- [ ] Role-based access control (RBAC)
- [ ] White-label customization
- [ ] Data export capabilities

## Testing Strategy

### Current Testing Approach
- Manual testing via Shopify development store
- Webhook testing with ngrok/localtunnel

### Recommended Testing (Production)
```typescript
// Unit tests
- Service layer tests (data transformations)
- Utility functions (HMAC verification)

// Integration tests
- API endpoint tests with test database
- Webhook handler tests with mock data

// E2E tests
- Authentication flows
- Dashboard data display
- Tenant switching
```

## Documentation Guide

This project includes comprehensive documentation to help you understand, set up, deploy, and extend the platform:

### Core Documentation
- **[README.md](./README.md)** - You are here! Main project overview
- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Complete your submission (4-5 hours)

### Technical Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, data models, scalability
- **[API_DOCS.md](./API_DOCS.md)** - Complete API reference with examples
- **[STRUCTURE.md](./STRUCTURE.md)** - File structure and navigation

### Deployment & Operations
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to Vercel step-by-step
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Debug common issues

### Demo & Testing
- **[DEMO_SCRIPT.md](./DEMO_SCRIPT.md)** - Record your demo video (7 min)
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Manual testing scenarios

### Project Management
- **[CHECKLIST.md](./CHECKLIST.md)** - Track your progress
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Executive summary

### External Resources
- [Shopify Webhook Documentation](https://shopify.dev/docs/api/admin-rest/latest/resources/webhook)
- [Prisma Multi-Tenancy Guide](https://www.prisma.io/docs/guides/database/multi-tenancy)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [NextAuth.js Documentation](https://next-auth.js.org/)

## Contributing

This is an internship assignment project. For production use:
1. Add comprehensive test coverage
2. Implement proper error boundaries
3. Add monitoring and alerting
4. Set up CI/CD pipeline
5. Conduct security audit

## License

MIT License - This is a demonstration project for the Xeno FDE Internship

---

**Built for Xeno FDE Internship 2025**

For questions or demo requests, please reach out!
