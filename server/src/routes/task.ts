import express from 'express';
import * as authController from '../controllers/authController';
import * as taskController from '../controllers/taskController';

const taskRouter = express.Router();

taskRouter.use(authController.protect);

// Task CRUD operations
taskRouter
  .route('/')
  .post(taskController.createTask)
  .get(taskController.getAllTasks);
taskRouter
  .route('/:taskId')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

// Task assignments
taskRouter.post('/assign', taskController.assignTask);
taskRouter.post('/unassign', taskController.unassignTask);

export default taskRouter;
