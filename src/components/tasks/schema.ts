import { type TSchema, type Static, Type } from "@sinclair/typebox";

export enum TaskPriority {
  "high" = "high",
  "medium" = "medium",
  "low" = "low",
}

export enum TaskStatus {
  "done" = "done",
  "inprogress" = "inprogress",
  "todo" = "todo",
}

export const TaskCreateSchema = Type.Object({
  title: Type.String(),
  description: Type.Optional(Type.String()),
  priority: Type.Enum(TaskPriority),
  status: Type.Enum(TaskStatus),
  deadLine: Type.String({ format: "date-time" }),

  workspace: Type.String(),

  createdBy: Type.String(),

  createdAt: Type.Optional(Type.String({ format: "date-time" })),
  updatedAt: Type.Optional(Type.String({ format: "date-time" })),
});

export const TaskQuerySchema = Type.Object({
  title: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  priority: Type.Optional(Type.Enum(TaskPriority)),
  status: Type.Optional(Type.Enum(TaskStatus)),

  tag: Type.Optional(Type.Array(Type.String())),
  workspace: Type.Optional(Type.String()),

  assignedTo: Type.Optional(Type.String()),
  assignedBy: Type.Optional(Type.String()),

  createdBy: Type.Optional(Type.String()),
});

export const TaskSchema = Type.Object({
  _id: Type.String(),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  priority: Type.Enum(TaskPriority),
  status: Type.Enum(TaskStatus),
  deadLine: Type.String({ format: "date-time" }),

  tag: Type.Optional(Type.Array(Type.String())),
  workspace: Type.String(),

  createdBy: Type.Optional(Type.String()),
  assignedTo: Type.Optional(Type.String()),
  assignedBy: Type.Optional(Type.String()),
  comments: Type.Optional(Type.Array(Type.String())),
  attachments: Type.Optional(Type.Array(Type.String())),

  createdAt: Type.Optional(Type.String({ format: "date-time" })),
  updatedAt: Type.Optional(Type.String({ format: "date-time" })),
});

export const buildResponseSchema = <T extends TSchema>(dataSchema: T) =>
  Type.Object({
    status: Type.Boolean(),
    statusCode: Type.Number(),
    data: dataSchema,
    error: Type.Null(),
  });

export const TaskListResponseSchema = buildResponseSchema(
  Type.Array(TaskSchema)
);
export const TaskSingleResponseSchema = buildResponseSchema(TaskSchema);

export const TaskFailedResponseSchema = Type.Object({
  status: Type.Boolean(),
  statusCode: Type.Number(),
  error: Type.String(),
  data: Type.Null(),
});

export type TaskT = Static<typeof TaskSchema>;
export type TaskCreateT = Static<typeof TaskCreateSchema>;
export type TaskQueryT = Static<typeof TaskQuerySchema>;
