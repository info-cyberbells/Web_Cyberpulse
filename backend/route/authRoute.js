import express from 'express';
import { login } from '../controller/authController.js';


const router = express.Router();

// Authentication Routes
router.post('/login', login);
    
export default router;
