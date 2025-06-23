import { NextRequest, NextResponse } from 'next/server';

// Get backend URL from environment variable or use default
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authorization = request.headers.get('Authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header missing' },
        { status: 401 }
      );
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/citizens/submissions`, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
      },
    });

    // Get the response status and data
    const responseStatus = response.status;
    const data = await response.json();

    // Return enhanced debugging response
    return NextResponse.json({
      message: 'Debug information for submissions',
      status: responseStatus,
      backendUrl: `${BACKEND_URL}/api/citizens/submissions`,
      responseData: data,
      hasSubmissions: data.submissions && data.submissions.length > 0,
      submissionCount: data.submissions ? data.submissions.length : 0,
      auth: authorization.substring(0, 15) + '...',
    });
  } catch (error) {
    console.error('Error in debug submissions route:', error);
    return NextResponse.json(
      { 
        detail: 'Error in debug route', 
        error: String(error),
        backendUrl: `${BACKEND_URL}/api/citizens/submissions`,
      },
      { status: 500 }
    );
  }
}
