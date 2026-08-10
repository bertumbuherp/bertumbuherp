import { NextResponse } from 'next/server';
import { AuthService } from '../../../../backend/services/AuthService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    const result = await AuthService.verifyCredentials(email, password);
    
    if (result.success) {
      // In a real app, generate a JWT token here and set it as an HTTP-only cookie
      return NextResponse.json({ success: true, user: result.user });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
