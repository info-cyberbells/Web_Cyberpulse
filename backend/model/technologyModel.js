import mongoose from 'mongoose';

const technologySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,

  },
  description: {
    type: String,

  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false,
  },


}, { timestamps: true });

const Technology = mongoose.model('Technology', technologySchema, 'Technology');

export default Technology;
