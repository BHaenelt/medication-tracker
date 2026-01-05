import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/dbConfig';
import MedicationLog from '@/models/MedicationLog';
import Medication from '@/models/Medication';
import { verifyToken, unauthorizedResponse } from '../middleware/auth';

// GET all logs for authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyToken(request);
    if (!userId) return unauthorizedResponse();

    await connect();
    
    // Force Medication model to load
    await Medication.init();

    const logs = await MedicationLog.find({ userId })
      .populate('medicationId', 'name dosage')
      .sort({ scheduledTime: -1 });

    return NextResponse.json({ 
      success: true, 
      logs 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// POST create new log
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyToken(request);
    if (!userId) return unauthorizedResponse();

    await connect();
    
    // Force Medication model to load
    await Medication.init();

    const body = await request.json();
    const { medicationId, scheduledTime, takenAt, status, notes } = body;

    const newLog = await MedicationLog.create({
      userId,
      medicationId,
      scheduledTime,
      takenAt: takenAt || (status === 'taken' ? new Date() : null),
      status: status || 'pending',
      notes
    });

    const populatedLog = await MedicationLog.findById(newLog._id)
      .populate('medicationId', 'name dosage');

    return NextResponse.json({ 
      success: true, 
      log: populatedLog 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}