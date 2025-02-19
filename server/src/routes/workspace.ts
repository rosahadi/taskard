import express from 'express';
import * as authController from '../controllers/authController';
import * as workspaceController from '../controllers/workspaceController';

const workspaceRouter = express.Router();

workspaceRouter.use(authController.protect);

workspaceRouter
  .route('/')
  .post(workspaceController.createWorkspace)
  .get(workspaceController.getAllWorkspaces);

workspaceRouter.get('/:id', workspaceController.getWorkspace);

export default workspaceRouter;
