import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/dbConfig';
import MedicationLog from '@/models/MedicationLog';
import { verifyToken, unauthorizedResponse } from '../../middleware/auth';

// GET single log
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = verifyToken(request);
    if (!userId) return unauthorizedResponse();

    await connect();

    const log = await MedicationLog.findOne({ 
      _id: params.id, 
      userId 
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
  { params }: { params: { id: string } }
) {
  try {
    const userId = verifyToken(request);
    if (!userId) return unauthorizedResponse();

    await connect();

    const body = await request.json();
    const { takenAt, status, notes } = body;

    const log = await MedicationLog.findOneAndUpdate(
      { _id: params.id, userId },
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
  { params }: { params: { id: string } }
) {
  try {
    const userId = verifyToken(request);
    if (!userId) return unauthorizedResponse();

    await connect();

    const log = await MedicationLog.findOneAndDelete({ 
      _id: params.id, 
      userId 
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