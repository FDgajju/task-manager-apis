import type { FastifyReply, FastifyRequest } from "fastify";
import {
  ORG_COLLECTION,
  PROJECT_COLLECTION,
  USER_COLLECTION,
} from "../../../constants/collectionNames.ts";
import { AppError } from "../../utils/AppError.ts";
import { HTTP_STATUS } from "../../../constants/HTTP_STATUS.ts";
import { filterData } from "../../utils/filterData.ts";
import type { SignUpUserPayloadType } from "./schema.ts";
import type { OrganizationT } from "../../organization/schema.ts";
import type { ProjectT } from "../../project/schema.ts";
import { NODE_MAILER_SENDER_EMAIL } from "../../../constants/env.ts";
import { sendNotification } from "../../utils/notification.ts";
import { generateOTP } from "../../utils/genRendomString.ts";
import { setCache } from "../../../lib/node-cache.ts";

// sign up
export const signup = async (
  req: FastifyRequest<{ Body: SignUpUserPayloadType }>,
  reply: FastifyReply
) => {
  const db = req.server.mongo.db;

  const { body } = req;

  const userPayload = filterData.addFields(body.user, [
    "name",
    "username",
    "email",
    "password",
    "profileImageId",
  ]);

  const organizationPayload = filterData.addFields(body.organization, [
    "name",
    "description",
  ]) as OrganizationT;

  const projectPayload = filterData.addFields(body.project || {}, [
    "name",
    "description",
  ]) as ProjectT;

  const user = await db?.collection(USER_COLLECTION).insertOne(userPayload);

  if (!user?.insertedId) throw new AppError("User Creation Failed");

  organizationPayload.owner = user.insertedId;

  const organization = await db
    ?.collection(ORG_COLLECTION)
    .insertOne(organizationPayload);

  if (!organization?.insertedId)
    throw new AppError("Organization Creation Failed");

  projectPayload.organizationId = organization.insertedId;
  projectPayload.createdBy = user.insertedId;

  const project = await db
    ?.collection(PROJECT_COLLECTION)
    .insertOne(projectPayload);

  if (!project?.insertedId) throw new AppError("Project Creation Failed");

  const otp = generateOTP(6);
  const sendMailPayload = {
    from: NODE_MAILER_SENDER_EMAIL,
    to: userPayload.email,
    subject: "TaskFlow OTP Verification",
    variables: { userName: userPayload.name, otp },
  };

  setCache({ key: userPayload.email, value: otp, ttl: 600 });

  const notificationResp = await sendNotification("otp", sendMailPayload);

  if (notificationResp.error) throw new AppError(notificationResp.error);

  return reply.status(HTTP_STATUS.CREATED).send({
    status: true,
    statusCode: HTTP_STATUS.CREATED,
    error: null,
    data: {
      message:
        "To compleat the registration we send a mail to your registered email, please verify.",
    },
  });
};

// sign in
const signin = async (req: FastifyRequest, reply: FastifyReply) => {};

export const checkUser = async (
  req: FastifyRequest<{ Body: { email: string } }>,
  reply: FastifyReply
) => {
  const db = req.server.mongo.db;

  const {
    body: { email },
  } = req;

  const data = await db?.collection(USER_COLLECTION).findOne({ email });

  console.log(data);
  if (!data) throw new AppError("User not found", 404);

  return reply.status(HTTP_STATUS.OK).send({
    status: true,
    data: data,
    statusCode: HTTP_STATUS.OK,
    error: null,
  });
};
