import cron from 'node-cron';
console.log('✅ CRON Job Loaded Successfully!');
import Attendance from '../model/AttendanceModel.js';
import Employee from '../model/employeeModel.js';
import Task from '../model/TaskModel.js';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import LeaveRequest from '../model/leaveRequestModel.js';
import Holiday from "../model/holidayModel.js";

// Helper function to handle base64 images
const handleBase64Image = async (base64Image, folder, employeeId) => {
  try {
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return { error: true, message: 'Invalid base64 image format' };
    }

    const ext = matches[1];
    const data = matches[2];
    const imageBuffer = Buffer.from(data, 'base64');

    const directoryPath = path.join('uploads', folder, employeeId);

    if (!folder || !employeeId) {
      return { error: true, message: 'Invalid folder or employeeId' };
    }

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    const imageName = `${Date.now()}.${ext}`;
    const imagePath = path.join(directoryPath, imageName);
    fs.writeFileSync(imagePath, imageBuffer);

    // Return just the relative path
    return { error: false, imagePath: imagePath.replace(/\\/g, '/') };
  } catch (err) {
    return { error: true, message: 'Error saving image' };
  }
};


export const fetchClockDataMonthly = async (req, res) => {
  try {

    const { month } = req.body; // month passed in body

    if (!month) {
      return res.status(400).json({ error: "Month is required" });
    }

    const [year, mon] = month.split("-").map(Number);
    if (!year || !mon || mon < 1 || mon > 12) {
      return res.status(400).json({ error: "Invalid month format. Use YYYY-MM" });
    }

    let filter = {};

    // Filter by month
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1); // first day of next month
    filter.date = { $gte: start, $lt: end };

    const attendanceRecords = await Attendance.find(filter)
      .populate("employeeId", "name email organizationId" ) 

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    const filtered = attendanceRecords.map((record) => ({
      employeeId: record.employeeId,
      date: record.date,
      clockInTime: record.clockInTime,
      autoClockOut: record.autoClockOut,
      clockOutTime: record.clockOutTime
    }));

    res.status(200).json({ attendance: filtered });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: error.message });
  }
};

export const addAttendance = async (req, res) => {
  try {
    const {
      employeeId,
      date,
      clockInTime,
      platform,
      clockOutTime,
      clockInSelfie,
      clockOutSelfie,
      organizationId,
    } = req.body;

    const existingAttendance = await Attendance.findOne({
      employeeId: employeeId,
      date: new Date(date)
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: 'Attendance already exists for this date',
        attendance: existingAttendance
      });
    }

    const fullUrl = req.protocol + '://' + req.get('host');
    let clockInImagePath = null;
    let clockOutImagePath = null;

    if (clockInSelfie) {
      const clockInResult = await handleBase64Image(clockInSelfie, 'clockIn', employeeId);
      if (clockInResult.error) {
        return res.status(400).json({ message: clockInResult.message });
      }
      clockInImagePath = `${fullUrl}/${clockInResult.imagePath}`;
    }

    if (clockOutSelfie) {
      const clockOutResult = await handleBase64Image(clockOutSelfie, 'clockOut', employeeId);
      if (clockOutResult.error) {
        return res.status(400).json({ message: clockOutResult.message });
      }
      clockOutImagePath = `${fullUrl}/${clockOutResult.imagePath}`;
    }

    const newAttendance = new Attendance({
      employeeId,
      date,
      clockInTime,
      platform,
      clockOutTime,
      clockInSelfie: clockInImagePath,
      clockOutSelfie: clockOutImagePath,
      ...(organizationId && { organizationId }),
    });

    await newAttendance.save();

    res.status(201).json({
      message: 'Attendance created successfully',
      attendance: newAttendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAttendanceAndTasksByEmployeeAndDate = async (req, res) => {
  try {
    const { employeeId, date } = req.query; // Expecting employeeId and date as query parameters
    // Validate inputs
    // if (!employeeId || !date) {
    //     return res.status(400).json({ message: 'Employee ID and date are required' });
    // }
    // Find attendance for the specified employee and date
    const attendance = await Attendance.findOne({ employeeId, date }).populate('employeeId', 'name');
    // Fetch tasks for the specified employee and date
    const tasks = await Task.find({
      employeeId,
      createdAt: {
        $gte: new Date(new Date(date).setHours(0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59))
      }
    }).select('title description status createdAt updatedAt');
    if (!attendance && tasks.length === 0) {
      return res.status(404).json({ message: 'No attendance or tasks found for the specified employee and date' });
    }
    // Format the response
    const response = {
      employeeId,
      employeeName: attendance?.employeeId?.name || null,
      date,
      attendance: attendance ? {
        clockInTime: attendance.clockInTime,
        clockOutTime: attendance.clockOutTime,
        clockInSelfie: attendance.clockInSelfie,
        clockOutSelfie: attendance.clockOutSelfie,
      } : null,
      tasks: tasks.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }))
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// export const getAllEmployeesAttendanceAndTasksByDate = async (req, res) => {
//   try {
//     const { date } = req.query;
//     if (!date) {
//       return res.status(400).json({ message: "Date is required" });
//     }

//     // Define date range for the current day
//     const startOfDay = new Date(new Date(date).setHours(0, 0, 0));
//     const endOfDay = new Date(new Date(date).setHours(23, 59, 59));

//     const allEmployees = await Employee.find({
//       status: { $ne: "0" },
//       type: { $ne: 1 },
//     }).select("name email position image gender department");


//     // Check leave requests for the given date
//     const leaveRequests = await LeaveRequest.find({
//       startDate: { $lte: endOfDay },
//       endDate: { $gte: startOfDay },
//       status: { $in: ["Approved", "Pending", "Rejected"] },
//     });

//     // Create a map of leave requests for easy lookup
//     const leaveRequestMap = new Map(
//       leaveRequests.map((leave) => [leave.employeeId.toString(), leave])
//     );

//     // Get today's attendance records
//     const todayAttendance = await Attendance.find({
//       date,
//     }).populate("employeeId", "name email position ");

//     // Get the last attendance record for each employee (for last clock in/out)
//     const lastAttendanceRecords = await Attendance.aggregate([
//       {
//         $sort: { date: -1, clockInTime: -1 },
//       },
//       {
//         $group: {
//           _id: "$employeeId",
//           lastClockIn: { $first: "$clockInTime" },
//           lastClockOut: { $first: "$clockOutTime" },
//           lastClockInSelfie: { $first: "$clockInSelfie" },
//           lastClockOutSelfie: { $first: "$clockOutSelfie" },
//           lastClockInPlatform: { $first: "$platform" },
//           autoClockOut: { $first: "$autoClockOut" },
//         },
//       },
//     ]);

//     // Fetch tasks for the current date
//     const tasks = await Task.find({
//       createdAt: {
//         $gte: startOfDay,
//         $lt: endOfDay,
//       },
//     }).select("employeeId title description status createdAt updatedAt");

//     // Create a map of last attendance records for easier lookup
//     const lastAttendanceMap = new Map(
//       lastAttendanceRecords.map((record) => [record._id.toString(), record])
//     );

//     // Create a map of today's attendance for easier lookup
//     const todayAttendanceMap = new Map(
//       todayAttendance.map((record) => [record.employeeId._id.toString(), record])
//     );

//     // Group tasks by employee
//     const tasksByEmployee = tasks.reduce((acc, task) => {
//       const employeeId = task.employeeId.toString();
//       if (!acc[employeeId]) {
//         acc[employeeId] = [];
//       }
//       acc[employeeId].push({
//         id: task._id,
//         title: task.title,
//         description: task.description,
//         status: task.status,
//         createdAt: task.createdAt,
//         updatedAt: task.updatedAt,
//       });
//       return acc;
//     }, {});

//     // Combine all data
//     const groupedData = allEmployees.map((employee) => {
//       const employeeId = employee._id.toString();
//       const lastAttendance = lastAttendanceMap.get(employeeId) || null;
//       const todayAttendance = todayAttendanceMap.get(employeeId);
//       const leaveRequest = leaveRequestMap.get(employeeId);

//       return {
//         employeeId: employee._id,
//         employeeName: employee.name,
//         email: employee.email,
//         position: employee.position,
//         department: employee.department,
//         gender: employee.gender,
//         image: employee.image || null,
//         date,
//         attendance: {
//           todayClockIn: todayAttendance?.clockInTime || null,
//           todayClockOut: todayAttendance?.clockOutTime || null,
//           todayClockInPlatform: todayAttendance
//             ? todayAttendance.platform || null
//             : lastAttendance?.lastClockInPlatform || null,
//           todayClockInSelfie: todayAttendance?.clockInSelfie || null,
//           todayClockOutSelfie: todayAttendance?.clockOutSelfie || null,

//           lastClockIn: lastAttendance?.lastClockIn || null,
//           lastClockOut: lastAttendance?.lastClockOut || null,
//           lastClockInSelfie: lastAttendance?.lastClockInSelfie || null,
//           lastClockInPlatform: lastAttendance?.lastClockInPlatform || null,
//           lastClockOutSelfie: lastAttendance?.lastClockOutSelfie || null,
//           autoClockOut: lastAttendance?.autoClockOut || null,
//         },
//         leaveRequest: leaveRequest
//           ? {
//             leaveType: leaveRequest.leaveType,
//             status: leaveRequest.status,
//           }
//           : null,
//         tasks: tasksByEmployee[employeeId] || [],
//       };
//     });

//     res.status(200).json(groupedData);
//   } catch (error) {
//     console.error("Error in getAllEmployeesAttendanceAndTasksByDate:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getAllEmployeesAttendanceAndTasksByDate = async (req, res) => {
//   try {
//     const { date } = req.query;
//     if (!date) {
//       return res.status(400).json({ message: "Date is required" });
//     }


//     const protocol = req.protocol;
//     const host = req.get('host');
//     const baseUrl = `${protocol}://${host}`;


//     const startOfDay = new Date(new Date(date).setHours(0, 0, 0));
//     const endOfDay = new Date(new Date(date).setHours(23, 59, 59));

//     const allEmployees = await Employee.find({
//       status: { $ne: "0" },
//       type: { $ne: 1 },
//     }).select("name email position image gender department");


//     const leaveRequests = await LeaveRequest.find({
//       startDate: { $lte: endOfDay },
//       endDate: { $gte: startOfDay },
//       status: { $in: ["Approved", "Pending", "Rejected"] },
//     });


//     const leaveRequestMap = new Map(
//       leaveRequests.map((leave) => [leave.employeeId.toString(), leave])
//     );


//     const todayAttendance = await Attendance.find({
//       date,
//     }).populate("employeeId", "name email position");


//     const lastAttendanceRecords = await Attendance.aggregate([
//       {
//         $sort: { date: -1, clockInTime: -1 },
//       },
//       {
//         $group: {
//           _id: "$employeeId",
//           lastClockIn: { $first: "$clockInTime" },
//           lastClockOut: { $first: "$clockOutTime" },
//           lastClockInSelfie: { $first: "$clockInSelfie" },
//           lastClockOutSelfie: { $first: "$clockOutSelfie" },
//           lastClockInPlatform: { $first: "$platform" },
//           autoClockOut: { $first: "$autoClockOut" },
//           Employeestatus: { $first: "$Employeestatus" },
//         },
//       },
//     ]);


//     const tasks = await Task.find({
//       createdAt: {
//         $gte: startOfDay,
//         $lt: endOfDay,
//       },
//     }).select("employeeId title description status createdAt updatedAt");


//     const lastAttendanceMap = new Map(
//       lastAttendanceRecords.map((record) => [record._id.toString(), record])
//     );


//     const todayAttendanceMap = new Map(
//       todayAttendance.map((record) => [record.employeeId._id.toString(), record])
//     );


//     const tasksByEmployee = tasks.reduce((acc, task) => {
//       const employeeId = task.employeeId.toString();
//       if (!acc[employeeId]) {
//         acc[employeeId] = [];
//       }
//       acc[employeeId].push({
//         id: task._id,
//         title: task.title,
//         description: task.description,
//         status: task.status,
//         createdAt: task.createdAt,
//         updatedAt: task.updatedAt,
//       });
//       return acc;
//     }, {});


//     const groupedData = allEmployees.map((employee) => {
//       const employeeId = employee._id.toString();
//       const lastAttendance = lastAttendanceMap.get(employeeId) || null;
//       const todayAttendance = todayAttendanceMap.get(employeeId);
//       const leaveRequest = leaveRequestMap.get(employeeId);


//       const processImageUrl = (imagePath) => {
//         if (!imagePath) return null;
//         if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
//           return imagePath;
//         }
//         return `${baseUrl}${imagePath}`;
//       };

//       return {
//         employeeId: employee._id,
//         employeeName: employee.name,
//         email: employee.email,
//         position: employee.position,
//         department: employee.department,
//         gender: employee.gender,
//         image: processImageUrl(employee.image),
//         date,
//         attendance: {
//           todayClockIn: todayAttendance?.clockInTime || null,
//           todayClockOut: todayAttendance?.clockOutTime || null,
//           todayClockInPlatform: todayAttendance
//             ? todayAttendance.platform || null
//             : lastAttendance?.lastClockInPlatform || null,
//           todayClockInSelfie: processImageUrl(todayAttendance?.clockInSelfie),
//           todayClockOutSelfie: processImageUrl(todayAttendance?.clockOutSelfie),
//           lastClockIn: lastAttendance?.lastClockIn || null,
//           lastClockOut: lastAttendance?.lastClockOut || null,
//           lastClockInSelfie: processImageUrl(lastAttendance?.lastClockInSelfie),
//           lastClockInPlatform: lastAttendance?.lastClockInPlatform || null,
//           lastClockOutSelfie: processImageUrl(lastAttendance?.lastClockOutSelfie),
//           autoClockOut: lastAttendance?.autoClockOut || null,
//           EmployeeStatus: lastAttendance?.Employeestatus || null,
//           breakTimings: todayAttendance?.breakTimings || [],
//         },
//         leaveRequest: leaveRequest
//           ? {
//             leaveType: leaveRequest.leaveType,
//             status: leaveRequest.status,
//           }
//           : null,
//         tasks: tasksByEmployee[employeeId] || [],
//       };
//     });

//     res.status(200).json(groupedData);
//   } catch (error) {
//     console.error("Error in getAllEmployeesAttendanceAndTasksByDate:", error);
//     res.status(500).json({ error: error.message });
//   }
// };


export const getAllEmployeesAttendanceAndTasksByDate = async (req, res) => {
  try {
    const { date, organizationId, department } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }


    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ message: "Invalid date provided" });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));


    const employeeFilter = {
      status: { $ne: "0" },
      type: { $ne: 1 },
    };

    if (organizationId) {
      employeeFilter.organizationId = organizationId;
    }
    if (department) {
      const existsType3 = await Employee.exists({ department, type: 3 });
      if (existsType3) {
        employeeFilter.department = department;
      }
    }


    const allEmployees = await Employee.find(employeeFilter).select(
      "name email position image gender department"
    );


    // Fetch leave requests
    const leaveRequests = await LeaveRequest.find({
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
      status: { $in: ["Approved", "Pending", "Rejected"] },
    });

    const leaveRequestMap = new Map(
      leaveRequests.map((leave) => [leave.employeeId?.toString() || '', leave])
    );

    const attendanceFilter = { date };

    if (organizationId) {
      const employeeIds = allEmployees.map(emp => emp._id);
      attendanceFilter.employeeId = { $in: employeeIds };
    }

    const todayAttendance = await Attendance.find(attendanceFilter).populate({
      path: "employeeId",
      select: "name email position",
    });


    // Fetch last attendance records
    const lastAttendanceRecords = await Attendance.aggregate([
      {
        $sort: { date: -1, clockInTime: -1 },
      },
      {
        $group: {
          _id: "$employeeId",
          lastClockIn: { $first: "$clockInTime" },
          lastClockOut: { $first: "$clockOutTime" },
          lastClockInSelfie: { $first: "$clockInSelfie" },
          lastClockOutSelfie: { $first: "$clockOutSelfie" },
          lastClockInPlatform: { $first: "$platform" },
          autoClockOut: { $first: "$autoClockOut" },
          Employeestatus: { $first: "$Employeestatus" },
        },
      },
    ]);

    const taskFilter = {
      $or: [
        { createdAt: { $gte: startOfDay, $lt: endOfDay } },
        { createdAt: { $lt: startOfDay }, status: "In Progress" },
      ],
    };

    if (organizationId) {
      taskFilter.organizationId = organizationId;
    }

    const tasks = await Task.find(taskFilter).select(
      "employeeId title description status projectName estimatedMinutes estimatedHours createdAt updatedAt"
    );


    const lastAttendanceMap = new Map(
      lastAttendanceRecords.map((record) => [record._id?.toString() || '', record])
    );

    const todayAttendanceMap = new Map(
      todayAttendance.map((record) => [record.employeeId?._id?.toString() || '', record])
    );

    // Group tasks by employee
    const tasksByEmployee = tasks.reduce(
      (acc, task) => {
        const employeeId = task.employeeId?.toString();
        if (!employeeId) return acc; // Skip tasks with invalid employeeId

        const taskDate = new Date(task.createdAt);
        const isToday = taskDate >= startOfDay && taskDate < endOfDay;

        if (!acc[employeeId]) {
          acc[employeeId] = { todayTasks: [], previousTasks: [] };
        }

        const taskData = {
          id: task._id,
          title: task.title || '',
          description: task.description || '',
          status: task.status || '',
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          taskDate: task.createdAt,
          projectName: task.projectName,
          estimatedHours: task.estimatedHours,
          estimatedMinutes: task.estimatedMinutes,
        };

        if (isToday) {
          acc[employeeId].todayTasks.push(taskData);
        } else if (task.status === "In Progress") {
          acc[employeeId].previousTasks.push(taskData);
        }

        return acc;
      },
      {}
    );


    const groupedData = allEmployees.map((employee) => {
      const employeeId = employee._id?.toString() || '';
      const lastAttendance = lastAttendanceMap.get(employeeId) || null;
      const todayAttendance = todayAttendanceMap.get(employeeId) || null;
      const leaveRequest = leaveRequestMap.get(employeeId) || null;

      const processImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
          return imagePath;
        }
        return `${baseUrl}${imagePath}`;
      };

      return {
        employeeId: employee._id,
        employeeName: employee.name || '',
        email: employee.email || '',
        position: employee.position || '',
        department: employee.department || '',
        gender: employee.gender || '',
        image: processImageUrl(employee.image),
        date,
        attendance: {
          todayClockIn: todayAttendance?.clockInTime || null,
          todayClockOut: todayAttendance?.clockOutTime || null,
          todayClockInPlatform: todayAttendance?.platform || lastAttendance?.lastClockInPlatform || null,
          todayClockInSelfie: processImageUrl(todayAttendance?.clockInSelfie),
          todayClockOutSelfie: processImageUrl(todayAttendance?.clockOutSelfie),
          lastClockIn: lastAttendance?.lastClockIn || null,
          lastClockOut: lastAttendance?.lastClockOut || null,
          lastClockInSelfie: processImageUrl(lastAttendance?.lastClockInSelfie),
          lastClockInPlatform: lastAttendance?.lastClockInPlatform || null,
          lastClockOutSelfie: processImageUrl(lastAttendance?.lastClockOutSelfie),
          autoClockOut: lastAttendance?.autoClockOut || null,
          EmployeeStatus: lastAttendance?.Employeestatus || null,
          breakTimings: todayAttendance?.breakTimings || [],
        },
        leaveRequest: leaveRequest
          ? {
            leaveType: leaveRequest.leaveType || '',
            status: leaveRequest.status || '',
          }
          : null,
        tasks: tasksByEmployee[employeeId]?.todayTasks || [],
        previousTasks: tasksByEmployee[employeeId]?.previousTasks || [],
      };
    });

    res.status(200).json(groupedData);
  } catch (error) {
    console.error("Error in getAllEmployeesAttendanceAndTasksByDate:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};


export const getAttendanceAndTasksByEmployeeAndMonth = async (req, res) => {
  try {
    const { employeeId, date } = req.query;
    if (!employeeId || !date) {
      return res.status(400).json({ message: 'Employee ID and date are required' });
    }

    const inputDate = new Date(date);
    const startOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
    const endOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0, 23, 59, 59);
    const today = new Date().toISOString().split('T')[0];

    const formatDuration = (seconds) => {
      if (typeof seconds !== "number" || seconds <= 0) return "N/A";
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${hours > 0 ? `${hours} H ` : ""}${minutes > 0 ? `${minutes} M ` : ""}${remainingSeconds > 0 ? `${remainingSeconds} S` : ""}`.trim();
    };

    const BASE_URL = `${req.protocol}://${req.get('host')}`;

    const monthlyAttendance = await Attendance.find({
      employeeId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .populate('employeeId') // get full employee info
      .select('date clockInTime clockOutTime clockInSelfie clockOutSelfie autoClockOut employeeId breakTimings breakTime');

    const monthlyTasks = await Task.find({
      employeeId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    }).select('title description status createdAt updatedAt workSessions projectName duration startTime completionTime pauseTime assignedDate estimatedHours estimatedMinutes');

    const responseByDate = {};

    monthlyAttendance.forEach(record => {
      const recordDate = record.date.toISOString().split('T')[0];
      if (!responseByDate[recordDate]) {
        responseByDate[recordDate] = { attendance: null, tasks: [] };
      }
      responseByDate[recordDate].attendance = {
        clockInTime: record.clockInTime,
        clockOutTime: record.clockOutTime,
        clockInSelfie: record.clockInSelfie,
        clockOutSelfie: record.clockOutSelfie,
        autoClockOut: record.autoClockOut || false,
        breakTimings: record.breakTimings,
        breakTime: record.breakTime,
      };
    });

    monthlyTasks.forEach(task => {
      const taskDate = task.createdAt.toISOString().split('T')[0];
      if (!responseByDate[taskDate]) {
        responseByDate[taskDate] = { attendance: null, tasks: [] };
      }

      const formattedWorkSessions = task.workSessions.map(session => ({
        startTime: session.startTime,
        _id: session._id,
        duration: formatDuration(session.duration),
        endTime: session.endTime,
      }));

      responseByDate[taskDate].tasks.push({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        projectName: task.projectName,
        estimatedHours: task.estimatedHours,
        estimatedMinutes: task.estimatedMinutes,
        workSessions: formattedWorkSessions,
        duration: formatDuration(task.duration),
        startTime: task.startTime,
        completionTime: task.completionTime,
        pauseTime: task.pauseTime,
        assignedDate: task.assignedDate,
      });
    });

    let response = Object.entries(responseByDate).map(([date, data]) => ({
      date,
      ...data,
    }));

    response.sort((a, b) => {
      if (a.date === today) return -1;
      if (b.date === today) return 1;
      if (a.date === endOfMonth.toISOString().split('T')[0]) return -1;
      if (b.date === endOfMonth.toISOString().split('T')[0]) return 1;
      return b.date.localeCompare(a.date);
    });

    let employee = monthlyAttendance[0]?.employeeId;


    if (!employee) {
      employee = await Employee.findById(employeeId);
    }

    res.status(200).json({
      employeeId: employee?._id,
      employeeInfo: {
        name: employee?.name,
        email: employee?.email,
        phone: employee?.phone,
        jobRole: employee?.jobRole,
        department: employee?.department,
        position: employee?.position,
        address: employee?.address,
        gender: employee?.gender,
        city: employee?.city,
        state: employee?.state,
        pincode: employee?.pincode,
        joiningDate: employee?.joiningDate,
        dob: employee?.dob,
        type: employee?.type,
        image: employee?.image ? `${BASE_URL}${employee.image}` : null,
        leaveQuota: employee?.leaveQuota,
        bankDetails: {
          accountNumber: employee?.BankAccountNumber,
          bankName: employee?.BankName,
          ifscCode: employee?.BankAccountIFSCCode,
          nameOnAccount: employee?.NameOnBankAccount,
        },
        salarydetails: {
          salary: employee?.salary,
          incrementcycle: employee?.incrementcycle,
          IncrementAmount: employee?.IncrementAmount,
          incrementMonth: employee?.incrementMonth,
        },
        documents: (employee?.documents || []).map(doc => ({
          ...doc._doc,
          documentUrl: doc.documentUrl ? `${BASE_URL}${doc.documentUrl}` : null,
        })),
      },
      month: inputDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
      data: response,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// export const getAttendanceAndTasksByEmployeeAndMonth = async (req, res) => {
//   try {
//       const { employeeId, date } = req.query;
//       if (!employeeId || !date) {
//           return res.status(400).json({ message: 'Employee ID and date are required' });
//       }

//       // Parse the input date
//       const inputDate = new Date(date);

//       // Calculate start and end of the month
//       const startOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
//       const endOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0, 23, 59, 59);

//       // Fetch all attendance for the current month
//       const monthlyAttendance = await Attendance.find({
//           employeeId,
//           date: {
//               $gte: startOfMonth,
//               $lte: endOfMonth,
//           }
//       }).populate('employeeId', 'name').select('date clockInTime clockOutTime clockInSelfie clockOutSelfie');

//       // Fetch all tasks for the current month
//       const monthlyTasks = await Task.find({
//           employeeId,
//           createdAt: {
//               $gte: startOfMonth,
//               $lte: endOfMonth,
//           }
//       }).select('title description status createdAt updatedAt workSessions duration startTime completionTime pauseTime assignedDate');

//       // Organize data by date
//       const responseByDate = {};

//       // Process attendance
//       monthlyAttendance.forEach(record => {
//           const recordDate = record.date.toISOString().split('T')[0]; // Get the date in YYYY-MM-DD format
//           if (!responseByDate[recordDate]) {
//               responseByDate[recordDate] = { attendance: null, tasks: [] };
//           }
//           responseByDate[recordDate].attendance = {
//               clockInTime: record.clockInTime,
//               clockOutTime: record.clockOutTime,
//               clockInSelfie: record.clockInSelfie,
//               clockOutSelfie: record.clockOutSelfie,
//           };
//       });

//       // Process tasks
//       monthlyTasks.forEach(task => {
//           const taskDate = task.createdAt.toISOString().split('T')[0]; // Get the date in YYYY-MM-DD format
//           if (!responseByDate[taskDate]) {
//               responseByDate[taskDate] = { attendance: null, tasks: [] };
//           }
//           responseByDate[taskDate].tasks.push({
//               id: task._id,
//               title: task.title,
//               description: task.description,
//               status: task.status,
//               createdAt: task.createdAt,
//               updatedAt: task.updatedAt,
//               workSessions: task.workSessions,
//               duration: task.duration,
//               startTime: task.startTime,
//               completionTime: task.completionTime,
//               pauseTime: task.pauseTime,
//               assignedDate: task.assignedDate
//           });
//       });

//       // Convert response object to an array of date-wise data
//       const response = Object.entries(responseByDate).map(([date, data]) => ({
//           date,
//           ...data,
//       }));

//       // Send the response
//       res.status(200).json({
//           employeeId,
//           employeeName: monthlyAttendance[0]?.employeeId?.name || null, // Assuming attendance has employee info
//           month: inputDate.toLocaleString('default', { month: 'long', year: 'numeric' }), // e.g., December 2024
//           data: response,
//       });
//   } catch (error) {
//       res.status(500).json({ error: error.message });
//   }
// };




// export const getAttendanceAndTasksByEmployeeAndMonth = async (req, res) => {
//     try {
//         const { employeeId, date } = req.query;
//         if (!employeeId || !date) {
//             return res.status(400).json({ message: 'Employee ID and date are required' });
//         }
//         // Parse the input date
//         const inputDate = new Date(date);
//         // Calculate start and end of the month
//         const startOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
//         const endOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0, 23, 59, 59);
//         // Fetch all attendance for the current month
//         const monthlyAttendance = await Attendance.find({
//             employeeId,
//             date: {
//                 $gte: startOfMonth,
//                 $lte: endOfMonth,
//             }
//         }).populate('employeeId', 'name').select('date clockInTime clockOutTime clockInSelfie clockOutSelfie');
//         // Fetch all tasks for the current month
//         const monthlyTasks = await Task.find({
//             employeeId,
//             createdAt: {
//                 $gte: startOfMonth,
//                 $lte: endOfMonth,
//             }
//         }).select('title description status createdAt updatedAt');
//         // Organize data by date
//         const responseByDate = {};
//         // Process attendance
//         monthlyAttendance.forEach(record => {
//             const recordDate = record.date.toISOString().split('T')[0]; // Get the date in YYYY-MM-DD format
//             if (!responseByDate[recordDate]) {
//                 responseByDate[recordDate] = { attendance: null, tasks: [] };
//             }
//             responseByDate[recordDate].attendance = {
//                 clockInTime: record.clockInTime,
//                 clockOutTime: record.clockOutTime,
//                 clockInSelfie: record.clockInSelfie,
//                 clockOutSelfie: record.clockOutSelfie,
//             };
//         });
//         // Process tasks
//         monthlyTasks.forEach(task => {
//             const taskDate = task.createdAt.toISOString().split('T')[0]; // Get the date in YYYY-MM-DD format
//             if (!responseByDate[taskDate]) {
//                 responseByDate[taskDate] = { attendance: null, tasks: [] };
//             }
//             responseByDate[taskDate].tasks.push({
//                 id: task._id,
//                 title: task.title,
//                 description: task.description,
//                 status: task.status,
//                 createdAt: task.createdAt,
//                 updatedAt: task.updatedAt,
//             });
//         });

//         // Convert response object to an array of date-wise data
//         const response = Object.entries(responseByDate).map(([date, data]) => ({
//             date,
//             ...data,
//         }));
//         // Send the response
//         res.status(200).json({
//             employeeId,
//             employeeName: monthlyAttendance[0]?.employeeId?.name || null, // Assuming attendance has employee info
//             month: inputDate.toLocaleString('default', { month: 'long', year: 'numeric' }), // e.g., December 2024
//             data: response,
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };


export const getMonthlySummary = async (req, res) => {
  try {
    const { employeeId, date } = req.query;

    // Validate inputs
    if (!employeeId || !date) {
      return res.status(400).json({ message: 'Employee ID and date are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'Invalid Employee ID' });
    }

    // Safely parse the input date with error handling
    let inputDate;
    try {
      inputDate = new Date(date);
      // Check if date is valid
      if (isNaN(inputDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
    } catch (err) {
      console.error('Date parsing error:', err);
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const currentDate = new Date();
    console.log('Input Date:', inputDate);

    // Set the time of start date to beginning of month
    const startOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1, 0, 0, 0);

    // Determine if we're querying current month or a previous month
    const isCurrentMonth = inputDate.getMonth() === currentDate.getMonth()
      && inputDate.getFullYear() === currentDate.getFullYear();

    // Set end date based on whether it's current month or previous month
    let endDate;
    let daysToCount;

    if (isCurrentMonth) {
      // For current month, count up to today
      endDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999);
      daysToCount = currentDate.getDate();
    } else {
      // For previous months, count the entire month
      endDate = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0, 23, 59, 59, 999);
      daysToCount = endDate.getDate();
    }

    console.log('Date Range for Query:', {
      startOfMonth: startOfMonth.toISOString(),
      endDate: endDate.toISOString(),
      isCurrentMonth,
      daysToCount
    });

    // Fetch employee's creation date
    const employee = await Employee.findById(employeeId).select('createdAt image');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Safely handle employee creation date
    let employeeCreatedAt;
    try {
      employeeCreatedAt = new Date(employee.createdAt);
      if (isNaN(employeeCreatedAt.getTime())) {
        console.warn('Invalid employee creation date, using epoch start instead');
        employeeCreatedAt = new Date(0); // Use epoch start as fallback
      }
    } catch (err) {
      console.error('Error parsing employee creation date:', err);
      employeeCreatedAt = new Date(0); // Use epoch start as fallback
    }

    console.log('Employee Created At:', employeeCreatedAt.toISOString());

    // Fetch attendance records
    const allAttendanceRecords = await Attendance.find({
      employeeId: new mongoose.Types.ObjectId(employeeId)
    }).select('clockInTime clockOutTime');

    // Filter records for the selected month and adjust clock-in times
    const attendanceRecords = allAttendanceRecords.filter(record => {
      // Safely handle clockInTime
      if (!record.clockInTime) {
        console.warn('Record missing clockInTime:', record._id);
        return false;
      }

      let clockIn;
      try {
        clockIn = new Date(record.clockInTime);
        if (isNaN(clockIn.getTime())) {
          console.warn('Invalid clockInTime for record:', record._id);
          return false;
        }

        // Adjust for +5:30 timezone offset
        clockIn.setHours(clockIn.getHours() + 5);
        clockIn.setMinutes(clockIn.getMinutes() + 30);
      } catch (err) {
        console.error('Error parsing clockInTime:', err);
        return false;
      }

      const isWithinRange = clockIn >= startOfMonth && clockIn <= endDate;
      console.log('Record:', {
        clockInTime: clockIn.toISOString(),
        isWithinRange,
        startCheck: clockIn >= startOfMonth,
        endCheck: clockIn <= endDate
      });
      return isWithinRange;
    });

    // Map to store processed dates
    const processedDates = new Map();

    // Process attendance records with adjusted times
    attendanceRecords.forEach(record => {
      if (!record.clockInTime) return;

      let clockIn;
      try {
        clockIn = new Date(record.clockInTime);
        if (isNaN(clockIn.getTime())) return;

        // Adjust for +5:30 timezone
        clockIn.setHours(clockIn.getHours() + 5);
        clockIn.setMinutes(clockIn.getMinutes() + 30);
      } catch (err) {
        console.error('Error processing record clockInTime:', err);
        return;
      }

      const dateKey = clockIn.toISOString().split('T')[0];
      console.log('Processing record:', {
        clockInTime: clockIn.toISOString(),
        dateKey
      });
      processedDates.set(dateKey, {
        ...record,
        adjustedClockInTime: clockIn
      });
    });

    const totalAttendance = processedDates.size;
    console.log('Total Attendance Count:', totalAttendance);

    let totalLate = 0;
    let totalLeave = 0;
    let weekendsCount = 0;

    const weekendDays = [0, 6];

    const employeeLeaves = await LeaveRequest.find({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      status: "Approved",
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startOfMonth } }
      ]
    });

    // Calculate leave days
    const leaveDates = new Set();
    employeeLeaves.forEach(leave => {
      if (!leave.startDate || !leave.endDate) return;

      let start, end;
      try {
        start = new Date(leave.startDate);
        end = new Date(leave.endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn('Invalid leave dates for leave:', leave._id);
          return;
        }
      } catch (err) {
        console.error('Error parsing leave dates:', err);
        return;
      }

      let day = new Date(start);
      while (day <= end) {
        const dayStr = day.toISOString().split('T')[0];
        if (day >= startOfMonth && day <= endDate && day >= employeeCreatedAt) {
          const dayOfWeek = day.getDay();
          if (!weekendDays.includes(dayOfWeek)) {
            leaveDates.add(dayStr);
          }
        }
        day.setDate(day.getDate() + 1);
      }
    });
    totalLeave = leaveDates.size;


    for (let day = 1; day <= daysToCount; day++) {
      let currentDateIter;
      try {
        currentDateIter = new Date(inputDate.getFullYear(), inputDate.getMonth(), day);
        if (isNaN(currentDateIter.getTime())) {
          console.warn(`Invalid date created for day ${day}`);
          continue;
        }
      } catch (err) {
        console.error(`Error creating date for day ${day}:`, err);
        continue;
      }

      // Skip days before employee was created
      if (currentDateIter < employeeCreatedAt) continue;

      const currentDateStr = currentDateIter.toISOString().split('T')[0];
      const dayOfWeek = currentDateIter.getDay();
      const isWeekend = weekendDays.includes(dayOfWeek);
      const hasAttendance = processedDates.has(currentDateStr);

      console.log('Processing day:', {
        date: currentDateStr,
        dayOfWeek,
        isWeekend,
        hasAttendance
      });

      if (isWeekend) {
        weekendsCount++;
      } else if (hasAttendance && !leaveDates.has(currentDateStr)) {
        const record = processedDates.get(currentDateStr);
        if (record && record.adjustedClockInTime) {
          const clockInHour = record.adjustedClockInTime.getHours();
          console.log('ClockIn Hour:', clockInHour);
          if (clockInHour > 12) {
            totalLate++;
          }
        }
      }
    }

    // Calculate total working days and attendance rate
    const totalWorkingDays = daysToCount - weekendsCount;
    const attendanceRate = totalWorkingDays > 0 ? Math.round((totalAttendance / totalWorkingDays) * 100) : 0;

    const tasks = await Task.find({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      createdAt: {
        $gte: startOfMonth,
        $lte: endDate,
      },
    }).select('status');

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;

    const otherStatusTasks = tasks.filter(task =>
      task.status !== 'Completed' &&
      task.status !== 'Pending' &&
      task.status !== 'In Progress'
    ).length;

    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const response = {
      employeeId,
      month: inputDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
      periodCovered: isCurrentMonth
        ? `1-${daysToCount} ${inputDate.toLocaleString('default', { month: 'long' })}`
        : `Full month of ${inputDate.toLocaleString('default', { month: 'long' })}`,
      totalAttendance,
      totalLate,
      totalLeave,
      weekendsCount,
      totalWorkingDays,
      attendanceRate,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      otherStatusTasks,
      daysProcessed: daysToCount,
      employeeImage: employee.image ? `${baseUrl}${employee.image}` : null,
    };

    console.log('Final Response:', JSON.stringify(response, null, 2));
    res.status(200).json(response);

  } catch (error) {
    console.error('Error in getMonthlySummary:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const fetchAllAttendanceByDate = async (req, res) => {
  try {
    const { employeeId } = req.params; // Extract employeeId from route parameters
    const { date } = req.query; // Extract date from query parameters
    let query = { employeeId }; // Base query to filter attendance by employeeId
    // If a date is provided, add a match for the date field
    if (date) {
      query = {
        ...query,
        $expr: {
          $eq: [
            { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            date,
          ],
        },
      };
    }
    const attendanceRecords = await Attendance.find(query).populate('employeeId', 'name'); // Fetch attendance matching the query
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found' });
    }
    res.status(200).json({ attendance: attendanceRecords });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const fetchAllAttendance = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find().populate('employeeId', 'name');
    if (!attendanceRecords.length) {
      return res.status(404).json({ message: 'No attendance records found' });
    }
    res.status(200).json({ attendance: attendanceRecords });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate('employeeId', 'name');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found' });
    }

    res.status(200).json({ attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// export const updateAttendance = async (req, res) => {
//   try {
//     const {
//       date,
//       clockInTime,
//       clockOutTime,
//       clockInSelfie,
//       clockOutSelfie,
//       isEmergency,
//       emergencyReason,
//       breakTime,
//       // otherBreakDescriptions,
//       breakTimings,
//       Employeestatus
//     } = req.body;

//     const attendance = await Attendance.findById(req.params.id);
//     if (!attendance) {
//       return res.status(404).json({ message: 'Attendance not found' });
//     }

//     const fullUrl = req.protocol + '://' + req.get('host');
//     const employeeIdString = attendance._id.toString();

//     // Handle Clock-In Selfie (base64 image)
//     if (clockInSelfie && clockInSelfie !== attendance.clockInSelfie) {
//       const result = await handleBase64Image(clockInSelfie, 'clockIn', employeeIdString);
//       if (result.error) return res.status(400).json({ message: result.message });
//       attendance.clockInSelfie = `${fullUrl}/${result.imagePath}`;
//     }

//     // Handle Clock-Out Selfie (base64 image)
//     if (clockOutSelfie && clockOutSelfie !== attendance.clockOutSelfie) {
//       const result = await handleBase64Image(clockOutSelfie, 'clockOut', employeeIdString);
//       if (result.error) return res.status(400).json({ message: result.message });
//       attendance.clockOutSelfie = `${fullUrl}/${result.imagePath}`;
//     }

//     // Apply fields if present
//     if (date) attendance.date = date;
//     if (clockInTime) attendance.clockInTime = clockInTime;
//     if (clockOutTime) attendance.clockOutTime = clockOutTime;
//     if (isEmergency !== undefined) attendance.isEmergency = isEmergency;
//     if (emergencyReason !== undefined) attendance.emergencyReason = emergencyReason;
//     if (breakTime !== undefined) attendance.breakTime = breakTime;
//     // if (otherBreakDescriptions) attendance.otherBreakDescriptions = otherBreakDescriptions;
//     if (breakTimings) attendance.breakTimings = breakTimings;
//     if (Employeestatus) attendance.Employeestatus = Employeestatus;

//     // Recalculate workingDay if both times available
//     if (attendance.clockInTime && attendance.clockOutTime) {
//       const clockIn = new Date(attendance.clockInTime);
//       const clockOut = new Date(attendance.clockOutTime);
//       if (!isNaN(clockIn) && !isNaN(clockOut)) {
//         const hoursWorked = (clockOut - clockIn) / (1000 * 60 * 60);
//         if (hoursWorked >= 8) attendance.workingDay = 1;
//         else if (hoursWorked >= 5) attendance.workingDay = 0.75;
//         else if (hoursWorked >= 3.5) attendance.workingDay = 0.5;
//         else if (hoursWorked > 0) attendance.workingDay = 0.25;
//         else attendance.workingDay = 0;
//       }
//     }

//     await attendance.save();

//     res.status(200).json({
//       message: 'Attendance updated successfully',
//       attendance
//     });
//   } catch (error) {
//     console.error('Update attendance error:', error);
//     res.status(500).json({ error: error.message });
//   }
// };



export const updateAttendance = async (req, res) => {
  try {
    console.log('Update attendance request:', {
      id: req.params.id,
      body: req.body
    });

    const {
      date,
      clockInTime,
      clockOutTime,
      clockInSelfie,
      clockOutSelfie,
      isEmergency,
      emergencyReason,
      breakTime,
      breakTimings,
      Employeestatus,
      activeTaskIdBeforeBreak
    } = req.body;

    // Find attendance record
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      console.log('Attendance not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Attendance not found'
      });
    }

    console.log('Found attendance record:', attendance._id);

    const fullUrl = req.protocol + '://' + req.get('host');
    const employeeIdString = attendance._id.toString();

    // Handle Clock-In Selfie (base64 image) - ORIGINAL LOGIC PRESERVED
    if (clockInSelfie && clockInSelfie !== attendance.clockInSelfie) {
      try {
        const result = await handleBase64Image(clockInSelfie, 'clockIn', employeeIdString);
        if (result.error) {
          console.error('Clock-in selfie error:', result.message);
          return res.status(400).json({
            success: false,
            message: result.message
          });
        }
        attendance.clockInSelfie = `${fullUrl}/${result.imagePath}`;
        console.log('Clock-in selfie updated:', attendance.clockInSelfie);
      } catch (imageError) {
        console.error('Clock-in selfie processing error:', imageError);
        return res.status(400).json({
          success: false,
          message: 'Failed to process clock-in selfie'
        });
      }
    }

    // Handle Clock-Out Selfie (base64 image) - ORIGINAL LOGIC PRESERVED
    if (clockOutSelfie && clockOutSelfie !== attendance.clockOutSelfie) {
      try {
        const result = await handleBase64Image(clockOutSelfie, 'clockOut', employeeIdString);
        if (result.error) {
          console.error('Clock-out selfie error:', result.message);
          return res.status(400).json({
            success: false,
            message: result.message
          });
        }
        attendance.clockOutSelfie = `${fullUrl}/${result.imagePath}`;
        console.log('Clock-out selfie updated:', attendance.clockOutSelfie);
      } catch (imageError) {
        console.error('Clock-out selfie processing error:', imageError);
        return res.status(400).json({
          success: false,
          message: 'Failed to process clock-out selfie'
        });
      }
    }

    // Apply fields if present - ORIGINAL LOGIC WITH IMPROVED VALIDATION
    if (date !== undefined) {
      attendance.date = date;
      console.log('Updated date:', date);
    }

    if (clockInTime !== undefined) {
      attendance.clockInTime = clockInTime;
      console.log('Updated clockInTime:', clockInTime);
    }

    if (clockOutTime !== undefined) {
      attendance.clockOutTime = clockOutTime;
      console.log('Updated clockOutTime:', clockOutTime);
    }

    if (isEmergency !== undefined) {
      attendance.isEmergency = isEmergency;
      console.log('Updated isEmergency:', isEmergency);
    }

    if (emergencyReason !== undefined) {
      attendance.emergencyReason = emergencyReason;
      console.log('Updated emergencyReason:', emergencyReason);
    }

    if (breakTime !== undefined) {
      attendance.breakTime = breakTime;
      console.log('Updated breakTime:', breakTime);
    }

    // Handle breakTimings with proper validation - FIXED VERSION
    if (breakTimings !== undefined) {
      if (Array.isArray(breakTimings)) {
        attendance.breakTimings = breakTimings;
        console.log('Updated breakTimings:', JSON.stringify(breakTimings, null, 2));
      } else {
        console.error('Invalid breakTimings format:', breakTimings);
        return res.status(400).json({
          success: false,
          message: 'breakTimings must be an array'
        });
      }
    }

    // Handle Employee status with validation - FIXED VERSION
    if (Employeestatus !== undefined) {
      const validStatuses = ['active', 'on break', 'clocked out'];
      if (validStatuses.includes(Employeestatus)) {
        attendance.Employeestatus = Employeestatus;
        console.log('Updated Employeestatus:', Employeestatus);
      } else {
        console.error('Invalid Employeestatus:', Employeestatus);
        return res.status(400).json({
          success: false,
          message: `Invalid employee status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
    }

    // Handle activeTaskIdBeforeBreak - NEW ADDITION (was missing)
    if (activeTaskIdBeforeBreak !== undefined) {
      attendance.activeTaskIdBeforeBreak = activeTaskIdBeforeBreak;
      console.log('Updated activeTaskIdBeforeBreak:', activeTaskIdBeforeBreak);
    }

    // Recalculate workingDay if both times available - ORIGINAL LOGIC PRESERVED
    if (attendance.clockInTime && attendance.clockOutTime) {
      try {
        const clockIn = new Date(attendance.clockInTime);
        const clockOut = new Date(attendance.clockOutTime);

        if (!isNaN(clockIn) && !isNaN(clockOut)) {
          const hoursWorked = (clockOut - clockIn) / (1000 * 60 * 60);

          if (hoursWorked >= 8) {
            attendance.workingDay = 1;
          } else if (hoursWorked >= 5) {
            attendance.workingDay = 0.75;
          } else if (hoursWorked >= 3.5) {
            attendance.workingDay = 0.5;
          } else if (hoursWorked > 0) {
            attendance.workingDay = 0.25;
          } else {
            attendance.workingDay = 0;
          }

          console.log(`Calculated working hours: ${hoursWorked.toFixed(2)}, Working day: ${attendance.workingDay}`);
        }
      } catch (timeCalculationError) {
        console.error('Error calculating working day:', timeCalculationError);
        // Continue without failing the update
      }
    }

    // Save the attendance record
    const savedAttendance = await attendance.save();
    console.log('Attendance saved successfully:', savedAttendance._id);

    // Return response - IMPROVED FORMAT
    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      attendance: savedAttendance
    });

  } catch (error) {
    console.error('Update attendance error:', error);

    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance ID format'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + error.message
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate record error'
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Server error occurred',
      error: error.message
    });
  }
};




export const deleteAttendance = async (req, res) => {
  try {
    const deletedAttendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!deletedAttendance) {
      return res.status(404).json({ message: 'Attendance not found' });
    }

    res.status(200).json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getPreviousDayAutoClockOutEmployees = async (req, res) => {
  const { organizationId, department } = req.query;
  try {
    const today = new Date();
    const previousDay = new Date(today);
    previousDay.setDate(today.getDate() - 1);
    previousDay.setHours(0, 0, 0, 0);

    const nextDay = new Date(previousDay);
    nextDay.setDate(previousDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);


    const attendanceFilter = {
      date: { $gte: previousDay, $lt: nextDay },
      autoClockOut: true,
    };

    if (organizationId) {
      const empFilter = { organizationId };
      if (department) {
        const existsType3 = await Employee.exists({ department, type: 3 });
        if (existsType3) {
          empFilter.department = department;
        }
      }


      const employeesInOrg = await Employee.find(empFilter, "_id");
      const employeeIds = employeesInOrg.map(emp => emp._id);
      attendanceFilter.employeeId = { $in: employeeIds };
    }

    const autoClockOutEmployees = await Attendance.find(attendanceFilter).populate(
      "employeeId",
      "name email position image gender"
    );

    res.status(200).json(autoClockOutEmployees);
  } catch (error) {
    console.error("Error fetching previous day auto clock-out employees:", error);
    res.status(500).json({ error: error.message });
  }
};



cron.schedule('0 21 * * *', async () => {
  console.log('🕒 Running daily auto clock-out process at 9:00 PM...');

  try {
    const today = new Date().toISOString().split('T')[0];

    const unclockedEmployees = await Attendance.find({
      clockInTime: { $exists: true },
      clockOutTime: null,
      date: today,
    });

    if (unclockedEmployees.length === 0) {
      console.log('No employees require auto clock-out today.');
      return;
    }


    const fixedClockOutTime = `${today}T18:30:00`;

    for (const attendance of unclockedEmployees) {
      attendance.clockOutTime = fixedClockOutTime;
      attendance.isEmergency = true;
      attendance.emergencyReason = 'Auto Clock-Out due to no manual clock-out';
      attendance.autoClockOut = true;

      if (!attendance.workingDay || attendance.workingDay === 0) {
        attendance.workingDay = 1;
      }

      await attendance.save();

      console.log(`Auto clocked out employee: ${attendance.employeeId} at ${attendance.clockOutTime}`);
    }

    console.log(' Auto clock-out process completed successfully!');
  } catch (error) {
    console.error('Error during auto clock-out:', error.message);
  }
});




// export const getMonthlyAttendance = async (req, res) => {
//   try {
//     const today = new Date();
//     let year = parseInt(req.query.year);
//     let month = parseInt(req.query.month);
//     const period = req.query.period;

//     if (isNaN(year)) year = today.getFullYear();
//     if (isNaN(month) || month < 0 || month > 11) month = today.getMonth();

//     if (period === "last") {
//       if (month === 0) {
//         month = 11;
//         year -= 1;
//       } else {
//         month -= 1;
//       }
//     }

//     const startDate = new Date(Date.UTC(year, month, 1));
//     const endDate =
//       year === today.getFullYear() &&
//       month === today.getMonth() &&
//       period !== "last"
//         ? new Date(today)
//         : new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

//     const allEmployees = await Employee.find({ type: { $ne: 1 } });
//     const allAttendance = await Attendance.find({
//       date: { $gte: startDate, $lte: endDate },
//     });
//     const allLeaves = await LeaveRequest.find({
//       status: "Approved",
//       $or: [
//         { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
//         { appliedDate: { $gte: startDate, $lte: endDate } },
//       ],
//     });

//     const dates = [];
//     let current = new Date(startDate);
//     while (current <= endDate) {
//       const dateObj = new Date(current);
//       dates.push({
//         date: dateObj.toISOString().split("T")[0],
//         day: dateObj.toLocaleDateString("en-US", { weekday: "long" }),
//         isWeekend: dateObj.getUTCDay() === 0 || dateObj.getUTCDay() === 6,
//       });
//       current.setUTCDate(current.getUTCDate() + 1);
//     }

//     const result = allEmployees.map((employee) => {
//       let daysPresent = 0;
//       let leavesTaken = 0;

//       const employeeLeaves = allLeaves.filter(
//         (l) => l.employeeId.toString() === employee._id.toString()
//       );

//       const leaveDates = new Set();
//       employeeLeaves.forEach((leave) => {
//         const start = new Date(leave.startDate);
//         const end = new Date(leave.endDate);
//         let day = new Date(start);
//         while (day <= end) {
//           const dayStr = day.toISOString().split("T")[0];
//           if (new Date(dayStr) >= startDate && new Date(dayStr) <= endDate) {
//             leaveDates.add(dayStr);
//           }
//           day.setDate(day.getDate() + 1);
//         }
//         const appliedStr = new Date(leave.appliedDate).toISOString().split("T")[0];
//         if (new Date(appliedStr) >= startDate && new Date(appliedStr) <= endDate) {
//           leaveDates.add(appliedStr);
//         }
//       });

//       const attendanceByDate = dates.map(({ date, day, isWeekend }) => {
//         let status = "Absent";
//         let leaveApplied = leaveDates.has(date);

//         if (isWeekend) {
//           return { date, day, status: "Weekend", leaveApplied };
//         }

//         const attendanceRecord = allAttendance.find(
//           (att) =>
//             att.employeeId.toString() === employee._id.toString() &&
//             new Date(att.date).toISOString().split("T")[0] === date
//         );

//         if (attendanceRecord && attendanceRecord.workingDay) {
//           const work = attendanceRecord.workingDay;
//           if (work === 1) {
//             daysPresent += 1;
//             status = "Present";
//           } else if (work === 0.5) {
//             daysPresent += 0.5;
//             status = "Half Day";
//           }
//         } else if (leaveApplied) {
//           status = "On Leave";
//         }

//         return { date, day, status, leaveApplied };
//       });

//       leavesTaken = [...leaveDates].length;

//       const totalWorkingDays = dates.filter((d) => !d.isWeekend).length;
//       const daysAbsent = totalWorkingDays - daysPresent - leavesTaken;

//       return {
//         employeeId: employee._id,
//         name: employee.name,
//         email: employee.email,
//         daysPresent: parseFloat(daysPresent.toFixed(1)),
//         leavesTaken,
//         daysAbsent: parseFloat(daysAbsent.toFixed(1)),
//         attendance: attendanceByDate,
//       };
//     });

//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error generating monthly attendance:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };



// export const getMonthlyAttendance = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(23, 59, 59, 999);

//     let year = parseInt(req.query.year);
//     let month = parseInt(req.query.month);
//     const period = req.query.period;

//     if (isNaN(year)) year = today.getFullYear();
//     if (isNaN(month) || month < 0 || month > 11) month = today.getMonth();

//     if (period === "last") {
//       if (month === 0) {
//         month = 11;
//         year -= 1;
//       } else {
//         month -= 1;
//       }
//     }

//     const startDate = new Date(Date.UTC(year, month, 1));
//     const endDate = new Date(today);
//     if (period === "last" || (year !== today.getFullYear() || month !== today.getMonth())) {
//       endDate.setFullYear(year, month + 1, 0);
//       endDate.setHours(23, 59, 59, 999);
//     }

//     const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

//     // Fetch holidays for this month
//     const holidaysInMonth = await Holiday.find({
//       date: {
//         $gte: new Date(Date.UTC(year, month, 1)),
//         $lte: new Date(Date.UTC(year, month + 1, 0)),
//       },
//     });

//     const numberOfHolidays = holidaysInMonth.length;

//     // Assuming 8 weekends
//     const assumedWeekendDays = 8;
//     const totalWorkingDays = totalDaysInMonth - assumedWeekendDays - numberOfHolidays;

//     // Get the base URL dynamically from the request
//     const protocol = req.protocol; // http or https
//     const host = req.get('host'); // gets the host from headers
//     const baseUrl = `${protocol}://${host}`;

//     // Function to process image URLs
//     const processImageUrl = (imagePath) => {
//       if (!imagePath) return null;
//       if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
//         return imagePath;
//       }
//       return `${baseUrl}${imagePath}`;
//     };

//     const allEmployees = await Employee.find({ type: { $ne: 1 }, status: { $ne: 0 } });
//     const allAttendance = await Attendance.find({ date: { $gte: startDate, $lte: endDate } });
//     const allLeaves = await LeaveRequest.find({
//       status: "Approved",
//       $or: [
//         { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
//       ]
//     });

//     const dates = [];
//     let current = new Date(startDate);
//     while (current <= endDate) {
//       const copy = new Date(current);
//       dates.push({
//         date: copy.toISOString().split("T")[0],
//         day: copy.toLocaleDateString("en-US", { weekday: "long" }),
//         isWeekend: copy.getUTCDay() === 0 || copy.getUTCDay() === 6,
//         isPastOrToday: copy <= today,
//       });
//       current.setUTCDate(current.getUTCDate() + 1);
//     }

//     const result = allEmployees.map((employee) => {
//       let daysPresent = 0;
//       let leavesTaken = 0;
//       let daysAbsent = 0;

//       const employeeLeaves = allLeaves.filter(
//         l => l.employeeId.toString() === employee._id.toString()
//       );

//       const leaveDates = new Set();
//       employeeLeaves.forEach(leave => {
//         const start = new Date(leave.startDate);
//         const end = new Date(leave.endDate);
//         let day = new Date(start);
//         while (day <= end) {
//           const dayStr = day.toISOString().split("T")[0];
//           if (day >= startDate && day <= endDate) {
//             leaveDates.add(dayStr);
//           }
//           day.setDate(day.getDate() + 1);
//         }
//       });

//       const attendanceByDate = dates.map(({ date, day, isWeekend, isPastOrToday }) => {
//         const isLeaveApplied = leaveDates.has(date);
//         if (isWeekend) {
//           return { date, day, status: "Weekend", leaveApplied: isLeaveApplied };
//         }

//         const attendanceRecord = allAttendance.find(
//           att =>
//             att.employeeId.toString() === employee._id.toString() &&
//             new Date(att.date).toISOString().split("T")[0] === date
//         );

//         const workingDay = attendanceRecord?.workingDay || 0;

//         let status = "Absent";
//         let presence = 0;

//         if (workingDay === 1) {
//           status = "Present";
//           presence = 1;
//         } else if (workingDay === 0.5) {
//           status = "Half Day";
//           presence = 0.5;
//         } else if (isLeaveApplied) {
//           status = "On Leave";
//           if (isPastOrToday) {
//             leavesTaken += 1;
//           }
//         } else if (isPastOrToday) {
//           daysAbsent += 1;
//         }

//         if (isPastOrToday) {
//           daysPresent += presence;
//         }

//         return {
//           date,
//           day,
//           status,
//           leaveApplied: isLeaveApplied,
//         };
//       });

//       return {
//         employeeId: employee._id,
//         name: employee.name,
//         email: employee.email,
//         daysPresent: parseFloat(daysPresent.toFixed(1)),
//         leavesTaken,
//         daysAbsent,
//         attendance: attendanceByDate,
//         image: processImageUrl(employee.image), // Added base URL processing here
//       };
//     });

//     return res.status(200).json({
//       month: `${year}-${(month + 1).toString().padStart(2, "0")}`,
//       totalDaysInMonth,
//       assumedWeekendDays,
//       numberOfHolidays,
//       totalWorkingDays,
//       employees: result,
//     });
//   } catch (error) {
//     console.error("Error generating monthly attendance:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const getMonthlyAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let year = parseInt(req.query.year);
    let month = parseInt(req.query.month);
    const { period, organizationId, department } = req.query;

    if (isNaN(year)) year = today.getFullYear();
    if (isNaN(month) || month < 0 || month > 11) month = today.getMonth();

    if (period === "last") {
      if (month === 0) {
        month = 11;
        year -= 1;
      } else {
        month -= 1;
      }
    }

    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(today);
    if (period === "last" || (year !== today.getFullYear() || month !== today.getMonth())) {
      endDate.setFullYear(year, month + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    // Fetch holidays for this month
    const holidaysInMonth = await Holiday.find({
      date: {
        $gte: new Date(Date.UTC(year, month, 1)),
        $lte: new Date(Date.UTC(year, month + 1, 0)),
      },
    });

    const numberOfHolidays = holidaysInMonth.length;

    // Get the base URL dynamically from the request
    const protocol = req.protocol; // http or https
    const host = req.get('host'); // gets the host from headers
    const baseUrl = `${protocol}://${host}`;

    // Function to process image URLs
    const processImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      return `${baseUrl}${imagePath}`;
    };

    const employeeFilter = { type: { $ne: 1 }, status: { $ne: 0 } };
    if (organizationId) employeeFilter.organizationId = organizationId;
    if (department) {
      const existsType3 = await Employee.exists({ department, type: 3 });
      if (existsType3) {
        employeeFilter.department = department;
      }
    }



    const allEmployees = await Employee.find(employeeFilter);
    const attendanceFilter = { date: { $gte: startDate, $lte: endDate } };
    if (organizationId) attendanceFilter.organizationId = organizationId;

    const allAttendance = await Attendance.find(attendanceFilter);

    const allLeaves = await LeaveRequest.find({
      status: "Approved",
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });

    const dates = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      const copy = new Date(current);
      dates.push({
        date: copy.toISOString().split("T")[0],
        day: copy.toLocaleDateString("en-US", { weekday: "long" }),
        isWeekend: copy.getUTCDay() === 0 || copy.getUTCDay() === 6,
        isPastOrToday: copy <= today,
      });
      current.setUTCDate(current.getUTCDate() + 1);
    }

    const calculateWeekendDaysInMonth = (year, month) => {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      let weekendCount = 0;

      let current = new Date(firstDay);
      while (current <= lastDay) {
        if (current.getDay() === 0 || current.getDay() === 6) {
          weekendCount++;
        }
        current.setDate(current.getDate() + 1);
      }
      return weekendCount;
    };

    const actualWeekendDays = calculateWeekendDaysInMonth(year, month);
    const totalWorkingDays = totalDaysInMonth - actualWeekendDays - numberOfHolidays;

    const result = allEmployees.map((employee) => {
      let daysPresent = 0;
      let leavesTaken = 0;
      let daysAbsent = 0;

      const employeeLeaves = allLeaves.filter(
        l => l.employeeId.toString() === employee._id.toString()
      );

      const leaveDates = new Set();
      employeeLeaves.forEach(leave => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        let day = new Date(start);
        while (day <= end) {
          const dayStr = day.toISOString().split("T")[0];
          if (day >= startDate && day <= endDate) {
            leaveDates.add(dayStr);
          }
          day.setDate(day.getDate() + 1);
        }
      });

      const attendanceByDate = dates.map(({ date, day, isWeekend, isPastOrToday }) => {
        const isLeaveApplied = leaveDates.has(date);
        if (isWeekend) {
          return { date, day, status: "Weekend", leaveApplied: isLeaveApplied };
        }

        const attendanceRecord = allAttendance.find(
          att =>
            att.employeeId.toString() === employee._id.toString() &&
            new Date(att.date).toISOString().split("T")[0] === date
        );

        const workingDay = attendanceRecord?.workingDay || 0;

        let status = "Absent";
        let presence = 0;

        // Updated logic to handle all workingDay values
        if (workingDay === 1) {
          status = "Present";
          presence = 1;
        } else if (workingDay === 0.75) {
          status = "Quator Day";  // 3/4 day
          presence = 0.75;
        } else if (workingDay === 0.5) {
          status = "Half Day";
          presence = 0.5;
        } else if (workingDay === 0.25) {
          status = "Quarter Day"; // 1/4 day
          presence = 0.25;
        } else if (isLeaveApplied) {
          status = "On Leave";
          if (isPastOrToday) {
            leavesTaken += 1;
          }
        } else if (isPastOrToday) {
          daysAbsent += 1;
        }

        if (isPastOrToday) {
          daysPresent += presence;
        }

        return {
          date,
          day,
          status,
          leaveApplied: isLeaveApplied,
        };
      });

      // Round to nearest valid fraction (0, 0.25, 0.5, 0.75, 1)
      // This ensures daysPresent is always a multiple of 0.25
      const totalDaysPresent = Math.round(daysPresent * 4) / 4;

      return {
        employeeId: employee._id,
        name: employee.name,
        email: employee.email,
        daysPresent: totalDaysPresent,
        leavesTaken,
        daysAbsent,
        attendance: attendanceByDate,
        image: processImageUrl(employee.image),
      };
    });

    return res.status(200).json({
      month: `${year}-${(month + 1).toString().padStart(2, "0")}`,
      totalDaysInMonth,
      actualWeekendDays,
      numberOfHolidays,
      totalWorkingDays,
      employees: result,
    });
  } catch (error) {
    console.error("Error generating monthly attendance:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const calculateMonthlySalaries = async (req, res) => {
  try {
    const { employees, month, year } = req.body;

    const inputYear = parseInt(year);
    const inputMonth = parseInt(month);

    if (isNaN(inputYear) || isNaN(inputMonth) || inputMonth < 0 || inputMonth > 11) {
      return res.status(400).json({ message: "Invalid year or month" });
    }


    const startDate = new Date(Date.UTC(inputYear, inputMonth, 1));
    const endDate = new Date(Date.UTC(inputYear, inputMonth + 1, 0));
    endDate.setHours(23, 59, 59, 999);

    const totalDaysInMonth = new Date(inputYear, inputMonth + 1, 0).getDate();


    const allHolidays = await Holiday.find({
      date: { $gte: startDate, $lte: endDate },
    });

    const holidaysInMonth = allHolidays.filter((holiday) => {
      const day = new Date(holiday.date).getUTCDay();
      return day !== 0 && day !== 6;
    });

    const numberOfHolidays = holidaysInMonth.length;


    let weekendDays = 0;
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const date = new Date(Date.UTC(inputYear, inputMonth, i));
      const day = date.getUTCDay();
      if (day === 0 || day === 6) {
        weekendDays++;
      }
    }

    const totalWorkingDays = totalDaysInMonth - weekendDays - numberOfHolidays;


    const results = [];
    let totalFinalSalary = 0;


    const employeeArray = Array.isArray(employees) ? employees : [employees];

    for (const employeeData of employeeArray) {
      const { employeeId, salary } = employeeData;


      const employee = await Employee.findById(employeeId);
      if (!employee) {
        results.push({ employeeId, error: "Employee not found" });
        continue;
      }

      const perDaySalary = salary / totalDaysInMonth;

      const allAttendance = await Attendance.find({
        employeeId: employeeId,
        date: { $gte: startDate, $lte: endDate },
      });

      const allLeaves = await LeaveRequest.find({
        employeeId: employeeId,
        status: "Approved",
        $or: [
          { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
        ],
      });

      let daysPresent = 0;
      let leavesTaken = 0;
      let daysAbsent = 0;

      const leaveDates = new Set();
      allLeaves.forEach((leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        let day = new Date(start);
        while (day <= end) {
          const dayStr = day.toISOString().split("T")[0];
          if (day >= startDate && day <= endDate) {
            leaveDates.add(dayStr);
          }
          day.setDate(day.getDate() + 1);
        }
      });

      // Calculate present days and leave/absent days
      for (let i = 1; i <= totalDaysInMonth; i++) {
        const currentDate = new Date(Date.UTC(inputYear, inputMonth, i));
        const dateStr = currentDate.toISOString().split("T")[0];
        const dayOfWeek = currentDate.getUTCDay();

        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = holidaysInMonth.find(
          (h) => new Date(h.date).toISOString().split("T")[0] === dateStr
        );

        if (isWeekend || isHoliday) continue;

        const attendanceRecord = allAttendance.find(
          (att) =>
            att.employeeId.toString() === employee._id.toString() &&
            new Date(att.date).toISOString().split("T")[0] === dateStr
        );

        const workingDay = attendanceRecord?.workingDay || 0;

        if (workingDay === 1) {
          daysPresent += 1;
        } else if (workingDay === 0.75) {
          daysPresent += 0.75;
        } else if (workingDay === 0.5) {
          daysPresent += 0.5;
        } else if (workingDay === 0.25) {
          daysPresent += 0.25;
        } else if (leaveDates.has(dateStr)) {
          leavesTaken += 1;
        } else {
          daysAbsent += 1;
        }
      }

      const totalDaysPresent = Math.round(daysPresent * 4) / 4;
      const absentDays = totalWorkingDays - totalDaysPresent;


      let deductionDays = Math.max(absentDays - 1, 0);
      let deductionAmount = Math.round(deductionDays * perDaySalary);

      const finalSalary = Math.round(salary - deductionAmount);
      totalFinalSalary += finalSalary;

      results.push({
        employeeId: employee._id,
        name: employee.name,
        email: employee.email,
        BankAccountIFSCCode: employee.BankAccountIFSCCode,
        BankAccountNumber: employee.BankAccountNumber,
        BankName: employee.BankName,
        NameOnBankAccount: employee.NameOnBankAccount,
        salary,
        perDaySalary,
        daysPresent: totalDaysPresent,
        daysAbsent: absentDays,
        deductionDays,
        finalSalary,
      });
    }

    return res.status(200).json({
      month: `${inputYear}-${(inputMonth + 1).toString().padStart(2, "0")}`,
      totalDaysInMonth,
      weekendDays,
      numberOfHolidays,
      totalWorkingDays,
      totalFinalSalary,
      employees: results,
    });
  } catch (error) {
    console.error("Error calculating salary:", error);
    res.status(500).json({ message: "Server error" });
  }
};

