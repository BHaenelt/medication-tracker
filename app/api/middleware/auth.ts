import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends NextRequest {
  userId?: string;
}

export async function verifyToken(req: NextRequest): Promise<{ userId: string } | null> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    return { userId: decoded.userId };
    
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