import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  clientName: {
    type: String,
  },
  clientAddress: {
    type: String,
  },
  department: {
    type: String,
    enum: ["Development", "SEO"], 
    required: true, 
  },
  assignedTo: {
    type: [String], 
  },
  status: {
    type: [String], 

  },
  remarks: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  deliveryDate: {
    type: Date,
  },
  urls: {
    type: String, 
  },
  technology: {
    type: [String], 
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization', 
  },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

const Project = mongoose.model('Project', projectSchema, 'Project');

export default Project;
