import { NextRequest, NextResponse } from 'next/server';

// Get backend URL from environment variable or use default
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Get form data from the request
    const formData = await request.formData();
    const username = formData.get('username')?.toString() || '';
    const password = formData.get('password')?.toString() || '';
    
    if (!username || !password) {
      return NextResponse.json(
        { detail: 'Username and password are required' },
        { status: 400 }
      );
    }

    // The backend expects form data, not JSON, for OAuth2PasswordRequestForm
    const backendFormData = new URLSearchParams();
    backendFormData.append('username', username);
    backendFormData.append('password', password);
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/citizens/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: backendFormData,
    });

    // Get the response data
    const data = await response.json();

    // Return the response with the same status
    return NextResponse.json(
      data,
      { status: response.status }
    );
  } catch (error) {
    console.error('Error in citizen login:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}
