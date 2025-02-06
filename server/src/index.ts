import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import rateLimit from 'express-rate-limit';
import csurf from 'csurf';
import dotenv from 'dotenv';
import compression from 'compression';

dotenv.config();

import AppError from './utils/appError';

const app = express();

// Set up DOMPurify with JSDOM for server-side sanitization
const { window } = new JSDOM('');
const purify = DOMPurify(window);

// Rate limiter to prevent DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later',
});

app.use(limiter);

// Enable CORS with specific options
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Enable compression middleware
app.use(compression());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security HTTP headers
app.use(helmet());

// Body parsing and limiting request size
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// CSRF Protection
app.use(
  csurf({
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Ensures the cookie is only sent over HTTPS in production
      httpOnly: true, // Prevents access to the cookie from JavaScript, adding an extra layer of protection
      sameSite: 'strict', // Restricts the cookie to be sent only for same-site requests (helps prevent CSRF)
    },
  })
);

// Middleware to sanitize user input
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = purify.sanitize(req.body[key]);
      }
    }
  }
  next();
});

// API routes
app.use('/api/v1', (req, res) => {
  res.send('API is running');
});

// Handle undefined API routes
app.all('/api/*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

export default app;
