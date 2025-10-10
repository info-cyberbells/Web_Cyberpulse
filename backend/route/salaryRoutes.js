import express from 'express';
import {
  submitAdvanceSalaryRequest,
  getUserAdvanceRequestsById,
  getAllAdvanceSalaryRequests,
  updateAdvanceSalaryStatus,
} from '../controller/salaryController.js';

const routeSalary = express.Router();

routeSalary.post('/request', submitAdvanceSalaryRequest);
routeSalary.get('/myRequests/:id', getUserAdvanceRequestsById);
routeSalary.get('/allRequestes', getAllAdvanceSalaryRequests);
routeSalary.put('/updateRequest/:id', updateAdvanceSalaryStatus);

export default routeSalary;