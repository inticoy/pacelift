import { cookies } from 'next/headers';

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get('notion_access_token');
  return token?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('notion_access_token');
}
