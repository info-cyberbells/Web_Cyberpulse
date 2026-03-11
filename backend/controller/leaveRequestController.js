import LeaveRequest from "../model/leaveRequestModel.js";
import Employee from '../model//employeeModel.js'
import WfhCredit from "../model/wfhCreditModel.js";
import mongoose from "mongoose";
import { createNotification, createNotificationForEmployee } from "../helpers/createNotification.js";

function calculateLeaveDeduction(type, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  switch (type) {
    case 'casual':
    case 'sick':
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    case 'half-day':
      return 0.5;
    case 'short-leave':
      return 0.25;
    case 'wfh':
    case 'birthday':
      return 0;
    default:
      return 0;
  }
}



export const addLeaveRequest = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, leaveType, reason, organizationId, halfDayType, startTime, endTime } = req.body;

    // Validate required fields
    if (!employeeId || !startDate || !endDate || !leaveType || !reason) {
      return res.status(400).json({
        success: false,
        error: "employeeId, startDate, endDate, leaveType, and reason are required"
      });
    }

    // Check if employeeId is valid
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid employeeId"
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format for startDate or endDate"
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        error: "endDate cannot be before startDate"
      });
    }

    // Fetch employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      });
    }

    // Calculate leave deduction
    let deduction = 0;
    switch (leaveType) {
      case 'casual':
      case 'sick':
        deduction = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        break;
      case 'half-day':
        deduction = 0.5;
        break;
      case 'short-leave':
        deduction = 0.25;
        break;
      case 'wfh': {
        // WFH: Check eligibility from previous month's credits
        const now = new Date();
        // Previous month's evaluation determines this month's eligibility
        let prevMonth = now.getMonth(); // 0-indexed, so getMonth() gives previous month number (1-indexed)
        let prevYear = now.getFullYear();
        if (prevMonth === 0) {
          prevMonth = 12;
          prevYear -= 1;
        }

        const wfhCredit = await WfhCredit.findOne({
          employeeId,
          month: prevMonth,
          year: prevYear,
          isEligible: true,
        });

        if (!wfhCredit) {
          return res.status(400).json({
            success: false,
            error: "You are not eligible for WFH this month. 5/5 credits required from previous month evaluation."
          });
        }

        // Count WFH days already used this month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const wfhUsed = await LeaveRequest.countDocuments({
          employeeId,
          leaveType: "wfh",
          startDate: { $gte: monthStart, $lte: monthEnd },
        });

        const wfhDaysRequested = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        if (wfhUsed + wfhDaysRequested > 2) {
          return res.status(400).json({
            success: false,
            error: `Only 2 WFH days allowed per month. You have used ${wfhUsed}, requesting ${wfhDaysRequested}.`
          });
        }

        deduction = 0; // WFH does NOT deduct from leave quota
        break;
      }
      case 'birthday': {
        // Birthday Leave: 1 per year, no quota deduction
        if (!employee.dob) {
          return res.status(400).json({
            success: false,
            error: "Date of birth is not set on your profile. Please update your DOB first."
          });
        }

        // Check if birthday leave already taken this year
        const currentYear = new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

        const birthdayLeaveTaken = await LeaveRequest.findOne({
          employeeId,
          leaveType: "birthday",
          startDate: { $gte: yearStart, $lte: yearEnd },
        });

        if (birthdayLeaveTaken) {
          return res.status(400).json({
            success: false,
            error: "Birthday leave already used this year. You get 1 birthday leave per year."
          });
        }

        deduction = 0; // Birthday leave does NOT deduct from leave quota
        break;
      }
      default:
        return res.status(400).json({
          success: false,
          error: "Invalid leave type"
        });
    }

    // Update leaveQuota (only for leaves that deduct quota)
    if (leaveType !== 'wfh' && leaveType !== 'birthday') {
      const currentQuota = parseFloat(employee.leaveQuota) || 0;
      employee.leaveQuota = (currentQuota - deduction).toString();
      await employee.save();
    }

    // Create and save the leave request
    // Determine startTime/endTime for half-day and short-leave
    let finalStartTime = null;
    let finalEndTime = null;
    if (leaveType === 'half-day') {
      if (halfDayType === '1st-half') {
        finalStartTime = '09:30 AM';
        finalEndTime = '01:30 PM';
      } else {
        finalStartTime = '01:30 PM';
        finalEndTime = '06:30 PM';
      }
    } else if (leaveType === 'short-leave') {
      finalStartTime = startTime || null;
      finalEndTime = endTime || null;
    }

    const leaveRequest = new LeaveRequest({
      employeeId,
      startDate,
      endDate,
      leaveType,
      reason,
      organizationId,
      halfDayType: leaveType === 'half-day' ? (halfDayType || null) : null,
      startTime: finalStartTime,
      endTime: finalEndTime,
      status: "pending",
    });

    const savedLeaveRequest = await leaveRequest.save();

    // Send leave request notification (fire & forget)
    createNotification("leave_request", {
      triggeredBy: employeeId,
      organizationId: employee.organizationId || organizationId,
      title: "Leave Request",
      message: `${employee.name} requested ${leaveType} leave from ${startDate} to ${endDate}`,
      resourceId: savedLeaveRequest._id,
      resourceType: "leaveRequest",
    });

    res.status(201).json({
      success: true,
      data: savedLeaveRequest
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};




// Get All Leave Requests
export const getAllLeaveRequests = async (req, res) => {
  try {
    const { organizationId, department } = req.query;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const query = {};
    if (organizationId) {
      query.organizationId = organizationId;
    }

    // ✅ Check if department has type: 3 employee before filtering
    let applyDeptFilter = false;
    if (department) {
      const existsType3InDept = await Employee.exists({ department, type: 3 });
      if (existsType3InDept) {
        applyDeptFilter = true;
      }
    }

    let leaveRequests = await LeaveRequest.find(query)
      .populate("employeeId", "name email department image gender type")
      .sort({ createdAt: -1 });

    // ✅ Apply department filter only if condition met
    if (applyDeptFilter) {
      leaveRequests = leaveRequests.filter(
        (leave) =>
          leave.employeeId &&
          leave.employeeId.department === department
      );
    }

    // ✅ Convert image to full URL if needed
    leaveRequests = leaveRequests.map((leave) => {
      if (
        leave.employeeId &&
        leave.employeeId.image &&
        !leave.employeeId.image.startsWith('http')
      ) {
        leave.employeeId.image = `${baseUrl}${leave.employeeId.image}`;
      }
      return leave;
    });

    res.status(200).json({ success: true, data: leaveRequests });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};




// export const getAllLeaveRequests = async (req, res) => {
//   try {
//     const fullUrl = req.protocol + '://' + req.get('host');

//     // Fetch leave requests and populate name, email, and image from employeeId
//     const leaveRequests = await LeaveRequest.find()
//       .populate("employeeId", "name email image");

//     // Enhance the data to replace `image` field with full URL
//     const enrichedLeaveRequests = leaveRequests.map((request) => {
//       const employee = request.employeeId;
//       const fullImageUrl = employee?.image ? `${fullUrl}${employee.image}` : null;

//       return {
//         ...request.toObject(),
//         employeeId: {
//           ...employee?.toObject(),
//           image: fullImageUrl, // Replace `image` with the full URL
//         },
//       };
//     });

//     res.status(200).json({ success: true, data: enrichedLeaveRequests });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };



// Get a Leave Request by ID
// export const getLeaveRequestById = async (req, res) => {
//   try {
//     const { id } = req.params;
// console.log(id)
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, error: "Invalid ID" });
//     }

//     const leaveRequest = await LeaveRequest.findById(id).populate("employeeId", "name email");
// console.log(leaveRequest)
//     if (!leaveRequest) {
//       return res.status(404).json({ success: false, error: "Leave Request not found" });
//     }

//     res.status(200).json({ success: true, data: leaveRequest });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };


export const getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format"
      });
    }

    // Get employee info first
    const employee = await Employee.findById(id).select('name email leaveQuota');
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      });
    }

    // Then get leave requests
    const leaveRequests = await LeaveRequest.find({ employeeId: id }).sort({ createdAt: -1 });

    // If no leave requests, still send employee info
    if (!leaveRequests || leaveRequests.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No leave requests found for this employee",
        employee: employee // ✅ Include employee info even if no requests
      });
    }

    return res.status(200).json({
      success: true,
      data: leaveRequests,
      employee: employee // ✅ Optional: Include employee info along with leave requests
    });

  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};



// Update a Leave Request
export const updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, leaveType, reason, status, halfDayType, startTime, endTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid ID" });
    }

    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ success: false, error: "Leave Request not found" });
    }

    const employee = await Employee.findById(leaveRequest.employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    // Only adjust quota for leaves that deduct quota
    const oldNoDeduct = leaveRequest.leaveType === 'wfh' || leaveRequest.leaveType === 'birthday';
    const newNoDeduct = leaveType === 'wfh' || leaveType === 'birthday';

    if (!oldNoDeduct) {
      const oldDeduction = calculateLeaveDeduction(
        leaveRequest.leaveType,
        leaveRequest.startDate,
        leaveRequest.endDate
      );
      employee.leaveQuota = (parseFloat(employee.leaveQuota || 0) + oldDeduction).toString();
    }

    leaveRequest.startDate = startDate;
    leaveRequest.endDate = endDate;
    leaveRequest.leaveType = leaveType;
    leaveRequest.reason = reason;
    leaveRequest.status = status;
    leaveRequest.halfDayType = leaveType === 'half-day' ? (halfDayType || null) : null;

    // Update startTime/endTime
    if (leaveType === 'half-day') {
      leaveRequest.startTime = halfDayType === '1st-half' ? '09:30 AM' : '01:30 PM';
      leaveRequest.endTime = halfDayType === '1st-half' ? '01:30 PM' : '06:30 PM';
    } else if (leaveType === 'short-leave') {
      leaveRequest.startTime = startTime || null;
      leaveRequest.endTime = endTime || null;
    } else {
      leaveRequest.startTime = null;
      leaveRequest.endTime = null;
    }

    if (!newNoDeduct) {
      const newDeduction = calculateLeaveDeduction(leaveType, startDate, endDate);
      employee.leaveQuota = (parseFloat(employee.leaveQuota) - newDeduction).toString();
    }

    await leaveRequest.save();
    await employee.save();

    // Notify employee on approve/reject
    if (status === "approved" || status === "rejected") {
      const actionBy = req.user?.id;
      const actionByEmp = actionBy ? await Employee.findById(actionBy).select("name") : null;
      const actionByName = actionByEmp?.name || "Admin";
      const notifType = status === "approved" ? "leave_approved" : "leave_rejected";
      const notifTitle = status === "approved" ? "Leave Approved" : "Leave Rejected";

      createNotificationForEmployee(notifType, {
        triggeredBy: actionBy || leaveRequest.employeeId,
        recipientId: leaveRequest.employeeId,
        organizationId: employee.organizationId,
        title: notifTitle,
        message: `Your ${leaveType} leave (${startDate} to ${endDate}) has been ${status} by ${actionByName}`,
        resourceId: leaveRequest._id,
        resourceType: "leaveRequest",
      });
    }

    res.status(200).json({ success: true, data: leaveRequest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};



// Delete a Leave Request
export const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid ID" });
    }

    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ success: false, error: "Leave Request not found" });
    }

    const employee = await Employee.findById(leaveRequest.employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    // Recover quota
    const deduction = calculateLeaveDeduction(
      leaveRequest.leaveType,
      leaveRequest.startDate,
      leaveRequest.endDate
    );
    employee.leaveQuota = (parseFloat(employee.leaveQuota || 0) + deduction).toString();
    await employee.save();

    await leaveRequest.deleteOne();

    res.status(200).json({ success: true, message: "Leave Request deleted and quota recovered" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// Check WFH eligibility for an employee
export const checkWfhEligibility = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ success: false, error: "Invalid employeeId" });
    }

    const now = new Date();
    // Previous month's evaluation determines this month's eligibility
    let prevMonth = now.getMonth(); // 0-indexed current, so this is prev month 1-indexed
    let prevYear = now.getFullYear();
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }

    // Find evaluation for previous month (regardless of eligibility)
    const wfhCredit = await WfhCredit.findOne({
      employeeId,
      month: prevMonth,
      year: prevYear,
    });

    const isEligible = wfhCredit?.isEligible || false;

    // Count WFH days used this month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const wfhUsed = await LeaveRequest.countDocuments({
      employeeId,
      leaveType: "wfh",
      startDate: { $gte: monthStart, $lte: monthEnd },
    });

    res.status(200).json({
      success: true,
      data: {
        isEligible,
        isEvaluated: !!wfhCredit,
        wfhDaysAllowed: 2,
        wfhDaysUsed: wfhUsed,
        wfhDaysRemaining: Math.max(0, 2 - wfhUsed),
        evaluationMonth: prevMonth,
        evaluationYear: prevYear,
        criteria: wfhCredit?.criteria || null,
        totalCredits: wfhCredit?.totalCredits || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Check Birthday Leave eligibility for an employee
export const checkBirthdayLeaveEligibility = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ success: false, error: "Invalid employeeId" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    if (!employee.dob) {
      return res.status(200).json({
        success: true,
        data: {
          eligible: false,
          alreadyTaken: false,
          hasDob: false,
          birthdayThisYear: null,
        },
      });
    }

    const currentYear = new Date().getFullYear();
    const dob = new Date(employee.dob);
    const birthdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate());

    // Check if birthday leave already taken this year
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    const birthdayLeaveTaken = await LeaveRequest.findOne({
      employeeId,
      leaveType: "birthday",
      startDate: { $gte: yearStart, $lte: yearEnd },
    });

    res.status(200).json({
      success: true,
      data: {
        eligible: !birthdayLeaveTaken,
        alreadyTaken: !!birthdayLeaveTaken,
        hasDob: true,
        birthdayThisYear: birthdayThisYear.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
