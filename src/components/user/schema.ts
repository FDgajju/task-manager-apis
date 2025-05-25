import { type Static, Type } from "@sinclair/typebox";

enum UserRoles {
	manager = "manager",
	user = "user",
	admin = "admin",
}

const UserSchema = Type.Object({
	name: Type.String(),
	email: Type.String({ format: "email" }),
	profileImage: Type.Optional(Type.String()),
	role: Type.Enum(UserRoles),
	password: Type.String(),
	isActive: Type.Optional(Type.Boolean()),
	createdAt: Type.Optional(Type.Date()),
});

export type UserT = Static<typeof UserSchema>;
