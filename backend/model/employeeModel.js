import mongoose from "mongoose";


const employeeSchema = new mongoose.Schema(
  {

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    department: {
      type: String,
    },
    joiningDate: {
      type: Date,
    },
    phone: {
      type: String,
    },
    pincode: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    dob: {
      type: Date,
    },
    type: {
      type: Number,
      required: true,
    },
    position: {
      type: String,
    },
    jobRole: {
      type: String,
    },
    image: {
      type: String,
    },
    gender: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    status: {
      type: String,
      default: "1",
      enum: ["0", "1"],
    },
    leaveQuota: {
      type: String,
      default: "3",
    },
    reason: {
      type: String,
      required: false,
    },
    comments: {
      type: String,
      required: false,
    },
    lastWorkingDay: {
      type:Date,
    },
    duesStatus:{
      type: String,
    },
    lastDuePayDate:{
      type: Date,
    },
    futureHiring: {
      type: String,
      required: false,
      enum: ["yes", "no", "maybe", ""],
    },
    NameOnBankAccount: {
      type: String,
    },
    BankAccountNumber: {
      type: String
    },
    BankAccountIFSCCode: {
      type: String
    },
    BankName: {
      type: String
    },
    salary: {
      type: String,
    },
    incrementcycle: {
      type: String,
    },
    IncrementAmount: {
      type: String,
    },
    incrementMonth: { type: String },
    documents: [
      {
        documentType: {
          type: String,
          required: true,
        },
        documentUrl: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        remarks: {
          type: String,
        },
      },
    ],
    tempOtp: {
      type: String,
      default: undefined
    },
    otpExpiresAt: {
      type: Date,
      default: undefined
    },
    salarySlips: [
      {
        month: {
          type: String,
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        remarks: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema, "Employee");

export default Employee;