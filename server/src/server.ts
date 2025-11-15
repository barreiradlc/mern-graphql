import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express4';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';

import { ApolloServer } from '@apollo/server';
import { resolvers } from './resolvers/resolvers';
import { typeDefs } from './schemas/typeDefs';

dotenv.config();

async function startServer(): Promise<void> {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(cors());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: process.env.NODE_ENV !== 'production',
  });

  await server.start();
  
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

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/merngraphql';
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.log('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }

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