import cors from "cors";
import express from "express";
import { createStore } from "./data/store.js";
import { createKudosService } from "./services/kudosService.js";

const store = createStore();
const service = createKudosService(store);
const localhostOriginPattern = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d{1,5})?$/;

export function buildApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }

        // Allow local frontend dev servers without hardcoding a single Vite port.
        if (localhostOriginPattern.test(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin not allowed by CORS."));
      }
    })
  );
  app.use(express.json());

  app.use((request, response, next) => {
    request.currentUserId = request.header("x-user-id") ?? "";
    next();
  });

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.get("/api/users", (request, response, next) => {
    try {
      response.json(service.listUsers(request.currentUserId, request.query.search));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/kudos", (request, response, next) => {
    try {
      response.json(service.listFeed(request.currentUserId, request.query));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/kudos", (request, response, next) => {
    try {
      const created = service.createKudos(request.currentUserId, request.body);
      response.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/kudos", (request, response, next) => {
    try {
      response.json(service.listAdminKudos(request.currentUserId, request.query));
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/kudos/:id", (request, response, next) => {
    try {
      response.json(service.moderateKudos(request.currentUserId, request.params.id, request.body));
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/kudos/:id", (request, response, next) => {
    try {
      response.json(service.deleteKudos(request.currentUserId, request.params.id));
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _request, response, _next) => {
    response.status(error.status || 500).json({
      error: error.message || "Unexpected server error."
    });
  });

  return app;
}

const app = buildApp();
const port = process.env.PORT || 3001;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Kudos server listening on http://localhost:${port}`);
  });
}
