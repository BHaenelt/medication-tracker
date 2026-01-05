import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/dbConfig';
import Medication from '@/models/Medication';
import { verifyToken, unauthorizedResponse } from '../../middleware/auth';

// GET single medication
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyToken(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    await connect();
    
    const medication = await Medication.findOne({
      _id: params.id,
      userId: auth.userId // Only get if it belongs to this user
    });
    
    if (!medication) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: medication
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT update medication
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyToken(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    await connect();
    
    const body = await request.json();
    
    const medication = await Medication.findOneAndUpdate(
      {
        _id: params.id,
        userId: auth.userId // Only update if it belongs to this user
      },
      body,
      { new: true, runValidators: true }
    );
    
    if (!medication) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: medication
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE medication
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyToken(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    await connect();
    
    const medication = await Medication.findOneAndDelete({
      _id: params.id,
      userId: auth.userId // Only delete if it belongs to this user
    });
    
    if (!medication) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Medication deleted successfully'
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}