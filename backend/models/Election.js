const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Ended'],
      default: 'Upcoming',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Automatically set status based on dates
electionSchema.pre('save', function (next) {
  const now = new Date();
  if (now < this.startDate) {
    this.status = 'Upcoming';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'Ongoing';
  } else {
    this.status = 'Ended';
  }
  next();
});

module.exports = mongoose.model('Election', electionSchema);