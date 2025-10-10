import express from 'express';
import { addHoliday, fetchAllHolidays, getHolidayById, updateHoliday, deleteHoliday } from '../controller/HolidaysController.js';

const routerHoliday = express.Router();

// Create an Announcement
routerHoliday.post('/add', addHoliday);

// Get All Announcements
routerHoliday.get('/fetchAll', fetchAllHolidays);

// Get an Announcement by ID
routerHoliday.get('/detail/:id', getHolidayById);

// Update an Announcement
routerHoliday.patch('/update/:id', updateHoliday);

// Delete an Announcement
routerHoliday.delete('/delete/:id', deleteHoliday);

export default routerHoliday;
