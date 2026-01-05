import { NextRequest, NextResponse } from 'next/server'; 
import { connect } from '@/lib/dbConfig';
import Medication from '@/models/Medication';
import { verifyToken, unauthorizedResponse } from '../middleware/auth';

// GET all medications for logged-in user
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    await connect();
    
    const medications = await Medication.find({ 
      userId: userId, 
      isActive: true 
    }).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: medications
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new medication for logged-in user
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    await connect();
    
    const body = await request.json();
    const { name, dosage, frequency, timeOfDay, instructions, startDate, endDate } = body;
    
    if (!name || !dosage || !frequency) {
      return NextResponse.json(
        { error: 'Missing required fields: name, dosage, frequency' },
        { status: 400 }
      );
    }
    
    const medication = await Medication.create({
      userId: userId,
      name,
      dosage,
      frequency,
      timeOfDay: timeOfDay || [],
      instructions: instructions || '',
      startDate: startDate || new Date(),
      endDate: endDate || null,
      isActive: true
    });
    
    return NextResponse.json({
      success: true,
      data: medication
    }, { status: 201 });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}