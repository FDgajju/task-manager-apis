import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { createTask, getAllTasks, getOneTasks } from "./controller";
import { dummyMiddleware } from "../../middleware/test";
import {
  type TaskCreateT,
  type TaskQueryT,
  TaskCreateSchema,
  TaskFailedResponseSchema,
  TaskListResponseSchema,
  TaskQuerySchema,
  TaskSingleResponseSchema,
} from "./schema";

export const taskRouter = (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
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
    createTask
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
    getAllTasks
  );

  fastify.get<{ Params: { id: string } }>(
    "/task/:id",
    {
      schema: {
        querystring: TaskQuerySchema,
        response: {
          200: TaskSingleResponseSchema,
          400: TaskFailedResponseSchema,
          500: TaskFailedResponseSchema,
        },
      },
    },
    getOneTasks
  );
};
