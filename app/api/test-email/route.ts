import { NextResponse } from 'next/server';
import { sendResetEmail } from '@/lib/emailService';

export async function GET() {
  try {
    await sendResetEmail('brittanymhaenelt@gmail.com', 'test-token-12345');
    
    return NextResponse.json({ message: 'Test email sent! Check your inbox.' });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email', details: error }, { status: 500 });
  }
}