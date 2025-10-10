import express from "express";
import {
    addHelpDesk,
    fetchAllComplaintsAndHelpDesk,
    updateTicketStatus
} from "../controller/helpDeskController.js";

const routerHelpDesk = express.Router();


routerHelpDesk.post('/add', addHelpDesk);

// Fetch All Events
routerHelpDesk.get('/fetchAll', fetchAllComplaintsAndHelpDesk);

routerHelpDesk.patch('/updateStatus/:ticketId', updateTicketStatus);


export default routerHelpDesk;
