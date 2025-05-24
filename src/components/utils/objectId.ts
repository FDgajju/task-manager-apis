import { ObjectId } from "@fastify/mongodb";

export const validObjectId = (id: string) => {
  return ObjectId.isValid(id);
};

export const objectId = (id: string) => {
  return new ObjectId(id);
};
