# Deployment Guide

## Deploying to Vercel

### Prerequisites

1. GitHub account
2. Vercel account (free tier works)
3. PostgreSQL database (Railway, Supabase, or Neon)

### Step-by-Step Deployment

#### 1. Set Up Database

**Option A: Railway (Recommended)**

1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the connection string (looks like: `postgresql://user:pass@host:port/db`)

**Option B: Supabase**

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Connection string (Direct connection)

**Option C: Neon**

1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy the connection string

#### 2. Push Code to GitHub

```bash
cd "c:\Users\Nitin Pandey\Downloads\xeno"

# Initialize git if not already done
git init

# Create .gitignore (already created)

# Add all files
git add .

# Commit
git commit -m "Initial commit: Xeno Shopify Insights Platform"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/xeno-shopify-insights.git
git branch -M main
git push -u origin main
```

#### 3. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && next build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add Environment Variables:

```env
DATABASE_URL=postgresql://user:pass@host:port/dbname
NEXTAUTH_SECRET=generate-a-long-random-string-here
NEXTAUTH_URL=https://your-app.vercel.app
SHOPIFY_WEBHOOK_SECRET=your-shopify-webhook-secret
```

To generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

6. Click "Deploy"

#### 4. Initialize Database

After deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run Prisma commands on Vercel
vercel env pull .env.local
npx prisma db push
```

Or manually via Prisma Studio:
```bash
# Set DATABASE_URL from Vercel
export DATABASE_URL="your-database-url"
npx prisma db push
```

#### 5. Seed Demo Data (Optional)

```bash
npm run db:seed
```

#### 6. Configure Shopify Webhooks

1. Go to Shopify Admin → Settings → Notifications → Webhooks
2. Add webhooks with your Vercel URL:

- **Customer creation**: `https://your-app.vercel.app/api/webhooks/customers`
- **Customer update**: `https://your-app.vercel.app/api/webhooks/customers`
- **Order creation**: `https://your-app.vercel.app/api/webhooks/orders`
- **Order update**: `https://your-app.vercel.app/api/webhooks/orders`
- **Product creation**: `https://your-app.vercel.app/api/webhooks/products`
- **Product update**: `https://your-app.vercel.app/api/webhooks/products`

3. Set format to **JSON**
4. Copy the webhook signing secret and add to Vercel environment variables as `SHOPIFY_WEBHOOK_SECRET`
5. Redeploy on Vercel after adding the secret

---

## Alternative Deployment Options

### Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Add PostgreSQL service
4. Add environment variables
5. Deploy

### Deploy to Render

1. Go to [render.com](https://render.com)
2. New Web Service → Connect repository
3. Set build command: `npm install && npx prisma generate && npm run build`
4. Set start command: `npm start`
5. Add PostgreSQL database
6. Add environment variables
7. Deploy

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | `random-32-char-string` |
| `NEXTAUTH_URL` | Your app's public URL | `https://your-app.vercel.app` |
| `SHOPIFY_WEBHOOK_SECRET` | Webhook verification secret | From Shopify settings |

---

## Post-Deployment Checklist

- [ ] Database is accessible and migrations applied
- [ ] Environment variables are set correctly
- [ ] App loads at production URL
- [ ] Sign up/sign in works
- [ ] Can create tenant
- [ ] Dashboard displays correctly
- [ ] Webhooks are configured in Shopify
- [ ] Test webhook by creating order in Shopify
- [ ] Data appears in dashboard

---

## Troubleshooting

### Build Fails

**Error: Prisma schema not found**
- Ensure `prisma/schema.prisma` is in your repo
- Check build command includes `prisma generate`

**Error: Module not found**
- Clear Vercel cache and redeploy
- Check all dependencies are in `package.json`

### Database Connection Issues

**Error: Connection timeout**
- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- For Railway/Supabase: Use direct connection string, not pooling

**Error: SSL required**
- Add `?sslmode=require` to DATABASE_URL
- Example: `postgresql://...?sslmode=require`

### Webhook Not Working

**Orders not appearing in dashboard**
1. Check webhook is active in Shopify
2. Verify webhook URL is correct
3. Check webhook logs in Shopify (Recent deliveries)
4. View Vercel function logs for errors
5. Ensure `SHOPIFY_WEBHOOK_SECRET` matches

**401 Invalid webhook signature**
- Double-check `SHOPIFY_WEBHOOK_SECRET` environment variable
- Ensure it matches the secret shown in Shopify

### Authentication Issues

**Cannot sign in**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Try in incognito mode (clear cookies)

---

## Monitoring

### Vercel Dashboard

- View deployment logs
- Monitor function invocations
- Check error rates

### Database Monitoring

- **Railway**: Built-in metrics
- **Supabase**: Database usage tab
- **Neon**: Dashboard metrics

### Recommended Monitoring

1. **Uptime Monitoring**: UptimeRobot, Pingdom
2. **Error Tracking**: Sentry
3. **Analytics**: Vercel Analytics, Google Analytics

---

## Scaling Considerations

### Current Setup (Good for 100-1000 stores)

- Vercel serverless functions
- Single PostgreSQL instance
- No caching

### When to Scale

**Add Redis Cache** when:
- Dashboard load time > 2 seconds
- Same queries run frequently
- Database CPU > 70%

**Add Database Replicas** when:
- Read queries slow down writes
- Database connections maxed out
- Multiple regions needed

**Add Message Queue** when:
- Webhook processing > 1 second
- Need retry logic
- Want async processing

---

## Cost Estimation

### Vercel (Free Tier)
- ✅ Free for hobby projects
- Limitations: 100GB bandwidth, 100GB-hours compute

### Database
- **Railway**: $5/month (starter)
- **Supabase**: Free tier (500MB, 2GB bandwidth)
- **Neon**: Free tier (3GB storage)

### Total Cost: **$0-5/month** for MVP

---

## Security Checklist

- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Environment variables are secrets (not in code)
- [ ] Webhook HMAC verification enabled
- [ ] Strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Database allows only necessary IPs
- [ ] CORS configured (if needed)
- [ ] Rate limiting planned (for production)

---

## Next Steps After Deployment

1. **Test thoroughly** with real Shopify store
2. **Monitor errors** in Vercel dashboard
3. **Set up alerts** for downtime
4. **Document** any custom configuration
5. **Create demo video** showing features
6. **Gather feedback** from test users

---

For more details, see:
- [README.md](./README.md) - Project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [API_DOCS.md](./API_DOCS.md) - API reference
