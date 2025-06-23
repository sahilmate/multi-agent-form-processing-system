// For debugging purposes - exposes key parameters from the request
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get the params
    const params = context.params;
    const submissionId = typeof params?.id === 'string' ? params.id : '';
    
    // Get the headers
    const auth = request.headers.get('Authorization') ? 'Present' : 'Missing';
    
    // Return diagnostic info
    return NextResponse.json({
      message: 'Diagnostic information',
      submissionId,
      auth,
      headers: Object.fromEntries(request.headers.entries()),
      url: request.url,
      method: request.method,
    });
  } catch (error) {
    console.error('Error in diagnostic route:', error);
    return NextResponse.json(
      { detail: 'Error in diagnostic route', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get the params directly - Next.js 14+ recommended approach
    const submissionId = context.params.id;
    
    // Get the headers
    const auth = request.headers.get('Authorization') ? 'Present' : 'Missing';
    
    // Get the body
    const body = await request.json().catch(() => ({}));
    
    // Return diagnostic info
    return NextResponse.json({
      message: 'Diagnostic information for POST',
      submissionId,
      auth,
      headers: Object.fromEntries(request.headers.entries()),
      body,
      url: request.url,
      method: request.method,
    });
  } catch (error) {
    console.error('Error in diagnostic POST route:', error);
    return NextResponse.json(
      { detail: 'Error in diagnostic route', error: String(error) },
      { status: 500 }
    );
  }
}
