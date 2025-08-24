import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { catchHandler } from "../../utils/catchHandler.ts";
import { checkUser, signup } from "./controller.ts";
import type { SignUpUserPayloadType } from "./schema.ts";

export const authRouter = (
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
) => {
  fastify.post("/check", catchHandler(checkUser));

  fastify.post<{ Body: SignUpUserPayloadType }>(
    "/signup",
    catchHandler(signup)
  );
};
