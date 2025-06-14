import type { FastifyInstance } from "fastify";
import { errorHandler } from "../middleware/errorHandler.ts";
import { taskRouter } from "./tasks/routes.ts";
import { documentRouter } from "./documents/router.ts";

export const registerRoutes = (app: FastifyInstance) => {
	app.register(taskRouter, { prefix: "api" });
	app.register(documentRouter, { prefix: "api" });

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
