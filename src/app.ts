import fastify from "fastify";

import { knexInstance } from "./database";

export const app = fastify();

app.get("/test", async () => {
  const tables = await knexInstance("sqlite_schema").select("*");

  return { tables };
});
