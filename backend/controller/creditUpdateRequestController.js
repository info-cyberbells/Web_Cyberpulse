import CreditUpdateRequest from "../model/creditUpdateRequestModel.js";
import Employee from "../model/employeeModel.js";
import mongoose from "mongoose";
import { createNotification } from "../helpers/createNotification.js";

// Employee sends a credit update request
export const sendCreditUpdateRequest = async (req, res) => {
  try {
    const { message, organizationId, month: reqMonth, year: reqYear, disputedCriteria } = req.body;
    const employeeId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    const now = new Date();
    const month = reqMonth || now.getMonth() + 1;
    const year = reqYear || now.getFullYear();

    // Check if already sent a pending request for this month
    const existing = await CreditUpdateRequest.findOne({
      employeeId,
      month,
      year,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: "You already have a pending credit update request for this month",
      });
    }

    const request = new CreditUpdateRequest({
      employeeId,
      message: message.trim(),
      organizationId,
      month,
      year,
      disputedCriteria: disputedCriteria || [],
    });

    const saved = await request.save();

    // Send notification to TL/HR/Manager (fire & forget)
    const emp = await Employee.findById(employeeId).select("name");
    if (emp) {
      createNotification("wfh_credit_request", {
        triggeredBy: employeeId,
        organizationId,
        title: "WFH Credit Request",
        message: `${emp.name} sent a WFH credit update request`,
        resourceId: saved._id,
        resourceType: "creditUpdateRequest",
      });
    }

    res.status(201).json({
      success: true,
      data: saved,
      message: "Credit update request sent successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all credit update requests (for TL/HR/Manager)
export const getAllCreditUpdateRequests = async (req, res) => {
  try {
    const { organizationId, status } = req.query;

    const query = {};
    if (organizationId) query.organizationId = organizationId;
    if (status) query.status = status;

    const requests = await CreditUpdateRequest.find(query)
      .populate("employeeId", "name email image department")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get my credit update requests (for employee)
export const getMyCreditUpdateRequests = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const requests = await CreditUpdateRequest.find({ employeeId })
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update request status (TL/HR/Manager marks as reviewed/dismissed)
export const updateCreditUpdateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid ID" });
    }

    if (!["reviewed", "dismissed"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Status must be 'reviewed' or 'dismissed'",
      });
    }

    const request = await CreditUpdateRequest.findByIdAndUpdate(
      id,
      { status, reviewedBy: req.user.id },
      { new: true }
    )
      .populate("employeeId", "name email image department")
      .populate("reviewedBy", "name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Credit update request not found",
      });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
