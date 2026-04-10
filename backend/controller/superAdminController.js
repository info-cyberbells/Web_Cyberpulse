import Organization from '../model/organizationModel.js';
import Employee from '../model/employeeModel.js';
import Attendance from '../model/AttendanceModel.js';
import mongoose from 'mongoose';

// GET /api/superadmin/organizations
// Returns all organizations with employee count and today's active attendance count
export const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({}).lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orgsWithStats = await Promise.all(
      organizations.map(async (org) => {
        const orgId = org._id;

        const employeeCount = await Employee.countDocuments({
          organizationId: orgId,
          status: '1',
        });

        const todayAttendanceCount = await Attendance.countDocuments({
          organizationId: orgId,
          date: { $gte: today, $lt: tomorrow },
        });

        return {
          ...org,
          employeeCount,
          todayAttendanceCount,
        };
      })
    );

    res.status(200).json({ success: true, organizations: orgsWithStats });
  } catch (error) {
    console.error('SuperAdmin getAllOrganizations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/superadmin/organizations/:orgId/employees
// Returns all active employees of a specific organization
export const getOrgEmployees = async (req, res) => {
  try {
    const { orgId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({ success: false, message: 'Invalid organization ID' });
    }

    const org = await Organization.findById(orgId).lean();
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    const employees = await Employee.find(
      { organizationId: orgId, status: '1' },
      'name email department position jobRole type joiningDate image gender'
    ).lean();

    res.status(200).json({ success: true, organization: org, employees });
  } catch (error) {
    console.error('SuperAdmin getOrgEmployees error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/superadmin/organizations/:orgId/attendance?date=YYYY-MM-DD
// Returns today's (or given date's) attendance for a specific organization
export const getOrgAttendance = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({ success: false, message: 'Invalid organization ID' });
    }

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const attendanceRecords = await Attendance.find({
      organizationId: orgId,
      date: { $gte: targetDate, $lt: nextDay },
    })
      .populate('employeeId', 'name email department position image gender')
      .lean();

    res.status(200).json({ success: true, attendance: attendanceRecords });
  } catch (error) {
    console.error('SuperAdmin getOrgAttendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
