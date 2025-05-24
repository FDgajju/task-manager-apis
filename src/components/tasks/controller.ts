import type { FastifyReply, FastifyRequest } from "fastify";
import { TASK_COLLECTION } from "../../constants/collectionNames";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS";
import type { TaskCreateT, TaskQueryT } from "./schema";
import { objectId, validObjectId } from "../utils/objectId";
import { filterData } from "../utils/filterData";

export const createTask = async (
  req: FastifyRequest<{ Body: TaskCreateT }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  try {
    const db = req.server.mongo.db;

    const { body } = req;

    const data: TaskCreateT = {
      ...body,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: body.updatedAt || new Date().toISOString(),
    };

    const task = await db?.collection(TASK_COLLECTION).insertOne(data);

    if (!task?.insertedId) throw new Error("Document Creation Failed");

    return reply.status(HTTP_STATUS.CREATED).send({
      status: true,
      data: { ...data, _id: task.insertedId },
      error: null,
      statusCode: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    req.log.error(error);
    return reply.send(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      status: false,
      data: null,
      error: error,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getAllTasks = async (
  req: FastifyRequest<{ Querystring: TaskQueryT }>,
  reply: FastifyReply
) => {
  try {
    const db = reply.server.mongo.db;

    const { query } = req;
    const filter: TaskQueryT = filterData.addFields(query, [
      "title",
      "description",
      "priority",
      "status",
      "tag",
      "workspace",
      "assignedTo",
      "assignedBy",
      "createdBy",
    ]);

    const tasks = await db?.collection(TASK_COLLECTION).find(filter).toArray();

    return reply.status(HTTP_STATUS.OK).send({
      status: true,
      data: tasks,
      statusCode: HTTP_STATUS.OK,
      error: null,
    });
  } catch (error) {
    req.log.error(error);
    return reply.send(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      status: false,
      data: null,
      error: error,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getOneTasks = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const db = reply.server.mongo.db;
    const { params } = req;

    if (!validObjectId(params.id)) throw Error("Invalid Task id!");

    const filter = { _id: objectId(params.id) };
    const task = await db?.collection(TASK_COLLECTION).findOne(filter);

    if (!task) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        status: false,
        data: null,
        error: "Task not found",
        statusCode: HTTP_STATUS.NOT_FOUND,
      });
    }

    return reply.status(HTTP_STATUS.OK).send({
      status: true,
      data: task, // always Task object or null
      statusCode: HTTP_STATUS.OK,
      error: null,
    });
  } catch (error) {
    req.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      status: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};
