import { isAuthenticated } from '@/lib/auth';
import { getExercises } from '@/lib/actions';
import { getDatabaseConfig } from '@/lib/db-config';
import LoginScreen from '@/components/LoginScreen';
import MainLayout from '@/components/MainLayout';
import DatabasePicker from '@/components/DatabasePicker';

export default async function Home() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    const clientId = process.env.OAUTH_CLIENT_ID;
    const redirectUri = process.env.OAUTH_REDIRECT_URI;
    
    // Construct Notion Authorization URL
    const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri || '')}`;

    return <LoginScreen authUrl={authUrl} />;
  }

  // Check if databases are configured
  const { isConfigured } = await getDatabaseConfig();

  if (!isConfigured) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <DatabasePicker />
      </main>
    );
  }

  // Fetch exercises from Notion
  const exercises = await getExercises();

  return (
    <main className="min-h-screen bg-gray-50">
      <MainLayout allExercises={exercises} />
    </main>
  );
}
