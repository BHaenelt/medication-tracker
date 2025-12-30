import mongoose from 'mongoose';

const MedicationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  takenAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['taken', 'missed', 'skipped', 'pending'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const MedicationLog = mongoose.models.MedicationLog || mongoose.model('MedicationLog', MedicationLogSchema);

export default MedicationLog;