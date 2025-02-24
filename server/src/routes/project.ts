import express from 'express';
import * as authController from '../controllers/authController';
import * as projectController from '../controllers/projectController';

const projectRouter = express.Router();

projectRouter.use(authController.protect);

projectRouter.route('/').post(projectController.createProject);

projectRouter
  .route('/workspace/:workspaceId')
  .get(projectController.getAllProjects);

projectRouter
  .route('/:projectId')
  .get(projectController.getProject)
  .patch(projectController.updateProject)
  .delete(projectController.deleteProject);

export default projectRouter;
