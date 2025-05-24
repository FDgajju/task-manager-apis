import Fastify, { type FastifyInstance } from "fastify";
import fastifyMongoDB from "@fastify/mongodb";
import { MONGODB_URI, PORT } from "./constants/env";
import { registerRoutes } from "./components/registerRoutes";

const app: FastifyInstance = Fastify({ logger: true });

app.get("/api/health", () => {
  return { status: true, message: "Server Looks good 👍" };
});

app.register(fastifyMongoDB, {
  url: MONGODB_URI,
  forceClose: true,
});

registerRoutes(app);

app.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  console.log("Server Started...");
  if (err) throw err;
});
