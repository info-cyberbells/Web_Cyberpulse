import express from 'express';
import {
  uploadHandbook,
  getHandbooks,
  deleteHandbook,
} from '../controller/handbookConroller.js';

const handbookRoutes = express.Router();

handbookRoutes.post('/upload', uploadHandbook);
handbookRoutes.get('/getAll', getHandbooks);
handbookRoutes.delete('/delete/:id', deleteHandbook);

export default handbookRoutes;
