import express from "express";
import { addOrUpdateEmployeeRating, getEmployeeRatings } from "../controller/EmployeeRatingController.js";

const router = express.Router();

// Add or update rating
router.post("/employee/:employeeId", addOrUpdateEmployeeRating);

// Get all ratings for an employee
router.get("/getEmployee/:employeeId", getEmployeeRatings);

export default router;
