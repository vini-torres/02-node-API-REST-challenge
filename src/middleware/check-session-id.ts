import { FastifyReply, FastifyRequest } from "fastify";

export async function checkSessionId(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionID;

  if (!sessionId) {
    return reply.status(401).send({
      error: "Unauthorized.",
    });
  }
}
