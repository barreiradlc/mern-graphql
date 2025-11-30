import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express4';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';

import { sql } from 'drizzle-orm';
import { db } from './db';
import { resolvers } from './resolvers/resolvers';
import { typeDefs } from './schemas/typeDefs';

dotenv.config();

interface MyContext {
  req: express.Request;
}

async function startServer(): Promise<void> {
  const app = express();
  const httpServer = http.createServer(app);

  // Test database connection
  try {
    // Simple query to test connection
    await db.execute(sql`SELECT 1`);
    console.log('✅ PostgreSQL Connected with Drizzle ORM');
  } catch (err) {
    console.log('❌ PostgreSQL Connection Error:', err);
    process.exit(1);
  }

  // Apollo Server setup with @apollo/server
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: process.env.NODE_ENV !== 'production',
  });

  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: ['http://localhost:3000', 'http://client:3000'],
      credentials: true,
    }),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ req }),
    })
  );

  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      // Test database connection in health check
      await db.execute(sql`SELECT 1`);
      res.status(200).json({ 
        status: 'OK', 
        database: 'connected',
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'ERROR', 
        database: 'disconnected',
        timestamp: new Date().toISOString() 
      });
    }
  });

  const PORT = process.env.PORT || 5000;
  
  await new Promise<void>((resolve) => 
    httpServer.listen({ port: PORT }, resolve)
  );
  
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
}

startServer().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});