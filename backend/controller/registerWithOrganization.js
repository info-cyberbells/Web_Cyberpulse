import Organization from "../model/organizationModel.js";
import Employee from "../model/employeeModel.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const registerWithOrganization = async (req, res) => {
    const { step, orgData, adminData, otp } = req.body;

    try {
        // Add environment check
        console.log('Environment Variables Check:');
        console.log('EMAIL_USER:', !!process.env.EMAIL_USER);
        console.log('EMAIL_PASS:', !!process.env.EMAIL_PASS);
        console.log('JWT_SECRET:', !!process.env.JWT_SECRET);

        // STEP 1: Save Organization
        if (step === 1) {
            const existingOrg = await Organization.findOne({ email: orgData.email });
            if (existingOrg) {
                return res.status(400).json({ success: false, message: "Organization already exists with this email" });
            }

            const newOrg = new Organization(orgData);
            await newOrg.save();
            return res.status(200).json({ success: true, message: "Organization created", orgId: newOrg._id });
        }

        // STEP 2: Save admin data temporarily and send OTP
        if (step === 2) {
            const existingUser = await Employee.findOne({ email: adminData.email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "User already exists with this email" });
            }

            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const hashedPassword = await bcrypt.hash(adminData.password, 10);

            // Save temporary admin data to database instead of Map
            const tempAdmin = new Employee({
                ...adminData,
                password: hashedPassword,
                type: 1,
                status: "0", // Temporary status - not activated yet
                tempOtp: otpCode,
                otpExpiresAt: new Date(Date.now() + 60 * 60 * 1000)
            });

            await tempAdmin.save();
            console.log('Temporary admin saved with OTP:', otpCode);

            const mailOptions = {
                from: `"CyberPulse" <${process.env.EMAIL_USER}>`,
                to: adminData.email,
                subject: "OTP Verification for Admin Signup",
                html: `
                <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; font-family: Arial, sans-serif; border: 1px solid #ddd;">
                  <h2 style="color: #333; text-align: center;">Admin Signup OTP Verification</h2>
                  <p style="text-align: center;">Use the OTP below to complete your registration as admin:</p>
                  <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 10px 0; text-align: center; background-color: #fff; border: 1px solid #ccc; width: 60%; margin: 10px auto;">
                    ${otpCode}
                  </div>
                  <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">
                    This OTP is valid for 1 hour. If you did not initiate this request, please ignore this email.
                  </p>
                  <p style="text-align: center; font-size: 12px; color: #aaa;">
                    © ${new Date().getFullYear()} CyberPulse. All rights reserved.
                  </p>
                </div>
                `,
            };

            await transporter.sendMail(mailOptions);
            return res.status(200).json({ success: true, message: "OTP sent to email" });
        }

        // STEP 3: Verify OTP and create Employee
        if (step === 3) {
            console.log('Step 3 - Verifying OTP for email:', adminData.email);
            console.log('Received OTP:', otp);

            // Find temporary admin data from database
            const tempAdmin = await Employee.findOne({
                email: adminData.email,
                status: "0", // Temporary status
                tempOtp: otp,
                otpExpiresAt: { $gt: new Date() }
            });

            console.log('Found temp admin:', !!tempAdmin);

            if (!tempAdmin) {
                // Check if OTP expired
                const expiredAdmin = await Employee.findOne({
                    email: adminData.email,
                    status: "0"
                });

                if (expiredAdmin) {
                    return res.status(400).json({ success: false, message: "OTP expired or invalid" });
                } else {
                    return res.status(400).json({ success: false, message: "No pending verification found" });
                }
            }

            // Activate the admin account
            tempAdmin.status = "1"; // Active status
            tempAdmin.tempOtp = undefined; // Remove temporary OTP
            tempAdmin.otpExpiresAt = undefined; // Remove expiry
            await tempAdmin.save();

            console.log('Admin activated successfully');

            // Check JWT_SECRET
            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is not set!');
                return res.status(500).json({ success: false, message: "Server configuration error" });
            }

            const token = jwt.sign(
                { id: tempAdmin._id, email: tempAdmin.email, type: tempAdmin.type },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            console.log('Token generated successfully');

            return res.status(201).json({
                success: true,
                message: "Admin registered successfully",
                token,
            });
        }

        return res.status(400).json({ success: false, message: "Invalid step" });
    } catch (error) {
        console.error("Registration Error Details:", error);
        console.error("Error stack:", error.stack);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};