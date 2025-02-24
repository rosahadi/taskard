import express from 'express';
import * as authController from '../controllers/authController';
import * as projectController from '../controllers/projectController';

const projectRouter = express.Router();

projectRouter.use(authController.protect);

projectRouter.route('/').post(projectController.createProject);

export default projectRouter;
