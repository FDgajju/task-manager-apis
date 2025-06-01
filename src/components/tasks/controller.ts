import type { FastifyReply, FastifyRequest } from "fastify";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS";
import { TASK_COLLECTION } from "../../constants/collectionNames";
import { AppError } from "../utils/AppError";
import { filterData } from "../utils/filterData";
import { objectId, validObjectId } from "../utils/objectId";
import {
  TaskPriority,
  TaskStatus,
  type TaskCreateT,
  type TaskParamsT,
  type TaskQueryT,
  type TaskUpdateT,
} from "./schema";

export const createTask = async (
  req: FastifyRequest<{ Body: TaskCreateT }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const db = req.server.mongo.db;

  const { body } = req;

  const data: TaskCreateT = {
    ...body,
    status: body.status || TaskStatus.todo,
    priority: body.priority || TaskPriority.low,
    createdAt: body.createdAt || new Date().toISOString(),
    updatedAt: body.updatedAt || new Date().toISOString(),
  };

  const task = await db?.collection(TASK_COLLECTION).insertOne(data);

  if (!task?.insertedId) throw new AppError("Document Creation Failed");

  return reply.status(HTTP_STATUS.CREATED).send({
    status: true,
    data: { ...data, _id: task.insertedId },
    error: null,
    statusCode: HTTP_STATUS.CREATED,
  });
};

export const getAllTasks = async (
  req: FastifyRequest<{ Querystring: TaskQueryT }>,
  reply: FastifyReply
) => {
  const db = req.server.mongo.db;

  const { query } = req;

  if (query.status === "all") query.status = undefined;

  const filter = filterData.addFields(query, [
    "title",
    "description",
    "priority",
    "status",
    "tag",
    "workspace",
    "assignedTo",
    "assignedBy",
    "createdBy",
  ]) as TaskQueryT;

  const tasks = await db?.collection(TASK_COLLECTION).find(filter).toArray();

  return reply.status(HTTP_STATUS.OK).send({
    status: true,
    data: tasks,
    statusCode: HTTP_STATUS.OK,
    error: null,
  });
};

export const getOneTasks = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const db = req.server.mongo.db;
  const { params } = req;

  if (!validObjectId(params.id)) throw new AppError("Invalid Task id!", 400);

  const filter = { _id: objectId(params.id) };
  const task = await db?.collection(TASK_COLLECTION).findOne(filter);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return reply.status(HTTP_STATUS.OK).send({
    status: true,
    data: task, // always Task object or null
    statusCode: HTTP_STATUS.OK,
    error: null,
  });
};

export const updateTask = async (
  req: FastifyRequest<{ Params: TaskParamsT; Body: TaskUpdateT }>,
  reply: FastifyReply
) => {
  const db = req.server.mongo.db;

  const { params, body } = req;

  const data: TaskUpdateT = { ...body, updatedAt: new Date().toISOString() };

  if (!validObjectId(params.id)) throw new AppError("Invalid Task id!", 400);

  const filter = { _id: objectId(params.id) };

  const task = await db
    ?.collection(TASK_COLLECTION)
    .findOneAndUpdate(filter, { $set: data }, { returnDocument: "after" });

  if (!task) throw new AppError("Task not found", 404);

  console.log(task.value);

  return reply.status(HTTP_STATUS.OK).send({
    status: true,
    data: task,
    error: null,
    statusCode: HTTP_STATUS.OK,
  });
};

export const deleteTask = async (
  req: FastifyRequest<{ Params: TaskParamsT }>,
  reply: FastifyReply
) => {
  const db = req.server.mongo.db;

  const { params } = req;

  if (!validObjectId(params.id)) throw new AppError("Invalid Task Id", 400);

  const filter = { _id: objectId(params.id) };

  const task = await db?.collection(TASK_COLLECTION).findOneAndDelete(filter);

  if (!task) throw new AppError("Task not found", 404);

  return reply.status(HTTP_STATUS.OK).send({
    status: true,
    statusCode: HTTP_STATUS.OK,
    error: null,
    data: task,
  });
};
