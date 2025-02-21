import express from 'express';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';
import {
  createImageUploadMiddleware,
  handleImageUpload,
  uploadErrorHandler,
} from '../utils/imageUpload';

const userRouter = express.Router();

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.get('/verify-email/:token', authController.verifyEmail);

userRouter.post('/forgot-password', authController.forgotPassword);
userRouter.patch('/reset-password/:token', authController.resetPassword);

// OAuth routes
userRouter.get('/auth/google', authController.googleAuth);
userRouter.get('/auth/google/callback', authController.googleAuthCallback);

userRouter.use(authController.protect);

userRouter.post('/logout', authController.logout);

userRouter.get('/me', userController.getMe);

userRouter.patch('/updateMyPassword', authController.updatePassword);
userRouter.patch(
  '/updateMe',
  createImageUploadMiddleware('image'),
  handleImageUpload,
  uploadErrorHandler,
  userController.updateMe
);
userRouter.delete('/deleteMe', userController.deleteMe);

export default userRouter;
