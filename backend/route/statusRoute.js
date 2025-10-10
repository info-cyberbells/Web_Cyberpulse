import express from 'express';
import { addStatus, fetchAllStatus,  detailStatus, updateStatus, deleteStatus } from '../controller/statusController.js';

const routerStatus = express.Router();

// Status Routes
routerStatus.post('/add', addStatus);         
routerStatus.get('/fetchAll', fetchAllStatus);             
routerStatus.get('/detail/:id', detailStatus);             
routerStatus.patch('/update/:id', updateStatus);   
routerStatus.delete('/delete/:id', deleteStatus);  

export default routerStatus;
