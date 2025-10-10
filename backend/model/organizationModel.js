import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
    {
        orgName: { type: String, required: true },
        location: { type: String },
        orgType: { type: String },
        description: { type: String },
        orgSize: { type: String },
        phone: { type: String },
        email: { type: String },
    },
    { timestamps: true }
);

const Organization = mongoose.models.Organization || mongoose.model("Organization", organizationSchema, "Organization");
export default Organization;
