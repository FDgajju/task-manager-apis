import type { FastifyInstance } from "fastify";
import { errorHandler } from "../middleware/errorHandler";
import { taskRouter } from "./tasks/routes";

export const registerRoutes = (app: FastifyInstance) => {
	app.register(taskRouter, { prefix: "api" });

	app.setNotFoundHandler((req, reply) => {
		reply.status(404).send({
			status: false,
			error: `${req.method}: ${req.originalUrl}, Not found on this server`,
			statusCode: 404,
			data: null,
		});
	});

	app.setErrorHandler(errorHandler);
};
