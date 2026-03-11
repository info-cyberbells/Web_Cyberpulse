import express from "express";
import {
  evaluateCredits,
  getEmployeeCredits,
  getAllCredits,
  getMyCredits,
} from "../controller/wfhCreditController.js";
import {
  sendCreditUpdateRequest,
  getAllCreditUpdateRequests,
  getMyCreditUpdateRequests,
  updateCreditUpdateRequestStatus,
} from "../controller/creditUpdateRequestController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const routerWfhCredit = express.Router();

// Evaluate WFH credits for an employee
routerWfhCredit.post("/evaluate", authenticateToken, evaluateCredits);

// Get all credits (for Manager/HR view)
routerWfhCredit.get("/all", authenticateToken, getAllCredits);

// Get my own credits (for Employee view)
routerWfhCredit.get("/my-credits", authenticateToken, getMyCredits);

// Get credits for a specific employee
routerWfhCredit.get("/employee/:employeeId", authenticateToken, getEmployeeCredits);

// Credit Update Requests
routerWfhCredit.post("/request-update", authenticateToken, sendCreditUpdateRequest);
routerWfhCredit.get("/update-requests", authenticateToken, getAllCreditUpdateRequests);
routerWfhCredit.get("/my-update-requests", authenticateToken, getMyCreditUpdateRequests);
routerWfhCredit.put("/update-request/:id", authenticateToken, updateCreditUpdateRequestStatus);

export default routerWfhCredit;
