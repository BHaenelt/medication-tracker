import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';  //bycrypt used for hasging PWs
import jwt from 'jsonwebtoken'; //use jsoneweb token to create token 
//for authitcation for browser and server comunication
import { connect } from '@/lib/dbConfig'; // connect to db
import User from '@/models/User'; //import the user model

export async function POST(req: NextRequest) {  //POST when user sends login to server
  //async to handle and wait for conections and db operations wihtout freezeing
  try {
    await connect();
    
    const { email, password } = await req.json();
//get the email and pw form request body and await for it to be parsed
 
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }// find user by email in db, if no then
    // return json response with 401 status

    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    } //

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { message: 'Error logging in', error },
      { status: 500 }
    );
  }
}