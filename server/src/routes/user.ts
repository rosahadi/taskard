import express from 'express';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';

const userRouter = express.Router();

userRouter.post('/register', authController.register);
userRouter.post('/login', authController.login);
userRouter.get('/verify-email/:token', authController.verifyEmail);

userRouter.post('/forgot-password', authController.forgotPassword);
userRouter.patch('/reset-password/:token', authController.resetPassword);

// OAuth routes
userRouter.get('/auth/google', authController.googleAuth);
userRouter.get('/auth/google/callback', authController.googleAuthCallback);

userRouter.use(authController.protect);

userRouter.post('/logout', authController.logout);

userRouter.patch('/updateMyPassword', authController.updatePassword);
userRouter.patch('/updateMe', userController.updateMe);
userRouter.delete('/deleteMe', userController.deleteMe);

export default userRouter;
