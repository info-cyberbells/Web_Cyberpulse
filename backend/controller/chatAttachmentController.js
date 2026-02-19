import { CHAT_CONSTANTS } from '../utils/chatConstants.js';

export const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const file = req.file;
    const fileUrl = `/uploads/chat/${file.filename}`;

    // Determine type from mimetype
    let type = 'document';
    if (file.mimetype.startsWith('image/')) type = 'image';
    else if (file.mimetype.startsWith('video/')) type = 'video';
    else if (file.mimetype.startsWith('audio/')) type = 'audio';

    const attachment = {
      url: fileUrl,
      type,
      name: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };

    return res.status(200).json({ success: true, data: attachment });
  } catch (error) {
    console.error('uploadAttachment error:', error);
    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
};
