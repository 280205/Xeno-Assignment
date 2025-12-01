# Test Data & Manual Testing Guide

## Quick Test Scenarios

This guide helps you manually test all features before recording your demo.

---

## Scenario 1: User Registration & Authentication

### Test Case 1.1: Sign Up
**Steps:**
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Enter:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "test123456"
4. Click "Sign Up"

**Expected:**
- Redirected to sign-in page
- Success message (if implemented)

**Verify:**
```bash
npx prisma studio
# Check Users table - should have new entry
```

### Test Case 1.2: Sign In
**Steps:**
1. Go to sign-in page
2. Enter:
   - Email: "test@example.com"
   - Password: "test123456"
3. Click "Sign In"

**Expected:**
- Redirected to /dashboard
- Email shown in header

---

## Scenario 2: Tenant Management

### Test Case 2.1: Add Store
**Steps:**
1. Sign in
2. Click "Add Store"
3. Enter:
   - Store Name: "Electronics Emporium"
   - Shopify Domain: "electronics-emporium.myshopify.com"
   - Access Token: (leave empty for now)
4. Click "Add Store"

**Expected:**
- Modal closes
- Store appears in dropdown

**Verify:**
```bash
npx prisma studio
# Check Tenant table - should have new entry
# Check UserTenant table - should link user to tenant
```

### Test Case 2.2: Switch Stores
**Steps:**
1. Add 2-3 stores with different names
2. Use dropdown to switch between them

**Expected:**
- Dashboard updates with selected store's data
- Different metrics for each store

---

## Scenario 3: Webhook Testing

### Test Case 3.1: Customer Webhook

**PowerShell Command:**
```powershell
$body = @{
    id = 123456789
    email = "john.doe@example.com"
    first_name = "John"
    last_name = "Doe"
    phone = "+1234567890"
    total_spent = "350.00"
    orders_count = 5
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "http://localhost:3000/api/webhooks/customers" `
    -Method POST `
    -Headers @{
        "Content-Type"="application/json"
        "x-shopify-shop-domain"="electronics-emporium.myshopify.com"
    } `
    -Body $body
```

**Expected Response:**
```json
{"success": true}
```

**Verify:**
```bash
npx prisma studio
# Check Customer table - should have John Doe
# tenantId should match electronics-emporium tenant
```

### Test Case 3.2: Order Webhook

**PowerShell Command:**
```powershell
$body = @{
    id = 987654321
    email = "john.doe@example.com"
    total_price = "149.99"
    subtotal_price = "139.99"
    total_tax = "10.00"
    currency = "USD"
    financial_status = "paid"
    fulfillment_status = "fulfilled"
    order_number = 1001
    customer = @{
        id = 123456789
        email = "john.doe@example.com"
        first_name = "John"
        last_name = "Doe"
    }
    line_items = @(
        @{
            id = 111222333
            product_id = 444555666
            title = "Wireless Headphones"
            quantity = 1
            price = "139.99"
        }
    )
} | ConvertTo-Json -Depth 5

Invoke-WebRequest `
    -Uri "http://localhost:3000/api/webhooks/orders" `
    -Method POST `
    -Headers @{
        "Content-Type"="application/json"
        "x-shopify-shop-domain"="electronics-emporium.myshopify.com"
    } `
    -Body $body
```

**Expected:**
- Response: `{"success": true}`
- Dashboard updates with new order
- Customer's totalSpent increases

**Verify:**
```bash
npx prisma studio
# Order table: New order for John Doe
# OrderItem table: Wireless Headphones entry
# Customer table: totalSpent updated
```

### Test Case 3.3: Product Webhook

**PowerShell Command:**
```powershell
$body = @{
    id = 444555666
    title = "Wireless Headphones"
    body_html = "<p>Premium noise-canceling headphones</p>"
    vendor = "TechCo"
    product_type = "Electronics"
    variants = @(
        @{
            id = 777888999
            price = "139.99"
            inventory_quantity = 50
        }
    )
} | ConvertTo-Json -Depth 5

Invoke-WebRequest `
    -Uri "http://localhost:3000/api/webhooks/products" `
    -Method POST `
    -Headers @{
        "Content-Type"="application/json"
        "x-shopify-shop-domain"="electronics-emporium.myshopify.com"
    } `
    -Body $body
```

**Expected:**
- Response: `{"success": true}`
- Product appears in dashboard metrics

### Test Case 3.4: Custom Event Webhook

**PowerShell Command:**
```powershell
$body = @{
    customer_id = 123456789
    event_type = "cart_abandoned"
    data = @{
        cart_token = "abc123xyz"
        items_count = 2
        cart_value = "199.98"
    }
} | ConvertTo-Json -Depth 3

Invoke-WebRequest `
    -Uri "http://localhost:3000/api/webhooks/events" `
    -Method POST `
    -Headers @{
        "Content-Type"="application/json"
        "x-shopify-shop-domain"="electronics-emporium.myshopify.com"
    } `
    -Body $body
```

**Expected:**
- Response: `{"success": true}`
- Event appears in custom events chart

---

## Scenario 4: Dashboard Features

### Test Case 4.1: View Metrics
**Steps:**
1. Sign in
2. Select store with test data
3. Observe metrics cards

**Expected:**
- Total Customers: Matches database count
- Total Orders: Matches database count
- Total Revenue: Sum of all order totals
- Avg Order Value: Revenue ÷ Orders

### Test Case 4.2: Date Filtering
**Steps:**
1. Note current metrics
2. Click "Last 30 Days" button
3. Manually set date range to last 7 days
4. Observe changes

**Expected:**
- Metrics update based on date range
- Charts show filtered data
- Only orders within range counted

### Test Case 4.3: Charts Rendering
**Steps:**
1. Ensure test data exists
2. View each chart:
   - Revenue trend (line chart)
   - Orders by date (bar chart)
   - Custom events (doughnut chart)

**Expected:**
- All charts render without errors
- Data is accurate
- Hover shows tooltips
- Charts are responsive

### Test Case 4.4: Top Customers
**Steps:**
1. View "Top 5 Customers" section
2. Verify order by spend (highest first)

**Expected:**
- Shows up to 5 customers
- Sorted by totalSpent descending
- Shows name, email, total spent, order count

---

## Scenario 5: Multi-Tenant Isolation

### Test Case 5.1: Data Isolation
**Steps:**
1. Create two stores:
   - Store A: "Electronics Emporium"
   - Store B: "Fashion Boutique"
2. Send customer webhook to Store A
3. Send different customer webhook to Store B
4. Switch between stores in dashboard

**Expected:**
- Store A shows only its customer
- Store B shows only its customer
- No cross-tenant data leakage

**Verify:**
```bash
npx prisma studio
# Check tenantId on all Customer records
# Should match respective tenant IDs
```

### Test Case 5.2: User Access Control
**Steps:**
1. Create User A and assign to Store 1
2. Create User B and assign to Store 2
3. Sign in as User A
4. Try to access dashboard

**Expected:**
- User A sees only Store 1 in dropdown
- Cannot access Store 2 data
- API returns 403 if trying to access unauthorized tenant

---

## Scenario 6: Error Handling

### Test Case 6.1: Invalid Login
**Steps:**
1. Try to sign in with wrong password

**Expected:**
- Error message: "Invalid email or password"
- Stays on sign-in page

### Test Case 6.2: Duplicate Email
**Steps:**
1. Sign up with existing email

**Expected:**
- Error message: "User already exists"
- Stays on sign-up page

### Test Case 6.3: Invalid Webhook
**PowerShell Command:**
```powershell
$body = @{
    id = 123
    # Missing required fields
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "http://localhost:3000/api/webhooks/orders" `
    -Method POST `
    -Headers @{
        "Content-Type"="application/json"
        "x-shopify-shop-domain"="nonexistent.myshopify.com"
    } `
    -Body $body
```

**Expected:**
- Response: 404 or 500
- Error logged in console
- No data created in database

---

## Complete Test Data Set

Use this to populate your database for demo:

```bash
# Run seed script (already creates good test data)
npm run db:seed

# Or use Prisma Studio to manually add:
```

**Demo User:**
- Email: demo@example.com
- Password: demo123

**Demo Store:**
- Name: Demo Electronics Store
- Domain: demo-store.myshopify.com

**5 Customers:**
1. John Doe - john@example.com - $450 spent
2. Jane Smith - jane@example.com - $890 spent
3. Bob Johnson - bob@example.com - $320 spent
4. Alice Brown - alice@example.com - $670 spent
5. Charlie Wilson - charlie@example.com - $540 spent

**10 Products:**
1. Wireless Headphones - $99.99
2. Smart Watch - $199.99
3. Laptop Stand - $49.99
4. USB-C Hub - $39.99
5. Mechanical Keyboard - $129.99
6. Gaming Mouse - $79.99
7. Monitor Arm - $89.99
8. Webcam - $69.99
9. Desk Lamp - $34.99
10. Phone Case - $19.99

**15 Orders:**
- Spread over last 30 days
- Different customers
- Various products
- Mix of paid/pending status

**Custom Events:**
- 5 cart_abandoned
- 3 checkout_started
- 2 product_viewed

---

## Performance Testing

### Test Case: Load Time
1. Open DevTools (F12) → Network tab
2. Clear cache (Ctrl+Shift+Delete)
3. Reload dashboard
4. Check timing:
   - HTML: < 500ms
   - API call: < 1s
   - Total load: < 2s

### Test Case: Large Dataset
1. Add 1000 orders via script
2. Load dashboard
3. Verify:
   - Still loads in < 3s
   - Charts render correctly
   - No browser errors

---

## Mobile Testing

### Test Case: Responsive Design
**Steps:**
1. Open app in Chrome
2. F12 → Toggle device toolbar (Ctrl+Shift+M)
3. Test on:
   - iPhone 12 (390x844)
   - iPad (768x1024)
   - Samsung Galaxy (360x800)

**Expected:**
- All elements visible
- No horizontal scroll
- Charts scale properly
- Touch-friendly buttons

---

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)
- [ ] Edge (latest)

**Expected:**
- Consistent behavior
- Charts render correctly
- No console errors

---

## API Testing with Postman

If you prefer Postman over curl/PowerShell:

**Collection:** Xeno Shopify Insights

**Requests:**

1. **Sign Up**
   - POST {{baseUrl}}/api/auth/signup
   - Body: `{"email": "test@example.com", "password": "test123", "name": "Test"}`

2. **Get Tenants**
   - GET {{baseUrl}}/api/tenants
   - Headers: Cookie (session)

3. **Create Tenant**
   - POST {{baseUrl}}/api/tenants
   - Body: `{"name": "Test Store", "shopifyDomain": "test.myshopify.com"}`

4. **Get Dashboard**
   - GET {{baseUrl}}/api/dashboard/{{tenantId}}?startDate=2025-01-01&endDate=2025-01-31

5. **Customer Webhook**
   - POST {{baseUrl}}/api/webhooks/customers
   - Headers: x-shopify-shop-domain
   - Body: Customer JSON

---

## Pre-Demo Checklist

Before recording video:

**Data:**
- [ ] At least 5 customers
- [ ] At least 10 orders
- [ ] Orders span last 30 days
- [ ] Multiple products exist
- [ ] Some custom events

**Functionality:**
- [ ] Can sign in quickly
- [ ] Store selector works
- [ ] All metrics show data
- [ ] All charts render
- [ ] Date filter works
- [ ] Top customers populate

**Performance:**
- [ ] Dashboard loads < 2s
- [ ] No console errors
- [ ] Charts animate smoothly

**Appearance:**
- [ ] Clean browser (no extensions visible)
- [ ] Good demo data (realistic names/products)
- [ ] Professional store name

---

## During Demo

**What to Show:**
1. Clean landing page
2. Quick sign in (don't show password typing)
3. Tenant selection
4. Metrics overview
5. Each chart type
6. Date filtering in action
7. Top customers list
8. Switch to code view (briefly)
9. Webhook handler code
10. Database schema

**What to Avoid:**
- Don't get stuck on errors
- Don't show personal info
- Don't ramble
- Don't show `.env` file

---

## Testing Checklist

Before submitting, verify:

- [ ] All API endpoints work
- [ ] All pages load correctly
- [ ] Authentication flow works
- [ ] Dashboard shows accurate data
- [ ] Charts render without errors
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Webhooks process correctly
- [ ] Multi-tenant isolation works
- [ ] Date filtering accurate
- [ ] Top customers ordered correctly

---

**You're ready to test!** Run through each scenario and fix any issues before recording your demo.
