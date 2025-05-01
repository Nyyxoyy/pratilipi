import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import { redis } from './redis';
import { logger } from './logger';
import { resolvers } from './resolvers/resolvers';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { Context } from './context';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Read the schema file
const typeDefs = readFileSync(join(__dirname, 'schema/schema.graphql'), 'utf-8');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

async function startServer() {
  try {
    await server.start();
    
    app.use(
      '/graphql',
      cors<cors.CorsRequest>(),
      json(),
      expressMiddleware(server, {
        context: async ({ req }) => {
          const token = req.headers.authorization?.split(' ')[1];
          if (!token) {
            return new Context({});
          }
          try {
            return new Context({ token });
          } catch (error) {
            logger.error('Error setting up context:', error);
            return new Context({});
          }
        },
      }),
    );

    app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'ok' });
    });

    const PORT = process.env.PORT || 4000;
    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
    logger.info(`🚀 Gateway ready at http://localhost:${PORT}/graphql`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received. Closing HTTP server...');
  await redis.quit();
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
}); 