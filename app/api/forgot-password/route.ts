import { NextRequest, NextResponse } from 'next/server';
import { connect as dbConnect } from '@/lib/dbConfig';
import User from '@/models/User';
import { sendResetEmail } from '@/lib/emailService';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({ 
        message: 'If that email exists, a reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set token and expiration (1 hour from now)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send email
    await sendResetEmail(email, resetToken);

    return NextResponse.json({ 
      message: 'If that email exists, a reset link has been sent.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}