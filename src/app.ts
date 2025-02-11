import cookie from "@fastify/cookie";
import fastify from "fastify";

import { dietRoutes } from "./routes/diet";

export const app = fastify();

app.register(cookie);

app.register(dietRoutes);
