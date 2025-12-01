# Architecture Documentation

## System Architecture Overview

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Components (Client-Side)                          │  │
│  │  - Authentication Pages (Sign In/Sign Up)                │  │
│  │  - Dashboard with Charts                                 │  │
│  │  - Tenant Management UI                                  │  │
│  │  - Date Range Filters                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js API Routes (Server-Side)                        │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Webhook Handlers                                  │  │  │
│  │  │  - Customer sync  - Order sync  - Product sync     │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Business Logic                                    │  │  │
│  │  │  - Metrics calculation  - Data aggregation         │  │  │
│  │  │  - Tenant isolation    - HMAC verification         │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Authentication (NextAuth.js)                      │  │  │
│  │  │  - JWT session management  - Password hashing      │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ SQL
┌─────────────────────────────────────────────────────────────────┐
│                          Data Layer                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Prisma ORM (Query Builder & Migration)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                     │  │
│  │  - Users & Authentication                                │  │
│  │  - Multi-Tenant Data (Customers, Orders, Products)      │  │
│  │  - Analytics & Events                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Multi-Tenancy Model

### Tenant Isolation Strategy

**Pattern Used:** Discriminator Column (tenantId)

Every data table includes a `tenantId` column that acts as a partition key:

```sql
-- All queries are scoped by tenantId
SELECT * FROM "Customer" WHERE "tenantId" = 'tenant_123';
SELECT * FROM "Order" WHERE "tenantId" = 'tenant_123';
```

**Benefits:**
- Simple to implement and understand
- Single database for all tenants (cost-effective)
- Easy to query across tenants for analytics (if needed)
- Good performance with proper indexing

**Security:**
- API middleware checks user's tenant access
- All database queries filtered by tenantId
- No cross-tenant data leakage possible

## Data Models

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐
│    User     │────┬───│  UserTenant  │
└─────────────┘    │    └──────────────┘
                   │             │
                   │             │
                   │    ┌────────▼───────┐
                   │    │     Tenant     │
                   │    └────────┬───────┘
                   │             │
              ┌────┴─────┬───────┼────────┬────────────┐
              │          │       │        │            │
         ┌────▼───┐ ┌───▼────┐ ┌▼─────┐ ┌▼──────────┐ │
         │Customer│ │ Order  │ │Product│ │CustomEvent│ │
         └────┬───┘ └───┬────┘ └──┬────┘ └───────────┘ │
              │         │         │                     │
              └─────────┼─────────┘                     │
                        │                               │
                   ┌────▼────┐                         │
                   │OrderItem│◄────────────────────────┘
                   └─────────┘
```

### Key Relationships

1. **User ↔ Tenant** (Many-to-Many)
   - Users can belong to multiple tenants
   - Tenants can have multiple users
   - UserTenant junction table stores role

2. **Tenant ↔ Data** (One-to-Many)
   - Each tenant has many customers, orders, products
   - Data isolated by tenantId

3. **Customer ↔ Order** (One-to-Many)
   - Customer can have multiple orders
   - Order belongs to one customer (nullable for guest checkouts)

4. **Order ↔ OrderItem** (One-to-Many)
   - Order contains multiple line items

## API Architecture

### Webhook Flow

```
Shopify Event (e.g., Order Created)
         ↓
    POST /api/webhooks/orders
         ↓
    [HMAC Verification]
         ↓ (valid)
    Extract Shopify Domain from Header
         ↓
    Find Tenant by shopifyDomain
         ↓
    [Upsert Customer] (if customer data exists)
         ↓
    [Upsert Order]
         ↓
    [Create Order Items]
         ↓
    [Update Customer Statistics]
         ↓
    Return 200 OK
```

### Dashboard Data Flow

```
User Request: GET /api/dashboard/{tenantId}?startDate=...&endDate=...
         ↓
    [Verify Session] (NextAuth)
         ↓
    [Check Tenant Access] (UserTenant lookup)
         ↓ (authorized)
    Execute Parallel Queries:
    - Count customers
    - Count orders (with date filter)
    - Count products
    - Fetch orders (for revenue calculation)
    - Fetch top customers
    - Fetch recent events
         ↓
    Aggregate & Transform Data
         ↓
    Return JSON Response
         ↓
    Client: Render Charts with Chart.js
```

## Security Architecture

### Authentication Flow

```
1. Sign Up:
   User → /api/auth/signup → Hash Password → Create User → Redirect to Sign In

2. Sign In:
   User → /api/auth/signin (NextAuth) → Verify Password → Generate JWT → Set Cookie

3. Protected Page:
   User Request → Middleware checks session → Valid → Allow Access
```

### Authorization Model

```typescript
// Role-Based Access Control (RBAC)
UserTenant {
  role: 'admin' | 'viewer'
}

// Admin: Can modify tenant settings, add users
// Viewer: Can only view dashboard (read-only)
```

## Performance Considerations

### Database Indexing

```sql
-- Critical indexes for performance
CREATE INDEX idx_customer_tenantId ON "Customer"("tenantId");
CREATE INDEX idx_customer_email ON "Customer"("email");
CREATE INDEX idx_order_tenantId ON "Order"("tenantId");
CREATE INDEX idx_order_customerId ON "Order"("customerId");
CREATE INDEX idx_order_createdAt ON "Order"("createdAt");
```

### Query Optimization

1. **Parallel Queries**: Dashboard uses Promise.all() for concurrent data fetching
2. **Date Filtering**: Orders filtered at database level, not in application
3. **Limited Results**: Top customers limited to 5, recent events to 10
4. **Aggregation**: Revenue calculated in application (could be moved to DB view)

## Scalability Path

### Current State (MVP)
- Single Next.js server
- Single PostgreSQL database
- Synchronous webhook processing

### Phase 1 - Horizontal Scaling
```
Load Balancer
      ↓
[Next.js] [Next.js] [Next.js]
      ↓
PostgreSQL (single instance)
```

### Phase 2 - Async Processing
```
Shopify Webhooks
      ↓
[API Gateway]
      ↓
[Message Queue: RabbitMQ/SQS]
      ↓
[Worker Pool] → PostgreSQL
```

### Phase 3 - Read Replicas
```
Write Traffic → Primary DB
Read Traffic → Replica 1, Replica 2, Replica 3
```

### Phase 4 - Caching Layer
```
Dashboard Request
      ↓
[Redis Cache] → (miss) → PostgreSQL
      ↓
Return Cached Response (TTL: 5 minutes)
```

## Monitoring & Observability

### Recommended Metrics

**Application Metrics:**
- Webhook processing time
- API response times
- Dashboard load time
- Authentication success/failure rate

**Business Metrics:**
- Total tenants
- Active users per day
- Webhook events processed per minute
- Data sync lag time

**Infrastructure Metrics:**
- Database connection pool usage
- CPU and memory utilization
- Disk I/O
- Network throughput

## Disaster Recovery

### Backup Strategy

1. **Database Backups**
   - Automated daily backups
   - Point-in-time recovery (PostgreSQL WAL)
   - 30-day retention

2. **Configuration Backups**
   - Environment variables stored in secrets manager
   - Infrastructure as Code (Terraform/Pulumi)

### Recovery Procedures

1. **Webhook Data Loss**: Re-sync from Shopify Admin API
2. **Database Corruption**: Restore from latest backup
3. **Application Failure**: Auto-restart with health checks

---

This architecture is designed for:
- **Reliability**: Multiple layers of data validation
- **Scalability**: Can grow from 10 to 10,000 tenants
- **Maintainability**: Clear separation of concerns
- **Security**: Defense in depth approach
