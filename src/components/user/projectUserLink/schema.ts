import { type Static, Type } from "@sinclair/typebox";

export enum WorkSpacePermissions {
  canAddTask = "canAddTask",
  canEditTask = "canAddTask",
  canDeleteTask = "canDeleteTask",
  canInviteMembers = "canInviteMembers",
  canRemoveMembers = "canRemoveMembers",
  canEditWorkspace = "canEditWorkspace",
  canDeleteWorkspace = "canDeleteWorkspace",
}

export enum WorkSpaceRoles {
  admin = "admin",
  member = "member",
}

const WorkspaceUserLinkSchema = Type.Object({
  workspaceId: Type.Array(Type.String()),
  userId: Type.Array(Type.String()),
  role: Type.Optional(Type.Enum(WorkSpaceRoles)),

  permissions: Type.Optional(Type.Array(Type.Enum(WorkSpacePermissions))),

  createdAt: Type.Optional(Type.String({ format: "date-time" })),
  updatedAt: Type.Optional(Type.String({ format: "date-time" })),
});

export type WorkspaceUserLinkT = Static<typeof WorkspaceUserLinkSchema>;
