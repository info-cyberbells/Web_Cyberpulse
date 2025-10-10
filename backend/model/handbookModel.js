import mongoose from 'mongoose';

const HandbookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: false,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    // department: {
    //   type: String,
    //   required: true, 
    // },
    visibleTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    }],
  },
  {
    timestamps: true,
  }
);

const Handbook = mongoose.model('Handbook', HandbookSchema);
export default Handbook;