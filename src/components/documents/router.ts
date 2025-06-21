import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { addDocument, getDocument, getSignedUrl } from "./controller.ts";
import { catchHandler } from "../utils/catchHandler.ts";
import multipart from "@fastify/multipart";

export const documentRouter = async (
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
) => {
  await fastify.register(async (supFastify) => {
    await supFastify.register(multipart, {
      limits: { fileSize: 1_04_85_760 },
      attachFieldsToBody: true,
    }); //10mb
    supFastify.post("/document", catchHandler(addDocument));
  });
  //
  fastify.post("/document/url", catchHandler(getSignedUrl));
  fastify.get("/document/:id", catchHandler(getDocument));
};
