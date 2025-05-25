import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
	createTask,
	deleteTask,
	getAllTasks,
	getOneTasks,
	updateTask,
} from "./controller";

import { catchHandler } from "../utils/catchHandler";
import {
	TaskCreateSchema,
	TaskFailedResponseSchema,
	TaskListResponseSchema,
	TaskParamsSchema,
	TaskQuerySchema,
	TaskSingleResponseSchema,
} from "./schema";
import type {
	TaskCreateT,
	TaskParamsT,
	TaskQueryT,
	TaskUpdateT,
} from "./schema.ts";

export const taskRouter = (
	fastify: FastifyInstance,
	opts: FastifyPluginOptions,
) => {
	fastify.post<{ Body: TaskCreateT }>(
		"/task",
		{
			schema: {
				body: TaskCreateSchema,
				response: {
					201: TaskSingleResponseSchema,
					400: TaskFailedResponseSchema,
					500: TaskFailedResponseSchema,
				},
			},
		},
		catchHandler(createTask),
	);

	fastify.get<{ Querystring: TaskQueryT }>(
		"/task",
		{
			schema: {
				querystring: TaskQuerySchema,
				response: {
					200: TaskListResponseSchema,
					400: TaskFailedResponseSchema,
					500: TaskFailedResponseSchema,
				},
			},
		},
		catchHandler(getAllTasks),
	);

	fastify.get<{ Params: TaskParamsT }>(
		"/task/:id",
		{
			schema: {
				params: TaskParamsSchema,
				response: {
					200: TaskSingleResponseSchema,
					400: TaskFailedResponseSchema,
					404: TaskFailedResponseSchema,
					500: TaskFailedResponseSchema,
				},
			},
		},
		catchHandler(getOneTasks),
	);

	fastify.patch<{ Params: TaskParamsT; Body: TaskUpdateT }>(
		"/task/:id",
		{
			schema: {
				params: TaskParamsSchema,
				response: {
					200: TaskSingleResponseSchema,
					404: TaskFailedResponseSchema,
					400: TaskFailedResponseSchema,
					500: TaskFailedResponseSchema,
				},
			},
		},
		catchHandler(updateTask),
	);

	fastify.delete<{ Params: TaskParamsT }>(
		"/task/:id",
		{
			schema: {
				params: TaskParamsSchema,
				response: {
					200: TaskSingleResponseSchema,
					404: TaskFailedResponseSchema,
					400: TaskFailedResponseSchema,
					500: TaskFailedResponseSchema,
				},
			},
		},
		catchHandler(deleteTask),
	);
};
