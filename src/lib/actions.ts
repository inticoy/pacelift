'use server';

import { getNotionClient, getDataSourceId } from './notion';
import { getDatabaseConfig, saveDatabaseConfig, clearDatabaseConfig } from './db-config';
import { logout } from './auth';

export type Exercise = {
  id: string;
  name: string;
  type: string; // Changed from union to string to support dynamic types like 'Sports'
  target: string;
};

export type WorkoutSet = {
  id: string;
  weight?: number;
  reps?: number;
  time?: number;
  distance?: number;
  sec?: number;
  completed?: boolean;
};

export type ActiveExercise = Exercise & {
  uuid: string;
  sets: WorkoutSet[];
};

export type Routine = {
  id: string;
  label: string;
  exercises: string[]; // IDs of exercises (Legacy, for Notion Relation)
  items: { id: string; sets: WorkoutSet[] }[]; // New: Ordered list with sets
};

export async function getExercises(): Promise<Exercise[]> {
  const { workoutDbId } = await getDatabaseConfig();
  if (!workoutDbId) return [];

  try {
    const notion = await getNotionClient();
    const dataSourceId = workoutDbId;

    const response: any = await notion.request({
      path: `data_sources/${dataSourceId}/query`,
      method: 'post',
      body: {
        sorts: [
          {
            property: 'Name',
            direction: 'ascending',
          },
        ],
      },
    });

    const exercises: Exercise[] = response.results.map((page: any) => {
      const name = page.properties.Name?.title[0]?.plain_text || 'Untitled';
      const type = page.properties.Type?.select?.name || 'Strength';
      const target = page.properties.Target?.select?.name || 'Body';

      return {
        id: page.id,
        name,
        type,
        target,
      };
    });

    return exercises;
  } catch (error) {
    console.error('Failed to fetch exercises:', error);
    return [];
  }
}

export async function getExercisePropertyOptions() {
  const { workoutDbId } = await getDatabaseConfig();
  if (!workoutDbId) return { types: [], targets: [] };

  try {
    const notion = await getNotionClient();
    // Try to fetch schema using Data Source endpoint (correct for 2025-09-03 API)
    const response: any = await notion.request({
      path: `data_sources/${workoutDbId}`,
      method: 'get',
    });
    
    const typeOptions = response.properties.Type?.select?.options.map((o: any) => o.name) || ['Strength', 'Cardio'];
    const targetOptions = response.properties.Target?.select?.options.map((o: any) => o.name) || ['Body'];

    return {
      types: typeOptions,
      targets: targetOptions
    };
  } catch (error) {
    console.error('Failed to fetch property options:', error);
    // Return defaults if schema fetch fails
    return {
      types: ['Strength', 'Cardio'],
      targets: ['Body', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body', 'Cardio']
    };
  }
}

export async function submitLog(data: { exerciseId: string; exerciseName: string; date: string; sets: WorkoutSet[] }[]) {
  const { logDbId } = await getDatabaseConfig();
  if (!logDbId) return { success: false, error: 'Log Database not configured' };

  try {
    const notion = await getNotionClient();
    
    // Flatten all sets into individual log entries
    const allLogEntries = data.flatMap(exercise => 
      exercise.sets.map((set, index) => ({
        ...set,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        date: exercise.date,
        setNumber: index + 1
      }))
    );

    // Create a page for each set
    const results = await Promise.all(allLogEntries.map(async (item) => {
      const properties: any = {
        Title: {
          title: [
            {
              text: {
                content: `${item.exerciseName} - Set ${item.setNumber} - ${new Date(item.date).toLocaleDateString()}`,
              },
            },
          ],
        },
        Date: {
          date: {
            start: item.date,
          },
        },
        Exercises: {
          relation: [
            {
              id: item.exerciseId,
            },
          ],
        },
      };

      if (item.weight !== undefined) properties.Weight = { number: item.weight };
      if (item.reps !== undefined) properties.Reps = { number: item.reps };
      // Always add Set Number
      properties.Set = { number: item.setNumber };
      if (item.distance !== undefined && item.distance > 0) properties.Distance = { number: item.distance };
      if (item.time !== undefined && item.time > 0) properties.Min = { number: item.time };
      if (item.sec !== undefined && item.sec > 0) properties.Sec = { number: item.sec };
      

      return notion.pages.create({
        parent: { data_source_id: logDbId },
        properties: properties,
      });
    }));

    return { success: true, count: results.length };
  } catch (error: any) {
    console.error('Failed to submit log:', error);
    return { success: false, error: error.body || error.message || String(error) };
  }
}

export async function searchDatabases() {
  try {
    const notion = await getNotionClient();
    const response = await notion.search({
      filter: {
        value: 'data_source',
        property: 'object',
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
    });
    
    return response.results.map((db: any) => ({
      id: db.id,
      title: db.name || db.title?.[0]?.plain_text || 'Untitled',
      icon: db.icon?.emoji || '📄',
      url: db.url,
    }));
  } catch (error) {
    console.error('Failed to search databases:', error);
    return [];
  }
}

export async function saveConfig(workoutId: string, logId: string, routineId: string) {
  await saveDatabaseConfig(workoutId, logId, routineId);
  return { success: true };
}

export async function saveRoutine(name: string, exercises: ActiveExercise[]) {
  const { routineDbId } = await getDatabaseConfig();
  if (!routineDbId) return { success: false, error: 'Routine Database not configured' };

  try {
    const notion = await getNotionClient();

    // 1. Prepare Relation IDs (Unique Exercise IDs)
    const exerciseIds = Array.from(new Set(exercises.map(e => e.id))).map(id => ({ id }));

    // 2. Prepare Data JSON
    // New Strategy: Store the exact ordered list of exercises with their sets.
    const routineItems = exercises.map(e => ({
      id: e.id,
      sets: e.sets
    }));

    await notion.pages.create({
      parent: { data_source_id: routineDbId },
      properties: {
        Name: {
          title: [{ text: { content: name } }],
        },
        Exercises: {
          relation: exerciseIds, // Still keep this for Notion UI visibility
        },
        Data: {
          rich_text: [{ text: { content: JSON.stringify(routineItems) } }],
        },
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to save routine:', error);
    return { success: false, error: error.message };
  }
}

export async function getRoutines(): Promise<Routine[]> {
  const { routineDbId } = await getDatabaseConfig();
  if (!routineDbId) return [];

  try {
    const notion = await getNotionClient();
    
    // Use search or query. Query is better for specific DB.
    // Since we have the ID, we can use notion.databases.query if it was a normal DB ID.
    // But with data_source_id, we use the query endpoint we used for exercises.
    
    const response: any = await notion.request({
      path: `data_sources/${routineDbId}/query`,
      method: 'post',
      body: {
        sorts: [{ property: 'Name', direction: 'ascending' }],
      },
    });

    return response.results.map((page: any) => {
      const name = page.properties.Name?.title[0]?.plain_text || 'Untitled';
      const exerciseRelations = page.properties.Exercises?.relation || [];
      const exerciseIds = exerciseRelations.map((r: any) => r.id);
      
      let items: { id: string; sets: WorkoutSet[] }[] = [];
      try {
        const jsonStr = page.properties.Data?.rich_text[0]?.plain_text;
        if (jsonStr) {
            const parsed = JSON.parse(jsonStr);
            // Check if it's the new format (Array) or old format (Object)
            if (Array.isArray(parsed)) {
                items = parsed.map((item: any) => {
                    // Check if it's already in the new format
                    if (Array.isArray(item.sets)) {
                        return item;
                    }
                    
                    // Check if it's the recent legacy format (item.data)
                    if (item.data) {
                        const oldData = item.data;
                        let sets = [];
                        
                        if (typeof oldData.sets === 'number') {
                            // Expand "3 sets" into 3 set objects
                            sets = Array.from({ length: oldData.sets }).map(() => ({
                                id: crypto.randomUUID(), // Generate ID for migrated sets
                                weight: oldData.weight,
                                reps: oldData.reps,
                                time: oldData.time,
                                distance: oldData.distance,
                                sec: oldData.sec
                            }));
                        } else {
                            sets = [oldData];
                        }
                        
                        return {
                            id: item.id,
                            sets: sets
                        };
                    }
                    
                    return item;
                });
            } else {
                // Migrate old format (Object) to Array
                // We use the relation order or just keys.
                items = Object.keys(parsed).map(key => {
                    const oldData = parsed[key];
                    let sets = [];
                    
                    if (Array.isArray(oldData.sets)) {
                        sets = oldData.sets;
                    } else if (typeof oldData.sets === 'number') {
                        // Expand "3 sets" into 3 set objects with the same weight/reps
                        sets = Array.from({ length: oldData.sets }).map(() => ({
                            weight: oldData.weight,
                            reps: oldData.reps,
                            time: oldData.time,
                            distance: oldData.distance,
                            sec: oldData.sec
                        }));
                    } else {
                        // Fallback: treat the whole object as one set
                        sets = [oldData];
                    }

                    return {
                        id: key,
                        sets: sets
                    };
                });
            }
        }
      } catch (e) {
        console.error('Failed to parse routine data JSON', e);
      }

      return {
        id: page.id,
        label: name,
        exercises: exerciseIds,
        items,
      };
    });
  } catch (error) {
    console.error('Failed to fetch routines:', error);
    return [];
  }
}

export async function getUserInfo() {
  try {
    const notion = await getNotionClient();
    const response = await notion.users.list({});
    
    // Find the first human user (not a bot)
    // Ideally we should have saved the user ID during OAuth, but this is a decent fallback for personal workspaces
    const user = response.results.find((u: any) => u.type === 'person') || response.results[0];
    
    return {
      name: user?.name || 'User',
      avatarUrl: user?.avatar_url || null,
    };
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    return { name: 'User', avatarUrl: null };
  }
}

export async function signOut() {
  await clearDatabaseConfig();
  await logout();
}

export async function resetDatabases() {
  await clearDatabaseConfig();
}
export async function createExercise(name: string, type: string, target: string = 'Body') {
  const { workoutDbId } = await getDatabaseConfig();
  if (!workoutDbId) return { success: false, error: 'Exercises Database not configured' };

  try {
    const notion = await getNotionClient();
    await notion.pages.create({
      parent: { data_source_id: workoutDbId },
      properties: {
        Name: {
          title: [{ text: { content: name } }],
        },
        Type: {
          select: { name: type },
        },
        Target: {
          select: { name: target },
        },
      },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create exercise:', error);
    return { success: false, error: error.message };
  }
}

export async function updateExercise(id: string, name: string, type: string, target: string) {
  try {
    const notion = await getNotionClient();
    await notion.pages.update({
      page_id: id,
      properties: {
        Name: {
          title: [{ text: { content: name } }],
        },
        Type: {
          select: { name: type },
        },
        Target: {
          select: { name: target },
        },
      },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update exercise:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteExercise(id: string) {
  try {
    const notion = await getNotionClient();
    await notion.pages.update({
      page_id: id,
      archived: true,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete exercise:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteRoutine(id: string) {
  try {
    const notion = await getNotionClient();
    await notion.pages.update({
      page_id: id,
      archived: true,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete routine:', error);
    return { success: false, error: error.message };
  }
}
