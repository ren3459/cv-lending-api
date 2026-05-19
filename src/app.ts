import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import rateLimit from "express-rate-limit";
import { ZodError } from "zod";
import { env } from "./config/env";
import { aiRouter, contactRouter } from "./routes/cv.routes";

export const app = express();

function isOriginAllowed(origin: string): boolean {
  const normalizedOrigin = origin.replace(/\/$/, "");
  let hostname = "";

  try {
    hostname = new URL(normalizedOrigin).hostname;
  } catch {
    return false;
  }

  if (hostname === "vercel.app" || hostname.endsWith(".vercel.app")) {
    return true;
  }

  return env.CORS_ORIGINS.some((allowedOrigin) => {
    const normalizedAllowedOrigin = allowedOrigin.replace(/\/$/, "");

    if (normalizedAllowedOrigin === "*") {
      return true;
    }

    if (normalizedAllowedOrigin.includes("*")) {
      const pattern = `^${normalizedAllowedOrigin
        .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\\\*/g, ".*")}$`;

      return new RegExp(pattern).test(normalizedOrigin);
    }

    return normalizedAllowedOrigin === normalizedOrigin;
  });
}

app.use((req, res, next) => {
  const origin = req.header("origin");

  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else if (!origin && env.CORS_ORIGINS.includes("*")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.header("access-control-request-headers") ||
      "Content-Type, Authorization",
  );

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

app.use(express.json({ limit: "1mb" }));

app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/contact", contactRouter);
app.use("/api/ai-summary", aiRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation error",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
