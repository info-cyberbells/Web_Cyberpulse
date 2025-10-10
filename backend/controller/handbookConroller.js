import mongoose from 'mongoose';
import Handbook from '../model/handbookModel.js';
import Employee from '../model/employeeModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure directory for handbooks
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};
ensureDir('uploads/handbooks');

// Multer storage configuration for handbooks
const handbookStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/handbooks');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Multer upload configuration for handbooks
const handbookUpload = multer({
  storage: handbookStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file || !file.originalname) {
      return cb(new Error('No file provided or invalid file'));
    }
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
  },
}).single('handbookFile');

// Function to format file paths
const formatPath = (filePath) => {
  if (!filePath) return filePath;
  return '/' + filePath.replace(/\\/g, '/').replace(/^Uploads\//i, 'uploads/');
};

// Controller to upload a handbook
export const uploadHandbook = async (req, res) => {

  try {
    handbookUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.log('MulterError:', err);
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      } else if (err) {
        console.log('Other error:', err);
        return res.status(400).json({ message: err.message });
      }

      const { title, content, uploadedBy, visibleTo, organizationId } = req.body;

      // Validate required fields
      if (!title || !content || !uploadedBy) {
        return res.status(400).json({ message: 'title, content, uploadedBy are required' });
      }

      if (!mongoose.Types.ObjectId.isValid(uploadedBy)) {
        return res.status(400).json({ message: 'Invalid uploadedBy ID' });
      }

      // Validate visibleTo if provided
      let visibleToArray = [];
      if (visibleTo) {
        try {
          visibleToArray = Array.isArray(visibleTo) ? visibleTo : JSON.parse(visibleTo);
          if (!visibleToArray.every(id => mongoose.Types.ObjectId.isValid(id))) {
            return res.status(400).json({ message: 'Invalid employee ID in visibleTo array' });
          }
        } catch (error) {
          return res.status(400).json({ message: 'Invalid visibleTo format' });
        }
      }

      // Check if the uploader exists
      const uploader = await Employee.findById(uploadedBy);
      if (!uploader) {
        return res.status(404).json({ message: 'Uploader employee not found' });
      }

      // Create new handbook
      const handbookData = {
        title,
        content,
        uploadedBy,
        // department,
        visibleTo: visibleToArray,
      };
      if (organizationId && mongoose.Types.ObjectId.isValid(organizationId)) {
        handbookData.organizationId = organizationId;
      }

      console.log("handbook data", handbookData);

      if (req.file) {
        handbookData.fileUrl = formatPath(req.file.path);
      }

      const handbook = new Handbook(handbookData);
      await handbook.save();

      // Populate uploadedBy and visibleTo fields for response
      await handbook.populate('uploadedBy', 'name email');
      await handbook.populate('visibleTo', 'name email');

      res.status(200).json({
        success: true,
        message: 'Handbook created successfully',
        handbook: {
          _id: handbook._id,
          title: handbook.title,
          content: handbook.content,
          fileUrl: handbook.fileUrl,
          uploadedBy: handbook.uploadedBy,
          //   department: handbook.department,
          visibleTo: handbook.visibleTo,
          createdAt: handbook.createdAt,
          updatedAt: handbook.updatedAt,
        },
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};


export const getHandbooks = async (req, res) => {
  try {
    const { department, employeeId, organizationId } = req.query;


    if (employeeId && !mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'Invalid employeeId' });
    }

    const query = {};
    if (employeeId) query.visibleTo = employeeId;
    if (organizationId) query.organizationId = organizationId;
    
    const handbooks = await Handbook.find(query)
      .populate('uploadedBy', 'name email')
      .populate('visibleTo', 'name email');

    if (!handbooks || handbooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No handbooks found',
      });
    }


    const BASE_URL = `${req.protocol}://${req.get('host')}`;

    const handbooksWithFullUrl = handbooks.map(handbook => ({
      _id: handbook._id,
      title: handbook.title,
      content: handbook.content,
      fileUrl: handbook.fileUrl ? `${BASE_URL}${handbook.fileUrl}` : null,
      uploadedBy: handbook.uploadedBy,
      //   department: handbook.department,
      visibleTo: handbook.visibleTo,
      createdAt: handbook.createdAt,
      updatedAt: handbook.updatedAt,
    }));

    res.status(200).json({
      success: true,
      handbooks: handbooksWithFullUrl,
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};




export const deleteHandbook = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid handbook ID' });
    }

    // Validate if handbook exists before attempting to delete
    const handbook = await Handbook.findById(id);
    if (!handbook) {
      return res.status(404).json({ message: 'Handbook not found' });
    }

    // Delete the database record
    await Handbook.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Handbook deleted successfully' });

  } catch (error) {
    console.error('Error deleting handbook:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};