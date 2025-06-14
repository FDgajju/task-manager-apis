import type {
	FastifyReply,
	FastifyRequest,
	RouteGenericInterface,
} from "fastify";
import type { AnyType } from "../../types/types.ts";

export const catchHandler =
	<RouteGeneric extends RouteGenericInterface = RouteGenericInterface>(
		fn: (
			req: FastifyRequest<RouteGeneric>,
			reply: FastifyReply,
		) => Promise<AnyType>,
	) =>
	(req: FastifyRequest<RouteGeneric>, reply: FastifyReply) => {
		return fn(req, reply).catch((err) => {
			reply.send(err); // Passes the error to Fastify’s error handler
		});
	};
