import express from "express";
import helmet from "helmet";
import { webhookRouter } from "../channels/whatsapp/webhook";

export function createApp() {
  const app = express();

  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody?: string }).rawBody = buf.toString();
      }
    })
  );
  app.use(helmet());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use(webhookRouter);

  return app;
}
