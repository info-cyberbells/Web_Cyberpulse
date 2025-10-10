import mongoose from 'mongoose';

// Define a counter schema to track daily ticket count
const CounterSchema = new mongoose.Schema({
  date: {
    type: String,
    unique: true, // Only one entry per date
  },
  count: {
    type: Number,
    default: 0,
  },
});

const Counter = mongoose.model('Counter', CounterSchema);

const HelpDeskSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: function () {
        return !this.anonymous;
      },
    },
    anonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'],
      default: 'pending',
    },
    ticketId: {
      type: String,
      unique: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: false,
    },

  },
  {
    timestamps: true,
  }
);

// Generate ticketId before saving
HelpDeskSchema.pre('save', async function (next) {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, ''); // Format: YYYYMMDD

  // Find the counter for today
  const counter = await Counter.findOneAndUpdate(
    { date: today },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );

  // Set ticketId as YYYYMMDD-XXXX
  this.ticketId = `${today}-${String(counter.count).padStart(4, '0')}`;
  next();
});

const HelpDesk = mongoose.model('HelpDesk', HelpDeskSchema, 'HelpDesk');
export default HelpDesk;
