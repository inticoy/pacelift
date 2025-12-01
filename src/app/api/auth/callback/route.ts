import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const REDIRECT_URI = process.env.OAUTH_REDIRECT_URI;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  try {
    // Exchange code for access token
    const encoded = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${encoded}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to exchange token');
    }

    const accessToken = data.access_token;
    // In a real app, we might also want to store the workspace_id, bot_id, etc.
    // const workspaceId = data.workspace_id;

    // Store token in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('notion_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Redirect to home page
    // Use REDIRECT_URI to determine the correct origin (handles localhost vs tunnel)
    const homeUrl = new URL('/', REDIRECT_URI || request.url);
    return NextResponse.redirect(homeUrl);

  } catch (error: any) {
    console.error('OAuth Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
