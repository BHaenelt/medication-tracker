import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connect } from '@/lib/dbConfig';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connect();
    
    const { name, email, password } = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Create JWT token
  // Create JWT token
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);

    return NextResponse.json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    }, { status: 201 });
    
  } catch (error) {
    return NextResponse.json(
      { message: 'Error registering user', error },
      { status: 500 }
    );
  }
}