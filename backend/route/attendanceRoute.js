import express from 'express';
import { addAttendance, fetchAllAttendance, getMonthlyAttendance, calculateMonthlySalaries,  getMonthlySummary,getPreviousDayAutoClockOutEmployees, fetchAllAttendanceByDate, getAttendanceAndTasksByEmployeeAndDate, getAttendanceAndTasksByEmployeeAndMonth, getAttendanceById, updateAttendance, deleteAttendance, getAllEmployeesAttendanceAndTasksByDate } from '../controller/attendanceController.js';
console.log('Inside project route');
const routerAttendance = express.Router();

// Project Routes
routerAttendance.post('/add', addAttendance);   
routerAttendance.get('/monthly-summary', getMonthlySummary);        
routerAttendance.get('/fetchAll', fetchAllAttendance);     
routerAttendance.get('/task', getAttendanceAndTasksByEmployeeAndDate);
routerAttendance.get('/currentEmpAttendance', getAllEmployeesAttendanceAndTasksByDate);

routerAttendance.get("/previousDayAutoClockout", getPreviousDayAutoClockOutEmployees);

routerAttendance.get("/monthlyAttendence", getMonthlyAttendance);

routerAttendance.post('/salaryCalculate', calculateMonthlySalaries);


routerAttendance.get('/:employeeId', fetchAllAttendanceByDate); 
routerAttendance.get('/month/task', getAttendanceAndTasksByEmployeeAndMonth);
routerAttendance.get('/detail/:id', getAttendanceById);             
routerAttendance.patch('/update/:id', updateAttendance);   
routerAttendance.delete('/delete/:id', deleteAttendance);  







export default routerAttendance;
