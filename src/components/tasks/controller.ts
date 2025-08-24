import type { FastifyReply, FastifyRequest } from "fastify";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS.ts";
import {
  DOCUMENT_COLLECTION,
  TASK_COLLECTION,
} from "../../constants/collectionNames.ts";
import { AppError } from "../utils/AppError.ts";
import { filterData } from "../utils/filterData.ts";
import { objectId, validObjectId } from "../utils/objectId.ts";
import {
  TaskPriority,
  TaskStatus,
  type TaskCreateT,
  type TaskParamsT,
  type TaskQueryT,
  type TaskUpdateT,
} from "./schema.ts";
import type { Sort } from "mongodb";

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

  if (!task?.insertedId) throw new AppError("Task Creation Failed");

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

  if (query.deadLine_from || query.deadLine_to) {
    filter.deadLine = {};
    if (query.deadLine_from) {
      filter.deadLine.$gte = new Date(query.deadLine_from).toISOString();
    }
    if (query.deadLine_to) {
      filter.deadLine.$lte = new Date(query.deadLine_to).toISOString();
    }
    // Remove deadLine filter if both are missing or invalid
    if (Object.keys(filter.deadLine).length === 0) {
      // biome-ignore lint/performance/noDelete: <explanation>
      delete filter.deadLine;
    }
  }

  if (query.created_from || query.created_to) {
    filter.createdAt = {};
    if (query.created_from) {
      filter.createdAt.$gte = new Date(query.created_from).toISOString();
    }
    if (query.created_to) {
      filter.createdAt.$lte = new Date(query.created_to).toISOString();
    }
    // Remove createdAt filter if both are missing or invalid
    if (Object.keys(filter.createdAt).length === 0) {
      // biome-ignore lint/performance/noDelete: <explanation>
      delete filter.createdAt;
    }
  }

  const sortOption: Sort = {};

  sortOption.createdAt = query.sort === "1" ? 1 : -1;

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [{ title: searchRegex }, { ticket: searchRegex }];
  }

  if (query.exclude)
    filter._id = { $nin: query.exclude.split(",").map((id) => objectId(id)) };

  const pipeline = [
    { $match: filter },
    { $sort: sortOption },
    {
      $lookup: {
        from: TASK_COLLECTION,
        localField: "dependsOn",
        foreignField: "_id",
        as: "dependenciesList",
      },
    },
    {
      $lookup: {
        from: DOCUMENT_COLLECTION,
        localField: "attachments",
        foreignField: "_id",
        as: "attachedDocuments",
      },
    },
  ];

  const tasks = await db
    ?.collection(TASK_COLLECTION)
    .aggregate(pipeline)
    .toArray();

  // .find(filter)
  // .sort(sortOption)
  // .toArray();

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

  const pipeline = [
    { $match: filter },
    {
      $lookup: {
        from: TASK_COLLECTION,
        localField: "dependsOn",
        foreignField: "_id",
        as: "dependenciesList",
      },
    },
    {
      $lookup: {
        from: DOCUMENT_COLLECTION,
        localField: "attachments",
        foreignField: "_id",
        as: "attachedDocuments",
      },
    },
  ];

  const task = await db
    ?.collection(TASK_COLLECTION)
    .aggregate(pipeline)
    .toArray();

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return reply.status(HTTP_STATUS.OK).send({
    status: true,
    data: task[0], // always Task object or null
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

  if (!validObjectId(params.id)) throw new AppError("Invalid Task id!", 400);

  const data = { ...body, updatedAt: new Date().toISOString() } as TaskUpdateT;

  const filter = { _id: objectId(params.id) };
  console.log(data);

  // uniquely converting to object id
  if (data.dependsOn?.length) {
    data.dependsOn = [
      ...new Set(data.dependsOn.map((d) => objectId(String(d)))),
    ];
  }

  const task = await db
    ?.collection(TASK_COLLECTION)
    .findOneAndUpdate(filter, { $set: data }, { returnDocument: "after" });

  if (!task) throw new AppError("Task not found", 404);

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
