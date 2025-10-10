import express from 'express';
import { addTechnology, fetchAllTechnology,  detailTechnology, updateTechnology, deleteTechnology } from '../controller/technologyController.js';

const routerTechnologies = express.Router();

// Technology Routes
routerTechnologies.post('/add', addTechnology);         
routerTechnologies.get('/fetchAll', fetchAllTechnology);             
routerTechnologies.get('/detail/:id', detailTechnology);             
routerTechnologies.patch('/update/:id', updateTechnology);   
routerTechnologies.delete('/delete/:id', deleteTechnology);  

export default routerTechnologies;
