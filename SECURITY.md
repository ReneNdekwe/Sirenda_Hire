# Security Guide

This document outlines the security measures and best practices implemented in the Sirenda Hire application.

## Authentication and Authorization

### JWT Implementation

1. Token Generation:
```typescript
import jwt from 'jsonwebtoken';

const generateToken = (userId: string, userType: string) => {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};
```

2. Token Validation Middleware:
```typescript
import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

### Role-Based Access Control

```typescript
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// Usage in routes
router.post('/vehicles', authenticateToken, authorize(['company']), createVehicle);
```

## Data Security

### Password Hashing

```typescript
import bcrypt from 'bcrypt';

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
```

### Data Encryption

1. Sensitive Data Encryption:
```typescript
import crypto from 'crypto';

const encrypt = (text: string) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

const decrypt = (text: string) => {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
```

## API Security

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api/', apiLimiter);
```

### Input Validation

```typescript
import { body, validationResult } from 'express-validator';

const validateVehicle = [
  body('brand').isString().trim().notEmpty(),
  body('model').isString().trim().notEmpty(),
  body('pricePerDay').isFloat({ min: 0 }),
  body('category').isIn(['economy', 'luxury', 'suv']),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

## File Upload Security

```typescript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
```

## Session Security

```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

## CORS Configuration

```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://sirendahire.com']
    : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
```

## Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  }
}));
```

## Database Security

### SQL Injection Prevention

```typescript
// Using Drizzle ORM for safe queries
const getVehicle = async (id: number) => {
  return await db.query.vehicles.findFirst({
    where: eq(vehicles.id, id)
  });
};
```

### Row-Level Security

```sql
-- PostgreSQL RLS policies
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_vehicles_policy ON vehicles
  FOR ALL
  TO company
  USING (company_id = current_user_id());
```

## Logging and Monitoring

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Security event logging
const logSecurityEvent = (event: string, details: any) => {
  logger.warn('Security Event', {
    event,
    details,
    timestamp: new Date(),
    ip: req.ip
  });
};
```

## Regular Security Tasks

1. Dependency Updates:
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Update security patches
npm audit fix
```

2. Security Scanning:
```bash
# Run security scan
npm run security:scan

# Check for outdated packages
npm outdated
```

## Incident Response

1. Security Incident Procedure:
   - Identify the incident
   - Contain the breach
   - Eradicate the threat
   - Recover systems
   - Document the incident
   - Review and improve

2. Contact Information:
   - Security Team: security@sirendahire.com
   - Emergency Contact: +1-XXX-XXX-XXXX

## Security Checklist

1. Authentication:
   - [ ] Strong password requirements
   - [ ] Multi-factor authentication
   - [ ] Session management
   - [ ] Password reset flow

2. Authorization:
   - [ ] Role-based access control
   - [ ] Permission checks
   - [ ] API endpoint protection

3. Data Protection:
   - [ ] Encryption at rest
   - [ ] Encryption in transit
   - [ ] Secure file uploads
   - [ ] Data backup

4. API Security:
   - [ ] Rate limiting
   - [ ] Input validation
   - [ ] CORS configuration
   - [ ] Security headers

5. Monitoring:
   - [ ] Logging
   - [ ] Alerting
   - [ ] Regular audits
   - [ ] Vulnerability scanning

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html) 