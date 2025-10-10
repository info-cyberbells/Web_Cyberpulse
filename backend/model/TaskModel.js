import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },

  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Paused', 'Completed'],
    default: 'Pending'
  },
  startTime: {
    type: Date
  },
  pauseTime: {
    type: Date
  },
  completionTime: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0
  },
  assignedDate: {
    type: Date,
    required: true
  },
  workSessions: [{
    startTime: Date,
    endTime: Date,
    duration: Number
  }],
  projectName: {
    type: String
  },
  estimatedHours: {
    type: Number,
    default: 0,
    min: 0,
    max: 23
  },
  estimatedMinutes: {
    type: Number,
    default: 0,
    min: 0,
    max: 59
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Task = mongoose.model("Task", TaskSchema, "Task");

export default Task;
