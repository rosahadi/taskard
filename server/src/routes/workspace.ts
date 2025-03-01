import express from 'express';
import * as authController from '../controllers/authController';
import * as workspaceController from '../controllers/workspaceController';
import * as inviteWorkspaceMemberController from '../controllers/inviteWorkspaceMemberController';
import * as workspaceMembersController from '../controllers/workspaceMembersController';
import {
  createImageUploadMiddleware,
  handleImageUpload,
  uploadErrorHandler,
} from '../utils/imageUpload';

const workspaceRouter = express.Router();

workspaceRouter.use(authController.protect);

workspaceRouter
  .route('/')
  .post(
    createImageUploadMiddleware('image'),
    handleImageUpload,
    uploadErrorHandler,
    workspaceController.createWorkspace
  )
  .get(workspaceController.getAllWorkspaces);

workspaceRouter
  .route('/:id')
  .get(workspaceController.getWorkspace)
  .patch(
    createImageUploadMiddleware('image'),
    handleImageUpload,
    uploadErrorHandler,
    workspaceController.updateWorkspace
  )
  .delete(workspaceController.deleteWorkspace);

workspaceRouter.post(
  '/:id/invites',
  inviteWorkspaceMemberController.inviteWorkspaceMember
);
workspaceRouter.get(
  '/:id/join/:token',
  inviteWorkspaceMemberController.acceptWorkspaceInvitation
);

workspaceRouter.get(
  '/:workspaceId/members',
  workspaceMembersController.getWorkspaceMembers
);
workspaceRouter.patch(
  '/members/:memberId',
  workspaceMembersController.updateMemberRole
);
workspaceRouter.delete(
  '/members/:memberId',
  workspaceMembersController.removeMember
);
workspaceRouter.get(
  '/:workspaceId/members/search',
  workspaceMembersController.searchWorkspaceMembers
);

export default workspaceRouter;
