import { readFileSync } from 'fs';
import { join } from 'path';
import { resolvers } from './resolvers/resolvers';
import { makeExecutableSchema } from '@graphql-tools/schema';

const typeDefs = readFileSync(join(__dirname, 'schema/schema.graphql'), 'utf-8');

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
}); 