import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
  status_name: {
    type: String,
    
  },


}, { timestamps: true });

const Status = mongoose.model('global_status', statusSchema, 'global_status');

export default Status;
