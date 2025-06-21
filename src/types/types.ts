import type { mongodb } from "@fastify/mongodb";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type AnyType = any | any[];
export type OID = mongodb.ObjectId;
