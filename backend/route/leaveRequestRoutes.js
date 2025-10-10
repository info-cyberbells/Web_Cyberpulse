import express from "express";
import {
    addLeaveRequest,
  getAllLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  deleteLeaveRequest,
} from "../controller/leaveRequestController.js";

const routerLeaveRequest = express.Router();

// Create a Leave Request
routerLeaveRequest.post("/add", addLeaveRequest);

// Get All Leave Requests
routerLeaveRequest.get("/fetchAll", getAllLeaveRequests);

// Get a Leave Request by ID
routerLeaveRequest.get("/detail/:id", getLeaveRequestById);

// Update a Leave Request
routerLeaveRequest.patch("/update/:id", updateLeaveRequest);

// Delete a Leave Request
routerLeaveRequest.delete("/delete/:id", deleteLeaveRequest);

export default routerLeaveRequest;
