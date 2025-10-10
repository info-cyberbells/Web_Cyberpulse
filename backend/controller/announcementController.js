import mongoose from 'mongoose';
import Organization from '../model/organizationModel.js';
import Announcement from '../model/announcementModel.js';
import Employee from "../model/employeeModel.js";

// Create Announcement
export const addAnnouncement = async (req, res) => {
  try {
    const { type, description, date, createdBy, organizationId } = req.body;

    if (!type || !description || !date) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    if (organizationId) {
      if (!mongoose.Types.ObjectId.isValid(organizationId)) {
        return res.status(400).json({ error: 'Invalid organizationId format' });
      }

      const orgExists = await Organization.findById(organizationId);
      if (!orgExists) {
        return res.status(400).json({ error: 'Organization not found' });
      }
    }

    const newAnnouncement = new Announcement({
      type,
      description,
      date,
      createdBy,
      ...(organizationId ? { organizationId } : {}),
    });

    const savedAnnouncement = await newAnnouncement.save();

    const responseAnnouncement = {
      _id: savedAnnouncement._id,
      type: savedAnnouncement.type,
      description: savedAnnouncement.description,
      date: savedAnnouncement.date,
      createdBy: savedAnnouncement.createdBy,
      ...(savedAnnouncement.organizationId ? { organizationId: savedAnnouncement.organizationId.toString() } : {}), // Include organizationId as string
      createdAt: savedAnnouncement.createdAt,
    };

    res.status(201).json({ message: 'Announcement created successfully', announcement: responseAnnouncement });
  } catch (error) {
    console.error('Error in addAnnouncement:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get All Announcements
export const fetchAllAnnouncements = async (req, res) => {
  try {
    const { organizationId } = req.query;

    if (organizationId && !mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({ success: false, error: 'Invalid organizationId format' });
    }

    const query = organizationId ? { organizationId: new mongoose.Types.ObjectId(organizationId) } : {};

    const announcements = await Announcement.find(query)
      .populate('createdBy', '_id name')
      .lean();

    if (!announcements || announcements.length === 0) {
      return res.status(404).json({ success: false, message: 'No announcements found' });
    }

    const formattedAnnouncements = announcements.map(announcement => ({
      _id: announcement._id,
      type: announcement.type,
      description: announcement.description,
      date: announcement.date,
      createdBy: announcement.createdBy ? {
        _id: announcement.createdBy._id,
        name: announcement.createdBy.name,
      } : null,
      ...(announcement.organizationId ? { organizationId: announcement.organizationId.toString() } : {}), 
      createdAt: announcement.createdAt,
    }));

    res.status(200).json({ success: true, data: formattedAnnouncements });
  } catch (error) {
    console.error('Error in fetchAllAnnouncements:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// Get Announcement by ID
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate('createdBy', 'name');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json({ announcement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { type, description, date } = req.body;

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { type, description, date },
      { new: true, runValidators: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json({ message: 'Announcement updated successfully', announcement: updatedAnnouncement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Delete Announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);

    if (!deletedAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getAllEmployeesBasicDetails = async (req, res) => {

  const organizationId = req.query.organizationId;

  try {
    // Get the base URL dynamically from the request
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    // Function to process image URLs
    const processImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      return `${baseUrl}${imagePath}`;
    };

    const filter = { status: { $ne: "0" } };

    if (organizationId) {
      filter.organizationId = organizationId;
    }

    const employees = await Employee.find(
      filter,
      "_id name dob joiningDate image"
    ).sort({ name: 1 });


    // Get current date
    const today = new Date();

    // Add base URL to image paths and conditionally include joiningDate
    const employeesWithFullUrls = employees.map(employee => {
      const employeeObj = employee.toObject();

      // Check if employee has completed at least 10 months
      let includeJoiningDate = true;

      if (employeeObj.joiningDate) {
        const joiningDate = new Date(employeeObj.joiningDate);
        const tenMonthsLater = new Date(joiningDate);
        tenMonthsLater.setMonth(joiningDate.getMonth() + 10);

        // If today is before the 10 months completion date, exclude joiningDate
        if (today < tenMonthsLater) {
          includeJoiningDate = false;
        }
      }

      const result = {
        ...employeeObj,
        image: processImageUrl(employeeObj.image)
      };

      // Remove joiningDate if employee hasn't completed 10 months
      if (!includeJoiningDate) {
        delete result.joiningDate;
      }

      return result;
    });

    res.status(200).json({
      success: true,
      data: employeesWithFullUrls
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};