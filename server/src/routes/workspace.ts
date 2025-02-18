import express from 'express';
import * as authController from '../controllers/authController';
import * as workspaceController from '../controllers/workspaceController';

const workspaceRouter = express.Router();

workspaceRouter.use(authController.protect);

workspaceRouter.post('/workspace', workspaceController.createWorkspace);

export default workspaceRouter;
