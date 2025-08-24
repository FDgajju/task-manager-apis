import { type Static, Type } from "@sinclair/typebox";

export enum OrgPermissions {
  canCreateWorkSpace = "canCreateWorkSpace",
  canInviteMembers = "canInviteMembers",
  canRemoveMembers = "canRemoveMembers",
  canEditOrganization = "canEditOrganization",
  canDeleteOrganization = "canDeleteOrganization",
  canViewReports = "canViewReports",
  canManageBilling = "canManageBilling",
}

export enum OrgRoles {
  admin = "admin",
  owner = "owner",
  guest = "guest",
  viewer = "viewer",
  member = "member",
}

const OrgUserLink = Type.Object({
  organizationId: Type.Array(Type.String()),
  userId: Type.Array(Type.String()),
  role: Type.Optional(Type.Enum(OrgRoles)),

  permissions: Type.Optional(Type.Array(Type.Enum(OrgPermissions))),

  createdAt: Type.Optional(Type.String({ format: "date-time" })),
  updatedAt: Type.Optional(Type.String({ format: "date-time" })),
});

export type WorkspaceT = Static<typeof OrgUserLink>;
