import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const items = await prisma.libraryItem.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        story: {
          include: {
            author: { select: { username: true, displayName: true, avatarUrl: true } },
            _count: { select: { chapters: true, likes: true } },
          },
        },
      },
    });
    res.json(items.map((i) => i.story));
  } catch (err) {
    next(err);
  }
});

router.post("/:storyId", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.libraryItem.findUnique({
      where: { userId_storyId: { userId: req.userId!, storyId: req.params.storyId } },
    });
    if (existing) {
      await prisma.libraryItem.delete({ where: { id: existing.id } });
      return res.json({ inLibrary: false });
    } else {
      await prisma.libraryItem.create({ data: { userId: req.userId!, storyId: req.params.storyId } });
      return res.json({ inLibrary: true });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
