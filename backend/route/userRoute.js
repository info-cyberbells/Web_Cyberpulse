import express from 'express';

import { addUser, fetchAllUser, detailUser, editUser, deleteUser, fetchUserType} from '../controller/userController.js';
import {  updateProfile, changePassword, uploadProfileImage } from '../controller/userProfileController.js';
import {  updateProfileWeb, changePasswordWeb, uploadProfileImageWeb } from '../controller/userProfileWebController.js';

const routerUser = express.Router();

// Authentication Routes
routerUser.post('/add', addUser);

// User Routes
routerUser.get('/fetchAll', fetchAllUser);          
routerUser.get('/detail/:id', detailUser);    
routerUser.delete('/delete/:id', deleteUser);    
routerUser.patch('/edit/:id', editUser);      

routerUser.get('/:type', fetchUserType);

//profile management
// routerUser.get('/profile/:id', viewProfile);
routerUser.patch('/profile-update/:id', uploadProfileImageWeb, updateProfileWeb);
routerUser.patch('/change-password/:id', changePasswordWeb);
routerUser.patch('/profile/:id', uploadProfileImage, updateProfile);
// routerUser.get('/counts/:type', countUserByType);
routerUser.patch('/change/password/:id/', changePassword);


export default routerUser;
