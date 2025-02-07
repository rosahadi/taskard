import express from 'express';
import * as authController from '../controllers/authController';

const userRouter = express.Router();

userRouter.post('/register', authController.register);
userRouter.post('/login', authController.login);

userRouter.use(authController.protect);

userRouter.post('/logout', authController.logout);

export default userRouter;
