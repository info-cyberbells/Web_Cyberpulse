import express from 'express';
import { addProject, fetchAllProjects, detailProject, updateProject, deleteProject } from '../controller/projectController.js';
console.log('Inside project route');
const routerProject = express.Router();

// Project Routes
routerProject.post('/add', addProject);         
routerProject.get('/fetchAll', fetchAllProjects);             
routerProject.get('/detail/:id', detailProject);             
routerProject.patch('/update/:id', updateProject);   
routerProject.delete('/delete/:id', deleteProject);  


export default routerProject;
