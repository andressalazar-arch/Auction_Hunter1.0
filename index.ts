import express from "express";
import { prisma } from "./db.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/lots", async (req, res) => {
  const take = Math.min(Number(req.query.take ?? 50), 200);
  const lots = await prisma.lot.findMany({
    orderBy: { firstSeenAt: "desc" },
    take
  });
  res.json(lots);
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API listening on :${port}`));
