import OrganizationSettings from "../model/organizationSettingsModel.js";
import Organization from "../model/organizationModel.js";
import Employee from "../model/employeeModel.js";
import mongoose from "mongoose";

const DEFAULT_SETTINGS = {
  workingHoursRequired: 8,
  maxBreakDurationMinutes: 60,
  minClockOutHour: 18,
  minClockOutMinute: 0,
};

// GET /api/org-settings/:orgId
export const getOrgSettings = async (req, res) => {
  try {
    const { orgId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({ success: false, error: "Invalid organization ID" });
    }

    const [settings, organization] = await Promise.all([
      OrganizationSettings.findOne({ organizationId: orgId }),
      Organization.findById(orgId),
    ]);

    const fullUrl = `${req.protocol}://${req.get("host")}`;
    const logoUrl = organization?.logo && organization.logo.startsWith("/uploads/") 
      ? `${fullUrl}${organization.logo}` 
      : organization?.logo || null;

    res.status(200).json({
      success: true,
      data: {
        ...(settings?.toObject() || { organizationId: orgId, ...DEFAULT_SETTINGS }),
        orgName: organization?.orgName || "Organization",
        logo: logoUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/org-settings/:orgId
export const updateOrgSettings = async (req, res) => {
  try {
    const { orgId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({ success: false, error: "Invalid organization ID" });
    }

    // Check user is Admin(1), HR(4), or Manager(5)
    const user = await Employee.findById(userId);
    if (!user || ![1, 4, 5].includes(user.type)) {
      return res.status(403).json({
        success: false,
        error: "Only Admin, HR, or Manager can update organization settings",
      });
    }

    const {
      workingHoursRequired,
      maxBreakDurationMinutes,
      minClockOutHour,
      minClockOutMinute,
      geofenceEnabled,
      geofenceLatitude,
      geofenceLongitude,
      geofenceRadius,
      wfhEnabled,
    } = req.body;

    const updateData = {};
    if (workingHoursRequired !== undefined) updateData.workingHoursRequired = workingHoursRequired;
    if (maxBreakDurationMinutes !== undefined) updateData.maxBreakDurationMinutes = maxBreakDurationMinutes;
    if (minClockOutHour !== undefined) updateData.minClockOutHour = minClockOutHour;
    if (minClockOutMinute !== undefined) updateData.minClockOutMinute = minClockOutMinute;
    if (geofenceEnabled !== undefined) updateData.geofenceEnabled = geofenceEnabled;
    if (geofenceLatitude !== undefined) updateData.geofenceLatitude = geofenceLatitude;
    if (geofenceLongitude !== undefined) updateData.geofenceLongitude = geofenceLongitude;
    if (geofenceRadius !== undefined) updateData.geofenceRadius = geofenceRadius;
    if (wfhEnabled !== undefined) updateData.wfhEnabled = wfhEnabled;

    const settings = await OrganizationSettings.findOneAndUpdate(
      { organizationId: orgId },
      { organizationId: orgId, ...updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
