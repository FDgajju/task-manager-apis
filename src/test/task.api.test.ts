import fastifyMongoDB from "@fastify/mongodb";
import Fastify from "fastify";
import supertest from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { registerRoutes } from "../components/registerRoutes";
import { MONGODB_URI } from "../constants/env";
import type { AnyType } from "../types/types";
import { objectId } from "../components/utils/objectId";

let app: AnyType;
let request: AnyType;
let tasksCollection: AnyType;

const mockData = {
	success: [
		{
			title: "Test Task",
			description: "this is the test task",
			priority: "medium",
			status: "todo",
			deadLine: new Date().toISOString(),
			workspace: "dummy-workspace",
			createdBy: "Gajendra",
		},
		{
			title: "Task 1",
			priority: "medium",
			status: "todo",
			deadLine: new Date().toISOString(),
			workspace: "TestSpace",
			createdBy: "U1",
		},
		{
			title: "Task 2",
			priority: "high",
			status: "inprogress",
			deadLine: new Date().toISOString(),
			workspace: "TestSpace",
			createdBy: "U2",
		},
	],

	failed: [
		{
			title: "THis is test title",
			priority: "medium",
			status: "todo",
			deadLine: new Date().toISOString(),
			createdBy: "U2",
		},
	],
};

beforeAll(async () => {
	app = Fastify({ logger: false });

	app.register(fastifyMongoDB, {
		url: MONGODB_URI,
		forceClose: true,
	});

	registerRoutes(app);
	await app.ready();

	request = supertest(app.server);

	tasksCollection = app.mongo.db.collection("tasks"); // Your actual collection name
});

afterAll(async () => {
	await app.close();
});

afterEach(async () => {
	await tasksCollection.deleteMany({});
});

describe("Task Api", () => {
	// test for post
	test("Should create new task", async () => {
		const response = await request.post("/api/task").send(mockData.success[0]);

		expect(response.status).toBe(201);
		expect(response.body.status).toBe(true);
		expect(response.body.data.title).toBe("Test Task");
		expect(response.body.data._id).toBeDefined();
	});

	test("Should failed to create a task", async () => {
		const response = await request.post("/api/task").send(mockData.failed[0]);

		expect(response.status).toBe(400);
		expect(response.body.status).toBe(false);
		expect(response.body.data).toBe(null);
	});

	// create for get all
	test("Should get all tasks", async () => {
		await tasksCollection.insertMany(mockData.success);

		const response = await request.get("/api/task");
		expect(response.status).toBe(200);
		expect(Array.isArray(response.body.data)).toBe(true);
		expect(response.body.data.length).toBe(3);
	});

	test("Should get all tasks for query", async () => {
		await tasksCollection.insertMany(mockData.success);

		const response = await request
			.get("/api/task")
			.query({ status: "inprogress" });

		expect(response.status).toBe(200);
		expect(Array.isArray(response.body.data)).toBe(true);
		expect(response.body.data.length).toBe(1);
	});

	test("Should get one data", async () => {
		const id = "683335d8edce01ed8986d0e5";
		const task = await tasksCollection.insertOne({
			...mockData.success[0],
			_id: objectId(id),
		});

		const resp = await request.get(`/api/task/${id}`);

		expect(resp.status).toBe(200);
		expect(resp.body.status).toBe(true);
		expect(resp.body.data._id).toBe(id);
	});

	test("Should return Not Found", async () => {
		const id = "683335d8edce01ed8986d0e5";
		const xid = "683335d8edce01ed8986d0e6";
		const task = await tasksCollection.insertOne({
			...mockData.success[0],
			_id: objectId(id),
		});

		const resp = await request.get(`/api/task/${xid}`);

		expect(resp.status).toBe(404);
		expect(resp.body.status).toBe(false);
	});

	test("Should get invalid id error", async () => {
		const id = "683335d8edce01ed8986d0e5";
		const xid = "1217361";
		const task = await tasksCollection.insertOne({
			...mockData.success[0],
			_id: objectId(id),
		});

		const resp = await request.get(`/api/task/${xid}`);

		expect(resp.status).toBe(400);
		expect(resp.body.status).toBe(false);
	});

	test("Should update a task", async () => {
		const insertResult = await tasksCollection.insertOne({
			title: "Task To Update",
			priority: "medium",
			status: "todo",
			deadLine: new Date().toISOString(),
			workspace: "UpdateSpace",
			createdBy: "Updater",
		});

		const id = insertResult.insertedId.toString();

		const response = await request
			.patch(`/api/task/${id}`)
			.send({ status: "done" });

		// 3. Assert the update worked
		expect(response.status).toBe(200);
		expect(response.body.status).toBe(true);
		expect(response.body.data._id).toBe(id);
		expect(response.body.data.status).toBe("done");
	});

	test("Should return 404 for update on nonexistent task", async () => {
		const fakeId = "64b3efc62b2b2c29d6d3a888";
		const response = await request
			.patch(`/api/task/${fakeId}`)
			.send({ status: "done" });
		expect(response.status).toBe(404);
		expect(response.body.status).toBe(false);
	});

	test("Should delete a task", async () => {
		// 1. Insert a task
		const insertResult = await tasksCollection.insertOne({
			title: "Task To Delete",
			priority: "high",
			status: "inprogress",
			deadLine: new Date().toISOString(),
			workspace: "DeleteSpace",
			createdBy: "Deleter",
		});

		const id = insertResult.insertedId.toString();

		// 2. Send DELETE
		const response = await request.delete(`/api/task/${id}`);

		// 3. Assert deletion
		expect(response.status).toBe(200);
		expect(response.body.status).toBe(true);
		expect(response.body.data._id).toBe(id);

		const check = await tasksCollection.findOne({
			_id: insertResult.insertedId,
		});
		expect(check).toBeNull();
	});

	test("Should return 404 for delete on nonexistent task", async () => {
		const fakeId = "64b3efc62b2b2c29d6d3a889";
		const response = await request.delete(`/api/task/${fakeId}`);
		expect(response.status).toBe(404);
		expect(response.body.status).toBe(false);
	});
});
