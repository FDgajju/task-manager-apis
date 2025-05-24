import type { FastifyReply, FastifyRequest } from "fastify";

export const dummyMiddleware = async (
  req: FastifyRequest,
  reply: FastifyReply,
  done: () => void
) => {
  req.body = { name: "gajendra" };

  return;
};
