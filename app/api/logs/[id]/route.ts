import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/dbConfig';
import MedicationLog from '@/models/MedicationLog';
import Medication from '@/models/Medication';
import { verifyToken, unauthorizedResponse } from '../../middleware/auth';

// GET single log
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) return unauthorizedResponse();

    const { id } = await params;

    await connect();
    await Medication.init();

    const log = await MedicationLog.findOne({ 
      _id: id, 
      userId: userId 
    }).populate('medicationId', 'name dosage');

    if (!log) {
      return NextResponse.json({ 
        success: false, 
        error: 'Log not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      log 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// PUT update log
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) return unauthorizedResponse();

    const { id } = await params;

    await connect();
    await Medication.init();

    const body = await request.json();
    const { takenAt, status, notes } = body;

    const log = await MedicationLog.findOneAndUpdate(
      { _id: id, userId: userId },
      { takenAt, status, notes },
      { new: true, runValidators: true }
    ).populate('medicationId', 'name dosage');

    if (!log) {
      return NextResponse.json({ 
        success: false, 
        error: 'Log not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      log 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE log
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) return unauthorizedResponse();

    const { id } = await params;

    await connect();

    const log = await MedicationLog.findOneAndDelete({ 
      _id: id, 
      userId: userId 
    });

    if (!log) {
      return NextResponse.json({ 
        success: false, 
        error: 'Log not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Log deleted successfully' 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}