import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;

// In-memory storage for demo purposes (when MongoDB is not available)
const mockUsers = new Map();
let userIdCounter = 1;

// Mock middleware to handle auth without MongoDB
export const mockAuthMiddleware = (req, res, next) => {
  // Only use mock mode if MongoDB is not connected
  const mongoose = await import('mongoose');
  if (mongoose.connection.readyState === 1) {
    return next(); // MongoDB is connected, use real auth
  }
  
  console.log('🔧 Using mock auth (MongoDB not connected)');
  
  if (req.path === '/register' && req.method === 'POST') {
    return handleMockRegister(req, res);
  } else if (req.path === '/login' && req.method === 'POST') {
    return handleMockLogin(req, res);
  } else if (req.path === '/me' && req.method === 'GET') {
    return handleMockMe(req, res);
  }
  
  next();
};

async function handleMockRegister(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Check if user already exists
    if (mockUsers.has(email.toLowerCase())) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create mock user
    const userId = userIdCounter++;
    const user = {
      id: userId.toString(),
      name,
      email: email.toLowerCase(),
      passwordHash,
      roles: ['user'],
      createdAt: new Date(),
    };

    mockUsers.set(email.toLowerCase(), user);

    // Create JWT token
    const token = jwt.sign(
      {
        sub: user.id,
        roles: user.roles,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully (mock mode)',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
        },
      },
    });
  } catch (error) {
    console.error('Mock register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

async function handleMockLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user
    const user = mockUsers.get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLogin = new Date();

    // Create JWT token
    const token = jwt.sign(
      {
        sub: user.id,
        roles: user.roles,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful (mock mode)',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
        },
      },
    });
  } catch (error) {
    console.error('Mock login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

async function handleMockMe(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user by email
    const user = mockUsers.get(decoded.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    console.error('Mock me error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}
