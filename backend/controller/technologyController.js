import Technology from '../model/technologyModel.js';
import mongoose from 'mongoose';

export const addTechnology = async (req, res) => {
  try {
    const { name, description, organizationId } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Technology name is required" });
    }

    if (organizationId && !mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({ success: false, error: "Invalid organizationId" });
    }

    const newTechnology = new Technology({
      name,
      description,
      ...(organizationId && { organizationId }),
    });

    const savedTechnology = await newTechnology.save();

    res.status(201).json({
      success: true,
      data: [
        {
          _id: savedTechnology._id,
          name: savedTechnology.name,
          description: savedTechnology.description,
          organizationId: savedTechnology.organizationId || null,
        },
      ],
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


export const fetchAllTechnology = async (req, res) => {
  try {
    const { organizationId } = req.query;
    const query = {};

    if (organizationId) {
      if (!mongoose.Types.ObjectId.isValid(organizationId)) {
        return res.status(400).json({ success: false, error: "Invalid organizationId" });
      }
      query.organizationId = organizationId;
    }

    const technologies = await Technology.find(query).select('name description organizationId');
    res.status(200).json({ success: true, data: technologies });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


export const detailTechnology = async (req, res) => {
  try {
    const { id } = req.params;

    // Use a different variable name for the fetched technology
    const technology = await Technology.findById(id); // Fetch Technology by ID

    if (!technology) {
      return res.status(404).json({ success: false, error: 'Technology not found' });
    }

    res.status(200).json({ success: true, data: [technology] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


export const updateTechnology = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const updatedTechnology = await Technology.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    if (!updatedTechnology) {
      return res.status(404).json({ success: false, error: 'Technology not found' });
    }

    res.status(200).json({ success: true, data: [updatedTechnology] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};



// Delete Technology by ID
export const deleteTechnology = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTechnology = await Technology.findByIdAndDelete(id);

    if (!deletedTechnology) {
      return res.status(404).json({ error: 'Technology not found' });
    }

    res.status(200).json({ message: 'Technology deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


