import express from 'express';
import mongoose from 'mongoose';
import { updateProfile, changePassword, uploadProfileImage, addEmployee, fetchAllEmployee, requestResetPassword, detailEmployee, updateEmployee, forgotPassword, verifyResetCodeAndChangePassword, deleteEmployee, login, sendSalarySlip } from '../controller/employeeProfileController.js';
import { updateProfileWeb, changePasswordWeb, uploadProfileImageWeb } from '../controller/userProfileWebController.js';
import { uploadDocument, getEmployeeDocuments, uploadSalarySlip } from '../controller/documentsController.js';

const routerEmployees = express.Router();

// Employee Routes
routerEmployees.post('/login', login);
routerEmployees.post('/add', addEmployee);
routerEmployees.get('/fetchAll', fetchAllEmployee);
routerEmployees.get('/detail/:id', detailEmployee);
routerEmployees.delete('/delete/:id', deleteEmployee);

// Profile and Password Routes
routerEmployees.patch('/profile-update/:id', uploadProfileImageWeb, updateProfileWeb);
routerEmployees.patch('/change-password/:id', changePasswordWeb);
routerEmployees.patch('/update/:id', uploadProfileImage, updateProfile);
routerEmployees.patch('/change/password/:id', changePassword);

// Password Reset Routes
routerEmployees.post('/requestPassword', requestResetPassword);
routerEmployees.post('/verifyResetCode', verifyResetCodeAndChangePassword);

// Document Routes
routerEmployees.patch('/document/update/:id', uploadDocument);
routerEmployees.get('/getDocuments/:employeeId', getEmployeeDocuments);
routerEmployees.patch('/uploadSalarySlip/:employeeId', uploadSalarySlip);

//Salary Slip Routes
routerEmployees.post('/sendSalarySlip', sendSalarySlip)

export default routerEmployees;