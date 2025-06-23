import { NextRequest, NextResponse } from 'next/server';

// Get backend URL from environment variable or use default
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {  try {
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

    // Get the comment from the request body
    const body = await request.json();

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/citizens/submissions/${submissionId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Get the response data
    const data = await response.json();

    // Return the response with the same status
    return NextResponse.json(
      data,
      { status: response.status }
    );
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (!authorization) {
    return NextResponse.json({ detail: 'Authorization header missing' }, { status: 401 });
  }
  // Forward query params
  const url = new URL(request.url);
  const backendUrl = `${BACKEND_URL}/admin/submissions${url.search}`;
  const response = await fetch(backendUrl, {
    method: 'GET',
    headers: { 'Authorization': authorization }
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
