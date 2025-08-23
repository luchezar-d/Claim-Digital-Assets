# Claim Digital Assets Backend

A complete Node.js + Express backend for user authentication using MongoDB Atlas and JWT tokens.

## 🚀 Features

- ✅ User registration with email validation
- ✅ Secure login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Protected routes middleware
- ✅ User profile management
- ✅ Password change functionality
- ✅ Account deactivation
- ✅ Input validation and sanitization
- ✅ Error handling and logging
- ✅ CORS configuration

## 📁 Project Structure

```
backend/
├── models/
│   └── User.js              # Mongoose user schema
├── middleware/
│   └── authMiddleware.js    # JWT verification middleware
├── routes/
│   ├── auth.js             # Authentication routes
│   └── user.js             # User management routes
├── .env                    # Environment variables
├── server.js               # Main server file
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy and update the environment file:

```bash
cp .env.example .env
```

Then update `.env` with your actual values:

```env
MONGODB_URI=your-mongodb-uri-here
DB_NAME=claim-digital-assets_dev
JWT_SECRET=replace_me_with_a_long_random_string
PORT=3001
```

### 3. MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database named `claimhub_auth`
4. Create a collection named `users`
5. Update the connection string in `.env`

### 4. Run the Server

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Verify Token

```http
POST /api/auth/verify-token
Content-Type: application/json

{
  "token": "your-jwt-token"
}
```

### User Routes (`/api/user`) - Protected

#### Get Profile

```http
GET /api/user/profile
Authorization: Bearer your-jwt-token
```

#### Update Profile

```http
PUT /api/user/profile
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

#### Change Password

```http
PUT /api/user/change-password
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

#### Deactivate Account

```http
DELETE /api/user/account
Authorization: Bearer your-jwt-token
```

### Health Check

```http
GET /api/health
```

## 🔒 Security Features

- **Password Hashing**: Uses bcrypt with 12 salt rounds
- **JWT Tokens**: 7-day expiration, secure secret key
- **Input Validation**: Express-validator for all inputs
- **Email Uniqueness**: Prevents duplicate registrations
- **Account Status**: Soft delete with account deactivation
- **CORS Protection**: Configured for frontend domain
- **Error Handling**: Secure error messages in production

## 📊 Database Schema

### User Collection

```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, validated),
  passwordHash: String (required, bcrypt hashed),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-updated),
  isActive: Boolean (default: true),
  lastLogin: Date (nullable)
}
```

## 🧪 Testing the API

### Using curl

**Register:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123"}'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

**Get Profile:**

```bash
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 Deployment

### Environment Variables for Production

```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
PORT=5000
NODE_ENV=production
```

### Recommended Hosting

- **Backend**: Heroku, Railway, Render, or DigitalOcean
- **Database**: MongoDB Atlas (already configured)
- **Environment**: Node.js 18+ recommended

## 📝 Notes

- The database name `claimhub_auth` and collection `users` are configured as requested
- JWT tokens expire after 7 days
- Passwords require: min 6 chars, 1 lowercase, 1 uppercase, 1 number
- Account deactivation is used instead of hard deletion
- All routes return consistent JSON responses with `success` boolean

## 🔧 Development

```bash
# Install dev dependencies
npm install

# Run in development mode
npm run dev

# Check health
curl http://localhost:5000/api/health
```

Server will run on `http://localhost:5000` by default.
