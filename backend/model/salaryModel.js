import mongoose from 'mongoose';

const advanceSalarySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  responseNote: {
    type: String,
    default: ''
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false,
  },
  approvalImagePath: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const AdvanceSalary = mongoose.model('AdvanceSalary', advanceSalarySchema, 'AdvanceSalary');
export default AdvanceSalary;
