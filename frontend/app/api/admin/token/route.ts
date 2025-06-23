import { NextRequest, NextResponse } from 'next/server';

// Get backend URL from environment variable or use default
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Extract the form data from the request
    const formData = await request.formData();
    
    // Forward the request to the backend
    const backendUrl = `${BACKEND_URL}/admin/token`;
    console.log(`Forwarding admin login request to: ${backendUrl}`);
    
    // Convert to URL encoded form data (which is what FastAPI expects)
    const urlSearchParams = new URLSearchParams();
    formData.forEach((value, key) => {
      urlSearchParams.append(key, value.toString());
    });
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlSearchParams.toString(),
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
    console.log('Login successful:', data);
    
    // Return the response with the same status
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in admin token endpoint:', error);
    return NextResponse.json(
      { detail: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}
