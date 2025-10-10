import AdvanceSalary from '../model/salaryModel.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';


export const submitAdvanceSalaryRequest = async (req, res) => {
  try {
    const { employeeId, month, year, amount, reason, requestDate, organizationId } = req.body;

    if (!employeeId || !month || !year || !amount) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newRequest = new AdvanceSalary({
      employeeId,
      month,
      year,
      amount,
      reason,
      organizationId,
      requestDate
    });

    const savedRequest = await newRequest.save();

    return res.status(201).json({
      message: 'Request submitted successfully.',
      data: savedRequest
    });
  } catch (error) {
    console.error('Advance Salary Request Error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};


export const getUserAdvanceRequestsById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const requests = await AdvanceSalary.find({ employeeId: id })
      .populate('employeeId', 'name email')
      .sort({ createdAt: -1 });

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const formattedRequests = requests.map(request => ({
      ...request.toObject(),
      approvalImagePath: request.approvalImagePath
        ? `${baseUrl}${request.approvalImagePath}`
        : ''
    }));

    return res.status(200).json({ data: formattedRequests });
  } catch (error) {
    console.error('Get Advance Salary Requests Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const getAllAdvanceSalaryRequests = async (req, res) => {
  try {
    const { organizationId } = req.query;

    const query = {};
    if (organizationId) {
      query.organizationId = organizationId;
    }
    const requests = await AdvanceSalary.find(query)
      .populate('employeeId', 'name email')
      .sort({ createdAt: -1 });

    // Construct dynamic base URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const formattedRequests = requests.map(request => ({
      ...request.toObject(),
      approvalImagePath: request.approvalImagePath
        ? `${baseUrl}${request.approvalImagePath}`
        : ''
    }));

    return res.status(200).json({ data: formattedRequests });
  } catch (error) {
    console.error('Get All Advance Salary Requests Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const updateAdvanceSalaryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseNote, image } = req.body;

    console.log('Received ID:', id);
    console.log('Request body status:', status);
    console.log('Image data received:', image ? 'Yes' : 'No');

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected".' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID format.' });
    }

    const existingRequest = await AdvanceSalary.findById(id);
    console.log('Existing request:', existingRequest);

    if (!existingRequest) {
      return res.status(404).json({ message: 'Advance salary request not found.' });
    }

    const updateData = {
      status,
      responseNote: responseNote || '',
      updatedAt: new Date(),
    };


    if (status === 'approved' && image) {
      try {

        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
          return res.status(400).json({ message: 'Invalid image data format' });
        }


        const imageType = matches[1];
        const imageData = matches[2];


        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(imageType)) {
          return res.status(400).json({ message: 'Only JPEG, PNG, or GIF images are allowed.' });
        }


        let fileExtension;
        switch (imageType) {
          case 'image/jpeg': fileExtension = '.jpg'; break;
          case 'image/png': fileExtension = '.png'; break;
          case 'image/gif': fileExtension = '.gif'; break;
          default: fileExtension = '.jpg';
        }


        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = `${uniqueSuffix}${fileExtension}`;
        const uploadPath = path.join('uploads', 'salary', filename);
        const fullPath = path.join(process.cwd(), uploadPath);


        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }


        fs.writeFileSync(fullPath, Buffer.from(imageData, 'base64'));


        updateData.approvalImagePath = `/${uploadPath.replace(/\\/g, '/')}`;
      } catch (error) {
        console.error('Error processing image:', error);
        return res.status(400).json({ message: 'Error processing image', error: error.message });
      }
    }

    const updatedRequest = await AdvanceSalary.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('employeeId', 'name email');

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const formattedRequest = {
      ...updatedRequest.toObject(),
      approvalImagePath: updatedRequest.approvalImagePath
        ? `${baseUrl}${updatedRequest.approvalImagePath}`
        : ''
    };

    return res.status(200).json({ message: 'Status updated successfully.', data: formattedRequest });
  } catch (error) {
    console.error('Update Advance Salary Status Error:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};