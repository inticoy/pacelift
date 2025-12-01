import { cookies } from 'next/headers';

const WORKOUT_DB_COOKIE = 'wlog_workout_db_id';
const LOG_DB_COOKIE = 'wlog_log_db_id';
const ROUTINE_DB_COOKIE = 'wlog_routine_db_id';

export async function getDatabaseConfig() {
  const cookieStore = await cookies();
  const workoutDbId = cookieStore.get(WORKOUT_DB_COOKIE)?.value;
  const logDbId = cookieStore.get(LOG_DB_COOKIE)?.value;
  const routineDbId = cookieStore.get(ROUTINE_DB_COOKIE)?.value;

  return {
    workoutDbId,
    logDbId,
    routineDbId,
    isConfigured: !!(workoutDbId && logDbId && routineDbId),
  };
}

export async function saveDatabaseConfig(workoutDbId: string, logDbId: string, routineDbId?: string) {
  const cookieStore = await cookies();
  
  cookieStore.set(WORKOUT_DB_COOKIE, workoutDbId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  });

  cookieStore.set(LOG_DB_COOKIE, logDbId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  });

  if (routineDbId) {
    cookieStore.set(ROUTINE_DB_COOKIE, routineDbId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }
}

export async function clearDatabaseConfig() {
  const cookieStore = await cookies();
  cookieStore.delete(WORKOUT_DB_COOKIE);
  cookieStore.delete(LOG_DB_COOKIE);
  cookieStore.delete(ROUTINE_DB_COOKIE);
}
