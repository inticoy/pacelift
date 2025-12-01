import { Client, LogLevel } from '@notionhq/client';
import { getAccessToken } from './auth';

// Helper to get a client instance with the current user's token
export async function getNotionClient() {
  const token = await getAccessToken();
  
  if (!token) {
    throw new Error("Unauthorized: No access token found");
  }

  return new Client({
    auth: token,
  });
}

// Cache for data source IDs to avoid fetching on every request
const dataSourceCache: Record<string, string> = {};

/**
 * Resolves the Data Source ID from a Database ID.
 * Required for Notion API version 2025-09-03.
 */
export async function getDataSourceId(databaseId: string): Promise<string> {
  if (dataSourceCache[databaseId]) {
    return dataSourceCache[databaseId];
  }

  try {
    const notion = await getNotionClient();
    // Fetch the database to get its data sources
    const response: any = await notion.databases.retrieve({ database_id: databaseId });
    
    // In a single-source database (standard), use the first data source
    if (response.data_sources && response.data_sources.length > 0) {
      const dataSourceId = response.data_sources[0].id;
      dataSourceCache[databaseId] = dataSourceId;
      return dataSourceId;
    }
    
    // Fallback: if no data sources found (unexpected for 2025-09-03), return original ID
    console.warn(`No data sources found for database ${databaseId}. Using database ID as fallback.`);
    return databaseId;
  } catch (error) {
    console.error(`Failed to resolve data source ID for ${databaseId}:`, error);
    // If we can't fetch it (e.g. permission issue), try using the ID directly
    return databaseId;
  }
}

export const WORKOUT_DATA_SOURCE_ID = process.env.WORKOUT_DATA_SOURCE_ID!;
export const LOG_DATA_SOURCE_ID = process.env.LOG_DATA_SOURCE_ID!;
