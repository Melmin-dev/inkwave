import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/story/:storyId", async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { storyId: req.params.storyId },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { username: true, displayName: true, avatarUrl: true } } },
    });
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

router.get("/chapter/:chapterId", async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { chapterId: req.params.chapterId },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { username: true, displayName: true, avatarUrl: true } } },
    });
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  storyId: z.string().optional(),
  chapterId: z.string().optional(),
});

router.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = commentSchema.parse(req.body);
    if (!data.storyId && !data.chapterId) {
      return res.status(400).json({ error: "storyId ou chapterId requis" });
    }
    const comment = await prisma.comment.create({
      data: { ...data, userId: req.userId! },
      include: { user: { select: { username: true, displayName: true, avatarUrl: true } } },
    });
    res.status(201).json(comment);
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors[0].message });
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) return res.status(404).json({ error: "Commentaire introuvable" });
    if (comment.userId !== req.userId) return res.status(403).json({ error: "Action non autorisée" });

    await prisma.comment.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
