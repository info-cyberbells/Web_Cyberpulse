import Holiday from '../model/holidayModel.js';
import moment from 'moment-timezone';

const TIMEZONE = 'Asia/Kolkata';

// Add a new holiday
export const addHoliday = async (req, res) => {
  try {
    const { name, date, type, createdBy, updatedBy, dayOfWeek, organizationId } = req.body;

    // Adjust the date to your timezone before checking and saving
    const adjustedDate = moment.tz(date, TIMEZONE).format('YYYY-MM-DD');

    // Check if a holiday with the same date already exists
    const existingHoliday = await Holiday.findOne({
      date: { $gte: `${adjustedDate}T00:00:00.000Z`, $lt: `${adjustedDate}T23:59:59.999Z` },
    });

    if (existingHoliday) {
      return res.status(400).json({
        message: `A holiday already exists on the date: ${adjustedDate}`,
      });
    }

    const now = moment.tz(TIMEZONE).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    const newHoliday = new Holiday({
      name,
      date: adjustedDate,
      type,
      createdBy,
      dayOfWeek,
      organizationId,
      updatedBy,
      createdAt: now,
      updatedAt: now,
    });

    await newHoliday.save();

    // Populate createdBy and updatedBy fields with names
    const populatedHoliday = await Holiday.findById(newHoliday._id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    res.status(201).json({
      message: 'Holiday created successfully',
      holiday: populatedHoliday,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all holidays
export const fetchAllHolidays = async (req, res) => {
  try {
    const { organizationId } = req.query;

    const filter = {};
    if (organizationId) {
      filter.organizationId = organizationId;
    }

    const holidays = await Holiday.find(filter)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ date: 1 });

    const adjustedHolidays = holidays.map(holiday => ({
      ...holiday.toObject(),
      createdAt: moment(holiday.createdAt).tz(TIMEZONE).format(),
      updatedAt: moment(holiday.updatedAt).tz(TIMEZONE).format(),
    }));

    res.status(200).json(adjustedHolidays);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get holiday by ID
export const getHolidayById = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findById(id)
      .populate('createdBy', 'name') // Fetch only the 'name' field from the User model
      .populate('updatedBy', 'name'); // Fetch only the 'name' field from the User model

    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    const adjustedHoliday = {
      ...holiday.toObject(),
      createdAt: moment(holiday.createdAt).tz(TIMEZONE).format(),
      updatedAt: moment(holiday.updatedAt).tz(TIMEZONE).format()
    };

    res.status(200).json(adjustedHoliday);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a holiday
export const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if a new date is provided in the updates
    if (updates.date) {
      const adjustedDate = moment.tz(updates.date, TIMEZONE).format('YYYY-MM-DD');

      // Check if the new date conflicts with another holiday
      const conflictingHoliday = await Holiday.findOne({
        date: { $gte: `${adjustedDate}T00:00:00.000Z`, $lt: `${adjustedDate}T23:59:59.999Z` },
        _id: { $ne: id }, // Exclude the current holiday being updated
      });

      if (conflictingHoliday) {
        return res.status(400).json({
          message: `A holiday already exists on the date: ${adjustedDate}`,
        });
      }

      // Adjust the date for saving
      updates.date = moment.tz(updates.date, TIMEZONE).toDate();
    }

    // Update the updatedAt timestamp
    updates.updatedAt = moment.tz(TIMEZONE).toDate();

    // Perform the update
    const updatedHoliday = await Holiday.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedHoliday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    // Populate createdBy and updatedBy fields with names
    const populatedHoliday = await Holiday.findById(updatedHoliday._id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    res.status(200).json({
      message: 'Holiday updated successfully',
      holiday: populatedHoliday,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Delete a holiday
export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedHoliday = await Holiday.findByIdAndDelete(id);

    if (!deletedHoliday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    res.status(200).json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
