# Claim Nest - Authentication Integration

A modern, full-stack fintech rewards aggregator with complete authentication system.

## Project Overview

**Frontend**: React + Vite + Tailwind CSS  
**Backend**: Node.js + Express + MongoDB  
**Authentication**: JWT-based with protected routes  
**Database**: MongoDB Atlas  

## Features

### Frontend Features
- ✅ Modern, responsive design with Tailwind CSS
- ✅ React Router for navigation
- ✅ Authentication context for global state management
- ✅ Protected routes with automatic redirects
- ✅ Login and Registration forms with validation
- ✅ User dashboard with profile information
- ✅ JWT token management
- ✅ Responsive navbar with auth status

### Backend Features
- ✅ Express.js REST API
- ✅ MongoDB integration with Mongoose
- ✅ JWT authentication middleware
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ User registration and login endpoints
- ✅ Protected user profile routes
- ✅ Password change and account management
- ✅ Health check endpoint

## Project Structure

```
Claimify/
├── src/                          # Frontend source
│   ├── components/              # React components
│   │   ├── Navbar.jsx          # Navigation with auth status
│   │   ├── Footer.jsx          # Site footer
│   │   ├── PackagesSection.jsx # Pricing packages
│   │   ├── FeaturesSection.jsx # Features display
│   │   └── ProtectedRoute.jsx  # Route protection
│   ├── pages/                  # Page components
│   │   ├── HomePage.jsx        # Landing page
│   │   ├── LoginPage.jsx       # Login form
│   │   ├── RegisterPage.jsx    # Registration form
│   │   └── DashboardPage.jsx   # User dashboard
│   ├── contexts/               # React contexts
│   │   └── AuthContext.jsx     # Authentication state
│   ├── services/               # API services
│   │   └── api.js              # Axios configuration
│   └── assets/                 # Static assets
└── backend/                    # Backend source
    ├── models/                 # Mongoose models
    │   └── User.js             # User schema
    ├── routes/                 # Express routes
    │   ├── auth.js             # Authentication routes
    │   └── user.js             # User management routes
    ├── middleware/             # Custom middleware
    │   └── authMiddleware.js   # JWT verification
    ├── server.js              # Express server
    ├── .env                   # Environment variables
    └── package.json           # Backend dependencies
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables** (already configured):
   ```env
   MONGODB_URI=mongodb+srv://luchezarddimitrov:ylnpYBVa1Skwr8mM@cluster0.etep2gv.mongodb.net/claimhub_auth?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=claim-nest-super-secret-jwt-key-2025-change-this-in-production
   PORT=3001
   NODE_ENV=development
   ```

4. **Start the backend server:**
   ```bash
   npm start
   ```

   The backend will be available at `http://localhost:3001`

### Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5176` (or next available port)

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | `{ name, email, password }` |
| POST | `/login` | User login | `{ email, password }` |

### User Routes (`/api/user`) - Protected

| Method | Endpoint | Description | Headers |
|--------|----------|-------------|---------|
| GET | `/profile` | Get user profile | `Authorization: Bearer <token>` |
| PUT | `/profile` | Update profile | `Authorization: Bearer <token>` |
| PUT | `/change-password` | Change password | `Authorization: Bearer <token>` |
| PUT | `/deactivate` | Deactivate account | `Authorization: Bearer <token>` |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## Authentication Flow

1. **Registration/Login**: User submits credentials
2. **JWT Generation**: Server creates and returns JWT token
3. **Token Storage**: Frontend stores token in localStorage
4. **Protected Requests**: Token sent in Authorization header
5. **Token Validation**: Middleware verifies token on protected routes
6. **Auto-redirect**: Invalid/expired tokens redirect to login

## Security Features

- Password hashing with bcrypt
- JWT token expiration (7 days)
- Input validation and sanitization
- Protected route middleware
- Automatic token cleanup on logout
- CORS configuration
- Environment variable protection

## Testing the Application

### Manual Testing Steps

1. **Open the application**: Navigate to `http://localhost:5176`

2. **Test Registration**:
   - Click "Login" → "Sign up"
   - Fill the registration form
   - Submit and verify redirect to dashboard

3. **Test Login**:
   - Use registered credentials
   - Verify successful authentication and dashboard access

4. **Test Protected Routes**:
   - Try accessing `/dashboard` without login
   - Verify redirect to login page

5. **Test Logout**:
   - Click logout in navbar
   - Verify token removal and redirect

### API Testing with cURL

```bash
# Health check
curl http://localhost:3001/api/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123"}'

# Login user
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Get profile (use token from login response)
curl -X GET http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

### User Model
```javascript
{
  name: String,           // Required, 2-50 characters
  email: String,          // Required, unique, validated
  passwordHash: String,   // Required, bcrypt hashed
  createdAt: Date,       // Auto-generated
  updatedAt: Date,       // Auto-updated
  isActive: Boolean,     // Default: true
  lastLogin: Date        // Updated on login
}
```

## Development Notes

- **Frontend Port**: 5176 (auto-selected by Vite)
- **Backend Port**: 3001
- **Database**: MongoDB Atlas cluster
- **Hot Reload**: Both frontend and backend support hot reloading
- **Error Handling**: Comprehensive error handling on both ends
- **Validation**: Client-side and server-side validation

## Production Considerations

Before deploying to production:

1. **Change JWT Secret**: Use a strong, random secret key
2. **Environment Variables**: Set production MongoDB URI
3. **HTTPS**: Enable SSL/TLS certificates
4. **CORS**: Configure for production domains
5. **Rate Limiting**: Add API rate limiting
6. **Logging**: Implement proper logging system
7. **Error Monitoring**: Add error tracking (e.g., Sentry)

## Troubleshooting

### Common Issues

1. **Backend won't start**:
   - Check if port 3001 is available: `lsof -i :3001`
   - Verify MongoDB connection string
   - Check environment variables

2. **Frontend won't connect to backend**:
   - Verify backend is running on port 3001
   - Check API base URL in `src/services/api.js`
   - Check browser console for CORS errors

3. **Authentication not working**:
   - Check JWT token in localStorage
   - Verify token format and expiration
   - Check Authorization header format

4. **Database connection issues**:
   - Verify MongoDB Atlas credentials
   - Check network access in Atlas dashboard
   - Ensure proper connection string format

## Contributing

1. Create feature branch from `dev`
2. Make changes and test thoroughly
3. Commit with descriptive messages
4. Push to feature branch
5. Create pull request to `dev`

## License

Private project - All rights reserved.

---

**Claim Nest** - Modern fintech rewards aggregator with secure authentication.
