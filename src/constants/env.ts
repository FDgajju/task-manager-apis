import { config } from "dotenv";
config();

export const PORT = Number.parseInt(process.env.PORT || "1234");

export const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/task-manager";

export const MONGODB_URI_TEST =
	process.env.MONGODB_URI_TEST || "mongodb://127.0.0.1:27017/task-manager-test";

export const NODE_ENV = process.env.NODE_ENV || "prod";
