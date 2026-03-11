import Notification from "../model/NotificationModel.js";
import NotificationSettings from "../model/NotificationSettingsModel.js";
import Employee from "../model/employeeModel.js";

// GET /api/notifications?page=1&limit=50
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("triggeredBy", "name email image")
        .lean(),
      Notification.countDocuments({ recipient: userId }),
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, error: "Notification not found" });
    }
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/notifications/mark-all-read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
    res
      .status(200)
      .json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/notifications/settings
export const getNotificationSettings = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select(
      "organizationId"
    );
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    let settings = await NotificationSettings.findOne({
      organizationId: employee.organizationId,
    });

    if (!settings) {
      // Return defaults
      settings = {
        organizationId: employee.organizationId,
        clock_in: true,
        clock_out: true,
        leave_request: true,
        wfh_credit_request: true,
      };
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/notifications/settings
export const updateNotificationSettings = async (req, res) => {
  try {
    // Only Admin(1), HR(4), Manager(5) can update settings
    if (![1, 4, 5].includes(req.user.type)) {
      return res
        .status(403)
        .json({ success: false, error: "Not authorized" });
    }

    const employee = await Employee.findById(req.user.id).select(
      "organizationId"
    );
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    const allowedFields = [
      "clock_in",
      "clock_out",
      "leave_request",
      "wfh_credit_request",
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (typeof req.body[field] === "boolean") {
        updates[field] = req.body[field];
      }
    }

    const settings = await NotificationSettings.findOneAndUpdate(
      { organizationId: employee.organizationId },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
