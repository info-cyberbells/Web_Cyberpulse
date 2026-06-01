import LeaveRequest from "../model/leaveRequestModel.js";
import Employee from '../model//employeeModel.js'
import WfhCredit from "../model/wfhCreditModel.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
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
    const { employeeId, startDate, endDate, leaveType, reason, halfDayType, startTime, endTime } = req.body;
    const organizationId = req.user?.organizationId;

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

    // Duplicate request check — prevent same leave from being submitted twice
    const duplicate = await LeaveRequest.findOne({
      employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      status: 'pending',
    });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        error: "A pending leave request for the same dates and type already exists"
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

    (async () => {
      try {
        const managers = await Employee.find({
          organizationId: employee.organizationId || organizationId,
          type: { $in: [ 3, 4, 5] },
          status: "1",
          email: { $exists: true, $ne: null },
        }).select("email name");

        await Promise.allSettled(
          managers.map((manager) => sendLeaveRequestEmail(manager.email, employee.name, leaveType, startDate, endDate, reason,  finalStartTime, finalEndTime))
        );
      } catch (err) {
        console.error("Failed to send leave notification emails:", err);
      }
    })();

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


const sendLeaveRequestEmail = async (email, employeeName, leaveType, startDate, endDate, reason, startTime, endTime) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    connectionTimeout: 20000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: false },
  });

  const mailOptions = {
    from: `"CyberPulse" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Leave Request - ${employeeName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Leave Request</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a237e;padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;letter-spacing:0.5px;">CyberPulse</h1>
              <p style="margin:6px 0 0;color:#c5cae9;font-size:13px;">Human Resource Management</p>
            </td>
          </tr>

          <!-- Title Bar -->
          <tr>
            <td style="background-color:#e8eaf6;padding:16px 40px;border-bottom:1px solid #e0e0e0;">
              <p style="margin:0;font-size:13px;color:#5c6bc0;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📋 Leave Request Notification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 8px;font-size:15px;color:#37474f;">Dear HR,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#37474f;line-height:1.6;">
                This is to inform you that <strong style="color:#1a237e;">${employeeName}</strong> has submitted a leave request. Please review the details below and take the necessary action.
              </p>

              <!-- Details Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;margin-bottom:24px;">
                <tr style="background-color:#f5f5f5;">
                  <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#78909c;text-transform:uppercase;letter-spacing:0.8px;width:35%;">Field</td>
                  <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#78909c;text-transform:uppercase;letter-spacing:0.8px;">Details</td>
                </tr>
                <tr style="border-top:1px solid #e0e0e0;">
                  <td style="padding:12px 16px;font-size:14px;color:#546e7a;font-weight:500;">Employee</td>
                  <td style="padding:12px 16px;font-size:14px;color:#263238;font-weight:600;">${employeeName}</td>
                </tr>
                <tr style="background-color:#fafafa;border-top:1px solid #e0e0e0;">
                  <td style="padding:12px 16px;font-size:14px;color:#546e7a;font-weight:500;">Leave Type</td>
                  <td style="padding:12px 16px;font-size:14px;color:#263238;">
                    <span style="background-color:#e8eaf6;color:#3949ab;padding:3px 10px;border-radius:12px;font-size:13px;font-weight:600;text-transform:capitalize;">${leaveType}</span>
                  </td>
                </tr>
                <tr style="border-top:1px solid #e0e0e0;">
                  <td style="padding:12px 16px;font-size:14px;color:#546e7a;font-weight:500;">From Date</td>
                  <td style="padding:12px 16px;font-size:14px;color:#263238;">
                    ${new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    ${(leaveType === 'half-day' || leaveType === 'short-leave') && startTime ? `<span style="color:#546e7a;font-size:13px;margin-left:6px;">${startTime} IST</span>` : ''}
                  </td>
                </tr>
                <tr style="background-color:#fafafa;border-top:1px solid #e0e0e0;">
                  <td style="padding:12px 16px;font-size:14px;color:#546e7a;font-weight:500;">To Date</td>
                  <td style="padding:12px 16px;font-size:14px;color:#263238;">
                    ${new Date(endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    ${(leaveType === 'half-day' || leaveType === 'short-leave') && endTime ? `<span style="color:#546e7a;font-size:13px;margin-left:6px;">${endTime} IST</span>` : ''}
                  </td>
                </tr>
                <tr style="border-top:1px solid #e0e0e0;">
                  <td style="padding:12px 16px;font-size:14px;color:#546e7a;font-weight:500;">Reason</td>
                  <td style="padding:12px 16px;font-size:14px;color:#263238;">${reason}</td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#546e7a;line-height:1.6;">
                Please log in to the <strong>CyberPulse portal</strong> to approve or reject this request at your earliest convenience.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e0e0e0;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#90a4ae;">This is an automated notification from CyberPulse HRM.</p>
              <p style="margin:0;font-size:12px;color:#90a4ae;">© ${new Date().getFullYear()} CyberPulse. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Leave request email sent to:", email, info.response);
    return info;
  } catch (error) {
    console.error("Failed to send leave request email:", error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};



// Get All Leave Requests
export const getAllLeaveRequests = async (req, res) => {
  try {
    const { department } = req.query;
    const organizationId = req.user?.organizationId;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    if (!organizationId) return res.status(403).json({ success: false, error: 'Organization context missing' });

    const query = { organizationId };

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

    const orgId = req.user?.organizationId;

    // Get employee info first
    const employee = await Employee.findById(id).select('name email leaveQuota organizationId');
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      });
    }

    if (orgId && employee.organizationId?.toString() !== orgId.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
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

    const orgId = req.user?.organizationId;
    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ success: false, error: "Leave Request not found" });
    }

    if (orgId && leaveRequest.organizationId?.toString() !== orgId.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
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

    console.log("STATUS VALUE IS:", JSON.stringify(status));

    // Notify employee on approve/reject
    if (status === "Approved" || status === "Rejected") {
      const actionBy = req.user?.id;
      const actionByEmp = actionBy ? await Employee.findById(actionBy).select("name") : null;
      const actionByName = actionByEmp?.name || "Admin";
      const notifType = status === "Approved" ? "leave_approved" : "leave_rejected";
      const notifTitle = status === "Approved" ? "Leave Approved" : "Leave Rejected";

      createNotificationForEmployee(notifType, {
        triggeredBy: actionBy || leaveRequest.employeeId,
        recipientId: leaveRequest.employeeId,
        organizationId: employee.organizationId,
        title: notifTitle,
        message: `Your ${leaveType} leave (${startDate} to ${endDate}) has been ${status} by ${actionByName}`,
        resourceId: leaveRequest._id,
        resourceType: "leaveRequest",
      });

      // Send email to employee on approve/reject
      (async () => {
        try {
        console.log("Sending leave status email to:", employee.email); 
          await sendLeaveStatusEmail(employee.email, employee.name, leaveType, startDate, endDate, status, actionByName, leaveRequest.startTime, leaveRequest.endTime);
          console.log("Email sent successfully"); 
            } catch (err) {
          console.error("Failed to send leave status email:", err.message); 
        }
      })();
          }

          res.status(200).json({ success: true, data: leaveRequest });
        } catch (error) {
          res.status(400).json({ success: false, error: error.message });
        }
      };

// Send Leave Request Response to Employee
const sendLeaveStatusEmail = async (email, employeeName, leaveType, startDate, endDate, status, actionByName,  startTime, endTime) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    connectionTimeout: 20000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: false },
  });

  const isApproved = status === "Approved";
  const statusColor = isApproved ? "#2e7d32" : "#c62828";
  const statusBg = isApproved ? "#e8f5e9" : "#ffebee";
  const statusLabel = isApproved ? "Approved ✓" : "Rejected ✗";

  const mailOptions = {
    from: `"CyberPulse" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Leave Request ${isApproved ? "Approved" : "Rejected"} - CyberPulse`,
      html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">

            <tr>
              <td style="background-color:#1a237e;padding:28px 40px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;letter-spacing:0.5px;">CyberPulse</h1>
                <p style="margin:6px 0 0;color:#c5cae9;font-size:13px;">Human Resource Management</p>
              </td>
            </tr>

            <tr>
              <td style="background-color:${statusBg};padding:16px 40px;border-bottom:1px solid #e0e0e0;text-align:center;">
                <p style="margin:0;font-size:16px;color:${statusColor};font-weight:700;letter-spacing:0.5px;">Leave Request ${statusLabel}</p>
              </td>
            </tr>

            <tr>
              <td style="padding:32px 40px;">
                <p style="margin:0 0 8px;font-size:15px;color:#37474f;">Dear <strong style="color:#1a237e;">${employeeName}</strong>,</p>
                <p style="margin:0 0 24px;font-size:15px;color:#37474f;line-height:1.6;">
                  Your leave request has been <strong style="color:${statusColor};">${status}</strong> by <strong>${actionByName}</strong>. Please find the details below.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;margin-bottom:24px;">
                  <tr style="background-color:#f5f5f5;">
                    <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#78909c;text-transform:uppercase;letter-spacing:0.8px;width:35%;">Field</td>
                    <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#78909c;text-transform:uppercase;letter-spacing:0.8px;">Details</td>
                  </tr>
                  <tr style="border-top:1px solid #e0e0e0;">
                    <td style="padding:12px 16px;font-size:14px;color:#546e7a;font-weight:500;">Leave Type</td>
                    <td style="padding:12px 16px;font-size:14px;color:#263238;">
                      <span style="background-color:#e8eaf6;color:#3949ab;padding:3px 10px;border-radius:12px;font-size:13px;font-weight:600;text-transform:capitalize;">${leaveType}</span>
                    </td>
                  </tr>
                  <tr style="background-color:#fafafa;border-top:1px solid #e0e0e0;">
                    <td style="padding:12px 16px;font-size:14px;color:#546e7a;font-weight:500;">From Date</td>
                    <td style="padding:12px 16px;font-size:14px;color:#263238;">
                      ${new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      ${(leaveType === 'half-day' || leaveType === 'short-leave') && startTime ? `<span style="color:#546e7a;font-size:13px;margin-left:6px;">${startTime} IST</span>` : ''}
                    </td>
                  </tr>
                  <tr style="border-top:1px solid #e0e0e0;">
                    <td style="padding:12px 16px;font-size:14px;color:#546e7a;font-weight:500;">To Date</td>
                    <td style="padding:12px 16px;font-size:14px;color:#263238;">
                      ${new Date(endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      ${(leaveType === 'half-day' || leaveType === 'short-leave') && endTime ? `<span style="color:#546e7a;font-size:13px;margin-left:6px;">${endTime} IST</span>` : ''}
                    </td>
                  </tr>
                  <tr style="background-color:#fafafa;border-top:1px solid #e0e0e0;">
                    <td style="padding:12px 16px;font-size:14px;color:#546e7a;font-weight:500;">Status</td>
                    <td style="padding:12px 16px;font-size:14px;">
                      <span style="background-color:${statusBg};color:${statusColor};padding:3px 10px;border-radius:12px;font-size:13px;font-weight:600;text-transform:capitalize;">${statusLabel}</span>
                    </td>
                  </tr>
                  <tr style="border-top:1px solid #e0e0e0;">
                    <td style="padding:12px 16px;font-size:14px;color:#546e7a;font-weight:500;">Actioned By</td>
                    <td style="padding:12px 16px;font-size:14px;color:#263238;">${actionByName}</td>
                  </tr>
                </table>

                <p style="margin:0;font-size:14px;color:#546e7a;line-height:1.6;">
                  For any queries, please contact your HR or manager via the <strong>CyberPulse portal</strong>.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 40px;">
                <hr style="border:none;border-top:1px solid #e0e0e0;margin:0;" />
              </td>
            </tr>

            <tr>
              <td style="padding:20px 40px;text-align:center;">
                <p style="margin:0 0 4px;font-size:12px;color:#90a4ae;">This is an automated notification from CyberPulse HRM.</p>
                <p style="margin:0;font-size:12px;color:#90a4ae;">© ${new Date().getFullYear()} CyberPulse. All rights reserved.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
      `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Leave status email sent to:", email, info.response);
    return info;
  } catch (error) {
    console.error("Failed to send leave status email:", error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Delete a Leave Request
export const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid ID" });
    }

    const orgId = req.user?.organizationId;
    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ success: false, error: "Leave Request not found" });
    }

    if (orgId && leaveRequest.organizationId?.toString() !== orgId.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
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
