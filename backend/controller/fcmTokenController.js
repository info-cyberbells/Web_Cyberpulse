import FcmToken from "../model/FcmTokenModel.js";

// POST /api/fcm-token
export const registerToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token, device } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    await FcmToken.findOneAndUpdate(
      { userId, token },
      { userId, token, device: device || "web" },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: "FCM token registered" });
  } catch (error) {
    console.error("Error registering FCM token:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// DELETE /api/fcm-token
export const removeToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    await FcmToken.deleteOne({ userId, token });

    res.status(200).json({ success: true, message: "FCM token removed" });
  } catch (error) {
    console.error("Error removing FCM token:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// DELETE /api/fcm-token/all
export const removeAllTokens = async (req, res) => {
  try {
    const userId = req.user.id;

    await FcmToken.deleteMany({ userId });

    res.status(200).json({ success: true, message: "All FCM tokens removed" });
  } catch (error) {
    console.error("Error removing all FCM tokens:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
