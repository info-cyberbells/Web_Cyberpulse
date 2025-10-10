import mongoose from 'mongoose';

const HolidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Holiday name is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Holiday date is required']
  },
  dayOfWeek: {
    type: String,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', "Thursday", 'Friday', 'Saturday'],
    required: true
  },
  type: {
    type: String,
    enum: ['Restricted', 'Observance', 'Gazetted'],
    required: [true, 'Holiday type is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: false,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  }
}, {
  timestamps: true,
  collection: 'holidays',
  versionKey: false
});

HolidaySchema.index({ date: 1 });
HolidaySchema.index({ type: 1 });
HolidaySchema.index({ createdAt: -1 });

HolidaySchema.virtual('formattedDate').get(function () {
  return this.date.toISOString().split('T')[0];
});

// HolidaySchema.pre('save', function(next) {
//   const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//   this.dayOfWeek = days[this.date.getDay()];
//   next();
// });

HolidaySchema.methods.getDisplayDate = function () {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${this.date.getDate()} ${months[this.date.getMonth()]}`;
};

const Holiday = mongoose.model("Holiday", HolidaySchema, "Holiday");
export default Holiday;