import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { posts, postsRelations, users, usersRelations } from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/merngraphql';

// Disable prefetch for connection pooling in serverless environments
const client = postgres(connectionString, { 
  prepare: false,
  max: 10, // connection pool size
  idle_timeout: 20, // close idle connections after 20 seconds
});

export const db = drizzle(client, { schema: { users, posts, postsRelations, usersRelations } });

export { users };
