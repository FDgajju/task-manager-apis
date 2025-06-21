import type { FastifyReply, FastifyRequest } from "fastify";
import {
  genSignedDownloadUrl,
  removeFile,
  uploadFile,
} from "../../lib/storageProvider.ts";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS.ts";
import { AppError } from "../utils/AppError.ts";
import {
  DOCUMENT_COLLECTION,
  TASK_COLLECTION,
} from "../../constants/collectionNames.ts";
import type { DocumentT } from "./schema.ts";
import { objectId, validObjectId } from "../utils/objectId.ts";
import type { Db, ObjectId } from "mongodb";
import { isDataExistInDb } from "../utils/checkData.ts";
import type { AnyType, OID } from "../../types/types.ts";

export const addDocument = async (
  req: FastifyRequest<{ Body: { for: AnyType; document: AnyType } }>,
  reply: FastifyReply
) => {
  const db = req.server.mongo.db;
  const client = req.server.mongo.client;

  // not getting this body
  const { body } = req;
  const fileData = await body.document;

  const taskId = body?.for?.value;
  // console.log(body);

  if (!taskId)
    throw new AppError("Please specify task", HTTP_STATUS.BAD_REQUEST);

  if (!!taskId && !validObjectId(taskId as string))
    throw new AppError("Not a valid task id", HTTP_STATUS.BAD_REQUEST);

  if (!isDataExistInDb(db as Db, DOCUMENT_COLLECTION, taskId as string)) {
    throw new AppError("The task dose not exists", HTTP_STATUS.BAD_REQUEST);
  }

  const filebuffer = await fileData?.toBuffer();

  const file = {
    originalname: fileData?.filename,
    buffer: filebuffer,
  };

  const uploadResp = await uploadFile(file);

  if (uploadResp.error) throw new AppError(uploadResp.error);

  let payload: DocumentT | undefined;
  if (uploadResp.data) {
    payload = {
      originalname: file.originalname,
      name: uploadResp.data.filename,
      path: uploadResp.data.filename,
      type: fileData?.mimetype,
      url: "",
      createdAt: new Date(Date.now()).toISOString(),
      updatedAt: new Date(Date.now()).toISOString(),
    };
  } else {
    throw new AppError("Upload failed: No data returned from uploadFile.");
  }

  const document = await db?.collection(DOCUMENT_COLLECTION).insertOne(payload);

  if (!document?.insertedId) {
    throw new AppError("Document Creation Failed");
  }

  if (document.insertedId) {
    await db
      ?.collection(TASK_COLLECTION)
      .findOneAndUpdate(
        { _id: objectId(taskId) },
        { $push: { attachments: document.insertedId as AnyType } }
      );
  }

  return reply.status(HTTP_STATUS.OK).send({
    status: true,
    data: { ...payload },
    error: null,
    statusCode: HTTP_STATUS.OK,
  });
};

export const getDocument = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const db = req.server.mongo.db;

  const { params } = req;

  const filter: { _id?: ObjectId; name?: string } = {};

  if (validObjectId(params?.id)) filter._id = objectId(params.id);
  else filter.name = params.id;

  const document = await db?.collection(DOCUMENT_COLLECTION).findOne(filter);

  if (!document) throw new AppError("Document not found", 404);

  return reply.status(HTTP_STATUS.OK).send({
    status: true,
    data: document,
    error: null,
    statusCode: HTTP_STATUS.OK,
  });
};

export const getSignedUrl = async (
  req: FastifyRequest<{ Body: { filename: string } }>,
  reply: FastifyReply
) => {
  const db = req.server.mongo.db;

  const { filename } = req.body;

  if (!filename) throw new AppError("let me know the file name", 400);

  const data = await genSignedDownloadUrl(filename);
  if (data.error) throw new AppError(data.error);

  return reply.status(HTTP_STATUS.OK).send({
    status: true,
    statusCode: HTTP_STATUS.OK,
    data: { url: data.url },
    error: null,
  });
};

export const deleteDocument = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const db = req.server.mongo.db;
  const { id } = req.params;

  const filter: Record<string, string | OID> = {};

  if (validObjectId(id)) {
    filter._id = objectId(id);
  } else {
    throw new AppError("Invalid document id", HTTP_STATUS.BAD_REQUEST);
  }

  const document = await db?.collection(DOCUMENT_COLLECTION).findOne(filter);

  if (!document)
    throw new AppError("File does not exists", HTTP_STATUS.NOT_FOUND);

  const task = await db
    ?.collection(TASK_COLLECTION)
    .findOneAndUpdate(
      { attachments: filter._id },
      { $pull: { attachments: filter._id } as AnyType },
      { returnDocument: "after" }
    );

  const deleteInfo = await removeFile(document.name);

  if (deleteInfo.error) throw new AppError(deleteInfo.error);

  const resp = await db?.collection(DOCUMENT_COLLECTION).deleteOne(filter);

  return reply.status(HTTP_STATUS.OK).send({
    status: true,
    data: resp,
    statusCode: HTTP_STATUS.OK,
    error: null,
  });
};
