import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends NextRequest {
  userId?: string;
}

export async function verifyToken(req: NextRequest): Promise<string | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { message: 'Unauthorized - Invalid or missing token' },
    { status: 401 }
  );
}