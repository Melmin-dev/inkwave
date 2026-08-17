import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json({ stories: [], users: [] });

    const [stories, users] = await Promise.all([
      prisma.story.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { tags: { contains: q } },
          ],
        },
        include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
        take: 30,
      }),
      prisma.user.findMany({
        where: {
          OR: [{ username: { contains: q } }, { displayName: { contains: q } }],
        },
        select: { id: true, username: true, displayName: true, avatarUrl: true },
        take: 15,
      }),
    ]);

    res.json({ stories, users });
  } catch (err) {
    next(err);
  }
});

export default router;
