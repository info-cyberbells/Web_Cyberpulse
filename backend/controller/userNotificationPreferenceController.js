import UserNotificationPreference from "../model/UserNotificationPreferenceModel.js";

// GET /api/notification-preferences
export const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    let prefs = await UserNotificationPreference.findOne({ userId });

    if (!prefs) {
      // Create default preferences (all enabled)
      prefs = await UserNotificationPreference.create({ userId });
    }

    res.status(200).json({ success: true, data: prefs });
  } catch (error) {
    console.error("Error fetching user notification preferences:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PUT /api/notification-preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences, pushEnabled } = req.body;

    const updateData = {};
    if (preferences !== undefined) updateData.preferences = preferences;
    if (pushEnabled !== undefined) updateData.pushEnabled = pushEnabled;

    const prefs = await UserNotificationPreference.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: prefs });
  } catch (error) {
    console.error("Error updating user notification preferences:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
