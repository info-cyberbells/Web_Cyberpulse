import express from 'express';
import { addTask, fetchAllTasks, getTaskById, updateTask, deleteTask, updateTaskStatus, getTaskAnalytics  } from '../controller/TaskController.js';
console.log('Inside Task route');
const routerTask = express.Router();

// Task Routes
routerTask.post('/add', addTask);         
routerTask.get('/fetchAll/:employeeId', fetchAllTasks);             
routerTask.get('/detail/:id', getTaskById);        
routerTask.patch('/status/:id', updateTaskStatus);
routerTask.get('/analytics/:employeeId', getTaskAnalytics);     
routerTask.patch('/update/:id', updateTask);   
routerTask.delete('/delete/:id', deleteTask);  

export default routerTask;
