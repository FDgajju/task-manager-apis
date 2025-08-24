import { type Static, Type } from "@sinclair/typebox";

export enum UserRoles {
  manager = "manager",
  user = "user",
  admin = "admin",
  reviewer = "reviewer",
}

export enum UserLoggedInWith {
  EMAIL = "EMAIL",
  GOOGLE = "GOOGLE",
  MICROSOFT = "MICROSOFT",
}

export const UserSchema = Type.Object({
  name: Type.String(),
  username: Type.String(),
  email: Type.String({ format: "email" }),
  password: Type.String(),
  role: Type.Optional(Type.Enum(UserRoles)),

  profileImageId: Type.Optional(Type.String()),
  
  userLoggedInWith: Type.Optional(Type.Enum(UserLoggedInWith)),

  isActive: Type.Optional(Type.Boolean()),
  createdAt: Type.Optional(Type.Date()),
  updatedAt: Type.Optional(Type.Date()),
});

const SignInSchema = Type.Object({
  name: Type.String(),
  email: Type.String({ format: "email" }),
  password: Type.String(),
  role: Type.Optional(Type.Enum(UserRoles)),

  profileImageId: Type.Optional(Type.String()),

  workspaceId: Type.Optional(Type.String()), // for req body
  organizationId: Type.Optional(Type.String()), // for req body

  isActive: Type.Optional(Type.Boolean()),
  createdAt: Type.Optional(Type.Date()),
  updatedAt: Type.Optional(Type.Date()),
});

export type UserT = Static<typeof UserSchema>;
