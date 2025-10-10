import Status from '../model/statusModel.js';

export const addStatus = async (req, res) => {
  try {
    const { status_name } = req.body;

    // Create a new Status
    const newStatus = new Status({
      status_name,
    });

    // Save the Status to the database
    const savedStatus = await newStatus.save();

    // Create a response object without sensitive information (if needed)
    const StatusWithoutSensitiveInfo = {
      _id: savedStatus._id,
      status_name: savedStatus.status_name,
    };

    // Send a success response
    res.status(201).json({ success: true, data: [StatusWithoutSensitiveInfo] });
  } catch (error) {
    // Handle any errors
    res.status(400).json({ success: false, error: error.message });
  }
};


export const fetchAllStatus = async (req, res) => {
  try {
    const statuses = await Status.find(); // Fetch all statuses
    res.status(200).json({ success: true, data: statuses });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

  

  
export const detailStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Rename the variable to avoid conflict with the Status model
    const status = await Status.findById(id); // Fetch status by ID

    if (!status) {
      return res.status(404).json({ success: false, error: 'Status not found' });
    }

    res.status(200).json({ success: true, data: [status] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};



export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const updatedStatus = await Status.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    if (!updatedStatus) {
      return res.status(404).json({ success: false, error: 'Status not found' });
    }

    res.status(200).json({ success: true, data: [updatedStatus] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};



  // Delete Status by ID
export const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStatus = await Status.findByIdAndDelete(id);

    if (!deletedStatus) {
      return res.status(404).json({ error: 'Status not found' });
    }

    res.status(200).json({ message: 'Status deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

  
