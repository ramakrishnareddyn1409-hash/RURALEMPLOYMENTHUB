# Quick Start Guide

## Prerequisites
- Node.js v14+ and npm
- MongoDB Atlas account (free)
- Groq API key (free)
- Git

## 5-Minute Setup

### 1. Clone & Install

```bash
# Backend
cd server
npm install

# Frontend (in another terminal)
cd client
npm install
```

### 2. Configure Environment

**server/.env:**
```env
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/rural-employment-hub
JWT_SECRET=mysecretkey123
GROQ_API_KEY=your_groq_api_key
CORS_ORIGIN=http://localhost:5173
PORT=5000
```

**client/.env:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start Application

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

### 4. Access Application

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **API Docs:** http://localhost:5000/api/health

## Default Test Credentials

**Admin:**
- Email: admin@example.com
- Password: password123

**Employee:**
- Email: employee@example.com
- Password: password123

## Key Features

✅ Employee Registration & Management
✅ Smart Attendance Tracking
✅ Payment Management
✅ Work Assignments
✅ AI Chatbot Support
✅ Notifications System
✅ Admin & Employee Dashboards

## Next Steps

1. Read README.md for detailed documentation
2. Check DEPLOYMENT_GUIDE.md for production setup
3. Explore API documentation in backend routes
4. Customize branding in components

## Troubleshooting

**API connection failed?**
- Check backend is running on port 5000
- Verify MONGO_URI is correct
- Check CORS_ORIGIN in backend .env

**Database connection error?**
- Verify MongoDB Atlas cluster is active
- Check IP whitelist includes your machine
- Test connection string in MongoDB Compass

**Missing dependencies?**
```bash
npm install  # Reinstall all packages
npm audit fix  # Fix vulnerabilities
```

## Need Help?

See README.md for comprehensive documentation or DEPLOYMENT_GUIDE.md for production setup.
