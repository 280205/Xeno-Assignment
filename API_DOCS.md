# API Documentation

## Base URL

**Development:** `http://localhost:3000`  
**Production:** `https://your-app.vercel.app`

## Authentication

All protected endpoints require a valid session cookie set by NextAuth.

To authenticate:
1. Call `POST /api/auth/signup` to create account
2. Call NextAuth sign-in endpoint with credentials
3. Session cookie will be automatically set

## Endpoints

### Authentication

#### Sign Up

Creates a new user account.

```
POST /api/auth/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "clx123abc",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- `400` - Email and password are required
- `400` - User already exists

---

#### Sign In

Handled by NextAuth at `/api/auth/signin`

Use `signIn()` from `next-auth/react`:
```typescript
await signIn('credentials', {
  email: 'user@example.com',
  password: 'password',
  redirect: false
})
```

---

### Tenant Management

#### List Tenants

Get all stores the authenticated user has access to.

```
GET /api/tenants
```

**Headers:**
- `Cookie: next-auth.session-token=...` (automatic)

**Response (200):**
```json
{
  "tenants": [
    {
      "id": "clx456def",
      "name": "My Store",
      "shopifyDomain": "mystore.myshopify.com",
      "role": "admin",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized (not signed in)

---

#### Create Tenant

Add a new Shopify store to the platform.

```
POST /api/tenants
```

**Request Body:**
```json
{
  "name": "My New Store",
  "shopifyDomain": "newstore.myshopify.com",
  "shopifyAccessToken": "shpat_abc123..." // Optional
}
```

**Response (200):**
```json
{
  "tenant": {
    "id": "clx789ghi",
    "name": "My New Store",
    "shopifyDomain": "newstore.myshopify.com",
    "createdAt": "2025-01-15T11:00:00Z"
  }
}
```

**Errors:**
- `401` - Unauthorized
- `400` - Name and Shopify domain are required

---

### Dashboard

#### Get Dashboard Data

Retrieve analytics and metrics for a specific tenant.

```
GET /api/dashboard/{tenantId}
```

**URL Parameters:**
- `tenantId` - The ID of the tenant/store

**Query Parameters:**
- `startDate` - ISO date string (e.g., `2025-01-01`)
- `endDate` - ISO date string (e.g., `2025-01-31`)

**Example:**
```
GET /api/dashboard/clx456def?startDate=2025-01-01&endDate=2025-01-31
```

**Response (200):**
```json
{
  "overview": {
    "totalCustomers": 150,
    "totalOrders": 320,
    "totalProducts": 45,
    "totalRevenue": 12500.50,
    "averageOrderValue": 39.06
  },
  "ordersByDate": [
    {
      "date": "2025-01-15",
      "count": 12,
      "revenue": 450.00
    },
    {
      "date": "2025-01-16",
      "count": 18,
      "revenue": 720.50
    }
  ],
  "topCustomers": [
    {
      "id": "clx111aaa",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "totalSpent": 1250.00,
      "ordersCount": 15
    }
  ],
  "recentEvents": [
    {
      "id": "clx222bbb",
      "eventType": "cart_abandoned",
      "createdAt": "2025-01-15T14:30:00Z",
      "customer": {
        "email": "john@example.com"
      }
    }
  ],
  "eventStats": [
    {
      "eventType": "cart_abandoned",
      "_count": 25
    },
    {
      "eventType": "checkout_started",
      "_count": 40
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (user doesn't have access to this tenant)

---

### Webhooks (Shopify → Your Server)

These endpoints receive data from Shopify webhooks.

#### Customer Webhook

Sync customer data when created or updated.

```
POST /api/webhooks/customers
```

**Headers:**
- `x-shopify-hmac-sha256` - HMAC signature for verification
- `x-shopify-shop-domain` - Store domain (e.g., `mystore.myshopify.com`)

**Request Body:** (Shopify customer object)
```json
{
  "id": 123456789,
  "email": "customer@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "total_spent": "250.00",
  "orders_count": 5
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- `401` - Invalid webhook signature
- `404` - Tenant not found
- `500` - Internal server error

---

#### Order Webhook

Sync order data when created or updated.

```
POST /api/webhooks/orders
```

**Headers:**
- `x-shopify-hmac-sha256` - HMAC signature
- `x-shopify-shop-domain` - Store domain

**Request Body:** (Shopify order object)
```json
{
  "id": 987654321,
  "email": "customer@example.com",
  "total_price": "99.99",
  "subtotal_price": "89.99",
  "total_tax": "10.00",
  "currency": "USD",
  "financial_status": "paid",
  "fulfillment_status": "fulfilled",
  "order_number": 1001,
  "customer": {
    "id": 123456789,
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "line_items": [
    {
      "id": 111222333,
      "product_id": 444555666,
      "title": "Cool Product",
      "quantity": 2,
      "price": "44.99"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true
}
```

---

#### Product Webhook

Sync product data when created or updated.

```
POST /api/webhooks/products
```

**Headers:**
- `x-shopify-hmac-sha256` - HMAC signature
- `x-shopify-shop-domain` - Store domain

**Request Body:** (Shopify product object)
```json
{
  "id": 444555666,
  "title": "Cool Product",
  "body_html": "<p>Product description</p>",
  "vendor": "Acme Corp",
  "product_type": "Electronics",
  "variants": [
    {
      "id": 777888999,
      "price": "49.99",
      "inventory_quantity": 100
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true
}
```

---

#### Custom Events Webhook

Track custom events like cart abandonment.

```
POST /api/webhooks/events
```

**Headers:**
- `x-shopify-shop-domain` - Store domain

**Request Body:**
```json
{
  "customer_id": 123456789,
  "event_type": "cart_abandoned",
  "data": {
    "cart_token": "abc123",
    "items_count": 3,
    "cart_value": "150.00"
  }
}
```

**Response (200):**
```json
{
  "success": true
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized for this resource)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Rate Limiting

**Current:** No rate limiting implemented

**Recommended for Production:**
- Webhook endpoints: 100 requests/minute per IP
- Dashboard API: 60 requests/minute per user
- Authentication: 5 attempts/minute per IP

---

## Webhook Security

### HMAC Verification

Shopify signs each webhook with HMAC-SHA256. Verify authenticity:

```typescript
import crypto from 'crypto'

function verifyWebhook(body: string, hmacHeader: string, secret: string) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64')
  
  return hash === hmacHeader
}
```

**Always verify webhooks in production!**

---

## Example Usage

### Complete Flow: Add Store & View Dashboard

```typescript
// 1. Sign up
await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password',
    name: 'John Doe'
  })
})

// 2. Sign in
await signIn('credentials', {
  email: 'user@example.com',
  password: 'password'
})

// 3. Add store
const response = await fetch('/api/tenants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Store',
    shopifyDomain: 'mystore.myshopify.com'
  })
})
const { tenant } = await response.json()

// 4. Get dashboard data
const dashboardData = await fetch(
  `/api/dashboard/${tenant.id}?startDate=2025-01-01&endDate=2025-01-31`
)
const data = await dashboardData.json()
console.log(data.overview.totalRevenue)
```

---

## Testing Webhooks Locally

Use ngrok or localtunnel to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 3000
ngrok http 3000

# Use the ngrok URL in Shopify webhook settings
# Example: https://abc123.ngrok.io/api/webhooks/orders
```

---

For more details, see [README.md](./README.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).
