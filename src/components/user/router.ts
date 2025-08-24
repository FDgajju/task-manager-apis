import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { authRouter } from "./auth/router.ts";

export const userRouter = (
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
) => {
  fastify.register(authRouter, { prefix: "auth" });
};
