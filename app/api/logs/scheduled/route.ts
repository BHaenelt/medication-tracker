import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/dbConfig';
import MedicationLog from '@/models/MedicationLog';
import Medication from '@/models/Medication';
import { verifyToken, unauthorizedResponse } from '../../middleware/auth';

// Generate scheduled logs for today
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyToken(request);
    if (!userId) return unauthorizedResponse();

    await connect();
    await Medication.init();

    // Get today's date range (start and end of day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's day of week (0 = Sunday, 6 = Saturday)
    const todayDayOfWeek = startOfDay.getDay();

    // Get all active medications for user
    const medications = await Medication.find({ 
      userId, 
      isActive: true 
    });

    const scheduledLogs = [];

    for (const med of medications) {
      // Check if medication is scheduled for today
      if (!med.daysOfWeek || !med.daysOfWeek.includes(todayDayOfWeek)) {
        continue; // Skip this medication if not scheduled for today
      }

      // Check if logs already exist for today
      const existingLogs = await MedicationLog.find({
        userId,
        medicationId: med._id,
        scheduledTime: { $gte: startOfDay, $lte: endOfDay }
      });

      // Generate logs for each scheduled time
      for (const timeString of med.times) {
        // Parse time string (HH:MM format)
        const [hours, minutes] = timeString.split(':').map(Number);
        
        // Check if this specific time already has a log
        const timeExists = existingLogs.some(log => {
          const logTime = new Date(log.scheduledTime);
          return logTime.getHours() === hours && 
                 logTime.getMinutes() === minutes;
        });

        if (!timeExists) {
          const scheduledTime = new Date(startOfDay);
          scheduledTime.setHours(hours, minutes, 0, 0);

          const newLog = await MedicationLog.create({
            userId,
            medicationId: med._id,
            scheduledTime,
            status: 'pending'
          });

          scheduledLogs.push(newLog);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Generated ${scheduledLogs.length} scheduled logs`,
      logs: scheduledLogs
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}