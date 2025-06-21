import { type Static, Type } from "@sinclair/typebox";
import type { ObjectId } from "mongodb";

export const DocumentCreateSchema = Type.Object({
  _id: Type.Optional(Type.Unsafe<ObjectId>({ type: "string" })), // Accepts MongoDB ObjectId as string

  originalname: Type.String(),
  name: Type.String(),
  path: Type.String(),
  type: Type.Optional(Type.String()),
  url: Type.Optional(Type.String()),

  createdAt: Type.Optional(Type.String()),
  updatedAt: Type.Optional(Type.String()),
});

export const DocumentSchema = Type.Object({
  _id: Type.Optional(Type.Unsafe<ObjectId>({ type: "string" })), // Accepts MongoDB ObjectId as string

  originalname: Type.String(),
  name: Type.String(),
  path: Type.String(),
  type: Type.Optional(Type.String()),
  url: Type.Optional(Type.String()),

  createdAt: Type.Optional(Type.String()),
  updatedAt: Type.Optional(Type.String()),
});

export type DocumentT = Static<typeof DocumentSchema>;
