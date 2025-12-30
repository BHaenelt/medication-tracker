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
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: ['once daily', 'twice daily', 'three times daily', 'as needed', 'custom']
  },
  timeOfDay: {
    type: [String], // Array of times like ["08:00", "20:00"]
    default: []
  },
  instructions: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
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