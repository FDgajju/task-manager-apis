import fastifyMongoDB from "@fastify/mongodb";
import { MONGODB_URI } from "../constants/env.ts";
import type { AnyType } from "../types/types.ts";

export const registerMongodb = async (server: AnyType) => {
	try {
		await server.register(fastifyMongoDB, {
			url: MONGODB_URI,
			forceClose: true,
		});
	} catch (error) {
		console.log(error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to register MongoDB",
		);
	}
};

export const getDB = async (server: AnyType) => {
	return await server.mongo.db;
};
