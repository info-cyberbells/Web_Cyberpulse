import express from "express";
import {
  addEvent,
  fetchAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controller/eventController.js";

const routerEvent = express.Router();

// Create an Event
routerEvent.post("/add", addEvent);

// Fetch All Events
routerEvent.get("/fetchAll", fetchAllEvents);

// Fetch Event by ID
routerEvent.get("/detail/:id", getEventById);

// Update an Event
routerEvent.patch("/update/:id", updateEvent);

// Delete an Event
routerEvent.delete("/delete/:id", deleteEvent);

export default routerEvent;
