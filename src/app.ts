import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as Koa from 'koa';
import { databaseInitializer } from './initializers/database';
import { cronInitializer } from './initializers/cron';
import * as TypeGraphQL from 'type-graphql';
import * as TypeORM from 'typeorm';
import { ApolloServer } from 'apollo-server-koa';
import { Container } from 'typedi';
import { ZombieResolver } from './resolvers/zombieResolver';
import { ZombieItemResolver } from './resolvers/zombieItemResolver';
import { ItemResolver } from './resolvers/itemResolver';

dotenv.config();

TypeORM.useContainer(Container);
TypeGraphQL.useContainer(Container);

function formatError(error) {
  console.error(error);
  delete error.extensions;
  return error;
}

async function initialize() {
  await databaseInitializer();
  await cronInitializer();

  const schema = await TypeGraphQL.buildSchema({
    resolvers: [ZombieResolver, ZombieItemResolver, ItemResolver]
  });

  const app = new Koa();

  const apolloServer = new ApolloServer({ schema, formatError });
  apolloServer.applyMiddleware({ app });

  app.listen(process.env.APP_PORT);
  console.log(`App running on ${process.env.APP_PORT}`);
}

initialize();
