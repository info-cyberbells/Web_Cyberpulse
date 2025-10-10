import LeaveRequest from "../model/leaveRequestModel.js";
import Employee from '../model//employeeModel.js'
import mongoose from "mongoose";

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
    default:
      return 0;
  }
}



export const addLeaveRequest = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, leaveType, reason, organizationId } = req.body;

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
      default:
        return res.status(400).json({
          success: false,
          error: "Invalid leave type"
        });
    }

    // Update leaveQuota
    const currentQuota = parseFloat(employee.leaveQuota) || 0;
    employee.leaveQuota = (currentQuota - deduction).toString();
    await employee.save();

    // Create and save the leave request
    const leaveRequest = new LeaveRequest({
      employeeId,
      startDate,
      endDate,
      leaveType,
      reason,
      organizationId,
      status: "pending",
    });

    const savedLeaveRequest = await leaveRequest.save();

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
    const { startDate, endDate, leaveType, reason, status } = req.body;

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


    const oldDeduction = calculateLeaveDeduction(
      leaveRequest.leaveType,
      leaveRequest.startDate,
      leaveRequest.endDate
    );
    employee.leaveQuota = (parseFloat(employee.leaveQuota || 0) + oldDeduction).toString();


    leaveRequest.startDate = startDate;
    leaveRequest.endDate = endDate;
    leaveRequest.leaveType = leaveType;
    leaveRequest.reason = reason;
    leaveRequest.status = status;


    const newDeduction = calculateLeaveDeduction(leaveType, startDate, endDate);
    employee.leaveQuota = (parseFloat(employee.leaveQuota) - newDeduction).toString();

    await leaveRequest.save();
    await employee.save();


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
