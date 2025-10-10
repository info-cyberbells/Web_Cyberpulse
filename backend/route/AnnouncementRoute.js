import express from 'express';
import { addAnnouncement, fetchAllAnnouncements,getAllEmployeesBasicDetails, getAnnouncementById, updateAnnouncement, deleteAnnouncement } from '../controller/announcementController.js';

const routerAnnouncement = express.Router();

// Create an Announcement
routerAnnouncement.post('/add', addAnnouncement);

// Get All Announcements
routerAnnouncement.get('/fetchAll', fetchAllAnnouncements);


routerAnnouncement.get("/upcomingAnnoucment", getAllEmployeesBasicDetails);



// Get an Announcement by ID
routerAnnouncement.get('/detail/:id', getAnnouncementById);

// Update an Announcement
routerAnnouncement.patch('/update/:id', updateAnnouncement);

// Delete an Announcement
routerAnnouncement.delete('/delete/:id', deleteAnnouncement);

export default routerAnnouncement;
