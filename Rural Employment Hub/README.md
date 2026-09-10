# Rural Employment Hub

A comprehensive MERN Stack web application for digitizing rural employment management, attendance tracking, payment processing, and AI-powered worker support.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Project Overview

Rural Employment Hub is a web-based platform designed to simplify and digitize rural employment management. It provides:

- **Employee Registration & Management**: Unique employee IDs, profile management, document verification
- **Attendance Tracking**: Face recognition, biometric fingerprint verification, GPS location tracking
- **Payment Management**: Wage calculation, payment tracking, digital disbursement
- **Work Assignments**: Project management, worker allocation, progress tracking
- **AI Chatbot**: 24/7 support with Groq API integration using LLama 3.1 model
- **Notifications**: Multi-channel notifications (SMS, Email, WhatsApp)
- **Analytics & Reports**: Comprehensive dashboards and reporting

## ✨ Features

### Authentication Module
- Employee & Admin registration
- Secure JWT-based authentication
- Role-based access control
- Password management with bcrypt hashing
- Persistent login sessions

### Employee Management
- Employee profile creation and updates
- Unique Employee ID generation (REH-XXXXX-XXXXX format)
- Government ID verification (Aadhaar, Job Card)
- Bank account details management
- Profile photo upload
- Employment status tracking

### Attendance Management
- **Face Recognition**: AI-powered facial verification
- **Biometric Verification**: Fingerprint authentication
- **GPS Location Tracking**: Record work location
- **Daily Reports**: Real-time attendance summaries
- **Monthly Reports**: Historical attendance analytics
- **Verification System**: Admin approval of attendance records

### Payment Management
- Wage calculation based on daily rates and working days
- Bonus and deduction tracking
- Payment status workflow (Pending → Approved → Paid)
- Digital payment processing
- Receipt generation
- Payment history and analytics

### Work Assignment System
- Create and manage rural work projects
- Assign multiple workers to assignments
- Track assignment status and completion
- Wage management per assignment
- Worker acceptance/rejection workflow

### AI Chatbot (Groq Integration)
- LLama 3.1 8B model powered responses
- Employment FAQ support
- Scheme information
- Payment and attendance help
- Leave management guidance
- Conversation history storage
- Search through past conversations

### Notifications
- Multi-channel delivery (Email, SMS, WhatsApp, In-App)
- Notification types: Attendance, Payment, Work Assignment, Emergency, General
- Unread/Read status tracking
- Notification history
- Priority levels

### Admin Dashboard
- Real-time employee statistics
- Attendance analytics
- Payment disbursement tracking
- Assignment management
- System reports and insights
- User management

### Employee Dashboard
- Personal attendance status
- Payment history and pending amounts
- Active work assignments
- Recent notifications
- Profile management
- Attendance calendar

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router DOM** for navigation
- **Axios** for API requests
- **React Hook Form** for form management
- **React Hot Toast** for notifications
- **Recharts** for data visualization
- **Lucide Icons** for UI icons
- **React Helmet Async** for SEO

### Backend
- **Node.js** runtime environment
- **Express.js** web framework
- **MongoDB** database with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Groq API** for AI chatbot
- **Express Validator** for input validation
- **Multer** for file uploads
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Morgan** for HTTP logging

### DevOps & Deployment
- **Vite** for frontend build optimization
- **Vercel/Netlify** for frontend hosting
- **Render/Railway** for backend hosting
- **MongoDB Atlas** for cloud database
- **Groq API** for AI services

## 📁 Project Structure

```
rural-employment-hub/
├── server/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── attendanceController.js
│   │   ├── paymentController.js
│   │   ├── assignmentController.js
│   │   ├── notificationController.js
│   │   ├── chatController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── globalErrorHandler.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Attendance.js
│   │   ├── Payment.js
│   │   ├── Assignment.js
│   │   ├── Notification.js
│   │   └── Chat.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── assignmentRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── chatRoutes.js
│   │   └── dashboardRoutes.js
│   ├── services/
│   │   └── groqService.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── helpers.js
│   ├── validators/
│   │   └── validations.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Loading.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── About.jsx
│   │   │   ├── StaticPages.jsx
│   │   │   ├── Employee/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── index.js
│   │   │   └── Admin/
│   │   │       ├── Dashboard.jsx
│   │   │       └── index.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Atlas)
- Groq API Key (from groq.com)
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/rural-employment-hub.git
cd rural-employment-hub/server
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory**
```bash
cd ../client
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env if needed
```

4. **Start the development server**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## ⚙️ Configuration

### Server Environment Variables (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/rural-employment-hub

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# Groq AI
GROQ_API_KEY=your_groq_api_key_here

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### Client Environment Variables (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Rural Employment Hub
VITE_APP_VERSION=1.0.0
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Production Build

**Frontend:**
```bash
cd client
npm run build
# Output in dist/ folder
```

**Backend:**
```bash
cd server
npm run build
npm start
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### User Endpoints
- `GET /api/users/all` - Get all employees (Admin)
- `GET /api/users/:id` - Get single employee
- `PUT /api/users/profile` - Update profile
- `POST /api/users/bank-details` - Update bank details
- `POST /api/users/aadhaar` - Add Aadhaar details

### Attendance Endpoints
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/daily` - Get daily attendance
- `GET /api/attendance/employee` - Get employee attendance history
- `GET /api/attendance/monthly-report` - Monthly report
- `PUT /api/attendance/verify/:id` - Verify attendance (Admin)

### Payment Endpoints
- `POST /api/payments` - Create payment (Admin)
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get single payment
- `PUT /api/payments/:id` - Update payment status
- `GET /api/payments/:id/receipt` - Generate receipt

### Assignment Endpoints
- `POST /api/assignments` - Create assignment (Admin)
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/employee/my-assignments` - Get employee assignments
- `POST /api/assignments/:id/assign-employees` - Assign workers

### Chat Endpoints
- `POST /api/chat/message` - Send chat message
- `GET /api/chat/conversation/:conversationID` - Get conversation
- `GET /api/chat/conversations/list` - List all conversations
- `DELETE /api/chat/conversation/:conversationID` - Delete conversation

### Dashboard Endpoints
- `GET /api/dashboard/admin/stats` - Admin dashboard stats
- `GET /api/dashboard/employee/stats` - Employee dashboard stats

## 📊 Database Models

### User Schema
- Basic info: firstName, lastName, email, phone, password
- Employment details: employeeID, role, employmentStatus
- Location: village, district, mandal, panchayat
- Documents: aadhaar, jobCardNumber
- Banking: bankName, accountNumber, ifscCode
- Media: profilePhoto, faceRecognitionData

### Attendance Schema
- employee: ObjectId reference
- date, checkInTime, checkOutTime
- status: present/absent/half-day/leave
- verificationMethod: face-recognition/fingerprint/manual
- location with GPS coordinates
- workingHours, remarks

### Payment Schema
- employee: ObjectId reference
- paymentPeriod, dailyWage, workingDays
- baseSalary, bonus, deductions
- totalAmount, status
- paymentMethod, paidDate, transactionID
- receiptNumber

### Assignment Schema
- title, description, workCategory
- location (village, district, GPS)
- startDate, endDate, estimatedDuration
- dailyWage, estimatedWorkers
- assignedEmployees array with status
- budget tracking

### Chat Schema
- user: ObjectId reference
- conversationID, conversationTitle
- message, messageType
- role: user/assistant
- aiModel, tokens usage
- timestamps and metadata

### Notification Schema
- recipient: ObjectId reference
- type: attendance/payment/assignment/emergency/general
- channels: email, sms, whatsapp, inApp
- status: read/delivered
- priority: low/medium/high/urgent

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Connect GitHub to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

```bash
vercel --prod
```

### Backend Deployment (Render)

1. Connect GitHub repository
2. Create new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

### Database (MongoDB Atlas)

1. Create account at mongodb.com
2. Create cluster and database
3. Add IP whitelist
4. Get connection string
5. Update MONGO_URI in backend .env

## 🔐 Security Features

- ✅ JWT authentication
- ✅ Password hashing with bcryptjs
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation
- ✅ Rate limiting
- ✅ MongoDB injection prevention
- ✅ Environment variable protection

## 📈 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Video identity verification
- [ ] Real-time attendance via mobile
- [ ] Advanced analytics and ML predictions
- [ ] Blockchain payment verification
- [ ] Multi-language support
- [ ] SMS gateway integration
- [ ] WhatsApp Business API integration
- [ ] Government scheme integration
- [ ] Performance optimization

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@ruralemploymenthub.com or create an issue in the repository.

---

**Built with ❤️ for Rural Employment**
#   R u r a l - E m p l o y m e n t - H u b  
 #   R u r a l - E m p l o y m e n t - H u b  
 #   R u r a l - E m p l o y m e n t - H u b  
 #   R u r a l - E m p l o y m e n t - H u b  
 #   R u r a l - E m p l o y m e n t - H u b  
 #   R u r a l - E m p l o y m e n t - H u b  
 