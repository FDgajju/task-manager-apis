import type { FastifyReply, FastifyRequest } from "fastify";
import { genSignedDownloadUrl, uploadFile } from "../../lib/storageProvider";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS";
import { AppError } from "../utils/AppError";
import {
  DOCUMENT_COLLECTION,
  TASK_COLLECTION,
} from "../../constants/collectionNames";
import type { DocumentT } from "./schema";
import { objectId, validObjectId } from "../utils/objectId";
import type { Db, ObjectId } from "mongodb";
import { isDataExistInDb } from "../utils/checkData";

export const addDocument = async (
  req: FastifyRequest<{ Body: { for: string } }>,
  reply: FastifyReply
) => {
  const db = req.server.mongo.db;
  const client = req.server.mongo.client;

// not getting this body 
  const { body } = req;
  const fileData = await req.file();


  console.log(fileData)

  if (body?.for)
    throw new AppError("Please specify task", HTTP_STATUS.BAD_REQUEST);

  if (!!body?.for && !validObjectId(body.for))
    throw new AppError("Not a valid task id", HTTP_STATUS.BAD_REQUEST);

  if (!isDataExistInDb(db as Db, DOCUMENT_COLLECTION, body?.for)) {
    throw new AppError("The task dose not exists", HTTP_STATUS.BAD_REQUEST);
  }

  console.log(body?.for)

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
      name: uploadResp.data.filename,
      path: uploadResp.data.filename,
      type: fileData?.mimetype,
      url: "",
    };
  } else {
    throw new AppError("Upload failed: No data returned from uploadFile.");
  }

  const session = client.startSession();
  const document = await db?.collection(DOCUMENT_COLLECTION).insertOne(payload);

  if (!document?.insertedId) {
    session.abortTransaction();
    throw new AppError("Document Creation Failed");
  }

  await db
    ?.collection(TASK_COLLECTION)
    .updateOne(
      { _id: objectId(body?.for) },
      { $set: { $push: { attachments: document.insertedId } } }
    );

  session.endSession();

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
