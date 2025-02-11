/* eslint-disable camelcase */
import { randomUUID } from "node:crypto";

import { FastifyInstance } from "fastify";
import { z } from "zod";

import { knexInstance } from "../database";
import { checkSessionId } from "../middleware/check-session-id";

export async function dietRoutes(app: FastifyInstance) {
  app.get("/users", async () => {
    const users = await knexInstance("users").select("*");

    return { users };
  });

  app.post("/users", async (request, reply) => {
    const createUserBodySchema = z.object({
      id: z.string().uuid().nullish(),
      name: z.string(),
      email: z.string().email(),
    });

    const { name, email } = createUserBodySchema.parse(request.body);

    let sessionId = request.cookies.sessionID;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionID", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 Days
      });
    }

    await knexInstance("users").insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });

  app.get(
    "/users/meals",
    { preHandler: [checkSessionId] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionID;

      const user = await knexInstance("users")
        .where({
          session_id: sessionId,
        })
        .first();

      if (!user) {
        return reply.status(401).send("Invalid session");
      }

      const meals = await knexInstance("meals")
        .where({ user_id: user.id })
        .select("*");

      return { meals };
    },
  );

  app.get("/meals", async () => {
    const meals = await knexInstance("meals").select("*");

    return { meals };
  });

  app.get("/meals/:id", async (request) => {
    const idMealSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = idMealSchema.parse(request.params);

    const meal = await knexInstance("meals")
      .where({
        id,
      })
      .select("*");

    return { meal };
  });

  app.post("/meals", async (request, reply) => {
    const createMealsSchemaBody = z.object({
      name: z.string(),
      description: z.string(),
      in_diet: z.enum(["yes", "no"]),
    });

    const { name, description, in_diet } = createMealsSchemaBody.parse(
      request.body,
    );

    const sessionId = request.cookies.sessionID;

    if (!sessionId) {
      return reply.status(401).send("Invalid session");
    }

    const user = await knexInstance("users")
      .where("session_id", sessionId)
      .first();

    await knexInstance("meals").insert({
      id: randomUUID(),
      name,
      description,
      created_at: new Date(),
      in_diet,
      user_id: user.id,
    });

    return reply.status(201).send();
  });

  app.put(
    "/meals/:id",
    { preHandler: [checkSessionId] },
    async (request, reply) => {
      const idMealSchemaBody = z.object({
        id: z.string().uuid(),
      });

      const updateMealSchemaBody = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        in_diet: z.enum(["yes", "no"]).optional(),
      });

      const { id } = idMealSchemaBody.parse(request.params);
      const { name, description, in_diet } = updateMealSchemaBody.parse(
        request.body,
      );

      const sessionID = request.cookies.sessionID;

      const user = await knexInstance("users")
        .where({
          session_id: sessionID,
        })
        .first();

      if (!user) {
        return reply.status(401).send("Invalid session");
      }

      const meal = await knexInstance("meals").where("id", id).first();

      if (meal.user_id !== user.id) {
        return reply.status(403).send("Not authorized to update this meal");
      }

      await knexInstance("meals").where("id", id).update({
        name,
        description,
        in_diet,
        updated_at: new Date(),
      });

      return reply.status(202).send();
    },
  );

  app.delete(
    "/meals/:id",
    { preHandler: [checkSessionId] },
    async (request, reply) => {
      const idMealSchemaBody = z.object({
        id: z.string().uuid(),
      });
      const { id } = idMealSchemaBody.parse(request.params);

      const sessionId = request.cookies.sessionID;

      const user = await knexInstance("users")
        .where({ session_id: sessionId })
        .first();

      if (!user) {
        reply.status(403).send("Not authorized to delete this meal!");
      }

      const meal = await knexInstance("meals").where("id", id).first();

      if (meal.user_id !== user.id) {
        return reply.status(403).send("Not authorized to delete this meal!");
      }

      await knexInstance("meals").where("id", id).delete();

      return reply.status(204).send();
    },
  );

  app.get(
    "/summary",
    { preHandler: [checkSessionId] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionID;

      const user = await knexInstance("users")
        .where({ session_id: sessionId })
        .first();

      if (!user) {
        return reply.status(401).send("Invalid session");
      }

      const meals = await knexInstance("meals")
        .where({
          user_id: user.id,
        })
        .select("*");

      const total_meals = meals.length;
      const total_meals_in_diet = meals.filter(
        (meal) => meal.in_diet === "yes",
      ).length;
      const total_meals_out_of_diet = meals.filter(
        (meal) => meal.in_diet === "no",
      ).length;

      let streak = 0;
      let currentStreak = 0;

      meals.forEach((meal) => {
        currentStreak = meal.in_diet === "yes" ? currentStreak + 1 : 0;
        streak = Math.max(streak, currentStreak);
      });

      return reply.send({
        total_meals,
        total_meals_in_diet,
        total_meals_out_of_diet,
        streak,
      });
    },
  );
}
