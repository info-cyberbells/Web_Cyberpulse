// import mongoose from 'mongoose';
// import Employee from '../model/employeeModel.js';
// import multer from 'multer';
// import path from 'path';

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/documents');
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const filetypes = /pdf|jpg|jpeg|png/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);
//     if (extname && mimetype) {
//       return cb(null, true);
//     }
//     cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed!'));
//   }
// }).single('document');

// // Function to convert Windows backslash paths to forward slash paths and ensure lowercase 'uploads'
// const formatPath = (filePath) => {
//   if (!filePath) return filePath;
//   // Replace backslashes with forward slashes, ensure it starts with /, and convert Uploads to lowercase
//   return '/' + filePath.replace(/\\/g, '/').replace(/^Uploads\//i, 'uploads/');
// };

// export const uploadDocument = async (req, res) => {
//   try {
//     upload(req, res, async (err) => {
//       if (err instanceof multer.MulterError) {
//         console.log('MulterError:', err);
//         return res.status(400).json({ message: 'File upload error: ' + err.message });
//       } else if (err) {
//         console.log('Other error:', err);
//         return res.status(400).json({ message: err.message });
//       }

//       const { employeeId, documentType, remarks } = req.body;

//       if (!employeeId || !documentType) {
//         return res.status(400).json({ message: 'employeeId and documentType are required' });
//       }

//       if (!mongoose.Types.ObjectId.isValid(employeeId)) {
//         return res.status(400).json({ message: 'Invalid employeeId' });
//       }

//       const employee = await Employee.findById(employeeId);
//       if (!employee) {
//         return res.status(404).json({ message: 'Employee not found' });
//       }

//       const documentUpdate = {
//         documentType,
//         remarks: remarks || '',
//         uploadedAt: new Date(),
//       };

//       if (req.file) {
//         // Format the path with forward slashes and add leading slash
//         documentUpdate.documentUrl = formatPath(req.file.path);
//       }

//       const documentIndex = employee.documents.findIndex(doc => doc.documentType === documentType);
//       if (documentIndex >= 0) {
//         employee.documents[documentIndex] = { ...employee.documents[documentIndex], ...documentUpdate };
//       } else {
//         employee.documents.push(documentUpdate);
//       }

//       await employee.save();

//       // Create a clean document object for the response without MongoDB internals
//       const responseDocument = {
//         _id: employee.documents[documentIndex >= 0 ? documentIndex : employee.documents.length - 1]._id,
//         documentType,
//         documentUrl: documentUpdate.documentUrl,
//         remarks: documentUpdate.remarks,
//         uploadedAt: documentUpdate.uploadedAt
//       };

//       res.status(200).json({
//         success: true,
//         message: 'Document updated successfully',
//         document: responseDocument
//       });
//     });
//   } catch (error) {
//     console.error('Server error:', error);
//     res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//   }
// };



// export const getEmployeeDocuments = async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(employeeId)) {
//       return res.status(400).json({ message: 'Invalid employeeId' });
//     }

//     const employee = await Employee.findById(employeeId);
//     if (!employee) {
//       return res.status(404).json({ message: 'Employee not found' });
//     }

//     const BASE_URL = `${req.protocol}://${req.get('host')}`;

//     const documentsWithFullUrl = (employee.documents || []).map(doc => ({
//       ...doc._doc,
//       documentUrl: doc.documentUrl ? `${BASE_URL}${doc.documentUrl}` : null,
//     }));

//     res.status(200).json({
//       success: true,
//       documents: documentsWithFullUrl,
//     });
//   } catch (error) {
//     console.error('Server error:', error);
//     res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//   }
// };


import mongoose from 'mongoose';
import Employee from '../model/employeeModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};
ensureDir('uploads/documents');
ensureDir('uploads/salarySlips');

// Multer storage configuration for documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Multer storage configuration for salary slips
const salarySlipStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/salarySlips');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Multer upload configuration for documents
const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file || !file.originalname) {
      return cb(new Error('No file provided or invalid file'));
    }
    const filetypes = /pdf|jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed!'));
  },
}).single('document');

// Multer upload configuration for salary slips
const salarySlipUpload = multer({
  storage: salarySlipStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file || !file.originalname) {
      return cb(new Error('No file provided or invalid file'));
    }
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PDF files are allowed!'));
  },
}).single('salarySlip');


const formatPath = (filePath) => {
  if (!filePath) return filePath;
  return '/' + filePath.replace(/\\/g, '/').replace(/^Uploads\//i, 'uploads/');
};


export const uploadDocument = async (req, res) => {
  try {
    documentUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.log('MulterError:', err);
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      } else if (err) {
        console.log('Other error:', err);
        return res.status(400).json({ message: err.message });
      }

      const { employeeId, documentType, remarks } = req.body;

      if (!employeeId || !documentType) {
        return res.status(400).json({ message: 'employeeId and documentType are required' });
      }

      if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        return res.status(400).json({ message: 'Invalid employeeId' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'File is required' });
      }

      try {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
          return res.status(404).json({ message: 'Employee not found' });
        }

        const documentUpdate = {
          documentType,
          remarks: remarks || '',
          uploadedAt: new Date(),
        };

        if (req.file) {
          documentUpdate.documentUrl = formatPath(req.file.path);
        }

        const documentIndex = employee.documents.findIndex(doc => doc.documentType === documentType);
        if (documentIndex >= 0) {
          employee.documents[documentIndex] = { ...employee.documents[documentIndex], ...documentUpdate };
        } else {
          employee.documents.push(documentUpdate);
        }

        await employee.save();

        const responseDocument = {
          _id: employee.documents[documentIndex >= 0 ? documentIndex : employee.documents.length - 1]._id,
          documentType,
          documentUrl: documentUpdate.documentUrl,
          remarks: documentUpdate.remarks,
          uploadedAt: documentUpdate.uploadedAt,
        };

        res.status(200).json({
          success: true,
          message: 'Document updated successfully',
          document: responseDocument,
        });
      } catch (saveError) {
        console.error('Database error:', saveError);
        if (saveError.name === 'ValidationError') {
          return res.status(400).json({
            success: false,
            message: 'Validation error: ' + Object.values(saveError.errors).map(err => err.message).join(', ')
          });
        }
        return res.status(500).json({
          success: false,
          message: 'Database error: ' + saveError.message
        });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};


export const uploadSalarySlip = async (req, res) => {
  try {
    salarySlipUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.log('MulterError:', err);
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      } else if (err) {
        console.log('Other error:', err);
        return res.status(400).json({ message: err.message });
      }

      const { employeeId } = req.params;
      const { month, remarks, salarySlipId } = req.body;

      // Validate required fields
      if (!employeeId || (!month && !salarySlipId)) {
        return res.status(400).json({ message: 'employeeId and either month or salarySlipId are required' });
      }

      if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        return res.status(400).json({ message: 'Invalid employeeId' });
      }

      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ message: 'Salary slip file is required' });
      }

      // Find the employee
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      let salarySlip;
      if (salarySlipId) {
        salarySlip = employee.salarySlips.id(salarySlipId);
        if (!salarySlip) {
          return res.status(404).json({ message: 'Salary slip not found' });
        }
      } else {
        salarySlip = employee.salarySlips.find((slip) => slip.month === month);
      }

      if (!salarySlip) {
        salarySlip = {
          month: month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          remarks: remarks || '',
          uploadedAt: new Date(),
          fileUrl: formatPath(req.file.path), 
        };
        employee.salarySlips.push(salarySlip);
      } else {
        const salarySlipUpdate = {
          month: month || salarySlip.month,
          remarks: remarks !== undefined ? remarks : salarySlip.remarks,
          uploadedAt: new Date(),
          fileUrl: req.file ? formatPath(req.file.path) : salarySlip.fileUrl, 
        };
        Object.assign(salarySlip, salarySlipUpdate);
      }

      await employee.save();
      const responseSalarySlip = {
        _id: salarySlip._id,
        month: salarySlip.month,
        fileUrl: salarySlip.fileUrl,
        remarks: salarySlip.remarks,
        uploadedAt: salarySlip.uploadedAt,
      };

      res.status(200).json({
        success: true,
        message: salarySlip._id ? 'Salary slip updated successfully' : 'Salary slip created successfully',
        salarySlip: responseSalarySlip,
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};



export const getEmployeeDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'Invalid employeeId' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const BASE_URL = `${req.protocol}://${req.get('host')}`;

    const documentsWithFullUrl = (employee.documents || []).map(doc => ({
      ...doc._doc,
      documentUrl: doc.documentUrl ? `${BASE_URL}${doc.documentUrl}` : null,
    }));

    res.status(200).json({
      success: true,
      documents: documentsWithFullUrl,
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
