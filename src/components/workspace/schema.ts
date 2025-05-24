import { type Static, Type } from "@sinclair/typebox";

const WorkspaceSchema = Type.Object({
  name: Type.Required(Type.String({ minLength: 2 })),
  createdBy: Type.Required(Type.String()),
  members: Type.Array(Type.String()),
  description: Type.Optional(Type.String()),
});

export type WorkspaceT = Static<typeof WorkspaceSchema>;
