import OrganizationSettings from "../model/organizationSettingsModel.js";
import Organization from "../model/organizationModel.js";
import Employee from "../model/employeeModel.js";
import mongoose from "mongoose";
import { reverseGeocode, forwardGeocode } from "../utils/geocoding.js";

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
      locationMode,
      geofenceLatitude,
      geofenceLongitude,
      geofenceAddress,
      geofenceRadius,
      wfhEnabled,
    } = req.body;

    const updateData = {};
    if (workingHoursRequired !== undefined) updateData.workingHoursRequired = workingHoursRequired;
    if (maxBreakDurationMinutes !== undefined) updateData.maxBreakDurationMinutes = maxBreakDurationMinutes;
    if (minClockOutHour !== undefined) updateData.minClockOutHour = minClockOutHour;
    if (minClockOutMinute !== undefined) updateData.minClockOutMinute = minClockOutMinute;
    if (locationMode !== undefined) {
      if (!["off", "radius", "address"].includes(locationMode)) {
        return res.status(400).json({ success: false, error: "Invalid locationMode" });
      }
      updateData.locationMode = locationMode;
    }
    if (geofenceLatitude !== undefined) updateData.geofenceLatitude = geofenceLatitude;
    if (geofenceLongitude !== undefined) updateData.geofenceLongitude = geofenceLongitude;
    if (geofenceAddress !== undefined) updateData.geofenceAddress = geofenceAddress;
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

// GET /api/org-settings/static-map?lat=X&lng=Y&zoom=15&size=600x300
// Proxies the Google Static Maps API so the API key stays on the server.
export const getStaticMap = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).send("Map API key not configured");
    }
    const { lat, lng, zoom = "15", size = "600x300" } = req.query;
    if (!lat || !lng) {
      return res.status(400).send("lat and lng are required");
    }
    // Validate size format (WIDTHxHEIGHT, max 640x640 for free tier)
    if (!/^\d{2,3}x\d{2,3}$/.test(size)) {
      return res.status(400).send("Invalid size");
    }

    const url =
      `https://maps.googleapis.com/maps/api/staticmap` +
      `?center=${lat},${lng}` +
      `&zoom=${zoom}` +
      `&size=${size}` +
      `&scale=2` +
      `&markers=color:red%7C${lat},${lng}` +
      `&key=${apiKey}`;

    const upstream = await fetch(url);
    if (!upstream.ok) {
      console.error(`[staticmap] upstream ${upstream.status}`);
      return res.status(502).send("Map upstream error");
    }
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buffer);
  } catch (error) {
    console.error("[staticmap] error:", error.message);
    res.status(500).send("Failed to fetch map");
  }
};

// POST /api/org-settings/geocode
// Body: either { latitude, longitude } (reverse) or { address } (forward)
export const geocodeLocation = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    if (address) {
      const result = await forwardGeocode(address);
      if (!result) {
        return res.status(404).json({ success: false, error: "Address not found" });
      }
      return res.status(200).json({ success: true, data: result });
    }

    if (latitude != null && longitude != null) {
      const resolved = await reverseGeocode(latitude, longitude);
      if (!resolved) {
        return res.status(404).json({ success: false, error: "Unable to resolve coordinates" });
      }
      return res.status(200).json({
        success: true,
        data: { latitude, longitude, formattedAddress: resolved },
      });
    }

    return res.status(400).json({ success: false, error: "Provide address or latitude/longitude" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
