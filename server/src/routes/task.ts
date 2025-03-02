import express from 'express';
import * as authController from '../controllers/authController';
import * as taskController from '../controllers/taskController';
import * as taskCommentController from '../controllers/taskCommentController';

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

taskRouter.get('/search', taskController.searchTasks);

// Task assignments
taskRouter.post('/assign', taskController.assignTask);
taskRouter.post('/unassign', taskController.unassignTask);

// Task comments
taskRouter.post('/comment', taskCommentController.addComment);
taskRouter.get('/:taskId/comments', taskCommentController.getTaskComments);
taskRouter.delete('/comment/:commentId', taskCommentController.deleteComment);

export default taskRouter;
