import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

async function assertOwner(storyId: string, userId?: string) {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) return { error: "Histoire introuvable", status: 404 } as const;
  if (story.authorId !== userId) return { error: "Action non autorisée", status: 403 } as const;
  return { story };
}

const chapterSchema = z.object({
  title: z.string().min(1).max(150),
  content: z.string().max(200000).default(""),
});

// Créer un chapitre dans une histoire
router.post("/story/:storyId", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const check = await assertOwner(req.params.storyId, req.userId);
    if ("error" in check) return res.status(check.status).json({ error: check.error });

    const data = chapterSchema.parse(req.body);
    const count = await prisma.chapter.count({ where: { storyId: req.params.storyId } });

    const chapter = await prisma.chapter.create({
      data: { title: data.title, content: data.content, storyId: req.params.storyId, order: count },
    });
    res.status(201).json(chapter);
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors[0].message });
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: req.params.id },
      include: { story: { select: { id: true, title: true, authorId: true } } },
    });
    if (!chapter) return res.status(404).json({ error: "Chapitre introuvable" });

    // Incrémente le compteur de vues (best-effort, pas bloquant)
    prisma.chapter.update({ where: { id: chapter.id }, data: { views: { increment: 1 } } }).catch(() => {});

    res.json(chapter);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const chapter = await prisma.chapter.findUnique({ where: { id: req.params.id }, include: { story: true } });
    if (!chapter) return res.status(404).json({ error: "Chapitre introuvable" });
    if (chapter.story.authorId !== req.userId) return res.status(403).json({ error: "Action non autorisée" });

    const data = chapterSchema.partial().extend({ published: z.boolean().optional() }).parse(req.body);
    const updated = await prisma.chapter.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors[0].message });
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const chapter = await prisma.chapter.findUnique({ where: { id: req.params.id }, include: { story: true } });
    if (!chapter) return res.status(404).json({ error: "Chapitre introuvable" });
    if (chapter.story.authorId !== req.userId) return res.status(403).json({ error: "Action non autorisée" });

    await prisma.chapter.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Réordonner les chapitres d'une histoire
router.put("/story/:storyId/reorder", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const check = await assertOwner(req.params.storyId, req.userId);
    if ("error" in check) return res.status(check.status).json({ error: check.error });

    const { orderedIds } = z.object({ orderedIds: z.array(z.string()) }).parse(req.body);
    await prisma.$transaction(
      orderedIds.map((id, index) => prisma.chapter.update({ where: { id }, data: { order: index } }))
    );
    res.json({ success: true });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors[0].message });
    next(err);
  }
});

export default router;
