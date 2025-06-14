import type { Db, ObjectId } from "mongodb";
import { objectId } from "./objectId.ts";

export const isDataExistInDb = (db: Db, collection: string, id: string) => {
  const data = db.collection(collection).find({ _id: objectId(id) });
  return !!data;
};
