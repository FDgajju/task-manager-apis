import type { FastifyInstance } from "fastify";
import { taskRouter } from "./tasks/routes";

export const registerRoutes = (app: FastifyInstance) => {
  app.register(taskRouter, { prefix: "api" });
};
