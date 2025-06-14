import type { AnyType } from "../../types/types.ts";

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly status: boolean;
	public readonly code?: string;
	public readonly details?: AnyType;

	constructor(error: AnyType, statusCode = 500) {
		if (typeof error === "object" && error !== null) {
			super(error.message || error);
			this.name = error.name || "Error";
			this.code = error.code;
			this.details = { ...error };
		} else {
			super(error);
			this.name = "AppError";
			this.details = error;
		}

		this.statusCode = statusCode;
		this.status = false;

		Object.setPrototypeOf(this, new.target.prototype);
		if (Error.captureStackTrace)
			Error.captureStackTrace(this, this.constructor);
	}
}
