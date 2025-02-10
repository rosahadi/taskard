import express from 'express';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';

const userRouter = express.Router();

userRouter.post('/register', authController.register);
userRouter.post('/login', authController.login);
userRouter.get('/verify-email/:token', authController.verifyEmail);

userRouter.use(authController.protect);

userRouter.post('/logout', authController.logout);

userRouter.patch('/updateMe', userController.updateMe);
userRouter.delete('/deleteMe', userController.deleteMe);

export default userRouter;
