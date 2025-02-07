import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import compression from 'compression';
import AppError from './utils/appError';
import userRouter from './routes/auth';
import passport from './config/passport';

dotenv.config();

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

// Initialize passport config
app.use(passport.initialize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

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
app.use('/api/v1/users', userRouter);

// Handle undefined API routes
app.all('/api/*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

export default app;
