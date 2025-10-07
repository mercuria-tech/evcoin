import { Hono } from 'hono';
import { validator } from 'hono/validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = new Hono();

// Mock users database (in production, use Cloudflare D1 or KV)
const users = [
  {
    id: '1',
    email: 'admin@evcharging.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Admin User',
    role: 'admin'
  }
];

// Login endpoint
router.post('/login', 
  validator('json', (value, c) => {
    if (!value.email || !value.password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    if (!value.email.includes('@')) {
      return c.json({ error: 'Invalid email format' }, 400);
    }
    if (value.password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }
    return value;
  }),
  async (c) => {
    try {
      const { email, password } = await c.req.json();
      
      // Find user
      const user = users.find(u => u.email === email);
      if (!user) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        'your-secret-key',
        { expiresIn: '24h' }
      );

      return c.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
);

// Register endpoint
router.post('/register',
  validator('json', (value, c) => {
    if (!value.email || !value.password || !value.name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }
    if (!value.email.includes('@')) {
      return c.json({ error: 'Invalid email format' }, 400);
    }
    if (value.password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }
    if (value.name.length < 2) {
      return c.json({ error: 'Name must be at least 2 characters' }, 400);
    }
    return value;
  }),
  async (c) => {
    try {
      const { email, password, name } = await c.req.json();
      
      // Check if user already exists
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return c.json({ error: 'User already exists' }, 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = {
        id: (users.length + 1).toString(),
        email,
        password: hashedPassword,
        name,
        role: 'user'
      };

      users.push(newUser);

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email, role: newUser.role },
        'your-secret-key',
        { expiresIn: '24h' }
      );

      return c.json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      }, 201);
    } catch (error) {
      console.error('Register error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
);

// Verify token endpoint
router.get('/verify', async (c) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return c.json({ error: 'No token provided' }, 401);
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key') as any;
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

export { router as authRoutes };
