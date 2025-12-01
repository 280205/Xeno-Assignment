# Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### Issue: npm install fails

**Error:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install
```

---

#### Issue: Prisma installation fails

**Error:**
```
Error: Failed to download Prisma engines
```

**Solution:**
```bash
# Set environment variable
set PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh

# Reinstall Prisma
npm install @prisma/client prisma --save
```

---

### Database Issues

#### Issue: Cannot connect to database

**Error:**
```
Error: P1001: Can't reach database server at localhost:5432
```

**Solutions:**

1. **Check PostgreSQL is running:**
```bash
# Windows
sc query postgresql-x64-14

# If not running, start it
net start postgresql-x64-14
```

2. **Verify DATABASE_URL:**
```env
# Should look like this
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# For cloud databases
DATABASE_URL="postgresql://user:pass@host.region.provider.com:5432/dbname"
```

3. **Test connection:**
```bash
# Windows (using psql)
psql -h localhost -U postgres -d xeno_shopify
```

---

#### Issue: Database schema out of sync

**Error:**
```
Error: The table `main.Customer` does not exist in the current database.
```

**Solution:**
```bash
# Push schema to database
npx prisma db push

# Regenerate Prisma client
npx prisma generate
```

---

#### Issue: Migration conflicts

**Error:**
```
Error: P3005: The database schema is not empty
```

**Solution:**
```bash
# Reset database (WARNING: Deletes all data)
npx prisma db push --force-reset

# Reseed
npm run db:seed
```

---

### Authentication Issues

#### Issue: Cannot sign in after signup

**Error:**
```
Invalid email or password
```

**Solutions:**

1. **Check password:**
   - Make sure you're using the correct password
   - Password is case-sensitive

2. **Check database:**
```bash
npx prisma studio
# Open Users table and verify user exists
```

3. **Check environment variables:**
```env
NEXTAUTH_SECRET="should-be-set"
NEXTAUTH_URL="http://localhost:3000"
```

---

#### Issue: Session not persisting

**Error:** Redirected to sign-in after refresh

**Solutions:**

1. **Check NEXTAUTH_SECRET:**
```env
# Must be at least 32 characters
NEXTAUTH_SECRET="generate-a-very-long-random-string-here-minimum-32-chars"
```

2. **Generate secure secret:**
```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

3. **Clear cookies:**
   - Open browser DevTools → Application → Cookies
   - Delete all cookies for localhost:3000
   - Try signing in again

---

### Webhook Issues

#### Issue: Webhooks return 404

**Error:** Shopify shows "Failed to deliver webhook"

**Solutions:**

1. **Verify URL is correct:**
```
https://your-app.vercel.app/api/webhooks/orders
                              ^^^^^^^^^^^^^^^^^^^^
                              Must be exact path
```

2. **Check deployment logs:**
   - Vercel Dashboard → Functions → View logs
   - Look for errors in webhook handlers

3. **Test locally:**
```bash
curl -X POST http://localhost:3000/api/webhooks/orders \
  -H "Content-Type: application/json" \
  -H "x-shopify-shop-domain: test.myshopify.com" \
  -d '{"id": 123, "total_price": "10.00", "line_items": []}'
```

---

#### Issue: 401 Invalid webhook signature

**Error:**
```json
{"error": "Invalid webhook signature"}
```

**Solutions:**

1. **Verify SHOPIFY_WEBHOOK_SECRET:**
   - Go to Shopify Admin → Settings → Notifications → Webhooks
   - Copy the "Webhook signing secret"
   - Add to `.env`:
   ```env
   SHOPIFY_WEBHOOK_SECRET="your-actual-secret-from-shopify"
   ```

2. **Restart server after updating .env:**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

3. **For testing, temporarily disable verification:**
```typescript
// In webhook route (ONLY FOR TESTING!)
// if (process.env.SHOPIFY_WEBHOOK_SECRET && hmacHeader) {
//   const isValid = verifyShopifyWebhook(...)
//   if (!isValid) return NextResponse.json(...)
// }
```

---

#### Issue: Data not appearing in dashboard

**Scenario:** Webhook returns 200 OK but no data shows up

**Solutions:**

1. **Check tenant exists:**
```bash
npx prisma studio
# Verify Tenant table has entry with matching shopifyDomain
```

2. **Check webhook header:**
```
x-shopify-shop-domain: must-match-tenant-shopifyDomain
```

3. **Check API logs:**
```bash
# Development: Terminal where you ran npm run dev
# Production: Vercel Dashboard → Functions → Logs
```

4. **Manually verify data:**
```bash
npx prisma studio
# Check if Customer, Order, or Product was created
```

---

### Dashboard Issues

#### Issue: Charts not rendering

**Error:** Blank spaces where charts should be

**Solutions:**

1. **Check browser console:**
   - F12 → Console tab
   - Look for JavaScript errors

2. **Verify data is loaded:**
   - F12 → Network tab
   - Check `/api/dashboard/[tenantId]` response
   - Should return JSON with data

3. **Clear browser cache:**
   - Ctrl+Shift+Delete
   - Clear cached images and files
   - Refresh page

---

#### Issue: No data shown even with test data

**Solutions:**

1. **Verify tenant is selected:**
   - Check dropdown at top
   - Should show your store name

2. **Check date range:**
   - Default is last 30 days
   - If all data is older, widen the range
   - Click "Last 30 Days" button

3. **Verify data exists:**
```bash
npx prisma studio
# Check Customer, Order, Product tables
# Verify tenantId matches selected tenant
```

---

### Deployment Issues

#### Issue: Vercel build fails

**Error:**
```
Error: Command "prisma generate && next build" exited with 1
```

**Solutions:**

1. **Check build logs in Vercel:**
   - Vercel Dashboard → Deployments → Click on failed build
   - Read error message

2. **Common fixes:**
   - Ensure `DATABASE_URL` is set in environment variables
   - Ensure `NEXTAUTH_SECRET` is set
   - Check for TypeScript errors locally

3. **Test build locally:**
```bash
npm run build
```

---

#### Issue: Database connection fails in production

**Error:**
```
P1001: Can't reach database server
```

**Solutions:**

1. **Check DATABASE_URL in Vercel:**
   - Settings → Environment Variables
   - Verify it's set for Production

2. **For cloud databases, ensure SSL is enabled:**
```env
DATABASE_URL="postgresql://...?sslmode=require"
```

3. **Check database allows connections from Vercel:**
   - Railway: Should work by default
   - Supabase: Enable "Direct connection"
   - Others: Check IP whitelist

---

#### Issue: Environment variables not updating

**Scenario:** Changed env var but still using old value

**Solution:**
```bash
# Vercel caches environment variables
# After changing env vars:
# 1. Go to Vercel Dashboard
# 2. Deployments → Click on latest
# 3. Click "Redeploy"
```

---

### Performance Issues

#### Issue: Dashboard loads slowly

**Solutions:**

1. **Check database query performance:**
```bash
# Enable Prisma query logging
# In prisma/schema.prisma:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["metrics"]
}
```

2. **Reduce date range:**
   - Default shows 30 days
   - Try 7 days for faster loading

3. **Check database connection:**
   - Use database with good connection
   - Consider upgrading database tier

---

#### Issue: Webhooks timing out

**Error:** Shopify shows "Timeout after 5 seconds"

**Solutions:**

1. **Optimize webhook handlers:**
   - Current code should be fast enough
   - Check database connection pool

2. **For production, use async processing:**
   - Add message queue (RabbitMQ, SQS)
   - Return 200 OK immediately
   - Process in background

---

### Browser-Specific Issues

#### Issue: Charts look weird in Safari

**Solution:**
```bash
# Make sure autoprefixer is installed
npm install -D autoprefixer

# postcss.config.js should have:
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

#### Issue: Authentication not working in incognito

**Solution:**
- This is normal - cookies are blocked in strict incognito
- Test in normal browser window
- For production, ensure HTTPS is enabled

---

## Debugging Tips

### Enable Detailed Logging

**Development:**
```typescript
// In webhook handlers, add:
console.log('Received webhook:', {
  shop: request.headers.get('x-shopify-shop-domain'),
  topic: request.headers.get('x-shopify-topic'),
  bodyPreview: body.substring(0, 100)
})
```

**Production (Vercel):**
- Dashboard → Functions → Select function → View logs
- Logs persist for 24 hours on free tier

---

### Check Database State

```bash
# Open Prisma Studio
npx prisma studio

# Runs at http://localhost:5555
# Visual interface to browse all tables
```

---

### Test API Endpoints

```bash
# Using PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/dashboard/TENANT_ID" `
  -Headers @{"Cookie"="next-auth.session-token=YOUR_TOKEN"}
```

---

### Reset Everything

If all else fails:

```bash
# 1. Stop server
# Ctrl+C

# 2. Clear database
npx prisma db push --force-reset

# 3. Clear node_modules
rmdir /s /q node_modules
rmdir /s /q .next

# 4. Clear npm cache
npm cache clean --force

# 5. Reinstall
npm install

# 6. Regenerate Prisma
npx prisma generate

# 7. Reseed
npm run db:seed

# 8. Restart
npm run dev
```

---

## Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Read error messages carefully
3. Check browser console (F12)
4. Check terminal output
5. Review relevant documentation

### Where to Look

- **README.md** - Setup and overview
- **QUICKSTART.md** - Fast setup guide
- **API_DOCS.md** - API reference
- **ARCHITECTURE.md** - How it works
- **DEPLOYMENT.md** - Deploy guide

### Debugging Checklist

- [ ] Is the server running? (`npm run dev`)
- [ ] Is the database accessible?
- [ ] Are environment variables set correctly?
- [ ] Did I run `npx prisma generate` after schema changes?
- [ ] Did I restart the server after changing `.env`?
- [ ] Are there errors in the browser console?
- [ ] Are there errors in the terminal?
- [ ] Did I try in incognito mode?
- [ ] Did I clear browser cache?
- [ ] Did I check the docs?

---

## Still Stuck?

If you've tried everything:

1. **Check project files** - Compare with this guide
2. **Start fresh** - Clone repo again, follow QUICKSTART.md
3. **Isolate the issue** - Does it work locally? In production?
4. **Document the error** - Exact error message, steps to reproduce

Remember: Most issues are simple configuration problems!
