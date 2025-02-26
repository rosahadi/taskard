import express from 'express';
import * as authController from '../controllers/authController';
import * as taskController from '../controllers/taskController';

const taskRouter = express.Router();

taskRouter.use(authController.protect);

taskRouter
  .route('/')
  .post(taskController.createTask)
  .get(taskController.getAllTasks);

taskRouter
  .route('/:taskId')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

export default taskRouter;
