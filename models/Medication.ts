import mongoose from 'mongoose';

const MedicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true
  },
  times: {
    type: [String],
    required: [true, 'At least one time is required'],
    validate: {
      validator: function(times: string[]) {
        return times.length > 0 && times.every(time => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time));
      },
      message: 'Times must be in HH:MM format (e.g., "08:00", "14:30")'
    }
  },
  daysOfWeek: {
    type: [Number],
    default: [0, 1, 2, 3, 4, 5, 6], // Default to all days (Sunday=0, Saturday=6)
    validate: {
      validator: function(days: number[]) {
        return days.length > 0 && days.every(day => day >= 0 && day <= 6);
      },
      message: 'Days must be numbers 0-6 (Sunday=0, Saturday=6)'
    }
  },
  instructions: {
    type: String,
    trim: true,
    default: ''
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Medication = mongoose.models.Medication || mongoose.model('Medication', MedicationSchema);

export default Medication;