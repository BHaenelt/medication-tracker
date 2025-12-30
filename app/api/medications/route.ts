import { NextRequest, NextResponse } from 'next/server'; 
import { connect } from '@/lib/dbConfig';
import Medication from '@/models/Medication';

// GET all medications for a user
export async function GET(request: NextRequest) {
  try {
    await connect();
    
    // TODO: Get userId from authentication token
    // For now, we'll use a query parameter
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const medications = await Medication.find({ userId, isActive: true })
      .sort({ createdAt: -1 });
    
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

// POST - Create a new medication
export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const body = await request.json();
    const { userId, name, dosage, frequency, timeOfDay, instructions, startDate, endDate } = body;
    
    if (!userId || !name || !dosage || !frequency) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, dosage, frequency' },
        { status: 400 }
      );
    }
    
    const medication = await Medication.create({
      userId,
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