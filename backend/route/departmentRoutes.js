import express from "express";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../controller/departmentController.js";

const router = express.Router();

router.post("/addDepartment", createDepartment);
router.get("/getAllDepartment", getAllDepartments);
router.get("/:id", getDepartmentById);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

export default router;
