import knex, { Knex } from "knex";

import { env } from "./env";

if (!process.env.DATABASE_URL) {
  throw new Error("No DATABASE_URL environment variable found");
}

export const config: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./db/migrations",
  },
};

export const knexInstance = knex(config);
