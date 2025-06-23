import { NextRequest, NextResponse } from 'next/server';

// Get backend URL from environment variable or use default
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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
    
    // In Next.js 15+, params is a Promise that needs to be awaited
    const { id: submissionId } = await context.params;
    
    if (!submissionId) {
      return NextResponse.json(
        { detail: 'Invalid submission ID' },
        { status: 400 }
      );
    }

    // Forward the request to the backend
    const backendUrl = `${BACKEND_URL}/api/citizens/submissions/${submissionId}`;
    console.log(`Forwarding request to: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
      },
    });

    console.log(`Backend response status: ${response.status}`);
    
    // Get the response data
    const data = await response.json();
    
    // Log the data to see what fields are available
    console.log("Backend response data:", JSON.stringify(data, null, 2));
    
    return NextResponse.json(
      data,
      { status: response.status }
    );
  } catch (error) {
    console.error('Error getting submission details:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}
