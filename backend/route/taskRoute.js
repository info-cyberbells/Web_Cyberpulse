import express from 'express';
import { addTask, fetchAllTasks, getTaskById, updateTask, deleteTask, updateTaskStatus, getTaskAnalytics, fetchTasksByProject, pauseAllRunningTasks } from '../controller/TaskController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
console.log('Inside Task route');
const routerTask = express.Router();
routerTask.use(authenticateToken);

// Task Routes
routerTask.post('/add', addTask);
routerTask.get('/fetchByProject', fetchTasksByProject);
routerTask.get('/fetchAll/:employeeId', fetchAllTasks);             
routerTask.get('/detail/:id', getTaskById);        
routerTask.patch('/status/:id', updateTaskStatus);
routerTask.patch('/pauseAll/:employeeId', pauseAllRunningTasks);
routerTask.get('/analytics/:employeeId', getTaskAnalytics);     
routerTask.patch('/update/:id', updateTask);   
routerTask.delete('/delete/:id', deleteTask);  

export default routerTask;
