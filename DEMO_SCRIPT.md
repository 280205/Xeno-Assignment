# Demo Video Script (Max 7 Minutes)

**Target Length:** 6-7 minutes  
**Tone:** Professional but conversational  
**Format:** Screen recording with voiceover

---

## Setup Before Recording

1. Have local development server running (`npm run dev`)
2. Seed database with demo data (`npm run db:seed`)
3. Have Shopify development store open in another tab
4. Clear browser cookies for fresh demo
5. Test all features work smoothly

---

## Script Outline

### [0:00 - 0:30] Introduction (30 seconds)

**On Screen:** Your face or landing page

> "Hi! I'm [Your Name], and this is my submission for the Xeno FDE Internship assignment. I've built a multi-tenant Shopify data ingestion and insights platform that helps enterprise retailers onboard, integrate, and analyze their customer data in real-time.
>
> Let me walk you through the key features and technical decisions I made."

---

### [0:30 - 1:30] Architecture Overview (1 minute)

**On Screen:** Open `ARCHITECTURE.md` or draw diagram on screen

> "The system uses a three-tier architecture. At the top, we have the React frontend built with Next.js 14 and TailwindCSS. The middle tier handles authentication with NextAuth, processes Shopify webhooks, and serves dashboard APIs. At the bottom, we have a PostgreSQL database with Prisma ORM.
>
> For multi-tenancy, I implemented a discriminator column pattern where every data record is isolated by a tenantId. This ensures complete data separation between different Shopify stores while keeping the infrastructure simple and cost-effective."

**Show:** Quickly scroll through `prisma/schema.prisma` highlighting the tenantId fields

---

### [1:30 - 2:30] User Authentication (1 minute)

**On Screen:** Navigate through sign-up and sign-in flow

> "Let me start by creating an account. The authentication system uses NextAuth with email and password credentials, and passwords are hashed with bcrypt for security."

**Actions:**
1. Go to home page → Click "Sign Up"
2. Fill form: `demo@example.com` / `demo123` / `Demo User`
3. Submit → Redirected to Sign In
4. Sign in with same credentials
5. Successfully land on dashboard

> "Once authenticated, users get a secure JWT session cookie that's used to authorize all subsequent requests."

---

### [2:30 - 3:45] Tenant Management (1 minute 15 seconds)

**On Screen:** Add new Shopify store

> "Now I'll add a Shopify store. In a real scenario, this would be a merchant connecting their store to our platform."

**Actions:**
1. Click "Add Store" button
2. Fill in modal:
   - Name: "Demo Electronics Store"
   - Shopify Domain: "demo-store.myshopify.com"
   - (Optional) Access Token
3. Submit → Store appears in dropdown

> "Each store becomes a separate tenant with isolated data. Users can belong to multiple stores with different roles - admin or viewer. The store selector at the top allows switching between tenants seamlessly."

**Show:** Select the newly created store from dropdown

---

### [3:45 - 5:30] Dashboard & Analytics (1 minute 45 seconds)

**On Screen:** Explore dashboard with pre-seeded data

> "This is the main insights dashboard. At the top, we have key metrics cards showing total customers, orders, products, revenue, and average order value."

**Actions:**
1. Point to each metric card
2. Scroll to charts

> "Below that, we have interactive charts powered by Chart.js. The revenue trend line chart shows how sales have performed over time. The bar chart tracks order volume by date."

**Show:** Hover over data points on charts

> "Here's the top 5 customers by total spend - this helps merchants identify their VIP customers. And this doughnut chart breaks down custom events like cart abandonment and checkout starts."

**Actions:**
1. Point to each customer in the list
2. Show event breakdown

> "The date range filter allows merchants to analyze specific time periods. Let me filter to just the last 7 days."

**Actions:**
1. Click "Last 30 Days" button
2. Show updated data
3. Manually adjust date range

---

### [5:30 - 6:30] Webhook Integration (1 minute)

**On Screen:** Switch to Shopify admin or show webhook code

> "Behind the scenes, this data comes from Shopify webhooks. I've implemented four webhook endpoints that automatically sync customers, orders, products, and custom events."

**Show:** Open `app/api/webhooks/orders/route.ts` in VS Code

> "Each webhook handler verifies the HMAC signature to ensure the request actually came from Shopify, finds the correct tenant by shop domain, and upserts the data into our database. For orders, we also automatically update customer statistics like total spend and order count."

**Optional:** Show Shopify webhook configuration screen

> "When a merchant creates or updates an order in Shopify, our webhook receives the event within seconds, and the dashboard updates automatically."

---

### [6:30 - 7:00] Technical Highlights & Closing (30 seconds)

**On Screen:** Show README.md or code structure

> "Key technical decisions I made: 
> - Next.js 14 with App Router for a modern full-stack experience
> - Prisma ORM for type-safe database access with automatic migrations
> - Multi-tenant architecture with proper data isolation
> - Webhook HMAC verification for security
> - Responsive UI with interactive charts
>
> The entire project is deployed on Vercel with a PostgreSQL database, fully documented, and ready for production scaling.
>
> You can find the code, documentation, and deployment instructions in the GitHub repository. Thank you for reviewing my submission, and I'm excited about the opportunity to join the Xeno team!"

**Show:** Quick flash of:
- README.md
- File structure
- Deployed app URL (if deployed)

---

## Tips for Recording

### Technical Setup

1. **Resolution:** 1920x1080 (1080p)
2. **Frame Rate:** 30 fps
3. **Software:** 
   - Windows: OBS Studio, Camtasia
   - Mac: QuickTime, ScreenFlow
4. **Audio:** Use good microphone, quiet room
5. **Browser:** Use Chrome in clean profile (no extensions visible)

### Before Recording

- [ ] Close unnecessary tabs/apps
- [ ] Hide bookmarks bar
- [ ] Disable notifications
- [ ] Full screen browser
- [ ] Test audio levels
- [ ] Do a practice run

### During Recording

- **Speak clearly** and at moderate pace
- **Pause between sections** (easier to edit)
- **Show, don't just tell** - interact with UI
- **If you make a mistake**, just pause and restart that section
- **Keep mouse movements smooth**
- **Don't rush** - 6-7 minutes is plenty

### After Recording

1. **Edit out mistakes** and long pauses
2. **Add smooth transitions** between sections
3. **Check audio levels** are consistent
4. **Export in high quality** (1080p, H.264)
5. **Upload to YouTube** (unlisted link) or Loom
6. **Test the link** before submitting

---

## Alternative Structure (If Time Constrained)

If you're running short on time, use this condensed version:

1. **Introduction** (30s) - Who you are, what you built
2. **Quick Demo** (3m) - Sign in → Add store → Show dashboard → Charts
3. **Architecture** (1m30s) - Multi-tenancy, webhooks, tech stack
4. **Code Walkthrough** (1m30s) - Show key files (schema, webhook handler, dashboard)
5. **Closing** (30s) - Deployment, docs, thank you

---

## Backup Plan

If live demo has issues:

1. Use pre-recorded segments
2. Show screenshots with voiceover
3. Walk through code instead
4. Show architecture diagrams

**Remember:** They want to see your problem-solving and communication skills, not just a perfect demo!

---

## Questions They Might Ask (Prepare Answers)

1. **Why Next.js over separate frontend/backend?**
   - Full-stack in one repo, API routes, great DX, easy deployment

2. **How would you handle 10,000 concurrent webhooks?**
   - Message queue (RabbitMQ), background workers, database connection pooling

3. **What about multi-currency support?**
   - Add currency field to Order, convert on frontend, store raw values

4. **Security concerns with webhooks?**
   - HMAC verification, rate limiting, input validation, HTTPS only

5. **How to migrate to microservices?**
   - Split by domain: auth service, ingestion service, analytics service
   - Use API gateway, event bus for communication

---

Good luck with your recording!
