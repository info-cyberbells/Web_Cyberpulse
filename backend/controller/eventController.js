import Event from "../model/eventModel.js";

// Create an Event
export const addEvent = async (req, res) => {
  const { organizationId } = req.body;
  try {
    const {
      title,
      description,
      eventType,
      eventDate,
      createdBy,
      startTime,
      endTime,
      teamMembers,
      location,
      status,
      priority,
      type
    } = req.body;

    // Validate teamMembers array
    if (teamMembers && !Array.isArray(teamMembers)) {
      return res.status(400).json({
        success: false,
        error: "teamMembers must be an array of valid ObjectIDs.",
      });
    }

    const newEvent = new Event({
      title,
      description,
      startTime,
      endTime,
      eventType,
      eventDate,
      location,
      createdBy,
      teamMembers,
      organizationId,
      status,
      priority,
      type
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({ success: true, data: savedEvent });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Fetch All Events
export const fetchAllEvents = async (req, res) => {
  try {
    const filter = {};

    if (req.query.organizationId) {
      filter.organizationId = req.query.organizationId;
    }

    const events = await Event.find(filter).populate("teamMembers", "name email");


    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Fetch Event by ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id).populate("createdBy", "name email").populate("teamMembers", "name email");

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update an Event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete an Event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
