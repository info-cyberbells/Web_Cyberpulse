import HelpDesk from '../model/helpDeskModel.js';

export const addHelpDesk = async (req, res) => {
  try {
    const { type, description, employeeId, anonymous, organizationId } = req.body;

    if (!type || !description) {
      return res.status(400).json({ message: 'Type and description are required' });
    }

    const newRecord = new HelpDesk({
      type,
      description,
      employeeId: anonymous ? undefined : employeeId,
      anonymous: anonymous || false,
      organizationId,
    });

    await newRecord.save();
    res.status(201).json({
      message: 'Ticket created successfully',
      data: newRecord,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const fetchAllComplaintsAndHelpDesk = async (req, res) => {
  try {
    const { type, status, ticketId, employeeId, organizationId } = {
      ...req.query,
      ...req.body,
    };

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (ticketId) query.ticketId = ticketId;
    if (employeeId) query.employeeId = employeeId;
    if (organizationId) query.organizationId = organizationId;

    const records = await HelpDesk.find(query)
      .populate({
        path: 'employeeId',
        select: 'name _id',
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!records || records.length === 0) {
      return res.status(404).json({ message: 'No records found' });
    }

    const modifiedRecords = records.map((record) => {
      if (record.anonymous) {
        return {
          ...record,
          employeeId: [],
        };
      }
      return record;
    });

    res.status(200).json({ data: modifiedRecords });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update the status of a specific ticket by ticketId
export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    // Validate status options
    if (!['pending', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided' });
    }

    const record = await HelpDesk.findOneAndUpdate(
      { ticketId },
      { status },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(200).json({
      message: 'Ticket status updated successfully',
      data: record,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};