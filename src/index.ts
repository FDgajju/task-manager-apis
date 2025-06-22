import fastifyMongoDB from "@fastify/mongodb";
import Fastify, { type FastifyInstance } from "fastify";
import { registerRoutes } from "./components/registerRoutes.ts";
import { ALLOWED_ORIGINS, MONGODB_URI, PORT } from "./constants/env.ts";
import fastifyCors from "@fastify/cors";
import { isProdEnvironment } from "./components/utils/isProd.ts";

const app: FastifyInstance = Fastify({
  logger: isProdEnvironment()
    ? true
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorized: true,
            singleLine: true,
            translateTime: "HH:MM:ss.l",
          },
        },
      },
});

app.register(fastifyCors, {
  origin: ALLOWED_ORIGINS,
  methods: ["POST", "PATCH", "GET", "DELETE"],
  allowedHeaders: ["*"],
});

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
