import { NextRequest, NextResponse } from 'next/server';

// Get backend URL from environment variable or use default
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest, context: { params: { notification_id: string } }) {
  try {
    // Get authorization header
    const authorization = request.headers.get('Authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header missing' },
        { status: 401 }
      );
    }

    // In Next.js 14+, ensure that params is properly handled
    // Using a different approach that doesn't access properties directly
    const params = context.params;
    const notificationId = String(params?.notification_id || '');
    
    if (!notificationId) {
      return NextResponse.json(
        { detail: 'Invalid notification ID' },
        { status: 400 }
      );
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/citizens/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
      },
    });

    // Get the response data
    const data = await response.json();

    // Return the response with the same status
    return NextResponse.json(
      data,
      { status: response.status }
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}
