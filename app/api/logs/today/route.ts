import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/dbConfig';
import MedicationLog from '@/models/MedicationLog';
import Medication from '@/models/Medication';
import { verifyToken, unauthorizedResponse } from '../../middleware/auth';

// GET today's scheduled medications
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyToken(request);
    if (!userId) return unauthorizedResponse();

    await connect();
    await Medication.init();

    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find all logs scheduled for today
    const todaysLogs = await MedicationLog.find({
      userId,
      scheduledTime: { $gte: startOfDay, $lte: endOfDay }
    })
    .populate('medicationId', 'name dosage frequency')
    .sort({ scheduledTime: 1 }); // Sort by time ascending

    return NextResponse.json({ 
      success: true, 
      count: todaysLogs.length,
      logs: todaysLogs
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}