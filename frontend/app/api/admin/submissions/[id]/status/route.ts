import { NextRequest, NextResponse } from 'next/server';

// Get backend URL from environment variable or use default
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get authorization header
    const authorization = request.headers.get('Authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header missing' },
        { status: 401 }
      );
    }
    
    // In Next.js 14+, directly access the ID from context.params
    const submissionId = context.params.id;
    
    if (!submissionId) {
      return NextResponse.json(
        { detail: 'Invalid submission ID' },
        { status: 400 }
      );
    }

    // Get the request body
    const body = await request.json();

    // Forward the request to the backend
    const backendUrl = `${BACKEND_URL}/admin/submissions/${submissionId}/status`;
    console.log(`Forwarding admin submission status update request to: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log(`Backend response status: ${response.status}`);
    
    // If response is not ok, throw an error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Invalid response from server' }));
      console.error('Error data from backend:', errorData);
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }
    
    // Get the response data
    const data = await response.json();
    
    // Return the response with the same status
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in admin submission status update endpoint:', error);
    return NextResponse.json(
      { detail: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}
