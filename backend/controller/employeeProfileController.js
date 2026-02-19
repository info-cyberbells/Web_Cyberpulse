import mongoose from 'mongoose';
import Employee from '../model/employeeModel.js';
import Attendance from '../model/AttendanceModel.js';
import nodemailer from "nodemailer";
import axios from 'axios';
import cron from "node-cron";
import dotenv from "dotenv";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const crypto = require("crypto");


import Task from '../model/TaskModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');
const BASE_URL = '/uploads/';

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize multer
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // Limit set to 10MB

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;


    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res.status(401).json({ message: "Invalid credentials" });
    }


    if (!(await bcrypt.compare(password, employee.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }


    if (employee.status !== "1") {
      return res.status(403).json({ message: "You are not a member of Cyberbells" });
    }


    const fullUrl = req.protocol + "://" + req.get("host");
    const imagePath = employee.image ? `${fullUrl}${employee.image}` : null;

    // Generate JWT token
    const token = jwt.sign(
      { id: employee._id, email: employee.email, type: employee.type },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return employee details with token
    res.status(200).json({
      message: "Login successful",
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        employeementStatus: employee.employeementStatus,
        email: employee.email,
        type: employee.type,
        image: imagePath,
        address: employee.address,
        department: employee.department,
        joiningDate: employee.joiningDate,
        phone: employee.phone,
        state: employee.state,
        pincode: employee.pincode,
        position: employee.position,
        city: employee.city,
        dob: employee.dob,
        gender: employee.gender,
        status: employee.status,
        organizationId: employee.organizationId,
        jobRole: employee.jobRole,
        NameOnBankAccount: employee.NameOnBankAccount,
        BankAccountNumber: employee.BankAccountNumber,
        BankAccountIFSCCode: employee.BankAccountIFSCCode,
        BankName: employee.BankName,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};




// export const addEmployee = async (req, res) => {
//   try {
//     console.log("Request body:", req.body);
//     const {
//       name,
//       email,
//       position,
//       password,
//       department,
//       joiningDate,
//       dob,
//       jobRole,
//       address,
//       pincode,
//       state,
//       country,
//       type,
//       city,
//       phone,
//       gender,
//       status,
//       salary,
//       incrementcycle,
//       IncrementAmount,
//       incrementMonth,
//       organizationId,
//     } = req.body;

//     // Check if the Employee already exists
//     const existingEmployee = await Employee.findOne({ email });
//     if (existingEmployee) {
//       return res.status(400).json({ error: "Email already exists" });
//     }

//     // Hash the password before saving
//     const hashedPassword = await bcrypt.hash(password, 10); // Use a salt rounds value of 10

//     // Create a new employee with the hashed password
//     const newEmployee = new Employee({
//       name,
//       email,
//       position,
//       password: hashedPassword, // Use hashed password
//       department,
//       joiningDate,
//       dob,
//       jobRole,
//       address,
//       pincode,
//       state,
//       country,
//       city,
//       type,
//       phone,
//       gender,
//       status,
//       salary,
//       incrementcycle,
//       IncrementAmount,
//       incrementMonth,
//       organizationId,
//     });

//     // Save the Employee to the database
//     const savedEmployee = await newEmployee.save();

//     // Create a response object without sensitive information (if needed)
//     const employeeWithoutSensitiveInfo = {
//       _id: savedEmployee._id,
//       name: savedEmployee.name,
//       email: savedEmployee.email,
//       position: savedEmployee.position,
//       department: savedEmployee.department,
//       joiningDate: savedEmployee.joiningDate,
//       jobRole: savedEmployee.jobRole,
//       dob: savedEmployee.dob,
//       address: savedEmployee.address,
//       phone: savedEmployee.phone,
//       city: savedEmployee.city,
//       pincode: savedEmployee.pincode,
//       type: savedEmployee.type,
//       state: savedEmployee.state,
//       status: savedEmployee.status,
//       gender: savedEmployee.gender,
//       salary: savedEmployee.salary,
//       incrementcycle: savedEmployee.incrementcycle,
//       IncrementAmount: savedEmployee.IncrementAmount,
//       incrementMonth: savedEmployee.incrementMonth,
//       createdAt: savedEmployee.createdAt,
//       updatedAt: savedEmployee.updatedAt,
//     };
//     if (organizationId) {
//       savedEmployee.organizationId = organizationId;
//     }

//     // Send a success response
//     res.status(201).json({
//       message: "Employee registered successfully",
//       data: employeeWithoutSensitiveInfo,
//     });
//   } catch (error) {
//     // Handle any errors
//     res.status(400).json({ error: error.message });
//   }
// };

export const addEmployee = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const {
      name,
      email,
      position,
      password,
      department,
      joiningDate,
      dob,
      jobRole,
      address,
      pincode,
      state,
      country,
      type,
      city,
      phone,
      gender,
      status,
      salary,
      incrementcycle,
      IncrementAmount,
      incrementMonth,
      organizationId,
      lastWorkingDay,
      duesStatus,
      lastDuePayDate,
    } = req.body;

    // Check if the Employee already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10); // Use a salt rounds value of 10

    // Create a new employee with the hashed password
    const newEmployee = new Employee({
      name,
      email,
      position,
      password: hashedPassword, // Use hashed password
      department,
      joiningDate,
      dob,
      jobRole,
      address,
      pincode,
      state,
      country,
      city,
      type,
      phone,
      gender,
      status,
      salary,
      incrementcycle,
      IncrementAmount,
      incrementMonth,
      organizationId,
      lastWorkingDay,
      duesStatus,
      lastDuePayDate
    });

    // Save the Employee to the database
    const savedEmployee = await newEmployee.save();

    // Create a response object without sensitive information (if needed)
    const employeeWithoutSensitiveInfo = {
      _id: savedEmployee._id,
      name: savedEmployee.name,
      email: savedEmployee.email,
      position: savedEmployee.position,
      department: savedEmployee.department,
      joiningDate: savedEmployee.joiningDate,
      jobRole: savedEmployee.jobRole,
      dob: savedEmployee.dob,
      address: savedEmployee.address,
      phone: savedEmployee.phone,
      city: savedEmployee.city,
      pincode: savedEmployee.pincode,
      type: savedEmployee.type,
      state: savedEmployee.state,
      status: savedEmployee.status,
      gender: savedEmployee.gender,
      salary: savedEmployee.salary,
      incrementcycle: savedEmployee.incrementcycle,
      IncrementAmount: savedEmployee.IncrementAmount,
      incrementMonth: savedEmployee.incrementMonth,
      createdAt: savedEmployee.createdAt,
      updatedAt: savedEmployee.updatedAt,
      lastWorkingDay: savedEmployee.lastWorkingDay,
      duesStatus: savedEmployee.duesStatus,
      lastDuePayDate: savedEmployee.lastDuePayDate,
    };
    if (organizationId) {
      savedEmployee.organizationId = organizationId;
    }

    // Send a success response
    res.status(201).json({
      message: "Employee registered successfully",
      data: employeeWithoutSensitiveInfo,
    });
  } catch (error) {
    // Handle any errors
    res.status(400).json({ error: error.message });
  }
};

export const fetchAllEmployee = async (req, res) => {

  try {
    const { organizationId, department } = req.query;

    const query = { type: { $ne: 1 } };
    if (organizationId) {
      query.organizationId = organizationId;
    }
    if (department) {
      const existsType3InDept = await Employee.exists({ department, type: 3 });
      if (existsType3InDept) {
        query.department = department;
      }
    }


    const employees = await Employee.find(query)
      .select('-password -__v')
      .sort({ name: 1 });


    if (organizationId) {
      query.organizationId = organizationId;
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const processUrl = (path) => {
      if (!path) return null;
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      return `${baseUrl}${path}`;
    };

    const employeesWithFullImageUrls = employees.map(employee => {
      const employeeObj = employee.toObject();

      return {
        _id: employeeObj._id,
        name: employeeObj.name,
        email: employeeObj.email,
        position: employeeObj.position,
        department: employeeObj.department,
        joiningDate: employeeObj.joiningDate,
        jobRole: employeeObj.jobRole,
        dob: employeeObj.dob,
        address: employeeObj.address,
        phone: employeeObj.phone,
        city: employeeObj.city,
        pincode: employeeObj.pincode,
        type: employeeObj.type,
        state: employeeObj.state,
        country: employeeObj.country,
        status: employeeObj.status,
        image: processUrl(employeeObj.image),
        gender: employeeObj.gender,
        createdAt: employeeObj.createdAt,
        updatedAt: employeeObj.updatedAt,
        reason: employeeObj.reason,
        comments: employeeObj.comments,
        lastWorkingDay: employeeObj.lastWorkingDay,
        duesStatus: employeeObj.duesStatus,
        lastDuePayDate: employeeObj.lastDuePayDate,
        futureHiring: employeeObj.futureHiring,
        NameOnBankAccount: employeeObj.NameOnBankAccount,
        BankAccountNumber: employeeObj.BankAccountNumber,
        BankAccountIFSCCode: employeeObj.BankAccountIFSCCode,
        BankName: employeeObj.BankName,
        salary: employeeObj.salary,
        incrementcycle: employeeObj.incrementcycle,
        IncrementAmount: employeeObj.IncrementAmount,
        incrementMonth: employeeObj.incrementMonth,
        salarySlips: (employeeObj.salarySlips || []).map(slip => ({
          month: slip.month,
          fileUrl: processUrl(slip.fileUrl),
          uploadedAt: slip.uploadedAt,
          remarks: slip.remarks,
          _id: slip._id
        })),

        documents: (employeeObj.documents || []).map(doc => ({
          documentType: doc.documentType,
          documentUrl: processUrl(doc.documentUrl),
          uploadedAt: doc.uploadedAt,
          remarks: doc.remarks,
          _id: doc._id
        })),
      };
    });

    res.status(200).json({
      success: true,
      data: employeesWithFullImageUrls
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};



// export const fetchAllEmployee = async (req, res) => {
//   try {
//     // Fetch all Employees but exclude the password field
//     // const employees = await Employee.find().select('-password -__v'); 
//     const employees = await Employee.find({ type: 2 }).select('-password -__v');
//     // Construct the full URL for image paths
//     const fullUrl = req.protocol + '://' + req.get('host');

//     // Map through employees to add full URL to image paths
//     const employeesWithFullImageUrls = employees.map(employee => {
//       const employeeObj = employee.toObject();
//       if (employeeObj.image) {
//         employeeObj.image = `${fullUrl}${employeeObj.image}`;
//       }
//       // Return only the needed fields
//       return {
//         _id: employeeObj._id,
//         name: employeeObj.name,
//         email: employeeObj.email,
//         position: employeeObj.position,
//         department: employeeObj.department,
//         joiningDate: employeeObj.joiningDate,
//         jobRole: employeeObj.jobRole,
//         dob: employeeObj.dob,
//         address: employeeObj.address,
//         phone: employeeObj.phone,
//         city: employeeObj.city,
//         pincode: employeeObj.pincode,
//         type: employeeObj.type,
//         state: employeeObj.state,
//         country: employeeObj.country,
//         status: employeeObj.status,
//         image: employeeObj.image,
//         gender: employeeObj.gender,
//         createdAt: employeeObj.createdAt,
//         updatedAt: employeeObj.updatedAt
//       };
//     });

//     res.status(200).json({ 
//       success: true, 
//       data: employeesWithFullImageUrls 
//     });
//   } catch (error) {
//     res.status(400).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// };

export const detailEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id); // Fetch Employee by ID

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    res.status(200).json({ success: true, data: [employee] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
export const getAttendanceAndTasks = async (req, res) => {
  try {
    const { employeeId } = req.params; // Assuming employeeId is passed as a URL parameter

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Fetch attendance records for the employee
    const attendanceRecords = await Attendance.find({ employeeId }).populate('employeeId', 'name');

    // Fetch task details for the employee
    const taskRecords = await Task.find({ employeeId }).populate('employeeId', 'name');

    if (!attendanceRecords.length && !taskRecords.length) {
      return res.status(404).json({ message: 'No records found for the given employee ID' });
    }

    res.status(200).json({
      attendance: attendanceRecords,
      tasks: taskRecords
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedEmployee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    res.status(200).json({ success: true, data: [updatedEmployee] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete Employee by ID
// export const deleteEmployee = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedEmployee = await Employee.findByIdAndDelete(id);

//     if (!deletedEmployee) {
//       return res.status(404).json({ error: "Employee not found" });
//     }

//     res.status(200).json({ message: "Employee deleted successfully" });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { status: "0" },
      { new: true } // This ensures the updated document is returned
    );

    if (!updatedEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json({ message: "Employee status has been Deactivated", employee: updatedEmployee });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// View Profile
export const viewProfile = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({
      employee: {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        address: employee.address,
        country: employee.country,
        phone: employee.phone,
        pincode: employee.pincode,
        state: employee.state,
        gender: employee.gender,
        city: employee.city,
        type: employee.type,
        status: employee.status,
        image: employee.image
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handle Base64 Image Function
const handleBase64Image = async (imageurl, employeeId) => {
  const matches = imageurl.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return { error: true, message: "Invalid base64 string" };
  }

  const imageType = matches[1];
  const imageBase64 = matches[2];
  const imageFileName = `${employeeId}_${Date.now()}.${imageType}`;
  const imagePath = path.join(uploadDir, imageFileName);

  try {
    fs.writeFileSync(imagePath, imageBase64, "base64");
  } catch (error) {
    return { error: true, message: "Failed to save image." };
  }

  const newImagePath = `${BASE_URL}${imageFileName}`;
  return { imagePath: newImagePath };
};



// Update Profile
// export const updateProfile = async (req, res) => {
//   try {
//     const employeeId = req.params.id;
//     const { name, department, dob, jobRole, joiningDate, email, address, country, phone, pincode, position, state, city, type, status, image, employeementStatus, gender } = req.body;

//     let newImagePath = null;

//     if (image) {
//       const result = await handleBase64Image(image, employeeId);
//       if (result.error) {
//         return res.status(400).json({ message: result.message });
//       }
//       newImagePath = result.imagePath;
//     }

//     const updatedEmployee = await Employee.findByIdAndUpdate(
//       employeeId,
//       {
//         name, email, department, dob, jobRole, address, country, phone,
//         pincode, state, city, type, status, position, employeementStatus, gender, joiningDate,
//         ...(newImagePath && { image: newImagePath })
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updatedEmployee) {
//       return res.status(404).json({ message: 'Employee not found' });
//     }

//     const fullUrl = req.protocol + '://' + req.get('host');
//     console.log(fullUrl)
//     const imageFullPath = updatedEmployee.image ? `${fullUrl}${updatedEmployee.image}` : null;

//     res.status(200).json({
//       message: 'Profile updated successfully',
//       employee: {
//         id: updatedEmployee._id,
//         name: updatedEmployee.name,
//         email: updatedEmployee.email,
//         address: updatedEmployee.address,
//         country: updatedEmployee.country,
//         pincode: updatedEmployee.pincode,
//         state: updatedEmployee.state,
//         phone: updatedEmployee.phone,
//         joiningDate: updatedEmployee.joiningDate,
//         jobRole: updatedEmployee.jobRole,
//         dob: updatedEmployee.dob,
//         department: updatedEmployee.department,
//         position: updatedEmployee.position,
//         city: updatedEmployee.city,
//         type: updatedEmployee.type,
//         gender: updatedEmployee.gender,
//         status: updatedEmployee.status,
//         image: imageFullPath
//       }
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// Change Password



export const updateProfile = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updateData = req.body;

    let newImagePath = null;
    if (updateData.image) {
      const result = await handleBase64Image(updateData.image, employeeId);
      if (result.error) {
        return res.status(400).json({ message: result.message });
      }
      newImagePath = result.imagePath;
      updateData.image = newImagePath;
    }

    if (!updateData.password) {
      delete updateData.password;
    }

    // Update only the fields provided in the request body
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const fullUrl = req.protocol + "://" + req.get("host");
    const imageFullPath = updatedEmployee.image
      ? `${fullUrl}${updatedEmployee.image}`
      : null;

    res.status(200).json({
      message: "Profile updated successfully",
      employee: {
        id: updatedEmployee._id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        address: updatedEmployee.address,
        country: updatedEmployee.country,
        pincode: updatedEmployee.pincode,
        state: updatedEmployee.state,
        phone: updatedEmployee.phone,
        joiningDate: updatedEmployee.joiningDate,
        jobRole: updatedEmployee.jobRole,
        dob: updatedEmployee.dob,
        department: updatedEmployee.department,
        position: updatedEmployee.position,
        city: updatedEmployee.city,
        type: updatedEmployee.type,
        gender: updatedEmployee.gender,
        status: updatedEmployee.status,
        image: imageFullPath,
        NameOnBankAccount: updatedEmployee.NameOnBankAccount,
        BankAccountNumber: updatedEmployee.BankAccountNumber,
        BankAccountIFSCCode: updatedEmployee.BankAccountIFSCCode,
        BankName: updatedEmployee.BankName,
        salary: updatedEmployee.salary,
        incrementcycle: updatedEmployee.incrementcycle,
        IncrementAmount: updatedEmployee.IncrementAmount,
        incrementMonth: updatedEmployee.incrementMonth,
        comments: updatedEmployee.comments,
        futureHiring: updatedEmployee.futureHiring,
        reason: updatedEmployee.reason,
        status: updatedEmployee.status,
        lastWorkingDay: updatedEmployee.lastWorkingDay,
        duesStatus: updatedEmployee.duesStatus,
        lastDuePayDate: updatedEmployee.lastDuePayDate,

      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const changePassword = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    const employee = await Employee.findById(employeeId);

    if (!employee || !(await bcrypt.compare(currentPassword, employee.password))) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;
    await employee.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Route handler for uploading profile image
export const uploadProfileImage = upload.single('image');




export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    employee.resetPasswordToken = resetToken;
    employee.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await employee.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/password-reset/${resetToken}`;

    // Email message
    const message = `You requested a password reset. Click on this link to reset your password: \n\n ${resetUrl} \n\nIf you didn't request this, please ignore.`;

    await sendEmail({
      email: employee.email,
      subject: "Password Reset Request",
      message,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending email" });
  }
};



export const resetPassword = async (req, res) => {
  const resetPasswordToken = req.params.token;

  try {
    const employee = await Employee.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!employee) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    employee.password = req.body.password;
    employee.resetPasswordToken = undefined;
    employee.resetPasswordExpire = undefined;

    await employee.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password" });
  }
};





const sendResetEmail = async (email, resetCode) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 20000, // 20 seconds
    greetingTimeout: 10000,   // 10 seconds
    socketTimeout: 20000,     // 20 seconds
    tls: {
      rejectUnauthorized: false, // Helpful for some servers, but use cautiously
    },
  });

  const mailOptions = {
    from: `"CyberPulse" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Password Reset Code",
    html: `
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; font-family: Arial, sans-serif; border: 1px solid #ddd;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="text-align: center;">You requested to reset your password. Use the following code:</p>
        <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 10px 0; text-align: center; background-color: #fff; border: 1px solid #ccc; width: 60%; margin: 10px auto;">
          ${resetCode}
        </div>
        <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">This code is valid for 1 hour. If you did not request this, please ignore this email.</p>
        <p style="text-align: center; font-size: 12px; color: #aaa;">© ${new Date().getFullYear()} CyberPulse. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Request reset password endpoint
export const requestResetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    employee.resetPasswordToken = resetCode;
    employee.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await employee.save();

    await sendResetEmail(email, resetCode); // No Promise.race, let it complete or fail
    res.status(200).json({
      message: "A 4-digit reset code has been sent to your email.",
    });
  } catch (error) {
    console.error("Error in requestResetPassword:", error);
    if (error.message.includes("Email sending failed")) {
      return res.status(500).json({
        message: "Failed to send email. Please try again or contact support.",
        error: error.message,
      });
    }
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Verify reset code and change password (unchanged for now)
export const verifyResetCodeAndChangePassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const employee = await Employee.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!employee) {
      return res.status(400).json({ message: "Invalid or expired reset code." });
    }

    const isMatch = await bcrypt.compare(newPassword, employee.password);
    if (isMatch) {
      return res.status(400).json({
        message: "New password cannot be the same as the current password. Choose a different one.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(newPassword, salt);
    employee.resetPasswordToken = undefined;
    employee.resetPasswordExpire = undefined;
    await employee.save();

    res.status(200).json({ message: "Password updated successfully. You can now log in." });
  } catch (error) {
    console.error("Error verifying code and changing password:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};




//slary slip controller
export const sendSalarySlip = async (req, res) => {
  const { email, employeeName, month, fileUrl } = req.body;

  // Validate input
  if (!email || !employeeName || !month || !fileUrl) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  console.log('Sending salary slip:', { email, employeeName, month, fileUrl });

  try {

    const emailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
    });

    res.status(200).json({
      success: true,
      message: 'Processing salary slip email. It will be delivered shortly.'
    });


    const emailOptions = {
      from: `"HR Department" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Salary Slip for ${month}`,
      html: `
        <p>Dear ${employeeName},</p>
        <p>Please find attached your salary slip for <strong>${month}</strong>.</p>
        <p>Best regards,<br>HR Department</p>
      `,
      attachments: [
        {
          filename: `SalarySlip-${employeeName}-${month}.pdf`,
          path: fileUrl,
          contentType: 'application/pdf'
        },
      ]
    };


    try {
      const info = await emailTransporter.sendMail(emailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (emailError) {
      console.error('Error in background email sending:', emailError);
    }

  } catch (error) {
    console.error('Error in initial setup of email sending:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to set up email sending: ' + error.message
    });
  }
};





export const deleteEmployeeAccount = async (req, res) => {
  try {
    const employeeId = req.body?.data?.employeeId;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    employee.status = "0";
    await employee.save();

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
