# Deployment Guide - Rural Employment Hub

This guide provides step-by-step instructions for deploying the Rural Employment Hub application to production.

## Table of Contents

1. [Database Setup](#database-setup)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Post-Deployment](#post-deployment)
5. [Monitoring & Maintenance](#monitoring--maintenance)

## Database Setup

### MongoDB Atlas Cloud Database

1. **Create Account**
   - Visit [mongodb.com](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Click "Create" button
   - Choose cloud provider (AWS, Azure, GCP)
   - Select region closest to your users
   - Choose M0 Sandbox (Free tier) for testing
   - Wait for cluster creation (3-5 minutes)

3. **Create Database User**
   - Go to Security → Database Access
   - Click "Add New Database User"
   - Create username and password
   - Set privileges to "Built-in Role: Atlas Admin"
   - Click "Add User"

4. **Configure IP Whitelist**
   - Go to Security → Network Access
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add specific IPs of your servers
   - Click "Confirm"

5. **Get Connection String**
   - Click "Connect" button
   - Select "Connect Your Application"
   - Copy connection string
   - Replace username, password with your database user credentials
   - Save for backend configuration

**Example Connection String:**
```
mongodb+srv://username:password@cluster0.mongodb.net/rural-employment-hub?retryWrites=true&w=majority
```

6. **Create Database & Collections** (Optional - Mongoose will create automatically)
   - Database name: `rural-employment-hub`

---

## Backend Deployment

### Deploy to Render.com

1. **Prepare Repository**
   ```bash
   # Ensure all code is committed
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Render Account**
   - Visit [render.com](https://render.com)
   - Sign up with GitHub
   - Authorize GitHub access

3. **Create Web Service**
   - Dashboard → New → Web Service
   - Connect GitHub repository
   - Select `rural-employment-hub` repo
   - Select branch: `main`

4. **Configure Service**
   - **Name:** rural-employment-hub-api
   - **Environment:** Node
   - **Region:** Select closest to your users
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Plan:** Free (or Starter for production)

5. **Add Environment Variables**
   - Click "Environment"
   - Add each variable from server/.env:
   
   ```
   PORT=5000
   NODE_ENV=production
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=generate_strong_random_key_here
   JWT_EXPIRE=7d
   GROQ_API_KEY=your_groq_api_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=app_password
   CORS_ORIGIN=https://yourdomain.com
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX_REQUESTS=100
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)
   - Get the service URL (e.g., `https://rural-employment-hub-api.onrender.com`)

### Deploy to Railway.app (Alternative)

1. **Connect GitHub**
   - Visit [railway.app](https://railway.app)
   - Click "Deploy from GitHub"
   - Authorize and select repository

2. **Configure Environment**
   - Add environment variables (same as above)
   - Set root directory to `server`

3. **Deploy**
   - Railway auto-deploys on git push
   - Get service URL from deployment dashboard

### Deploy to AWS (Advanced)

1. **Create EC2 Instance**
   ```bash
   # Launch Ubuntu 20.04 LTS instance
   # Open ports: 22 (SSH), 5000 (API), 443 (HTTPS)
   ```

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx
   ```

3. **Setup Application**
   ```bash
   git clone <repo>
   cd rural-employment-hub/server
   npm install
   npm run build
   ```

4. **Configure PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "rural-hub-api"
   pm2 save
   pm2 startup
   ```

5. **Setup Nginx Reverse Proxy**
   ```nginx
   # /etc/nginx/sites-available/default
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Frontend Deployment

### Deploy to Vercel

1. **Prepare Build**
   ```bash
   cd client
   npm run build
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select GitHub repository
   - Authorize Vercel access

3. **Configure Project**
   - **Framework:** Vite
   - **Root Directory:** client
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add:
   ```
   VITE_API_BASE_URL=https://your-backend-url/api
   VITE_APP_NAME=Rural Employment Hub
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build and deployment (2-3 minutes)
   - Get domain URL (e.g., `your-app.vercel.app`)

### Deploy to Netlify

1. **Connect Repository**
   - Visit [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select GitHub
   - Choose repository

2. **Build Settings**
   - **Base directory:** client
   - **Build command:** `npm run build`
   - **Publish directory:** dist

3. **Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add environment variables

4. **Deploy**
   - Click "Deploy site"

### Deploy to AWS S3 + CloudFront

1. **Build Application**
   ```bash
   cd client
   npm run build
   ```

2. **Create S3 Bucket**
   - Upload `dist` folder contents to S3
   - Enable "Static website hosting"
   - Update bucket policy for public access

3. **Setup CloudFront**
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Create SSL certificate
   - Configure custom domain

---

## Post-Deployment

### Domain Setup

1. **Add Custom Domain**
   - Register domain (GoDaddy, Namecheap, etc.)
   - Update DNS records to point to deployment service
   - Add SSL certificate

2. **Frontend Domain**
   ```
   Type: A or ALIAS
   Value: Vercel/Netlify provided IP
   ```

3. **Backend Domain**
   ```
   Type: CNAME
   Value: Render/Railway service URL
   ```

### Email Configuration

1. **Gmail App Password**
   - Enable 2-factor authentication
   - Generate app-specific password
   - Update EMAIL_USER and EMAIL_PASS in backend

2. **SendGrid Alternative**
   ```bash
   npm install @sendgrid/mail
   ```

### Groq API Setup

1. **Get API Key**
   - Visit [console.groq.com](https://console.groq.com)
   - Sign up and create API key
   - Add to backend environment variables

2. **Test Integration**
   ```bash
   curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"llama-3.1-8b-instant","messages":[{"role":"user","content":"Hello"}]}'
   ```

### SSL/HTTPS Setup

1. **Automatic (Recommended)**
   - Vercel/Netlify/Render handle SSL automatically
   - HTTPS enabled by default

2. **Manual Setup**
   - Use Let's Encrypt (Free)
   - Upload certificate to server
   - Configure Nginx/Apache

### Monitoring Setup

1. **Backend Monitoring**
   - Use Render/Railway monitoring dashboard
   - Set up error alerts
   - Monitor API response times

2. **Frontend Monitoring**
   - Use Vercel Analytics
   - Track page performance
   - Monitor user errors

3. **Uptime Monitoring**
   - Use UptimeRobot or Pingdom
   - Monitor API endpoints
   - Get alerts on downtime

---

## Monitoring & Maintenance

### Regular Checks

1. **Daily**
   - Check deployment status
   - Monitor error logs
   - Verify email notifications

2. **Weekly**
   - Check database performance
   - Review API analytics
   - Check user feedback

3. **Monthly**
   - Update dependencies
   - Review security logs
   - Performance optimization

### Database Maintenance

1. **Backups**
   - Enable MongoDB automatic backups
   - Test backup restoration
   - Store backups in multiple locations

2. **Indexing**
   - Verify database indexes are created
   - Monitor slow queries
   - Optimize as needed

```javascript
// MongoDB Index Creation
db.users.createIndex({ email: 1 }, { unique: true });
db.attendance.createIndex({ employee: 1, date: -1 });
db.payments.createIndex({ status: 1 });
```

### Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Minify assets
   - Use CDN for static files
   - Optimize images

2. **Backend**
   - Enable request compression
   - Implement caching
   - Optimize database queries
   - Use connection pooling

### Security Maintenance

1. **Regular Updates**
   ```bash
   # Check for vulnerabilities
   npm audit
   
   # Fix vulnerabilities
   npm audit fix
   
   # Update dependencies
   npm update
   ```

2. **Security Practices**
   - Rotate JWT_SECRET periodically
   - Update password policies
   - Monitor suspicious activities
   - Regular security audits

### Backup & Disaster Recovery

1. **Database Backups**
   ```bash
   # Manual backup
   mongodump --uri "mongodb+srv://..." --out ./backup
   
   # Restore from backup
   mongorestore ./backup
   ```

2. **Code Backup**
   - Use GitHub for version control
   - Tag releases
   - Maintain backup branch

3. **Recovery Plan**
   - Document recovery procedures
   - Test disaster recovery
   - Maintain RTO/RPO targets

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
pm2 logs rural-hub-api

# Check port availability
lsof -i :5000

# Restart service
pm2 restart rural-hub-api
```

### API Connection Failed

```bash
# Test connectivity
curl https://your-backend-url/api/health

# Check CORS configuration
# Verify CORS_ORIGIN in environment
```

### Database Connection Failed

```bash
# Test MongoDB connection
mongosh "mongodb+srv://username:password@cluster.mongodb.net/"

# Check network access
# Verify IP whitelist in MongoDB Atlas
```

### Slow Performance

```bash
# Monitor server resources
top
free -h
df -h

# Check database indexes
db.collection.getIndexes()

# Enable caching
# Optimize queries
```

---

## Support & Resources

- **Documentation:** See README.md
- **Issues:** GitHub Issues
- **Support Email:** support@ruralhub.com
- **Status Page:** status.ruralhub.com

---

**Last Updated:** 2024
**Version:** 1.0.0
