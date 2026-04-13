import Employee from "../model/employeeModel.js";
import Organization from "../model/organizationModel.js";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads");
const BASE_URL = "/uploads/";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper: save base64 image to disk
const handleBase64Image = async (imageData, userId) => {
  const matches = imageData.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return { error: true, message: "Invalid base64 image string" };
  }
  const imageType = matches[1];
  const imageBase64 = matches[2];
  const imageFileName = `admin_${userId}_${Date.now()}.${imageType}`;
  const imagePath = path.join(uploadDir, imageFileName);

  try {
    fs.writeFileSync(imagePath, imageBase64, "base64");
  } catch (err) {
    return { error: true, message: "Failed to save image." };
  }

  return { imagePath: `${BASE_URL}${imageFileName}` };
};

// GET /api/admin-profile/me  — returns admin employee + org details
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;

    const admin = await Employee.findById(adminId).select("-password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    if (admin.type !== 1) {
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }

    let organization = null;
    if (admin.organizationId) {
      organization = await Organization.findById(admin.organizationId);
    }

    const fullUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl =
      admin.image && admin.image.startsWith("/uploads/")
        ? `${fullUrl}${admin.image}`
        : admin.image || null;

    return res.status(200).json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          address: admin.address,
          city: admin.city,
          state: admin.state,
          pincode: admin.pincode,
          dob: admin.dob,
          joiningDate: admin.joiningDate,
          department: admin.department,
          position: admin.position,
          jobRole: admin.jobRole,
          gender: admin.gender,
          image: imageUrl,
          type: admin.type,
          organizationId: admin.organizationId,
        },
        organization: organization
          ? {
              id: organization._id,
              orgName: organization.orgName,
              location: organization.location,
              orgType: organization.orgType,
              description: organization.description,
              orgSize: organization.orgSize,
              phone: organization.phone,
              email: organization.email,
              logo: organization.logo && organization.logo.startsWith("/uploads/") 
                ? `${fullUrl}${organization.logo}` 
                : organization.logo || null,
            }
          : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin-profile/me  — updates admin personal details + profile image
export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;

    const admin = await Employee.findById(adminId);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    if (admin.type !== 1) {
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }

    const { name, phone, address, city, state, pincode, dob, gender, image } = req.body;

    let newImagePath = admin.image;
    if (image && image.startsWith("data:image/")) {
      const result = await handleBase64Image(image, adminId);
      if (result.error) {
        return res.status(400).json({ success: false, message: result.message });
      }
      newImagePath = result.imagePath;
    } else if (image && !image.startsWith("data:image/")) {
      // Keep existing URL as-is (already a /uploads/ path or http URL)
      newImagePath = admin.image;
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (city !== undefined) updateFields.city = city;
    if (state !== undefined) updateFields.state = state;
    if (pincode !== undefined) updateFields.pincode = pincode;
    if (dob !== undefined) updateFields.dob = dob;
    if (gender !== undefined) updateFields.gender = gender;
    if (newImagePath !== admin.image) updateFields.image = newImagePath;

    const updatedAdmin = await Employee.findByIdAndUpdate(
      adminId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    const fullUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl =
      updatedAdmin.image && updatedAdmin.image.startsWith("/uploads/")
        ? `${fullUrl}${updatedAdmin.image}`
        : updatedAdmin.image || null;

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      data: {
        id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        phone: updatedAdmin.phone,
        address: updatedAdmin.address,
        city: updatedAdmin.city,
        state: updatedAdmin.state,
        pincode: updatedAdmin.pincode,
        dob: updatedAdmin.dob,
        joiningDate: updatedAdmin.joiningDate,
        department: updatedAdmin.department,
        position: updatedAdmin.position,
        jobRole: updatedAdmin.jobRole,
        gender: updatedAdmin.gender,
        image: imageUrl,
        type: updatedAdmin.type,
        organizationId: updatedAdmin.organizationId,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin-profile/organization  — updates organization details (admin only)
export const updateOrganizationDetails = async (req, res) => {
  try {
    const adminId = req.user.id;

    const admin = await Employee.findById(adminId);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    if (admin.type !== 1) {
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }
    if (!admin.organizationId) {
      return res.status(400).json({ success: false, message: "No organization linked to this admin" });
    }

    const { orgName, location, orgType, description, orgSize, phone, email, logo } = req.body;

    const updateFields = {};
    if (orgName !== undefined) updateFields.orgName = orgName;
    if (location !== undefined) updateFields.location = location;
    if (orgType !== undefined) updateFields.orgType = orgType;
    if (description !== undefined) updateFields.description = description;
    if (orgSize !== undefined) updateFields.orgSize = orgSize;
    if (phone !== undefined) updateFields.phone = phone;
    if (email !== undefined) updateFields.email = email;
    
    if (logo && logo.startsWith("data:image/")) {
      const result = await handleBase64Image(logo, `org_${admin.organizationId}`);
      if (result.error) {
        return res.status(400).json({ success: false, message: result.message });
      }
      updateFields.logo = result.imagePath;
    } else if (logo === null) {
      updateFields.logo = null;
    }

    const updatedOrg = await Organization.findByIdAndUpdate(
      admin.organizationId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedOrg) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Organization details updated successfully",
      data: {
        id: updatedOrg._id,
        orgName: updatedOrg.orgName,
        location: updatedOrg.location,
        orgType: updatedOrg.orgType,
        description: updatedOrg.description,
        orgSize: updatedOrg.orgSize,
        phone: updatedOrg.phone,
        email: updatedOrg.email,
        logo: updatedOrg.logo && updatedOrg.logo.startsWith("/uploads/") 
          ? `${req.protocol}://${req.get("host")}${updatedOrg.logo}` 
          : updatedOrg.logo || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
